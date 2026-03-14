import { io } from "socket.io-client"

const SERVER_URL = "https://projet-m-server.onrender.com"

const socket = io(SERVER_URL, {
  autoConnect: false
})

export default socket