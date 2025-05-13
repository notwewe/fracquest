-- Drop existing policies on classes table to avoid conflicts
DROP POLICY IF EXISTS "Teachers can create classes" ON classes;
DROP POLICY IF EXISTS "Teachers can view their own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can update their own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can delete their own classes" ON classes;
DROP POLICY IF EXISTS "Students can view classes they are enrolled in" ON classes;

-- Create simplified policies that avoid recursion
CREATE POLICY "Teachers can create classes"
ON classes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role_id = 2
  )
);

CREATE POLICY "Teachers can view their own classes"
ON classes FOR SELECT
TO authenticated
USING (
  (teacher_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM student_classes
    WHERE student_classes.class_id = classes.id
    AND student_classes.student_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update their own classes"
ON classes FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own classes"
ON classes FOR DELETE
TO authenticated
USING (teacher_id = auth.uid());
