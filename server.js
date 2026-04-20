const express = require('express');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// MongoDB User Schema (example)
const userSchema = new mongoose.Schema({
  telegramId: String,
  firstName: String,
  lastName: String,
  username: String,
  profilePhotoUrl: String
});

const User = mongoose.model('User', userSchema);

// In-memory storage for active logins (in production, use Redis or database)
const activeLogins = new Map();

// Middleware
app.use(express.json());

// Configure CORS with credentials
app.use(cors({
  origin: 'http://localhost:3000', // Frontend origin
  credentials: true
}));

// Configure session middleware
app.use(session({
  secret: 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes

// Check if user is already authenticated
app.get("/api/check-auth", async (req, res) => {
  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user._id || req.session.user.id);
      return res.json({ user });
    } catch (error) {
      return res.status(500).json({ error: "Failed to retrieve user" });
    }
  }
  res.json({ user: null });
});

// Check login status by session ID
app.get("/api/check-login", async (req, res) => {
  const { session_id } = req.query;
  
  if (!session_id) return res.json({ loggedIn: false });

  const loginData = activeLogins.get(session_id);

  if (loginData && loginData.loggedIn) {
    activeLogins.delete(session_id); // remove once retrieved
    req.session.user = loginData.user;
    // Save session to ensure persistence
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session save failed' });
      }
      
      return res.json({
        loggedIn: true,
        user: loginData.user
      });
    });

    return;
  }

  res.json({ loggedIn: false });
});

// Handle Telegram authentication callback
app.get('/auth/telegram/callback', async (req, res) => {
  const { id, first_name, last_name, username, photo_url, session_id } = req.query;
  
  if (!id || !session_id) {
    return res.status(400).send('Missing required parameters');
  }
  
  try {
    // Find or create user
    let user = await User.findOne({ telegramId: id });
    
    if (!user) {
      user = new User({
        telegramId: id,
        firstName: first_name,
        lastName: last_name,
        username: username,
        profilePhotoUrl: photo_url
      });
      await user.save();
    } else {
      // Update user info if exists
      user.firstName = first_name;
      user.lastName = last_name;
      user.username = username;
      user.profilePhotoUrl = photo_url;
      await user.save();
    }
    
    // Store login data temporarily
    activeLogins.set(session_id.toString(), {
      loggedIn: true,
      user: user.toObject()
    });
    
    // Send success response
    res.send(`
      <html>
        <body>
          <script>
            window.close();
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).send('Authentication failed');
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ message: 'Logged out successfully' });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});