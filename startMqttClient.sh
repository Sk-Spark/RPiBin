log_file="/home/spark/bin/RPiBin/mqtt_logfile.log"

/home/spark/.nvm/versions/node/v18.17.1/bin/node /home/spark/bin/RPiBin/RPiStatus/main.js 1>"$log_file" 2>&1 &
echo "PID: $!"
