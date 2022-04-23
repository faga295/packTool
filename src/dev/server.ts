import Compiler from "../core/compiler";
import type {Options} from '../type'
import express from 'express'
import fs from 'fs'
export default class Server{
    options:Options
    compiler:InstanceType<typeof Compiler>
    constructor(compiler:InstanceType<typeof Compiler>,options:Options){
        this.options = options
        this.compiler = compiler
        this.setUpApp()
    }
    setUpApp(){
        const app = express()
        const html = fs.readFileSync(this.compiler.rootPath+'/public/index.html','utf-8')
        app.get('/',(req,res)=>{
            res.send(html)
        })
        app.use('/dist',express.static(this.compiler.rootPath+'/dist'))
        app.listen(this.options.devServer.port,()=>{
            console.log(`http://localhost:${this.options.devServer.port}`)
        })
    }
}