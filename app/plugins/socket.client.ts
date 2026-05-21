import { io } from "socket.io-client"

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) return

  const socket = io(window.location.origin, {
    transports: ["websocket", "polling"],
  })

  socket.on("connect", () => {
    socket.emit("join:broker", auth.brokerId)
  })

  socket.on("policy:signed", (data: { policyTitle: string }) => {
    const toast = document.createElement("div")
    toast.className = "socket-toast"
    toast.textContent = `✅ "${data.policyTitle}" has been signed!`
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 5000)
  })

  if (import.meta.client) {
    const style = document.createElement("style")
    style.textContent = `
      .socket-toast {
        position: fixed; bottom: 1.5rem; right: 1.5rem;
        background: #2E9E6B; color: #fff;
        padding: .75rem 1.25rem; border-radius: var(--radius);
        font-size: .88rem; font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,.15);
        z-index: 9999;
        animation: slideUp .3s ease;
      }
      @keyframes slideUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
    `
    document.head.appendChild(style)
  }
})
