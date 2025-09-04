// Quiz input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Character limits for different fields
export const FIELD_LIMITS = {
  locations: 500,
  currentGear: 1000,
  additionalNotes: 1000,
  weight: { min: 50, max: 400 },
  age: { min: 5, max: 100 }
};

// Sanitize text input to prevent XSS and unwanted characters
export const sanitizeText = (input: string): string => {
  if (!input) return '';

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>&]/g, (match) => { // Only escape truly dangerous characters for HTML injection
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;'
      };
      return escapeMap[match] || match;
    })
    .trim();
};

// Validate text fields with length limits
export const validateTextField = (value: string, fieldName: string, maxLength: number): ValidationResult => {
  const sanitized = sanitizeText(value);

  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be ${maxLength} characters or less`
    };
  }

  return { isValid: true };
};

// Validate numeric input
export const validateNumericField = (value: string, fieldName: string, min: number, max: number): ValidationResult => {
  const num = parseInt(value, 10);

  if (isNaN(num)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`
    };
  }

  if (num < min || num > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}`
    };
  }

  return { isValid: true };
};

// Validate location input
export const validateLocations = (value: string): ValidationResult => {
  const sanitized = sanitizeText(value);

  if (!sanitized.trim()) {
    return {
      isValid: false,
      error: 'Please enter at least one location'
    };
  }

  return validateTextField(sanitized, 'Locations', FIELD_LIMITS.locations);
};

// Validate current gear input
export const validateCurrentGear = (value: string): ValidationResult => {
  const sanitized = sanitizeText(value);

  if (!sanitized.trim()) {
    return {
      isValid: false,
      error: 'Please describe your current gear preferences'
    };
  }

  return validateTextField(sanitized, 'Current gear', FIELD_LIMITS.currentGear);
};

// Validate additional notes (optional field)
export const validateAdditionalNotes = (value: string): ValidationResult => {
  if (!value) return { isValid: true }; // Optional field

  const sanitized = sanitizeText(value);
  return validateTextField(sanitized, 'Additional notes', FIELD_LIMITS.additionalNotes);
};

// Comprehensive quiz data validation
export const validateQuizData = (data: any): ValidationResult => {
  // Required field checks
  const requiredFields = ['category', 'height', 'weight', 'age', 'sex', 'skillLevel', 'locations', 'currentGear'];

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      return {
        isValid: false,
        error: `${field} is required`
      };
    }
  }

  // Validate numeric fields
  const weightValidation = validateNumericField(data.weight, 'Weight', FIELD_LIMITS.weight.min, FIELD_LIMITS.weight.max);
  if (!weightValidation.isValid) return weightValidation;

  const ageValidation = validateNumericField(data.age, 'Age', FIELD_LIMITS.age.min, FIELD_LIMITS.age.max);
  if (!ageValidation.isValid) return ageValidation;

  // Validate text fields
  const locationsValidation = validateLocations(data.locations);
  if (!locationsValidation.isValid) return locationsValidation;

  const gearValidation = validateCurrentGear(data.currentGear);
  if (!gearValidation.isValid) return gearValidation;

  const notesValidation = validateAdditionalNotes(data.additionalNotes);
  if (!notesValidation.isValid) return notesValidation;

  return { isValid: true };
};

// Sanitize entire quiz data object
export const sanitizeQuizData = (data: any) => {
  return {
    category: data.category || '',
    height: data.height || '',
    weight: data.weight || '',
    age: data.age || '',
    sex: data.sex || '',
    skillLevel: data.skillLevel || '',
    locations: sanitizeText(data.locations || ''),
    currentGear: sanitizeText(data.currentGear || ''),
    additionalNotes: sanitizeText(data.additionalNotes || '')
  };
};
