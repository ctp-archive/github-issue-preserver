import dotenv from 'dotenv'
import fs from 'fs-extra'
import fetch from 'node-fetch'
import {RateLimiter} from 'limiter'

dotenv.config()

let issues = []
let comments = []
let timelines = {}
var args = process.argv.slice(2);

const headers = {
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
}

const limits = new RateLimiter({ tokensPerInterval: 120, interval: "minute"})

const getGithubIssues = () =>
  new Promise(async (resolve, reject) => {
    let page = 0
    const getIssues = async () => {
      console.log(`Fetch github issues page ${page}`)
      const remainingRequests = await limits.removeTokens(1);

      const result = await fetch(
        `https://api.github.com/repos/COVID19Tracking/${args}/issues?page=${page}&state=all&per_page=100`,
        {
          headers,
        }
      ).then((response) => response.json())
      if (result.message) {
        console.log(result.message)
      }
      if (result.length > 0) {
        result.forEach((issue) => {
          if (
            issues.filter((existing) => existing.number === issue.number)
              .length === 0
          ) {
            issues.push(issue)
          }
        })
        page += 1
        getIssues()
      } else {
        console.log(`Done with ${issues.length} github issues`)
        resolve()
      }
    }
    getIssues()
  })

const getGithubComments = () =>
  new Promise(async (resolve, reject) => {
    let page = 0
    const getComments = async () => {
      console.log(`Fetch github comments page ${page}`)
      const remainingRequests = await limits.removeTokens(1);
      const result = await fetch(
        `https://api.github.com/repos/COVID19Tracking/${args}/issues/comments?page=${page}&per_page=100`,
        {
          headers,
        }
      ).then((response) => response.json())
      if (result.message) {
        console.log(result.message)
      }
      if (result.length > 0) {
        result.forEach((comment) => {
          if (
            comments.filter((existing) => existing.id === comment.id).length ===
            0
          ) {
            comments.push(comment)
          }
        })
        page += 1
        getComments()
      } else {
        console.log(`Done with ${comments.length} github comments`)
        resolve()
      }
    }
    getComments()
  })

const getGithubTimeline = () =>
  new Promise(async (resolve, reject) => {
    let current = 0
    let page = 1

    const getTimeline = async (page, currentissue = current) => {
      if (typeof issues[currentissue] === 'undefined') {
        resolve(timelines)
        return
      }
      console.log(`Fetch github timeline for issue ${issues[currentissue].number}, page ${page}`)
      const remainingRequests = await limits.removeTokens(1);
      const result = await fetch(issues[currentissue].timeline_url + "?per_page=100&page=" + page.toString(), {
        headers,
      })
        .then((response) => response.json())
        .catch((error) => {
          console.log(error)
          setImmediate(() => {
            setTimeout(() => {
     //         current += 1
              getTimeline(page)
            })
          })
        })
      if (!result) {
        return
      }

      if (!timelines[issues[currentissue].number])
      {
        timelines[issues[currentissue].number] = []
      }

      timelines[issues[currentissue].number] = timelines[issues[currentissue].number].concat(result)

      if (result.length === 100) {
        page += 1
        getTimeline(page, currentissue)
      }

      setImmediate(() => {
        current += 1
        getTimeline(1)
      })
    }

    getTimeline(page)
  })

getGithubIssues().then(() => {
  fs.writeJSONSync('./_data/issues.json', issues)
  getGithubTimeline(issues).then(() =>
    fs.writeJSONSync('./_data/timelines.json', timelines)
  )
})

getGithubComments().then(() =>
  fs.writeJSONSync('./_data/comments.json', comments)
)
