# Rclone WebUI

<p float="left">
  <img src="./public/android-chrome-192x192.png" alt="Rclone WebUI Logo" width="192" height="192" />
  <img src="./rclone-webui-text-759x192.png" alt="Rclone WebUI Logo" width="506" height="128" />
</p>

![GitHub](https://img.shields.io/github/license/controlol/rclone-webui)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/controlol/rclone-webui/Update%20Release%20V1.0?label=Build%20Release)
![GitHub top language](https://img.shields.io/github/languages/top/controlol/rclone-webui)

## Description
This WebUI for Rclone is a intuitive and easy way to access information about your Rclone transfers.

#### What is Rclone
Rclone is a command line program to manage files on cloud storage. It is a feature rich alternative to cloud vendors' web storage interfaces. [Over 40 cloud storage products](https://rclone.org/#providers) support rclone including S3 object stores, business & consumer file storage services, as well as standard transfer protocols. You can take a look at the project [here](https://rclone.org/)

### Features
- General stats from current rcd session
- View active running jobs and their transfers
- Browse the history of succesful transferred files
- View list of remotes
- View list of mounted remotes
- Darkmode (autodetect)
- View configured settings
- System info

### Roadmap
Currently the WebUI only acts as a instrument to view active jobs and a history of completed transfers. 
##### Version 1.1 (November 10 2021)
In this version I plan to add configurable global settings for rclone. Apart from viewing the settings, which is currently possible, you will be able to set most of the [global flags](https://rclone.org/flags/) using the WebUI.

##### Version 1.2 (December 1 2021)
In the release of version 2.0 it will be possible to browse remotes. It will even be possible to browse two remotes or local folders at the same time! Allowing you to copy or move files from one to the other.

##### Version 1.3 (December 20 2021)
In this release it will be possible to upload files to a remote from your web browser.

##### Version 1.4/2.0 (January 10 2022)
The endgoal is to support syncing files automatically on a schedule using cronjobs on linux. This last feature (for now) will require a secondary API and cannot run with Rclone alone, therefor this feature is most pushed back.

## Usage
Start Rclone remote control server
```
rclone rcd --rc-web-gui --rc-user <YOURUSER> --rc-pass <YOURPASS> --rc-web-fetch-url=https://api.github.com/repos/controlol/rclone-webui/releases/latest
```
If you are on a headless machine you can add the argument `--rc-web-gui-no-open-browser` so Rclone won't try to open a browser.

## Screenshots

### Lightmode
<img src="./screenshots/desktop-light.png" alt="Rclone WebUI Light" />

### Darkmode
<img src="./screenshots/desktop-dark.png" alt="Rclone WebUI Dark" />

### Mobile views
<p float="left">
  <img src="./screenshots/iPhone-X-light.png" alt="Rclone WebUI Mobile Light" width="300"/>
  <img src="./screenshots/iPhone-X-dark.png" alt="Rclone WebUI Mobile Dark" width="300"/>
</p>

## Used in other projects
This project is also used in [gdrive-rclone-docker#webui](https://github.com/controlol/gdrive-rclone-docker/tree/webui)

## Installation
Alternatively you can manually download the WebUI locally and specify the location of the files.

Download package from [here](https://github.com/controlol/rclone-webui/releases/download/v1.0/rclone-webui-release-V1.0.zip) and place the contents in a folder and remember it's location, I like to use /webui because I will be running this in a docker container.
```
curl https://github.com/controlol/rclone-webui/releases/download/v1.0/rclone-webui-release-V1.0.zip > rclone-webui-release-V1.0.zip
unzip rclone-webui-release-V1.0.zip
cp build /webui
rclone rcd --rc-web-gui --rc-user <YOURUSER> --rc-pass <YOURPASS> /webui
```

You can see the last argument is the folder where you placed the WebUI earlier. This is the same as specifying `--rc-files=/webui`. More documentation on rcd is available [here](https://rclone.org/rc).<br/>


## Building from source

#### Prerequisites
To build the site you are expected to have npm and nodejs installed and have a active internet connection.

#### Build

Get the source files
```
git clone https://github.com/controlol/rclone-webui
cd rclone-webui
```

Install dependencies
`npm ci`

Build the project
`npm run build`

The WebUI should have been build in the build folder. Copy the files to a location you can easily access or use the build directory as the source for your rclone rcd.
