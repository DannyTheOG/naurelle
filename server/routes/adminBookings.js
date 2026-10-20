import express from "express";
import { z } from "zod";
import { supabaseAdmin, isSupabaseConfigured } from "../supabaseClient.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";
import { parseTime12hToMinutes, formatTime12h } from "./bookings.js";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bookingsFile = path.join(__dirname, "..", "bookings.json");

const router = express.Router();

import { sendConfirmationEmailToClient } from "../services/emailService.js";

// Guard all admin booking routes
router.use(authenticateUser);
router.use(requireRole("admin", "staff"));

const updateStatusSchema = z.object({
    status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
    notes: z.string().max(1000).optional(),
});

const blockTimeSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().min(1),
    durationMinutes: z.number().int().min(15).max(720).default(60),
    reason: z.string().max(200).default("Studio Reserved / Break"),
});

/**
 * GET /api/admin/bookings
 * List appointments with date, status, and client search filters
 */
router.get("/", async (req, res) => {
    try {
        const { date, status, search, limit = 100, page = 1 } = req.query;

        if (isSupabaseConfigured() && supabaseAdmin) {
            let query = supabaseAdmin
                .from("bookings")
                .select("*, client:client_id(full_name, phone, email)", { count: "exact" });

            if (date) {
                query = query.eq("date", date);
            }

            if (status && ["pending", "confirmed", "completed", "cancelled", "no_show"].includes(status)) {
                query = query.eq("status", status);
            }

            if (search) {
                query = query.or(
                    `client_name.ilike.%${search}%,client_email.ilike.%${search}%,client_phone.ilike.%${search}%`
                );
            }

            const from = (parseInt(page) - 1) * parseInt(limit);
            const to = from + parseInt(limit) - 1;

            query = query.order("date", { ascending: false }).order("time", { ascending: true }).range(from, to);

            const { data, count, error } = await query;
            if (!error && data) {
                return res.json({
                    success: true,
                    data,
                    total: count || 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                });
            }
        }

        // Fallback: read from bookings.json
        try {
            const fileData = await fs.readFile(bookingsFile, "utf8");
            let list = JSON.parse(fileData);

            if (date) list = list.filter((b) => b.date === date);
            if (status) list = list.filter((b) => b.status === status);
            if (search) {
                const s = search.toLowerCase();
                list = list.filter(
                    (b) =>
                        (b.name && b.name.toLowerCase().includes(s)) ||
                        (b.email && b.email.toLowerCase().includes(s)) ||
                        (b.phone && b.phone.includes(s))
                );
            }

            list.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (a.time || "").localeCompare(b.time || ""));

            return res.json({
                success: true,
                data: list,
                total: list.length,
            });
        } catch {
            return res.json({ success: true, data: [], total: 0 });
        }
    } catch (error) {
        console.error("Admin bookings query error:", error);
        return res.status(500).json({ success: false, error: "Failed to retrieve bookings." });
    }
});

/**
 * PATCH /api/admin/bookings/:id/status
 * Update appointment status (e.g. 'confirmed', 'completed', 'cancelled', 'no_show')
 */
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const validation = updateStatusSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({ success: false, error: "Invalid status value", details: validation.error.format() });
        }

        const { status, notes } = validation.data;
        const numericId = !isNaN(Number(id)) ? Number(id) : id;

        // 1. Update in Supabase
        if (isSupabaseConfigured() && supabaseAdmin) {
            const updatePayload = { status };
            if (notes !== undefined) updatePayload.notes = notes;

            const { data, error } = await supabaseAdmin
                .from("bookings")
                .update(updatePayload)
                .eq("id", numericId)
                .select()
                .single();

            if (!error && data) {
                // If confirmed, trigger automated email confirmation to the client
                if (status === "confirmed") {
                    sendConfirmationEmailToClient(data);
                }

                // Also sync local bookings.json fallback if entry exists
                try {
                    const fileData = await fs.readFile(bookingsFile, "utf8");
                    let list = JSON.parse(fileData);
                    const idx = list.findIndex((b) => String(b.id) === String(id));
                    if (idx !== -1) {
                        list[idx].status = status;
                        if (notes !== undefined) list[idx].notes = notes;
                        list[idx].updatedAt = new Date().toISOString();
                        await fs.writeFile(bookingsFile, JSON.stringify(list, null, 2));
                    }
                } catch {
                    // Ignore local sync warning
                }

                return res.json({
                    success: true,
                    message: `Booking #${id} status updated to ${status}.`,
                    data,
                });
            }
        }

        // 2. Update in bookings.json fallback
        try {
            const fileData = await fs.readFile(bookingsFile, "utf8");
            let list = JSON.parse(fileData);
            const index = list.findIndex((b) => String(b.id) === String(id));

            if (index !== -1) {
                list[index].status = status;
                if (notes !== undefined) list[index].notes = notes;
                list[index].updatedAt = new Date().toISOString();
                await fs.writeFile(bookingsFile, JSON.stringify(list, null, 2));

                // If confirmed, trigger automated email confirmation to the client
                if (status === "confirmed") {
                    sendConfirmationEmailToClient(list[index]);
                }

                return res.json({
                    success: true,
                    message: `Booking status updated to ${status}.`,
                    data: list[index],
                });
            }
        } catch (fileErr) {
            console.warn("Local JSON status update warning:", fileErr.message);
        }

        return res.status(404).json({ success: false, error: "Booking not found." });
    } catch (error) {
        console.error("Admin status update error:", error);
        return res.status(500).json({ success: false, error: "Failed to update booking status." });
    }
});

/**
 * POST /api/admin/bookings/block
 * Studio management tool to block out times for breaks, staff training, or private sessions.
 * Automatically marks those intervals as reserved so clients cannot book them.
 */
router.post("/block", async (req, res) => {
    try {
        const validation = blockTimeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: "Invalid block parameters", details: validation.error.format() });
        }

        const { date, time, durationMinutes, reason } = validation.data;
        const startMinutes = parseTime12hToMinutes(time);
        const endMinutes = startMinutes + durationMinutes;
        const endTime = formatTime12h(endMinutes);

        const blockRecord = {
            id: Date.now(),
            date,
            time,
            endTime,
            totalDurationMinutes: durationMinutes,
            totalDurationDisplay: `${durationMinutes} mins`,
            startMinutes,
            endMinutes,
            client_name: `[BLOCKED] ${reason}`,
            client_email: "studio@naurellebeauty.com",
            client_phone: "N/A",
            price: 0,
            services: [{ serviceName: reason, durationMinutes, price: 0 }],
            notes: `Studio time blocked by admin (${req.profile?.fullName || req.user?.email})`,
            status: "confirmed",
            createdAt: new Date().toISOString(),
        };

        if (isSupabaseConfigured() && supabaseAdmin) {
            try {
                const { data } = await supabaseAdmin
                    .from("bookings")
                    .insert({
                        client_name: blockRecord.client_name,
                        client_email: blockRecord.client_email,
                        client_phone: null,
                        date,
                        time,
                        end_time: endTime,
                        total_duration_minutes: durationMinutes,
                        total_duration_display: `${durationMinutes} mins`,
                        price: 0,
                        services: blockRecord.services,
                        notes: blockRecord.notes,
                        status: "confirmed",
                    })
                    .select()
                    .single();

                if (data) {
                    blockRecord.id = data.id;
                }
            } catch (supaErr) {
                console.warn("Supabase block time insert warning:", supaErr.message);
            }
        }

        // Save to bookings.json
        try {
            const fileData = await fs.readFile(bookingsFile, "utf8");
            const list = JSON.parse(fileData);
            list.push(blockRecord);
            await fs.writeFile(bookingsFile, JSON.stringify(list, null, 2));
        } catch {
            await fs.writeFile(bookingsFile, JSON.stringify([blockRecord], null, 2));
        }

        return res.status(201).json({
            success: true,
            message: `Time slot successfully blocked on ${date} (${time} – ${endTime}).`,
            data: blockRecord,
        });
    } catch (error) {
        console.error("Admin block time error:", error);
        return res.status(500).json({ success: false, error: "Failed to block time." });
    }
});

export default router;
