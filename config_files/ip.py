#!/usr/bin/python
#
#
# References:
# http://stackoverflow.com/questions/24196932/how-can-i-get-the-ip-address-of-eth0-in-python

# https://github.com/intel-iot-devkit/upm/blob/master/examples/python/rgb-lcd.py

# Permission is hereby granted, free of charge, to any person obtaining

# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import socket
from time import sleep
import fcntl
import struct

import pyupm_i2clcd as lcd

#how long we are willing to wait to get an ip address
TIMEOUT_TIME = 120 #seconds
RECONNECTION_TIME = 1


CONNECTION_ATTEMPTS = TIMEOUT_TIME / RECONNECTION_TIME
def get_ip_address(ifname):

	s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
	return socket.inet_ntoa(fcntl.ioctl(
		s.fileno(),
		0x8915,  # SIOCGIFADDR
		struct.pack('256s', ifname[:15])
		)[20:24])

# Initialize Jhd1313m1 at 0x3E (LCD_ADDRESS) and 0x62 (RGB_ADDRESS)
myLcd = lcd.Jhd1313m1(0, 0x3E, 0x62)

# Clear
# Clear
myLcd.clear()

# Green
myLcd.setColor(255, 255, 0)

# Zero the cursor
myLcd.setCursor(0,0)

i = 0
ip_read = False
while i != CONNECTION_ATTEMPTS and not ip_read:
	try:
		ip_address = get_ip_address('wlan0')
		#check for valid ip address
		if len(ip_address.split('.')) == 4:
			ip_read = True
			myLcd.write(ip_address)
	except:
		ip_address = ""
		#error while reading ip_address
	sleep(RECONNECTION_TIME)
	i += 1



#If we fail to obtain an ip address, print an error message
if not ip_read:
	myLcd.clear()
	myLcd.setCursor(0,10)
	myLcd.write("   No IP Address")


"""
On some Edisons, the lcd screen would go out immediately after the program
ceased execution.  To mitigate this, we simply have the process loop in
the background.  Only on a successful attempt, of course.
"""
SLEEP_TIME = 600 #seconds
while ip_read: 
	sleep(SLEEP_TIME)
