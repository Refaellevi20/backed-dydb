require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const readline = require('readline');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'eu-west-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const docClient = DynamoDBDocumentClient.from(client);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function promptUser() {
    return new Promise((resolve) => {
        rl.question('Enter username: ', (username) => {
            rl.question('Enter password: ', (password) => {
                rl.question('Enter full name: ', (fullname) => {
                    resolve({ username, password, fullname });
                    rl.close();
                });
            });
        });
    });
}

async function addUser() {
    try {
        const userData = await promptUser();
        const userId = uuidv4();
        
        // Create user object with required user456 field
        const user = {
            user456: userId,  // This is the required primary key
            username: userData.username,
            password: userData.password,
            fullname: userData.fullname,
            createdAt: new Date().toISOString()
        };

        // Add to DynamoDB
        await docClient.send(new PutCommand({
            TableName: 'users',
            Item: user
        }));

        console.log('\n✅ User added successfully!');
        
        // Verify user was added
        const response = await docClient.send(new GetCommand({
            TableName: 'users',
            Key: { user456: userId }
        }));

        console.log('\nUser in database:');
        console.log(JSON.stringify(response.Item, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

addUser(); 