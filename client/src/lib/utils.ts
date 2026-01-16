import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates and parses a class selection string in the format "sectionId|subjectId"
 * @param selectedClass - The class selection string to validate
 * @returns Object with discriminated union based on validity
 */
export function parseClassSelection(
  selectedClass: string | null | undefined
):
  | { valid: true; sectionId: string; subjectId: string }
  | { valid: false; error: string } {
  if (!selectedClass) {
    return { valid: false, error: 'No class selected' };
  }

  if (!selectedClass.includes('|')) {
    return { valid: false, error: 'Invalid class format' };
  }

  const [sectionId, subjectId] = selectedClass.split('|');

  if (!sectionId || !subjectId || sectionId === 'undefined' || subjectId === 'undefined') {
    return { valid: false, error: 'Invalid section or subject ID' };
  }

  return { valid: true, sectionId, subjectId };
}
