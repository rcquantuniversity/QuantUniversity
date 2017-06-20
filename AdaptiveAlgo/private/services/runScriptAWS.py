#!/usr/bin/env python
# py2.7
import paramiko
import json

def runScriptAWS(hostname, username, key_file, imageName, commands):
    k = paramiko.RSAKey.from_private_key_file(key_file)
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print 'connecting'
    c.connect( hostname = hostname, username = username, pkey = k )
    print "connected"
    # for command in commands:
    #     print "Executing {}".format( command )
    #     stdin , stdout, stderr = c.exec_command(command)
    #     print stdout.read()
    #     # print( "Errors")
    #     if (stderr.read()!=''):
    #         print('err:')
    #         print stderr.read()
    temp=''
    for command in commands:
        temp += command
        temp += ';'
    cmd = 'docker run --rm '+ imageName + ' /bin/bash -c \"' + temp + '\"'
    print cmd
    stdin , stdout, stderr = c.exec_command(cmd)
    print stdout.read()
    print stderr.read()
    c.close()

def main():
    hostname=''
    username=''
    key_file=''
    imageName=''
    command=''
    with open('run_script.json') as f:
        data = json.load(f)
        hostname=data['hostname']
        username=data['username']
        key_file=data['key_file']
        imageName=data['imageName']
        commands=data['commands']
    runScriptAWS(hostname, username, key_file, imageName, commands)

if __name__ == '__main__':
    main()