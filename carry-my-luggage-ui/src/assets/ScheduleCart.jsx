import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance'; // Import axios instance
import { Button } from "../components/ui/button";
import DropMyMenu from '../components/ui/dropMyMenu';

function ScheduleCart() {
    const navigate = useNavigate();
    const { cartId } = useParams();
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedAMPM, setSelectedAMPM] = useState('');
    const [selectedStart, setSelectedStart] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('');
    const [cart, setCart] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication on component mount
    useEffect(() => {
        api.get("/check-auth", { withCredentials: true })
        .then(response => {
            console.log("API Response:", response.data);  // Log response to verify the role
            if (response.data.role.toLowerCase() !== "admin") {
                navigate("/locations");
            } else {
                setLoading(false);
            }
        })
        .catch(error => {
            console.error("Auth Check Failed:", error);  // Log error if check fails
            navigate("/locations");
        });
    }, [navigate]);    
    

    // Fetch cart details
    useEffect(() => {
        if (!cartId) return;
        
        api.get('/api/cart', { params: { cartId } }) // Use api instead of axios
            .then((response) => {
                console.log("API Response:", response.data);
                setCart(response.data);
            })
            .catch((error) => {
                console.error("API Error:", error);
                setError("Failed to fetch cart details. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, [cartId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post( // Use api instead of axios
                '/api/tasks',
                {
                    taskID: cartId, 
                    airport: cart.airport,
                    CartNum: cart.cartNum,
                    startPoint: selectedStart || "Gate A",
                    airportLoc: selectedDestination || "Gate A",
                    taskTime: selectedTime && selectedAMPM ? `${selectedTime} ${selectedAMPM}` : "1:00 PM",
                    status: "Pending"
                }
            );
    
            console.log("API Response:", response.data);
            navigate(`/Dashboard/${cart.airport}`);
        } catch (error) {
            console.error("API Error:", error);
            setError("Failed to create task. Please try again later.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <DropMyMenu />

            <div style={{ fontFamily: 'Kanit', position: "absolute", top: "20%", left: '42%' }}>
                <div style={{ fontSize: "250%" }}>Schedule Cart {cart.cartNum}</div>

                <form className="grid grid-cols-1" style={{ paddingTop: '5%' }} onSubmit={handleSubmit}>
                    <div className="grid grid-4" style={{ fontSize: "150%", paddingTop: '5%' }}>
                        {/* Select Time */}
                        <label htmlFor='time'>Select Time</label>
                        <select
                            id="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className='bg-amber-200'
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={`${i + 1}:00`}>{i + 1}:00</option>
                            ))}
                        </select>

                        {/* Select AM/PM */}
                        <label htmlFor='AMPM' style={{ paddingTop: '3%' }}>Select AM or PM</label>
                        <select
                            id="AMPM"
                            value={selectedAMPM}
                            onChange={(e) => setSelectedAMPM(e.target.value)}
                            className='bg-amber-200'
                        >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                        </select>

                        {/* Select Start Location */}
                        <label htmlFor='Start' style={{ paddingTop: '3%' }}>Select Start Location</label>
                        <select
                            id="Start"
                            value={selectedStart}
                            onChange={(e) => setSelectedStart(e.target.value)}
                            className='bg-amber-200'
                        >
                            {["Gate A", "Gate B", "Gate C", "Charging Station"].map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>

                        {/* Select Destination */}
                        <label htmlFor='Destination' style={{ paddingTop: '3%' }}>Select Destination</label>
                        <select
                            id="Destination"
                            value={selectedDestination}
                            onChange={(e) => setSelectedDestination(e.target.value)}
                            className='bg-amber-200'
                        >
                            {["Gate A", "Gate B", "Gate C", "Charging Station"].map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
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

export default ScheduleCart;