const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
  const donationCollection = client.db("donationdb").collection("donate");
  try {
    /* load data from database */
    app.get("/events", async (req, res) => {
      const page = +req.query.page;
      const count = +req.query.count;
      const query = {};
      const cursor = eventCollection.find(query);
      const events = await cursor
        .skip(page * count)
        .limit(count)
        .toArray();
      res.send(events);
    });
    /* post data in data base */
    app.post("/addEvent", async (req, res) => {
      const newEvent = req.body;
      const event = await eventCollection.insertOne(newEvent);
      res.send(event);
    });
    /* delete event  */
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await eventCollection.deleteOne(query);
      res.send(result);
    });

    /* there is many problem please solve this */
    /* update event */
    app.put("/update/:id", async (req, res) => {
      const id = req.params;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const updateEvent = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: updateEvent,
      };
      const result = await eventCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    /* post donation event */
    app.post("/donation", async (req, res) => {
      const event = req.body;
      const result = await donationCollection.insertOne(event);
      res.send(result);
    });

    /* load data from donation db */
    app.get("/donation", async (req, res) => {
      const query = {};
      const cursor = donationCollection.find(query);
      const donation = await cursor.toArray();
      res.send(donation);
    });

    /* get total events */
    app.get("/totalEvents", async (req, res) => {
      const count = await eventCollection.estimatedDocumentCount();

      res.send({ count });
    });
  } finally {
    /*  await client.close(console.dir) */
  }
};
run().catch(console.dir);
app.get("/", (req, res) => {
  res.json("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
