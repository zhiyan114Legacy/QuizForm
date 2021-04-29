// QuizForm Backend v2 by zhiyan114 \\

// Install Method: npm install fastify-https-redirect sqlite3 ws @sentry/node fastify

// Load all static dependency

const sqlite = require("sqlite3"); // Broken on the programming machine, enable on test and production machine.
const fs = require('fs');
const https = require('https');
const websocket = require('ws');
const path = require('path');
const sentry = require("@sentry/node");
const fastify = require('fastify')

// Configuration
var config = {
    cert: fs.readFileSync("./cert/Certificate.cer"),
    key: fs.readFileSync("./cert/Private.key")
}
const Answers = {"q1":"B","q2":"C","q3":"A","q4":"B","q5":"D"}

// Important dependency Init Config
sentry.init({
    dsn: "https://0ac7c3a39ea6439fb5d14ab39bdc908c@o125145.ingest.sentry.io/5741158",
    tracesSampleRate: 0.25,
});
sentry.setTag("environment","Development")

// Init the functions
const ws_secure_func = new https.createServer({
    cert: config["cert"],
    key: config["key"]
})
const rest_server = fastify({
    logger: false,
    http2: true,
    https: {
        allowHTTP1: true,
        cert: config["cert"],
        key: config["key"]
    }
 });
const ws_server = new websocket.Server({ server: ws_secure_func });
const db = new sqlite.Database(path.resolve("./Submissions.db"),(sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE),(err)=>{
    if(err) {
        sentry.captureException(err)
    }
})
// Init Configuration
rest_server.addContentTypeParser('text/json', { parseAs: 'string' }, rest_server.getDefaultJsonParser('ignore', 'ignore'))
rest_server.register(require("fastify-https-redirect"))
db.serialize(()=>{
    db.run(`CREATE TABLE if not exists \`response\` (\
\`id\` INT(100) NOT NULL AUTO_INCREMENT,\
\`name\` VARCHAR(100) CHARACTER SET utf8 COLLATE utf8_general_ci,
\`score\` TINYINT(4),\
PRIMARY KEY (\`id\`)\
);`)
})

// External Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// REST API HANDLER
rest_server.get("/",(req,res)=>{
    res.type('text/html')
    res.send(fs.readFileSync("./index.html").toString())
})
rest_server.get("/answer",(req,res)=>{
    // Getting the answers from the database
    db.serialize(()=>{
        db.all("SELECT * FROM response",(err, rows)=>{
            if(err) {
                sentry.captureException(err)
            }
            var Students = [];
            rows.forEach((row)=>{
                Students.push([toTitleCase(row.name),row.score])
            })
            res.type("application/json")
            res.send(Students.sort())
        })
    })
})
rest_server.post("/answer",(req,res)=>{
    // Submitting answers
    var Correct = 0;
    var InputName = "";
    var ShareAnswer = false;
    res.body.forEach((data)=>{
        if(data["name"] == "Name") {
            InputName = data["value"].toLowerCase()
        } else if(data["name"] == "shareAnswer") {
            ShareAnswer = data["value"]
        } else {
            if(Answers[data["name"]] == data["value"]) {
                Correct += 1;
            }
        }
    })
    db.serialize(()=>{
        db.get(`SELECT score FROM from response WHERE name=${InputName}`,(err,row)=>{
            if (err){
                sentry.captureException(err)
            }
            if(row) {
                // Tries to resubmit?
                console.log(InputName+" tries to resubmit an answer")
                res.type("application/json")
                res.send({Grade: row.score})
            } else {
                // New answer submission
                console.log(InputName+" has submitted an answer")
                const Score = Math.round((Correct/5)*100)
                db.run(`INSERT INTO response (Name,Score) VALUES (${InputName},${Score})`);
                res.type("application/json")
                res.send({Grade: Score})
                if(ShareAnswer) {
                    ws_server.clients.forEach((ws_client)=>{
                        ws_client.send(JSON.stringify({"title":"Submission","message":`${toTitleCase(InputName)} has submitted their quiz and got ${Score}%`}))
                    })
                } else {
                    ws_server.clients.forEach((ws_client)=>{
                        ws_client.send(JSON.stringify({"title":"Submission","message":`${toTitleCase(InputName)} has submitted their quiz and prefer to not share their score.`}))
                    })
                }
            }
        })
    })
})
rest_server.get("/trollimg",(req,res)=>{
    // Returns a rickroll image LOL.
    res.type("image/gif")
    res.send(fs.readFileSync("./Troll.gif"))
})
rest_server.delete("/answer",(req,res)=>{
    // Deleting answer
    if(req.headers.authorization == "92ie092hfeifhb821h09") {
        console.log((req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || "Unavailable")+" requested for data removal")
        if(req.query.user) {
            if(req.query.user.toLowerCase() == "all") {
                // Delete all users
                db.serialize(()=>{
                    db.run("DELETE FROM response")
                    res.send("OK ALL")
                })
            } else {
                // Delete certain user
                const user = req.query.user.toLowerCase()
                db.run(`DELETE FROM response WHERE name=${user}`)
                res.send("OK USER: "+user)
            }
        } else {
            res.status(400)
            res.send("Invalid Input")
        }
    } else {
        res.status(401)
        res.send("NO")
    }
})
rest_server.post("/announce",(req,res)=>{
    // Announce the message to the people who are on the site
    // Complete later as it not part of the re-write.
    if(res.headers.authorization == "huqhqfi89fhgq8fg2q8qf") {
        if(res.body.message) {
            ws_server.clients.forEach((ws_client)=>{
                ws_client.send(JSON.stringify({"title":"Announcement","message":res.body.message}))
            })
        } else {
            res.status(400)
            res.send("Invalid Input")
        }
    } else {
        res.status(401)
        res.send("Unauthorized")
    }
})


// WEBSOCKET HANDLER (tbh nothing is actually needed to be handled other than pinging)

ws_server.on('connection',(ws_client)=>{
    ws_client.on('message',(msg)=>{
        console.log("Websocket client tries to communicate:"+msg)
    })
    (async ()=>{
        while(true) {
            await sleep(30000) // Ping every half minutes
            if(ws_client) {
                if(ws_client.readyState == websocket.OPEN) {
                    ws_client.ping()
                } else {
                    ws_client.terminate();
                    break;
                }
            } else {
                break; // Client is dead, no need to ping it
            }
        }
    })
})

// Clean exit
process.on('SIGINT', function() {
    console.log("Managed shutdown initiate...")
    ws_server.clients.forEach((ws_client)=>{
        ws_client.close();
    })
    db.close()
    process.exit();
  });
// Final Runner
rest_server.listen(8080).then(()=>{
    console.log("Standard HTTP running")
}) // 443 for production
ws_secure_func.listen(8081)
console.log("Websocket running")