import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safety filtering for Indonesian children
const INAPPROPRIATE_PATTERNS = [
  /kekerasan|violence|darah|blood/i,
  /dewasa|adult|seks|sex/i,
  /narkoba|drugs|mabuk|drunk/i,
  /politik|political|agama|religion/i,
  /uang|money|jual|beli|buy|sell/i,
];

const SAFETY_SYSTEM_PROMPT = `Kamu adalah Kaka, asisten AI yang ramah dan aman untuk anak-anak Indonesia berusia 5-12 tahun. 

ATURAN KEAMANAN:
- SELALU jawab dalam Bahasa Indonesia yang sederhana dan mudah dipahami anak-anak
- JANGAN pernah membahas topik dewasa, kekerasan, politik, agama, atau hal berbahaya
- JANGAN memberikan informasi kontak pribadi atau meminta informasi pribadi anak
- Fokus pada pendidikan, permainan yang aman, cerita yang baik, dan kreativitas
- Jika ada pertanyaan yang tidak pantas, alihkan ke topik yang lebih positif

KEPRIBADIAN:
- Antusias dan ceria
- Suka menggunakan kata-kata sederhana
- Gemar bercerita dan bermain
- Selalu positif dan mendukung
- Menggunakan emoji yang sesuai untuk anak-anak 🌟😊🎨📚

CONTOH RESPONS:
"Halo! Aku Kaka! 😊 Apa yang ingin kamu pelajari hari ini? Kita bisa cerita tentang hewan, bermain teka-teki, atau belajar hal-hal seru lainnya! 🌟"

Ingat: Keamanan anak adalah prioritas utama. Jika ragu, lebih baik tidak menjawab dan alihkan ke topik yang aman.`;

function containsInappropriateContent(text: string): boolean {
  return INAPPROPRIATE_PATTERNS.some(pattern => pattern.test(text));
}

function generateSafeResponse(): string {
  const safeResponses = [
    "Hmm, bagaimana kalau kita bicara tentang hal yang lebih seru? Aku bisa ceritakan tentang hewan lucu atau permainan seru! 🐨✨",
    "Wah, aku lebih suka membahas hal-hal yang menyenangkan! Mau dengar cerita tentang petualangan atau belajar hal baru? 🌟📚",
    "Ayo kita bicara tentang sesuatu yang lebih menarik! Kamu suka menggambar atau bernyanyi? 🎨🎵",
  ];
  return safeResponses[Math.floor(Math.random() * safeResponses.length)];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      throw new Error('Message is required');
    }

    // Safety filtering
    if (containsInappropriateContent(message)) {
      console.log('Inappropriate content detected:', message);
      return new Response(JSON.stringify({ 
        response: generateSafeResponse(),
        filtered: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SAFETY_SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Additional safety check on AI response
    if (containsInappropriateContent(aiResponse)) {
      console.log('AI response filtered for safety');
      return new Response(JSON.stringify({ 
        response: generateSafeResponse(),
        filtered: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      filtered: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in kaka-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Maaf, Kaka sedang istirahat sebentar. Coba lagi nanti ya! 😊',
      response: 'Maaf, Kaka sedang istirahat sebentar. Coba lagi nanti ya! 😊'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});