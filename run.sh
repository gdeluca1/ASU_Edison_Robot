#!/bin/bash

cd ~
while true; do
# Kill any instances of the sketch that were previously running.
# The sketch currently needs to be restarted each time to allow
# the socket to be connected to.
pidof sketch.elf | xargs kill

# Start the arduino sketch.
./ASU_Edison_Robot/ArduinoFiles/sketch.elf /dev/ttyS0 /dev/ttyS0 &

# Start the node file.
node ASU_Edison_Robot/main.js
echo "Looping."
done
echo "Exiting."