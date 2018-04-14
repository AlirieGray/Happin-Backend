
//====================GOOGLE MAPS=========================
let newHapLocInput;
let Map;
let hapMarkers = [];
let userLocMarker;
let userLoc;

initAutoComplete = () => {

  showMap = (pos) => {
    $('#mapLoading').css('display', 'none');
    $('#map').css('display' , 'block');
    Map = new google.maps.Map(document.getElementById('map'), {
      center : pos,
      zoom: 15
    });
  }

  showUserPos = (pos) => {
    if(userLocMarker){
      userLocMarker.setMap(null);
      userLocMarker = null;
    }
    let markerImage = {
      url : '/public/assets/userloc.png',
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

  //===============GET USER LOCATION===============
  $.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBDPiZQRAopncSA6oAdW6bZQ5AufZNPVz0', (data) => {
    userLoc = data.location;
    showMap(data.location);
    showUserPos(data.location);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        userLoc = pos;
        showUserPos(pos);
        clearHapMarkers();
      });
    }
  });
}


$(document).ready(() => {

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

//==================Details==================
  $('.hapDetailsBtn').click(function() {
    $('.mapContainer').css('display', 'none');
    $('.hapScreenContainer').css('display', 'flex');
    $('.hapMapBtn').css('display', 'block');
    $('.hapDetailsBtn').css('display', 'none');
  });

  if(hap.organizerId == curUser._id){
    $('#mainHapSettingsBtn').css('display', 'block');
    $('#mainHapJoinBtn').css('display', 'none');
    $('#mainHapLeaveBtn').css('display', 'none');
  }else if(hap.attendees.includes(curUser._id)){
    $('#mainHapLeaveBtn').css('display', 'block');
    $('#mainHapJoinBtn').css('display', 'none');
  }else{
    $('#mainHapJoinBtn').css('display', 'block');
    $('#mainHapLeaveBtn').css('display', 'none');
  }

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

  //Someone joined a hap
  socket.on('Join Hap', (d) => {
    if(hap.id = d.hapId){
      $('.mainHapAttendeeCount').text(d.attendeeCount);
    }
  });
  //Someone left a hap
  socket.on('Leave Hap', (d) => {
    if(hap.id = d.hapId){
      $('.mainHapAttendeeCount').text(d.attendeeCount);
    }
  });

//==================Map======================
  $('.hapMapBtn').click(function() {
    $('.mapContainer').css('display', 'flex');
    $('.hapScreenContainer').css('display', 'none');
    $('.hapMapBtn').css('display', 'none');
    $('.hapDetailsBtn').css('display', 'block');
  })

//==================Site Links===============
  $('.brand-logo').click(function() {
    window.location = '/';
  })

})
