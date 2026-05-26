import { CKEditor } from '@ckeditor/ckeditor5-react';
import CKEditorCustomBuild from './CKEditorCustomBuild';
import { useEffect, useState, useRef } from 'react';
import { Image as ImageIcon, FileText } from 'lucide-react';

interface CKEditorComponentProps {
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
    onRequestImage?: () => void;
    onRequestFile?: () => void; // New prop for generic file/PDF
    mediaToInsert?: { id: string; fileUrl: string; alt?: string; type?: 'image' | 'file'; isFile?: boolean } | null;
    onMediaInserted?: () => void;
}

export default function CKEditorComponent({ 
    value, 
    onChange, 
    placeholder,
    onRequestImage,
    onRequestFile,
    mediaToInsert,
    onMediaInserted 
}: CKEditorComponentProps) {
    const editorRef = useRef<any>(null);
    const [wordCount, setWordCount] = useState<{ words: number; characters: number }>({ words: 0, characters: 0 });

    // Custom Upload Adapter Plugin
    function MyCustomUploadAdapterPlugin(editor: any) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
            return {
                upload: () => {
                    return new Promise((resolve, reject) => {
                        const body = new FormData();
                        loader.file.then((file: any) => {
                            body.append('file', file);
                            fetch('/api/media/upload', {
                                method: 'POST',
                                body: body
                            })
                            .then(res => res.json())
                            .then(res => {
                                resolve({
                                    default: res.url
                                });
                            })
                            .catch(err => {
                                reject(err);
                            });
                        });
                    });
                }
            };
        };
    }

    // Effect untuk insert media dari luar (Media Library Modal)
    useEffect(() => {
        if (mediaToInsert && editorRef.current) {
            const editor = editorRef.current;
            
            editor.model.change((writer: any) => {
                const isPdf = mediaToInsert.fileUrl.toLowerCase().endsWith('.pdf') || (mediaToInsert.isFile && mediaToInsert.alt?.toLowerCase().endsWith('.pdf'));

                if (isPdf) {
                    // Insert as Embed/Iframe for PDF
                    // We use HTML snippet injection via view processor
                    const pdfUrl = mediaToInsert.fileUrl;
                    const fileName = mediaToInsert.alt || 'Dokumen PDF';
                    
                    // Gunakan Google Docs Viewer sebagai fallback yang robust, atau iframe langsung jika browser support
                    // Disini kita gunakan native iframe dengan fallback link
                    const htmlContent = `
                        <figure class="media">
                            <div style="position: relative; width: 100%; height: 600px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #f9fafb;">
                                <iframe 
                                    src="${pdfUrl}" 
                                    style="width: 100%; height: 100%; border: none;"
                                    title="${fileName}"
                                >
                                    <p>Browser Anda tidak mendukung preview PDF. <a href="${pdfUrl}" target="_blank">Download ${fileName}</a></p>
                                </iframe>
                            </div>
                            <figcaption style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 8px;">
                                <a href="${pdfUrl}" target="_blank" style="text-decoration: none; color: inherit;">
                                    📄 ${fileName} (Klik untuk download)
                                </a>
                            </figcaption>
                        </figure>
                        <p></p>
                    `;

                    const viewFragment = editor.data.processor.toView(htmlContent);
                    const modelFragment = editor.data.toModel(viewFragment);
                    editor.model.insertContent(modelFragment, editor.model.document.selection);

                } else if (mediaToInsert.type === 'file' || mediaToInsert.isFile) {
                    // Generic File (Non-PDF) -> Link
                    const linkText = mediaToInsert.alt || 'Download File';
                    const linkElement = writer.createText(`📎 ${linkText}`, {
                        linkHref: mediaToInsert.fileUrl
                    });
                    editor.model.insertContent(linkElement, editor.model.document.selection);
                } else {
                    // Image
                    const imageElement = writer.createElement('imageBlock', {
                        src: mediaToInsert.fileUrl,
                        alt: mediaToInsert.alt || ''
                    });
                    editor.model.insertContent(imageElement, editor.model.document.selection);
                }
            });

            if (onMediaInserted) {
                onMediaInserted();
            }
        }
    }, [mediaToInsert, onMediaInserted]);

    return (
        <div className="ckeditor-wrapper flex flex-col h-full border border-[var(--border)] rounded-lg overflow-hidden bg-white shadow-sm mb-6">
            <style jsx global>{`
                .ck-editor__editable {
                    min-height: 600px;
                    max-height: 800px;
                    border: none !important;
                    box-shadow: none !important;
                }
                .ck.ck-editor__main > .ck-editor__editable {
                    padding: 0 2rem;
                }
                .ckeditor-wrapper .ck-content {
                    line-height: 1.7;
                }
                .ckeditor-wrapper .ck-content p {
                    margin: 0 0 0.95em !important;
                }
                .ckeditor-wrapper .ck-content p:last-child {
                    margin-bottom: 0 !important;
                }
                .ck.ck-toolbar {
                    border: none !important;
                    border-bottom: 1px solid var(--border) !important;
                    background: var(--bg-surface) !important;
                }
                .ck.ck-editor {
                    display: flex;
                    flex-direction: column;
                }

                /* Mobile First Adjustments */
                @media (max-width: 768px) {
                    .ck-editor__editable {
                        min-height: 400px;
                        max-height: 600px;
                    }
                    .ck.ck-editor__main > .ck-editor__editable {
                        padding: 0 1rem;
                    }
                }
            `}</style>
            
            <div className="flex-1 overflow-hidden">
                <CKEditor
                    editor={CKEditorCustomBuild}
                    onReady={editor => {
                        editorRef.current = editor;
                        
                        const wordCountPlugin = editor.plugins.get('WordCount');
                        if (wordCountPlugin) {
                            wordCountPlugin.on('update', (evt: any, stats: any) => {
                                setWordCount({
                                    words: stats.words,
                                    characters: stats.characters
                                });
                            });
                        }
                    }}
                    config={{
                        extraPlugins: [MyCustomUploadAdapterPlugin],
                        placeholder: placeholder || 'Tulis konten di sini...',
                        licenseKey: 'GPL',
                        // Enable HTML Embed support if available in build
                        htmlSupport: {
                            allow: [
                                {
                                    name: /.*/,
                                    attributes: true,
                                    classes: true,
                                    styles: true
                                }
                            ]
                        },
                        mediaEmbed: {
                            previewsInData: true
                        }
                    }}
                    data={value}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        onChange(data);
                    }}
                />
            </div>

            {/* Custom Footer */}
            <div className="bg-[var(--bg-surface)] border-t border-[var(--border)] px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider hidden sm:inline-block">Insert:</span>
                    
                    {onRequestImage && (
                        <button
                            type="button"
                            onClick={onRequestImage}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded text-gray-700 text-xs font-medium transition-all shadow-sm active:scale-95"
                            title="Insert Image"
                        >
                            <ImageIcon size={14} className="text-blue-600" />
                            <span>Image</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onRequestFile || onRequestImage}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded text-gray-700 text-xs font-medium transition-all shadow-sm active:scale-95"
                        title="Insert PDF Document"
                    >
                        <FileText size={14} className="text-red-600" />
                        <span>PDF</span>
                    </button>
                </div>

                <div className="flex items-center justify-end gap-4 text-xs font-medium text-[var(--fg-secondary)] bg-[var(--bg-base)] px-3 py-1 rounded-full border border-[var(--border)] w-full sm:w-auto">
                    <span className="flex items-center gap-1">
                        <span className="font-bold text-[var(--fg-primary)]">{wordCount.words}</span> 
                        <span className="text-[var(--fg-muted)]">words</span>
                    </span>
                    <span className="w-px h-3 bg-[var(--border)]"></span>
                    <span className="flex items-center gap-1">
                        <span className="font-bold text-[var(--fg-primary)]">{wordCount.characters}</span>
                        <span className="text-[var(--fg-muted)]">chars</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
