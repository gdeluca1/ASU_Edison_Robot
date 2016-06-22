eval cd ~
rm -f /etc/opkg/base-feeds.conf
echo 'src/gz all http://repo.opkg.net/edison/repo/all
src/gz edison http://repo.opkg.net/edison/repo/edison
src/gz core2-32 http://repo.opkg.net/edison/repo/core2-32'\
 >> /etc/opkg/base-feeds.conf
opkg update
opkg install git
opkg install boost boost-dev
git clone https://github.com/jjrob13/IOT_Education.git
(cd IOT_Education; make edison_robot; make clean)
(cd IOT_Education/servo_example; make calibrate_servo; make clean)
chmod +x IOT_Education/config_files/on_boot.sh
systemctl disable on_boot.service
systemctl stop on_boot.service
cp IOT_Education/config_files/on_boot.service /lib/systemd/system/
systemctl enable on_boot.service
systemctl start on_boot.service
#This is the video stuff
#opkg install kernel-module-uvcvideo
#chmod +x IOT_Education/config_files/ffmpeg_files/install_ffmpeg.sh
#./IOT_Education/config_files/ffmpeg_files/install_ffmpeg.sh
