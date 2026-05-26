
import React from 'react';
import Link from 'next/link';

interface ClassicTagCloudProps {
    block: any;
    tags: any[];
}

export default function ClassicTagCloud({ block, tags }: ClassicTagCloudProps) {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="mb-8">
            {block.title && (
                <h4 className="text-lg font-serif font-bold uppercase tracking-widest mb-4 pb-2 border-b border-gray-300">
                    {block.title}
                </h4>
            )}
            
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Link 
                        key={tag.id} 
                        href={`/tag/${tag.slug}`}
                        className="text-xs font-serif bg-gray-100 hover:bg-gray-800 hover:text-white px-3 py-1 rounded-none border border-gray-300 transition-colors"
                    >
                        #{tag.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
