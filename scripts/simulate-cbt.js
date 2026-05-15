const crypto = require('crypto');

// Simulated CBT Server Config
const SECRET = 'development_cbt_secret_key';
const SUBDOMAIN = 'sman1jkt';
const API_URL = 'http://localhost:3000/api/external/cbt-sync'; 

async function sendCbtRequest(payload) {
    const timestamp = Date.now().toString();
    const bodyString = JSON.stringify(payload);
    
    // Generate HMAC signature
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(bodyString);
    const signature = hmac.digest('hex');

    console.log(`Sending CBT Request [${payload.action}]...`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-school-subdomain': SUBDOMAIN,
                'x-cbt-timestamp': timestamp,
                'x-cbt-signature': signature
            },
            body: bodyString
        });

        const data = await response.json();
        console.log(`Response Status: ${response.status}`);
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Failed to send:', error);
    }
}

// 1. Simulate Fetching Students
async function runSimulation() {
    console.log("--- Simulating FETCH_STUDENTS ---");
    await sendCbtRequest({ action: 'FETCH_STUDENTS' });
    
    console.log("\n--- Simulating PUSH_GRADES ---");
    await sendCbtRequest({
        action: 'PUSH_GRADES',
        data: [
            { userId: "uuid-user-1", examId: "EXAM-MATH-001", subject: "Mathematics", score: 85.5 },
            { userId: "uuid-user-2", examId: "EXAM-MATH-001", subject: "Mathematics", score: 92.0 },
        ]
    });
}

runSimulation();
