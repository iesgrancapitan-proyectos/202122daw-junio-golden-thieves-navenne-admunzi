import path from 'path';
import http from 'http'
import express from 'express';
import {clientConnection} from './clientConnection'


const app = express();
const port = process.env.PORT ?? 3000;
const server = http.createServer(app);  
const io = require('socket.io')(server);

// set up routes
app.use(express.static('/../public')); 
app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname,"/../public/index.html"))
})
app.get("/style.css", (req, res) =>{
    res.sendFile(path.join(__dirname,"/../public/style.css"))
})
app.get("/bundle-front.js", (req, res) =>{
    res.sendFile(path.join(__dirname,"/../public/bundle-front.js"))
})
app.get("/assets/*", (req, res) =>{
    res.sendFile(path.join(__dirname,"/../public/"+req.path))
})

// start game communication server (socket.io)
clientConnection(io);

// start server
  server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
 });
