module.exports = (config, local, backendAPI) => {
    const cryptoJs = require("crypto-js");
    const mongoose = require("mongoose");

    const VisionAutomateIO = require('../../vision-automate-io');

    let ApiKey;
    try {
        ApiKey = mongoose.model("ApiKey");
    }
    catch {
        ApiKey = mongoose.model("ApiKey", new mongoose.Schema({
            companyName: {
                type: String,
                index: { unique: true }
            },
            pass: String,
            maxUses: Number,
            devices: [{
                _id: false,
                uuid: String,
                identifier: String
            }],
            scripts: [{
                _id: false,
                title: String,
                location: String,
                configHosted: Boolean,
                configSchema: Object,
                config: Object
            }]
        }));
    }

    const IO = new VisionAutomateIO(startScript, { local: local, api: backendAPI });

    let apiObj = {
        devices: [],
        scripts: [
            {
                title: "List users",
                location: "listusers",
                configHosted: false,
                configSchema: [
                    {
                        title: "API Key",
                        prop: "apiKey",
                        type: "string",
                        integration: ["user", "_id"],
                        props: {}
                    }
                ]
            }
        ],
        maxUses: 10
    }

    function startScript() {
        IO.out("Creating a new user.");

        getCompanyname();
    }

    function getCompanyname() {
        IO.out("Enter company name.");
        IO.in((data) => {
            data = data.toLowerCase().replace(" ", "-");
            apiObj.companyName = data;

            if (config.askUses) {
                getUses();
            }
            else {
                getPassphrase();
            }
        });
    }

    function getUses() {
        IO.out("Enter uses.");
        IO.in((data) => {
            let uses = Number.parseInt(data);
            if (isNaN(uses) || uses < 0) {
                IO.out("Value must be a number greater than 0.", { failure: true });
                getUses();
                return;
            }
            apiObj.maxUses = uses;

            getPassphrase();
        });
    }

    function getPassphrase() {
        IO.out("Enter passphrase.");
        IO.in((data) => {
            apiObj.pass = cryptoJs.SHA1(data).toString();

            createUser();
        });
    }

    function createUser() {
        IO.out("Sending data to database.");
        mongoose.set('strictQuery', false);
        mongoose.connect('mongodb://127.0.0.1/visionautomate');
        const connection = mongoose.connection;

        connection.once("open", () => {
            console.log("MongoDB connection successfully established.");

            ApiKey.create(apiObj)
                .then((apiKey) => {
                    IO.out(`Successfully created user.`, { success: true });
                    IO.out(`Key: ${apiKey._id}`);
                    connection.close();
                    completeScript();
                })
                .catch((err) => {
                    console.log(err);
                    IO.out("Failed to create user.", { failure: true });
                    connection.close();
                    completeScript();
                })
        })
    }

    function completeScript() {
        // console.log(apiObj);

        IO.close();
    }

    IO.run();
}

// module.exports({}, true);