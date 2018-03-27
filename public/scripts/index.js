
//====================GOOGLE MAPS=========================
let newHapLocInput;
let Map;
initAutoComplete = () => {
  newHapLocInput = new google.maps.places.Autocomplete(document.getElementById('newRequestLoc'));

  showMap = (pos) => {
    $('#mapLoading').css('display', 'none');
    $('#map').css('display' , 'block');
    Map = new google.maps.Map(document.getElementById('map'), {
      center : pos,
      zoom: 15
    });
  }

  showUserPos = (pos) => {
    Map.setCenter(pos);
    let userLocation = new google.maps.Marker({
      position : pos,
      map : Map
    });
  }

  $.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBDPiZQRAopncSA6oAdW6bZQ5AufZNPVz0', (data) => {
    showMap(data.location);
    //==============LOAD ALL HAPS===================
    $.get('/events', (haps) => {
      haps.forEach((hap) => {
        addNewHap(hap);
      })
    })
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        showUserPos(pos);
      });
    }
  });
}

$(document).ready(() => {

  //=============CONNECT TO SOCKET==============
  let socket = io.connect();

  //==========================NEW REQUESTS=========================
  addNewHap = (hap) => {
    //ADD HAP TO REQUEST CONTAINER
    let newRequestClone = $('.request-prototype').clone(true);
    newRequestClone.addClass('request').removeClass('request-prototype');
    newRequestClone.find('#requestTitle').text(hap.name);
    newRequestClone.find('#requestOwner').text(hap.organizer);
    newRequestClone.find('#requestLoc').text(hap.address);
    newRequestClone.appendTo('.requestsContainer');
    //ADD HAP TO MAP
    let newHapLocation = new google.maps.Marker({
      position : {
        lat : hap.lat,
        lng : hap.lng
      },
      map : Map
    });
  }


//========================SITE BUTTONS===========================


  $('.signupBtn').click(() => {

  });

  //Toggle making a new Hap
  $('.newRequestBtn').click(() => {
    let hapFormContainerDisplay = $('.requestFormContainer').css('display');
    if(hapFormContainerDisplay == 'none'){
      $('.requestFormContainer').css('display', 'flex');
      $('.requestForm').css('display', 'flex');
    }else{
      $('.requestFormContainer').css('display', 'none');
      $('.requestForm').css('display', 'none');
    }
  });

  //Refresh Page
  $('.brand').click(() => {
    location.reload();
  });

//Submit New Hap
$('#newRequestSubmit').click(() => {
  let newRequestData = {
    name : $('#newRequestTitle').val(),
    description : $('#newRequestBody').val(),
    placeId : newHapLocInput.getPlace().place_id,
    lat : newHapLocInput.getPlace().geometry.location.lat(),
    lng : newHapLocInput.getPlace().geometry.location.lng(),
    address : newHapLocInput.getPlace().formatted_address
  };
  $('.requestFormContainer').css('display', 'none');
  $('.requestForm').css('display', 'none');
  socket.emit('New Hap', {hap : newRequestData})
});
//Close Form
$('#requestFormCloseBtn').click(() => {
  $('.requestFormContainer').css('display', 'none');
  $('.requestForm').css('display', 'none');
})
//Update Hap Title
$('#newRequestTitle').keypress((e) => {
  if(e.key != 'enter'){
    $('.newRequestLabel').text($('#newRequestTitle').val() + e.key);
  }
})
$('#newRequestTitle').keydown((e) => {
  if(e.key == 'Backspace'){
    $('.newRequestLabel').text($('.newRequestLabel').text().substr(0,$('.newRequestLabel').text().length - 1));
  }
})


//==================SOCKETS HANDLERS===================
  socket.on('New Hap', (d) => {
    addNewHap(d.hap);
  })

})
