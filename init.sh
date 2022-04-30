#!/bin/bash

# npm i -g html-validator-cli
# npm i -g puppeteer
# Curl

SCRIPTDIR="$( dirname "${BASH_SOURCE[0]}" )/";

cat <<EOF

###################################
## DK Site Checker v 0.1.1
###################################

EOF

###################################
## Check installed
###################################

_main_commands="curl node";
for i in $_main_commands
do
    command -v "$i" >/dev/null 2>&1 || { echo >&2 "You need to install \"${i}\" to continue."; return 0; }
done;

_main_node_packages="puppeteer html-validator-cli";
for package in $_main_node_packages
do
    if [ `npm list -g | grep -c $package` -eq 0 ]; then
        echo  "You need to install the node package \"${package}\" to continue.";
        return 0;
    fi
done;

###################################
## Load helpers
###################################

. "${SCRIPTDIR}inc/helpers.sh";

###################################
## Run urls
###################################

while read line; do
    if [[ "${line}" == "" ]];then
        continue;
    fi;
    echo "";
    echo "####################";
    echo "## Test : ${line}";
    echo "####################";
    echo "";
    dksitechecker_html_validator "${line}";
    dksitechecker_docspeed "${line}";
    dksitechecker_jscheck "${line}";
done < "wputools-urls.txt"



