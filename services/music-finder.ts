import {injectable} from "inversify";
import {Message, VoiceChannel, Guild, } from "discord.js";
import * as ytdl from "ytdl-core";

@injectable()
export class MusicPlayFinder {
  private HOUR = 1000 * 60 * 60;
  private regexp = '!play';
  public isPlayMusic(strToSearch: string,
     message: Message,
     voiceChannel: VoiceChannel) {
    if (!voiceChannel)
      return {
        isPlayable: false,
        error: message.channel.send(
        "You need to be in a voice channel to play music!"
      )};
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return {
        isPlayable: false,
        error: message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      )};
    }
    return {
      isPlayable: strToSearch.search(this.regexp) >= 0, 
      error: null,
    };
  }
  public async execute(message: Message, 
    serverQueue: any,
    queue: Map<any, any>,
    titles: String[]) {
    const args = message.content.split(" ");
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
  
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url
    };
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
  
      queue.set(message.guild.id, queueContruct);
      queueContruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        this.play(message.guild, queueContruct.songs[0], queue);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      message.channel.send(`${song.title} has been added to the queue!`);
      this.playlist(serverQueue, titles);
      return;
    }
  }
  private play(guild: Guild, song: any, queue: any) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
    const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      this.play(guild, serverQueue.songs[0], queue);
    })
    .on("error", (error: any) => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }

  private playlist(serverQueue: any, titles: String[]) {
    const playlist: Map<number, String> = new Map(); 
    let msg: String = ``; 
    for (let i = 0; i < serverQueue.songs.length; i++) {
      const {title} = serverQueue.songs[i];
      playlist.set(i, title);
    }
    for (let [key, values] of playlist) {
      msg += `\`${key} - ${values}\`\n`;
    }
    serverQueue.textChannel.send(msg);
  }

  public skip(message: Message, serverQueue: any) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to skip the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
  }
  
  public async stop(message: Message, serverQueue: any) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
      if (serverQueue.connection.dispatcher.pausedTime() == this.HOUR){
        serverQueue.connection.dispatcher.end();    
        return message.channel.send(
          "You have been disconnect 'cause you are away for too long!"
        );
      }
    serverQueue.connection.dispatcher.pause();
  }

  public async continue(message: Message, serverQueue: any) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to continue the music!"
      );
    serverQueue.connection.dispatcher.resume();
  }
}
