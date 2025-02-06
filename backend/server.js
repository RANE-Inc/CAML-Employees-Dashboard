import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import cors from 'cors';

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
app.post('/api/tasks', async (req, res) => {
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



//set up the server

app.listen(PORT_2, () => {
  console.log('Server started on http://localhost:' + PORT_2);
});
