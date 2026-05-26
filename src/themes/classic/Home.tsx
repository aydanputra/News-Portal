
import React from 'react';
import BlockRenderer from './components/BlockRenderer';
import ThemeStyles from './components/ThemeStyles';
import ThemeFontLoader from '@/components/ThemeFontLoader';

// Komponen Header & Footer Classic (Minimalis)
const ClassicHeader = ({ siteName }: { siteName: string }) => (
    <header className="border-b-4 border-black py-8 mb-12">
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold tracking-tight uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                {siteName || "The Classic"}
            </h1>
            <p className="text-gray-500 mt-2 italic" style={{ fontFamily: 'var(--font-body)' }}>Est. 2024</p>
        </div>
        <nav className="mt-8 border-t border-gray-200 pt-4 flex justify-center space-x-8 uppercase text-sm tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>
            <a href="/" className="hover:text-gray-600">Home</a>
            <a href="/category/politik" className="hover:text-gray-600">Politik</a>
            <a href="/category/teknologi" className="hover:text-gray-600">Teknologi</a>
            <a href="/category/lifestyle" className="hover:text-gray-600">Lifestyle</a>
        </nav>
    </header>
);

const ClassicFooter = ({ siteName }: { siteName: string }) => (
    <footer className="bg-gray-100 py-12 mt-20 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600" style={{ fontFamily: 'var(--font-body)' }}>
            <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
    </footer>
);

export default function ClassicHome({ data }: { data: any }) {
    const { blocks, setting, blockData } = data;
    
    // --- STYLE SETTINGS ---
    const primaryColor = setting?.primaryColor || "#2563eb";
    const secondaryColor = setting?.secondaryColor || "#64748b";
    const accentColor = setting?.accentColor || "#f59e0b";
    const backgroundColor = setting?.backgroundColor || "#ffffff"; // Default Classic is White
    const headingColor = setting?.headingColor || "#000000"; // Default Classic is Black
    const excerptColor = setting?.excerptColor || "#64748b";
    const metaColor = setting?.metaColor || "#94a3b8";
    const headingFont = setting?.headingFont || "Playfair Display"; // Default Classic Font
    const bodyFont = setting?.bodyFont || "Lora"; // Default Classic Font
    const globalBorderRadius = setting?.globalBorderRadius || "0px"; // Classic biasanya kotak

    // --- CSS VARIABLES INJECTION ---
    // Moved to ThemeStyles component to avoid Server Component error

    // --- LAYOUT LOGIC ---
    const homeLayout = setting?.homeLayout || "right_sidebar"; 
    const homeSidebarWidth = setting?.homeSidebarWidth || "w-1/3";
    const homeContainerWidth = setting?.homeContainerWidth || "boxed";

    const getSidebarCols = (width: string) => {
        switch(width) {
            case 'w-1/5': return 2;
            case 'w-1/4': return 3;
            case 'w-1/3': return 4;
            case 'w-2/5': return 5;
            case 'w-1/2': return 6;
            default: return 4;
        }
    };

    const sidebarCols = getSidebarCols(homeSidebarWidth);
    const mainCols = 12 - sidebarCols;

    let containerClass = "container mx-auto px-4";
    if (homeContainerWidth === 'boxed') {
        containerClass = "container mx-auto px-4 max-w-6xl";
    } else if (homeContainerWidth === 'narrow') {
        containerClass = "container mx-auto px-4 max-w-4xl";
    } else {
        containerClass = "w-full px-4"; 
    }

    const mainBlocks = blocks.filter((b: any) => b.placement === 'main');
    const sidebarBlocks = blocks.filter((b: any) => b.placement === 'sidebar');

    // Smart Layout: If sidebar is empty, force full width main content
    // This prevents empty sidebar column when user uses Inner Section with its own sidebar
    const hasSidebar = sidebarBlocks.length > 0;
    const effectiveLayout = hasSidebar ? homeLayout : 'no_sidebar';

    return (
        <>
            <ThemeStyles 
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                accentColor={accentColor}
                backgroundColor={backgroundColor}
                headingColor={headingColor}
                excerptColor={excerptColor}
                metaColor={metaColor}
                headingFont={headingFont}
                bodyFont={bodyFont}
                globalBorderRadius={globalBorderRadius}
            />
            <ThemeFontLoader headingFont={headingFont} bodyFont={bodyFont} />
            
            <div className="min-h-screen flex flex-col text-black">
                <ClassicHeader siteName={setting?.siteName} />

                <main className={`flex-grow ${containerClass}`}>
                    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12`}>
                        
                        {/* LEFT SIDEBAR */}
                        {effectiveLayout === 'left_sidebar' && (
                            <aside className={`lg:col-span-${sidebarCols} pr-8 border-r border-gray-100`}>
                                <div className="sticky top-8">
                                    <SidebarContent blocks={sidebarBlocks} blockData={blockData} />
                                </div>
                            </aside>
                        )}

                        {/* MAIN CONTENT */}
                        <div className={effectiveLayout === 'no_sidebar' ? 'lg:col-span-12' : `lg:col-span-${mainCols}`}>
                            {mainBlocks.length > 0 ? (
                                mainBlocks.map((block: any) => (
                                    <BlockRenderer 
                                        key={block.id} 
                                        block={block} 
                                        allBlockData={blockData} 
                                    />
                                ))
                            ) : (
                                <div className="text-center py-20 text-gray-400 italic border-2 border-dashed border-gray-200 rounded-lg">
                                    Belum ada konten di area utama.
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDEBAR */}
                        {effectiveLayout === 'right_sidebar' && (
                            <aside className={`lg:col-span-${sidebarCols} pl-8 border-l border-gray-100`}>
                                <div className="sticky top-8">
                                    <SidebarContent blocks={sidebarBlocks} blockData={blockData} />
                                </div>
                            </aside>
                        )}

                    </div>
                </main>

                <ClassicFooter siteName={setting?.siteName} />
            </div>
        </>
    );
}

function SidebarContent({ blocks, blockData }: { blocks: any[], blockData: any }) {
    if (blocks.length === 0) {
        return (
            <div className="p-6 bg-gray-50 text-center text-gray-400 italic">
                Sidebar kosong.
            </div>
        );
    }
    return (
        <>
            {blocks.map((block: any) => (
                <BlockRenderer 
                    key={block.id} 
                    block={block} 
                    allBlockData={blockData} 
                />
            ))}
        </>
    );
}
