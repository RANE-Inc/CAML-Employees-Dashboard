import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './assets/Home';
import Login from './assets/Login';
import Signup from './assets/Signup';
import Locations from './assets/Locations';
import Cart from './assets/Cart';
import Dashboard from './assets/Dashboard';
import AdminDashboard from './assets/AdminDashboard';
import ScheduleCart from './assets/ScheduleCart';
import CreateCart from './assets/CreateCart';
import CreateLocation from './assets/CreateLocation';
import AddDestination from './assets/AddDestination';
//import ConnectROS from './components/ui/ConnectROS'
import './App.css';

export default function App() {

  return (
    <BrowserRouter>

    <div>

      <Routes>
        <Route path="/" element = {<Home/>} />
        <Route path="/Login" element = {<Login/>} />
        <Route path="/Signup" element = {<Signup/>} />
        <Route path="/Locations" element = {<Locations/>} />
        <Route path="/Dashboard/:airportCode" element = {<Dashboard/>} />
        <Route path="/Cart/:cartId" element = {<Cart/>}/>
        <Route path="/ScheduleCart/:cartId" element = {<ScheduleCart/>} />
        <Route path="/AdminDashboard" element = {<AdminDashboard/>} />
        <Route path="/CreateCart" element = {<CreateCart/>} />
        <Route path="/CreateLocation" element = {<CreateLocation/>} />
        <Route path="/AddDestination/:airportCode" element = {<AddDestination/>}/>
      </Routes>

    </div>

  </BrowserRouter> 
  );
}
