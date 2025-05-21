-- Create a function to safely create classes
CREATE OR REPLACE FUNCTION create_class(
  p_name TEXT,
  p_description TEXT,
  p_teacher_id UUID,
  p_class_code TEXT
) RETURNS JSONB AS $$
DECLARE
  v_created_class JSONB;
BEGIN
  -- Insert the new class
  INSERT INTO classes (
    name, 
    description, 
    teacher_id, 
    class_code, 
    created_at, 
    updated_at
  )
  VALUES (
    p_name, 
    p_description, 
    p_teacher_id, 
    p_class_code, 
    NOW(), 
    NOW()
  )
  RETURNING to_jsonb(classes.*) INTO v_created_class;
  
  RETURN v_created_class;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_class TO authenticated;
