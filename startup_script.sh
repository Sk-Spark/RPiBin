#!/bin/bash

# This is a simple startup script for Raspberry Pi

# Specify the path to your log file 
log_file="/home/spark/bin/RPiBin/logfile.log"

# Capture timestamp 
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# Add your commands here

# Execute another .sh file (replace 'other_script.sh' with the actual filename)
#Starting ngrok
source /home/spark/bin/RPiBin/startNgrok.sh >> "$log_file" 2>&1
#/home/spark/bin/RPiBin/startNgrok.sh

# Start IOT Dashboard
source /home/spark/bin/RPiBin/startIotDashBoard.sh >> "$log_file" 2>&1

# Reboot Script
/home/spark/bin/RPiBin/rebootHandler 2>&1

# Add more commands as needed

# End of script
