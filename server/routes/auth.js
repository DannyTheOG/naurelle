import express from "express";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { z } from "zod";
import { supabaseAdmin, isSupabaseConfigured } from "../supabaseClient.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resetTokensFile = path.join(__dirname, "..", "resetTokens.json");

const router = express.Router();

const RESET_TOKEN_TTL_MINUTES = 30;
const GENERIC_FORGOT_PASSWORD_MESSAGE =
    "If an account exists for that email address, a password reset link has been sent.";

const forgotPasswordSchema = z.object({
    email: z.string().trim().email("Please enter a valid email address."),
});

const resetPasswordSchema = z
    .object({
        token: z.string().trim().min(16, "Reset token is missing or invalid."),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long.")
            .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
            .regex(/[a-z]/, "Password must include at least one lowercase letter.")
            .regex(/[0-9]/, "Password must include at least one number."),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

function hashToken(rawToken) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function resolveFrontendBaseUrl(req) {
    const configured = process.env.FRONTEND_URL || process.env.PUBLIC_APP_URL;
    if (configured) {
        return configured.replace(/\/+$/, "");
    }
    const origin = req.get("origin");
    if (origin) {
        return origin.replace(/\/+$/, "");
    }
    const host = req.get("host");
    if (host) {
        const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
        return `${protocol}://${host}`;
    }
    return "http://localhost:5173";
}

async function readLocalTokens() {
    try {
        const raw = await fs.readFile(resetTokensFile, "utf8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function writeLocalTokens(tokens) {
    // Prune expired or used records older than 24 hours to keep the file compact
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const pruned = tokens.filter((t) => new Date(t.expiresAt).getTime() > cutoff);
    await fs.writeFile(resetTokensFile, JSON.stringify(pruned, null, 2));
}

async function findSupabaseUserByEmail(email) {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
        return null;
    }

    const normalized = email.toLowerCase();

    // Fast lookup via profiles table
    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .ilike("email", normalized)
        .maybeSingle();

    if (profile?.id) {
        return { id: profile.id, email: profile.email || normalized, fullName: profile.full_name || "" };
    }

    // Fallback: search auth.users directly in case profile row is missing
    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (!error && usersData?.users) {
        const match = usersData.users.find((u) => u.email?.toLowerCase() === normalized);
        if (match) {
            return {
                id: match.id,
                email: match.email,
                fullName: match.user_metadata?.full_name || "",
            };
        }
    }

    return null;
}

async function storeResetToken({ tokenHash, userId, email, expiresAt }) {
    // Invalidate any prior unused tokens for this user
    if (isSupabaseConfigured() && supabaseAdmin) {
        try {
            await supabaseAdmin
                .from("password_reset_tokens")
                .update({ used: true, used_at: new Date().toISOString() })
                .eq("user_id", userId)
                .eq("used", false);

            const { error } = await supabaseAdmin.from("password_reset_tokens").insert({
                token_hash: tokenHash,
                user_id: userId,
                email,
                expires_at: expiresAt,
                used: false,
            });

            if (!error) {
                return;
            }
        } catch {
            // Table may not exist yet; fall through to local JSON store
        }
    }

    const tokens = await readLocalTokens();
    const nowIso = new Date().toISOString();
    const updated = tokens.map((t) =>
        t.userId === userId && !t.used ? { ...t, used: true, usedAt: nowIso } : t
    );
    updated.push({
        tokenHash,
        userId,
        email,
        expiresAt,
        used: false,
        createdAt: nowIso,
    });
    await writeLocalTokens(updated);
}

async function findValidResetToken(tokenHash) {
    const now = Date.now();

    if (isSupabaseConfigured() && supabaseAdmin) {
        try {
            const { data, error } = await supabaseAdmin
                .from("password_reset_tokens")
                .select("*")
                .eq("token_hash", tokenHash)
                .eq("used", false)
                .maybeSingle();

            if (!error && data) {
                if (new Date(data.expires_at).getTime() <= now) {
                    return { valid: false, reason: "expired", source: "supabase", record: data };
                }
                return {
                    valid: true,
                    source: "supabase",
                    record: {
                        id: data.id,
                        userId: data.user_id,
                        email: data.email,
                        expiresAt: data.expires_at,
                    },
                };
            }
        } catch {
            // Fall back to local JSON store
        }
    }

    const tokens = await readLocalTokens();
    const localMatch = tokens.find((t) => t.tokenHash === tokenHash && !t.used);
    if (!localMatch) {
        return { valid: false, reason: "invalid" };
    }
    if (new Date(localMatch.expiresAt).getTime() <= now) {
        return { valid: false, reason: "expired", source: "local", record: localMatch };
    }
    return { valid: true, source: "local", record: localMatch };
}

async function markTokenUsed(tokenHash, source) {
    const usedAt = new Date().toISOString();

    if (source === "supabase" && isSupabaseConfigured() && supabaseAdmin) {
        try {
            await supabaseAdmin
                .from("password_reset_tokens")
                .update({ used: true, used_at: usedAt })
                .eq("token_hash", tokenHash);
            return;
        } catch {
            // Fallback below
        }
    }

    const tokens = await readLocalTokens();
    const updated = tokens.map((t) => (t.tokenHash === tokenHash ? { ...t, used: true, usedAt } : t));
    await writeLocalTokens(updated);
}

/**
 * POST /api/auth/forgot-password
 * Generates a single-use, time-limited reset token and sends a reset link via email.
 * Always returns 200 with a generic message to prevent email enumeration.
 */
router.post("/forgot-password", async (req, res) => {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: parsed.error.issues[0]?.message || "Please enter a valid email address.",
            });
        }

        if (!isSupabaseConfigured() || !supabaseAdmin) {
            return res.status(503).json({
                success: false,
                error: "Password recovery is unavailable because authentication is not configured.",
            });
        }

        const { email } = parsed.data;
        const user = await findSupabaseUserByEmail(email);

        if (user) {
            const rawToken = crypto.randomBytes(32).toString("hex");
            const tokenHash = hashToken(rawToken);
            const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

            await storeResetToken({
                tokenHash,
                userId: user.id,
                email: user.email,
                expiresAt,
            });

            const baseUrl = resolveFrontendBaseUrl(req);
            const resetUrl = `${baseUrl}/#/reset-password?token=${rawToken}`;

            await sendPasswordResetEmail({
                to: user.email,
                fullName: user.fullName,
                resetUrl,
                expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
            });
        }

        return res.json({
            success: true,
            message: GENERIC_FORGOT_PASSWORD_MESSAGE,
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to process password reset request right now. Please try again later.",
        });
    }
});

/**
 * GET /api/auth/reset-password/validate?token=...
 * Pre-validates a reset token before the user submits a new password.
 */
router.get("/reset-password/validate", async (req, res) => {
    try {
        const rawToken = typeof req.query.token === "string" ? req.query.token.trim() : "";
        if (!rawToken) {
            return res.status(400).json({ valid: false, error: "Reset token is missing." });
        }

        const lookup = await findValidResetToken(hashToken(rawToken));
        if (!lookup.valid) {
            if (lookup.reason === "expired" && lookup.source) {
                await markTokenUsed(hashToken(rawToken), lookup.source);
            }
            return res.status(400).json({
                valid: false,
                error:
                    lookup.reason === "expired"
                        ? "This password reset link has expired. Please request a new one."
                        : "This password reset link is invalid or has already been used.",
            });
        }

        return res.json({ valid: true });
    } catch (error) {
        console.error("Validate reset token error:", error);
        return res.status(500).json({ valid: false, error: "Unable to validate reset link." });
    }
});

/**
 * POST /api/auth/reset-password
 * Verifies token, validates password strength, updates Supabase Auth password, and invalidates token.
 */
router.post("/reset-password", async (req, res) => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: parsed.error.issues[0]?.message || "Invalid password reset submission.",
            });
        }

        if (!isSupabaseConfigured() || !supabaseAdmin) {
            return res.status(503).json({
                success: false,
                error: "Password recovery is unavailable because authentication is not configured.",
            });
        }

        const { token, password } = parsed.data;
        const tokenHash = hashToken(token);
        const lookup = await findValidResetToken(tokenHash);

        if (!lookup.valid) {
            if (lookup.reason === "expired" && lookup.source) {
                await markTokenUsed(tokenHash, lookup.source);
            }
            return res.status(400).json({
                success: false,
                error:
                    lookup.reason === "expired"
                        ? "This password reset link has expired. Please request a new one."
                        : "This password reset link is invalid or has already been used.",
            });
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(lookup.record.userId, {
            password,
        });

        if (updateError) {
            console.error("Supabase password update error:", updateError);
            return res.status(500).json({
                success: false,
                error: updateError.message || "Failed to update password. Please try again.",
            });
        }

        // Invalidate token immediately after successful use
        await markTokenUsed(tokenHash, lookup.source);

        return res.json({
            success: true,
            message: "Your password has been reset successfully. Redirecting to sign in...",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to reset password right now. Please try again.",
        });
    }
});

export default router;

