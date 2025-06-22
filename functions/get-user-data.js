const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    console.log("Function started");
    
    const dataPath = path.join(__dirname, 'data', 'achievements.json');
    console.log("Data file path:", dataPath);
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    console.log("File read successfully");
    
    const fullData = JSON.parse(rawData);
    console.log("Data parsed successfully");
    
    // Check if the file has the expected structure
    if (fullData.users) {
      console.log("Found users section with", Object.keys(fullData.users).length, "users");
      console.log("Usernames:", Object.keys(fullData.users));
      
      // Return only the users section so frontend can access data[username] directly
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(fullData.users)
      };
    } else {
      // Fallback: if no users section, return the full data
      console.log("No users section found, returning full data");
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(fullData)
      };
    }
    
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to load data',
        details: error.message 
      })
    };
  }
};