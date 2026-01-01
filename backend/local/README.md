# NexSync EventSync Backend

Local Express backend server for event slot allocation with AI-powered features.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend/local
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `PORT` - Server port (default: 5000)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account key
- `GEMINI_API_KEY` - Your Gemini AI API key
- `GOOGLE_CALENDAR_ID` - Google Calendar ID for event sync
- `ALLOWED_ORIGINS` - CORS allowed origins

### 3. Seed Database
```bash
# Create 10 sample venues
npm run seed:venues

# Create 10 admin users
npm run seed:admins

# Or run both
npm run seed:all
```

### 4. Start Server
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## 📚 API Endpoints

### Health Check
```bash
GET /health
```

### Event Endpoints (Require Authentication)

#### 1. Extract Event from Natural Language
```bash
POST /api/events/extract
Authorization: Bearer <token>
Content-Type: application/json

{
  "userText": "Next Tuesday morning I need a lab for 60 students with computers"
}
```

#### 2. Find Available Venues
```bash
POST /api/events/findAvailable
Authorization: Bearer <token>

{
  "date": "2026-01-15",
  "startTime": "10:00",
  "durationHours": 2,
  "seatsRequired": 60,
  "facilitiesRequired": ["Computers", "Projector"]
}
```

#### 3. Get AI Venue Suggestions
```bash
POST /api/events/suggestAlternative
Authorization: Bearer <token>

{
  "date": "2026-01-15",
  "startTime": "10:00",
  "durationHours": 2,
  "seatsRequired": 60,
  "facilitiesRequired": ["Computers"]
}
```

#### 4. Submit Event Request
```bash
POST /api/events/submitRequest
Authorization: Bearer <token>

{
  "eventName": "AI Workshop",
  "description": "Introduction to Machine Learning",
  "date": "2026-01-15",
  "startTime": "10:00",
  "durationHours": 2,
  "seatsRequired": 60,
  "facilitiesRequired": ["Computers", "Projector"],
  "venueId": "venue_id_here"
}
```

#### 5. Get Pending Requests
```bash
GET /api/events/pending/:userId
Authorization: Bearer <token>
```

#### 6. Get Approved Events
```bash
GET /api/events/approved/:userId
Authorization: Bearer <token>
```

#### 7. Sync to Google Calendar
```bash
POST /api/events/syncCalendar
Authorization: Bearer <token>

{
  "approvedEventId": "event_id_here"
}
```

### Admin Endpoints (Require Admin Role)

#### 8. Approve Request
```bash
POST /api/admin/approve
Authorization: Bearer <admin_token>

{
  "requestId": "request_id_here"
}
```

#### 9. Reject Request
```bash
POST /api/admin/reject
Authorization: Bearer <admin_token>

{
  "requestId": "request_id_here",
  "reason": "Optional rejection reason"
}
```

#### 10. Get All Pending (Admin View)
```bash
GET /api/admin/pending
Authorization: Bearer <admin_token>
```

---

## 🧪 Testing

### Using cURL

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Extract Event:**
```bash
curl -X POST http://localhost:5000/api/events/extract \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userText":"Need computer lab for 50 students tomorrow at 2 PM"}'
```

### Get Firebase Token

Use the frontend login to get a token, or use Firebase Admin SDK:
```javascript
// Get token from Firebase Auth in your app
const token = await user.getIdToken();
```

---

## 📁 Project Structure

```
backend/local/
├── server.js              # Express app entry point
├── package.json
├── .env
├── routes/
│   ├── eventRoutes.js    # Event API routes
│   └── adminRoutes.js    # Admin API routes
├── controllers/
│   ├── eventController.js # Event business logic
│   └── adminController.js # Admin operations
├── services/
│   ├── firestoreService.js   # Firestore CRUD
│   ├── geminiService.js      # Gemini AI integration
│   ├── calendarService.js    # Google Calendar API
│   └── venueService.js       # Venue logic
├── middleware/
│   ├── authMiddleware.js     # Token verification
│   └── adminMiddleware.js    # Admin check
├── utils/
│   ├── validateEventData.js  # Input validation
│   └── timeUtils.js          # Date/time helpers
└── scripts/
    ├── seedVenues.js     # Seed venues
    └── seedAdmins.js     # Seed admins
```

---

## 🔐 Authentication

All endpoints (except `/health`) require Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

Admin endpoints additionally require `role: 'admin'` in Firestore user document.

---

## 📊 Firestore Collections

### event_venues
```javascript
{
  name: string,
  building: string,
  floor: number,
  capacity: number,
  facilities: string[],
  occupiedSlots: [{
    date: string,
    startTime: string,
    endTime: string,
    eventId: string
  }],
  isActive: boolean,
  createdAt: timestamp
}
```

### event_requests (Pending)
```javascript
{
  userId: string,
  userEmail: string,
  eventName: string,
  description: string,
  date: string,
  startTime: string,
  durationHours: number,
  seatsRequired: number,
  facilitiesRequired: string[],
  venueId: string,
  venueName: string,
  status: "pending",
  createdAt: timestamp
}
```

### approved_events
```javascript
{
  // ... all fields from event_requests
  status: "approved",
  approvedBy: string,
  approvedAt: timestamp,
  calendarEventId: string | null
}
```

---

## 🛠️ Development

### Run in Development Mode
```bash
npm run dev  # Uses nodemon for auto-reload
```

### Environment Variables
See `.env.example` for all required variables.

---

## 🔑 Admin Credentials (After Seeding)

```
Email: admin1@sece.ac.in - admin10@sece.ac.in
Password: Admin@123 (for all)
```

---

## 📝 Notes

- Server runs on `http://localhost:5000` by default
- CORS is configured for Expo development ports
- All dates in `YYYY-MM-DD` format
- All times in `HH:MM` 24-hour format
- Time slots are checked for conflicts automatically
- Gemini AI extracts event data from natural language
- Google Calendar sync requires service account setup
