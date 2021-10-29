import { Component, Fragment } from "react"
import { InfosWrapper, PopupContainer, PopupTitle, Cross, Button, IconWrapper } from "../styled"
import API from '../utils/API'
import bytesToString from "../utils/bytestring"
import secondsToTimeString from "../utils/timestring"
import Switch from 'react-switch'

import Moon from '../assets/icons/moon.svg'
import Sun from '../assets/icons/sun.svg'

class Settings extends Component {
  constructor() {
    super()
    this.state = {
      settings: {},
      show: false,
      darkTheme: false
    }

    this.lightThemeStyle = {}

    this.darkThemeStyle = {
      "--background-color": "#000",
      "--popup-background": "#222",
      "--popup-header": "#333",
      "--box-gradient": "linear-gradient(#71caf220, #3f79ad33)",
      "--status-red": "linear-gradient(#f56565aa, #c92222)",
      "--status-green": "linear-gradient(#95ee85aa, #3c891c)",
      "--text-color": "#fff",
      "--button-color": "#111",
      "--button-hover": "#181818"
    }
  }

  componentDidMount = () => {
    this.fetchSettings()

    let darkTheme = localStorage.getItem("darkTheme") || false
    if (darkTheme === "false") darkTheme = false
    if (darkTheme === "true") darkTheme = true

    this.setState({ darkTheme })
    console.log({darkTheme})

    this.htmlEl = document.documentElement

    Object.keys(this.darkThemeStyle).forEach(k => {
      this.lightThemeStyle[k] = this.htmlEl.style.getPropertyValue(k)
    })

    if (darkTheme) {
      this.switchTheme(true)
    }

    setTimeout(() => {
      this.htmlEl.style.setProperty("display", "block")
      this.htmlEl.style.setProperty("transition", "background-color .3s, color .3s")
    }, 100)
  }

  switchTheme = checked => {
    this.setState({ darkTheme: checked })
    localStorage.setItem("darkTheme", checked)

    console.log({checked})

    if (checked) {
      Object.keys(this.darkThemeStyle).forEach(k => {
        const v = this.darkThemeStyle[k]

        this.htmlEl.style.setProperty(k, v)
      })
    } else {
      Object.keys(this.lightThemeStyle).forEach(k => {
        const v = this.lightThemeStyle[k]

        this.htmlEl.style.setProperty(k, v)
      })
    }
  }

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
    const { settings, show, darkTheme } = this.state

    return (
      <Fragment>
        {
          show ? 
          this.renderSettings()
          : ""
        }

        <InfosWrapper>
          <h2> Settings </h2>
          <p> Theme </p>
          <Switch
            checked={darkTheme}
            onColor="#333"
            offColor="#ffffff"
            onHandleColor="#585858"
            offHandleColor="#efcc00"
            // height={28}
            width={50}
            handleDiameter={22}
            activeBoxShadow="unset"
            uncheckedIcon={false}
            checkedIcon={false}
            checkedHandleIcon={<IconWrapper><img src={Moon} alt="sun" height="20" width="20" /></IconWrapper>}
            uncheckedHandleIcon={<IconWrapper><img src={Sun} alt="sun" height="20" width="20" /></IconWrapper>}
            onChange={this.switchTheme}
          />

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