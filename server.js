require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { syncDatabase } = require('./db');
require('./auth'); // Passport strategy setup

const app = express();



app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Debug session middleware
app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('Session ID:', req.sessionID);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Debug Passport middleware
app.use((req, res, next) => {
  console.log('Passport:', req._passport);
  console.log('User:', req.user);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/profile-data', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ email: req.user.email });
});

app.use('/auth', require('./auth'));

syncDatabase().then(() => {
  app.listen(3002, () => {
    console.log('Server is running on http://localhost:3002');
  });
});
