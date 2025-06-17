/*
  # Create orders table for Aishwarya Xerox

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `order_id` (text, unique order identifier)
      - `full_name` (text, customer name)
      - `phone_number` (text, customer phone)
      - `print_type` (text, type of printing service)
      - `binding_color_type` (text, optional binding color type)
      - `copies` (integer, number of copies)
      - `paper_size` (text, paper size)
      - `print_side` (text, single or double sided)
      - `selected_pages` (text, page selection)
      - `color_pages` (text, color page ranges)
      - `bw_pages` (text, black and white page ranges)
      - `special_instructions` (text, optional instructions)
      - `files` (jsonb, array of file information)
      - `order_date` (timestamptz, when order was placed)
      - `status` (text, order status)
      - `total_cost` (decimal, order cost)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, record update time)

  2. Security
    - Enable RLS on `orders` table
    - Add policy for public read access (admin can see all orders)
    - Add policy for public insert (customers can place orders)
    - Add policy for public update (admin can update order status)
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  print_type text NOT NULL,
  binding_color_type text,
  copies integer DEFAULT 1,
  paper_size text,
  print_side text,
  selected_pages text,
  color_pages text,
  bw_pages text,
  special_instructions text,
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  total_cost decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for admin to view all orders)
CREATE POLICY "Allow public read access to orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert (for customers to place orders)
CREATE POLICY "Allow public insert to orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public update (for admin to update order status)
CREATE POLICY "Allow public update to orders"
  ON orders
  FOR UPDATE
  TO public
  USING (true);

-- Create index for faster order_id lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index for order date sorting
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);