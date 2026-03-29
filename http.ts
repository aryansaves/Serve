import { bufPop, bufPush } from "./buffer"
import {type HTTPReq, type HTTPRes, type BodyReader, type TCPconn, type Dynbuf} from "./types"
import * as net from "net"


async function serveClient(conn : TCPconn): Promise<void> {
  const buf: Dynbuf = { data: Buffer.alloc(0), length: 0 }
  while (true) {
    const msg: null | HTTPReq = cutmessage(buf) 
    if (!msg) {
      const data = await soRead(conn)
      bufPush(buf, data)
      
      if (data.length === 0 && buf.length === 0) {
        return
      }
      if (data.length === 0) {
        throw new HTTPError(400, "Unexpected EOF")
      }
      continue
    }
    const reqBody: BodyReader = readerFromReq(conn, buf, msg)
    const res: HTTPRes = await handleReq(msg, reqBody)
    await writeHTTPResp(conn, res)
    
    if (msg.version === "1.0") {
      return
    }
    while((await reqBody.read()).length > 0) { }
  }
}