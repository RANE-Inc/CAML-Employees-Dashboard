import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import { Button } from "../components/ui/button";
import DropMyMenu from '../components/ui/dropMyMenu';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '../components/ui/table';
import axios from 'axios';
import api from '../api/axiosInstance'; // Import axios instance
import { useState, useEffect } from 'react';

function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [carts, setCarts] = useState([]);
    const [Airports, setAirports] = useState([]);
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
            .get('http://localhost:4000/api/users',{ withCredentials: true })
            .then((response) => {
                console.log("API Response:", response.data); // Debug API data
                setUsers(response.data);
            })
            .catch((error) => {
                console.error("API Error:", error);
                setError("Failed to fetch users. Please try again later.");
            });
    }, []);

    useEffect(() => {
        axios
            .get('http://localhost:4000/api/carts',{ withCredentials: true })
            .then((response) => {
                console.log("API Response:", response.data); // Debug API data
                setCarts(response.data);
            })
            .catch((error) => {
                console.error("API Error:", error);
                setError("Failed to fetch users. Please try again later.");
            });
    }, []);

    useEffect(() => {
        axios
            .get("http://localhost:4000/api/airports",{ withCredentials: true })
            .then((response) => {
                console.log("API Response:", response.data); // Debug API data
                setAirports(response.data);
            })
            .catch((error) => {
                console.error("API Error:", error);
                setError("Failed to fetch carts. Please try again later.");
            });
    }, []);

    const removeUser = async(username) => {
        axios
            .delete("http://localhost:4000/api/user",{ params: { username: username }, withCredentials: true })
            .then((response) => {
                console.log("API Response: ", response.data);
                alert("User Succesfully deleted.");
                window.location.reload();
            }).catch((error) => {
                console.error("API Error:",error);
                alert("Error: " + error);
        });
    }

    const removeCart = async(cartId) => {
        axios
            .delete(`http://localhost:4000/api/cart`,{ params: { cartId: cartId }, withCredentials: true })
            .then((response) => {
                console.log("API Response: ", response.data);
                alert("Cart Succesfully deleted.");
                window.location.reload();
            }).catch((error) => {
                console.error("API Error:",error);
                alert("Error: " + error);
        });
    }

    const removeAirport = async(code) => {
        axios
            .delete(`http://localhost:4000/api/airport`,{ params: { airportCode: code }, withCredentials: true })
            .then((response) => {
                console.log("API Response: ", response.data);
                alert("Location Succesfully deleted.");
                window.location.reload();
            }).catch((error) => {
                console.error("API Error:",error);
                alert("Error: " + error);
        });
    }

    const toggleAdmin = async(username, role) => {
        axios
            .patch('http://localhost:4000/api/user/role', {role: role === "admin" ? "user" : "admin"}, { params: { username: username }, withCredentials: true })
            .then((response) => {
                console.log("API Response: ", response.data);
                alert("Role Successfully Toggled.");
                window.location.reload();
            }).catch((error) => {
                console.error("API Error:",error);
                alert("Error: " + error.message);
        });
    }

    return (
        <div>
            <DropMyMenu />
            <b style={{ position: "absolute", color:"SaddleBrown", top: "2%", left: "45%", fontSize: '250%' }}>
                Admin Dashboard
            </b>
            <div style={{position:"absolute", top: "12%", left:"52%"}}>
                <Button style={{fontSize:'150%'}} variant="secondary"  className="bg-amber-600">
                    <Link style={{color:"white"}} to="/Signup">Create New User</Link>
                </Button>
            </div>
            <b style={{position:"absolute", color:"SaddleBrown", top: "12%", left:"20%", fontSize:"185%"}}>
                All Users
            </b>
            <div style={{position:"absolute", top: "20%", left:"19%", maxHeight: "250px", overflowY: "scroll" }}>
                <Table className="w-[1000px]" style={{ fontSize:"175%"}}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[400px] text-left" style={{color:"Black", fontSize:"115%"}}>Username</TableHead>
                            <TableHead className="w-[250px]" style={{color:"Black", fontSize:"115%"}}>Privileges</TableHead>
                            <TableHead style={{color:"Black", fontSize:"115%"}}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) =>
                            <TableRow >
                                <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{user.username}</TableCell>
                                <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{user.role}</TableCell>
                                <TableCell className="text-centered">
                                    <Button onClick={() => toggleAdmin(user.username, user.role)} style={{fontSize:'70%', color:"white"}} variant="secondary" className="bg-amber-600">
                                        Toggle Admin
                                    </Button>
                                    {/*<Button onClick={changePassword} style={{fontSize:'70%', color:"white"}} variant="secondary" className="bg-red-700">
                                        Change Password
                                    </Button>*/}
                                    <Button onClick={() => removeUser(user.username)} style={{fontSize:'70%', color:"white", transform:"translateX(5%)"}} variant="secondary" className="bg-red-700">
                                        Remove User
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <b style={{position:"absolute", color:"SaddleBrown", top: "55%", left:"20%", fontSize:"185%"}}>
                All Carts
            </b>

            <div style={{position:"absolute", top: "55%", left:"52%"}}>
                <Button style={{fontSize:'150%'}} variant="secondary"  className="bg-amber-600">
                    <Link style={{color:"white"}} to="/CreateCart" >Create New Cart</Link>
                </Button>
            </div>
            
            <div style={{position:"absolute", top: "60%", left:"19%", maxHeight: "250px", overflowY: "scroll"}}>
            <Table className="w-[1000px]" style={{fontSize:"175%"}}>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[400px] text-left" style={{color:"Black", fontSize:"115%"}}>Cart</TableHead>
                        <TableHead className="w-[250px]" style={{color:"Black", fontSize:"115%"}}>Airport</TableHead>
                        <TableHead style={{color:"Black", fontSize:"115%"}}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {carts.map((cart) =>
                        <TableRow >
                            <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{cart.cartId}</TableCell>
                            <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{cart.airportCode}</TableCell>
                            <TableCell className="text-centered">
                                <Button style={{fontSize:'70%', color:"white"}} variant="secondary" className="bg-amber-600">
                                    <Link style={{color:"white"}} to={`/ScheduleCart/${cart.cartId}`}>
                                        Create Task
                                    </Link>
                                </Button>
                                <Button onClick={() => removeCart(cart.cartId)} style={{fontSize:'70%', color:"white", transform:"translateX(5%)"}} variant="secondary" className="bg-red-700">
                                    Remove Cart
                                </Button>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            </div>


            <b style={{position:"absolute", color:"SaddleBrown", top: "93%", left:"20%", fontSize:"185%"}}>
                All Locations
            </b>

            <div style={{position:"absolute", top: "93%", left:"52%"}}>
                <Button style={{fontSize:'150%'}} variant="secondary"  className="bg-amber-600">
                    <Link style={{color:"white"}} to="/CreateLocation" >Create New Location</Link>
                </Button>
            </div>
            
            <div style={{position:"absolute", top: "98%", left:"19%", maxHeight: "250px", overflowY: "scroll"}}>
            <Table className="w-[1000px]" style={{fontSize:"175%"}}>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[400px] text-left" style={{color:"Black", fontSize:"115%"}}>Location</TableHead>
                        <TableHead className="w-[240px]" style={{color:"Black", fontSize:"115%"}}>Airport Code</TableHead>
                        <TableHead style={{color:"Black", fontSize:"115%"}}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Airports.map((airport) =>
                        <TableRow >
                            <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{airport.location}</TableCell>
                            <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{airport.airportCode}</TableCell>
                            <TableCell className="text-left">
                                <Button style={{fontSize:'70%', color:"white"}} variant="secondary" className="bg-amber-600">
                                    <Link style={{color:"white"}} to={`/AddDestination/${airport.airportCode}`}>
                                        Add Destination
                                    </Link>
                                </Button>
                                <Button onClick={() => removeAirport(airport.airportCode)} style={{fontSize:'70%', color:"white", transform:"translateX(5%)"}} variant="secondary" className="bg-red-700">
                                    Remove
                                </Button>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            </div>

            <b style={{ position: "absolute", color:"#fffbeb", top: "125%", left: "45%", fontSize: '250%' }}>
                /
            </b>


            
        </div>
    );
}

export default AdminDashboard;
