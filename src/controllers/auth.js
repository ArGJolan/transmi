const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const request = require('request-promise')

const authKeys = require('../authKeys')
const Database = require('../database')

let ssoPubKey

// MDR C'EST TELLEMENT MOCHE NORAJ
const refreshPubKey = () => {
  request(process.env.SSO_GET_PUBKEY_URL).then(key => {
    ssoPubKey = JSON.parse(key).pubKey
    console.log(`WEEE, USING ${ssoPubKey}`)
  }).catch(e => {
    console.error('SOMETHING WENT WRONG XD', e)
  })
}
refreshPubKey()
setInterval(refreshPubKey, 30000)

const authRouter = () => {
  const router = express.Router()
  const db = new Database('db/db-data.json')

  router.post('/', (req, res, next) => {
    var hashed = crypto.createHash('sha1').update(req.body.password).digest('hex')
    const usr = db.get(req.body.name, {})
    if (usr && usr.password === hashed) {
      const key = Math.random().toString(36).substring(2, 22) + Math.random().toString(36).substring(2, 22)
      authKeys.set(key, req.body.name)
      res.json({ key: key })
    } else { next(new Error('Invalid name/password')) }
  })
  router.post('/auto', (req, res, next) => {
    try {
      const username = jwt.verify(req.cookies.sso_token, ssoPubKey, { algorithms: ['RS512'] }).email
      console.log('WE HAVE A USER WEEE', username)
      const key = Math.random().toString(36).substring(2, 22) + Math.random().toString(36).substring(2, 22)
      authKeys.set(key, username)
      if (!db.get(username)) {
        db.set(username, {})
      }
      res.json({ key: key })
    } catch (e) {
      next(new Error('Auth went wrong'))
    }
  })
  router.delete('/', (req, res, next) => {
    const userkey = authKeys.get(req.headers.authorization)
    authKeys.del(userkey)
    res.json({})
  })

  return router
}

module.exports = authRouter
