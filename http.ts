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
  const keylower = key.toLowerCase()
  for (const header of headers) {
    const idx = header.indexOf(':'.charCodeAt(0))
    if (idx < 0) continue;  
    const headerName = header.subarray(0, idx).toString('latin1').toLowerCase()
    if (headerName === keylower) {
      let value = header.subarray(idx + 1)
      if (value.length > 0 && value[0] === ' '.charCodeAt(0)) {
        value = value.subarray(1)
      }
      return value
    }
  } return null
}
function main() {
  const headers = [
      Buffer.from("Host: example.com"),
      Buffer.from("Content-Length: 100"),
  ];
  
  console.log(fieldGet(headers, "host")?.toString());        // "example.com"
  console.log(fieldGet(headers, "Content-Length")?.toString()); // "100"
  console.log(fieldGet(headers, "missing"));               // null
}

main()