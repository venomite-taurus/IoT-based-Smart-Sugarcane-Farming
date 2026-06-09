const { execSync, spawn } = require('child_process');
const path = require('path');

// Start the server on port 3001
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname),
  env: { ...process.env, PORT: '3001' },
  stdio: 'inherit', // Let's see the server output
  detached: true
});

// Wait for server to boot up
setTimeout(() => {
  try {
    console.log("--- TEST 1: Valid Inputs (node1) ---");
    const test1 = execSync('curl.exe -s -X POST http://localhost:3001/api/data -H "Content-Type: application/json" -d "{\\"temperature\\": 27.5, \\"humidity\\": 65, \\"soil_moisture\\": 42, \\"rain\\": 0, \\"node\\": \\"node1\\"}"').toString();
    console.log(test1);

    console.log("\\n--- TEST 1B: Valid Inputs (node2) ---");
    const test1b = execSync('curl.exe -s -X POST http://localhost:3001/api/data -H "Content-Type: application/json" -d "{\\"temperature\\": 28.2, \\"humidity\\": 62, \\"soil_moisture\\": 38, \\"rain\\": 1, \\"node\\": \\"node2\\"}"').toString();
    console.log(test1b);

    console.log("\\n--- TEST 1C: Valid Inputs (node3) ---");
    const test1c = execSync('curl.exe -s -X POST http://localhost:3001/api/data -H "Content-Type: application/json" -d "{\\"temperature\\": 26.8, \\"humidity\\": 70, \\"soil_moisture\\": 45, \\"rain\\": 0, \\"node\\": \\"node3\\"}"').toString();
    console.log(test1c);

    console.log("\\n--- TEST 2: Invalid Node Name (node5) ---");
    const test2 = execSync('curl.exe -s -X POST http://localhost:3001/api/data -H "Content-Type: application/json" -d "{\\"temperature\\": 27.5, \\"humidity\\": 65, \\"soil_moisture\\": 42, \\"rain\\": 0, \\"node\\": \\"node5\\"}"').toString();
    console.log(test2);

    console.log("\\n--- TEST 3: Missing Node Name ---");
    const test3 = execSync('curl.exe -s -X POST http://localhost:3001/api/data -H "Content-Type: application/json" -d "{\\"temperature\\": 27.5, \\"humidity\\": 65, \\"soil_moisture\\": 42, \\"rain\\": 0}"').toString();
    console.log(test3);

    console.log("\\n--- TEST 4: Invalid Rain Value (2) ---");
    const test4 = execSync('curl.exe -s -X POST http://localhost:3001/api/data -H "Content-Type: application/json" -d "{\\"temperature\\": 27.5, \\"humidity\\": 65, \\"soil_moisture\\": 42, \\"rain\\": 2, \\"node\\": \\"node1\\"}"').toString();
    console.log(test4);

  } catch (err) {
    console.error("Test failed:", err.message);
  } finally {
    if (process.platform === 'win32') {
      try {
        execSync(`taskkill /pid ${serverProcess.pid} /t /f`);
      } catch (e) {}
    } else {
      try {
        process.kill(-serverProcess.pid);
      } catch (e) {}
    }
  }
}, 3000);
