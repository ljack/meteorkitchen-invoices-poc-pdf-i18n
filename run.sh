#!/bin/bash

export METEOR_WATCH_FORCE_POLLING=1
export METEOR_WATCH_POLLING_INTERVAL_MS=1000

cd laskuni
meteor -p $IP:$PORT --settings files/settings.json
cd ..
