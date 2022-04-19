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
--Default admin account. Pass is 'Pass1234'