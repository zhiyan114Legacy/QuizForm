// QuizForm Backend v2 by zhiyan114 \\


// Load all static dependency
const sqlite = require("sqlite3"); // Broken on the programming machine, enable on test and production machine.
const fs = require('fs');
const https = require('https');
const websocket = require('ws');
const path = require('path');
const sentry = require("@sentry/node");

// Configuration
var config = {
    cert: fs.readFileSync("./cert/Certificate.cer"),
    key: fs.readFileSync("./cert/Private.key")
}
const Answers = {"q1":"B","q2":"C","q3":"A","q4":"B","q5":"D"}
// Load all configurable dependency
const fastify = require('fastify')({ 
    logger: false,
    http2: true,
    https: {
        cert: config["cert"],
        key: config["key"]
    }
 });

// Important dependency Init Config
Sentry.init({
    dsn: "https://0ac7c3a39ea6439fb5d14ab39bdc908c@o125145.ingest.sentry.io/5741158",
    tracesSampleRate: 0.25,
});

// Init the functions
const ws_secure_func = new https.createServer({
    cert: config["cert"],
    key: config["key"]
})
const ws_server = new websocket.Server({ server: ws_secure_func });
const db = new sqlite.Database(path.resolve("./Submissions.db",sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE),(err=>{
    if(err) {
        sentry.captureException(err)
    }
}))
// Init Configuration
fastify.addContentTypeParser('text/json', { parseAs: 'string' }, fastify.getDefaultJsonParser('ignore', 'ignore'))
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
fastify.get("/",(req,res)=>{
    res.type('text/html')
    res.send(fs.readFileSync("./index.html").toString())
})
fastify.get("/answer",(req,res)=>{
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
fastify.post("/answer",(req,res)=>{
    // Submitting answers
    var Correct = 0;
    var InputName = "";
    res.body.forEach((data)=>{
        if(data["name"] == "Name") {
            InputName = data["value"].toLowerCase()
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
                if(res.body.shareAnswer) {
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
fastify.delete("/answer",(req,res)=>{
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
fastify.post("announce",(req,res)=>{
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

// Final Runner
fastify.listen(8080).then(()=>{
    console.log("Standard HTTP running")
}) // 443 for production
ws_secure_func.listen(8081)
console.log("Websocket running")