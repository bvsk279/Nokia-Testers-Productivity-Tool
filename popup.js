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
    console.log($(this).prop('checked'))
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
                console.log(settings)
                break;
        }
        chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(settings) }, function(){
            //alert("saved successfully")
            //console.log(settings)
        });
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