#!/bin/bash

###################################
## HTML Validation
###################################

function dksitechecker_html_validator(){
    echo "# HTML Validator";
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
    echo "# Page Speed";
    curl -s -w 'Time: %{time_total}\n' -o /dev/null "${1}"
}

###################################
## JS errors
###################################

function dksitechecker_jscheck(){
    echo "# JS Errors";
    node "${SCRIPTDIR}/puppet.js" "${1}";
}
