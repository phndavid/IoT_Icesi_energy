var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Firebase = require("firebase");
var port = 8090;
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/public'));
//--------------------------------------------------------------------
// Connection database Firebase
//--------------------------------------------------------------------
var ref = new Firebase("https://triviaahorroenergia.firebaseio.com/");
var devicesRef = ref.child("Devices");
//--------------------------------------------------------------------
// Connection client to bluemix iot platform
//--------------------------------------------------------------------
var Client = require("ibmiotf");
var messageTopics = [];
var appClientConfig = {
    "org" : 'qay053',
    "id" : 'device01',
    "type" : 'Consumo-energia',
    "auth-key" : 'a-qay053-wq5kc9jnfh',
    "auth-token" : '(5X&Y-Iz9GE1VlyMBz'
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
    //console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);
    var pay =  ""+payload;
    var parse = JSON.parse(pay);
    console.log(parse);
    var power = parse.d.counter;
    console.log("power: "+ power);
    messageTopics.push(parse);
    var newDeviceRef = devicesRef.push();
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var mindate = day+"/"+month+"/"+year;
    var hour = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    newDeviceRef.set({
        date : mindate,
        timehour: hour,
        deviceId: "device01",
        power: power,
        status: "off"
    });
});

/*app.get('/signup', function (req, res) {
    res.sendFile(__dirname+'/public/signup.html');
});
app.get('/login', function (req, res) {
    res.sendFile(__dirname+'/public/signup.html');
});*/
// test route to make sure everything is working (accessed at GET http://localhost:8090/iot)
app.get('/iot', function(req, res) {
    res.json(messageTopics);   
});
app.get('*', function (req, res) {
    res.sendFile(__dirname+'/public/index.html');
});
app.listen(port);
console.log('The App runs on port: ' +port);