-- Fix security warnings for materialized views by adding RLS policies

-- Enable RLS on materialized views
ALTER MATERIALIZED VIEW mv_trending_equipment ENABLE ROW LEVEL SECURITY;
ALTER MATERIALIZED VIEW mv_equipment_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trending equipment view
CREATE POLICY "Anyone can view trending equipment" 
ON mv_trending_equipment 
FOR SELECT 
USING (true);

-- Create RLS policies for equipment stats view  
CREATE POLICY "Anyone can view equipment stats" 
ON mv_equipment_stats 
FOR SELECT 
USING (true);