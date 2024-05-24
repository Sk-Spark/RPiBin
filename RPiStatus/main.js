const mqtt = require('mqtt');
const os = require('os');
const { exec } = require('child_process');

const publishEvent = false;
const publishError = true;
const publishTrace = true;

// MQTT broker details
const MQTT_BROKER = 'mqtt://mqtt:mqtt@127.0.0.1'; // Replace 'username', 'password', and 'broker-url' with your MQTT credentials and broker URL
const MQTT_CLIENT_ID = 'rpi-mqtt-client';
const QOS = 0;
let CPU_LOAD = 0;
let CPU_DATA_INDEX = 0;

const logEvent = (...args) => {
    if (publishEvent) {
        console.log(...args);
    }
}

const logError = (...args) => {
    if (publishError) {
        console.error(...args);
    }
}

const logTrace = (...args) =>{
    if(publishTrace){
        console.log(...args);
    }
}

const client = mqtt.connect(MQTT_BROKER, {
    clientId: MQTT_CLIENT_ID,
    username: 'mqtt', // Replace 'username' with your MQTT username
    password: 'mqtt', // Replace 'password' with your MQTT password
});

logTrace('Connecting to mqtt broker...');

// Function to get current CPU usage using the "top" command
function getCurrentCpuUsage(callback) {
    // Execute the "top" command to get CPU usage information
    exec('top -bn1 | grep \'Cpu(s)\' | awk \'NR==1{print $2 + $4}\'', (error, stdout, stderr) => {
        if (error) {
            callback(error);
            return;
        }

        if (stderr) {
            callback(new Error(stderr));
            return;
        }

        // Parse the output to extract the CPU usage percentage
        const cpuUsage = parseFloat(stdout.trim());
        logEvent("cpu:",stdout.trim());

        // Pass the current CPU usage percentage to the callback function
        callback(null, cpuUsage);
    });
}

// Function to get disk usage information using the "df" command
function getDiskUsage(callback) {
    // Execute the "df" command to get disk usage information
    exec('df -h /', (error, stdout, stderr) => {
        if (error) {
            callback(error);
            return;
        }

        if (stderr) {
            callback(new Error(stderr));
            return;
        }

        // Parse the "df" command output to extract disk usage information
        const lines = stdout.trim().split('\n');
        const diskInfo = lines.slice(1).map(line => {
            const [filesystem, size, used, available, percentage, mountpoint] = line.trim().split(/\s+/);
            const data = {
                filesystem,
                size,
                used,
                available,
                percentage,
                mountpoint
            };
            return data;
        });

        // Pass the disk usage information to the callback function
        callback(null, diskInfo);
    });
}

setInterval(()=>{
    getCurrentCpuUsage((err, cpuUsage) => {
        if (err) {
            logError('Error getting CPU usage:', err);
            return;
        }
    
        // Display the current CPU usage percentage
        let cpuData = Number(cpuUsage.toFixed(0));
        CPU_LOAD += cpuData;
        CPU_DATA_INDEX +=1;
    });
},1000);

client.on('connect', () => {
    logTrace('Connected to MQTT broker');

    // Publish auto-discovery message for CPU load sensor
    const cpuLoadDiscoveryPayload = {
        unique_id: 'rpi_cpu_load',
        name: 'RPi CPU Load',
        state_topic: 'rpi/cpu/state',
        unit_of_measurement: '%',
        availability_topic: 'rpi/cpu/availability',
    };

    // Publish auto-discovery message for memory usage sensor
    const memoryUsageDiscoveryPayload = {
        unique_id: 'rpi_memory_usage',
        name: 'RPi Memory Usage',
        state_topic: 'rpi/memory/state',
        unit_of_measurement: '%',
        availability_topic: 'rpi/memory/availability',
    };

    // Publish auto-discovery message for disk usage sensor
    const diskUsageDiscoveryPayload = {
        name: 'RPi Disk Usage',
        unique_id: 'rpi_disk_usage',
        state_topic: 'rpi/disk/state',
        unit_of_measurement: '%',
        availability_topic: 'rpi/disk/availability',
    };


    // Publish vital information
    setInterval(() => {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

        // Publish CPU load
        let cpuData = CPU_LOAD / CPU_DATA_INDEX;
        CPU_LOAD = CPU_DATA_INDEX = 0;
        logTrace('CPU Usage:', cpuData.toFixed(0) + '%');
        client.publish(cpuLoadDiscoveryPayload.state_topic, String(cpuData.toFixed(0)), { qos: 1});

        // Publish memory usage
        client.publish(memoryUsageDiscoveryPayload.state_topic, String(Math.round(memoryUsage)), { qos: 1});

        getDiskUsage((err, diskInfo) => {
            if (err) {
                console.error('Error getting disk usage:', err);
                return;
            }
        
            // Display the disk usage information with sizes in KB
            diskInfo.forEach(info => {                
                client.publish(diskUsageDiscoveryPayload.state_topic, String(info.percentage).replace('%',''), { qos: 1});
                logTrace("Memory usage:", info.percentage);
            });
        });

    }, 5000); // Publish every 5 seconds

    // Publish availability status
    setInterval(() => {
        client.publish('homeassistant/sensor/rpi_cpu_load/config', JSON.stringify(cpuLoadDiscoveryPayload), { qos: 1, retain: true });
        client.publish('homeassistant/sensor/rpi_memory_usage/config', JSON.stringify(memoryUsageDiscoveryPayload), { qos: 1, retain: true });
        client.publish('homeassistant/sensor/rpi_disk_usage/config', JSON.stringify(diskUsageDiscoveryPayload), { qos: 1, retain: true });

        client.publish(cpuLoadDiscoveryPayload.availability_topic, "online", { qos: 1});
        client.publish(memoryUsageDiscoveryPayload.availability_topic, "online", { qos: 1});
        client.publish(diskUsageDiscoveryPayload.availability_topic, "online", { qos: 1});
    }, 10000); // Publish every 10 minute for availability status
});

client.on('error', (err) => {
    logError('Error connecting to MQTT broker:', err);
});

client.on('offline', () => {
    logEvent('MQTT client offline');
});

client.on('close', () => {
    logEvent('MQTT client closed');
});