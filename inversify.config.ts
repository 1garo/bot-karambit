import "reflect-metadata";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "./bot";
import {Client} from "discord.js";
import {MessageResponder} from "./services/message-responder";
import {PingFinder} from "./services/ping-finder";
import {MusicPlayFinder} from './services/music-finder';
import {MusicResponder} from './services/music-responder';
import {TOKEN} from './config.json';

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<MessageResponder>(TYPES.MessageResponder).to(MessageResponder).inSingletonScope();
container.bind<PingFinder>(TYPES.PingFinder).to(PingFinder).inSingletonScope();
container.bind<MusicPlayFinder>(TYPES.MusicFinder).to(MusicPlayFinder).inSingletonScope();
container.bind<MusicResponder>(TYPES.MusicResponder).to(MusicResponder).inSingletonScope();

container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(TOKEN);

export default container;

