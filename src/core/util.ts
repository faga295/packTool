import fs from 'fs'
export function UnixPath(path:string):string{
    return path.replace(/\\|\\/g,'/')
}
export function checkFile(path:string):Promise<boolean>{
    return new Promise((resolve)=>{
        fs.access(path,(err)=>{
            if(err){
                resolve(false)
            }else{
                resolve(true)
            }
        })
    })
}