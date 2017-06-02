var dockerCLI = require('docker-cli-js');
var DockerOptions = dockerCLI.Options;
var Docker = dockerCLI.Docker;
var docker = new Docker();

// login with docker. Supposed to be done on server start up.
function dockerhubLogin(email, password, userName, cb){
	docker.command('login'+' -e '+email+' -p '+password+' -u '+userName, function(err, data){
		console.log(data);
	})
}

// dockerhubLogin('jd.adaptivealgo@gmail.com', 'JDadaptivealgo2017', 'jdadaptivealgo', function(){});
