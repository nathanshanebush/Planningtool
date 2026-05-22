-- ROI tracking fields on tactics
ALTER TABLE tactics ADD COLUMN IF NOT EXISTS appointments_booked integer DEFAULT 0;
ALTER TABLE tactics ADD COLUMN IF NOT EXISTS leads_generated integer DEFAULT 0;
ALTER TABLE tactics ADD COLUMN IF NOT EXISTS sales_count integer DEFAULT 0;
ALTER TABLE tactics ADD COLUMN IF NOT EXISTS revenue_generated numeric(12,2) DEFAULT 0;
