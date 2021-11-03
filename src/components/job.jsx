import { Component, Fragment } from "react"
import { ActiveJob, ActiveTransfer, StopButton } from "../styled"
import API from '../utils/API'
import bytesToString from "../utils/bytestring"
import secondsToTimeString from "../utils/timestring"

class Job extends Component {
  constructor() {
    super()
    this.state = {
      stats: {
        elapsedTime: 0,
        eta: 3600,
        bytes: 1024 * 1024 * 128,
        totalBytes: 1024 * 1024 * 1024,
        transferring: [
          {
            speed: 23534245,
            group: "job/1",
            size: 23457826345,
            eta: 3600,
            name: "a very very very long absurdly unneccesarily long name this is if you cant tell"
          }
        ]
      },
      jobid: 0
    }

    this.decreaseEtaInterval = undefined
    this.fetchStatsInterval = undefined
  }

  componentDidMount = () => {
    this.fetchStats()

    // make the view look more responsive by counting every second
    if (this.decreaseEtaInterval === undefined) this.decreaseEtaInterval = setInterval(() => {
      let { stats } = this.state

      if (stats.eta > 1) stats.eta--
      stats.elapsedTime++
      stats.transferring?.forEach(v => {if (v.eta > 1) v.eta--})

      this.setState({ stats })
    }, 1000)

    // get job stats every 5 seconds
    if (this.fetchStatsInterval === undefined) this.fetchStatsInterval = setInterval(this.fetchStats, 5 * 1000)
  }

  // clear the intervals
  componentWillUnmount = () => {
    clearInterval(this.decreaseEtaInterval)
    clearInterval(this.fetchStatsInterval)
  }

  /**
   * get the stats from the job this component displays
   */
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

  /**
   * Immediately cancels the current job
   */
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

  /**
   * render each transfer with info
   */
  renderActiveTransfer = () => {
    const { transferring } = this.state.stats

    if (typeof transferring !== "object") return;

    return transferring.map(v => (
      <ActiveTransfer key={v.name}>
        <p> { v.name } </p>
        <p> { bytesToString(v.size, {}) } </p>
        <p> { secondsToTimeString(v.eta) } </p>
        <p> { bytesToString(v.speed, { speed: true }) } </p>
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

            <p> Time left: </p>
            <p> { secondsToTimeString(stats.eta) } </p>
            <p> Progress: </p>
            <p> { ((stats.bytes / stats.totalBytes) * 100 || 0).toFixed(2) } % </p>

            <p> Speed: </p>
            <p> { bytesToString(stats.speed, { speed: true }) } </p>

            <StopButton onClick={this.stopJob}> Cancel </StopButton>
          </ActiveJob>
          { this.renderActiveTransfer() }
      </Fragment>
    )
  }
}

export default Job