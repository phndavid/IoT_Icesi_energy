function addDevice(text){
      var device = {
        "deviceId": text,
        "status": false
      }

      return $.ajax( {
        url:API_URL,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(item)
      });
}