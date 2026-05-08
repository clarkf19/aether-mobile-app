# Backend Complete Setup & Troubleshooting Guide

## 🚀 Quick Start

### Step 1: Set Up Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (aether_final)
3. Navigate to **SQL Editor**
4. Click **"New Query"**
5. Copy the entire contents of `/lib/SUPABASE_INIT_COMPLETE.sql`
6. Paste into the SQL editor and click **"Run"**

This will:
- ✅ Create all 4 main tables with proper schemas
- ✅ Enable Row Level Security (RLS)
- ✅ Set up automatic timestamps
- ✅ Create performance indexes
- ✅ Enable real-time subscriptions

### Step 2: Verify Environment Variables

Check that `.env.local` contains:

```env
GEMINI_API_KEY=AIzaSyBKxq7fMXB3BZC9h6uVENKQ84FDGD93uPM
NEXT_PUBLIC_SUPABASE_URL=https://oukxdfiyewptvchkyhsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91a3hkZml5ZXdwdHZjaGt5aHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3MTk0NzAsImV4cCI6MTkyNTI5NTQ3MH0.xZa_M4v1NzxfXngKRHCmKh1z9DX8v0Z4nN3QQzPz74E
```

### Step 3: Verify Tables in Supabase

Run this query in Supabase SQL Editor to verify:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```

You should see:
- ✅ `issue_reports`
- ✅ `certificate_requests`
- ✅ `room_booking_requests`
- ✅ `leave_requests`
- ✅ `student_data`

---

## 📱 Using Real-Time Data in Frontend

### Option A: Use Real-Time Hooks (Recommended)

```typescript
'use client'

import { useRealtimeIssueReports } from '@/hooks/useRealtimeData'

export function MyComponent() {
  const { issues, loading, error } = useRealtimeIssueReports()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {issues.map(issue => (
        <div key={issue.id}>{issue.description}</div>
      ))}
    </div>
  )
}
```

Available hooks:
- `useRealtimeIssueReports()`
- `useRealtimeCertificateRequests(status?: string)`
- `useRealtimeRoomBookingRequests(status?: string)`
- `useRealtimeLeaveRequests(status?: string)`
- `useRealtimeTable(tableName: string, filters?: object)`

### Option B: Traditional Fetch (with Polling)

```typescript
const [issues, setIssues] = useState([])

useEffect(() => {
  const fetchIssues = async () => {
    const response = await fetch('/api/report-issue')
    const data = await response.json()
    setIssues(data.data.issues || [])
  }

  fetchIssues()
  const interval = setInterval(fetchIssues, 5000) // Poll every 5 seconds
  return () => clearInterval(interval)
}, [])
```

---

## 🔌 API Endpoints Reference

### Issue Reports
```
GET  /api/report-issue          # Get all issues
POST /api/report-issue          # Submit new issue
```

**POST Body:**
```json
{
  "student_email": "student@university.edu",
  "student_name": "John Doe",
  "category": "infrastructure",
  "description": "Broken toilet in bathroom",
  "location": "Building A, 2nd Floor",
  "severity": "high",
  "image_base64": "data:image/jpeg;base64,...(optional)"
}
```

### Certificate Requests
```
GET  /api/approvals/certificates          # Get pending
POST /api/approvals/certificates          # Submit request
PATCH /api/approvals/certificates/[id]   # Approve/Reject
```

**POST Body:**
```json
{
  "student_email": "student@university.edu",
  "student_name": "John Doe",
  "student_id": "CSE-2021-001",
  "certificate_type": "Transfer Certificate",
  "purpose": "Higher studies",
  "date_required": "2026-05-15"
}
```

### Room Booking Requests
```
GET  /api/approvals/room-bookings         # Get pending
POST /api/approvals/room-bookings         # Submit booking
PATCH /api/approvals/room-bookings/[id]  # Approve/Reject
```

**POST Body:**
```json
{
  "student_email": "student@university.edu",
  "student_name": "John Doe",
  "room_id": "LT-101",
  "room_name": "Lecture Hall 101",
  "booking_date": "2026-05-20",
  "start_time": "14:00",
  "end_time": "16:00",
  "purpose": "Seminar",
  "expected_attendees": 50
}
```

### Leave Requests
```
GET  /api/requests/leaves         # Get all leaves
POST /api/requests/leaves         # Submit request
PATCH /api/requests/leaves/[id]  # Approve/Reject
```

**POST Body:**
```json
{
  "student_email": "student@university.edu",
  "student_name": "John Doe",
  "leave_type": "casual",
  "reason": "Medical appointment",
  "start_date": "2026-05-15",
  "end_date": "2026-05-17",
  "image_base64": "data:image/jpeg;base64,...(optional medical certificate)"
}
```

---

## 🧪 Testing API Endpoints

### Using cURL

```bash
# Get issues
curl http://localhost:3000/api/report-issue

# Create issue
curl -X POST http://localhost:3000/api/report-issue \
  -H "Content-Type: application/json" \
  -d '{
    "student_email": "test@university.edu",
    "student_name": "Test User",
    "category": "infrastructure",
    "description": "Test issue",
    "location": "Building A",
    "severity": "low"
  }'

# Get certificates
curl http://localhost:3000/api/approvals/certificates?status=pending
```

### Using Node.js

```javascript
// In a .js file at project root
const fetch = require('node-fetch');

async function testBackend() {
  console.log('Testing Issue Reports API...');
  
  // Create issue
  const createRes = await fetch('http://localhost:3000/api/report-issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_email: 'test@university.edu',
      student_name: 'Test User',
      category: 'infrastructure',
      description: 'Test issue from script',
      location: 'Building A',
      severity: 'low'
    })
  });

  const createData = await createRes.json();
  console.log('Create response:', createData);

  // Get all issues
  const getRes = await fetch('http://localhost:3000/api/report-issue');
  const getData = await getRes.json();
  console.log('Get response:', getData);
}

testBackend().catch(console.error);
```

---

## 🔍 Debugging Checklist

### Backend Not Working?

1. **Check Supabase Connection**
   ```bash
   # Verify env vars in .env.local
   # Try connecting directly in Supabase console
   ```

2. **Check Table Existence**
   - Go to Supabase Dashboard > Database > Tables
   - Verify all 5 tables exist

3. **Check RLS Policies**
   - Supabase Dashboard > Database > Tables > Select table
   - Click on "Row Level Security" tab
   - Verify policies exist for INSERT, SELECT, UPDATE

4. **Check Real-Time Enabled**
   - In Supabase: Settings > Replication
   - Verify all tables are in the `supabase_realtime` publication

5. **Test Database Directly**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO issue_reports (student_email, category, description, location)
   VALUES ('test@test.com', 'test', 'test', 'test');
   
   SELECT * FROM issue_reports LIMIT 10;
   ```

### API Endpoints Not Responding?

1. **Check API Routes Exist**
   ```bash
   ls app/api/*/route.ts
   ```

2. **Check Console for Errors**
   - Open Next.js terminal
   - Look for error messages

3. **Verify Next.js is Running**
   ```bash
   npm run dev
   ```

4. **Check Supabase Client Initialization**
   - Verify `lib/supabase.ts` exists
   - Check environment variables are loaded

### Real-Time Not Updating?

1. **Verify Real-Time Subscription**
   ```
   Supabase Dashboard > Database > Realtime
   - Should show active subscriptions
   ```

2. **Check Browser DevTools**
   - Network tab: Look for WebSocket connections
   - Console: Look for subscription errors

3. **Restart Next.js Dev Server**
   ```bash
   # Stop: Ctrl+C
   # Start: npm run dev
   ```

---

## 📊 Performance Optimization

### Add Indexes (Already Done in INIT Script)

The initialization script automatically creates indexes for:
- Status columns
- Date columns
- Email columns
- Created_at for sorting

### Enable Caching

Add to components:

```typescript
const { issues, loading, error } = useRealtimeIssueReports()

// Data is automatically cached by React Query if integrated
// Manual cache example:
const [cache, setCache] = useState({})
```

---

## 🔐 Security Considerations

### Row Level Security (RLS) Policies

- ✅ Anyone can **INSERT** (for public submissions)
- ✅ Anyone can **SELECT** (for viewing requests)
- ✅ Authorized users can **UPDATE** (set to true for now, update later)

To make RLS more restrictive:

```sql
-- Only allow HOD to update certificates
CREATE POLICY "Only HOD can update" ON certificate_requests
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'hod')
  WITH CHECK (auth.jwt() ->> 'role' = 'hod');
```

### API Route Protection

Add authentication to sensitive endpoints:

```typescript
import { createClient } from '@/lib/supabase'

export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return errorResponse('Unauthorized', 401)
  }
  
  // Continue with update...
}
```

---

## 📝 Monitoring & Logging

### View Logs in Supabase

1. Go to **Settings** > **Logs**
2. Filter by date and table
3. Monitor API usage and errors

### Application Logging

Already implemented:
- ✅ Console logs with emojis for easy identification
- ✅ Error details in responses
- ✅ Request/response logging in all endpoints

---

## ✅ Final Verification

Run all checks:

```bash
# 1. Verify env vars
cat .env.local | grep SUPABASE

# 2. Start dev server
npm run dev

# 3. Test endpoints
curl http://localhost:3000/api/report-issue
curl http://localhost:3000/api/approvals/certificates
curl http://localhost:3000/api/approvals/room-bookings
curl http://localhost:3000/api/requests/leaves

# 4. Check logs in terminal for any errors
```

If all endpoints return JSON responses without errors, your backend is connected! 🎉

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check Supabase ANON_KEY in .env.local |
| Table not found | Run SUPABASE_INIT_COMPLETE.sql in SQL Editor |
| Real-time not working | Check table is in supabase_realtime publication |
| Slow queries | Check indexes exist (run verification query) |
| 500 errors | Check Supabase console logs and API error details |

---

## 📚 Next Steps

1. ✅ Run SUPABASE_INIT_COMPLETE.sql
2. ✅ Verify .env.local has correct credentials
3. ✅ Replace polling with useRealtimeData hooks in components
4. ✅ Test each endpoint
5. ✅ Monitor Supabase logs
6. ✅ Add authentication as needed

Need help? Check the console logs for detailed error messages! 🔍
