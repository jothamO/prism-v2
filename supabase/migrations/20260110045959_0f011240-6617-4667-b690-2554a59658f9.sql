-- Enable realtime for admin-relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE education_articles;
ALTER PUBLICATION supabase_realtime ADD TABLE system_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE transaction_patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE telegram_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_connections;

-- Add migration tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS migrated_from_v1 BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS v1_id UUID;