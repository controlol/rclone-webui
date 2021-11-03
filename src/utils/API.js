import axios from 'axios'

class API {
  constructor() {
    this.available = true
    this.retryInterval = undefined
    this.instance = axios.create({
      method: "POST"
    })
  }

  request = options => {
    return new Promise((resolve, reject) => {
      if (!this.available) return reject()

      return this.instance(options)
      .then(response => {
        if (!response.data) throw new Error("no data in response")
        this.available = true
        return resolve(response)
      })
      .catch(err => {
        // endpoint was unreachable
        if (
          (
            !err
            || !err.response
            || (
              err.response.status >= 400
              && err.response.status < 500
            )
          )
          && this.available
        ) {
          this.available = false
          if (this.retryInterval === undefined) this.retryInterval = setInterval(this.retryStatus, 5000);
        }

        // log error and reject
        if (err?.response?.data?.error) {
          console.error(err.response.status, err.response.data.error)
          return reject(err.response.data.error)
        }
        return reject()
      })
    })
  }

  /**
   * when the endpoint is unavailable it will be retried every 5 seconds
   */
  retryStatus = () => {
    return this.instance({
      url: "/core/version"
    })
    .then(() => {
      this.available = true
      clearInterval(this.retryInterval)
    })
    .catch(err => {})
  }

  getEndpointStatus = () => this.available
}

const APIClass = new API()

export default APIClass