$('.popup-body .nav-elm').on('click', function(){
    $('.popup-body .nav-elm').removeClass('active')
    $(this).addClass('active')
    var triggerElm = $(this).attr('for')
    $('.main-navbar-content .navbar-content').hide()
    $("#"+triggerElm).show()
})

// $('#settings .menu-item').on("click", function(){
//     $('#settings .menu-item').removeClass('active')
//     $(this).addClass('active')
// })

// $('#dev-info .menu-item').on("click", function(){
//     $('#dev-info .menu-item').removeClass('active')
//     $(this).addClass('active')
// })

// $('#settings .menu-list-container .menu-item').on("click", function(){
//     var targetId = $(this).attr('for');
//     $('#settings .menu-content .menu-content-body').hide();
//     $('#'+targetId).show()
// })
// $('#dev-info .menu-list-container .menu-item').on("click", function(){
//     var targetId = $(this).attr('for');
//     $('#dev-info .menu-content .menu-content-body').hide();
//     $('#'+targetId).show()
// })


$('.navbar-content .menu-item').on("click", function(){
    $(this).parent().parent().find('.menu-item').removeClass('active')
    $(this).addClass('active')
})

$('.navbar-content .menu-list-container .menu-item').on("click", function(){
    var targetId = $(this).attr('for');
    $(this).parent().parent().find('.menu-content-body').hide();
    $('#'+targetId).show()
})