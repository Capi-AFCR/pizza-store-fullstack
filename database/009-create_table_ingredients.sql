CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('DO', 'CR', 'SA', 'CH', 'TO')),
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by VARCHAR(255),
  modified_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_is_active ON ingredients(is_active);

-- Sample data
INSERT INTO ingredients (name, category, price, is_active) VALUES
('Normal Dough', 'DO', 2.00, TRUE),
('Gluten-Free Dough', 'DO', 2.50, TRUE),
('Thin Crust', 'CR', 2.00, TRUE),
('Thick Crust', 'CR', 2.50, TRUE),
('Tomato Sauce', 'SA', 1.00, TRUE),
('Pesto Sauce', 'SA', 1.50, TRUE),
('Mozzarella', 'CH', 2.00, TRUE),
('Cheddar', 'CH', 2.50, TRUE),
('Pepperoni', 'TO', 1.50, TRUE),
('Mushrooms', 'TO', 1.00, TRUE),
('Olives', 'TO', 1.00, TRUE),
('Bell Peppers', 'TO', 1.00, TRUE);