# brainverse
Brainverse is an open-source, cross-platform desktop application to enable researchers add to reproducible practices into every project.

- An electronic laboratory notebook built as a cross platform desktop application also has feature to be deployed as web application 
- Enables users to plan experiments, collect, analyze and reuse data, and collaborate
- Adds semantic annotation to data with relevant metadata based on NeuroImaging data Model (NIDM) making experimental neuroimaging study more reproducible, and making data FAIR
- Intercept the research workflow at planning stage, curating (raw, processed, results) data at the source and helping users to annotate every step of the process.

## The App
Dashboard:
![brainverse_dashboard](https://github.com/ReproNim/brainverse/blob/master/eapp/public/images/BrainVerse_dashboard.png)

NDA Editor:
![curate_NDA](https://github.com/ReproNim/brainverse/blob/master/eapp/public/images/CurateNDA.png)

Experiment Planner:
![experiment_planner](https://github.com/ReproNim/brainverse/blob/master/eapp/public/images/ExperimentPlanner.png)

Data Acquisition:
![data_acquisition](https://github.com/ReproNim/brainverse/blob/master/eapp/public/images/DataAcquisition.png)

## Installation
The App for different OSes can be found in the [releases here](https://github.com/ReproNim/brainverse/releases)
### macOS
- Download the `.dmg` file
- Double click on the dmg file
- Drag the app icon to the Application folder, it will start installing
- To start the app, double click on the app icon in the Application folder
- All the files created are stored outside the Brainverse App folder under /Users/username/Documents/uploads.

### Linux
- Debian and Ubuntu
  - Download the `.deb` file.
  - Run `sudo dpkg -i BrainVerse.deb && sudo apt-get install --fix-missing`.
  - Run `brainverse` in a terminal, or double-click the app icon.
- CentOS, Fedora, RedHat
  - Download the `.rpm` file.
  - Run `sudo dnf install BrainVerse.rpm` or `sudo yum install BrainVerse.rpm`.
  - Run `brainverse` in a terminal, or double-click the app icon.
- Other distributions
  - Download the `.AppImage`.
  - Execute the file in a terminal or double-click it in a file explorer.

### Windows
- Download and run the `.exe` file. Follow the steps to install the software. Once the app is installed, double-click the app icon to run BrainVerse.

## Status
BrainVerse is under rapid development with core functionality being added.

If you want to contribute, set up development enviroment or understand the project internals, see [CONTRIBUTING.md](CONTRIBUTING.md)

You can track the different [modules](https://github.com/ReproNim/brainverse/projects) that are being aimed/developed within BrainVerse.

### Code Status
[![Travis tests status](https://travis-ci.org/ReproNim/brainverse.svg?branch=master)](https://travis-ci.org/ReproNim/brainverse) travis-ci.org (master branch)

### Support and Communication
If you would like to ask a question about how to do something in BrainVerse please open a new topic in [NeuroStars.org](https://neurostars.org/) with a brainverse tag. NeuroStars.org is a platform similar to StackOverflow but dedicated to neuroinformatics.

If you see an issue or a bug while using BrainVerse, please create an issue in this github repository and assign a label of the module it belongs to.

The BrainVerse updates and news will be posted to repronim-announcement mailing list. To receive BrainVerse news, subscribe to the [mailing-list](https://www.nitrc.org/mailman/listinfo/repronim-announcement).


## Learning Resources

- [Electron and its API](http://electron.atom.io)
- [Bootstrap](http://getbootstrap.com)
- [jQuery](https://jQuery.com)
- [Resource Description Framework](https://www.w3.org/TR/2014/NOTE-rdf11-primer-20140225/)
- [Turtle](https://www.w3.org/TR/turtle/)
- [PROV-DM](https://www.w3.org/TR/prov-dm/)
- [NeuroImaging Data Model(NIDM)](http://nidm.nidash.org/)
