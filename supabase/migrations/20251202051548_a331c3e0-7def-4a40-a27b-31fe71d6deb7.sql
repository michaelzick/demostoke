-- Create table for scraped retailer data
CREATE TABLE public.scraped_retailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Business info
    business_name TEXT NOT NULL,
    business_url TEXT NOT NULL UNIQUE,
    business_domain TEXT,
    detected_categories TEXT[] DEFAULT '{}',
    
    -- Contact info extracted
    email TEXT,
    phone TEXT,
    address TEXT,
    location_lat NUMERIC,
    location_lng NUMERIC,
    
    -- Raw scraped content
    raw_html TEXT,
    raw_markdown TEXT,
    relevant_pages JSONB DEFAULT '[]',
    
    -- Parsed equipment data
    parsed_equipment JSONB DEFAULT '[]',
    generated_sql TEXT,
    
    -- Processing status
    status TEXT DEFAULT 'discovered' CHECK (status IN ('discovered', 'scraped', 'parsed', 'inserted', 'error')),
    error_message TEXT,
    last_scraped_at TIMESTAMPTZ,
    equipment_inserted BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.scraped_retailers ENABLE ROW LEVEL SECURITY;

-- Admins can view all scraped retailers
CREATE POLICY "Admins can view scraped retailers"
ON public.scraped_retailers
FOR SELECT
USING (is_admin());

-- Admins can manage scraped retailers
CREATE POLICY "Admins can manage scraped retailers"
ON public.scraped_retailers
FOR ALL
USING (is_admin());

-- Create index for faster lookups
CREATE INDEX idx_scraped_retailers_status ON public.scraped_retailers(status);
CREATE INDEX idx_scraped_retailers_business_url ON public.scraped_retailers(business_url);
CREATE INDEX idx_scraped_retailers_created_at ON public.scraped_retailers(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_scraped_retailers_updated_at
BEFORE UPDATE ON public.scraped_retailers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();