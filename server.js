// Load config
const dotenv = require('dotenv');
dotenv.config();


// Import third-party modules
const express = require('express');
const path = require('path');
const expHbs = require("express-handlebars");
const bodyParser = require("body-parser");
// const expSession = require("express-session");
const Twitter = require("twitter");

// Import own modules
const users = require('./models/users');


// Initialization and configuration -----------------------

const app = express();

// Handlebars
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expHbs({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, "views/layouts")
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

//  End Middlewares ---------------------------------------


// Routes

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/search', (req, res) => {

  if (!req.query.q) {
    return res.status(400).json({
      success: false,
      message: "Invalid request, missing query parameter"
    });
  }
  
  twclient.get("tweets/search/30day/dev", { query: req.query.q, maxResults: 10 }, (err, data, response) => {
    if(err) console.log(err);
    res.json(data);
  })

});

app.post('/register', (req, res) => {
  
  // Validate correct request params
  if (!req.body.username || !req.body.password || !req.body.passwordConfirm) {
    return res.status(400).json({
      success: false,
      message: "Bad request, missing or wrong required parameters"
    });
  }

  users.create(req.body.username, req.body.password, result => {

    res.json(result);

  })




});


// Start server
app.listen(process.env.HTTP_PORT, () => {
  console.log(`Servidor iniciado en puerto ${process.env.HTTP_PORT}`);
});