var Client = require("ibmiotf");
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
appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {

    console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);

});