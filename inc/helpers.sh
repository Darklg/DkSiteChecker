#!/bin/bash

###################################
## HTML Validation
###################################

function dksitechecker_html_validator(){
    dksitechecker_echo_title "# HTML Validator";
    html-validator "${1}" --islocal \
        --ignore='Error: Attribute “placeholder” not allowed on element “select” at this point.'\
        --ignore='Error: Bad value “none” for attribute “autocomplete” on element “input”: The string “none” is not a valid autofill field name.'\
        --ignore='Error: Bad value “” for attribute “action” on element “form”: Must be non-empty.'\
        --ignore='Error: Bad value “” for attribute “target” on element “a”: Browsing context name must be at least one character long.'\
        --ignore='Error: Duplicate attribute “id”.'\
        --ignore='Error: Element “img” is missing required attribute “src”.'\
        --ignore='Error: The value of the “for” attribute of the “label” element must be the ID of a non-hidden form control.'\
        --verbose;
}

###################################
## Speed
###################################

function dksitechecker_docspeed(){
    dksitechecker_echo_title "# Page Speed";
    curl -s -w 'Time: %{time_total}\n' -o /dev/null "${1}"
}

###################################
## Check headless nav
###################################

function dksitechecker_headlesscheck(){
    local _hidden_elements=".qc-cmp2-container,body>.cookie-notice,.modal[data-visible=\\\"1\\\"]";
    if [[ "${dksitechecker_hidden_elements}" != "" ]];then
        _hidden_elements="${dksitechecker_hidden_elements}";
    fi;
    node "${SCRIPTDIR}/inc/puppet.js" "{\"urlcurrent\":\"${1}\",\"urlsource\":\"${2}\",\"hidden_elements\":\"${_hidden_elements}\"}";
    local _slug=$(bashutilities_string_to_slug "${1}");
    if [[ "${2}" != "" && -f "page-current.png" && -f "page-source.png" ]];then
        pixelmatch  "page-current.png" "page-source.png" "diff-${_slug}.png" 0.1
    fi;
    if [[ "${2}" != "" && -f "pagemobile-current.png" && -f "pagemobile-source.png" ]];then
        pixelmatch  "pagemobile-current.png" "pagemobile-source.png" "diff-${_slug}-mobile.png" 0.1
    fi;
}

###################################
## Common
###################################

function dksitechecker_checkurl(){
    echo "";
    echo "####################";
    echo "## Test : ${1}";
    echo "";
    dksitechecker_html_validator "${1}";
    dksitechecker_docspeed "${1}";
    dksitechecker_headlesscheck "${1}" "${2}";
}

###################################
## Color
###################################

function dksitechecker_echo_title(){
    local RED='\033[0;33m'
    local NC='\033[0m'
    echo -e "${RED}${1}${NC}";
}
