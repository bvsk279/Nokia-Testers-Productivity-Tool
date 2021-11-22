$( document ).ready(function() {
    chrome.storage.sync.get(["nokiaUserSettings"], function(data){
        const nokiaUserSettings = JSON.parse(data.nokiaUserSettings);
        const userName = nokiaUserSettings.userName;
        const competenceArea = nokiaUserSettings.competenceArea;
        if(typeof userName != undefined){
            $('#user-settings input[name=userName]').val(userName);
        }
        if(typeof competenceArea != undefined){
            $('#user-settings input[name=competenceArea]').val(competenceArea);
        }
    });
});


$('#user-settings-btn').click(function (){
    if($('#user-settings').is(":visible")){
        $('#user-settings-btn').addClass("btn-active");
        $('#user-settings').hide()
    }else{
        $('#user-settings').show()
    }
})


$('#user-settings-save-btn').click(function(){
    const userName = $('#user-settings input[name=userName]').val()
    const competenceArea = $('#user-settings input[name=competenceArea]').val()
    const userSettings = {userName: userName, competenceArea: competenceArea};
    
    chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(userSettings) }, function(){
        alert("saved successfully")
        console.log("Saved!");
    });
})

$('#user-settings input[name=userName], #user-settings input[name=competenceArea]').keypress(function(){
    $('#user-settings-save-btn').removeAttr("disabled");
    //$('#user-settings-btn').click();
})
