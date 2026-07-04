import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;
const bookingsFile = path.join(__dirname, "bookings.json");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/bookings", async (_req, res) => {
    try {
        const data = await fs.readFile(bookingsFile, "utf8");
        res.json(JSON.parse(data));
    } catch {
        res.json([]);
    }
});

app.post("/api/bookings", async (req, res) => {
    try {
        const booking = {
            id: Date.now(),
            ...req.body,
            createdAt: new Date().toISOString(),
        };

        let bookings = [];
        try {
            const data = await fs.readFile(bookingsFile, "utf8");
            bookings = JSON.parse(data);
        } catch {
            bookings = [];
        }

        bookings.push(booking);
        await fs.writeFile(bookingsFile, JSON.stringify(bookings, null, 2));

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_TO || process.env.SMTP_USER,
            subject: `New booking request from ${booking.name}`,
            text: `Name: ${booking.name}\nEmail: ${booking.email}\nService: ${booking.service}\nDate: ${booking.date}\nNotes: ${booking.notes}`,
        };

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail(mailOptions);
        }

        res.status(201).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to save booking." });
    }
});

app.listen(port, () => {
    console.log(`Booking API listening on http://localhost:${port}`);
});
