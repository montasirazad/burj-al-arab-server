const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
require('dotenv').config()


var admin = require("firebase-admin");

var serviceAccount = require("./authentication-all-practice-firebase-adminsdk-wbs5e-2689df8719.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wov4a.mongodb.net/burj-al-arab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("burj-al-arab").collection("bookings");
  console.log('db connected');


  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    collection.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer')) {
      const idToken = bearer.split(' ');
      console.log({ idToken });

    }

    // idToken comes from the client app
    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const tokenEmail = decodedToken.email;
        const queryEmail = req.query.email;
        console.log(tokenEmail, queryEmail);
        if (tokenEmail == req.query.email) {
          collection.find({ email: req.query.email })
            .toArray((err, documents) => {
              res.send(documents);
            })
        }
        else {
          res.status(401).send('unauthorized')
        }

      })
      .catch((error) => {
        // Handle error
      });



  })


});



app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(5000, () => {
  console.log('listening to port 5000');
})