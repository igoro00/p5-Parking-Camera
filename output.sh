#!/bin/bash

gst-launch-1.0 \
	udpsrc port=5000 \
caps="application/x-rtp,clock-rate=90000,encoding-name=RAW,sampling=(string)BGRA,width=(string)1024,height=(string)768" \
	! queue \
	! rtpvrawdepay \
	! videoconvert \
	! video/x-raw,format=BGRA,framerate=30/1 \
	! queue leaky=downstream \
	! comp.sink_1 \
	\
	v4l2src device=/dev/video2 \
	! videoconvert \
	! video/x-raw,format=RGBA,framerate=30/1 \
	! comp.sink_0 \
	\
	compositor name=comp \
	sink_0::xpos=0 sink_0::ypos=0 sink_0::zorder=1 \
	sink_1::xpos=0 sink_1::ypos=0 sink_1::zorder=2 \
	! autovideoconvert \
	! autovideosink