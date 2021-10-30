# Rclone WebUI

<p float="left">
  <img src="./public/android-chrome-192x192.png" alt="Rclone WebUI Logo" width="192" height="192" />
  <img src="./rclone-webui-text-759x192.png" alt="Rclone WebUI Logo" width="759" height="192" />
</p>

![GitHub](https://img.shields.io/github/license/controlol/rclone-webui)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/controlol/rclone-webui/Update%20Release%20V1.0?label=Build%20Release)
![GitHub top language](https://img.shields.io/github/languages/top/controlol/rclone-webui)

## Description
A simple information panel showing you all you need to know about your Rclone instance. 
### Features
- General stats from current rcd session
- View active running jobs and their transfers
- Browse the history of succesful transferred files
- View list of remotes
- View list of mounted remotes
- Darkmode (autodetect)
- View configured settings
- System info

#### Info about each Job
- Total job speed
- ETA for job and elapsed time
- Job total size and transferred size
- Speed for each file
- Size of each file
- ETA of each file

#### What is Rclone
Rclone is a open source tool to transfer files from your local system to many types of cloud hosted storage. You can take a look at the project [here](https://rclone.org/)

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
