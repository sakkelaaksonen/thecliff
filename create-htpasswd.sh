#!/bin/bash
# create-htpasswd.sh
# Run this to create the htpasswd file

echo "Creating htpasswd file for menu admin..."
echo "Enter username for menu admin:"
read username

# Create htpasswd file
htpasswd -c htdocs/admin/.htpasswd $username

echo "htpasswd file created at htdocs/admin/.htpasswd"
echo "Make sure to update the AuthUserFile path in .htaccess to the full server path" 