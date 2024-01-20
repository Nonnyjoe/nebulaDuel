#!/bin/bash

# Run all the scripts in the scripts folder.

scripts_folder="scripts"

if [ ! -d "$scripts_folder" ]; then
  echo "Error: '$scripts_folder' directory not found."
  exit 1
fi

cd "$scripts_folder" || exit 1

# Find all files in the scripts folder with a number prefix and ending in ".exp"
files=($(find . -maxdepth 1 -type f -name "[0-9]*.exp" | sort))

# Check if any matching scripts are found
if [ ${#files[@]} -eq 0 ]; then
  echo "No matching scripts found in '$scripts_folder folder'."
  exit 1
fi

# Execute the scripts
for script in "${files[@]}"; do
  echo "Executing $script..."
  chmod +x "$script"
  expect "$script"
done

echo "All expect scripts executed successfully."
