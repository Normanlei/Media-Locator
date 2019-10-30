$(document).ready(function () {
    var api_key = config.google_api_key;
    var script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?&libraries=places&key=" + api_key;
    document.head.append(script);

    // var currentAddress;

    function getPlaceDetailViaAddress(address) {
        var addressArr = address.split(" ");
        // console.log(addressArr);
        var add = addressArr[0];
        for (var i = 1; i < addressArr.length; i++) {
            add += "+" + addressArr[i];
        }
        // console.log(add);
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + add + "&key=" + api_key;

        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function (response) {
                console.log(response);
            });
    }


    var currentLocationID;

    function getPlaceDetail(lat, lon) {
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=" + api_key;
        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function (response) {
                console.log(response);
                var lat = response.results[0].geometry.location.lat;
                var lon = response.results[0].geometry.location.lng;
                var id = response.results[0].place_id;
                console.log(id);
                currentLocationID = id;
                console.log(currentLocationID);
                initialize(lat,lon);
                // // console.log(response.results[0].formatted_address);
                // currentLocationID = response.results[0].place_id;
                // currentLocation = response.results[0].formatted_address;
                // $('#autocomplete').val(currentLocation);
            });
    }


    geoFindMe();
    function geoFindMe() {
        function success(position) {
            console.log(position);
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            getPlaceDetail(latitude, longitude);
            //initialize(latitude, longitude);
        }

        function error() {
            alert('Unable to retrieve your location');
        }

        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
        } else {
            navigator.geolocation.getCurrentPosition(success, error);
        }

    }


    var center;
    var map;
    var infowindow;
    var request;
    var service;
    var maker = [];
    var directionsRenderer;
    var directionsService;
    var mycurrLatLng;

    function initialize(lat, lon) {
        console.log(currentLocationID);
        mycurrLatLng = {lat: lat, lng: lon};;
        center = new google.maps.LatLng(lat, lon);
        directionsRenderer = new google.maps.DirectionsRenderer;
        directionsService = new google.maps.DirectionsService;
        map = new google.maps.Map(document.getElementById("map"), {
            center: center,
            zoom: 15 //the larger number, the more zoom in
        });
        directionsRenderer.setMap(map);
        directionsRenderer.setPanel(document.getElementById('right-panel'));
        infowindow = new google.maps.InfoWindow();
        createMarker(mycurrLatLng);
    }

    function createMarker(latLng) {
        marker = new google.maps.Marker({
            map: map,
            position: latLng,
            icon: {                             
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"                          }
        });
        google.maps.event.addListener(marker, 'click', function () {
            var content ="Address: " + place.rating;
            infowindow.setContent(content);
            infowindow.open(map, this);
            $(".route").css("display", "block");
            $(".map").css("display", "block");
            $(".map").on("click", function () {
                window.open("https://www.google.com/maps/dir/?api=1&origin=QVB&origin_place_id=" + currentLocationID + "&destination=QVB&destination_place_id=" + place.place_id + "&travelmode=walking");
            });
            $(".route").on("click", function () {
                console.log(place);
                console.log(place.vicinity);
                console.log(currentLocation);
                calculateAndDisplayRoute(directionsService, directionsRenderer, currentLocation, place.vicinity);
            });

            google.maps.event.addListener(infowindow, 'closeclick', function () {
                $(".route").css("display", "none");
                $(".map").css("display", "none");
            });
        });
    }



    // function calculateAndDisplayRoute(directionsService, directionsRenderer, start, end) {
    //     // var start = document.getElementById('start').value;
    //     // var end = document.getElementById('end').value;
    //     directionsService.route({
    //         origin: start,
    //         destination: end,
    //         travelMode: 'DRIVING'
    //     }, function (response, status) {
    //         if (status === 'OK') {
    //             directionsRenderer.setDirections(response);
    //         } else {
    //             window.alert('Directions request failed due to ' + status);
    //         }
    //     });
    // }

});

