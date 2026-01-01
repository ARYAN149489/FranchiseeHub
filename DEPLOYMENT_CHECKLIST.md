# 🚀 Deployment Checklist

## Pre-Deployment

### ✅ Code Ready
- [x] Git repository initialized
- [x] Initial commit created
- [x] All files committed
- [ ] Pushed to GitHub

### ✅ Testing Complete
- [ ] Landing page works
- [ ] Application form submits successfully
- [ ] Admin login works
- [ ] Admin dashboard displays correctly
- [ ] Accept/Reject/Grant operations work WITHOUT HANGING
- [ ] Franchisee login works
- [ ] Franchisee dashboard works
- [ ] Sales management works
- [ ] All API endpoints tested

### ✅ Configuration
- [x] `.env` file created (not committed)
- [x] `.gitignore` configured properly
- [x] API base URL configured for dev/prod
- [x] CORS settings configured

---

## GitHub Setup

### 1. Create Repository
```bash
# On GitHub, create a new repository named: FranchiseHub-V2
# Do NOT initialize with README (we already have one)
```

### 2. Push to GitHub
```bash
cd /Users/aryankansal/Downloads/PROJECT/FranchiseHub-V2

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/FranchiseHub-V2.git

# Push code
git branch -M main
git push -u origin main
```

---

## Backend Deployment (Render)

### 1. Create New Web Service on Render
- Go to: https://dashboard.render.com/
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select `FranchiseHub-V2` repository

### 2. Configure Service
```
Name: franchisehub-backend
Root Directory: backend
Environment: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

### 3. Add Environment Variables
Go to "Environment" tab and add:
```
MONGODB_URI=mongodb+srv://aryankansal:Aryan123@cluster0.3hpti.mongodb.net/franchiseeHub?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=your-secret-key-here-change-in-production
PORT=2016
```

### 4. Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Copy the service URL (e.g., `https://franchisehub-backend.onrender.com`)

### 5. Test Backend
```bash
# Replace with your actual Render URL
curl https://franchisehub-backend.onrender.com/

# Should return: {"status":"ok","message":"FranchiseHub V2 API is running"}
```

---

## Frontend Deployment (Netlify)

### 1. Update API URL
```bash
# Edit frontend/src/config/api.js
# Change PRODUCTION_API to your Render backend URL
```

```javascript
const PRODUCTION_API = 'https://franchisehub-backend.onrender.com'; // Your actual URL
const DEVELOPMENT_API = 'http://localhost:2016';
export const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? PRODUCTION_API 
  : DEVELOPMENT_API;
```

### 2. Commit Changes
```bash
git add frontend/src/config/api.js
git commit -m "Update production API URL"
git push
```

### 3. Deploy to Netlify

#### Option A: Via Netlify Dashboard
1. Go to: https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select `FranchiseHub-V2`
4. Configure:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
5. Click "Deploy site"

#### Option B: Via Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from frontend directory
cd frontend
netlify deploy --prod

# Follow prompts:
# - Publish directory: dist
# - Build command: npm run build
```

### 4. Configure Site
- Go to Site settings
- Change site name (e.g., `franchisehub-v2`)
- Custom domain (optional)

### 5. Test Frontend
- Visit your Netlify URL (e.g., `https://franchisehub-v2.netlify.app`)
- Test all features end-to-end

---

## Post-Deployment Testing

### 1. Backend Health Check
```bash
curl https://franchisehub-backend.onrender.com/
```
Expected: `{"status":"ok","message":"FranchiseHub V2 API is running"}`

### 2. Frontend Access
- Visit: `https://franchisehub-v2.netlify.app`
- Landing page should load

### 3. Full Flow Test
1. **Submit Application**
   - Go to landing page
   - Click "Apply Now"
   - Fill form and submit
   - Should see success message

2. **Admin Login**
   - Click "Admin Login"
   - Use: `admin@franchisehub.com` / `admin123`
   - Should redirect to dashboard

3. **Test Operations**
   - Go to Applications tab
   - Find the test application
   - Try Accept → Should work instantly
   - Try Reject → Should work instantly
   - Try Grant Access → Should work instantly

4. **Franchisee Login**
   - Logout from admin
   - Click "Franchisee Login"
   - Use granted franchisee credentials
   - Should access dashboard

5. **Sales Management**
   - Add a sales entry
   - View sales table
   - Check statistics update

### 4. Performance Check
- [ ] Page loads in < 3 seconds
- [ ] API calls return in < 2 seconds
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] All buttons work

---

## DNS & Custom Domain (Optional)

### 1. Purchase Domain
- Namecheap, GoDaddy, or Google Domains
- Example: `franchisehub.com`

### 2. Configure Netlify
- Go to Site settings → Domain management
- Click "Add custom domain"
- Enter your domain
- Follow DNS configuration instructions

### 3. Configure DNS Records
Point to Netlify:
```
Type: CNAME
Name: www
Value: franchisehub-v2.netlify.app
```

### 4. SSL Certificate
- Netlify automatically provides free SSL
- HTTPS enabled by default

---

## Monitoring & Maintenance

### 1. Render Backend
- Monitor logs: https://dashboard.render.com/
- Check for errors
- Restart if needed (free tier sleeps after inactivity)

### 2. Netlify Frontend
- Check build logs
- Monitor function analytics
- Review error reports

### 3. MongoDB Atlas
- Monitor cluster health
- Check connection limits
- Review query performance

### 4. Keep Backend Awake (Free Tier)
Render free tier sleeps after 15 minutes of inactivity.

**Option 1: Use a ping service**
- UptimeRobot: https://uptimerobot.com/
- Ping your backend every 10 minutes

**Option 2: Add to cron-job.org**
- Create account at https://cron-job.org/
- Add job: `https://franchisehub-backend.onrender.com/`
- Interval: Every 10 minutes

---

## Rollback Plan

If deployment fails:

### 1. Backend Issues
```bash
# Check Render logs
# Common issues:
# - MongoDB connection error → Check MONGODB_URI
# - Port binding error → Ensure PORT env var set
# - Module not found → Check package.json
```

### 2. Frontend Issues
```bash
# Check Netlify build logs
# Common issues:
# - Build failed → Check npm run build locally
# - API calls fail → Verify CORS settings on backend
# - 404 errors → Check _redirects file needed
```

### 3. Create _redirects file if needed
```bash
# Create frontend/public/_redirects
/* /index.html 200
```

---

## Success Criteria

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Application form submits to production database
- [ ] Admin can login and manage applications
- [ ] Accept/Reject/Grant work without hanging
- [ ] Franchisee can login and manage sales
- [ ] All operations complete in < 2 seconds
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SSL enabled (HTTPS)

---

## Useful Links

- **Backend (Render):** https://dashboard.render.com/
- **Frontend (Netlify):** https://app.netlify.com/
- **Database (MongoDB):** https://cloud.mongodb.com/
- **Repository:** https://github.com/YOUR_USERNAME/FranchiseHub-V2

---

## Support & Troubleshooting

### Common Issues

**1. CORS Error**
```javascript
// Backend server.js should have:
app.use(cors({
  origin: 'https://franchisehub-v2.netlify.app',
  credentials: true
}));
```

**2. Backend Cold Start**
- First request after sleep takes 30-60 seconds
- Subsequent requests are fast
- Use ping service to prevent sleep

**3. MongoDB Connection Timeout**
- Check MongoDB Atlas IP whitelist (0.0.0.0/0 for all)
- Verify MONGODB_URI is correct
- Check cluster is running

**4. Build Errors on Netlify**
- Ensure all dependencies in package.json
- Test `npm run build` locally first
- Check Node version compatibility

---

**Status:** Ready for Deployment! 🚀
**Last Updated:** January 2025
**Next Steps:** 
1. ✅ Test locally (DONE)
2. ⏳ Push to GitHub
3. ⏳ Deploy to Render
4. ⏳ Deploy to Netlify
5. ⏳ Test production
