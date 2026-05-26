"use client";

import dynamic from "next/dynamic";
import { forwardRef, useImperativeHandle, useRef, useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// Import ReactQuill dynamically
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export interface RichTextEditorHandle {
  insertEmbed: (type: string, value: any) => void;
  getEditor: () => any;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  onRequestImage?: () => void;
  onRequestVideo?: () => void;
}

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "align",
  "list",
  "link",
  "image",
  "video",
];

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  ({ value, onChange, placeholder, label, onRequestImage, onRequestVideo }, ref) => {
    const quillRef = useRef<any>(null);
    
    useImperativeHandle(ref, () => ({
      insertEmbed: (type: string, value: any) => {
        const editor = quillRef.current?.getEditor();
        if (editor) {
          // editor.focus(); // Disable auto-focus to prevent scroll jump
          const range = editor.getSelection() || { index: editor.getLength() };
          editor.insertEmbed(range.index, type, value);
          editor.setSelection(range.index + 1);
        }
      },
      getEditor: () => quillRef.current?.getEditor(),
    }));

    const handleChange = (content: string, delta: any, source: string) => {
        onChange(content);
        
        // Robust Auto-scroll logic
        if (source === 'user') {
             requestAnimationFrame(() => {
                 try {
                     const selection = window.getSelection();
                     if (selection && selection.rangeCount > 0) {
                         const range = selection.getRangeAt(0);
                         const rect = range.getBoundingClientRect();
                         
                         const viewportHeight = window.innerHeight;
                         // Footer height (approx 60px) + Extra Padding (100px) to be safe
                         const bottomThreshold = viewportHeight - 160; 
                         
                         if (rect.bottom > bottomThreshold) {
                             // Scroll smoothly to bring cursor into safe zone
                             const scrollAmount = rect.bottom - bottomThreshold;
                             window.scrollBy({
                                 top: scrollAmount,
                                 behavior: "smooth"
                             });
                         }
                     }
                 } catch {
                     // Fallback or ignore
                 }
             });
        }
    };

    const modules = useMemo(() => {
      const config: any = {
        clipboard: {
          matchVisual: false,
        },
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image", "video"],
            ["clean"],
          ],
        },
      };

      if (onRequestImage || onRequestVideo) {
        config.toolbar.handlers = {};
        if (onRequestImage) config.toolbar.handlers.image = onRequestImage;
        if (onRequestVideo) config.toolbar.handlers.video = onRequestVideo;
      }
      
      return config;
    }, [onRequestImage, onRequestVideo]);

    return (
      <div className="flex flex-col relative group">
        <style jsx global>{`
          .ql-tooltip { z-index: 100 !important; }
          /* Prevent Scroll Anchoring */
          .quill-wrapper * { overflow-anchor: none !important; }
          .ql-editor { overflow-anchor: none !important; }
          .ql-container * { transition: none !important; } /* Disable internal transitions */
        `}</style>
        {label && <label className="block font-medium text-gray-700 mb-2">{label}</label>}
        <div className="quill-wrapper bg-white rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <ReactQuill
            // @ts-expect-error ReactQuill types issue
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            modules={modules}
            formats={formats}
            preserveWhitespace={false}
            className="text-black"
          />
        </div>
        <style jsx global>{`
          .quill-wrapper {
             display: flex;
             flex-direction: column;
          }
          .ql-container {
            font-size: 16px;
            font-family: inherit;
            border: none !important;
          }
          .ql-editor {
            min-height: calc(100vh - 400px); /* Fill significant portion of screen */
            height: auto !important; 
            overflow: visible !important;
            padding-bottom: 20px;
          }
          .ql-editor p { margin: 0; line-height: 1.6; }
          .ql-editor h1, .ql-editor h2, .ql-editor h3 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; line-height: 1.3; }
          .ql-editor h1 { font-size: 2.25em; }
          .ql-editor h2 { font-size: 1.5em; }
          .ql-editor h3 { font-size: 1.25em; }
          .ql-editor ul, .ql-editor ol { margin-bottom: 1.5em; padding-left: 1.5em; }
          .ql-toolbar {
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb !important;
            position: sticky;
            top: 0;
            z-index: 40;
          }
          .ql-container.ql-snow { border: none !important; }
        `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
