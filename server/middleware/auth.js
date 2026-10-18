import { supabaseAdmin, isSupabaseConfigured } from "../supabaseClient.js";

/**
 * Middleware to authenticate requests using Supabase Bearer JWT
 */
export async function authenticateUser(req, res, next) {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
        return res.status(503).json({
            success: false,
            error: "Supabase service is not configured on the server. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            error: "Authentication required: Missing or malformed Authorization header (Bearer token expected).",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // 1. Verify token with Supabase Auth
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired session token.",
            });
        }

        // 2. Fetch user profile from public.profiles
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            // Self-heal: If profile was missed by trigger, create it on-the-fly
            const newProfile = {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || "",
                phone: user.user_metadata?.phone || "",
                role: "client",
                is_active: true,
            };

            const { data: createdProfile } = await supabaseAdmin
                .from("profiles")
                .insert(newProfile)
                .select()
                .single();

            req.user = user;
            req.profile = createdProfile || newProfile;
            return next();
        }

        // 3. Ensure account is not deactivated
        if (profile.is_active === false) {
            return res.status(403).json({
                success: false,
                error: "Your account has been deactivated. Please contact Naurèlle Beauty management.",
            });
        }

        req.user = user;
        req.profile = profile;
        next();
    } catch (err) {
        console.error("Auth middleware unexpected error:", err);
        return res.status(500).json({
            success: false,
            error: "Authentication service error.",
        });
    }
}

/**
 * Middleware to restrict route access by role
 * @param  {...string} allowedRoles ('admin', 'staff', 'client')
 */
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.profile) {
            return res.status(401).json({
                success: false,
                error: "Authentication required before role verification.",
            });
        }

        if (!allowedRoles.includes(req.profile.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Requires one of the following roles: [${allowedRoles.join(", ")}]. Current role: '${req.profile.role}'.`,
            });
        }

        next();
    };
}

/**
 * Optional authentication: Attaches user and profile if valid token is provided,
 * but allows unauthenticated guest requests through.
 */
export async function optionalAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ") || !isSupabaseConfigured() || !supabaseAdmin) {
        req.user = null;
        req.profile = null;
        return next();
    }

    const token = authHeader.split(" ")[1];
    try {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            req.user = user;
            req.profile = profile || null;
        }
    } catch {
        req.user = null;
        req.profile = null;
    }

    next();
}
