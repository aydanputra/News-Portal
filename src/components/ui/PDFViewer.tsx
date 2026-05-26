"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Download, BookOpen, Scroll } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker src from CDN for client-side rendering
// Use local worker for better compatibility and CORS handling
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFViewerProps {
  url: string;
  title?: string;
}

// Wrapper component for FlipBook page (must forward ref)
const PageCover = forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div ref={ref} className="page-content bg-white shadow-sm border border-gray-100 h-full overflow-hidden flex items-center justify-center" data-density="hard">
      {props.children}
    </div>
  );
});
PageCover.displayName = "PageCover";

export default function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1); // 0-indexed for FlipBook sometimes, but here we use 1-based logic
  const [scale, setScale] = useState<number>(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [mode, setMode] = useState<"scroll" | "flip">("scroll"); // Default to scroll for stability
  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<any>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log("PDF Loaded, Pages:", numPages);
    setNumPages(numPages);
  }

  // Responsive: Fit width to container
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const changePage = (offset: number) => {
    if (mode === "flip" && flipBookRef.current) {
        const flip = flipBookRef.current.pageFlip();
        if (offset > 0) flip.flipNext();
        else flip.flipPrev();
    } else {
        setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages));
    }
  };

  const toggleFullscreen = () => {
      if (!containerRef.current) return;
      if (!document.fullscreenElement) {
          containerRef.current.requestFullscreen().catch(console.error);
      } else {
          document.exitFullscreen();
      }
  };

  // Flipbook dimension calculation
  // A4 ratio: 1 / 1.414.
  // If container is wide, show 2 pages. If narrow (mobile), show 1 page.
  const isMobile = containerWidth < 768;
  return (
    <div ref={containerRef} className="flex flex-col bg-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-sm my-8 relative group">
      
      {/* Header / Toolbar - Floating on Hover or Top */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-2 sm:p-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 transition-opacity">
        <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button 
                    onClick={() => setMode("scroll")}
                    className={`p-1.5 rounded transition-all ${mode === "scroll" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    title="Scroll View"
                >
                    <Scroll size={16} />
                </button>
                <button 
                    onClick={() => setMode("flip")}
                    className={`p-1.5 rounded transition-all ${mode === "flip" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    title="Flipbook View"
                >
                    <BookOpen size={16} />
                </button>
            </div>
            
            {/* Page Info (No Filename) */}
            <span className="text-xs font-medium text-gray-600 ml-2">
                Halaman {pageNumber} dari {numPages || "-"}
            </span>
        </div>

        <div className="flex items-center gap-2">
            {/* Nav */}
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                <button 
                    onClick={() => changePage(-1)} 
                    disabled={pageNumber <= 1}
                    className="p-1 hover:bg-white hover:shadow-sm rounded disabled:opacity-30 transition-all"
                >
                    <ChevronLeft size={18} />
                </button>
                <button 
                    onClick={() => changePage(1)} 
                    disabled={pageNumber >= numPages}
                    className="p-1 hover:bg-white hover:shadow-sm rounded disabled:opacity-30 transition-all"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Zoom (Only for Scroll Mode) */}
            {mode === "scroll" && (
                <div className="hidden sm:flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1"><ZoomOut size={16} /></button>
                    <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-1"><ZoomIn size={16} /></button>
                </div>
            )}

            <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><Maximize size={18} /></button>
            <a href={url} download className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><Download size={18} /></a>
        </div>
      </div>

      {/* Document Content */}
      <div className={`flex-1 bg-[#525659] overflow-auto flex justify-center p-4 relative ${mode === "flip" ? "items-center" : ""}`} style={{ minHeight: isMobile ? "500px" : "600px" }}>
        
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="text-white">Memuat dokumen...</div>}
          error={<div className="text-red-400">Gagal memuat PDF.</div>}
          className={mode === "scroll" ? "flex flex-col gap-4" : "hidden"} // Render invisible doc to get numPages first
        >
            {/* Scroll Mode Render */}
            {mode === "scroll" && Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className="shadow-lg">
                    <Page 
                        pageNumber={index + 1} 
                        width={Math.min(containerWidth - 32, 800) * scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="bg-white"
                        loading=""
                    />
                </div>
            ))}
        </Document>

        {/* Flipbook Mode Render */}
        {mode === "flip" && numPages > 0 && containerWidth > 0 && (
             <HTMLFlipBook
                width={Math.floor(isMobile ? containerWidth - 20 : (containerWidth - 40) / 2)}
                height={Math.floor((isMobile ? containerWidth - 20 : (containerWidth - 40) / 2) * 1.414)}
                size="stretch"
                minWidth={300}
                maxWidth={1000}
                minHeight={400}
                maxHeight={1533}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                className="shadow-2xl"
                ref={flipBookRef}
                onFlip={(e) => setPageNumber(e.data + 1)}
                style={{ margin: "0 auto" }}
                startPage={0}
                drawShadow={true}
                flippingTime={1000}
                usePortrait={isMobile}
                startZIndex={0}
                autoSize={true}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                disableFlipByClick={false}
             >
                {Array.from(new Array(numPages), (el, index) => (
                    <PageCover key={index}>
                        <Document file={url} loading=" " error=" ">
                            <Page 
                                pageNumber={index + 1} 
                                width={Math.floor(isMobile ? containerWidth - 20 : (containerWidth - 40) / 2)}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="bg-white h-full w-full object-contain"
                                loading={
                                    <div className="h-full w-full flex items-center justify-center bg-white">
                                        <div className="animate-pulse w-3/4 h-3/4 bg-gray-200 rounded"></div>
                                    </div>
                                }
                            />
                        </Document>
                    </PageCover>
                ))}
             </HTMLFlipBook>
        )}
      </div>
    </div>
  );
}
