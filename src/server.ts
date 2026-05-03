import { type BodyReader, type HTTPReq, type HTTPRes, type TCPconn, type Dynbuf } from "./types"
import { router } from "./handler"
import { metrics } from "./metrics"
import * as net from 'net'
export function readerFromMemory(data: Buffer): BodyReader{
  let done = false
  return {
    length: data.length,
    read : async () : Promise<Buffer> => {
      if (done) {
        return Buffer.from('')
      } else {
        done = true
        return data
      }
    }
  }
}
// bodyreader is how we interpret the req/res body type
// containing the length and a 'promise' that can be customizably used for any function
// mainly to maintain the idea that data is read or not
// if read return eof else return the data

async function serveClient(conn : TCPconn)  {
  const buf : Dynbuf = {data : Buffer.alloc(0), length : 0}

  while (true) {
    const msg: HTTPReq | null = cutMessage(buf) 
    if (!msg) {
      const data = await soRead(conn)
      bufPush(buf, data)
      
      if (data.length === 0) {
        if (buf.length === 0) {
          return
        }
      throw new HTTPError(400, "Unexpected EOF") 
      }
    continue 
    }
    const reqBody = readerFromReq(conn, buf, msg)
    const res = await router(msg, reqBody)
    metrics.recordRequest(msg.method, res.body.length >= 0 ? res.body.length : 0)
    await writeHTTPResp(conn, res)
    if (msg.version === "1.0") {
      return
    }
    while (true) {
      const chunk = await reqBody.read()
      if (chunk.length === 0) break; 
    }
  }
}


function cutMessage(buf: Dynbuf): HTTPReq | null{
  const idx = buf.data.subarray(0, buf.length).indexOf('\r\n\r\n')
  
  if (idx < 0) {
    if (buf.length >= kMaxHeaderLength) {
      throw new HTTPError(413, "header is too large")
    }
    return null
  }
  const headerlen = idx + 4
  const msg = parseHTTPReq(buf.data.subarray(0, headerlen))
  bufPop(buf, headerlen)
  return msg
}

async function newConn(socket : net.Socket) {
  const conn = soInit(socket)
  try {
    await serveClient(conn)
  } catch (exc) {
    if (exc instanceof HTTPError) {
      console.error('HTTP error:', exc)
    
      const errorResp = {
        code: exc.code,
        headers: [],
        body: readerFromMemory(Buffer.from(exc.message + "\n"))
      }
      
      try {
        await writeHTTPResp(conn, errorResp)
      } catch {
        
      }
    } else {
      console.error('Unexpected exception', exc)
    }
  }
    finally {
      socket.destroy()
    }
} 