import { SyncHook } from "tapable";
import { UnixPath,checkFile } from "./util.js";
import type {Options} from './packTool'
import MagicString from 'magic-string';
import fs from 'fs'
import path from 'path'
interface rule{
    test:RegExp,
    include:Function[]
}
interface Entry{
    name:string,
    dependenices:InstanceType<typeof Set>,
    id:string,
    source:string,
}
interface Chunk{
    name:string,
    dependenices:InstanceType<typeof Set>
    id:string,
    source:string,
    module:InstanceType<typeof Set>
}
export default class Compiler{
    options:Options;
    hooks:Record<string,InstanceType<typeof SyncHook>>
    rootPath:string;
    entry:InstanceType<typeof Set>;
    module:InstanceType<typeof Set>;
    chunk:InstanceType<typeof Set>;
    alreadyModule:InstanceType<typeof Set>;
    assets:Record<string,any>;
    files:InstanceType<typeof Set>
    constructor(options:any){
        this.options= options
        this.hooks = {
            run: new SyncHook(),
            emit: new SyncHook(),
            done: new SyncHook()
        }
        this.rootPath = UnixPath(process.cwd())
        this.entry = new Set<Entry>()
        this.module = new Set<any>()
        this.chunk = new Set<any>()
        this.alreadyModule = new Set<any>()
        this.assets = {}
        this.files = new Set<any>()
    }
    run(){
        this.hooks.run.call('plugin1')
        this.buildEntry()
        this.buildChunk()
        this.exportFile()
    }
    buildEntry(){
        if(typeof this.options.entry === 'string'){
            this.options.entry = [this.options.entry] 
        }
        this.options.entry.forEach(item=>{
            let entryObj:Entry= this.buildModule(item,path.resolve(this.rootPath,item))
            entryObj.name = Array.from(item.matchAll(/.*\/(.*)\.(j|t)s$/g))[0][1]
            this.entry.add(entryObj)
        })
    }
    buildModule(moduleName,modulePath){
        const originCode = fs.readFileSync(modulePath,'utf-8')
        const module = this.moduleCompiler(moduleName,modulePath,originCode)
        const completedCode = this.loadLoader(modulePath,module.source)
        module.source = completedCode
        return module;
    }
    moduleCompiler(moduleName,modulePath,code){
        const module = {
            name:moduleName,
            id:modulePath,
            dependenices:new Set(),
            source:''
        }
        const reg = /\bimport\ (.*) from\ (.*)/g
        const s = new MagicString(code);
        for(const moduleItem of Array.from(code.matchAll(reg))){
            const tempItem = moduleItem as any;
            s.overwrite(tempItem.index,tempItem.index+moduleItem[0].length,'')
            const requirePath = moduleItem[2].slice(1,-1)
            const moduleDir = path.dirname(modulePath)
            const moduleId = UnixPath(path.resolve(moduleDir,requirePath))
            if(this.alreadyModule.has(moduleId)) return
            let requireModule = this.buildModule(requirePath,moduleId)
            module.dependenices.add(requireModule)
            this.module.add(requireModule)
            this.alreadyModule.add(moduleId)
        }
        const exReg = /\bexport/g
        for(const moduleItem of Array.from(code.matchAll(exReg))){
            const tempItem = moduleItem as any;
            s.overwrite(tempItem.index,tempItem.index+tempItem[0].length,'')
        }
        module.source = s.toString()
        return module
    }
    loadLoader(moduleName,code){
        if(!this.options.module||!this.options.module.rules.length) return;
        const rules:rule[] = Array.from(this.options.module.rules);
        rules.forEach(item => {
            if(item.test.test(moduleName)){
                item.include.forEach(async loader => {
                    code = loader(code)
                })
            }
        })
        return code
    }
    buildChunk(){
        for(const item of this.entry){
            const entry = item as Entry
            const chunk ={
                name:entry.name,
                dependenices:entry.dependenices,
                id:entry.id,
                source:entry.source,
                modules:[]
            }
            this.addMoudle(chunk.dependenices,chunk.modules)
            this.chunk.add(chunk)
        }
    }
    addMoudle(dep,arr){
        const iterator = dep.entries()
        for(const module of iterator){
            if(module[0].dependenices.size){
                this.addMoudle(module[0].dependenices,arr)
            }
            arr.push(module[0])
        }
    }
    exportFile(){
        for(const item of this.chunk){
            const chunk = item as Chunk
            this.assets[chunk.name] = this.getSourceModule(chunk)
        }
        this.hooks.emit.call('plugin1')  
        let keyArr=Object.keys(this.assets)
        for(let i=0;i<keyArr.length;i++){
            this.writeFile(keyArr[i])
        }
    }

    async writeFile(assetKey){
        this.files.add(this.assets[assetKey])
        const dirExist = await checkFile(`${this.rootPath}/dist`)
        if(!dirExist) fs.mkdirSync(`${this.rootPath}/dist`)
        const fileExist = await checkFile(`${this.rootPath}/dist/output[${assetKey}].js`)
        fs.writeFileSync(`${this.rootPath}/dist/output[${assetKey}].js`,this.assets[assetKey])
    }
    getSourceModule(chunk){
        const {source,modules} = chunk
        return `
            ${modules.map(item=>{
                return item.source
            })}
            ${source}
        `
    }
}