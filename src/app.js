const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const request = require('request-promise')

const authKeys = require('./authKeys')
const authRoutes = require('./controllers/auth')
const userRoutes = require('./controllers/user')
const torrentsRoutes = require('./controllers/torrents')
const t411Routes = require('./controllers/t411')
const rarbgRoutes = require('./controllers/rarbg')
const opensubtitlesRoutes = require('./controllers/opensubtitles')

const app = express()

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

app.use(bodyParser.json({ limit: '10mb' }))
app.use(cookieParser())

app.use((req, res, next) => {
  console.info(`[web.component] ${req.method} ${req.originalUrl} from ${req.ip}`)
  next()
})

app.use('/api/auth', authRoutes())
app.use('/api', (req, res, next) => {
  if (req.headers.authorization) {
    req.user = authKeys.get(req.headers.authorization)
  } else if (req.cookies.sso_token) {
    const user = jwt.verify(req.cookies.sso_token, ssoPubKey, { algorithms: ['RS512'] })
    req.user = user.split('@')[0]
    console.log('WE HAVE A USER WEEE', user)
  }
  if (req.user) {
    return next()
  }
  const err = new Error('Authentification failed')
  err.status = 403
  next(err)
})
app.use('/api/user', userRoutes())

app.use('/api/torrents', torrentsRoutes())
app.use('/api/t411', t411Routes())
app.use('/api/rarbg', rarbgRoutes())
app.use('/api/opensubtitles', opensubtitlesRoutes())

app.use(express.static('src/web/public'))

app.use((err, req, res, next) => {
  res.status(err.status || 400)
  res.json({ error: err.message })
  console.error(err.stack)
})

app.listen(7897, '0.0.0.0', () => {
  console.info('[web-component]', 'server running on port', 7897)
})
