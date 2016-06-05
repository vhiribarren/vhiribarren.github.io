---
layout: post
title: Cheap Robot Kinect
tags:
  - project
---

Ever dreamed to pilot your own robot? Without using a keyboard and without tons of sensors on your skin? Just by moving? Actually, lots of people are working on this kind of thing and have some working prototypes. Well… expensive prototypes.

However, do you know it is possible for you to build your own prototype?

<iframe width="320" height="240" style="display:block;margin-left:auto;margin-right:auto" src="https://www.youtube.com/embed/78RmoMFRhwA" frameborder="0" allowfullscreen></iframe>

The main characteristics of the following project are:

- It uses cheap components;
- It was developped quickly: 2 days only (actually, it could have been done in 1 day, but well… bugs are bugs);
- It was done by 2 persons, my co-worker Fabrice Poussière and I.

## Context of the project

Originally, the purpose of this project was twofold: to do a feasibility study of the concept, and to have a working prototype as a benchmark base and study tool.

The following components were used:

- An Arduino electronic prototyping platform
- An Arduino Ethernet Shield
- A Kinect with the USB adapter
- The RoboSapien toy from WowWee
- The OpenFramework C++ toolkit (including POCO)
- A Kinect SDK to get data from the Kinect; OpenNI is fine, but you should use the official Microsoft SDK

As the project was developed as part of my job, I will not provide the code source. But really, if you are a developer, no big deal.

## Electronic part

![Arduino with Ethernet Shield]({{site.url}}/assets/posts/cheap-robot-kinect/robotkinect_arduino.jpg){: .center-image}

We chose to start with the RoboSapien mainly because it is cheap, and we also found an Official RoboSapien hack guide that reassured us about the hacking possibilities of the toy.

The electronic part was largely inspired by the following links:

- [RoboSapienServer](http://arduino.cc/playground/Main/RoboSapienServer) (Arduino Playground)
- [RoboSapien IR codes](http://www.markcra.com/robot/ir_codes.php)

Arduino is an electronic prototyping platform. It eases the use of electronic components by shifting the electronic logic in a microcontroler that can be programmed using the C language (C++ actually, but it is recommended to use its “C subset” of the language). It is a perfect tool when a developer wants to connect to sensors but knows very little of electronic. Of course, basic notion of electronics are still needed, but still, the huge community behind Arduino already provides tips and schematics for lots of cases. A perfect example is the hyperlinks above, where we can find schematics to use Arduino with the RoboSapien.

The idea is to send data in place of the remote control provided with the RoboSapien. Several possibilities exist: either we send data to the robot by infrared, or we directly send data to the RoboSapien wire which receives data from the infrared receiver. The later was chosen, for three reasons: we are sure to have less reception problems, it is easier to debug, and we wanted to emphasize the idea of transmitting data through the network to the robot.

It also explains why we used an Ethernet Shield. Shields are additional electronic board that are compatible with Arduino. With the Ethernet shield, the Arduino can receives data from the network, using a common RJ-45 wire.

![Opening the RoboSapien]({{site.url}}/assets/posts/cheap-robot-kinect/robotkinect_opened.jpg){: .center-image }

Piloting the robot through the infrared remote channel helps to work quickly on the concept. However, the limitation of this approach is we do not have a native way to precisely control the RoboSapien. No feedback about where the robot’s arms are. No servomechanism. No way to send a command like “lift your arm with a 23° angle”. In a way, it eases the programming part. As mimicking a user completely is useless, we can work with value thresholds to trigger rough movements of the robot’s body. Doing otherwise would require a direct access to the robot’s engines, and the addition of sensors.

## Programming part

The requirements for the programming part were:

- capture the user’s skeleton
- transform the skeleton data in commands for the RoboSapien
- send data to the Arduino of the RoboSapien through the network
- convert data in commands that are understood by the RoboSapien
- nice graphical interface for debugging (really optional… of course, a text terminal is quite enough!)

![Graphical Interface of Robot Kinect]({{site.url}}/assets/posts/cheap-robot-kinect/robotkinect_interface.jpg){: .center-image }

The Arduino code is in C,  the one running in my computer in C++. A simple socket protocol allows the interaction between the Arduino and the computer.

When I write code, I usually avoid to use operating system dependent API. First of all because I feel uncomfortable being stuck to one system. Secondly because as I spend my time switching from a programming language to another, from a given framework to another, and so on, so it is easier to use the same framework or libraries everywhere. [OpenFrameworks](http://www.openframeworks.cc/) provides the means to easily integrate videos as animations, draws dynamic graphics, uses graphical assets (built on top of OpenGL), and signaling / threading / networking capabilities through [POCO](http://pocoproject.org/). All what I needed. And I wanted to test OpenFrameworks. Perfect!

With Microsoft Kinect SDK or OpenNI, extracting the skeleton of a user is very easy. Coordinates of our body joints are simply returned. So displaying a skeleton is just a matter of tracing lines betweens points. Because of the limitations of the RoboSapien, we do not have to compute angles of the skeleton as they would be useless. And because of the limitations of the Kinect, working with coordinate transformations to capture a user along all its movements is not useful, as when a user is seen by its profile, one of his arm and leg is hidden from the camera. So we can just assume the user is always seen parallel to the Kinect, and we compute where some skeleton joints are relative to some others, in order to trigger the movements of the robot.

The graphical interface provides feedbacks for the user. When a user is detected by the Kinect, an heartbeat is displayed. When the user queries to control his robot avatar (with a specific gesture), an animation displays a fusion between a tiny robot and a tiny human. A rough skeleton is displayed, showing the user movements, and some debug lines are written.

## A few last notes

Since the realization of this project (beginning of the year 2011) and because of all the hype about developing with the Kinect, it seems others tried to link a RoboSapien with a Kinect, in different other ways. So you should find similar projects on the Internet.

The robot mockup was presented in Bell Labs Open Days 2011 in France.

![Goodbye]({{site.url}}/assets/posts/cheap-robot-kinect/robotkinect_scene.jpg){: .center-image }

Photos are from Victor Dedonnet, and graphics from the graphical interface by Marjorie Mornet, thank you!

Some links about the physical avatar:

- [Bell Labs Open Days 2011](https://www.youtube.com/watch?v=BNI_Zgps9kQ) – YouTube (some images at 2’29)
- [Le Jounal Du Net](http://www.journaldunet.com/solutions/systemes-reseaux/alcatel-lucent-bell-labs-open-days/alcatel-lucent-bell-labs-open-days-presentation-immersive.shtml), 2011/06/09
