import boto3
import luigi
import paramiko
import time
import json
from luigi.mock import MockFile
from scp import SCPClient

class ParseParameters(luigi.Task):
    task_namespace = 'aws'

    def output(self):
        return MockFile('InstanceParams')

    def run(self):
        params = dict()
        params['Image'] = 'R'
        params['Module'] = 'Finace Modeling'
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
        
        #s3 = boto3.resource('s3')
        ec2 = boto3.resource('ec2')
        for ins in ec2.instances.all():
            #print(type(ins))#<class 'boto3.resources.factory.ec2.Instance'>
            print(ins.id)

        imgid = ''
        filter = {'Name': 'name', 'Values' : ['auto-ins']}
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
            #print(type(ins))#<class 'boto3.resources.factory.ec2.Instance'>
            if ins.id == new_id:
                print(ins.public_ip_address)
                new_ip = ins.public_ip_address
        
        _out = self.output().open('w')
        _out.write(new_ip)
        #_out.write('52.41.21.8')
        _out.close()

class StartHubTask(luigi.Task):
    task_namespace = 'aws'

    def requires(self):
        return [ParseParameters(), StartInstanceTask()]

    def run(self):

        with self.input()[0].open('r') as infile:
            print(infile)
            params = json.load(infile)
        
        if (params['Image']) == 'R':
            #print('RRRRRR')
            DOCKER_NOTEBOOK_IMAGE='jupyter/r:latest'
        if (params['Image']) == 'scipy':
            #print('sci')
            DOCKER_NOTEBOOK_IMAGE='jupyter/scipy-notebook:18e5563b7486'
            #print(DOCKER_NOTEBOOK_IMAGE)

        with open('.env', 'a') as envfile:
            envfile.write('\n')
            envfile.write('DOCKER_NOTEBOOK_IMAGE=' + DOCKER_NOTEBOOK_IMAGE)
        #sleep for VM initialization
        time.sleep(100) 
        # read IP address from the out put
        with self.input()[1].open('r') as infile:
            ips = infile.read().splitlines()

        ip = ips[0]
        #ip = '52.41.21.8'
        print(ip)

        k = paramiko.RSAKey.from_private_key_file('/home/parallels/.ssh/adaptivealgo.pem')
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print ('connecting')
        c.connect( hostname = ip, username = 'ec2-user', pkey = k)
        print ('connected')

        with SCPClient(c.get_transport()) as scp:
            scp.put('.env', '/home/ec2-user/wei')

        commands = [ 'ls', 'cd wei; docker-compose up -d']
        for command in commands:
        	print ('Executing {}'.format( command ))
        	stdin , stdout, stderr = c.exec_command(command)
        	print (stdout.read())
        	print ('Errors')
        	print (stderr.read())
        c.close()

if __name__ == '__main__':
    luigi.run(['aws.StartHubTask', '--local-scheduler'])
