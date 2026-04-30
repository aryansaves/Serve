# HTTP Server From Scratch — TypeScript

A pedagogical HTTP/1.1 implementation showing exactly how 
web servers work under the hood.

## What This Demonstrates
- [x] Manual request parsing (no http module)
- [x] Buffer management for streaming bodies
- [x] Content-Length vs chunked transfer encoding
- [x] Connection keep-alive / pipelining

## Interactive Demos
- `GET /` → Hello world
- `POST /echo` → Request body mirror
- `GET /stats` → Server metrics (requests/sec, active connections)
- `GET /benchmark` → Compare against Express on your machine