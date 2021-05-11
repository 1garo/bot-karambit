import { exec, spawn } from "child_process";

// how-to: node music.mp3
const arg = process.argv.slice(2);
const ls = spawn("ffplay", [arg[0]]);


ls.stdout.on("data", data => {
    console.log(`deu certo`);
});

ls.stderr.on("data", data => {
    //console.log(`stderr: ${data}`);
});

ls.on('error', (error) => {
    //console.log(`error: ${error.message}`);
});

ls.on("close", code => {
    //console.log(`child process exited with code ${code}`);
});
