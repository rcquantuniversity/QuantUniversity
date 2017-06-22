#!/usr/bin/env python
# py2.7
import paramiko
import json
from random import randint
import boto3
import time
import socket

def createEC2Instance():
    ec2 = boto3.resource('ec2')
    imgid = ''
    filter = {'Name': 'name', 'Values' : ['execution']}
    for img in ec2.images.filter(Filters = [filter]):
        imgid = img.id
        # print imgid
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
                            'Value': str(randint(0,100))
                        },
                    ]
                },
            ]
        )
    time.sleep(10)
    # print instance
    new_id = instance[0].id
    new_ip = ''
    ec2 = boto3.resource('ec2')
    for ins in ec2.instances.all():
        #print(type(ins))#<class 'boto3.resources.factory.ec2.Instance'>
        if ins.id == new_id:
            print(ins.public_ip_address)
            new_ip = ins.public_ip_address
    print new_ip
    time.sleep(20)
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex((new_ip,22))
    while result != 0:
        print ("22 port is not open")
        result = sock.connect_ex((new_ip,22))
        time.sleep(5)
    return new_id, new_ip
    
def terminateEC2Instance(instance_id):
    ec2 = boto3.resource('ec2')
    ec2.instances.filter(InstanceIds=[instance_id]).terminate()

def runScriptAWS(hostname, username, key_file, imageName, commands):
    k = paramiko.RSAKey.from_private_key_file(key_file)
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print 'connecting'
    c.connect( hostname = hostname, username = username, pkey = k )
    print "connected"

    temp=''
    for command in commands:
        temp += command
        temp += ';'
    cmd = 'docker run --rm '+ imageName + ' /bin/bash -c \"' + temp + '\"'
    print cmd
    stdin , stdout, stderr = c.exec_command(cmd)
    print stdout.read()
    #print stderr.read()
    c.close()

def main():
    hostname=''
    username=''
    key_file=''
    imageName=''
    command=''
    with open('run_script.json') as f:
        data = json.load(f)
        key_file=data['key_file']
        imageName=data['imageName']
        commands=data['commands']
    id, ip = createEC2Instance()
    hostname=ip
    runScriptAWS(hostname, 'ec2-user', key_file, imageName, commands)
    time.sleep(20)
    print 'terminating new instance ', id
    terminateEC2Instance(id)
    print 'ec2 instance terminated'

if __name__ == '__main__':
    main()