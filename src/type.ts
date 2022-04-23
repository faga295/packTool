import plugin1 from '../plugins/plugin1'
import Compiler from './core/compiler'

export type Plugin = typeof plugin1
export interface rule{
    test:RegExp,
    include:Function[]
}
export interface Entry{
    name:string,
    dependenices:InstanceType<typeof Set>,
    id:string,
    source:string,
}
export interface Chunk{
    name:string,
    dependenices:InstanceType<typeof Set>
    id:string,
    source:string,
    module:InstanceType<typeof Set>
}
export interface  Options{
    entry:string|string[],
    output:string,
    plugins:Array<typeof plugin1>,
    module:any,
    format:string,
    devServer:DevServer
}
export interface DevServer{
    port:number
}
export type CompilerInstance = InstanceType<typeof Compiler>