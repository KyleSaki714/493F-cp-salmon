/*
 * Input Controllers for Salmon Savior.
 * This is from https://github.com/jrowberg/i2cdevlib/blob/master/Arduino/MPU6050/examples/MPU6050_DMP6/MPU6050_DMP6.ino
 and the example file for L1S3DH here https://learn.adafruit.com/adafruit-lis3dh-triple-axis-accelerometer-breakout/arduino 
*/


// Basic demo for accelerometer readings from Adafruit LIS3DH

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_LIS3DH.h>
#include <Adafruit_Sensor.h>

// ----------------------- JOYSTICK, VIBRO, LED INIT ----------------------- 

const int JOYSTICKY_PIN = A0;
const int JOYSTICKX_PIN = A1;
const int JOYSTICKBTN_PIN = 9;

const int VIBROPIN = 10;

const int redPin = 11;
const int greenPin = 12;
const int bluePin = 13;

// chatGPT code
const unsigned long onTime = 200; // Vibromotor on duration in milliseconds
unsigned long previousMillis = 0; // Stores the last time the vibromotor was updated
bool vibromotorOn = false; // Current state of the vibromotor

// ----------------------- GYRO CONTROLLER INIT ----------------------- 

#include "I2Cdev.h"
#include "MPU6050_6Axis_MotionApps20.h"

#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
    #include "Wire.h"
#endif

MPU6050 mpu;

// MPU control/status vars
bool dmpReady = false;  // set true if DMP init was successful
// uint8_t mpuIntStatus;   // holds actual interrupt status byte from MPU
uint8_t devStatus;      // return status after each device operation (0 = success, !0 = error)
uint16_t packetSize;    // expected DMP packet size (default is 42 bytes)
uint16_t fifoCount;     // count of all bytes currently in FIFO
uint8_t fifoBuffer[64]; // FIFO storage buffer

// orientation/motion vars
Quaternion q;           // [w, x, y, z]         quaternion container
VectorInt16 aa;         // [x, y, z]            accel sensor measurements
VectorInt16 aaReal;     // [x, y, z]            gravity-free accel sensor measurements
VectorInt16 aaWorld;    // [x, y, z]            world-frame accel sensor measurements
VectorFloat gravity;    // [x, y, z]            gravity vector
float euler[3];         // [psi, theta, phi]    Euler angle container
float ypr[3];           // [yaw, pitch, roll]   yaw/pitch/roll container and gravity vector

// ----------------------- L1S3DH INIT ----------------------- 

// Used for software SPI
#define LIS3DH_CLK 13
#define LIS3DH_MISO 12
#define LIS3DH_MOSI 11
// Used for hardware & software SPI
#define LIS3DH_CS 10

#define REDPIN A2
#define GREENPIN A1
#define BLUEPIN A0

// Hammer input
#define HAMMER_IN 5

// software SPI
//Adafruit_LIS3DH lis = Adafruit_LIS3DH(LIS3DH_CS, LIS3DH_MOSI, LIS3DH_MISO, LIS3DH_CLK);
// hardware SPI
//Adafruit_LIS3DH lis = Adafruit_LIS3DH(LIS3DH_CS);
// I2C
Adafruit_LIS3DH lis = Adafruit_LIS3DH();
// for scrubber:
float filter_shake = 0.0;
float filter_coeff = 0.3;

// HAMMER: 
// ARDUINO  EXAMPLE button debounce (https://docs.arduino.cc/built-in-examples/digital/Debounce/):
uint8_t buttonState;
uint8_t lastButtonState = HIGH;

unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 40;

void setup(void) {
  delay(500);

  // JOYSTICK BUTTON
  pinMode(JOYSTICKBTN_PIN, INPUT_PULLUP);

  // LEDS
  // Set the RGB LED pins as outputs
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  pinMode(VIBROPIN, OUTPUT);

  analogWrite(redPin, 0);
  analogWrite(greenPin, 0);
  analogWrite(bluePin, 0);


  // join I2C bus (I2Cdev library doesn't do this automatically)
  #if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
      Wire.begin();
      Wire.setClock(400000); // 400kHz I2C clock. Comment this line if having compilation difficulties
  #elif I2CDEV_IMPLEMENTATION == I2CDEV_BUILTIN_FASTWIRE
      Fastwire::setup(400, true);
  #endif

  Serial.begin(115200);
  while (!Serial) delay(500);     // will pause Zero, Leonardo, etc until serial console opens

  // initialize mpu
  Serial.println(F("Initializing I2C devices..."));
  mpu.initialize();

    // verify connection
  Serial.println(F("Testing device connections..."));
  Serial.println(mpu.testConnection() ? F("MPU6050 connection successful") : F("MPU6050 connection failed"));

  // load and configure the DMP
  Serial.println(F("Initializing DMP..."));
  devStatus = mpu.dmpInitialize();

  // supply your own gyro offsets here, scaled for min sensitivity
  mpu.setXGyroOffset(220);
  mpu.setYGyroOffset(76);
  mpu.setZGyroOffset(-85);
  mpu.setZAccelOffset(1788); // 1688 factory default for my test chip

  // make sure it worked (returns 0 if so)
  if (devStatus == 0) {
      // Calibration Time: generate offsets and calibrate our MPU6050
      mpu.CalibrateAccel(6);
      mpu.CalibrateGyro(6);
      mpu.PrintActiveOffsets();
      // turn on the DMP, now that it's ready
      Serial.println(F("Enabling DMP..."));
      mpu.setDMPEnabled(true);

      // set our DMP Ready flag so the main loop() function knows it's okay to use it
      Serial.println(F("DMP ready! Waiting for first interrupt..."));
      dmpReady = true;

      // get expected DMP packet size for later comparison
      packetSize = mpu.dmpGetFIFOPacketSize();
  } else {
      // ERROR!
      // 1 = initial memory load failed
      // 2 = DMP configuration updates failed
      // (if it's going to break, usually the code will be 1)
      Serial.print(F("DMP Initialization failed (code "));
      Serial.print(devStatus);
      Serial.println(F(")"));
  }

  // verify connection
  Serial.println(F("Testing device connections..."));
  Serial.println(mpu.testConnection() ? F("MPU6050 connection successful") : F("MPU6050 connection failed"));

  Serial.println("LIS3DH test!");

  if (! lis.begin(0x18)) {   // change this to 0x19 for alternative i2c address
    Serial.println("Couldnt start");
    // while (1) yield();
  }
  Serial.println("LIS3DH found!");

  // lis.setRange(LIS3DH_RANGE_4_G);   // 2, 4, 8 or 16 G!

  Serial.print("Range = "); Serial.print(2 << lis.getRange());
  Serial.println("G");

  // lis.setDataRate(LIS3DH_DATARATE_50_HZ);
  Serial.print("Data rate set to: ");
  switch (lis.getDataRate()) {
    case LIS3DH_DATARATE_1_HZ: Serial.println("1 Hz"); break;
    case LIS3DH_DATARATE_10_HZ: Serial.println("10 Hz"); break;
    case LIS3DH_DATARATE_25_HZ: Serial.println("25 Hz"); break;
    case LIS3DH_DATARATE_50_HZ: Serial.println("50 Hz"); break;
    case LIS3DH_DATARATE_100_HZ: Serial.println("100 Hz"); break;
    case LIS3DH_DATARATE_200_HZ: Serial.println("200 Hz"); break;
    case LIS3DH_DATARATE_400_HZ: Serial.println("400 Hz"); break;

    case LIS3DH_DATARATE_POWERDOWN: Serial.println("Powered Down"); break;
    case LIS3DH_DATARATE_LOWPOWER_5KHZ: Serial.println("5 Khz Low Power"); break;
    case LIS3DH_DATARATE_LOWPOWER_1K6HZ: Serial.println("16 Khz Low Power"); break;
  }

  pinMode(REDPIN, OUTPUT);
  pinMode(GREENPIN, OUTPUT);
  pinMode(BLUEPIN, OUTPUT);

  analogWrite(REDPIN, 0);
  analogWrite(GREENPIN, 0);
  analogWrite(BLUEPIN, 0);

  // HAMMER
  pinMode(HAMMER_IN, INPUT_PULLUP);
}

void loop() {
  // read salmon health
  health();

  // write all 3 controller data, delimited by "|"
  salmon();

  // JOYSTICK 
  Serial.print(",");
  float yval = analogRead(JOYSTICKY_PIN) / (float) 4095;
  float xval = analogRead(JOYSTICKX_PIN) / (float) 4095;
  Serial.print(yval);
  Serial.print(",");
  Serial.print(xval);
  Serial.print(",");
  int joystickPressVal = digitalRead(JOYSTICKBTN_PIN);
  joystickPressVal = !joystickPressVal;
  Serial.print(joystickPressVal);

  Serial.print("|");

  scrub();
  Serial.print("|");
  hammer();

  Serial.println();

  delay(10);
}

// write data for salmon controller. format:
// salmon:yaw,pitch,roll,accelerationX,accelerationY,accelerationZ
void salmon() {
  // if programming failed, don't try to do anything
  // if (!dmpReady) return;
  // read a packet from FIFO
  if (mpu.dmpGetCurrentFIFOPacket(fifoBuffer)) { // Get the Latest packet 
    // display Euler angles in degrees
    mpu.dmpGetQuaternion(&q, fifoBuffer);
    mpu.dmpGetEuler(euler, &q);
    Serial.print("salmon:");
    Serial.print(euler[0] * 180/M_PI);
    Serial.print(",");
    Serial.print(euler[1] * 180/M_PI);
    Serial.print(",");
    Serial.print(euler[2] * 180/M_PI);
    Serial.print(",");

    // display real acceleration, adjusted to remove gravity
    mpu.dmpGetAccel(&aa, fifoBuffer);
    mpu.dmpGetGravity(&gravity, &q);
    mpu.dmpGetLinearAccel(&aaReal, &aa, &gravity);
    // Serial.print("areal\t");
    Serial.print(aaReal.x);
    Serial.print(",");
    Serial.print(aaReal.y);
    Serial.print(",");
    Serial.print(aaReal.z);
  }
}

// write data for scrub controller. format:
// scrub: TODO
void scrub() {
    sensors_event_t event;
    lis.getEvent(&event);

    float x = event.acceleration.x;
    float y = event.acceleration.y;
    float z = event.acceleration.z;
    float shake = sqrt(x*x + y*y +  z*z);
    shake -= 9.8;
    shake *= shake;
    shake /= 50; // experimentally determined higher end of shake vector magnitude
    filter_shake = shake * (filter_coeff) + filter_shake * (1- filter_coeff); // low pass filter
    filter_shake = constrain(filter_shake, 0.0, 1.0);
    if (filter_shake > 0.1) {
      Serial.print("scrub:");
      Serial.print(filter_shake);
    }
}

// write data for hammer controller. format:
// hammer: TODO, just one button tho
void hammer() {
  Serial.print("hammer:");
  long t = millis();
  // bool btnPressed = false;  // read button state
  uint8_t read = digitalRead(HAMMER_IN);
  // record switch change
  if (read != lastButtonState) {
    lastDebounceTime = t;
  }
  // if the switch has remained stable long enough
  if (t - lastDebounceTime >= debounceDelay) {
    if (read != buttonState) {
      buttonState = read;
      if (buttonState == LOW) {
        // pressed down
        // btnPressed = true;
        Serial.print(1); 
      }
    }
  } else {
    Serial.print(0);
  }
  lastButtonState = read;
  // return btnPressed;
}

// Handles vibration and leds for salmon health
// reads from serial in.
void health() {
  unsigned long currentMillis = millis(); // Get the current time

  // if the vibromotor is on for its whole duration, turn it off
  if (vibromotorOn && (currentMillis - previousMillis >= onTime)) {
    previousMillis = currentMillis;
    vibromotorOn = false;
    digitalWrite(VIBROPIN, LOW);
  }

  if (Serial.available() > 0) {
    String rcvdSerialData = Serial.readStringUntil('\n'); 

    int indexOfComma = rcvdSerialData.indexOf(',');
    if(indexOfComma != -1){
      String strFishAlive = rcvdSerialData.substring(0, indexOfComma);
      int fish = strFishAlive.toInt();

      String strBump = rcvdSerialData.substring(indexOfComma + 1, rcvdSerialData.length());
      int bump = strBump.toInt();

      if (bump == 1) {
        previousMillis = currentMillis;
        vibromotorOn = true;
        digitalWrite(VIBROPIN, HIGH);
      }

      switch(fish) {
        case 7:
          analogWrite(redPin, 0);
          analogWrite(greenPin, 255);
          break;
        case 6: 
          analogWrite(redPin, 255);
          analogWrite(greenPin, 255);
          break;
        case 5:
          analogWrite(redPin, 255);
          analogWrite(greenPin, 120);
          break;
        case 4: 
          analogWrite(redPin, 255);
          analogWrite(greenPin, 80);
          break;
        case 3:
          analogWrite(redPin, 255);
          analogWrite(greenPin, 35);
          break;
        case 2: 
          analogWrite(redPin, 255);
          analogWrite(greenPin, 15);
          break;
        case 1:
          analogWrite(redPin, 255);
          analogWrite(greenPin, 5);
          break;
        case 0: 
          analogWrite(redPin, 255);
          analogWrite(greenPin, 0);
          break;
        default:
          analogWrite(redPin, 0);
          analogWrite(greenPin, 0);
          analogWrite(bluePin, 0);
      }
    }
  }
}