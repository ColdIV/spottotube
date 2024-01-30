const errorContainer = document.querySelector('#errors');
const getPlaylistDataButton = document.querySelector('#getPlaylistData');
getPlaylistDataButton.addEventListener('click', () => {
    getPlaylist()
})

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


function searchSong(artist, song, API_KEY) {
    var apiKey = API_KEY;

    var request = gapi.client.youtube.search.list({
        q: artist + " " + song,
        part: 'snippet',
        key: apiKey
    });

    request.execute(function (response) {
        var videoId = response.items[0].id.videoId;
        console.log("Video ID: " + videoId);
    });
}

function searchSongs(API_KEY) {
    gapi.load('client', function () {
        gapi.client.load('youtube', 'v3', function () {
            // @TODO: Loop through all songs from spotify playlist and search for each
            // Output shold then be a list of all youtube links in a textfield
            // searchSong('artist', 'song', API_KEY)
        });
    });
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