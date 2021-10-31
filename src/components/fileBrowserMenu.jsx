import { Component } from 'react'
import { Cross, PopupContainer, PopupTitle } from '../styled'
import API from '../utils/API'
import FileBrowser from './fileBrowser'

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
   * @param {Number} browser identify which browser wants new files
   */
  getFiles = (browser, newPath) => {
    return new Promise((resolve, reject) => {
      if (browser !== 0 && browser !== 1) return reject(new Error("Invalid browser id"))

      // if (newPath.charAt(0) === "/") newPath = newPath.substring(1)

      if (newPath === "") newPath = "/"

      let { browserFs } = this.state
      let currentPath = Object.assign({}, this.state.currentPath)
      currentPath[browser] = newPath

      return API.request({
        url: "/operations/list",
        data: {
          fs: browserFs[browser] + ":",
          remote: newPath.charAt(0) === "/" ? newPath.substring(1) : newPath
        }
      })
      .then(response => {
        if (typeof response.data.list !== "object") return reject(new Error("Invalid response"))

        let { files } = this.state
        files[browser] = response.data.list
        this.setState({ files, currentPath, errMessage: "" })

        return resolve()
      })
    })
  }

  /**
   * 
   * @param {Number} browser identify which browser wants to do the action
   * @param {String} path dir or file
   * @param {String} name name of the action to be performed
   */
  action = (browser, path, name) => {
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

  render = () => {

    return (
      <PopupContainer>
        <PopupTitle> Browser </PopupTitle>
        <Cross onClick={this.props.close}> Close </Cross>

        <FileBrowser
          id={0}
          action={(path, name) => this.action(0, path, name)}
          files={this.state.files[0]}
          updateFiles={path => this.getFiles(0, path)}
          currentPath={this.state.currentPath[0]}
        />
      </PopupContainer>
    )
  }
}

export default FileBrowserMenu