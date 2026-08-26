const https = require('https');

const data = JSON.stringify({
    password: "ganesh"
});

const options = {
    hostname: 'wcyf-app.onrender.com',
    port: 443,
    path: '/api/migrate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
