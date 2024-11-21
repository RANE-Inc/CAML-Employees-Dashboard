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
import e from 'cors';
import { useState, useEffect } from 'react';

function Locations(){


    const [Airports, setAirports] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get('http://localhost:4000/api/airports')
            .then((response) => {
                console.log("API Response:", response.data); // Debug API data
                setAirports(response.data);
            })
            .catch((error) => {
                console.error("API Error:", error);
                setError("Failed to fetch carts. Please try again later.");
            });
    }, []);
    
    return(
        <div>
            <DropMyMenu/>

            <div style={{position:"fixed", top:"8%", left:"15%"}} className="grid gap-12 p-4 sm:grid-cols-3 md:grid-cols-4">
                {Airports.map((airport) =>
                    <div key={airport.airportCode} className='max-w-xs text-left'>
                        <Card className="bg-indigo-300 h-[150px] w-[115%]">
                            <CardTitle style={{paddingLeft:"7%", paddingTop:"3%", fontSize:"160%"}}>{airport.location}</CardTitle>
                            <CardContent style={{paddingTop:"3%", paddingBottom:"1%", fontSize:"110%"}}>Code: {airport.airportCode} </CardContent>
                            <CardContent style={{paddingBottom:"2%", fontSize:"110%"}}>Carts: {airport.numberOfCarts} </CardContent>
                            <div style={{paddingLeft:'4%'}}>
                                <Button style={{fontSize:'100%', paddingLeft:''}} variant="secondary"  className="bg-indigo-500" type='submit'>
                                    <Link style={{color:"white" }} to={`/Dashboard/${airport.airportCode}`}>Select</Link>

                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Locations;