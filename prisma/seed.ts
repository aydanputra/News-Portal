
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // 1. Create Default Categories
  const categories = [
    { name: 'Politik', slug: 'politik' },
    { name: 'Ekonomi', slug: 'ekonomi' },
    { name: 'Olahraga', slug: 'olahraga' },
    { name: 'Teknologi', slug: 'teknologi' },
    { name: 'Hiburan', slug: 'hiburan' },
    { name: 'Kesehatan', slug: 'kesehatan' },
    { name: 'Otomotif', slug: 'otomotif' },
    { name: 'Travel', slug: 'travel' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('Categories created.')

  // 2. Create Admin User
  // IMPORTANT: Change this password immediately after deployment!
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin_portal_2026_change_me';
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin Utama',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log(`Admin user created/updated. Default password: ${adminPassword === 'admin_portal_2026_change_me' ? 'STILL DEFAULT' : 'CUSTOM'}`);

  // 3. Create Sample Posts
  const politik = await prisma.category.findUnique({ where: { slug: 'politik' } })
  const teknologi = await prisma.category.findUnique({ where: { slug: 'teknologi' } })
  
  if (politik && teknologi) {
    await prisma.post.createMany({
      data: [
        {
          title: "Pembangunan Infrastruktur Terus Dikebut Pemerintah",
          slug: "pembangunan-infrastruktur-dikebut",
          content: "Pemerintah pusat terus mempercepat pembangunan infrastruktur di berbagai daerah untuk meningkatkan konektivitas antar wilayah.\n\nProyek jalan tol, bandara, dan pelabuhan menjadi prioritas utama dalam anggaran tahun ini.",
          categoryId: politik.id,
          authorId: admin.id,
          published: true,
          publishedAt: new Date(),
          excerpt: "Pemerintah fokus pada konektivitas antar daerah.",
        },
        {
            title: "Debat Calon Presiden Berlangsung Panas",
            slug: "debat-capres-panas",
            content: "Debat capres semalam berlangsung sangat dinamis dengan saling adu gagasan mengenai ekonomi dan hukum.",
            categoryId: politik.id,
            authorId: admin.id,
            published: true,
            publishedAt: new Date(),
            excerpt: "Adu gagasan ekonomi dan hukum mewarnai debat.",
        },
        {
          title: "Peluncuran Smartphone Terbaru Mengguncang Pasar",
          slug: "smartphone-terbaru-rilis",
          content: "Raksasa teknologi global baru saja meluncurkan ponsel pintar terbaru mereka yang dilengkapi dengan AI canggih.\n\nFitur kamera dan baterai menjadi andalan utama seri kali ini.",
          categoryId: teknologi.id,
          authorId: admin.id,
          published: true,
          publishedAt: new Date(),
          excerpt: "Smartphone dengan AI canggih resmi meluncur.",
        },
        {
            title: "Perkembangan AI Semakin Pesat di 2024",
            slug: "perkembangan-ai-2024",
            content: "Kecerdasan buatan kini merambah ke berbagai sektor industri, mulai dari kesehatan hingga pendidikan.",
            categoryId: teknologi.id,
            authorId: admin.id,
            published: true,
            publishedAt: new Date(),
            excerpt: "AI mendominasi tren teknologi tahun ini.",
        }
      ],
      skipDuplicates: true,
    })
  }
  console.log('Sample posts created.')

  // 4. Restore Homepage Layout
  // Bersihkan dulu sebelum restore agar tidak double
  await prisma.homepageBlock.deleteMany({});
  
  // --- TEMA MODERN (Default) ---
  await prisma.homepageBlock.createMany({
    data: [
      {
        type: "news_slider",
        title: "Headline Utama",
        order: 1,
        isActive: true,
        placement: "main",
        themeId: "modern",
        config: { limit: 5, category: "all" },
      },
      {
        type: "news_grid",
        title: "Berita Politik",
        order: 2,
        isActive: true,
        placement: "main",
        themeId: "modern",
        config: { limit: 6, category: "politik", columns: 3 },
      },
      {
        type: "news_list",
        title: "Terbaru di Teknologi",
        order: 3,
        isActive: true,
        placement: "main",
        themeId: "modern",
        config: { limit: 5, category: "teknologi" },
      },
      {
        type: "sidebar_widget",
        title: "Kategori Populer",
        order: 1,
        isActive: true,
        placement: "sidebar",
        themeId: "modern",
        config: { widgetType: "category_list" },
      },
      {
        type: "sidebar_widget",
        title: "Tag Cloud",
        order: 2,
        isActive: true,
        placement: "sidebar",
        themeId: "modern",
        config: { widgetType: "tag_cloud" },
      }
    ],
    skipDuplicates: true,
  })

  // --- TEMA CLASSIC (Simple Blog) ---
  await prisma.homepageBlock.createMany({
    data: [
      {
        type: "news_list", // Classic tidak pakai slider besar, langsung list
        title: "Berita Terkini",
        order: 1,
        isActive: true,
        placement: "main",
        themeId: "classic",
        config: { limit: 10, category: "all" },
      },
      {
        type: "sidebar_widget",
        title: "Arsip Berita",
        order: 1,
        isActive: true,
        placement: "sidebar",
        themeId: "classic",
        config: { widgetType: "category_list" },
      }
    ],
    skipDuplicates: true,
  })
  console.log('Homepage layout restored.')
  
  // 5. Create Sample Settings
  await prisma.setting.upsert({
      where: { id: "default" },
      update: {},
      create: {
          siteName: "Portal Berita Modern",
          siteDescription: "Sumber informasi terpercaya dan aktual",
          primaryColor: "#2563eb",
          activeTheme: "modern"
      }
  })
  console.log('Settings restored.')

  // 6. Create Additional Users
  const verdianPassword = await bcrypt.hash('admin2016', 10)
  await prisma.user.upsert({
    where: { email: 'bolos.zone@gmail.com' },
    update: { password: verdianPassword, name: 'Verdian Saputra', role: 'ADMIN' },
    create: {
      email: 'bolos.zone@gmail.com',
      name: 'Verdian Saputra',
      password: verdianPassword,
      role: 'ADMIN',
    },
  })

  const selametPassword = await bcrypt.hash('wartawan2016', 10)
  await prisma.user.upsert({
    where: { email: 'doublemfragil@gmail.com' },
    update: { password: selametPassword, name: 'Selamet Riyadi', role: 'WRITER' },
    create: {
      email: 'doublemfragil@gmail.com',
      name: 'Selamet Riyadi',
      password: selametPassword,
      role: 'WRITER',
    },
  })

  const arsyadPassword = await bcrypt.hash('editor2016', 10)
  await prisma.user.upsert({
    where: { email: 'memonesia.com@gmail.com' },
    update: { password: arsyadPassword, name: 'Arsyad Mustar', role: 'EDITOR' },
    create: {
      email: 'memonesia.com@gmail.com',
      name: 'Arsyad Mustar',
      password: arsyadPassword,
      role: 'EDITOR',
    },
  })
  console.log('Additional users created: Verdian (Admin), Selamet (Writer), Arsyad (Editor).')

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
