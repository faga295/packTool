import Compiler from "../core/compiler";
import type {Options} from '../type'
import express from 'express'
import fs from 'fs'
import WebSocket, { WebSocketServer } from 'ws';
import wdm from '../dev-middleware/index.js'
import listenFiles from './listenFiles.js'
export default class Server{
    options:Options
    compiler:InstanceType<typeof Compiler>
    app:any
    constructor(compiler:InstanceType<typeof Compiler>,options:Options){
        this.options = options
        this.compiler = compiler
        this.setUpApp()
        this.setupStatic()
        this.setupmiddleware()
        this.createServer()   
        this.listenLocalFiles()     
    }
    setUpApp(){
        const app = express()
        this.app = app
    }
    setupmiddleware(){
        const middleware = wdm(this.compiler,this.options)
        this.app.use(middleware)
    }
    createServer(){

        this.app.listen(this.options.devServer.port,()=>{
            console.log('App running at:')
            console.log(`- Local:    \x1B[36mhttp://localhost:${this.options.devServer.port}/\x1B[0m`)
            console.log(`- Network:    \x1B[36mhttp://192.168.2.103:${this.options.devServer.port}/\x1B[0m`)
            console.log('Note that the development build is not optimized.')
            console.log('To create a production build, run \x1B[36mnpm run build\x1B[0m');
            
        })
    }
    setupStatic(){
        const html = fs.readFileSync(this.compiler.rootPath+'/public/index.html','utf-8')
        this.app.get('/',(req,res)=>{
            res.send(html)
        })
        this.app.use('/dist',express.static(this.compiler.rootPath+'/dist'))
    }
    listenLocalFiles(){
        listenFiles(this.compiler.rootPath+'/src',this.compiler)
    }
    createsocket(){
        const wss = new WebSocketServer({
            port:8080
        })
        wss.on('connection', function connection(ws) {
            ws.on('message', function message(data) {
              console.log('received: %s', data);
            });
            ws.send('something');
        });
          
    }
    listenDone(){
        // let lasthash;
        // this.compiler.hooks.done.tap('webpack-dev-server',(stats)=>{
        //     lasthash = stats.hash
        // })
    }
}