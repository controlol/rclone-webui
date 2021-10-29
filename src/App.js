import API from './utils/API'
import { Component, Fragment } from 'react'
import { Container, HeaderContainer, InfosContainer, InfosWrapper, ItemsContainer, ActiveContainer, HistoryContainer, HistoryItem, HistoryItemsWrapper, LogoContainer, StatusContainer, StatusBulb } from './styled'
import Job from './components/job'
import secondsToTimeString from './utils/timestring'
import bytesToString from './utils/bytestring'
import Settings from './components/settings'

class App extends Component {
  constructor() {
    super()
    this.state = {
      stats: {
        bytes: 0,
        checks: 0,
        deletedDirs: 0,
        deletes: 0,
        elapsedTime: 0,
        errors: 0,
        eta: null,
        fatalError: false,
        renames: 0,
        retryError: false,
        speed: 0,
        totalBytes: 0,
        totalChecks: 0,
        totalTransfers: 0,
        transferTime: 0,
        transfers: 0
      },
      remotes: [],
      mounts: [],
      transferred: [],
      version: {
        "arch": "amd64",
        "decomposed": [
          1,
          56,
          2
        ],
        "goTags": "none",
        "goVersion": "go1.16.8",
        "isBeta": false,
        "isGit": false,
        "linking": "static",
        "os": "linux",
        "version": "v1.56.2"
      },
      endPointAvailable: true
    }

    this.infoInterval = undefined
    this.timeInterval = undefined
    this.apiInterval = undefined
  }

  componentDidMount = () => {
    this.fetchRemotes()
    this.fetchMounts()
    this.fetchVersionInfo()

    this.fetchInfos()
    if (this.apiInterval === undefined) this.apiInterval = setInterval(this.checkApiEndpoint, 1000)
    if (this.infoInterval === undefined) this.infoInterval = setInterval(this.fetchInfos, 5000)
    if (this.timeInterval === undefined) this.timeInterval = setInterval(() => {
      let { stats } = this.state
      stats.elapsedTime++
      this.setState({ stats })
    }, 1000)
  }

  componentWillUnmount = () => {
    clearInterval(this.infoInterval)
    clearInterval(this.timeInterval)
    clearInterval(this.apiInterval)
  }

  checkApiEndpoint = () => {
    if (API.getEndpointStatus() !== this.state.endPointAvailable) this.setState({ endPointAvailable: !this.state.endPointAvailable })
  }

  fetchRemotes = () => {
    return API.request({
      url: "/config/dump",
      "_group": "ui"
    })
    .then(response => {
      if (typeof response.data !== "object") throw new Error("invalid response")

      let remotes = []

      Object.keys(response.data).forEach(v => {
        remotes.push({
          name: v,
          type: response.data[v].type
        })
      })

      this.setState({ remotes })
    })
    .catch(() => {})
  }

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

  fetchInfos = () => {
    return API.request({
      url: "/core/stats"
    })
    .then(response => {
      if (typeof response.data !== "object") throw new Error("invalid response")
      const stats = response.data

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

  renderLiveSpeed = () => {
    const transferring = this.state.stats.transferring

    if (typeof transferring !== "object") return "0.00 MB/s";

    let speed = 0

    transferring.forEach(v => speed += v.speed)

    return bytesToString(speed, { speed: true })
  }

  renderActiveTransferCount = () => {
    const transferring = this.state.stats.transferring

    if (!transferring || typeof transferring !== "object") return "0 files"
    return transferring.length + " files"
  }

  renderRemotes = () => {
    return this.state.remotes.map(v => (
      <Fragment key={v.name}>
        <p> {v.name} </p>
        <p> {v.type} </p>
      </Fragment>
    ))
  }

  renderMounts = () => {
    return this.state.mounts.map(v => (
      <Fragment key={v.MountPoint}>
        <p> {v.Fs} </p>
        <p> {v.MountPoint} </p>
      </Fragment>
    ))
  }

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

    return (
      <Fragment>
        <HeaderContainer>
          <LogoContainer>
            <img src="/favicon.ico" alt="Rclone WebUI logo" width="64" height="64" />
            <h1> Rclone Dashboard </h1>
          </LogoContainer>

          <StatusContainer>
            <StatusBulb style={{ background: endPointAvailable ? "var(--status-green)" : "var(--status-red)" }} />
            { endPointAvailable ? "API endpoint is behaving normally" : "API endpoint is unavailable" }
          </StatusContainer>
        </HeaderContainer>
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
              <p> { secondsToTimeString(stats.elapsedTime, true) } </p>
              
              <p> Speed </p>
              <p> { this.renderLiveSpeed() } </p>

              <p> Active transfers </p>
              <p> { this.renderActiveTransferCount() } </p>

              <p> Total transfered files </p>
              <p> { stats.totalTransfers } </p>

              <p> Total transferred data </p>
              <p> { bytesToString(stats.bytes, {}) } </p>
            </InfosWrapper>

            <InfosWrapper style={{ minHeight: "6rem" }}>
              <h2> Remotes </h2>
              { this.renderRemotes() }
            </InfosWrapper>

            <InfosWrapper style={{ minHeight: "4.5rem" }}>
              <h2> Mounts </h2>
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