import { type BodyReader } from "./types"
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