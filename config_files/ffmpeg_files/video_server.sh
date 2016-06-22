#kill any previous ffserver instances running
ps | grep ffserver | awk '{print $1;}' | xargs kill
sleep 1
/home/root/bin/ffmpeg/ffserver & ffmpeg -v 2 -r 10 -s 320x240 -f video4linux2 -i /dev/video0 http://localhost:8090/webcam.ffm

