CREATE TABLE order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  status VARCHAR(2) NOT NULL CHECK (status IN ('PE', 'AP', 'RE', 'OW', 'DN', 'DY', 'CA')),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255) NOT NULL
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Sample status history for testing
INSERT INTO order_status_history (order_id, status, updated_at, updated_by) VALUES
(1, 'PE', CURRENT_TIMESTAMP, 'client@example.com'),
(2, 'PE', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'waiter@example.com'),
(2, 'AP', CURRENT_TIMESTAMP, 'kitchen@example.com');