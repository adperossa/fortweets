const dbClient = require("mongodb").MongoClient;
const url = process.env.DB_URL;
const opts = process.env_DB_OPTS;


/**
 * Creates a new user in the database
 * @param {string} name The name of the new user 
 * @param {string} pass The pass of the new user
 * @param {Function} cb The callback to call with the result of the operation
 */
function create(name, pass, cb) {

  dbClient.connect(url, opts, (err, client) => {

    // Si no se pudo conectar a la db, log y retorno algo vacío
    if (err) {

      console.log(err);
      cb({
        success: false,
        message: "Error connecting to the database"
      });

    } else {

      const newUser = {
        username: name,
        password: pass
      };

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

module.exports = {
  create
}