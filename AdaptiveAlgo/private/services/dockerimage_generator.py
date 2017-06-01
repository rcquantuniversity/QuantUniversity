#under Python 2.7
import subprocess
import json
import os

#parse JSON file
service_dir = os.path.realpath(__file__)[:-len(os.path.basename(__file__))]
with open(service_dir+'/master.json') as data_file:    
    data = json.load(data_file)

#get basic info from data
module_name = 'finace modeling'.replace(" ", "")
num_pkg_py27 = len(data['data'][0]['packages'])
num_pkg_py35 = len(data['data'][1]['packages'])
num_pkg_r = len(data['data'][2]['packages'])

#create module dir to save Dockerfile
module_dir = service_dir + module_name
if not os.path.exists(module_dir):
    os.makedirs(module_dir)
print(module_dir)

if num_pkg_py27 > 0 and num_pkg_r > 0:
    baseImage = 'jupyterhub/base-pyr'
elif num_pkg_py27 > 0:
    baseImage = 'jupyter/base-py27'
elif num_pkg_r > 0:
        baseImage = 'jupyter/base-r'
else:
    baseImage = 'jupyter/base-py35'

#write the Dockerfile
<<<<<<< HEAD
with open(module_dir+'/Dockerfile', 'wb') as dockerfile:
=======
with open('Dockerfile', 'wb') as dockerfile:
>>>>>>> 1cbb1451303abb7e55b7308faccb2c4c9cf74ca8
    #FROM the base image
    dockerfile.write('FROM ' + baseImage + '\n')
    #get the root privilege 
    dockerfile.write('USER root\n')

    #install py2 packages
    if num_pkg_py27 > 0:
        dockerfile.write('RUN pip2 --no-cache-dir --no-cache install ')
        for index,pkg in enumerate(data['data'][0]['packages']):
            if(index < num_pkg_py27-1):
                #latest or sepcific version
                if(pkg['version'] == 'latest'):
                    dockerfile.write(pkg['name'] + ' ')
                else:
                    dockerfile.write(pkg['name'] +'==' +pkg['version']+ ' ')
            else:
                #latest or sepcific version
                if(pkg['version'] == 'latest'):
                    dockerfile.write(pkg['name'] + '\n')
                else:
                    dockerfile.write(pkg['name'] +'==' +pkg['version']+ '\n')
    
    #install py3 packages
    if num_pkg_py35 > 0:
        dockerfile.write('RUN pip3 --no-cache-dir --no-cache install ')
        for index,pkg in enumerate(data['data'][1]['packages']):
            if(index < num_pkg_py35-1):
                #latest or sepcific version
                if(pkg['version'] == 'latest'):
                    dockerfile.write(pkg['name'] + ' ')
                else:
                    dockerfile.write(pkg['name'] +'==' +pkg['version']+ ' ')
            else:
<<<<<<< HEAD
                #latest or sepcific version
                if(pkg['version'] == 'latest'):
                    dockerfile.write(pkg['name'] + '\n')
                else:
                    dockerfile.write(pkg['name'] +'==' +pkg['version']+ '\n')

=======
                dockerfile.write(pkg['name'] +'\n')
>>>>>>> 1cbb1451303abb7e55b7308faccb2c4c9cf74ca8
    
    #install r packages
    if num_pkg_r > 0:
        dockerfile.write('RUN conda install --quiet --yes \\\n')
        for index,pkg in enumerate(data['data'][2]['packages']):
            if(index < num_pkg_r-1):
                #latest or sepcific version
                if(pkg['version'] == 'latest'):
                    dockerfile.write('    \'' +pkg['name']+ '\' \\\n')
                else:
                    dockerfile.write('    \'' +pkg['name'] + '=' +pkg['version'] + '\' \\\n')
            else:
                #latest or sepcific version
                if(pkg['version'] == 'latest'):
                    dockerfile.write('    \'' + pkg['name'] +'\' && conda clean -tipsy\n')
                else:
                    dockerfile.write('    \'' + pkg['name'] +'='+pkg['version']+'\' && conda clean -tipsy\n')

    dockerfile.write('USER $NB_USER\n')

#execute the building process
<<<<<<< HEAD
str = subprocess.call(['cd '+module_dir+ '; docker build -t ' + module_name + ' .'], shell=True)
=======
#str = subprocess.call('docker build -t ' + moduleName + ' .', shell=True)
>>>>>>> 1cbb1451303abb7e55b7308faccb2c4c9cf74ca8
