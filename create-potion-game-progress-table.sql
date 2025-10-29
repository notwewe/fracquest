-- Create potion_game_progress table for tracking potion master game data
CREATE TABLE IF NOT EXISTS potion_game_progress (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  has_seen_tutorial BOOLEAN DEFAULT FALSE NOT NULL,
  total_score INTEGER DEFAULT 0 NOT NULL,
  potions_brewed INTEGER DEFAULT 0 NOT NULL,
  perfect_potions INTEGER DEFAULT 0 NOT NULL,
  failed_attempts INTEGER DEFAULT 0 NOT NULL,
  highest_streak INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  total_time_played INTEGER DEFAULT 0 NOT NULL, -- in seconds
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(student_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_potion_game_student_id ON potion_game_progress(student_id);

-- Enable Row Level Security
ALTER TABLE potion_game_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own progress
CREATE POLICY "Users can view own potion game progress"
  ON potion_game_progress
  FOR SELECT
  USING (auth.uid() = student_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own potion game progress"
  ON potion_game_progress
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Users can update their own progress
CREATE POLICY "Users can update own potion game progress"
  ON potion_game_progress
  FOR UPDATE
  USING (auth.uid() = student_id);

-- Teachers can view all students' progress
CREATE POLICY "Teachers can view all potion game progress"
  ON potion_game_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name = 'teacher'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_potion_game_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_potion_game_progress_updated_at ON potion_game_progress;
CREATE TRIGGER set_potion_game_progress_updated_at
  BEFORE UPDATE ON potion_game_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_potion_game_progress_updated_at();
