import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { supabaseAdmin, isSupabaseConfigured } from "../supabaseClient.js";
import { optionalAuth, authenticateUser, requireRole } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bookingsFile = path.join(__dirname, "..", "bookings.json");

const router = express.Router();

export const BUFFER_MINUTES = 20;

/**
 * Parse a 12-hour formatted time string (e.g. "10:00 AM", "02:30 PM") to minutes from midnight
 */
export function parseTime12hToMinutes(timeStr) {
    if (!timeStr) return 0;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return 0;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight (e.g. 570) to 12-hour formatted string (e.g. "09:30 AM")
 */
export function formatTime12h(minutesFromMidnight) {
    const normalized = ((minutesFromMidnight % 1440) + 1440) % 1440;
    const hours24 = Math.floor(normalized / 60);
    const mins = normalized % 60;

    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

    const paddedHours = hours12 < 10 ? `0${hours12}` : `${hours12}`;
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;

    return `${paddedHours}:${paddedMins} ${period}`;
}

/**
 * Check if two appointment windows collide, factoring in the 20-minute operational buffer
 */
export function checkIntervalOverlap(newStart, newEnd, bookedStart, bookedEnd, bufferMinutes = BUFFER_MINUTES) {
    return newStart < (bookedEnd + bufferMinutes) && (newEnd + bufferMinutes) > bookedStart;
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * GET /api/bookings/availability?date=YYYY-MM-DD
 * Public endpoint to fetch all active booked intervals for a specific date,
 * allowing the client to gray out occupied time slots with Option B ("Reserved" badge).
 */
router.get("/availability", async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, error: "Missing required query parameter: date (YYYY-MM-DD)" });
        }

        let bookedIntervals = [];

        // 1. Fetch from Supabase
        if (isSupabaseConfigured() && supabaseAdmin) {
            try {
                const { data, error } = await supabaseAdmin
                    .from("bookings")
                    .select("id, date, time, end_time, total_duration_minutes, status, start_minutes, end_minutes")
                    .eq("date", date)
                    .not("status", "in", '("cancelled","no_show")');

                if (!error && data) {
                    bookedIntervals = data.map((b) => {
                        const start = b.start_minutes != null ? b.start_minutes : parseTime12hToMinutes(b.time);
                        const end = b.end_minutes != null
                            ? b.end_minutes
                            : (b.end_time ? parseTime12hToMinutes(b.end_time) : start + (b.total_duration_minutes || 60));

                        return {
                            id: b.id,
                            time: b.time,
                            endTime: b.end_time,
                            startMinutes: start,
                            endMinutes: end,
                            status: b.status,
                        };
                    });
                }
            } catch (supaErr) {
                console.warn("Supabase availability query warning:", supaErr.message);
            }
        }

        // 2. Merge / fallback with local bookings.json if Supabase had no rows or for redundancy
        try {
            const data = await fs.readFile(bookingsFile, "utf8");
            const allLocal = JSON.parse(data);
            const matchingLocal = allLocal.filter(
                (b) => b.date === date && b.status !== "cancelled" && b.status !== "no_show"
            );

            matchingLocal.forEach((b) => {
                const start = b.startMinutes != null ? b.startMinutes : parseTime12hToMinutes(b.time);
                const end = b.endMinutes != null
                    ? b.endMinutes
                    : (b.endTime ? parseTime12hToMinutes(b.endTime) : start + (b.totalDurationMinutes || 60));

                const alreadyTracked = bookedIntervals.some(
                    (existing) => existing.time === b.time && existing.startMinutes === start
                );

                if (!alreadyTracked) {
                    bookedIntervals.push({
                        id: b.id,
                        time: b.time,
                        endTime: b.endTime,
                        startMinutes: start,
                        endMinutes: end,
                        status: b.status || "pending",
                    });
                }
            });
        } catch {
            // Local file empty or missing
        }

        return res.json({
            success: true,
            date,
            bufferMinutes: BUFFER_MINUTES,
            bookedIntervals,
        });
    } catch (error) {
        console.error("Availability query error:", error);
        return res.status(500).json({ success: false, error: "Failed to determine slot availability." });
    }
});

/**
 * GET /api/bookings
 * Retrieves all bookings (Admin/Staff only)
 */
router.get("/", authenticateUser, requireRole("admin", "staff"), async (req, res) => {
    try {
        if (isSupabaseConfigured() && supabaseAdmin) {
            const { data, error } = await supabaseAdmin
                .from("bookings")
                .select("*")
                .order("date", { ascending: false });

            if (!error && data) {
                return res.json({ success: true, data });
            }
        }

        // Fallback to local bookings.json
        try {
            const data = await fs.readFile(bookingsFile, "utf8");
            res.json({ success: true, data: JSON.parse(data) });
        } catch {
            res.json({ success: true, data: [] });
        }
    } catch (error) {
        console.error("Error reading bookings:", error);
        res.status(500).json({ success: false, error: "Failed to read bookings." });
    }
});

/**
 * POST /api/bookings
 * Create a new appointment booking.
 * Validates against double-booking conflicts with 20-minute operational buffer.
 * Supports both guests and logged-in users (automatically links client_id).
 */
router.post("/", optionalAuth, async (req, res) => {
    try {
        const body = req.body;
        const clientId = req.user ? req.user.id : (body.clientId || null);

        const durationMinutes = Number(body.totalDurationMinutes) || 60;
        const startMinutes = body.startMinutes != null
            ? Number(body.startMinutes)
            : parseTime12hToMinutes(body.time);

        const endMinutes = body.endMinutes != null
            ? Number(body.endMinutes)
            : (body.endTime ? parseTime12hToMinutes(body.endTime) : startMinutes + durationMinutes);

        // =========================================================================
        // CONFLICT PREVENTION: Check existing bookings on this date for overlaps
        // =========================================================================
        let existingActiveBookings = [];

        if (isSupabaseConfigured() && supabaseAdmin) {
            try {
                const { data } = await supabaseAdmin
                    .from("bookings")
                    .select("id, date, time, end_time, total_duration_minutes, start_minutes, end_minutes, status")
                    .eq("date", body.date)
                    .not("status", "in", '("cancelled","no_show")');

                if (data) {
                    existingActiveBookings = data.map((b) => ({
                        start: b.start_minutes != null ? b.start_minutes : parseTime12hToMinutes(b.time),
                        end: b.end_minutes != null
                            ? b.end_minutes
                            : (b.end_time ? parseTime12hToMinutes(b.end_time) : parseTime12hToMinutes(b.time) + (b.total_duration_minutes || 60)),
                    }));
                }
            } catch (err) {
                console.warn("Supabase conflict check query error:", err.message);
            }
        }

        // Also check local bookings.json fallback
        try {
            const data = await fs.readFile(bookingsFile, "utf8");
            const allLocal = JSON.parse(data);
            const localMatches = allLocal.filter(
                (b) => b.date === body.date && b.status !== "cancelled" && b.status !== "no_show"
            );
            localMatches.forEach((b) => {
                const start = b.startMinutes != null ? b.startMinutes : parseTime12hToMinutes(b.time);
                const end = b.endMinutes != null
                    ? b.endMinutes
                    : (b.endTime ? parseTime12hToMinutes(b.endTime) : start + (b.totalDurationMinutes || 60));
                existingActiveBookings.push({ start, end });
            });
        } catch {
            // Ignore if bookings.json is empty
        }

        // Determine if collision exists
        const hasCollision = existingActiveBookings.some((existing) =>
            checkIntervalOverlap(startMinutes, endMinutes, existing.start, existing.end, BUFFER_MINUTES)
        );

        if (hasCollision) {
            return res.status(409).json({
                success: false,
                error: "The selected time slot is no longer available. Another client has already reserved an appointment during this window.",
                conflict: true,
            });
        }

        // =========================================================================
        // SLOT IS AVAILABLE: Proceed with creating booking
        // =========================================================================
        const bookingRecord = {
            id: Date.now(),
            ...body,
            startMinutes,
            endMinutes,
            clientId,
            createdAt: new Date().toISOString(),
            status: "pending",
        };

        // 1. If Supabase is configured, save to Postgres public.bookings table
        let supabaseRecord = null;
        if (isSupabaseConfigured() && supabaseAdmin) {
            try {
                const { data, error } = await supabaseAdmin
                    .from("bookings")
                    .insert({
                        client_id: clientId,
                        client_name: body.name || body.clientName,
                        client_email: body.email || body.clientEmail,
                        client_phone: body.phone || body.clientPhone || null,
                        date: body.date,
                        time: body.time,
                        end_time: body.endTime || null,
                        total_duration_minutes: durationMinutes,
                        total_duration_display: body.totalDurationDisplay || null,
                        start_minutes: startMinutes,
                        end_minutes: endMinutes,
                        price: Number(body.price) || 0,
                        services: body.services || [],
                        notes: body.notes || "",
                        status: "pending",
                    })
                    .select()
                    .single();

                if (!error && data) {
                    supabaseRecord = data;
                } else if (error) {
                    console.warn("Supabase insert booking warning:", error.message);
                }
            } catch (err) {
                console.warn("Could not write to Supabase bookings table:", err.message);
            }
        }

        // 2. Always maintain backup in bookings.json
        let bookings = [];
        try {
            const data = await fs.readFile(bookingsFile, "utf8");
            bookings = JSON.parse(data);
        } catch {
            bookings = [];
        }

        bookings.push(bookingRecord);
        await fs.writeFile(bookingsFile, JSON.stringify(bookings, null, 2));

        // 3. Send email notifications via Nodemailer if SMTP configured (asynchronous & non-blocking)
        try {
            const servicesSummary = Array.isArray(bookingRecord.services) && bookingRecord.services.length > 0
                ? bookingRecord.services.map((s) => `- ${s.serviceName}${s.lengthName ? ` (${s.lengthName})` : ""}`).join("\n")
                : (bookingRecord.service || "Standard Service");

            const mailOptions = {
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: process.env.SMTP_TO || process.env.SMTP_USER,
                subject: `New booking request from ${bookingRecord.name || bookingRecord.clientName}`,
                text: `Name: ${bookingRecord.name || bookingRecord.clientName}\nEmail: ${bookingRecord.email || bookingRecord.clientEmail}\nPhone: ${bookingRecord.phone || bookingRecord.clientPhone || "N/A"}\nServices:\n${servicesSummary}\nDate: ${bookingRecord.date}\nTime: ${bookingRecord.time}\nPrice: ₵${bookingRecord.price || "N/A"}\nNotes: ${bookingRecord.notes || "None"}`,
            };

            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                transporter.sendMail(mailOptions).catch((mailError) => {
                    console.warn("Email notification error (non-fatal):", mailError.message);
                });
            }
        } catch (mailError) {
            console.warn("Email notification error (non-fatal):", mailError.message);
        }

        return res.status(201).json({
            success: true,
            booking: supabaseRecord || bookingRecord,
        });
    } catch (error) {
        console.error("Booking creation error:", error);
        return res.status(500).json({ success: false, message: "Unable to save booking." });
    }
});

export default router;
