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
    // TODO: refactor it when your brain came back to work, know its not
    async play(message: Message, connection: VoiceConnection) {
       if (this.musicFinder.isPlayMusic(message.content)){
         console.log('music test! url: ', message.content.replace('!play', ''))
         let url = message.content.replace('!play', '')
         connection.play(ytdl(url.trim(), { quality: 'highestaudio', filter: 'audioonly' }));
         return; 
       }
     return Promise.reject();
    }
}
