import {botStartup, sendMsg}  from "./bot.js"
import fs from 'fs'
import { spawn, exec } from 'child_process'
import ncp from 'ncp';
import dotenv from 'dotenv'
dotenv.config('.env')
const SAVESFOLDER = process.env.MY_SAVES_FOLDER


// Users
var users_in_server = []
var intruder = false

function getUsersInServer(){
    return users_in_server
}

if(!fs.existsSync('users.json')){
    console.log("ERROR: no users file")
    process.exit(1)
}

fs.readFile('users.json', 'utf8', (err, data) => {

    if (err) {
        console.log(`Error reading file from disk: ${err}`);
    } else {

        // parse JSON string to JSON object
        users_in_server = JSON.parse(data);

        if(!fs.existsSync('deathlist.txt')){
            write_to_death_file()
        }
        else {
            fs.readFile('deathlist.txt', 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }
                var data = fs.readFileSync('deathlist.txt');
                var deathArray = data.toString().split("\n")
                deathArray.forEach(function(element, index) {
                    if (index < users_in_server.length){
                        users_in_server[index].death_count = element
                    }
                })                
                write_to_death_file()
            })
        }

    }

});


// Backups
setInterval(function() {
    if (!users_in_server.find(user => user.is_online == true)) return
    let date_ob = new Date();
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    // current hours
    let hours = date_ob.getHours();
    // current minutes
    let minutes = date_ob.getMinutes();
    ncp(SAVESFOLDER + "\\" + "Valheim", "Backups\\" + month + "_" + date + "_"+ hours + "_" + minutes,  
        function (err) { 
    if (err) { 
        return console.error(err); 
    } 
    sendMsg("Performed backup succesfully " + month + "_" + date + "_"+ hours + "_" + minutes)
  
    console.log('Folders copied correctly'); 
}); 
}, parseInt(process.env.SAVE_TIME_IN_MS));

// Discord bot
botStartup()

// Start valheim program
process.chdir('..')
if (!fs.existsSync("Backups")){
    fs.mkdirSync("Backups");
}
const subprocess = spawn(process.env.BAT_FILE, [], { stdio: ['pipe', 'pipe', fs.openSync('err.out', 'w')] });

subprocess.stdout.on('data', (data) => {
    handle_message(`${data}`);
    console.log(`${data}`)
});

// Update their death counts
function write_to_death_file(){
    var toWrite = ""
    users_in_server.forEach(function(user, index){
        toWrite += parseInt(user.death_count) + '\n'
    })
    fs.writeFile('deathlist.txt', toWrite, function (err) {
        if (err) return console.log(err);
    });
}




// Handle messages as they come
function handle_message(msg){
    if (msg.includes("Got handshake from client ")){
        if (!users_in_server.find(user => msg.includes(user.client_id))){
            intruder = true
            sendMsg("INTRUDER ALERT A RED SPY IS TRYING TO GET INTO THE BASE!")
        }
    }
    if (msg.includes("Got character")){
        if (!users_in_server.find(user => msg.includes(user.name)) && intruder){
            sendMsg("INTRUDER ALERT A RED SPY IS IN THE BASE! " + msg)
            exec("Taskkill /IM valheim_server.exe /F", (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
        }
    }
    users_in_server.forEach(function(user, index){
        if (msg.includes(": 0:0") && msg.includes(user.name)){
            users_in_server[index].death_count = (parseInt(users_in_server[index].death_count) + 1) + ""
            sendMsg("Ouch! " + user.name + " died " + users_in_server[index].death_count + " times")
            write_to_death_file()
        }
        else if (msg.includes("Got handshake from client " + user.client_id)){
            if (!user.is_online) {
                sendMsg("Welcome " + user.name + " to the server!");
                users_in_server[index].is_online = true
                console.log(user.name, msg)
            }
        }
        else if (msg.includes("Closing socket " + user.client_id)){
            sendMsg("Goodbye " + user.name)
            users_in_server[index].is_online = false
        }
    })
    if (msg.includes("Net scene destroyed")) {
        sendMsg("Server Down");
    }
    else if (msg.includes("Load world ZeakWorld")) {
        sendMsg("Server Up");
    }

}


export {getUsersInServer}