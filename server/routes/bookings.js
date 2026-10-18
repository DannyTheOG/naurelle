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
 * Supports both guests and logged-in users (automatically links client_id).
 */
router.post("/", optionalAuth, async (req, res) => {
    try {
        const body = req.body;
        const clientId = req.user ? req.user.id : (body.clientId || null);

        const bookingRecord = {
            id: Date.now(),
            ...body,
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
                        total_duration_minutes: body.totalDurationMinutes || 60,
                        total_duration_display: body.totalDurationDisplay || null,
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

        // 3. Send email notifications via Nodemailer if SMTP configured
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
                await transporter.sendMail(mailOptions);
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
