const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    console.log("Function started");
    
    const dataPath = path.join(__dirname, 'data', 'achievements.json');
    console.log("Data file path:", dataPath);
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    console.log("File read successfully");
    
    const data = JSON.parse(rawData);
    console.log("Data parsed successfully, entries:", Object.keys(data).length);
    
    // Debug: Log all usernames in the data
    const usernames = Object.keys(data);
    console.log("All usernames in data:", usernames);
    
    // Debug: Log a sample entry structure
    if (usernames.length > 0) {
      const firstUser = usernames[0];
      console.log("Sample user structure:", firstUser, "->", JSON.stringify(data[firstUser], null, 2));
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data)
    };
    
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