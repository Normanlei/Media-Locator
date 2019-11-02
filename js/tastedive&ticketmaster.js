const TDkey = "348716-WhatsAro-8WWCXOC7";
let recommends;
let radius;

$("#search_open,#search_close,#search_openopen").on("click", function (event) {
  event.preventDefault();
  if (
    $("#query_open").val().length > 0 &&
    $("#location_open").val().length > 0
  ) {
    radius = $('#range_open').val();
    $("#error-alert").css('display','none');
    $("#index-banner").css("display", "none");
    $("#function-section").css("display", "block");
    $("#footer-setion").css("display", "none");
    getPlaceDetailViaAddress($("#location_open").val());
  } else {
    $("#error-alert").css('display','block');
  }
});

function getResults() {
  let search = $("#query_open").val();
  let moreInfo = 1;
  recommends = [];
  let tasteDiveURL = `https://tastedive.com/api/similar?q=${search}&info=${moreInfo}&limit=20&k=${TDkey}`;
  $.ajax({
    url: tasteDiveURL,
    type: "GET",
    dataType: "jsonp"
  }).then(function (response) {
    populateResults(response);
  });
}

function populateResults(response) {
  $("#results").empty();
  if (response.Similar.Results.length > 0) {
    let info = response.Similar.Info[0];
    let results = response.Similar.Results;
    let searchedItem = $("<li class='collection-item'>");
    searchedItem.html("Name: <b>"+info.Name+"</b>, Type: <b>"+info.Type+"</b>");
    searchedItem.attr("data-name", info.Name);
    recommends.push(info.Name);
    $("#results").append(searchedItem);

    for (let i = 0; i < results.length; i++) {
      let li = $("<li class='collection-item'>");
      li.html("Name: <b>"+results[i].Name+"</b>, Type: <b>"+results[i].Type+"</b>");
      li.attr("data-name", results[i].Name);
      $("#results").append(li);
      recommends.push(results[i].Name);
    }
  } else {
    let li = $("<li class='collection-item'>").text("☹️No Relative Result");
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
  let ticketMasterURL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TMKey}&keyword=${name}&radius=${radius}&unit=miles&latlong=${currentLat + "," + currentLon}`;
  $.ajax({
    type: "GET",
    url: ticketMasterURL,
    dataType: "json",
    success: function (response) {
      if (response.page.totalElements != 0) {
        populateNearbyEvents(response, name, liEle);
      } 
      // else {
      //   let span = $("<span> ☹️No Event Nearby</span>");
      //   liEle.append(span);
      // }
    }
  });
}

function populateNearbyEvents(response, name, liEle) {
  let ticketmasterLink = response._embedded.events[0].url;
  let span = $("<a href='"+ticketmasterLink+"'  target='_blank' class='btn-floating btn-small cyan pulse'><i class='material-icons event'>event</i></a>");
  liEle.append("        ");
  liEle.append(span);
  let event = response._embedded.events[0];
  let coords = event._embedded.venues[0].location;
  getFinalPlaceDetail(
    parseFloat(coords.latitude),
    parseFloat(coords.longitude),
    event._embedded.venues[0].name,event.name,event.dates.start.localDate
  );
}



