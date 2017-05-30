import boto3
import luigi
import paramiko
from luigi.mock import MockFile

class StartInstanceTask(luigi.ExternalTask):
    task_namespace = 'aws'

    def output(self):
        return MockFile("SimpleTask")

    def run(self):
        task_namespace = 'aws'
        s3 = boto3.resource('s3')
        ec2 = boto3.resource('ec2')
        for ins in ec2.instances.all():
            print(ins.public_ip_address)

        imgid = ''
        filter = {'Name': 'name', 'Values' : ['auto-ins']}
        for img in ec2.images.filter(Filters = [filter]):
            imgid = img.id
            print(imgid)

        # instance = ec2.create_instances(
        #     ImageId='',
        #     MinCount=1,
        #     MaxCount=1,
        #     KeyName='adaptivealgo',
        #     SecurityGroupIds=[
        #         'jupyterhub',
        #     ],
        #     UserData='',
        #     InstanceType='t2.micro'
        # )

        _out = self.output().open('w')
        _out.write('52.41.21.8')
        _out.close()

class StartHubTask(luigi.Task):
    task_namespace = 'aws'

    def requires(self):
        return StartInstanceTask()

    def run(self):
        # read IP address from the out put
        with self.input().open('r') as infile:
            ips = infile.read().splitlines()

        ip = ips[0]

        print(ip)

        k = paramiko.RSAKey.from_private_key_file("C:\\Users\\QuantUniversity-6\\Downloads\\Rohan\\AdaptiveAlgo\\private\\services\\adaptivealgo.pem")
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print ("connecting")
        c.connect( hostname = ip, username = "ec2-user", pkey = k)
        print ("connected")
        commands = [ "ls", "cd wei; docker-compose up -d"]
        for command in commands:
        	print ("Executing {}".format( command ))
        	stdin , stdout, stderr = c.exec_command(command)
        	print (stdout.read())
        	print ("Errors")
        	print (stderr.read())
        c.close()

if __name__ == '__main__':
    luigi.run(['aws.StartHubTask', '--local-scheduler'])
