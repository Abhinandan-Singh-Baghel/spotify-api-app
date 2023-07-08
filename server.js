
const express = require('express');
const ejs = require("ejs");
const bodyParser = require("body-parser");
const axios = require('axios');
const querystring = require('querystring');
const app = express();


const path = require('path');




// Set 'views' directory and view engine


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
  }));

// Serve static files from the 'public' directory
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));






// Step 1: Retrieve music recommendations


app.get('/recommendations', async (req, res) => {
  
  const { genre, mood } = req.query;
  const accessToken = 'BQAeFRKyKBxIoOWoIVIIcj7wPAvouN8gjSZmIWcUkh_xlSxN5jU9KEfjqdPfnqcU1hwaxmIpDY2NqojYmcK88ov02ZvGeqBwdfeI30N8QDVEVWYEp30'; // Get the access token from the authentication step or handle token refreshing
  try {
    const response = await axios.get('https://api.spotify.com/v1/artists/1uNFoZAHBGtllmzznpCI3s', {
    
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    const recommendationstion = response.data;
   // const imageofjb = recommendations[0].url;
   // res.send("<img src = ${imageofjb}>");

   res.render("recommendations", {
    recommendations: recommendationstion
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
