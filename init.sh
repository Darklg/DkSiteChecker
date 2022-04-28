#!/bin/bash

# npm i -g html-validator-cli
# npm i -g puppeteer
# Curl

SCRIPTDIR="$( dirname "${BASH_SOURCE[0]}" )/";

cat <<EOF

###################################
## DK Site Checker v 0.1.0
###################################

EOF

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



