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
function Cart(){

    const [cart, setCart] = useState([]);
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
    
    // const cart = {cartNum:'1' ,airport:'YOW', battery: 50, status:'Moving To', Location:'Gate 1', timeRem:30};

    return(

        <div>
            <DropMyMenu/>

            <Card className="bg-amber-400" style={{fontFamily:'Kanit', position:"fixed", top:"20%", left:'40%'}}>
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
        </div>
    );
}

export default Cart;