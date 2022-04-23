import packTool from './packTool.js'

export default async function main(){
    const {compiler} = await packTool()
    compiler.run()
}
main()