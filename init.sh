#!/bin/bash

SCRIPTDIR="$( dirname "${BASH_SOURCE[0]}" )/";

cat <<EOF

###################################
## DK Site Checker v 0.9.1
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

_main_node_packages="puppeteer html-validator-cli pixelmatch";
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
. "${SCRIPTDIR}inc/BashUtilities/bashutilities.sh";

###################################
## Load URL list
###################################

_DKSITEURLLIST="";
_DKSITEURLBASE="";
if [[ "${1}" == "" ]];then
    if [[ -f "wputools-urls.txt" ]];then
        _DKSITEURLLIST="wputools-urls.txt";
    fi;
    if [[ -f "../wputools-urls.txt" ]];then
        _DKSITEURLLIST="../wputools-urls.txt";
    fi;
fi;
if [[ "${1}" != "" && -f "${1}" ]];then
    _DKSITEURLLIST="${1}";
fi;
if [[ "${1}" != "" && ! -f "${1}" ]];then
    _DKSITEURLBASE="${1}";
fi;

if [[ "${_DKSITEURLLIST}" == "" && "${_DKSITEURLBASE}" == "" ]];then
    echo "Error: Couldn’t find an URL list.";
    return 0;
fi;

if [[ "${_DKSITEURLBASE}" != "" ]];then
    if curl --output /dev/null --silent --head --fail "${_DKSITEURLBASE}"; then
        echo "This page exists.";
    else
        echo "Error: Invalid URL : \"${_DKSITEURLBASE}\"";
        return 0;
    fi
fi;

###################################
## Run urls
###################################

if [[ "${_DKSITEURLLIST}" != "" ]];then
    while read line; do
        if [[ "${line}" == "" ]];then
            continue;
        fi;
        arrLine=(${line//;/ })
        dksitechecker_checkurl "${arrLine[0]}" "${arrLine[1]}";
    done < "${_DKSITEURLLIST}";
else
    dksitechecker_checkurl "${_DKSITEURLBASE}" "${2}";
fi;
