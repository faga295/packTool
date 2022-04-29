import type {CompilerInstance,Options} from '../type.js'
import MemoryFilesSystem from 'memory-fs'

export default function wdm(compiler:CompilerInstance,options:Options){
    const context = {compiler,options}
    setFs(compiler)
    return wrapper(context)
}

function setFs(compiler:CompilerInstance){
    const filesystem = new MemoryFilesSystem()
    compiler.fs = filesystem
    compiler.dev = true
}

function wrapper(context){
    return function middleware(req,res,next){
        console.log(req.url);
        try{
            const content = context.compiler.fs.readFileSync(req.url,'utf-8')
            res.send(content)
        }catch(err){
            res.send('404')
        }

        next()
    }
}
