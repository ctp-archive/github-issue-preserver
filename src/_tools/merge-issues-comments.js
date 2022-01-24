import fs from 'fs-extra'

const comments = fs.readJsonSync('./_data/comments.json')
const issues = fs.readJsonSync('./_data/issues.json')

const labels = []

issues.forEach((issue) => {
  issue.comments = comments.filter((comment) => comment.issue_url === issue.url)
  issue.labels.forEach((label) => {
    if (!labels.find((existing) => existing.id === label.id)) {
      labels.push({ ...label, issues: [] })
    }
    labels[
      labels.findIndex((existing) => existing.id === label.id)
    ].issues.push(issue)
  })
})

fs.writeJsonSync('./src/_data/issues.json', issues)
fs.writeJsonSync('./src/_data/labels.json', labels)
