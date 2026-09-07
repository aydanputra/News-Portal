export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordPolicyResult {
    valid: boolean;
    error?: string;
}

// Kebijakan kekuatan password konsisten untuk seluruh endpoint.
// Minimum: 8 karakter, huruf kecil, huruf besar, dan angka.
export function validatePasswordStrength(password: unknown): PasswordPolicyResult {
    if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
        return { valid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: "Password must contain at least one lowercase letter" };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: "Password must contain at least one uppercase letter" };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: "Password must contain at least one number" };
    }
    return { valid: true };
}
