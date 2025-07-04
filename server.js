const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3005;

// Serve static files from the root directory
app.use(express.static('.'));

// Serve manifest.json with correct MIME type
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Serve service worker with correct MIME type
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

// Serve icons
app.use('/icons', express.static(path.join(__dirname, 'icons')));

// Root route serves the main index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve vietlot45 files
app.use('/vietlot45', express.static(path.join(__dirname, 'vietlot45')));

// Serve vietlot55 files
app.use('/vietlot55', express.static(path.join(__dirname, 'vietlot55')));

app.listen(port, () => {
    console.log(`🎰 VLOTO server running at http://localhost:${port}`);
    console.log(`📱 Access on your Android device using your computer's IP address`);
    console.log(`📱 Install as PWA by opening in Chrome and tapping "Add to Home Screen"`);
}); 
