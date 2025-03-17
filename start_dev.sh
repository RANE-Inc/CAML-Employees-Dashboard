#!/usr/bin/env bash

export MONGODB_URL="mongodb://localhost:27017"
export PORT_1=2000
export PORT_2=4000

parallel --line-buffer << RunDev
mongod --dbpath ./backend/db                # MongoDB
sleep 5; npm --prefix backend start         # Backend after 5s (ensure mongo is up)
npm --prefix carry-my-luggage-ui run dev    # Frontend
#gst-webrtc-signalling-server                # WebRTC Signalling server (freedesktop gitlab currently down)
RunDev
