import * as net from "net"

export type HTTPReq = {
  method: string,
  uri: Buffer,
  version : string,
  headers: Buffer[],
}

export type HTTPRes = {
  code: number,
  headers: Buffer[],
  body : BodyReader,
}

export type BodyReader = {
  length: number,
  read : () => Promise <Buffer>,
}

export type Dynbuf = {
    data: Buffer,
    length: number
}

export type TCPconn = {
    socket: net.Socket

    err: null | Error
    ended: boolean
    reader: {
        resolve: (data: Buffer) => void,
        reject: (err: Error) => void
    } | null
}