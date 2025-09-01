CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('A', 'C', 'K', 'D', 'W')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_by VARCHAR(255),
  modified_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Sample users for testing
INSERT INTO users (name, email, password, role, active, loyalty_points, created_by, modified_by, created_at, modified_at) VALUES
('Admin User', 'admin@example.com', '$2a$10$XURPShZYaZ6Ws2I4N34zLu.3e2bJ1L2B7R7aJ8K9L0M1N2O3P4Q5R', 'A', TRUE, 0, 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Client User', 'client@example.com', '$2a$10$XURPShZYaZ6Ws2I4N34zLu.3e2bJ1L2B7R7aJ8K9L0M1N2O3P4Q5R', 'C', TRUE, 50, 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kitchen User', 'kitchen@example.com', '$2a$10$XURPShZYaZ6Ws2I4N34zLu.3e2bJ1L2B7R7aJ8K9L0M1N2O3P4Q5R', 'K', TRUE, 0, 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Delivery User', 'delivery@example.com', '$2a$10$XURPShZYaZ6Ws2I4N34zLu.3e2bJ1L2B7R7aJ8K9L0M1N2O3P4Q5R', 'D', TRUE, 0, 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Waiter User', 'waiter@example.com', '$2a$10$XURPShZYaZ6Ws2I4N34zLu.3e2bJ1L2B7R7aJ8K9L0M1N2O3P4Q5R', 'W', TRUE, 0, 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);