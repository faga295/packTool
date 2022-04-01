import packTool from './packTool.js'

async function main(){
    const compiler = await packTool()
    compiler.run()
}
main()