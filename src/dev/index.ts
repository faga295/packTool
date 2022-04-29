import type {Options} from '../type'
import Compiler from '../core/compiler.js'
import Server from './server.js'
import {getOptions} from '../core/packTool.js'
import packTool from '../core/packTool.js'

async function startDevServer(){
    
    try{
        var {compiler,options} = await packTool()
    }catch(err){
        console.log(err)
    }
    try{
        var server = new Server(compiler,options)
        compiler.run()
        compiler.addPublic()
    }catch(err){
        console.log(err);
    }
}
startDevServer()
