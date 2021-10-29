import { Component, Fragment } from "react"
import { InfosWrapper, PopupContainer, PopupTitle, Cross, Button } from "../styled"
import API from '../utils/API'
import bytesToString from "../utils/bytestring"
import secondsToTimeString from "../utils/timestring"

class Settings extends Component {
  constructor() {
    super()
    this.state = {
      settings: {},
      show: false
    }
  }

  componentDidMount = () => this.fetchSettings()

  fetchSettings = () => {
    return new Promise((resolve) => {
      return API.request({
        url: "/options/get"
      })
      .then(response => {
        if (typeof response.data !== "object") return new Error("invalid response")
  
        this.setState({ settings: response.data })

        return resolve()
      })
      .catch(() => {})
    })
  }

  showSettings = () => {
    return this.fetchSettings()
    .then(() => this.setState({ show: true }))
  }

  renderSettings = () => {
    return (
      <PopupContainer>
        <PopupTitle> Settings </PopupTitle>
        <Cross onClick={() => this.setState({ show: false })}> Close </Cross>

        <pre>
        {
          JSON.stringify(this.state.settings, null, 4)
        }
        </pre>
      </PopupContainer>
    )
  }

  render =  () => {
    const { settings, show } = this.state

    return (
      <Fragment>
        {
          show ? 
          this.renderSettings()
          : ""
        }

        <InfosWrapper>
          <h2> Settings </h2>
          <p> Cache max size </p>
          <p> { bytesToString(settings?.vfs?.CacheMaxSize, {}) } </p>

          <p> Cache max age </p>
          <p> { secondsToTimeString(settings?.vfs?.CacheMaxAge / 1000000000, true) } </p>

          <p> File min age </p>
          <p> { secondsToTimeString(settings?.filter?.MinAge / 1000000000, true) } </p>

          <Button onClick={this.showSettings}> List Settings </Button>
        </InfosWrapper>
      </Fragment>
    )
  }
}

export default Settings