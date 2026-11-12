import "dotenv/config";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "../supabaseClient.js";

/**
 * Returns a configured Nodemailer transporter or null if SMTP credentials are missing
 */
export function getMailTransporter() {
    const user = process.env.SMTP_USER || "naurellebeautystudio@gmail.com";
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 587);

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
}

/**
 * Checks whether an email transport (Resend HTTP API or SMTP fallback) is configured
 */
function isEmailConfigured() {
    return Boolean(process.env.RESEND_API_KEY || getMailTransporter());
}

const DEFAULT_RESEND_FROM = "Naurelle Beauty Bookings <bookings@booking.naurellebeauty.com>";

/**
 * Sends an email via the Resend HTTP API (HTTPS port 443)
 */
async function sendViaResend({ fromName, to, replyTo, subject, text, html }) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM || DEFAULT_RESEND_FROM;
    const from = fromAddress.includes("<") ? fromAddress : `"${fromName}" <${fromAddress}>`;

    const payload = {
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        html,
    };

    if (replyTo) {
        payload.reply_to = replyTo;
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "naurelle-beauty/1.0",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.message || data?.error || `Resend API error (${response.status})`);
    }

    return data.id;
}

/**
 * Dispatches an email using Resend HTTP API when configured, or falls back to Nodemailer SMTP
 */
async function dispatchEmail({ fromName, to, replyTo, subject, text, html, logLabel }) {
    if (process.env.RESEND_API_KEY) {
        const messageId = await sendViaResend({ fromName, to, replyTo, subject, text, html });
        console.log(`✅ [Email Notification] ${logLabel} delivered via Resend to ${to}. ID:`, messageId);
        return { success: true, messageId };
    }

    const transporter = getMailTransporter();
    if (!transporter) {
        console.warn(`[Email Notification] No email provider configured (set RESEND_API_KEY or SMTP credentials). Skipping ${logLabel}.`);
        return { success: false, skipped: true };
    }

    const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER || "naurellebeautystudio@gmail.com";
    const info = await transporter.sendMail({
        from: `"${fromName}" <${smtpFrom}>`,
        to,
        replyTo: replyTo || undefined,
        subject,
        text,
        html,
    });

    console.log(`✅ [Email Notification] ${logLabel} delivered via SMTP to ${to}. Message ID:`, info.messageId);
    return { success: true, messageId: info.messageId };
}

/**
 * Send an automated notification email to the studio every time a client books an appointment
 */
export async function sendNewBookingNotification(booking) {
    try {
        const recipientEmail = process.env.RESEND_TO || process.env.SMTP_TO || "naurellebeautystudio@gmail.com";

        if (!isEmailConfigured()) {
            console.warn("[Email Notification] Email credentials not configured. Skipping new booking notification.");
            return;
        }

        const clientName = booking.clientName || booking.name || booking.client_name || "Guest Client";
        const clientPhone = booking.clientPhone || booking.phone || booking.client_phone || "Not provided";
        const clientEmail = booking.clientEmail || booking.email || booking.client_email || "";
        const cleanPhone = clientPhone.replace(/\D/g, "");

        const date = booking.date || "Not specified";
        const time = booking.time || "Not specified";
        const endTime = booking.endTime || booking.end_time || "";
        const timeDisplay = endTime ? `${time} – ${endTime}` : time;
        const durationDisplay = booking.totalDurationDisplay || booking.total_duration_display || (booking.totalDurationMinutes ? `${booking.totalDurationMinutes} mins` : "Standard");
        const priceDisplay = booking.price ? `₵${booking.price}` : "₵0";
        const notes = booking.notes || "";

        // Format services for HTML table and plain text
        const servicesList = Array.isArray(booking.services) && booking.services.length > 0
            ? booking.services
            : [{ serviceName: booking.service || "Appointment", lengthName: "", displayDuration: durationDisplay, price: booking.price || 0 }];

        const servicesTableRows = servicesList.map((s) => `
            <tr style="border-bottom: 1px solid #EAE3DC;">
                <td style="padding: 12px 14px; font-weight: 600; color: #2B2625;">
                    ${s.serviceName || s.name || "Service"}
                    ${s.lengthName ? `<span style="font-size: 12px; color: #777777; font-weight: normal;"> &bull; ${s.lengthName}</span>` : ""}
                </td>
                <td style="padding: 12px 14px; color: #666666; font-size: 13px; text-align: center;">
                    ${s.displayDuration || ""}
                </td>
                <td style="padding: 12px 14px; text-align: right; font-weight: 700; color: #3A141E;">
                    ₵${s.price || 0}
                </td>
            </tr>
        `).join("");

        const servicesPlainText = servicesList.map((s) =>
            `• ${s.serviceName || s.name}${s.lengthName ? ` (${s.lengthName})` : ""} [${s.displayDuration || ""}] - ₵${s.price || 0}`
        ).join("\n");

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Booking Request - Naurèlle Beauty</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #FAF7F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B2625;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F4; padding: 32px 12px;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(58, 20, 30, 0.08); border: 1px solid #EAE3DC;">
                            
                            <!-- Header Banner -->
                            <tr>
                                <td align="center" style="background-color: #3A141E; padding: 32px 24px; color: #FFFFFF;">
                                    <div style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #E8DFD8; margin-bottom: 6px; font-weight: 600;">
                                        NAURÈLLE BEAUTY STUDIO
                                    </div>
                                    <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: normal; letter-spacing: 0.02em; color: #FFFFFF;">
                                        New Booking Request
                                    </h1>
                                    <p style="margin: 6px 0 0; font-size: 13px; color: #D4C9BF;">
                                        A new client appointment has just been scheduled online
                                    </p>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 28px 24px;">
                                    <div style="display: inline-block; background-color: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px;">
                                        Status: Pending Confirmation
                                    </div>

                                    <!-- Appointment Summary Card -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBF8F5; border: 1px solid #EAE3DC; border-radius: 8px; margin-bottom: 22px;">
                                        <tr>
                                            <td style="padding: 18px 20px;">
                                                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #3A141E; font-weight: 700; margin-bottom: 12px;">
                                                    Appointment Schedule
                                                </div>
                                                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.8;">
                                                    <tr>
                                                        <td style="color: #777777; width: 120px;">Date:</td>
                                                        <td><strong style="color: #2B2625; font-size: 15px;">${date}</strong></td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #777777;">Time Window:</td>
                                                        <td><strong style="color: #3A141E; font-size: 15px;">${timeDisplay}</strong></td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #777777;">Total Duration:</td>
                                                        <td><span style="color: #2B2625;">${durationDisplay} (+ 20m buffer)</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #777777;">Estimated Total:</td>
                                                        <td><strong style="color: #3A141E; font-size: 16px;">${priceDisplay}</strong></td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Client Details Card -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #EAE3DC; border-radius: 8px; margin-bottom: 22px;">
                                        <tr>
                                            <td style="padding: 18px 20px;">
                                                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #3A141E; font-weight: 700; margin-bottom: 12px;">
                                                    Client Information
                                                </div>
                                                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.8;">
                                                    <tr>
                                                        <td style="color: #777777; width: 120px;">Client Name:</td>
                                                        <td><strong style="color: #2B2625;">${clientName}</strong></td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #777777;">Phone Number:</td>
                                                        <td>
                                                            <a href="tel:${clientPhone}" style="color: #3A141E; font-weight: 600; text-decoration: none;">
                                                                ${clientPhone}
                                                            </a>
                                                            ${cleanPhone ? `&nbsp;&bull;&nbsp;<a href="https://wa.me/${cleanPhone}" target="_blank" style="color: #166534; text-decoration: none; font-weight: 600; font-size: 13px;">WhatsApp &rarr;</a>` : ""}
                                                        </td>
                                                    </tr>
                                                    ${clientEmail ? `
                                                    <tr>
                                                        <td style="color: #777777;">Email:</td>
                                                        <td>
                                                            <a href="mailto:${clientEmail}" style="color: #555555; text-decoration: none;">
                                                                ${clientEmail}
                                                            </a>
                                                        </td>
                                                    </tr>` : ""}
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Services Breakdown -->
                                    <div style="margin-bottom: 22px;">
                                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #3A141E; font-weight: 700; margin-bottom: 10px;">
                                            Requested Services (${servicesList.length})
                                        </div>
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F6; border: 1px solid #EAE3DC; border-radius: 8px; overflow: hidden; font-size: 14px;">
                                            ${servicesTableRows}
                                        </table>
                                    </div>

                                    <!-- Client Notes -->
                                    ${notes ? `
                                    <div style="background-color: #F8F5F2; border-left: 3px solid #3A141E; padding: 12px 16px; margin-bottom: 22px; border-radius: 0 6px 6px 0; font-size: 13px; line-height: 1.5; color: #444444;">
                                        <strong style="color: #3A141E;">Special Client Notes:</strong>
                                        <p style="margin: 4px 0 0; font-style: italic;">"${notes}"</p>
                                    </div>` : ""}

                                    <!-- Direct Quick Action Buttons -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 14px; margin-bottom: 6px;">
                                        <tr>
                                            <td align="center">
                                                ${cleanPhone ? `
                                                <a href="https://wa.me/${cleanPhone}" target="_blank" style="display: inline-block; background-color: #166534; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 24px; margin-right: 8px; margin-bottom: 8px;">
                                                    Chat on WhatsApp
                                                </a>` : ""}
                                                <a href="tel:${clientPhone}" style="display: inline-block; background-color: #3A141E; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 24px; margin-bottom: 8px;">
                                                    Call Client
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center" style="background-color: #F5EFEB; padding: 18px 20px; font-size: 12px; color: #777777; border-top: 1px solid #ECE6E0;">
                                    <p style="margin: 0 0 4px 0; font-weight: 600; color: #555555;">Naurèlle Beauty Booking System</p>
                                    <p style="margin: 0; font-size: 11px; color: #888888;">Automated notification sent to ${recipientEmail} upon new online booking.</p>
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
==================================================
           NAURÈLLE BEAUTY STUDIO
            NEW BOOKING REQUEST
==================================================

A new client appointment has been scheduled online:

CLIENT DETAILS:
- Name: ${clientName}
- Phone: ${clientPhone}
${clientEmail ? `- Email: ${clientEmail}\n` : ""}
APPOINTMENT DETAILS:
- Date: ${date}
- Time: ${timeDisplay}
- Total Duration: ${durationDisplay} (+ 20m operational buffer)
- Estimated Total: ${priceDisplay}

SERVICES REQUESTED:
${servicesPlainText}

${notes ? `CLIENT NOTES:\n"${notes}"\n\n` : ""}Log in to the Naurèlle Beauty Bookings Manager to review or confirm this appointment.
        `.trim();

        return await dispatchEmail({
            fromName: "Naurèlle Beauty Reservations",
            to: recipientEmail,
            replyTo: clientEmail || undefined,
            subject: `🔔 New Booking: ${clientName} - ${date} at ${time}`,
            text: plainText,
            html: htmlContent,
            logLabel: "New booking notification",
        });
    } catch (err) {
        console.error("❌ [Email Notification] Failed to send new booking notification:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Send an automated confirmation email to the client when staff confirms their booking in the Bookings Manager
 */
export async function sendConfirmationEmailToClient(booking) {
    try {
        if (!isEmailConfigured()) {
            console.warn("[Email Notification] Email credentials missing. Skipping client confirmation email.");
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

        return await dispatchEmail({
            fromName: "Naurèlle Beauty",
            to: clientEmail,
            subject: `Appointment Confirmed: ${date} at ${time} — Naurèlle Beauty`,
            text: plainText,
            html: htmlContent,
            logLabel: "Client confirmation email",
        });
    } catch (err) {
        console.error("❌ [Email Notification] Client confirmation email delivery error:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Send a time-limited password reset email to a user
 */
export async function sendPasswordResetEmail({ to, fullName, resetUrl, expiresInMinutes = 30 }) {
    try {
        if (!isEmailConfigured()) {
            console.warn("[Email Notification] Email credentials not configured. Skipping password reset email.");
            return { success: false, skipped: true };
        }

        const displayName = fullName || "Valued Client";

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - Naurèlle Beauty</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #FAF7F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B2625;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F4; padding: 36px 12px;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(58, 20, 30, 0.08); border: 1px solid #EAE3DC;">
                            <tr>
                                <td align="center" style="background-color: #3A141E; padding: 32px 24px; color: #FFFFFF;">
                                    <div style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #E8DFD8; margin-bottom: 6px; font-weight: 600;">
                                        NAURÈLLE BEAUTY STUDIO
                                    </div>
                                    <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: normal; color: #FFFFFF;">
                                        Password Reset Request
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 32px 28px;">
                                    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px 0;">
                                        Hello <strong>${displayName}</strong>,
                                    </p>
                                    <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 24px 0;">
                                        We received a request to reset the password for your Naurèlle Beauty account. Click the button below to choose a new password. This link is valid for <strong>${expiresInMinutes} minutes</strong> and can only be used once.
                                    </p>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #3A141E; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 26px;">
                                                    Reset Password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="font-size: 12px; line-height: 1.6; color: #777777; margin: 0 0 14px 0;">
                                        If the button does not work, copy and paste this link into your browser:<br>
                                        <a href="${resetUrl}" style="color: #3A141E; word-break: break-all;">${resetUrl}</a>
                                    </p>
                                    <div style="background-color: #FAF8F6; border-left: 3px solid #3A141E; padding: 12px 14px; font-size: 12px; color: #666666; line-height: 1.5;">
                                        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="background-color: #F5EFEB; padding: 16px 20px; font-size: 11px; color: #888888; border-top: 1px solid #ECE6E0;">
                                    Naurèlle Beauty Studio &bull; Abia St, Accra, Ghana
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
NAURÈLLE BEAUTY — PASSWORD RESET REQUEST

Hello ${displayName},

We received a request to reset the password for your Naurèlle Beauty account.
Use the link below to set a new password (valid for ${expiresInMinutes} minutes, single-use):

${resetUrl}

If you did not request a password reset, you can safely ignore this email.
        `.trim();

        return await dispatchEmail({
            fromName: "Naurèlle Beauty",
            to,
            subject: "Reset Your Password — Naurèlle Beauty",
            text: plainText,
            html: htmlContent,
            logLabel: "Password reset email",
        });
    } catch (err) {
        console.error("❌ [Email Notification] Password reset email delivery error:", err.message);
        return { success: false, error: err.message };
    }
}
