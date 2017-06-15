import boto3
import luigi
import paramiko
import time
import json
import os
from luigi.mock import MockFile
from scp import SCPClient

class ParseParameters(luigi.Task):
    task_namespace = 'aws'

    def output(self):
        return MockFile('InstanceParams')

    def run(self):
        service_dir = os.path.realpath(__file__)[:-len(os.path.basename(__file__))]
        with open(service_dir+'/start_params.json') as data_file:    
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
        
        task_namespace = 'aws'

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
        filter = {'Name': 'name', 'Values' : ['yayaya']}
        for img in ec2.images.filter(Filters = [filter]):
            imgid = img.id
            print(imgid)

        instance = ec2.create_instances(
            ImageId=imgid,
            MinCount=1,
            MaxCount=1,
            KeyName='adaptivealgo',
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
            if ins.id == new_id:
                print(ins.public_ip_address)
                new_ip = ins.public_ip_address
        
        _out = self.output().open('w')
        _out.write(new_ip)
        _out.close()
        #sleep for VM initialization
        time.sleep(70) 
        #efs init
        k = paramiko.RSAKey.from_private_key_file('C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\adaptivealgo.pem')
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print ('connecting')
        c.connect( hostname = new_ip, username = 'ec2-user', pkey = k)
        print ('connected')

        commands = ['sudo service docker stop',
                    'sleep 5',
                    'sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 fs-8430e32d.efs.us-west-2.amazonaws.com:/ nbdata',
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

        DOCKER_NOTEBOOK_IMAGE = params['Image']
        USER_NAME = params['Username']
        USER_DIR_NAME = 'jhub-'+USER_NAME
        
        #write new .env file
        with open('C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\.env', 'r') as f:
            content = f.readlines()
        
        newcontent=[]
        for line in content:
            if not line.startswith('DOCKER_NOTEBOOK_IMAGE'):
                newcontent.append(line)
        newcontent.append('DOCKER_NOTEBOOK_IMAGE=' + DOCKER_NOTEBOOK_IMAGE)

        print(newcontent)
        with open('C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\.env', 'w') as f:
            for line in newcontent:
                f.write("%s" % line)

        # read IP address from the out put
        with self.input()[1].open('r') as infile:
            ips = infile.read().splitlines()

        ip = ips[0]
        print(ip)
 
        k = paramiko.RSAKey.from_private_key_file('C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\adaptivealgo.pem')
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print ('connecting')
        c.connect( hostname = ip, username = 'ec2-user', pkey = k)
        print ('connected')

        with SCPClient(c.get_transport()) as scp:
            scp.put('C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\.env', '/home/ec2-user/jupyterhub-deploy-docker')
        
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
        commands = ['ls','docker pull '+DOCKER_NOTEBOOK_IMAGE, 'sleep 5',
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
        c.close()

        print('ip: '+ip)
if __name__ == '__main__':
    luigi.run(['aws.StartHubTask', '--local-scheduler'])
