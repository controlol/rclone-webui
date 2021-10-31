import { Component, Fragment } from 'react'
import path from 'path'
import styled from 'styled-components'
import { Input, Label } from './fileBrowser.styled.js'

// images for different filetypes
import Back from '../assets/icons/arrowLeft.svg'
import Other from '../assets/fileTypes/other.svg'
import Folder from '../assets/fileTypes/folder.svg'
import Home from '../assets/fileTypes/home.svg'
import AAC from '../assets/fileTypes/aac.svg'
import AVI from '../assets/fileTypes/aac.svg'
import CSS from '../assets/fileTypes/css.svg'
import DOC from '../assets/fileTypes/doc.svg'
import EXE from '../assets/fileTypes/exe.svg'
import FLAC from '../assets/fileTypes/flac.svg'
import GIF from '../assets/fileTypes/gif.svg'
import HTML from '../assets/fileTypes/html.svg'
import JPG from '../assets/fileTypes/jpg.svg'
import JS from '../assets/fileTypes/js.svg'
import json from '../assets/fileTypes/json.svg'
import MP3 from '../assets/fileTypes/mp3.svg'
import MP4 from '../assets/fileTypes/mp4.svg'
import PDF from '../assets/fileTypes/pdf.svg'
import PNG from '../assets/fileTypes/png.svg'
import RAR from '../assets/fileTypes/rar.svg'
import Sevenzip from '../assets/fileTypes/sevenzip.svg'
import SVG from '../assets/fileTypes/svg.svg'
import TIFF from '../assets/fileTypes/tiff.svg'
import TXT from '../assets/fileTypes/txt.svg'
import WAV from '../assets/fileTypes/wav.svg'
import WMA from '../assets/fileTypes/wma.svg'
import XML from '../assets/fileTypes/xml.svg'
import ZIP from '../assets/fileTypes/zip.svg'

import CaretDown from '../assets/icons/caretDown.svg'
import bytesToString from '../utils/bytestring.js'

// bunch of styled components
const BrowserContainer = styled.div`
  height: 100%;
  width: 50%;
  overflow-x: hidden;
  overflow-y: scroll;
  position: relative;
  background: radial-gradient(rgba(0,0,0,.25), transparent 175%);
  border-radius: 0 0 .3em .3em;
  user-select: none;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: none;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--thumbBG);
    border-radius: 3px;
  }
`

const GridFileBrowser = styled.div`
  display: grid;
  grid-template-columns: 1px 1fr 6rem;
  align-items: center;
  gap: .5rem 1.5rem;
  width: 100%;
  transition: transform .3s;
  padding: .5rem;

  /* @media screen and (max-width: 1099px) {
    grid-template-columns: 1px 1fr 4em 6em;
  }
  @media screen and (max-width: 800px) {
    grid-template-columns: 1px 1fr 10em 4em 6em;
  }
  @media screen and (max-width: 600px) {
    grid-template-columns: 1px 1fr 6em;
  } */
`

const GridFileHeader = styled.div`
  background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,.03));
  padding-right: .5rem;
  overflow: visible;
  border-radius: .3rem .3rem 0 0;
  height: unset;
  transform: unset;
  width: 50%;

  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`

const EllipsisP = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const SpanPathDirectory = styled.span`
  cursor: pointer;
  margin-left: -.3em;
  transition: color .3s;

  &:first-child {
    margin-left: 0;
  }

  &:hover {
    color: var(--off-white);
  }
`

const FilenameP = styled(EllipsisP)`
  
`

const DirNameP = styled(FilenameP)`
  cursor: pointer;
`

// const ModifiedP = styled(EllipsisP)`
//   @media screen and (max-width: 1100px) {
//     display: none;
//   }

//   @media screen and (max-width: 800px) {
//     display: initial;
//   }
//   @media screen and (max-width: 600px) {
//     display: none;
//   }
//   @media screen and (min-width: 1100px) {
//     display: initial;
//   }
// `

const SizeP = styled.p`
  @media screen and (max-width: 600px) {
    display: none;
  }
`

const SearchLabel = styled(Label)`
  @media screen and (max-width: 800px) {
    display: none;
  }
  @media screen and (min-width: 800px) {
    display: none;
  }
  @media screen and (min-width: 1100px) {
    display: initial;
  }
`

const BrowseImage = styled.img`
  cursor: pointer;

  @media screen and (max-width: 600px) {
    display: none;
  }

  @media screen and (min-width: 800px) {
    display: none;
  }
  @media screen and (min-width: 1100px) {
    display: initial;
  }
`
const SearchInput = styled(Input)`
  width: 15rem;
  /* grid-column: 4 / 6;

  @media screen and (max-width: 1099px) {
    grid-column: 3 / 5;
  }
  @media screen and (max-width: 800px) {
    grid-column: 4 / 6;
  }
  @media screen and (max-width: 600px) {
    grid-column: 3 / 4;
  } */
`

const delay = t => new Promise(resolve => setTimeout(resolve, t))

class FileBrowser extends Component {
  constructor() {
    super()
    this.state = {
      filter: "",
      orderBy: "name",
      orderAscending: true,
      files: [],
      prevPath: "",
      transitionFiles: 0
    }

    this.backListener = undefined

    this.handleInputChange = this.handleInputChange.bind(this)
  }

  componentDidMount = () => {
    this.setState({ prevPath: this.props.currentPath, files: this.props.files })
  }

  componentDidUpdate = () => {
    // if the component was just created set the path
    if (this.state.prevPath === "" && this.props.currentPath !== "") return this.setState({ prevPath: this.props.currentPath, files: this.props.files })

    // the path changed
    if (this.props.currentPath !== this.state.prevPath) {
      let direction = 1
      if (
        this.props.currentPath.split("/").length < this.state.prevPath.split("/").length ||
        this.props.currentPath === "/"
      ) direction = -1
      this.setState({ prevPath: this.props.currentPath, transitionFiles: 1 * direction })

      delay(5).then(() => this.setState({ transitionFiles: 2 * direction }))
      delay(300).then(() => this.setState({ transitionFiles: 3 * direction, files: this.props.files }))
      // delay(11500).then(() => this.setState({ transitionFiles: 3 }))
      delay(600).then(() => this.setState({ transitionFiles: 0 }))
    }
  }

  // used to filter the files
  handleInputChange({target}) {
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({ [name]: value })
  }

  // change the way files should be ordered
  updateOrder = orderBy => {
    if (this.state.orderBy === orderBy) {
      this.setState({ orderAscending: !this.state.orderAscending })
    } else {
      this.setState({ orderBy, orderAscending: true })
    }
  }

  // decide which image should be used to represent the filetype
  renderImage = (type, filename) => {
    if (type === "inode/directory") return <img src={Folder} alt="folder" width="20px" height="20px" />

    const ext = path.extname(filename).toLowerCase().substring(1)
    if (ext === "aac") return <img src={AAC} alt="aac" width="20px" height="20px" />
    if (ext === "avi") return <img src={AVI} alt="avi" width="20px" height="20px" />
    if (ext === "css") return <img src={CSS} alt="css" width="20px" height="20px" />
    if (/^docx?$/.test(ext)) return <img src={DOC} alt="doc" width="20px" height="20px" />
    if (ext === "exe") return <img src={EXE} alt="exe" width="20px" height="20px" />
    if (ext === "flac") return <img src={FLAC} alt="flac" width="20px" height="20px" />
    if (ext === "gif") return <img src={GIF} alt="gif" width="20px" height="20px" />
    if (ext === "html") return <img src={HTML} alt="html" width="20px" height="20px" />
    if (/^jpe?g$/.test(ext)) return <img src={JPG} alt="jpg" width="20px" height="20px" />
    if (ext === "js") return <img src={JS} alt="js" width="20px" height="20px" />
    if (ext === "json") return <img src={json} alt="json" width="20px" height="20px" />
    if (ext === "mp3") return <img src={MP3} alt="mp3" width="20px" height="20px" />
    if (ext === "mp4") return <img src={MP4} alt="mp4" width="20px" height="20px" />
    if (ext === "pdf") return <img src={PDF} alt="pdf" width="20px" height="20px" />
    if (ext === "png") return <img src={PNG} alt="png" width="20px" height="20px" />
    if (ext === "rar") return <img src={RAR} alt="rar" width="20px" height="20px" />
    if (ext === "7z") return <img src={Sevenzip} alt="7z" width="20px" height="20px" />
    if (ext === "svg") return <img src={SVG} alt="svg" width="20px" height="20px" />
    if (ext === "tiff") return <img src={TIFF} alt="tiff" width="20px" height="20px" />
    if (ext === "txt") return <img src={TXT} alt="txt" width="20px" height="20px" />
    if (ext === "wav") return <img src={WAV} alt="wav" width="20px" height="20px" />
    if (ext === "wma") return <img src={WMA} alt="wma" width="20px" height="20px" />
    if (ext === "xml") return <img src={XML} alt="xml" width="20px" height="20px" />
    if (ext === "zip") return <img src={ZIP} alt="zip" width="20px" height="20px" />

    return <img src={Other} alt="text" width="20px" height="20px" />
  }

  // after the user clicks on a folder
  updatePath = (isDir, name) => {
    if (isDir) {
      const newPath = path.join(this.props.currentPath, name)

      this.props.updateFiles(newPath)
      this.setState({filter: ""})
    }
  }

  // after the user clicks on the back button
  previousDirectory = () => {
    let currentPath = this.props.currentPath.split("/")
    currentPath.pop()

    this.props.updateFiles(currentPath.join("/"))
    this.setState({filter: ""})
  }

  // after the user click on the home button
  rootDirectory = () => {
    this.props.updateFiles("/")
    this.setState({filter: ""})
  }

  // after the user clicks on a path piece
  goToPath = index => {
    let currentPath = this.props.currentPath.split("/")

    currentPath.shift()

    if (index !== currentPath.length - 1) {
      console.log("changing path", index, currentPath.length)

      currentPath.length = index + 1
      this.props.updateFiles(currentPath.join("/"))

      this.setState({filter: ""})
    }
  }

  openMenu = (e) => {
    e.preventDefault()

    // get position of the cursor
    // somehow know the file that was clicked
    // open menu on the position of the cursor
    // display different options for dir and files?
  }

  /**
   * render all files found in a directory
   * there are multiple ways to sort the files
   * always show folders on top
   */
  renderFiles = (isNew) => {
    // console.log(this.state.files)

    let files = [{}]
    if (isNew)  files = this.props.files
    else        files = this.state.files

    return files
    // sort by name
    .sort((a,b) => this.state.orderBy === "name" ? this.state.orderAscending ? a.Name.localeCompare(b.Name, 'nl', { sensitivity: 'base' }) : b.Name.localeCompare(a.Name, 'nl', { sensitivity: 'base' }) : 0)
    // // sort by modified date
    // .sort((a,b) => this.state.orderBy === "modified" ? this.state.orderAscending ? a.modified - b.modified : b.modified - a.modified : 0)
    // sort by size
    .sort((a,b) => this.state.orderBy === "size" ? this.state.orderAscending ? a.Size - b.Size : b.Size - a.Size : 0)
    // // sort folders to top
    .sort((a,b) => (b.IsDir ? 1 : 0) - (a.IsDir ? 1 : 0))
    // apply search filter
    .filter(v => v.Name?.includes(this.state.filter))
    .map(v => (
      <Fragment key={v.Name + "file"}>
        { this.renderImage(v.MimeType, v.Name) }
        {
          v.IsDir ?
            <DirNameP onClick={() => this.updatePath(v.IsDir, v.Name)} onContextMenu={this.openMenu}> { v.Name } </DirNameP>
            :
            <FilenameP> { v.Name } </FilenameP>
        }
        {/* <ModifiedP> { v.modified.toLocaleString() } </ModifiedP> */}
        <SizeP> { !v.IsDir ? bytesToString(v.Size, {}) : "" } </SizeP>
    </Fragment>
    ))
  }

  // render the path the user is currently at
  renderPath = () => 
    path.join(...this.props.currentPath.split("/"))
    .split("/")
    .map((v, i) =>
      <SpanPathDirectory key={"path_"+v} onClick={() => this.goToPath(i)} style={{ cursor: "pointer" }}> /{v} </SpanPathDirectory>
  )

  render() {
    const { transitionFiles } = this.state

    return (
      <Fragment>
        <GridFileHeader>
          <div style={{
            // gridColumn: "1 / span 2",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <BrowseImage src={Back} alt="up directory" width="40px" height="40px" onClick={this.previousDirectory} />
            <BrowseImage src={Home} alt="root directory" width="40px" height="40px" onClick={this.rootDirectory} />
            <p> { this.props.currentPath !== "/" ? this.renderPath() : "/" } </p>
          </div>
          <div>
            <SearchLabel htmlFor="filterFiles" style={{ textAlign: "end" }} > Search </SearchLabel>
            <SearchInput name="filter" id="filterFiles" type="text" placeholder="search" value={this.state.filter} autoComplete="off" onChange={this.handleInputChange} />
          </div>

          <GridFileBrowser>
            <span/>
            <FilenameP onClick={() => this.updateOrder("name")} style={{ position: "relative", cursor: "pointer" }}>
              filename
              {
                this.state.orderBy === "name" &&
                <img src={CaretDown} alt={this.state.orderAscending ? "ascending" : "descending"}
                height="20" width="20"
                style={{
                  transform: this.state.orderAscending ? "rotateZ(180deg)" : undefined,
                  position: "absolute",
                  top: "2px",
                  marginLeft: ".5rem"
                  }}
                  />
              }
            </FilenameP>
            {/* <ModifiedP onClick={() => this.updateOrder("modified")} style={{ position: "relative", cursor: "pointer" }}>
              modified
              {
                this.state.orderBy === "modified" &&
                <img src={CaretDown} alt={this.state.orderAscending ? "ascending" : "descending"}
                height="20" width="20"
                style={{
                  transform: this.state.orderAscending ? "rotateZ(180deg)" : undefined,
                  position: "absolute",
                  top: "2px",
                  marginLeft: ".5rem"
                  }}
                  />
              }
            </ModifiedP> */}
            <SizeP onClick={() => this.updateOrder("size")} style={{ position: "relative", cursor: "pointer" }}>
              size
              {
                this.state.orderBy === "size" &&
                <img src={CaretDown} alt={this.state.orderAscending ? "ascending" : "descending"}
                height="20" width="20"
                style={{
                  transform: this.state.orderAscending ? "rotateZ(180deg)" : undefined,
                  position: "absolute",
                  top: "2px",
                  marginLeft: ".5rem"
                  }}
                  />
              }
            </SizeP>
          </GridFileBrowser>
        </GridFileHeader>

        <BrowserContainer>
          {
            transitionFiles !== 0 &&
            <GridFileBrowser style={{
              position: "absolute",
              top: 0,
              left: 0,
              transform:
                transitionFiles < 2 && transitionFiles > 0 ?
                  "translateX(100%)" :
                  transitionFiles > -2 && transitionFiles < 0 ?
                    "translateX(-100%)" : undefined
            }}>
              { this.renderFiles(true) }
            </GridFileBrowser>
          }

          <GridFileBrowser style={{
            transform:
              transitionFiles === 2 ?
                "translateX(-100%)" : 
                  transitionFiles === -2 ?
                  "translateX(100%)" : undefined,
            display:
              transitionFiles === 3 || transitionFiles === -3 ?
                "none" : undefined
          }}>
            { this.renderFiles() }
          </GridFileBrowser>
        </BrowserContainer>
      </Fragment>
    )
  }
}

export default FileBrowser