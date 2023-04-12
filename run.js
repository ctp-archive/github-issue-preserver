const execSync = require('child_process').execSync;

const arg = process.argv[2]

execSync('rm -rf _data/* public/ src/assets/files/github/* src/assets/images/github/*')
execSync('node ./src/_tools/fetch-issues.js ' + arg + ' && node ./src/_tools/merge-issues-comments.js', {stdio:[0, 1, 2]});
execSync('node ./src/_tools/fetch-images.js ' + arg, {stdio:[0, 1, 2]});
execSync('node ./src/_tools/fetch-files.js ' + arg, {stdio:[0, 1, 2]});
execSync('npm run-script build', {stdio:[0,1,2]});