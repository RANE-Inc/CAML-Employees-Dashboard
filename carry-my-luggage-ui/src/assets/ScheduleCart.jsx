import React from 'react';
import {Link, useParams} from 'react-router-dom';
import { Button } from "../components/ui/button";
import DropMyMenu from '../components/ui/dropMyMenu';
import{ useState, useEffect } from 'react';
import axios from 'axios';


function ScheduleCart(){

    const [selectedTime, setSelectedTime] = useState('');
    const [selectedAMPM, setSelectedAMPM] = useState('');
    const [selectedGoTo, setSelectedGoTo] = useState('');
    const [cart, setCart] = useState([]);

    const { cartId } = useParams();

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

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    (cart.airport);

    return(
        <div>
            <DropMyMenu/>

            <div style={{fontFamily:'Kanit', position:"fixed", top:"20%", left:'41%'}}>

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
                        >
                            <option value="1">1:00</option>
                            <option value="2">2:00</option>
                            <option value="3">3:00</option>
                            <option value="4">4:00</option>
                            <option value="5">5:00</option>
                            <option value="6">6:00</option>
                            <option value="7">7:00</option>
                            <option value="8">8:00</option>
                            <option value="9">9:00</option>
                            <option value="10">10:00</option>
                            <option value="11">11:00</option>
                            <option value="12">12:00</option>
                        </select>

                        <label htmlFor='AMPM' style={{paddingTop:'3%'}}>Select AM or PM</label>
                        <select
                            id="AMPM"
                            value={selectedAMPM}
                            onChange={(e) => setSelectedAMPM(e.target.value)}
                        >
                            <option value="1">PM</option>
                            <option value="2">AM</option>
                        </select>

                        <label htmlFor='GoTo' style={{paddingTop:'3%'}}>Select Next Location</label>
                        <select
                            id="Task"
                            value={selectedGoTo}
                            onChange={(e) => setSelectedGoTo(e.target.value)}
                        >
                            <option value="1">Gate A</option>
                            <option value="2">Gate B</option>
                            <option value="3">Gate C</option>
                            <option value="4">Charging Station</option>
                        </select>

                    </div>

                    <div style={{paddingTop:'8%'}}>
                    <Button style={{fontSize:'150%'}} variant="secondary"  className="bg-indigo-500" type='submit'>
                        <Link style={{color:"white"}} to={`/Dashboard/${cart.airport}`}>Confirm</Link>
                    </Button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default ScheduleCart;