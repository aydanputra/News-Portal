import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const AVAILABLE_FONTS = [
  { name: 'Inter', type: 'sans-serif' },
  { name: 'Roboto', type: 'sans-serif' },
  { name: 'Open Sans', type: 'sans-serif' },
  { name: 'Lato', type: 'sans-serif' },
  { name: 'Montserrat', type: 'sans-serif' },
  { name: 'Poppins', type: 'sans-serif' },
  { name: 'Nunito', type: 'sans-serif' },
  { name: 'Raleway', type: 'sans-serif' },
  { name: 'Oswald', type: 'sans-serif' },
  { name: 'Rubik', type: 'sans-serif' },
  { name: 'Work Sans', type: 'sans-serif' },
  { name: 'Quicksand', type: 'sans-serif' },
  { name: 'Merriweather', type: 'serif' },
  { name: 'Playfair Display', type: 'serif' },
  { name: 'Lora', type: 'serif' },
  { name: 'PT Serif', type: 'serif' },
  { name: 'Spectral', type: 'serif' },
  { name: 'Crimson Text', type: 'serif' },
  { name: 'Libre Baskerville', type: 'serif' }
];

interface FontSelectProps {
    label: React.ReactNode;
    value: string;
    onChange: (font: string) => void;
}

export function FontSelect({ label, value, onChange }: FontSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="block mb-1.5 font-medium text-gray-700">
                {label}
            </div>
            
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm flex justify-between items-center text-left focus:ring-2 focus:ring-blue-500 outline-none hover:border-blue-400 transition-all"
            >
                <span style={{ fontFamily: value }}>{value}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in-up">
                    <div className="sticky top-0 bg-gray-50 p-2 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100">
                        Sans Serif
                    </div>
                    {AVAILABLE_FONTS.filter(f => f.type === 'sans-serif').map(font => (
                        <div 
                            key={font.name}
                            onClick={() => { onChange(font.name); setIsOpen(false); }}
                            className={`px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center ${value === font.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                        >
                            <span style={{ fontFamily: font.name, fontSize: '15px' }}>{font.name}</span>
                            {value === font.name && <Check size={14} />}
                        </div>
                    ))}
                    
                    <div className="sticky top-0 bg-gray-50 p-2 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100 border-t">
                        Serif
                    </div>
                    {AVAILABLE_FONTS.filter(f => f.type === 'serif').map(font => (
                        <div 
                            key={font.name}
                            onClick={() => { onChange(font.name); setIsOpen(false); }}
                            className={`px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center ${value === font.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                        >
                            <span style={{ fontFamily: font.name, fontSize: '15px' }}>{font.name}</span>
                            {value === font.name && <Check size={14} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export { AVAILABLE_FONTS };