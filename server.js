
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
//hi its me from new-branch
//yo


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
var spotifyiduser ;








// Step 1: Obtain authorization from the user



app.get('/login', (req, res) => {
  const scopes = ['user-read-private', 'user-read-email' ,  'user-library-read' , 'user-library-modify', 'playlist-modify-public', 'playlist-modify-private']; // Set the required scopes
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
    //res.json({ access_token, refresh_token });
    res.redirect('/alltheplaylist');
  } catch (error) {
    console.error('Error authenticating with Spotify:', error);
    res.status(500).json({ error: 'Unable to authenticate with Spotify' });
  }
});







// use refresh token to generate new access token without having to re-authenticate every single time

// Use the refresh token to obtain a new access token



//Step 3: Take playlist Id from the user

app.get('/enterPlaylist', (req, res) => {


  res.render("enterpage");


});




// Step 4: Retrieve music recommendations


app.get('/alltheplaylist', async (req, res) => {
  
 // const { genre, mood } = req.query;
  const accessToken =  access_tokenamazing ; // Get the access token from the authentication step or handle token refreshing
  console.log(accessToken);
  try {
    const response = await axios.get('https://api.spotify.com/v1/playlists/'+spotifyiduser, {
    
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




//Route to recieve the spotify ID provided by user on the backend code

app.post('/enterthespotifyid', (req, res)=>{

spotifyiduser = req.body.playlistID;

res.redirect('/login');

});



















// Route to add tracks to a specific playlist 
app.post('/add-tracks/:playlist_id', async (req, res) => {
  try {
    const playlistId = req.params.playlist_id;
    const trackName = req.body.trackName;  
    const artistName = req.body.artistName;
    const albumName = req.body.albumName;

    // Perform the necessary operations to add the track to the playlist


    const searchResults = await spotifyApi.searchTracks(
      `track:${trackName} artist:${artistName} album:${albumName}`
    );


    console.log(searchResults);

    // Extract the track ID from the search results
    
    const trackID = searchResults.body.tracks.items[0]?.id; // Use optional chaining to handle cases where trackID is undefined or null

  

    if (!trackID) {
      throw new Error('No track ID found.'); // Throw an error if trackID is not available
    }






   
      spotifyApi.addTracksToPlaylist(
        playlistId ,    // this is the playlist that you are adding tracks to
        
       [ 'spotify:track:'+ trackID]

        ,
        {
          position: 1  // the position at which this track will be added in the playlist , don't mess up otherwise you will get out of bound error
        }
      ).then(function(data) {
        console.log('Added tracks to the playlist!');
      })
      .catch(function(err) {
        console.log('Something went wrong:', err.message);
      });

   








    // Use the Spotify API or any other appropriate methods here

    res.redirect('/alltheplaylist'); // Redirect to the page displaying Spotify data after adding the track
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding tracks to the playlist');
  }
});






// Route to replace tracks in a specific playlist
app.post('/replace-tracks/:playlist_id', async (req, res) => {
  try {
    const playlistId = req.params.playlist_id;
    const trackName1 = req.body.trackName1;
    const artistName1 = req.body.artistName1;
    const albumName1 = req.body.albumName1;
    const trackName2 = req.body.trackName2;
    const artistName2 = req.body.artistName2;
    const albumName2 = req.body.albumName2;

    // Perform the necessary operations to replace the tracks in the playlist
    // Use the Spotify API or any other appropriate methods here

   
    
    const searchResults1 = await spotifyApi.searchTracks(
      `track:${trackName1} artist:${artistName1} album:${albumName1}`
    );


    // Extract the track ID from the search results
    
    const trackID1 = searchResults1.body.tracks.items[0]?.id; // Use optional chaining to handle cases where trackID is undefined or null

  

    const searchResults2 = await spotifyApi.searchTracks(
      `track:${trackName2} artist:${artistName2} album:${albumName2}`
    );




    // Extract the track ID from the search results
    
    const trackID2 = searchResults2.body.tracks.items[0]?.id; // Use optional chaining to handle cases where trackID is undefined or null



    


spotifyApi.replaceTracksInPlaylist(playlistId, 
  
  ['spotify:track:' + trackID1 , 'spotify:track:' + trackID2 ]
  
  )
  .then(() => {
    console.log('Tracks replaced in the playlist successfully!');
  })
  .catch((error) => {
    console.log('An error occurred while replacing tracks:', error);
  });



   






    res.redirect('/alltheplaylist'); // Redirect to the page displaying Spotify data after replacing the tracks
  } catch (error) {
    console.error(error);
    res.status(500).send('Error replacing tracks in the playlist');
  }
});






const port = 3000; // Set your desired port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
