   
    var Docker = require('dockerode');
    var docker = new Docker({socketPath: '/var/run/docker.sock'});
    var container = docker.getContainer('740aae30d312');
    
    /**
     * Making connection with postgresl
     */
    const { Pool } = require('pg')
    const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'prueba',
    password: 'admin',
    port: 5432,
    })
    var result
    pool.query('SELECT id, store_fname as name from ir_attachment', (err, res) => {
      result = res;
      pool.end()
    })
    ////


    /**
     * Params to excecute the container.exec function,
     * here is necesary pass trough Cmd the commands to excecute into the container,
     * ls command retrieve a list of files on the location, -R is used to recursively search into
     * childs folders, with -p attach to folders  name the character / to identificate that is a folder,
     * $URL is the location where the command will excecute, grep -v / ignore all listed name who has /.
     * Env is the way to setup the URL o PATH to the commands.
     */
    let params = {
      Cmd: ['sh','-c','ls -R -p $URL | grep -v /'],
      Env: ['URL=/home/flectra/.local/share/Flectra/filestore/prueba'],
      AttachStdout: true,
      AttachStderr: true,
    }


    /**
     * Variable to store all files from docker container
     */
    let files;

    
    /**
     * Function to excecute and retrieve the command output, and puting into files var
     */
      const getData = ()=>{
        return new Promise((resolve, reject) => {
        container.exec(params,(err, exec) => {
          if (err) {
            reject(err.json.message);
          } else {
            resolve(exec);
          }
        });
      }).then(async exec1 => {
        return new Promise((resolve, reject) => {
          exec1.start({stdin: true},(err, stream) => {
            if (err) return err.json.message;
            else {
              let data = [];

              // stream.setEncoding('utf8');
              
              stream.on('data', chunk => {
                console.log()
               data.push(chunk);
                
                
              })
              stream.on('end', () => {
                resolve(Buffer.concat(data).toString())
              });
              stream.on('close', ()=>{});
            }
          })
        })
      }).catch(msg => {
      })}
        
getData()
.then((datos)=>{
  const dataSet = datos.replace(/\n+/g, ',').split(',');
  console.log(datos.length)
  // for (let index = 0; index < dataSet.length; index++) {
  //   const element = dataSet[index];
  //   console.log(element);
  // }
  return dataSet;
})
.then((dataSet)=>{
 try {
    if(dataSet){
      console.log(dataSet.length)
     let list=[]
    for (let i = 0; i < result.rows.length; i++) {
      let flag= false
      const element = result.rows[i];
      for (let j = 0; j < dataSet.length; j++) {
        const element2 = dataSet[j];
        if(element.name.split('/')[1].localeCompare(element2) === 0){
          flag = true;
          break;
        }
      }
      if(!flag){
      list.push(element);
      // console.log(element)
    }
    }
      console.log(list)
    
    }
    
  } catch (e) {
  console.log(e)
  }
})
     /**
     * On this function the files on docker are formatted and compared with the store_fname on attachment
     * table in postgres, to determinate wich attachment are missing on filesystem
     */

     
    // setTimeout(async ()=>{
    //   console.log(files.replace(/\n+/g, ',').split(',').length)
    //   try{
    //     if(files){
    //       const dataSet = files.replace(/\n+/g, ',').split(',');
    //       setTimeout(()=>{
    //         let list=[]
    //     for (let i = 0; i < result.rows.length; i++) {
    //       let flag= false
    //       const element = result.rows[i];
    //       for (let j = 0; j < dataSet.length; j++) {
    //         const element2 = dataSet[j];
    //         if(element.name.split('/')[1].localeCompare(element2) === 0){
    //           flag = true;
    //           break;
    //         }
    //       }
    //       if(!flag){
    //       list.push(element);
    //       // console.log(element)
    //     }
    //     }
    //       console.log(list)
    //       },1000)
        
    //     }
        
    //     }catch(error){
    //       console.log(error);
    //     }
    // },3000)

    