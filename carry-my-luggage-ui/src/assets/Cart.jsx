import React from 'react';
import {Link, useParams} from 'react-router-dom';
import { Button } from "../components/ui/button";
import DropMyMenu from '../components/ui/dropMyMenu';
import {Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,} from "../components/ui/card";
import axios from 'axios';
import { useState, useEffect } from 'react';
import OccupancyGridMap from './OccupancyGridMap'; // Import the map component

function Cart(){

    const [cart, setCart] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    const { cartId } = useParams();

    console.log("Cart ID: ", cartId);

      useEffect(() => {
        axios
            .get('http://localhost:4000/api/cart', {params: {cartId: cartId}|| {}})
            .then((response) => {
                console.log("API Response:", response.data); // Debug API data
                setCart(response.data);
            })
            .catch((error) => {
                console.error("API Error:", error);
                setError("Failed to fetch carts. Please try again later.");
            });
    }, []);

    console.log("Cart ID: ", cartId);

        useEffect(() => {
            axios
                .get('http://localhost:4000/api/taskFind', {params: {cartId: cartId}|| {}})
                .then((response) => {
                    console.log("API Response:", response.data); // Debug API data
                    setTasks(response.data);
                })
                .catch((error) => {
                    console.error("API Error:", error);
                    setError("Failed to fetch tasks. Please try again later.");
                });
    }, []);
    
    // const cart = {cartNum:'1' ,airport:'YOW', battery: 50, status:'Moving To', Location:'Gate 1', timeRem:30};

    return(

        <div>
            <DropMyMenu/>

            <div className="flex gap-4">
                <Card className="bg-amber-400" style={{fontFamily:'Kanit', position:"fixed", top:"15%", left:'30%'}}>
                    <CardTitle style={{paddingTop:'3%', fontSize:'225%'}}>
                        Cart {cart.cartNum}
                    </CardTitle>
                    <CardContent className='text-left' style={{paddingTop:'8%', fontSize:'150%'}}>
                        Airport: {cart.airport}
                    </CardContent>
                    <CardContent className='text-left' style={{fontSize:'150%'}}>
                        Battery: {cart.battery}
                    </CardContent>
                    <CardContent className='text-left' style={{fontSize:'150%'}}>
                        Status: {cart.status} {cart.Location}
                    </CardContent>
                    <CardContent className='text-left' style={{fontSize:'150%'}}>
                        Time Remaining: {cart.timeRem} Minutes
                    </CardContent>
                    <div style={{paddingTop:'10%', paddingBottom:'5%'}}>
                        <Button style={{fontSize:'150%', color:"white"}} variant="secondary"  className="bg-amber-600">
                            <Link style={{color:"white"}} to={`/ScheduleCart/${cart.cartId}`}>
                                Schedule Cart {cart.cartNum}
                            </Link>
                        </Button>
                    </div>
                </Card>
                <div
                    style={{
                        position: "fixed",
                        top: "18%",
                        left: "55%",
                        overflowY: "scroll",
                        maxHeight: "calc(100vh - 10%)",
                    }}
                    className="grid p-5 grid-cols-1"
                >
                    {error ? (
                        <p>{error}</p>
                    ) : tasks && tasks.length > 0 ? (
                        tasks.map((task) => (
                            <div key={task.taskID} className="max-w-xs text-left">
                                <Card className="bg-amber-400 h-[180px] w-[360px]">
                                    <CardTitle style={{ paddingLeft: "7%", paddingTop: "3%", fontSize: "160%" }}>
                                        Task {task.taskID}
                                    </CardTitle>
                                    <CardContent style={{ paddingTop:'3%', paddingBottom: "2%", fontSize: "110%" }}>
                                        Task Start Time: {task.taskTime}
                                    </CardContent>
                                    <CardContent style={{ paddingBottom: "1%", fontSize: "110%" }}>
                                        Start Location: {task.startPoint}
                                    </CardContent>
                                    <CardContent style={{ paddingBottom: "2%", fontSize: "110%" }}>
                                        Destination: {task.airportLoc}
                                    </CardContent>
                                    <CardContent style={{ paddingBottom: "2%", fontSize: "110%" }}>
                                        Status: {task.status}
                                    </CardContent>
                                </Card>
                            </div>
                            
                        ))
                    ) : (
                        <p>Loading tasks or no tasks available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Cart;