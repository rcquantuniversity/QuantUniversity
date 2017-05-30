import requests

url = 'http://ec2-52-26-246-88.us-west-2.compute.amazonaws.com'
port = '8000'
username = '123456'
password = ''

# login
login_url = url + ':' + port + '/hub/login'
print login_url
s = requests.Session()
payload_login = {'username':username, 'password':password}
r = s.post(login_url, data=payload_login)
print r.status_code
user_url = url + ':' + port + '/user/1/tree#notebooks'
page = s.get(user_url)
cookies = s.cookies.get_dict()
print s.cookies.get_dict()
auth_url = url + ':' + port + '/authorizations/cookie/{jupyter-hub-token}/{'+ cookies['jupyter-hub-token']+'}'
print auth_url
r1 = s.get(auth_url)
print r1
# with open('page.html', 'w') as f:
# 	f.write(page.text)

