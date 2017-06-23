node_ssh = require('node-ssh')
ssh = new node_ssh()

function kill_terminal(uid, hostname, imageName, key_file){
    ssh.connect({
    host: '34.211.179.108',
    username: 'ec2-user',
    privateKey: '/home/computer/qu.pem'
    }).then(function() {
        // Local, Remote 
        port=7010
        ssh.execCommand('docker rm ' + uid + ' -f').then(function(result) {
            ssh.execCommand('screen -X -S '+ uid + ' quit').then(function(result) {
                console.log('STDOUT: ' + result.stdout) 
                console.log('end')
                ssh.dispose();
            });
        });
    });
}
kill_terminal('test', '34.211.179.108','ubuntu:16.04', '/home/computer/qu.pem')
