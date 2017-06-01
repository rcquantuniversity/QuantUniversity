#under Python 2.7
import subprocess
import json
import os

cwd = os.getcwd()
print(cwd)

#parse JSON file
with open('./private/services/master.json') as data_file:    
    data = json.load(data_file)

num_pkg_py27 = len(data['data'][0]['packages'])
num_pkg_py35 = len(data['data'][1]['packages'])
num_pkg_r = len(data['data'][2]['packages'])

if num_pkg_py27 > 0 and num_pkg_r > 0:
    baseImage = 'jupyterhub/base-pyr'
elif num_pkg_py27 > 0:
    baseImage = 'jupyter/base-py27'
elif num_pkg_r > 0:
        baseImage = 'jupyter/base-r'
else:
    baseImage = 'jupyter/base-py35'

#write the Dockerfile
with open('./private/services/Dockerfile', 'wb') as dockerfile:
    #FROM the base image
    dockerfile.write('FROM ' + baseImage + '\n')
    #get the root privilege 
    dockerfile.write('USER root\n')

    #install py2 packages
    if num_pkg_py27 > 0:
        dockerfile.write('RUN pip2 --no-cache-dir --no-cache install ')
        for index,pkg in enumerate(data['data'][0]['packages']):
            if(index < num_pkg_py27-1):
                dockerfile.write(pkg['name'] + ' ')
            else:
                dockerfile.write(pkg['name'] +'\n')
    
    #install py3 packages
    if num_pkg_py35 > 0:
        dockerfile.write('RUN pip3 --no-cache-dir --no-cache install ')
        for index,pkg in enumerate(data['data'][1]['packages']):
            if(index < num_pkg_py35-1):
                dockerfile.write(pkg['name'] + ' ')
            else:
                dockerfile.write(pkg['name'] +'\n')
    
    #install r packages
    if num_pkg_r > 0:
        dockerfile.write('RUN conda install --quiet --yes \\\n')
        for index,pkg in enumerate(data['data'][2]['packages']):
            if(index < num_pkg_r-1):
                dockerfile.write('    \'' +pkg['name']+ '\' \\\n')
            else:
                dockerfile.write('    \'' + pkg['name'] +'\' && conda clean -tipsy\n')

    dockerfile.write('USER $NB_USER\n')

#execute the building process
#str = subprocess.call('docker build -t ' + moduleName + ' .', shell=True)
