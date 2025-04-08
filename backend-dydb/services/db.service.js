const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb')
const logger = require('./logger.service')
require('dotenv').config()

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const docClient = DynamoDBDocumentClient.from(client)

async function connect() {
    try {
        // Test connection
        const command = new ScanCommand({
            TableName: 'users',
            Limit: 1
        })
        await docClient.send(command)
        logger.info('Connected to DynamoDB successfully')
    } catch (err) {
        logger.error('Failed to connect to DynamoDB:', err)
        throw err
    }
}

async function getCollection(tableName) {
    return {
        findOne: async (query) => {
            try {
                if (query.username) {
                    // Search by username
                    const command = new ScanCommand({
                        TableName: tableName,
                        FilterExpression: 'username = :username',
                        ExpressionAttributeValues: {
                            ':username': query.username
                        }
                    })
                    const response = await docClient.send(command)
                    return response.Items[0]
                } else {
                    // Search by primary key
                    const command = new GetCommand({
                        TableName: tableName,
                        Key: { user456: query.id || query._id || query }
                    })
                    const response = await docClient.send(command)
                    return response.Item
                }
            } catch (err) {
                logger.error('Failed to find one:', err)
                throw err
            }
        },
        find: async () => {
            try {
                const command = new ScanCommand({
                    TableName: tableName
                })
                const response = await docClient.send(command)
                return response.Items
            } catch (err) {
                logger.error('Failed to find:', err)
                throw err
            }
        },
        insertOne: async (doc) => {
            try {
                const command = new PutCommand({
                    TableName: tableName,
                    Item: {
                        user456: doc.id || doc._id,
                        ...doc
                    }
                })
                await docClient.send(command)
                return doc
            } catch (err) {
                logger.error('Failed to insert:', err)
                throw err
            }
        },
        updateOne: async (query, update) => {
            try {
                const command = new PutCommand({
                    TableName: tableName,
                    Item: {
                        user456: query.id || query._id,
                        ...update.$set
                    }
                })
                await docClient.send(command)
                return update.$set
            } catch (err) {
                logger.error('Failed to update:', err)
                throw err
            }
        }
    }
}

module.exports = {
    connect,
    getCollection
} 