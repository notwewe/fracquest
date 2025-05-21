-- Function to refresh student progress
CREATE OR REPLACE FUNCTION refresh_student_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a no-op function that just returns success
  -- It's used as a signal to refresh the client-side cache
  RETURN;
END;
$$;
