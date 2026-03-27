# WebServer :

## HTTP Request  :

`GET /index.html HTTP/1.1\r\n
Host: [example.com](http://example.com/)\r\n
Content-Length: 12\r\n
\r\n
hello world`

**Delimiters** : “\r\n”, “\r\n\r\n”, “_”

**Method, URI and Version**  :  `GET /index.html HTTP/1.1` (separated by space)
Header completed when “`\r\n\r\n`” delimiter reached
**Headers** : `Host: [example.com](http://example.com/)\r\n Content-Length: 12` 
`”\r\n”` on empty line is end of header line
**Body** : `hello world`  (Body read until Content-Length/EOF)

Headers are stores as raw lines because not every header is parsed, stored as buffer.
HTTP request received to server, to read body a Dynamic buffer used acc to content length, 2 ways : Transfer encoding and Content-Length.

**Content length :** 
A dynamic Buffer used which is filled by the socket connection, we read the buffer until content-length reached, Now to keep track of content length we use “remain” and “consume” variables which keeps track, remain is basically how much of the length is remaining and  consume is the amount of bytes needed to be consumed from the buffer.

**Types** : URI and Header uses buffer, everything else is a string 

**HTTP Responses** : 
`HTTP/1.1 200 OK
Content-Length: 12
Hello World`

Encoding : Reverse of parsing, transforms data into safe format to pass into the responses