
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding 15 posts...');

  // 1. Pastikan user admin ada (untuk author)
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.error('❌ Admin user not found. Please run main seed first.');
    return;
  }

  // 2. Pastikan Kategori ada
  const categories = await prisma.category.findMany();
  const politikCat = categories.find(c => c.slug === 'politik') || await prisma.category.create({ data: { name: 'Politik', slug: 'politik' } });
  const teknoCat = categories.find(c => c.slug === 'teknologi') || await prisma.category.create({ data: { name: 'Teknologi', slug: 'teknologi' } });
  const lifestyleCat = categories.find(c => c.slug === 'lifestyle') || await prisma.category.create({ data: { name: 'Lifestyle', slug: 'lifestyle' } });

  // 3. Pastikan Tags ada
  const tagsList = ['pilpres', 'ai', 'gadget', 'kesehatan', 'wisata', 'ekonomi', 'dpr', 'startup'];
  for (const tag of tagsList) {
      await prisma.tag.upsert({
          where: { slug: tag },
          update: {},
          create: { name: tag.charAt(0).toUpperCase() + tag.slice(1), slug: tag }
      });
  }

  // 4. Data Dummy Berita
  const posts = [
      {
          title: "Debat Panas Capres: Isu Ekonomi Mendominasi Panggung Utama",
          slug: "debat-panas-capres-ekonomi",
          excerpt: "Ketiga calon presiden saling adu argumen mengenai pertumbuhan ekonomi dan lapangan kerja dalam debat perdana tadi malam.",
          content: "<p>Debat calon presiden perdana berlangsung panas tadi malam. Isu ekonomi menjadi topik utama yang dibahas...</p>",
          categoryId: politikCat.id,
          tags: ["pilpres", "ekonomi"],
          image: "https://images.unsplash.com/photo-1541872703-74c5963631df?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "iPhone 16 Pro Max Resmi Meluncur, Ini Spesifikasi dan Harganya",
          slug: "iphone-16-pro-max-resmi-meluncur",
          excerpt: "Apple kembali menggebrak pasar smartphone dengan peluncuran iPhone 16 series yang membawa fitur AI revolusioner.",
          content: "<p>Apple akhirnya resmi merilis seri iPhone 16. Varian tertinggi, iPhone 16 Pro Max, hadir dengan...</p>",
          categoryId: teknoCat.id,
          tags: ["gadget", "ai"],
          image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "5 Destinasi Wisata Tersembunyi di Bali yang Wajib Dikunjungi",
          slug: "5-destinasi-wisata-tersembunyi-bali",
          excerpt: "Bosan dengan Kuta dan Seminyak? Simak rekomendasi tempat wisata anti-mainstream di Pulau Dewata.",
          content: "<p>Bali tidak hanya tentang pantai Kuta. Masih banyak surga tersembunyi yang belum banyak dijamah wisatawan...</p>",
          categoryId: lifestyleCat.id,
          tags: ["wisata"],
          image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "DPR Sahkan RUU Kesehatan, Ini Poin-Poin Pentingnya",
          slug: "dpr-sahkan-ruu-kesehatan",
          excerpt: "Sidang paripurna DPR RI akhirnya mengetok palu pengesahan RUU Kesehatan menjadi Undang-Undang.",
          content: "<p>Setelah melalui perdebatan panjang, DPR RI akhirnya mengesahkan Rancangan Undang-Undang Kesehatan...</p>",
          categoryId: politikCat.id,
          tags: ["dpr", "kesehatan"],
          image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Startup Unicorn Indonesia Lakukan PHK Massal, Apa Penyebabnya?",
          slug: "startup-unicorn-phk-massal",
          excerpt: "Badai PHK kembali menerpa industri teknologi tanah air. Salah satu unicorn terbesar mengumumkan efisiensi.",
          content: "<p>Industri startup teknologi kembali berduka. Salah satu unicorn kebanggaan Indonesia baru saja mengumumkan...</p>",
          categoryId: teknoCat.id,
          tags: ["startup", "ekonomi"],
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Tips Menjaga Kesehatan Mental di Tengah Kesibukan Kerja",
          slug: "tips-kesehatan-mental-kerja",
          excerpt: "Burnout bisa menyerang siapa saja. Berikut tips sederhana menjaga kewarasan di tengah deadline yang menumpuk.",
          content: "<p>Kesehatan mental sama pentingnya dengan kesehatan fisik. Di tengah tekanan pekerjaan yang tinggi...</p>",
          categoryId: lifestyleCat.id,
          tags: ["kesehatan"],
          image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Koalisi Partai Politik Mulai Pecah Kongsi Jelang Pendaftaran",
          slug: "koalisi-partai-pecah-kongsi",
          excerpt: "Dinamika politik semakin cair. Salah satu partai pendukung pemerintah mengisyaratkan akan keluar dari koalisi.",
          content: "<p>Menjelang pendaftaran calon presiden dan wakil presiden, peta koalisi partai politik kembali berubah...</p>",
          categoryId: politikCat.id,
          tags: ["pilpres"],
          image: "https://images.unsplash.com/photo-1529101091760-61df52838436?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Review Laptop Gaming Terbaru: Performa Buas Harga Terjangkau",
          slug: "review-laptop-gaming-terbaru",
          excerpt: "Laptop ini digadang-gadang sebagai raja baru di kelas entry-level gaming. Benarkah performanya sebuas itu?",
          content: "<p>Pasar laptop gaming kembali diramaikan dengan kehadiran seri terbaru yang menawarkan spesifikasi tinggi...</p>",
          categoryId: teknoCat.id,
          tags: ["gadget"],
          image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Tren Fashion 2025: Kembali ke Gaya Retro 90-an",
          slug: "tren-fashion-2025-retro",
          excerpt: "Gaya berpakaian ala tahun 90-an diprediksi akan kembali mendominasi tren fashion tahun depan.",
          content: "<p>Dunia fashion selalu berputar. Apa yang pernah tren di masa lalu, kini kembali digandrungi...</p>",
          categoryId: lifestyleCat.id,
          tags: ["wisata"], // Salah tag gapapa buat variasi
          image: "https://images.unsplash.com/photo-1529139574466-a302d2d3f52c?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Skandal Korupsi Pejabat Daerah Terbongkar Lewat Medsos",
          slug: "skandal-korupsi-pejabat-medsos",
          excerpt: "Netizen kembali beraksi. Gaya hidup mewah keluarga pejabat daerah dibongkar habis-habisan di Twitter.",
          content: "<p>Kekuatan media sosial kembali terbukti. Sebuah utas di Twitter yang membongkar gaya hidup mewah...</p>",
          categoryId: politikCat.id,
          tags: ["dpr", "ekonomi"],
          image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Elon Musk Umumkan Fitur Baru X, Pengguna Protes",
          slug: "elon-musk-fitur-baru-x",
          excerpt: "Kebijakan baru Elon Musk di platform X kembali menuai kontroversi. Pengguna ancam pindah ke Threads.",
          content: "<p>Elon Musk kembali membuat heboh jagat maya. Pemilik platform X (dulunya Twitter) ini mengumumkan...</p>",
          categoryId: teknoCat.id,
          tags: ["ai", "startup"],
          image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Resep Makanan Sehat untuk Diet Tanpa Menyiksa",
          slug: "resep-makanan-sehat-diet",
          excerpt: "Ingin menurunkan berat badan tapi hobi makan enak? Coba resep-resep sehat rendah kalori berikut ini.",
          content: "<p>Diet seringkali diidentikkan dengan makanan hambar dan menyiksa. Padahal, dengan pengolahan yang tepat...</p>",
          categoryId: lifestyleCat.id,
          tags: ["kesehatan"],
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Pemerintah Tetapkan Hari Libur Nasional 2025",
          slug: "libur-nasional-2025",
          excerpt: "Simak daftar lengkap hari libur nasional dan cuti bersama tahun 2025. Segera rencanakan liburan Anda!",
          content: "<p>Pemerintah melalui SKB Tiga Menteri telah menetapkan hari libur nasional dan cuti bersama...</p>",
          categoryId: politikCat.id,
          tags: ["wisata"],
          image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Perkembangan AI Generatif Semakin Menakutkan, Ahli Ingatkan Bahayanya",
          slug: "bahaya-ai-generatif",
          excerpt: "Kemampuan AI dalam meniru suara dan wajah manusia semakin sempurna. Potensi penyalahgunaan kian besar.",
          content: "<p>Kecerdasan buatan (AI) generatif berkembang dengan kecepatan yang mengkhawatirkan. Para ahli teknologi...</p>",
          categoryId: teknoCat.id,
          tags: ["ai"],
          image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
      },
      {
          title: "Festival Musik Jazz Terbesar Digelar Akhir Pekan Ini",
          slug: "festival-jazz-akhir-pekan",
          excerpt: "Pecinta musik jazz merapat! Festival tahunan ini akan menghadirkan musisi legendaris dalam dan luar negeri.",
          content: "<p>Akhir pekan ini Jakarta akan dimeriahkan oleh festival musik jazz terbesar di tanah air...</p>",
          categoryId: lifestyleCat.id,
          tags: ["wisata"],
          image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800"
      }
  ];

  for (const post of posts) {
      // 1. Create Media First
      const media = await prisma.media.create({
          data: {
              fileUrl: post.image,
              fileName: `dummy-${Date.now()}.jpg`,
              fileType: "image/jpeg",
              size: 1024,
              uploadedById: admin.id
          }
      });

      // 2. Create Post
      const createdPost = await prisma.post.create({
          data: {
              title: post.title,
              slug: post.slug + "-" + Date.now(),
              excerpt: post.excerpt,
              content: post.content,
              published: true,
              publishedAt: new Date(),
              authorId: admin.id,
              categoryId: post.categoryId,
              featuredImageId: media.id,
              tags: {
                  connect: post.tags.map(t => ({ slug: t }))
              }
          }
      });
      console.log(`✅ Created post: ${post.title}`);
  }

  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
