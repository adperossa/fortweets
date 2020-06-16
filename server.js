// Load config
const dotenv = require('dotenv');
dotenv.config();


// Import third-party modules
const express = require('express');
const path = require('path');
const expHbs = require("express-handlebars");
const bodyParser = require("body-parser");
const expSession = require("express-session");
const Twitter = require("twitter");
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');

// Import own modules
const user = require('./models/user');


// Initialization and configuration -----------------------

const app = express();

// Handlebars
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expHbs({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, "views/layout")
}));

// Twitter
const twclient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// End initialization -------------------------------------


// Middlewares --------------------------------------------

// Ruta base de recursos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Body Parser para Content-Type "application/json"
app.use(bodyParser.json());

// Session
app.use(expSession({
  secret: "Random encryption string ",
  resave: false,
  saveUninitialized: false
}));

//  End Middlewares ---------------------------------------


// Routes

app.get('/', (req, res) => {

  res.render('home', {
    loggedUser: req.session.userId
  });

});

app.get('/search', (req, res) => {

  if (!req.query.q) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request, missing query parameter'
    });
  }

  fs.readFile(path.join(__dirname, 'csvjson.json'), 'utf8', (err, data) => {

    if (err) {

      console.log("No se pudo leer el archivo.");
      res.json({
        success: false,
        message: 'Invalid request, missing query parameter'
      });

    } else {

      let tweetList = JSON.parse(data);
      let results = tweetList.filter(tweet => tweet.Text.includes(req.query.q.toUpperCase()));

      res.render('tweets-mock', {
        layout: 'empty',
        data: {
          tweets: results,
          loggedUser: req.session.userId
        }
      });

    }

  })

  /*
  let twQuery = {
    query: 'from:ricarfort ' + req.query.q,
    fromDate: '200801010000'
  }

  twclient.get('tweets/search/fullarchive/dev', twQuery, (err, data, response) => {
    if (err) console.log(err);

    res.render('tweets', {
      layout: 'empty',
      data: {
        tweets: data.results,
        loggedUser: req.session.userId
      }
    });

  })
  */

});

app.post('/register', (req, res) => {

  // Validate correct request params
  if (!req.body.username || !req.body.password || !req.body.passwordConfirm) {
    return res.status(400).json({
      success: false,
      message: "Bad request, missing or wrong required parameters"
    });
  }

  // Construct the new user object
  const newUser = {
    username: req.body.username,
    password: req.body.password,
    favorites: []
  };

  user.create(newUser, result => {

    if (!result.success) {

      res.status(400).json({
        success: false,
        message: 'Some error'
      })

    } else {

      res.json({
        success: true,
        message: 'Registered succesfully'
      })

    }

  });

});

app.post('/login', (req, res) => {

  // Validate correct request params
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      success: false,
      message: "Bad request, missing or wrong required parameters"
    });
  }

  // Construct user object to validate
  const credentials = {
    username: req.body.username,
    password: req.body.password
  }

  user.get(credentials, result => {

    if (!result.success) {
      // Couldn't validate user
      res.status(401).json({
        success: false,
        message: "Couldn't authenticate user"
      });
    } else {
      req.session.userId = result.data._id.toString();
      res.json({
        success: true,
        message: "Correctly logged in"
      })
    }

  })

});

app.get('/logout', (req, res) => {

  req.session.destroy();
  res.redirect('/');

})

app.get('/favorites', (req, res) => {

  if (!req.session.userId) {
    return res.redirect('/');
  }
  
  // Construct user object to validate
  const loggedUser = {
    _id: new ObjectID('5ee6fbd32ce3b03754d3c198')
  }

  user.get(loggedUser, result => {

    if (!result.success) {
      // No se pudo validar usuario
      return res.redirect('/');
    }

    idList = result.data.favorites.join();

    twclient.get('statuses/lookup', { id: idList }, (err, data, response) => {
      if (err) console.log(err);

      res.render('favorites', { 
        tweets: data,
        loggedUser: req.session.userId });

    });

  });

})

app.post('/favorites/:action', (req, res) => {

  // Validate auth
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "User is not logged in"
    });
  }

  // Validate required params
  if (!req.body.tweetId) {
    return res.status(400).json({
      success: false,
      message: "Missing parameter: tweet id"
    });
  }

  // Validate allowed actions
  if (req.params.action !== 'add' && req.params.action !== 'remove') {
    return res.sendStatus(404).json({
      success: false,
      message: "Invalid route"
    });;
  }

  user.updateFavorites(req.params.action, req.session.userId, req.body.tweetId, result => {
    res.json(result);
  })

})

// Start server
app.listen(process.env.HTTP_PORT, () => {
  console.log(`Servidor iniciado en puerto ${process.env.HTTP_PORT}`);
});