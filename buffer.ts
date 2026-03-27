import { type HTTPReq, type HTTPRes, type BodyReader, type Dynbuf, type TCPconn} from "./types";

export function bufPop(buf : Dynbuf, len : number) : void {
  
}

export function bufPush(buf : Dynbuf, data: Buffer) : void {
  
}

export function soRead(conn : TCPconn): Promise <Buffer> {
  return 
}