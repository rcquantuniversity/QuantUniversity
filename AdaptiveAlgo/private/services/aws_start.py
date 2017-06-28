import boto3
import luigi
import paramiko
import time
import json
import os
import yaml
import sys
import socket
from luigi.mock import MockFile
from scp import SCPClient

# pemkeyPath = '/home/parallels/.ssh/qu.pem'
# pemKeyName = 'qu'
envFilePath = 'C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\.env'
whitelistPath = 'C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\whitelist.json'
efsDns = 'fs-8430e32d.efs.us-west-2.amazonaws.com'
# AMIName = 'dragon'

class ParseParameters(luigi.Task):
    task_namespace = 'aws'

    def output(self):
        return MockFile('InstanceParams')

    def run(self):
        service_dir = os.path.realpath(__file__)[:-len(os.path.basename(__file__))]
        #with open(service_dir+'/start_params.json') as data_file:
        #    data = json.load(data_file)
        data_file = sys.stdin.readlines()
        data = json.loads(data_file[0])
        #data = {"imageName": "jhub/test","module": "jeff91","username": "s1","maxUsers": "2","version": "latest","pemName" : "qurohan","pemFilePath": "C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\qurohan.pem","accessKeyID": "AKIAIJ3DBHMG34T5OVJQ","secretAccessKey": "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","amiId" : "ami-c27561bb"}
        # params = dict()
        # params['Image'] = data['imageName']
        # params['Module'] = data['module']
        # params['Username'] = data['username']
        # params['MaxUsers'] = data['maxUsers']
        # print(params)
        print(data)
        _out = self.output().open('w')
        json.dump(data,_out)
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

        maxUsersForOneIns = int(params['maxUsers'])
        numOfCurrentUsers = 0
        numOfExistingIns = 0
        moduleName = params['module']
        userName = params['username']
        fileName = moduleName+'_balance_status.json'
        whitelistName = 'whitelist.json'
        service_dir = os.path.realpath(__file__)[:-len(os.path.basename(__file__))]
        jsonFilePath = service_dir+fileName
        whitelistPath = service_dir+whitelistName

        #read LoadBalance JSON:
        #if the JSON file doesnt exit
        if not os.path.isfile(jsonFilePath):
            print('corresponding JSON not here, create one')
            #create new JSON, maxUsers based on start_params.json
            newJson ={}
            newJson['maxUsers'] = params['maxUsers']
            newJson['vms'] = []
            with open(jsonFilePath, 'w') as fp:
                json.dump(newJson, fp)
        #load data from JSON file
        with open(jsonFilePath, 'r') as f:
            content = yaml.safe_load(f)
        vmdict = {}
        for vm in content['vms']:
            vmdict[str(vm)] = (content['vms'][vm])

        #ckeck any unbalance in the cluster, if any conflict, exit the pipe line
        for vm in vmdict:
            #update the params
            print(type(vm))
            numOfExistingIns=numOfExistingIns+1
            numOfCurrentUsers=numOfCurrentUsers+len(vmdict[vm])
            if(len(vmdict[vm])>maxUsersForOneIns):
                print('load balance in '+vm+' is broken')
                sys.exit()
            if(userName in vmdict[vm]):
                print('user already in the cluster')
                sys.exit()

        if(numOfExistingIns * maxUsersForOneIns < numOfCurrentUsers):
            print('messed up with load balance, too many containers, too few instances.')
            sys.exit()

        #need a new instance?
        needToAllocate = False
        if(numOfExistingIns * maxUsersForOneIns == numOfCurrentUsers):
            print('capacity full, need to allocate a new instance')
            needToAllocate = True

        #give user an avalaible instance the he can use
        #pass an existing instance name or a non-existing instance name
        passInfo = {}
        passInfo.update(params)
        if(needToAllocate==True):
            print('allocate new instance')
            vmdict[moduleName+'-'+str(len(vmdict)+1)] = [userName]
            passInfo['module'] = moduleName+'-'+str(len(vmdict))
            with open(whitelistPath, 'w') as fp:
                whitelist={}
                print(vmdict)
                whitelist['whitelist'] = vmdict[moduleName+'-'+str(len(vmdict))]
                json.dump(whitelist, fp)
        if(needToAllocate==False):
            for vm in vmdict:
                if(len(vmdict[vm])) < maxUsersForOneIns:
                    print(vm + ' is available, '+userName+' is added to it')
                    vmdict[vm].append(userName)
                    passInfo['module'] = vm
                    with open(whitelistPath, 'w') as fp:
                        whitelist={}
                        whitelist['whitelist'] = vmdict[vm]
                        json.dump(whitelist, fp)
                    break
        #write to output for next
        _out = self.output().open('w')
        json.dump(passInfo,_out)
        _out.close()
        #write to balance status JSON
        print(vmdict)
        writeData = {}
        writeData['maxUsers'] = maxUsersForOneIns
        writeData['vms'] = vmdict
        # writeData.update(params)
        print(writeData)
        with open(jsonFilePath, 'w') as fp:
            json.dump(writeData, fp)


class StartInstanceTask(luigi.Task):
    task_namespace = 'aws'

    def requires(self):
        return DummyLoadBalancer()

    def output(self):
        return MockFile('InstanceInfo')

    def run(self):
        #read from DummyLoadBalancer
        with self.input().open('r') as infile:
            params = json.load(infile)

        print(params)
        ec2 = boto3.resource('ec2',
                            aws_access_key_id=params['accessKeyID'],
                            aws_secret_access_key=params['secretAccessKey'])

        filters = [{'Name':'tag:Name', 'Values':[params['module']]}]
        counter = 0
        instances = ec2.instances.filter(Filters=filters)
        for instance in instances:
            counter = counter + 1
        if counter>0:

            print('Module already started. Restart the service ' + instance.public_ip_address)
            _out = self.output().open('w')
            _out.write(instance.public_ip_address)
            _out.close()
            return

        imgid = params['amiId']
        # filter = {'Name': 'name', 'Values' : [AMIName]}
        # for img in ec2.images.filter(Filters = [filter]):
        #     imgid = img.id
        #     print(imgid)

        instance = ec2.create_instances(
            ImageId=imgid,
            MinCount=1,
            MaxCount=1,
            KeyName=params['pemName'],
            SecurityGroupIds=[
                'jupyterhub',
            ],
            UserData='',
            InstanceType='t2.micro',
            TagSpecifications=[
                {
                    'ResourceType': 'instance',
                    'Tags': [
                        {
                            'Key': 'Name',
                            'Value': params['module']
                        },
                    ]
                },
            ]
        )
        #print(type(instance))
        #print(type(instance[0]))#<class 'boto3.resources.factory.ec2.Instance'>
        #print(type(instance[0].public_ip_address))
        #print(instance)
        print(instance[0].public_ip_address)
        time.sleep(10)
        new_id = instance[0].id
        new_ip = ''
        ec2 = boto3.resource('ec2',
                            aws_access_key_id=params['accessKeyID'],
                            aws_secret_access_key=params['secretAccessKey'])
        for ins in ec2.instances.all():
            #print(type(ins))#<class 'boto3.resources.factory.ec2.Instance'>
            if ins.id == new_id:
                print(ins.public_ip_address)
                new_ip = ins.public_ip_address

        _out = self.output().open('w')
        _out.write(new_ip)
        _out.close()
        #sleep for VM initialization
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((new_ip,22))
        while result != 0:
            print ("22 port is not open")
            result = sock.connect_ex((new_ip,22))
            time.sleep(5)
        #efs init

        #1. establish ssh connection
        k = paramiko.RSAKey.from_private_key_file(params['pemFilePath'])
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print ('connecting')
        c.connect( hostname = new_ip, username = 'ec2-user', pkey = k)
        print ('connected')

        #2. check docker service status
        commands = ['sudo service docker status']
        stdin , stdout, stderr = c.exec_command(commands[0])
        returnVal = stdout.read()
        while not 'running...' in returnVal.decode("utf-8"):
            stdin , stdout, stderr = c.exec_command(commands[0])
            returnVal = stdout.read()
            print('docker service is not up')
            time.sleep(5)

        #3. stop the service and mount
        commands = ['sudo service docker stop',
                    'sleep 5',
                    'sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 '+efsDns+':/ nbdata',
                    'sleep 5',
                    'sudo mount -a',
                    'sleep 5',
                    'sudo service docker start']
        #stop docker
        #mount efs
        #start docker
        for command in commands:
                print ('Executing {}'.format( command ))
                stdin , stdout, stderr = c.exec_command(command)
                print (stdout.read())
                print ('Errors')
                print (stderr.read())
        c.close()

class StartHubTask(luigi.Task):
    task_namespace = 'aws'

    def requires(self):
        return [ParseParameters(), StartInstanceTask()]

    def run(self):

        with self.input()[0].open('r') as infile:
            print(infile)
            params = json.load(infile)

        DOCKER_NOTEBOOK_IMAGE = params['imageName']
        USER_NAME = params['username']
        USER_DIR_NAME = 'jhub-'+USER_NAME
        #update env file
        with open(envFilePath, 'r') as f:
            content = f.readlines()

        newcontent=[]
        for line in content:
            if not line.startswith('DOCKER_NOTEBOOK_IMAGE'):
                newcontent.append(line)
        newcontent.append('DOCKER_NOTEBOOK_IMAGE=' + DOCKER_NOTEBOOK_IMAGE)

        print(newcontent)
        with open(envFilePath, 'w') as f:
            for line in newcontent:
                f.write("%s" % line)


        # read IP address from the out put
        with self.input()[1].open('r') as infile:
            ips = infile.read().splitlines()

        ip = ips[0]
        print(ip)

        k = paramiko.RSAKey.from_private_key_file(params['pemFilePath'])
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print ('connecting')
        c.connect( hostname = ip, username = 'ec2-user', pkey = k)
        print ('connected')

        with SCPClient(c.get_transport()) as scp:
            scp.put(envFilePath, '/home/ec2-user/jupyterhub-deploy-docker')
            scp.put(whitelistPath, '/home/ec2-user/jupyterhub-deploy-docker')
        #is the image on local machine?
        commands = ['docker images -q '+DOCKER_NOTEBOOK_IMAGE]
        for command in commands:
            print ('Executing {}'.format( command ))
            stdin , stdout, stderr = c.exec_command(command)
            returnVal = stdout.read()
            print (returnVal)
            if(returnVal.decode("utf-8") != ''):
                print('image exists on local')
                isOnLocalMachine = True
            print ('Errors')
            print (stderr.read())
        #is the backup folder for USER_NAME existing?
        bakdirExists = False
        commands = ['ls /home/ec2-user/nbdata']
        for command in commands:
            print ('Executing {}'.format( command ))
            stdin , stdout, stderr = c.exec_command(command)
            dirlist = stdout.read()
            dirlist = dirlist.decode("utf-8")
            dirlist = dirlist.splitlines()
            print('dirlist: ')
            print (dirlist)
            print(type(dirlist))
            if USER_DIR_NAME+'bak' in dirlist:
                bakdirExists = True
                print('backup exists')
            print ('Errors')
            print (stderr.read())
        if bakdirExists == True:
            commands = ['docker rm `docker ps --no-trunc -aq`',
                        'rm -r /home/ec2-user/nbdata/'+USER_DIR_NAME,
                        'mv /home/ec2-user/nbdata/'+USER_DIR_NAME+'bak'+' /home/ec2-user/nbdata/'+USER_DIR_NAME]
            for command in commands:
                print ('Executing {}'.format( command ))
                stdin , stdout, stderr = c.exec_command(command)
                print(stdout.read())
                print ('Errors')
                print (stderr.read())
        commands = ['sudo cp /home/ec2-user/jupyterhub-deploy-docker/whitelist.json /var/lib/docker/volumes/jupyterhub-data/_data',
                    'docker pull '+DOCKER_NOTEBOOK_IMAGE, 'sleep 5',
                    'mkdir -p /home/ec2-user/nbdata/'+USER_DIR_NAME, 'sudo chown 1000 /home/ec2-user/nbdata/'+USER_DIR_NAME,
                    'cd /home/ec2-user/jupyterhub-deploy-docker; docker-compose up -d; docker-compose up -d'
                    ]
        #if image exists, skip pulling
        # if(isOnLocalMachine == True):
        #     del commands[1]
        for command in commands:
                print ('Executing {}'.format( command ))
                stdin , stdout, stderr = c.exec_command(command)
                print (stdout.read())
                print ('Errors')
                print (stderr.read())

        #check 80 port
        eightyCounter = 0
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((ip,80))
        while result != 0:
            print ("80 port is not open")
            result = sock.connect_ex((ip,80))
            time.sleep(5)
            eightyCounter = eightyCounter + 1
            if eightyCounter == 10:
                stdin , stdout, stderr = c.exec_command(commands[3])
                print (stdout.read())
                print ('Errors')
                print (stderr.read())
                eightyCounter = 0
        print('ip: '+ip)
        c.close()

if __name__ == '__main__':
    luigi.run(['aws.StartHubTask', '--local-scheduler'])