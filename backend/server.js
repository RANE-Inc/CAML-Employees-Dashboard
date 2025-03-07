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

import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const env = dotenv.config();

const PORT_2 = process.env.PORT_2 // port number
const MONGODB_URL = process.env.MONGODB_URL // mongodb url

// Swagger
const swaggerAPIDescription = swaggerJsDoc({
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'CAML API',
      version: '1.0.0',
      description: 'API for CAML',
      contact: {
        name: 'CAML Team',
        email: '  ',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT_2}`,
      },
    ],
  },
  apis: ['server.js'],
});



const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerAPIDescription));

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
//find all carts

/**
 * @swagger
 * /api/carts:
 *   get:
 *     summary: Retrieve carts based on airport code
 *     description: Fetch all carts associated with a specific airport by providing the airport code as a query parameter.
 *     parameters:
 *       - in: query
 *         name: airportCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The airport code to filter carts by.
 *     responses:
 *       200:
 *         description: A list of carts retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The unique identifier for the cart.
 *                   airport:
 *                     type: string
 *                     description: The associated airport code.
 *                   otherFields:
 *                     type: string
 *                     description: Additional cart-related fields.
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *       500:
 *         description: Internal Server Error.
 */
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

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Retrieve a cart by cart ID
 *     description: Fetch a specific cart using its cart ID as a query parameter.
 *     parameters:
 *       - in: query
 *         name: cartId
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique cart ID to retrieve.
 *     responses:
 *       200:
 *         description: Cart retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier for the cart.
 *                 cartId:
 *                   type: string
 *                   description: The cart's unique ID.
 *                 otherFields:
 *                   type: string
 *                   description: Additional cart-related fields.
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *       500:
 *         description: Internal Server Error.
 */
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

/**
 * @swagger
 * /api/airports:
 *   get:
 *     summary: Retrieve all airports
 *     description: Fetch a list of all available airports.
 *     responses:
 *       200:
 *         description: A list of airports retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The unique identifier for the airport.
 *                   name:
 *                     type: string
 *                     description: The name of the airport.
 *                   code:
 *                     type: string
 *                     description: The IATA/ICAO airport code.
 *                   location:
 *                     type: string
 *                     description: The location of the airport.
 *       500:
 *         description: Internal Server Error.
 */
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

app.get('/api/apikey', async (req, res) => {
  apiKey = 123456;
  if (req.query.apiKey == apiKey) {
    res.send({message: "API Key is valid"});
  }
  else {
    res.send({message: "API Key is invalid"});
  }
});


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

//---Queries for posting to Database---

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Adds a new task to the database with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskID
 *               - airport
 *               - airportLoc
 *               - startPoint
 *               - CartNum
 *               - taskTime
 *               - status
 *             properties:
 *               taskID:
 *                 type: string
 *                 description: Unique identifier for the task.
 *               airport:
 *                 type: string
 *                 description: The airport associated with the task.
 *               airportLoc:
 *                 type: string
 *                 description: The location within the airport.
 *               startPoint:
 *                 type: string
 *                 description: The starting point for the task.
 *               CartNum:
 *                 type: integer
 *                 description: The number of carts involved in the task.
 *               taskTime:
 *                 type: string
 *                 format: date-time
 *                 description: The timestamp for the task.
 *               status:
 *                 type: string
 *                 description: The status of the task (e.g., pending, completed).
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task created successfully
 *                 task:
 *                   type: object
 *                   properties:
 *                     taskID:
 *                       type: string
 *                     airport:
 *                       type: string
 *                     airportLoc:
 *                       type: string
 *                     startPoint:
 *                       type: string
 *                     CartNum:
 *                       type: integer
 *                     taskTime:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *       500:
 *         description: Internal Server Error.
 */

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
          status: req.body.status
      });

      const savedTask = await task.save();
      console.log("Created Task: ", savedTask);

      res.status(201).json({ message: "Task created successfully", task: savedTask });
  } catch (error) {
      console.error("Error posting to database: ", error);
      res.status(500).json({ error: "Internal Server Error" });
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

//set up the server

app.listen(PORT_2, () => {
  console.log('Server started on http://localhost:' + PORT_2);
});
