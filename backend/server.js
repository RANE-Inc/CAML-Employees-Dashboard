import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';

// Swagger
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml'

// ROS
import ROSLIB from 'roslib';


// TODO: Logging
//// TODO: Error messages logs, change to console.error() and specify request type
//// TODO: Normalize all Internal Server Errors
// TODO: Change all IDs to Ids
// FIXME: Double not supported? Chaning to Number for now
// TODO: auth middlewares
// TODO: Mongoose insert vs new Model + save()?
// TODO: Update res.send(String) to res.json({message: String})
// TODO: Validate schema middleware
// TODO: Mongoose exec()


const env = dotenv.config();

const PORT_2 = process.env.PORT_2 // port number
const MONGODB_HOST = process.env.MONGODB_HOST // mongodb host
const MONGODB_PORT = process.env.MONGODB_PORT // mongodb port



// Mongo
mongoose.connect("mongodb://"+MONGODB_HOST+":"+MONGODB_PORT+"/caml")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

//// Schemas
const airportSchemas = {
  meta: new mongoose.Schema({
    airportCode: String,
    name: String,
  }),
  destination: new mongoose.Schema({
    airportCode: String,
    destinationId: String,
    name: String,
    type: {type: String, enum: ["Pickup", "Gate", "Bathroom", "Store", "Other"]},
    location: [Number],
    zone: [[Number]]
  })
};

const cartSchemas = {
  meta: new mongoose.Schema({
    cartId: String,
    name: String,
    airportCode: String,
  }),
  status: new mongoose.Schema({
    cartId: String,
    battery: Number,
    status: {type: String, enum: ["Offline"]}, // TODO: More states
    position: [Number],
    destination: [Number]
  }),
  task: new mongoose.Schema({
    taskId: String,
    cartId: String,
    startPointId: String,
    destinationId: String,
    scheduledTime: Date,
    status: {type: String, enum: ["Scheduled", "Waiting", "In Progress", "Completed", "On detour", "Cancelled"]}
  })
};

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
});

//// Models
const Airport = {
  Meta: mongoose.model('airports.metas', airportSchemas.meta),
  Destination: mongoose.model('airports.destinations', airportSchemas.destination)
};

const Cart = {
  Meta: mongoose.model('carts.metas', cartSchemas.meta),
  Status: mongoose.model('carts.statuses', cartSchemas.status),
  Task: mongoose.model('carts.tasks', cartSchemas.task)
};

const User = mongoose.model('users', UserSchema);



// Express
const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // Specify frontend URL
  credentials: true, // Allow cookies and authentication headers
  methods: "GET,POST,PATCH,PUT,DELETE", // Allowed HTTP methods
  allowedHeaders: "Content-Type,Authorization", // Allowed headers
}));
app.use(cookieParser());

//// Middlewares
async function authMiddleware(req, res, next) {
    const token = req.query.accessToken || req.cookies.accessToken; // Access token expires after 15mins, so it's ok to pass as query parameter

    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.ACCESS_SECRET, {ignoreExpiration: false});

        const user = await User.findOne({username: verified.username}).exec();
        if(!user) {
          return res.status(401).json({ message: "User does not exist." })
        }

        req.user = user;
    } catch (err) {
        console.error("Error when running authMiddleware:", err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    next();
};

function adminMiddleware(req, res, next) {
  // Assumes authMiddleware ran before it
  if(req.user.role !== "admin") {
    return res.status(403).json({ message: "This resource restricted to admin users only." })
  }

  next();
};

// Checks req.query for required strings
function queryStringsMiddleware(requiredStrings) {
  return (req, res, next) => {
    for(let i = 0; i < requiredStrings.length; i++) {
      if(!req.query[requiredStrings[i]]) return res.status(400).send(requiredStrings[i]+" query string is missing");
    }

    next();
  };
}

// Checks req.body for required properties
function requestBodyMiddleware(requiredKeys) {
  return (req, res, next) => {
    for(let i = 0; i < requiredKeys.length; i++) {
      if(!req.body[requiredKeys[i]]) return res.status(400).send(requiredKeys[i]+" property is missing");
    }

    next();
  };
}

//// Routes
////// Auth
app.post('/api/auth/login', requestBodyMiddleware(["username", "password"]), async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await User.findOne({ username });
      if (!user || !(await bcrypt.compare(password, user.password))) { // FIXME: await highlighted as unnecessary, although correct
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Short-lived access token stored in memory for authenticating with the API
      const accessToken = jwt.sign(
          { username: user.username },
          process.env.ACCESS_SECRET,
          { expiresIn: "15m" }
      );

      // Long-lived refresh token stored on disk for generating new access tokens
      const refreshToken = jwt.sign(
          { username: user.username },
          process.env.REFRESH_SECRET,
          { expiresIn: "7d" }
      );

      // Store the tokens on the client in a browser cookie
      res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false, // TODO: Check if SSL is enabled instead
          sameSite: "Lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // TODO: Check if SSL is enabled instead
        sameSite: "Strict"
    });

      return res.status(200).json({ accessToken });

  } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/api/auth/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken; // DO NOT PASS refreshToken AS QUERY PARAMETER!!!

  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET, {ignoreExpiration: false})

      // Generate new access token
      const accessToken = jwt.sign(
          { username: decoded.username },
          process.env.ACCESS_SECRET,
          { expiresIn: "15m" }
      );

      return res.status(200).json({ accessToken });

  } catch (error) {
      return res.status(401).json({ message: "Invalid refresh token" });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // Clear the cookies

  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "Strict" });
  res.clearCookie("accessToken", { httpOnly: true, sameSite: "Strict" });

  // Send a response to confirm the user has been logged out
  return res.status(200).json({ message: "Logged out successfully" });
});

////// Airports
app.get('/api/airports', authMiddleware, async (req, res) => {
  try {
    const airports = await Airport.Meta.find({});
    res.send(airports);
    // console.log('Airports retrieved');
  } catch (error) {
      console.error("Error during /api/airports request:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get('/api/airport', authMiddleware, queryStringsMiddleware(["airportCode"]), async (req, res) => {
  try {
    const airport = await Airport.Meta.findOne({airportCode: req.query.airportCode}).exec();

    if(!airport) {
      return res.status(404).json({ message: "There is no airport with that airportCode" })
    }

    // console.log('Airports retrieved');
    return res.send(airport);
  } catch (error) {
      console.error("Error during /api/airports request:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post('/api/airport', authMiddleware, adminMiddleware, requestBodyMiddleware(["airportCode", "name"]), async (req,res) => {
  // console.log('Location: ', req.body);
  try{

    const airport = await Airport.Meta.findOne({airportCode: req.body.airportCode}).exec();

    if(!airport) {
      return res.status(409).json({ message: "Airport already exists!" })
    }

    await Airport.Meta.create({
      airportCode: req.body.airportCode,
      name: req.body.name
    });

    // console.log("Created Location: ", savedLoc);
    return res.status(201).json({ message: "Airport created successfully." });
  }catch(error){
    console.error("Error posting to database:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

// TODO: app.delete('/api/airport') - deletes airport, all the carts belonging to that airport and all the tasks belonging to those carts

app.get('/api/airport/destinations', authMiddleware, queryStringsMiddleware(["airportCode"]), async (req, res) => {
  try {
    const airportDestinations = await Airport.Destination.find({airportCode: req.query.airportCode});
    res.send(airportDestinations);
    // console.log('Airports retrieved');
  } catch (error) {
      console.error("Error during /api/airports request:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

////// Carts
app.get('/api/carts', authMiddleware, async (req, res) => {
  try {
    // console.log('Airport:', req.query.airportCode);
    const carts = await Cart.Meta.find(req.query.airportCode ? {airportCode: req.query.airportCode} : {});
    res.send(carts);
    // console.log('Carts retrieved');
  } catch (error) {
      console.error("Error during /api/carts request:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get('/api/cart', authMiddleware, queryStringsMiddleware(["cartId"]), async (req, res) => { // TODO: update swagger
  try {
    // console.log('CartId:', req.query.cartId);
    const cart = await Cart.Meta.findOne({cartId: req.query.cartId});

    if(!cart) {
      return res.status(404).json({ message: "There is no cart with that cartId" })
    }

    res.send(cart);
    // console.log('Carts retrieved');
  } catch (error) {
      console.error("Error during /api/cart request:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post('/api/cart', authMiddleware, adminMiddleware, requestBodyMiddleware(["aiportCode", "name"]), async (req,res) => {
  // console.log('Cart: ', req.body);
  try{
    const cartId = req.body.airportCode + req.body.name;

    if(!(await Cart.Meta.exists({cartId: cartId}).exec())) return res.status(400).send("Cart already exists.");

    Cart.Meta.create({
      cartId: cartId,
      name: req.body.name,
      airportCode: req.body.airportCode
    });

    Cart.Status.create({
      cartId: cartId,
      battery: -1,
      status: "Offline",
      position: [null,null],
      destination: [null,null]
    });

    // console.log("Created Location: ", savedCart);
  }catch(error){
    console.error("Error during '/api/cart' POST request:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

// TODO: Delete all the tasks of the cart as well
app.delete('/api/cart', authMiddleware, adminMiddleware, queryStringsMiddleware(["cartId"]), async(req, res) => {
  // console.log('Deleting Cart')
  try{
    // console.log(req.params.cartId)
    const result = await Cart.Meta.deleteOne({cartId: req.query.cartId}).exec();

    if(result.deletedCount === 0){
      return res.status(404).json({ message: "Cart not found." });
    }

    await Cart.Status.deleteOne({cartId: req.query.cartId});

    return res.status(204).json({ message:"Cart succesfully deleted." });
  } catch (err) {
    console.error("Error during /api/cart/ DELETE request:", err);
    res.status(500).json({message: "Internal Server Error"});
  }
})

app.get('/api/cart/status', authMiddleware, queryStringsMiddleware(["cartId"]), async (req, res) => { // TODO: update swagger
  try {
    // console.log('CartId:', req.query.cartId);
    const status = await Cart.Status.findOne({cartId: req.query.cartId});

    if(!status) {
      return res.status(404).json({ message: "There is no cart with that cartId" })
    }

    // console.log('Carts retrieved');
    return res.status(200).send(status);
  } catch (error) {
      console.error("Error during /api/cart/status request:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get('/api/cart/map', authMiddleware, queryStringsMiddleware(["cartId"]), (req, res) => {
  if (mapData[req.query.cartId]) {
      res.json(mapData);
  } else {
      res.status(404).json({ error: 'No map data available' });
  }
});

app.get('/api/cart/tasks', authMiddleware, async (req, res) => { // TODO: Swagger
  try {
    // console.log('Searching for task with CartId:', req.query.cartId);
    const cartTasks = await Cart.Task.find(req.query.cartId ? {cardId: req.query.cartId} : {}).exec();
    // console.log(cartTasks)
    res.send(cartTasks);
    // console.log('Tasks retrieved');
  } catch (error) {
      console.error("Error during /api/cart/tasks request:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get('/api/cart/task', authMiddleware, queryStringsMiddleware(["taskId"]), async (req, res) => { // TODO: Swagger
  try {
    // console.log('Searching for task with CartId:', req.query.cartId);
    const cartTask = await Cart.Task.findOne({taskId: req.query.taskId}).exec();
    // console.log(cartTasks)
    if(!cartTask) {
      return res.status(404).json({ message: "There is no task with that taskId" })
    }

    res.send(cartTask);
    // console.log('Tasks retrieved');
  } catch (error) {
      console.error("Error during request:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post('/api/cart/task', authMiddleware, requestBodyMiddleware(["taskId", "cartId", "statusPointId", "destinationId", "scheduledTime"]), async (req, res) => {
  // console.log('Task:', req.body);
  try {
      await Cart.Task.create({
        taskId: req.body.taskId,
        cartId: req.body.cartId,
        startPointId: req.body.startPointId,
        destinationId: req.body.destinationId,
        scheduledTime: new Date(req.body.scheduledTime),
        status: "Scheduled"
      });

      // console.log("Created Task: ", savedTask);

      res.status(201).json({ message: "Task created successfully", task: savedTask });
  } catch (error) {
      console.error("Error during /api/cart/task POST request", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// TODO: app.delete('/api/cart/task')

////// Users
app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => { // TODO: Swagger
  try {
    const users = await User.find(req.query.userRole ? {role: req.query.userRole} : {}).exec();
    res.send(users);
    // console.log('Users retrieved');
  } catch (error) {
      console.error("Error during /api/users request:", error);
      return res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get('/api/user', authMiddleware, adminMiddleware, queryStringsMiddleware(["username"]), async (req, res) => { // TODO: Swagger
  try {
    const user = await User.findOne({username: req.query.username}).exec();

    if(!user) {
      return res.status(404).json({ message: "There is no user with that username" })
    }

    res.send(user);
    // console.log('Users retrieved');
  } catch (error) {
      console.error("Error during /api/users request:", error);
      return res.status(500).send({ error: "Internal Server Error" });
  }
});

TODO:
app.post('/api/user', authMiddleware, adminMiddleware, requestBodyMiddleware(["username", "password"]), async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    User.create({ username: username, password: hashedPassword, role: "user" });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during /api/user DELETE request:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete('/api/user/', authMiddleware, adminMiddleware, queryStringsMiddleware(["username"]), async(req, res) => {
  // console.log('Deleting User')
  try {
    // console.log(req.params.username)
    const result = await User.deleteOne({username: req.query.username}).exec();

    if(result.deletedCount === 0){
      return res.status(404).json({message: "User not found."});
    }

    return res.status(204).json({message: "User succesfully deleted."});
  } catch (err) {
    console.log("Error during /api/user DELETE request:", err);
    return res.status(500).send({ error: "Internal Server Error" });
  }
})

app.patch('/api/user/role', authMiddleware, adminMiddleware, queryStringsMiddleware(["username"]), requestBodyMiddleware(["userRole"]), async(req, res) => {
  console.log("Updating Role")
  try{
    const user = await User.findOne({username: req.query.username}).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.updateOne({role: req.body.userRole}).exec();

    res.json({message:"Role successfully toggled.", user});
  }catch(err){
    console.log("Error during /api/user/role PATCH request: ", err);
    res.status(500).json({message: "Internal Server Error"});
  }
})

// app.use((req, res, next) => {
//   console.log("Headers:", req.headers);
//   console.log("Body:", req.body);
//   console.log("Cookies:", req.cookies);
//   next();
// });

//// Swagger
var swaggerDocument = {};

try {
  const newSwaggerDocument = YAML.parse(fs.readFileSync("./swagger.yaml").toString());
  swaggerDocument = newSwaggerDocument;
} catch(err) {
  console.error("Error while parsing swagger.yaml:", err);
}

fs.watch("./swagger.yaml", (curr, prev) => {
  try {
    const newSwaggerDocument = YAML.parse(fs.readFileSync("./swagger.yaml").toString());
    swaggerDocument = newSwaggerDocument;
  } catch(err) {
    console.error("Error while parsing swagger.yaml:", err);
  }
})

var options = {
  swaggerOptions: {
      url: "/api-docs/swagger.json",
  }
}


app.get("/api-docs/swagger.json", (req, res) => res.json(swaggerDocument));
app.use('/api-docs', swaggerUi.serveFiles(null, options), swaggerUi.setup(null, options));

// Socket.io
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('new frontend connected');
});

// ROS integration
var mapData = {luggage_av: null};
const ros = new ROSLIB.Ros({
  url: 'ws://localhost:9090' // using localhost 9090 since we used that in ros_test.html
});

ros.on('error', (error) => {
  console.error('ROS connection error:', error);
});

ros.on('close', () => {
  console.log('ROS connection closed');
});

//// Topics
const map_topic = new ROSLIB.Topic({
  ros: ros,
  name: '/luggage_av/map',
  messageType: 'nav_msgs/msg/OccupancyGrid' // ROS 2 message format
});

////// Subscriptions
map_topic.subscribe((message) => {
  // This should also serve as a update function whenever OccupancyGrid message is received.
  // console.log('Received map data:', message);
  mapData = message; // Store the latest map data

  // Emit data to clients connected via WebSocket
  io.emit('mapData', message);
});

// Start server
server.listen(PORT_2, () => {
  console.log('Server started on http://0.0.0.0:' + PORT_2);
});
