const fs = require('fs')
const path = require('path')

const {
  TRANSMI_USERNAME,
  TRANSMI_PASSWORD,
  TRANSMI_DB_PATH = './src/db/db-data.json'
} = process.env

if (!TRANSMI_USERNAME || !TRANSMI_PASSWORD) {
  console.error('User or password not provided')
  process.exit(1)
}

let db = {}

try {
  db = JSON.parse(fs.readFileSync(path.resolve(TRANSMI_DB_PATH)))
} catch (e) {
  console.log('Could not load db, gonna create a new one...')
}

if (db[TRANSMI_USERNAME]) {
  console.log('User already in database, editing password...')
} else {
  db[TRANSMI_USERNAME] = {}
}

db[TRANSMI_USERNAME].password = TRANSMI_PASSWORD

fs.writeFileSync(path.resolve(TRANSMI_DB_PATH), JSON.stringify(db, null, 2))

console.log(`Written ${path.resolve(TRANSMI_DB_PATH)} with ${JSON.stringify(db, null, 2)}`)
