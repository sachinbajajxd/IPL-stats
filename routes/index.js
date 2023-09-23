const express=require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const matchControllers = require('../controllers/matchControllers');

router.get('/', (req, res) => {
    console.log("Hello we are on home page");
    res.json(202);
});

router.get('/matches-per-year', matchControllers.matchesPerYear);
router.get('/matches-won-by-each-team', matchControllers.matchesWonByEachTeam);
router.get('/get-extras', matchControllers.getExtras);
router.get('/economical-bowler', matchControllers.economicalBowler);
router.get('/match-stats', matchControllers.matchesWon);

module.exports=router;