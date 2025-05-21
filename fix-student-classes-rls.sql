-- Disable RLS temporarily
ALTER TABLE student_classes DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert student_classes" ON student_classes;
DROP POLICY IF EXISTS "Students can view own enrollments" ON student_classes;
DROP POLICY IF EXISTS "Teachers can view class enrollments" ON student_classes;
DROP POLICY IF EXISTS "Students can leave own enrollments" ON student_classes;
DROP POLICY IF EXISTS "Teachers can remove students" ON student_classes;

-- Create new policies
-- Allow anyone to insert into student_classes (for registration)
CREATE POLICY "Anyone can insert student_classes" 
ON student_classes FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow students to view their own enrollments
CREATE POLICY "Students can view own enrollments" 
ON student_classes FOR SELECT 
TO authenticated
USING (student_id = auth.uid());

-- Allow teachers to view enrollments for their classes
CREATE POLICY "Teachers can view class enrollments" 
ON student_classes FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = class_id
    AND classes.teacher_id = auth.uid()
  )
);

-- Allow students to leave classes
CREATE POLICY "Students can leave own enrollments" 
ON student_classes FOR DELETE 
TO authenticated
USING (student_id = auth.uid());

-- Allow teachers to remove students from their classes
CREATE POLICY "Teachers can remove students" 
ON student_classes FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = class_id
    AND classes.teacher_id = auth.uid()
  )
);

-- Re-enable RLS
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
