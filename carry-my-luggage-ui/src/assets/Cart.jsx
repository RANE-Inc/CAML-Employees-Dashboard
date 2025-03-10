import React from 'react';
import {Link, useParams} from 'react-router-dom';
import { Button } from "../components/ui/button";
import DropMyMenu from '../components/ui/dropMyMenu';
import {Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,} from "../components/ui/card";
import axios from 'axios';
import { useState, useEffect } from 'react';

function CameraStream(props) {

    // Using a modified example from
    // https://gitlab.freedesktop.org/gstreamer/gst-plugins-rs/-/tree/main/net/webrtc/gstwebrtc-api

    // TODO: Spinner
    // TODO: Fullscreen
    // TODO: WebRTC client name based on current session (user_id? session_id?)

    const signalingProtocol = window.location.protocol.startsWith("https") ? "wss" : "ws";
    const gstWebRTCConfig = {
        meta: { name: `WebClient-${Date.now()}` },
        signalingServerUrl: `${signalingProtocol}://127.0.0.1:8443`,
    };

    const api = new GstWebRTCAPI(gstWebRTCConfig);

    const streamListener = {
        producerAdded: (producer) => {
            if(producer.meta.name == null || producer.meta.name != props.cartId) return;

            const parentElement = document.getElementById("camera-stream");
            const videoElement = parentElement.getElementsByTagName("video")[0];

            const session = api.createConsumerSession(producer.id);

            if(session) {

                parentElement._consumerSession = session;

                session.addEventListener("error", (event) => {
                    if(parentElement._consumerSession === session) {
                        console.error(event.message, event.error);
                    }
                });

                session.addEventListener("closed", () => {
                    if(parentElement._consumerSession === session) {
                        videoElement.pause();
                        videoElement.srcObject = null;
                        parentElement.classList.remove("streaming");
                        delete parentElement._consumerSession;
                    }
                });

                session.addEventListener("streamsChanged", () => {
                    if(parentElement._consumerSession === session) {
                        const streams = session.streams;
                        if(streams.length > 0) {
                            videoElement.srcObject = streams[0];
                            videoElement.play().catch(() => {});
                        }
                    }
                });

                parentElement.classList.add("streaming");
                session.connect();
            }
        },
        producerRemoved: (producer) => {
            if(producer.meta.name == null || producer.meta.name != props.cartId) return;

            const parentElement = document.getElementById("camera-stream");

            if(parentElement._consumerSession) {
                parentElement._consumerSession.close();
            }
        }
    };

    useEffect(() => {
        api.registerProducersListener(streamListener); // Register a listener in case a new producers get added/removed
        for (const producer of api.getAvailableProducers()) { // Go through existing producers
            streamListener.producerAdded(producer);
        }
    }, []);

    // FIXME: Styling
    // FIXME: Add CSS rule to set display: none on the spinner class when camera-stream has the class "streaming"
    return(
        <div id="camera-stream" style={{backgroundColor: "black", width: "800px", height: "600px"}}>
            <div id="spinner">
                <span style={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "white"}}>Camera stream currently unavailable.</span>
            </div>
            <video muted={true} style={{width:"100%", height:"100%"}}></video>
        </div>
    );
}

function Cart(){

    const [cart, setCart] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);

    const { cartId } = useParams();

    console.log("Cart ID: ", cartId);

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

    console.log("Cart ID: ", cartId);

        useEffect(() => {
            axios
                .get('http://localhost:4000/api/taskFind', {params: {cartId: cartId}|| {}})
                .then((response) => {
                    console.log("API Response:", response.data); // Debug API data
                    setTasks(response.data);
                })
                .catch((error) => {
                    console.error("API Error:", error);
                    setError("Failed to fetch tasks. Please try again later.");
                });
    }, []);

    // const cart = {cartNum:'1' ,airport:'YOW', battery: 50, status:'Moving To', Location:'Gate 1', timeRem:30};

    return(

        <div>
            <DropMyMenu/>

            <div className="flex gap-4">
                <CameraStream cartId={cartId}/>
                <Card className="bg-amber-400" style={{fontFamily:'Kanit', position:"fixed", top:"15%", left:'30%'}}>
                    <CardTitle style={{paddingTop:'3%', fontSize:'225%'}}>
                        Cart {cart.cartNum}
                    </CardTitle>
                    <CardContent className='text-left' style={{paddingTop:'8%', fontSize:'150%'}}>
                        Airport: {cart.airport}
                    </CardContent>
                    <CardContent className='text-left' style={{fontSize:'150%'}}>
                        Battery: {cart.battery}
                    </CardContent>
                    <CardContent className='text-left' style={{fontSize:'150%'}}>
                        Status: {cart.status} {cart.Location}
                    </CardContent>
                    <CardContent className='text-left' style={{fontSize:'150%'}}>
                        Time Remaining: {cart.timeRem} Minutes
                    </CardContent>
                    <div style={{paddingTop:'10%', paddingBottom:'5%'}}>
                        <Button style={{fontSize:'150%', color:"white"}} variant="secondary"  className="bg-amber-600">
                            <Link style={{color:"white"}} to={`/ScheduleCart/${cart.cartId}`}>
                                Schedule Cart {cart.cartNum}
                            </Link>
                        </Button>
                    </div>
                </Card>
                <div
                    style={{
                        position: "fixed",
                        top: "18%",
                        left: "55%",
                        overflowY: "scroll",
                        maxHeight: "calc(100vh - 10%)",
                    }}
                    className="grid p-5 grid-cols-1"
                >
                    {error ? (
                        <p>{error}</p>
                    ) : tasks && tasks.length > 0 ? (
                        tasks.map((task) => (
                            <div key={task.taskID} className="max-w-xs text-left">
                                <Card className="bg-amber-400 h-[180px] w-[360px]">
                                    <CardTitle style={{ paddingLeft: "7%", paddingTop: "3%", fontSize: "160%" }}>
                                        Task {task.taskID}
                                    </CardTitle>
                                    <CardContent style={{ paddingTop:'3%', paddingBottom: "2%", fontSize: "110%" }}>
                                        Task Start Time: {task.taskTime}
                                    </CardContent>
                                    <CardContent style={{ paddingBottom: "1%", fontSize: "110%" }}>
                                        Start Location: {task.startPoint}
                                    </CardContent>
                                    <CardContent style={{ paddingBottom: "2%", fontSize: "110%" }}>
                                        Destination: {task.airportLoc}
                                    </CardContent>
                                    <CardContent style={{ paddingBottom: "2%", fontSize: "110%" }}>
                                        Status: {task.status}
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <p>Loading tasks or no tasks available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Cart;
