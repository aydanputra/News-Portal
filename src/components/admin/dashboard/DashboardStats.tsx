import { FileText, CheckCircle, Edit3, Calendar } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalPosts: number;
    totalPublished: number;
    totalDrafts: number;
    totalInReview: number;
    totalScheduled: number;
    totalPublishedToday: number;
  };
  labels?: {
    totalPosts?: string;
    totalPublished?: string;
    totalDrafts?: string;
    totalInReview?: string;
    totalPublishedTodaySuffix?: string;
    publishedSubValue?: string;
    draftSubValue?: string;
    inReviewSubValue?: string;
  };
}

export default function DashboardStats({ stats, labels }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        label={labels?.totalPosts ?? "Total Artikel"}
        value={stats.totalPosts} 
        subValue={`+${stats.totalPublishedToday} ${labels?.totalPublishedTodaySuffix ?? "hari ini"}`}
        icon={<FileText className="w-4 h-4 text-[var(--accent)]" />}
        iconBg="bg-amber-500/10"
      />
      <StatCard 
        label={labels?.totalPublished ?? "Terbit"}
        value={stats.totalPublished} 
        subValue={labels?.publishedSubValue ?? "Konten tayang"}
        icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
        iconBg="bg-emerald-500/10"
      />
      <StatCard 
        label={labels?.totalDrafts ?? "Draf"}
        value={stats.totalDrafts} 
        subValue={labels?.draftSubValue ?? "Pekerjaan tertunda"}
        icon={<Calendar className="w-4 h-4 text-gray-500" />}
        iconBg="bg-gray-500/10"
      />
      <StatCard 
        label={labels?.totalInReview ?? "Ditinjau"}
        value={stats.totalInReview} 
        subValue={labels?.inReviewSubValue ?? "Menunggu persetujuan"}
        icon={<Edit3 className="w-4 h-4 text-blue-500" />}
        iconBg="bg-blue-500/10"
      />
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  subValue, 
  icon, 
  iconBg
}: { 
  label: string; 
  value: number; 
  subValue?: string; 
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="card p-6 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[var(--fg-muted)] text-xs font-bold uppercase tracking-wider">{label}</span>
        <span className={`p-2 rounded-md ${iconBg}`}>
          {icon}
        </span>
      </div>
      <div>
        <div className="font-display text-4xl font-bold text-[var(--fg-primary)]">{value}</div>
        {subValue && (
          <div className="text-xs text-[var(--fg-muted)] mt-1">{subValue}</div>
        )}
      </div>
    </div>
  );
}
