#!/bin/sh
/usr/sbin/rfkill unblock bluetooth
/usr/bin/hciconfig hci0 up
/usr/bin/hciconfig hci0 piscan
systemctl start obex
nohup python /home/root/ASU_Edison_Robot/config_files/ip.py &
nohup ./home/root/ASU_Edison_Robot/run.sh &
