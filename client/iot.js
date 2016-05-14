var ref = new Firebase("https://saveenergy.firebaseio.com/");
var devicesRef = ref.child("devices");
function addDevice() {
  var deviceId = $("#deviceId").val();
  var newDeviceRef = devicesRef.push();
    var date = new Date();
    newDeviceRef.set({
        createAt : date.toJSON(),
        deviceId: deviceId.toString(),
        status: "off"
  });
}
