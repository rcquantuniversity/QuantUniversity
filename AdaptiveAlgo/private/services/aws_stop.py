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
        #_out.write('52.41.21.8')
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

        # read IP address from the out put
        with self.input()[1].open('r') as infile:
            ips = infile.read().splitlines()
        ip = ips[0]
        print(ip)
        #make ssh connection
        k = paramiko.RSAKey.from_private_key_file('./private/services/adaptivealgo.pem')
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print ('connecting')
        c.connect( hostname = ip, username = 'ec2-user', pkey = k)
        print ('connected')
        
        
        #stop Jupyterhub service and all containers
        if (params['Approach']) == 'Exit':
            #get container id
            USERNAME = params['Username']
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
            commands = ['docker rm -f ' + CONTAINER_ID]
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
