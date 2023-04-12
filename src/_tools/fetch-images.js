import fs from 'fs-extra'
import fetch from 'node-fetch'

const imageRegex = new RegExp(
  `https:\/\/user-images.githubusercontent.com\/([/0-9a-z.-]*)`,
  'g'
)

var args = process.argv.slice(2);

const fileRegex = new RegExp(
  `https:\/\/github.com\/COVID19Tracking\/${args}\/files\/([^\)])*`,
  'g'
)

const listImages = () =>
  new Promise(async (resolve, reject) => {
    let images = []
    let files = []
    const issues = await fs.readJson('./_data/issues.json')
    const comments = await fs.readJson('./_data/comments.json')
    const getImagesFromBody = (items) => {
      items.forEach((item) => {
        var body  =  ""
        if(item.body){
          body = item.body
        }
        console.log(item.number)
        const results = [...body.matchAll(imageRegex)]
        results.forEach((result) => {
          images.push(result[0])
        })
        const fileResults = [...body.matchAll(fileRegex)]
        fileResults.forEach((result) => {
          files.push(result[0])
        })
      })
    }
    getImagesFromBody(issues)
    getImagesFromBody(comments)
    resolve({ images, files })
  })

const fetchImages = (images) =>
  new Promise(async (resolve, reject) => {
    let current = 0
    const run = async () => {
      if (typeof images[current] === 'undefined') {
        resolve()
        return
      }
      console.log(`${(current / images.length) * 100}% - ${images[current]}`)
      const imagePath = images[current]
        .replace('https://user-images.githubusercontent.com/', '')
        .split('/')
      if (!fs.existsSync(`./src/assets/images/github/${imagePath[0]}`)) {
        fs.mkdirSync(`./src/assets/images/github/${imagePath[0]}`)
      }
      const response = await fetch(images[current])
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await fs.writeFile(
        `./src/assets/images/github/${imagePath.join('/')}`,
        buffer
      )
      current += 1
      run()
    }
    run()
  })

const fetchFiles = (files) =>
  new Promise(async (resolve, reject) => {
    let current = 0
    const run = async () => {
      if (typeof files[current] === 'undefined') {
        resolve()
      }
      console.log(`${(current / files.length) * 100}% - ${files[current]}`)
      const filePath = files[current]
        .replace(fileRegex, '')
        .split('/')
      if (!fs.existsSync(`./src/assets/files/github/${filePath[0]}`)) {
        fs.mkdirSync(`./src/assets/files/github/${filePath[0]}`)
      }
      const response = await fetch(files[current])
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await fs.writeFile(
        `./src/assets/files/github/${filePath.join('/')}`,
        buffer
      )
      current += 1
      run()
    }
    run()
  })
listImages().then(({ images, files }) => {
  fetchImages(images)
  //fetchFiles(files)
})
