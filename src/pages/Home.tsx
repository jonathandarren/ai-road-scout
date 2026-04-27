import { Link } from "react-router-dom";
import { Camera, Sparkles, MapPin, MessageSquare, ArrowRight, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-asphalt text-secondary-foreground">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Gemini 2.5 Flash
          </div>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            Laporkan jalan rusak <span className="text-primary">dalam hitungan detik</span>.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-secondary-foreground/80 sm:text-base">
            Foto kerusakan, AI langsung menganalisis tingkat keparahan dan estimasi luas. Kirim
            laporan ke instansi via WhatsApp dengan satu sentuhan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button className="font-bold shadow-warm">
                Mulai Lapor <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" className="border-primary/40 bg-transparent font-bold text-primary hover:bg-primary/10 hover:text-primary">
                Pelajari lebih lanjut
              </Button>
            </Link>
          </div>
        </div>
        <div className="hazard-stripes h-2" />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h2 className="text-xl font-bold text-secondary">Cara kerjanya</h2>
        <p className="text-sm text-muted-foreground">Empat langkah sederhana</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Feature
            icon={Camera}
            title="Foto / Unggah"
            text="Ambil gambar jalan yang rusak langsung dari kamera atau galeri."
          />
          <Feature
            icon={Sparkles}
            title="Analisis AI"
            text="Gemini menentukan tingkat kerusakan, estimasi luas, dan deskripsi teknis."
          />
          <Feature
            icon={MapPin}
            title="Lokasi otomatis"
            text="GPS mendeteksi titik laporan dan menampilkannya di peta interaktif."
          />
          <Feature
            icon={MessageSquare}
            title="Kirim WhatsApp"
            text="Laporan terkirim otomatis ke pihak terkait via Fonnte."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 pb-10">
        <div className="rounded-3xl bg-secondary p-6 text-secondary-foreground shadow-card sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary">
              <Construction className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">Siap melapor?</h3>
              <p className="mt-1 text-sm text-secondary-foreground/70">
                Buka dashboard untuk membuat laporan baru dan melihat sebaran kerusakan jalan di
                sekitarmu.
              </p>
              <Link to="/dashboard" className="mt-4 inline-block">
                <Button className="font-bold shadow-warm">
                  Buka Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Feature = ({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) => (
  <div className="rounded-2xl bg-card p-5 shadow-card">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <h3 className="mt-3 font-bold text-secondary">{title}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
  </div>
);

export default Home;
