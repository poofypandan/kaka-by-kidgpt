import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive Indonesian safety filtering patterns
const INDONESIAN_PROFANITY = [
  // Explicit profanity
  /\b(anjing|bangsat|babi|kampret|kontol|memek|ngentot|peler|tai|tetek|titit|penis|vagina)\b/i,
  /\b(brengsek|bajingan|keparat|sialan|bangke|jelek amat|tolol|bodoh banget|goblok)\b/i,
  /\b(fuck|shit|damn|bitch|asshole|crap|wtf|omg|goddamn)\b/i,
  
  // Sexual content
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
  /\b(marah|angry|benci|hate|kesal|annoyed|stress|tertekan|depressed)\b/i,
];

// Categorized inappropriate patterns for better classification
const CONTENT_CATEGORIES = {
  violence: /kekerasan|violence|darah|blood|bunuh|kill|mati|death|berkelahi|fight|senjata|weapon/i,
  sexual: /seks|sex|telanjang|naked|ciuman|kiss|pacaran|dating|porn|porno/i,
  substances: /narkoba|drugs|mabuk|drunk|rokok|cigarette|alkohol|alcohol/i,
  personal_info: /alamat|address|nomor hp|phone|password|email|sekolah|school/i,
  profanity: /anjing|bangsat|babi|kampret|fuck|shit|damn|bitch/i,
  emotional_distress: /sedih banget|takut|scared|marah|angry|depresi|depression/i,
  adult_topics: /dewasa|adult|hamil|pregnant|judi|gambling|18\+/i,
  harmful_advice: /cara bunuh|how to kill|cara menyakiti|how to hurt|cara mencuri|how to steal/i
};

const SAFETY_SYSTEM_PROMPT = `You are Kaka, a friendly AI assistant for Indonesian children.
CRITICAL RULES:
- Always respond in simple Bahasa Indonesia
- Never discuss adult content, violence, or inappropriate topics
- Promote positive values and Indonesian culture
- Encourage children to talk to parents about serious issues
- If unsure, always redirect to educational topics

Keep responses short, cheerful, and age-appropriate. Use simple words and encourage learning. 🌟`;

// Enhanced comprehensive safety analysis
function calculateSafetyScore(text: string): { 
  score: number; 
  reasons: string[]; 
  categories: string[];
  escalationLevel: 'none' | 'notify' | 'block' | 'urgent';
} {
  let score = 100;
  const reasons: string[] = [];
  const categories: string[] = [];
  
  // Check against comprehensive Indonesian profanity
  for (const pattern of INDONESIAN_PROFANITY) {
    if (pattern.test(text)) {
      score -= 40;
      reasons.push('Inappropriate language detected');
      categories.push('profanity');
      break; // Stop after first match to avoid over-penalizing
    }
  }
  
  // Check against categorized content
  for (const [category, pattern] of Object.entries(CONTENT_CATEGORIES)) {
    if (pattern.test(text)) {
      let penalty = 30;
      
      // Higher penalties for more serious categories
      if (category === 'violence' || category === 'emotional_distress') {
        penalty = 50;
      } else if (category === 'sexual' || category === 'harmful_advice') {
        penalty = 45;
      } else if (category === 'personal_info') {
        penalty = 40;
      }
      
      score -= penalty;
      reasons.push(`${category.replace('_', ' ')} content detected`);
      categories.push(category);
    }
  }
  
  // Check for patterns suggesting harm or danger
  const highRiskPatterns = [
    /cara bunuh|how to kill|cara menyakiti|how to hurt/i,
    /bunuh diri|suicide|mati aja|want to die/i,
    /alamat lengkap|full address|nomor hp|phone number/i,
    /password|pin|atm|kartu kredit|credit card/i
  ];
  
  for (const pattern of highRiskPatterns) {
    if (pattern.test(text)) {
      score -= 60;
      reasons.push('High-risk content detected');
      categories.push('high_risk');
    }
  }
  
  // Determine escalation level
  let escalationLevel: 'none' | 'notify' | 'block' | 'urgent' = 'none';
  
  if (categories.includes('violence') || categories.includes('emotional_distress') || categories.includes('high_risk')) {
    escalationLevel = 'urgent';
  } else if (categories.includes('sexual') || categories.includes('harmful_advice') || score < 30) {
    escalationLevel = 'block';
  } else if (categories.includes('profanity') || categories.includes('personal_info') || score < 60) {
    escalationLevel = 'notify';
  }
  
  return { 
    score: Math.max(0, score), 
    reasons,
    categories,
    escalationLevel
  };
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

// Log conversation to family_conversations table (using existing schema)
async function logConversation(childId: string | null, content: string, sender: 'user' | 'assistant', safetyScore: number, filtered: boolean, filterReason?: string, familyId?: string) {
  try {
    if (!childId) {
      console.log('No childId provided for logging');
      return;
    }
    
    // Get family info if not provided
    let actualFamilyId = familyId;
    if (!familyId) {
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('id', childId)
        .maybeSingle();
      
      if (familyMember) {
        actualFamilyId = familyMember.family_id;
      } else {
        console.log('Could not find family for child:', childId);
        return;
      }
    }
    
    const { error } = await supabase
      .from('family_conversations')
      .insert({
        family_id: actualFamilyId,
        child_id: childId,
        message_content: content,
        sender: sender === 'user' ? 'child' : 'kaka',
        safety_score: safetyScore,
        flagged: filtered,
        flag_reason: filterReason
      });
      
    if (error) {
      console.error('Error logging conversation:', error);
    } else {
      console.log('Successfully logged conversation for child:', childId);
    }
  } catch (error) {
    console.error('Error in logConversation:', error);
  }
}

// Send notification to family (using existing schema)
async function notifyFamily(childId: string, message: string, severity: 'low' | 'medium' | 'high') {
  try {
    // Get family information
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id, name')
      .eq('id', childId)
      .maybeSingle();
      
    if (!familyMember) {
      console.log('Could not find family member for child:', childId);
      return;
    }
    
    const { error } = await supabase
      .from('family_notifications')
      .insert({
        family_id: familyMember.family_id,
        child_id: childId,
        notification_type: 'content_filter',
        title: `Peringatan Konten - ${familyMember.name}`,
        message,
        severity
      });
      
    if (error) {
      console.error('Error sending family notification:', error);
    } else {
      console.log('Successfully sent family notification for child:', childId);
    }
  } catch (error) {
    console.error('Error in notifyFamily:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { message, childId } = await req.json();

    if (!message || typeof message !== 'string') {
      throw new Error('Message is required');
    }

    console.log('Processing message for child:', childId, 'Message:', message);

    // Enhanced safety analysis with escalation
    const safetyAnalysis = calculateSafetyScore(message);
    const { score: safetyScore, reasons, categories, escalationLevel } = safetyAnalysis;
    
    // Log user message with detailed safety data
    await logConversation(childId, message, 'user', safetyScore, false);
    
    // Pre-message safety check with escalation handling
    if (containsInappropriateContent(message)) {
      console.log('Inappropriate content detected:', message, 'Categories:', categories, 'Escalation:', escalationLevel);
      
      const safeResponse = generateSafeResponse(reasons.join(', '));
      
      // Log filtered response
      await logConversation(childId, safeResponse, 'assistant', 100, true, reasons.join(', '));
      
      // Handle escalation based on severity
      if (childId) {
        if (escalationLevel === 'urgent') {
          await notifyFamily(childId, `🚨 URGENT: Pesan anak mengandung konten berbahaya yang memerlukan perhatian segera: "${message.substring(0, 100)}..."`, 'high');
        } else if (escalationLevel === 'block') {
          await notifyFamily(childId, `⚠️ Pesan anak diblokir karena konten tidak pantas: "${message.substring(0, 100)}..."`, 'high');
        } else if (escalationLevel === 'notify') {
          await notifyFamily(childId, `📝 Pesan anak mengandung konten yang perlu diperhatikan: "${message.substring(0, 100)}..."`, 'medium');
        }
      }
      
      return new Response(JSON.stringify({ 
        response: safeResponse,
        filtered: true,
        safetyScore
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Claude API
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    console.log('Claude API response received:', aiResponse);

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
    
    // Send family notification for borderline content
    if (responseSafetyScore < 80 && responseSafetyScore >= 70 && childId) {
      await notifyFamily(childId, `Percakapan dengan konten yang perlu diperhatian: "${aiResponse}"`, 'medium');
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