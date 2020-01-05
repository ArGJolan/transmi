const fs = require('fs')
const path = require('path')

class Database {
  constructor (filename) {
    this.filename = path.join(__dirname, filename)
    this.loadfile()
    fs.watchFile(this.filename, () => {
      console.log(`${this.filename} file changed, reloading config...`)
      this.loadfile()
    })
  }

  loadfile () {
    try {
      this.db = JSON.parse(fs.readFileSync(this.filename))
    } catch (e) {
      console.log(e)
      this.db = {}
    }
    console.log(`Loaded config from ${this.filename}`, JSON.stringify(this.db, null, 2))
  }

  has (key) {
    return this.db[key] !== undefined
  }

  all () {
    return this.db
  }

  keys () {
    return Object.keys(this.db)
  }

  get (key, defaultValue) {
    if (key) {
      if (this.has(key)) {
        return this.db[key]
      }
      return defaultValue
    }
    return this.db
  }

  set (key, value) {
    this.db[key] = value
    this._save()
  }

  remove (key) {
    if (this.has(key)) {
      delete this.db[key]
      this._save()
    }
  }

  _save () {
    fs.writeFile(this.filename, JSON.stringify(this.db, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('[database.save] error', err.stack)
      }
    })
  }
}

module.exports = Database
