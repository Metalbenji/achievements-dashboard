const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    console.log("Function started");
    
    // Since the data folder is in the same functions directory,
    // we can reference it directly
    const dataPath = path.join(__dirname, 'data', 'achievements.json');
    console.log("Data file path:", dataPath);
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    console.log("File read successfully");
    
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