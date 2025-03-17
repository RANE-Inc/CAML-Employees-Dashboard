import React from 'react';
import { Button } from "../components/ui/button";
import {Link, useNavigate, useParams} from 'react-router-dom';
import DropMyMenu from '../components/ui/dropMyMenu';
import axios from 'axios';
import api from '../api/axiosInstance'; // Import axios instance
import { useState, useEffect } from 'react';


function CreateCart(){

    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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

    return(
        <div>
            <DropMyMenu />
            <div style={{fontFamily:'Kanit', position:"absolute", top:"20%", left:'37%'}}>
                <div style={{fontSize:"250%", color:"SaddleBrown"}}>
                    Create Cart
                </div>
            </div>
        </div>
    );
}

export default CreateCart;