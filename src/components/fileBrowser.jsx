import { Component, Fragment } from 'react'
import path from 'path'
import styled from 'styled-components'
import { FileSettingsHeader, FileSettingsPopup, Label } from './fileBrowser.styled.js'
import { Input } from '../styled'

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

const ROW_HEIGHT = 28
const ROW_GAP = 0
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
  border-radius: .3rem;
  box-shadow: ${({active}) => active ? "0 0 6px -3px var(--tertiary-color)" : ""};
`

// bunch of styled components
const BrowserWrapper = styled.div`
  height: inherit;
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  position: relative;
  background: var(--box-radial-gradient);
  border-radius: 0 0 .3rem .3rem;
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
  /* gap: .5rem 1.5rem; */
  gap: 0 1.5rem;
  width: 100%;
  transition: transform .3s;
  /* padding: .5rem; */
  padding: 0 .5rem;
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
  padding-left: .5rem;

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
  line-height: 28px;
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
`
const SearchInput = styled(Input)`
  width: 15rem;

  @media only screen and (max-width: 800px) {
    width: 100%;
  }
`

const FileMenuContainer = styled.div`
  position: fixed;
  top: ${({cursorY}) => cursorY - 3}px;
  left: ${({cursorX}) => cursorX + 3}px;
  background-color: var(--button-color);
  z-index: 900;
  border-radius: .2rem;

  div {
    text-align: left;
  }
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
      showNewFolder: false,
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
  }

  handleWindowClick = () => this.setState({ showMenu: false, showNewFolder: false })

  isMenuOpen = () => this.props.menuOpen || this.state.showMenu || this.state.showNewFolder

  // used to filter the files
  handleInputChange({target}) {
    clearTimeout(this.searchTimeout)

    const value = target.type === 'checkbox' ? target.checked : target.value

    this.searchTimeout = setTimeout(this.doSearch, 200, value.toLowerCase())
  }

  doSearch = filter => this.setState({ filter })

  // change the way files should be ordered
  updateOrder = orderBy => {
    if (this.isMenuOpen()) return;

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
  updatePath = name => {
    if (this.isMenuOpen()) return;

    const newPath = path.join(this.props.currentPath, name)

    this.props.updateFiles(newPath)
    this.setState({filter: ""})
  }

  // after the user clicks on the back button
  previousDirectory = () => {
    if (this.isMenuOpen()) return;

    let currentPath = this.props.currentPath.split("/")
    currentPath.pop()

    this.props.updateFiles(currentPath.join("/"))
    this.setState({filter: ""})
  }

  // after the user click on the home button
  rootDirectory = () => {
    if (this.isMenuOpen()) return;

    this.props.updateFiles("/")
    this.setState({filter: ""})
  }

  // after the user clicks on a path piece
  goToPath = index => {
    if (this.isMenuOpen()) return;

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
  openMenu = (e, isFile) => {
    e.preventDefault()
    e.stopPropagation()

    assert(
      typeof e.pageX === "number"
      && typeof e.pageY === "number"
      && typeof e.target.innerHTML === "string"
      && e.target.innerHTML.length > 0
    )

    if (isFile) {
      this.setState({
        cursorX: e.pageX,
        cursorY: e.pageY,
        showMenu: true,
        clicked: e.target.innerHTML
      })
    } else {
      this.setState({
        cursorX: e.pageX,
        cursorY: e.pageY,
        showMenu: true,
        clicked: ""
      })
    }
  }

  openNewFolderPopup = e => {
    e.stopPropagation()
    return this.setState({ showNewFolder: true, showMenu: false })
  }

  handleNewFolderSubmit = e => {
    e.preventDefault()
    this.props.action("newfolder", e.target.newFolderName.value)
    .then(() => this.setState({ showNewFolder: false }))
    .catch(err => {
      console.error(err)
      this.setState({ showNewFolder: false })
    }) // the user should see this error
  }

  renderNewFolderPopup = () => {
    if (this.state.showNewFolder) return (
      <FileSettingsPopup onClick={e => e.stopPropagation()}>
        <label htmlFor="newFolderName">
          <FileSettingsHeader> New Folder </FileSettingsHeader>
        </label>

        <form onSubmit={this.handleNewFolderSubmit}>
          <Input type="text" name="newFolderName" id="newFolderName" autoFocus defaultValue="" autoComplete="off" />
          <input type="submit" style={{visibility: "hidden"}} />
        </form>
      </FileSettingsPopup>
    )
  }

  /**
   * Renders a simple menu to perform actions on the clicked file
   */
  renderMenu = () => {
    const { cursorX, cursorY, showMenu, clicked } = this.state

    if (showMenu && clicked.length) return (
      <FileMenuContainer
        onMouseLeave={() => this.setState({ showMenu: false })}
        cursorX={cursorX} cursorY={cursorY}
      >
        <Button onClick={() => this.doAction("copy")}> Copy </Button>
        <Button onClick={() => this.doAction("move")}> Move </Button>
        <Button onClick={() => this.doAction("delete")}> Delete </Button>
        <Button onClick={this.openNewFolderPopup}> New Folder </Button>
      </FileMenuContainer>
    )

    if (showMenu) return (
      <FileMenuContainer
        onMouseLeave={() => this.setState({ showMenu: false })}
        cursorX={cursorX} cursorY={cursorY}
      >
        <Button onClick={this.openNewFolderPopup}> New Folder </Button>
      </FileMenuContainer>
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

    const { shownColumns } = this.props

    files = this.getOrderedItems(files).slice(this.state.from, this.state.to)

    return files
    .map(({ Name, IsDir, Size, ModTime, MimeType }) => (
      <Fragment key={Name + "file"}>
        { this.renderImage(MimeType, Name) }
        {
          IsDir ?
            <DirNameP onClick={() => this.updatePath(Name)} onContextMenu={e => this.openMenu(e, true)}>{ Name }</DirNameP>
            :
            <FilenameP onContextMenu={e => this.openMenu(e, true)}>{ Name }</FilenameP>
        }
        <ModifiedP shownColumns={shownColumns}> { shownColumns.datetime ? ModTime?.toLocaleString() : ModTime?.toLocaleDateString() } </ModifiedP>
        <SizeP shownColumns={shownColumns}> { !IsDir ? bytesToString(Size, {}) : "" } </SizeP>
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
    const { transitionFiles, from, to, orderBy, orderAscending, files } = this.state
    const { shownColumns, loading, active, setActive, currentPath } = this.props
    const rows = Math.max(this.props.files.length, files.length)

    return (
      <FBContainer active={active} onClick={setActive}>
        { this.renderMenu() }
        { this.renderNewFolderPopup() }
        { loading === true && <LineLoader/> }

        <BrowserHeader>
          <BrowserHeaderDiv>
            <BrowseImage src={Back} alt="up directory" width="25" height="25" onClick={this.previousDirectory} />
            <BrowseImage src={Home} alt="root directory" width="25" height="25" onClick={this.rootDirectory} />
            <p> { currentPath !== "/" ? this.renderPath() : "/" } </p>
          </BrowserHeaderDiv>
          <BrowserHeaderDiv>
            <SearchLabel htmlFor="filterFiles" style={{ textAlign: "end" }} > Search </SearchLabel>
            <SearchInput name="filter" id="filterFiles" type="text" placeholder="search" initialValue="" autoComplete="off" onChange={this.handleInputChange} />
          </BrowserHeaderDiv>

          <GridFileBrowser shownColumns={shownColumns}>
            <span/>
            <FilenameP onClick={() => this.updateOrder("name")} style={{ position: "relative", cursor: "pointer" }}>
              filename
              {
                orderBy === "name" &&
                <img src={CaretDown} alt={orderAscending ? "ascending" : "descending"}
                height="12" width="12"
                style={{
                  transform: orderAscending ? "rotateZ(180deg)" : undefined,
                  position: "absolute",
                  top: 6,
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
                height="12" width="12"
                style={{
                  transform: orderAscending ? "rotateZ(180deg)" : undefined,
                  position: "absolute",
                  top: 6,
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
                height="12" width="12"
                style={{
                  transform: orderAscending ? "rotateZ(180deg)" : undefined,
                  position: "absolute",
                  top: 6,
                  marginLeft: ".5rem"
                  }}
                  />
              }
            </SizeP>
          </GridFileBrowser>
        </BrowserHeader>

        <BrowserWrapper onScroll={this.handleGridScroll} onContextMenu={e => this.openMenu(e, false)}>
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