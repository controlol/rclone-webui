import React, { Component } from 'react'
import { Button, Cross, PopupContainer, PopupTitle } from '../styled'
import API from '../utils/API'
import FileBrowser from './fileBrowser'
import { BrowserSettingButton, FileBrowserRemotes, FileBrowsersContainer, FileBrowserSettings, FileBrowserWrapper } from './fileBrowser.styled'
import assert from 'assert'

import BrowserSingle from '../assets/icons/browserSingle.svg'
import BrowserDual from '../assets/icons/browserDual.svg'

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
      activeBrowser: -1
    }
  }

  componentDidMount = () => {
    const browserFs = JSON.parse(sessionStorage.getItem("browserFs")),
          currentPath = JSON.parse(sessionStorage.getItem("currentPath"))

    this.setState({ browserFs })

    setTimeout(() => {
      this.getFiles(0, currentPath[0])
      .catch(() => {})
    }, 50)
  }

  componentWillUnmount = () => {
    sessionStorage.setItem("browserFs", JSON.stringify(this.state.browserFs))
    sessionStorage.setItem("currentPath", JSON.stringify(this.state.currentPath))
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
   * @param {String} path dir or file
   */
  doAction = (brIndex, action, path) => {
    return new Promise((resolve, reject) => {
      switch(action) {
        case "copy":
          console.log("did copy", path)
          break;
        case "move":
          console.log("did move", path)
          break;
        case "delete":
          console.log("did delete", path)
          break;
        default: return reject(new Error("Invalid file action"))
      }
    })
  }

  switchBrowserMode = () => {
    if (this.state.dualBrowser) return this.setState({ activeBrowser: -1, dualBrowser: false })
    return this.setState({ activeBrowser: 1, dualBrowser: true })
  }

  setActiveBrowser = activeBrowser => {
    if (this.state.dualBrowser) this.setState({ activeBrowser })
  }

  setRemote = (brIndex, remoteName) => {
    let { browserFs, currentPath } = this.state
    browserFs[brIndex] = remoteName

    this.setState({ browserFs, currentPath })
    setTimeout(() => {
      this.getFiles(brIndex, "/")
    }, 50)
  }

  renderRemoteButtons = brIndex => {
    assert( brIndex === 0 || brIndex === 1, {brIndex})
    return this.props.remotes.map(v => (
      <Button key={v.name} onClick={() => this.setRemote(brIndex, v.name)}> { v.name } </Button>
    ))
  }

  render = () => {
    const { files, currentPath, loading, dualBrowser, activeBrowser } = this.state

    return (
      <PopupContainer>
        <PopupTitle> Browser </PopupTitle>
        <Cross onClick={this.props.close}> Close </Cross>

        <FileBrowsersContainer>
          <FileBrowserRemotes>
            { this.renderRemoteButtons(0) }

            <FileBrowserSettings>
              <BrowserSettingButton onClick={this.switchBrowserMode}>
                <img src={dualBrowser ? BrowserSingle : BrowserDual} alt={dualBrowser ? "single browser" : "dual browser"} width="16" height="16" />
              </BrowserSettingButton>
            </FileBrowserSettings>
          </FileBrowserRemotes>

          <FileBrowserWrapper>
            <FileBrowser
              setActive={() => this.setActiveBrowser(0)}
              action={(a, p) => this.doAction(0, a, p)}
              files={files[0]}
              updateFiles={path => this.getFiles(0, path)}
              currentPath={currentPath[0]}
              loading={loading[0]}
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
                active={activeBrowser === 1}
              />
            }
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