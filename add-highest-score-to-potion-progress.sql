-- Add highest_score column to potion_game_progress table
ALTER TABLE potion_game_progress 
ADD COLUMN IF NOT EXISTS highest_score INTEGER DEFAULT 0 NOT NULL;

-- Update existing records to set highest_score equal to current total_score
UPDATE potion_game_progress 
SET highest_score = total_score 
WHERE highest_score = 0 AND total_score > 0;
