#!/usr/bin/env bash

# env variables moved to .env file

parallel --line-buffer << RunDev
mongod --quiet --dbpath ./backend/db        # MongoDB
sleep 3; npm --prefix backend start         # Backend after 5s (ensure mongo is up)
RunDev
