#!/bin/bash
# Health Check Script for FranchiseHub V2

echo "🏥 FranchiseHub V2 Health Check"
echo "================================"
echo ""

# Check Backend
echo "1️⃣ Checking Backend (port 2016)..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:2016/)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "   ✅ Backend is running"
    curl -s http://localhost:2016/ | python3 -m json.tool
else
    echo "   ❌ Backend is not responding (HTTP $BACKEND_STATUS)"
fi
echo ""

# Check Frontend
echo "2️⃣ Checking Frontend (port 5174)..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5174/)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ Frontend is running"
else
    echo "   ❌ Frontend is not responding (HTTP $FRONTEND_STATUS)"
fi
echo ""

# Check MongoDB Connection (via backend)
echo "3️⃣ Testing Database Connection..."
APPLICANTS=$(curl -s http://localhost:2016/admin/allApplicants)
if echo "$APPLICANTS" | grep -q "status"; then
    COUNT=$(echo "$APPLICANTS" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('doc', [])))" 2>/dev/null)
    echo "   ✅ Database connected - $COUNT applicants found"
else
    echo "   ❌ Database connection failed"
fi
echo ""

# Test Admin Login
echo "4️⃣ Testing Admin Login..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:2016/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@franchisehub.com","password":"admin123"}')
if echo "$LOGIN_RESULT" | grep -q "true"; then
    echo "   ✅ Admin login working"
else
    echo "   ❌ Admin login failed"
fi
echo ""

# Test Franchisee Login
echo "5️⃣ Testing Franchisee Login..."
FRAN_LOGIN=$(curl -s -X POST http://localhost:2016/franchisee/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amit.patel@gmail.com","password":"amit123"}')
if echo "$FRAN_LOGIN" | grep -q "true"; then
    echo "   ✅ Franchisee login working"
else
    echo "   ❌ Franchisee login failed"
fi
echo ""

# Performance Test
echo "6️⃣ Performance Test (Accept Operation)..."
START_TIME=$(date +%s.%N)
ACCEPT_RESULT=$(curl -s -X POST http://localhost:2016/admin/acceptApplicant \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}' 2>/dev/null)
END_TIME=$(date +%s.%N)
DURATION=$(echo "$END_TIME - $START_TIME" | bc)
echo "   ⏱️  Response time: ${DURATION}s"
if (( $(echo "$DURATION < 1" | bc -l) )); then
    echo "   ✅ Performance excellent (< 1 second)"
else
    echo "   ⚠️  Performance acceptable but slow (> 1 second)"
fi
echo ""

# Summary
echo "================================"
echo "📊 Health Check Summary"
echo "================================"
echo ""
echo "Servers:"
echo "  • Backend:  http://localhost:2016"
echo "  • Frontend: http://localhost:5174"
echo ""
echo "Test Credentials:"
echo "  • Admin: admin@franchisehub.com / admin123"
echo "  • Franchisee: amit.patel@gmail.com / amit123"
echo ""
echo "Next Steps:"
echo "  1. Open browser: http://localhost:5174"
echo "  2. Test all features manually"
echo "  3. Follow FINAL_CHECKLIST.md"
echo "  4. Deploy when ready!"
echo ""
