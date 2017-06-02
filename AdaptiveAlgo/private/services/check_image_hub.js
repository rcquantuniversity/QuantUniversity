const exec = require('child_process').exec;

// check if image exists on dockerhub. If yes, print, return true.
function isImageExists(imageName, userName, cb) {
	exec('docker-image-exists --repo ' + userName + '/' + imageName, function (error, stdout, stderr) {
		if (error) {
			console.log('image doesn\'t exist.');
			return false;
		}
		console.log('image already exists.');
		return true;
	});
}

// isImageExists('hello-world', 'jdadaptivealgo', function(){});