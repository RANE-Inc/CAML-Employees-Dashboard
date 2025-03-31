import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axiosInstance';
import sandMap from '../components/ui/sandbox1.jpeg';


function OccupancyGridMap(props) {
    const [mapData, setMapData] = useState(null);
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        // Fetch initial map data
        const fetchMapData = async () => {
            try {
                const response = api.get('/api/map', {params: {cartId: props.cartId}});
                if (!response.ok) {
                    throw new Error('Failed to fetch map data');
                }
                const data = await response.json();
                setMapData(data);
            } catch (error) {
                console.log('Error fetching map data:', error);
                setError('Error fetching map data. Please try again later.');
            }
        };
        fetchMapData();

        // Listen for real-time updates
        // socket.on('mapData', (data) => {
        //     setMapData(data);
        // });

        // Cleanup socket listener on unmount
        // return () => socket.off('mapData');
    }, []);

    useEffect(() => {
        if (!mapData || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const { width, height, data } = mapData.info;
        canvas.width = width;
        canvas.height = height;

        const imageData = ctx.createImageData(width, height);

        // Color mapping for different states
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            let color;

            // Mapping occupancy values to colors
            if (value === -1) {
                color = 200;  // Unknown (grayish)
            } else if (value === 100) {
                color = 0;    // Occupied (black)
            } else {
                color = 255;  // Free (white)
            }

            // Set pixel values
            imageData.data[i * 4] = color;       // R
            imageData.data[i * 4 + 1] = color;   // G
            imageData.data[i * 4 + 2] = color;   // B
            imageData.data[i * 4 + 3] = 255;     // A (fully opaque)
        }

        ctx.putImageData(imageData, 0, 0);
    }, [mapData]);

    // Optionally, you can handle window resizing (if required)
    useEffect(() => {
        const handleResize = () => {
            if (!canvasRef.current || !mapData) return;
            const canvas = canvasRef.current;
            const { width, height } = mapData.info;

            // Resize canvas dynamically based on window size
            canvas.width = Math.min(window.innerWidth, width);
            canvas.height = Math.min(window.innerHeight, height);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [mapData]);

    return (
        <div style={{position:'absolute', top:'62%', left: '75%'}}>
            <b style={{fontSize:"200%", color:"SaddleBrown"}}>
                Map of Cart
            </b>
            <div style={{position:'relative', height:'160%', width:'160%'}}>
                <img src={sandMap}></img>
            </div>
        </div>
    );
}

export default OccupancyGridMap;
