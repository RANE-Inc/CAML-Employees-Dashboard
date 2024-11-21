import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './assets/Home';
import Login from './assets/Login';
import Signup from './assets/Signup';
import Locations from './assets/Locations';
import Cart from './assets/Cart';
import Dashboard from './assets/Dashboard';
import ScheduleCart from './assets/ScheduleCart';
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
        <Route path="/Dashboard" element = {<Dashboard/>} />
        <Route path="/Cart" element = {<Cart/>}/>
        <Route path="/ScheduleCart" element = {<ScheduleCart/>} />
      </Routes>

    </div>

  </BrowserRouter> 
  );
}
