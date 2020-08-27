import {Client, Message} from 'discord.js';
import {inject, injectable} from "inversify";
import {TYPES} from "./types";
import {MessageResponder} from "./services/message-responder"; 
import {MusicResponder} from './services/music-responder';

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

  public listen(): Promise<string> {
    this.client.on('message', async (message: Message) => {
      let connection;
      if (message.author.bot){
        console.log('Ignoring bot message!')
        return;
      }
      if (message.member.voice.channel) {
        connection = await message.member.voice.channel.join();
      }
      console.log("Message received! Contents: ", message.content);

      this.messageResponder.handle(message).then(() => {
        console.log('Ping test message sent!')
      }).catch(() => {
        console.log('Ping teste response not sent.')
      })
     
      this.musicResponder.play(message, connection).then(() => {
        message.reply('playing music requested!');
      }).catch(err => {
        console.log(err);
      })
    });
      return this.client.login(this.token);
  }
}