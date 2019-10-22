const fs = require("fs");
const jimp = require('jimp');
const path = require("path");
const axios = require('axios');
const twit = require("twit")

const publicFolder = path.resolve(__dirname,"Files");

const thingys = {
    consumer_key:         'CONSUMER_KEY',
   consumer_secret:      'CONSUMER SECRET',
   access_token:         'ACCESS_TOKEN',
   access_token_secret:  'ACCESS_TOKEN_SECRET',
   timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
   strictSSL:            true,     // optional - requires SSL certificates to be valid.
 }
 
const T = new twit(thingys);
async function getNews() {
    const news = await axios({
        url: "https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game",
        method: "GET"
    })
    let brNews = news.data.battleroyalenews
    await writeNewsToFile(JSON.stringify(brNews))
    

}


async function postToTwitter(twitter) {
    let newsImage = await fs.readFileSync(publicFolder+"\\Test.png",{encoding:"base64"});
    twitter.post('media/upload', { media_data: newsImage }, function (err, data, response) {
  // now we can assign alt text to the media, for use by screen readers and
  // other text-based presentations and interpreters
  var mediaIdStr = data.media_id_string
  var altText = "News Image"
  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
 
  twitter.post('media/metadata/create', meta_params, function (err, data, response) {
    if (!err) {
      // now we can reference the media and post a tweet (media will attach to the tweet)
      var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();

var newdate = day + "/" + month + "/" + year
      var params = { status: 'Fortnite News '+newdate + '#FortniteSeason9 #Fortnite @FNBRBananik', media_ids: [mediaIdStr] }
 
      twitter.post('statuses/update', params, function (err, data, response) {
        console.log(data)
      })
    }
  })
})
}

async function genImage() {
    if(!fs.existsSync(publicFolder)) {
      fs.mkdirSync(publicFolder)
    }
    await downloadFile('https://cdn.glitch.com/b1680488-b2cb-4821-a1b8-1246046cf82d%2Ffont8.fnt?1557159680264',"font.fnt");
    await downloadFile('https://cdn.glitch.com/b1680488-b2cb-4821-a1b8-1246046cf82d%2Ffont8.png?1557159680515',"font.png");
    await downloadFile('https://cdn.glitch.com/b1680488-b2cb-4821-a1b8-1246046cf82d%2Ffont9.fnt?1557160155041',"font2.fnt");
    await downloadFile('https://cdn.glitch.com/b1680488-b2cb-4821-a1b8-1246046cf82d%2Ffont9.png?1557160155422',"font9.png");
    await downloadFile("https://cdn.glitch.com/b1680488-b2cb-4821-a1b8-1246046cf82d%2FImageBackground.png?1557082521195","ImageBackground.png")
    let data = JSON.parse(fs.readFileSync(publicFolder+"\\News.json"))
    let news = data.news.messages
    let left = news[0]
    let leftImage = left.image
    let mid = news[1]
    let midImage = mid.image
    let right = news[2]
    let rightImage = right.image
    await downloadFile(leftImage,"News1.png");
    await downloadFile(midImage,"News2.png");
    await downloadFile(rightImage,"News3.png");
  let leftFile = publicFolder+"\\News1.png"
  let midFile = publicFolder+"\\News2.png"
  let rightFile = publicFolder+"\\News3.png"
  let backFile = publicFolder+"\\ImageBackground.png"
  jimp.read(backFile,(err,image) => {
      if(err) throw err;
      jimp.read(leftFile,(err,leftImg) => {
        if(err) throw err;
          leftImg.resize(600,337.5);
        jimp.read(midFile,(err,midImg) => {
          if(err) throw err;
           midImg.resize(600,337.5); 
          jimp.read(rightFile,(err,rightImg) => {
            if(err) throw err;
             rightImg.resize(600,337.5);
            jimp.loadFont(publicFolder+"\\font.fnt").then(font=> {
                jimp.loadFont(publicFolder+"\\font2.fnt").then(async font2 => {
                     image
                  .composite(leftImg,14,314)
                  .composite(midImg,660,314)
                  .composite(rightImg,1308,314)
                  .print(font,14,652,{text: left.title,alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: jimp.VERTICAL_ALIGN_BOTTOM},600)
                  .print(font,660,652,{text: mid.title,alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: jimp.VERTICAL_ALIGN_BOTTOM},600)
                  .print(font,1308,652,{text: right.title,alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: jimp.VERTICAL_ALIGN_BOTTOM},600)
                  .print(font2,14,735,{text: left.body,alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: jimp.VERTICAL_ALIGN_BOTTOM},600)
                  .print(font2,660,735,{text: mid.body,alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: jimp.VERTICAL_ALIGN_BOTTOM},600)
                  .print(font2,1308,735,{text: right.body,alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: jimp.VERTICAL_ALIGN_BOTTOM},600)
                  .write(publicFolder+"\\Test.png")
                  fs.unlinkSync(leftFile);
                  fs.unlinkSync(midFile);
                  fs.unlinkSync(rightFile);
                  
                })
                
            })
                      
          })
        })
      })
    
  })
  postToTwitter(T);
  
}

async function downloadFile (url,name){  
    const filePath = path.resolve(__dirname,"Files", name)
    const writer = fs.createWriteStream(filePath)
  
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  
    response.data.pipe(writer)
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  }

async function writeNewsToFile(news) {
  
    try {
        if(fs.readFileSync(publicFolder+"\\News.json") != news) {
          fs.writeFile(publicFolder+"\\News.json",news,function(err) {
              if(err) throw err;
              console.log("The writing has been completed!");
              genImage();
          })
        }
    }
    catch(e) {
       throw e 
    }
  }
fs.writeFileSync(publicFolder+"\\News.json","LOL")
setInterval(getNews,1000)
