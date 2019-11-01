// var script1 = document.createElement('script');
// script1.src = "https://maps.googleapis.com/maps/api/js?libraries=places&callback=initAutocomplete&key=" + api_key;
$(document).ready(function () {
    function initAutocomplete() {
        autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('location_open,location_close'), { types: ['geocode'] });

        autocomplete.setFields(['address_component']);
    }
});

