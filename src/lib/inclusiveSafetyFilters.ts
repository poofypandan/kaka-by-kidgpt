// Inclusive Safety & Content Guidelines (Multilingual)
export const INCLUSIVE_SAFETY_FILTERS = {
  // Language-specific inappropriate content patterns
  inappropriate_language: {
    id: [
      // Indonesian profanity patterns (mild detection)
      /\b(anjing|babi|goblok|tolol|bangsat|kampret|sialan|brengsek)\b/gi,
      /\b(tai|puki|memek|kontol|ngentot|pepek)\b/gi,
      // Hate speech patterns
      /\b(kafir|pribumi|cina|indon|aseng)\b/gi,
      // Bullying terms
      /\b(jelek|bodoh|gendut|kurus|hitam|putih)\s+(banget|sekali)/gi
    ],
    en: [
      // English inappropriate content (mild detection)
      /\b(stupid|idiot|dumb|ugly|fat|skinny|freak|loser)\b/gi,
      /\b(shut\s+up|go\s+away|i\s+hate\s+you)\b/gi,
      // Strong profanity
      /\b(f[u*][c*]k|sh[i*]t|d[a*]mn|b[i*]tch|a[s*]s)\b/gi,
      // Hate speech
      /\b(racist|discrimination|prejudice)\b/gi
    ]
  },

  // Universal safety concerns (cross-cultural)
  universal_concerns: {
    violence: {
      patterns: [
        /\b(fight|hit|punch|kick|hurt|pain|blood|weapon|gun|knife|sword)\b/gi,
        /\b(kill|murder|die|death|suicide|self.harm)\b/gi,
        /\b(war|battle|attack|bomb|explosion|terrorism)\b/gi,
        // Indonesian violence terms
        /\b(berkelahi|pukul|tendang|sakiti|darah|senjata|pisau|bunuh|mati)\b/gi,
        /\b(perang|serangan|bom|ledakan|terorisme)\b/gi
      ],
      severity: 'high',
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
        // Phone number patterns
        /\b(\+?62|0)[0-9\s\-]{8,}\b/gi,
        /\b[0-9]{3}\-?[0-9]{3}\-?[0-9]{4}\b/gi
      ],
      severity: 'high',
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
      severity: 'medium',
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
      severity: 'medium',
      response: {
        id: 'Itu topik untuk orang dewasa. Ayo kita bicara tentang hal lain yang seru!',
        en: "That's a topic for adults. Let's talk about something else that's fun!"
      }
    }
  },

  // Cultural sensitivity guidelines
  cultural_sensitivity: {
    religious_respect: {
      patterns: [
        // Respectful detection of religious discussions
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
    },

    cultural_practices: {
      patterns: [
        /\b(tradition|tradisi|culture|budaya|adat|customs|kebiasaan)\b/gi,
        /\b(language|bahasa|dialect|dialek|accent|logat)\b/gi,
        /\b(celebration|perayaan|festival|ceremony|upacara)\b/gi
      ],
      response: {
        id: 'Indonesia punya budaya yang beragam dan indah! Semua tradisi patut dihargai.',
        en: 'Indonesia has diverse and beautiful cultures! All traditions deserve respect.'
      }
    }
  },

  // Positive reinforcement patterns
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

// Safety scoring algorithm
export function calculateSafetyScore(text: string, language: string = 'id'): {
  score: number;
  flags: string[];
  severity: 'low' | 'medium' | 'high';
  shouldBlock: boolean;
  response?: string;
} {
  let score = 100;
  const flags: string[] = [];
  let highestSeverity: 'low' | 'medium' | 'high' = 'low';
  let suggestedResponse: string | undefined;

  // Check inappropriate language
  const langFilters = INCLUSIVE_SAFETY_FILTERS.inappropriate_language[language as 'id' | 'en'] || 
                     INCLUSIVE_SAFETY_FILTERS.inappropriate_language.id;
  
  for (const pattern of langFilters) {
    if (pattern.test(text)) {
      score -= 30;
      flags.push('inappropriate_language');
      highestSeverity = 'high';
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
          }
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
          // Don't penalize, but provide supportive response
          if (!suggestedResponse) {
            suggestedResponse = sensitivity.response[language as 'id' | 'en'] || sensitivity.response.id;
          }
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
      }
    }
  }

  // Ensure score bounds
  score = Math.max(0, Math.min(100, score));

  const shouldBlock = score < 60 || highestSeverity === 'high';

  return {
    score,
    flags,
    severity: highestSeverity,
    shouldBlock,
    response: suggestedResponse
  };
}

// Content moderation response generator
export function generateModeratedResponse(safetyResult: ReturnType<typeof calculateSafetyScore>, language: string = 'id'): string {
  if (safetyResult.response) {
    return safetyResult.response;
  }

  // Default responses based on severity
  const defaultResponses = {
    id: {
      high: 'Maaf, aku tidak bisa membahas hal itu. Ayo kita bicara tentang hal yang menyenangkan dan aman!',
      medium: 'Hmm, sepertinya ini topik yang lebih baik dibicarakan dengan orangtua. Ada hal lain yang ingin kamu tanyakan?',
      low: 'Aku mengerti, tapi ayo kita fokus pada hal-hal positif ya!'
    },
    en: {
      high: "Sorry, I can't discuss that. Let's talk about something fun and safe!",
      medium: "Hmm, this seems like a topic better discussed with your parents. Is there something else you'd like to ask?",
      low: "I understand, but let's focus on positive things!"
    }
  };

  return defaultResponses[language as 'id' | 'en']?.[safetyResult.severity] || 
         defaultResponses.id[safetyResult.severity];
}

// Inclusive content guidelines for AI responses
export const INCLUSIVE_RESPONSE_GUIDELINES = {
  always_include: [
    'Respect for all family structures (single parents, blended families, guardians)',
    'Acknowledgment of diverse religious and cultural backgrounds',
    'Gender-neutral language when possible',
    'Inclusive representation in examples and stories',
    'Celebration of Indonesian diversity (Bhinneka Tunggal Ika)'
  ],
  never_assume: [
    'Traditional nuclear family structure',
    'Specific religious beliefs',
    'Economic status or background',
    'Physical appearance or abilities',
    'Urban vs rural living situations'
  ],
  cultural_values: {
    universal: ['Kindness', 'Respect', 'Honesty', 'Responsibility', 'Perseverance'],
    indonesian: ['Gotong royong', 'Toleransi', 'Sopan santun', 'Bhinneka Tunggal Ika'],
    family_specific: 'Allow families to define their own values'
  }
};