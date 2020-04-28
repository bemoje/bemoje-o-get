#!/bin/bash
# curl -H 'Authorization: token my_access_token' https://api.github.com/user/repos
curl -X POST -u $1:$2 https://api.github.com/user/repos -d "{\"name\": \"$3\", \"description\": \"$4\"}"
git init
git add README.md
git commit -m "init commit"
git remote add origin https://github.com/$1/$3.git
git push -u origin master
git push --set-upstream origin master
echo Github repository created: https://github.com/$1/$3.git
