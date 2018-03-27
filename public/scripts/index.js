
$(document).ready(() => {

  //=============CONNECT TO SOCKET==============
  let socket = io.connect();


  //==========================NEW REQUESTS=========================
  addNewRequest = (request) => {
    console.log(request);
    let newRequestClone = $('.request-prototype').clone(true);
    newRequestClone.addClass('request').removeClass('request-prototype');
    newRequestClone.find('#requestTitle').text(request.name);
    newRequestClone.find('#requestPayout').text('$'+request.payout);
    newRequestClone.appendTo('.requestsContainer');
  }


//================SITE BUTTONS==============

  //Toggle making a new request
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
  $('#requestFormCloseBtn').click(() => {
    $('.requestFormContainer').css('display', 'none');
    $('.requestForm').css('display', 'none');
  })

  $('#newRequestSubmit').click(() => {
    let newRequestData = {
      name : $('#newRequestTitle').val(),
      description : $('#newRequestBody').val(),
    };
    socket.emit('New Hap', {hap : newRequestData})
  });

  $('.brand').click(() => {
    location.reload();
  });




//==================SOCKETS HANDLERS===================
  socket.on('New Hap', (d) => {
    addNewRequest(d.hap);
  })

})
