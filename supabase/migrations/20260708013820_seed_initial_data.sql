-- ===== PLANS =====
INSERT INTO plans (name, duration_months, is_active, sort_order, shifts) VALUES
('Monthly', 1, true, 1, '[{"shiftName":"Morning","shiftTime":"6AM - 2PM","price":1500,"isActive":true},{"shiftName":"Evening","shiftTime":"2PM - 10PM","price":1500,"isActive":true},{"shiftName":"Night","shiftTime":"10PM - 6AM","price":1500,"isActive":true},{"shiftName":"Full Day","shiftTime":"24 Hours","price":2500,"isActive":true}]'::jsonb),
('6-Month', 6, true, 2, '[{"shiftName":"Morning","shiftTime":"6AM - 2PM","price":8100,"isActive":true},{"shiftName":"Evening","shiftTime":"2PM - 10PM","price":8100,"isActive":true},{"shiftName":"Night","shiftTime":"10PM - 6AM","price":8100,"isActive":true},{"shiftName":"Full Day","shiftTime":"24 Hours","price":13500,"isActive":true}]'::jsonb),
('Annual', 12, true, 3, '[{"shiftName":"Morning","shiftTime":"6AM - 2PM","price":15000,"isActive":true},{"shiftName":"Evening","shiftTime":"2PM - 10PM","price":15000,"isActive":true},{"shiftName":"Night","shiftTime":"10PM - 6AM","price":15000,"isActive":true},{"shiftName":"Full Day","shiftTime":"24 Hours","price":25000,"isActive":true}]'::jsonb)
ON CONFLICT DO NOTHING;

-- ===== ANNOUNCEMENTS =====
INSERT INTO announcements (title, body, category, is_published, is_pinned, published_at) VALUES
('Welcome to Pathshala Library',
'New to Pathshala? Visit our front desk for a free tour of the facility. Our staff will help you pick the right plan and shift for your study schedule. We are open 24/7 — drop by anytime!',
'notice', true, true, now()),
('Republic Day Holiday Schedule',
'On 26 January the library will remain open 24 hours as usual, but front desk support will be available only between 9 AM and 9 PM. Online bookings continue uninterrupted.',
'holiday', true, false, now()),
('New Personal Lockers Available',
'We have added 30 new personal lockers on the 9th floor. Reserve yours at the front desk for just ₹200/month. Limited availability — first come, first served.',
'event', true, false, now())
ON CONFLICT DO NOTHING;

-- ===== GALLERY =====
INSERT INTO gallery_images (url, caption, sort_order) VALUES
('https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Main study hall', 1),
('https://images.pexels.com/photos/256431/pexels-photo-256431.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Personal desk area', 2),
('https://images.pexels.com/photos/1370298/pexels-photo-1370298.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Quiet zone', 3),
('https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Reception area', 4),
('https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Study pods', 5)
ON CONFLICT DO NOTHING;

-- ===== DEFAULT ADMIN =====
INSERT INTO admins (name, email, password_hash, role)
SELECT 'Super Admin', 'admin@pathshaalalibrary.com', crypt('Pathshala@Admin123', gen_salt('bf', 12)), 'superadmin'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin@pathshaalalibrary.com');
