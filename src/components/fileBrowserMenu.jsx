import React, { Component, Fragment } from 'react'
import { Checkbox, Cross, PopupContainer, PopupTitle } from '../styled'
import API from '../utils/API'
import FileBrowser from './fileBrowser'
import { BrowserSettingButton, FileBrowserRemotes, FileBrowsersContainer, FileBrowserSettings, FileBrowserWrapper, FileSettingsPopup, FileSettingsHeader, FileColumnSettingsContainer, RemoteButton } from './fileBrowser.styled'
import assert from 'assert'
import path from 'path'

import BrowserSingle from '../assets/icons/browserSingle.svg'
import BrowserDual from '../assets/icons/browserDual.svg'
import SettingsCog from '../assets/icons/settings-cog.svg'

class FileBrowserMenu extends Component {
  constructor() {
    super()
    this.state = {
      files: [
        [{
          // Name: "heyhey.mp4",
          // Size: 400000000,
          // isDir: false
        }],
        [{}]
      ],
      currentPath: ["", ""],
      browserFs: ["", ""],
      loading: [false, false],
      errMessage: "",
      dualBrowser: false,
      activeBrowser: 0,
      showFileSettings: false,
      shownColumns: {
        size: true,
        date: false,
        datetime: false
      },
      windowWidth: 1920
    }
  }

  componentDidMount = () => {
    const browserFs = JSON.parse(sessionStorage.getItem("browserFs")),
          currentPath = JSON.parse(sessionStorage.getItem("currentPath")),
          shownColumns = JSON.parse(localStorage.getItem("shownbrowsercolumns"))

    if (shownColumns !== null) this.setState({ shownColumns })

    const tempPath = currentPath[0]
    currentPath[0] = ""

    this.setState({ browserFs, currentPath, windowWidth: window.innerWidth })

    // add click event listener for closing settings
    window.addEventListener('click', this.handleWindowClick)
    window.addEventListener("orientationchange", this.handleOrientationChange)

    setTimeout(() => {
      this.getFiles(0, tempPath)
      .catch(() => {})
    }, 50)
  }

  componentWillUnmount = () => {
    sessionStorage.setItem("browserFs", JSON.stringify(this.state.browserFs))
    sessionStorage.setItem("currentPath", JSON.stringify(this.state.currentPath))
    localStorage.setItem("shownbrowsercolumns", JSON.stringify(this.state.shownColumns))

    window.removeEventListener('click', this.handleWindowClick)
    window.removeEventListener("orientationchange", this.handleOrientationChange)
  }

  // stopPropagation does not work because it is a different event cause
  handleWindowClick = () => this.setState({ showFileSettings: false })

  handleOrientationChange = () => this.setState({ windowWidth: window.innerWidth })

  /**
   * 
   * @param {Number} brIndex identify which browser wants new files
   */
  getFiles = (brIndex, newPath) => {
    return new Promise((resolve, reject) => {
      assert(brIndex === 0 || brIndex === 1, {brIndex})

      let { loading } = this.state
      loading[brIndex] = true
      this.setState({ loading })

      if (newPath === "") newPath = "/"

      let { browserFs } = this.state
      let currentPath = Object.assign({}, this.state.currentPath)
      currentPath[brIndex] = newPath

      return API.request({
        url: "/operations/list",
        data: {
          fs: browserFs[brIndex] + ":",
          remote: newPath.charAt(0) === "/" ? newPath.substring(1) : newPath
        }
      })
      .then(response => {
        if (typeof response.data.list !== "object") return reject(new Error("Invalid response"))

        response.data.list.forEach(v => v.ModTime = new Date(v.ModTime))

        let { files } = this.state
        files[brIndex] = response.data.list
        loading[brIndex] = false
        this.setState({ files, currentPath, errMessage: "", loading })

        return resolve()
      })
      .catch(() => {
        let { loading } = this.state
        loading[brIndex] = false
        this.setState({ loading })

        return reject()
      })
    })
  }

  /**
   * 
   * @param {Number} brIndex identify which browser wants to do the action
   * @param {String} action type of action to be performed
   * @param {String} path dir or file
   */
  doAction = (brIndex, action, file) => {
    return new Promise((resolve, reject) => {
      const fs = this.state.browserFs[brIndex] + ":",
            remote = path.join(this.state.currentPath[brIndex], file)

      switch(action) {
        case "copy":
          const dstFs = this.state.browserFs[brIndex === 0 ? 1 : 0] + ":",
                dstRemote = this.state.currentPath[brIndex === 0 ? 1 : 0]

          console.log({ fs, remote, dstFs, dstRemote })

          return API.request({
            url: "/sync/copy",
            data: {
              srcFs: fs + remote,
              dstFs: dstFs + dstRemote,
              _async: true
            }
          })
          .then(resolve)
          .catch(err => console.error(err))
        case "move":
          console.log("did move", file)
          break;
        case "delete":
          console.log("did delete", file)
          break;
        case "newfolder":
          return API.request({
            url: "/operations/mkdir",
            data: {
              fs, remote
            }
          })
          .then(() => {
            let { files } = this.state

            files[brIndex].push({
              Name: file,
              ModTime: new Date(),
              Size: -1,
              IsDir: true,
              MimeType: "inode/directory"
            })

            this.setState({ files })

            return resolve()
          })
          .catch(reject)
        default: return reject(new Error("Invalid file action"))
      }
    })
  }

  handleColumnChange = ({target}) => {
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    let { shownColumns } = this.state

    switch (name) {
      case "size":
        shownColumns.size = value
        this.setState({ shownColumns })
        break;
      case "datetime":
        if (value === true) {
          shownColumns.datetime = true
          shownColumns.date = false
        } else {
          shownColumns.datetime = false
        }
        this.setState({ shownColumns })
        break;
      case "date":
        if (value === true) {
          shownColumns.date = true
          shownColumns.datetime = false
        } else {
          shownColumns.date = false
        }
        this.setState({ shownColumns })
        break;
      default: break;
    }
  }

  openFileSettings = e => {
    e.stopPropagation()
    this.setState({ showFileSettings: true })
  }

  renderFileSettings = () => {
    const { size, date, datetime } = this.state.shownColumns

    if (this.state.showFileSettings) return (
      <FileSettingsPopup onClick={e => e.stopPropagation()}>
        <FileSettingsHeader> Columns </FileSettingsHeader>
        <FileColumnSettingsContainer>
          <div>
            <Checkbox type="checkbox" id="datetime" name="datetime" checked={datetime} onChange={this.handleColumnChange} />
            <label htmlFor="datetime"> Datetime </label>
          </div>

          <div>
            <Checkbox type="checkbox" id="date" name="date" checked={date} onChange={this.handleColumnChange} />
            <label htmlFor="date"> Date </label>
          </div>

          <div>
            <Checkbox type="checkbox" id="size" name="size" checked={size} onChange={this.handleColumnChange} />
            <label htmlFor="size"> Size </label>
          </div>
        </FileColumnSettingsContainer>
      </FileSettingsPopup>
    )
  }

  switchBrowserMode = () => {
    if (this.state.loading[0] || this.state.loading[1]) return;

    if (this.state.dualBrowser) return this.setState({ activeBrowser: 0, dualBrowser: false })
    let { currentPath } = this.state
    const tempPath = currentPath[1]
    currentPath[1] = ""

    this.setState({ activeBrowser: 1, dualBrowser: true, currentPath })
    this.getFiles(1, tempPath)
  }

  setActiveBrowser = activeBrowser => {
    if (this.state.windowWidth < 1200 && this.state.dualBrowser === false) this.switchBrowserMode()
    if (this.state.dualBrowser) this.setState({ activeBrowser })
  }

  setRemote = remoteName => {
    let { browserFs, currentPath, activeBrowser } = this.state
    browserFs[activeBrowser] = remoteName
    currentPath[activeBrowser] = ""

    this.setState({ browserFs, currentPath })
    setTimeout(() => {
      this.getFiles(activeBrowser, "/")
    }, 50)
  }

  renderRemoteButtons = () => {
    const { browserFs, activeBrowser } = this.state

    return this.props.remotes.map(v => (
      <RemoteButton key={v.name} onClick={() => this.setRemote(v.name)} active={browserFs[activeBrowser] === v.name}> { v.name } </RemoteButton>
    ))
  }

  renderBrowser = () => {
    const { files, currentPath, loading, dualBrowser, activeBrowser, shownColumns, windowWidth } = this.state

    if (windowWidth >= 1200) return (
      <Fragment>
        <FileBrowser
          setActive={() => this.setActiveBrowser(0)}
          action={(a, p) => this.doAction(0, a, p)}
          files={files[0]}
          updateFiles={path => this.getFiles(0, path)}
          currentPath={currentPath[0]}
          loading={loading[0]}
          shownColumns={shownColumns}
          active={activeBrowser === 0}
        />
        {
          dualBrowser &&
          <FileBrowser
          setActive={() => this.setActiveBrowser(1)}
            action={(a, p) => this.doAction(1, a, p)}
            files={files[1]}
            updateFiles={path => this.getFiles(1, path)}
            currentPath={currentPath[1]}
            loading={loading[1]}
            shownColumns={shownColumns}
            active={activeBrowser === 1 && dualBrowser}
          />
        }
      </Fragment>
    )

    return (
      <FileBrowser
      setActive={() => this.setActiveBrowser(activeBrowser)}
        action={(a, p) => this.doAction(activeBrowser, a, p)}
        files={files[activeBrowser]}
        updateFiles={path => this.getFiles(activeBrowser, path)}
        currentPath={currentPath[activeBrowser]}
        loading={loading[activeBrowser]}
        shownColumns={shownColumns}
        active={false}
      />
    )
  }

  renderSwitchBrowser = () => {
    const { currentPath, dualBrowser, activeBrowser, windowWidth } = this.state

    if (windowWidth < 1200) return (
      <RemoteButton onClick={() => this.setActiveBrowser(activeBrowser ? 0 : 1)}>
        { currentPath[activeBrowser ? 0 : 1] }
      </RemoteButton>
    )

    return (
      <BrowserSettingButton onClick={this.switchBrowserMode}>
        <img src={dualBrowser ? BrowserSingle : BrowserDual} alt={dualBrowser ? "single browser" : "dual browser"} width="20" height="20" />
      </BrowserSettingButton>
    )
  }

  render = () => {
    return (
      <PopupContainer>
        {
          this.renderFileSettings()
        }

        <PopupTitle> File Browser </PopupTitle>
        <Cross onClick={this.props.close}> Close </Cross>

        <FileBrowsersContainer>
          <FileBrowserRemotes>
            { this.renderRemoteButtons() }

            <FileBrowserSettings>
              { this.renderSwitchBrowser() }
              <BrowserSettingButton onClick={this.openFileSettings}>
                <img src={SettingsCog} alt="file settings" width="20" height="20" />
              </BrowserSettingButton>
            </FileBrowserSettings>
          </FileBrowserRemotes>

          <FileBrowserWrapper>
            { this.renderBrowser() }
          </FileBrowserWrapper>
        </FileBrowsersContainer>
      </PopupContainer>
    )
  }
}

const compareProps = (prevProps, nextProps) => {
  return true
}

export default React.memo(FileBrowserMenu, compareProps)