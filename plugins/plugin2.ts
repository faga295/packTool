import type { CompilerInstance } from "../src/type";
export default class plugin2{
    compiler:CompilerInstance
    constructor(compiler:CompilerInstance){
        this.compiler = compiler;
    }
    apply(){
        this.compiler.hooks.run.tap('plugin2',()=>{console.log('plugin2')})
    }
}