// Dependencies
const express = require('express');
const Sequelize = require('sequelize');
const app = express();
const Twit = require('twit');
const https = require("https");
const anchorme = require('anchorme').default;
const HTMLentities = require('html-entities').XmlEntities;

// Configs
const entities = new HTMLentities();
const config = {
        twitter: {
          consumer_key: process.env.CONSUMER_KEY,
          consumer_secret: process.env.CONSUMER_SECRET,
          access_token: process.env.ACCESS_TOKEN,
          access_token_secret: process.env.ACCESS_TOKEN_SECRET
        }
      };
const T = new Twit (config.twitter);

// App
app.use (express.static ('public'));

// SQLite tables
var Likes = null;

// Setup a new database
const sequelize = new Sequelize ('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: '.data/database.sqlite'
});

const Op = Sequelize.Op;



// authenticate with the database
sequelize.authenticate ()
  .then (function (err) {
    console.log ('Connected to database');
  
    // define a new table 'Likes'
    Likes = sequelize.define ('likes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      id_str: {
        type: Sequelize.STRING
      },
      text: {
        type: Sequelize.STRING
      },
      'embed': {
        type: Sequelize.STRING
      }, 
      'screen_name': {
        type: Sequelize.STRING
      }
    });
    
    // create table
    Likes.sync({force: false});
  
  })
  .catch (function (err) {
    console.log ('Unable to connect to the database: ', err);
  });



// save likes
const saveLikes = (likes) => {

  likes.forEach (like => {
  
    Likes.findOrCreate ({
      where: { //object containing fields to found
        [Op.and]: {id: like.id},
      },
      defaults: { //object containing fields and values to apply
        id: like.id,
        id_str: like.id_str,
        text: like.text,
        embed: like.embed,
        screen_name: like.user.screen_name
      }
    }).error (function (err) {
      console.log (err);
    });
    /*.then (function () {
      console.log (`inserted tweet id ${like.id}`);
    });*/

  });
};



// Oembed
const getStatusOembed = (screen_name, id_str) => {
  
  let embedURL = `https://twitter.com/${screen_name}/status/${id_str}`;
  
  T.get ('statuses/oembed', {'url': embedURL, 'omit_script': true}, function (err, data, response) {
    if (err) {
      console.log ('error!', err);
      return false;
    }
    return data;
  });
};



// Twitter likes
const getFavorites = (since_id = 0, screen_name = process.env.SCREEN_NAME) => {
  
  let args = {
    "screen_name": screen_name,
    "since_id": since_id,
  };
  
  
  T.get ('favorites/list', {'include_entities': true})
  
    .catch (function (err) {
      console.log ('GET favorites/list error', err.stack)
    })
    .then (function (result) {
      // console.log ('data', result.data);
    
      let likes = [];
      
      result.data.forEach ((tweet) => {
        let like = {
          'id': tweet.id,
          'id_str': tweet.id_str,
          'text': anchorme (entities.encode(tweet.text)),
          'embed': getStatusOembed (tweet.user.screen_name, tweet.id_str),
          // 'urls': tweet.entities.urls,
          'hashtags': tweet.hashtags,
          'user': {
            'screen_name': tweet.user.screen_name,
          }
        };
        likes.push (like);
      });
  
      saveLikes (likes);
      return likes;
    });

};


      

// frontend get all likes
app.all ("/" + process.env.API_ENDPOINT + "/likes", function (req, res) {
  
  Likes.findAll ({order:[['createdAt', 'DESC']]}).then (function (likes) {
    res.write (JSON.stringify (likes));
    res.end ();
  });
  
});




// load favourites endpoint
app.all ("/" + process.env.BOT_ENDPOINT, function (req, res) {
  
  // Get the last tweet id
  Likes.findAll ({
    limit: 1,
    order: [['id', 'DESC']]
    // order: [['createdAt', 'DESC']]
  })
  // Then get the liked tweets since
  .then (function (likes) {
    let lastLikeID = likes[0].dataValues.id;
    console.log ('lastLikeID', lastLikeID);
    let newLikes = getFavorites (lastLikeID);  
    if (newLikes === false) res.sendStatus (500);
    else res.sendStatus (200); 
  });

});




var listener = app.listen (process.env.PORT, function () {
  console.log ('Your bot is running on port ' + listener.address().port);
});
