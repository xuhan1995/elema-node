import chalk from 'chalk'
import cluster from 'cluster'
import os from 'os'

if (cluster.isMaster) {
    const cpusNums = os.cpus().length;
    for(let i = 0; i < cpusNums; i++) {
        cluster.fork();
    }
    console.log(
      chalk.green('成功启动' + cpusNums + '个进程')
    )
} else {
    require('./app.js');
}