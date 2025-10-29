-- Delete all entries from potion_game_progress table
-- WARNING: This will permanently delete all potion game progress data

DELETE FROM potion_game_progress;

-- Optional: Reset the ID sequence if you want IDs to start from 1 again
ALTER SEQUENCE potion_game_progress_id_seq RESTART WITH 1;

-- Verify deletion
SELECT COUNT(*) as remaining_records FROM potion_game_progress;
