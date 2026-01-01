# 🚀 NexSync - Startup Guide

## Quick Start

### 📋 Prerequisites
- Node.js installed
- Firebase project configured
- `.env` files created (see below)
- Dependencies installed (`npm install`)

---

## 🔥 Starting the Application

### Option 1: Start Both Servers (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend/local
npm start
```
**Expected Output:**
```
✅ Firebase Admin SDK initialized
🚀 EventSync Backend running on http://localhost:5000
📝 Health check: http://localhost:5000/health
```

**Terminal 2 - Frontend:**
```bash
# From project root (NexSync/)
npm start
```
**Expected Output:**
```
› Metro waiting on exp://192.168.x.x:8081
› Press w │ open web
› Press a │ open Android
› Press i │ open iOS simulator
```

Then press `w` to open in browser or scan QR code with Expo Go app.

---

## 🛑 Stopping the Servers

- Press `Ctrl+C` in each terminal to stop

---

## ⚙️ Environment Setup

### 1. Root `.env` (Frontend)
Location: `NexSync/.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 2. Backend `.env`
Location: `backend/local/.env`

```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
GEMINI_API_KEY=your-gemini-key
GOOGLE_CALENDAR_ID=primary
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19000
```

### 3. Service Account Key
Location: `backend/functions/serviceAccountKey.json`
- Download from Firebase Console
- Project Settings → Service Accounts → Generate New Private Key

---

## ✅ Health Checks

### Backend Health Check:
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Backend Running OK",
  "timestamp": "2026-01-01T..."
}
```

### Frontend Health:
- Open browser at `http://localhost:8081`
- Should see the app login screen

---

## 🐛 Troubleshooting

### Backend Won't Start:
1. Check `.env` file exists in `backend/local/`
2. Verify `serviceAccountKey.json` is present
3. Check port 5000 is not in use: `netstat -ano | findstr :5000`
4. Check Gemini API key is valid

### Frontend Won't Connect:
1. Verify backend is running (health check)
2. Check `.env` has `EXPO_PUBLIC_API_URL=http://localhost:5000`
3. Restart frontend after changing `.env`: `npm start`

### "ERR_CONNECTION_REFUSED":
- Backend is not running
- Start backend first, then frontend

### "Gemini Model Not Found":
- Check `backend/local/services/geminiService.js` uses `gemini-1.5-flash-latest`
- Verify Gemini API key is correct

---

## 📱 Access the App

### Web Browser:
```
http://localhost:8081
```

### Mobile (Expo Go):
1. Install Expo Go app
2. Scan QR code from terminal
3. Ensure phone is on same network as computer

---

## 🎯 Testing EventSync

1. **Login** with `@sece.ac.in` email
2. Navigate to **EventSync** tab
3. Type: `"Need a computer lab for 50 students tomorrow at 2 PM"`
4. Press Send
5. AI should extract event details ✨

---

## 📦 First Time Setup

If this is your first time running:

```bash
# 1. Install all dependencies
npm install
cd backend/local && npm install
cd ../..

# 2. Seed database (creates venues & admins)
cd backend/local
npm run seed:venues
npm run seed:admins

# 3. Start servers (see above)
```

---

## 🔑 Admin Credentials (After Seeding)

Email: `admin1@sece.ac.in` to `admin10@sece.ac.in`  
Password: `Admin@123` (for all)

---

## 💡 Pro Tips

- Keep both terminals visible to monitor logs
- Backend shows all API calls in real-time
- Frontend shows metro bundler progress
- Use `Ctrl+C` to stop, not closing terminal
- Check logs if something fails

---

**Need help?** Check the logs in the terminal for error messages!

✅ **You're all set! Happy coding!** 🚀
