const TDkey = "348716-WhatsAro-8WWCXOC7";

$("#search_open,#search_close").on("click", function(event) {
  event.preventDefault();
  // console.log($("#query_open").val);
  // console.log($("#location_open").val);
  if ($("#query_open").val().length>0 && $("#location_open").val().length>0){
  $("#index-banner").css('display','none');
  $("#function-section").css('display','block');
  $("#foot-setion").css('display','none');
  getPlaceDetailViaAddress($("#location_open").val().trim());
  //getResults();
  }else {
    alert("need more parameter"); //need more works
  }
});

function getResults() {
  let search = $("#query_open").val();
  let type = "music"; //change
  let moreInfo = 1;
  console.log(search, type, moreInfo);
  let tasteDiveURL = `http://tastedive.com/api/similar?q=${search}&type=${type}&info=${moreInfo}&limit=10&k=${TDkey}`;
  $.ajax({
    url: tasteDiveURL,
    type: "GET", 
    dataType: "jsonp"
  }).then(function(response) {
    console.log(response);
    populateResults(response);
  });
}

function populateResults(response) {
  $("#results").empty();
  let info = response.Similar.Info[0];
  let results = response.Similar.Results;
  $("#search-span").text('Search: '+info.Name+"    ");
  $("#type-span").text('Type: ' +info.Type);

  for (let i = 0; i < results.length; i++) {
    let li = $("<li class='collection-item'>");
    li.text(`Name: ${results[i].Name}, Type: ${results[i].Type}`);
    li.attr("data-name", results[i].Name);
    $("#results").append(li);
  }
  $(".collection-item").on("click", function() {
    getEvents($(this).attr("data-name"), $(this));
  });
}

/*************************

TICKETMASTER API SECTION 

**************************/

const TMKey = "cNBbi9N6U5RzvrGZpA7IcJX4CIKWyN6G";

function getEvents(name, liEle) {
  let ticketMasterURL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TMKey}&keyword=${name}&city=seattle`;
  console.log(name, ticketMasterURL);
  $.ajax({
    type: "GET",
    url: ticketMasterURL
  }).then(function(response) {
    console.log("tmResponse", response);
    if (response.page.totalElements != 0) {
      populateNearbyEvents(response, name, liEle);
    } else {
      let span = $("<span> ☹️No Event Nearby</span>");
      liEle.append(span);
    }
  });
}

function populateNearbyEvents(response, name, liEle) {
  let event = response._embedded.events[0];
  console.log(name);
  console.log(event);
  console.log(response);
  let coords = event._embedded.venues[0].location;
  getFinalPlaceDetail(parseFloat(coords.latitude),parseFloat(coords.longitude),event._embedded.venues[0].name);
  //createMarker(mycurrLatLng);
  // let spanCoords = $("<span>");
  // spanCoords.text(" " + coords.latitude + " " + coords.longitude);

  // liEle.append(aLink, spanCoords);
}
