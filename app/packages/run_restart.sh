#!/bin/bash

# Your commands
echo "Closing existing docker connection...."
systemctl --user stop docker-desktop

echo "Starting a new docker instance....."
systemctl --user start docker-desktop