CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Sample order items for testing
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 2, 10.99),
(2, 1, 1, 10.99);