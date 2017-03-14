/*
* Global test set up in BrainVerse
* Adapted from spectron tests example:
* https://github.com/electron/spectron/blob/master/test/global-setup.js
*
*/
const Application = require('spectron').Application
const assert = require('assert')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const path = require('path')

global.before(function () {
  chai.should()
  chai.use(chaiAsPromised)
})

exports.getElectronPath = function () {
  let electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
  if (process.platform === 'win32') electronPath += '.cmd'
  return electronPath
}

exports.getAppPath = function () {
  return path.join(__dirname, '..')
}

exports.startApplication = function (options) {
  options.path = exports.getElectronPath()
  options.args = [exports.getAppPath()]
  console.log(options)
  var app = new Application(options)
  return app.start().then(function () {
    assert.equal(app.isRunning(), true)
    chaiAsPromised.transferPromiseness = app.transferPromiseness
    return app
  })
}

exports.stopApplication = function (app) {
  if (!app || !app.isRunning()) return

  return app.stop().then(function () {
    assert.equal(app.isRunning(), false)
  })
}
