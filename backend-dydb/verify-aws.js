require('dotenv').config()
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb')

console.log('Environment Variables:')
console.log('AWS_REGION:', process.env.AWS_REGION)
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Present' : 'Missing')
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Present' : 'Missing')

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const docClient = DynamoDBDocumentClient.from(client)

async function testConnection() {
    try {
        const command = new ScanCommand({
            TableName: 'users',
            Limit: 1
        })
        const response = await docClient.send(command)
        console.log('Connection successful!')
        console.log('Response:', response)
    } catch (error) {
        console.error('Connection failed:', error)
    }
}

testConnection() 