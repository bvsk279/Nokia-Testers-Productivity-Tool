$('.popup-body .nav-elm').on('click', function(){
    $('.popup-body .nav-elm').removeClass('active')
    $(this).addClass('active')
    var triggerElm = $(this).attr('for')
    $('.main-navbar-content .navbar-content').hide()
    $("#"+triggerElm).show()

    // $("#"+triggerElm+" .menu-content .menu-content-body").hide()
    // $("#"+triggerElm+" .menu-content .menu-content-body").eq(0).show()
})

$('.navbar-content .menu-item').on("click", function(){
    $(this).parent().parent().find('.menu-item').removeClass('active')
    $(this).addClass('active')
})

$('#settings .menu-list-container .menu-item').on("click", function(){
    var targetId = $(this).attr('for');
    $('#settings .menu-content .menu-content-body').hide();
    $('#'+targetId).show()
})
$('#dev-info .menu-list-container .menu-item').on("click", function(){
    var targetId = $(this).attr('for');
    $('#dev-info .menu-content .menu-content-body').hide();
    $('#'+targetId).show()
})



$(".form input").on("keypress change", function(){
    //alert("Change Detected")
    var inputName = $(this).attr("name")
    var inputValue = ($(this).attr('type') == "text") ? $(this).val() : $(this).prop('checked') ? true : false;

    chrome.storage.sync.get(["nokiaUserSettings"], function(data){
        const settings = JSON.parse(data.nokiaUserSettings);
        switch(inputName){
            case 'userName':
            case 'competenceArea':
                if(settings.hasOwnProperty('userData')){
                    settings.userData[inputName] = inputValue
                }else{
                    settings.userData = {}
                }
                break;
            case 'tenMinuteWarning':
            case 'thirtyMinuteWarning':
            case 'oneHourWarning':
                //console.log(inputName +": "+ inputValue)
                if(settings.hasOwnProperty('uteCloud')){
                    if(settings.uteCloud.hasOwnProperty('warnings')){
                        settings.uteCloud.warnings[inputName] = inputValue
                    }else settings.uteCloud.warnings = {}
                }else settings.uteCloud = {"warnings": {}}
                // console.log(settings)
                break;
        }
        chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(settings) }, function(){});
    });
})


//Loading the data to popup page
$( document ).ready(function() {
    chrome.storage.sync.get(["nokiaUserSettings"], function(data){
        if(data.nokiaUserSettings){
            const settings = JSON.parse(data.nokiaUserSettings);
            
            //Settings User data
            if(settings.hasOwnProperty('userData')){
                const inputIds = ['userName', 'competenceArea']
                for(var i in inputIds){
                    if(settings.userData.hasOwnProperty(inputIds[i]))
                        $('#'+inputIds[i]).val(settings.userData[inputIds[i]])
                }
            }

            //Settings Warnings
            if(settings.hasOwnProperty('uteCloud') && settings.uteCloud.hasOwnProperty('warnings')){
                
                const warningInputs = ['tenMinuteWarning', 'thirtyMinuteWarning', 'oneHourWarning'];
                for(var i in warningInputs){
                    if(settings.uteCloud.warnings.hasOwnProperty(warningInputs[i])){
                        $('#'+warningInputs[i]).prop("checked", settings.uteCloud.warnings[warningInputs[i]])
                    }
                }
            }
        }

    });
});

const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

//Reporting Bug
$('#report-bug-submit-btn').on('click', function(){
    var name = $('#name').val();
    var email = $('#email').val();
    var message = $('#bug-detail').val();
    const url = "https://www.zopamo.com/nokia-testers-tool-bug-report"+"?name="+name+"&email="+email+"&message="+message
    console.log(url)
    if(name && email && message){
        if(validateEmail(email)){
            $.get(url, function() {
                //alert("You bug report is successful, Thankyou. If needed, the dev might get back to you on it");
            })
            .done(function() {

            })
            .fail(function() {
                alert("Something went wrong. Please try to contact Dev via Email");
            })
            // $.ajax({
            //     type: 'POST',
            //     url: "https://www.zopamo.com/nokia-testers-tool-bug-report",
            //     data: {"name": name, "email": email, "message": message},
            //     success: function(resultData) { console.log(resultData)/*alert("You bug report is successful, Thankyou. If needed, the dev might get back to you on it")*/ }
            // });
        }else alert('Please enter a valid email')
    }else alert("Please provide valid details to report a bug")
})






// https://www.zopamo.com/nokia-testers-tool-bug-report?bug-detail={%22ct%22:%22y5DbyFPoVQHZtyGBO6DCvN5QdfNExVwZDNhFWJK6Mk/gz0e/ta9njZGXYengW50v%22,%22iv%22:%22a359ac8fe127c839efe2b34d60c85d41%22,%22s%22:%2207a4fa4662adf741%22}
// https://www.zopamo.com/nokia-testers-tool-bug-report?bug-detail={%22ct%22:%22ISa7Hja+jxIDx+iXcaTnRlNRePc1yasAP20WW2Vz+6h/fwQN6VV+OvwUmeVTzc+q%22,%22iv%22:%22f9eea6ca3342e04fde5e088e83cb3218%22,%22s%22:%22977ab22e383010b4%22}