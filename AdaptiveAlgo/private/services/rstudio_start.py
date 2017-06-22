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

pemkeyPath = 'C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\qu.pem'
efsDns = 'fs-8430e32d.efs.us-west-2.amazonaws.com'

class ParseParameters(luigi.Task):
    task_namespace = 'aws'

    def output(self):
        return MockFile('InstanceParams')

    def run(self):
        service_dir = os.path.realpath(__file__)[:-len(os.path.basename(__file__))]
        with open(service_dir+'r_start_params.json') as data_file:    
            data = json.load(data_file)
        params = dict()
        params['Image'] = data['imageName']
        params['Module'] = data['module']
        params['Username'] = data['username']
        print(params)
        _out = self.output().open('w')
        json.dump(params,_out)
        _out.close()

class StartInstanceTask(luigi.Task):
    task_namespace = 'aws'

    def requires(self):
        return ParseParameters()

    def output(self):
        return MockFile('InstanceInfo')

    def run(self):
        #read from ParseParameters
        with self.input().open('r') as infile:
            print(infile)
            params = json.load(infile)
        
        ec2 = boto3.resource('ec2')
        
        filters = [{'Name':'tag:Name', 'Values':[params['Module']]}]
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

        imgid = ''
        filter = {'Name': 'name', 'Values' : ['rs_image']}
        for img in ec2.images.filter(Filters = [filter]):
            imgid = img.id
            print(imgid)

        instance = ec2.create_instances(
            ImageId=imgid,
            MinCount=1,
            MaxCount=1,
            KeyName='qu',
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
                            'Value': params['Module']
                        },
                    ]
                },
            ]
        )
        print(type(instance))
        print(type(instance[0]))#<class 'boto3.resources.factory.ec2.Instance'>
        print(type(instance[0].public_ip_address))
        print(instance)
        print(instance[0].public_ip_address)
        time.sleep(10)
        new_id = instance[0].id
        new_ip = ''
        ec2 = boto3.resource('ec2')
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
        k = paramiko.RSAKey.from_private_key_file(pemkeyPath)
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
                    'sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 '+efsDns+':/ rstudio_data',
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

class StartRstudio(luigi.Task):
    task_namespace = 'aws'

    def requires(self):
        return [ParseParameters(), StartInstanceTask()]

    def run(self):

        with self.input()[0].open('r') as infile:
            print(infile)
            params = json.load(infile)

        DOCKER_NOTEBOOK_IMAGE = params['Image']
        USER_NAME = params['Username']
        #USER_DIR_NAME = 'jhub-'+USER_NAME
        
        # read IP address from the out put
        with self.input()[1].open('r') as infile:
            ips = infile.read().splitlines()

        ip = ips[0]
        print(ip)
 
        k = paramiko.RSAKey.from_private_key_file(pemkeyPath)
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print ('connecting')
        c.connect( hostname = ip, username = 'ec2-user', pkey = k)
        print ('connected')

        commands = ['mkdir /home/ec2-user/rstudio_data/rstudio_'+USER_NAME,
                    'docker run -d -p 80:8787 -e USER='+USER_NAME+' -e PASSWORD='+USER_NAME+' --name '+USER_NAME+' -v /home/ec2-user/rstudio_data/rstudio_'+USER_NAME+'/:/home/'+USER_NAME+' '+DOCKER_NOTEBOOK_IMAGE]

        for command in commands:
        	print ('Executing {}'.format( command ))
        	stdin , stdout, stderr = c.exec_command(command)
        	print (stdout.read())
        	print ('Errors')
        	print (stderr.read())
        c.close()

        #check 80 port
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((ip,80))
        while result != 0:
            print ("80 port is not open")
            result = sock.connect_ex((ip,80))
            time.sleep(5)
        print('ip: '+ip)

if __name__ == '__main__':
    luigi.run(['aws.StartRstudio', '--local-scheduler'])
