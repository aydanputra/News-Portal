
"use client";

import { useState, KeyboardEvent } from "react";
import { X, Tag } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm flex items-center">
            <Tag size={12} className="mr-1" />
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-900">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Ketik tag dan tekan Enter..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag} // Add tag when clicking outside
      />
      <p className="text-xs text-gray-500 mt-1">Pisahkan dengan koma atau tekan Enter.</p>
    </div>
  );
}
