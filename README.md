# Spot to Tube

**Work in progress!**

A small project to import a Spotify playlist and output YouTube links for each song. Originally I wanted to create a YouTube playlist but I don't like the YouTube API stuff so that has been canceled.

There is a limit of 100 requests per day for the YouTube API. (Unless you pay for it.)

## What you need
### Spotify
- Spotify API Token **OR** CLIENT_ID and CLIENT_SECRET (to generate the Token)
- Playlist ID of the playlist you want to import
### YouTube
- YouTube API Key

## Setup
### Local
If you cloned this project, you can enter your credentials in the `secrets.json`. Just copy the example file, rename it and replace the placeholders.

The Website will then automatically fill in the data from the file, so that you don't have to enter them manually.

You will have to host a small webserver to open the index.html, otherwise most browsers will block some functionalities due to CORS, which will prevent you from accessing the `secrets.json`. 

If you have python installed, you can easily run a small webserver in this directory with: `python -m http.server`. The default port should be 8000, so you can reach the server here: http://localhost:8000.

### Online
You can also just use the version I host here on GitHub.

You will have to fill in your API credentials manually.

## Usage
After filling in all your API credentials, you will have to enter the ID of a Spotify playlist.

By clicking on _Get Playlist Data_ the textarea under the button will be filled in with the API response of Spotify.

If you want to get the YouTube Links for those songs, you can scroll down and click on _Get Songs_.

__Note__: The YouTube Search API is limitted to 100 requests per day, so if you don't pay for the API, that is all you get right now.

## Planned
- return json with only track name, artist and youtube url
- add option to run main.js via npm, without website
- maybe store playlist data locally (local storage?) to retry remaining songs if the youtube data limit has been reached
- other stuff i forgot