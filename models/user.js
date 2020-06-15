const ObjectID = require('mongodb').ObjectID;
const dbClient = require("mongodb").MongoClient;
const url = process.env.DB_URL;
const opts = JSON.parse(process.env.DB_OPTS);


/**
 * Creates a new user in the database
 * @param {{}} name The user object to insert
 * @param {Function} cb The callback to call with the result of the operation
 */
function create(newUser, cb) {

  dbClient.connect(url, opts, (err, client) => {

    // Handle errors connecting to the db
    if (err) {

      console.log(err);
      cb({
        success: false,
        message: "Error connecting to the database"
      });

    } else {

      const collection = client.db("fortweets").collection("users");
      collection.insertOne(newUser, (err, result) => {

        // Si hubo err en la query, log y retorno algo vacío
        if (err) {

          console.log(err);
          cb({
            success: false,
            message: "Error creating the new user"
          });

        } else {

          cb({
            success: true,
            message: "User created succesfully"
          });

        }

        client.close();
      });

    }

  });
}

/**
 * Retrieves an user filtering by the object received
 * @param {{}} filter The filter object to use
 * @param {Function} cb The callback to call with the result, either the found user object or an error message
 */
function get(filter, cb) {

  dbClient.connect(url, opts, (err, client) => {

    // Handle errors connecting to the db
    if (err) {

      console.log(err);
      cb({
        success: false,
        message: "Error connecting to the database"
      });

    } else {

      const collection = client.db("fortweets").collection("users");
      collection.findOne(filter, (err, result) => {

        // Si hubo err en la query, log y retorno algo vacío
        if (err) {

          console.log(err);
          cb({
            success: false,
            message: "Error validating credentials in the database"
          });

        } else {

          if (!result) {

            cb({
              success: false,
              message: "User not found"
            });

          } else {

            cb({
              success: true,
              message: "User found",
              data: result
            });

          }

          client.close();
        }

      });

    }

  });

}

/**
 * Adds or removes a favorited tweet
 * @param {string} action The action to perform: "add" || "remove"
 * @param {string} userId The oid of the user to select
 * @param {number} tweetId The tweet ID
 * @param {Function} cb The callback to call with the result of the operation
 */
function updateFavorites(action, userId, tweetId, cb) {

  let operator;
  if (action === 'remove') {
    operator = '$pull';
  } else {
    operator = '$push';
  }

  dbClient.connect(url, opts, (err, client) => {

    // Handle errors connecting to the db
    if (err) {

      console.log(err);
      cb({
        success: false,
        message: "Error connecting to the database"
      });

    } else {

      const filter = {
        _id: new ObjectID(userId)
      }

      const update = {
        [operator]: {
          favorites: tweetId
        }
      }

      const collection = client.db("fortweets").collection("users");
      collection.updateOne(filter, update, (err, result) => {

        // Si hubo err en la query, log y retorno algo vacío
        if (err) {

          console.log(err);
          cb({
            success: false,
            message: "Error in the update operation"
          });

        } else {

          if (!result) {

            cb({
              success: false,
              message: "Couldn't update favorites, user not found"
            });

          } else {

            cb({
              success: true,
              message: "Favorite updated succesfully",
              data: result
            });

          }

          client.close();
        }

      });

    }

  });

}


module.exports = {
  create,
  get,
  updateFavorites
}