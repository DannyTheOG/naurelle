import express from "express";
import { z } from "zod";
import {
    sendContactInquiryNotification,
    sendContactConfirmationToClient,
} from "../services/emailService.js";

const router = express.Router();

const contactSchema = z.object({
    name: z.string().trim().min(1, "Please provide your name.").max(100, "Name is too long."),
    email: z.string().trim().email("Please provide a valid email address."),
    phone: z.string().trim().max(40, "Phone number is too long.").optional().default(""),
    message: z.string().trim().min(1, "Please enter your message.").max(5000, "Message cannot exceed 5000 characters."),
});

/**
 * POST /api/contact
 * Handles website contact form submissions and delivers email notifications to the studio
 */
router.post("/", async (req, res) => {
    try {
        const parsed = contactSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: parsed.error.issues[0]?.message || "Invalid contact form submission.",
            });
        }

        const { name, email, phone, message } = parsed.data;

        // Dispatch email notification to the studio
        const studioResult = await sendContactInquiryNotification({
            name,
            email,
            phone,
            message,
        });

        // Optionally send acknowledgment email to the client
        try {
            await sendContactConfirmationToClient({ name, email, message });
        } catch (clientErr) {
            console.warn("[Contact Route] Non-fatal: could not send confirmation to client:", clientErr.message);
        }

        return res.status(200).json({
            success: true,
            message: "Thank you for reaching out! We have received your message and will get back to you shortly.",
            delivery: studioResult,
        });
    } catch (err) {
        console.error("❌ [Contact Route] Error handling contact submission:", err);
        return res.status(500).json({
            success: false,
            error: "An unexpected error occurred while sending your message. Please try again or reach out directly on WhatsApp.",
        });
    }
});

export default router;

