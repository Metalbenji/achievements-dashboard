const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    console.log("Function started");
    
    // Try multiple path approaches for Netlify compatibility
    const possiblePaths = [
      './data/achievements.json',
      path.join(process.cwd(), 'data/achievements.json'),
      path.join(__dirname, '../data/achievements.json')
    ];
    
    let rawData;
    let successfulPath;
    
    for (const dataPath of possiblePaths) {
      try {
        console.log("Trying path:", dataPath);
        rawData = fs.readFileSync(dataPath, 'utf8');
        successfulPath = dataPath;
        console.log("Successfully read file from:", successfulPath);
        break;
      } catch (error) {
        console.log("Failed to read from:", dataPath, "Error:", error.message);
        continue;
      }
    }
    
    if (!rawData) {
      throw new Error("Could not find achievements.json in any expected location");
    }
    
    const data = JSON.parse(rawData);
    console.log("Data parsed successfully, entries:", Object.keys(data).length);
    
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