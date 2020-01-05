const express = require('express')

const OpenSubtitles = require('opensubtitles-api')

const torrentRouter = () => {
  const router = express.Router()
  let tokenPromise = null

  const getToken = () => {
    if (!tokenPromise) {
      const os = new OpenSubtitles({
        useragent: 'Popcorn Time NodeJS',
        username: '',
        password: '',
        ssl: true
      })
      tokenPromise = os.login().then(() => {
        setTimeout(() => {
          tokenPromise = null
        }, 1000 * 60 * 10)
        return os
      }).catch(err => {
        tokenPromise = null
        return Promise.reject(err)
      })
    }
    return tokenPromise
  }

  router.post('/search', (req, res, next) => {
    getToken()
      .then(os => {
        return os.search({
          sublanguageid: 'eng,fre',
          query: req.body.search,
          limit: 5
        }).then(subtitles => {
          return [].concat(subtitles.en || [], subtitles.fr || [])
        })
      })
      .then(res.json.bind(res))
      .catch(error => {
        return next(error)
      })
  })

  return router
}

module.exports = torrentRouter
