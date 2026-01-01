# NexSync AI

**AI-Powered College Management Platform**  
A comprehensive React Native (Expo) mobile application for college students, featuring intelligent event booking, venue management, and travel coordination powered by Google Gemini AI.

---

## 🚀 Features

### 📅 EventSync Module
- **AI Event Extraction**: Describe your event in natural language → AI extracts details
- **Smart Venue Booking**: Automatically find available venues matching your requirements
- **Admin Approval Workflow**: Secure request-review-approve system
- **Google Calendar Integration**: Sync approved events automatically
- **Real-time Availability**: Check venue occupancy and time slot conflicts

### 🚗 TravelSync Module *(Coming Soon)*
- Carpooling coordination for college events
- Travel route optimization
- Real-time ride matching

---

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo Router)
- **Backend**: Express.js (Local) + Firebase Functions (Cloud)
- **Database**: Firebase Firestore
- **AI**: Google Gemini 1.5 Flash
- **Calendar**: Google Calendar API
- **Authentication**: Firebase Auth (SECE Email Only)
- **Language**: TypeScript

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI
- Firebase Account
- Google Cloud Account (for Gemini AI & Calendar API)

---

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/NexSync.git
cd NexSync
```

### 2. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend/local
npm install
cd ../..
```

### 3. Configure Environment Variables

**Frontend** - Create `NexSync/.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Backend** - Create `backend/local/.env`:
```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_CALENDAR_ID=primary
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19000
```

**Firebase Service Account**:
- Download `serviceAccountKey.json` from Firebase Console
- Place in `backend/functions/serviceAccountKey.json`

### 4. Seed Database
```bash
cd backend/local
npm run seed:venues  # Creates 10 sample venues
npm run seed:admins  # Creates 10 admin users
```

### 5. Run Application

**Terminal 1 - Backend**:
```bash
cd backend/local
npm start
```

**Terminal 2 - Frontend**:
```bash
npm start
```

Access: Open Expo app on your phone or press `w` for web browser.

---

## 📁 Project Structure

```
NexSync/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login/Signup
│   ├── (tabs)/            # Main app tabs
│   ├── (eventsync)/       # EventSync module
│   └── (onboarding)/      # Welcome tour
├── src/
│   ├── components/        # Reusable UI components
│   ├── services/          # API & Firebase services
│   ├── constants/         # Theme & config
│   └── types/             # TypeScript types
├── backend/
│   ├── local/             # Express server (development)
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Business logic
│   │   ├── services/      # External services
│   │   └── scripts/       # Seed scripts
│   └── functions/         # Firebase Functions (production)
└── assets/                # Images, fonts, icons
```

---

## 🔐 Security

- **Email Restriction**: Only `@sece.ac.in` emails allowed
- **JWT Authentication**: Firebase ID tokens
- **Admin Role Check**: Middleware protection
- **Environment Variables**: All secrets in `.env` (gitignored)
- **Service Account**: Secure Firebase Admin SDK

---

## 📱 Features in Detail

### EventSync Workflow
1. **User Input**: "Need a computer lab for 50 students tomorrow at 2 PM"
2. **AI Processing**: Gemini AI extracts event details
3. **Venue Search**: Backend finds available venues
4. **Selection**: User picks venue or gets AI alternatives
5. **Submission**: Request sent for admin approval
6. **Approval**: Admin reviews and approves
7. **Calendar Sync**: Auto-sync to Google Calendar

### Admin Features
- View all pending requests
- Approve/reject with one click
- Atomic venue slot allocation
- Conflict detection

---

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:5000/health
```

### API Test (with auth token)
```bash
curl -X POST http://localhost:5000/api/events/extract \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userText":"Need lab for 50 students tomorrow"}'
```

---

## 📚 API Documentation

See `backend/local/README.md` for complete API reference.

**Key Endpoints**:
- `POST /api/events/extract` - AI event extraction
- `POST /api/events/findAvailable` - Find venues
- `POST /api/events/submitRequest` - Submit for approval
- `POST /api/admin/approve` - Approve request
- `POST /api/events/syncCalendar` - Google Calendar sync

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

Developed for **GDG Hackathon 2026**

---

## 🙏 Acknowledgments

- Google Gemini AI
- Firebase Platform
- Expo Framework
- React Native Community

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@nexsync.app

---

**Built with ❤️ for SECE Students**
