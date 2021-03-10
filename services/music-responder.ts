import {Message} from "discord.js";
import {MusicPlayFinder} from "./music-finder";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";

@injectable()
export class MusicResponder {
  private musicFinder : MusicPlayFinder;
  
  constructor(
    @inject(TYPES.MusicFinder) musicFinder: MusicPlayFinder,
    ){
      this.musicFinder = musicFinder;
    }
    async play(message: Message, 
      serverQueue: any,
      queue: Map<any, any>) {
        const voiceChannel = message.member.voice.channel;

        const {isPlayable, error} = this.musicFinder.
        isPlayMusic(message.content, message, voiceChannel);
      if (!isPlayable){
        console.log(`(rejecting the promise): isPlayable: ${isPlayable}`)
        return Promise.reject(error);
      }
      try {
        await this.musicFinder.execute(message, serverQueue, queue)
        console.log('playing a song!');
      } catch (err) {
        console.log(`error: cannot play the song required\n ${err}`);
      }
      return Promise.resolve(); 
    }
    skip(message: Message, queue: any){
      this.musicFinder.skip(message, queue)
    }
    
    pause(message: Message, queue: any){
      this.musicFinder.pause(message, queue);
    }
    
    continue(message: Message, queue: any) {
      this.musicFinder.continue(message, queue);
    }

    exit(message: Message, queue: any) {
      this.musicFinder.exit(message, queue);
    }
  }
