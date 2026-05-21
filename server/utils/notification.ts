export function emitPolicySigned(brokerId: string, policyTitle: string) {
  const nitro = useNitroApp()
  const io = (nitro as any).io
  if (io) {
    io.to(`broker:${brokerId}`).emit("policy:signed", { policyTitle })
  }
}
