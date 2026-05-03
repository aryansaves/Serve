import { type Dynbuf } from "./types"

export function bufPop(buf: Dynbuf, len: number): void {
  // pops the "len" number of character from front like a stack
  buf.data.copyWithin(0, len, buf.length)
  buf.length -= len
}

export function bufPush(buf: Dynbuf, data: Buffer): void { 
  // Pushes new data to buffer
  // expands the buffer acc to the new data length
  const newlen = buf.length + data.length
  if (buf.data.length < newlen) {
    let cap = Math.max(buf.data.length, 32)
    while (cap < newlen) {
      cap *= 2
    }
    const grown = Buffer.alloc(cap)
    buf.data.copy(grown, 0, 0, buf.length)
    buf.data = grown
  }
  data.copy(buf.data, buf.length, 0)
  buf.length = newlen
}