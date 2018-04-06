
//====================GOOGLE MAPS=========================
let newHapLocInput;
let Map;
let hapMarkers = [];
let userLoc;

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

  //===============GET USER LOCATION===============
  $.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBDPiZQRAopncSA6oAdW6bZQ5AufZNPVz0', (data) => {
    userLoc = data.location;
    showMap(data.location);
    loadHapsFromPos(data.location);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        userLoc = pos;
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
    newRequestClone.find('#hapAttendeeCount').text(hap.attendeeCount);
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

  function getDistanceToHap(lat1,lon1,lat2,lon2) {
    function deg2rad(deg){
      return deg * (Math.PI / 180);
    }
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    d = d * 0.621371;
    return Math.round(d * 10) / 10;
  }

  //SHOW HAP SCREEN WHEN CLICKED
  $('.requestBasicInfo').click(function() {
    if(!curUser){
      $('.signupContainer').css('display', 'flex');
      $('.signupForm').css('display', 'flex');
    }else{
      let hapId = $(this).find('#hapId').text();
      $.get('/events/'+hapId, (hap) => {
        $('.mainHapTitle').text(hap.name);
        $('.mainHapOrganizer').text(hap.organizer);
        $('.mainHapAttendeeCount').text(hap.attendeeCount);
        $('.mainHapDescription').text(hap.description);
        $('.mainHapDate').text(hap.dateFormatted);
        $('.mainHapAddress').text(hap.address);
        $('#mainHapId').text(hap._id);
        if(hap.attendees.includes(curUser._id)){
          $('#mainHapLeaveBtn').css('display', 'block');
          $('#mainHapJoinBtn').css('display', 'none');
        }else{
          $('#mainHapJoinBtn').css('display', 'block');
          $('#mainHapLeaveBtn').css('display', 'none');
        }
        $('.hapScreenContainer').css('display', 'flex');
      });
    }
  });

  $('#joinHapBtn').click(function() {
    if(!curUser){
      $('.signupContainer').css('display', 'flex');
      $('.signupForm').css('display', 'flex');
    }else{
      let hapId = $(this).siblings('.requestBasicInfo').find('#hapId').text();
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
  });


//==================MAIN HAP SCREEN=====================
  $('#hapScreenCloseBtn').click(function(){
    $('.hapScreenContainer').css('display', 'none');
  });

  $('#mainHapJoinBtn').click(function(){
    let hapId = $(this).siblings('#mainHapId').text();
    socket.emit('Join Hap', {hapId : hapId, userId : curUser._id});
  });

  $('#mainHapLeaveBtn').click(function(){
    let hapId = $(this).siblings('#mainHapId').text();
    socket.emit('Leave Hap', {hapId : hapId, userId : curUser._id});
  })


//==================SOCKETS HANDLERS===================
  socket.on('New Hap', (d) => {
    //If nearby
    hapDistance = getDistanceToHap(d.hap.lat, d.hap.lng, userLoc.lat, userLoc.lng);
    if(hapDistance < 10) {
      addNewHap(d.hap);
    }
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
