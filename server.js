
const express = require('express');
const ejs = require("ejs");
const bodyParser = require("body-parser");
const axios = require('axios');
const querystring = require('querystring');
const app = express();
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();



const path = require('path');
const { access } = require('fs');




// Set 'views' directory and view engine
// hi its me.

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
  }));

// Serve static files from the 'public' directory
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));










const clientId = process.env.CLIENT_ID;

const clientSecret = process.env.CLIENT_SECRET;


const redirectUri = 'http://localhost:3000/callback'; // Set the redirect URI


// note this is very important this redirectUri should be exactly same as the redirect URI in the spotify developer dashboard of yours otherwise this just won't work . 

const spotifyApi = new SpotifyWebApi({
  clientId,
  clientSecret,
  redirectUri,
});

var access_tokenamazing ;
var access_tokenrefresh ;








// Step 1: Obtain authorization from the user



app.get('/login', (req, res) => {
  const scopes = ['user-read-private', 'user-read-email' ,  'user-library-read' , 'user-library-modify']; // Set the required scopes
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

// Step 2: Handle the callback after authorization



app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    // Use the access_token to make further requests to the Spotify API
    // Store the refresh_token securely for future token refreshes
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    
    
    access_tokenamazing = access_token;
    access_tokenrefresh = refresh_token;


    console.log(access_tokenamazing);
    res.json({ access_token, refresh_token });
  } catch (error) {
    console.error('Error authenticating with Spotify:', error);
    res.status(500).json({ error: 'Unable to authenticate with Spotify' });
  }
});




// Step 3: Retrieve music recommendations


app.get('/alltheplaylist', async (req, res) => {
  
 // const { genre, mood } = req.query;
  const accessToken = access_tokenamazing ; // Get the access token from the authentication step or handle token refreshing
  console.log(accessToken);
  try {
    const response = await axios.get('https://api.spotify.com/v1/playlists/0CYz3zJcoPaqQBuvx3iUB2', {
    
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    const recommendationstion = response.data;
   // const imageofjb = recommendations[0].url;
   // res.send("<img src = ${imageofjb}>");

   res.render("playlist", {
    playlist: recommendationstion,
    playlistTracks : recommendationstion.tracks.items
  });
    
    // res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Unable to fetch recommendations' });
  }
});








const port = 3000; // Set your desired port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
