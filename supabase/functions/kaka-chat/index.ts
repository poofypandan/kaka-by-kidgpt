import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Math fallback responses for when API fails
const MATH_FALLBACKS = {
  '3+3': '3 + 3 = 6! Wah, pintar! Matematika itu menyenangkan! 🧮✨',
  '4+10': '4 + 10 = 14! Keren sekali! Kamu hebat dalam penjumlahan! 🌟',
  '7-2': '7 - 2 = 5! Bagus banget! Pengurangan juga kamu kuasai! 👏',
  '2+2': '2 + 2 = 4! Mudah ya? Tapi tetap hebat! 🎉',
  '5+5': '5 + 5 = 10! Pintar sekali! 🎯',
  '10-5': '10 - 5 = 5! Mantap! 💪',
  '6+3': '6 + 3 = 9! Wah, kamu jago! 😊',
  '8-4': '8 - 4 = 4! Benar sekali! 🌟'
};

// Simple safety check - allows educational content like math
function isContentSafe(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Allow math questions
  if (/\d+\s*[\+\-\*\/×÷]\s*\d+/.test(message) || 
      /berapa\s+\d+/.test(lowerMessage) ||
      /matematika|math|hitung|penjumlahan|pengurangan/.test(lowerMessage)) {
    return true;
  }
  
  // Block inappropriate content
  const unsafePatterns = [
    /\b(anjing|bangsat|babi|kampret|kontol|memek|ngentot)\b/gi,
    /\b(seks|sex|telanjang|naked|porn|porno)\b/gi,
    /\b(bunuh|kill|mati|death|berkelahi|fight)\b/gi,
    /\b(alamat|address|nomor hp|phone|email|password)\b/gi
  ];
  
  return !unsafePatterns.some(pattern => pattern.test(message));
}

// Kaka's personality prompt optimized for cost and educational responses
const KAKA_SYSTEM_PROMPT = `Kamu adalah Kaka, AI assistant yang ramah untuk anak-anak Indonesia berusia 6-16 tahun.

KEPRIBADIAN:
- Seperti kakak yang sayang, sabar, dan bijaksana
- Selalu positif dan mendukung pembelajaran
- Responsif dengan emosi anak dengan empathy
- Menghormati semua latar belakang budaya dan agama

CONTOH RESPONS MATEMATIKA:
User: "4+10?"
Kaka: "Wah, soal matematika! 4+10 = 14! 🧮 Kamu hebat sudah belajar penjumlahan. Mau coba soal yang lain?"

User: "3+3?"
Kaka: "3+3 = 6! Pintar sekali! Matematika itu menyenangkan ya! ✨ Ada soal lain yang mau dicoba?"

ATURAN KETAT:
❌ TIDAK BOLEH membahas: konten dewasa, kekerasan, hal menakutkan
❌ TIDAK BOLEH meminta informasi pribadi
✅ HARUS redirect topik sensitif ke orangtua
✅ HARUS tetap positif dan edukatif
✅ HARUS inklusif terhadap semua kepercayaan

Respon harus singkat (maksimal 2 kalimat), ramah, dan selalu gunakan emoji untuk anak-anak!`;

// Emergency responses when OpenAI fails
const EMERGENCY_RESPONSES = [
  "Kaka di sini untuk membantu! Coba tanya hal lain ya! 🌟",
  "Wah, itu pertanyaan yang menarik! Mari kita eksplorasi bersama! 😊", 
  "Kaka senang ngobrol sama kamu! Ada yang lain yang mau ditanyakan? ✨",
  "Hmm, Kaka sedang mikir nih! Coba tanya yang lain dulu ya! 🐨"
];

// Simple logging function
async function logConversation(childId: string, message: string, response: string) {
  try {
    await supabase.from('conversations').insert({
      child_id: childId,
      message: message.substring(0, 500),
      sender: 'user',
      created_at: new Date().toISOString()
    });
    
    await supabase.from('conversations').insert({
      child_id: childId,
      message: response.substring(0, 500), 
      sender: 'assistant',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.log('📝 Conversation logging failed (non-critical):', error.message);
  }
}

function getEmergencyResponse(): string {
  return EMERGENCY_RESPONSES[Math.floor(Math.random() * EMERGENCY_RESPONSES.length)];
}

serve(async (req) => {
  console.log('🚀 Kaka chat function started');
  console.log('🔧 Environment check:');
  console.log('  - OPENAI_API_KEY:', !!openAIApiKey);
  console.log('  - SUPABASE_URL:', !!supabaseUrl);
  console.log('  - SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  
  if (openAIApiKey) {
    console.log('  - OPENAI_API_KEY first 10 chars:', openAIApiKey.substring(0, 10));
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Processing request...');
    
    const requestBody = await req.json();
    console.log('📋 Full request body:', JSON.stringify(requestBody));
    
    const { message, childId, childGrade, childName } = requestBody;
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log('📊 Request details:', {
      messageLength: message.length,
      messageContent: message,
      childId: childId || 'anonymous',
      childGrade: childGrade || 'unknown',
      childName: childName || 'anonymous',
      hasOpenAIKey: !!openAIApiKey
    });

    // Check for math fallbacks first
    const normalizedMessage = message.toLowerCase().replace(/\s+/g, '');
    if (MATH_FALLBACKS[normalizedMessage]) {
      console.log('✅ Math fallback response used');
      const fallbackResponse = MATH_FALLBACKS[normalizedMessage];
      
      try {
        await logConversation(childId || 'anonymous', message, fallbackResponse);
      } catch (logError) {
        console.log('📝 Logging failed (non-critical)');
      }
      
      return new Response(JSON.stringify({
        response: fallbackResponse,
        safetyScore: 100,
        filtered: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Safety check
    if (!isContentSafe(message)) {
      console.log('⚠️ Content blocked by safety filter');
      return new Response(JSON.stringify({
        response: "Aku tidak bisa membahas hal itu. Ayo kita bicara tentang hal yang menyenangkan! 😊",
        safetyScore: 20,
        filtered: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // OpenAI API call
    if (!openAIApiKey) {
      console.log('❌ OpenAI API key not found, using emergency response');
      const emergencyResponse = getEmergencyResponse();
      
      return new Response(JSON.stringify({
        response: emergencyResponse,
        safetyScore: 85,
        filtered: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🤖 Calling OpenAI API...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: KAKA_SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7
      }),
    });

    console.log('📡 OpenAI Response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ OpenAI API error:', errorText);
      
      let errorMessage: string;
      
      if (openAIResponse.status === 401) {
        errorMessage = 'Kaka belum siap ngobrol. Tim teknis sedang mempersiapkan! 🔧';
      } else if (openAIResponse.status === 429) {
        errorMessage = 'Kaka sedang sibuk banget nih! Coba lagi sebentar ya! ⏰';
      } else if (openAIResponse.status === 402) {
        errorMessage = 'Tim teknis sedang mengisi ulang energi Kaka! Tunggu sebentar ya! 🔋';
      } else {
        errorMessage = getEmergencyResponse();
      }

      return new Response(JSON.stringify({
        response: errorMessage,
        safetyScore: 80,
        filtered: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await openAIResponse.json();
    const kakaResponse = data.choices[0]?.message?.content || getEmergencyResponse();
    
    console.log('✅ OpenAI response received:', kakaResponse.substring(0, 100) + '...');

    // Log the conversation
    try {
      await logConversation(childId || 'anonymous', message, kakaResponse);
    } catch (logError) {
      console.log('📝 Conversation logging failed (non-critical)');
    }

    return new Response(JSON.stringify({
      response: kakaResponse,
      safetyScore: 95,
      filtered: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in kaka-chat function:', error);
    console.error('❌ Error stack:', error.stack);
    
    try {
      const emergencyResponse = getEmergencyResponse();
      
      return new Response(JSON.stringify({
        response: emergencyResponse,
        safetyScore: 75,
        filtered: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (emergencyError) {
      console.error('❌ Emergency response also failed:', emergencyError);
      
      return new Response(JSON.stringify({
        response: "Kaka sedang istirahat. Coba lagi nanti ya! 😊",
        safetyScore: 70,
        filtered: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
});