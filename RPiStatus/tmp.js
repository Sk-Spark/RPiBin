const { exec } = require('child_process');

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

        // Pass the current CPU usage percentage to the callback function
        callback(null, cpuUsage);
    });
}

// Example usage of the getCurrentCpuUsage function
getCurrentCpuUsage((err, cpuUsage) => {
    if (err) {
        console.error('Error getting CPU usage:', err);
        return;
    }

    // Display the current CPU usage percentage
    console.log('Current CPU Usage:', cpuUsage.toFixed(2) + '%');
});
