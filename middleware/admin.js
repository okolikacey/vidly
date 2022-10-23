require('dotenv').config()
const jwt = require('jsonwebtoken')

const jwtPrivateKey = process.env.JWTPRIVATEKEY

function admin(req, res, next){
    if(!req.user.isAdmin) return res.status(403).send('Access denied')
    next();
}

module.exports = admin;