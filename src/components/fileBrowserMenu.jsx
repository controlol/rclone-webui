import React, { Component, Fragment } from 'react'
import { Checkbox, Cross, PopupContainer, PopupTitle } from '../styled'
import API from '../utils/API'
import FileBrowser from './fileBrowser'
import { BrowserSettingButton, FileBrowserRemotes, FileBrowsersContainer, FileBrowserSettings, FileBrowserWrapper, FileSettingsPopup, FileSettingsHeader, FileColumnSettingsContainer, RemoteButton } from './fileBrowser.styled'
import assert from 'assert'
import path from 'path'
import FileMenu from './fileMenu'

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
      menuInfo: {
        cursorX: 0,
        cursorY: 0,
        brIndex: -1,
        file: {},
        otherPath: ""
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
    window.addEventListener('keyup', this.handleKeyup)

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
    window.removeEventListener('keyup', this.handleKeyup)
  }

  /**
   * closes any open menu
   * stopPropagation does not work here because it is a different event
   */
  handleWindowClick = () => {
    this.setState({ showFileSettings: false })
    this.closeMenu()
  }

  // update the innerwidth, used to determine wether to show one or two browsers
  handleOrientationChange = () => this.setState({ windowWidth: window.innerWidth })

  /**
   * closes the menu if the user presses the escape key
   */
  handleKeyup = e => {
    if (e.key === "Escape") {
      this.setState({ showFileSettings: false })
      this.closeMenu()
    }
  }

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
   * @param {String} newFile only used when creating a dir or renaming
   */
  doAction = (brIndex, action, newFile) => {
    if (!action) return this.closeMenu()

    this.setState({ loading: [ true, true ] })

    // dir or file, only used when renaming
    let clickedFile = this.state.menuInfo.file

    const fs = this.state.browserFs[brIndex] + ":",
          remote = path.join(this.state.currentPath[brIndex], clickedFile.Name || newFile),
          dstFs = this.state.browserFs[brIndex === 0 ? 1 : 0] + ":",
          dstRemote = path.join(this.state.currentPath[brIndex === 0 ? 1 : 0], newFile || clickedFile.Name)

    switch(action) {
      case "copy":
        return API.request({
          url: clickedFile.IsDir ? "/sync/copy" : "/operations/copyfile",
          data: Object.assign({
            _async: true
          }, clickedFile.IsDir ? { srcFs: fs + remote, dstFs: dstFs + dstRemote, } : { srcFs: fs, srcRemote: remote, dstFs, dstRemote })
        })
        .catch(err => console.error(err))
        .finally(this.closeMenu)
      case "move":
        return API.request({
          url: clickedFile.IsDir ? "/sync/move" : "/operations/movefile",
          data: Object.assign({
            _async: true
          }, clickedFile.IsDir ? { srcFs: fs + remote, dstFs: dstFs + dstRemote, } : { srcFs: fs, srcRemote: remote, dstFs, dstRemote })
        })
        .catch(err => console.error(err))
        .finally(this.closeMenu)
      case "delete":
        return API.request({
          url: "operations/" + (clickedFile.IsDir ? "purge" : "deletefile"),
          data: { fs, remote, _async: true }
        })
        .then(() => {
          let { files } = this.state
          files[brIndex] = files[brIndex].filter(v => v.Name !== clickedFile.Name)
          this.setState({ files })
        })
        .catch(err => console.error(err))
        .finally(this.closeMenu)
      case "rename":
        if (clickedFile.IsDir) return API.request({
          url: "/operations/mkdir",
          data: { fs, remote: dstRemote }
        })
        .then(() => {
          return API.request({
            url: "/sync/move",
            data: {
              srcFs: fs + remote,
              dstFs: fs + path.join(this.state.currentPath[brIndex], newFile)
            }
          })
          .then(() => {
            return API.request({
              url: "/operations/purge",
              data: { fs, remote, _async: true }
            })
            .then(() => {
              let { files } = this.state
              let f = files[brIndex].filter(v => v.Name === clickedFile.Name)[0]
              f.Name = newFile
              this.setState({ files })
            })
            .catch(err => console.error(err))
          })
          .catch(err => console.error(err))
        })
        .catch(err => console.error(err))
        .finally(this.closeMenu)

        return API.request({
          url: clickedFile.IsDir ? "/sync/copy" : "/operations/movefile",
          data: { srcFs: fs,
            srcRemote: remote,
            dstFs: fs,
            dstRemote: path.join(this.state.currentPath[brIndex], newFile)
          }
        })
        .then(() => {
          let { files } = this.state
          let f = files[brIndex].filter(v => v.Name === clickedFile.Name)[0]
          f.Name = newFile
          this.setState({ files })
        })
        .catch(err => console.error(err))
        .finally(this.closeMenu)
      case "newfolder":
        return API.request({
          url: "/operations/mkdir",
          data: { fs, remote }
        })
        .then(() => {
          let { files } = this.state

          files[brIndex].push({
            Name: newFile,
            ModTime: new Date(),
            Size: -1,
            IsDir: true,
            MimeType: "inode/directory"
          })

          this.setState({ files })
        })
        .catch(() => {})
        .finally(this.closeMenu)
      default: assert(false);
    }
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

  /**
   * Opens the actions menu
   * @param {ElementEvent} e The event that called this function
   * @param {Boolean} isFile was a file clicked
   */
  openMenu = (brIndex, e, isFile) => {
    e.preventDefault()
    e.stopPropagation()

    assert(
      typeof e.pageX === "number"
      && typeof e.pageY === "number"
      && typeof e.target.innerHTML === "string"
      && e.target.innerHTML.length > 0
    )

    let file = {}
    if (isFile) file = this.state.files[brIndex].filter(v => v.Name === e.target.innerHTML)[0]

    this.setState({
      menuInfo: {
        file,
        brIndex,
        cursorX: e.pageX,
        cursorY: e.pageY,
        otherPath: this.state.currentPath[brIndex === 0 ? 1 : 0]
      }
    })
  }

  closeMenu = () => {
    this.setState({
      menuInfo: {
        cursorX: 0,
        cursorY: 0,
        brIndex: -1,
        file: {},
        otherPath: ""
      },
      loading: [ false, false ]
    })
  }

  openFileSettings = e => {
    e.stopPropagation()
    this.setState({ showFileSettings: true })
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

  /**
   * Renders a simple menu to perform actions on the clicked file
   */
  renderMenu = () => {
    const { menuInfo } = this.state
    const { brIndex } = menuInfo

    if (brIndex !== -1) return <FileMenu info={menuInfo} action={(action, file) => this.doAction(brIndex, action, file)} hideMenu={() => this.setState({ showMenu: false })} />
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

  renderRemoteButtons = () => {
    const { browserFs, activeBrowser } = this.state

    return this.props.remotes.map(v => (
      <RemoteButton key={v.name} onClick={() => this.setRemote(v.name)} active={browserFs[activeBrowser] === v.name}> { v.name } </RemoteButton>
    ))
  }

  renderBrowser = () => {
    const { files, currentPath, loading, dualBrowser, activeBrowser, shownColumns, windowWidth } = this.state

    const data = files.map((files, i) => ({
      files,
      setActive: () => this.setActiveBrowser(i),
      updateFiles: path => this.getFiles(i, path),
      currentPath: currentPath[i],
      loading: loading[i],
      shownColumns: shownColumns,
      active: activeBrowser === i && dualBrowser,
      openMenu: (e, isFile) => this.openMenu(i, e, isFile)
    }))

    if (windowWidth >= 1200) return (
      <Fragment>
        <FileBrowser {...data[0]} />
        {
          dualBrowser &&
          <FileBrowser {...data[1]} />
        }
      </Fragment>
    )

    return <FileBrowser {...data[activeBrowser]} />
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
        { this.renderFileSettings() }
        { this.renderMenu() }

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