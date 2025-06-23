const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000; // תמיכה בפורט של Render
const { balanceTeams } = require('./teamBalancer');

app.use(express.json());
app.use(express.static('public')); // אם יש ממשק משתמש

// חיבור ל-MongoDB (עם תמיכה ב-Atlas)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/football', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// מודל שחקן
const Player = mongoose.model('Player', new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 }
}));

// הוספת שחקן
app.post('/players', async (req, res) => {
  const { name, rating } = req.body;
  if (!name || !rating || rating < 1 || rating > 10) {
    return res.status(400).json({ error: 'שם ודירוג תקין (1-10) נדרשים' });
  }
  try {
    const player = new Player({ name, rating });
    await player.save();
    res.status(201).json({ message: 'שחקן נוסף בהצלחה', player: { name, rating } });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשמירת השחקן' });
  }
});

// חלוקת קבוצות
app.post('/teams', async (req, res) => {
  const { playersPerTeam } = req.body;
  if (!playersPerTeam || playersPerTeam < 1) {
    return res.status(400).json({ error: 'מספר שחקנים לקבוצה חייב להיות לפחות 1' });
  }
  try {
    const players = await Player.find();
    if (players.length < playersPerTeam * 2) {
      return res.status(400).json({ error: 'לא מספיק שחקנים לחלוקה לקבוצות' });
    }
    const teams = balanceTeams(players, playersPerTeam);
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בחלוקת הקבוצות' });
  }
});

// איפוס שחקנים
app.delete('/players', async (req, res) => {
  try {
    await Player.deleteMany({});
    res.json({ message: 'רשימת השחקנים אופסה' });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה באיפוס השחקנים' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});