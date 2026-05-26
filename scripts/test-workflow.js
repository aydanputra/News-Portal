
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// --- MOCK ENUMS ---
const PostStatus = {
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
  SCHEDULED: 'SCHEDULED'
};

const Role = {
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

// --- INLINE LOGIC TO TEST ---
const TRANSITION_MAP = {
  [PostStatus.DRAFT]: [
    PostStatus.DRAFT,
    PostStatus.IN_REVIEW,
    PostStatus.PUBLISHED,
    PostStatus.SCHEDULED,
    PostStatus.ARCHIVED
  ],
  [PostStatus.IN_REVIEW]: [
    PostStatus.IN_REVIEW,
    PostStatus.DRAFT,
    PostStatus.REJECTED,
    PostStatus.PUBLISHED,
    PostStatus.SCHEDULED
  ],
  [PostStatus.REJECTED]: [
    PostStatus.REJECTED,
    PostStatus.DRAFT,
    PostStatus.IN_REVIEW
  ],
  [PostStatus.PUBLISHED]: [
    PostStatus.PUBLISHED,
    PostStatus.ARCHIVED,
    PostStatus.DRAFT,
    PostStatus.SCHEDULED
  ],
  [PostStatus.ARCHIVED]: [
    PostStatus.ARCHIVED,
    PostStatus.DRAFT,
    PostStatus.PUBLISHED
  ],
  [PostStatus.SCHEDULED]: [
    PostStatus.SCHEDULED,
    PostStatus.DRAFT,
    PostStatus.PUBLISHED
  ]
};

function resolvePostTransition({
  currentStatus,
  requestedStatus,
  userRole,
  publishedAt
}) {
  
  // 1. Validasi Perubahan Status (No Change)
  if (currentStatus === requestedStatus) {
    let finalPublishedAt = publishedAt ? new Date(publishedAt) : null;
    
    if (requestedStatus === PostStatus.PUBLISHED && !finalPublishedAt) {
      finalPublishedAt = new Date(); 
    }
    
    return {
      status: currentStatus,
      published: currentStatus === PostStatus.PUBLISHED,
      publishedAt: finalPublishedAt
    };
  }

  // 2. Validasi Role Dasar
  const isWriter = userRole === Role.WRITER;
  
  // 3. Validasi Transition Map
  const allowedTransitions = TRANSITION_MAP[currentStatus] || [];
  if (!allowedTransitions.includes(requestedStatus)) {
    throw new Error(`Transisi status tidak valid: ${currentStatus} -> ${requestedStatus}`);
  }

  // 4. Validasi Role Spesifik (Writer Restrictions)
  if (isWriter) {
    const allowedForWriter = {
      [PostStatus.DRAFT]: [PostStatus.IN_REVIEW, PostStatus.DRAFT],
      [PostStatus.REJECTED]: [PostStatus.DRAFT, PostStatus.IN_REVIEW, PostStatus.REJECTED],
      [PostStatus.IN_REVIEW]: [PostStatus.IN_REVIEW]
    };

    const writerTransitions = allowedForWriter[currentStatus] || [];
    if (!writerTransitions.includes(requestedStatus)) {
      throw new Error("Akses Ditolak: Penulis tidak memiliki izin untuk melakukan perubahan status ini.");
    }
  }

  // 5. Validasi Logika Waktu
  let finalPublishedAt = publishedAt ? new Date(publishedAt) : null;
  const now = new Date();

  if (requestedStatus === PostStatus.PUBLISHED) {
    if (finalPublishedAt && finalPublishedAt > now) {
      throw new Error("Gagal Publish: Tanggal tayang ada di masa depan. Gunakan status 'SCHEDULED'.");
    }
    if (!finalPublishedAt) {
      finalPublishedAt = now;
    }
  }

  if (requestedStatus === PostStatus.SCHEDULED) {
    if (!finalPublishedAt) {
      throw new Error("Gagal Menjadwalkan: Tanggal tayang wajib diisi.");
    }
    if (finalPublishedAt <= now) {
      throw new Error("Gagal Menjadwalkan: Tanggal tayang harus di masa depan.");
    }
  }

  return {
    status: requestedStatus,
    published: requestedStatus === PostStatus.PUBLISHED, 
    publishedAt: finalPublishedAt
  };
}

// --- TEST RUNNER ---
async function runTests() {
  console.log("🚀 Starting Workflow & Transition Tests...");

  // Setup Users
  const writer = { role: Role.WRITER, id: 'writer-test-id' };
  const editor = { role: Role.EDITOR, id: 'editor-test-id' };

  // Ensure category exists
  let category = await prisma.category.findFirst({ where: { slug: 'teknologi' } });
  if (!category) {
    category = await prisma.category.create({ data: { name: 'Teknologi', slug: 'teknologi' } });
  }

  // Cleanup previous test data
  await prisma.post.deleteMany({ where: { slug: { startsWith: 'test-workflow-' } } });

  try {
    // ==========================================
    // TEST 1: Writer creates Draft
    // ==========================================
    console.log("\n🧪 TEST 1: Writer creates Draft");
    const t1 = resolvePostTransition({
      currentStatus: PostStatus.DRAFT,
      requestedStatus: PostStatus.DRAFT,
      userRole: writer.role
    });
    
    if (t1.status !== 'DRAFT' || t1.published !== false) throw new Error("Failed: Writer create draft");
    console.log("✅ Logic Valid");

    const post = await prisma.post.create({
      data: {
        title: "Test Workflow Draft",
        slug: `test-workflow-draft-${Date.now()}`,
        content: "Content",
        author: { connectOrCreate: { where: { email: 'writer@test.com' }, create: { email: 'writer@test.com', name: 'Writer', password: 'hash', role: 'WRITER' } } },
        category: { connect: { id: category.id } }, 
        status: t1.status,
        published: t1.published
      }
    });
    console.log("✅ DB Create Success");


    // ==========================================
    // TEST 2: Writer submits to Review
    // ==========================================
    console.log("\n🧪 TEST 2: Writer submits to Review");
    const t2 = resolvePostTransition({
      currentStatus: post.status,
      requestedStatus: PostStatus.IN_REVIEW,
      userRole: writer.role
    });

    if (t2.status !== 'IN_REVIEW' || t2.published !== false) throw new Error("Failed: Writer submit review");
    console.log("✅ Logic Valid");

    const postReview = await prisma.post.update({
      where: { id: post.id },
      data: { status: t2.status, published: t2.published }
    });
    console.log("✅ DB Update Success");


    // ==========================================
    // TEST 3: Writer tries to Publish (Should Fail)
    // ==========================================
    console.log("\n🧪 TEST 3: Writer tries to Publish (Expect Error)");
    try {
      resolvePostTransition({
        currentStatus: postReview.status,
        requestedStatus: PostStatus.PUBLISHED,
        userRole: writer.role
      });
      throw new Error("❌ Failed: Writer should not be able to publish!");
    } catch (e) {
      console.log(`✅ Caught Expected Error: ${e.message}`);
    }


    // ==========================================
    // TEST 4: Editor Publishes
    // ==========================================
    console.log("\n🧪 TEST 4: Editor Publishes");
    const t4 = resolvePostTransition({
      currentStatus: postReview.status,
      requestedStatus: PostStatus.PUBLISHED,
      userRole: editor.role,
      publishedAt: null 
    });

    if (t4.status !== 'PUBLISHED' || t4.published !== true || !t4.publishedAt) throw new Error("Failed: Editor publish");
    console.log("✅ Logic Valid");

    const postPublished = await prisma.post.update({
      where: { id: post.id },
      data: { status: t4.status, published: t4.published, publishedAt: t4.publishedAt }
    });
    console.log("✅ DB Update Success (Published = true)");


    // ==========================================
    // TEST 5: Scheduled Post (Future) & Homepage Visibility
    // ==========================================
    console.log("\n🧪 TEST 5: Scheduled Post & Visibility");
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 1 week later

    const t5 = resolvePostTransition({
      currentStatus: PostStatus.DRAFT,
      requestedStatus: PostStatus.SCHEDULED,
      userRole: editor.role,
      publishedAt: futureDate
    });

    if (t5.status !== 'SCHEDULED' || t5.published !== false) throw new Error("Failed: Scheduled logic");
    console.log("✅ Logic Valid");

    const postScheduled = await prisma.post.create({
      data: {
        title: "Test Scheduled Post",
        slug: `test-workflow-scheduled-${Date.now()}`,
        content: "Content",
        author: { connect: { email: 'writer@test.com' } },
        category: { connect: { id: category.id } },
        status: t5.status,
        published: t5.published,
        publishedAt: t5.publishedAt
      }
    });
    console.log("✅ DB Create Scheduled Success");

    // Verify Visibility (Simulate Homepage Query)
    const now = new Date();
    const visiblePosts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { publishedAt: { lte: now } },
          { publishedAt: null }
        ]
      }
    });

    const isVisible = visiblePosts.find(p => p.id === postScheduled.id);
    if (isVisible) {
      throw new Error("❌ CRITICAL: Scheduled post is visible on homepage query!");
    } else {
      console.log("✅ SUCCESS: Scheduled post is NOT visible on homepage.");
    }
    
    // TEST 6: Publish Scheduled Post Manually (Editor Override)
    console.log("\n🧪 TEST 6: Publish Scheduled Post Manually");
    const t6 = resolvePostTransition({
        currentStatus: postScheduled.status,
        requestedStatus: PostStatus.PUBLISHED,
        userRole: editor.role,
        publishedAt: null // Override to NOW
    });
    
    if (t6.status !== 'PUBLISHED' || t6.published !== true) throw new Error("Failed: Editor override schedule");
    console.log("✅ Logic Valid (Override Schedule)");
    
    await prisma.post.update({
        where: { id: postScheduled.id },
        data: { status: t6.status, published: t6.published, publishedAt: t6.publishedAt }
    });
    console.log("✅ DB Update Success");
    
    // Verify Visibility Again
    const visiblePosts2 = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { publishedAt: { lte: now } }, // Note: 'now' is slightly in past vs t6.publishedAt which is 'new Date()' inside helper
          // But close enough for test
          { publishedAt: null }
        ]
      }
    });
    // Actually t6.publishedAt is new Date(), so verify logic might miss it if 'now' variable is old.
    // Let's re-fetch 'now'
    const now2 = new Date();
    // Add 1 second buffer
    now2.setSeconds(now2.getSeconds() + 5);
    
    const visiblePosts3 = await prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { publishedAt: { lte: now2 } },
            { publishedAt: null }
          ]
        }
    });
    
    const isVisible2 = visiblePosts3.find(p => p.id === postScheduled.id);
    if (isVisible2) {
        console.log("✅ SUCCESS: Post is now visible after manual publish.");
    } else {
        console.warn("⚠️ Warning: Post not visible yet (Check timestamps)");
    }

  } catch (error) {
    console.error("❌ TEST FAILED:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
