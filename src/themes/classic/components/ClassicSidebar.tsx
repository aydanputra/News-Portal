
import React from 'react';
import Link from 'next/link';

interface ClassicSidebarProps {
    block: any;
    data: any; // Data dinamis (categories, tags, posts)
}

export default function ClassicSidebar({ block, data }: ClassicSidebarProps) {
    const { config } = block;
    const widgetType = config?.widgetType || "category_list";

    return (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200">
            {block.title && (
                <h4 className="text-lg font-serif font-bold uppercase tracking-widest mb-4 pb-2 border-b border-gray-300">
                    {block.title}
                </h4>
            )}

            {/* Widget: Category List */}
            {widgetType === "category_list" && Array.isArray(data) && (
                <ul className="space-y-2">
                    {data.map((cat: any) => (
                        <li key={cat.id}>
                            <Link 
                                href={`/category/${cat.slug}`} 
                                className="flex justify-between items-center text-gray-700 hover:text-black font-serif text-sm group"
                            >
                                <span className="group-hover:translate-x-1 transition-transform">{cat.name}</span>
                                <span className="text-gray-400 text-xs">({cat._count?.posts || 0})</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {/* Widget: Custom HTML/Text */}
            {widgetType === "text" && (
                <div className="prose prose-sm font-serif text-gray-600">
                    {config.content || "Konten widget belum diisi."}
                </div>
            )}
        </div>
    );
}
