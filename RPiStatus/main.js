const mqtt = require('mqtt');
const os = require('os');

// MQTT broker details
const MQTT_BROKER = 'mqtt://mqtt:mqtt@127.0.0.1'; // Replace 'username', 'password', and 'broker-url' with your MQTT credentials and broker URL
const MQTT_CLIENT_ID = 'rpi-mqtt-client';
const QOS = 0;

const client = mqtt.connect(MQTT_BROKER, {
    clientId: MQTT_CLIENT_ID,
    username: 'mqtt', // Replace 'username' with your MQTT username
    password: 'mqtt', // Replace 'password' with your MQTT password
});


client.on('connect', () => {
    console.log('Connected to MQTT broker');

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
        const cpuLoad = os.loadavg()[0];
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const diskUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

        // Publish CPU load
        const cpuLoadPayload = JSON.stringify({ value: cpuLoad });
        client.publish(cpuLoadDiscoveryPayload.state_topic, cpuLoadPayload, { qos: 1});

        // Publish memory usage
        const memoryUsagePayload = JSON.stringify({ value: diskUsage });
        client.publish(memoryUsageDiscoveryPayload.state_topic, memoryUsagePayload, { qos: 1});

        // Publish disk usage
        const diskUsagePayload = JSON.stringify({ value: diskUsage });
        client.publish(diskUsageDiscoveryPayload.state_topic, diskUsagePayload, { qos: 1});
    }, 1000); // Publish every 10 seconds

    // Publish availability status
    setInterval(() => {
        client.publish('homeassistant/sensor/rpi_cpu_load/config', JSON.stringify(cpuLoadDiscoveryPayload), { qos: 1, retain: true });
        client.publish('homeassistant/sensor/rpi_memory_usage/config', JSON.stringify(memoryUsageDiscoveryPayload), { qos: 1, retain: true });
        client.publish('homeassistant/sensor/rpi_disk_usage/config', JSON.stringify(diskUsageDiscoveryPayload), { qos: 1, retain: true });

        const isOnline = true; // Assuming the Raspberry Pi is always online for simplicity
        const availabilityPayload = JSON.stringify({ online: isOnline });
        client.publish(cpuLoadDiscoveryPayload.availability_topic, availabilityPayload, { qos: 1});
        client.publish(memoryUsageDiscoveryPayload.availability_topic, availabilityPayload, { qos: 1});
        client.publish(diskUsageDiscoveryPayload.availability_topic, availabilityPayload, { qos: 1});
    }, 1000); // Publish every 1 minute for availability status
});

client.on('error', (err) => {
    console.error('Error connecting to MQTT broker:', err);
});

client.on('offline', () => {
    console.log('MQTT client offline');
});

client.on('close', () => {
    console.log('MQTT client closed');
});