// Variabler til at sætte serveren op
const express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http),
path = require('path');

// Sørger for at brugere har adgang til 'public' mappen hvor vi har frontend JS, HMTL og CSS
app.use(express.static(path.join(__dirname, 'public')));

// Når brugeren forespørger serveren på port 3000 sender index.html filen til brugeren
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, + 'public/index.html'));
});

// Når en bruger er forbundet til serveren kan events heri blive kaldt
io.on('connection', socket => {
    console.log('A user connected');

    // Når en forbundet bruger ikke længere er forbundet køres dette event
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    // Når en forbundet bruger sender en besked køres dette event kald
    socket.on('message', (message) => {
        console.log('message', message);

        io.emit('message', message);
    });
});

// Sørger for at vores server lytter på port 3000
http.listen(3000, () => {
    console.log("Listening on port 3000");
});