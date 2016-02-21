#!/bin/bash


URL="https://pim-ljack1.c9.io/api/getapp/json/R5JEv9qWLp255XEAo"

function fetch {
    git add laskuni.json
    git commit -m "Autocommit"
    curl  $URL > laskuni.json
    meteor-kitchen ./laskuni.json laskuni
}

function show_dialog {
    dialog --title "Fetch 'laskuni' Again?" --yesno "Fetch app 'laskuni' again from $URL ?" 7 60
}

function ui {
    while true; do
        show_dialog
        response=$?
        case $response in 
            0) fetch  | dialog --programbox 20 60 ;;
            1) break ;; # no pressed
            255) break;; # ESC pressed
        esac
    
    done
}

fetch
echo
echo "Thank you."
