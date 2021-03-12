import {injectable} from "inversify";
import {Message, VoiceChannel, Guild, } from "discord.js";
import * as ytdl from "ytdl-core";

@injectable()
export class MusicPlayFinder {

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
    queue: Map<any, any>) {
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
        const connection = await voiceChannel.join();
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
      this.playlist(serverQueue);
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
			/**
			 * TODO: make it able to play yt playlists
			 * serverQueue.songs = [{"title":"Gusttavo Lima - Duas da Manhã (O Embaixador The Legacy)","url":"https://www.youtube.com/watch?v=gK5fnHpU6qg"},
			 * 										{"title":"Gusttavo Lima - Duas da Manhã (O Embaixador The Legacy)","url":"https://www.youtube.com/watch?v=gK5fnHpU6qg"}]
			 * 
			 */
			console.log(`dispatcher before: ${JSON.stringify(serverQueue.songs)}\n`);
      serverQueue.songs.shift();
			console.log(`dispatcher after shift: ${JSON.stringify(serverQueue.songs)}\n`);
      this.play(guild, serverQueue.songs[0], queue);
    })
    .on("error", (error: any) => console.error(error));

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }

  private playlist(serverQueue: any) {
    const playlist: Map<number, String> = new Map(); 
    let msg: String = `-----------Playlist----------\n`; 
    for (let i = 0; i < serverQueue.songs.length; i++) {
      const {title} = serverQueue.songs[i];
      playlist.set(i+1, title);
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
  
	public async pause(message: Message, serverQueue: any) {
		if (!message.member.voice.channel)
		return message.channel.send(
			"You have to be in a voice channel to pause the music!"
			);
      console.log('aaa ' + serverQueue.connection.dispatcher.playing);
		serverQueue.connection.dispatcher.pause();
	}
    
  // TODO: when using pause->continue it doesnt work, if skips the music, it works
  // maybe could be something related to reference
  public async continue(message: Message, serverQueue: any) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to continue the music!"
        );
        console.log('entrou')
      console.log(serverQueue.connection.dispatcher);
      if (serverQueue.connection.dispatcher.paused) {
        console.log('aquiiiiiiii');
        serverQueue.connection.dispatcher.resume();
      }
  }

  public exit(message: Message, serverQueue: any) {
    serverQueue.connection.channel.leave();
    message.channel.send(
    "Leaving the channel!"
    );
  }
}
