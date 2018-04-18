
//====================GOOGLE MAPS=========================
let newHapLocInput;
let Map;
let hapMarkers = [];
let userLocMarker;
let userLoc;

initAutoComplete = () => {
  newHapLocInput = new google.maps.places.Autocomplete(document.getElementById('newHapLoc'));

  showMap = (pos) => {
    $('#mapLoading').css('display', 'none');
    $('#map').css('display' , 'block');
    Map = new google.maps.Map(document.getElementById('map'), {
      center : pos,
      zoom: 15,
      styles : mapStyles
    });
  }

  showUserPos = (pos) => {
    if(userLocMarker){
      userLocMarker.setMap(null);
      userLocMarker = null;
    }
    let markerImage = {
      url : './public/assets/userLoc.svg',
    }
    Map.setCenter(pos);
    let userLocation = new google.maps.Marker({
      position : pos,
      map : Map,
      icon : markerImage
    });
    userLocMarker = userLocation;
  }

  clearHapMarkers = () => {
    hapMarkers.forEach((hapMarker) => {
      hapMarker.setMap(null);
    })
    hapMarkers.length = 0;
    $('.hap').remove();
  }

//==============LOAD ALL HAPS===================
  //Get time from hap date to now
  function getTimeFromHap(hapDate){
    return moment(hapDate).toNow(true);
  }

  loadHapsFromPos = (pos) => {
    $.post('near_haps', {userLoc : [pos.lng, pos.lat]}, (d) => {
      d.haps.forEach((hap) => {
        hapTime = getTimeFromHap(hap.date);
        addNewHap(hap, d.hapDistances[hap._id], hapTime);
      })
    })
  }

  //===============GET USER LOCATION===============
  $.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBDPiZQRAopncSA6oAdW6bZQ5AufZNPVz0', (data) => {
    userLoc = data.location;
    showMap(data.location);
    showUserPos(data.location);
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
  //Have socket connect to attending haps
  if(curUser){
    if(curUser.attending){
      socket.emit('Connect To Haps', {
        userId : curUser._id,
        hapIds : curUser.attending
      })
    }
  }

//==========================NEW REQUESTS=========================
  addNewHap = (hap, distance, time) => {
    //ADD HAP TO REQUEST CONTAINER
    let newHapClone = $('.hap-prototype').clone(true, true);
    newHapClone.addClass('hap').removeClass('hap-prototype');
    newHapClone.attr('id', hap._id);
    newHapClone.find('#hapTitle').text(hap.name);
    newHapClone.find('#hapOwner').text(hap.organizer);
    newHapClone.find('#hapDistance').text(distance + " miles away");
    newHapClone.find('#hapTime').text("In " + time);
    newHapClone.find('#hapAttendeeCount').text(hap.attendeeCount);
    newHapClone.find('#hapId').text(hap._id);
    newHapClone.find('#hapPos').text(JSON.stringify({lat : hap.lat, lng : hap.lng}));
    newHapClone.appendTo('.hapsContainer');
    //ADD HAP TO MAP
    let newHapLocation = new google.maps.Marker({
      position : {
        lat : hap.lat,
        lng : hap.lng,
      },
      map : Map,
      icon : {url : '/public/assets/icons/hapIcon.svg'}
    });
    let newHapInfoWindow = new google.maps.InfoWindow({
      content : hap.name
    });
    newHapLocation.addListener('mouseover', (e) => {
      newHapInfoWindow.open(Map, newHapLocation);
      newHapLocation.setIcon({url : '/public/assets/icons/hapIconHover.svg'})
    });
    newHapLocation.addListener('mouseout', (e) => {
      newHapInfoWindow.close();
      newHapLocation.setIcon({url : '/public/assets/icons/hapIcon.svg'})
    })
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
  $('.hapBasicInfo').click(function() {
    if(!curUser){
      $('.signupContainer').css('display', 'flex');
      $('.signupForm').css('display', 'flex');
    }else{
      let hapId = $(this).siblings('#hapId').text();
      window.location = '/hap/'+hapId+'/dashboard';
      // let hapId = $(this).siblings('#hapId').text();
      // $.get('/events/'+hapId, (hap) => {
      //   $('.mainHapTitle').text(hap.name);
      //   $('.mainHapOrganizer').text(hap.organizer);
      //   $('.mainHapAttendeeCount').text(hap.attendeeCount);
      //   $('.mainHapDescription').text(hap.description);
      //   $('.mainHapDate').text(hap.dateFormatted);
      //   $('.mainHapAddress').text(hap.address);
      //   $('#mainHapId').text(hap._id);
      //   if(hap.organizerId == curUser._id){
      //     $('#mainHapSettingsBtn').css('display', 'block');
      //     $('#mainHapJoinBtn').css('display', 'none');
      //     $('#mainHapLeaveBtn').css('display', 'none');
      //   }else if(hap.attendees.includes(curUser._id)){
      //     $('#mainHapLeaveBtn').css('display', 'block');
      //     $('#mainHapJoinBtn').css('display', 'none');
      //   }else{
      //     $('#mainHapJoinBtn').css('display', 'block');
      //     $('#mainHapLeaveBtn').css('display', 'none');
      //   }
      //   $('.hapScreenContainer').css('display', 'flex');
      // });
    }
  });

  $('#findHapBtn').click(function() {
    let hapPos = JSON.parse($(this).siblings('#hapPos').text());
    Map.panTo(hapPos);
  })


//==========================MAP INTERACTIVITY=====================




//========================Sign Up Form===========================

  // $('.profileBtn').hover(function(){
  //   $('.logoutBtn').css('display', 'inline-block');
  // }, function(){
  //   $('.logoutBtn').css('display', 'none');
  // })

  //Toggle SignUp Form Display
  $('.signupBtn').click(() => {
    let signupDisplay = $('.signupContainer').css('display');
    $('.signupContainer').css('display', 'flex');
    $('#loginSubmitBtn').css('display', 'none');
    $('#signupSubmitBtn').css('display', 'block');
    $('#signupLabel').text("Sign Up");
    $('.mapForms').css('display', 'flex');
    if(signupDisplay == 'none'){
      $('.signupContainer').animate({
        opacity : 1
      }, 400);
    }else{
      $('.signupContainer').animate({
        opacity : 0
      }, 400, ()=>{
        $('.signupContainer').css('display', 'none');
        $('#signupSubmitBtn').css('display', 'none');
        $('.mapForms').css('display', 'none');
      });
    }
  });
  $('.loginBtn').click(() => {
    let signupDisplay = $('.signupContainer').css('display');
    $('.signupContainer').css('display', 'flex');
    $('#loginSubmitBtn').css('display', 'block');
    $('#signupSubmitBtn').css('display', 'none');
    $('#signupLabel').text("Log In");
    $('.mapForms').css('display', 'flex');
    if(signupDisplay == 'none'){
      $('.signupContainer').animate({
        opacity : 1
      }, 400);
    }else{
      $('.signupContainer').animate({
        opacity : 0
      }, 400, ()=>{
        $('.signupContainer').css('display', 'none');
        $('#loginSubmitBtn').css('display', 'none');
        $('.mapForms').css('display', 'none');
      });
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

  let dateElem = document.querySelector('.datepicker');
  let dateInstance = M.Datepicker.init(dateElem, {format : "mm" + "/" + "dd" + "/" + "yyyy"});
  let timeElem = document.querySelector('.timepicker');
  let timeInstance = M.Timepicker.init(timeElem, {});

  //Toggle New Hap Form Window
  $('.newHapBtn').click(() => {
    let hapFormContainerDisplay = $('.hapFormContainer').css('display');
    $('.hapFormContainer').css('display', 'flex');
    if(hapFormContainerDisplay == 'none'){
      $('.hapFormContainer').animate({
        opacity : 1
      }, 400);
      $('.mapForms').css('display', 'flex');
      $('.hapForm').css('display', 'flex');
    }else{
      $('.hapFormContainer').animate({
        opacity : 0
      }, 400, ()=>{
      $('.hapFormContainer').css('display', 'none');
      $('.mapForms').css('display', 'none');
      $('.hapForm').css('display', 'none');
      });
    }
  });

  //Submit New Hap
  $('#newHapSubmit').click(() => {
    if($('.hapInput').val().length > 0){
      let newHapData = {
        name : $('#newHapTitle').val(),
        description : $('#newHapBody').val(),
        placeId : newHapLocInput.getPlace().place_id,
        lat : newHapLocInput.getPlace().geometry.location.lat(),
        lng : newHapLocInput.getPlace().geometry.location.lng(),
        address : newHapLocInput.getPlace().formatted_address,
        date : $('#newHapDate').val(),
        time : $('#newHapTime').val(),
        dateTime : $('#newHapDate').val() + "T" + $('#newHapTime'),
        organizer : curUser.username,
        organizerId : curUser._id
      };
      $('.hapFormContainer').css('display', 'none');
      $('.hapForm').css('display', 'none');
      socket.emit('New Hap', {hap : newHapData})
    }
  });
  //Close Form
  $('#hapFormCloseBtn').click(() => {
    $('.hapFormContainer').css('display', 'none');
    $('.mapForms').css('display', 'none');
    $('.hapForm').css('display', 'none');
  })
  // //Update Hap Title
  // $('#newHapTitle').keypress((e) => {
  //   if(e.key != 'enter'){
  //     $('.newHapFormLabel').text($('#newHapTitle').val() + e.key);
  //   }
  // })
  // $('#newHapTitle').keydown((e) => {
  //   if(e.key == 'Backspace'){
  //     $('.newHapFormLabel').text($('.newHapFormLabel').text().substr(0,$('.newHapFormLabel').text().length - 1));
  //   }
  // });


//==================MAIN HAP SCREEN=====================
  $('#hapScreenCloseBtn').click(function(){
    $('.hapScreenContainer').css('display', 'none');
  });

  $('#mainHapJoinBtn').click(function(){
    let hapId = $(this).siblings('#mainHapId').text();
    socket.emit('Join Hap', {hapId : hapId, userId : curUser._id});
    $('#mainHapJoinBtn').css('display', 'none');
    $('#mainHapLeaveBtn').css('display', 'block');
  });

  $('#mainHapLeaveBtn').click(function(){
    let hapId = $(this).siblings('#mainHapId').text();
    socket.emit('Leave Hap', {hapId : hapId, userId : curUser._id});
    $('#mainHapLeaveBtn').css('display', 'none');
    $('#mainHapJoinBtn').css('display', 'block');
  })


//==================SOCKETS HANDLERS===================
//Get time from hap date to now
  function getTimeFromHap(hapDate){
    return moment(hapDate).toNow(true);
  }

  //Someone made a new hap
  socket.on('New Hap', (d) => {
    //If nearby
    hapDistance = getDistanceToHap(d.hap.lat, d.hap.lng, userLoc.lat, userLoc.lng);
    hapTime = getTimeFromHap(d.hap.date);
    if(hapDistance < 10) {
      addNewHap(d.hap, hapDistance, hapTime);
    }
  });
  //Someone joined a hap
  socket.on('Join Hap', (d) => {
    $('#'+d.hapId).find('#hapAttendeeCount').text(d.attendeeCount);
    if($('.hapScreenContainer').find('#mainHapId').text() == d.hapId){
      $('.hapScreenContainer').find('.mainHapAttendeeCount').text(d.attendeeCount);
    }
  });
  //Someone left a hap
  socket.on('Leave Hap', (d) => {
    $('#'+d.hapId).find('#hapAttendeeCount').text(d.attendeeCount);
    if($('.hapScreenContainer').find('#mainHapId').text() == d.hapId){
      $('.hapScreenContainer').find('.mainHapAttendeeCount').text(d.attendeeCount);
    }
  });

  //Refresh Page
  $('.brand-logo').click(() => {
    location.reload();
  });
  //logout
  $('.profileBtn').click(() => {
    document.cookie = "token" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    location.reload();
  });

})
