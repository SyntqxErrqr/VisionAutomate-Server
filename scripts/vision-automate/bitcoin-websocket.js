module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('../../vision-automate-io');
   const IO = new VisionAutomateIO({ local: local, api: backendAPI });

   const WebSocket = require('ws');
   const socket = new WebSocket('wss://ws.blockchain.info/inv');

   IO.out("Connecting to Websocket...");


   socket.on('open', function () {
      IO.out('Connected to WebSocket.');

      socket.send(JSON.stringify({
         op: "unconfirmed_sub"
      }))

      if (local) {
         awaitInput();
      }
      else {
         // Times out after 5 minutes
         setTimeout(() => {
            IO.out("Ending due to timeout.", { success: true });
            completeScript();
         }, config.timeoutMins * 60000)
      }
   });

   socket.on('message', function (data) {
      IO.out(`${data}`);
   });

   function awaitInput() {
      IO.in((input) => {
         if (input.toLowerCase() == "close") {
            completeScript();
         }
         else {
            awaitInput();
         }
      })
   }

   function completeScript() {
      socket.send(JSON.stringify({
         op: "unconfirmed_unsub"
      }))

      socket.close();

      IO.close();
   }
}

// module.exports({}, true); // Uncomment to run locally.