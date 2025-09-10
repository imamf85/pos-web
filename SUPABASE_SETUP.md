# Supabase Integration Setup

## 1. Setup Supabase Database

Jalankan SQL schema berikut di Supabase SQL Editor:

```sql
-- 1. Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO categories (name) VALUES ('kebab'), ('burger'), ('alacarte');

-- 2. Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    price INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO products (name, category_id, price) VALUES 
    ('Kebab Signature', 1, 25000),
    ('Kebab Original', 1, 20000),
    ('Kebab Cheesy', 1, 23000),
    ('Kebab Mixed Sauces', 1, 24000),
    ('Burger Beef Klasik', 2, 30000),
    ('Burger Beef Premium', 2, 35000),
    ('Burger Chicken', 2, 28000),
    ('Kentang Goreng', 3, 15000),
    ('Teh Arab', 3, 8000);

-- 3. Customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO customers (name, phone) VALUES 
    ('Ahmad Rizki', '08123456789'),
    ('Sari Dewi', '08198765432'),
    ('Budi Santoso', '08555123456'),
    ('Maya Sari', '08777654321'),
    ('Doni Prasetyo', '08333999888');

-- 4. Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20) DEFAULT 'staff',
    branch VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO users (name, role, branch) VALUES 
    ('Ahmad Rizki', 'admin', 'Cabang Malang Kota');

-- 5. Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INTEGER REFERENCES customers(id),
    user_id INTEGER REFERENCES users(id),
    total_amount INTEGER NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash',
    payment_status VARCHAR(20) DEFAULT 'paid',
    order_status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    options JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_customers_phone ON customers(phone);
```

## 2. Setup Environment Variables

1. Copy `.env.example` ke `.env`
2. Isi dengan credential Supabase Anda:

```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Row Level Security (RLS)

Aktifkan RLS untuk keamanan:

```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Simple policies (sesuaikan dengan kebutuhan)
CREATE POLICY "Public read access" ON customers FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON customers FOR UPDATE USING (true);

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
```

## 4. Features yang Terintegrasi

- ✅ **Customer Management** - CRUD customers dengan Supabase
- ✅ **Product Loading** - Load products dari database
- ✅ **Order Processing** - Save orders ke database
- ✅ **Fallback System** - Tetap bisa jalan tanpa Supabase
- ✅ **Error Handling** - Graceful error handling

## 5. Testing

1. Tanpa Supabase: Aplikasi akan menggunakan mock data
2. Dengan Supabase: Data akan disimpan ke database

## 6. Next Steps

- Implementasi authentication
- Real-time updates
- Advanced reporting
- Inventory management