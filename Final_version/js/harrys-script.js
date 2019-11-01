const TDkey = "348716-WhatsAro-8WWCXOC7";
let recommends;

$("#search_open,#search_close").on("click", function(event) {
  event.preventDefault();
  // console.log($("#query_open").val);
  // console.log($("#location_open").val);
  if (
    $("#query_open").val().length > 0 &&
    $("#location_open").val().length > 0
  ) {
    $("#index-banner").css("display", "none");
    $("#function-section").css("display", "block");
    $("#foot-setion").css("display", "none");
    getPlaceDetailViaAddress(
      $("#location_open")
        .val()
        .trim()
    );
    getResults();
  } else {
    alert("need more parameter"); //need more works
  }
});

function getResults() {
  let search = $("#query_open").val();
  let moreInfo = 1;
  recommends = [];
  console.log(search, type, moreInfo);
  let tasteDiveURL = `http://tastedive.com/api/similar?q=${search}&info=${moreInfo}&limit=20&k=${TDkey}`;
  $.ajax({
    url: tasteDiveURL,
    type: "GET",
    dataType: "jsonp"
  }).then(function(response) {
    populateResults(response);
  });
}

function populateResults(response) {
  $("#results").empty();
  if (response.Similar.Results.length > 0) {
    let info = response.Similar.Info[0];
    let results = response.Similar.Results;
    let searchedItem = $("<li class='collection-item'>");
    searchedItem.text(`Name: ${info.Name}, Type: ${info.Type}`);
    searchedItem.attr("data-name", info.Name);
    recommends.push(info.Name);
    $("#results").append(searchedItem);

    for (let i = 0; i < results.length; i++) {
      let li = $("<li class='collection-item'>");
      li.text(`Name: ${results[i].Name}, Type: ${results[i].Type}`);
      li.attr("data-name", results[i].Name);
      $("#results").append(li);
      recommends.push(results[i].Name);
    }
  } else {
    let li = $("<li class='list-group-item td-item'>").text("No Results");
    $("#results").append(li);
  }
  initGetEvents();
}

/*************************

TICKETMASTER API SECTION 

**************************/

const TMKey = "cNBbi9N6U5RzvrGZpA7IcJX4CIKWyN6G";

// Initializes the ticketmaster event finder and limits the API calls.
function initGetEvents() {
  function delay(interval) {
    return new Promise(resolve => setTimeout(resolve, interval));
  }
  async function limitApiCalls() {
    for (let i = 0; i < recommends.length; i++) {
      await delay(225);
      getEvents(recommends[i], $('li[data-name="' + recommends[i] + '"]'));
    }
  }
  limitApiCalls();
}

function getEvents(name, liEle) {
  let ticketMasterURL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TMKey}&keyword=${name}&city=seattle`;
  // &radius=50&unit=miles&latlong={YOURCOORDS}&size=40&classificationName=[Music, Arts & Theatre]
  // {YOURCOORDS} is latitude,longitude (ex. -132.01,23.22) NO BRACKETS
  // REMOVE &city=seattle if using latlong
  $.ajax({
    type: "GET",
    url: ticketMasterURL,
    dataType: "json"
  }).then(function(response) {
    if (response.page.totalElements != 0) {
      populateNearbyEvents(response, name, liEle);
    } else {
      let span = $("<span> ☹️No Event Nearby</span>");
      liEle.append(span);
    }
  });
}

function populateNearbyEvents(response, name) {
  let event = response._embedded.events[0];
  console.log(name);
  console.log(event);
  console.log(response);
  let coords = event._embedded.venues[0].location;
  getFinalPlaceDetail(
    parseFloat(coords.latitude),
    parseFloat(coords.longitude),
    event._embedded.venues[0].name
  );
  //createMarker(mycurrLatLng);
  // let spanCoords = $("<span>");
  // spanCoords.text(" " + coords.latitude + " " + coords.longitude);

  // liEle.append(aLink, spanCoords);
}
