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
      this.musicFinder.execute(message, serverQueue, queue).then(() => {
        console.log('playing a song!');
      }).catch(err => {
        console.log(`error: ${err}`);
      })
      return Promise.resolve(); 
    }
    skip(message: Message, queue: any){
      this.musicFinder.skip(message, queue)
    }
    
    stop(message: Message, queue: any){
      this.musicFinder.stop(message, queue);
    }
    
    continue(message: Message, queue: any) {
      this.musicFinder.continue(message, queue);
    }

    exit(message: Message, queue: any) {
      this.musicFinder.exit(message, queue);
    }
  }
