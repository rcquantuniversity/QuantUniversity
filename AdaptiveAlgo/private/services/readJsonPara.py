import sys, yaml

def read_in():
    lines = sys.stdin.readlines()
    print "jaja" + lines[0]
    #Since our input would only be having one line, parse our JSON data from that
    return yaml.safe_load(lines[0])