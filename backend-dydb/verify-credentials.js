require('dotenv').config()

console.log('Checking environment variables:')
console.log('AWS_REGION:', process.env.AWS_REGION)
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID)
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Present' : 'Missing')

const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb')

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

async function verifyConnection() {
    try {
        console.log('\nTesting AWS connection...')
        const command = new ListTablesCommand({})
        const response = await client.send(command)
        console.log('Connection successful! Tables:', response.TableNames)
    } catch (error) {
        console.error('Connection error:', error)
    }
}

verifyConnection() 