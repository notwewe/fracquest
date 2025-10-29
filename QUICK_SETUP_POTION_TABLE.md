# Quick Setup Guide - Potion Game Progress Table

## What Was Changed

Instead of just adding a column to `story_progress`, we created a **dedicated table** called `potion_game_progress` that tracks:

✅ Tutorial completion status
✅ Player scores and statistics  
✅ Potions brewed count
✅ Success/failure tracking
✅ Streak statistics
✅ Play time tracking
✅ Last played timestamp

## Run This SQL in Supabase

1. Go to your Supabase Dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of `create-potion-game-progress-table.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

The SQL file contains:
- Table creation with all columns
- Row Level Security (RLS) policies
- Database indexes for performance
- Auto-update trigger for `updated_at` column
- Permissions for students and teachers

## What The Table Tracks

| Column | Description |
|--------|-------------|
| `has_seen_tutorial` | Replaces the old `has_seen_potion_tutorial` |
| `total_score` | Cumulative score (10 points per potion) |
| `potions_brewed` | Total successful completions |
| `perfect_potions` | Count of perfect brews |
| `failed_attempts` | Number of failures |
| `highest_streak` | Best consecutive success run |
| `current_streak` | Current consecutive successes |
| `total_time_played` | Time in seconds |
| `last_played_at` | Last session timestamp |

## How It Works Now

### First Play
1. Player opens game → No record exists
2. System creates new record with all values at 0
3. Tutorial shows (has_seen_tutorial = false)
4. Player completes tutorial
5. has_seen_tutorial = true
6. Game starts, stats begin tracking

### Returning Play
1. Player opens game → Record exists
2. System loads: score, potions brewed, streak
3. Tutorial skipped (has_seen_tutorial = true)
4. Game starts with previous stats
5. Stats continue accumulating

### During Game
- **Success**: Score +10, Potions +1, Streak +1
- **Failure**: Failed attempts +1, Streak reset to 0
- **All changes auto-save to database**

## Testing

After running the SQL:

1. Open Potion Master game
2. Complete tutorial
3. Go to Supabase → Table Editor → potion_game_progress
4. You should see a new row with your user ID
5. Reload game → Tutorial should be skipped
6. Play a few rounds and watch stats update in real-time

## Teachers View

Teachers can see all students' progress for:
- Identifying struggling students (high failed_attempts)
- Recognizing top performers (highest scores/streaks)
- Tracking engagement (last_played_at, total_time_played)

## Files Changed

1. ✅ `create-potion-game-progress-table.sql` - Run this in Supabase
2. ✅ `lib/database.types.ts` - TypeScript types updated
3. ✅ `components/game/potion-master-game.tsx` - Full stats tracking
4. ✅ `POTION_TUTORIAL_IMPLEMENTATION.md` - Complete documentation

---

**Next Step:** Run the SQL file in Supabase and you're done!
