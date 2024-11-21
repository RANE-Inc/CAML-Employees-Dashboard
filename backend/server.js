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

//    const airports = [
//   {location:"Ottawa, ON, Canada", airportCode:"YOW", numberOfCarts:10},
//   {location:"Toronto, ON, Canada", airportCode:"YYZ", numberOfCarts:6},
//   {location:"Montreal, QC, Canada", airportCode:"YUL", numberOfCarts:4},
//   {location:"Vancouver, BC, Canada", airportCode:"YVR", numberOfCarts:4},
//   {location:"Edmonton, AB, Canada", airportCode:"YEG", numberOfCarts:5},
//   {location:"Halifax, NS, Canada", airportCode:"YHZ", numberOfCarts:6}
// ];


// Compile the model
const Cart = mongoose.model('carts', cartSchema);
const Airport = mongoose.model('airports', airportSchema);



//find all carts
app.get('/api/carts', async (req, res) => {
  try {
    const allCarts = await Cart.find({});
    res.send(allCarts);
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

// Schedule Cart
app.post('/api/ScheduleCart', async (req, res) => {
  try {
    const booking = new Cart({
      cartNum: req.body.cartNum || 3,
      airport: req.body.airport || 'YOW',
      battery: req.body.battery || 100,
      status: req.body.status || 'Available',
      location: req.body.location || 'Terminal 1',
      timeRem: req.body.timeRem || 10,
      cartId: req.body.cartId || 'YOW3'
    });

    await booking.save();
    res.send('Booking created');
    console.log('Booking created');
  } catch (error) {
    res.status(500).send('Error creating booking');
  }
});

app.get('/api/ScheduleCart', async (req, res) => {
  try {
    const cart = await Cart.find({ cartNum: req.query.cartNum });
    res.json(cart);
    console.log('Booking retrieved');
  } catch (error) {
    res.status(500).send('Error retrieving booking');
  }
});

// Update Booking
app.put('/api/ScheduleCart', async (req, res) => {
  try {
    await Cart.updateOne(
      { cartNum: req.body.cartNum },
      { $set: { status: 'Unavailable', timeRem: 0 } }
    );
    res.send('Booking updated');
    console.log('Booking updated');
  } catch (error) {
    res.status(500).send('Error updating booking');
  }
});

// Delete Booking
app.delete('/api/ScheduleCart', async (req, res) => {
  try {
    await Cart.deleteOne({ cartNum: req.body.cartNum });
    res.send('Booking deleted');
    console.log('Booking deleted');
  } catch (error) {
    res.status(500).send('Error deleting booking');
  }
});

// Get Luggage Cart Data
app.get('/api/ScheduleCart', async (req, res) => {
  try {
    const carts = await mongoose.connection.db.collection('cart').find({}).toArray();
    res.json(carts);
    console.log('Cart data retrieved');
  } catch (error) {
    res.status(500).send('Error retrieving cart data');
  }
});

//set up the server

app.listen(PORT_2, () => {
  console.log('Server started on http://localhost:' + PORT_2);
}
);
