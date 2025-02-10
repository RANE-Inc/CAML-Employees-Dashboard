import React from 'react';
import {Link, useParams} from 'react-router-dom';
import { Button } from "../components/ui/button";
import DropMyMenu from '../components/ui/dropMyMenu';
import{ useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



function ScheduleCart(){
    const navigate = useNavigate();
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedAMPM, setSelectedAMPM] = useState('');
    const [selectedStart, setSelectedStart] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('');
    const [cart, setCart] = useState({});
    const [error, setError] = useState(null);


    const { cartId } = useParams();

    useEffect(() => {
        axios
            .get('http://localhost:4000/api/cart', { params: { cartId: cartId } })
            .then((response) => {
                console.log("API Response:", response.data);
                setCart(response.data);
            })
            .catch((error) => {
                console.error("API Error:", error);
                setError("Failed to fetch carts. Please try again later.");
            });
    }, [cartId]);
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Cart:", cart);
        
        try {
            const response = await axios.post('http://localhost:4000/api/tasks', {
                taskID: cartId, 
                airport: cart.airport,
                cartNum: cart.cartNum,
                startPoint: selectedStart || "Gate A",
                airportLoc: selectedDestination || "Gate A",
                taskTime: selectedTime && selectedAMPM ? `${selectedTime} ${selectedAMPM}` : "1:00 PM",
                status: "Pending"
            });
    
            console.log("API Response:", response.data);
            navigate(`/Dashboard/${cart.airport}`);
        } catch (error) {
            console.error("API Error:", error);
            setError("Failed to create task. Please try again later.");
        }
    };
    

    

    return(
        <div>
            <DropMyMenu/>

            <div style={{fontFamily:'Kanit', position:"fixed", top:"20%", left:'42%'}}>

                <div style={{fontSize:"250%"}}>
                    Schedule Cart {cart.cartNum}
                </div>

                <form className="grid grid-cols-1" style={{paddingTop:'5%'}} onSubmit={handleSubmit}>
                    <div className="grid grid-4" style={{fontSize:"150%", paddingTop:'5%'}}>
                        <label htmlFor='time'>Select Time</label>
                        <select
                            id="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className='bg-amber-200'
                        >
                            <option value="1:00">1:00</option>
                            <option value="2:00">2:00</option>
                            <option value="3:00">3:00</option>
                            <option value="4:00">4:00</option>
                            <option value="5:00">5:00</option>
                            <option value="6:00">6:00</option>
                            <option value="7:00">7:00</option>
                            <option value="8:00">8:00</option>
                            <option value="9:00">9:00</option>
                            <option value="10:00">10:00</option>
                            <option value="11:00">11:00</option>
                            <option value="12:00">12:00</option>
                        </select>

                        <label htmlFor='AMPM' style={{paddingTop:'3%'}}>Select AM or PM</label>
                        <select
                            id="AMPM"
                            value={selectedAMPM}
                            onChange={(e) => setSelectedAMPM(e.target.value)}
                            className='bg-amber-200'
                        >
                            <option value="PM">PM</option>
                            <option value="AM">AM</option>
                        </select>

                        <label htmlFor='Start' style={{paddingTop:'3%'}}>Select Start Location</label>
                        <select
                            id="Start"
                            value={selectedStart}
                            onChange={(e) => setSelectedStart(e.target.value)}
                            className='bg-amber-200'
                        >
                            <option value="Gate A">Gate A</option>
                            <option value="Gate B">Gate B</option>
                            <option value="Gate C">Gate C</option>
                            <option value="Charging Station">Charging Station</option>
                        </select>

                        <label htmlFor='Destination' style={{paddingTop:'3%'}}>Select Destination</label>
                        <select
                            id="Destination"
                            value={selectedDestination}
                            
                            onChange={(e) => {
                                setSelectedDestination(e.target.value)
                            }}
                            className='bg-amber-200'
                        >
                            <option value="Gate A">Gate A</option>
                            <option value="Gate B">Gate B</option>
                            <option value="Gate C">Gate C</option>
                            <option value="Charging Station">Charging Station</option>
                        </select>

                    </div>

                    <div style={{paddingTop:'8%'}}>
                    <Button style={{fontSize:'150%'}} variant="secondary"  className="bg-amber-600" type='submit'>
                        Confirm
                    </Button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default ScheduleCart;