const express = require('express');
const router = express.Router();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const docClient = DynamoDBDocumentClient.from(client);

router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const customerId = uuidv4();

        await docClient.send(new PutCommand({
            TableName: 'customers',
            Item: {
                customerId,
                name,
                createdAt: new Date().toISOString()
            }
        }));

        res.json({ message: 'Customer registered successfully', customerId });
    } catch (error) {
        console.error('Error registering customer:', error);
        res.status(500).json({ error: 'Failed to register customer' });
    }
});

router.get('/recent', async (req, res) => {
    try {
        const command = new ScanCommand({
            TableName: 'customers',
            Limit: 10,
            ScanIndexForward: false
        });

        const response = await docClient.send(command);
        res.json(response.Items || []);
    } catch (error) {
        console.error('Error fetching recent customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

module.exports = router;