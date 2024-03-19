const { exec } = require('child_process');

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
            return {
                filesystem,
                size,
                used,
                available,
                percentage,
                mountpoint
            };
        });

        // Pass the disk usage information to the callback function
        callback(null, diskInfo);
    });
}

// Example usage of the getDiskUsage function
getDiskUsage((err, diskInfo) => {
    if (err) {
        console.error('Error getting disk usage:', err);
        return;
    }

    // Display the disk usage information
    console.log('Disk Usage Information:');
    diskInfo.forEach(info => {
        console.log('Filesystem:', info.filesystem);
        console.log('Size:', info.size);
        console.log('Used:', info.used);
        console.log('Available:', info.available);
        console.log('Usage Percentage:', info.percentage);
        console.log('Mountpoint:', info.mountpoint);
        console.log('---------------------------------------');
    });
});
