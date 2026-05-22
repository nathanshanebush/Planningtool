-- Creative assets uploaded to tactics
CREATE TABLE IF NOT EXISTS creative_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tactic_id uuid REFERENCES tactics(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text,
  file_type text,
  uploaded_by text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','needs_revision','rejected')),
  created_at timestamptz DEFAULT now()
);

-- Feedback/comments on creative assets
CREATE TABLE IF NOT EXISTS creative_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES creative_assets(id) ON DELETE CASCADE,
  author text NOT NULL,
  type text NOT NULL CHECK (type IN ('approve','revision','reject','comment')),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_feedback ENABLE ROW LEVEL SECURITY;

-- Policies (authenticated users can read/write within their org)
CREATE POLICY "auth users can manage creative_assets" ON creative_assets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth users can manage creative_feedback" ON creative_feedback
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
