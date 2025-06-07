// Function to calculate distance between two coordinates in kilometers using the Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees) {
    return degrees * (Math.PI/180);
}

// Function to format duration in a human-readable format
export function formatDuration(startTime, endTime) {
    const duration = (new Date(endTime) - new Date(startTime)) / 1000; // in seconds
    
    if (duration < 60) {
        return `${Math.round(duration)} seconds`;
    } else if (duration < 3600) {
        return `${Math.round(duration/60)} minutes`;
    } else {
        const hours = Math.floor(duration/3600);
        const minutes = Math.round((duration % 3600) / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
}
