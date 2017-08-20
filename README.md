# brainverse
## For Developers

## Requirements
- [Node.js](https://nodejs.org/en/download/) (which comes with npm) installed on your computer

- Git

## To Begin
```bash
# Clone this repository
git clone https://github.com/ReproNim/brainverse.git
# Go into the repository
cd brainverse

# Install devDependencies and dependencies listed in the package.json - e.g. electron, bootstrap and jQuery
npm install

# App Configuration
# Go to eapp/config and create app-config.js
cd eapp/config
cp ref-config.js app-config.js

# Add cliendId and secretKey to app-config.js file

# Run the app
npm start
```
## To Use as Web app
- Type '127.0.0.1:3000/' in your browser
- To access any html page in eapp/public/html in your browser, type '127.0.0.1:3000/HTMLFileName.html'
- The REST API for the app is in the eapp/routes directory

## For OSX User
- Download the App (zipped file) from the Dropbox link
https://www.dropbox.com/s/6tomk4kpiqqjswt/BrainVerse-darwin-x64v0.2.zip?dl=0
- Unzip the folder
- To start the app, double click on the app
- All the files created are stored inside the Brainverse App folder under Contents/Resources/app/uploads. To check the files created, right click on the Brainverse app icon> Click on 'Show Package Contents'


## Learning Resources

- [Electron and its API](http://electron.atom.io)
- [Bootstrap](http://getbootstrap.com)
- [jQuery](https://jQuery.com)
- [Resource Description Framework](https://www.w3.org/TR/2014/NOTE-rdf11-primer-20140225/)
- [Turtle](https://www.w3.org/TR/turtle/)
- [PROV-DM](https://www.w3.org/TR/prov-dm/)
- [NeuroImaging Data Model(NIDM)](http://nidm.nidash.org/)
