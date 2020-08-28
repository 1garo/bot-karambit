import {Client, Message, VoiceConnection} from 'discord.js';
import {inject, injectable} from "inversify";
import {TYPES} from "./types";
import {MessageResponder} from "./services/message-responder"; 
import {MusicResponder} from './services/music-responder';
import {PREFIX as prefix} from './config.json';

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;
  private messageResponder: MessageResponder;
  private musicResponder: MusicResponder;

  constructor (
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.MessageResponder) messageResponder: MessageResponder,
    @inject(TYPES.MusicResponder) musicResponder: MusicResponder, 
  ) {
    this.client = client;
    this.token = token;
    this.messageResponder = messageResponder;
    this.musicResponder = musicResponder;
  }

  public async listen(queue: Map<any, any>): Promise<string> {
    this.client.on('message', async (message: Message) => {
      if (message.author.bot){
        console.log('Ignoring bot message!')
        return;
      }
      console.log("Message received! Contents: ", message.content);
      this.messageResponder.handle(message).then(() => {
        console.log('Ping test message sent!')
      }).catch(() => {
        console.log('Ping teste response not sent.')
      })

      const serverQueue = queue.get(message.guild.id);

      if (message.content.startsWith(`${prefix}play`)) {
        this.musicResponder.play(message, serverQueue, queue).then(() => {
          message.reply('playing music requested!');
        }).catch(err => {
          err.then(_err => console.log(_err.content));
        })
      } else if (message.content.startsWith(`${prefix}skip`)) {
        this.musicResponder.skip(message, serverQueue);
      } else if (message.content.startsWith(`${prefix}stop`)) {
        //this.musicResponder.stop(message, serverQueue);
      } else {
        message.channel.send("You need to enter a valid command!");
      }
    });
    return this.client.login(this.token);
  }
}