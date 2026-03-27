import * as net from "net"
import { bufPop, bufPush, soRead } from "./buffer"
import {type HTTPReq, type HTTPRes, type BodyReader, type TCPconn, type Dynbuf} from "./types"

function encodeHTTPResp(resp : HTTPRes) {
  
}
function writeHTTPResp() {
  
}
function parseRequestLine(line: Buffer): [string, Buffer, string] {
    const firstSpace = line.indexOf(' '.charCodeAt(0));
    const secondSpace = line.indexOf(' '.charCodeAt(0), firstSpace + 1);
    
    const thirdspace = line.indexOf(' '.charCodeAt(0), secondSpace + 1)
   if (thirdspace === -1){
      throw new Error("too many spaces")
    }
  const method = line.subarray(0, firstSpace + 1).toString('latin1')
  const uri = line.subarray(firstSpace + 1, secondSpace)
  const version = line.subarray(secondSpace+1).toString('latin1')
    if (!isValidMethod(method)) throw new Error("bad method");
    if (version !== 'HTTP/1.0' && version !== 'HTTP/1.1') throw new Error("bad version");

    return [method, uri, version]
}

function isValidMethod(method : string) : boolean {
  return true
}
function validateHeader(headerLine: Buffer): boolean {
    // Must contain exactly one colon
    const idx = headerLine.indexOf(':'.charCodeAt(0));
    if (idx === -1) return false;           // No colon found
    if (idx === 0) return false;            // Empty name (colon first)
    
    const idx2 = headerLine.indexOf(':'.charCodeAt(0), idx + 1);
    if (idx2 !== -1) return false;          // Multiple colons
    
    // Value cannot be empty? 
    // if (idx === headerLine.length - 1) return false;
    
    // No CR or LF anywhere in the line
    if (headerLine.includes('\r'.charCodeAt(0))) return false;
    if (headerLine.includes('\n'.charCodeAt(0))) return false;
    
    return true;
}

function readerFromConnLength(conn : TCPconn, buf : Dynbuf, remain : number) {
    return {
        length: buf.length, 
        read: async () => {
            // What variables from outer scope does this use?
          if (remain === 0) {
              return Buffer.from('')
          }
          if (buf.length === 0) {
            const data = await soRead(conn)
            bufPush(buf, data)
            if (data.length === 0) {
              throw new Error('Unexpected EOF')
            }
          }
          const consume = Math.min(buf.length, remain)
          remain -= consume
          
          const data = buf.data.subarray(0, consume)
          bufPop(buf, consume)
          return data
        }  
    };
}