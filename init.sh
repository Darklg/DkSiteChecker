#!/bin/bash

SCRIPTDIR="$( dirname "${BASH_SOURCE[0]}" )/";

cat <<EOF

###################################
## DK Site Checker v 0.2.0
###################################

EOF

###################################
## Check installed
###################################

_main_commands="curl node npm";
for i in $_main_commands
do
    command -v "$i" >/dev/null 2>&1 || { echo >&2 "You need to install \"${i}\" to continue."; return 0; }
done;

_main_node_packages="puppeteer html-validator-cli";
for package in $_main_node_packages
do
    if [ `npm list -g | grep -c $package` -eq 0 ]; then
        echo  "Installing the node package \"${package}\" to continue.";
        npm i -g "${package}";
    fi
done;

###################################
## Load helpers
###################################

. "${SCRIPTDIR}inc/helpers.sh";

###################################
## Load URL list
###################################

_DKSITEURLLIST="";
if [[ -f "wputools-urls.txt" ]];then
    _DKSITEURLLIST="wputools-urls.txt";
fi;
if [[ -f "../wputools-urls.txt" ]];then
    _DKSITEURLLIST="../wputools-urls.txt";
fi;
if [[ "${1}" != "" && -f "${1}" ]];then
    _DKSITEURLLIST="${1}";
fi;

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
    echo "";
    dksitechecker_html_validator "${line}";
    dksitechecker_docspeed "${line}";
    dksitechecker_jscheck "${line}";
done < "${_DKSITEURLLIST}";
