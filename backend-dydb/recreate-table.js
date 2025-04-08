require('dotenv').config()
const { DynamoDBClient, DeleteTableCommand, CreateTableCommand, waitUntilTableNotExists } = require('@aws-sdk/client-dynamodb')

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

async function recreateTable() {
    try {
        // Delete existing table
        console.log('Deleting existing table...')
        try {
            await client.send(new DeleteTableCommand({ TableName: 'users' }))
            console.log('Table deleted')
        } catch (err) {
            console.log('No table to delete')
        }

        // Wait a bit
        console.log('Waiting...')
        await new Promise(resolve => setTimeout(resolve, 10000))

        // Create new table with correct structure
        console.log('Creating new table...')
        const command = new CreateTableCommand({
            TableName: 'users',
            AttributeDefinitions: [
                { AttributeName: 'user456', AttributeType: 'S' }
            ],
            KeySchema: [
                { AttributeName: 'user456', KeyType: 'HASH' }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        })

        await client.send(command)
        console.log('Table created successfully!')
    } catch (error) {
        console.error('Error:', error)
    }
}

recreateTable() 