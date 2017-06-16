#!/usr/bin/env python
# py3

import yaml
import subprocess
import time
import json
import sys

def kill_lab(labName, namespace):
	end_proxy = 'kubectl delete deployments proxy-deployment --namespace='+namespace
	end_hub = 'kubectl delete deployments hub-deployment --namespace='+namespace
	end_helm = 'helm del --purge ' + labName
	try:
		process1=subprocess.check_output(end_proxy,shell=True)
		process2=subprocess.check_output(end_hub,shell=True)
		process3=subprocess.check_output(end_helm,shell=True)
		print('Done')
		return True
	except subprocess.CalledProcessError as callerr:
		print(callerr)
		return False
		
# python3 ku8_lab_kill.py labName namespace
if __name__ == '__main__':
	if (len(sys.argv) != 3):
		print('arg error')
		sys.exit(1)
	labName=sys.argv[1]
	namespace=sys.argv[2]
	kill_lab(labName, namespace)
