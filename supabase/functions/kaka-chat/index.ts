import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ✅ CRITICAL: Ensure OpenAI API key is properly loaded
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

console.log('🔑 Function starting...');
console.log('🔑 OpenAI API Key present:', !!OPENAI_API_KEY);
console.log('🔑 OpenAI API Key length:', OPENAI_API_KEY?.length || 0);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ✅ SIMPLIFIED: Child-friendly Indonesian AI prompt
const KAKA_PROMPT = `Kamu adalah Kaka, AI assistant ramah untuk anak-anak Indonesia.

ATURAN SEDERHANA:
- Selalu jawab dalam Bahasa Indonesia yang mudah dipahami anak
- Gunakan emoji yang ceria (🐨 🌟 📚 🎮)
- Jawaban maksimal 2 kalimat
- Kalau soal matematika, bantu dengan antusias
- Kalau topik tidak pantas, alihkan ke hal yang edukatif

CONTOH MATEMATIKA:
"3+3?" → "Wah! 3+3 = 6! 🧮 Kamu hebat belajar matematika!"

Selalu bersikap seperti kakak yang sayang dan pintar!`;

// ✅ MINIMAL: Basic safety check (not blocking math)
function isBasicallySafe(text: string): boolean {
  const reallyBadStuff = [
    /\b(anjing|bangsat|kontol|memek|ngentot)\b/gi,
    /\b(sex|porn|seks|telanjang)\b/gi,
    /\b(bunuh|kill|mati)\b/gi
  ];
  return !reallyBadStuff.some(pattern => pattern.test(text));
}

// ✅ MAIN FUNCTION: Simplified and bulletproof
serve(async (req) => {
  console.log('📨 Request received:', req.method);
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ CRITICAL CHECK: API Key validation
    if (!OPENAI_API_KEY) {
      console.error('❌ CRITICAL: OPENAI_API_KEY is missing!');
      return new Response(JSON.stringify({
        response: 'Kaka belum siap ngobrol! Tim teknis sedang mengatur sesuatu. Coba lagi nanti ya! 🔧',
        error: 'API_KEY_MISSING'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (OPENAI_API_KEY.length < 20) {
      console.error('❌ CRITICAL: OPENAI_API_KEY seems invalid, length:', OPENAI_API_KEY.length);
      return new Response(JSON.stringify({
        response: 'Kaka belum siap ngobrol! Kunci API tidak valid. Hubungi tim teknis! 🔑',
        error: 'API_KEY_INVALID'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ✅ Parse request
    const body = await req.json().catch(e => {
      console.error('❌ JSON parse error:', e);
      return null;
    });

    if (!body || !body.message) {
      console.error('❌ Invalid request body:', body);
      return new Response(JSON.stringify({
        response: 'Kaka tidak mendengar pesan kamu. Coba kirim lagi ya! 👂',
        error: 'INVALID_REQUEST'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const message = String(body.message).trim();
    console.log('💬 Processing message:', message);

    // ✅ Basic safety check
    if (!isBasicallySafe(message)) {
      console.log('🛡️ Message filtered for safety');
      return new Response(JSON.stringify({
        response: 'Hmm, ayo kita bicara tentang hal yang lebih seru! Mau belajar matematika atau sains? 🌟',
        filtered: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ✅ DIRECT OpenAI API call with detailed logging
    console.log('🤖 Calling OpenAI API...');
    console.log('🔑 Using API key starting with:', OPENAI_API_KEY.substring(0, 7) + '...');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: KAKA_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    console.log('📡 OpenAI Response status:', openaiResponse.status);
    console.log('📡 OpenAI Response headers:', Object.fromEntries(openaiResponse.headers.entries()));

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API Error:', openaiResponse.status, errorText);
      
      let userMessage = 'Kaka sedang istirahat sebentar. Coba lagi nanti ya! 😊';
      
      if (openaiResponse.status === 401) {
        userMessage = 'Kaka belum bisa ngobrol karena masalah izin. Hubungi tim teknis! 🔑';
        console.error('🚨 URGENT: Invalid API key detected!');
      } else if (openaiResponse.status === 429) {
        userMessage = 'Kaka sedang sibuk banget! Tunggu sebentar ya, lalu coba lagi! ⏰';
      } else if (openaiResponse.status === 402) {
        userMessage = 'Tim teknis perlu mengisi ulang kredit Kaka. Coba lagi nanti! 💳';
        console.error('🚨 URGENT: OpenAI account out of credits!');
      }
      
      return new Response(JSON.stringify({
        response: userMessage,
        error: `OPENAI_${openaiResponse.status}`,
        details: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await openaiResponse.json();
    console.log('✅ OpenAI Response data:', data);
    
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      console.error('❌ No AI response in data:', data);
      return new Response(JSON.stringify({
        response: 'Kaka bingung dan tidak tahu harus jawab apa. Coba tanya yang lain ya! 🤔',
        error: 'NO_AI_RESPONSE'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ SUCCESS: AI response generated:', aiResponse);

    return new Response(JSON.stringify({
      response: aiResponse,
      filtered: false,
      safetyScore: 95
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 FUNCTION ERROR:', error);
    console.error('💥 Error stack:', error.stack);
    
    return new Response(JSON.stringify({
      response: 'Aduh! Kaka mengalami error teknis. Tim akan segera memperbaiki! 🔧',
      error: 'FUNCTION_ERROR',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

console.log('🚀 Kaka chat function loaded successfully!');