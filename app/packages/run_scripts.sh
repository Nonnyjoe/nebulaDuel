#!/bin/bash

# Get the user input argument
script_name=$1
scripts_folder="scripts"


# Check if the argument is provided
if [ -z "$script_name" ]; then

  # CD into scripts folder
  cd "$scripts_folder" || exit 1

  # Find all files in the scripts folder with a name prefix with default in ".exp"
  files=($(find . -maxdepth 1 -type f -name "default*.sh" | sort))

  # Check if any matching scripts are found
  if [ ${#files[@]} -eq 0 ]; then
    echo "Error: Script 'default.sh' not found in path: '$scripts_folder folder'."
    exit 1
  fi

  # Execute the scripts
  for script in "${files[@]}"; do
    echo "Executing $script..."
    chmod +x "$script"
    expect "$script"
  done

  # echo "Running Default script"
  # script_filename="../scripts/default.sh"
  # expect "$script_filename"
  # exit 0
fi

# Construct the script filename
# script_filename="../scripts/${script_name}.sh"

# # Check if the script file exists
# if [ ! -f "$script_filename" ]; then
#   echo "Error: Script '$script_name' not found in path: '$script_filename'."
#   exit 1
# fi

  # CD into scripts folder
  cd "$scripts_folder" || exit 1
  echo "searching for specified file ...."
  # Find all files in the scripts folder with a name prefix with default in ".exp"
  files=($(find . -maxdepth 1 -type f -name "$script_name.exp" | sort))

# Execute the script
# Execute the scripts
for script in "${files[@]}"; do
  echo "Executing $script..."
  chmod +x "$script"
  expect "$script"
done