
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
      url : '/public/assets/userloc.svg',
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
  $('#detailsTabBtn').click(function(){
    $('.mapContainer').css('display', 'none');
    $('.detailsContainer').css('display', 'flex');
    $('.activeHapNavBtn').removeClass('activeHapNavBtn');
    $(this).addClass('activeHapNavBtn');
  })

  $('.hapDetailsBtn').click(function() {
    $('.mapContainer').css('display', 'none');
    $('.hapScreenContainer').css('display', 'flex');
    $('.hapMapBtn').css('display', 'block');
    $('.hapDetailsBtn').css('display', 'none');
  });

  if(hap.organizerId == curUser._id){
    $('#hapSettingsBtn').css('display', 'block');
    $('#hapJoinBtn').css('display', 'none');
    $('#hapLeaveBtn').css('display', 'none');
  }else if(hap.attendees.includes(curUser._id)){
    $('#hapLeaveBtn').css('display', 'block');
    $('#hapJoinBtn').css('display', 'none');
  }else{
    $('#hapJoinBtn').css('display', 'block');
    $('#hapLeaveBtn').css('display', 'none');
  }

  $('#hapJoinBtn').click(function(){
    let hapId = $('#hapId').text();
    socket.emit('Join Hap', {hapId : hapId, userId : curUser._id});
    $('#hapJoinBtn').css('display', 'none');
    $('#hapLeaveBtn').css('display', 'block');
  });

  $('#hapLeaveBtn').click(function(){
    let hapId = $('#hapId').text();
    socket.emit('Leave Hap', {hapId : hapId, userId : curUser._id});
    $('#hapLeaveBtn').css('display', 'none');
    $('#hapJoinBtn').css('display', 'block');
  })

  //Someone joined a hap
  socket.on('Join Hap', (d) => {
    if(hap.id = d.hapId){
      $('.hapAttendeeCount').text(d.attendeeCount);
    }
  });
  //Someone left a hap
  socket.on('Leave Hap', (d) => {
    if(hap.id = d.hapId){
      $('.hapAttendeeCount').text(d.attendeeCount);
    }
  });

//==================Map======================
  $('#mapTabBtn').click(function() {
    $('.mapContainer').css('display', 'flex');
    $('.detailsContainer').css('display', 'none');
    $('.activeHapNavBtn').removeClass('activeHapNavBtn');
    $(this).addClass('activeHapNavBtn');
  })

//==================Site Links===============
  $('.brand-logo').click(function() {
    window.location = '/';
  })

})
