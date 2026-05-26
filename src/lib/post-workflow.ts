
import { PostStatus, Role } from "@prisma/client";

export interface TransitionContext {
  currentStatus: PostStatus;
  requestedStatus: PostStatus;
  userRole: Role;
  publishedAt?: string | Date | null;
}

export interface TransitionResult {
  status: PostStatus;
  published: boolean;
  publishedAt: Date | null;
  error?: string;
}

/**
 * Valid Transition Map
 * Mendefinisikan status apa saja yang boleh dituju dari status saat ini
 */
const TRANSITION_MAP: Record<PostStatus, PostStatus[]> = {
  [PostStatus.DRAFT]: [
    PostStatus.DRAFT,
    PostStatus.IN_REVIEW,
    // Editor Only
    PostStatus.PUBLISHED,
    PostStatus.SCHEDULED,
    PostStatus.ARCHIVED
  ],
  [PostStatus.IN_REVIEW]: [
    PostStatus.IN_REVIEW,
    // Editor Only
    PostStatus.DRAFT,     // Kembalikan ke Draft
    PostStatus.REJECTED,  // Tolak
    PostStatus.PUBLISHED, // Publish
    PostStatus.SCHEDULED  // Jadwalkan
  ],
  [PostStatus.REJECTED]: [
    PostStatus.REJECTED,
    PostStatus.DRAFT,     // Revisi ulang
    PostStatus.IN_REVIEW  // Submit ulang
  ],
  [PostStatus.PUBLISHED]: [
    PostStatus.PUBLISHED,
    // Editor Only
    PostStatus.ARCHIVED,  // Arsipkan
    PostStatus.DRAFT,     // Unpublish (Tarik berita)
    PostStatus.SCHEDULED  // Jadwalkan ulang (Re-publish nanti)
  ],
  [PostStatus.ARCHIVED]: [
    PostStatus.ARCHIVED,
    // Editor Only
    PostStatus.DRAFT,     // Restore ke Draft
    PostStatus.PUBLISHED  // Republish
  ],
  [PostStatus.SCHEDULED]: [
    PostStatus.SCHEDULED,
    // Editor Only
    PostStatus.DRAFT,     // Batal jadwal
    PostStatus.PUBLISHED  // Publish sekarang (Override jadwal)
  ]
};

/**
 * Helper: Get Allowed Transitions
 * Mengembalikan daftar status yang boleh dituju berdasarkan Role & Current Status
 */
export function getAllowedTransitions(currentStatus: PostStatus, userRole: Role): PostStatus[] {
  const isWriter = userRole === Role.WRITER;
  
  // Ambil semua kemungkinan transisi
  const allTransitions = TRANSITION_MAP[currentStatus] || [];
  
  // Jika Editor, boleh semua yang ada di map
  if (!isWriter) {
    return allTransitions;
  }

  // Jika Writer, filter lagi
  const allowedForWriter: Record<string, PostStatus[]> = {
    [PostStatus.DRAFT]: [PostStatus.IN_REVIEW, PostStatus.DRAFT],
    [PostStatus.REJECTED]: [PostStatus.DRAFT, PostStatus.IN_REVIEW, PostStatus.REJECTED],
    [PostStatus.IN_REVIEW]: [PostStatus.IN_REVIEW] // Writer stuck di review
  };

  const writerSubset = allowedForWriter[currentStatus] || [];
  
  // Intersection antara Global Map & Writer Constraints
  return allTransitions.filter(status => writerSubset.includes(status));
}

/**
 * Helper: Resolve & Validate Post Transition
 */
export function resolvePostTransition({
  currentStatus,
  requestedStatus,
  userRole,
  publishedAt
}: TransitionContext): TransitionResult {
  
  // 1. Validasi Perubahan Status (No Change)
  if (currentStatus === requestedStatus) {
    // Tetap validasi publishedAt jika status SCHEDULED/PUBLISHED
    let finalPublishedAt = publishedAt ? new Date(publishedAt) : null;
    
    if (requestedStatus === PostStatus.PUBLISHED && !finalPublishedAt) {
      finalPublishedAt = new Date(); // Auto-fill publishedAt
    }
    
    return {
      status: currentStatus,
      published: currentStatus === PostStatus.PUBLISHED,
      publishedAt: finalPublishedAt
    };
  }

  // 2. Validasi Role Dasar
  const isWriter = userRole === Role.WRITER;

  // 3. Validasi Transition Map (Global Rules)
  const allowedTransitions = TRANSITION_MAP[currentStatus];
  if (!allowedTransitions.includes(requestedStatus)) {
    throw new Error(`Transisi status tidak valid: ${currentStatus} -> ${requestedStatus}`);
  }

  // 4. Validasi Role Spesifik (Writer Restrictions)
  if (isWriter) {
    // Writer HANYA boleh:
    // DRAFT -> IN_REVIEW
    // REJECTED -> DRAFT / IN_REVIEW
    // Tidak boleh mengubah status lain (termasuk IN_REVIEW -> DRAFT)
    
    const allowedForWriter: Record<string, PostStatus[]> = {
      [PostStatus.DRAFT]: [PostStatus.IN_REVIEW, PostStatus.DRAFT],
      [PostStatus.REJECTED]: [PostStatus.DRAFT, PostStatus.IN_REVIEW, PostStatus.REJECTED],
      [PostStatus.IN_REVIEW]: [PostStatus.IN_REVIEW] // Writer tidak boleh tarik dari review
    };

    const writerTransitions = allowedForWriter[currentStatus] || [];
    if (!writerTransitions.includes(requestedStatus)) {
      throw new Error("Akses Ditolak: Penulis tidak memiliki izin untuk melakukan perubahan status ini.");
    }
  }

  // 5. Validasi Logika Waktu (PUBLISHED vs SCHEDULED)
  let finalPublishedAt = publishedAt ? new Date(publishedAt) : null;
  const now = new Date();

  if (requestedStatus === PostStatus.PUBLISHED) {
    // Jika user minta PUBLISHED tapi tanggalnya masa depan -> Error atau Auto-switch ke SCHEDULED?
    // Sesuai request: Tolak dan arahkan ke SCHEDULED
    if (finalPublishedAt && finalPublishedAt > now) {
      throw new Error("Gagal Publish: Tanggal tayang ada di masa depan. Gunakan status 'SCHEDULED'.");
    }

    // Jika tanggal kosong, isi sekarang
    if (!finalPublishedAt) {
      finalPublishedAt = now;
    }
  }

  if (requestedStatus === PostStatus.SCHEDULED) {
    // Wajib ada tanggal masa depan
    if (!finalPublishedAt) {
      throw new Error("Gagal Menjadwalkan: Tanggal tayang wajib diisi.");
    }
    if (finalPublishedAt <= now) {
      throw new Error("Gagal Menjadwalkan: Tanggal tayang harus di masa depan.");
    }
  }

  // 6. Return Final Result
  return {
    status: requestedStatus,
    published: requestedStatus === PostStatus.PUBLISHED, // Legacy Mapping
    publishedAt: finalPublishedAt
  };
}
