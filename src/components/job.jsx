import { Component, Fragment } from "react"
import { ActiveJob, ActiveTransfer, StopButton } from "../styled"
import API from '../utils/API'
import bytesToString from "../utils/bytestring"
import secondsToTimeString from "../utils/timestring"

class Job extends Component {
  constructor() {
    super()
    this.state = {
      jobstatus: {
        progress: 0,
        eta: 0
      },
      stats: {

      },
      jobid: 0
    }

    this.decreaseEtaInterval = undefined
    this.fetchStatsInterval = undefined
    this.fetchJobInterval = undefined
  }

  componentDidMount = () => {
    // this.setState({ jobid: this.props.fileTransfers[0].group.replace(/\D/g, '') })

    this.fetchJobInfo(this.props.fileTransfers[0].group.replace(/\D/g, ''))
    this.fetchStats()

    if (this.decreaseEtaInterval === undefined) this.decreaseEtaInterval = setInterval(() => {
      let { stats } = this.state

      if (stats.eta > 1) stats.eta--
      stats.elapsedTime++
      stats.transferring?.forEach(v => {if (v.eta > 1) v.eta--})

      this.setState({ stats })
    }, 1000)

    if (this.fetchStatsInterval === undefined) this.fetchStatsInterval = setInterval(this.fetchStats, 5 * 1000)
    if (this.fetchJobInterval === undefined) this.fetchJobInterval = setInterval(this.fetchJobInfo, 30 * 1000)
  }

  componentWillUnmount = () => {
    clearInterval(this.decreaseEtaInterval)
    // clearInterval(this.fetchStatsInterval)
    clearInterval(this.fetchJobInterval)
  }

  fetchStats = () => {
    return API.request({
      url: "/core/stats",
      data: {
        group: "job/" + this.props.jobid
      }
    })
    .then(response => {
      if (typeof response.data !== "object") return new Error("invalid response")

      this.setState({ stats: response.data })
    })
    .catch(() => {})
  }

  fetchJobInfo = id => {
    if (!id) id = this.state.jobid

    return API.request({
      url: "/job/status",
      data: {
        jobid: this.props.jobid
      }
    })
    .then(response => {
      if (typeof response.data !== "object") throw new Error("invalid response")

      this.setState({ jobstatus: response.data })
    })
    .catch(() => {})
  }

  stopJob = () => {
    return API.request({
      url: "/job/stop",
      data: {
        jobid: this.props.jobid
      }
    })
    .then(() => this.props.refreshStats())
    .catch(() => {})
  }

  renderSize = bytes => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB"
  }

  renderSpeed = bytes => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB/s"
  }

  renderActiveTransfer = () => {
    const { transferring } = this.state.stats

    if (typeof transferring !== "object") return;

    return transferring.map(v => (
      <ActiveTransfer key={v.name}>
        <p> { v.name } </p>
        <p> { this.renderSize(v.size) } </p>
        <p> { secondsToTimeString(v.eta) } </p>
        <p> { this.renderSpeed(v.speed) } </p>
      </ActiveTransfer>
    ))
  }

  render = () => {
    const { stats } = this.state

    return (
      <Fragment>

          <ActiveJob>
            <p> Time elapsed: </p>
            <p> { secondsToTimeString(stats.elapsedTime) } </p>
            <p> Progress: </p>
            <p> { bytesToString(stats.bytes, { format: "GB", fixed: 3 }) } / { bytesToString(stats.totalBytes, { format: "GB", fixed: 3 }) } GB </p>
            <span/>

            <p> Time left: </p>
            <p> { secondsToTimeString(stats.eta) } </p>
            <p> Progress: </p>
            <p> { ((stats.bytes / stats.totalBytes) * 100).toFixed(2) } % </p>
            <span/>

            <StopButton onClick={this.stopJob}> Cancel </StopButton>
          </ActiveJob>
          { this.renderActiveTransfer() }
      </Fragment>
    )
  }
}

export default Job