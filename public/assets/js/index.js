(function () {
  "use strict";
  
  const State = {
    API: {
      likes: "https://twitter-likes-backup.glitch.me/api/likes",
    },
    tweetsContent: {},
  };
  
  
  const stripTags = (str) => {
    return str.replace(/(<([^>]+)>)/ig,"");
  };
  
  
  
  // Get the liked tweets from the database
  // TODO: pagination!
  const getLikes = () => {
    
    return new Promise ((resolve, reject) => {
    
      var xhr = new XMLHttpRequest();
      xhr.open ('GET', State.API.likes);

      xhr.onload = function () {
        if (xhr.status == 200) resolve (JSON.parse (xhr.response));
        else reject(Error(xhr.statusText));
      };

      xhr.onerror = function() {
        reject (Error ("Network Error"));
      };

      xhr.send();
    });
  };
  
  
  
  // Setup Jets when all tweets are rendered by TwitterWidgets
  const onAllTweetsLoaded = () => {
    
    // setup flex display
    window.twttr.events.bind ('loaded', function (event) {

      // console.info ('twitterWidgets loaded');

      const container = document.querySelector ('[data-tweets]');
      container.classList.add ('tweets-rendered');

      // setup Jets
      let jets = new window.Jets ({
        searchTag: '[name="search"]',
        contentTag: '[data-tweets]',
        searchSelector: '*OR',
        diacriticsMap: {
          a: 'ÀÁÂÃÄÅàáâãäåĀāąĄ',
          c: 'ÇçćĆčČ',
          d: 'đĐďĎ',
          e: 'ÈÉÊËèéêëěĚĒēęĘ',
          i: 'ÌÍÎÏìíîïĪī',
          l: 'łŁ',
          n: 'ÑñňŇńŃ',
          o: 'ÒÓÔÕÕÖØòóôõöøŌō',
          r: 'řŘ',
          s: 'ŠšśŚ',
          t: 'ťŤ',
          u: 'ÙÚÛÜùúûüůŮŪū',
          y: 'ŸÿýÝ',
          z: 'ŽžżŻźŹ'
        }
      });
      
      // then update Jets
      // jets.update ();
    });
  };
  
  
  
  // Setup the rendered tweet search data
  const onRenderedTweets = () => {
    window.twttr.events.bind ('rendered', function (event) {
      
      let tweetElement = event.target;
      let tweetID = parseInt (tweetElement.getAttribute ('data-tweet-id'));

      // Reset tweet display prop for Jets to work correctly
      tweetElement.style.removeProperty ('display');

      // Setup the Jets attribute with the tweet's search data
      let content = State.tweetsContent[tweetID];
      event.target.setAttribute ('data-jets', content);
      // console.log ('indexed content', tweetID, content);
    });
  };
  
  
  
  // Store tweets search data
  const storeSearchData = (tweetID, content) => {
    // Clean the content a little
    // content = stripTags (content);
    content = content.replace (/\r?\n|\r/g, " ");
    content = content.replace(/^\s+|\s+$/g,'');
    content = content.replace(/ +(?= )/g,'');
    content = content.toLowerCase(); // Important for Jet!
    State.tweetsContent[tweetID] = content;
  };
  
  
  
  // Append tweets to the document
  // Store the tweets search data
  // Style the tweets with twitter widgets
  const displayLikes = (likes) => {
    
    // format and insert Tweets
    // console.info ('likes', likes);
    const container = document.querySelector ('[data-tweets]');
    
    for (let like of likes) {
      let userUrl = `<a href="https://twitter.com/${like.screen_name}">@${like.screen_name}</a>`;
      let tweetContent = `<p lang="en" dir="ltr">${like.text} [${userUrl}]</p>`;
      let oEmbedURL = `<a href="https://twitter.com/${like.screen_name}/status/${like.id_str}?ref_src=twsrc%5Etfw">embed</a>`;
  
      // Tweeter Embed
      let blockquote = document.createElement ('blockquote');
      blockquote.classList.add ('twitter-tweet');
      blockquote.setAttribute ('id', like.id);
      blockquote.setAttribute ('data-lang', 'fr');
      blockquote.innerHTML = tweetContent + oEmbedURL;
      
      // Concat the search data and store it
      let content = [like.screen_name, like.text, like.screen_name].join (' ');
      storeSearchData (like.id, content);

      // Append the tweet
      container.appendChild (blockquote);
    };
    
    // Load Twitter Widgets
    let po = document.createElement ('script'); 
    po.type = 'text/javascript'; 
    po.async = true;
    po.src = 'https://platform.twitter.com/widgets.js';
    po.id = 'twitterWidgets';
    let s = document.getElementsByTagName ('script')[0]; 
    s.parentNode.insertBefore(po, s);
    
    // When the script is loaded…
    document.querySelector ('#twitterWidgets').addEventListener ('load', function () {
      // setup Jets search data for each tweet rendered
      onRenderedTweets ();
      // then setup Jet when all tweets are rendered
      onAllTweetsLoaded ();
    });

  };
  
  
  
  
  const init = () => {
    getLikes().then (function (likes) {
      displayLikes (likes);
    }, 
    function (error) {
      console.error (error);
    });
  };


  init ();

})();




/*
// https://publish.twitter.com/oembed?url=https%3A%2F%2Ftwitter.com%2FInterior%2Fstatus%2F507185938620219395
// https://publish.twitter.com/oembed?url=https://twitter.com/Interior/status/507185938620219395    
// https://publish.twitter.com/oembed?url=https%3A%2F%2Ftwitter.com%2FReal_CSS_Tricks%2Fstatus%2F980852366151843800
const getEmbed = (screen_name, tweet_id) => {

  let embedURL = encodeURIComponent (`https://twitter.com/$@{screen_name}/status/${tweet_id}`);
  let embedQuery = `https://publish.twitter.com/oembed?url=${embedURL}`;

  return new Promise ((resolve, reject) => {

    var xhr = new XMLHttpRequest();
    xhr.open ('GET', embedQuery);

    xhr.onload = function () {
      if (xhr.status == 200) resolve (JSON.parse (xhr.response));
      else reject (Error(xhr.statusText));
    };

    xhr.onerror = function() {
      reject (Error ("Network Error"));
    };

    xhr.send();
  });

};
*/