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
import e from 'cors';
import { useState, useEffect } from 'react';

// TODO: To display some details about carts in a location, such as the number of carts move the card
//       from the Locations component into it's own component. That new component can call /api/carts
//       with its airportCode.

function Locations(){


    const [Airports, setAirports] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get('http://localhost:4000/api/airports',{ withCredentials: true })
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
            <b style={{ position: "absolute", color:"SaddleBrown", top: "2%", left: "45%", fontSize: '250%' }}>
                Serviced Airports
            </b>

            <div style={{position:"absolute", top:"10%", left:"17%"}} className="grid gap-12 p-4 sm:grid-cols-3 md:grid-cols-4">
                {Airports.map((airport) =>
                    <div key={airport.airportCode} className='max-w-xs text-left'>
                        <Card className="bg-amber-400 h-[170px] w-[120%]">
                            <CardTitle style={{paddingLeft:"7%", paddingTop:"3%", fontSize:"160%"}}>{airport.airportCode} Airport</CardTitle>
                            <CardContent style={{paddingTop:"3%", paddingBottom:"1%", fontSize:"110%"}}>Location: {airport.location} </CardContent>
                            <CardContent style={{paddingBottom:"3%", fontSize:"110%"}}>Code: {airport.airportCode} </CardContent>
                            <div style={{paddingLeft:'7%'}}>
                                <Button style={{fontSize:'100%', paddingLeft:''}} variant="secondary"  className="bg-amber-600" type='submit'>
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
