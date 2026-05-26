import React from "react";
import { Play } from "lucide-react";

interface VideoOverlayIconProps {
  size?: number; // Size in pixels
  className?: string;
}

export default function VideoOverlayIcon({ size = 48, className = "" }: VideoOverlayIconProps) {
  // Hitung padding responsif berdasarkan ukuran icon
  // Jika icon kecil (< 30px), padding kecil (p-2). Jika besar, padding normal (p-4).
  const paddingClass = size < 30 ? "p-2" : "p-3 md:p-4";
  
  return (
    <div className={`absolute inset-0 flex items-center justify-center z-10 pointer-events-none ${className}`}>
      <div className={`
        bg-black/40 backdrop-blur-md border border-white/30 rounded-full 
        ${paddingClass}
        group-hover:bg-red-600/90 group-hover:border-red-500/50 group-hover:scale-110 
        transition-all duration-300 ease-out shadow-lg group-hover:shadow-red-600/30
      `}>
        <Play 
          size={size} 
          className="text-white fill-white ml-0.5" // ml-0.5 untuk centering optik
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
}
