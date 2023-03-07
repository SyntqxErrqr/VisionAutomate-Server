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

const wss = new WebSocket.Server({ port: 8080 });

// On connection
wss.on('connection', (ws) => {
   console.log('')
   console.log("Established connection.");

   // On message
   ws.on('message', (message) => {
      // console.log("Received message :", data)
      let data = JSON.parse(JSON.parse(message.toString()));

      if (data.action == "start") {
         console.log(`Starting ${data.script.location} : (${data.id})`)
         connections[data.id] = new backendIO(ws, data.id);
         try {
            require(`./scripts/${data.script.location}`)(data.script.config, false, connections[data.id]);
         }
         catch (err) {
            console.log(err);
            connections[data.id].send({ text: "Script failed.", props: { failure: true, action: "close" } });
            connections[data.id].close();
         }
      }
      else {
         connections[data.id].handleMessage(data);
      }
   });
});
