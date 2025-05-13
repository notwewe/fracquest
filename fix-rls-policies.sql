-- Enable RLS on tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Teachers can create classes" ON classes;
DROP POLICY IF EXISTS "Teachers can view their own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can update their own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can delete their own classes" ON classes;
DROP POLICY IF EXISTS "Students can view classes they are enrolled in" ON classes;
DROP POLICY IF EXISTS "Anyone can view classes" ON classes;

DROP POLICY IF EXISTS "Students can view their enrollments" ON student_classes;
DROP POLICY IF EXISTS "Teachers can view enrollments for their classes" ON student_classes;
DROP POLICY IF EXISTS "Students can join classes" ON student_classes;
DROP POLICY IF EXISTS "Students can leave classes" ON student_classes;
DROP POLICY IF EXISTS "Teachers can remove students" ON student_classes;
DROP POLICY IF EXISTS "Anyone can view student_classes" ON student_classes;

-- Create simple policies for classes table
-- 1. Allow teachers to create classes
CREATE POLICY "Teachers can create classes"
ON classes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role_id = 2
  )
);

-- 2. Allow teachers to view their own classes (no joins to avoid recursion)
CREATE POLICY "Teachers can view own classes"
ON classes FOR SELECT
TO authenticated
USING (teacher_id = auth.uid());

-- 3. Allow students to view classes they're enrolled in (separate policy)
CREATE POLICY "Students can view enrolled classes"
ON classes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM student_classes
    WHERE student_classes.class_id = id
    AND student_classes.student_id = auth.uid()
  )
);

-- 4. Allow teachers to update their own classes
CREATE POLICY "Teachers can update own classes"
ON classes FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- 5. Allow teachers to delete their own classes
CREATE POLICY "Teachers can delete own classes"
ON classes FOR DELETE
TO authenticated
USING (teacher_id = auth.uid());

-- Create simple policies for student_classes table
-- 1. Allow students to view their own enrollments
CREATE POLICY "Students can view own enrollments"
ON student_classes FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- 2. Allow teachers to view enrollments for their classes (no joins to avoid recursion)
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

-- 3. Allow students to join classes
CREATE POLICY "Students can join classes"
ON student_classes FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role_id = 1
  )
);

-- 4. Allow students to leave classes
CREATE POLICY "Students can leave own enrollments"
ON student_classes FOR DELETE
TO authenticated
USING (student_id = auth.uid());

-- 5. Allow teachers to remove students from their classes
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

-- Create policies for profiles table if needed
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON classes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON student_classes TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;
