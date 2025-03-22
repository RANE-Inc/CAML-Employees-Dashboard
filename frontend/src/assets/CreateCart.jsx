import React from 'react';
import { Button } from "../components/ui/button";
import {Link, useNavigate, useParams} from 'react-router-dom';
import DropMyMenu from '../components/ui/dropMyMenu';
import axios from 'axios';
import api from '../api/axiosInstance'; // Import axios instance
import { useState, useEffect } from 'react';


function CreateCart(){

    const navigate = useNavigate();
    const [Airports, setAirports] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('YOW');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/api/auth/check-admin", { withCredentials: true })
        .then(response => {
            console.log("API Response:", response.data);  // Log response to verify the role
            setLoading(false);
        })
        .catch(error => {
            console.error("Auth Check Failed:", error);  // Log error if check fails
            navigate("/locations");
        });
    }, [navigate]);

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

    const handleSubmit = async () => {
        let AirportLocation = '';
        for(let i = 0; i < Airports.length; i++){
            if(Airports[i].airportCode == selectedLocation){
                AirportLocation = Airports[i].location;
            }
        }

        try{
            const response = await api.post( // Use api instead of axios
                '/api/cart',
                {
                    airportCode: selectedLocation,
                    name: "default",
                }
            );
            console.log("API Response: ", response.data);
            alert("Successfully Created Cart");
        }catch (error){
            console.error("API Error:", error);
            setError("Failed to create cart.");
            alert("Failed to create cart" + error);
        }
    }

    return(
        <div>
            <DropMyMenu />
            <div style={{fontFamily:'Kanit', position:"absolute", top:"20%", left:'45%'}}>
                <div style={{fontSize:"250%", color:"SaddleBrown"}}>
                    Create Cart
                </div>

                <form className="grid grid-cols-1" style={{ paddingTop: '5%' }} onSubmit={handleSubmit}>
                    <div className="grid grid-4" style={{ fontSize: "150%", paddingTop: '5%' }}>

                        {/* Select Location */}
                        <label htmlFor='Location' style={{ paddingTop: '3%' }}>Select Location</label>
                        <select
                            id="Location"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className='bg-amber-200'
                        >
                            {Airports.map((loc) => (
                                <option key={loc} value={loc.airportCode}>{loc.airportCode}</option>
                            ))}
                        </select>
                    </div>

                    {/* Confirm Button */}
                    <div style={{ paddingTop: '8%' }}>
                        <Button style={{ fontSize: '150%', color:"White" }} variant="secondary" className="bg-amber-600" type='submit'>
                            Confirm
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateCart;
