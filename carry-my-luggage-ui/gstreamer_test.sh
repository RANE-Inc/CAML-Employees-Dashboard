#!/usr/bin/env bash

# gst-launch-1.0 videotestsrc ! webrtcsink signaller::uri="ws://127.0.0.1:8443" meta="meta,name=YOW1"
gst-launch-1.0 videotestsrc ! webrtcsink run-signalling-server="true" meta="meta,name=YOW1"
