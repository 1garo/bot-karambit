require('dotenv').config();
import container from "./inversify.config";
import {TYPES} from "./types";
import {Bot} from "./bot";

let bot = container.get<Bot>(TYPES.Bot);
let queue = new Map();

bot.listen(queue).then(() => {
  console.log('Logged in!')
}).catch(error => {
  console.log('oh no! ', error)
});
