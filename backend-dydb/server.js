

const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const dbService = require('./services/db.service')
const logger = require('./services/logger.service')
require('dotenv').config()

const app = express()
const http = require('http').createServer(app)

// Express App Config
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
    // Express serve static files on production environment
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    // Configuring CORS for developmentss
    const corsOptions = {
   origin: ['http://127.0.0.1:5173', 'http://localhost:5173',
            'http://127.0.0.1:5174', 'http://localhost:5174',
            'http://127.0.0.1:5175', 'http://localhost:5175',
            'http://127.0.0.1:5176', 'http://localhost:5176',
            'http://127.0.0.1:5177', 'http://localhost:5177',
            'http://127.0.0.1:5178', 'http://localhost:5178',
            'http://127.0.0.1:5179', 'http://localhost:5179',
            'http://127.0.0.1:5180', 'http://localhost:5180',
            'http://127.0.0.1:5181', 'http://localhost:5181',
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}


const authRoutes = require('./api/auth/auth.routes')
const userRoutes = require('./api/user/user.routes')


const setupAsyncLocalStorage = require('./middlewares/setupAls.middleware')
app.all('*', setupAsyncLocalStorage)
const { setupSocketAPI } = require('./services/socket.service')

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)

setupSocketAPI(http)

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/stay/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue-router to take it from there
app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3030

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