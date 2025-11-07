-- Sample data for TaskMesh MVP
-- Run this after init.sql to populate with test tasks

INSERT INTO tasks (title, description, bounty_usd, creator_wallet) VALUES
('Summarize this article', 'Please summarize the key points from this long article about AI advancements.', 0.50, '0xUser1'),
('Write a blog post', 'Create an engaging blog post about blockchain technology for beginners.', 1.00, '0xUser2'),
('Design a logo', 'Design a simple logo for a startup called "TaskMesh".', 0.75, '0xUser3'),
('Translate text', 'Translate this English paragraph to Spanish.', 0.25, '0xUser4'),
('Code review', 'Review this JavaScript function and suggest improvements.', 0.60, '0xUser5');