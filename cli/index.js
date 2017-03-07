const changeCase = require('change-case')
const parseFiles = require('./parse-files')
const resolveFiles = require('./resolve-files')
const nodeWatch = require('node-watch')
const path = require('path')
const fs = require('fs')
const mustache = require('mustache')

const getResults = (results, ignore) => {
  return resolveFiles(results, ignore)
      .then(files => {
        return parseFiles(files)
      })
}

module.exports = {
  run ({
        port = false,
        results = '',
        ignore = [],
        save = '',
        title = 'Xunit Viewer',
        watch = false
    }) {
    title = changeCase.title(title)
    results = results || process.cwd()
    if (!path.isAbsolute(results)) results = path.resolve(process.cwd(), results)

    if (watch) {
      watch = nodeWatch(results)
      watch.on('change', (filename) => {
        getResults(results, ignore)
          .then(results => {
            console.log(results)
          })
          .catch(err => {
            console.error(err.file, '\n', err.message)
          })
      })
    } else {
      let template = fs.readFileSync(path.resolve(__dirname, 'template.html')).toString()
      mustache.parse(template)
      let script = fs.readFileSync(path.resolve(__dirname, '../component/index.min.js')).toString()
      let output = mustache.render(template, {
        style: '{ #root { background-color: red; } }',
        title,
        script
      })
      fs.writeFileSync('index.html', output)
    }
  }
}
