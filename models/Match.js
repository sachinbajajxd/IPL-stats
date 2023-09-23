const mongoose = require('mongoose');

// Define the IPL match schema
const matchSchema = new mongoose.Schema({
  _id: String,
  id: Number,
  season: Number,
  city: String,
  date: Date,
  team1: String,
  team2: String,
  toss_winner: String,
  toss_decision: String,
  result: String,
  dl_applied: Number,
  winner: String,
  win_by_runs: Number,
  win_by_wickets: Number,
  player_of_match: String,
  venue: String,
  umpire1: String,
  umpire2: String,
});

// Create a Mongoose model for IPL matches
const Match = mongoose.model('Matches', matchSchema);

module.exports = Match;
