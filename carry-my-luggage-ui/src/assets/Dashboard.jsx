import React from 'react';
import {Link} from 'react-router-dom';
import {Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,} from "../components/ui/card";
import { Button } from "../components/ui/button";
import DropMyMenu from '../components/ui/dropMyMenu';
import axios from 'axios';
import { useState, useEffect } from 'react';

import PropTypes from 'prop-types';

function Dashboard() {
    const [luggageCarts, setLuggageCarts] = useState([]);
    const [error, setError] = useState(null);


      useEffect(() => {
        axios
            .get('http://localhost:4000/api/carts')
            .then((response) => {
                console.log("API Response:", response.data); // Debug API data
                setLuggageCarts(response.data);
            })
            .catch((error) => {
                console.error("API Error:", error);
                setError("Failed to fetch carts. Please try again later.");
            });
    }, []);

    return (
        <div>
            <DropMyMenu />
            <div style={{ position: "fixed", top: "2%", left: "45%", fontSize: '250%' }}>
                Airport Name
            </div>

            <div
                style={{
                    position: "fixed",
                    top: "9%",
                    left: "17%",
                    overflowY: "scroll",
                    maxHeight: "calc(100vh - 10%)",
                }}
                className="grid gap-12 p-4 sm:grid-cols-2 md:grid-cols-3"
            >
                {error ? (
                    <p>{error}</p>
                ) : luggageCarts && luggageCarts.length > 0 ? (
                    luggageCarts.map((cart) => (
                        <div key={cart.cartId} className="max-w-xs text-left">
                            <Card className="bg-indigo-300 h-[160px] w-[360px]">
                                <CardTitle style={{ paddingLeft: "7%", paddingTop: "3%", fontSize: "160%" }}>
                                    Cart {cart.cartNum}
                                </CardTitle>
                                <CardContent style={{ paddingTop: "3%", paddingBottom: "1%", fontSize: "110%" }}>
                                    Battery: {cart.battery}%
                                </CardContent>
                                <CardContent style={{ paddingBottom: "2%", fontSize: "110%" }}>
                                    Status: {cart.status} {cart.location == "Charging" || cart.location} ({cart.timeRem || 0} Minutes)
                                </CardContent>
                                <div style={{ paddingLeft: '6%' }}>
                                    <Button
                                        style={{ fontSize: '100%' }}
                                        variant="secondary"
                                        className="bg-indigo-500"
                                        type="submit"
                                    >
                                        <Link style={{color:"white"}} to='/Cart'>Select Cart</Link>
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    ))
                ) : (
                    <p>Loading carts or no carts available.</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
