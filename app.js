const axios = require('axios')
const express = require('express'),
  cors = require("cors"),
  logger = require("morgan"),
  cookieParser = require("cookie-parser"),
bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 80;
async function yt(url,type) {
  return new Promise((resolve, reject) => {
    const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:|watch\?.*(?:|\&)v=|embed\/|v\/|shorts\/)|youtu\.be\/)([-_0-9A-Za-z]{11}|[-_0-9A-Za-z]{10})/;
    if (ytIdRegex.test(url)) {
    const iconfig = {
        q: ytIdRegex.exec(url), 
        vt: "home",
    }
    axios.request("https://yt1s.com/api/ajaxSearch/index",{
        method: "post",
        data: new URLSearchParams(Object.entries(iconfig)),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
        }}).then(async(gdata) => {
        const cconfig = {
            vid: gdata.data.vid,
            k: type === "mp3" ? gdata.data.links.mp3["mp3128"]["k"] : gdata.data.links.mp4["135"]["k"],
        }
        const { data } = await axios.request("https://yt1s.com/api/ajaxConvert/convert",{
            method: "post",
            data: new URLSearchParams(Object.entries(cconfig)),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
                "Cookie": "__atuvc=2|26; __atssc=google;2",
            }})
        const result = {
            title: data.title,
            chanel: gdata.data.a,
            ftype: type === "mp3" ? "mp3" : "mp4",
            fquality: type === "mp3" ? gdata.data.links.mp3.mp3128.q : gdata.data.links.mp4["135"].q,
            size: type === "mp3" ? gdata.data.links.mp3["mp3128"].size : gdata.data.links.mp4["135"].size,
            url: data.dlink,
        };
        resolve(result)
    })
    } else resolve("Invalid url")
})
}
app.set("json spaces", 2);
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.post("/result", async (req, res) => {
    const ress = await yt(req.body.url,'mp4')
    res.redirect(ress.url)
})
app.use("/", (req,res) => {
    res.render(__dirname + "/public/index.ejs")
})

app.listen(PORT, () => { console.log('App listening run to server http://localhost:' + PORT)})
