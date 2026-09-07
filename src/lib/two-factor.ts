import "server-only";

import crypto from "crypto";
import { generateSecret, generateURI, verify } from "otplib";
import * as QRCode from "qrcode";
import { encryptSecret, decryptSecret } from "@/lib/secret-crypto";

const NAMESPACE = "news-portal-2fa";
const RECOVERY_NAMESPACE = "news-portal-2fa-recovery";

const MASTER_KEY = process.env.MASTER_KEY || "";

function requireMasterKey(): string {
    if (!MASTER_KEY) {
        throw new Error("MASTER_KEY environment variable is not set");
    }
    return MASTER_KEY;
}

export interface TwoFactorSetup {
    secret: string;
    otpauthUrl: string;
    qrDataUrl: string;
}

// Buat secret TOTP baru + URL otpauth + QR (data URL) untuk ditampilkan.
export async function generateTwoFactorSetup(email: string, issuer: string): Promise<TwoFactorSetup> {
    const secret = generateSecret();
    return buildTwoFactorSetup(secret, email, issuer);
}

// Bangun otpauth URL + QR dari secret yang sudah ada (stabil antar refresh).
export async function buildTwoFactorSetup(secret: string, email: string, issuer: string): Promise<TwoFactorSetup> {
    const otpauthUrl = generateURI({ issuer, label: email, secret });
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);
    return { secret, otpauthUrl, qrDataUrl };
}

// Validasi kode TOTP terhadap secret (dengan toleransi 1 langkah waktu).
export async function verifyTotpToken(secret: string, token: string): Promise<boolean> {
    if (!secret || !token) return false;
    try {
        const result = await verify({ secret, token: token.trim(), epochTolerance: 30 });
        return result.valid;
    } catch {
        return false;
    }
}

export function encryptTotpSecret(secret: string): string {
    return encryptSecret(secret, requireMasterKey(), NAMESPACE);
}

export function decryptTotpSecret(cipher: string): string {
    return decryptSecret(cipher, requireMasterKey(), NAMESPACE);
}

function hashRecoveryCode(code: string): string {
    return crypto.createHash("sha256").update(code).digest("hex");
}

export interface RecoveryCodes {
    plain: string[];
    encrypted: string;
}

// Generate 10 recovery codes sekali pakai; plain hanya ditampilkan sekali.
export function generateRecoveryCodes(): RecoveryCodes {
    const plain: string[] = [];
    for (let i = 0; i < 10; i++) {
        plain.push(crypto.randomBytes(5).toString("hex"));
    }
    const hashes = plain.map(hashRecoveryCode);
    const encrypted = encryptSecret(JSON.stringify(hashes), requireMasterKey(), RECOVERY_NAMESPACE);
    return { plain, encrypted };
}

export function verifyRecoveryCode(encrypted: string, code: string): boolean {
    if (!encrypted || !code) return false;
    try {
        const json = decryptSecret(encrypted, requireMasterKey(), RECOVERY_NAMESPACE);
        const hashes: string[] = JSON.parse(json);
        return hashes.includes(hashRecoveryCode(code.trim()));
    } catch {
        return false;
    }
}
