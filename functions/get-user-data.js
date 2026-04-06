const fs = require('fs');
const path = require('path');

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    console.log("Function started");
    
    // Parse the request body to get the username
    let username = '';
    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        username = body.username;
        console.log("Requested username:", username);
      } catch (parseError) {
        console.error("Error parsing request body:", parseError);
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: 'Invalid request body' 
          })
        };
      }
    }
    
    if (!username) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Username is required' 
        })
      };
    }
    
    const dataPath = path.join(__dirname, 'data', 'achievements.json');
    console.log("Data file path:", dataPath);
    
    const rawData = await fs.promises.readFile(dataPath, 'utf8');
    console.log("File read successfully");
    
    const fullData = JSON.parse(rawData);
    console.log("Data parsed successfully");
    
    // Check if the file has the expected structure
    if (!fullData.users) {
      console.error("No users section found in data");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid data structure - no users section found' 
        })
      };
    }
    
    if (!fullData.achievements) {
      console.error("No achievements section found in data");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid data structure - no achievements section found' 
        })
      };
    }
    
    console.log("Available users:", Object.keys(fullData.users));
    
    // Look for the user (case-insensitive)
    const usernames = Object.keys(fullData.users);
    const foundUsername = usernames.find(u => u.toLowerCase() === username.toLowerCase());
    
    if (!foundUsername) {
      console.log(`User "${username}" not found`);
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: `No achievement data found for user "${username}".` 
        })
      };
    }
    
    console.log(`Found user: ${foundUsername}`);
    
    // Convert the user data to match frontend expectations
    const userProgress = {
      UnlockedAchievements: fullData.users[foundUsername].unlockedAchievements || [],
      Counters: fullData.users[foundUsername].counters || {}
    };
    
    // Return data in the format the frontend expects
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        achievements: fullData.achievements,
        userProgress: userProgress
      })
    };
    
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to load data'
      })
    };
  }
};
