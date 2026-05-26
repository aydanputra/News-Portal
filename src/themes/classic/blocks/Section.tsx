// src/themes/classic/blocks/Section.tsx

import React from "react";

interface SectionProps {
  block: {
    id: string;
    type: string;
    config?: {
      title?: string;
      backgroundColor?: string;
      padding?: string;
      width?: string;
    };
  };
  posts?: any[];
  children?: React.ReactNode; // Menerima children sebagai React Node
}

export default function Section({ block, children }: SectionProps) {
  const { config } = block;
  const title = config?.title;
  const bgColor = config?.backgroundColor || "bg-white"; 
  const padding = config?.padding || "py-8";

  // Jika ada children (yang sudah di-render oleh parent), tampilkan
  if (children) {
      return (
          <section className={`${bgColor} ${padding}`}>
              <div className="container mx-auto px-4">
                  {title && <h2 className="text-2xl font-bold mb-6 border-b pb-2">{title}</h2>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Children sudah berupa elemen React (atau array elemen) */}
                      {React.Children.map(children, (child) => {
                          // Kita asumsikan child sudah dibungkus layout grid di parent, atau kita bungkus di sini
                          // Tapi karena kita tidak tahu child mana punya config width apa, sebaiknya parent (Homepage) yang membungkus.
                          // Namun, untuk fleksibilitas, kita bungkus lagi di sini jika perlu.
                          // TAPI, jika parent sudah merender child sebagai <div className="col-span...">, maka kita tinggal render child.
                          return child;
                      })}
                  </div>
              </div>
          </section>
      );
  }

  // Jika tidak ada children
  return (
    <section className="py-8 border-t border-gray-100">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        <div className="p-4 bg-gray-50 text-gray-500 text-center rounded">
          Section Kosong (ID: {block.id})
        </div>
      </div>
    </section>
  );
}
