module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('../../vision-automate-io');
   const IO = new VisionAutomateIO(startScript, { local: local, api: backendAPI });

   const WebSocket = require('ws');
   const socket = new WebSocket('wss://ws.blockchain.info/inv');

   function startScript() {
      IO.out("Connecting to API...");


      socket.on('open', function () {
         IO.out('Connected to WebSocket');

         socket.send(JSON.stringify({
            op: "unconfirmed_sub"
         }))

         awaitInput();
      });

      socket.on('message', function (data) {
         IO.out('Received message: ' + data);

      });

   }

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

   IO.run();
}

module.exports({}, true); // Uncomment to run locally.