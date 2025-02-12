-- Usar la base de datos 'mydb'
\c mydb;

-- Extensión para manejar UUIDs si aún no está habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Definir el tipo ENUM si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE public.order_status AS ENUM ('pending', 'cooking', 'ready', 'unknown');
    END IF;
END $$;

-- Tabla de recetas
CREATE TABLE IF NOT EXISTS recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  key_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  image_url TEXT NULL,
  ingredients JSONB NOT NULL,
  CONSTRAINT recipes_pkey PRIMARY KEY (id),
  CONSTRAINT recipes_key_name_key UNIQUE (key_name)
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

-- Tabla de procesamiento de órdenes
CREATE TABLE IF NOT EXISTS orders_processing (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  progress_status public.order_status NOT NULL DEFAULT 'pending'::order_status,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT order_processing_pkey PRIMARY KEY (id),
  CONSTRAINT order_processing_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

-- Create Function

-- 💾 Create function get_last_updated_orders
CREATE OR REPLACE FUNCTION get_last_updated_orders(progress_status_param order_status)
RETURNS TABLE (
    order_id UUID,
    progress_status order_status,
    last_updated TIMESTAMP,
    recipe_id UUID,
    recipe_name VARCHAR,
    recipe_description TEXT,
    recipe_image TEXT,
    recipe_ingredients JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_orders AS (
        SELECT 
            op.order_id,
            op.progress_status,
            op.last_updated,
            ROW_NUMBER() OVER (PARTITION BY op.order_id ORDER BY op.last_updated DESC) AS rank
        FROM orders_processing op
        WHERE op.progress_status = progress_status_param
    )
    SELECT 
        ro.order_id, 
        ro.progress_status, 
        ro.last_updated, 
        r.*
    FROM ranked_orders ro
    JOIN orders o ON o.id = ro.order_id
    JOIN recipes r ON r.id = o.recipe_id
    WHERE ro.rank = 1
    AND NOT EXISTS (
        SELECT 1
        FROM orders_processing o2
        WHERE o2.order_id = ro.order_id
            AND o2.progress_status <> ro.progress_status
            AND o2.last_updated > ro.last_updated
    );
END;
$$ LANGUAGE plpgsql;

-- Insertar datos en recipes
INSERT INTO recipes (key_name, description, image_url, ingredients) VALUES
('rice_with_chicken', 'rice_with_chicken_description', '/rice_with_chicken.webp', '{"rice": 2, "onion": 1, "chicken": 1}'::jsonb),
('unknown', 'unknown_description', '/unknown.svg', '{}'::jsonb),
('rice_with_meat', 'rice_with_meat_description', '/rice_with_meat.webp', '{"meat": 1, "rice": 2, "onion": 1}'::jsonb),
('burger', 'burger_description', '/burger.svg', '{"meat": 1, "cheese": 1, "ketchup": 1, "lettuce": 1}'::jsonb),
('french_fries', 'french_fries_description', '/french_fries.svg', '{"potato": 3, "ketchup": 1}'::jsonb),
('pizza', 'pizza_description', '/pizza.svg', '{"cheese": 2, "tomato": 3}'::jsonb),
('salad', 'salad_description', '/salad.svg', '{"lemon": 1, "onion": 1, "tomato": 2, "lettuce": 2}'::jsonb);