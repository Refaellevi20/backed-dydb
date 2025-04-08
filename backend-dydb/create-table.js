require('dotenv').config()
const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb')

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

async function createTable() {
    try {
        const command = new CreateTableCommand({
            TableName: 'users',
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' }
            ],
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        })

        console.log('Creating table...')
        const response = await client.send(command)
        console.log('Table created successfully:', response)
    } catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log('Table already exists')
        } else {
            console.error('Error creating table:', error)
        }
    }
}

createTable()