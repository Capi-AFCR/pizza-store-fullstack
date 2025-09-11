CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(2) NOT NULL CHECK (status IN ('PE', 'AP', 'RE', 'OW', 'DN', 'DY', 'CA')),
  scheduled_at TIMESTAMP,
  custom_pizza BOOLEAN NOT NULL DEFAULT FALSE,
  created_by VARCHAR(255),
  modified_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_scheduled_at ON orders(scheduled_at);
CREATE INDEX idx_orders_custom_pizza ON orders(custom_pizza);

-- Sample orders for testing
INSERT INTO orders (user_id, total_price, status, created_by, modified_by, created_at, modified_at) VALUES
(2, 21.98, 'PE', 'client@example.com', 'client@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 10.98, 'AP', 'waiter@example.com', 'kitchen@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);