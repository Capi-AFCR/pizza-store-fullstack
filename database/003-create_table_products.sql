CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(2) NOT NULL CHECK (category IN ('AP', 'MC', 'SD', 'DR', 'DE')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  image_url VARCHAR(255),
  created_by VARCHAR(255),
  modified_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);

-- Sample products for testing
INSERT INTO products (name, description, price, category, is_active, image_url, created_by, modified_by, created_at, modified_at) VALUES
('Margherita Pizza', 'Classic pizza with tomato sauce and mozzarella', 10.99, 'MC', TRUE, 'http://example.com/margherita.jpg', 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Garlic Bread', 'Toasted bread with garlic and herbs', 4.99, 'AP', TRUE, 'http://example.com/garlic_bread.jpg', 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cola', 'Refreshing cola drink', 2.99, 'DR', TRUE, 'http://example.com/cola.jpg', 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Chocolate Cake', 'Rich chocolate dessert', 5.99, 'DE', TRUE, 'http://example.com/chocolate_cake.jpg', 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('French Fries', 'Crispy fried potatoes', 3.99, 'SD', TRUE, 'http://example.com/fries.jpg', 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);