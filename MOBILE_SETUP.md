# 📱 VLOTO Mobile App Setup Guide

## How to Install VLOTO on Your Android Device

### Method 1: Install as PWA (Recommended)

1. **Start the Server**
   ```bash
   npm start
   ```

2. **Find Your Computer's IP Address**
   - On Windows: Open Command Prompt and type `ipconfig`
   - On Mac/Linux: Open Terminal and type `ifconfig` or `ip addr`
   - Look for your local IP address (usually starts with 192.168.x.x)

3. **Access on Your Android Device**
   - Open Chrome browser on your Android device
   - Go to `http://YOUR_IP_ADDRESS:3005` (replace YOUR_IP_ADDRESS with your computer's IP)
   - Example: `http://192.168.1.100:3005`

4. **Install the App**
   - You'll see an "Install App" button or Chrome will show an "Add to Home Screen" prompt
   - Tap "Install" or "Add to Home Screen"
   - The VLOTO app will be added to your home screen like a native app

### Method 2: Direct Browser Access

- Simply bookmark the URL in your mobile browser
- The app will work perfectly in mobile browsers with full functionality

## Features on Mobile

✅ **Responsive Design**: Optimized for touch screens  
✅ **Offline Support**: Works without internet after first load  
✅ **Touch-Friendly**: Large buttons and easy navigation  
✅ **Home Screen Icon**: Installs like a native app  
✅ **Full Functionality**: All lottery features available  

## Mobile-Specific Improvements

- **Touch-optimized interface** with larger buttons
- **Responsive grid layouts** that adapt to screen size
- **Improved number selection** with better touch targets
- **Mobile-friendly navigation** with larger tap areas
- **Optimized font sizes** for mobile readability
- **Swipe-friendly tabs** for easy navigation

## Troubleshooting

**Can't connect to the app?**
- Make sure your phone and computer are on the same Wi-Fi network
- Check that the server is running (`npm start`)
- Verify the IP address is correct
- Try temporarily disabling your computer's firewall

**App not installing?**
- Make sure you're using Chrome browser on Android
- Try refreshing the page
- Clear browser cache and try again

**App running slowly?**
- The app caches data for offline use, so it should be fast after first load
- Clear browser cache if experiencing issues
- Restart the app

## Development Notes

The VLOTO app is built as a Progressive Web App (PWA) with:
- Service Worker for offline functionality
- Web App Manifest for native app-like experience
- Responsive CSS for mobile optimization
- Touch-friendly interface elements

Enjoy using VLOTO on your mobile device! 🎰📱 
