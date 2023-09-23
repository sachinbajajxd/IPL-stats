const mongoose = require('mongoose');

// Define the schema
const deliverySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId,
  },
  match_id: {
    type: Number,
  },
  inning: Number,
  batting_team: String,
  bowling_team: String,
  over: Number,
  ball: Number,
  batsman: String,
  non_striker: String,
  bowler: String,
  is_super_over: Boolean,
  wide_runs: Number,
  bye_runs: Number,
  legbye_runs: Number,
  noball_runs: Number,
  penalty_runs: Number,
  batsman_runs: Number,
  extra_runs: Number,
  total_runs: Number,
});

// Create a model from the schema
const Delivery = mongoose.model('Deliveries', deliverySchema);

// Export the model
module.exports = Delivery;
