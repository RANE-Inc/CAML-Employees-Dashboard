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
import {ScrollArea} from '../components/ui/scroll-area';
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

    useEffect(() => {
        axios
            .get('http://localhost:4000/api/allUsers')
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
            .get('http://localhost:4000/api/allCarts')
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
            .get('http://localhost:4000/api/airports')
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
            .delete(`http://localhost:4000/api/deleteUser/${username}`)
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
            .delete(`http://localhost:4000/api/deleteCart/${cartId}`)
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
        alert("To Be Implemented");
        axios
            .delete(`http://localhost:4000/api/deleteLocation/${code}`)
            .then((response) => {
                console.log("API Response: ", response.data);
                alert("Location Succesfully deleted.");
                window.location.reload();
            }).catch((error) => {
                console.error("API Error:",error);
                alert("Error: " + error);
        });
    }

    const toggleAdmin = async(username) => {
        axios
            .patch(`http://localhost:4000/api/toggleAdmin/${username}`)
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
                                    <Button onClick={() => toggleAdmin(user.username)} style={{fontSize:'70%', color:"white"}} variant="secondary" className="bg-amber-600">
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
                            <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{cart.airport}</TableCell>
                            <TableCell className="text-centered">
                                <Button onClick={() => (cart.cartID)} style={{fontSize:'70%', color:"white"}} variant="secondary" className="bg-amber-600">
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
                        <TableHead className="w-[450px] text-left" style={{color:"Black", fontSize:"115%"}}>Location</TableHead>
                        <TableHead className="w-[250px]" style={{color:"Black", fontSize:"115%"}}>Airport Code</TableHead>
                        <TableHead style={{color:"Black", fontSize:"115%"}}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Airports.map((airport) =>
                        <TableRow >
                            <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{airport.location}</TableCell>
                            <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{airport.airportCode}</TableCell>
                            <TableCell className="text-left">
                                <Button onClick={() => removeAirport(airport.airportCode)} style={{fontSize:'70%', color:"white", transform:"translateX(1%)"}} variant="secondary" className="bg-red-700">
                                    Remove Location
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