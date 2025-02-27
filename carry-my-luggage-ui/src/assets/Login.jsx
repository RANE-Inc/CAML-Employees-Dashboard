import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "../components/ui/button";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            await axios.post("http://localhost:4000/login", 
                { username, password }, 
                { withCredentials: true } // Important! Enables cookies
            );
            navigate("/Locations"); // Redirect on success
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div style={{ fontFamily: 'Kanit', position: "fixed", top: "20%", left: '37%' }}>
            <div style={{fontSize:"250%", color:"SaddleBrown"}}>
                Welcome To
            </div>
            <div style={{fontSize:"250%", color:"SaddleBrown"}}>
                CAML Autonomous Mobility Lift  
            </div>
            <form className="grid grid-cols-1" style={{ paddingTop: '5%' }} onSubmit={handleSubmit}>
                <div style={{ paddingTop: "5%" }}>
                    <input
                        style={{ fontSize: "140%" }}
                        className="bg-amber-200"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                    />
                </div>

                <div style={{ paddingTop: "5%" }}>
                    <input
                        style={{ fontSize: "140%" }}
                        className="bg-amber-200"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                </div>

                <div style={{ paddingTop: '8%' }}>
                    <Button style={{ fontSize: '150%' }} variant="secondary" className="bg-amber-600" type="submit">
                        Login
                    </Button>
                </div>

                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
}

export default Login;