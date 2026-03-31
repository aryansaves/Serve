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
  
}