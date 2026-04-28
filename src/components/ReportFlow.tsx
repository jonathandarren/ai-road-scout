import { useRef, useState } from "react";
import { Camera, Loader2, MapPin, Sparkles, X, AlertTriangle, Wrench, Clock, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RepairEstimate } from "./DamageMap";

type Analysis = {
  severity: string;
  estimated_area: string;
  description: string;
  repair_estimate?: RepairEstimate;
};

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

type Step = "idle" | "analyzing" | "review";

export const ReportFlow = ({
  onSaved,
  onLocation,
}: {
  onSaved: () => void;
  onLocation?: (coords: { lat: number; lng: number }) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setStep("idle");
    setPreviewUrl(null);
    setFile(null);
    setCoords(null);
    setAnalysis(null);
  };

  const getLocation = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.warning("Geolokasi tidak didukung. Menggunakan koordinat default.");
        resolve({ lat: -6.2088, lng: 106.8456 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          toast.warning("Tidak bisa ambil lokasi. Menggunakan default Jakarta.");
          resolve({ lat: -6.2088, lng: 106.8456 });
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    });

  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleFile = async (f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setStep("analyzing");

    try {
      const [location, base64] = await Promise.all([getLocation(), fileToBase64(f)]);
      setCoords(location);
      onLocation?.(location);

      const { data, error } = await supabase.functions.invoke("analyze-damage", {
        body: { imageBase64: base64 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data as Analysis);
      setStep("review");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Gagal menganalisis foto");
      reset();
    }
  };

  const handleSave = async () => {
    if (!file || !analysis || !coords) return;
    setSaving(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("damage-photos")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("damage-photos").getPublicUrl(path);

      const { error: insErr } = await supabase.from("reports").insert({
        photo_url: pub.publicUrl,
        severity: analysis.severity,
        estimated_area: analysis.estimated_area,
        description: analysis.description,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      if (insErr) throw insErr;

      toast.success("Laporan berhasil disimpan!");
      onSaved();
      reset();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan laporan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Camera className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-secondary">Laporkan Kerusakan</h2>
          <p className="text-xs text-muted-foreground">Foto → Analisis AI → Kirim</p>
        </div>
      </div>

      {step === "idle" && (
        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/60 bg-primary/5 p-8 text-center transition hover:bg-primary/10"
          >
            <Camera className="h-10 w-10 text-primary" />
            <span className="font-semibold text-secondary">Ambil / Unggah Foto</span>
            <span className="text-xs text-muted-foreground">Lokasi GPS otomatis terdeteksi</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {step === "analyzing" && previewUrl && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={previewUrl} alt="preview" className="h-56 w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary/70 backdrop-blur-sm">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-semibold text-primary-foreground">AI sedang menganalisis...</p>
              <p className="text-xs text-primary-foreground/80">Gemini 2.5 Flash</p>
            </div>
          </div>
        </div>
      )}

      {step === "review" && previewUrl && analysis && (
        <div className="space-y-4 animate-fade-up">
          <div className="relative">
            <img src={previewUrl} alt="preview" className="h-48 w-full rounded-2xl object-cover" />
            <button
              onClick={reset}
              className="absolute right-2 top-2 rounded-full bg-secondary p-1.5 text-secondary-foreground"
              aria-label="Batal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl bg-secondary p-4 text-secondary-foreground">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Hasil Analisis AI</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-secondary-foreground/70">Tingkat:</span>
                <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 font-bold text-secondary">
                  <AlertTriangle className="h-3 w-3" />
                  {analysis.severity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-foreground/70">Estimasi luas:</span>
                <span className="font-semibold">{analysis.estimated_area}</span>
              </div>
              <div className="border-t border-white/10 pt-2 text-secondary-foreground/90">
                {analysis.description}
              </div>
              {coords && (
                <div className="flex items-center gap-1 pt-1 text-xs text-secondary-foreground/70">
                  <MapPin className="h-3 w-3" />
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </div>
              )}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full font-bold shadow-warm">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Simpan & Lanjut Kirim
          </Button>
        </div>
      )}
    </section>
  );
};
