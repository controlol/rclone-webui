import { Component,Fragment } from 'react'
import { Button, WarningButton, Input } from '../styled'
import { FileSettingsHeader, FileSettingsPopup, FileMenuContainer, ButtonWrapper } from './fileBrowser.styled'

class FileMenu extends Component {
  constructor() {
    super()
    this.state = {
      action: "",
      newFile: ""
    }
  }

  // update newFile state
  handleInputChange = e => {
    this.setState({ newFile: e.target.value })
  }

  // start the action
  doAction = e => {
    if (typeof e?.preventDefault === "function") e.preventDefault()

    const { action, newFile } = this.state

    this.props.action(action, newFile)
  }

  // after clicking new folder or rename show popup to enter file name
  handlePathClick = (e, action) => {
    e.stopPropagation()
    return this.setState({ action  })
  }

  // after clicking copy or move show the dest path
  handleSyncClick = (e, action) => {
    e.stopPropagation()
    this.setState({ action })
  }

  // show delete warning and stop close menu
  handleDeleteClick = e => {
    e.stopPropagation()
    this.setState({ action: "delete" })
  }

  // ask user to enter a path and submit
  renderPathPopup = () => {
    const { newFile, action } = this.state
    const { file } = this.props.info

    if (action === "rename" || action === "newfolder") return (
      <FileSettingsPopup onClick={e => e.stopPropagation()}>
        <label htmlFor="newFile">
          <FileSettingsHeader> { action === "rename" ? `Renaming ${file.Name}` : "New Folder" } </FileSettingsHeader>
        </label>

        <form onSubmit={this.doAction}>
          <Input type="text" name="newFile" id="newFile" autoFocus value={newFile} onChange={this.handleInputChange} autoComplete="off" />
          <Button onClick={this.doAction}> Submit </Button>
        </form>
      </FileSettingsPopup>
    )
  }

  // ask user to confirm the copy or move
  renderConfirmPath = () => {
    const { action } = this.state
    const { otherPath, file } = this.props.info

    if (action === "copy" || action === "move") return (
      <FileSettingsPopup>
        <FileSettingsHeader> Confirm </FileSettingsHeader>
        <p>
          { action === "copy" ? "Copy" : "Move" } { file.Name } to { otherPath }?
        </p>
        <ButtonWrapper>
          <Button onClick={() => this.props.action()}>Cancel</Button>
          <Button onClick={this.doAction}>{ action === "copy" ? "Copy" : "Move" }</Button>
        </ButtonWrapper>
      </FileSettingsPopup>
    )
  }

  /**
   * Renders a simple menu to perform actions on the clicked file
   */
  renderMenu = () => {
    const { cursorX, cursorY, file } = this.props.info
    const { action } = this.state

    if (file?.Name?.length && (action === "delete" || action === "")) return (
      <FileMenuContainer
        onMouseLeave={() => this.setState({ showMenu: false })}
        cursorX={cursorX} cursorY={cursorY}
      >
        <Button onClick={e => this.handlePathClick(e, "newfolder")}> New Folder </Button>
        <Button onClick={e => this.handleSyncClick(e, "copy")}> Copy </Button>
        <Button onClick={e => this.handleSyncClick(e, "move")}> Move </Button>
        <Button onClick={e => this.handlePathClick(e, "rename")}> Rename </Button>
        {
          action === "delete" ?
          <WarningButton onClick={this.doAction}> Delete </WarningButton>
          :
          <Button onClick={this.handleDeleteClick}> Delete </Button>
        }
      </FileMenuContainer>
    )

    if (action === "") return (
      <FileMenuContainer
        onMouseLeave={() => this.doAction()}
        cursorX={cursorX} cursorY={cursorY}
      >
        <Button onClick={e => this.handlePathClick(e, "newfolder")}> New Folder </Button>
      </FileMenuContainer>
    )
  }

  render = () => {
    return (
      <Fragment>
        { this.renderMenu() }
        { this.renderConfirmPath() }
        { this.renderPathPopup() }
      </Fragment>
    )
  }
}

export default FileMenu