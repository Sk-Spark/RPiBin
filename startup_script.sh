#!/bin/bash
# This is a simple startup script for Raspberry Pi

# Specify the path to your log file 
log_file="/home/spark/bin/RPiBin/logfile.log"

exec 3>&1 1>>"$log_file" 2>&1
echo -e "--------------------------------"
trap "echo 'ERROR: An error occurred during execution, check log $log_file for details.' >&3" ERR
trap '{ set +x; } 2>/dev/null; echo -ne "\n[$(date -u)] \n"; set -x' DEBUG

# Add your commands here

#Starting ngrok
source /home/spark/bin/RPiBin/startNgrok.sh 
#/home/spark/bin/RPiBin/startNgrok.sh

# Start IOT Dashboard
# source /home/spark/bin/RPiBin/startIotDashBoard.sh 

# Start MQTT Client
source /home/spark/bin/RPiBin/startMqttClient.sh

# Reboot Script
/home/spark/bin/RPiBin/rebootHandler

# End of script
echo -e "Start up script execution completed!!!\n--------------------------------"
