import {Message, VoiceConnection} from "discord.js";
import {MusicPlayFinder} from "./music-finder";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import * as ytdl from "ytdl-core";

@injectable()
export class MusicResponder {
  private musicFinder : MusicPlayFinder;
  
  constructor(
    @inject(TYPES.MusicFinder) musicFinder: MusicPlayFinder,
    ){
      this.musicFinder = musicFinder;
    }
    async play<T>(message: Message, 
      serverQueue: any,
      queue: Map<any, any>) {
      const voiceChannel = message.member.voice.channel;

      const {isPlayable, error} = this.musicFinder.
      isPlayMusic(message.content, message, voiceChannel);
      if (!isPlayable){
        console.log(`rejecting the promise: ${isPlayable}`)
        return Promise.reject(error);
      }
      this.musicFinder.execute(message, serverQueue, queue).then(() => {
        console.log('playing a song!');
      }).catch(err => {
        console.log(`error: ${err}`);
      })
      return Promise.resolve(); 
    }
    /*
      TODO: when skip is used and there is no more music, 
      throw a message on the chat and don't disconnect the bot
    */
    skip(message: Message, queue: any){
      console.log(`queue: ${queue}`);
      this.musicFinder.skip(message, queue)
    }
    /*
      TODO: stop are empyting the bot and leaving, 
      change it to stop the music that is playing  
    */
    stop(message: Message, queue: any){
      console.log(`queue: ${queue}`);
      this.musicFinder.stop(message, queue);
    }
    /*
      TODO: create a start command that continue to play the music
      that stop has stopped 
    */
}
