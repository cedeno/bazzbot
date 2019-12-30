#!/bin/bash
while ! node bot.js 
do
  sleep 1
  echo "Restarting program..."
done
