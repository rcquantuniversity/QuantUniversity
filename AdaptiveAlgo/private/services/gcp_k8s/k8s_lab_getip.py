#!/usr/bin/env python
# py3

import yaml
import subprocess
import time
import json
import sys

def get_lab_ip(namespace):
    cmd = 'kubectl get svc proxy-public -o json --namespace=' + namespace
    try:
        process=subprocess.check_output(cmd,shell=True)
        # out, err = process.communicate()
        # errcode = process.returncode
        ip = json.loads(process.decode("utf-8"))['status']['loadBalancer']['ingress'][0]['ip']
        print(ip)
        return ip
    except subprocess.CalledProcessError as callerr:
        # print(callerr)
        return 'callerr'
    except KeyError as keyerr:
        # print(keyerr)
        return 'keyerr'

if __name__ == '__main__':
    namespace=''
    with open('../start_params.json','r') as f:
        data=json.load(f)
        namespace=data['module']
    ip=get_lab_ip(namespace)
    print(ip)