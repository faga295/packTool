import Compiler from "./compiler.js";
import {UnixPath,checkFile} from "./util.js";
import plugin1 from '../plugins/plugin1'

export interface  Options{
    entry:string|string[],
    output:string,
    plugins:Array<typeof plugin1>,
    module:any,
    format:string
}
export default async function packTool(){
    const {default:options} = await getOptions()
    const compiler = new Compiler(options)
    loadPlugin(options,compiler)
    return compiler
}
async function getOptions(){
    const isExist = await checkFile(UnixPath(process.cwd())+'/packTool.config.js')
    if(isExist){
        return import('file://'+UnixPath(process.cwd())+'/packTool.config.js')
    }
}
function loadPlugin(options:Options,compiler:InstanceType<typeof Compiler>){
    const plugins = options.plugins
    if(!plugins) return;
    for(let i=0;i<plugins.length;i++){
        const instance = new plugins[i](compiler)
        instance.apply()
    }
}
