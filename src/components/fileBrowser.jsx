import { Component, Fragment } from 'react'
import path from 'path'
import styled from 'styled-components'
import { Input, Label } from './fileBrowser.styled.js'

// images for different filetypes
import Back from '../assets/icons/arrowLeft.svg'
import SettingsCog from '../assets/icons/settings-cog.svg'

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
import MKV from '../assets/fileTypes/mkv.svg'
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
import { Button } from '../styled.js'
import assert from 'assert'
import LineLoader from './LineLoader.jsx'

const ROW_HEIGHT = 20
const ROW_GAP = 8
const DATA_PADDING = 3
const DEBOUNCE_THRESHOLD = 100

const OptimisticRow = styled.div`
  grid-column: 1 / span ${({shownColumns}) => Math.min(4, shownColumns !== null ? Object.values(shownColumns).filter(v => v === true).length + 2 : 2)};
`

const FBContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: inherit;
  position: relative;
`

// bunch of styled components
const BrowserWrapper = styled.div`
  height: inherit;
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  position: relative;
  background: var(--box-radial-gradient);
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
  grid-template-columns: 1px 1fr ${({shownColumns}) => shownColumns.datetime ? "10rem" : ""} ${({shownColumns}) => shownColumns.date ? "6rem" : ""} ${({shownColumns}) => shownColumns.size ? "6rem" : ""};
  align-items: center;
  gap: .5rem 1.5rem;
  width: 100%;
  transition: transform .3s;
  padding: .5rem;
`

const BrowserHeader = styled.div`
  background: var(--box-gradient);
  padding-right: .5rem;
  overflow: visible;
  border-radius: .3rem .3rem 0 0;
  height: unset;
  transform: unset;
  width: 100%;

  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`

const BrowserHeaderDiv = styled.div`
  display: flex;
  align-items: center;
  gap: 0 .25rem;

  @media only screen and (max-width: 800px) {
    &:nth-child(1) {
      padding: .5rem 0 0 .5rem;
    }

    &:nth-child(2) {
      width: 100%;
      padding-left: .5rem;
    }
  }
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
    color: var(--text-hover);
  }
`

const FilenameP = styled(EllipsisP)`
  
`

const DirNameP = styled(FilenameP)`
  cursor: pointer;
`

const ModifiedP = styled(EllipsisP)`
  display: ${({shownColumns}) => shownColumns.datetime || shownColumns.date ? "block" : "none" };
`

const SizeP = styled.p`
  display: ${({shownColumns}) => shownColumns.size ? "block" : "none" };
`

const SearchLabel = styled(Label)`
  @media screen and (max-width: 1200px) {
    display: none;
  }
`

const BrowseImage = styled.img`
  cursor: pointer;

  @media screen and (max-width: 800px) {
    width: 30px;
    height: 30px;
  }
`
const SearchInput = styled(Input)`
  width: 15rem;

  @media only screen and (max-width: 800px) {
    width: 100%;
  }
`

const FileSettingsPopup = styled.div`
  min-width: 15rem;
  background-color: var(--button-color);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 900;
  padding: 1rem;
  border-radius: .3rem;
  box-shadow: 0 0 .5rem rgba(0,0,0,.3);
`

const FileSettingsHeader = styled.h3`
  text-align: center;
  margin-bottom: 1rem;
`

const FileColumnSettingsContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: .5rem 0;
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
      transitionFiles: 0,
      showMenu: false,
      showFileSettings: false,
      shownColumns: {
        size: true,
        date: false,
        datetime: false
      },
      cursorX: 0,
      cursorY: 0,
      clicked: "",
      from: 0,
      to: 100
    }

    this.backListener = undefined

    this.handleInputChange = this.handleInputChange.bind(this)
    this.searchTimeout = undefined
    this.scrollTimeout = undefined
  }

  componentDidMount = () => {
    this.setState({ prevPath: this.props.currentPath, files: this.props.files })

    const shownColumns = JSON.parse(localStorage.getItem("shownbrowsercolumns"))
    if (shownColumns !== null) this.setState({ shownColumns })

    // add click event listener for closing menu
    window.addEventListener('click', this.handleWindowClick)
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
      this.setState({ prevPath: this.props.currentPath, transitionFiles: 1 * direction, from: 0, to: 100 })

      delay(5).then(() => this.setState({ transitionFiles: 2 * direction }))
      delay(300).then(() => this.setState({ transitionFiles: 3 * direction, files: this.props.files }))
      // delay(11500).then(() => this.setState({ transitionFiles: 3 }))
      delay(600).then(() => this.setState({ transitionFiles: 0 }))
    }
  }

  componentWillUnmount = () => {
    window.removeEventListener('click', this.handleWindowClick)

    localStorage.setItem("shownbrowsercolumns", JSON.stringify(this.state.shownColumns))
  }

  handleWindowClick = () => this.setState({ showMenu: false, showFileSettings: false })

  // used to filter the files
  handleInputChange({target}) {
    clearTimeout(this.searchTimeout)

    const value = target.type === 'checkbox' ? target.checked : target.value

    this.searchTimeout = setTimeout(this.doSearch, 200, value.toLowerCase())
  }

  doSearch = filter => this.setState({ filter })

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

    switch (ext) {
      case "aac": return <img src={AAC} alt="aac" width="20px" height="20px" />;
      case "avi": return <img src={AVI} alt="avi" width="20px" height="20px" />;
      case "css": return <img src={CSS} alt="css" width="20px" height="20px" />;
      case /^docx?$/.test(ext): return <img src={DOC} alt="doc" width="20px" height="20px" />;
      case "exe": return <img src={EXE} alt="exe" width="20px" height="20px" />;
      case "flac": return <img src={FLAC} alt="flac" width="20px" height="20px" />;
      case "gif": return <img src={GIF} alt="gif" width="20px" height="20px" />;
      case "html": return <img src={HTML} alt="html" width="20px" height="20px" />;
      case /^jpe?g$/.test(ext): return <img src={JPG} alt="jpg" width="20px" height="20px" />;
      case "js": return <img src={JS} alt="js" width="20px" height="20px" />;
      case "json": return <img src={json} alt="json" width="20px" height="20px" />;
      case "mp3": return <img src={MP3} alt="mp3" width="20px" height="20px" />;
      case "mkv": return <img src={MKV} alt="mkv" width="20px" height="20px" />;
      case "mp4": return <img src={MP4} alt="mp4" width="20px" height="20px" />;
      case "pdf": return <img src={PDF} alt="pdf" width="20px" height="20px" />;
      case "png": return <img src={PNG} alt="png" width="20px" height="20px" />;
      case "rar": return <img src={RAR} alt="rar" width="20px" height="20px" />;
      case "7z": return <img src={Sevenzip} alt="7z" width="20px" height="20px" />;
      case "svg": return <img src={SVG} alt="svg" width="20px" height="20px" />;
      case "tiff": return <img src={TIFF} alt="tiff" width="20px" height="20px" />;
      case "txt": return <img src={TXT} alt="txt" width="20px" height="20px" />;
      case "wav": return <img src={WAV} alt="wav" width="20px" height="20px" />;
      case "wma": return <img src={WMA} alt="wma" width="20px" height="20px" />;
      case "xml": return <img src={XML} alt="xml" width="20px" height="20px" />;
      case "zip": return <img src={ZIP} alt="zip" width="20px" height="20px" />;
      default: return <img src={Other} alt="text" width="20px" height="20px" />;
    }
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

    if (index !== currentPath.length - 2) {
      currentPath.length = index + 2
      this.props.updateFiles(currentPath.join("/"))

      this.setState({filter: ""})
    }
  }

  /**
   * Wrapper for the props.action function
   * @param {String} a type of action to be performed
   * @returns {Promise}
   */
  doAction = a => this.props.action(a, this.state.clicked).catch(err => console.error(err))

  /**
   * Opens the actions menu
   * @param {ElementEvent} e The event that called this function
   */
  openMenu = (e) => {
    e.preventDefault()

    assert(
      typeof e.pageX === "number"
      && typeof e.pageY === "number"
      && typeof e.target.innerHTML === "string"
      && e.target.innerHTML.length > 0
    )

    this.setState({
      cursorX: e.pageX,
      cursorY: e.pageY,
      showMenu: true,
      clicked: e.target.innerHTML
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
            <input type="checkbox" id="datetime" name="datetime" checked={datetime} onChange={this.handleColumnChange} />
            <label htmlFor="datetime"> Datetime </label>
          </div>

          <div>
            <input type="checkbox" id="date" name="date" checked={date} onChange={this.handleColumnChange} />
            <label htmlFor="date"> Date </label>
          </div>

          <div>
            <input type="checkbox" id="size" name="size" checked={size} onChange={this.handleColumnChange} />
            <label htmlFor="size"> Size </label>
          </div>
        </FileColumnSettingsContainer>
      </FileSettingsPopup>
    )
  }

  /**
   * Renders a simple menu to perform actions on the clicked file
   */
  renderMenu = () => {
    if (this.state.showMenu) return (
      <div
        onMouseLeave={() => this.setState({ showMenu: false })}
        style={{
          position: "fixed",
          top: this.state.cursorY - 3,
          left: this.state.cursorX + 3,
          backgroundColor: "var(--button-color)",
          zIndex: 900,
          borderRadius: "3px"
        }}
      >
        <Button onClick={() => this.doAction("copy")}> Copy </Button>
        <Button onClick={() => this.doAction("move")}> Move </Button>
        <Button onClick={() => this.doAction("delete")}> Delete </Button>
      </div>
    )
  }

  /**
   * Render the files found in a directory
   * @param {Boolean} isNext are these the next files to be rendered, if so use props instead of state
   */
  renderFiles = (isNext) => {
    let files = [{}]
    if (isNext)  files = this.props.files
    else        files = this.state.files

    const { shownColumns } = this.state

    files = this.getOrderedItems(files).slice(this.state.from, this.state.to)

    return files
    .map(v => (
      <Fragment key={v.Name + "file"}>
        { this.renderImage(v.MimeType, v.Name) }
        {
          v.IsDir ?
            <DirNameP onClick={() => this.updatePath(v.IsDir, v.Name)} onContextMenu={this.openMenu}>{ v.Name }</DirNameP>
            :
            <FilenameP onContextMenu={this.openMenu}>{ v.Name }</FilenameP>
        }
        <ModifiedP shownColumns={shownColumns}> { shownColumns.datetime ? v.ModTime?.toLocaleString() : v.ModTime?.toLocaleDateString() } </ModifiedP>
        <SizeP shownColumns={shownColumns}> { !v.IsDir ? bytesToString(v.Size, {}) : "" } </SizeP>
    </Fragment>
    ))
  }

  /**
   * Filters and orders the files
   * @param {Array} files Array of objects that describe the file
   * @returns {Array}
   */
  getOrderedItems = files => {
    return files
    // apply search filter
    .filter(v => v.Name?.toLowerCase().indexOf(this.state.filter) !== -1)
    // sort by name
    .sort((a,b) => this.state.orderBy === "name" ? this.state.orderAscending ? a.Name.localeCompare(b.Name, 'nl', { sensitivity: 'base' }) : b.Name.localeCompare(a.Name, 'nl', { sensitivity: 'base' }) : 0)
    // // sort by modified date
    .sort((a,b) => this.state.orderBy === "modified" ? this.state.orderAscending ? a.ModTime - b.ModTime : b.ModTime - a.ModTime : 0)
    // sort by size
    .sort((a,b) => this.state.orderBy === "size" ? this.state.orderAscending ? a.Size - b.Size : b.Size - a.Size : 0)
    // // sort folders to top
    .sort((a,b) => (b.IsDir ? 1 : 0) - (a.IsDir ? 1 : 0))
  }

  /**
   * Calculates new from and to numbers for the rows that should be rendered
   * @param {Number} scrollTop pixels from the top of the div
   * @param {Number} clientHeight height of div in pixels
   */
  handleGridPosition = (scrollTop, clientHeight) => {
    const maxVisibleRows = Math.ceil(clientHeight / (ROW_HEIGHT + ROW_GAP))
    const from = Math.max(0, Math.floor(scrollTop / (ROW_HEIGHT + ROW_GAP)) - maxVisibleRows * DATA_PADDING)
    const to = Math.min(this.state.files.length, from + maxVisibleRows * (DATA_PADDING * 2 + 1))
    this.setState({from, to})
  }

  /**
   * Creates a timeout to handle the scroll event and calls the handler
   * @param {ElementEvent} e event that triggered the call to this function
   */
  handleGridScroll = e => {
    clearTimeout(this.scrollTimeout)
    const { scrollTop, clientHeight } = e.target
    this.scrollTimeout = setTimeout(this.handleGridPosition, DEBOUNCE_THRESHOLD, scrollTop, clientHeight)
  }

  // render the path the user is currently at
  renderPath = () => 
    path.join(...this.props.currentPath.split("/"))
    .split("/")
    .map((v, i) =>
      <SpanPathDirectory key={"path_"+v} onClick={() => this.goToPath(i)} style={{ cursor: "pointer" }}> /{v} </SpanPathDirectory>
  )

  render() {
    const { transitionFiles, from, to, orderBy, orderAscending, files, shownColumns } = this.state
    const rows = Math.max(this.props.files.length, files.length)

    return (
      <FBContainer>
        {
          this.renderMenu()
        }
        {
          this.renderFileSettings()
        }
        {
          this.props.loading ? <LineLoader/> : ""
        }
        <BrowserHeader>
          <BrowserHeaderDiv>
            <BrowseImage src={Back} alt="up directory" width="35" height="35" onClick={this.previousDirectory} />
            <BrowseImage src={Home} alt="root directory" width="35" height="35" onClick={this.rootDirectory} />
            <p> { this.props.currentPath !== "/" ? this.renderPath() : "/" } </p>
          </BrowserHeaderDiv>
          <BrowserHeaderDiv>
            <SearchLabel htmlFor="filterFiles" style={{ textAlign: "end" }} > Search </SearchLabel>
            <SearchInput name="filter" id="filterFiles" type="text" placeholder="search" initialValue="" autoComplete="off" onChange={this.handleInputChange} />
            <img src={SettingsCog} alt="settings" width="25" height="25" onClick={this.openFileSettings} />
          </BrowserHeaderDiv>

          <GridFileBrowser shownColumns={shownColumns}>
            <span/>
            <FilenameP onClick={() => this.updateOrder("name")} style={{ position: "relative", cursor: "pointer" }}>
              filename
              {
                orderBy === "name" &&
                <img src={CaretDown} alt={orderAscending ? "ascending" : "descending"}
                height="20" width="20"
                style={{
                  transform: orderAscending ? "rotateZ(180deg)" : undefined,
                  position: "absolute",
                  top: "2px",
                  marginLeft: ".5rem"
                  }}
                  />
              }
            </FilenameP>
            <ModifiedP shownColumns={shownColumns} onClick={() => this.updateOrder("modified")} style={{ position: "relative", cursor: "pointer" }}>
              modified
              {
                orderBy === "modified" &&
                <img src={CaretDown} alt={orderAscending ? "ascending" : "descending"}
                height="20" width="20"
                style={{
                  transform: orderAscending ? "rotateZ(180deg)" : undefined,
                  position: "absolute",
                  top: "2px",
                  marginLeft: ".5rem"
                  }}
                  />
              }
            </ModifiedP>
            <SizeP shownColumns={shownColumns} onClick={() => this.updateOrder("size")} style={{ position: "relative", cursor: "pointer" }}>
              size
              {
                orderBy === "size" &&
                <img src={CaretDown} alt={orderAscending ? "ascending" : "descending"}
                height="20" width="20"
                style={{
                  transform: orderAscending ? "rotateZ(180deg)" : undefined,
                  position: "absolute",
                  top: "2px",
                  marginLeft: ".5rem"
                  }}
                  />
              }
            </SizeP>
          </GridFileBrowser>
        </BrowserHeader>

        <BrowserWrapper onScroll={this.handleGridScroll}>
          {
            transitionFiles !== 0 &&
            <GridFileBrowser shownColumns={shownColumns} style={{
              position: "absolute",
              top: 0,
              left: 0,
              transform:
                transitionFiles < 2 && transitionFiles > 0 ?
                  "translateX(100%)" :
                  transitionFiles > -2 && transitionFiles < 0 ?
                    "translateX(-100%)" : undefined
            }}>
              {
                from > 0 &&
                <OptimisticRow shownColumns={shownColumns} style={{ height: from * (ROW_HEIGHT + ROW_GAP) }} />
              }
              { this.renderFiles(true) }
              {
                to < rows &&
                <OptimisticRow shownColumns={shownColumns} style={{ height: (rows - to) * (ROW_HEIGHT + ROW_GAP) }} />
              }
            </GridFileBrowser>
          }

          <GridFileBrowser shownColumns={shownColumns} style={{
            transform:
              transitionFiles === 2 ?
                "translateX(-100%)" : 
                  transitionFiles === -2 ?
                  "translateX(100%)" : undefined,
            display:
              transitionFiles === 3 || transitionFiles === -3 ?
                "none" : undefined
          }}>
            {
              from > 0 &&
              <OptimisticRow shownColumns={shownColumns} style={{ height: from * (ROW_HEIGHT + ROW_GAP) }} />
            }
            { this.renderFiles() }
            {
              to < rows &&
              <OptimisticRow shownColumns={shownColumns} style={{ height: (rows - to) * (ROW_HEIGHT + ROW_GAP) }} />
            }
          </GridFileBrowser>
        </BrowserWrapper>
      </FBContainer>
    )
  }
}

export default FileBrowser