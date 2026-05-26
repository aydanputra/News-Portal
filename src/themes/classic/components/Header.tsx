import Link from "next/link";
import Image from "next/image";
import { Menu, Search } from "lucide-react";
import PublicThemeToggle from "@/components/PublicThemeToggle";

interface HeaderProps {
  siteName: string;
  logoUrl?: string;
  categories: any[];
}

export default function Header({ siteName, logoUrl, categories }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 -ml-2 text-gray-600">
            <Menu size={24} />
          </button>
          
          <Link href="/" className="font-bold text-2xl tracking-tight text-gray-900">
            {logoUrl ? (
               <Image src={logoUrl} alt={siteName} width={160} height={32} unoptimized className="h-8 w-auto object-contain" />
            ) : (
               <span>{siteName}</span>
            )}
          </Link>
        </div>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-[var(--header-menu-color)] hover:text-blue-600 transition-colors">
            Home
          </Link>
          {categories.slice(0, 5).map((cat) => (
            <Link 
              key={cat.id} 
              href={`/kategori/${cat.slug}`}
              className="text-sm font-medium text-[var(--header-menu-color)] hover:text-blue-600 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <PublicThemeToggle />
          <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
            <Search size={20} />
          </button>
          {/* Example CTA */}
          <Link href="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors">
            Masuk
          </Link>
        </div>
      </div>
    </header>
  );
}
