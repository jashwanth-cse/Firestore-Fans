# Mobile Testing Workflow with ngrok

## Prerequisites (One-Time Setup)

1. ✅ Install ngrok from [https://ngrok.com/download](https://ngrok.com/download)
2. ✅ Sign up and get your auth token
3. ✅ Authenticate ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
4. ✅ Verify installation:
   ```bash
   ngrok version
   ```

---

## Daily Mobile Testing Workflow

### Step 1: Start Backend

Open terminal in backend directory:
```bash
cd "e:\Projects\GDG Hackathon\NexSync\backend\local"
npm start
```

Backend will run on: `http://localhost:5000`

✅ **Verify:** Open http://localhost:5000/health in browser

---

### Step 2: Start ngrok Tunnel

Open a **NEW terminal** and run:
```bash
ngrok http 5000
```

**Output Example:**
```
Session Status                online
Account                       Your Name (Plan: Free)
Forwarding                    https://abcd-1234-xyz.ngrok-free.app -> http://localhost:5000
```

**📋 COPY the HTTPS URL** (e.g., `https://abcd-1234-xyz.ngrok-free.app`)

⚠️ **Keep this terminal open!** If you close it, the tunnel stops.

---

### Step 3: Update Frontend Environment

Edit `.env` file in the **project root**:

```env
EXPO_PUBLIC_API_URL=https://abcd-1234-xyz.ngrok-free.app
```

**Replace** `abcd-1234-xyz.ngrok-free.app` with your actual ngrok URL.

💡 **Tip:** You can also add it to ALLOWED_ORIGINS in backend `.env` (optional, ngrok domains are auto-allowed)

---

### Step 4: Restart Expo (Important!)

**Stop** your current Expo server (Ctrl+C) if running.

Start Expo in **tunnel mode**:
```bash
cd "e:\Projects\GDG Hackathon\NexSync"
npm run start:tunnel
```

⏳ Wait for QR code to appear (~30 seconds)

---

### Step 5: Test on Mobile Device

1. Open **Expo Go** app on your phone
2. Ensure phone has internet (mobile data or any Wi-Fi)
3. Scan the QR code from terminal
4. App will load on your phone 📱

---

## Testing Checklist

Test these features on your mobile device:

- [ ] App loads successfully
- [ ] Login with Google works
- [ ] EventSync AI extraction works
- [ ] Venue search displays results
- [ ] Can submit event for approval
- [ ] View pending events
- [ ] View approved events
- [ ] Google Calendar sync works
- [ ] Toast messages display fully
- [ ] Admin dashboard (if admin)

---

## Troubleshooting

### Issue: "Network request failed"
**Cause:** Frontend not using ngrok URL  
**Fix:** 
1. Verify `.env` has correct ngrok URL
2. Restart Expo server
3. Clear Expo app cache (shake phone → Clear cache)

### Issue: CORS errors
**Cause:** Backend rejecting requests  
**Fix:** 
- Backend auto-allows `.ngrok-free.app` domains
- Check backend logs for CORS messages
- Verify ngrok URL is HTTPS (not HTTP)

### Issue: "Unable to connect to ngrok"
**Cause:** ngrok tunnel closed  
**Fix:** 
- Check ngrok terminal is still running
- Restart ngrok if needed
- Update `.env` with new URL

### Issue: Firebase Auth fails
**Cause:** Token issues (rare)  
**Fix:** 
- Firebase Auth works independently
- Log out and log back in
- Check Firebase console for errors

### Issue: Expo tunnel mode slow
**Cause:** Network latency  
**Fix:** 
- Ensure good internet connection
- Consider using LAN mode if on same Wi-Fi (not needed with ngrok)

---

## Return to Local Development

When done with mobile testing:

1. **Stop ngrok** (close terminal or Ctrl+C)
2. **Revert `.env`:**
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   ```
3. **Use regular Expo start:**
   ```bash
   npm start
   ```

---

## Important Notes

> **ngrok Free Tier:**
> - URL changes each time you restart ngrok
> - Must update `.env` with new URL each session
> - Session timeout after 2 hours

> **Performance:**
> - ngrok adds ~50-100ms latency
> - Perfect for testing, not for performance benchmarking

> **Security:**
> - ngrok URLs are public (anyone with URL can access)
> - Don't share production credentials
> - Free tier shows ngrok warning page on first visit

---

## Quick Reference Commands

```bash
# Start backend
cd "e:\Projects\GDG Hackathon\NexSync\backend\local"
npm start

# Start ngrok (in new terminal)
ngrok http 5000

# Update .env with ngrok URL
# EXPO_PUBLIC_API_URL=https://your-url.ngrok-free.app

# Start Expo in tunnel mode
cd "e:\Projects\GDG Hackathon\NexSync"
npm run start:tunnel

# Test backend health
curl https://your-url.ngrok-free.app/health
```

---

## Success! 🎉

You now have a permanent and reliable way to test your app on mobile from **any network**, while your backend runs locally on your laptop!

**Benefits:**
- ✅ Test on mobile data (not just Wi-Fi)
- ✅ Test from anywhere (different locations, networks)
- ✅ Show demo to anyone on their phone
- ✅ Production-like testing environment
- ✅ All features work (Firebase, Google APIs, etc.)
