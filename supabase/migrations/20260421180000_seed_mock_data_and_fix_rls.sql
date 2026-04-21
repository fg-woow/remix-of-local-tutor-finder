-- ================================================
-- Migration: Seed mock data & fix booking visibility
-- Run this in Supabase SQL Editor
-- ================================================

-- ==========================================
-- 1. Fix Bookings RLS: Allow anyone to see
--    booked time slots (for availability check)
-- ==========================================
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- Authenticated users can see all bookings (needed for availability checks)
CREATE POLICY "Authenticated users can view bookings" ON public.bookings
    FOR SELECT USING (auth.role() = 'authenticated');

-- ==========================================
-- 2. Add latitude/longitude to profiles
-- ==========================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS offers_trial boolean DEFAULT false;

-- ==========================================
-- 3. Insert mock tutor profiles
--    Uses INSERT ... ON CONFLICT to be safe
-- ==========================================

-- We need to insert into auth.users first for FK, but since we can't
-- do that with anon key, we'll insert profiles with ON CONFLICT DO NOTHING
-- and skip the FK check by temporarily disabling it.

-- Sarah Mitchell
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000001-0000-0000-0000-000000000000',
    'sarah.mitchell@tutorfinder.demo',
    'Sarah Mitchell',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    ARRAY['Mathematics', 'Physics'],
    'Manhattan, NY',
    'Passionate math teacher with 8 years of experience helping students excel. I specialize in making complex concepts simple and engaging.',
    45,
    ARRAY['Weekdays', 'Evenings'],
    '8 years',
    ARRAY['High School', 'University'],
    ARRAY['Exam Preparation', 'Beginners'],
    'M.Sc. Mathematics, Columbia University',
    ARRAY['New York Teaching License', 'AP Calculus Certified'],
    ARRAY['Algebra', 'Calculus', 'Trigonometry', 'Linear Algebra', 'Mechanics'],
    40.7580, -73.9855,
    true
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects,
    location = EXCLUDED.location,
    bio = EXCLUDED.bio,
    hourly_rate = EXCLUDED.hourly_rate,
    availability = EXCLUDED.availability,
    experience = EXCLUDED.experience,
    teaching_levels = EXCLUDED.teaching_levels,
    suitable_for = EXCLUDED.suitable_for,
    education = EXCLUDED.education,
    certificates = EXCLUDED.certificates,
    course_topics = EXCLUDED.course_topics,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    offers_trial = EXCLUDED.offers_trial;

-- David Chen
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000002-0000-0000-0000-000000000000',
    'david.chen@tutorfinder.demo',
    'David Chen',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    ARRAY['Chemistry', 'Biology'],
    'Brooklyn, NY',
    'Former research scientist turned educator. I bring real-world applications to every lesson to make science come alive.',
    50,
    ARRAY['Weekends', 'Mornings'],
    '6 years',
    ARRAY['High School', 'University'],
    ARRAY['Exam Preparation', 'Advanced Students'],
    'Ph.D. Chemistry, NYU',
    ARRAY['ACS Certified Chemist', 'Biology Subject Expert'],
    ARRAY['Organic Chemistry', 'Biochemistry', 'Cell Biology', 'Genetics'],
    40.6782, -73.9442,
    false
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;

-- Emily Rodriguez
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000003-0000-0000-0000-000000000000',
    'emily.rodriguez@tutorfinder.demo',
    'Emily Rodriguez',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    ARRAY['English', 'Literature', 'Writing'],
    'Queens, NY',
    'Published author and English teacher. I help students find their voice and develop strong communication skills.',
    40,
    ARRAY['Flexible'],
    '10 years',
    ARRAY['Middle School', 'High School', 'University'],
    ARRAY['Exam Preparation', 'Beginners', 'Advanced Students'],
    'M.F.A. Creative Writing, Iowa Writers Workshop',
    ARRAY['TESOL Certification', 'Published Author'],
    ARRAY['Creative Writing', 'Essay Writing', 'SAT Prep', 'Poetry', 'Literature Analysis'],
    40.7282, -73.7949,
    true
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;

-- Marcus Johnson
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000004-0000-0000-0000-000000000000',
    'marcus.johnson@tutorfinder.demo',
    'Marcus Johnson',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    ARRAY['Computer Science', 'Programming'],
    'San Francisco, CA',
    'Software engineer at a top tech company. I teach coding fundamentals to advanced algorithms with hands-on projects.',
    65,
    ARRAY['Evenings', 'Weekends'],
    '5 years',
    ARRAY['High School', 'University', 'Adult Learner'],
    ARRAY['Beginners', 'Advanced Students', 'Engineering Students'],
    'B.S. Computer Science, Stanford',
    ARRAY['AWS Certified', 'Google Developer Expert'],
    ARRAY['Python', 'JavaScript', 'React', 'Data Structures', 'Algorithms'],
    37.7749, -122.4194,
    true
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;

-- Lisa Park
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000005-0000-0000-0000-000000000000',
    'lisa.park@tutorfinder.demo',
    'Lisa Park',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    ARRAY['Korean', 'Japanese'],
    'Los Angeles, CA',
    'Native Korean speaker with Japanese fluency. I make language learning fun through cultural immersion and conversation practice.',
    35,
    ARRAY['Weekdays', 'Mornings'],
    '4 years',
    ARRAY['High School', 'University', 'Adult Learner'],
    ARRAY['Beginners', 'Language Learners'],
    'B.A. East Asian Languages, UCLA',
    ARRAY['TOPIK Level 6', 'JLPT N1'],
    ARRAY['Korean Conversation', 'Japanese Reading', 'K-Pop Culture', 'Travel Korean'],
    34.0522, -118.2437,
    false
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;

-- James Wilson
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000006-0000-0000-0000-000000000000',
    'james.wilson@tutorfinder.demo',
    'James Wilson',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    ARRAY['History', 'Geography'],
    'Chicago, IL',
    'History professor with a knack for storytelling. I bring the past to life and help students understand how it shapes our present.',
    42,
    ARRAY['Afternoons', 'Weekends'],
    '12 years',
    ARRAY['Middle School', 'High School', 'University'],
    ARRAY['Exam Preparation', 'Beginners'],
    'Ph.D. History, University of Chicago',
    ARRAY['Teaching Excellence Award', 'Published Historian'],
    ARRAY['World History', 'US History', 'Ancient Civilizations', 'Modern Geopolitics'],
    41.8781, -87.6298,
    false
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;

-- Aisha Patel
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000007-0000-0000-0000-000000000000',
    'aisha.patel@tutorfinder.demo',
    'Aisha Patel',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    ARRAY['Mathematics', 'Computer Science'],
    'Boston, MA',
    'MIT graduate with a passion for teaching STEM. I specialize in preparing students for AP exams and college-level math courses.',
    55,
    ARRAY['Weekdays', 'Evenings'],
    '7 years',
    ARRAY['High School', 'University'],
    ARRAY['Exam Preparation', 'Advanced Students', 'Engineering Students'],
    'M.S. Applied Mathematics, MIT',
    ARRAY['AP Certified Instructor', 'Math Olympiad Coach'],
    ARRAY['AP Calculus', 'AP Statistics', 'Discrete Math', 'Machine Learning Basics'],
    42.3601, -71.0589,
    true
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;

-- Carlos Mendez
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000008-0000-0000-0000-000000000000',
    'carlos.mendez@tutorfinder.demo',
    'Carlos Mendez',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    ARRAY['Spanish', 'French'],
    'Los Angeles, CA',
    'Trilingual language specialist from Barcelona. I use immersive conversation-based teaching methods to get you fluent fast.',
    38,
    ARRAY['Mornings', 'Afternoons', 'Weekdays'],
    '3 years',
    ARRAY['Middle School', 'High School', 'Adult Learner'],
    ARRAY['Beginners', 'Language Learners'],
    'B.A. Romance Languages, Barcelona University',
    ARRAY['DELE C2 Certified', 'DALF C1'],
    ARRAY['Spanish Conversation', 'French Grammar', 'Business Spanish', 'Travel French'],
    34.0522, -118.2437,
    true
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;

-- Dr. Rachel Kim
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000009-0000-0000-0000-000000000000',
    'rachel.kim@tutorfinder.demo',
    'Dr. Rachel Kim',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    ARRAY['Biology', 'Chemistry'],
    'Seattle, WA',
    'Medical doctor and biology professor. I turn complex scientific concepts into intuitive, memorable lessons with clinical examples.',
    80,
    ARRAY['Weekends', 'Evenings'],
    '15 years',
    ARRAY['University', 'Adult Learner'],
    ARRAY['Exam Preparation', 'Medical Students', 'Advanced Students'],
    'M.D., University of Washington',
    ARRAY['Board Certified MD', 'University Teaching Award'],
    ARRAY['Human Anatomy', 'Physiology', 'Biochemistry', 'MCAT Prep'],
    47.6062, -122.3321,
    false
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;

-- Oliver Thompson
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000010-0000-0000-0000-000000000000',
    'oliver.thompson@tutorfinder.demo',
    'Oliver Thompson',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    ARRAY['Music', 'Art'],
    'Chicago, IL',
    'Professional musician and visual artist. I nurture creative expression through personalized lessons in piano, guitar, and mixed media art.',
    30,
    ARRAY['Flexible'],
    '9 years',
    ARRAY['Primary School', 'Middle School', 'High School', 'Adult Learner'],
    ARRAY['Beginners', 'Hobbyists'],
    'B.F.A. Music Performance, Juilliard',
    ARRAY['ABRSM Grade 8 Piano', 'Certified Art Instructor'],
    ARRAY['Piano', 'Guitar', 'Music Theory', 'Oil Painting', 'Digital Art'],
    41.8781, -87.6298,
    true
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;

-- Natalie Foster
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000011-0000-0000-0000-000000000000',
    'natalie.foster@tutorfinder.demo',
    'Natalie Foster',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    ARRAY['Physics', 'Mathematics'],
    'Manhattan, NY',
    'PhD in Theoretical Physics from Columbia. I transform abstract physics into visual, intuitive concepts using simulations and real-world demos.',
    70,
    ARRAY['Weekdays', 'Mornings'],
    '6 years',
    ARRAY['High School', 'University'],
    ARRAY['Exam Preparation', 'Advanced Students', 'Engineering Students'],
    'Ph.D. Theoretical Physics, Columbia University',
    ARRAY['Physics Teaching Fellow', 'APS Member'],
    ARRAY['Quantum Mechanics', 'Electromagnetism', 'Thermodynamics', 'AP Physics'],
    40.7580, -73.9855,
    false
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;

-- Tyler Brooks
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, subjects, location, bio, hourly_rate, availability, experience, teaching_levels, suitable_for, education, certificates, course_topics, latitude, longitude, offers_trial)
VALUES (
    '00000012-0000-0000-0000-000000000000',
    'tyler.brooks@tutorfinder.demo',
    'Tyler Brooks',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    ARRAY['Programming', 'Computer Science'],
    'San Francisco, CA',
    'Full-stack developer and coding bootcamp instructor. I teach Python, JavaScript, React, and help beginners build their first apps from scratch.',
    60,
    ARRAY['Evenings', 'Weekends'],
    '4 years',
    ARRAY['University', 'Adult Learner'],
    ARRAY['Beginners', 'Engineering Students'],
    'B.S. Software Engineering, UC Berkeley',
    ARRAY['Hack Reactor Graduate', 'AWS Solutions Architect'],
    ARRAY['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    37.7749, -122.4194,
    true
)
ON CONFLICT (user_id) DO UPDATE SET
    subjects = EXCLUDED.subjects, location = EXCLUDED.location, bio = EXCLUDED.bio, hourly_rate = EXCLUDED.hourly_rate, availability = EXCLUDED.availability, experience = EXCLUDED.experience, teaching_levels = EXCLUDED.teaching_levels, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, education = EXCLUDED.education, certificates = EXCLUDED.certificates, course_topics = EXCLUDED.course_topics, suitable_for = EXCLUDED.suitable_for, offers_trial = EXCLUDED.offers_trial;


-- ==========================================
-- 4. Insert mock reviews
-- ==========================================

-- Reviews for Sarah Mitchell (tutor 1)
INSERT INTO public.reviews (tutor_id, student_id, student_name, rating, comment, created_at) VALUES
('00000001-0000-0000-0000-000000000000', '00000002-0000-0000-0000-000000000000', 'Alice Johnson', 5, 'Sarah is an amazing tutor! She helped me pass my Calculus exam with flying colors. Her teaching method is very clear.', '2026-03-10T10:00:00Z'),
('00000001-0000-0000-0000-000000000000', '00000003-0000-0000-0000-000000000000', 'Mike Peters', 5, 'Very patient and clear explanations. She breaks down complex problems into manageable steps. Highly recommended.', '2026-02-15T14:30:00Z'),
('00000001-0000-0000-0000-000000000000', '00000004-0000-0000-0000-000000000000', 'Jordan Blake', 4, 'Good tutor for high school math. Helped me get from a C to an A-. Would have liked a bit more practice material.', '2026-01-20T09:00:00Z')
ON CONFLICT DO NOTHING;

-- Reviews for David Chen (tutor 2)
INSERT INTO public.reviews (tutor_id, student_id, student_name, rating, comment, created_at) VALUES
('00000002-0000-0000-0000-000000000000', '00000001-0000-0000-0000-000000000000', 'Tom Wilson', 5, 'Great chemistry tutor. I finally understand organic chemistry thanks to his real-world examples.', '2026-01-20T16:00:00Z'),
('00000002-0000-0000-0000-000000000000', '00000005-0000-0000-0000-000000000000', 'Priya Sharma', 4, 'Really knowledgeable in biology. Made genetics easy to understand with diagrams.', '2026-02-05T11:00:00Z')
ON CONFLICT DO NOTHING;

-- Reviews for Emily Rodriguez (tutor 3)
INSERT INTO public.reviews (tutor_id, student_id, student_name, rating, comment, created_at) VALUES
('00000003-0000-0000-0000-000000000000', '00000006-0000-0000-0000-000000000000', 'Sarah Kim', 5, 'Emily transformed my essay writing skills completely. A true mentor who cares about her students.', '2026-03-01T08:00:00Z'),
('00000003-0000-0000-0000-000000000000', '00000007-0000-0000-0000-000000000000', 'Jake Morrison', 5, 'Best English tutor I''ve ever had. Really engaging lessons and great feedback on my work.', '2026-02-10T15:00:00Z'),
('00000003-0000-0000-0000-000000000000', '00000008-0000-0000-0000-000000000000', 'Mia Chen', 5, 'Emily helped me improve my SAT verbal score by 200 points! She really knows how to prepare for standardized tests.', '2026-03-15T10:00:00Z')
ON CONFLICT DO NOTHING;

-- Reviews for Marcus Johnson (tutor 4)
INSERT INTO public.reviews (tutor_id, student_id, student_name, rating, comment, created_at) VALUES
('00000004-0000-0000-0000-000000000000', '00000009-0000-0000-0000-000000000000', 'Daniel Park', 5, 'Marcus helped me land my first software engineering job. His mentorship was invaluable for learning algorithms.', '2026-01-15T13:00:00Z'),
('00000004-0000-0000-0000-000000000000', '00000010-0000-0000-0000-000000000000', 'Sophia Lee', 4, 'Great at explaining coding concepts. Built my first React app in just 3 sessions!', '2026-02-20T09:30:00Z')
ON CONFLICT DO NOTHING;

-- Reviews for Lisa Park (tutor 5)
INSERT INTO public.reviews (tutor_id, student_id, student_name, rating, comment, created_at) VALUES
('00000005-0000-0000-0000-000000000000', '00000001-0000-0000-0000-000000000000', 'Emma Watson', 4, 'Lisa''s cultural approach to language learning is unique and effective. I can now hold basic Korean conversations!', '2026-02-20T17:00:00Z'),
('00000005-0000-0000-0000-000000000000', '00000003-0000-0000-0000-000000000000', 'Chris Anderson', 5, 'Amazing Japanese tutor. She makes grammar fun with anime references and cultural tidbits.', '2026-03-05T14:00:00Z')
ON CONFLICT DO NOTHING;

-- Reviews for Dr. Rachel Kim (tutor 9)
INSERT INTO public.reviews (tutor_id, student_id, student_name, rating, comment, created_at) VALUES
('00000009-0000-0000-0000-000000000000', '00000004-0000-0000-0000-000000000000', 'Jessica Liu', 5, 'Dr. Kim''s biology lessons are phenomenal. She uses clinical cases to explain concepts. Perfect for pre-med students.', '2026-03-08T10:00:00Z'),
('00000009-0000-0000-0000-000000000000', '00000006-0000-0000-0000-000000000000', 'Mark Thompson', 5, 'Best tutor I''ve ever worked with. Her MCAT prep was incredibly thorough. Worth every penny.', '2026-02-22T16:30:00Z'),
('00000009-0000-0000-0000-000000000000', '00000008-0000-0000-0000-000000000000', 'Aiden Brooks', 5, 'Incredible depth of knowledge. She made biochemistry click for me in ways my college professor never could.', '2026-01-30T12:00:00Z')
ON CONFLICT DO NOTHING;

-- Reviews for Tyler Brooks (tutor 12)
INSERT INTO public.reviews (tutor_id, student_id, student_name, rating, comment, created_at) VALUES
('00000012-0000-0000-0000-000000000000', '00000001-0000-0000-0000-000000000000', 'Hannah Lee', 5, 'Tyler taught me React from zero. I built my portfolio site in 3 weeks! Great project-based approach.', '2026-03-09T11:00:00Z'),
('00000012-0000-0000-0000-000000000000', '00000005-0000-0000-0000-000000000000', 'Sam Rodriguez', 4, 'Great coding tutor. Very patient with beginners. Helped me debug issues I was stuck on for days.', '2026-02-18T15:30:00Z')
ON CONFLICT DO NOTHING;
