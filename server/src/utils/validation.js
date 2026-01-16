/**
 * Validation utilities for the College ERP System
 */

// UUID format validation regex
// Note: This regex matches standard UUID format (8-4-4-4-12 hexadecimal pattern)
// It accepts any version of UUID, not just v4, which is sufficient for our validation needs
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID format
 * @param {string} uuid - The UUID string to validate
 * @returns {boolean} - True if valid UUID format, false otherwise
 */
export function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  // Check for common invalid values
  if (uuid === 'undefined' || uuid === 'null') {
    return false;
  }
  
  return UUID_REGEX.test(uuid);
}
