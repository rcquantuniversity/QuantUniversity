node_ssh = require('node-ssh');
var Set = require('simple-hashset');
ssh = new node_ssh();
var s = new Set();
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
function get_port(s) {
  min = Math.ceil(7000);
  max = Math.floor(7050);
  port = Math.floor(Math.random()*(max-min)) + min;
  while (s.contains(port)) {
    port = Math.floor(Math.random()*(max-min)) + min;
  }
  console.log(""+port);
  return port;
}
function start_terminal(uid, hostname, port, imageName, key_file, set){
  ssh.connect({
  host: hostname,
  username: 'ec2-user',
  privateKey: key_file
}).then(function() {
    // Local, Remote 
  ssh.execCommand('docker run -td --name='+uid+' '+ imageName).then(function(result) {
    ssh.execCommand('screen -dm -S '+uid+' ./gotty -w -p '+ port + ' docker exec -it '+uid+' /bin/bash').then(function(result) {
    console.log('STDOUT: ' + result.stdout) 
    console.log('end')
    set.add(port);
    ssh.dispose();
  });
  });
});
}
new_port = 20
new_port = get_port(s);
start_terminal('test', '34.211.179.108', new_port,'ubuntu:16.04', '/home/computer/qu.pem', s);
