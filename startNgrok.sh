#!/bin/bash

# Check if ngrok is already running
if pgrep -x "ngrok" > /dev/null
then
    echo "ngrok is already running."
else
    # Start ngrok in the background
    # ngrok http 2019 -auth="admin:admin" > /dev/null
    ngrok http 8902 --domain=boa-fast-kite.ngrok-free.app --basic-auth="admin:admin@rpisrv" --config="/home/spark/.ngrok2/ngrok.yml" &
    echo "Starting ngrok..."    
fi

#ngrok http --domain=boa-fast-kite.ngrok-free.app 80