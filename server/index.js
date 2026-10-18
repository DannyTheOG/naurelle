import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import usersRouter from "./routes/users.js";
import adminUsersRouter from "./routes/adminUsers.js";
import bookingsRouter from "./routes/bookings.js";
import { isSupabaseConfigured } from "./supabaseClient.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "..", "dist");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// System health check
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        supabaseConfigured: isSupabaseConfigured(),
        timestamp: new Date().toISOString(),
    });
});

// User Management & Booking Endpoints
app.use("/api/users", usersRouter);
app.use("/api/admin/users", adminUsersRouter);
app.use("/api/bookings", bookingsRouter);

// Serve static frontend build if dist exists (production mode)
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/^(?!\/api|\/health).*/, (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(port, () => {
    console.log(`✨ Naurèlle Beauty API listening on http://localhost:${port}`);
    console.log(`🔐 Supabase Connected: ${isSupabaseConfigured() ? "YES" : "NO (using fallback mode)"}`);
});

export default app;
