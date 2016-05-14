var packageVersion = require('./../package.json').version;
var Firebase = require("firebase");
console.log("packageVersion :: " + packageVersion);

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();
//--------------------------------------------------------------------
// Connection database Firebase
//--------------------------------------------------------------------
var ref = new Firebase("https://saveenergy.firebaseio.com/");
var devicesRef = ref.child("devices");
//--------------------------------------------------------------------
// Connection client to bluemix iot platform
//--------------------------------------------------------------------
var Client = require("ibmiotf");
var messageTopics = [];
var appClientConfig = {
	"org" : 'o79sac',
	"id" : 'device01',
    "type" : 'Simulacion',
	"auth-key" : 'a-o79sac-3nzihrgttv',
	"auth-token" : 'SlNC8CpGkN&PGt7u?K'
}
var appClient = new Client.IotfApplication(appClientConfig);
appClient.connect();
// Handle errors coming from the iotf service
appClient.on("error", function (err) {
    console.log("Error received while connecting to IoTF service: " + err.message);
    if (err.message.indexOf('authorized') > -1) {
        console.log('');
        console.log("Make sure the device-simulator is registered in the IotF org with the following configuration:")
        console.log(appClientConfig);
        console.log('');
    }
    process.exit( );
});
appClient.on("connect", function () {
    console.log("Device simulator is connected to the IoT Foundation service");
    appClient.subscribeToDeviceStatus();
    appClient.subscribeToDeviceEvents();
 
});
appClient.on("deviceStatus", function (deviceType, deviceId, payload, topic) {
    console.log("Device status from :: "+deviceType+" : "+deviceId+" with payload : "+payload);
});
var counter = 0;
appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
    console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);
    messageTopics.push({"payload":payload.toString()});
    var newDeviceRef = devicesRef.push();
    var date = new Date();
    newDeviceRef.set({
        deviceId: deviceId+"",
        power: payload.toString(),
        status: "on",
        date : date+""
    });
});
// ------------ Protecting mobile backend with Mobile Client Access start -----------------

// Load passport (http://passportjs.org)
var passport = require('passport');

// Get the MCA passport strategy to use
var MCABackendStrategy = require('bms-mca-token-validation-strategy').MCABackendStrategy;

// Tell passport to use the MCA strategy
passport.use(new MCABackendStrategy())

// Tell application to use passport
app.use(passport.initialize());

// Protect DELETE endpoint so it can only be accessed by HelloTodo mobile samples
app.delete('/api/Items/:id', passport.authenticate('mca-backend-strategy', {session: false}));

// Tramas 
app.get('/api/devices',function(req, res){
	res.send(messageTopics);
});

// Protect /protected endpoint which is used in Getting Started with Bluemix Mobile Services tutorials
app.get('/protected', passport.authenticate('mca-backend-strategy', {session: false}), function(req, res){
	res.send("Hello, this is a protected resouce of the mobile backend application!");
});
// ------------ Protecting backend APIs with Mobile Client Access end -----------------

app.start = function () {
	// start the web server
	return app.listen(function () {
		app.emit('started');
		var baseUrl = app.get('url').replace(/\/$/, '');
		console.log('Web server listening at: %s', baseUrl);
		var componentExplorer = app.get('loopback-component-explorer');
		if (componentExplorer) {
			console.log('Browse your REST API at %s%s', baseUrl, componentExplorer.mountPath);
		}
	});
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
	if (err) throw err;
	if (require.main === module)
		app.start();
});

