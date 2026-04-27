import { useEffect, useState } from "react";
import { Map as MapIcon, ListChecks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DamageMap, type Report } from "@/components/DamageMap";
import { ReportCard } from "@/components/ReportCard";
import { ReportFlow } from "@/components/ReportFlow";

const Dashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setReports(data as Report[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = {
    total: reports.length,
    berat: reports.filter((r) => r.severity === "Berat").length,
    sedang: reports.filter((r) => r.severity === "Sedang").length,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      {/* Stats */}
      <section className="grid grid-cols-3 gap-2">
        <Stat label="Total Lapor" value={stats.total} />
        <Stat label="Berat" value={stats.berat} accent />
        <Stat label="Sedang" value={stats.sedang} />
      </section>

      <ReportFlow onSaved={load} onLocation={setFocus} />

      {/* Map */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <MapIcon className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-bold text-secondary">Peta Sebaran</h2>
        </div>
        <div className="h-72 overflow-hidden rounded-2xl shadow-card">
          <DamageMap reports={reports} focus={focus} />
        </div>
      </section>

      {/* Reports */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-bold text-secondary">Riwayat Laporan</h2>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Memuat...</p>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada laporan. Jadilah yang pertama melaporkan! 🚧
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reports.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: number; accent?: boolean }) => (
  <div
    className={`rounded-xl p-3 ${
      accent ? "bg-primary text-secondary" : "bg-secondary text-secondary-foreground"
    }`}
  >
    <div className="text-2xl font-extrabold leading-none">{value}</div>
    <div
      className={`mt-1 text-[10px] uppercase tracking-wide ${
        accent ? "text-secondary/70" : "text-secondary-foreground/60"
      }`}
    >
      {label}
    </div>
  </div>
);

export default Dashboard;
