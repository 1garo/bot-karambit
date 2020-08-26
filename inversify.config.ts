import "reflect-metadata";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "./bot";
import {Client} from "discord.js";
import {MessageResponder} from "./services/message-responder";
import {PingFinder} from "./services/ping-finder";

let container = new Container();
console.log('token = ', process.env.TOKEN);
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<MessageResponder>(TYPES.MessageResponder).to(MessageResponder).inSingletonScope();
container.bind<PingFinder>(TYPES.PingFinder).to(PingFinder).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
//container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
// TODO: make process.env work | returning undefined
container.bind<string>(TYPES.Token).toConstantValue('NTk3ODE0ODI3OTIxOTY1MDU4.XSNkcQ.01-qg5LW-6WGEwF2C5n9BaOyqTw');
export default container;

