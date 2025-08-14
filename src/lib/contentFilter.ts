// Content filtering utilities for frontend
export interface SafetyResult {
  score: number;
  isAppropriate: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  categories: string[];
}

// Comprehensive Indonesian profanity and inappropriate content patterns
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

// Age-inappropriate topics by category
const TOPIC_CATEGORIES = {
  violence: /kekerasan|violence|darah|blood|bunuh|kill|mati|death|berkelahi|fight|senjata|weapon/i,
  sexual: /seks|sex|telanjang|naked|ciuman|kiss|pacaran|dating|porn|porno/i,
  substances: /narkoba|drugs|mabuk|drunk|rokok|cigarette|alkohol|alcohol/i,
  personal_info: /alamat|address|nomor hp|phone|password|email|sekolah|school/i,
  profanity: /anjing|bangsat|babi|kampret|fuck|shit|damn|bitch/i,
  emotional_distress: /sedih banget|takut|scared|marah|angry|depresi|depression/i,
  adult_topics: /dewasa|adult|hamil|pregnant|judi|gambling|18\+/i,
  inappropriate_social: /benci|hate|bodoh|stupid|jelek|ugly|gendut|fat/i
};

// Enhanced safety check with comprehensive Indonesian filtering
export function quickSafetyCheck(text: string): SafetyResult {
  let score = 100;
  const reasons: string[] = [];
  const categories: string[] = [];
  
  // Check against Indonesian profanity patterns
  for (const pattern of INDONESIAN_PROFANITY) {
    if (pattern.test(text)) {
      score -= 30;
      reasons.push('Inappropriate language detected');
      categories.push('profanity');
      break; // Stop after first match to avoid over-penalizing
    }
  }
  
  // Check against topic categories
  for (const [category, pattern] of Object.entries(TOPIC_CATEGORIES)) {
    if (pattern.test(text)) {
      score -= 25;
      reasons.push(`${category.replace('_', ' ')} content detected`);
      categories.push(category);
    }
  }
  
  // Check message length (very long messages might be concerning)
  if (text.length > 500) {
    score -= 10;
    reasons.push('Message too long');
    categories.push('length');
  }
  
  // Check for excessive caps (might indicate shouting/anger)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5 && text.length > 10) {
    score -= 15;
    reasons.push('Excessive capitalization detected');
    categories.push('caps');
  }
  
  // Check for potential personal information sharing
  const personalInfoPatterns = [
    /\d{10,}/,  // Phone numbers
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,  // Email
    /jl\.|jalan|gang|rt|rw|kelurahan|kecamatan/i  // Address indicators
  ];
  
  for (const pattern of personalInfoPatterns) {
    if (pattern.test(text)) {
      score -= 40;
      reasons.push('Personal information detected');
      categories.push('personal_info');
      break;
    }
  }
  
  const isAppropriate = score >= 70;
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (score < 20) severity = 'critical';
  else if (score < 40) severity = 'high';
  else if (score < 70) severity = 'medium';
  
  return {
    score,
    isAppropriate,
    reasons,
    severity,
    categories
  };
}

// Advanced safety analysis for edge function use
export function comprehensiveSafetyAnalysis(text: string): {
  score: number;
  blocked: boolean;
  categories: string[];
  escalationLevel: 'none' | 'notify' | 'block' | 'urgent';
  reasons: string[];
} {
  const result = quickSafetyCheck(text);
  
  let escalationLevel: 'none' | 'notify' | 'block' | 'urgent' = 'none';
  
  // Determine escalation level based on categories and severity
  if (result.categories.includes('violence') || result.categories.includes('emotional_distress')) {
    escalationLevel = 'urgent';
  } else if (result.categories.includes('sexual') || result.categories.includes('personal_info')) {
    escalationLevel = 'block';
  } else if (result.categories.includes('profanity') || result.categories.includes('adult_topics')) {
    escalationLevel = 'notify';
  }
  
  return {
    score: result.score,
    blocked: !result.isAppropriate,
    categories: result.categories,
    escalationLevel,
    reasons: result.reasons
  };
}

export function shouldWarnUser(text: string): boolean {
  const result = quickSafetyCheck(text);
  return !result.isAppropriate;
}

export function getSafetyWarningMessage(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  const messages = {
    low: 'Pesan ini mungkin tidak cocok untuk anak-anak. Pastikan pesanmu baik dan sopan ya! 😊',
    medium: 'Pesan ini mengandung konten yang mungkin tidak pantas. Coba gunakan kata-kata yang lebih baik! 🌟',
    high: 'Pesan ini tidak pantas untuk anak-anak. Mari kita bicara tentang hal-hal yang positif! ✨',
    critical: 'Pesan ini sangat tidak pantas. Kaka hanya mau membahas hal-hal yang aman dan menyenangkan! 🛡️'
  };
  
  return messages[severity];
}

// Format safety guidelines for display
export const SAFETY_GUIDELINES = {
  title: '🛡️ Panduan Keamanan Kaka',
  rules: [
    '✅ Bicara tentang pelajaran, hobi, dan hal-hal menyenangkan',
    '✅ Bertanya tentang sains, alam, dan pengetahuan umum',
    '✅ Ceritakan tentang permainan dan aktivitas kreatif',
    '❌ Jangan berbagi informasi pribadi (nama lengkap, alamat, nomor HP)',
    '❌ Hindari topik yang membuat sedih atau takut',
    '❌ Tidak membahas hal-hal yang tidak pantas untuk anak'
  ],
  footer: 'Kaka selalu menjaga keamanan dan kenyamanan dalam setiap percakapan! 🌟'
};