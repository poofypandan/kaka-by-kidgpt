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

// Enhanced safety filtering for Indonesian children
const INAPPROPRIATE_PATTERNS = [
  // Violence & Safety
  /kekerasan|violence|darah|blood|bunuh|kill|mati|death|berkelahi|fight/i,
  /bahaya|dangerous|racun|poison|senjata|weapon|pisau|knife/i,
  
  // Adult Content
  /dewasa|adult|seks|sex|telanjang|naked|ciuman|kiss|pacaran|dating/i,
  /porno|porn|vulgar|cabul|jorok|dirty/i,
  
  // Substances
  /narkoba|drugs|mabuk|drunk|rokok|cigarette|alkohol|alcohol|minum-minuman keras/i,
  
  // Sensitive Topics
  /politik|political|partai|party|pilihan|election|demo|demonstration/i,
  /agama|religion|tuhan|god|allah|yesus|buddha|hindu/i,
  
  // Financial & Commercial
  /uang|money|jual|beli|buy|sell|bisnis|business|investasi|investment/i,
  /kredit|credit|pinjam|loan|hutang|debt|bayar|payment/i,
  
  // Personal Information
  /alamat|address|nomor hp|phone number|email|password|nama lengkap|full name/i,
  /sekolah dimana|which school|rumah dimana|where do you live/i,
  
  // Inappropriate Social
  /benci|hate|bodoh|stupid|jelek|ugly|gendut|fat|kurus|skinny/i,
  /marah|angry|sedih banget|very sad|takut|scared|stress/i,
];

// Age-appropriate content filters by grade level
const GRADE_FILTERS = {
  strict: { // Ages 5-7 (Grade 1-2)
    maxComplexity: 3,
    allowedTopics: ['animals', 'colors', 'numbers', 'family', 'food', 'toys'],
    blockedConcepts: ['death', 'injury', 'scary', 'complex emotions']
  },
  moderate: { // Ages 8-10 (Grade 3-5)
    maxComplexity: 5,
    allowedTopics: ['science', 'geography', 'history', 'sports', 'hobbies', 'friendship'],
    blockedConcepts: ['romantic relationships', 'complex politics', 'advanced science']
  },
  basic: { // Ages 11-12 (Grade 6)
    maxComplexity: 7,
    allowedTopics: ['all educational content'],
    blockedConcepts: ['adult relationships', 'complex political issues']
  }
};

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

// Enhanced content analysis
function calculateSafetyScore(text: string): { score: number; reasons: string[] } {
  let score = 100;
  const reasons: string[] = [];
  
  // Check against inappropriate patterns
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(text)) {
      score -= 30;
      reasons.push(`Pattern detected: ${pattern.source}`);
    }
  }
  
  // Check for personal information requests
  const personalInfoPatterns = [
    /siapa nama/i, /dimana rumah/i, /nomor telepon/i, /umur berapa/i,
    /sekolah mana/i, /alamat/i, /password/i, /email/i
  ];
  
  for (const pattern of personalInfoPatterns) {
    if (pattern.test(text)) {
      score -= 40;
      reasons.push('Personal information request detected');
    }
  }
  
  // Check for emotional distress indicators
  const distressPatterns = [
    /sedih banget/i, /takut/i, /marah/i, /stress/i, /tidak suka/i
  ];
  
  for (const pattern of distressPatterns) {
    if (pattern.test(text)) {
      score -= 20;
      reasons.push('Emotional distress indicator detected');
    }
  }
  
  return { score: Math.max(0, score), reasons };
}

function containsInappropriateContent(text: string): boolean {
  const { score } = calculateSafetyScore(text);
  return score < 70; // Threshold for filtering
}

function generateSafeResponse(filterReason?: string): string {
  const safeResponses = [
    "Hmm, bagaimana kalau kita bicara tentang hal yang lebih seru? Aku bisa ceritakan tentang hewan lucu atau permainan seru! 🐨✨",
    "Wah, aku lebih suka membahas hal-hal yang menyenangkan! Mau dengar cerita tentang petualangan atau belajar hal baru? 🌟📚",
    "Ayo kita bicara tentang sesuatu yang lebih menarik! Kamu suka menggambar atau bernyanyi? 🎨🎵",
    "Kaka punya banyak cerita seru nih! Mau dengar tentang petualangan di hutan atau di bawah laut? 🌊🦋",
    "Wah, Kaka ingin tahu tentang hal-hal yang kamu suka! Ceritain dong hobi atau permainan favoritmu! 🎮🎨"
  ];
  return safeResponses[Math.floor(Math.random() * safeResponses.length)];
}

// Log conversation to database
async function logConversation(childId: string | null, content: string, messageType: 'user' | 'assistant', safetyScore: number, filtered: boolean, filterReason?: string) {
  try {
    if (!childId) return; // Skip logging if no child ID
    
    const { error } = await supabase
      .from('conversation_logs')
      .insert({
        child_id: childId,
        message_content: content,
        message_type: messageType,
        safety_score: safetyScore,
        filtered_content: filtered,
        filter_reason: filterReason
      });
      
    if (error) {
      console.error('Error logging conversation:', error);
    }
  } catch (error) {
    console.error('Error in logConversation:', error);
  }
}

// Send parent notification for concerning content
async function notifyParent(childId: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical', conversationLogId?: string) {
  try {
    // Get parent information
    const { data: child } = await supabase
      .from('children')
      .select('parent_id')
      .eq('id', childId)
      .single();
      
    if (!child) return;
    
    const { error } = await supabase
      .from('parent_notifications')
      .insert({
        parent_id: child.parent_id,
        child_id: childId,
        notification_type: 'content_filter',
        message,
        severity,
        conversation_log_id: conversationLogId
      });
      
    if (error) {
      console.error('Error sending parent notification:', error);
    }
  } catch (error) {
    console.error('Error in notifyParent:', error);
  }
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

    const { message, childId } = await req.json();

    if (!message || typeof message !== 'string') {
      throw new Error('Message is required');
    }

    console.log('Processing message for child:', childId, 'Message:', message);

    // Enhanced safety analysis
    const safetyAnalysis = calculateSafetyScore(message);
    const { score: safetyScore, reasons } = safetyAnalysis;
    
    // Log user message
    await logConversation(childId, message, 'user', safetyScore, false);
    
    // Pre-message safety check
    if (containsInappropriateContent(message)) {
      console.log('Inappropriate content detected:', message, 'Reasons:', reasons);
      
      const safeResponse = generateSafeResponse(reasons.join(', '));
      
      // Log filtered response
      await logConversation(childId, safeResponse, 'assistant', 100, true, reasons.join(', '));
      
      // Notify parent if severity is high
      if (safetyScore < 50 && childId) {
        await notifyParent(childId, `Pesan anak mengandung konten yang difilter: "${message}"`, 'high');
      }
      
      return new Response(JSON.stringify({ 
        response: safeResponse,
        filtered: true,
        safetyScore
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Enhanced AI response safety check
    const responseAnalysis = calculateSafetyScore(aiResponse);
    const responseSafetyScore = responseAnalysis.score;
    
    if (containsInappropriateContent(aiResponse)) {
      console.log('AI response filtered for safety');
      
      const safeResponse = generateSafeResponse(responseAnalysis.reasons.join(', '));
      
      // Log filtered AI response
      await logConversation(childId, safeResponse, 'assistant', 100, true, responseAnalysis.reasons.join(', '));
      
      return new Response(JSON.stringify({ 
        response: safeResponse,
        filtered: true,
        safetyScore: responseSafetyScore
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log successful AI response
    await logConversation(childId, aiResponse, 'assistant', responseSafetyScore, false);
    
    // Send parent notification for borderline content
    if (responseSafetyScore < 80 && responseSafetyScore >= 70 && childId) {
      await notifyParent(childId, `Percakapan dengan konten yang perlu diperhatikan: "${aiResponse}"`, 'medium');
    }

    console.log('AI response generated successfully with safety score:', responseSafetyScore);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      filtered: false,
      safetyScore: responseSafetyScore
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