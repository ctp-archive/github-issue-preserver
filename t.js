const fs = require('fs')
const r = JSON.parse(fs.readFileSync('./src/_data/issues.json').toString())
r.find((a) => a.number === 1094).history.forEach((a) => console.log(a))
