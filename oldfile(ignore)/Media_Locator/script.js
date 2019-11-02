    var api_key = config.google_api_key;
    var script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?&libraries=places&key=" + api_key;
    document.head.append(script);

    var currentLocationID;
    var currentLocation;
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
                currentLocation = response.results[0].formatted_address;
                currentLocationID = id;
                initialize(lat,lon);
            });
    }


    function initialize(lat, lon) {
        console.log(currentLocationID);
        mycurrLatLng = {lat: lat, lng: lon};
        center = new google.maps.LatLng(lat, lon);
        directionsRenderer = new google.maps.DirectionsRenderer;
        directionsService = new google.maps.DirectionsService;
        map = new google.maps.Map(document.getElementById("map"), {
            center: center,
            zoom: 10 //the larger number, the more zoom in
        });
        directionsRenderer.setMap(map);
        directionsRenderer.setPanel(document.getElementById('right-panel'));
        infowindow = new google.maps.InfoWindow();
        createCurrLocationMarker(mycurrLatLng);
    }

    function createCurrLocationMarker(latLng) {
        marker = new google.maps.Marker({
            map: map,
            position: latLng,
            title: 'Your Location!!!',
            icon: {                             
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"                          }
        });
    }

    function getFinalPlaceDetail(lat, lon, name) {
        finalLocationName = name;
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=" + api_key;
        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function (response) {
                console.log(response);
                var lat = response.results[0].geometry.location.lat;
                var lon = response.results[0].geometry.location.lng;
                var latLng = {lat:lat,lng:lon};
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
        google.maps.event.addListener(marker, 'click', function () {
            var content ="Name: "+finalLocationName;
            infowindow.setContent(content);
            infowindow.open(map, this);
            $(".route").css("display", "block");
            $(".map").css("display", "block");
            $(".map").on("click", function () {
                window.open("https://www.google.com/maps/dir/?api=1&origin=QVB&origin_place_id=" + currentLocationID + "&destination=QVB&destination_place_id=" + finalLocationID + "&travelmode=walking");
            });
            $(".route").on("click", function () {
                calculateAndDisplayRoute(directionsService, directionsRenderer, currentLocation, finalLocationAddress);
            });

            google.maps.event.addListener(infowindow, 'closeclick', function () {
                $(".route").css("display", "none");
                $(".map").css("display", "none");
            });
        });
    }



    function calculateAndDisplayRoute(directionsService, directionsRenderer, start, end) {
        // var start = document.getElementById('start').value;
        // var end = document.getElementById('end').value;
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

