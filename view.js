#!/usr/bin/env node
'use strict';

const meow = require('meow')
const path = require('path')
const fs = require('fs')

const cpy = require('cpx').copySync
const readPkg = require('read-pkg-up').sync


const config = require('pkg-conf').sync('x0')
const pkg = readPkg({cwd: __dirname}).pkg

const dev = require('@compositor/x0/lib/dev')

const cli = meow(`
	Usage
	  $ view <report_dir>
      -p --port       Port for dev server
	
	Examples
	  $ view ./mdxreport -p 9999
`, {
  flags: {
    port: {
      type: 'string',
      alias: 'p'
    },
  }
});


let file
if (cli.input.length === 1 && cli.input[0]) {
  file = cli.input[0]
} else {
  console.log(cli.help);
  process.exit(0)
}


let monitorDir = path.join(__dirname, 'monitor');

console.log(monitorDir, path.join(__dirname, 'component'))

cpy(path.join(__dirname, 'component', '*.js'), monitorDir)
cpy(path.join(file, '*'), monitorDir)

const input = path.resolve(monitorDir)
const stats = fs.statSync(input)
const dirname = stats.isDirectory() ? input : path.dirname(input)
const filename = stats.isDirectory() ? null : input

const opts = Object.assign({
  input,
  dirname,
  filename,
  stats,
  outDir: 'dist',
  basename: '',
  scope: {},
  pkg,
}, config, cli.flags)


dev(opts)
  .then(({server}) => {
    const {port} = server.options
    const url = `http://localhost:${port}`
    console.error('visitor ', url)
  })
  .catch((e) => {
    console.error(e)
    process.exit(0)
  })
