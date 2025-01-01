const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const cors = require('cors');
const app = express();
require('dotenv').config()

const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

//DB_USER
// volunteer - hub
//DB_PASS==oVSp3uD2KQj95e9T


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wk99c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
      



      const volunteerCollection = client.db('volunteerDb').collection('volunteers');
      const requestCollection = client.db('volunteerDb').collection('requests');

      app.post('/addvolun', async (req, res)=> {
          const volunteer = req.body;
          const result = await volunteerCollection.insertOne(volunteer)
          res.send(result)
      })
    
    //  app.get('/jobs', async (req, res) => {
    //         const email = req.query.email;
    //         let query = {};
    //         if (email) {
    //             query = { hr_email: email }
    //         }
    //         // const { search } = req.query;
    //         // const cursor = jobsCollection.find({title:{$regex:search,$options:'i'}});
    //         const cursor = jobsCollection.find(query || {title:{$regex:search,$options:'i'}});
    //         const result = await cursor.toArray();
    //         res.send(result);
    //     });
    // add request
    app.post('/addrequest', async (req, res)=> {
          const volunteer = req.body;
          const result = await requestCollection.insertOne(volunteer)
          res.send(result)
    })
    

    app.patch('/updatenumber/:id', async (req, res) => {
        const id = req.params.id;
   
      const query = { _id: new ObjectId(id) }
      
      // const options = { upsert: true };
      // const reviews = req.body;
      const updateReview = {
        $inc: {
          number:-1
        }
      }
      const result = await volunteerCollection.updateOne(query,updateReview)
      res.send(result)
    })
      app.get('/volunteers', async (req, res) => {
        // const volunteer = volunteerCollection.find();
        const { search } = req.query;
        const cursor = volunteerCollection.find({title:{$regex:search,$options:'i'}});
        const result = await cursor.toArray();
        res.send(result)
      })

      app.get('/volunteers/:id', async (req, res) => {
      const id = req.params.id;
   
      const query = { _id:new ObjectId(id)}

      const result = await volunteerCollection.findOne(query)
      res.send(result)
      })
     app.get('/volunteers/myadd/:email', async (req, res) => {
      const email = req.params.email;
      const query={email:email}
      const wishes = volunteerCollection.find(query);
      console.log(wishes);
      const result = await wishes.toArray()
        res.send(result)
     })
    app.get('/volunteers/myrequest/:email', async (req, res) => {
      const email = req.params.email;
      const query={volunteeremail:email}
      const wishes = requestCollection.find(query);
      console.log(wishes);
      const result = await wishes.toArray()
        res.send(result)
      })
      app.get('/bevolun/:id', async (req, res) => {
      const id = req.params.id;
   
      const query = { _id:new ObjectId(id)}

      const result = await volunteerCollection.findOne(query)
      res.send(result)
      })
    app.patch('/volunteers/update/:id', async (req, res) => {
      const id = req.params.id;
   
      const query = { _id: new ObjectId(id) }
      
      const options = { upsert: true };
      const reviews = req.body;
      const updateReview = {
        $set: {
          thumbnail: reviews.thumbnail,
          title: reviews.title,
          description: reviews.description,
          category:reviews.category,
          number:reviews.number,
          startdate:reviews.startdate,
          name:reviews.name,
          email:reviews.email,
        }
      }
      const result = await volunteerCollection.updateOne(query, updateReview, options)
      res.send(result)
    })
    app.delete('/volunteers/delete/:id', async (req, res) => {
      const id = req.params.id;
   
      const query = { _id:new ObjectId(id)}

      const result = await volunteerCollection.deleteOne(query);
      res.send(result)
      })
    app.delete('/requests/delete/:id', async (req, res) => {
      const id = req.params.id;
   
      const query = { _id:new ObjectId(id)}

      const result = await requestCollection.deleteOne(query);
      res.send(result)
      })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is on rock')
})

app.listen(port,() => {
    console.log(`surver is running on ${port}`);
})