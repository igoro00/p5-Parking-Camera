#!/bin/bash
    # sink_1::xpos=0 sink_1::ypos=0 sink_1::zorder=1 \
    # videotestsrc ! c.sink_0 \

# gst-launch-1.0 compositor name=c \
# 	sink_0::zorder=0 \
# 	sink_1::zorder=1 \
#     ! video/x-raw,width=1152,height=864 ! xvimagesink \
#     pipewiresrc stream-properties="props,node.description=camera_in" ! queue leaky=downstream ! c.sink_0 \
#     pipewiresrc stream-properties="props,node.description=overlay_in,node.target=ElectronOverlay" ! queue leaky=downstream ! videoconvert ! c.sink_1

gst-launch-1.0 pipewiresrc stream-properties="props,node.description=overlay_in,node.target=ElectronOverlay" \
	! queue leaky=downstream \
	! autovideoconvert \
    ! autovideosink