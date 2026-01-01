/**
 * Email validation utilities
 */

const SECE_EMAIL_DOMAIN = '@sece.ac.in';

/**
 * Validates if email belongs to SECE domain
 */
export const validateSeceEmail = (email: string): boolean => {
    const trimmedEmail = email.trim().toLowerCase();
    return trimmedEmail.endsWith(SECE_EMAIL_DOMAIN);
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isStrongPassword = (password: string): boolean => {
    if (password.length < 8) return false;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Get password strength message
 */
export const getPasswordStrengthMessage = (password: string): string => {
    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number';
    }
    return 'Password is strong';
};

/**
 * Validates complete SECE email domain
 */
export const validateSeceEmailComplete = (email: string): {
    valid: boolean;
    message: string;
} => {
    if (!email) {
        return { valid: false, message: 'Email is required' };
    }

    if (!isValidEmail(email)) {
        return { valid: false, message: 'Invalid email format' };
    }

    if (!validateSeceEmail(email)) {
        return {
            valid: false,
            message: `Only ${SECE_EMAIL_DOMAIN} emails are allowed`,
        };
    }

    return { valid: true, message: 'Valid email' };
};
