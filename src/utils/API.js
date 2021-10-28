import axios from 'axios'

const API = axios.create({
  method: "POST",
  baseURL: "http://192.168.1.70:5572"
})

export default API