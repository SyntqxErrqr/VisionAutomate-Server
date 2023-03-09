const WebSocket = require('ws');
const EventEmitter = require('events');
const fse = require('fs-extra');

let connections = {};

class backendIO {
   ws;
   emitter;
   id;
   wDir;

   constructor(ws, id) {
      this.ws = ws;
      this.emitter = new EventEmitter();
      this.emitter.setMaxListeners(0);
      this.id = id;
      this.wDir = __dirname;

      this.ws.on('close', () => {
         this.close();
      });
   }

   handleMessage(data) {
      switch (data.action) {
         case "userInput": {
            this.emitter.emit("userInput", data.text);
            break;
         }
         case "userUpload": {
            this.emitter.emit("userUpload", data.data, data.info);
            break;
         }
      }
   }

   send(obj) {
      this.ws.send(JSON.stringify(obj));
   }

   async receive() {
      // Send input request and return data in the promise.
      return new Promise((resolve, reject) => {
         this.emitter.on('userInput', (input) => {
            this.emitter.removeListener("userInput", () => { });
            resolve(input);
         });
      });
   }

   async receiveFile() {
      // Send input request and return data in the promise.
      return new Promise((resolve, reject) => {
         this.emitter.on('userUpload', (data, info) => {
            this.emitter.removeListener("userUpload", () => { });
            resolve({ data: data, info: info });
         });
      });
   }

   close() {
      if (connections[this.id] != undefined) {
         console.log(`Disconnected user: "${this.id}".`);
         fse.removeSync(`./files/${this.id}`);
         this.emitter.removeAllListeners();
         delete connections[this.id];
         this.ws.close();
      }
   }
}

fse.exists("files").then((filesFolderExists) => {
   if (!filesFolderExists) fse.mkdir("files");
})

const wss = new WebSocket.Server({ port: 8080 });

// On connection
wss.on('connection', (ws) => {
   console.log("\nEstablished connection.");

   // On message
   ws.on('message', (message) => {
      // console.log("Received message :", data)
      let data = JSON.parse(JSON.parse(message.toString()));

      if (data.action == "start") {
         console.log(`Starting ${data.script.location} : (${data.id})`)
         connections[data.id] = new backendIO(ws, data.id);
         try {
            if (!data.script.location) {
               require(`./scripts/config-print`)(data.script.config, false, connections[data.id]);
            }
            else {
               require(`./scripts/${data.script.location}`)(data.script.config, false, connections[data.id]);
            }
         }
         catch (err) {
            console.log(err);
            connections[data.id].send({ text: "Script failed.", props: { failure: true, highlight: true, action: "close" } });
            connections[data.id].close();
         }
      }
      else {
         connections[data.id].handleMessage(data);
      }
   });
});
