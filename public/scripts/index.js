
$(document).ready(() => {

  //=====CONNECT TO SOCKET=======
  let socket = io.connect();





//=======BUTTONS=======

  $('.newRequestBtn').click(() => {
    // $('.mapContainer').css('display', 'none');
    $('.requestFormContainer').css('display', 'flex');
    $('.requestForm').css('display', 'flex');
  });

  $('#newRequestSubmit').click(() => {
    let newRequestData = {
      name : $('#newRequestTitle').val(),
      description : $('#newRequestBody').val(),
      payout : $('#newRequestPay').val(),
    };
    socket.emit('New Hap', {hap : newRequestData})
  });

  //Update Near Requests
  addNewRequest = (request) => {
    console.log(request);
    let newRequestClone = $('.request-prototype').clone(true);
    newRequestClone.addClass('request').removeClass('request-prototype');
    newRequestClone.find('#requestTitle').text(request.name);
    newRequestClone.find('#requestPayout').text('$'+request.payout);
    newRequestClone.appendTo('.requestsContainer');
  }

  //Socket Handlers
  socket.on('New Hap', (d) => {
    addNewRequest(d.hap);
  })

})
