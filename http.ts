import * as net from "net"
import {type Dynbuf, type HTTPReq} from "./types"

class HTTPError extends Error{
  code: number;
  
  constructor(code: number, message: string) {
    super(message)
    this.code = code
    this.name = "HTTPError"
  }
}

function bufPush(buf: Dynbuf, data: Buffer): void { 
  // Pushes new data to buffer
  // expands the buffer acc to the new data length
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
function bufPop(buf: Dynbuf, len: number): void {
  // pops the "len" number of character from front like a stack
  buf.data.copyWithin(0, len, buf.length)
  buf.length -= len
}
function fieldGet(headers: Buffer[], key: string): Buffer | null {
  // search headers
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

function parseRequestLine(line: Buffer): [string, Buffer, string] {
  // method, uri, version parsing
  const idxm = line.indexOf(' '.charCodeAt(0))
  const idxu = line.indexOf(' '.charCodeAt(0), idxm + 1)
  const idxv = line.indexOf(' '.charCodeAt(0), idxu + 1)
  if (idxm < 0) {
    throw new HTTPError(400, 'bad request line');
  }
  if (idxu < 0) {
    throw new HTTPError(400, 'bad request line');
  }
  if (idxv !== -1) {
    throw new HTTPError(400, 'bad request line');
  }
  const method = line.subarray(0, idxm).toString('latin1')
  const uri = line.subarray(idxm + 1, idxu)
  const version = line.subarray(idxu + 1).toString('latin1')
  
  if (version !== "HTTP/1.0" && version !== "HTTP/1.1") {
    throw new HTTPError(400, 'bad request line');
  }
  
  return [method, uri, version]
}

function splitLines(data: Buffer): Buffer[]{
  // splits lines using delimiters
  return data.toString('latin1')
    .split('\r\n')
    .map(s => Buffer.from(s))
}
function parseHTTPReq(data: Buffer): HTTPReq {
  // Whole Request Parsing
  const lines: Buffer[] = splitLines(data)
  if (lines.length < 2) {
      throw new HTTPError(400, 'bad request');
  }
  const lastLine = lines[lines.length - 1];
  if (!lastLine || lastLine.length !== 0) {
      throw new HTTPError(400, 'bad request');
  }

  const [method, uri, version] = parseRequestLine(lines[0]!)
  
  const headers: Buffer[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!
    const h = Buffer.from(line)
    if (!validateHeader(h)) {
      throw new HTTPError(400, 'bad request field');
    } headers.push(h)
  }
  return {
         method: method,
         uri: uri,
         version: version,
         headers: headers
     };
}
function validateHeader(header : Buffer) : Boolean {
  
}