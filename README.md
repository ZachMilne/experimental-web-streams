# Experimental file streaming in the browser

## What is this?

This solution stemmed from the need to encrypt large amounts of binary data in the browser before it's sent over the network.
While reading bytes into memory from a source like a user selected file works great for small files such as pdfs and images,
this could exceed memory limits on the device for large files like videos that can be multiple GBs in size. This repo is an experimental
implementation to solve this problem. For uploads, it uses webRTC data channels and Web Streams to pipe small chunks of data through a transformer
and to the server. On the return trip, a transform stream is passed to an iframe and service worker who intercepts a request for a download
and responds with the stream. The native browser functionality handles the rest.

## To run

browser: please use Chrome only  
node version: 16.x (LTS)

Start the server:  
`cd server`  
`npm install`  
`npx nest start`

Start the UI:  
`cd ui`  
`npm install`  
`npm run dev`
