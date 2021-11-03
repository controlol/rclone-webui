import { Component, Fragment } from 'react'
import ReactTooltip from 'react-tooltip'

import { Container, HeaderContainer, InfosContainer, InfosWrapper, ItemsContainer, ActiveContainer, HistoryContainer, HistoryItem, HistoryItemsWrapper, LogoContainer, StatusContainer, StatusBulb, InfosRow } from './styled'

import API from './utils/API'
import secondsToTimeString from './utils/timestring'
import bytesToString from './utils/bytestring'

import Settings from './components/settings'
import Job from './components/job'
import Navigation from './components/navigation'
import FileBrowserMenu from './components/fileBrowserMenu'

class App extends Component {
  constructor() {
    super()
    this.state = {
      stats: {
        // bytes: 0,
        // checks: 0,
        // deletedDirs: 0,
        // deletes: 0,
        // elapsedTime: 0,
        // errors: 0,
        // eta: null,
        // fatalError: false,
        // renames: 0,
        // retryError: false,
        // speed: 0,
        // totalBytes: 0,
        // totalChecks: 0,
        // totalTransfers: 0,
        // transferTime: 0,
        // transfers: 0,
        // transferring: [
        //   {
        //     speed: 23534245,
        //     group: "job/1",
        //     size: 23457826345,
        //     eta: 3600,
        //     name: "a very very very long absurdly unneccesarily long name this is if you cant tell"
        //   }
        // ]
      },
      remotes: [{
        // name: "gdrive",
        // type: "drive",
        // bytes: 84265292526
      }],
      mounts: [],
      transferred: [],
      version: {
        // "arch": "amd64",
        // "decomposed": [
        //   1,
        //   56,
        //   2
        // ],
        // "goTags": "none",
        // "goVersion": "go1.16.8",
        // "isBeta": false,
        // "isGit": false,
        // "linking": "static",
        // "os": "linux",
        // "version": "v1.56.2"
      },
      endPointAvailable: true,
      renderBrowser: false
    }

    this.infoInterval = undefined
    this.timeInterval = undefined
    this.apiInterval = undefined
  }

  componentDidMount = () => {
    // fetch initial info
    this.fetchRemotes()
    this.fetchMounts()
    this.fetchVersionInfo()
    this.fetchInfos()

    // get server stats every 5 seconds
    if (this.infoInterval === undefined) this.infoInterval = setInterval(this.fetchInfos, 5000)

    // make the view look more responsive by counting every second
    if (this.timeInterval === undefined) this.timeInterval = setInterval(() => {
      let { stats } = this.state
      stats.elapsedTime++
      this.setState({ stats })
    }, 1000)

    // check api status every second
    if (this.apiInterval === undefined) this.apiInterval = setInterval(this.checkApiEndpoint, 1000)
  }

  // clear the intervals
  componentWillUnmount = () => {
    clearInterval(this.infoInterval)
    clearInterval(this.timeInterval)
    clearInterval(this.apiInterval)
  }

  /**
   * check if the api is still available
   * if state changes show this to the user
   * also updates the favicon
   */
  checkApiEndpoint = () => {
    const status = API.getEndpointStatus()
    if (status !== this.state.endPointAvailable) {
      this.setState({ endPointAvailable: !this.state.endPointAvailable })

      const link = document.querySelectorAll("link[rel~='icon']");

      link.forEach(v => {
        let segments = v.href.split(".")
        if (status) {
          segments[0] = segments[0].substring(0, segments[0].length - 3)
        } else {
          segments[0] += "-gs"
        }
        v.href = segments.join(".")
      })

      // get info after api recovers
      if (status) {
        this.fetchRemotes()
        this.fetchMounts()
        this.fetchVersionInfo()
      }
    }
  }

  /**
   * get the configured remotes
   */
  fetchRemotes = () => {
    return API.request({
      url: "/config/dump",
      "_group": "ui"
    })
    .then(response => {
      if (typeof response.data !== "object") throw new Error("invalid response")

      let remotes = []

      return Promise.all(Object.keys(response.data).map(v => {
        return new Promise((resolve, reject) => {
          return API.request({
            url: "/operations/about",
            data: {
              fs: v + ":"
            }
          })
          .then(({data}) => {
            if (typeof data !== "object" || isNaN(data.used)) return reject()

            remotes.push({
              name: v,
              type: response.data[v].type,
              bytes: data.used
            })

            return resolve()
          })
          .catch(reject)
        })
      })
      )
      .then(() => {
        this.setState({ remotes })
      })
      .catch(err => console.error(err))
    })
    .catch(() => {})
  }

  /**
   * get the mounted volumes
   */
  fetchMounts = () => {
    return API.request({
      url: "/mount/listmounts"
    })
    .then(response => {
      if (typeof response.data.mountPoints !== "object") throw new Error("invalid response")

      this.setState({ mounts: response.data.mountPoints })
    })
    .catch(() => {})
  }

  /**
   * get software versions and architecture info
   */
  fetchVersionInfo = () => {
    return API.request({
      url: "/core/version"
    })
    .then(response => {
      if (typeof response.data !== "object") throw new Error("invalid response")

      this.setState({ version: response.data })
    })
    .catch(() => {})
  }

  /**
   * gets the server stats
   */
  fetchInfos = () => {
    return API.request({
      url: "/core/stats"
    })
    .then(response => {
      if (typeof response.data !== "object") throw new Error("invalid response")
      const stats = response.data

      if (stats.transfers === 0) return this.setState({ stats })

      return API.request({
        url: "core/transferred"
      })
      .then(response => {
        if (typeof response.data.transferred !== "object") throw new Error("invalid response")

        let transferred = []

        response.data.transferred.sort((a,b) => new Date(b.completed_at) - new Date(a.completed_at)).forEach(v => {
          if (v.error.length === 0 && v.bytes > 0) return transferred.push(v)
        })

        this.setState({ transferred, stats })
      })
      .catch(() => this.setState({ stats }))
    })
    .catch(() => {})
  }

  openBrowser = name => {
    let browserFs = JSON.parse(sessionStorage.getItem("browserFs")),
        currentPath = JSON.parse(sessionStorage.getItem("currentPath"))

    if (browserFs === null) browserFs = ["", ""]
    if (currentPath === null) currentPath = ["/", "/"]

    if (typeof name === "string") {
      browserFs[0] = name
      currentPath[0] = "/"
    }

    sessionStorage.setItem("browserFs", JSON.stringify(browserFs))
    sessionStorage.setItem("currentPath", JSON.stringify(currentPath))

    this.setState({ renderBrowser: true })
  }

  renderFileBrowser = () => {
    if (this.state.renderBrowser) return (
      <FileBrowserMenu close={() => this.setState({ renderBrowser: false })} remotes={this.state.remotes} />
    )

    return <Fragment />
  }

  /**
   * renders the total speed of all transfers
   * @returns {String}
   */
  renderLiveSpeed = () => {
    const transferring = this.state.stats.transferring

    if (typeof transferring !== "object") return "0.00 MB/s";

    let speed = 0

    transferring.forEach(v => speed += v.speed)

    return bytesToString(speed, { speed: true })
  }

  /**
   * renders the list of remotes
   * @returns {Component}
   */
  renderRemotes = () => {
    return this.state.remotes.map(v => (
      <InfosRow
        key={"mount" + v.name}
        data-tip={bytesToString(v.bytes, { fixed: 2 })}
        data-for={"size"+v.MountPoint}
        onClick={() => this.openBrowser(v.name)}
      >
        <p>{v.name}</p>
        <p>{v.type}</p>
        {/* add EDIT button */}
        <ReactTooltip id={"size"+v.MountPoint} place="left" type="info" effect="solid" globalEventOff="click" />
      </InfosRow>
    ))
  }

  /**
   * renders the list of mounts
   * @returns {Component}
   */
  renderMounts = () => {
    return this.state.mounts.map(v => (
      <Fragment key={v.MountPoint} >
        <p> {v.Fs} </p>
        <p> {v.MountPoint} </p>
        {/* add DELETE button */}
      </Fragment>
    ))
  }

  /**
   * Each job gets it's own component and is rendered if there are any
   * Jobs are found by their transfer group
   * @returns {Job}
   */
  renderActiveJobs = () => {
    if (typeof this.state.stats.transferring !== "object") return;

    let activeJobIds = []

    const { transferring } = this.state.stats

    transferring.forEach(v => {
      if (!activeJobIds.includes(v.group)) activeJobIds.push(v.group)
    })

    return activeJobIds.map(group => {
      const fileTransfers = transferring.filter(v => v.group === group)

      return <Job key={group} fileTransfers={fileTransfers} jobid={group.replace(/\D/g, '')} refreshStats={this.fetchInfos} />
    })
  }

  /**
   * Renders all history items
   * @returns {Component[]}
   */
  renderHistory = () => {
    return this.state.transferred.map((v, i) => (
      <HistoryItem key={"transfer" + i}>
        <p> { v.name } </p>
        <p> { new Date(v.completed_at).toLocaleString() } </p>
      </HistoryItem>
    ))
  }

  render = () => {
    const { stats, version, endPointAvailable } = this.state
    const { elapsedTime, transfers, bytes, errors, lastError, transferring } = stats

    return (
      <Fragment>
        {
          this.renderFileBrowser()
        }

        <HeaderContainer>
          <LogoContainer>
            <img src="/favicon-64x64.png" alt="Rclone WebUI logo" width="64" height="64" />
            <h1> Rclone Dashboard </h1>
          </LogoContainer>

          <StatusContainer>
            <StatusBulb style={{ background: endPointAvailable ? "var(--status-green)" : "var(--status-red)" }} />
            { endPointAvailable ? "API endpoint is behaving normally" : "API endpoint is unavailable" }
          </StatusContainer>
        </HeaderContainer>

        <Navigation info={{ errors, lastError }} openBrowser={this.openBrowser} />

        <Container>
          <ItemsContainer>
            <ActiveContainer>
              <h1> Active Jobs </h1>
                { this.renderActiveJobs() }
            </ActiveContainer>
            <HistoryContainer>
              <h1> History </h1>
              <HistoryItemsWrapper>
                { this.renderHistory() }
              </HistoryItemsWrapper>
            </HistoryContainer>
          </ItemsContainer>

          <InfosContainer>
            <InfosWrapper style={{ minHeight: "10rem" }}>
              <h2> Stats </h2>
              <p> Uptime </p>
              <p> { secondsToTimeString(elapsedTime, true) } </p>
              
              <p> Speed </p>
              <p> { this.renderLiveSpeed() } </p>

              <p> Active transfers </p>
              <p> { (transferring?.length ? transferring.length : 0) + (transferring?.length === 1 ? " file" : " files" )} </p>

              <p> Total transfered files </p>
              <p> { (transfers ? transfers : 0) + (transfers === 1 ? " file" : " files" )} </p>

              <p> Total transferred data </p>
              <p> { bytesToString(bytes, {}) } </p>
            </InfosWrapper>

            <InfosWrapper style={{ minHeight: "6rem" }}>
              <h2> Remotes </h2> {/* add NEW button */}
              { this.renderRemotes() }
            </InfosWrapper>

            <InfosWrapper style={{ minHeight: "4.5rem" }}>
              <h2> Mounts </h2> {/* add NEW button */}
              { this.renderMounts() }
            </InfosWrapper>

            <Settings />

            <InfosWrapper>
              <h2> System Info </h2>
              <p> Rclone version </p>
              <p> { version.version } </p>

              <p> GO version </p>
              <p> { version.goVersion } </p>
              
              <p> Architecture </p>
              <p> { version.arch } </p>
            </InfosWrapper>
          </InfosContainer>
        </Container>
      </Fragment>
    )
  }
}

export default App
