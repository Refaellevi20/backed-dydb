const authService = require('./auth.service')
const logger = require('../../services/logger.service')

async function login(req, res) {
    try {
        const { username, password } = req.body
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { sameSite: 'none', secure: true })
        res.json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

async function signup(req, res) {
    try {
        const { username, password, fullname } = req.body
        console.log('Signup attempt with:', { username, fullname })
        
        if (!username || !password || !fullname) {
            logger.warn('Missing signup details')
            return res.status(400).send({ err: 'Missing required signup information' })
        }

        const account = await authService.signup(username, password, fullname)
        logger.info('New account created:', account)
        
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)
        
        res.cookie('loginToken', loginToken, { 
            sameSite: 'None', 
            secure: true,
            httpOnly: true
        })
        res.json(user)
        
    } catch (err) {
        logger.error('Failed to signup:', err)
        if (err.code === 'NetworkError') {
            return res.status(503).send({ err: 'Service temporarily unavailable' })
        }
        res.status(500).send({ err: err.message || 'Failed to signup' })
    }
}

async function logout(req, res) {
    try {
        // Handle logout even if request body is empty
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        logger.error('Failed to logout ' + err)
        res.status(500).send({ err: 'Failed to logout' })
    }
}

module.exports = {
    login,
    signup,
    logout
}