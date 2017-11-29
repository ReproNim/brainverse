# brainverse

## For MacOS User
- Download the App (DMG file) from the [Dropbox link](https://www.dropbox.com/s/41fx3ufnrej1d02/BrainVerse-0.0.1.dmg?dl=0)
- Double click on the dmg file
- Drag the app icon to the Application folder, it will start installing
- To start the app, double click on the app icon in the Application folder
- All the files created are stored outside the Brainverse App folder under /Users/username/Documents/uploads.

## To use BrainVerse as Web app
- Type '127.0.0.1:3000/' in your browser
- Login using your GitHub credentials
- To access any html page in eapp/public/html in your browser, type '127.0.0.1:3000/HTMLFileName.html'
- The REST API for the app is in the eapp/routes directory

## For Developers

## Requirements
* [Node.js](https://nodejs.org/en/download/) (which comes with npm) installed on your computer.

* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

This app is being developed and tested with NodeJS v8.9.1, npm 5.5.1 and git 2.11.0 on macOS Sierra version 10.12.6.

## To Begin

```bash
# Clone this repository
git clone https://github.com/ReproNim/brainverse.git
# Go into the repository
cd brainverse

# Install devDependencies and dependencies listed in the package.json - e.g. electron, bootstrap and jQuery
npm install

# App Configuration
# Go to eapp/config
cd eapp/config

# Fill in app-config.js using your favorite editor
# Note you should not commit app-config.js as it contains clientId and secretKey
vim app-config.js

# Get clientId and secretKey from GitHub by registering this App
# Go to this [link](https://developer.github.com/apps/building-integrations/setting-up-and-registering-oauth-apps/registering-oauth-apps/) and follow the steps.
# use the following values:
# Application Name: brainverse
# Homepage URL: https://github.com/ReproNim/brainverse
# Authorization callback URL: http://127.0.0.1:3000/auth/github/callback

# Run the app
npm start
```

## Learning Resources

- [Electron and its API](http://electron.atom.io)
- [Bootstrap](http://getbootstrap.com)
- [jQuery](https://jQuery.com)
- [Resource Description Framework](https://www.w3.org/TR/2014/NOTE-rdf11-primer-20140225/)
- [Turtle](https://www.w3.org/TR/turtle/)
- [PROV-DM](https://www.w3.org/TR/prov-dm/)
- [NeuroImaging Data Model(NIDM)](http://nidm.nidash.org/)
