# FranchiseHub V2 - Testing Guide

## ✅ Current Status

### Servers Running
- **Backend:** http://localhost:2016 ✅
- **Frontend:** http://localhost:5174 ✅
- **Database:** MongoDB Connected ✅

---

## 🧪 Test Scenarios

### 1. Landing Page (/)
**URL:** http://localhost:5174

**What to Test:**
- [ ] Hero section displays properly with gradient background
- [ ] "Apply Now" button navigates to application form
- [ ] "Admin Login" and "Franchisee Login" buttons work
- [ ] Features section displays 4 feature cards
- [ ] Statistics section shows numbers
- [ ] Footer displays contact information
- [ ] Responsive design on mobile/tablet

**Expected Result:** Beautiful landing page with smooth navigation

---

### 2. Application Form (/apply)
**URL:** http://localhost:5174/apply

**What to Test:**
- [ ] Form displays with 3 sections (Personal, Business, Site)
- [ ] All fields have proper validation
- [ ] Required fields show error when empty
- [ ] Phone number accepts only 10 digits
- [ ] Email validation works
- [ ] Area sqft accepts only numbers
- [ ] Submit button shows loading state
- [ ] Success message displays after submission
- [ ] Redirect to home after 3 seconds

**Test Data:**
```
First Name: John
Last Name: Doe
Email: john.doe@test.com
Phone: 9999999999
Residential Address: 123 Test Street, Test City
Business Name: John's Restaurant
Site Address: 456 Business Ave
Site City: Mumbai
Site Postal Code: 400001
Area (sqft): 1500
Floor: 2
Ownership: Owned
```

**Expected Result:** Form submits successfully, new applicant created in database

**Verify in Admin Dashboard:** Check if John Doe appears in Applications list

---

### 3. Admin Login (/admin)
**URL:** http://localhost:5174/admin

**Test Credentials:**
```
Email: admin@franchisehub.com
Password: admin123
```

**What to Test:**
- [ ] Login form displays with gradient design
- [ ] Invalid credentials show error message
- [ ] Valid credentials redirect to dashboard
- [ ] Session persists (refresh page stays logged in)
- [ ] Logout button works

**Expected Result:** Successful login and redirect to /admin/dashboard

---

### 4. Admin Dashboard - Overview (/admin/dashboard)
**URL:** http://localhost:5174/admin/dashboard

**What to Test:**
- [ ] Sidebar shows navigation menu
- [ ] Statistics cards display correct counts:
  - Total Applications
  - Pending Applications
  - Active Franchisees
  - Total Revenue
- [ ] Recent applications table shows latest 5 entries
- [ ] Quick actions section displays

**Expected Result:** Dashboard displays all statistics and data correctly

---

### 5. Admin Dashboard - Applications (/admin/dashboard?view=applications)

**What to Test:**

#### Tabs
- [ ] "All" tab shows all applications
- [ ] "Pending" tab shows only pending applications
- [ ] "Accepted" tab shows only accepted applications
- [ ] "Granted" tab shows only granted applications
- [ ] "Rejected" tab shows only rejected applications

#### Search
- [ ] Search by name works (e.g., "Amit")
- [ ] Search by email works
- [ ] Search by business name works
- [ ] Search clears correctly

#### Table
- [ ] All applicant data displays in table
- [ ] Status badges show correct colors:
  - Pending: Orange
  - Accepted: Green
  - Granted: Blue
  - Rejected: Red
- [ ] "View Details" button opens modal
- [ ] Actions dropdown shows correct buttons based on status

#### Actions (CRITICAL - NO HANGING!)
**Test with a pending applicant:**

**Accept Action:**
- [ ] Click "Accept" from actions dropdown
- [ ] Confirm in dialog
- [ ] Loading spinner shows
- [ ] Alert shows "Success"
- [ ] Table refreshes immediately
- [ ] Status changes to "Accepted"
- [ ] **NO HANGING** - Page remains responsive

**Reject Action:**
- [ ] Click "Reject" from actions dropdown
- [ ] Confirm in dialog
- [ ] Loading spinner shows
- [ ] Alert shows "Success"
- [ ] Table refreshes immediately
- [ ] Status changes to "Rejected"
- [ ] **NO HANGING** - Page remains responsive

**Grant Access (on Accepted applicant):**
- [ ] Accept an applicant first
- [ ] Click "Grant Access" from actions dropdown
- [ ] Confirm in dialog
- [ ] Loading spinner shows
- [ ] Alert shows "Success"
- [ ] Table refreshes immediately
- [ ] Status changes to "Granted"
- [ ] Credentials created in franchise_credentails collection
- [ ] **NO HANGING** - Page remains responsive

**Test Applicants to Use:**
1. Rajesh Kumar (rajesh.kumar@gmail.com) - Pending
2. Neha Joshi (neha.joshi@gmail.com) - Already Rejected
3. Rahul Sharma (rahul.sharma@gmail.com) - Use for Grant test

**Expected Result:** All actions complete instantly without hanging. Status updates immediately.

---

### 6. Admin Dashboard - Franchises (/admin/dashboard?view=franchises)

**What to Test:**
- [ ] Table displays all franchisees with "granted" status
- [ ] Columns show: Name, Email, Business Name, Location, Status
- [ ] Status badge shows "Active" in blue/green
- [ ] Search functionality works
- [ ] Data matches granted applicants

**Expected Result:** All granted franchisees display correctly

---

### 7. Franchisee Login (/franchisee)
**URL:** http://localhost:5174/franchisee

**Test Credentials:**
```
Email: amit.patel@gmail.com
Password: amit123
```

**What to Test:**
- [ ] Login form displays with gradient design
- [ ] Invalid credentials show error message
- [ ] Valid credentials redirect to dashboard
- [ ] Only granted franchisees can login
- [ ] Session persists

**Expected Result:** Successful login and redirect to /franchisee/dashboard

---

### 8. Franchisee Dashboard - Overview (/franchisee/dashboard)

**What to Test:**
- [ ] Welcome message shows franchisee name
- [ ] Statistics cards display:
  - Total Sales
  - Today's Sales
  - This Month Sales
  - Total Orders
- [ ] Chart displays sales data (if available)
- [ ] Quick actions section displays

**Expected Result:** Dashboard shows franchisee's sales data

---

### 9. Franchisee Dashboard - Sales Management (/franchisee/dashboard?view=sales)

**What to Test:**

#### Add Sales
- [ ] Form displays with all fields
- [ ] Date picker works
- [ ] Revenue, Orders, Items fields accept only numbers
- [ ] Submit button shows loading state
- [ ] Success message displays
- [ ] Table refreshes with new entry

**Test Data:**
```
Date: Today's date
Revenue: 15000
Orders: 45
Items Sold: 120
```

#### View Sales
- [ ] Table displays all sales entries
- [ ] Data sorted by date (newest first)
- [ ] Date formatted correctly
- [ ] Revenue formatted with ₹ symbol
- [ ] Statistics update after adding sales

**Expected Result:** Sales data saved and displayed correctly

---

## 🔧 Backend API Testing

### Health Check
```bash
curl http://localhost:2016/
```
Expected: `{"status":"ok","message":"FranchiseHub V2 API is running"}`

### Admin Login
```bash
curl -X POST http://localhost:2016/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@franchisehub.com","password":"admin123"}'
```
Expected: `{"stat":true,"msg":"Login successful"}`

### Get All Applicants
```bash
curl http://localhost:2016/admin/allApplicants
```
Expected: JSON array of all applicants with status field

### Accept Applicant
```bash
curl -X POST http://localhost:2016/admin/acceptApplicant \
  -H "Content-Type: application/json" \
  -d '{"email":"rajesh.kumar@gmail.com"}'
```
Expected: `{"status":true,"message":"Applicant accepted successfully"}`

### Grant Applicant
```bash
curl -X POST http://localhost:2016/admin/grantApplicant \
  -H "Content-Type: application/json" \
  -d '{"email":"amit.patel@gmail.com"}'
```
Expected: `{"status":true,"message":"Applicant granted successfully"}`

### Save Franchise Credentials
```bash
curl -X POST http://localhost:2016/admin/saveFranchiseCred \
  -H "Content-Type: application/json" \
  -d '{"email":"amit.patel@gmail.com"}'
```
Expected: `{"status":true,"message":"Franchise credentials saved"}`

### Franchisee Login
```bash
curl -X POST http://localhost:2016/franchisee/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amit.patel@gmail.com","password":"amit123"}'
```
Expected: `{"stat":true,"msg":"Login successful"}`

---

## 🐛 Known Issues to Watch For

### ❌ OLD Version Issues (FIXED in V2)
1. ~~Accept/Reject causing page hang~~ → **FIXED: No email sending**
2. ~~Mixed number/string status types~~ → **FIXED: All strings**
3. ~~Duplicate files and messy structure~~ → **FIXED: Clean structure**

### ✅ V2 Improvements
1. **No Hanging:** All operations complete instantly
2. **Clean Code:** Organized folder structure
3. **Modern UI:** Tailwind CSS with gradients
4. **Proper Error Handling:** Try-catch blocks everywhere
5. **Loading States:** User feedback for all actions
6. **Responsive Design:** Works on all screen sizes

---

## 📊 Database Verification

### Check Applicant Status
```javascript
// In MongoDB Compass or shell
use franchiseeHub

// Find all applicants with their status
db.Applicants.find({}, {fname: 1, lname: 1, email: 1, status: 1})

// Count by status
db.Applicants.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

### Check Franchise Credentials
```javascript
// Check credentials collection (note the typo)
db.franchise_credentails.find({})

// Verify password encryption
db.franchise_credentails.findOne({email: "amit.patel@gmail.com"})
```

### Check Sales Data
```javascript
// Find sales by franchisee
db.SalesData.find({email: "amit.patel@gmail.com"}).sort({date: -1})

// Calculate total sales
db.SalesData.aggregate([
  { $match: { email: "amit.patel@gmail.com" } },
  { $group: { _id: null, totalRevenue: { $sum: "$revenue" }, totalOrders: { $sum: "$orders" } } }
])
```

---

## 🎯 Critical Test Cases

### Priority 1: No Hanging Issue
1. ✅ Accept applicant → Status changes immediately
2. ✅ Reject applicant → Status changes immediately
3. ✅ Grant access → Credentials created immediately
4. ✅ All operations complete in < 2 seconds
5. ✅ Page remains responsive at all times

### Priority 2: Data Integrity
1. ✅ Status field is always a string
2. ✅ Status values: 'pending', 'accepted', 'granted', 'rejected'
3. ✅ Credentials stored in correct collection (franchise_credentails)
4. ✅ Sales data has proper indexes

### Priority 3: User Experience
1. ✅ Loading spinners show during operations
2. ✅ Success/error messages display
3. ✅ Tables refresh automatically after actions
4. ✅ Modals close properly
5. ✅ Forms validate correctly

---

## 🚀 Ready for Deployment

Once all tests pass:
1. Push code to GitHub
2. Deploy backend to Render
3. Deploy frontend to Netlify
4. Update API_BASE_URL in frontend config
5. Test production deployment

---

## 📞 Test Contact

If you encounter any issues:
1. Check browser console for errors
2. Check terminal output for backend logs
3. Verify MongoDB connection
4. Ensure both servers are running
5. Clear browser cache and cookies

---

**Last Updated:** January 2025
**Version:** 2.0.0
**Status:** Ready for Testing ✅
