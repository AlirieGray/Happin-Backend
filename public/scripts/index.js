
//====================GOOGLE MAPS=========================
let newHapLocInput;
let Map;
let hapMarkers = [];

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

  clearHapMarkers = () => {
    hapMarkers.forEach((hapMarker) => {
      hapMarker.setMap(null);
    })
    hapMarkers.length = 0;
    $('.request').remove();
  }

  //==============LOAD ALL HAPS===================
  loadHapsFromPos = (pos) => {
    $.post('near_events', {userLoc : [pos.lng, pos.lat]}, (haps) => {
      haps.forEach((hap, i, hapArray) => {
        // Last Hap Loaded
        if(i == hapArray.length - 1){
          addNewHap(hap, true);
        }
        // Not Last Hap
        else{
          addNewHap(hap);
        }
      })
    })
  }


  $.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBDPiZQRAopncSA6oAdW6bZQ5AufZNPVz0', (data) => {
    showMap(data.location);
    loadHapsFromPos(data.location);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        showUserPos(pos);
        clearHapMarkers();
        loadHapsFromPos(pos);
      });
    }
  });
}

$(document).ready(() => {

//=============CONNECT TO SOCKET==============
  let socket = io.connect();
//==========================NEW REQUESTS=========================
  addNewHap = (hap, last=null) => {
    //ADD HAP TO REQUEST CONTAINER
    let newRequestClone = $('.request-prototype').clone(true, true);
    newRequestClone.addClass('request').removeClass('request-prototype');
    newRequestClone.find('#requestTitle').text(hap.name);
    newRequestClone.find('#requestOwner').text(hap.organizer);
    newRequestClone.find('#requestLoc').text(hap.address);
    newRequestClone.find('#hapId').text(hap._id);
    newRequestClone.appendTo('.requestsContainer');
    if(last){
      newRequestClone.css('border-bottom', '2px solid #05b267');
    }
    //ADD HAP TO MAP
    let newHapLocation = new google.maps.Marker({
      position : {
        lat : hap.lat,
        lng : hap.lng
      },
      map : Map
    });
    hapMarkers.push(newHapLocation);
  }

  $('#joinHapBtn').click(function() {
    if(!curUser){
      console.log("Not signed in");
    }else{
      let hapId = $(this).siblings('#hapId').text();
      socket.emit('Join Hap', {hapId : hapId, userId : curUser._id});
    }
  });

//========================Sign Up Form===========================
  //Toggle SignUp Form Display
  $('.signupBtn').click(() => {
    let signupDisplay = $('.signupContainer').css('display');
    if(signupDisplay == 'none'){
      $('.signupContainer').css('display', 'flex');
      $('.signupForm').css('display', 'flex');
    }else{
      $('.signupContainer').css('display', 'none');
      $('.signupForm').css('display', 'none');
    }
  });
  //Close signup
  $('#signupCloseBtn').click(() => {
    $('.signupContainer').css('display', 'none');
    $('.signupForm').css('display', 'none');
  })
  //SignUp Submit
  $('#signupSubmitBtn').click(() => {
    if($('#signupUsername').val().length > 0 && $('#signupPassword').val().length > 0){
      $.post('/signup', {
        username : $('#signupUsername').val(),
        password : $('#signupPassword').val()
      }, (d) => {
        if(d.err){
          console.log(d.err);
        }else{
          location.reload();
        }
      })
    }
  });
  //Login Submit
  $('#loginSubmitBtn').click(() => {
    if($('#signupUsername').val().length > 0 && $('#signupPassword').val().length > 0){
      $.post('/login', {
        username : $('#signupUsername').val(),
        password : $('#signupPassword').val()
      }, (d) => {
        if(d.err){
          console.log(d.err);
        }else{
          location.reload();
        }
      })
    }
  });

//========================New Hap Form===========================


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

//Submit New Hap
$('#newRequestSubmit').click(() => {
  if($('.requestInput').val().length > 0){
    let newRequestData = {
      name : $('#newRequestTitle').val(),
      description : $('#newRequestBody').val(),
      placeId : newHapLocInput.getPlace().place_id,
      lat : newHapLocInput.getPlace().geometry.location.lat(),
      lng : newHapLocInput.getPlace().geometry.location.lng(),
      address : newHapLocInput.getPlace().formatted_address,
      date : $('#newRequestTime').val(),
      organizer : curUser.username,
      organizerId : curUser._id
    };
    $('.requestFormContainer').css('display', 'none');
    $('.requestForm').css('display', 'none');
    socket.emit('New Hap', {hap : newRequestData})
  }
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
  });


  //Refresh Page
  $('.brand').click(() => {
    location.reload();
  });
  //logout
  $('.profileBtn').click(() => {
    document.cookie = "token" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    location.reload();
  });

})
