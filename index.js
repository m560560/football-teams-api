const express = require('express');
const app = express();
const port = 3000;
const { balanceTeams } = require('./teamBalancer');

app.use(express.json());

let players = [];

// Endpoint להוספת שחקן
app.post('/players', (req, res) => {
  const { name, rating } = req.body;
  if (!name || !rating || rating < 1 || rating > 10) {
    return res.status(400).json({ error: 'שם ודירוג תקין (1-10) נדרשים' });
  }
  players.push({ name, rating });
  res.status(201).json({ message: 'שחקן נוסף בהצלחה', player: { name, rating } });
});

// Endpoint לחלוקת קבוצות
app.post('/teams', (req, res) => {
  const { playersPerTeam } = req.body;
  if (!playersPerTeam || playersPerTeam < 1) {
    return res.status(400).json({ error: 'מספר שחקנים לקבוצה חייב להיות לפחות 1' });
  }
  if (players.length < playersPerTeam * 2) {
    return res.status(400).json({ error: 'לא מספיק שחקנים לחלוקה לקבוצות' });
  }

  const teams = balanceTeams(players, playersPerTeam);
  res.json({ teams });
});

// Endpoint לאיפוס שחקנים
app.delete('/players', (req, res) => {
  players = [];
  res.json({ message: 'רשימת השחקנים אופסה' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});