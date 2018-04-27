
//====================GOOGLE MAPS=========================
let newHapLocInput;
let Map;
let hapPins = {};
let userLocMarker;
let userLoc;
let socket = io.connect();

initAutoComplete = () => {

  showMap = (pos) => {
    $('#mapLoading').css('display', 'none');
    $('#map').css('display' , 'block');
    Map = new google.maps.Map(document.getElementById('map'), {
      center : {lat : hap.lat, lng: hap.lng},
      zoom: 15,
      styles : mapStyles
    });
    let hapLocmarkerIcon = {
      url : '/public/assets/icons/star_yellow.svg',
    }
    let hapLocMarker = new google.maps.Marker({
      position : {
        lat : hap.lat,
        lng : hap.lng
      },
      map : Map,
      icon : hapLocmarkerIcon
    });
    //Load up all the user pins in hap map
    hap.pins.forEach((hapPin) => {
      let newHapPin = new google.maps.Marker({
        position : hapPin.pos,
        map : Map,
        icon : {url : hapPin.img},
        draggable : true,
        id : hapPin.id
      });
      newHapPin.addListener('dragend', () => {
        socket.emit('Hap Pin Drag', {
          id : newHapPin.id,
          pos : newHapPin.getPosition(),
          hapId : hap._id
        });
      });
      hapPins[hapPin.id] = newHapPin;
      hapPinCount += 1;
    })

  }

  showUserPos = (pos) => {
    if(userLocMarker){
      userLocMarker.setMap(null);
      userLocMarker = null;
    }
    let markerImage = {
      url : '/public/assets/userLoc.svg',
    }
    // Map.setCenter(pos);
    let userLocation = new google.maps.Marker({
      position : pos,
      map : Map,
      icon : markerImage
    });
    userLocMarker = userLocation;
  }

  // clearHapMarkers = () => {
  //   hapPins.forEach((hapMarker) => {
  //     hapMarker.setMap(null);
  //   })
  //   hapPins.length = 0;
  //   $('.hap').remove();
  // }

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
      });
    }
  });
}

let hapPinCount = 0;

$(document).ready(() => {


  //Have socket connect to attending haps
  if(curUser){
    if(curUser.attending){
      socket.emit('Connect To Haps', {
        userId : curUser._id,
        hapIds : [hap._id]
      })
    }
  }

  addNewPerson = (person) => {
    let newPersonClone = $('.personPrototype').clone(true);
    newPersonClone.removeClass('personPrototype');
    newPersonClone.addClass('person');
    newPersonClone.attr('id', person._id);
    newPersonClone.find('.personPic').attr('src', person.picture);
    newPersonClone.find('.personName').text(person.username);
    newPersonClone.appendTo('.personContainer');
  }

  //Load up all the people in hap
  people.forEach((person) => {
    addNewPerson(person);
  });

//==================Details==================
  $('#detailsTabBtn').click(function(){
    $('.mapContainer').css('display', 'none');
    $('.detailsContainer').css('display', 'flex');
    $('.connectContainer').css('display', 'none');
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

//==================Map======================
  $('#mapTabBtn').click(function() {
    $('.mapContainer').css('display', 'flex');
    $('.detailsContainer').css('display', 'none');
    $('.connectContainer').css('display', 'none');
    $('.activeHapNavBtn').removeClass('activeHapNavBtn');
    $(this).addClass('activeHapNavBtn');
  });

//=============HAP MAP PINS============
  $('.mapIcon').click(function(){
    //Icons for Organizer only (AT LEAST FOR NOW)
    // if(hap.organizer == curUser.username){
      let markerImage = {
        url : $(this).find('.mapIconImg').attr('src'),
      }
      // Map.setCenter(pos);
      socket.emit('New Hap Pin', {
        id : hapPinCount,
        pos : Map.getCenter(),
        img : markerImage.url,
        hapId : hap._id
      });
    // }
  })


//==================CONNECT=====================
  $('#connectTabBtn').click(function(){
    $('.connectContainer').css('display', 'flex');
    $('.mapContainer').css('display', 'none');
    $('.detailsContainer').css('display', 'none');
    $('.activeHapNavBtn').removeClass('activeHapNavBtn');
    $(this).addClass('activeHapNavBtn');
  })



//==================Socket Handlers=============
  //Someone joined a hap
  socket.on('Join Hap', (d) => {
    if(hap.id = d.hapId){
      $('.hapAttendeeCount').text(d.attendeeCount);
      addNewPerson(d.newPerson);
    }
  });
  //Someone left a hap
  socket.on('Leave Hap', (d) => {
    if(hap.id = d.hapId){
      $('.hapAttendeeCount').text(d.attendeeCount);
      $('#' + d.personId).remove();
    }
  });
  //Someone Made a New Hap Pin
  socket.on('New Hap Pin', (d) => {
    let newMapIcon = new google.maps.Marker({
      position : d.pos,
      map : Map,
      icon : d.img,
      draggable : true,
      id : d.id
    });
    hapPins[d.id] = newMapIcon;
    hapPinCount += 1;
  });

  socket.on('Hap Pin Drag', (d) => {
    hapPins[d.id].setPosition(d.pos);
  })


//==================Site Links===============
  $('.brand-logo').click(function() {
    window.location = '/';
  })

})
