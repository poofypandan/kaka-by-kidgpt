// Content filtering utilities for frontend
export interface SafetyResult {
  score: number;
  isAppropriate: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Quick client-side pre-checks (basic patterns only)
const BASIC_INAPPROPRIATE_PATTERNS = [
  /kekerasan|violence|darah|blood/i,
  /dewasa|adult|seks|sex/i,
  /narkoba|drugs|mabuk|drunk/i,
  /alamat|address|nomor hp|phone number/i,
  /password|kata sandi/i,
];

export function quickSafetyCheck(text: string): SafetyResult {
  let score = 100;
  const reasons: string[] = [];
  
  for (const pattern of BASIC_INAPPROPRIATE_PATTERNS) {
    if (pattern.test(text)) {
      score -= 25;
      reasons.push('Potentially inappropriate content detected');
    }
  }
  
  // Check message length (very long messages might be concerning)
  if (text.length > 500) {
    score -= 10;
    reasons.push('Message too long');
  }
  
  // Check for excessive caps (might indicate shouting/anger)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5 && text.length > 10) {
    score -= 15;
    reasons.push('Excessive capitalization detected');
  }
  
  const isAppropriate = score >= 70;
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (score < 30) severity = 'critical';
  else if (score < 50) severity = 'high';
  else if (score < 70) severity = 'medium';
  
  return {
    score,
    isAppropriate,
    reasons,
    severity
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