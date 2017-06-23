node_ssh = require('node-ssh')
ssh = new node_ssh()

// ssh.connect({
//   host: '34.211.179.108',
//   username: 'ec2-user',
//   privateKey: '/home/computer/qu.pem'
// }).then(function() {
//     // Local, Remote 
//   port=7010
//   ssh.execCommand('docker run -td --name='+uid+' ubuntu:16.04').then(function(result) {
//     ssh.execCommand('screen -dm -S test ./gotty -w -p '+ port + ' docker exec -it '+uid+' /bin/bash').then(function(result) {
//     console.log('STDOUT: ' + result.stdout) 
//     console.log('end')
//     ssh.dispose();
//   });
//   });
// });
function start_terminal(uid, hostname, imageName, key_file){
  ssh.connect({
  host: hostname,
  username: 'ec2-user',
  privateKey: key_file
}).then(function() {
    // Local, Remote 
  port=7010
  ssh.execCommand('docker run -td --name='+uid+' '+ imageName).then(function(result) {
    ssh.execCommand('screen -dm -S '+uid+' ./gotty -w -p '+ port + ' docker exec -it '+uid+' /bin/bash').then(function(result) {
    console.log('STDOUT: ' + result.stdout) 
    console.log('end')
    ssh.dispose();
  });
  });
});
}
start_terminal('test', '34.211.179.108','ubuntu:16.04', '/home/computer/qu.pem')