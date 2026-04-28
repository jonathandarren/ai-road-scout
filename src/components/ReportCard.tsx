import { useState } from "react";
import { MapPin, Clock, Send, Loader2, Wrench, Coins } from "lucide-react";
import type { Report } from "./DamageMap";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const severityStyle = (s: string) => {
  if (s === "Berat") return "bg-destructive text-destructive-foreground";
  if (s === "Sedang") return "bg-warning text-secondary";
  return "bg-success text-white";
};

export const ReportCard = ({ report }: { report: Report }) => {
  const [sending, setSending] = useState(false);

  const date = new Date(report.created_at).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSend = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-fonnte", {
        body: {
          severity: report.severity,
          estimated_area: report.estimated_area,
          description: report.description,
          latitude: report.latitude,
          longitude: report.longitude,
          photo_url: report.photo_url,
          repair_estimate: report.repair_estimate ?? null,
        },
      });
      if (error) throw error;
      if (data?.success === false) throw new Error(data.error);
      toast.success("Laporan terkirim via WhatsApp (Fonnte)");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Gagal mengirim laporan");
    } finally {
      setSending(false);
    }
  };

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
          onClick={handleSend}
          disabled={sending}
          className="w-full bg-[#25D366] text-white hover:bg-[#1ebd5a]"
        >
          {sending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Kirim Laporan via WhatsApp
        </Button>
      </div>
    </article>
  );
};
