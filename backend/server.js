import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { authMiddleware, adminMiddleware } from './middleware.js'
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import corsTablet from './middleware.js'; // Adjust path as necessary

import swaggerUI from 'swagger-ui-express';
///import swaggerDocument from './swagger.json' assert {type: "json"}   was causing error

var swaggerOptions = {}

//imports for OccupanceGridMap
import http from 'http';
import { Server } from 'socket.io';
import ROSLIB from 'roslib';


const env = dotenv.config();

const PORT_2 = process.env.PORT_2 // port number
const MONGODB_URL = process.env.MONGODB_URL // mongodb url


const app = express();
app.use(express.json());

///app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument, swaggerOptions));  causing error

app.use(cors({
  origin: "http://localhost:5173", // Specify frontend URL
  credentials: true, // Allow cookies and authentication headers
  methods: "GET,POST,PATCH,PUT,DELETE", // Allowed HTTP methods
  allowedHeaders: "Content-Type,Authorization", // Allowed headers
}));
app.use(cookieParser());

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
  //2 new perameters for tablet
  customer: String,
  ticket: String,
  status: String    //Enum possibly
})

// Define a user schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  apiKeys: [String],
});

// Compile the model
const Cart = mongoose.model('carts', cartSchema);
const Airport = mongoose.model('airports', airportSchema);
const Task = mongoose.model('tasks', taskSchema);
const User = mongoose.model('users', UserSchema);

//---Queries for getting from Database---
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

// app.get('/api/apikey', async (req, res) => {
//   apiKey = 123456;
//   if (req.query.apiKey == apiKey) {
//     res.send({message: "API Key is valid"});
//   }
//   else {
//     res.send({message: "API Key is invalid"});
//   }
// });


app.get('/api/taskFind', async (req, res) => {
  try {
    console.log('Searching for task with CartId:', req.query.cartId);
    const cartTasks = await Task.find({taskID: req.query.cartId});
    console.log(cartTasks)
    res.send(cartTasks);
    console.log('Tasks retrieved');
  } catch (error) {
      console.error("Error during aggregation:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get('/api/allUsers', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
    console.log('Users retrieved');
  } catch (error) {
      console.error("Error during aggregation:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get('/api/allCarts', async (req, res) => {
  try {
    const carts = await Cart.find({});
    res.send(carts);
    console.log('All carts retrieved');
  } catch (error) {
      console.error("Error during aggregation:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

//---Queries for posting to Database---
app.post('/api/tasks', authMiddleware, adminMiddleware, async (req, res) => {
  console.log('Task:', req.body);
  try {
      const task = new Task({
          taskID: req.body.taskID,
          airport: req.body.airport,
          airportLoc: req.body.airportLoc,
          startPoint: req.body.startPoint,
          CartNum: req.body.CartNum,
          taskTime: req.body.taskTime,
          status: req.body.status,
          customer: req.body.customer,
          ticket: req.body.ticket

      });

      const savedTask = await task.save();
      console.log("Created Task: ", savedTask);

      res.status(201).json({ message: "Task created successfully", task: savedTask });
  } catch (error) {
      console.error("Error posting to database: ", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/createLocation', authMiddleware, adminMiddleware, async (req,res) => {
  console.log('Location: ', req.body);
  try{
    const location = new Airport({
      location: req.body.location,
      airportCode: req.body.AP_Code,
      numberOfCarts: 0
    });

    const savedLoc = await location.save()
    console.log("Created Location: ", savedLoc);
  }catch(error){
    console.error("Error posting to database:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

app.post('/api/createCart', authMiddleware, adminMiddleware, async (req,res) => {
  console.log('Creating Cart at', req.body.airportCode, req.body.location);
  try{

    const allCarts = await Cart.find({airport: req.body.airportCode});
    const nextCartNum = (allCarts.length)+1;

    const cartID = (req.body.airportCode + nextCartNum);
    
    const cart = new Cart({
      cartNum: nextCartNum,
      airport: req.body.airportCode,
      battery: 100,
      status: "Idle",
      location: req.body.location,
      timeRem: 0, 
      cartId: cartID
    });

    const savedCart = await cart.save()
    console.log("Created Cart: ", savedCart);
  }catch(error){
    console.error("Error posting to database:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;


    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });

    await user.save();

    // Generate Tokens (no longer needed when creating new user)
    //const accessToken = jwt.sign({ userId: user._id, role: user.role }, "access_secret", { expiresIn: "15m" });
    //const refreshToken = jwt.sign({ userId: user._id }, "refresh_secret", { expiresIn: "7d" });

    // Store refresh token in HTTP-only cookie
    // res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "Strict"
    // });

    res.json({});
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});



app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login:', req.body);

  try {
      const user = await User.findOne({ username });
      if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate Tokens
      console.log(user);
      const accessToken = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.ACCESS_SECRET || "access_secret",
          { expiresIn: "15m" } // Short expiry
      );

      const refreshToken = jwt.sign(
          { userId: user._id },
          process.env.REFRESH_SECRET || "refresh_secret",
          { expiresIn: "7d" } // Longer expiry
      );

      // Store Refresh Token in HTTP-only Cookie
      res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    });

      res.json({ accessToken });

  } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || "refresh_secret");

      // Generate new access token
      const accessToken = jwt.sign(
          { userId: decoded.userId, role: decoded.role },
          process.env.ACCESS_SECRET || "access_secret",
          { expiresIn: "15m" }
      );

      res.json({ accessToken });

  } catch (error) {
      return res.status(403).json({ message: "Invalid refresh token" });
  }
});

app.post('/logout', (req, res) => {
  // Clear the cookies
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "Strict" });
  res.clearCookie("accessToken", { httpOnly: true, sameSite: "Strict" });

  // Send a response to confirm the user has been logged out
  res.json({ message: "Logged out successfully" });
});


app.post('/generate-api-key', authMiddleware, adminMiddleware, async (req, res) => {
  const apiKey = randomBytes(32).toString('hex');
  await User.findByIdAndUpdate(req.user.userId, { $push: { apiKeys: apiKey } });
  res.json({ apiKey });
});

app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'You have access' });
});

app.use((req, res, next) => {
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Cookies:", req.cookies);
  next();
});

app.get('/check-auth', (req, res) => {
  const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
      const decoded = jwt.verify(token, 'access_secret');
      console.log("Decoded token:", decoded);  // Log the decoded token to check its contents
      req.user = decoded; // Store the decoded token in req.user


      if (req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Forbidden: Admins only' });
      }

      res.json({ role: req.user.role });
  } catch (err) {
      console.error("Token verification failed:", err);
      res.status(403).json({ message: 'Invalid token' });
  }
});

//---Queries for deleting from Database---
app.delete('/api/deleteUser/:username', async(req, res) => {
  console.log('Deleting User')
  try{
    console.log(req.params.username)
    const usernameToDel = req.params.username;
    const result = await User.deleteOne({username: usernameToDel});

    if(result.deletedCount === 0){
      return res.status(404).json({message: "User not found."});
    }

    res.json({message:"User succesfully deleted."});
  }catch (err){
    console.log("User not successfully deleted");
    res.status(500).json({err});
  }
})

app.delete('/api/deleteCart/:cartId', async(req, res) => {
  console.log('Deleting Cart')
  try{
    console.log(req.params.cartId)
    const cartToDel = req.params.cartId;
    const result = await Cart.deleteOne({cartId: cartToDel});

    if(result.deletedCount === 0){
      return res.status(404).json({message: "User not found."});
    }

    res.json({message:"User succesfully deleted."});
  }catch (err){
    console.log("User not successfully deleted");
    res.status(500).json({err});
  }
})

//---Queries for updating the Database---
app.patch('/api/toggleAdmin/:username', async(req, res) => {
  console.log("Toggling Role")
  try{
    const user = await User.findOne({username: req.params.username});
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save()

    res.json({message:"Role successfully toggled.", user});
  }catch(err){
    console.log("Role not successfully toggled.");
    res.status(500).json({err});
  }
})



// //OccupancyGridMap functions 
// const server = http.createServer(app);
// const io = new Server(server);

// // Temp stoarge in memeory 
// let mapData = null; // Store OccupancyGrid data

// // Connect to ROS
// const ros = new ROSLIB.Ros({
//   url: 'ws://localhost:9090' // using local host 9090 since we used that in ros_test.html
// });

// // To check ros connections
// ros.on('error', (error) => {
//   console.error('ROS connection error:', error);
// });

// ros.on('close', () => {
//   console.log('ROS connection closed');
// });

// // Subscribe to the /luggage_av/map topic where map data is stored
// const chatter_topic = new ROSLIB.Topic({
//   ros: ros,
//   name: '/luggage_av/map',
//   messageType: 'nav_msgs/msg/OccupancyGrid' // ROS 2 message format
// });

// // This should also serve as a update function whenever OccupancyGrid message is received.
// chatter_topic.subscribe((message) => {
//   console.log('Received map data:', message);
//   mapData = message; // Store the latest map data

//   // Emit data to clients connected via WebSocket
//   io.emit('mapData', message);
// });

// // API to retrieve stored map data
// app.get('/api/map', (req, res) => {
//   if (mapData) {
//       res.json(mapData);
//   } else {
//       res.status(404).json({ error: 'No map data available' });
//   }
// });

//other stuff for tablet login
app.use(bodyParser.json()); // Parse incoming JSON request bodies
app.use(corsTablet); // Allow CORS for all routes, or you can apply it specifically to certain routes like '/tabletLogin'

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API! Please use the /login endpoint.');
});

// fetches list of customers and tickets
const tasksticket = await Task.find({}, "ticket");
const tickets = tasksticket.map(task => task.ticket);

const taskscustomer = await Task.find({}, "customer");
const customers = taskscustomer.map(task => task.customer);

//tabletLogin endpoint
app.post('/tabletLogin', corsTablet, (req, res) => {
  const { name, ticket } = req.body;
  // Check if name exists in customers and ticket exists in tickets
  const isValidCustomer = customers.includes(name);
  const isValidTicket = tickets.includes(ticket);
  
  if (isValidCustomer && isValidTicket) {
    res.status(200).json({ success: true, message: 'Authentication successful!' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid name or ticket' });
  }
});

//set up the server

app.listen(PORT_2, () => {
  console.log('Server started on http://localhost:' + PORT_2);
});