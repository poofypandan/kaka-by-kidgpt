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

// Extensive fallback responses for common questions
const FALLBACK_RESPONSES = {
  'berapa 5+5': '5 + 5 = 10! Hebat sekali! Kamu pintar matematika! 🎉',
  'berapa 5 + 5': '5 + 5 = 10! Hebat sekali! Kamu pintar matematika! 🎉',
  'brp 5+5': '5 + 5 = 10! Hebat sekali! Kamu pintar matematika! 🎉',
  '5+5': '5 + 5 = 10! Hebat sekali! Kamu pintar matematika! 🎉',
  'berapa 2+3': '2 + 3 = 5! Bagus banget! 🌟',
  'berapa 10-5': '10 - 5 = 5! Kamu hebat! 👏',
  'berapa 3+4': '3 + 4 = 7! Wah pintar! 🎯',
  'berapa 8-3': '8 - 3 = 5! Mantap! 💪',
  'berapa 1+1': '1 + 1 = 2! Keren! 🌟',
  'berapa 6+4': '6 + 4 = 10! Pintar banget! 🎉',
  'halo': 'Halo! Aku Kaka, teman belajar yang seru! Ada yang bisa Kaka bantu hari ini? 🐨✨',
  'hello': 'Halo! Aku Kaka, teman belajar yang seru! Ada yang bisa Kaka bantu hari ini? 🐨✨',
  'hai': 'Hai! Aku Kaka! Senang bertemu denganmu! Mau belajar apa hari ini? 🌟',
  'apa kabar': 'Kaka baik-baik saja! Terima kasih sudah bertanya. Kamu bagaimana? Mau belajar hal seru apa nih? 😊',
  'siapa kamu': 'Aku Kaka! Aku adalah teman belajar yang akan membantu kamu belajar dengan cara yang menyenangkan! 🐨📚',
  'makasih': 'Sama-sama! Kaka senang bisa membantu! Ada lagi yang mau ditanyakan? 😊✨',
  'terima kasih': 'Sama-sama! Kaka senang bisa membantu! Ada lagi yang mau ditanyakan? 😊✨',
  'selamat pagi': 'Selamat pagi! Kaka senang bertemu denganmu! Siap belajar hal seru hari ini? 🌅✨',
  'selamat siang': 'Selamat siang! Semoga harimu menyenangkan! Ada yang mau dipelajari? 🌞📚',
  'selamat malam': 'Selamat malam! Wah, masih semangat belajar ya? Bagus sekali! 🌙⭐',
  'bismillah': 'Bismillahirrahmanirrahim! Semoga Allah memudahkan belajar kita hari ini! 🤲✨',
  'assalamualaikum': 'Waalaikumsalam warahmatullahi wabarakatuh! Selamat datang! 🤲😊'
};

// Multiple emergency responses when all else fails
const EMERGENCY_RESPONSES = [
  "Kaka di sini untuk membantu! Coba tanya hal lain ya! 🌟",
  "Wah, itu pertanyaan yang menarik! Aku bisa ceritakan hal seru lainnya! 😊",
  "Kaka senang ngobrol sama kamu! Ada yang lain yang mau ditanyakan? ✨",
  "Ayo kita bicara tentang hal yang kamu suka! Cerita dong! 🎨",
  "Kaka punya banyak cerita seru! Mau dengar tentang apa? 🦋",
  "Hmm, sepertinya Kaka sedang bingung sebentar. Coba tanya yang lain ya! 🐨",
  "Kaka lagi mikir nih! Mau coba tanya hal lain yang menarik? 🤔✨",
  "Wah, Kaka butuh bantuan untuk yang ini. Mau bicara tentang apa lagi? 😊"
];

// COMPREHENSIVE Indonesian safety filtering patterns - CRITICAL FOR CHILD SAFETY
const INAPPROPRIATE_PATTERNS = [
  // Explicit profanity
  /\b(anjing|bangsat|babi|kampret|kontol|memek|ngentot|peler|tai|tetek|titit|penis|vagina)\b/i,
  /\b(brengsek|bajingan|keparat|sialan|bangke|jelek amat|tolol|bodoh banget|goblok)\b/i,
  /\b(fuck|shit|damn|bitch|asshole|crap|wtf|omg|goddamn)\b/i,
  
  // Sexual content - COMPLETELY BLOCKED
  /\b(seks|sex|telanjang|naked|bugil|ml|making love|bercinta|pacaran|pacar|ciuman|kiss)\b/i,
  /\b(porn|porno|xxx|masturbasi|onani|ngocok|colmek|oral|anal)\b/i,
  
  // Violence and harm
  /\b(bunuh|kill|mati|death|berkelahi|fight|pukul|hit|tendang|kick|tusuk|stab)\b/i,
  /\b(darah|blood|luka|wound|sakit|hurt|bahaya|dangerous|racun|poison)\b/i,
  /\b(senjata|weapon|pistol|gun|pisau|knife|bom|bomb|ledak|explode)\b/i,
  
  // Substances and illegal activities
  /\b(narkoba|drugs|ganja|weed|marijuana|kokain|cocaine|heroin|ekstasi|ecstasy)\b/i,
  /\b(mabuk|drunk|minum|alkohol|alcohol|bir|beer|wine|vodka|whiskey)\b/i,
  /\b(rokok|cigarette|ngerokok|smoking|vape|vaping|tembakau|tobacco)\b/i,
  
  // Adult topics
  /\b(hamil|pregnant|melahirkan|birth|menstruasi|period|haid|payudara|breast)\b/i,
  /\b(dewasa|adult|18\+|mature|gambling|judi|taruhan|bet)\b/i,
  
  // Personal information risks
  /\b(alamat|address|rumah|home|sekolah|school|kelas|class|guru|teacher)\b/i,
  /\b(nomor hp|phone|telepon|wa|whatsapp|ig|instagram|fb|facebook)\b/i,
  /\b(email|password|pin|atm|rekening|account|uang|money)\b/i,
  
  // Emotional distress
  /\b(sedih banget|very sad|depresi|depression|bunuh diri|suicide|mati aja|want to die)\b/i,
  /\b(takut|scared|nightmare|mimpi buruk|hantu|ghost|setan|devil)\b/i,
];

const SAFETY_SYSTEM_PROMPT = `You are Kaka, a friendly AI assistant for Indonesian children aged 6-12.

CRITICAL RULES:
- Always respond in simple, warm Bahasa Indonesia
- Never discuss adult content, violence, or inappropriate topics  
- Promote positive values and Indonesian culture
- Encourage children to talk to parents about serious issues
- Keep responses short, cheerful, and age-appropriate (max 50 words)
- Use simple words and encourage learning
- Add emoji to make responses fun: 🌟📚🎉😊🐨✨
- If asked about math, solve it enthusiastically
- Encourage Islamic values when appropriate

Examples:
- Math: "Wah, hebat! 2 + 2 = 4! Kamu pintar sekali! 🎉"
- Greeting: "Halo! Aku Kaka! Senang bertemu denganmu! 🐨✨"
- Learning: "Ayo kita belajar hal seru! Kamu mau tahu tentang apa? 📚🌟"

Keep responses under 50 words and always encouraging! 🌟`;

// COMPREHENSIVE safety check with detailed categorization
function checkContentSafety(text: string): {
  isAppropriate: boolean;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
} {
  const lowerText = text.toLowerCase();
  
  // Check for sexual content (CRITICAL)
  if (/\b(seks|sex|telanjang|naked|bugil|porn|porno|xxx|masturbasi|onani|ciuman|kiss|pacaran)\b/i.test(lowerText)) {
    return {
      isAppropriate: false,
      category: 'sexual_content',
      severity: 'critical',
      reason: 'Sexual content detected'
    };
  }
  
  // Check for violence (HIGH)
  if (/\b(bunuh|kill|mati|death|berkelahi|fight|pukul|hit|darah|blood|senjata|weapon)\b/i.test(lowerText)) {
    return {
      isAppropriate: false,
      category: 'violence',
      severity: 'high',
      reason: 'Violence content detected'
    };
  }
  
  // Check for substances (HIGH)
  if (/\b(narkoba|drugs|mabuk|drunk|alkohol|alcohol|rokok|cigarette)\b/i.test(lowerText)) {
    return {
      isAppropriate: false,
      category: 'substances',
      severity: 'high',
      reason: 'Substance abuse content detected'
    };
  }
  
  // Check for profanity (MEDIUM)
  if (/\b(anjing|bangsat|babi|kampret|kontol|memek|ngentot|fuck|shit|damn|bitch)\b/i.test(lowerText)) {
    return {
      isAppropriate: false,
      category: 'profanity',
      severity: 'medium',
      reason: 'Inappropriate language detected'
    };
  }
  
  // Check for personal info (HIGH)
  if (/\b(alamat|address|nomor hp|phone|password|email|sekolah|school)\b/i.test(lowerText)) {
    return {
      isAppropriate: false,
      category: 'personal_info',
      severity: 'high',
      reason: 'Personal information sharing detected'
    };
  }
  
  return {
    isAppropriate: true,
    category: 'safe',
    severity: 'low',
    reason: 'Content is appropriate'
  };
}

// Legacy function for backwards compatibility
function containsInappropriateContent(text: string): boolean {
  return !checkContentSafety(text).isAppropriate;
}

function getFallbackResponse(message: string): string | null {
  const cleanMessage = message.toLowerCase().trim().replace(/[?!.]/g, '');
  
  console.log('🔍 Checking fallback for message:', cleanMessage);
  
  // Check exact matches first
  if (FALLBACK_RESPONSES[cleanMessage]) {
    console.log('✅ Found exact fallback match for:', cleanMessage);
    return FALLBACK_RESPONSES[cleanMessage];
  }
  
  // Check partial matches for math questions
  for (const key in FALLBACK_RESPONSES) {
    if (cleanMessage.includes(key) || key.includes(cleanMessage)) {
      console.log('✅ Found partial fallback match:', key);
      return FALLBACK_RESPONSES[key];
    }
  }
  
  // Check specific math patterns
  if (cleanMessage.includes('5+5') || cleanMessage.includes('5 + 5') || cleanMessage.includes('5 plus 5')) {
    console.log('✅ Found math fallback match for 5+5');
    return FALLBACK_RESPONSES['berapa 5+5'];
  }
  
  if (cleanMessage.includes('2+3') || cleanMessage.includes('2 + 3')) {
    console.log('✅ Found math fallback match for 2+3');
    return FALLBACK_RESPONSES['berapa 2+3'];
  }
  
  if (cleanMessage.includes('halo') || cleanMessage.includes('hello') || cleanMessage.includes('hai')) {
    console.log('✅ Found greeting fallback match');
    return FALLBACK_RESPONSES['halo'];
  }
  
  console.log('❌ No fallback match found');
  return null;
}

function getEmergencyResponse(): string {
  const response = EMERGENCY_RESPONSES[Math.floor(Math.random() * EMERGENCY_RESPONSES.length)];
  console.log('🚨 Using emergency response:', response);
  return response;
}

// Generate appropriate safety response based on severity
function generateSafeResponse(category: string, severity: string): string {
  console.log(`🛡️ Generating safety response for category: ${category}, severity: ${severity}`);
  
  const responses = {
    sexual_content: [
      "⚠️ Wah, topik ini terlalu dewasa untuk Kaka bahas. Bagaimana kalau kita bicara tentang hal yang lebih seru? Aku bisa ceritakan tentang hewan lucu! 🐨✨",
      "⚠️ Kaka hanya suka membahas hal-hal yang menyenangkan dan aman! Mau dengar cerita petualangan atau bermain game edukatif? 🌟📚"
    ],
    violence: [
      "⚠️ Kaka tidak suka membahas hal-hal yang menyakitkan. Ayo kita bicara tentang hal yang menyenangkan! Mau dengar tentang superhero yang menolong orang? 🦸‍♀️✨",
      "⚠️ Wah, bagaimana kalau kita bicara tentang persahabatan dan kebaikan? Kaka punya cerita seru tentang gotong royong! 🤝🌟"
    ],
    substances: [
      "⚠️ Topik ini tidak cocok untuk anak-anak. Mau Kaka ceritakan tentang makanan sehat yang enak? Atau olahraga yang seru? 🥗⚽",
      "⚠️ Kaka lebih suka membahas hal-hal yang menyehatkan! Mau belajar tentang buah-buahan atau sayuran yang enak? 🍎🥕"
    ],
    profanity: [
      "⚠️ Kata-kata itu kurang sopan ya. Kaka suka anak yang bicara dengan baik dan santun! Mau belajar kata-kata yang indah? 😊🌟",
      "⚠️ Ayo gunakan kata-kata yang baik dan sopan! Kaka bisa ajarin kata-kata yang lebih indah dan bermakna! 💫📚"
    ],
    personal_info: [
      "⚠️ Jangan ceritakan informasi pribadi ya! Untuk keamanan, lebih baik kita bicara tentang hobi atau pelajaran saja! 🛡️✨",
      "⚠️ Demi keamanan, jangan bagikan informasi pribadi. Mau cerita tentang buku atau film favorit saja? 📖🎬"
    ],
    default: [
      "⚠️ Hmm, bagaimana kalau kita bicara tentang hal yang lebih seru? Aku bisa ceritakan tentang hewan lucu atau permainan seru! 🐨✨",
      "⚠️ Wah, aku lebih suka membahas hal-hal yang menyenangkan! Mau dengar cerita tentang petualangan atau belajar hal baru? 🌟📚"
    ]
  };
  
  const categoryResponses = responses[category as keyof typeof responses] || responses.default;
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
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

async function callClaudeAPI(message: string): Promise<string | null> {
  try {
    console.log('🤖 Calling Claude API with message:', message);
    
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
    console.log('🔍 Response data:', JSON.stringify(data));
    
    if (data.content && data.content[0] && data.content[0].text) {
      console.log('✅ Extracted text from Claude response:', data.content[0].text);
      return data.content[0].text;
    } else {
      console.error('❌ Unexpected Claude API response format:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception calling Claude API:', error);
    console.error('❌ Error stack:', error.stack);
    return null;
  }
}

serve(async (req) => {
  console.log('🚀 Kaka chat function started');
  console.log('🔧 Environment check:');
  console.log('  - SUPABASE_URL:', !!supabaseUrl);
  console.log('  - SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.log('  - ANTHROPIC_API_KEY:', !!anthropicApiKey);
  
  if (anthropicApiKey) {
    console.log('  - ANTHROPIC_API_KEY first 10 chars:', anthropicApiKey.substring(0, 10));
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Processing request...');
    
    const requestBody = await req.json();
    console.log('📋 Full request body:', JSON.stringify(requestBody, null, 2));
    
    const { message, childId, childGrade, childName } = requestBody;
    
    console.log('📊 Request details:', {
      messageLength: message?.length || 0,
      messageContent: message,
      childId: childId || 'not provided',
      childGrade: childGrade || 'not provided',
      childName: childName || 'not provided',
      hasAnthropicKey: !!anthropicApiKey
    });

    // Log conversation attempt for child
    if (childId && message) {
      await logConversation(childId, message, 'child', 100, false);
    }

    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message provided');
      const errorResponse = getEmergencyResponse();
      return new Response(JSON.stringify({ 
        message: errorResponse,
        error: 'Message is required and must be a string',
        source: 'validation_error'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔍 CRITICAL SAFETY CHECK: Checking for inappropriate content...');
    
    // COMPREHENSIVE SAFETY CHECK - BLOCKS INAPPROPRIATE CONTENT BEFORE API CALL
    const safetyCheck = checkContentSafety(message);
    
    if (!safetyCheck.isAppropriate) {
      console.log(`🚨 CONTENT BLOCKED! Category: ${safetyCheck.category}, Severity: ${safetyCheck.severity}, Reason: ${safetyCheck.reason}`);
      
      const safeResponse = generateSafeResponse(safetyCheck.category, safetyCheck.severity);
      
      // Log the blocked content and safety response
      if (childId) {
        console.log('📝 Logging safety violation and response');
        await logConversation(childId, message, 'child', 25, true, `${safetyCheck.category}_blocked_${safetyCheck.severity}`);
        await logConversation(childId, safeResponse, 'kaka', 50, true, 'safety_response');
      }
      
      return new Response(JSON.stringify({ 
        message: safeResponse,
        filtered: true,
        source: 'safety_filter',
        category: safetyCheck.category,
        severity: safetyCheck.severity,
        warning: '⚠️ Peringatan Keamanan: Konten tidak pantas untuk anak-anak'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Content passed safety check');
    
    // Check for fallback responses first (highest priority)
    console.log('🔍 Checking for fallback responses...');
    const fallbackResponse = getFallbackResponse(message);
    
    if (fallbackResponse) {
      console.log('✅ Using fallback response:', fallbackResponse);
      
      // Log the fallback response
      if (childId) {
        await logConversation(childId, fallbackResponse, 'kaka', 100, false);
      }
      
      return new Response(JSON.stringify({ 
        message: fallbackResponse,
        source: 'fallback',
        filtered: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try Claude API
    console.log('🤖 Attempting Claude API call...');
    const aiResponse = await callClaudeAPI(message);
    
    if (aiResponse) {
      console.log('✅ Claude API succeeded with response:', aiResponse);
      
      // DOUBLE-CHECK AI response for safety (secondary filter)
      const aiSafetyCheck = checkContentSafety(aiResponse);
      if (!aiSafetyCheck.isAppropriate) {
        console.log(`⚠️ AI response filtered for safety! Category: ${aiSafetyCheck.category}, Severity: ${aiSafetyCheck.severity}`);
        const safeResponse = generateSafeResponse(aiSafetyCheck.category, aiSafetyCheck.severity);
        
        // Log the filtered response
        if (childId) {
          await logConversation(childId, safeResponse, 'kaka', 50, true, `ai_response_filtered_${aiSafetyCheck.category}`);
        }
        
        return new Response(JSON.stringify({ 
          message: safeResponse,
          filtered: true,
          source: 'ai_filtered',
          category: aiSafetyCheck.category,
          severity: aiSafetyCheck.severity
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Log the successful AI response
      if (childId) {
        await logConversation(childId, aiResponse, 'kaka', 100, false);
      }
      
      return new Response(JSON.stringify({ 
        message: aiResponse,
        source: 'claude',
        filtered: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Final fallback when API fails
    console.log('⚠️ Claude API failed, using emergency fallback');
    const emergencyResponse = getEmergencyResponse();
    
    // Log the emergency response
    if (childId) {
      await logConversation(childId, emergencyResponse, 'kaka', 75, false, 'api_failure');
    }
    
    return new Response(JSON.stringify({ 
      message: emergencyResponse,
      source: 'emergency_fallback',
      filtered: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in kaka-chat function:', error);
    console.error('❌ Error stack:', error.stack);
    
    const errorResponse = getEmergencyResponse();
    
    return new Response(JSON.stringify({ 
      message: errorResponse,
      error: 'Internal server error',
      source: 'error_fallback'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});