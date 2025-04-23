const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve the default page (vietlot55)
app.get('/', (req, res) => {
    res.redirect('/vietlot55/vietlot55.html');
});

// Start the server
const PORT = 3005;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Default page: Vietlott 6/55');
    console.log('Available pages:');
    console.log('- http://localhost:3005/vietlot55/vietlot55.html');
    console.log('- http://localhost:3005/vietlot45/vietlot45.html');
}); 
