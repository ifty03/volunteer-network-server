const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

/* all middleware */
app.use(cors());
app.use(express.json());

/* http request */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tjsdk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  await client.connect();
  const eventCollection = client.db("volunteerdb").collection("events");
  try {
    /* load data from database */
    app.get("/events", async (req, res) => {
      const query = {};
      const cursor = eventCollection.find(query);
      const events = await cursor.toArray();
      res.send(events);
    });
    /* post data in data base */
    app.post("/addEvent", (req, res) => {
      const newEvent = req.body;
      const event = eventCollection.insertOne(newEvent);
      res.send(event);
    });
  } finally {
    /*  await client.close(console.dir) */
  }
};
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
