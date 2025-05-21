-- Insert waypoints for Arithmetown (section_id = 1)
INSERT INTO waypoints (section_id, name, description, type, order_index, required_waypoint_id)
VALUES 
(1, 'Fraction Basics', 'Learn what fractions are and how they work', 'intro', 1, NULL),
(1, 'Improper to Mixed', 'Convert between improper fractions and mixed numbers', 'intro', 2, 1),
(1, 'Addition Intro', 'Learn how to add fractions with the same denominator', 'intro', 3, 2),
(1, 'Improper/Mixed Game', 'Practice converting between improper fractions and mixed numbers', 'game', 4, 3),
(1, 'Addition Game', 'Practice adding fractions with the same denominator', 'game', 5, 4);

-- Insert waypoints for Lessmorre Bridge (section_id = 2)
INSERT INTO waypoints (section_id, name, description, type, order_index, required_waypoint_id)
VALUES 
(2, 'Subtraction Intro', 'Learn how to subtract fractions with the same denominator', 'intro', 1, 5),
(2, 'Subtraction Game', 'Practice subtracting fractions with the same denominator', 'game', 2, 6),
(2, 'Different Denominators', 'Learn how to subtract fractions with different denominators', 'intro', 3, 7),
(2, 'Advanced Subtraction', 'Practice subtracting fractions with different denominators', 'game', 4, 8),
(2, 'Bridge Boss', 'Test your subtraction skills', 'boss', 5, 9);

-- Insert waypoints for Fraction Forest (section_id = 3)
INSERT INTO waypoints (section_id, name, description, type, order_index, required_waypoint_id)
VALUES 
(3, 'Ordering Intro', 'Learn how to arrange fractions in order', 'intro', 1, 10),
(3, 'Ordering Game', 'Practice arranging fractions in order', 'game', 2, 11),
(3, 'Equivalent Fractions', 'Learn about equivalent fractions', 'intro', 3, 12),
(3, 'Equivalence Game', 'Practice finding equivalent fractions', 'game', 4, 13),
(3, 'Forest Boss', 'Test your ordering skills', 'boss', 5, 14);

-- Insert waypoints for Realm of Balance (section_id = 4)
INSERT INTO waypoints (section_id, name, description, type, order_index, required_waypoint_id)
VALUES 
(4, 'Comparison Intro', 'Learn how to compare fractions using >, <, and =', 'intro', 1, 15),
(4, 'Comparison Game', 'Practice comparing fractions', 'game', 2, 16),
(4, 'Advanced Comparison', 'Compare complex fractions and mixed numbers', 'intro', 3, 17),
(4, 'Advanced Game', 'Practice advanced fraction comparisons', 'game', 4, 18),
(4, 'Balance Boss', 'Test your comparison skills', 'boss', 5, 19);

-- Insert waypoints for Dreadpoint Hollow (section_id = 5)
INSERT INTO waypoints (section_id, name, description, type, order_index, required_waypoint_id)
VALUES 
(5, 'Final Challenge', 'The ultimate test of all your fraction skills', 'boss', 1, 20);
