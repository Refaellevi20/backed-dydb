require('dotenv').config()
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const docClient = DynamoDBDocumentClient.from(client)

async function addTestUser() {
    try {
        const hostUser = {
            user456: 'u101',  // Primary key
            fullname: 'shukiy Host',
            imgUrl: 'https://robohash.org/shukiyhost?set=set4',
            username: 'host',
            password: 'secret',
            isOwner: true,
            likedStays: [{ _id: '622f337a75c7d36e498aaaf8' }]
        }

        console.log('Adding test user...')
        await docClient.send(new PutCommand({
            TableName: 'users',
            Item: hostUser
        }))
        console.log('Test user added successfully!')

        // Verify the user was added
        console.log('\nVerifying user was added...')
        const response = await docClient.send(new GetCommand({
            TableName: 'users',
            Key: { user456: 'u101' }
        }))
        console.log('User data:', response.Item)
    } catch (error) {
        console.error('Error:', error)
    }
}

addTestUser() 