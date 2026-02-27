# PG Rental System - Complete MEAN Stack Project

Full-featured **PG (Paying Guest) Rental Platform** with bookings, food ordering (Breakfast/Lunch/Dinner), room services, complaints, and Razorpay payments.

## 🚀 Quick Start

**Servers:**
```bash
# Terminal 1: Backend (port 5000)
cd backend && npm start

# Terminal 2: Frontend (port 4200)
cd frontend && npm start --port 4200
```

**Setup:**
```bash
# Install deps & seed DB
cd backend && npm install && npm run seed
cd frontend && npm install
```

**Test Credentials:**
- Admin: `admin@pg.com` / `admin123`
- User: `user@pg.com` / `user123`

**Run Tests:**
```bash
cd backend && node e2eTest.js
```

## ✨ Features

✅ **Auth:** JWT login/register
✅ **PG Listings:** Server-side search & filters
✅ **Bookings:** Create, cancel, manage with payment flow
✅ **Food Orders:** 3 categories (Breakfast/Lunch/Dinner) with tabs
✅ **Services:** Room service requests
✅ **Complaints:** Customer issue tracking
✅ **Payments:** Razorpay integration (test mode)
✅ **Admin:** Full dashboard & management
✅ **Image Upload:** Multiple images per PG

## 🍽️ Food Menu

**Breakfast:** Tea, Coffee, Toast, Eggs, Idli, Dosa (₹20-60)
**Lunch:** Biryani, Curries, Paneer, Rice (₹100-200)
**Dinner:** Tandoori, Fish, Naan, Desserts (₹100-220)

## 💳 Payment

Test card: `4111 1111 1111 1111` | Exp: `12/25` | CVV: `123`

## 📂 Structure

Backend: Models, Controllers, Routes, Middleware, Seeding
Frontend: Components, Services, Auth Guards, Routing

## 🔌 Key APIs

```
GET /api/pgs          - List properties
GET /api/menu/all     - Get menus
POST /api/orders      - Create order
POST /api/payments/create-order - Payment
```

## 📝 College Project

Production-ready full-stack project for college submissions. Demonstrates MEAN stack, payments, real-world business logic.

**Status:** ✅ Complete | Tested | Ready to submit
