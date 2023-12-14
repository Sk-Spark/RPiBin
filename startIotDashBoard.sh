#!/bin/bash

# Define the port and project directory
PORT=5000
APP_DIR="/home/spark/projs/rpi-srv"

# Check if the port is in use
if netstat -tuln | grep ":$PORT\b" ; then
  echo "Port $PORT is in use. Cannot start the React app."
else
  echo "Port $PORT is free. Starting the React app."

 # Change to the app directory
  cd "$APP_DIR" || exit 1

  # Start the React app in the background
  npm start > /dev/null 2>&1 &

  echo "React app started in the background."
fi
