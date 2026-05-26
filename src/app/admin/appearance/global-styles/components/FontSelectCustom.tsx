"use client";

import { useState, useRef, useEffect } from "react";

interface FontOption {
    value: string;
    label: string;
}

interface FontSelectCustomProps {
    value: string;
    onChange: (value: string) => void;
    options: FontOption[];
}

export default function FontSelectCustom({ value, onChange, options }: FontSelectCustomProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <div 
                className="input w-full text-sm h-12 px-3 leading-normal bg-[var(--bg-base)] border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--ring)] flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ fontFamily: selectedOption?.value }}>{selectedOption?.label}</span>
                <svg className={`w-4 h-4 text-[var(--fg-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown List */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-[var(--bg-base)] ${option.value === value ? "bg-[var(--bg-base)] font-semibold text-[var(--primary)]" : "text-[var(--fg-primary)]"}`}
                            style={{ fontFamily: option.value }}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
