import { Server } from "socket.io"

export default defineNitroPlugin((nitroApp) => {
  const io = new Server((nitroApp as any).httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  ;(nitroApp as any).io = io

  io.on("connection", (socket) => {
    socket.on("join:broker", (brokerId: string) => {
      if (brokerId) {
        socket.join(`broker:${brokerId}`)
      }
    })

    socket.on("disconnect", () => {})
  })
})
