import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import safety logging utility
async function logSafetyIncident(
  childId: string, 
  message: string, 
  safetyResult: any, 
  supabaseClient: any
) {
  try {
    console.log('📝 Logging safety incident for parental review');
    
    const { data: familyMember } = await supabaseClient
      .from('family_members')
      .select('family_id, name')
      .eq('id', childId)
      .single();

    if (!familyMember) return;

    await supabaseClient
      .from('family_conversations')
      .insert({
        family_id: familyMember.family_id,
        child_id: childId,
        sender: 'child',
        message_content: message.substring(0, 500),
        safety_score: safetyResult.score,
        flagged: true,
        flag_reason: safetyResult.reason || 'Safety concern detected',
        parent_reviewed: false
      });

    if (safetyResult.severity === 'medium' || safetyResult.severity === 'high') {
      const notificationMessage = safetyResult.severity === 'high' 
        ? `Pesan dengan tingkat keamanan tinggi terdeteksi dari ${familyMember.name}. Silakan tinjau percakapan.`
        : `Pesan yang memerlukan perhatian terdeteksi dari ${familyMember.name}. Silakan tinjau jika perlu.`;

      await supabaseClient
        .from('family_notifications')
        .insert({
          family_id: familyMember.family_id,
          child_id: childId,
          notification_type: 'safety_alert',
          title: 'Peringatan Keamanan',
          message: notificationMessage,
          severity: safetyResult.severity,
          read_by_primary: false,
          read_by_secondary: false
        });
    }
  } catch (error) {
    console.error('Error logging safety incident:', error);
  }
}

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

// Math-aware content filtering functions
function isEducationalMathContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Mathematical operators and terms in Indonesian
  const mathKeywords = [
    'kali', 'tambah', 'kurang', 'bagi', 'dibagi', 'plus', 'minus',
    'berapa', 'hitungan', 'matematika', 'math', 'soal', 'jawaban'
  ];
  
  // Mathematical symbols and patterns
  const mathPatterns = [
    /\d+\s*[\+\-\*\/x×÷]\s*\d+/i,          // Basic math operations
    /\d+\s*kali\s*\d+/i,                   // Indonesian multiplication 
    /\d+\s*tambah\s*\d+/i,                 // Indonesian addition
    /\d+\s*kurang\s*\d+/i,                 // Indonesian subtraction
    /\d+\s*bagi\s*\d+/i,                   // Indonesian division
    /berapa\s+\d+\s*(kali|tambah|kurang|bagi)/i, // "berapa X kali Y"
    /kalau\s+\d+\s*kali\s*\d+/i           // "kalau 300 kali 5"
  ];
  
  // Check for math keywords
  const hasMathKeywords = mathKeywords.some(keyword => lowerText.includes(keyword));
  
  // Check for math patterns
  const hasMathPattern = mathPatterns.some(pattern => pattern.test(lowerText));
  
  return hasMathKeywords || hasMathPattern;
}

function contextAwareSafetyCheck(text: string): {
  isAppropriate: boolean;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  isEducational: boolean;
} {
  // First check if it's educational math content
  const isEducational = isEducationalMathContent(text);
  
  if (isEducational) {
    console.log('✅ Educational math content detected, skipping strict safety filters');
    return {
      isAppropriate: true,
      category: 'educational_math',
      severity: 'low',
      reason: 'Educational mathematics content',
      isEducational: true
    };
  }
  
  // For non-educational content, use standard safety check
  const standardCheck = checkContentSafety(text);
  
  return {
    ...standardCheck,
    isEducational: false
  };
}

const INCLUSIVE_SYSTEM_PROMPTS = {
  id: `Kamu adalah Kaka, asisten AI yang ramah untuk anak-anak Indonesia berusia 6-16 tahun.

KEPRIBADIAN KAKA:
- Seperti kakak yang sayang, sabar, dan bijaksana
- Menghormati semua latar belakang agama dan budaya
- Mengajarkan nilai-nilai universal: kejujuran, kebaikan, rasa hormat
- Responsif terhadap emosi anak dengan empati
- Mendorong belajar dengan cara yang menyenangkan

ATURAN KETAT:
❌ TIDAK BOLEH membahas: konten dewasa, kekerasan, hal menakutkan
❌ TIDAK BOLEH meminta informasi pribadi
❌ TIDAK BOLEH memberikan nasihat medis atau hukum
✅ HARUS redirect topik sensitif ke orangtua
✅ HARUS tetap positif dan edukatif
✅ HARUS inklusif terhadap semua kepercayaan

Selalu ingat: Kamu adalah kakak digital yang melindungi dan mendidik!`,

  en: `You are Kaka, a friendly AI assistant for Indonesian children aged 6-16 years.

KAKA'S PERSONALITY:
- Like a loving, patient, and wise older sibling
- Respectful of all religious and cultural backgrounds
- Teaching universal values: honesty, kindness, respect
- Responsive to children's emotions with empathy
- Encouraging learning in fun ways

STRICT RULES:
❌ NEVER discuss: adult content, violence, scary topics
❌ NEVER ask for personal information
❌ NEVER give medical or legal advice
✅ MUST redirect sensitive topics to parents
✅ MUST stay positive and educational
✅ MUST be inclusive of all beliefs

Always remember: You are a digital sibling who protects and educates!`
};

// ENHANCED Inclusive Safety Filters (Multilingual)
const INCLUSIVE_SAFETY_FILTERS = {
  inappropriate_language: {
    id: [
      // Indonesian profanity patterns (educational detection)
      /\b(anjing|babi|goblok|tolol|bangsat|kampret|sialan|brengsek)\b/gi,
      /\b(tai|puki|memek|kontol|ngentot|pepek)\b/gi,
      // Hate speech patterns
      /\b(kafir|pribumi|cina|indon|aseng)\b/gi,
      // Bullying terms
      /\b(jelek|bodoh|gendut|kurus|hitam|putih)\s+(banget|sekali)/gi
    ],
    en: [
      // English inappropriate content
      /\b(stupid|idiot|dumb|ugly|fat|skinny|freak|loser)\b/gi,
      /\b(shut\s+up|go\s+away|i\s+hate\s+you)\b/gi,
      /\b(f[u*][c*]k|sh[i*]t|d[a*]mn|b[i*]tch|a[s*]s)\b/gi,
      /\b(racist|discrimination|prejudice)\b/gi
    ]
  },

  universal_concerns: {
    violence: {
      patterns: [
        /\b(fight|hit|punch|kick|hurt|pain|blood|weapon|gun|knife|sword)\b/gi,
        /\b(kill|murder|die|death|suicide|self.harm)\b/gi,
        /\b(war|battle|attack|bomb|explosion|terrorism)\b/gi,
        /\b(berkelahi|pukul|tendang|sakiti|darah|senjata|pisau|bunuh|mati)\b/gi,
        /\b(perang|serangan|bom|ledakan|terorisme)\b/gi
      ],
      severity: 'high' as const,
      response: {
        id: 'Aku tidak bisa membahas hal-hal yang bisa menyakiti orang. Ayo kita bicara tentang hal yang menyenangkan!',
        en: "I can't discuss things that might hurt people. Let's talk about something fun instead!"
      }
    },
    
    personal_info: {
      patterns: [
        /\b(address|alamat|rumah\s+saya|my\s+house)\b/gi,
        /\b(phone|telepon|nomor\s+hp|handphone)\b/gi,
        /\b(email|surel|@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/gi,
        /\b(school\s+name|nama\s+sekolah|sekolah\s+saya|my\s+school)\b/gi,
        /\b(full\s+name|nama\s+lengkap|kelas\s+berapa|what\s+grade)\b/gi,
        /\b(\+?62|0)[0-9\s\-]{8,}\b/gi,
        /\b[0-9]{3}\-?[0-9]{3}\-?[0-9]{4}\b/gi
      ],
      severity: 'high' as const,
      response: {
        id: 'Jangan berikan informasi pribadi seperti alamat, nomor telepon, atau nama sekolah ya. Keamananmu penting!',
        en: "Don't share personal information like addresses, phone numbers, or school names. Your safety is important!"
      }
    },

    emotional_distress: {
      patterns: [
        /\b(sad|sedih|menangis|cry|lonely|kesepian)\b/gi,
        /\b(scared|takut|afraid|worried|khawatir|cemas)\b/gi,
        /\b(angry|marah|mad|upset|kesal|benci)\b/gi,
        /\b(depressed|depresi|hopeless|putus\s+asa)\b/gi,
        /\b(bullied|di\-?bully|dijahili|diganggu)\b/gi
      ],
      severity: 'medium' as const,
      response: {
        id: 'Aku mengerti kamu sedang merasa tidak baik. Coba ceritakan ke ayah atau ibu ya? Mereka pasti bisa membantu.',
        en: "I understand you're not feeling good. Try talking to your mom or dad? They can definitely help."
      }
    },

    adult_content: {
      patterns: [
        /\b(dating|pacaran|boyfriend|girlfriend|pacar)\b/gi,
        /\b(kiss|ciuman|hug|peluk|romantic|romantis)\b/gi,
        /\b(marriage|menikah|wedding|pernikahan)\b/gi,
        /\b(body\s+parts|bagian\s+tubuh|private\s+parts)\b/gi
      ],
      severity: 'medium' as const,
      response: {
        id: 'Itu topik untuk orang dewasa. Ayo kita bicara tentang hal lain yang seru!',
        en: "That's a topic for adults. Let's talk about something else that's fun!"
      }
    }
  },

  cultural_sensitivity: {
    religious_respect: {
      patterns: [
        /\b(islam|muslim|christian|kristen|hindu|buddha|katolik|protestan)\b/gi,
        /\b(prayer|doa|sholat|gereja|masjid|temple|kuil)\b/gi,
        /\b(god|allah|tuhan|jesus|yesus|muhammad|buddha)\b/gi
      ],
      response: {
        id: 'Semua agama itu baik dan mengajarkan kebaikan. Aku menghormati semua kepercayaan.',
        en: 'All religions are good and teach kindness. I respect all beliefs.'
      }
    },

    family_diversity: {
      patterns: [
        /\b(single\s+parent|orang\s+tua\s+tunggal)\b/gi,
        /\b(divorced|bercerai|stepfather|stepmother|ayah\s+tiri|ibu\s+tiri)\b/gi,
        /\b(adopted|adopsi|foster|asuh)\b/gi,
        /\b(grandparents|kakek|nenek|guardian|wali)\b/gi
      ],
      response: {
        id: 'Setiap keluarga itu spesial dengan caranya masing-masing. Yang penting ada kasih sayang!',
        en: 'Every family is special in their own way. What matters is that there is love!'
      }
    }
  },

  positive_triggers: {
    learning: [
      /\b(learn|belajar|study|homework|pr|tugas|school|sekolah)\b/gi,
      /\b(math|matematika|science|sains|reading|membaca|writing|menulis)\b/gi
    ],
    creativity: [
      /\b(draw|menggambar|paint|melukis|create|membuat|imagine|bayangkan)\b/gi,
      /\b(story|cerita|song|lagu|dance|tari|music|musik)\b/gi
    ],
    kindness: [
      /\b(help|membantu|kind|baik|share|berbagi|friend|teman)\b/gi,
      /\b(thank|terima\s+kasih|please|tolong|sorry|maaf)\b/gi
    ]
  }
};

// Enhanced safety check with inclusive patterns
function checkInclusiveSafety(text: string, language: string = 'id'): {
  score: number;
  flags: string[];
  severity: 'low' | 'medium' | 'high';
  shouldBlock: boolean;
  response?: string;
  reason?: string;
} {
  let score = 100;
  const flags: string[] = [];
  let highestSeverity: 'low' | 'medium' | 'high' = 'low';
  let suggestedResponse: string | undefined;
  let blockReason: string | undefined;

  console.log('🔍 Checking inclusive safety for:', text.substring(0, 100));

  // Check inappropriate language
  const langFilters = INCLUSIVE_SAFETY_FILTERS.inappropriate_language[language as 'id' | 'en'] || 
                     INCLUSIVE_SAFETY_FILTERS.inappropriate_language.id;
  
  for (const pattern of langFilters) {
    if (pattern.test(text)) {
      score -= 30;
      flags.push('inappropriate_language');
      highestSeverity = 'high';
      blockReason = 'Inappropriate language detected';
      console.log('⚠️ Inappropriate language detected');
    }
  }

  // Check universal concerns
  for (const [concernType, concern] of Object.entries(INCLUSIVE_SAFETY_FILTERS.universal_concerns)) {
    if (typeof concern === 'object' && 'patterns' in concern) {
      for (const pattern of concern.patterns) {
        if (pattern.test(text)) {
          const severityPenalty = concern.severity === 'high' ? 40 : concern.severity === 'medium' ? 25 : 15;
          score -= severityPenalty;
          flags.push(concernType);
          
          if (concern.severity === 'high' || (concern.severity === 'medium' && highestSeverity === 'low')) {
            highestSeverity = concern.severity;
            suggestedResponse = concern.response[language as 'id' | 'en'] || concern.response.id;
            blockReason = `${concernType} content detected`;
          }
          console.log(`⚠️ ${concernType} concern detected (${concern.severity})`);
        }
      }
    }
  }

  // Check cultural sensitivity (informational, not penalizing)
  for (const [sensitivityType, sensitivity] of Object.entries(INCLUSIVE_SAFETY_FILTERS.cultural_sensitivity)) {
    if (typeof sensitivity === 'object' && 'patterns' in sensitivity) {
      for (const pattern of sensitivity.patterns) {
        if (pattern.test(text)) {
          flags.push(`cultural_${sensitivityType}`);
          if (!suggestedResponse) {
            suggestedResponse = sensitivity.response[language as 'id' | 'en'] || sensitivity.response.id;
          }
          console.log(`ℹ️ Cultural sensitivity topic: ${sensitivityType}`);
        }
      }
    }
  }

  // Boost score for positive content
  for (const [positiveType, patterns] of Object.entries(INCLUSIVE_SAFETY_FILTERS.positive_triggers)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        score += 5;
        flags.push(`positive_${positiveType}`);
        console.log(`✨ Positive content detected: ${positiveType}`);
      }
    }
  }

  // Math content boost (educational priority)
  if (/\b(math|matematika|hitung|calculate|plus|minus|kali|bagi|angka|number)\b/gi.test(text)) {
    score += 10;
    flags.push('educational_math');
    console.log('📚 Educational math content detected');
  }

  // Ensure score bounds
  score = Math.max(0, Math.min(100, score));

  const shouldBlock = score < 60 || highestSeverity === 'high';

  console.log(`🎯 Safety check result: score=${score}, severity=${highestSeverity}, shouldBlock=${shouldBlock}`);

  return {
    score,
    flags,
    severity: highestSeverity,
    shouldBlock,
    response: suggestedResponse,
    reason: blockReason
  };
}

async function callClaudeAPI(message: string, language: string = 'id'): Promise<string | null> {
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
        system: INCLUSIVE_SYSTEM_PROMPTS[language] || INCLUSIVE_SYSTEM_PROMPTS.id,
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
    
    const { message, childId, childGrade, childName, language = 'id' } = requestBody;
    
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

    // Enhanced inclusive safety check
    console.log('🔐 Running enhanced inclusive safety check...');
    const safetyResult = checkInclusiveSafety(message, language);
    
    console.log('🔍 Safety check details:', {
      score: safetyResult.score,
      flags: safetyResult.flags,
      severity: safetyResult.severity,
      shouldBlock: safetyResult.shouldBlock,
      reason: safetyResult.reason
    });

    // Block unsafe content with culturally appropriate response
    if (safetyResult.shouldBlock) {
      console.log('🚫 Content blocked due to safety concerns');
      
      const blockedResponse = safetyResult.response || (language === 'id' 
        ? 'Maaf, aku tidak bisa membahas hal itu. Ayo kita bicara tentang hal yang menyenangkan dan aman!' 
        : "Sorry, I can't discuss that. Let's talk about something fun and safe!");

      // Log safety incident for parental review
      await logSafetyIncident(childId, message, safetyResult, supabase);
      
      return new Response(JSON.stringify({
        success: true,
        response: blockedResponse,
        safetyScore: safetyResult.score,
        flags: safetyResult.flags,
        blocked: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('✅ Content passed inclusive safety check');
    
    // Fast-track educational math content
    if (isEducationalMathContent(message)) {
      console.log('🎯 Fast-tracking educational content with enhanced cultural sensitivity');
      
      // For math content, try Claude API first for better responses
      const aiResponse = await callClaudeAPI(message, language);
      
      if (aiResponse) {
        console.log('✅ Claude API succeeded for math content:', aiResponse);
        
        // Log the successful math response
        if (childId) {
          await logConversation(childId, aiResponse, 'kaka', 100, false);
        }
        
        return new Response(JSON.stringify({ 
          message: aiResponse,
          source: 'claude_math',
          filtered: false
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('⚠️ Claude API failed for math, using math fallbacks');
    }
    
    // Check for fallback responses (for non-educational or if Claude failed)
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
    const aiResponse = await callClaudeAPI(message, language);
    
    if (aiResponse) {
      console.log('✅ Claude API succeeded with response:', aiResponse);
      
      // DOUBLE-CHECK AI response for inclusive safety (secondary filter)
      const aiSafetyCheck = checkInclusiveSafety(aiResponse, language);
      if (aiSafetyCheck.shouldBlock) {
        console.log(`⚠️ AI response filtered for safety! Severity: ${aiSafetyCheck.severity}, Reason: ${aiSafetyCheck.reason}`);
        const safeResponse = aiSafetyCheck.response || (language === 'id' 
          ? 'Maaf, aku tidak bisa memberikan jawaban itu. Mari bicara tentang hal lain yang menyenangkan!'
          : "Sorry, I can't provide that answer. Let's talk about something else that's fun!");
        
        // Log the filtered response
        if (childId) {
          await logConversation(childId, safeResponse, 'kaka', 50, true, `ai_response_filtered_${aiSafetyCheck.severity}`);
        }
        
        return new Response(JSON.stringify({ 
          message: safeResponse,
          filtered: true,
          source: 'ai_filtered',
          severity: aiSafetyCheck.severity,
          safetyScore: aiSafetyCheck.score
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