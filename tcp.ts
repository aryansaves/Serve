import * as net from "net"

type TCPconn = {
    socket: net.Socket

    err: null | Error
    ended: boolean
    reader: null | {
        resolve: (value: Buffer) => void,
        reject: (reason: Error) => void
    }
}

type Dynbuf = {
    data: Buffer,
    length: number
}

function bufPush(buf : Dynbuf, data: Buffer): void {
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
  data.copy(buf.data, buf.length, 0)
  buf.length = newlen
}

function soInit(socket: net.Socket) {
  console.log("soInit activated")
    const conn: TCPconn = {
        socket: socket, err: null, ended: false, reader: null,
    }
  socket.on('data', (data: Buffer) => {
    console.log("Data perceived", data)
        console.assert(!!conn.reader)
        conn.socket.pause()
        conn.reader!.resolve(data)
        conn.reader = null
    })
  socket.on('end', () => {
      console.log("Connection ending....")
        conn.ended = true
        if (conn.reader) {
            conn.reader.resolve(Buffer.from(''))
            conn.reader = null
        }
    process.exit(0)
    })
    socket.on('error', (err: Error) => {
        conn.err = err
        if (conn.reader) {
            conn.reader.reject(err)
            conn.reader = null
        }
    })
    return conn
}

function soRead(conn: TCPconn): Promise<Buffer> {
  console.log("soRead activated\n")
    console.assert(!conn.reader)
    return new Promise((resolve, reject) => {
        if (conn.err) {
            reject(conn.err)
            return
        }
        if (conn.ended) {
            resolve(Buffer.from(""))
            return
        }

        conn.reader = { resolve: resolve, reject: reject }
        conn.socket.resume()
    })
}
function soWrite(conn: TCPconn, data: Buffer): Promise<void> {
    console.assert(data.length > 0)
    return new Promise((resolve, reject) => {
        if (conn.err) {
            reject(conn.err)
            return
        }
        conn.socket.write(data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        })
    })

}

async function serverclient(socket: net.Socket): Promise<void> {
  const conn: TCPconn = soInit(socket)
  const buf: Dynbuf = { data: Buffer.alloc(0), length: 0 }
  while (true) {
    const msg: null | Buffer = cutMessage(buf)
    if (!msg) {
      const data: Buffer = await soRead(conn)
      bufPush(buf, data)
      if (data.length === 0) {
        return;
      }
      continue
    }
    if (msg.equals(Buffer.from('quit\n'))) {
      await soWrite(conn, Buffer.from('Bye. \n'))
      socket.destroy()
      return
    } else {
      const reply = Buffer.concat([Buffer.from('Echo: '), msg])
      await soWrite(conn, reply);
    }
  }
}
function cutMessage(buf: Dynbuf): null | Buffer{
  const idx = buf.data.subarray(0, buf.length).indexOf('\n')
  if (idx < 0) {
    return null
  }
  const msg = Buffer.from(buf.data.subarray(0, idx + 1))
  bufPop(buf, idx + 1)
  return msg
}
function bufPop(buf: Dynbuf, len : number) : void {
  buf.data.copyWithin(0, len, buf.length)
  buf.length -= len
}

const server = net.createServer({
    pauseOnConnect: true,
})

server.listen(3000, () => {
  console.log("Server is listening on port 3000")
})

server.on('connection', (socket) => {
  serverclient(socket)
})