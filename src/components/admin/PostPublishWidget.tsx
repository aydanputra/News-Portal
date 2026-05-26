
"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Calendar, AlertCircle } from "lucide-react";

interface PostPublishWidgetProps {
  currentStatus: string;
  publishedAt: string | null;
  rejectionReason?: string | null;
  onStatusChange: (status: string) => void;
  onDateChange: (date: string) => void;
  onRejectionReasonChange?: (reason: string) => void;
  loading?: boolean;
}

export default function PostPublishWidget({
  currentStatus,
  publishedAt,
  rejectionReason,
  onStatusChange,
  onDateChange,
  onRejectionReasonChange,
  loading = false
}: PostPublishWidgetProps) {
  const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);

  // Status Labels Mapping
  const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Draf",
    IN_REVIEW: "Menunggu Tinjauan",
    PUBLISHED: "Terbit",
    SCHEDULED: "Dijadwalkan",
    REJECTED: "Ditolak / Revisi",
    ARCHIVED: "Diarsipkan"
  };

  const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    SCHEDULED: "bg-blue-100 text-blue-700",
    REJECTED: "bg-red-100 text-red-700",
    ARCHIVED: "bg-gray-200 text-gray-500"
  };

  useEffect(() => {
    async function fetchTransitions() {
      setFetching(true);
      try {
        const res = await fetch(`/api/posts/transitions?currentStatus=${currentStatus}`);
        const data = await res.json();
        if (data.allowedTransitions) {
          // Pastikan currentStatus selalu ada di list agar tidak hilang dari dropdown
          const transitions = data.allowedTransitions;
          if (!transitions.includes(currentStatus)) {
             transitions.unshift(currentStatus);
          }
          setAllowedTransitions(transitions);
        }
      } catch (err) {
        console.error("Failed to fetch transitions", err);
      } finally {
        setFetching(false);
      }
    }

    if (currentStatus) {
      fetchTransitions();
    }
  }, [currentStatus]);

  // Helper: Format Date for Input
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  return (
    <div className="space-y-4">
      {/* Status Badge (Current) */}
      <div className={`p-3 rounded-lg flex items-center justify-between ${STATUS_COLORS[currentStatus] || "bg-gray-100"}`}>
        <span className="font-semibold text-sm">Status Saat Ini</span>
        <span className="font-bold text-sm uppercase tracking-wider">{STATUS_LABELS[currentStatus] || currentStatus}</span>
      </div>

      {/* Transition Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ubah Status</label>
        <div className="relative">
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={loading || fetching}
            className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white border shadow-sm disabled:bg-gray-50 disabled:text-gray-500 appearance-none"
          >
            {allowedTransitions.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown size={16} />
          </div>
        </div>
        {fetching && <p className="text-xs text-gray-500 mt-1">Memuat opsi...</p>}
      </div>

      {/* Rejection Reason Input */}
      {currentStatus === "REJECTED" && onRejectionReasonChange && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-medium text-red-700 mb-1">
            Alasan Penolakan / Catatan Revisi
          </label>
          <textarea
            value={rejectionReason || ""}
            onChange={(e) => onRejectionReasonChange(e.target.value)}
            rows={3}
            className="w-full border-red-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm p-2"
            placeholder="Tulis alasan kenapa artikel ini ditolak atau perlu direvisi..."
            required
          />
          <p className="mt-1 text-xs text-red-500">
            * Wajib diisi agar penulis tahu apa yang perlu diperbaiki.
          </p>
        </div>
      )}

      {/* Conditional Date Picker */}
      {(currentStatus === "SCHEDULED" || currentStatus === "PUBLISHED") && (
        <div className="animate-fade-in-down">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} />
            {currentStatus === "SCHEDULED" ? "Jadwal Tayang" : "Tanggal Terbit"}
          </label>
          <input
            type="datetime-local"
            value={formatDateForInput(publishedAt)}
            onChange={(e) => onDateChange(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
          />
          {currentStatus === "SCHEDULED" && (
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              Pilih waktu di masa depan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
