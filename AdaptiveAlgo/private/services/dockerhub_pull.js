var dockerCLI = require('docker-cli-js');
var DockerOptions = dockerCLI.Options;
var Docker = dockerCLI.Docker;
var docker = new Docker();
// pull image from dockerhub userName/image.
function pullFromDockerhub(imageName, userName, cb){
	docker.command('pull '+userName+'/'+imageName, function(err, data){
		console.log(data);
	})
}

// pullFromDockerhub('hello-world', 'jdadaptivealgo', function(){});