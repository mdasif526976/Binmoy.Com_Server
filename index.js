const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require ('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const port = process.env.PORT || 5000;

//middlewire
app.use(cors())
app.use(express.json())

function VerifyJwt(req,res,next) {
  const authHeader= req.headers.authorization;
  if(!authHeader){
   res.status(401).send('unAuthorized access denied');
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token,process.env.ACCESS_TOKEN,function(err, decoded){
    if(err){
      return res.status(403).send({ message:'forbidden access'})
    }
    req.decoded = decoded;
    next();
    })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@atlascluster.ul3fosw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run=async()=>{
  try{     
const productsCollection = client.db('ecomerce-assignment-12').collection('products')
const usersCollection = client.db('ecomerce-assignment-12').collection('users')
const odersCollection = client.db('ecomerce-assignment-12').collection('order')
app.get('/products/:id',async(req,res)=>{
  const id = req.params.id;
  console.log(id)
  const query = {brand:id};
  const products = await productsCollection.find(query).toArray();
  res.send(products)
})

// middlewires
// admin middlewire
const VerifyAdmin=async(req,res,next)=> {
  const email = req.decoded.email;
  const query = {email:email};
  const user = await usersCollection.findOne(query);
  if (user.type !== 'admin') {
    return res.status(403).send({ message:'forbidden access'})
  }
  next();
}
// seler middlewore
const VerifySeller=async(req,res,next)=> {
  const email = req.decoded.email;
  const query = {email:email};
  const user = await usersCollection.findOne(query);
  if (user.type !== 'Seller') {
    return res.status(403).send({ message:'forbidden access'})
  }
 
   next();
}
// middlewires//

// add product
app.post('/product',VerifyJwt,async(req,res)=>{
const product = req.body;
const result = await productsCollection.insertOne(product);
res.send(result)
})

// cheak admin
app.get('/users/admin/:email',async(req,res)=>{
   const email = req.params.email;
   const query = { email: email}
   const user = await usersCollection.findOne(query);
   res.send({ isAdmin: user?.type === 'admin' })
})

// cheak seler
app.get('/users/seller/:email',async(req,res)=>{
  const email = req.params.email;;
  const query = { email: email}
  const user = await usersCollection.findOne(query);
  res.send({ isSeller: user?.type === 'Seller' })
})

// find seler 
app.get('/users/findSeler/:email',VerifyJwt,VerifySeller, async(req,res)=>{
   const email = req.params.email ;
   const query = {email: email};
   const user = await usersCollection.findOne(query);
   res.send(user)
  })

  //seller verified
app.put('/users/admin/:id',VerifyJwt,VerifyAdmin,async( req,res)=>{
  const id = req.params.id;
 const filter = {_id: ObjectId(id)};
 const options = {upsert:true}
 const updateDoc= {
   $set:{
    account:'verified'
   }
  
 }
 const result = await usersCollection.updateOne(filter,updateDoc,options);
 res.send(result)
})

// make save user
app.post('/users',async(req,res)=>{
  const user = req.body;
  const result = await usersCollection.insertOne(user)
  res.send(result)
})

// find a sigle seller product
app.get('/products/seller/:email',VerifyJwt,async(req,res)=>{
  const email = req.params.email;
  const query = {email:email}
  const result = await productsCollection.find(query).toArray();
  res.send(result)
})

// advertise iteam
app.put('/advertise/:product',async(req,res)=>{
  const id = req.params.product;
  const filter = {_id:ObjectId(id)};
  const options = {upsert:true};
  const updateDoc= {
   $set:{
    advertise:'true'
   }}
   const result = await productsCollection.updateOne(filter,updateDoc,options);
     res.send(result)
})

// Flesh sale Product limit 3
app.get('/fleshHome',async(req,res)=>{
  const query = {};
  const advertiseItam = await productsCollection.find(query).toArray()
  res.send(advertiseItam);
})

// delete product
app.delete('/product/delete/:id',VerifyJwt,VerifySeller, async(req,res)=>{
  const id = req.params.id;
  const cursor = {_id : ObjectId(id)};
  const result = await productsCollection.deleteOne(cursor);
  res.send(result)
 })

// delete order
app.delete('/order/delete/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id : ObjectId(id)};
  const result = await odersCollection.deleteOne(query);
  res.send(result)
})

 // orders 
 app.post('/order',VerifyJwt,async(req,res)=>{
    const order = req.body;
   const result = await odersCollection.insertOne(order);
   res.send(result)
 })

 app.get('/orders/:email',VerifyJwt,async(req,res)=>{
 const email = req.params.email;
 const query={
  buyerEmail:email
 }
 const orders = await odersCollection.find(query).toArray();
 res.send(orders);
 })

 // sigle oder find
 app.get('/order/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id:ObjectId(id)}
  const result = await odersCollection.findOne(query);
  res.send(result)
 })

 // user get
 app.get('/users',async(req, res)=>{
  const query={};
  const users = await usersCollection.find(query).toArray();
  res.send(users);
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