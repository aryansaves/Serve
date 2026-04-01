import * as net from "net"
import {type Dynbuf} from "./types"
import type { SHA512_256 } from "bun"

function bufPush(buf: Dynbuf, data: Buffer): void {
  const newlen = buf.length + data.length
  if (buf.data.length < newlen) {
    let cap = Math.max(buf.data.length, 32)
    while (cap < newlen) {
      cap *= 2
    }
    const grown = Buffer.alloc(cap)
    buf.data.copy(grown, 0, 0)
    buf.data = grown
  }
}
function bufPop(buf : Dynbuf, len : number) : void {
  buf.data.copyWithin(0, len, buf.length)
  buf.length -= len
}
function fieldGet(headers: Buffer[], key:string) : Buffer|null {
  const temp = key.toLowerCase()
  key = temp
  for (const header of headers) {
    const idx = header.indexOf(':'.charCodeAt(0))
    const headerName = header.subarray(0, idx + 1)
    if(headerName)
    
  }
}
function main() {
  const test : Dynbuf = {
    data: Buffer.from("Hello"),
    length : 5
  }
  console.log("Before : " ,test.data.toString(), "length :", test.length)
  bufPop(test, 1)
  console.log("After : " ,test.data.toString(), "length :", test.length)
}

main()