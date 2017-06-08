#under Python 2.7
import subprocess
import json
import os
import re
#parse JSON file
service_dir = os.path.realpath(__file__)[:-len(os.path.basename(__file__))]
with open(service_dir+'/output.json') as data_file:    
    data = json.load(data_file)

#get basic info from data
module_name = data['name'].replace(" ", "").lower()
num_pkg_py27 = len(data['data'][0]['packages'])
num_pkg_py35 = len(data['data'][1]['packages'])
num_pkg_r = len(data['data'][2]['packages'])

#create module dir to save Dockerfile
module_dir = service_dir + 'temp'
if not os.path.exists(module_dir):
    os.makedirs(module_dir)
print(module_dir)
print(module_name)

if num_pkg_py27 > 0 and num_pkg_r > 0:
    baseImage = 'jupyter/scipy-notebook'
elif num_pkg_py27 > 0:
    baseImage = 'jupyter/scipy-notebook'
elif num_pkg_r > 0:
        baseImage = 'jupyter/scipy-notebook'
else:
    baseImage = 'jupyter/scipy-notebook'

#package version checking
pip_pattern = b'[\((][\s\S]*[\))]'
if num_pkg_py27 > 0:
    for index,pkg in enumerate(data['data'][0]['packages']):
        if(pkg['version'] != 'latest'):
            process = subprocess.Popen(['pip2 install '+pkg['name']+'=='],stderr=subprocess.PIPE, shell=True)
            out, err = process.communicate()
            #print(err)
            trim = re.search(pip_pattern, err, flags=0)
            #print(trim)
            liststr = trim.group().decode("utf-8")[16:-1]
            liststr = liststr.split(', ')
            #print(liststr)
            if pkg['version'] in liststr:
                print('exist '+pkg['name']+'-'+pkg['version'])
            else:
                print('no such pakcage '+pkg['name']+'-'+pkg['version'])

if num_pkg_py35 > 0:
    for index,pkg in enumerate(data['data'][1]['packages']):
        if(pkg['version'] != 'latest'):
            process = subprocess.Popen(['pip3 install '+pkg['name']+'=='],stderr=subprocess.PIPE, shell=True)
            out, err = process.communicate()
            trim = re.search(pip_pattern, err, flags=0)
            liststr = trim.group().decode("utf-8")[16:-1]
            liststr = liststr.split(', ')
            #print(liststr)
            if pkg['version'] in liststr:
                print('exist '+pkg['name']+'-'+pkg['version'])
            else:
                print('no such pakcage '+pkg['name']+'-'+pkg['version'])

#write the Dockerfile
with open(module_dir+'/Dockerfile', 'wb') as dockerfile:
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
                #latest or sepcific version
                if(pkg['version'] == 'latest'):
                    dockerfile.write(pkg['name'] + '\n')
                else:
                    dockerfile.write(pkg['name'] +'==' +pkg['version']+ '\n')

    
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
# print(os.name)
if os.name == 'nt':
    print('under windows')
    str = subprocess.Popen('docker build -t ' + module_name + ' .', cwd=module_dir, shell=True)
if os.name == 'posix':
    print('under linux')
    str = subprocess.call(['cd '+module_dir+ '; docker build -t ' + module_name + ' .'], shell=True)
