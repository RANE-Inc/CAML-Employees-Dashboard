import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import DropMyMenu from "../components/ui/dropMyMenu";

function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [pwConfirm, setPwConfirm] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (password !== pwConfirm) {
            setError("Passwords do not match!");
            return;
        }

        axios.post("http://localhost:4000/register", { username, password })
            .then(() => navigate("/Locations"))
            .catch(() => setError("Signup failed. Try again."));
    };

    return (
        <div style={{ fontFamily: "Kanit", position: "fixed", top: "20%", left: "37%" }}>
            <div style={{ fontSize: "250%" }}>Welcome To</div>
            <div style={{ fontSize: "250%" }}>CAML Autonomous Mobility Lift</div>

            <form className="grid grid-cols-1" style={{ paddingTop: "5%" }} onSubmit={handleSubmit}>
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

                <div style={{ paddingTop: "7%" }}>
                    <input
                        style={{ fontSize: "140%" }}
                        className="bg-amber-200"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                </div>

                <div style={{ paddingTop: "3%" }}>
                    <input
                        style={{ fontSize: "140%" }}
                        className="bg-amber-200"
                        type="password"
                        value={pwConfirm}
                        onChange={(e) => setPwConfirm(e.target.value)}
                        placeholder="Confirm Password"
                    />
                </div>

                {error && <p style={{ color: "red", paddingTop: "2%" }}>{error}</p>}

                <div style={{ paddingTop: "8%" }}>
                    <Button style={{ fontSize: "150%" }} variant="secondary" className="bg-amber-600" type="submit">
                        Sign Up
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default Signup;