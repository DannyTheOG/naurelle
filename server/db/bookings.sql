-- ==============================================================================
-- NAURÈLLE BEAUTY - BOOKINGS SCHEMA (SUPABASE POSTGRESQL)
-- Links bookings with public.profiles for full user management & appointment tracking
-- ==============================================================================

-- 1. Create booking status enum
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- User linkage (optional for guest bookings, populated for registered users)
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Client details snapshot (preserved even if profile changes or for guests)
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,

    -- Appointment details
    date DATE NOT NULL,
    time TEXT NOT NULL, -- e.g. "10:00 AM"
    end_time TEXT,      -- e.g. "12:30 PM"
    total_duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_duration_display TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,

    -- Status management
    status booking_status NOT NULL DEFAULT 'pending'
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Automatic updated_at trigger for bookings
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table & Sequence Permissions
GRANT ALL ON TABLE public.bookings TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bookings TO authenticated;
GRANT SELECT, INSERT ON TABLE public.bookings TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Row Level Security (RLS) for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can view their own bookings
DROP POLICY IF EXISTS "Clients can view own bookings" ON public.bookings;
CREATE POLICY "Clients can view own bookings"
    ON public.bookings FOR SELECT
    USING (
        auth.uid() = client_id OR
        (auth.jwt() ->> 'email') = client_email
    );

-- Policy: Anyone can insert a booking (guests or authenticated users)
DROP POLICY IF EXISTS "Allow public booking creation" ON public.bookings;
CREATE POLICY "Allow public booking creation"
    ON public.bookings FOR INSERT
    WITH CHECK (true);

-- Policy: Staff & Admin can view and update all bookings
DROP POLICY IF EXISTS "Staff and admin can manage all bookings" ON public.bookings;
CREATE POLICY "Staff and admin can manage all bookings"
    ON public.bookings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );
