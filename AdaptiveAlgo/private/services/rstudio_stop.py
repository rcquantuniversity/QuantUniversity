import boto3
import luigi
import paramiko
import time
import json
import os
import sys
import yaml
from luigi.mock import MockFile

pemkeyPath = 'C:\\Users\\QuantUniversity-6\\Rohan\\QuantUniversity\\AdaptiveAlgo\\private\\services\\qu.pem'

class ParseParameters(luigi.Task):
    task_namespace = 'aws'

    def output(self):
        return MockFile('InstanceParams')

    def run(self):
        service_dir = os.path.realpath(__file__)[:-len(os.path.basename(__file__))]
        with open(service_dir+'/r_stop_params.json') as data_file:    
            data = json.load(data_file)
        params = dict()
        params['Approach'] = 'Terminate'
        params['Module'] = data['module']
        params['Username'] = data['username']
        print(params)
        _out = self.output().open('w')
        json.dump(params,_out)
        _out.close()


class GetInstanceIP(luigi.Task):
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
        filters = [{'Name':'tag:Name', 'Values':[params['Module']+'-'+params['Username']]}]
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
        USERNAME = params['Username']

        #read IP address from the out put
        with self.input()[1].open('r') as infile:
            ips = infile.read().splitlines()
        ip = ips[0]
        print(ip)

        #make ssh connection
        k = paramiko.RSAKey.from_private_key_file(pemkeyPath)
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print ('connecting')
        c.connect( hostname = ip, username = 'ec2-user', pkey = k)
        print ('connected')
        
        #terminate the AWS instance
        if (params['Approach']) == 'Terminate':
            #1. check the container status
            commands = ['docker ps -aqf \"name='+USERNAME + '\"']
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
            #2. if the container is there, rm the container
            commands = ['docker rm -f ' + CONTAINER_ID]
            for command in commands:
                print ('Executing {}'.format( command ))
                stdin , stdout, stderr = c.exec_command(command)
                print (stdout.read())
                print ('Errors')
                print (stderr.read())
            #3. terminate instance
            ec2 = boto3.resource('ec2')
            filters = [{'Name':'tag:Name', 'Values':[params['Module']+'-'+params['Username']]}]
            instances = ec2.instances.filter(Filters=filters)
            for instance in instances:
                target_ins=instance
            target_ins.terminate()
        

        c.close()

if __name__ == '__main__':
    luigi.run(['aws.StopTask', '--local-scheduler'])
