const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require ('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middlewire
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@atlascluster.ul3fosw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run=async()=>{
  try{     
const productsCollection = client.db('ecomerce-assignment-12').collection('products')
const usersCollection = client.db('ecomerce-assignment-12').collection('users')
app.get('/products/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {brand: id};
  const products = await productsCollection.find(query).toArray();
  res.send(products)
})


app.get('/users/admin/:email',async(req,res)=>{
   const email = req.params.email;;
   const query = { email: email}
   const user = await usersCollection.findOne(query);
   res.send({ isAdmin: user?.type === 'admin' })
})

// make save user
app.post('/users',async(req,res)=>{
  const user = req.body;
  const result = await usersCollection.insertOne(user)
  res.send(result)
})


app.get('/jwt',async(req, res)=>{
  const email = req.query.email;
  const query = {
    email: email
  }
  const user = await usersCollection.findOne(query);
  if (user) {
    const token = jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn:'12h'})
    return res.send({accessToken:token})
  }
  res.status(403).send({accessToken:''})
})

}
  finally{

  }

}
run()
app.get('/', (req, res) =>{
    res.send('all is ok')
})

app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})