🧪 COMPREHENSIVE TESTING GUIDE - PG RENTAL SYSTEM
================================================================

📋 TEST CREDENTIALS:
- Admin Email: admin@pg.com | Password: admin123
- User Email: user@pg.com | Password: user123
- Alternative User: tp@gmail.com | Password: user123

✅ HOME PAGE TESTS
================================================================
1. ✓ Header visible with logo
2. ✓ Navigation menu shows: Home, Login/Register
3. ✓ Property list displays all 4 PGs
4. ✓ Property cards show: Name, Location, Price, Available Rooms
5. ✓ Search/Filter functionality works

🔐 AUTHENTICATION PAGE TESTS (/auth)
================================================================
Tab Switching:
1. ✓ Login tab visible by default
2. ✓ Click "Register here" link to switch to Register tab
3. ✓ Click back to Login tab

Login Form:
4. ✓ Email input field
5. ✓ Password input field
6. ✓ Login button
7. ✓ Form validation (empty fields, invalid email)
8. ✓ Successful login redirects to Home

Register Form:
9. ✓ Name input field
10. ✓ Email input field
11. ✓ Password input field
12. ✓ Confirm Password field
13. ✓ Register button
14. ✓ Form validation (matching passwords, email format)
15. ✓ Successful registration redirects to login

👤 USER DASHBOARD TESTS (/dashboard)
================================================================
Access (after login as user):
1. ✓ Dashboard accessible only when logged in
2. ✓ Page shows "📅 My Bookings" header
3. ✓ Displays all user's bookings in professional cards

Booking Cards Display:
4. ✓ Shows booking status (Pending/Approved/Rejected)
5. ✓ Shows property name with location
6. ✓ Shows number of rooms booked
7. ✓ Shows total price calculation
8. ✓ Shows booking date

Filter Buttons:
9. ✓ "All" button - shows all bookings
10. ✓ "Pending" button - filters pending bookings
11. ✓ "Approved" button - filters approved bookings
12. ✓ "Rejected" button - filters rejected bookings
13. ✓ Active filter button is highlighted

Action Buttons:
14. ✓ "View Property" button navigates to PG detail
15. ✓ "Cancel Booking" button visible for pending bookings
16. ✓ Cancellation works with confirmation dialog

Empty State:
17. ✓ If no bookings: "No Bookings Yet" message with CTA

🏠 PROPERTY DETAIL PAGE (/pg/:id)
================================================================
Access & Display:
1. ✓ Page accessible from PG list
2. ✓ Back button navigates to home
3. ✓ Property name and location displayed (with emoji)

Image Gallery:
4. ✓ Main image displays
5. ✓ Thumbnail gallery visible (if multiple images)
6. ✓ Click thumbnail to change main image
7. ✓ Hover effects on images

Property Information:
8. ✓ Price per day displayed with 💰 icon
9. ✓ Available rooms shown with 🛏️ icon
10. ✓ Description section with "About This Property"

Booking Form:
11. ✓ "Rooms to Book" input field (min 1, max available)
12. ✓ "Duration" input field (1-365 days)
13. ✓ Real-time price calculation: [Price × Rooms × Duration]
14. ✓ Total price updates as inputs change
15. ✓ "Book Now" button
16. ✓ "Login to Book" button (if not logged in)

Additional Features:
17. ✓ Share button functionality
18. ✓ Wishlist button
19. ✓ Professional animations on page load

⚙️ ADMIN PANEL TESTS (/admin/dashboard)
================================================================
Admin Authentication:
1. ✓ Only admin users can access /admin routes
2. ✓ Non-admins redirected to home
3. ✓ Admin panel hidden from header on admin routes

Admin Layout:
4. ✓ Professional header with gradient background
5. ✓ Left sidebar with navigation
6. ✓ Sidebar shows all menu items
7. ✓ Active menu item is highlighted
8. ✓ Sidebar scrollable with custom scrollbar
9. ✓ User info in header (avatar, name, role)
10. ✓ Logout button in header

Admin Dashboard (/admin/dashboard):
11. ✓ 4 stat cards visible (Total PGs, Users, Bookings, Revenue)
12. ✓ Stat cards show values and trend indicators
13. ✓ Activity feed shows recent actions
14. ✓ Quick action buttons visible

PG Management (/admin/pgs):
15. ✓ Professional table layout showing all properties
16. ✓ Table columns: Name, Location, Price, Rooms, Actions
17. ✓ Edit button (✏️) next to each property
18. ✓ Delete button (🗑️) next to each property
19. ✓ "Add New PG" button in header
20. ✓ Hover effects on table rows

Add/Edit PG Form (/admin/pgs/add, /admin/pgs/edit/:id):
Form Fields:
21. ✓ Property Name input
22. ✓ Location input
23. ✓ Price per Day input
24. ✓ Available Rooms input
25. ✓ Description textarea
26. ✓ Image upload field

Form Features:
27. ✓ Image preview grid shows selected images
28. ✓ Form validation (all required fields)
29. ✓ Submit button (💾 Add/Update Property)
30. ✓ Cancel button redirects to /admin/pgs
31. ✓ Success message displays after submission
32. ✓ Error message displays on failure
33. ✓ Loading state while submitting

Edit Functionality:
34. ✓ Edit button loads property data into form
35. ✓ Form title changes to "Edit PG"
36. ✓ Submit button label changes to "Update"
37. ✓ All fields pre-populated with property data

Delete Functionality:
38. ✓ Delete button shows confirmation
39. ✓ Property removed from table after deletion
40. ✓ User redirected back to /admin/pgs

📊 BUTTON & NAVIGATION TESTS
================================================================
Header Buttons:
1. ✓ Logo/Home button navigates to /
2. ✓ Login/Register link navigates to /auth
3. ✓ User menu dropdown shows username & role
4. ✓ Logout button clears session & redirects
5. ✓ Admin Panel button visible only for admins
6. ✓ My Bookings button visible when logged in

Form Buttons:
7. ✓ Login Submit button calls API
8. ✓ Register Submit button calls API
9. ✓ Add Property Submit sends to backend
10. ✓ Update Property Submit sends PUT request
11. ✓ Cancel buttons navigate away without saving
12. ✓ Buttons disabled during API calls

Action Buttons:
13. ✓ Filter buttons in dashboard update list
14. ✓ Active filter button highlighted
15. ✓ View Property button navigates correctly
16. ✓ Cancel Booking button shows confirmation
17. ✓ Edit button in admin table loads form
18. ✓ Delete button in admin table deletes entry
19. ✓ Add New button in admin navigates to form
20. ✓ Share button works on property detail

🎨 UI/UX TESTS
================================================================
Styling:
1. ✓ Dark theme consistent across all pages
2. ✓ Cyan (#0ce) accent color used consistently
3. ✓ Green (#4ade80) success color used
4. ✓ Purple gradient buttons (#667eea → #764ba2)
5. ✓ Glassmorphism effects visible (backdrop blur)
6. ✓ Card shadows and depth effects present

Responsiveness:
7. ✓ Desktop layout (1200px+)
8. ✓ Tablet layout (768px - 1199px)
9. ✓ Mobile layout (480px - 767px)
10. ✓ Extra small layout (<480px)

Animations:
11. ✓ Page transition animations smooth
12. ✓ Button hover effects working
13. ✓ Form input focus transitions
14. ✓ Loading spinner animation
15. ✓ Status badge colors appropriate

📱 MOBILE RESPONSIVENESS
================================================================
1. ✓ Header menu collapses to hamburger
2. ✓ PG cards stack vertically
3. ✓ Admin table responsive with labels
4. ✓ Booking cards full width
5. ✓ Forms properly sized for touch
6. ✓ All buttons are touch-friendly size

🔧 ERROR HANDLING TESTS
================================================================
Network Errors:
1. ✓ Invalid login shows error message
2. ✓ Network errors display gracefully
3. ✓ Form validation prevents empty submissions
4. ✓ File upload errors handled

User Experience:
5. ✓ Success messages appear after actions
6. ✓ Confirmation dialogs for destructive actions
7. ✓ Loading states prevent double-clicks
8. ✓ Proper redirects after operations

🔐 SECURITY TESTS
================================================================
Authentication:
1. ✓ JWT token stored in localStorage
2. ✓ Logout clears token
3. ✓ Protected routes require authentication
4. ✓ Admin routes check user role
5. ✓ Expired tokens handled gracefully

DATA TESTS
================================================================
Database:
1. ✓ Users table has 3 users
2. ✓ PGs table has 4 properties
3. ✓ Bookings table has 13 existing bookings
4. ✓ New bookings can be created
5. ✓ Bookings can be canceled

API Endpoints:
6. ✓ GET /api/pgs returns all properties
7. ✓ POST /api/auth/register creates user
8. ✓ POST /api/auth/login returns token
9. ✓ GET /api/bookings/my returns user bookings
10. ✓ POST /api/bookings creates booking
11. ✓ PUT /api/bookings/:id/status updates status

================================================================
TOTAL TEST CASES: 130+
================================================================
