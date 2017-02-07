const helpers = require('./global-setup')

describe('Main BrowserWindow Test', function () {
  let app = null

  before(function(){
    return helpers.startApplication({}).then(function (startedApp) {app = startedApp})
  })

  after(function () {
    return helpers.stopApplication(app)
  })

  it('opens a window', function () {
    return app.client.waitUntilWindowLoaded()
      .getWindowCount().should.eventually.equal(1)
  })
  it('gets a title', function () {
    return app.client.waitUntilWindowLoaded()
      .getTitle().should.eventually.equal('BrainVerse')
  })
  it('checks for add-project button', function () {
    return app.client.waitUntilWindowLoaded()
      .isExisting('#addProjectButton').should.eventually.equal(true).then(function(){
        return app.client.getText('#addProjectButton').should.eventually.equal('Add a Project')
      })
  })
  it('checks for add-experiment button', function () {
    return app.client.waitUntilWindowLoaded()
      .isExisting('#addExperimentButton').should.eventually.equal(true).then(function(){
        return app.client.getText('#addExperimentButton').should.eventually.equal('Add an Experiment')
      })
  })
})
