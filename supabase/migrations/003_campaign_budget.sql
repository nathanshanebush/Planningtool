-- Add budget tracking columns to campaigns
alter table campaigns
  add column if not exists budget numeric(12,2) default 0,
  add column if not exists spend_to_date numeric(12,2) default 0,
  add column if not exists budget_category text;
