node_ssh = require('node-ssh')
var Set = require('simple-hashset');
ssh = new node_ssh()
var s = new Set();
function kill_terminal(uid, hostname, port, key_file, set){
    ssh.connect({
    host: hostname,
    username: 'ec2-user',
    privateKey: key_file
    }).then(function() {
        // Local, Remote 
        ssh.execCommand('docker rm ' + uid + ' -f').then(function(result) {
            ssh.execCommand('screen -X -S '+ uid + ' quit').then(function(result) {
                console.log('STDOUT: ' + result.stdout) 
                console.log('end');
                set.remove(port);
                ssh.dispose();
            });
        });
    });
}
kill_terminal('test', '34.211.179.108', 7019, '/home/computer/qu.pem', s);
