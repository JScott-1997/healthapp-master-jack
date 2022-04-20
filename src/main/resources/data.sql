INSERT INTO role (id, name) VALUES
  (1, 'ROLE_USER'),
  (2, 'ROLE_ADMIN'),
  (3, 'ROLE_WEIGHT'),
  (4, 'ROLE_HEART_RATE'),
  (5, 'ROLE_RESPIRATION_RATE'),
  (6, 'ROLE_GRIP_STRENGTH');

INSERT INTO administrator (id, name, password, username, salary) VALUES
  (1, 'Default Admin', '$2a$10$VAAB6k/.kx0kKAIsTgTshucsJ1rjTZ9OcVFXnOggT090rfMXg8/wq', 'admin', '135000');

INSERT INTO administrator_roles (administrator_id, roles_id) VALUES
  (1, 2);
--Default admin account. Username is admin, Pass is 'Pass1234'

INSERT INTO customer (id, name, password, username, customer_sex, customer_units_preference, date_of_birth, height, target_grip_strength, target_weight)
VALUES(1, "Default User", '$2a$10$VAAB6k/.kx0kKAIsTgTshucsJ1rjTZ9OcVFXnOggT090rfMXg8/wq', "user", 1, 0, "1989-03-30 00:00:00.000000", "175", "0", "0");

INSERT INTO customer_roles (customer_id, roles_id) VALUES
  (1, 1),  (1, 3), (1, 4), (1, 5), (1, 6);
--Default customer account. Username is user, Pass is 'Pass1234'

INSERT INTO heart_rate_entry(date_of_entry, entry_heart_rate)
    VALUES(DATE_SUB(CURDATE(), INTERVAL 15 DAY), 55),
    (DATE_SUB(CURDATE(), INTERVAL 14 DAY), 60),
    (DATE_SUB(CURDATE(), INTERVAL 13 DAY), 59),
    (DATE_SUB(CURDATE(), INTERVAL 12 DAY), 55),
    (DATE_SUB(CURDATE(), INTERVAL 11 DAY), 59),
    (DATE_SUB(CURDATE(), INTERVAL 10 DAY), 60),
    (DATE_SUB(CURDATE(), INTERVAL 9 DAY), 59),
    (DATE_SUB(CURDATE(), INTERVAL 8 DAY), 55),
    (DATE_SUB(CURDATE(), INTERVAL 7 DAY), 59),
    (DATE_SUB(CURDATE(), INTERVAL 6 DAY), 59),
    (DATE_SUB(CURDATE(), INTERVAL 5 DAY), 60),
    (DATE_SUB(CURDATE(), INTERVAL 4 DAY), 59),
    (DATE_SUB(CURDATE(), INTERVAL 3 DAY), 55),
    (DATE_SUB(CURDATE(), INTERVAL 2 DAY), 59),
    (DATE_SUB(CURDATE(), INTERVAL 1 DAY), 59);

INSERT INTO customer_heart_rate_entries(customer_id, heart_rate_entries_entry_id)
    VALUES(1, 1), (1, 2), (1, 3),
    (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
    (1, 10), (1, 11), (1, 12),(1, 13), (1, 14), (1, 15);

INSERT INTO weight_entry(date_of_entry, entry_weight)
    VALUES(DATE_SUB(CURDATE(), INTERVAL 15 DAY), 65),
    (DATE_SUB(CURDATE(), INTERVAL 14 DAY), 66),
    (DATE_SUB(CURDATE(), INTERVAL 13 DAY), 65),
    (DATE_SUB(CURDATE(), INTERVAL 12 DAY), 67),
    (DATE_SUB(CURDATE(), INTERVAL 11 DAY), 65),
    (DATE_SUB(CURDATE(), INTERVAL 10 DAY), 63),
    (DATE_SUB(CURDATE(), INTERVAL 9 DAY), 63),
    (DATE_SUB(CURDATE(), INTERVAL 8 DAY), 63),
    (DATE_SUB(CURDATE(), INTERVAL 7 DAY), 64),
    (DATE_SUB(CURDATE(), INTERVAL 6 DAY), 63),
    (DATE_SUB(CURDATE(), INTERVAL 5 DAY), 62),
    (DATE_SUB(CURDATE(), INTERVAL 4 DAY), 61),
    (DATE_SUB(CURDATE(), INTERVAL 3 DAY), 58),
    (DATE_SUB(CURDATE(), INTERVAL 2 DAY), 58),
    (DATE_SUB(CURDATE(), INTERVAL 1 DAY),56);

INSERT INTO customer_weight_entries(customer_id, weight_entries_entry_id)
    VALUES(1, 1), (1, 2), (1, 3),
    (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
                (1, 10), (1, 11), (1, 12),(1, 13), (1, 14), (1, 15);

INSERT INTO grip_strength_entry(date_of_entry, entry_grip_strength)
    VALUES(DATE_SUB(CURDATE(), INTERVAL 15 DAY), 49),
    (DATE_SUB(CURDATE(), INTERVAL 14 DAY), 47),
    (DATE_SUB(CURDATE(), INTERVAL 13 DAY), 49),
    (DATE_SUB(CURDATE(), INTERVAL 12 DAY), 51),
    (DATE_SUB(CURDATE(), INTERVAL 11 DAY), 50),
    (DATE_SUB(CURDATE(), INTERVAL 10 DAY), 53),
    (DATE_SUB(CURDATE(), INTERVAL 9 DAY), 55),
    (DATE_SUB(CURDATE(), INTERVAL 8 DAY), 54),
    (DATE_SUB(CURDATE(), INTERVAL 7 DAY), 55),
    (DATE_SUB(CURDATE(), INTERVAL 6 DAY), 56),
    (DATE_SUB(CURDATE(), INTERVAL 5 DAY), 57),
    (DATE_SUB(CURDATE(), INTERVAL 4 DAY), 57),
    (DATE_SUB(CURDATE(), INTERVAL 3 DAY), 58),
    (DATE_SUB(CURDATE(), INTERVAL 2 DAY), 58),
    (DATE_SUB(CURDATE(), INTERVAL 1 DAY), 59);

INSERT INTO customer_grip_strength_entries(customer_id, grip_strength_entries_entry_id)
    VALUES(1, 1), (1, 2), (1, 3),
    (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
                (1, 10), (1, 11), (1, 12),(1, 13), (1, 14), (1, 15);

INSERT INTO respiration_rate_entry(date_of_entry, entry_respiration_rate)
    VALUES(DATE_SUB(CURDATE(), INTERVAL 15 DAY), 17),
    (DATE_SUB(CURDATE(), INTERVAL 14 DAY), 16),
    (DATE_SUB(CURDATE(), INTERVAL 13 DAY), 14),
    (DATE_SUB(CURDATE(), INTERVAL 12 DAY), 16),
    (DATE_SUB(CURDATE(), INTERVAL 11 DAY), 13),
    (DATE_SUB(CURDATE(), INTERVAL 10 DAY), 14),
    (DATE_SUB(CURDATE(), INTERVAL 9 DAY), 14),
    (DATE_SUB(CURDATE(), INTERVAL 8 DAY), 16),
    (DATE_SUB(CURDATE(), INTERVAL 7 DAY), 14),
    (DATE_SUB(CURDATE(), INTERVAL 6 DAY), 13),
    (DATE_SUB(CURDATE(), INTERVAL 5 DAY), 17),
    (DATE_SUB(CURDATE(), INTERVAL 4 DAY), 18),
    (DATE_SUB(CURDATE(), INTERVAL 3 DAY), 18),
    (DATE_SUB(CURDATE(), INTERVAL 2 DAY), 14),
    (DATE_SUB(CURDATE(), INTERVAL 1 DAY), 15);

INSERT INTO customer_respiration_rate_entries(customer_id, respiration_rate_entries_entry_id)
    VALUES(1, 1), (1, 2), (1, 3),
    (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
                (1, 10), (1, 11), (1, 12),(1, 13), (1, 14), (1, 15);