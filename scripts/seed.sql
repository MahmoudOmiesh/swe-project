-- =============================================================================
-- Hotel Management System — Seed Data
-- =============================================================================
-- Run:  psql "$DATABASE_URL" -f scripts/seed.sql
--
-- All dates are relative to CURRENT_DATE / NOW() so the data is always fresh.
-- Designed to populate every page: dashboard, rooms, bookings, check-in,
-- check-out, billing, reports, housekeeping, and suppliers.
--
-- Does NOT seed auth users — create those via the app sign-up flow.
-- =============================================================================

BEGIN;

-- ─── Wipe existing business data (preserve auth tables) ─────────────────────

TRUNCATE
  reservation_services,
  bills,
  reservations,
  guests,
  housekeeping_tasks,
  supplier_orders,
  suppliers,
  services,
  rooms
CASCADE;

-- Reset identity sequences so IDs start from 1
ALTER SEQUENCE rooms_id_seq              RESTART WITH 1;
ALTER SEQUENCE guests_id_seq             RESTART WITH 1;
ALTER SEQUENCE reservations_id_seq       RESTART WITH 1;
ALTER SEQUENCE bills_id_seq              RESTART WITH 1;
ALTER SEQUENCE services_id_seq           RESTART WITH 1;
ALTER SEQUENCE reservation_services_id_seq RESTART WITH 1;
ALTER SEQUENCE housekeeping_tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE suppliers_id_seq          RESTART WITH 1;
ALTER SEQUENCE supplier_orders_id_seq    RESTART WITH 1;

-- =============================================================================
-- 1. ROOMS  (24 rooms, 3 floors, 8 per floor)
-- =============================================================================
-- Types: single (300/night), double (450/night), suite (750/night)
-- A few rooms in cleaning/maintenance so every status shows on the rooms page.

INSERT INTO rooms (room_number, type, floor, capacity, rate_per_night, service_mode, maintenance_note) VALUES
  -- Floor 1
  ('101', 'double', 1, 2, 450, NULL,          NULL),
  ('102', 'single', 1, 1, 300, NULL,          NULL),
  ('103', 'single', 1, 1, 300, NULL,          NULL),
  ('104', 'double', 1, 2, 450, 'cleaning',    NULL),
  ('105', 'single', 1, 1, 300, NULL,          NULL),
  ('106', 'double', 1, 2, 450, NULL,          NULL),
  ('107', 'single', 1, 1, 300, NULL,          NULL),
  ('108', 'double', 1, 2, 450, NULL,          NULL),
  -- Floor 2
  ('201', 'double', 2, 2, 450, NULL,          NULL),
  ('202', 'suite',  2, 3, 750, NULL,          NULL),
  ('203', 'double', 2, 2, 450, NULL,          NULL),
  ('204', 'single', 2, 1, 300, 'cleaning',    NULL),
  ('205', 'double', 2, 2, 450, NULL,          NULL),
  ('206', 'double', 2, 2, 450, NULL,          NULL),
  ('207', 'single', 2, 1, 300, NULL,          NULL),
  ('208', 'double', 2, 2, 450, NULL,          NULL),
  -- Floor 3
  ('301', 'double', 3, 2, 450, NULL,          NULL),
  ('302', 'double', 3, 2, 450, NULL,          NULL),
  ('303', 'suite',  3, 3, 750, 'maintenance', 'Plumbing leak — est. 3 days'),
  ('304', 'single', 3, 1, 300, NULL,          NULL),
  ('305', 'suite',  3, 3, 750, NULL,          NULL),
  ('306', 'double', 3, 2, 450, 'cleaning',    NULL),
  ('307', 'double', 3, 2, 450, NULL,          NULL),
  ('308', 'single', 3, 1, 300, NULL,          NULL);

-- =============================================================================
-- 2. SERVICES
-- =============================================================================

INSERT INTO services (name, price) VALUES
  ('Breakfast',         50.00),
  ('Airport Transfer', 150.00),
  ('Laundry',           40.00),
  ('Extra Bed',         80.00),
  ('Room Service',      60.00),
  ('Mini Bar',         100.00);

-- =============================================================================
-- 3. GUESTS  (22 guests, 6 loyal)
-- =============================================================================

INSERT INTO guests (first_name, last_name, nationality_id, phone, address, dob, is_loyal) VALUES
  -- Loyal guests
  ('Ahmed',    'Kamel',     'EG-29001011234567', '+20 100 123 4567', '12 Nile Corniche, Cairo',       '1985-03-15', true),
  ('Sara',     'Ramadan',   'EG-29205061234567', '+20 101 234 5678', '45 El-Moez St, Islamic Cairo',  '1992-05-06', true),
  ('Omar',     'Saad',      'EG-28807221234567', '+20 102 345 6789', '8 Tahrir Square, Downtown',     '1988-07-22', true),
  ('Layla',    'Ibrahim',   'EG-29503141234567', '+20 103 456 7890', '33 Zamalek St, Zamalek',        '1995-03-14', true),
  ('Khaled',   'Amin',      'EG-28010101234567', '+20 104 567 8901', '7 Salah Salem, Heliopolis',     '1980-01-10', true),
  ('Rania',    'Mostafa',   'EG-29108191234567', '+20 105 678 9012', '21 Pyramid Rd, Giza',           '1991-08-19', true),

  -- Regular guests
  ('Mohamed',  'Hassan',    'EG-29306251234567', '+20 106 789 0123', '14 Port Said St, Mansoura',     '1993-06-25', false),
  ('Nour',     'Hamdy',     'EG-29704101234567', '+20 107 890 1234', '56 Corniche Rd, Alexandria',    '1997-04-10', false),
  ('Tarek',    'Fawzy',     'EG-28512301234567', '+20 108 901 2345', '9 El-Horreya St, Tanta',        '1985-12-30', false),
  ('Dina',     'Sherif',    'EG-29909151234567', '+20 109 012 3456', '3 26th July St, Mohandessin',   '1999-09-15', false),
  ('Youssef',  'Adel',      'EG-29211051234567', '+20 110 123 4568', '18 Ramses St, Downtown',        '1992-11-05', false),
  ('Hana',     'Magdy',     'EG-29601201234567', '+20 111 234 5679', '27 El-Nasr Rd, Nasr City',      '1996-01-20', false),
  ('Ali',      'Mahmoud',   'EG-28703081234567', '+20 112 345 6780', '41 Shobra St, Shobra',          '1987-03-08', false),
  ('Mona',     'Tawfik',    'EG-29408121234567', '+20 113 456 7891', '5 Salah El-Din St, Citadel',    '1994-08-12', false),
  ('Hassan',   'Nabil',     'EG-29001271234567', '+20 114 567 8902', '62 El-Orouba St, Heliopolis',   '1990-01-27', false),
  ('Yasmin',   'Saeed',     'EG-29807031234567', '+20 115 678 9013', '11 Garden City St, Garden City', '1998-07-03', false),
  ('Amr',      'Soliman',   'EG-28609181234567', '+20 116 789 0124', '29 El-Thawra St, Dokki',        '1986-09-18', false),
  ('Fatma',    'Othman',    'EG-29302231234567', '+20 117 890 1235', '16 Abbas El-Akkad, Nasr City',  '1993-02-23', false),
  ('Karim',    'Helal',     'EG-29105171234567', '+20 118 901 2346', '38 El-Merghany St, Heliopolis', '1991-05-17', false),
  ('Salma',    'Barakat',   'EG-29710091234567', '+20 119 012 3457', '22 Qasr El-Nil St, Downtown',   '1997-10-09', false),
  ('Mahmoud',  'Zaki',      'EG-28408261234567', '+20 120 123 4569', '50 El-Batal Ahmed St, Dokki',   '1984-08-26', false),
  ('Aya',      'Rizk',      'EG-20001151234567', '+20 121 234 5670', '4 Cleopatra St, Heliopolis',    '2000-01-15', false);

-- =============================================================================
-- 4. RESERVATIONS
-- =============================================================================
-- Legend:
--   D-N  = CURRENT_DATE - N days  (past)
--   D    = CURRENT_DATE           (today)
--   D+N  = CURRENT_DATE + N days  (future)
--
-- Categories:
--   A. Checked-out (past)       — 12 reservations, with bills for billing/reports
--   B. Checked-in (staying)     —  6 reservations, rooms show as occupied
--   C. New — today arrivals     —  3 reservations for check-in page
--   D. New — future             —  3 reservations for bookings page
--   E. Cancelled                —  3 reservations for bookings stats
-- =============================================================================

-- ── A. Checked-out reservations (past, spread across last 2 weeks) ──────────

-- A1: Guest 1 (Ahmed Kamel) in room 305 (suite), 5 nights, ~2 weeks ago
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (1, 21, 2, CURRENT_DATE - 16, CURRENT_DATE - 11, 'checked-out', NOW() - INTERVAL '16 days');

-- A2: Guest 7 (Mohamed Hassan) in room 201 (double), 3 nights, ~12 days ago
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (7, 9, 2, CURRENT_DATE - 13, CURRENT_DATE - 10, 'checked-out', NOW() - INTERVAL '13 days');

-- A3: Guest 9 (Tarek Fawzy) in room 102 (single), 2 nights, ~10 days ago
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (9, 2, 1, CURRENT_DATE - 11, CURRENT_DATE - 9, 'checked-out', NOW() - INTERVAL '11 days');

-- A4: Guest 2 (Sara Ramadan) in room 202 (suite), 4 nights, ~9 days ago
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (2, 10, 2, CURRENT_DATE - 10, CURRENT_DATE - 6, 'checked-out', NOW() - INTERVAL '10 days');

-- A5: Guest 11 (Youssef Adel) in room 107 (single), 2 nights, ~8 days ago
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (11, 7, 1, CURRENT_DATE - 9, CURRENT_DATE - 7, 'checked-out', NOW() - INTERVAL '9 days');

-- A6: Guest 13 (Ali Mahmoud) in room 301 (double), 3 nights, checked out 5 days ago
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (13, 17, 2, CURRENT_DATE - 8, CURRENT_DATE - 5, 'checked-out', NOW() - INTERVAL '8 days');

-- A7: Guest 3 (Omar Saad) in room 105 (single), 6 nights, checked out 3 days ago
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (3, 5, 1, CURRENT_DATE - 9, CURRENT_DATE - 3, 'checked-out', NOW() - INTERVAL '9 days');

-- A8: Guest 14 (Mona Tawfik) in room 206 (double), 2 nights, checked out 3 days ago
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (14, 14, 2, CURRENT_DATE - 5, CURRENT_DATE - 3, 'checked-out', NOW() - INTERVAL '5 days');

-- A9: Guest 5 (Khaled Amin) in room 307 (double), 4 nights, checked out 2 days ago
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (5, 23, 2, CURRENT_DATE - 6, CURRENT_DATE - 2, 'checked-out', NOW() - INTERVAL '6 days');

-- A10: Guest 15 (Hassan Nabil) in room 103 (single), 3 nights, checked out yesterday
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (15, 3, 1, CURRENT_DATE - 4, CURRENT_DATE - 1, 'checked-out', NOW() - INTERVAL '4 days');

-- A11: Guest 17 (Amr Soliman) in room 205 (double), 2 nights, checked out yesterday
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (17, 13, 2, CURRENT_DATE - 3, CURRENT_DATE - 1, 'checked-out', NOW() - INTERVAL '3 days');

-- A12: Guest 6 (Rania Mostafa) in room 302 (double), 3 nights, checked out yesterday
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (6, 18, 2, CURRENT_DATE - 4, CURRENT_DATE - 1, 'checked-out', NOW() - INTERVAL '4 days');

-- ── B. Checked-in reservations (currently staying) ──────────────────────────

-- B1: Guest 4 (Layla Ibrahim) in room 203 (double), checked in 2 days ago, leaves in 2 days
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (4, 11, 2, CURRENT_DATE - 2, CURRENT_DATE + 2, 'checked-in', NOW() - INTERVAL '3 days');

-- B2: Guest 8 (Nour Hamdy) in room 101 (double), checked in 3 days ago, leaves tomorrow
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (8, 1, 1, CURRENT_DATE - 3, CURRENT_DATE + 1, 'checked-in', NOW() - INTERVAL '4 days');

-- B3: Guest 10 (Dina Sherif) in room 305 (suite), checked in yesterday, 5-night stay
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (10, 21, 2, CURRENT_DATE - 1, CURRENT_DATE + 4, 'checked-in', NOW() - INTERVAL '3 days');

-- B4: Guest 12 (Hana Magdy) in room 202 (suite), checked in today, 3-night stay
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (12, 10, 2, CURRENT_DATE, CURRENT_DATE + 3, 'checked-in', NOW() - INTERVAL '2 days');

-- B5: Guest 18 (Fatma Othman) in room 108 (double), checked in yesterday, leaves today (departure!)
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (18, 8, 1, CURRENT_DATE - 1, CURRENT_DATE, 'checked-in', NOW() - INTERVAL '2 days');

-- B6: Guest 19 (Karim Helal) in room 208 (double), checked in 2 days ago, leaves today (departure!)
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (19, 16, 2, CURRENT_DATE - 2, CURRENT_DATE, 'checked-in', NOW() - INTERVAL '3 days');

-- ── C. New reservations — today arrivals (for check-in page) ────────────────

-- C1: Guest 16 (Yasmin Saeed) in room 106 (double), arriving today, 3-night stay
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (16, 6, 2, CURRENT_DATE, CURRENT_DATE + 3, 'new', NOW() - INTERVAL '5 days');

-- C2: Guest 20 (Salma Barakat) in room 207 (single), arriving today, 2-night stay
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (20, 15, 1, CURRENT_DATE, CURRENT_DATE + 2, 'new', NOW() - INTERVAL '3 days');

-- C3: Guest 21 (Mahmoud Zaki) in room 301 (double), arriving today, 4-night stay
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (21, 17, 2, CURRENT_DATE, CURRENT_DATE + 4, 'new', NOW() - INTERVAL '2 days');

-- ── D. New reservations — future bookings ───────────────────────────────────

-- D1: Guest 22 (Aya Rizk) in room 304 (single), arrives in 3 days, 2-night stay
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (22, 20, 1, CURRENT_DATE + 3, CURRENT_DATE + 5, 'new', NOW() - INTERVAL '1 day');

-- D2: Guest 1 (Ahmed Kamel, returning loyal) in room 202 (suite), arrives in 5 days, 4-night stay
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (1, 10, 2, CURRENT_DATE + 5, CURRENT_DATE + 9, 'new', NOW() - INTERVAL '1 day');

-- D3: Guest 2 (Sara Ramadan, returning loyal) in room 307 (double), arrives in 7 days
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (2, 23, 2, CURRENT_DATE + 7, CURRENT_DATE + 10, 'new', NOW());

-- ── E. Cancelled reservations ───────────────────────────────────────────────

-- E1: Guest 9 (Tarek Fawzy) cancelled a future booking
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (9, 6, 1, CURRENT_DATE + 2, CURRENT_DATE + 4, 'cancelled', NOW() - INTERVAL '4 days');

-- E2: Guest 11 (Youssef Adel) cancelled
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (11, 13, 1, CURRENT_DATE - 1, CURRENT_DATE + 1, 'cancelled', NOW() - INTERVAL '5 days');

-- E3: Guest 22 (Aya Rizk) cancelled an older booking
INSERT INTO reservations (guest_id, room_id, number_of_guests, check_in_date, check_out_date, status, created_at)
VALUES (22, 3, 1, CURRENT_DATE - 3, CURRENT_DATE - 1, 'cancelled', NOW() - INTERVAL '7 days');

-- =============================================================================
-- 5. RESERVATION SERVICES  (add-ons for various reservations)
-- =============================================================================
-- Service IDs:  1=Breakfast, 2=Airport Transfer, 3=Laundry,
--               4=Extra Bed, 5=Room Service, 6=Mini Bar

-- A1 (res 1): Breakfast + Airport Transfer + Mini Bar
INSERT INTO reservation_services (reservation_id, service_id) VALUES (1, 1), (1, 2), (1, 6);
-- A2 (res 2): Breakfast
INSERT INTO reservation_services (reservation_id, service_id) VALUES (2, 1);
-- A4 (res 4): Breakfast + Laundry + Room Service
INSERT INTO reservation_services (reservation_id, service_id) VALUES (4, 1), (4, 3), (4, 5);
-- A6 (res 6): Airport Transfer + Extra Bed
INSERT INTO reservation_services (reservation_id, service_id) VALUES (6, 2), (6, 4);
-- A7 (res 7): Breakfast + Laundry + Mini Bar
INSERT INTO reservation_services (reservation_id, service_id) VALUES (7, 1), (7, 3), (7, 6);
-- A9 (res 9): Breakfast + Room Service + Mini Bar
INSERT INTO reservation_services (reservation_id, service_id) VALUES (9, 1), (9, 5), (9, 6);
-- A10 (res 10): Laundry
INSERT INTO reservation_services (reservation_id, service_id) VALUES (10, 3);
-- A12 (res 12): Breakfast + Airport Transfer + Laundry
INSERT INTO reservation_services (reservation_id, service_id) VALUES (12, 1), (12, 2), (12, 3);
-- B1 (res 13): Breakfast + Extra Bed
INSERT INTO reservation_services (reservation_id, service_id) VALUES (13, 1), (13, 4);
-- B3 (res 15): Breakfast + Room Service + Mini Bar + Laundry
INSERT INTO reservation_services (reservation_id, service_id) VALUES (15, 1), (15, 5), (15, 6), (15, 3);
-- B4 (res 16): Breakfast + Airport Transfer
INSERT INTO reservation_services (reservation_id, service_id) VALUES (16, 1), (16, 2);
-- C1 (res 19): Breakfast
INSERT INTO reservation_services (reservation_id, service_id) VALUES (19, 1);

-- =============================================================================
-- 6. BILLS  (for all 12 checked-out reservations)
-- =============================================================================
-- Formula (matches app checkout logic):
--   room_total  = rate_per_night * nights
--   extras      = sum of service prices
--   subtotal    = room_total + extras
--   tax         = subtotal * 0.14
--   total       = subtotal + tax
--
-- created_at is set near the checkout date to spread revenue across the week.

-- A1: res 1, room 305 (suite 750/n), 5 nights = 3750, extras = 50+150+100 = 300, sub=4050, tax=567, total=4617
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (1, 567.00, 300.00, 0, 4617.00, 'card', NOW() - INTERVAL '11 days');

-- A2: res 2, room 201 (double 450/n), 3 nights = 1350, extras = 50, sub=1400, tax=196, total=1596
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (2, 196.00, 50.00, 0, 1596.00, 'cash', NOW() - INTERVAL '10 days');

-- A3: res 3, room 102 (single 300/n), 2 nights = 600, extras = 0, sub=600, tax=84, total=684
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (3, 84.00, 0, 0, 684.00, 'card', NOW() - INTERVAL '9 days');

-- A4: res 4, room 202 (suite 750/n), 4 nights = 3000, extras = 50+40+60 = 150, sub=3150, tax=441, total=3591
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (4, 441.00, 150.00, 0, 3591.00, 'bank_transfer', NOW() - INTERVAL '6 days');

-- A5: res 5, room 107 (single 300/n), 2 nights = 600, extras = 0, sub=600, tax=84, total=684
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (5, 84.00, 0, 0, 684.00, 'cash', NOW() - INTERVAL '7 days');

-- A6: res 6, room 301 (double 450/n), 3 nights = 1350, extras = 150+80 = 230, sub=1580, tax=221.20, total=1801.20
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (6, 221.20, 230.00, 0, 1801.20, 'card', NOW() - INTERVAL '5 days');

-- A7: res 7, room 105 (single 300/n), 6 nights = 1800, extras = 50+40+100 = 190, sub=1990, tax=278.60, total=2268.60
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (7, 278.60, 190.00, 0, 2268.60, 'cash', NOW() - INTERVAL '3 days');

-- A8: res 8, room 206 (double 450/n), 2 nights = 900, extras = 0, sub=900, tax=126, total=1026
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (8, 126.00, 0, 0, 1026.00, 'other', NOW() - INTERVAL '3 days');

-- A9: res 9, room 307 (double 450/n), 4 nights = 1800, extras = 50+60+100 = 210, sub=2010, tax=281.40, total=2291.40
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (9, 281.40, 210.00, 0, 2291.40, 'card', NOW() - INTERVAL '2 days');

-- A10: res 10, room 103 (single 300/n), 3 nights = 900, extras = 40, sub=940, tax=131.60, total=1071.60
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (10, 131.60, 40.00, 0, 1071.60, 'cash', NOW() - INTERVAL '1 day');

-- A11: res 11, room 205 (double 450/n), 2 nights = 900, extras = 0, sub=900, tax=126, total=1026
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (11, 126.00, 0, 0, 1026.00, 'bank_transfer', NOW() - INTERVAL '1 day');

-- A12: res 12, room 302 (double 450/n), 3 nights = 1350, extras = 50+150+40 = 240, sub=1590, tax=222.60, total=1812.60
INSERT INTO bills (reservation_id, tax, extra_services, discount, total_amount, payment_method, created_at)
VALUES (12, 222.60, 240.00, 0, 1812.60, 'card', NOW() - INTERVAL '1 day');

-- =============================================================================
-- 7. HOUSEKEEPING TASKS  (today's tasks + some open maintenance)
-- =============================================================================
-- Tasks are assigned to users with the `housekeeping` role.
-- Sign-up housekeeping users via the app, then run a separate UPDATE to
-- assign them — the seed leaves assigned_to_id NULL so it doesn't depend
-- on auth users existing.

-- Today's cleaning tasks (various statuses — shows on today's task list)
INSERT INTO housekeeping_tasks (room_id, assigned_to_id, type, title, priority, status, notes, created_at) VALUES
  -- Room 104 (cleaning mode) — done
  (4,  NULL, 'cleaning', 'Full room cleaning',       'medium', 'done',        'Guest checked out this morning',     NOW() - INTERVAL '4 hours'),
  -- Room 204 (cleaning mode) — in progress
  (12, NULL, 'cleaning', 'Full room cleaning',       'medium', 'in_progress', NULL,                                 NOW() - INTERVAL '2 hours'),
  -- Room 306 (cleaning mode) — pending
  (22, NULL, 'cleaning', 'Full room cleaning',       'medium', 'pending',     NULL,                                 NOW() - INTERVAL '1 hour'),
  -- Room 102 (recently freed) — done
  (2,  NULL, 'cleaning', 'Turnover cleaning',        'high',   'done',        'Quick turnaround needed',            NOW() - INTERVAL '5 hours'),
  -- Room 107 (recently freed) — done
  (7,  NULL, 'cleaning', 'Turnover cleaning',        'low',    'done',        NULL,                                 NOW() - INTERVAL '6 hours'),
  -- Room 301 (recently freed) — in progress
  (17, NULL, 'cleaning', 'Deep clean + restock',     'high',   'in_progress', 'Guest left late, extra cleaning',    NOW() - INTERVAL '1 hour'),
  -- Room 205 (recently freed) — pending, unassigned
  (13, NULL, 'cleaning', 'Standard turnover',        'medium', 'pending',     NULL,                                 NOW() - INTERVAL '30 minutes'),
  -- Room 302 (recently freed) — pending
  (18, NULL, 'cleaning', 'Turnover cleaning',        'medium', 'pending',     NULL,                                 NOW() - INTERVAL '45 minutes');

-- Maintenance tasks (some today, some older — shows in maintenance issues)
INSERT INTO housekeeping_tasks (room_id, assigned_to_id, type, title, priority, status, notes, created_at) VALUES
  -- Room 303 (maintenance mode) — in progress
  (19, NULL, 'maintenance', 'Fix plumbing leak',        'high',   'in_progress', 'Plumber scheduled, parts ordered',  NOW() - INTERVAL '2 days'),
  -- Room 108 — pending maintenance (AC)
  (8,  NULL, 'maintenance', 'AC unit making noise',     'medium', 'pending',     'Guest in B5 reported intermittent rattling', NOW() - INTERVAL '6 hours'),
  -- Room 206 — older maintenance, done
  (14, NULL, 'maintenance', 'Replace bathroom faucet',  'low',    'done',        'Replaced with new fixture',         NOW() - INTERVAL '3 days'),
  -- Room 308 — pending maintenance
  (24, NULL, 'maintenance', 'Window seal damaged',      'medium', 'pending',     'Draft coming through, needs resealing', NOW() - INTERVAL '1 day');

-- =============================================================================
-- 9. SUPPLIERS  (5 suppliers)
-- =============================================================================

INSERT INTO suppliers (name, category, phone, notes, created_at) VALUES
  ('Al-Nile Food Supplies',    'Food & Beverages',       '+20 2 2345 6789', 'Main food supplier. Delivers Mon/Wed/Fri mornings.',              NOW() - INTERVAL '90 days'),
  ('Cairo Clean Co.',          'Cleaning Supplies',      '+20 2 3456 7890', 'Bulk cleaning chemicals and disposables. Net-30 payment terms.',   NOW() - INTERVAL '75 days'),
  ('Delta Linens',             'Linen & Textiles',       '+20 2 4567 8901', 'Bed sheets, towels, curtains. Quality A-grade Egyptian cotton.',   NOW() - INTERVAL '60 days'),
  ('Pyramid Equipment',        'Equipment & Maintenance','+20 2 5678 9012', 'HVAC, plumbing parts, electrical. 24h emergency availability.',    NOW() - INTERVAL '80 days'),
  ('Green Garden Farms',       'Fresh Produce',          '+20 2 6789 0123', 'Organic fruits and vegetables. Daily delivery before 7 AM.',       NOW() - INTERVAL '45 days');

-- =============================================================================
-- 10. SUPPLIER ORDERS  (15 orders, mix of pending/finished, spread over time)
-- =============================================================================

INSERT INTO supplier_orders (supplier_id, title, amount, status, created_at) VALUES
  -- Al-Nile Food Supplies (id=1)
  (1, 'Weekly breakfast supplies — eggs, bread, cheese',           1250.00, 'finished', NOW() - INTERVAL '14 days'),
  (1, 'Beverages restock — juices, water, coffee beans',           850.00, 'finished', NOW() - INTERVAL '7 days'),
  (1, 'Weekend banquet provisions — catering for 40 guests',      3200.00, 'pending',  NOW() - INTERVAL '1 day'),

  -- Cairo Clean Co. (id=2)
  (2, 'Monthly cleaning chemicals — detergent, disinfectant',     1800.00, 'finished', NOW() - INTERVAL '21 days'),
  (2, 'Guest room amenities — soap, shampoo, toiletries',          950.00, 'finished', NOW() - INTERVAL '10 days'),
  (2, 'Floor polish and carpet cleaner restock',                   620.00, 'pending',  NOW() - INTERVAL '2 days'),

  -- Delta Linens (id=3)
  (3, 'Bed sheet replacement — 50 sets king size',                4500.00, 'finished', NOW() - INTERVAL '30 days'),
  (3, 'Towel restock — 100 bath towels, 100 hand towels',        2800.00, 'finished', NOW() - INTERVAL '12 days'),
  (3, 'New curtains for Floor 3 suites',                          3600.00, 'pending',  NOW() - INTERVAL '3 days'),

  -- Pyramid Equipment (id=4)
  (4, 'AC filters replacement — 24 units',                       1200.00, 'finished', NOW() - INTERVAL '18 days'),
  (4, 'Plumbing parts for Room 303 repair',                       450.00, 'pending',  NOW() - INTERVAL '2 days'),
  (4, 'Emergency generator maintenance service',                 2100.00, 'finished', NOW() - INTERVAL '8 days'),

  -- Green Garden Farms (id=5)
  (5, 'Weekly fresh produce — fruits and vegetables',              680.00, 'finished', NOW() - INTERVAL '7 days'),
  (5, 'Herb garden supplies for restaurant kitchen',               320.00, 'finished', NOW() - INTERVAL '5 days'),
  (5, 'Special order — organic salad mix for event',               540.00, 'pending',  NOW() - INTERVAL '1 day');

COMMIT;

-- =============================================================================
-- Verification queries (optional — uncomment to check counts)
-- =============================================================================
-- SELECT 'rooms'              AS tbl, count(*) FROM rooms;
-- SELECT 'guests'             AS tbl, count(*) FROM guests;
-- SELECT 'reservations'       AS tbl, count(*) FROM reservations;
-- SELECT 'bills'              AS tbl, count(*) FROM bills;
-- SELECT 'services'           AS tbl, count(*) FROM services;
-- SELECT 'reservation_svcs'   AS tbl, count(*) FROM reservation_services;
-- SELECT 'hk_tasks'           AS tbl, count(*) FROM housekeeping_tasks;
-- SELECT 'suppliers'          AS tbl, count(*) FROM suppliers;
-- SELECT 'supplier_orders'    AS tbl, count(*) FROM supplier_orders;
