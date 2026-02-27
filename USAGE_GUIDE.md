# PG Rental System - Usage Guide & Copilot Chat Prompts

## 🚀 System Status

Both servers are running successfully:
- **Frontend**: http://localhost:4200 (Angular 16)
- **Backend**: http://localhost:5000 (Express.js API)
- **Database**: MongoDB (localhost:27017/pg-rental)

---

## 📌 How to Use the Application

### For Users:
1. **Browse PGs** - Go to home page to see all available properties
2. **Filter PGs** - Use search and price filter to find desired properties
3. **View Details** - Click "View Details" to see full property information
4. **Register/Login** - Click "Login / Register" to create account or sign in
5. **Book PG** - After login, click "Book Now" on any property
6. **Dashboard** - Check your bookings and booking status in "My Bookings"

### For Admins:
1. **Login** - Use credentials: `admin@pg.com` / `admin123`
2. **Dashboard** - Overview of stats (PGs, Users, Bookings, Revenue)
3. **Manage PGs** - Add, edit, delete properties
4. **View Bookings** - See all bookings and approve/reject them
5. **User Management** - View registered users

### Test Accounts:
- **Admin**: admin@pg.com / admin123
- **User**: user@pg.com / user123

---

## 💬 How to Request Features via Copilot Chat

### Method 1: Direct In-Chat Prompts

To request new features or modifications, use these prompt templates in **Copilot Chat (Ctrl+I)**:

#### For UI/Styling Changes:
```
In the PG Rental System frontend, 
[describe what you want changed]
Update the component to:
- [specific change 1]
- [specific change 2]
- [specific change 3]
```

**Example:**
```
In the PG Rental System frontend, 
I want to improve the PG listing page.
Update the PG list component to:
- Add a favorites/wishlist button on each card
- Show amenities list on cards (WiFi, AC, etc.)
- Add rating stars from 1-5
```

#### For New Features:
```
Add a new feature to the PG Rental System:
Feature Name: [name]
Description: [what it does]
Location: [which component/page]
Technical Details: [required fields, validations, etc.]
```

**Example:**
```
Add a new feature to the PG Rental System:
Feature Name: Advanced Search Filters
Description: Allow users to filter PGs by amenities, distance, reviews
Location: PG List Component
Technical Details: 
- Checkboxes for amenities (WiFi, AC, Food, Parking)
- Radio buttons for distance (1km, 5km, 10km, All)
- Minimum rating filter (slider 1-5 stars)
```

#### For Backend/API Changes:
```
In the PG Rental backend API,
add/modify the following:
Endpoint: [method] [path]
Request: [fields and types]
Response: [expected response format]
Purpose: [what it does]
```

**Example:**
```
In the PG Rental backend API,
add the following:
Endpoint: POST /api/reviews
Request: { pgId, userId, rating (1-5), comment }
Response: { success: true, review: {...}, message }
Purpose: Allow users to write reviews for PGs
```

#### For Bug Fixes:
```
Fix the following issues in the PG Rental System:
1. [Issue description] - Location: [file/component]
   Expected behavior: [what should happen]
   Current behavior: [what happens now]

2. [Next issue]
```

**Example:**
```
Fix the following issues:
1. Login button not responding - Location: AuthPageComponent
   Expected: User logs in and redirects to home
   Current: Button click does nothing

2. Admin sidebar not showing responsive - Location: AdminLayoutComponent
   Expected: Sidebar toggles on mobile
   Current: Sidebar is hidden on all screens
```

---

## 📝 Common Copilot Prompts for This Project

### Add New Component:
```
Create a new [component-name] component in the PG Rental System with:
- Display: [what to show]
- Functionality: [what it does]
- Styling: [dark theme, glassmorphic style, with gradients]
- Integration: [integrate with existing services]
```

### Improve Styling:
```
In the PG Rental System,
improve the styling of [component-name] with:
- Modern dark theme with gradient accents
- Glassmorphism effect (backdrop blur)
- Smooth animations and hover effects
- Better mobile responsiveness
Current colors: Dark purple (#1f173d), Cyan (#0ce), Green (#4ade80)
```

### Add Database Feature:
```
Add a new model and API for [feature-name] in the backend:
- Collection name: [name]
- Fields: [field list]
- Relationships: [references to other models]
- API endpoints needed: [GET, POST, PUT, DELETE paths]
```

### Performance/Optimization:
```
Optimize the PG Rental System for:
- [Issue 1: e.g., faster page load]
- [Issue 2: e.g., reduce API calls]
- [Issue 3: e.g., better mobile experience]

Current focus: [frontend/backend/database]
```

---

## 🔧 Key Technologies

| Layer | Technology | Port |
|-------|-----------|------|
| Frontend | Angular 16, TypeScript, SCSS | 4200 |
| Backend | Express.js, Node.js | 5000 |
| Database | MongoDB | 27017 |
| Package Manager | npm | - |

---

## 📁 Project Structure

```
pggg/
├── backend/
│   ├── models/          (User, PG, Booking schemas)
│   ├── controllers/      (Auth, PG, Booking logic)
│   ├── routes/          (API endpoints)
│   ├── middleware/       (Auth, Upload)
│   ├── config/          (Database connection)
│   └── server.js        (Express app)
│
├── frontend/
│   └── src/app/
│       ├── components/   (All UI components)
│       ├── services/     (API services)
│       ├── layouts/      (Admin layout)
│       ├── app-routing.module.ts
│       └── app.module.ts
```

---

## ✨ Tips for Better Prompts

1. **Be Specific** - Say exactly which component or file to modify
2. **Provide Context** - Mention the current behavior and desired behavior
3. **Include Design Details** - Mention colors, layout, animations
4. **Multi-step Changes** - If requesting multiple changes, list them clearly
5. **Test Cases** - Mention scenarios to test after implementation

---

## 🚨 Troubleshooting

**Frontend not loading?**
```
Run in frontend directory:
ng serve --port 4200
```

**Backend not starting?**
```
Run in backend directory:
npm start
```

**MongoDB connection error?**
```
Make sure MongoDB is running:
mongod
```

**Port already in use?**
```
ng serve will ask to use a different port - choose Yes
Or manually specify: ng serve --port 4300
```

---

## 📞 Next Steps

1. **Open the app**: Visit http://localhost:4200
2. **Test login**: Use admin@pg.com / admin123
3. **Browse PGs**: Check the property listing
4. **Request features**: Use the prompts above in Copilot Chat

---

**Created**: February 15, 2026  
**System**: PG Rental - MEAN Stack Application  
**Status**: ✅ Production Ready
