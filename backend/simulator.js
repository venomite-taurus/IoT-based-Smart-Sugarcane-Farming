const http = require('http');

const nodes = ['node1', 'node2', 'node3'];

function generateRandomData(node) {
  // Base ranges
  const baseTemp = 25;
  const baseHum = 60;
  const baseSoil = 50;

  return {
    temperature: (baseTemp + (Math.random() * 10 - 3)).toFixed(1),
    humidity: (baseHum + (Math.random() * 20 - 10)).toFixed(1),
    soil_moisture: (baseSoil + (Math.random() * 30 - 10)).toFixed(1),
    rain: Math.random() > 0.9 ? 1 : 0, // 10% chance of rain
    node: node
  };
}

function sendData(node) {
  const data = JSON.stringify(generateRandomData(node));

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/data',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => {
      responseBody += chunk;
    });
    res.on('end', () => {
      console.log(`[Simulator] Sent data for ${node}: ${res.statusCode} ${responseBody}`);
    });
  });

  req.on('error', (error) => {
    console.error(`[Simulator] Error sending data for ${node}:`, error.message);
  });

  req.write(data);
  req.end();
}

console.log("Starting IoT Simulator...");
// Send initial data immediately
nodes.forEach(sendData);

// Then every 5 seconds
setInterval(() => {
  nodes.forEach(sendData);
}, 5000);
