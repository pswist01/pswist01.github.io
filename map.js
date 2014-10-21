var myLocation;
var myLat;
var myLng;
var charLat;
var charLng;
var charLocation;
var charName;
var charImage;
var image = {
    url: "download.jpg",
    scaledSize: new google.maps.Size(25,25)
};


function initialize(){
    getMyLocation();
    var mapOptions = {
        center: { lat: 42.4069, lng: -71.1198},
        zoom: 8
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
			      mapOptions);
}

function getMyLocation(){
    if(navigator.geolocation)
    {
	navigator.geolocation.getCurrentPosition(function (position){
	    myLat = position.coords.latitude;
	    myLng = position.coords.longitude;
	    myLocation = new google.maps.LatLng(myLat, myLng);
	    var marker = new google.maps.Marker({
		position: myLocation,
		map: map,
		title:"My Position",
		icon: image
	    });
	    sendRequest();
	});
    }
    else{
	alert("not working");
    }
}

function sendRequest(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://chickenofthesea.herokuapp.com/sendLocation", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
	if(xhr.readyState == 4 && xhr.status == 200) {
            alert(xhr.responseText);
	    var parsed = JSON.parse(xhr.responseText);
	    showOthers(parsed);
	}
    }
    xhr.send("login=Anita&lat=" + myLat + "&lng=" + myLng);
}

function showOthers(parsed){
    for (i in parsed["characters"]){
	charName = parsed["characters"][i]["name"];
	charLat = parsed["characters"][i]["loc"]["latitude"];
	charLng = parsed["characters"][i]["loc"]["longitude"];
	if (charName == "carmen")
	    charImage = "carmen.png";
	if (charName == "waldo")
	    charImage = "waldo.png";
	if (charName == "batman")
	    charImage = "batman.png";
	if (charName == "nr")
	    charImage = "nr.png";
	if (charName == "snape")
	    charImage = "snape.png";
	if (charName == "hescott")
	    charImage = "hescott.png";

	charLocation = new google.maps.LatLng(charLat, charLng);
	var marker = new google.maps.Marker({
	    position: charLocation,
	    map: map,
	    title: charName,
	    icon: charImage
	});
    }
}

/*
Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

var lat2 = 42.741; 
var lon2 = -71.3161; 
var lat1 = 42.806911; 
var lon1 = -71.290611; 

var R = 6371; // km 

var x1 = lat2-lat1;
var dLat = x1.toRad();  
var x2 = lon2-lon1;
var dLon = x2.toRad();  
var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);  
var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
var d = R * c; 

alert(d);*/
