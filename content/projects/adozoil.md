---
summary: "An IoT system for transport fleets that watches for driver drowsiness and flags unusual fuel consumption."
role: "University team project. I worked on the fleet monitoring interface alongside teammates who built the embedded firmware."
---

## What it does

Transport fleets lose money and safety to two problems: drivers falling asleep at the wheel, and fuel disappearing without a matching delivery. Adozoil addresses both from the vehicle.

- **Drowsiness detection** uses an onboard camera to watch the driver's eyes. Closed eyes trigger an alarm on the device and a notification to the employer.
- **Fuel monitoring** uses a level sensor on the tank. Unusual consumption patterns are flagged as potential theft, and the alert carries the vehicle's location and speed so a dispatcher can act on it.

The web dashboard gives an employer the live picture: which trucks are moving, which driver is impaired, and how much fuel each vehicle should have versus how much it burned.

## How it works

The system spans three layers.

**Embedded firmware** runs on ESP32 boards. One unit acts as a GPS tracker and drowsiness node: it reads GPS coordinates, velocity, and satellite count, drives a camera for eye-state detection, and reports over WiFi. A second unit uses a JSN-SR04 ultrasonic sensor to measure fuel level in the tank, and derives the consumption rate and estimated fuel volume from the tank geometry.

**Cloud services** carry the data. Blynk provides the IoT device connection and the alerting channel. Thingspeak receives the fuel readings over its HTTP API for time-series storage.

**The dashboard** is a React and TypeScript front end that reads from those services and presents the fleet. It includes truck lists and search, live map and location views, driver status and status cards, a fuel consumption chart, and a notification panel, built with Material UI, Recharts, React Query, and the Google Maps API.

## Tech stack

| Layer | Tools |
| --- | --- |
| Embedded | ESP32, Arduino, TinyGPS++, Blynk, Thingspeak, JSN-SR04 ultrasonic sensor, camera module |
| Front end | React, TypeScript, Material UI, Recharts, TanStack Query, React Router, Google Maps API |
