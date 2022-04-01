import Compiler from '../src/compiler'
export default class plugin1{
    compiler:InstanceType<typeof Compiler>
    constructor(compiler:InstanceType<typeof Compiler>){
        this.compiler = compiler;
    }
    apply(){
        this.compiler.hooks.run.tap('plugin1',()=>{console.log('plugin1')})
    }
}