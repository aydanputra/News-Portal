
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const blocks = await prisma.homepageBlock.findMany();
    
    console.log("Listing ALL Headline2 blocks found in DB:");
    blocks.forEach(b => {
        if (b.type === 'headline_2') {
            console.log(`- ID: ${b.id} | Location: ${b.location} | Theme: ${b.themeId}`);
            console.log(`  Config:`, JSON.stringify(b.config));
        }
        // Also check children
        if (b.config && b.config.children) {
            const children = b.config.children;
            if (Array.isArray(children)) {
                children.forEach(c => {
                    if (c.type === 'headline_2') {
                        console.log(`- [CHILD] ID: ${c.id} | Parent: ${b.id}`);
                        console.log(`  Config:`, JSON.stringify(c.config));
                    }
                });
            }
        }
    });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
