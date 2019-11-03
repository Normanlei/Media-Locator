var api_key = config.google_api_key;
var script = document.createElement('script');
script.src = "https://maps.googleapis.com/maps/api/js?&libraries=places&key=" + api_key;
document.head.append(script);

function autocomplete() {
    var input1 = new google.maps.places.Autocomplete(document.getElementById('location_open'));
    var input2 = new google.maps.places.Autocomplete(document.getElementById('location_close'));
    google.maps.event.addListener(input1, 'place_changed', function () {
        $("#location_close").val($("#location_open").val());
    });
    google.maps.event.addListener(input2, 'place_changed', function () {
        $("#location_open").val($("#location_close").val());
    });
}

google.maps.event.addDomListener(window, 'load', autocomplete);



var currentLocationID;
var currentLocation;
var currentLat;
var currentLon;
var finalLocationID;
var finalLocationAddress;
var finalLocationName;
var center;
var map;
var infowindow;
var request;
var service;
var maker = [];
var directionsRenderer;
var directionsService;
var mycurrLatLng;
var artistname;
var finaleventdate;


$("#geolocation_open,#geolocation_close").on('click', geoFindMe);
function geoFindMe() {
    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        var geolocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        // //var circle = new google.maps.Circle(
        //     { center: geolocation, radius: position.coords.accuracy });
        // //autocomplete.setBounds(circle.getBounds());
        getPlaceDetail(latitude, longitude);
    }
    function error() {
        //alert('Unable to retrieve your location');
    }

    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
    } else {
        navigator.geolocation.getCurrentPosition(success, error);
    }

}

function getPlaceDetailViaAddress(address) {
    var addressArr = address.split(" ");
    var add = addressArr[0];
    for (var i = 1; i < addressArr.length; i++) {
        add += "+" + addressArr[i];
    }
    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + add + "&key=" + api_key;

    $.ajax({
        url: queryURL,
        method: "GET"
    })
        .then(function (response) {
            console.log(response);
            currentLocation = response.results[0].formatted_address;
            currentLocationID = response.results[0].place_id;
            currentLat = response.results[0].geometry.location.lat;
            currentLon = response.results[0].geometry.location.lng;
            initialize(currentLat, currentLon);
            getResults();
        });
}


function getPlaceDetail(lat, lon) {
    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=" + api_key;
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        .then(function (response) {
            // var id = response.results[0].place_id;
            currentLocation = response.results[0].formatted_address;
            // currentLocationID = id;
            $("#location_open,#location_close").val(currentLocation);
        });
}


function initialize(lat, lon) {
    mycurrLatLng = { lat: lat, lng: lon };
    center = new google.maps.LatLng(lat, lon);
    directionsRenderer = new google.maps.DirectionsRenderer;
    directionsService = new google.maps.DirectionsService;
    map = new google.maps.Map(document.getElementById("map"), {
        center: center,
        zoom: 10 //the larger number, the more zoom in
    });
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById('right-panel'));
    createCurrLocationMarker(mycurrLatLng);
}

function createCurrLocationMarker(latLng) {
    marker = new google.maps.Marker({
        map: map,
        position: latLng,
        title: 'Your Location!!!',
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
    });
}

function getFinalPlaceDetail(lat, lon, venuename, name, date) {
    finalLocationName = venuename;
    artistname = name;
    finaleventdate = date;
    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=" + api_key;
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        .then(function (response) {
            var lat = response.results[0].geometry.location.lat;
            var lon = response.results[0].geometry.location.lng;
            var latLng = { lat: lat, lng: lon };
            var id = response.results[0].place_id;
            finalLocationAddress = response.results[0].formatted_address;
            finalLocationID = id;
            createMarker(latLng);
        });
}

function createMarker(latLng) {
    marker = new google.maps.Marker({
        map: map,
        position: latLng,
    });
    var contentString = "Name: " + artistname + "<br>Venue Name: " + finalLocationName + "<br>Adreess: " + finalLocationAddress + "<br>Date: " + finaleventdate + "<br><a href='https://www.google.com/maps/dir/?api=1&origin=QVB&origin_place_id=" + currentLocationID + "&destination=QVB&destination_place_id=" + finalLocationID + "&travelmode=driving' target='_blank'>Direct ME!</a>";
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    marker.infowindow = infowindow;
    marker.finalLocationID = finalLocationID;
    marker.finalLocationAddress = finalLocationAddress;
    marker.addListener('click', function () {
        $("#route").css("display", "block");
        this.infowindow.open(map, this);
        console.log(this.finalLocationAddress);
        console.log(this.finalLocationID);
        finalLocationAddress = this.finalLocationAddress;
        finalLocationID = this.finalLocationID;
        $("#navigation").on("click", function () {
            window.open("https://www.google.com/maps/dir/?api=1&origin=QVB&origin_place_id=" + currentLocationID + "&destination=QVB&destination_place_id=" + finalLocationID + "&travelmode=walking");
        });
        $("#showroute").on("click", function () {
            calculateAndDisplayRoute(directionsService, directionsRenderer, currentLocation,finalLocationAddress);
        });
    });

    google.maps.event.addListener(infowindow, 'closeclick', function () {
        $("#route").css("display", "none");
    });
}



function calculateAndDisplayRoute(directionsService, directionsRenderer, start, end) {
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

