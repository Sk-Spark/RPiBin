#!/bin/bash

# Check if ngrok is already running
if pgrep -x "ngrok" > /dev/null
then
    echo "ngrok is already running."
else
    # Start ngrok in the background
    ngrok http 2019 -auth="admin:admin" > /dev/null 2>&1 &
    echo "Starting ngrok..."    
fi