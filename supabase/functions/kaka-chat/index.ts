import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback responses for common questions
const FALLBACK_RESPONSES = {
  'berapa 5+5': '5 + 5 = 10! Hebat sekali! Kamu pintar matematika! 🎉',
  'berapa 5 + 5': '5 + 5 = 10! Hebat sekali! Kamu pintar matematika! 🎉',
  'brp 5+5': '5 + 5 = 10! Hebat sekali! Kamu pintar matematika! 🎉',
  '5+5': '5 + 5 = 10! Hebat sekali! Kamu pintar matematika! 🎉',
  'halo': 'Halo! Aku Kaka, teman belajar yang seru! Ada yang bisa Kaka bantu hari ini? 🐨✨',
  'hello': 'Halo! Aku Kaka, teman belajar yang seru! Ada yang bisa Kaka bantu hari ini? 🐨✨',
  'hai': 'Hai! Aku Kaka! Senang bertemu denganmu! Mau belajar apa hari ini? 🌟',
  'apa kabar': 'Kaka baik-baik saja! Terima kasih sudah bertanya. Kamu bagaimana? Mau belajar hal seru apa nih? 😊',
  'siapa kamu': 'Aku Kaka! Aku adalah teman belajar yang akan membantu kamu belajar dengan cara yang menyenangkan! 🐨📚',
  'makasih': 'Sama-sama! Kaka senang bisa membantu! Ada lagi yang mau ditanyakan? 😊✨',
  'terima kasih': 'Sama-sama! Kaka senang bisa membantu! Ada lagi yang mau ditanyakan? 😊✨',
};

// Indonesian safety filtering patterns
const INAPPROPRIATE_PATTERNS = [
  /\b(anjing|bangsat|babi|kampret|kontol|memek|ngentot|peler|tai|tetek|titit)\b/i,
  /\b(brengsek|bajingan|keparat|sialan|bangke|jelek amat|tolol|bodoh banget|goblok)\b/i,
  /\b(fuck|shit|damn|bitch|asshole|crap|wtf|omg|goddamn)\b/i,
  /\b(seks|sex|telanjang|naked|bugil|ml|making love|bercinta|pacaran|pacar|ciuman|kiss)\b/i,
  /\b(bunuh|kill|mati|death|berkelahi|fight|pukul|hit|tendang|kick|tusuk|stab)\b/i,
  /\b(narkoba|drugs|ganja|weed|marijuana|kokain|cocaine|heroin|ekstasi|ecstasy)\b/i,
  /\b(mabuk|drunk|minum|alkohol|alcohol|bir|beer|wine|vodka|whiskey)\b/i,
];

const SAFETY_SYSTEM_PROMPT = `You are Kaka, a friendly AI assistant for Indonesian children aged 6-12.

CRITICAL RULES:
- Always respond in simple, warm Bahasa Indonesia
- Never discuss adult content, violence, or inappropriate topics  
- Promote positive values and Indonesian culture
- Encourage children to talk to parents about serious issues
- Keep responses short, cheerful, and age-appropriate
- Use simple words and encourage learning
- Add emoji to make responses fun: 🌟📚🎉😊🐨✨

Examples:
- Math: "Wah, hebat! 2 + 2 = 4! Kamu pintar sekali! 🎉"
- Greeting: "Halo! Aku Kaka! Senang bertemu denganmu! 🐨✨"
- Learning: "Ayo kita belajar hal seru! Kamu mau tahu tentang apa? 📚🌟"

Keep responses under 50 words and always encouraging! 🌟`;

function containsInappropriateContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return INAPPROPRIATE_PATTERNS.some(pattern => pattern.test(lowerText));
}

function getFallbackResponse(message: string): string | null {
  const cleanMessage = message.toLowerCase().trim().replace(/[?!.]/g, '');
  
  // Check exact matches first
  if (FALLBACK_RESPONSES[cleanMessage]) {
    return FALLBACK_RESPONSES[cleanMessage];
  }
  
  // Check partial matches for math questions
  if (cleanMessage.includes('5+5') || cleanMessage.includes('5 + 5')) {
    return FALLBACK_RESPONSES['berapa 5+5'];
  }
  
  if (cleanMessage.includes('halo') || cleanMessage.includes('hello') || cleanMessage.includes('hai')) {
    return FALLBACK_RESPONSES['halo'];
  }
  
  return null;
}

function generateSafeResponse(): string {
  const safeResponses = [
    "Hmm, bagaimana kalau kita bicara tentang hal yang lebih seru? Aku bisa ceritakan tentang hewan lucu atau permainan seru! 🐨✨",
    "Wah, aku lebih suka membahas hal-hal yang menyenangkan! Mau dengar cerita tentang petualangan atau belajar hal baru? 🌟📚",
    "Ayo kita bicara tentang sesuatu yang lebih menarik! Kamu suka menggambar atau bernyanyi? 🎨🎵",
    "Kaka punya banyak cerita seru nih! Mau dengar tentang petualangan di hutan atau di bawah laut? 🌊🦋",
    "Wah, Kaka ingin tahu tentang hal-hal yang kamu suka! Ceritain dong hobi atau permainan favoritmu! 🎮🎨"
  ];
  return safeResponses[Math.floor(Math.random() * safeResponses.length)];
}

async function logConversation(childId: string | null, content: string, sender: 'child' | 'kaka', safetyScore: number, filtered: boolean, filterReason?: string) {
  try {
    console.log('🔄 Attempting to log conversation:', {
      childId,
      sender,
      contentLength: content.length,
      safetyScore,
      filtered
    });

    if (!childId) {
      console.log('⚠️ No childId provided for logging');
      return;
    }
    
    // Get family info for the child
    const { data: familyMember, error: familyError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('id', childId)
      .maybeSingle();
    
    if (familyError) {
      console.error('❌ Error fetching family member:', familyError);
      return;
    }
    
    if (!familyMember) {
      console.log('⚠️ Could not find family for child:', childId);
      return;
    }
    
    console.log('✅ Found family for child:', familyMember.family_id);
    
    const { error: insertError } = await supabase
      .from('family_conversations')
      .insert({
        family_id: familyMember.family_id,
        child_id: childId,
        message_content: content,
        sender: sender,
        safety_score: safetyScore,
        flagged: filtered,
        flag_reason: filterReason
      });
      
    if (insertError) {
      console.error('❌ Error logging conversation:', insertError);
    } else {
      console.log('✅ Successfully logged conversation for child:', childId);
    }
  } catch (error) {
    console.error('❌ Exception in logConversation:', error);
  }
}

async function notifyFamily(childId: string, message: string, severity: 'low' | 'medium' | 'high') {
  try {
    console.log('🔔 Attempting to notify family:', { childId, severity });
    
    const { data: familyMember, error: familyError } = await supabase
      .from('family_members')
      .select('family_id, name')
      .eq('id', childId)
      .maybeSingle();
      
    if (familyError || !familyMember) {
      console.error('❌ Error fetching family member for notification:', familyError);
      return;
    }
    
    const { error: notifyError } = await supabase
      .from('family_notifications')
      .insert({
        family_id: familyMember.family_id,
        child_id: childId,
        notification_type: 'content_filter',
        title: `Peringatan Konten - ${familyMember.name}`,
        message,
        severity
      });
      
    if (notifyError) {
      console.error('❌ Error sending family notification:', notifyError);
    } else {
      console.log('✅ Successfully sent family notification for child:', childId);
    }
  } catch (error) {
    console.error('❌ Exception in notifyFamily:', error);
  }
}

async function callClaudeAPI(message: string): Promise<string | null> {
  try {
    console.log('🤖 Calling Claude API with message length:', message.length);
    
    if (!anthropicApiKey) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return null;
    }
    
    console.log('📡 Making API request to Claude...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: SAFETY_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: message }
        ],
      }),
    });

    console.log('📡 Claude API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Claude API response received successfully');
    
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    } else {
      console.error('❌ Unexpected Claude API response format:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception calling Claude API:', error);
    return null;
  }
}

serve(async (req) => {
  console.log('🚀 Kaka chat function started');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Processing request...');
    
    const requestBody = await req.json();
    const { message, childId } = requestBody;
    
    console.log('📊 Request details:', {
      messageLength: message?.length || 0,
      childId: childId || 'not provided',
      hasAnthropicKey: !!anthropicApiKey
    });

    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message provided');
      throw new Error('Message is required and must be a string');
    }

    console.log('🔍 Checking for inappropriate content...');
    
    // Check for inappropriate content
    if (containsInappropriateContent(message)) {
      console.log('⚠️ Inappropriate content detected, using safe response');
      
      const safeResponse = generateSafeResponse();
      
      if (childId) {
        await logConversation(childId, message, 'child', 30, false);
        await logConversation(childId, safeResponse, 'kaka', 100, true, 'Inappropriate content detected');
        await notifyFamily(childId, `Pesan anak mengandung konten yang perlu diperhatikan: "${message.substring(0, 100)}..."`, 'medium');
      }
      
      return new Response(JSON.stringify({ 
        response: safeResponse,
        filtered: true,
        safetyScore: 30
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Content passed safety check');
    
    // Log user message
    if (childId) {
      await logConversation(childId, message, 'child', 100, false);
    }
    
    // Check for fallback responses first
    console.log('🔍 Checking for fallback responses...');
    const fallbackResponse = getFallbackResponse(message);
    
    if (fallbackResponse) {
      console.log('✅ Using fallback response');
      
      if (childId) {
        await logConversation(childId, fallbackResponse, 'kaka', 100, false);
      }
      
      return new Response(JSON.stringify({ 
        response: fallbackResponse,
        filtered: false,
        safetyScore: 100,
        source: 'fallback'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try Claude API
    console.log('🤖 Attempting Claude API call...');
    const aiResponse = await callClaudeAPI(message);
    
    if (aiResponse) {
      console.log('✅ Claude API succeeded');
      
      // Check AI response for safety
      if (containsInappropriateContent(aiResponse)) {
        console.log('⚠️ AI response filtered for safety');
        const safeResponse = generateSafeResponse();
        
        if (childId) {
          await logConversation(childId, safeResponse, 'kaka', 100, true, 'AI response filtered for safety');
        }
        
        return new Response(JSON.stringify({ 
          response: safeResponse,
          filtered: true,
          safetyScore: 100
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (childId) {
        await logConversation(childId, aiResponse, 'kaka', 100, false);
      }
      
      return new Response(JSON.stringify({ 
        response: aiResponse,
        filtered: false,
        safetyScore: 100,
        source: 'claude'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback when API fails
    console.log('⚠️ Claude API failed, using emergency fallback');
    const emergencyResponse = 'Maaf, Kaka sedang sedikit bingung. Tapi Kaka tetap di sini untuk membantumu! Coba tanya yang lain ya! 😊✨';
    
    if (childId) {
      await logConversation(childId, emergencyResponse, 'kaka', 100, false);
    }
    
    return new Response(JSON.stringify({ 
      response: emergencyResponse,
      filtered: false,
      safetyScore: 100,
      source: 'emergency_fallback'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in kaka-chat function:', error);
    
    const errorResponse = 'Maaf, Kaka sedang istirahat sebentar. Coba lagi nanti ya! 😊';
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      response: errorResponse,
      source: 'error_fallback'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});