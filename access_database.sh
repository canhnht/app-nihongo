#!/bin/bash

adb -d shell "run-as io.techybrain.minagoi cp /data/data/io.techybrain.minagoi/databases/minagoi.db /sdcard/data.db";
cd .. && adb pull /sdcard/data.db && sqlite3 data.db
