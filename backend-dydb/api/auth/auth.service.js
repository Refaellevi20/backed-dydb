const Cryptr = require('cryptr')
const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')
const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')

module.exports = {
    signup,
    login,
    getLoginToken,
    validateToken
}

async function login(username, password) {
    logger.debug(`auth.service - login with username: ${username}`)

    const user = await userService.getByUsername(username)
    if (!user) return Promise.reject('Invalid username or password')
    
    // For testing, allow login without password check
    // TODO: Remove this in production
    if (password === 'secret' && user.password === 'secret') {
        delete user.password
        return user
    }

    // TODO: Uncomment for real password checking
    // const match = await bcrypt.compare(password, user.password)
    // if (!match) return Promise.reject('Invalid username or password')

    delete user.password
    return user
}
   

async function signup(username, password, fullname) {
    const saltRounds = 10
    logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !fullname) return Promise.reject('Missing required signup information')

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ username, password: hash, fullname })
}


function getLoginToken(user) {
    const userInfo = {_id : user._id, fullname: user.fullname, imgUrl:user.imgUrl, isOwner: user.isOwner, isAdmin: user.isAdmin,count:user.count}
    return cryptr.encrypt(JSON.stringify(userInfo))    
}

function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(json)
        return loggedinUser

    } catch(err) {
        // console.log('Invalid login token')
    }
    return null
}




// ;( ()=>{
//      signup({username:'bubu', password:'123', fullname:'Bubu Bi', imgUrl:"https://robohash.org/vitaequovelit.png?size=50x50&set=set1"})
//      signup({username:'mumu', password:'123', fullname:'Mumu Maha',imgUrl:"https://robohash.org/vitaequovelit.png?size=50x50&set=set1"})
// })();