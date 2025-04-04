require('dotenv').config()
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const app = express();



const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173','https://volunteer-hub-8bc94.web.app'],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())


const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  console.log('tokeninside the verifyToken', token)
  if (!token) {
    return res.status(401).send({message:'unauthorized access'})
  }
  // verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({message:'Unauthorized access'})
    }
    next()
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wk99c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
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
    // await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    //   console.log("Pinged your deployment. You successfully connected to MongoDB!");
      



      const volunteerCollection = client.db('volunteerDb').collection('volunteers');
    const requestCollection = client.db('volunteerDb').collection('requests');
    
    // token related apis
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn:'5h'
      })
      res.cookie('token', token, {
       httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .send({success:true})
    })

    // logout configuration for token
    app.post('/logout', (req, res) => {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .send({success:true})
    })
  //add volunteer to mongodb
      app.post('/addvolun', async (req, res)=> {
          const volunteer = req.body;
          const result = await volunteerCollection.insertOne(volunteer)
          res.send(result)
      })
  
    // add request
    app.post('/addrequest', async (req, res)=> {
          const volunteer = req.body;
          const result = await requestCollection.insertOne(volunteer)
          res.send(result)
    })
    
     //udpate
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

    // all volunteer api
      app.get('/volunteers', async (req, res) => {
        // const volunteer = volunteerCollection.find();
        const { search } = req.query;
        let cursor;
        if (search) {
          cursor=volunteerCollection.find({title:{$regex:search,$options:'i'}})
        }
        else {
         cursor= volunteerCollection.find()
        }
        const result = await cursor.toArray();
        res.send(result)
      })
      app.get('/volunteerneed', async (req, res) => {
        // const volunteer = volunteerCollection.find().sort({ startdate: 1 }).limit(6);
        const volunteer = volunteerCollection.find().sort({ startdate: 1 }).limit(6);
        const result = await volunteer.toArray();
        res.send(result)
      })
    
    // id wised volunteer
      app.get('/volunteers/:id', async (req, res) => {
      const id = req.params.id;
   
      const query = { _id:new ObjectId(id)}

      const result = await volunteerCollection.findOne(query)
      res.send(result)
      })
    
    // add api for a person who add a volunteer post
     app.get('/volunteers/myadd/:email',verifyToken, async (req, res) => {
      const email = req.params.email;
       const query = { email: email }
       
       console.log(req.cookies?.token)
      const wishes = volunteerCollection.find(query);
      console.log(wishes);
      const result = await wishes.toArray()
        res.send(result)
     })
    
    // an users request to be a volunteer
    app.get('/volunteers/myrequest/:email',verifyToken, async (req, res) => {
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
    
    // delete api
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