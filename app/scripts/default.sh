#!/usr/bin/expect

# Function to create player profile
proc run_command { } {
    # Your commands
    # Prompt the user to input a number
    send_user "Enter an account index to use (1 - 5): "
    expect_user -re "(.*)\n"
    set user_input $expect_out(1,string)

    # Verify if the input is a valid number
    if {![string is integer -strict $user_input]} {
        send_user "Error: '$user_input' is not a valid integer.\n"
        exit 1
    }

    send "Running Command for user: $user_input \n"
    spawn sunodo send generic

    # Select the chain to use (1 = foundry)
    sleep 2
    send "1\r"

    # Select the RPC URL to use here we just hit enter to represent (RPC URL (http://127.0.0.1:8545))
    sleep 1
    send "\r"

    # Select the Mnemonic phrase to use here we just hit enter to represent the default
    sleep 1
    send "\r"

    # Select a wallet address to use here we just hit enter to represent the first wallet
    sleep 1
    send "$user_input\r"

    # Select the Address of the Dapp to interact with here we hit enter to interact with the default.
    sleep 2
    send "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C\r"

    # select the input type to use here we hit enter to use the string to hex method;
    sleep 1
    send "\r"


    interact
}


# call the create_profile function to initiate a new transaction
run_command

expect "*" 
