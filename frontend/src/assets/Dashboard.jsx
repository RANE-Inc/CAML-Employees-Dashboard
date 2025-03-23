import React from 'react';
import {Link, useParams} from 'react-router-dom';
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

// TODO: To display some details about carts in a location, such as the statuses of carts, move the card
//       from the Locations component into it's own component. That new component can call /api/carts with
//       its airportCode.

function Dashboard() {
    const [luggageCarts, setLuggageCarts] = useState([]);
    const [error, setError] = useState(null);

    const { airportCode } = useParams();


    console.log("Airport Code:", airportCode); // Debug airport code
      useEffect(() => {
        axios
            .get('http://localhost:4000/api/carts', {params: {airportCode: airportCode}, withCredentials: true })
            .then((response) => {
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
            <b style={{ position: "absolute", color:"SaddleBrown", top: "2%", left: "45%", fontSize: '250%' }}>
                {airportCode} Airport
            </b>

            <div
                style={{
                    position: "absolute",
                    top: "9%",
                    left: "19%",
                    overflowY: "scroll",
                    overflowX: "hidden",
                    maxHeight: "calc(100vh - 10%)",
                }}
                className="grid gap-12 p-4 sm:grid-cols-2 md:grid-cols-3 w-[1200px] h-[75%]"
            >
                {error ? (
                    <p>{error}</p>
                ) : luggageCarts && luggageCarts.length > 0 ? (
                    luggageCarts.map((cart) => (
                        <div key={cart.cartId} className="max-w-xs text-left">
                            <Card className="bg-amber-400 h-[140px] w-[360px]">
                                <CardTitle style={{ paddingLeft: "7%", paddingTop: "3%", fontSize: "160%" }}>
                                    Cart {cart.name}
                                </CardTitle>
                                <CardContent style={{ paddingTop: "3%", paddingBottom: "1%", fontSize: "110%" }}>
                                    Cart ID: {cart.cartId}
                                </CardContent>
                                <div style={{ paddingLeft: '6%', marginTop: '2%' }}>
                                    <Button
                                        style={{ fontSize: '100%' }}
                                        variant="secondary"
                                        className="bg-amber-600"
                                        type="submit"
                                    >
                                        <Link style={{color:"white"}} to={`/Cart/${cart.cartId}`}>Select Cart</Link>
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
