const fs = require('fs');
const path = require('path');
const { IAMClient, GetUserCommand } = require('@aws-sdk/client-iam');

// Manually load .env file
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.startsWith('#') || !line.trim()) return;
    
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

// Debug logging
console.log('\nLoaded Environment Variables:');
console.log('AWS_REGION:', envVars.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', envVars.AWS_ACCESS_KEY_ID);
console.log('Secret Key length:', envVars.AWS_SECRET_ACCESS_KEY?.length || 0);

const iamClient = new IAMClient({
    region: envVars.AWS_REGION || 'eu-west-1',
    credentials: {
        accessKeyId: envVars.AWS_ACCESS_KEY_ID,
        secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY
    }
});

async function verifyCredentials() {
    try {
        console.log('\nVerifying AWS credentials...');
        const command = new GetUserCommand({});
        const response = await iamClient.send(command);
        console.log('✅ Credentials are valid!');
        console.log('User:', response.User.UserName);
        console.log('User ID:', response.User.UserId);
        return true;
    } catch (error) {
        console.error('\n❌ Credential verification failed!');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        if (error.$metadata) {
            console.error('HTTP Status Code:', error.$metadata.httpStatusCode);
            console.error('Request ID:', error.$metadata.requestId);
        }
        return false;
    }
}

verifyCredentials().catch(console.error); 