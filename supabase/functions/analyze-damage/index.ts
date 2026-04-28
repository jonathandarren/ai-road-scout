const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Anda adalah ahli teknik sipil Indonesia yang menganalisis kerusakan jalan dari foto DAN memperkirakan biaya perbaikannya. Gunakan harga pasar material konstruksi Indonesia saat ini (rupiah) yang realistis: pasir ~Rp 250.000-350.000/m³, semen ~Rp 65.000-75.000/sak 50kg, kerikil/split ~Rp 280.000-380.000/m³, aspal hotmix ~Rp 1.400.000-1.800.000/ton, batu belah ~Rp 200.000/m³, upah tukang ~Rp 150.000/hari. Hitung kebutuhan material berdasarkan estimasi luas dan jenis kerusakan. Selalu balas dalam bahasa Indonesia dengan memanggil tool analyze_road_damage.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analisis foto kerusakan jalan ini. Tentukan tingkat kerusakan, estimasi luas area, deskripsi teknis, rincian material + biaya perbaikan (harga pasar Indonesia terkini), total biaya, dan estimasi waktu pengerjaan." },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_road_damage",
              description: "Mengembalikan analisis kerusakan jalan terstruktur",
              parameters: {
                type: "object",
                properties: {
                  severity: {
                    type: "string",
                    enum: ["Rendah", "Sedang", "Berat"],
                    description: "Tingkat kerusakan jalan",
                  },
                  estimated_area: {
                    type: "string",
                    description: "Estimasi luas kerusakan, contoh: '2 m²' atau '0.5 x 1 m'",
                  },
                  description: {
                    type: "string",
                    description: "Deskripsi teknis kerusakan dalam 2-3 kalimat (jenis kerusakan, kedalaman, urgensi perbaikan)",
                  },
                  repair_estimate: {
                    type: "object",
                    description: "Rincian estimasi biaya & waktu perbaikan",
                    properties: {
                      materials: {
                        type: "array",
                        description: "Rincian material yang dibutuhkan dengan harga pasar Indonesia saat ini",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string", description: "Nama material, contoh: Pasir, Semen, Kerikil, Aspal" },
                            quantity: { type: "string", description: "Jumlah + satuan, contoh: '0.5 m³', '2 sak'" },
                            unit_price: { type: "number", description: "Harga satuan dalam Rupiah" },
                            subtotal: { type: "number", description: "Subtotal dalam Rupiah (quantity x unit_price)" },
                          },
                          required: ["name", "quantity", "unit_price", "subtotal"],
                          additionalProperties: false,
                        },
                      },
                      labor_cost: { type: "number", description: "Total upah tukang dalam Rupiah" },
                      total_cost: { type: "number", description: "Total seluruh biaya (material + upah) dalam Rupiah" },
                      duration: { type: "string", description: "Estimasi waktu pengerjaan, contoh: '1-2 hari', '3 hari kerja'" },
                      method: { type: "string", description: "Metode perbaikan yang direkomendasikan dalam 1 kalimat" },
                    },
                    required: ["materials", "labor_cost", "total_cost", "duration", "method"],
                    additionalProperties: false,
                  },
                },
                required: ["severity", "estimated_area", "description", "repair_estimate"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_road_damage" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Batas permintaan tercapai. Coba lagi nanti." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Kredit AI habis. Tambahkan kredit di workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI tidak mengembalikan analisis" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-damage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
