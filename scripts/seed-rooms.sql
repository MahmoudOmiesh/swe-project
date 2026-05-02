-- Seed 24 rooms across 3 floors (8 per floor)
-- Matches the layout from the original mock data
--
-- Room numbering: floor×100 + room (101-108, 201-208, 301-308)
-- Types:  single = 300/night, double = 450/night, suite = 750/night
-- Most rooms start clean (service_mode = NULL). A few are set to
-- cleaning or maintenance so the UI has something to show immediately.

INSERT INTO rooms (room_number, type, floor, capacity, rate_per_night, service_mode, maintenance_note)
VALUES
  -- Floor 1
  ('101', 'double', 1, 2, 450, NULL,           NULL),
  ('102', 'single', 1, 1, 300, NULL,           NULL),
  ('103', 'single', 1, 1, 300, NULL,           NULL),
  ('104', 'double', 1, 2, 450, 'cleaning',     NULL),
  ('105', 'single', 1, 1, 300, NULL,           NULL),
  ('106', 'double', 1, 2, 450, NULL,           NULL),
  ('107', 'single', 1, 1, 300, NULL,           NULL),
  ('108', 'double', 1, 2, 450, 'maintenance',  'AC repair — est. 2 days'),

  -- Floor 2
  ('201', 'double', 2, 2, 450, NULL,           NULL),
  ('202', 'suite',  2, 3, 750, NULL,           NULL),
  ('203', 'double', 2, 2, 450, NULL,           NULL),
  ('204', 'single', 2, 1, 300, 'cleaning',     NULL),
  ('205', 'double', 2, 2, 450, NULL,           NULL),
  ('206', 'double', 2, 2, 450, NULL,           NULL),
  ('207', 'single', 2, 1, 300, NULL,           NULL),
  ('208', 'double', 2, 2, 450, NULL,           NULL),

  -- Floor 3
  ('301', 'double', 3, 2, 450, NULL,           NULL),
  ('302', 'double', 3, 2, 450, NULL,           NULL),
  ('303', 'suite',  3, 3, 750, 'maintenance',  'Plumbing — est. 3 days'),
  ('304', 'single', 3, 1, 300, NULL,           NULL),
  ('305', 'suite',  3, 3, 750, NULL,           NULL),
  ('306', 'double', 3, 2, 450, 'cleaning',     NULL),
  ('307', 'double', 3, 2, 450, NULL,           NULL),
  ('308', 'single', 3, 1, 300, NULL,           NULL)
ON CONFLICT (room_number) DO NOTHING;
