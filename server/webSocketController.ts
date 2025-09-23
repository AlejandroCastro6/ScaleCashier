import { WebSocketServer } from "ws"
import { getWeightStream } from "./weightController.ts";

const wss = new WebSocketServer({ port: 5000 })

wss.on("connection", (ws) => {
  console.log("Client connected to the scale")

  const unsubscribe = getWeightStream((weight) => {
    ws.send(JSON.stringify(weight))
  })

  ws.on("close", () => {
    unsubscribe()
    console.log("Client disconnected from the scale")
  })
})