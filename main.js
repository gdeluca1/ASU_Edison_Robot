// Library imports.
// Flashing instructions for MRAA as well as installation instructions for the Cylon
// library can be found here: http://cylonjs.com/documentation/platforms/edison/
// The UPM repository can be found here: https://github.com/intel-iot-devkit/upm

// Wiring pictures for servos and Grove sensors: https://github.com/intel-iot-devkit/edison-guides/wiki/Cylon.js-and-Intel-IoTDevKit-Example-Sketches
// Servos get plugged into the Grove Shield, into the digital ports (e.g. D3 and D5).
// Light sensor gets plugged into one of the side A ports (A0 - A3).

// Cylon is used to control Seeed Grove sensors as well as servos & motors.
//var Cylon = require('cylon');
// net is used for TCP Socket connections.
var net = require('net');
// This import is for the Ultrasonic sensor and comes from the upm package.
//var Hcsr04 = require('jsupm_hcsr04');
//var MaxSonarEZ = require('jsupm_maxsonarez');
//var SerialPort = require('serialport').SerialPort;

//var portName = "/dev/tty-usbserial1";
//var portName = "/dev/ttyUSB0";
//var portName = "/dev/tty";
//var serialPort = new SerialPort(portName, {
//    baudrate: 115200
//});
var mraa = require('mraa');
var touchSensor = new mraa.Gpio(2);
touchSensor.dir(mraa.DIR_IN);

// Update the touch sensor value every 100 ms.
setInterval(function(){
	// The GPIO pin will return 0 if the sensor is pressed, and 1 otherwise.
	touchValue = (touchSensor.read() == 0) ? 1 : 0;
	//console.log(touchValue);
}, 100);

// Robot name.
var ROBOT_NAME = 'EdisonRobot';

// Wheel ports
var LEFT_WHEEL_PORT = 3;
var RIGHT_WHEEL_PORT = 5;

// The time in ms between checking sensor data.
var SENSOR_POLLING_TIME = 100;

// Ultrasonic sensor variables.
var TRIGGER_PIN = 1;
var ECHO_PIN = 2;
var distance = -1;
// The distance sensor will be initalized when Cylon successfully connects to the board.
// Although it's not a Cylon sensor, we will do this to make sure we have access to the robot first.
var mySonar;

var touchValue;

// Light sensor variables.
var LIGHT_PORT = 0;
var lightValue;

// Port to setup TCP Server on.
var PORT = 8124;

//Sonar sensor data to be sent as JSON to web service
function SensorDataObject(name, id, value) {
	this.name = name;
	this.id = id;
	this.value = value;
}

function ServoController(pin, invert) {
	this.pin = pin;
	this.invert = invert;
	this.pwm = new mraa.Pwm(pin);
	this.pwm.enable(true);
	this.pwm.period_us(20000);
	// These are pulsewidth_us values.
	this.high = 1750;
	this.neutral = 1325;
	this.low = 900;
	this.setSpeed = function(speed) {
		if (speed < -1)
			speed = -1;
		if (speed > 1)
			speed = 1;
		if (this.invert == true)
			speed = -speed;
		
		// calculate desired pulsewidth, corresponding to input.
		// Calculation taken from 
		// https://github.com/jjrob13/IOT_Education/blob/master/ServoController.h
		var pulsewidth_us;
		if(speed >= 0)
		{
			var diff = (this.high - this.neutral);
			var scaled_diff = speed * diff;
			var rounded_scaled_diff = Math.round(scaled_diff);
			pulsewidth_us = this.neutral + Math.round(rounded_scaled_diff);
		}
		else
		{
			var diff = (this.neutral - this.low);
			var scaled_diff = speed * diff;
			var rounded_scaled_diff = Math.round(scaled_diff);
			pulsewidth_us = this.neutral + Math.round(rounded_scaled_diff);
		}
		
		// Check if speed is within 1/500 of 0.
		if (Math.round(1000 * speed) == 0)
		{
			console.log('disabling');
			this.pwm.enable(false);
		}
		else
		{
			this.pwm.enable(true);
		}

		this.pwm.pulsewidth_us(pulsewidth_us);
		console.log("Updating speed for servo on pin " + this.pin + " to " + speed);
		console.log("Pulse width us: " + pulsewidth_us);
	};
	this.setSpeed(0);
}

var speed = -1.0;
var modifier = 0.1;

// Right motor has to be inverted.
var leftMotor = new ServoController(LEFT_WHEEL_PORT);
var rightMotor = new ServoController(RIGHT_WHEEL_PORT, true);


// Create the TCP Server for reading/writing
var server = net.createServer(function (c) { //'connection' listener

	console.log('Robot creating connection');

	c.on('end', function() {
		console.log('Disconnecting');
	});
	
	//read string, parse, and execute
	c.on('data', function(data) {
		console.log(data.toString());

		// Sometimes, if data is sent too often, it will become garbled during sending. In that case,
		// we won't waste processor time trying to recover whatever's left. Rather, we'll just ignore it. 
		try {
		
			var JSONServoData = JSON.parse(data.toString().replace(/(\r\n|\n|\r)/gm,""));
		
			var ServoArray = JSONServoData.servos;
			//console.log(JSON.stringify(ServoArray));
		
			for (var i in ServoArray) {
				var id = ServoArray[i].servoId;
				var speed = ServoArray[i].servoSpeed;
				
				switch (id)
				{
					case LEFT_WHEEL_PORT:
						leftMotor.setSpeed(speed);
						break;
					case RIGHT_WHEEL_PORT:
						rightMotor.setSpeed(speed);
						break;
					default:
						console.log("Invalid motor id: " + id);
				}
			
				//console.log("after drive funct");
			}
		
			console.log("after loop");
		}
	    catch (e) {
	        console.log(e);
			console.log("Invalid message received: " + data.toString());
		}
	});
	
	// Send sensor data over the TCP Server.
	setInterval(function () {
		// Grab the distance since it isn't updated automatically.
		//distance = mySonar.inches();

		c.write(JSON.stringify({
			sensors: [
				new SensorDataObject("distance", 0, distance),
				//new SensorDataObject("light", 0, lightValue),
				new SensorDataObject("touch", 0, touchValue)
				// More sensor objects can be added here.
			]
		}) + '\r\n')
		//c.pipe(c);
	}, SENSOR_POLLING_TIME);

});

// Start listening on the port 'PORT.'
server.listen(PORT, function() { //'listening' listener
  console.log('Web Service connected to Robot');
});

//serialPort.on("open", function (err) {
//    if (err) {
//        console.log(err);
//        return;
//    }

//    console.log("Serial port is now open.");

//    // We'll attach the data listener as soon as the connection is successful.
//    serialPort.on("data", function (data) {
//        console.log("data received: " + data);
//    });
//});

var client = new net.Socket();
client.connect(8125, '127.0.0.1', function () {
    console.log("Connected to the Arduino program.");
});

client.on('data', function (data) {
    if (!data.toString().trim() == "")
        distance = parseInt(data, 10);
    //console.log(distance);
});