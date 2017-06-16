import boto3
import luigi
import paramiko
import time
import json
import os
import sys
import yaml
from luigi.mock import MockFile
from scp import SCPClient

class ParseParameters(luigi.Task):
    task_namespace = 'aws'

    def output(self):
        return MockFile('InstanceParams')

    def run(self):
        service_dir = os.path.realpath(__file__)[:-len(os.path.basename(__file__))]
        with open(service_dir+'/stop_params.json') as data_file:    
            data = json.load(data_file)
        params = dict()
        params['Approach'] = data['approach']
        params['Module'] = data['module']
        params['Username'] = data['username']
        print(params)
        _out = self.output().open('w')
        json.dump(params,_out)
        _out.close()

class DummyLoadBalancer(luigi.Task):
    task_namespace = 'aws'

    def requires(self):
        return ParseParameters()

    def output(self):
        return MockFile('LoadBalanceInfo')

    def run(self):
        #read from ParseParameters
        with self.input().open('r') as infile:
            print(infile)
            params = json.load(infile)
        
        maxUsersForOneIns = 0
        numOfCurrentUsers = 0
        numOfExistingIns = 0
        topIndex = 0
        moduleName = params['Module']
        userName = params['Username']
        fileName = moduleName+'_balance_status.json'
        whitelistName = 'whitelist.json'
        service_dir = os.path.realpath(__file__)[:-len(os.path.basename(__file__))]
        jsonFilePath = service_dir+fileName
        whitelistPath = service_dir+whitelistName

        #if the JSON file doesnt exit
        if not os.path.isfile(jsonFilePath):
            print('corresponding JSON not here, exit')
            sys.exit()

        #load data from JSON file
        with open(jsonFilePath, 'r') as f:
            content = yaml.safe_load(f)

        maxUsersForOneIns = int(content['maxUsers'])
        topIndex = int(content['topIndex'])
        vmdict = {}
        for vm in content['vms']:
            vmdict[str(vm)] = (content['vms'][vm])

        #ckeck any unbalance in the cluster, if any conflict, exit the pipe line
        for vm in vmdict:
            #update the params
            numOfExistingIns=numOfExistingIns+1
            numOfCurrentUsers=numOfCurrentUsers+len(vmdict[vm])
            if(len(vmdict[vm])>maxUsersForOneIns):
                print('load balance in '+vm+' is broken')
                sys.exit()

        if(numOfExistingIns * maxUsersForOneIns < numOfCurrentUsers):
            print('messed up with load balance, too many containers, too few instances.')
            sys.exit()

        #find del user
        isFound = False
        passInfo = {}
        for vm in vmdict:
            if(userName in vmdict[vm]):
                isFound = True
                print(userName+' is in '+vm+', find the coressponding IP for it')
                vmdict[vm].remove(userName)
                passInfo['Module'] = vm
                with open(whitelistPath, 'w') as fp:
                    whitelist={}
                    whitelist['whitelist'] = vmdict[vm]
                    json.dump(whitelist, fp)
                if(len(vmdict[vm]) == 0):
                    vmdict.pop(vm)
                    print('the vm is empty now, ready to turn off')
                break

        if(isFound == False):
            print('cannot find user: '+userName)
            sys.exit()

        #write to output for next 
        _out = self.output().open('w')
        json.dump(passInfo,_out)
        _out.close()

        #write data back to JSON file.
        print(vmdict)
        writeData = {}
        writeData['maxUsers'] = maxUsersForOneIns
        writeData['topIndex'] = topIndex
        writeData['vms'] = vmdict
        with open(jsonFilePath, 'w') as fp:
            json.dump(writeData, fp)

class GetInstanceIP(luigi.Task):
    task_namespace = 'aws'

    def requires(self):
        return DummyLoadBalancer()

    def output(self):
        return MockFile('InstanceInfo')

    def run(self):
        
        task_namespace = 'aws'

        with self.input().open('r') as infile:
            print(infile)
            params = json.load(infile)
        
        ec2 = boto3.resource('ec2')
        filters = [{'Name':'tag:Name', 'Values':[params['Module']]}]
        instances = ec2.instances.filter(Filters=filters)
        counter = 0
        for instance in instances:
            counter = counter + 1
            target_ins=instance
        if(counter==0):
            print('No module named '+params['Module'] + ' exit.')
            return -1
        print(target_ins.id, target_ins.instance_type, target_ins.public_ip_address)
        
        _out = self.output().open('w')
        _out.write(target_ins.public_ip_address)
        _out.close()

class StopTask(luigi.Task):
    task_namespace = 'aws'

    def requires(self):
        return [ParseParameters(), GetInstanceIP()]

    def run(self):
        #read stopping approach
        with self.input()[0].open('r') as infile:
            print(infile)
            params = json.load(infile)

        #read IP address from the out put
        with self.input()[1].open('r') as infile:
            ips = infile.read().splitlines()
        ip = ips[0]
        print(ip)
        #make ssh connection
        k = paramiko.RSAKey.from_private_key_file('C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\adaptivealgo.pem')
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print ('connecting')
        c.connect( hostname = ip, username = 'ec2-user', pkey = k)
        print ('connected')
        
        #stop a single container
        if (params['Approach']) == 'Exit':
            #get container id
            USERNAME = params['Username']
            USER_DIR_NAME = 'jhub-'+USERNAME
            #1. update white list and backup directory
            with SCPClient(c.get_transport()) as scp:
                scp.put('C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\whitelist.json', '/home/ec2-user/jupyterhub-deploy-docker')
            commands = ['sudo mv /home/ec2-user/nbdata/'+USER_DIR_NAME+' /home/ec2-user/nbdata/'+USER_DIR_NAME+'bak',
                        'sudo cp /home/ec2-user/jupyterhub-deploy-docker/whitelist.json /var/lib/docker/volumes/jupyterhub-data/_data']
            for command in commands:
                print ('Executing {}'.format( command ))
                stdin , stdout, stderr = c.exec_command(command)
                print (stdout.read())
                print ('Errors')
                print (stderr.read())
            #2. check the container status
            commands = ['docker ps -aqf \"name=' + 'jupyter-' + USERNAME +'\"']
            for command in commands:
                print ('Executing {}'.format( command ))
                stdin , stdout, stderr = c.exec_command(command)
                returnVal = stdout.read()
                print (returnVal)
                if(returnVal.decode("utf-8") == ''):
                    print('no such container named ' + USERNAME)
                    c.close()
                    return
                print('container found')
                CONTAINER_ID = returnVal.decode("utf-8")
                print ('Errors')
                print (stderr.read())
            #3. if the container is there, rm the container
            commands = ['docker rm -f ' + CONTAINER_ID, 
                        'sudo mv /home/ec2-user/nbdata/'+USER_DIR_NAME+' /home/ec2-user/nbdata/'+USER_DIR_NAME+'bak',
                        'sudo cp /home/ec2-user/jupyterhub-deploy-docker/whitelist.json /var/lib/docker/volumes/jupyterhub-data/_data']
            for command in commands:
                print ('Executing {}'.format( command ))
                stdin , stdout, stderr = c.exec_command(command)
                print (stdout.read())
                print ('Errors')
                print (stderr.read())
        
        #terminate the AWS instance
        if (params['Approach']) == 'Terminate':
            ec2 = boto3.resource('ec2')
            filters = [{'Name':'tag:Name', 'Values':[params['Module']]}]
            instances = ec2.instances.filter(Filters=filters)
            for instance in instances:
                target_ins=instance
            target_ins.terminate()
        
        #shutdown the service
        if (params['Approach']) == 'Down':
            commands = [ 'ls', 'cd jupyterhub-deploy-docker; docker-compose down']
            for command in commands:
                print ('Executing {}'.format( command ))
                stdin , stdout, stderr = c.exec_command(command)
                print (stdout.read())
                print ('Errors')
                print (stderr.read())

        c.close()

if __name__ == '__main__':
    luigi.run(['aws.StopTask', '--local-scheduler'])
