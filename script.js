$(document).ready(function () {
    var api_key = config.google_api_key;
    var script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?&libraries=places&key=" + api_key;
    document.head.append(script);

    var type;
    var range;

    $("#autocomplete, #type_search, #range").keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            type = $("#type_search").val().trim();
            range = $("#range").val().trim();
            if (range == null || range.length == 0) range = 1500;
            var address = $("#autocomplete").val().trim();
            getPlaceDetailViaAddress(address);
        }
    });

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
                var lattitude = response.results[0].geometry.location.lat;
                var longitude = response.results[0].geometry.location.lng;
                // console.log(lattitude);
                // console.log(longitude);
                //getPlaceDetail(lattitude, longitude);
                initialize(lattitude, longitude);
            });
    }


    var currentLocation;
    var currentLocationID;
    function getPlaceDetail(lat, lon) {
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=" + api_key;
        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function (response) {
                // console.log(response)
                // console.log(response.results[0].formatted_address);
                currentLocationID = response.results[0].place_id;
                currentLocation = response.results[0].formatted_address;
                $('#autocomplete').val(currentLocation);
            });
    }



    $("#geolocation").on('click',geoFindMe);
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

    function initialize(lat, lon) {
        center = new google.maps.LatLng(lat, lon);
        directionsRenderer = new google.maps.DirectionsRenderer;
        directionsService = new google.maps.DirectionsService;
        map = new google.maps.Map(document.getElementById("map"), {
            center: center,
            zoom: 15 //the larger number, the more zoom in
        });

        directionsRenderer.setMap(map);
        directionsRenderer.setPanel(document.getElementById('right-panel'));
        request = {
            location: center,
            radius: range,
            types: [type]
        };
        console.log(request);
        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
    }


    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log(results);
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        } else {
            alert('no result found!!!');
        }
    }

    function createMarker(place) {
        //console.log(place);
        var placeLocation = place.geometry.location;
        marker = new google.maps.Marker({
            map: map,
            position: placeLocation
        });
        google.maps.event.addListener(marker, 'click', function () {
            var content = place.name + "<br>" + "Rating: " + place.rating + "<br>" + "<a href='#' class='route'>Direct Me!!!</a>";
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

});

