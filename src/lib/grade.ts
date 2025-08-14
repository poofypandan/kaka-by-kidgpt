/**
 * Indonesian grade detection based on birthdate and July 1st cutoff
 * Following Indonesian education system rules
 */

export interface GradeDetectionResult {
  grade?: number;
  reason: string;
}

export function detectGradeFromBirthdate(
  dob: Date, 
  today: Date = new Date()
): GradeDetectionResult {
  // Determine the academic year start (July 1st)
  const yStart = today < new Date(Date.UTC(today.getFullYear(), 6, 1))
    ? today.getFullYear() - 1 
    : today.getFullYear();
  
  const cutoff = new Date(Date.UTC(yStart, 6, 1)); // July 1st of academic year
  
  // Calculate age as of July 1st
  let age = yStart - dob.getFullYear();
  if (cutoff < new Date(Date.UTC(dob.getFullYear(), dob.getMonth(), dob.getDate()))) {
    age--;
  }
  
  // Age validation rules
  if (age < 6) {
    return { 
      reason: "Belum memenuhi usia minimal 6 tahun per 1 Juli." 
    };
  }
  
  if (age >= 12) {
    return { 
      grade: 6, 
      reason: "Usia ≥12 per 1 Juli, di-map ke kelas 6." 
    };
  }
  
  // Grade calculation: age 6 = grade 1, age 7 = grade 2, etc.
  const calculatedGrade = Math.min(Math.max(age - 5, 1), 6);
  
  return { 
    grade: calculatedGrade,
    reason: `Usia ${age} tahun per 1 Juli ${yStart}, kelas ${calculatedGrade}.`
  };
}

export function calculateAge(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  
  return age;
}

export function getGradeFromAge(age: number): number {
  // Indonesian elementary school: typically ages 6-12 for grades 1-6
  if (age < 6) return 1;
  if (age > 12) return 6;
  return Math.min(Math.max(age - 5, 1), 6);
}

export function getGradeDisplayText(grade: number): string {
  return `Kelas ${grade}`;
}

export function isValidGradeOverride(grade: number): boolean {
  return grade >= 1 && grade <= 6;
}