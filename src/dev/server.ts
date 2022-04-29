import Compiler from "../core/compiler";
import type {Options} from '../type'
import express from 'express'
import fs from 'fs'
import path from 'path'
import WebSocket, { WebSocketServer } from 'ws';
import wdm from '../dev-middleware/index.js'
import type { CompilerInstance } from "../type";
export default class Server{
    options:Options
    compiler:InstanceType<typeof Compiler>
    app:any
    ws:any
    constructor(compiler:InstanceType<typeof Compiler>,options:Options){
        this.options = options
        this.compiler = compiler
        this.setUpApp()
        this.setupStatic()
        this.setupmiddleware()
        this.createsocket()
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
        const compiler = this.compiler
        function srcCallback(){
            compiler.run()
        }
        function pubCallback(){
            compiler.addPublic()
        }
        this.listenFiles(this.compiler.rootPath+'/src',this.compiler,srcCallback)
        this.listenFiles(this.compiler.rootPath+'/public',this.compiler,pubCallback)
    }
    createsocket(){
        const wss = new WebSocketServer({
            port:8080
        })
        const compiler = this.compiler
        wss.on('connection', function connection(ws) {
            this.ws = ws;
            compiler.hooks.done.tap('dev',()=>{
                ws.send('ok')
                console.log('done');
            })
        });
          
    }
    listenFiles(rootPath:string,compiler:CompilerInstance,callback:any){
        const dir = fs.readdirSync(rootPath).map(filename=>{
            return path.resolve(rootPath,filename)
        })
        for(const item of dir){
            const stat = fs.lstatSync(item)
            if(stat.isDirectory()) this.listenFiles(item,compiler,callback)
            if(stat.isFile()) fs.watchFile(item,{interval:500},callback)
        }
    }
}