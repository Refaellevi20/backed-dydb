const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const { v4: uuidv4 } = require('uuid')
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
const utilService = require('../../services/util.service')

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const docClient = DynamoDBDocumentClient.from(client)

module.exports = {
    query,
    getById,
    getByUsername,
    remove,
    update,
    add,
    updateUserCount
}

async function query(filterBy = {}) {
    try {
        const collection = await dbService.getCollection('users')
        const users = await collection.find()
        return users.map(user => {
            delete user.password
            return user
        })
    } catch (err) {
        logger.error('Cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ id: userId })
        delete user.password
        return user
    } catch (err) {
        logger.error(`While finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ 
            TableName: 'users',
            FilterExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': username
            }
        })
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('users')
        await collection.findOne({ Key: { id: userId } })
    } catch (err) {
        logger.error(`Cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        const collection = await dbService.getCollection('users')
        const userToSave = {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            password: user.password,
            imgUrl: user.imgUrl,
            count: user.count,
            isOwner: user.isOwner || false
        }
        await collection.findOne({ 
            Key: { id: user.id },
            UpdateExpression: 'set username = :u, fullname = :f, imgUrl = :i, count = :c, isOwner = :o',
            ExpressionAttributeValues: {
                ':u': userToSave.username,
                ':f': userToSave.fullname,
                ':i': userToSave.imgUrl,
                ':c': userToSave.count,
                ':o': userToSave.isOwner
            }
        })
        return userToSave
    } catch (err) {
        logger.error(`Cannot update user ${user.id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // Validate that username is not taken
        const existingUser = await getByUsername(user.username)
        if (existingUser) throw new Error('Username already taken')

        // Generate unique user ID
        const userId = utilService.makeId()
        
        const collection = await dbService.getCollection('users')
        const userToAdd = {
            id: userId,
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            imgUrl: user.imgUrl || 'https://res.cloudinary.com/dmxsqwvwv/image/upload/v1705834574/default-user-profile_nqnj3k.png',
            isOwner: false,
            count: 0
        }

        await collection.insertOne(userToAdd)
        delete userToAdd.password
        return userToAdd
        
    } catch (err) {
        logger.error('Failed to add user', err)
        throw err
    }
}

async function updateUserCount(userId) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ id: userId })
        if (!user) {
            throw new Error('User not found')
        }
        const updatedCount = (Number(user.count) || 0) + 1
        await collection.findOne({
            Key: { id: userId },
            UpdateExpression: 'set count = :c',
            ExpressionAttributeValues: {
                ':c': updatedCount
            }
        })
        return { ...user, count: updatedCount }
    } catch (err) {
        logger.error(`Failed to update user count for user ${userId}`, err)
        throw err
    }
}




