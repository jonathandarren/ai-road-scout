const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  severity: string;
  estimated_area: string;
  description: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  target?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FONNTE_TOKEN = Deno.env.get("FONNTE_TOKEN");
    const DEFAULT_TARGET = Deno.env.get("FONNTE_TARGET");
    if (!FONNTE_TOKEN) throw new Error("FONNTE_TOKEN belum dikonfigurasi");

    const body = (await req.json()) as Payload;
    const target = (body.target || DEFAULT_TARGET || "").trim();
    if (!target) throw new Error("Nomor tujuan (FONNTE_TARGET) belum diatur");

    const mapsLink = `https://www.google.com/maps?q=${body.latitude},${body.longitude}`;
    const message =
      `🚧 *LAPORAN JALAN RUSAK*\n\n` +
      `*Tingkat Kerusakan:* ${body.severity}\n` +
      `*Estimasi Luas:* ${body.estimated_area}\n\n` +
      `*Analisis AI:*\n${body.description}\n\n` +
      `📍 *Lokasi:* ${mapsLink}\n` +
      `📷 *Foto:* ${body.photo_url}\n\n` +
      `_Dilaporkan via Peta Lapor Jalan Rusak AI_`;

    const form = new FormData();
    form.append("target", target);
    form.append("message", message);
    form.append("url", body.photo_url);
    form.append("countryCode", "62");

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: FONNTE_TOKEN },
      body: form,
    });

    const data = await res.json();
    if (!res.ok || data?.status === false) {
      throw new Error(
        `Fonnte error [${res.status}]: ${JSON.stringify(data)}`,
      );
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-fonnte error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
