#!/bin/bash

read -p "Enter your Country: " country

if [ "$country" = "India" ]
then
    echo "You are Indian"
elif [ "$country" = "Nepal" ]
then
    echo "You are Nepali"
else
    echo "You are from the same country"
fi
