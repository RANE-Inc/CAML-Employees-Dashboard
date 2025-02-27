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
                setError("Failed to fetch carts. Please try again later.");
            });
    }, []);

    return (
        <div>
            <DropMyMenu />
            <b style={{ position: "fixed", color:"SaddleBrown", top: "2%", left: "45%", fontSize: '250%' }}>
                Admin Dashboard
            </b>
            <div style={{position:"fixed", top: "12%", left:"45%"}}>
                <Button style={{fontSize:'150%'}} variant="secondary"  className="bg-amber-600">
                    <Link style={{color:"white"}} to="/Signup">Create New User</Link>
                </Button>
            </div>
            <b style={{position:"fixed", color:"SaddleBrown", top: "12%", left:"20%", fontSize:"185%"}}>
                All Users
            </b>
            <Table className="w-[890px]" style={{position:"fixed", top: "20%", left:"19%", fontSize:"175%"}}>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[400px] text-left" style={{color:"Black", fontSize:"115%"}}>Username</TableHead>
                        <TableHead className="w-[250px]" style={{color:"Black", fontSize:"115%"}}>Privileges</TableHead>
                        <TableHead style={{color:"Black", fontSize:"115%"}}>Toggle Admin</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) =>
                        <TableRow >
                            <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{user.username}</TableCell>
                            <TableCell className="text-left font-medium" style={{color:"SaddleBrown", fontSize:"110%"}}>{user.role}</TableCell>
                            <TableCell className="text-centered" style={{}}>
                                <Button style={{fontSize:'70%', color:"white"}} variant="secondary"  className="bg-amber-600">
                                    Toggle
                                </Button>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>


            
        </div>
    );
}

export default AdminDashboard;