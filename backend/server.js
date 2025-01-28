import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import cors from 'cors';

const env = dotenv.config();

const PORT_1 = process.env.PORT_1 // port number
const PORT_2 = process.env.PORT_2 // port number
const MONGODB_URL = process.env.MONGODB_URL // mongodb url

const app = express();
app.use(express.json());

app.use(cors());
//we already have a database. We need to connect to it

mongoose.connect(MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));




// Define a schema
const Schema = mongoose.Schema;
const cartSchema = new Schema({
  cartNum: String,
  airport: String,
  battery: Number,
  status: String,
  location: String,
  timeRem: Number, 
  cartId: String
});



const airportSchema = new Schema({
  location: String,
  airportCode: String,
  numberOfCarts: Number
});

const taskSchema = new Schema({
  taskID: String,
  airport: String,
  airportLoc: String,     //Destination
  startPoint: String,
  CartNum: String,
  taskTime: String,
  status: String    //Enum possibly
})

// Compile the model
const Cart = mongoose.model('carts', cartSchema);
const Airport = mongoose.model('airports', airportSchema);
const Task = mongoose.model('tasks', taskSchema);


//---Queries for getting from Database---
//find all carts
app.get('/api/carts', async (req, res) => {
  try {
    console.log('Airport:', req.query.airportCode);
    const allCarts = await Cart.find({airport: req.query.airportCode}); //TODO: Query by cartID using substring
    res.send(allCarts);
    console.log('Carts retrieved');
  } catch (error) {
      console.error("Error during aggregation:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get('/api/cart', async (req, res) => {
  try {
    console.log('CartId:', req.query.cartId);
    const getCart = await Cart.find({cartId: req.query.cartId} || {});
    res.send(getCart[0]);
    console.log('Carts retrieved');
  } catch (error) {
      console.error("Error during aggregation:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get('/api/airports', async (req, res) => {
  try {
    const allAirports = await Airport.find({});
    res.send(allAirports);
    console.log('Airports retrieved');
  } catch (error) {
      console.error("Error during aggregation:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

//---Queries for posting to Database---
app.post('/api/tasks', async (req, res) => {
  
  try{
    const {Airport, cartNum, start, end, Time} = req.body;     //Time is in military, conversion will be done in ui side

    const task = new Task({
      airport: Airport,
      airportLoc: start,
      startPoint: end,
      CartNum: cartNum,
      taskTime: Time,
      status: "Not Started",
    });

    res = await task.save();
    console.log("Created Task: ", res);

    // Task.insertOne({
    //   airport: Airport,
    //   airportLoc: GoTo,
    //   CartNum: cartNum,
    //   taskTime: Time,
    //   completed: false,
    // })

    res.send()
  }catch(error){
    console.error("Error posting to database: ", error);
    res.status(500).send({error: "Internal Server Error"});
  }

})


//set up the server

app.listen(PORT_2, () => {
  console.log('Server started on http://localhost:' + PORT_2);
});
