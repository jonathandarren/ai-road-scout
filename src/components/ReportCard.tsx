import { MapPin, Clock, Send } from "lucide-react";
import type { Report } from "./DamageMap";
import { Button } from "@/components/ui/button";

const severityStyle = (s: string) => {
  if (s === "Berat") return "bg-destructive text-destructive-foreground";
  if (s === "Sedang") return "bg-warning text-secondary";
  return "bg-success text-white";
};

const buildWaMessage = (r: Report) => {
  const mapsLink = `https://www.google.com/maps?q=${r.latitude},${r.longitude}`;
  return encodeURIComponent(
    `🚧 *LAPORAN JALAN RUSAK*\n\n` +
      `*Tingkat Kerusakan:* ${r.severity}\n` +
      `*Estimasi Luas:* ${r.estimated_area}\n\n` +
      `*Analisis AI:*\n${r.description}\n\n` +
      `📍 *Lokasi:* ${mapsLink}\n` +
      `📷 *Foto:* ${r.photo_url}\n\n` +
      `_Dilaporkan via Peta Lapor Jalan Rusak AI_`,
  );
};

export const ReportCard = ({ report }: { report: Report }) => {
  const waLink = `https://wa.me/?text=${buildWaMessage(report)}`;
  const date = new Date(report.created_at).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-card animate-fade-up">
      <div className="relative">
        <img src={report.photo_url} alt="Kerusakan jalan" className="h-44 w-full object-cover" />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${severityStyle(
            report.severity,
          )}`}
        >
          {report.severity}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm leading-relaxed text-foreground">{report.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {date}
          </span>
        </div>
        <div className="text-xs font-medium text-secondary">Luas: {report.estimated_area}</div>
        <Button
          asChild
          variant="default"
          className="w-full bg-[#25D366] text-white hover:bg-[#1ebd5a]"
        >
          <a href={waLink} target="_blank" rel="noreferrer">
            <Send className="mr-2 h-4 w-4" /> Kirim Laporan via WhatsApp
          </a>
        </Button>
      </div>
    </article>
  );
};
