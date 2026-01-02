# 📱 Quick Start - Mobile Testing with ngrok

## One-Time Setup (5 minutes)

1. **Install ngrok:** https://ngrok.com/download
2. **Authenticate:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```

---

## Daily Mobile Testing (3 steps)

### 1️⃣ Start ngrok
```bash
ngrok http 5000
```
**→ Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### 2️⃣ Update .env
Edit `.env` in project root:
```env
EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app
```

### 3️⃣ Start Expo Tunnel
```bash
npm run start:tunnel
```
**→ Scan QR code with Expo Go app** 📱

---

## Return to Local Dev

1. Revert `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   ```
2. Use regular start:
   ```bash
   npm start
   ```

---

## Troubleshooting

**"Network request failed"**
→ Restart Expo after updating `.env`

**CORS error**
→ Check ngrok URL is HTTPS (auto-allowed by backend)

**Can't connect to ngrok**
→ Ensure ngrok terminal is still running

---

## Full Documentation

See [MOBILE_TESTING_WORKFLOW.md](file:///e:/Projects/GDG%20Hackathon/NexSync/MOBILE_TESTING_WORKFLOW.md) for complete guide.
