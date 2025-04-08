require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const dbService = require('./services/db.service')
const logger = require('./services/logger.service')
const { Server } = require('socket.io')

const app = express()
const http = require('http').createServer(app)

// Express App Config
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// CORS configuration
const corsOptions = {
    origin: [
        'http://backend-dydb-app-2025.s3-website-eu-west-1.amazonaws.com',
        'http://localhost:5173',
        'http://localhost:3030'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin']
}

app.use(cors(corsOptions))

// Enable pre-flight across-the-board
app.options('*', cors(corsOptions))

const authRoutes = require('./api/auth/auth.routes')
const userRoutes = require('./api/user/user.routes')

const setupAsyncLocalStorage = require('./middlewares/setupAls.middleware')
app.all('*', setupAsyncLocalStorage)
const { setupSocketAPI } = require('./services/socket.service')

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)

// Socket.IO configuration
const io = new Server(http, {
    cors: corsOptions
})

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
}

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/stay/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue-router to take it from there
app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3035

async function startServer() {
    try {
        await dbService.connect()
        http.listen(PORT, () => {
            logger.info(`Server is running on port: ${PORT}`)
            logger.info(`Server is running in ${process.env.NODE_ENV} mode`)
        })
    } catch (err) {
        logger.error('Cannot connect to DB', err)
        process.exit(1)
    }
}

startServer()