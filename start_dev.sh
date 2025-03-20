#!/usr/bin/env bash

# env variables moved to .env file

parallel --line-buffer << RunDev
mongod --dbpath ./backend/db                # MongoDB
sleep 5; npm --prefix backend start         # Backend after 5s (ensure mongo is up)
npm --prefix carry-my-luggage-ui run dev    # Frontend
#gst-webrtc-signalling-server                # WebRTC Signalling server (freedesktop gitlab currently down)
RunDev
