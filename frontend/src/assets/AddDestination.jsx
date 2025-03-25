import React from 'react';
import {Link} from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "../components/ui/button";
import DropMyMenu from '../components/ui/dropMyMenu';
import { useState, useEffect } from 'react';
import api from '../api/axiosInstance'; // Import axios instance


function AddDestination(){

    const navigate = useNavigate();
    const { airportCode } = useParams();
    const [loading, setLoading] = useState(true);
    const [locType, setLocType] = useState('');
    const [locName, setLocName] = useState('');

    // Check authentication on component mount
    useEffect(() => {
        api.get("/api/auth/check-auth", { withCredentials: true })
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
            const response = await api.post( // Use api instead of axios
                '/api/airport/destination',
                {
                    destinationId: airportCode+"-"+locName,
                    airportCode: airportCode,
                    name: locName,
                    type: locType,
                    location: "default",
                    zone: "default"
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
            <DropMyMenu/>

            <b style={{position:'absolute', fontSize:"250%", color:"SaddleBrown", top:'13%', left:'38%'}}>
                Create Destination at {airportCode}
            </b>

            <form className="grid grid-cols-1" style={{position:'absolute', left:'46%', top:'23%'  }} onSubmit={handleSubmit}>
                <div className="grid grid-4" style={{fontSize: "150%", paddingTop: '5%'}}>

                    {/* Select Location Type */}
                    <label htmlFor='locType' style={{ paddingTop: '3%' }}>Select Type</label>
                    <select
                        id="locType"
                        value={locType}
                        onChange={(e) => setLocType(e.target.value)}
                        className='bg-amber-200'
                    >
                        {["Pickup", "Gate", "Bathroom", "Store", "Restaurant", "Other"].map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>
                
                {/* Input Destination Name */}
                <label htmlFor='locName' style={{ fontSize: "150%", paddingTop: '10%' }}>Destination Name</label>
                    <input
                        id="locName"
                        value={locName}
                        onChange={(e) => setLocName(e.target.value)}
                        className="bg-amber-200 p-2"
                        type="text"
                        placeholder="Enter Destination Name"
                    />

                {/* Confirm Button */}
                <div style={{ paddingTop: '10%' }}>
                    <Button style={{ fontSize: '150%', color:"Black" }} variant="secondary" className="bg-amber-600" type='submit'>
                        Confirm
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default AddDestination;