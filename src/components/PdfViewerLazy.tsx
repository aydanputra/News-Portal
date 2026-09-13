"use client";

import dynamic from "next/dynamic";

// Lazy load PDFViewer to avoid SSR issues with canvas/window.
// Wrapper client ini diperlukan karena `ssr: false` tidak diizinkan
// langsung di dalam Server Component.
const PDFViewer = dynamic(() => import("@/components/ui/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[500px] bg-gray-100 rounded-xl border border-gray-200">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <span className="text-gray-500">Memuat PDF Viewer...</span>
    </div>
  ),
});

export default PDFViewer;
