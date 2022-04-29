import fs from 'fs'
import path from 'path'
import Compiler from '../core/compiler'
import type { CompilerInstance } from '../type'
export default function listenLocalFiles(rootPath:string,compiler:CompilerInstance){
    const dir = fs.readdirSync(rootPath).map(filename=>{
        return path.resolve(rootPath,filename)
    })
    for(const item of dir){
        const stat = fs.lstatSync(item)
        if(stat.isDirectory()) listenLocalFiles(item,compiler)
        if(stat.isFile()) fs.watchFile(item,{interval:500},callback)
    }
    function callback(){
        compiler.run()
    }
}
