
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  try {
    const blocks = await prisma.homepageBlock.findMany();
    
    let targetBlock = null;
    let parentBlock = null;

    // Recursive search
    function find(items, parent) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].type === 'headline_2') {
                targetBlock = items[i];
                parentBlock = parent;
                return true;
            }
            if (items[i].config && items[i].config.children) {
                if (find(items[i].config.children, items[i])) return true;
            }
        }
        return false;
    }

    blocks.forEach(b => {
        if (!targetBlock) {
            if (b.type === 'headline_2') {
                targetBlock = b;
                parentBlock = null; // Top level
            } else if (b.config && b.config.children) {
                find(b.config.children, b);
            }
        }
    });

    if (targetBlock) {
        console.log(`Found Headline2: ${targetBlock.title}`);
        console.log(`Current Config:`, JSON.stringify(targetBlock.config, null, 2));

        // Update config
        const newConfig = { ...targetBlock.config, excerptLength: 150 }; // Force to 150
        
        if (parentBlock) {
            // It's a child, need to update parent
            console.log(`Updating parent block ${parentBlock.id}...`);
            
            // We need to find the child in the parent's children array and update it
            const newChildren = parentBlock.config.children.map(c => {
                if (c.id === targetBlock.id) {
                    return { ...c, config: newConfig };
                }
                return c;
            });

            await prisma.homepageBlock.update({
                where: { id: parentBlock.id },
                data: {
                    config: {
                        ...parentBlock.config,
                        children: newChildren
                    }
                }
            });
        } else {
            // It's a root block
            console.log(`Updating root block ${targetBlock.id}...`);
            await prisma.homepageBlock.update({
                where: { id: targetBlock.id },
                data: { config: newConfig }
            });
        }
        console.log("Update successful! excerptLength set to 150.");
    } else {
        console.log("No Headline2 block found.");
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

update();
