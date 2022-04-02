import Compiler from "./compiler.js";
import {UnixPath,checkFile} from "./util.js";
import plugin1 from '../plugins/plugin1'

export interface  Options{
    entry:string|string[],
    output:string,
    plugins:Array<typeof plugin1>,
    module:any
}
export default async function packTool(){
    const {default:options} = await getOptions()
    const compiler = new Compiler(options)
    loadPlugin(options,compiler)
    return new Compiler(options)
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
    for(const plugin of plugins){
        const instance = new plugin(compiler)
        instance.apply()
    }
}
