#will install and start the video server
#the video stream can be accessed at any browser at: http://<edison-url>:8090/webcam.mjpeg
(cd ~
opkg install kernel-module-uvcvideo
cp ASU_Edison_Robot/config_files/ffmpeg_files/ffserver.conf /etc
chmod +x ASU_Edison_Robot/config_files/ffmpeg_files/install_ffmpeg.sh
./ASU_Edison_Robot/config_files/ffmpeg_files/install_ffmpeg.sh
chmod +x ASU_Edison_Robot/config_files/ffmpeg_files/video_server.sh
nohup ./ASU_Edison_Robot/config_files/ffmpeg_files/video_server.sh &
)

