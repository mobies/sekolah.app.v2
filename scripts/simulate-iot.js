const crypto = require('crypto');

// Simulated IoT Device Config
const SECRET = 'development_iot_secret_key';
const SUBDOMAIN = 'sman1jkt';
const API_URL = 'http://localhost:3000/api/iot/attendance'; // Change to production URL later

async function sendMockScan() {
    const timestamp = Date.now().toString();
    
    // Payload representing an RFID scan
    const payload = {
        deviceId: "GATE_A_IN",
        scanData: "uuid-user-12345", // The scanned RFID tag or user ID
        type: "IN"
    };
    
    const bodyString = JSON.stringify(payload);
    
    // Generate HMAC signature
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(bodyString);
    const signature = hmac.digest('hex');

    console.log(`Sending scan data... Signature: ${signature}`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-school-subdomain': SUBDOMAIN,
                'x-iot-timestamp': timestamp,
                'x-iot-signature': signature
            },
            body: bodyString
        });

        const data = await response.json();
        console.log('Response:', response.status, data);
    } catch (error) {
        console.error('Failed to send:', error);
    }
}

sendMockScan();
