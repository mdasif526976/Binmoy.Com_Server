const express = require('express');
const app = express();
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
app.get('/products',async(req,res)=>{
  const query = {};
  const products = await productsCollection.find(query).toArray();
  res.send(products)
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