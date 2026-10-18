import express from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabaseClient.js";
import { authenticateUser } from "../middleware/auth.js";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bookingsFile = path.join(__dirname, "..", "bookings.json");

const router = express.Router();

// Schema for updating client profile
const updateProfileSchema = z.object({
    full_name: z.string().min(1).max(120).optional(),
    phone: z.string().max(30).optional(),
    avatar_url: z.string().url().or(z.literal("")).optional(),
    beauty_notes: z.object({
        preferredLength: z.string().max(100).optional(),
        allergies: z.string().max(500).optional(),
        nailNotes: z.string().max(1000).optional(),
    }).optional(),
});

/**
 * GET /api/users/me
 * Retrieves current authenticated user's profile
 */
router.get("/me", authenticateUser, async (req, res) => {
    try {
        const { profile, user } = req;

        // Strip internal_notes if user is a standard client
        const safeProfile = { ...profile };
        if (safeProfile.role === "client") {
            delete safeProfile.internal_notes;
        }

        return res.json({
            success: true,
            data: {
                ...safeProfile,
                auth_provider: user.app_metadata?.provider || "email",
                email_confirmed_at: user.email_confirmed_at,
            },
        });
    } catch (error) {
        console.error("Error retrieving user profile:", error);
        return res.status(500).json({ success: false, error: "Failed to retrieve profile." });
    }
});

/**
 * PATCH /api/users/me
 * Updates authenticated user's own profile details
 */
router.patch("/me", authenticateUser, async (req, res) => {
    try {
        const validation = updateProfileSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid input data",
                details: validation.error.format(),
            });
        }

        const updates = validation.data;
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: "No update fields provided." });
        }

        // Merge beauty_notes if provided
        if (updates.beauty_notes && req.profile.beauty_notes) {
            updates.beauty_notes = {
                ...req.profile.beauty_notes,
                ...updates.beauty_notes,
            };
        }

        const { data: updatedProfile, error } = await supabaseAdmin
            .from("profiles")
            .update(updates)
            .eq("id", req.user.id)
            .select()
            .single();

        if (error) {
            console.error("Supabase profile update error:", error);
            return res.status(500).json({ success: false, error: "Database error updating profile." });
        }

        if (req.profile.role === "client") {
            delete updatedProfile.internal_notes;
        }

        return res.json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedProfile,
        });
    } catch (error) {
        console.error("Unexpected error updating profile:", error);
        return res.status(500).json({ success: false, error: "Server error updating profile." });
    }
});

/**
 * GET /api/users/me/bookings
 * Returns booking history for the authenticated user
 */
router.get("/me/bookings", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;

        // Try querying Supabase bookings table first
        try {
            const { data: bookings, error } = await supabaseAdmin
                .from("bookings")
                .select("*")
                .or(`client_id.eq.${userId},client_email.eq.${userEmail}`)
                .order("date", { ascending: false });

            if (!error && bookings && bookings.length > 0) {
                return res.json({
                    success: true,
                    data: bookings,
                });
            }
        } catch (supabaseErr) {
            console.warn("Supabase bookings table query fallback:", supabaseErr.message);
        }

        // Fallback: Query bookings.json file by user's email
        try {
            const fileData = await fs.readFile(bookingsFile, "utf8");
            const allBookings = JSON.parse(fileData);
            const userBookings = allBookings.filter(
                (b) => (b.email && b.email.toLowerCase() === userEmail.toLowerCase()) || b.clientId === userId
            );

            return res.json({
                success: true,
                data: userBookings,
            });
        } catch {
            return res.json({
                success: true,
                data: [],
            });
        }
    } catch (error) {
        console.error("Error retrieving user bookings:", error);
        return res.status(500).json({ success: false, error: "Failed to retrieve appointments." });
    }
});

export default router;
