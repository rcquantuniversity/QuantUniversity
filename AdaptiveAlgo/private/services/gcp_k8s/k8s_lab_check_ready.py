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
        # print(ip)
        return ip
    except subprocess.CalledProcessError as callerr:
        # print(callerr)
        return 'callerr'
    except KeyError as keyerr:
        # print(keyerr)
        return 'keyerr'


def wait_check(namespace):
    counter = 0
    while(get_lab_ip(namespace)=='callerr' or get_lab_ip(namespace)=='keyerr'):
        time.sleep(1)
        print('sleep 1 sec..')
        counter += 1
        if (counter == 30):
            print('time error')
            return
    print(get_lab_ip(namespace))
    print('Done')
    return

# wait_check(namespace)
if __name__ == '__main__':
    namespace=''
    with open('../start_params.json','r') as f:
        data=json.loads(f)
        namespace=data['module']

    wait_check(namespace)