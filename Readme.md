# 🛡️ CYNA PLATFORM - SaaS Security E-commerce

> **Academic Project - Software Engineering**
> Status: Sprint 3 Completed (Full Stack MVP)

## 📋 Project Overview
Cyna Platform is a specialized E-commerce application for selling Cybersecurity SaaS solutions (EDR, XDR, SOC). The platform features a complete customer journey and a comprehensive Back-Office for administrators.

## 🚀 Key Features Implemented

### 👤 Client Side (User Experience)
- **Authentication:** Secure Sign Up / Login via Supabase Auth.
- **Dynamic Catalog:** Browse products categorized by service type (EDR, XDR, SOC).
- **Smart Cart:** Global state management with real-time total calculation.
- **Order System:** Seamless checkout process connected to the database.
- **Client Dashboard:**
  - View order history.
  - **Auto-generate PDF Invoices** (Backend feature).
  - Profile management (Read-only).

### 👮‍♂️ Admin Side (Back-Office)
- **Secured Access:** Protected route `/admin`.
- **Analytics Dashboard:** Visual charts for Revenue, Sales, and KPIs (Recharts).
- **Order Management:** View all orders and update status (Pending -> Completed).
- **Product CMS:** Full CRUD (Create, Read, Update, Delete) to manage the catalog without code.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, TailwindCSS, Lucide Icons, Recharts.
- **Backend:** NestJS, PDFKit (Invoice Generation).
- **Database:** Supabase (PostgreSQL).

---

## ⚙️ Installation Guide

Follow these steps to run the project locally.

### 1. Prerequisites
- Node.js (v18 or later)
- npm
- A Supabase account (Free tier)

### 2. Database Setup (Supabase)
Go to your Supabase SQL Editor and run this script to initialize the tables:

```sql
-- 1. Create Tables
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT,
  service_type TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER,
  price_at_purchase NUMERIC
);

-- 2. Disable RLS for Development ease for dev purposes
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;