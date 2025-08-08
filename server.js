const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the root directory with aggressive cache control
app.use(express.static(__dirname, {
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
        // Aggressive cache prevention for HTML files
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Surrogate-Control', 'no-store');
            res.setHeader('Vary', '*');
            res.setHeader('Last-Modified', new Date().toUTCString());
        }
        // Aggressive cache prevention for JSON files
        if (path.endsWith('.json')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Surrogate-Control', 'no-store');
            res.setHeader('Vary', '*');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Last-Modified', new Date().toUTCString());
        }
    }
}));

// Serve the default page (vietlot55)
app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.redirect('/vietlot55/vietlot55.html');
});

// Add specific routes for HTML files with aggressive cache-busting
app.get('/vietlot55/vietlot55.html', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Vary', '*');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', `"${Date.now()}-${Math.random()}"`);
    res.sendFile(path.join(__dirname, 'vietlot55', 'vietlot55.html'));
});

app.get('/vietlot45/vietlot45.html', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Vary', '*');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', `"${Date.now()}-${Math.random()}"`);
    res.sendFile(path.join(__dirname, 'vietlot45', 'vietlot45.html'));
});

// Start the server
const PORT = 3005;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Default page: Vietlott 6/55');
    console.log('Available pages:');
    console.log('- http://localhost:3005');
    console.log('- http://localhost:3005/vietlot55/vietlot55.html');
    console.log('- http://localhost:3005/vietlot45/vietlot45.html');
}); 
