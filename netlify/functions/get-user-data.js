const fs = require('fs');
const path = require('path');

exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { username } = JSON.parse(event.body);

        if (!username) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Username is required' }),
            };
        }

        // Construct the path to the JSON file from the project root
        const dataPath = path.join(__dirname, '..', 'achievement-dashboard/data/achievements.json');
        console.log("Data file path:", dataPath); // Log the constructed path

        let rawData;
        try {
            rawData = fs.readFileSync(dataPath, 'utf-8');
            console.log("Successfully read data file.");
        } catch (fileError) {
            console.error("Error reading data file:", fileError);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to read achievement data file' }),
            };
        }

        let allData;
        try {
            allData = JSON.parse(rawData);
            console.log("Successfully parsed JSON data.");
        } catch (parseError) {
            console.error("Error parsing JSON data:", parseError);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Invalid format in achievement data file' }),
            };
        }

        // Find the user's data (case-insensitive search on object keys)
        const normalizedUsername = username.toLowerCase();
        const users = allData.users;
        const userKey = Object.keys(users).find(key => key.toLowerCase() === normalizedUsername);
        const userData = userKey ? users[userKey] : null;
        console.log("User data found:", !!userData); // Log if user data was found

        if (!userData) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found. Please check the username and try again.' }),
            };
        }        

        return {
            statusCode: 200,
            body: JSON.stringify({
                userProgress: {
                    Counters: userData.counters || {},
                    UnlockedAchievements: userData.unlockedAchievements || [],
                    LastUpdated: userData.lastUpdated || new Date().toISOString(),
                },
                achievements: allData.achievements,
            }),
        };
    } catch (error) {
        console.error('Error in get-user-data function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' }),
        };
    }
};
