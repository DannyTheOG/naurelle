import express from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabaseClient.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Apply auth and staff/admin guard to all routes in this file
router.use(authenticateUser);
router.use(requireRole("admin", "staff"));

const updateAdminUserSchema = z.object({
    role: z.enum(["client", "staff", "admin"]).optional(),
    is_active: z.boolean().optional(),
    internal_notes: z.string().max(3000).optional(),
    full_name: z.string().min(1).max(120).optional(),
    phone: z.string().max(30).optional(),
    beauty_notes: z.object({
        preferredLength: z.string().max(100).optional(),
        allergies: z.string().max(500).optional(),
        nailNotes: z.string().max(1000).optional(),
    }).optional(),
});

const inviteUserSchema = z.object({
    email: z.string().email(),
    full_name: z.string().min(1).max(120).optional(),
    role: z.enum(["client", "staff", "admin"]).default("client"),
    phone: z.string().optional(),
});

/**
 * GET /api/admin/users
 * List users with pagination, role filtering, and search
 */
router.get("/", async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const role = req.query.role;
        const search = req.query.search?.trim();

        let query = supabaseAdmin
            .from("profiles")
            .select("*", { count: "exact" });

        if (role && ["client", "staff", "admin"].includes(role)) {
            query = query.eq("role", role);
        }

        if (search) {
            query = query.or(
                `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
            );
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query.order("created_at", { ascending: false }).range(from, to);

        const { data: users, error, count } = await query;

        if (error) {
            console.error("Admin user list error:", error);
            return res.status(500).json({ success: false, error: "Database error fetching users." });
        }

        return res.json({
            success: true,
            data: users || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        console.error("Admin user list error:", error);
        return res.status(500).json({ success: false, error: "Server error fetching users." });
    }
});

/**
 * GET /api/admin/users/:id
 * Retrieve specific user details and appointment history
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !profile) {
            return res.status(404).json({ success: false, error: "User profile not found." });
        }

        // Fetch user's bookings
        const { data: bookings } = await supabaseAdmin
            .from("bookings")
            .select("*")
            .or(`client_id.eq.${id},client_email.eq.${profile.email}`)
            .order("date", { ascending: false });

        return res.json({
            success: true,
            data: {
                profile,
                bookings: bookings || [],
                totalBookings: (bookings || []).length,
            },
        });
    } catch (error) {
        console.error("Admin get user error:", error);
        return res.status(500).json({ success: false, error: "Failed to retrieve user." });
    }
});

/**
 * PATCH /api/admin/users/:id
 * Update user profile, role, internal notes, or status
 */
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const validation = updateAdminUserSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid input data",
                details: validation.error.format(),
            });
        }

        const updates = validation.data;

        // Changing user role requires admin privileges
        if (updates.role && req.profile.role !== "admin") {
            return res.status(403).json({
                success: false,
                error: "Only administrators can modify user roles.",
            });
        }

        // Prevent admin from accidentally demoting or deactivating their own account
        if (id === req.user.id) {
            if (updates.is_active === false) {
                return res.status(400).json({ success: false, error: "You cannot deactivate your own account." });
            }
            if (updates.role && updates.role !== "admin") {
                return res.status(400).json({ success: false, error: "You cannot demote your own admin account." });
            }
        }

        const { data: updatedProfile, error } = await supabaseAdmin
            .from("profiles")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Admin user update error:", error);
            return res.status(500).json({ success: false, error: "Failed to update user profile." });
        }

        return res.json({
            success: true,
            message: "User updated successfully.",
            data: updatedProfile,
        });
    } catch (error) {
        console.error("Admin user update error:", error);
        return res.status(500).json({ success: false, error: "Server error updating user." });
    }
});

/**
 * POST /api/admin/users/invite
 * (Admin only) Invite a new staff member or user by email
 */
router.post("/invite", requireRole("admin"), async (req, res) => {
    try {
        const validation = inviteUserSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid input data",
                details: validation.error.format(),
            });
        }

        const { email, full_name, role, phone } = validation.data;

        // Use Supabase Admin Auth to send invite email
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                full_name: full_name || "",
                phone: phone || "",
                role: role || "client",
            },
        });

        if (error) {
            console.error("Supabase invite error:", error);
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(201).json({
            success: true,
            message: `Invitation successfully sent to ${email}.`,
            data: data.user,
        });
    } catch (error) {
        console.error("Invite user error:", error);
        return res.status(500).json({ success: false, error: "Server error sending invitation." });
    }
});

/**
 * DELETE /api/admin/users/:id
 * (Admin only) Delete or deactivate a user
 */
router.delete("/:id", requireRole("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const permanent = req.query.permanent === "true";

        if (id === req.user.id) {
            return res.status(400).json({ success: false, error: "You cannot delete your own account." });
        }

        if (permanent) {
            // Hard delete through Supabase Auth Admin
            const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
            if (error) {
                return res.status(500).json({ success: false, error: error.message });
            }
            return res.json({ success: true, message: "User deleted permanently." });
        } else {
            // Soft delete: mark is_active = false
            const { error } = await supabaseAdmin
                .from("profiles")
                .update({ is_active: false })
                .eq("id", id);

            if (error) {
                return res.status(500).json({ success: false, error: error.message });
            }
            return res.json({ success: true, message: "User deactivated successfully." });
        }
    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ success: false, error: "Server error deleting user." });
    }
});

export default router;
