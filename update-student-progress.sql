-- Add current_line column to student_progress table if it doesn't exist
ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS current_line INTEGER;
ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();
