-- Organizations / tenants
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  plan text DEFAULT 'starter' CHECK (plan IN ('starter','pro','enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active','suspended')),
  owner_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add org_id to existing tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id);
ALTER TABLE tactics ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id);

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all orgs; users can read their own org
CREATE POLICY "super_admins can manage orgs" ON organizations
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "users can read own org" ON organizations
  FOR SELECT TO authenticated
  USING (
    id = (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_tactics_org_id ON tactics(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);
