import { Component } from 'react'
import { Button, Cross, PopupContainer, PopupTitle } from '../styled'
import API from '../utils/API'
import FileBrowser from './fileBrowser'
import { FileBrowserRemotes, FileBrowsersContainer, FileBrowserWrapper } from './fileBrowser.styled'
import assert from 'assert'

class FileBrowserMenu extends Component {
  constructor() {
    super()
    this.state = {
      files: [
        [{}],
        [{}]
      ],
      currentPath: ["", ""],
      browserFs: ["", ""],
      errMessage: "",
      dualBrowser: false
    }
  }

  componentDidMount = () => {
    const browserFs = JSON.parse(sessionStorage.getItem("browserFs")),
          currentPath = JSON.parse(sessionStorage.getItem("currentPath"))

    this.setState({ browserFs })

    setTimeout(() => {
      this.getFiles(0, currentPath[0])
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
      assert(brIndex !== 0 && brIndex !== 1, {brIndex})

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

        let { files } = this.state
        files[brIndex] = response.data.list
        this.setState({ files, currentPath, errMessage: "" })

        return resolve()
      })
      .catch(reject)
    })
  }

  /**
   * 
   * @param {Number} brIndex identify which browser wants to do the action
   * @param {String} path dir or file
   * @param {String} name name of the action to be performed
   */
  action = (brIndex, path, name) => {
    return new Promise((resolve, reject) => {
      switch(name) {
        case "copy":
          break;
        case "move":
          break;
        case "delete":
          break;
        default: return reject(new Error("Invalid file action"))
      }
    })
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
      <Button onClick={() => this.setRemote(brIndex, v.name)}> { v.name } </Button>
    ))
  }

  render = () => {
    const { files, currentPath } = this.state

    return (
      <PopupContainer>
        <PopupTitle> Browser </PopupTitle>
        <Cross onClick={this.props.close}> Close </Cross>

        <FileBrowsersContainer>
          <FileBrowserWrapper>
            <FileBrowserRemotes>
              { this.renderRemoteButtons(0) }
            </FileBrowserRemotes>

            <FileBrowser
              action={(path, name) => this.action(0, path, name)}
              files={files[0]}
              updateFiles={path => this.getFiles(0, path)}
              currentPath={currentPath[0]}
            />
          </FileBrowserWrapper>
        </FileBrowsersContainer>
      </PopupContainer>
    )
  }
}

export default FileBrowserMenu