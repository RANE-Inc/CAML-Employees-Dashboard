import React from 'react';
import { Button } from "../components/ui/button";
import {Link, useNavigate, useParams} from 'react-router-dom';
import DropMyMenu from '../components/ui/dropMyMenu';
import axios from 'axios';
import api from '../api/axiosInstance'; // Import axios instance
import { useState, useEffect } from 'react';


function CreateLocation(){

    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [airportCode, setAirportCode] = useState('');
    const [AP_name, setAP_name] = useState('');

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

    const handleSubmit = async () => {

        try{
            const response = await api.post('/api/createAirport',
                {
                    location: ((city) + ', ' + (state) + ', ' + (country)),
                    name: "default",
                    airportCode: airportCode,
                }
            );
            console.log("API Response: ", response.data);
            alert("Successfully Created Location");
        }catch (error){
            console.error("API Error:", error);
            setError("Failed to create location.");
            alert("Failed to create location:"+ error);
        }
    }

    return(
        <div>
            <DropMyMenu />
            <div style={{fontFamily:'Kanit', position:"absolute", top:"15%", left:'45%'}}>
                <b style={{fontSize:"250%", color:"SaddleBrown"}}>
                    Create Location
                </b>
            
                <form className="grid grid-cols-1" style={{ paddingTop: '5%' }} onSubmit={handleSubmit}>
                    <div className="grid grid-4" style={{ fontSize: "150%", paddingTop: '5%' }}>

                        {/* Enter City */}
                        <label htmlFor='city'>City</label>
                            <input
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="bg-amber-200 p-2"
                                type="text"
                                placeholder="Enter City Name"
                            />

                        {/* Enter State/Province */}
                        <label htmlFor='state'>Province or State</label>
                            <input
                                id="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="bg-amber-200 p-2"
                                type="text"
                                placeholder="Enter State or Province"
                            />

                        {/* Enter Country */}
                        <label htmlFor='country'>Country</label>
                            <input
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="bg-amber-200 p-2"
                                type="text"
                                placeholder="Enter Country"
                            />

                        {/* Enter Airport Name */}
                        <label htmlFor='AP_name'>Airport Name</label>
                            <input
                                id="AP_name"
                                value={AP_name}
                                onChange={(e) => setAP_name(e.target.value)}
                                className="bg-amber-200 p-2"
                                type="text"
                                placeholder="Enter Airport Name"
                            />

                        {/* Enter Airport Code */}
                        <label htmlFor='airportCode'>Airport Code</label>
                            <input
                                id="airportCode"
                                value={airportCode}
                                onChange={(e) => setAirportCode(e.target.value)}
                                className="bg-amber-200 p-2"
                                type="text"
                                placeholder="Enter Airport Code (Ex. YOW)"
                            />
                    </div>

                    {/* Confirm Button */}
                    <div style={{ paddingTop: '8%' }}>
                        <Button style={{ fontSize: '150%', color:"Black" }} variant="secondary" className="bg-amber-600" type='submit'>
                            Confirm
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateLocation;
