import { Client, Message} from 'discord.js';
import { inject, injectable} from "inversify";
import { TYPES} from "./types";
import { PingResponder} from "./services/ping-responder"; 
import { MusicResponder} from './services/music-responder';
//import { PREFIX as prefix} from './config.json';

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;
  private pingResponder: PingResponder;
  private musicResponder: MusicResponder;
  private HOUR = 1000 * 60 * 60;

  constructor (
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.PingResponder) pingResponder: PingResponder,
    @inject(TYPES.MusicResponder) musicResponder: MusicResponder, 
  ) {
    this.client = client;
    this.token = token;
    this.pingResponder = pingResponder;
    this.musicResponder = musicResponder;
  }
  private async action(message, serverQueue, queue) {
      //const f = this.musicResponder;

      const PLAY = `${message.content.split(' ')[0].slice(1)}`;
      console.log(`here : ${PLAY}`)
      PLAY === "play" ? await this.musicResponder[`${message.content.split(' ')[0].slice(1)}`](message, serverQueue, queue) : 
      await this.musicResponder[`${message.content.split(' ')[0].slice(1)}`](message, serverQueue);
  }

  public async listen(queue: Map<any, any>): Promise<string> {
    this.client.on('message', async (message: Message) => {
      if (message.author.bot){
        console.log('Ignoring bot message!')
        return;
      }

      this.pingResponder.handle(message).then(() => {
        console.log('ping sent!')
      }).catch(() => {
        console.log('ignoring ping!')
      })

      const serverQueue = queue.get(message.guild.id);
      // TODO: implement a timeout to the bot
      // if (serverQueue.connection.dispatcher.pausedTime() == this.HOUR){
      //   serverQueue.connection.dispatcher.end();    
      //   return message.channel.send(
      //     "You have been disconnect 'cause you are away for too long!"
      //   );
      // }

      const PLAY = `${message.content.split(' ')[0].slice(1)}`;
      console.log(`here: ${PLAY}\n id: ${message.id}`)
      PLAY === "play" ? await this.musicResponder[`${message.content.split(' ')[0].slice(1)}`](message, serverQueue, queue) : 
      await this.musicResponder[`${message.content.split(' ')[0].slice(1)}`](message, serverQueue);

      //this.action(message, serverQueue, queue);
      //this.musicResponder.play(message, serverQueue, queue);
      //console.log(message.content.startsWith(`${prefix}${message.content.split(' ')[0]}`);
      //await action[message.content.startsWith(`${prefix}${message.content.split(' ')[0]}`](message, serverQueue, queue);
    //  if (message.content.startsWith(`${prefix}play`)) {
    //    this.musicResponder.play(message, serverQueue, queue).then(() => {})
    //    .catch(err => {
    //      err.then((_err: any) => console.log(_err.content));
    //    })
    //  } else if (message.content.startsWith(`${prefix}skip`)) {
    //    this.musicResponder.skip(message, serverQueue);
    //  } else if (message.content.startsWith(`${prefix}pause`)) {
    //    this.musicResponder.pause(message, serverQueue);
    //  } else if (message.content.startsWith(`${prefix}continue`)) {
    //    this.musicResponder.continue(message, serverQueue);
    //  } else if (message.content.startsWith(`${prefix}exit`)){
    //    this.musicResponder.exit(message, serverQueue);
    //  }
    });
    return this.client.login(this.token);
  }
}
