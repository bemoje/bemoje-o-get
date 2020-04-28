#!/bin/bash
curl -X DELETE -u $1 https://api.github.com/repos/$1/$2
echo Github repository deleted: https://github.com/$1/$2.git
