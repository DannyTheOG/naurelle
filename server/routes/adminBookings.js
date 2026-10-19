import express from "express";
import { z } from "zod";
import nodemailer from "nodemailer";
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
 * Send an automated confirmation email to the client when staff confirms their booking
 */
async function sendConfirmationEmailToClient(booking) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return;
    }

    let clientEmail = booking.client_email || booking.email || booking.clientEmail;
    let clientName = booking.client_name || booking.name || booking.clientName || "Valued Client";

    // If clientEmail is missing but client_id exists, look up email in profiles table
    if ((!clientEmail || !clientEmail.includes("@")) && booking.client_id && supabaseAdmin) {
        try {
            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("email, full_name")
                .eq("id", booking.client_id)
                .single();
            if (profile?.email) {
                clientEmail = profile.email;
                if (!clientName || clientName === "Valued Client") {
                    clientName = profile.full_name || clientName;
                }
            }
        } catch {
            // Ignore profile query fallback error
        }
    }

    if (!clientEmail || !clientEmail.includes("@")) {
        console.warn(`[Email Notification] No client email found for booking #${booking.id}. Skipping confirmation email.`);
        return;
    }

    const date = booking.date;
    const time = booking.time;
    const endTime = booking.end_time || booking.endTime;
    const timeDisplay = endTime ? `${time} – ${endTime}` : time;
    const priceDisplay = booking.price ? `₵${booking.price}` : "Upon consultation";
    const durationDisplay = booking.total_duration_display || booking.totalDurationDisplay || (booking.total_duration_minutes ? `${booking.total_duration_minutes} mins` : "");

    // Format selected services
    let servicesHtml = "";
    if (Array.isArray(booking.services) && booking.services.length > 0) {
        servicesHtml = booking.services
            .map(
                (s) => `
                <li style="margin-bottom: 8px;">
                    <strong style="color: #2B2625;">${s.serviceName || s.name}</strong>
                    ${s.lengthName ? `<span style="color: #666; font-size: 13px;"> &bull; ${s.lengthName}</span>` : ""}
                    ${s.price ? ` — <span style="color: #3A141E; font-weight: 600;">₵${s.price}</span>` : ""}
                </li>`
            )
            .join("");
    } else {
        servicesHtml = `<li><strong>${booking.service || "Beauty Service"}</strong></li>`;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmed - Naurèlle Beauty</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF7F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B2625;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F4; padding: 36px 12px;">
            <tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #ECE6E0;">
                        <!-- Header Banner -->
                        <tr>
                            <td align="center" style="background-color: #3A141E; padding: 36px 24px; color: #FFFFFF;">
                                <div style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #E8DFD8; margin-bottom: 8px; font-weight: 600;">
                                    NAURÈLLE BEAUTY
                                </div>
                                <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; font-weight: normal; letter-spacing: 0.02em; color: #FFFFFF;">
                                    Your Appointment is Confirmed
                                </h1>
                                <p style="margin: 8px 0 0; font-size: 13px; color: #D4C9BF;">
                                    Minimalist Nails &bull; Refined Artistry
                                </p>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 36px 30px;">
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 14px 0; color: #2B2625;">
                                    Hello <strong>${clientName}</strong>,
                                </p>
                                <p style="font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 24px 0;">
                                    Great news! Your booking at <strong>Naurèlle Beauty</strong> has been reviewed and officially confirmed by our team. Your appointment time is locked in and ready.
                                </p>

                                <!-- Booking Card -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBF8F5; border: 1px solid #EAE3DC; border-radius: 8px; margin-bottom: 24px;">
                                    <tr>
                                        <td style="padding: 20px 22px;">
                                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #3A141E; font-weight: 700; margin-bottom: 12px;">
                                                Reservation Details
                                            </div>
                                            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.8;">
                                                <tr>
                                                    <td style="color: #777777; width: 110px;">Date:</td>
                                                    <td><strong style="color: #2B2625;">${date}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #777777;">Time:</td>
                                                    <td><strong style="color: #3A141E; font-size: 15px;">${timeDisplay}</strong></td>
                                                </tr>
                                                ${durationDisplay ? `
                                                <tr>
                                                    <td style="color: #777777;">Duration:</td>
                                                    <td style="color: #2B2625;">${durationDisplay}</td>
                                                </tr>` : ""}
                                                <tr>
                                                    <td style="color: #777777;">Estimated Total:</td>
                                                    <td><strong style="color: #3A141E; font-size: 16px;">${priceDisplay}</strong></td>
                                                </tr>
                                            </table>

                                            <div style="border-top: 1px dashed #DDD5CC; margin: 16px 0 12px; padding-top: 12px;">
                                                <div style="color: #777777; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 8px;">
                                                    Selected Services:
                                                </div>
                                                <ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.6; color: #333333;">
                                                    ${servicesHtml}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Studio Location & Guidelines -->
                                <div style="background-color: #FAF5F5; border-left: 3px solid #3A141E; padding: 16px 18px; margin-bottom: 26px; border-radius: 0 6px 6px 0; font-size: 13px; line-height: 1.6; color: #444444;">
                                    <div style="font-weight: 700; color: #3A141E; margin-bottom: 6px;">Studio Location &amp; Information:</div>
                                    <div style="margin-bottom: 4px;"><strong>Location:</strong> Abia St, Accra, Ghana</div>
                                    <div style="margin-bottom: 8px;"><strong>Phone:</strong> 0555214888</div>
                                    <div style="font-size: 12px; color: #666666;">
                                        &bull; Please arrive 5–10 minutes before your scheduled appointment.<br>
                                        &bull; If you need to reschedule, please contact us at least 24 hours in advance.
                                    </div>
                                </div>

                                <!-- CTA WhatsApp Button -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="text-align: center; margin-bottom: 8px;">
                                    <tr>
                                        <td align="center">
                                            <a href="https://wa.me/qr/WAGV5TSY4DGOF1" target="_blank" style="display: inline-block; background-color: #3A141E; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 13px 30px; border-radius: 25px; letter-spacing: 0.03em;">
                                                Chat with Studio on WhatsApp
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="background-color: #F5EFEB; padding: 22px 24px; font-size: 12px; color: #888888; border-top: 1px solid #ECE6E0;">
                                <p style="margin: 0 0 4px 0; font-weight: 600; color: #555555;">Naurèlle Beauty Studio</p>
                                <p style="margin: 0 0 6px 0;">Abia St, Accra, Ghana &bull; naurellebeautystudio@gmail.com</p>
                                <p style="margin: 0; font-size: 11px; color: #AAAAAA;">You received this email because an appointment was confirmed for this address.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const plainText = `
NAURÈLLE BEAUTY - APPOINTMENT CONFIRMED

Hello ${clientName},

Your appointment has been officially confirmed by our studio staff!

RESERVATION DETAILS:
Date: ${date}
Time: ${timeDisplay}
Estimated Total: ${priceDisplay}
${durationDisplay ? `Duration: ${durationDisplay}` : ""}

LOCATION:
Abia St, Accra, Ghana
Contact: 0555214888
WhatsApp: https://wa.me/qr/WAGV5TSY4DGOF1

STUDIO POLICY:
- Please arrive 5-10 minutes prior to your scheduled time.
- If you need to reschedule, please notify us at least 24 hours in advance.

Thank you for choosing Naurèlle Beauty!
    `.trim();

    const mailOptions = {
        from: `Naurèlle Beauty <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: clientEmail,
        subject: `Appointment Confirmed: ${date} at ${time} — Naurèlle Beauty`,
        text: plainText,
        html: htmlContent,
    };

    transporter.sendMail(mailOptions).catch((err) => {
        console.warn("Client confirmation email delivery warning:", err.message);
    });
}

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
                        start_minutes: startMinutes,
                        end_minutes: endMinutes,
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
