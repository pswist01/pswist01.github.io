var myLocation;
var myLat;
var myLng;
var charLat;
var charLng;
var charLocation;
var charName;
var charImage;
var charNote;
var charContent;
var charTime;
var path;
var distances = new Object();
var counter = 0; 
var lat1;
var lat2;
var lon1;
var lon2;
var distWindLoc;
var image = {
    url: "download.jpg",
    scaledSize: new google.maps.Size(40,40)
};

infowindow = new google.maps.InfoWindow();
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
	charNote = parsed["characters"][i]["loc"]["note"];
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

	charContent = charName + ", " + charLat + ", " + charLng + ", " + charNote;
	
	var marker = new google.maps.Marker({
	    position: charLocation,
	    map: map,
	    title: charName,
	    icon: charImage,
	    content: charContent
	});
	
	google.maps.event.addListener(marker, 'click', function() {
	    infowindow.close();
	    infowindow.setContent(this.content);
	    infowindow.open(map,this);
	});
	path = [
	    myLocation,
	    charLocation
	];
	var linePath = new google.maps.Polyline({
	    path: path,
	    geodesic: true,
	    strokeColor: '#FF0000',
	    strokeOpacity: 1.0,
	    strokeWeight: 2
	});

	linePath.setMap(map);
	distances[i] = {"character": charName, "dist":calcDistance(myLat, myLng, charLat, charLng)}; 
counter++;
    }
    for (i in parsed["students"])
    {
	charName = parsed["students"][i]["login"];
	charLat = parsed["students"][i]["lat"];
	charLng = parsed["students"][i]["lng"];
	charTime = parsed["students"][i]["created_at"];
	charLocation = new google.maps.LatLng(charLat, charLng);
	charContent = charName + ", " + charLat + ", " + charLng + ", " + charTime;

	var marker = new google.maps.Marker({
	    position: charLocation,
	    map: map,
	    title: charName,
	    content: charContent
	});

	google.maps.event.addListener(marker, 'click', function() {
	    infowindow.close();
	    infowindow.setContent(this.content);
	    infowindow.open(map,this);
	});
    }
    //distances.sort();
    charContent = "";
    for(i = 0; i<counter; i++){
	charContent += distances[i].character;
	charContent += " ";
	charContent += distances[i].dist;
	charContent += "</p><p>";
    } 
    var marker = new google.maps.Marker({
	position: myLocation,
	map: map,
	title:"My Position",
	icon: image,
	content: charContent
    });
    google.maps.event.addListener(marker, 'click', function() {
	infowindow.close();
	infowindow.setContent(this.content);
	infowindow.open(map,this);
    });
}

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

function calcDistance(lat1, lon1, lat2, lon2){ 
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

return d;
}
