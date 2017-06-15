import boto3
import luigi
import time
import json
import os
from luigi.mock import MockFile

class ParseParameters(luigi.Task):
    task_namespace = 'aws'

    def output(self):
        return MockFile('InstanceParams')

    def run(self):
        service_dir = os.path.realpath(__file__)[:-len(os.path.basename(__file__))]
        with open(service_dir+'/save_params.json') as data_file:    
            data = json.load(data_file)
        params = dict()
        params['Approach'] = data['approach']
        params['Module'] = data['module']
        params['AMIName'] = data['aminame']
        print(params)
        _out = self.output().open('w')
        json.dump(params,_out)
        _out.close()


class SaveAMI(luigi.Task):
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

        #target_ins.create_image(Name=params['AMIName'])

        _out = self.output().open('w')
        _out.write(target_ins.public_ip_address)
        _out.close()

if __name__ == '__main__':
    luigi.run(['aws.SaveAMI', '--local-scheduler'])
