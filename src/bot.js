import {getUsersInServer} from './reader.js'
import util from 'util';
import { Client, WebhookClient } from 'discord.js';
import dotenv from 'dotenv'
dotenv.config('.env')

const webhookClient = new WebhookClient(
  process.env.WEBHOOK_ID,
  process.env.WEBHOOK_TOKEN,
);

function sendMsg(msg){
  webhookClient.send(msg)
}

function botStartup(){
  var names = ["Zeak", "Asynchronous", "Kaje", "Keiser"]
  const client = new Client({
    partials: ['MESSAGE', 'REACTION']
  });
  var largestString = 0
  names.forEach(element => element.length > largestString ? largestString = element.length : null)


  const PREFIX = "!";

  client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);  
  });

  client.on('message', async (message) => {
    if (message.content == "Server Up"){
      client.user.setActivity("Server Online")
    }
    else if (message.content == "Server Down"){
      client.user.setActivity("Server Offline")
    }
    if (message.content.startsWith(PREFIX)) {
      const [CMD_NAME, ...args] = message.content
        .trim()
        .substring(PREFIX.length)
        .split(/\s+/);
      if (CMD_NAME === 'deathlist') {
          var msgString = "\n";
          getUsersInServer().forEach(function (element){
            msgString += util.format("%s%s%s\n", element.name, ": ", element.death_count);
          })
          return message.reply(msgString)

      }
      else if (CMD_NAME == 'tattle'){
        var msgString = "\n";
        getUsersInServer().forEach(function (element){
          msgString += util.format("%s%s%s\n", element.name, ": ", element.is_online === true ? "on" : "off");
        })
        return message.reply(msgString)
              
      }
    }
  });

  client.login(process.env.DISCORDJS_BOT_TOKEN);
}

export {botStartup, sendMsg}