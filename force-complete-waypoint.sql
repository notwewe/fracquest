-- Function to force complete a waypoint
CREATE OR REPLACE FUNCTION force_complete_waypoint(p_student_id TEXT, p_waypoint_id INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if a record exists
  IF EXISTS (
    SELECT 1 FROM student_progress 
    WHERE student_id = p_student_id AND waypoint_id = p_waypoint_id
  ) THEN
    -- Update existing record
    UPDATE student_progress
    SET 
      completed = TRUE,
      score = 100,
      last_updated = NOW()
    WHERE 
      student_id = p_student_id AND 
      waypoint_id = p_waypoint_id;
  ELSE
    -- Insert new record
    INSERT INTO student_progress (
      student_id, 
      waypoint_id, 
      completed, 
      score, 
      last_updated
    ) VALUES (
      p_student_id,
      p_waypoint_id,
      TRUE,
      100,
      NOW()
    );
  END IF;
  
  -- Return success
  RETURN;
END;
$$;
