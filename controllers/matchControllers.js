const Match=require('../models/Match');
const Delivery=require('../models/Delivery');

module.exports.matchesPerYear = async(req, res) => {
    try {
        const response = await Match.aggregate([
          {
            $group: {
              _id: '$season',
              totalMatches: { $sum: 1 },
            }
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]);
        console.log(response, "Foo");
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.matchesWonByEachTeam = async(req, res) => {
    try{
        const result = await Match.aggregate([
            {
              $group: {
                _id: '$season',
                teams: {
                  $addToSet: '$team1',
                  $addToSet: '$team2',
                },
                winnerCounts: {
                  $push: '$winner',
                },
              },
            },
            {
              $unwind: '$winnerCounts',
            },
            {
              $unwind: '$teams',
            },
            {
              $group: {
                _id: {
                  season: '$_id',
                  team: '$teams',
                },
                matchesWon: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$winnerCounts', '$teams'] },
                      then: 1,
                      else: 0,
                    },
                  },
                },
              },
            },
            {
              $group: {
                _id: '$_id.season',
                matchResults: {
                  $push: {
                    team: '$_id.team',
                    matchesWon: '$matchesWon',
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                year: '$_id',
                matchResults: 1,
              },
            },
            {
                $sort: {
                  year: 1, 
                },
            },
          ]);
            console.log(result); 
            res.status(200).json({result});         
    }catch(error){
        console.log(error);
        return res.status(500).json({message: "Server Error"});
    }
}

module.exports.getExtras = async(req, res) => {

  try{

    var year=parseInt(req.params.id, 10);

    console.log(year);

    const response = await Match.aggregate([

      {
        $match: { season: year} 
      },
      {
        $lookup: {
          from: 'deliveries', // Name of the "deliveries" collection
          localField: 'id', // Field from the "matches" collection
          foreignField: 'match_id', // Field from the "deliveries" collection
          as: 'match_deliveries' // Alias for the merged data
        }
      },
      {
        $unwind: '$match_deliveries' // Deconstruct the merged array
      },
      {
        $group: {
          _id: '$match_deliveries.bowling_team', // Group by the bowling team
          totalExtras: { $sum: '$match_deliveries.extra_runs' } // Calculate the total extra runs
        }
      },
    ]);

    console.log(response);
    return res.status(200).json(response);

  }catch(error){
    console.log(error);
    return res.status(500).json({message: "Server Error"});
  }
}

module.exports.economicalBowler = async(req, res) => {

  try{

    var year=parseInt(req.params.id, 10);

    console.log(year);

    const response = await Match.aggregate([

      {
        $match: { season: year} 
      },
      {
        $lookup: {
          from: 'deliveries', // Name of the "deliveries" collection
          localField: 'id', // Field from the "matches" collection
          foreignField: 'match_id', // Field from the "deliveries" collection
          as: 'match_deliveries' // Alias for the merged data
        }
      },
      {
        $unwind: '$match_deliveries' // Deconstruct the merged array
      },
      {
        $group: {
          _id: {
              team: '$match_deliveries.bowling_team', // Group by the bowling team
              bowler: '$match_deliveries.bowler',
          },
          totalRuns: { $sum: '$match_deliveries.total_runs' },
          totalBalls: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          team: '$_id.team', // Extract the team name
          bowler: '$_id.bowler', // Extract the bowler name
          economy: {
            $divide: ['$totalRuns', '$totalBalls'] // Calculate the economy rate
          }
        }
      },
      {
        $sort: { economy: 1 } // Sort by economy rate in ascending order
      },
      {
        $group: {
          _id: '$team',
          bestBowler: { $first: '$bowler' }, // Get the best (most economical) bowler
          economy: { $first: '$economy' } // Get the economy rate of the best bowler
        }
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          team: '$_id',
          bestBowler: 1,
          economy: 1
        }
      }
    ]);

    // console.log(response);
    return res.status(200).json(response);

  }catch(error){
    console.log(error);
    return res.status(500).json({message: "Server Error"});
  }
}

module.exports.matchesWon = async (req, res) => {

  var year=parseInt(req.params.id, 10);

  console.log(year);

  try{
    const response = await Match.aggregate([
      {
        $match: { season: year } // Filter matches for the desired year
      },
      {
        $facet: {
          team1Stats: [
            {
              $group: {
                _id: '$team1',
                matchesPlayed: { $sum: 1 },
                matchesWon: {
                  $sum: {
                    $cond: [{ $eq: ['$team1', '$winner'] }, 1, 0]
                  }
                }
              }
            }
          ],
          team2Stats: [
            {
              $group: {
                _id: '$team2',
                matchesPlayed: { $sum: 1 },
                matchesWon: {
                  $sum: {
                    $cond: [{ $eq: ['$team2', '$winner'] }, 1, 0]
                  }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          stats: {
            $concatArrays: ['$team1Stats', '$team2Stats']
          }
        }
      },
      {
        $unwind: '$stats'
      },
      {
        $group: {
          _id: '$stats._id',
          matchesPlayed: { $sum: '$stats.matchesPlayed' },
          matchesWon: { $sum: '$stats.matchesWon' }
        }
      },
      {
        $project: {
          team: '$_id',
          matchesPlayed: 1,
          matchesWon: 1,
          _id: 0
        }
      },
      {
        $sort: { team: 1 } // Optionally, sort the results by team name
      }
    ]);
    console.log(response);
    return res.status(200).json(response);
  }catch(error){
    console.log(error);
    return res.status(500).json({message: "Server Error"});
  }

}
