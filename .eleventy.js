require('dotenv').config()
const markdownIt = require('markdown-it')
const { DateTime } = require('luxon')
const linkify = require('linkify-it')()

const md = new markdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

const imageRegex = new RegExp('https://user-images.githubusercontent.com', 'g')
const fileRegex = new RegExp(
  'https://github.com/COVID19Tracking/issues/files',
  'g'
)
const userRegex = new RegExp('@([/0-9a-z.-]*)', 'g')

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('./src/sass/')
  eleventyConfig.addPassthroughCopy('./src/assets')

  eleventyConfig.addFilter('markdown', (content) => {
    return md.render(content.replace('/\\r\\n/g', '/\n/\n'))
  })

  eleventyConfig.addFilter('ghimage', (content) => {
    return content
      .replace(imageRegex, '../assets/images/github')
      .replace(fileRegex, '../assets/files/github')
  })

  eleventyConfig.addFilter('ghuser', (content) => {
    return content.replace(userRegex, '<strong>@$1</strong>')
  })

  eleventyConfig.addFilter(
    'ghdate',
    (date) =>
      `${DateTime.fromISO(date).toLocaleString(
        DateTime.DATE_FULL
      )} at ${DateTime.fromISO(date)
        .toLocaleString(DateTime.TIME_SIMPLE)
        .toLowerCase()}`
  )

  return {
    dir: {
      input: 'src',
      output: 'public',
    },
  }
}
