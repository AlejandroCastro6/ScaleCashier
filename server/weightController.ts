import {SerialPort} from "serialport"
import {ReadlineParser} from "@serialport/parser-readline"
import os from "os"
import fs from "fs"
function getSerialPort() {
  const platform = os.platform()

  if (platform === "win32") {
    return "COM6"
  }
  const possiblePaths = ["/dev/ttyUSB0", "/dev/ttyACM0", "/dev/ttySO"]
  for (const path of possiblePaths) {
    try {
      fs.accessSync(path)
      return path
    } catch (e) {
      console.error(e)
    }
  }
  throw new Error("Could not access any serial port")
}

let portPath: string;
portPath = getSerialPort()
const port = new SerialPort({
  path: portPath,
  baudRate: 9600
})

port.on("open", () => {
  console.log("Opened", port.path);
})

port.on("error", (err) => {
  console.error("Serial port error: ", err.message);
})


const parser = port.pipe(new ReadlineParser({delimiter: "\r\n"}))


let lastestWeight = 0
let subscribers: ((w: number) => void)[] = [];

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