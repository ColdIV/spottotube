const errorContainer = document.querySelector('#errors');
const getPlaylistDataButton = document.querySelector('#getPlaylistData');
getPlaylistDataButton.addEventListener('click', () => {
    getPlaylist()
});
const getListButton = document.querySelector('#getListButton');
getListButton.addEventListener('click', () => {
    getYouTubeLinks();
});
let CANCEL_YOUTUBE_API_CALLS = false;

async function getSpotifyAccessToken(data) {
    const client_id = data.client_id;
    const client_secret = data.client_secret;
    const access_token = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + client_id + '&client_secret=' + client_secret,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => response.json()).then(data => data.access_token).catch(error => console.error(error));

    document.querySelector('#token').value = access_token;
}

async function getPlaylist() {
    const playlistData = document.querySelector('#playlistData');
    const tracks = await getPlaylistTracks();
    playlistData.value = tracks;
}

async function getPlaylistTracks(offset = 0, limit = 100) {
    const playlistId = document.querySelector('#playlistId').value;
    const token = document.querySelector('#token').value;

    if (!playlistId) {
        errorContainer.innerHTML = 'Playlist ID not found.';
        return
    }
    return new Promise((resolve, reject) => {
        const tracks = [];
        function getTracks(offset) {
            fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(response => response.json())
                .then(data => {
                    tracks.push(...data.items);
                    if (data.next) {
                        getTracks(offset + limit);
                    } else {
                        const json = { tracks };
                        resolve(JSON.stringify(json));
                    }
                })
                .catch(error => reject(error));
        }
        getTracks(offset);
    });
}


async function searchSong(artist, song, API_KEY) {
    const apiKey = API_KEY;

    return new Promise((resolve, reject) => {
        const request = gapi.client.youtube.search.list({
            q: artist + " " + song,
            part: 'snippet',
            key: apiKey
        });

        request.execute(function (response) {
            if (response.code === 403) {
                CANCEL_YOUTUBE_API_CALLS = true;
                reject(new Error("YouTube API error"));
            } else {
                const videoId = response.items[0].id.videoId;
                resolve(videoId);
            }
        });
    });
}

function searchSongs(API_KEY) {
    const playlistData = document.querySelector('#playlistData').value;
    const tracks = JSON.parse(playlistData)["tracks"];
    let tracks_clean = [];

    // Helper function to search for a song and add a delay
    async function searchAndDelay(artist, song, API_KEY) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                const videoId = await searchSong(artist, song, API_KEY);
                tracks_clean.push({
                    artist,
                    track: song,
                    videoId
                });
                console.log("Found: ", artist, song, videoId)
                resolve();
            }, 600); // Delay each iteration by 600ms
        });
    }

    gapi.load('client', function () {
        gapi.client.load('youtube', 'v3', async function () {
            for (let i = 0; i < tracks.length && !CANCEL_YOUTUBE_API_CALLS; ++i) {
                const artist = tracks[i]["track"]['artists'][0]['name'];
                const track = tracks[i]["track"]['name'];
                await searchAndDelay(artist, track, API_KEY);
            }
            if (CANCEL_YOUTUBE_API_CALLS) {
                document.querySelector('#youtubeData').value = "YouTube API limit reached. Please try again later. (Max 100 requests per day.)";
                console.error("YouTube API limit reached.")
                console.log(tracks_clean);
                return;
            }
            document.querySelector('#youtubeData').value = JSON.stringify(tracks_clean);
        });
    });
}

function getYouTubeLinks() {
    const youtubeJSON = document.querySelector('#youtubeData').value;
    const youtubeLinksContainer = document.querySelector('#youtubeLinks');
    if (youtubeJSON) {
        youtubeLinksContainer.value = JSON.parse(youtubeJSON).map((item) => "https://www.youtube.com/watch?v=" + item.videoId).join('\n');
    }
}


async function main() {
    let data = await fetch('secrets.json').then(response => response.json()).then(data => data).catch(error => null);
    if (!data) {
        console.error('secrets.json not found. Trying input fields.');
        document.querySelector('#submitButton').addEventListener('click', () => {
            data = {};
            data.client_id = document.querySelector('#clientId').value;
            data.client_secret = document.querySelector('#clientSecret').value;
            if (!data.client_id || !data.client_secret) {
                errorContainer.innerHTML = 'CLIENT_ID and CLIENT_SECRET are required.';
            } else {
                getSpotifyAccessToken(data)
            }
        });
    } else {
        getSpotifyAccessToken(data);

        let YOUTUBE_API_KEY = data.youtube_api_key;
        document.querySelector('#youtubeApiKey').value = YOUTUBE_API_KEY;
        document.querySelector('#getSongsButton').addEventListener('click', () => {
            if (!YOUTUBE_API_KEY) {
                YOUTUBE_API_KEY = document.querySelector('#youtubeApiKey').value;
                if (!YOUTUBE_API_KEY) {
                    errorContainer.innerHTML = 'YOUTUBE_API_KEY is required.';
                } else {
                    searchSongs(YOUTUBE_API_KEY);
                }
            } else {
                searchSongs(YOUTUBE_API_KEY);
            }
        });
    }

}

main()