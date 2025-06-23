function balanceTeams(players, playersPerTeam) {
  // מיון לפי דירוג בסדר יורד
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);

  const numTeams = Math.floor(players.length / playersPerTeam);
  const teams = Array.from({ length: numTeams }, () => []);

  // חלוקה לקבוצות בצורת "נחש"
  let teamIndex = 0;
  let direction = 1;
  for (let i = 0; i < sortedPlayers.length; i++) {
    if (teams[teamIndex]) {
      teams[teamIndex].push(sortedPlayers[i]);
    }
    teamIndex += direction;
    if (teamIndex === numTeams || teamIndex < 0) {
      direction *= -1;
      teamIndex += direction;
    }
  }

  // הוספת סיכום דירוג לכל קבוצה
  return teams.map((team, index) => ({
    teamNumber: index + 1,
    players: team,
    totalRating: team.reduce((sum, player) => sum + player.rating, 0),
  }));
}

module.exports = { balanceTeams };