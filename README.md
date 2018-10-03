Glitch Twitter Likes Backup 
===================================

Based on https://glitch.com/edit/#!/twitterbot

A simple bot to backup (SQLite) and search the Tweets I liked.

- Search: [https://jets.js.org](https://jets.js.org)
- CRON: [https://cron-job.org](https://cron-job.org)

## Setup

- Remix this Glitch
- Setup a Twitter app
- Edit the .env file:

```

# Check out botwiki.org/tutorials/how-to-create-a-twitter-app to see how to obtain the keys/secrets below.
CONSUMER_KEY=
CONSUMER_SECRET=
ACCESS_TOKEN=
ACCESS_TOKEN_SECRET=

# Twitter screen name (no "@")
SCREEN_NAME=

# Database credentials
DB_USER=
DB_PASS=


# You can customize the endpoint that wakes up your Twitter bot. This way you can prevent someone else from triggering it.
# You can make it something simple like 'tweet', or something random, like 'tweet12345endpoint9876'.

# For the CRON job to grab your likes and save them
BOT_ENDPOINT=likes

# For the frontend to get your saved likes
API_ENDPOINT=api
```


## Notes

- the Twitter widgets script won't load if `Navigator.doNotTrack` is `true`
- fix. compatibility issues (transpile JS, ...)
- improve frontend perfs
- make a nicer frontend
