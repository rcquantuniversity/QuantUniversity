var dockerCLI = require('docker-cli-js');
var DockerOptions = dockerCLI.Options;
var Docker = dockerCLI.Docker;
var docker = new Docker();

// push image to dockerhub userName/imageName.
function pushToDockerhub(imageName, userName, cb){
	docker.command('tag'+' '+imageName+' '+userName+'/'+imageName, function(err, data){
		docker.command('push'+' '+userName+'/'+imageName, function(err, data){
		console.log(data);
		});
	});
}

pushToDockerhub('hello-world', 'jdadaptivealgo', function(){});