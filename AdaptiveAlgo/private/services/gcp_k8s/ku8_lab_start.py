#!/usr/bin/env python
# py3

# from kubernetes import client, config
import yaml
import subprocess
import time
import json
import sys


# create a lab, should be assigned a unique namespace
def create_lab(labName, namespace, imageName, imageVersion):
    if(imageVersion==''):
        imageVersion='latest'
    info = dict()
    with open("./jupyterhub_k8s/values_template.yaml", 'r') as f:
        try:
            info = yaml.load(f)
            print(info['singleuser']['image']['name'] + ' ' + info['singleuser']['image']['tag'])
            info['singleuser']['image']['name'] = imageName
            info['singleuser']['image']['tag'] = imageVersion
        except yaml.YAMLError as exc:
            print(exc)
    with open('./jupyterhub_k8s/values.yaml', 'w') as outfile:
        yaml.dump(info, outfile, default_flow_style=False)
    cmd = 'helm install ./jupyterhub_k8s --name='+labName+' --namespace='+namespace+' -f config.yaml --timeout=0'
    print(cmd)
    subprocess.run(cmd,shell=True)
    
# example
# create_lab('juphub1', 'temp2', 'jupyter/minimal-notebook', 'latest')


# start a lab
# python3 ku8_lab_start.py juphub3 temp3 jupiter/minimal-notebook latest
if __name__ == '__main__':
    if (len(sys.argv) < 4):
        print(sys.argv, 'Error: More paras required..')
    labName = sys.argv[1]
    namespace = sys.argv[2]
    imageName = sys.argv[3]
    if (len(sys.argv) == 4):
        imageVersion = 'latest'
    else:
        imageVersion = sys.argv[4]
    create_lab(labName, namespace, imageName, imageVersion)
    print('Done')
    # time.sleep(20)
    # wait_check(namespace)
    # get_lab_ip(namespace)
    # sys.exit(0)

