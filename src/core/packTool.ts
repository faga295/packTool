import type { CompilerInstance } from "../type";
import Compiler from "./compiler.js";
import {UnixPath,checkFile} from "./util.js";
import type { Options } from "../type";
import _ from 'lodash'

export default async function packTool(){
    const options = await getOptions()
    const compiler = new Compiler(options)
    loadPlugin(options,compiler)
    return {compiler,options}
}
export async function getOptions(){
    const isExist = await checkFile(UnixPath(process.cwd())+'/packTool.config.js')
    if(isExist){
        const {default:options} = await import('file://'+UnixPath(process.cwd())+'/packTool.config.js')
        return mergeOptions(options)
    }
}
function mergeOptions(options:Options){
    const defaultOptions = {
        devServer:{
            port:3000,
        }
    }
    return _.merge(defaultOptions,options)
}
function loadPlugin(options:Options,compiler:CompilerInstance){
    const plugins = options.plugins
    if(!plugins) return;
    for(let i=0;i<plugins.length;i++){
        const instance = new plugins[i](compiler)
        instance.apply()
    }
}
