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
        // In Netlify, functions run from a different root. We need to navigate
        // from the function's directory back to the project root and then to the data file.
        const dataPath = path.join(__dirname, '..', 'achievement-dashboard/data/achievements.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const allData = JSON.parse(rawData);

        // Find the user's data (case-insensitive search on object keys)
        const normalizedUsername = username.toLowerCase();
        const users = allData.users;
        const userKey = Object.keys(users).find(key => key.toLowerCase() === normalizedUsername);
        const userData = userKey ? users[userKey] : null;

        if (!userData) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found. Please check the username and try again.' }),
            };
        }

        // Return the specific user's data AND the master list of achievements,
        // transforming the user data to match the frontend's expected format (PascalCase).
        return {
            statusCode: 200,
            body: JSON.stringify({
                userProgress: {
                    Counters: userData.counters || {},
                    UnlockedAchievements: userData.unlockedAchievements || [],
                    LastUpdated: userData.lastUpdated || new Date().toISOString()
                },
                achievements: allData.achievements
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
