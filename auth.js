require('dotenv').config();
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { createUser, findUserByGoogleId } = require('./db');

const router = express.Router();

console.log("Initializing Passport.js");

passport.serializeUser((user, cb) => {
  console.log("Serializing user:", user);
  process.nextTick(() => {
    return cb(null, {
      id: user.id,
      email: user.email,
      googleId: user.googleId
    });
  });
});

passport.deserializeUser((user, cb) => {
  console.log("Deserializing user:", user);
  process.nextTick(() => {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3002/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
  console.log("Google authentication callback invoked");
  console.log("Token:", token);
  console.log("Token Secret:", tokenSecret);
  console.log("Profile:", profile);
  try {
    let user = await findUserByGoogleId(profile.id);
    console.log("User found by Google ID:", user);
    if (!user) {
      console.log("User not found, creating new user");
      user = await createUser(profile.emails[0].value, profile.id);
      console.log("New user created:", user);
    }
    return done(null, user);
  } catch (err) {
    console.log("Error in authentication process:", err);
    return done(err);
  }
}));

router.get('/google', (req, res, next) => {
  console.log("Initiating Google authentication");
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  console.log("Handling Google authentication callback");
  next();
}, passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  console.log("Google authentication successful, redirecting");
  res.redirect('/');
});

router.get('/logout', (req, res, next) => {
  console.log("User logging out");
  req.logout(err => {
    if (err) {
      console.log("Error during logout:", err);
      return next(err);
    }
    res.redirect('/');
  });
});

console.log("Exporting router module");
module.exports = router;
