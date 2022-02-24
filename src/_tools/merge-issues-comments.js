import fs from 'fs-extra'
import { DateTime } from 'luxon'

const comments = fs.readJsonSync('./_data/comments.json')
const issues = fs.readJsonSync('./_data/issues.json')
const timelines = fs.readJsonSync('./_data/timelines.json')

const labels = []

issues.forEach((issue) => {
  const issueTimeline =
    typeof timelines[issue.number] !== 'undefined'
      ? timelines[issue.number]
      : []
  issue.timeline = issueTimeline.sort((a, b) => {
    a.time > b.time ? -1 : 1
  })
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
