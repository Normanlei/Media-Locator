var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function success(pos) {
    var crd = pos.coords;

    console.log(pos);
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    //$("#inp1").val(crd.latitude+":"+crd.longitude);
}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, options);
});
$(document).ready(function () {
    $('select').formSelect();
    // $("#autocomplete").keypress(function (event) {
    //     var keycode = (event.keyCode ? event.keyCode : event.which);
    //     if (keycode == '13') {
    //         var address = $("#autocomplete").val().trim();
    //         getPlaceDetailViaAddress(address);
    //     }
    // });

    // function getPlaceDetailViaAddress(address) {
    //     var addressArr = address.split(" ");
    //     console.log(addressArr);
    //     var add = addressArr[0];
    //     for (var i = 1; i < addressArr.length; i++) {
    //         add += "+" + addressArr[i];
    //     }
    //     console.log(add);
    //     var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + add + "&key=AIzaSyCy_fsa23_HL03eeIZhtAcxDd8RCmVnogo";

    //     $.ajax({
    //         url: queryURL,
    //         method: "GET"
    //     })
    //         .then(function (response) {
    //             console.log(response);
    //         });
    // }


    var currentLocation;
    var currentLocationID;
    function getPlaceDetail(lat, lon) {
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=AIzaSyCy_fsa23_HL03eeIZhtAcxDd8RCmVnogo";
        // var queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lat + "," + lon + "&rankby=distance&rankby=distance&key=AIzaSyCy_fsa23_HL03eeIZhtAcxDd8RCmVnogo";
        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function (response) {
                console.log(response)
                console.log(response.results[0].formatted_address);
                currentLocationID = response.results[0].place_id;
                currentLocation = response.results[0].formatted_address;
            });
    }



    geoFindMe();
    function geoFindMe() {
        function success(position) {
            console.log(position);
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            getPlaceDetail(latitude, longitude);
            initialize(latitude, longitude);
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
        center = new google.maps.LatLng(47.6, -122.33);
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
            radius: 1600,
            types: ['parking']
        };
        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
    }


    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
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
                window.location.replace("https://www.google.com/maps/dir/?api=1&origin=QVB&origin_place_id=" + currentLocationID + "&destination=QVB&destination_place_id=" + place.place_id + "&travelmode=walking");
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

    // function getPlaceType(id){
    //     console.log(id);
    //     var queryURL = "https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4&fields=name,rating,formatted_phone_number&key=AIzaSyCy_fsa23_HL03eeIZhtAcxDd8RCmVnogo";

    // $.ajax({
    //     url: queryURL,
    //     // dataType: "jsonp",
    //     // crossDomain: true,
    //     // cache: false,
    //     method: "GET",
    //     // error: function(response){console.log(response);}
    // }) 
    //     .then(function (response) {
    //         console.log(response);
    //     });
    // }
// testing();
    // function testing() {
    //     var queryURL = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=123+main+street&location=42.3675294,-71.186966&radius=10000&key=AIzaSyCy_fsa23_HL03eeIZhtAcxDd8RCmVnogo";
    //     $.ajax({
    //         url: queryURL,
    //         type:'POST',
    //         dataType: 'json',
    //         method: "GET"
    //     })
    //         .then(function (response) {
    //             console.log(response);
    //         });
    // }
