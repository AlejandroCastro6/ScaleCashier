import { SerialPort } from "serialport"
import { ReadlineParser } from "@serialport/parser-readline"

const port = new SerialPort({
  path: "COM6",
  baudRate: 9600
})

port.on("open", () => {
  console.log("Opened", port.path);
})

port.on("error", (err) => {
  console.error("Serial pro erro: ", err.message);
})

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }))


let lastestWeight = 0
let subscribers: ((w:number)=>void)[] = [];

parser.on("data", (line) => {
  const match = line.match(/([-+]?\d*\.?\d+)/);
  if (match) {
    const weight = parseFloat(match[0]);
    lastestWeight = weight
    subscribers.forEach(cb => cb(weight!))
    // console.log("weight:", lastestWeight)
  }
})

export function onWeightUpdate(callback:(weight:number) => void) {
  subscribers.push(callback)
}

export function getWeight() {
  return lastestWeight;
}