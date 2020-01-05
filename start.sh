#!/bin/bash

export GOOGLE_APPLICATION_CREDENTIALS="/home/cedeno/Project-b2674396db66.json"

while ! node bot.js > bazz.out 2>&1 
do
  sleep 1
  echo "Restarting program..."
done
