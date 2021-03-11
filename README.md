# DISCLAIMER

This bot has not been tested on any other computer than my own. I would not suggest setting this up without backing up your valheim files first.

# Setup

First you need to create a .env file with the following variables.
DISCORDJS_BOT_TOKEN=
WEBHOOK_ID=
WEBHOOK_TOKEN=
MY_SAVES_FOLDER=
SAVE_TIME_IN_MS=
BAT_FILE=

Place this folder in Valheim dedicated server folder

Create users.json file in the following format

[{"name":"USERNAME", "client_id":"STEAM_ID", "is_online": false, "death_count": 0}]

# RUN

Once everything is setup, to run, run "npm install" and then "npm run start"

# EXAMPLE 

![](example.jpg)