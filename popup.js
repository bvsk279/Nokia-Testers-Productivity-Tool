function getDateFormat(timestamp){
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = new Date(timestamp)
    var suffix = date.getHours() >= 12 ? "pm":"am";
    var hours = ((date.getHours() + 11) % 12 + 1)
    var minutes = date.getMinutes()
    var mins = (minutes < 10) ? `0${minutes}` : minutes
    return date.getDate() + " "+ months[date.getMonth()] + ", " + hours + ":"+ mins + " "+suffix;
}

function subDates(datetime){
    var dateFuture = Date.parse(datetime);
    var dateNow = new Date();
    var timeleft = dateNow.getTime() - dateFuture;
    // if(timeleft<=0) return "completed";
    var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
    // var hrs = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return parseInt(days)
    // return days+":"+hrs+":"+mins+":"+secs;
}

window.reportSending = false;

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


$('#view_tl_ext_logs').on("click", function() {
    $('#settings .menu-content .menu-content-body').hide();
    $('#tl-ext-logs').show()
    let output = ""
    chrome.storage.local.get(["ntptTlResData"], function(data){
        if(data.hasOwnProperty('ntptTlResData')){
            const logs = JSON.parse(data.ntptTlResData)
            if(logs.logs){
                logs.logs.forEach(log => {
                    output += `<div class="log-item-container">`
                     output += `
                        <div class="log-head">
                            <div class="row1">
                                <div title='${(log.topology.length > 15) ? log.topology : ''}'>${log.topology.slice(0, 14)}${(log.topology.length > 15) ? `...` : ``}</div>
                                <div>${log.tl_name}</div>
                            </div>
                            <div class="row2">
                                <div>Res Start: <span>${log.booked_time}</span></div>
                                <div title='Delete this log'>${subDates(log.booked_time) > 0 ? `<i class="fa fa-trash log-delete-btn" aria-hidden="true" id='delete-log-${log.res_id}'></i>` : ''}</div>
                            </div>
                        </div>
                        <table>
                            <tr>
                                <th title='Times of Extension' class='slant-text'>&ensp;&ensp;</th>
                                <th title='Extension duration'>Ext dur</th>
                                <th title='Time of Automatic Extension'>Time of ext</th>
                                <th>Ext status</th>
                            </tr>`
                    log.instances.forEach((instance, index) => {
                        const status = instance.status.includes('success') ? `<span class='green-clr' title='${instance.status}'>Success</span>` 
                            : `<span class='red-clr' title='${instance.status}'>Failed</span>` 
                        output += `
                            <tr>
                                <td>&ensp;${index+1}&ensp;</td>
                                <td>${instance.ext_dur}</td>
                                <td>${getDateFormat(parseInt(instance.time))}</td>
                                <td>${status}</td>
                            </tr>
                        `
                    })
                    output += `
                    </table>
                    </div>`
                })
            }else output = "<div style='text-align:center'>No logs yet.</div>"
        }else{
            output = "<div style='text-align:center'>No logs yet.</div>"
        }
        setTimeout(() => {
            $('#tl-ext-logs .logs-list').html(output)
        }, 300)
        

        $('.log-delete-btn').on('click', function(logs){
            if(confirm("Do you really want to delete this log?")){
                var res_id = $(this).attr('id').replace('delete-log-', '')
                console.log(res_id)
                chrome.storage.local.get(["ntptTlResData"], function(data){
                    if(data.hasOwnProperty('ntptTlResData')){
                        var logs = JSON.parse(data.ntptTlResData).logs
                        var newLogs = logs.filter(log => log.res_id !== res_id)
                        console.log(newLogs)
                        chrome.storage.local.set({ "ntptTlResData": JSON.stringify({"logs":newLogs})}, function(){});
                        $('#view_tl_ext_logs').click()
                    }
                })
            }
        })
    })
})

$('#tl-logs-refresh-btn').on('click', function(){
    $('#view_tl_ext_logs').click()
})


$(".form input").on("keypress change", function(){
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
            case 'autoExtendTestlineRes':
                if(settings.hasOwnProperty('uteCloud')){
                    console.log("Triggering...")
                    settings.uteCloud[inputName] = inputValue
                }else{
                    settings.uteCloud = {}
                }
                break;
            case 'tenMinuteWarning':
            case 'thirtyMinuteWarning':
            case 'oneHourWarning':
                if(settings.hasOwnProperty('uteCloud')){
                    if(settings.uteCloud.hasOwnProperty('warnings')){
                        settings.uteCloud.warnings[inputName] = inputValue
                    }else settings.uteCloud.warnings = {}
                }else settings.uteCloud = {"warnings": {}}
                break;
            case 'no-run':
            case 'not-analyzed':
            case 'env-issue':
            case 'failed':
                if(settings.hasOwnProperty('repPortal')){
                    if(settings.repPortal.hasOwnProperty('cit_chart_page')){
                        if(inputValue && !settings.repPortal.cit_chart_page.display_categories.includes(inputName)){
                            settings.repPortal.cit_chart_page.display_categories.push(inputName)
                        } else{
                            //removing element from array
                            var index = settings.repPortal.cit_chart_page.display_categories.indexOf(inputName);
                            if (index > -1) {
                                settings.repPortal.cit_chart_page.display_categories.splice(index, 1);
                            }
                        }
                    } else settings.repPortal.cit_chart_page = {}
                } else settings.repPortal = {"cit_chart_page": {}}
                break;
            case 'crt_no-run':
            case 'crt_failed':
            case 'crt_passed':
            case 'crt_cloud':
                if(settings.hasOwnProperty('repPortal')){
                    if(settings.repPortal.hasOwnProperty('crt_chart_page')){
                        if(inputValue && !settings.repPortal.crt_chart_page.display_categories.includes(inputName)){
                            settings.repPortal.crt_chart_page.display_categories.push(inputName)
                        } else{
                            //removing element from array
                            var index = settings.repPortal.crt_chart_page.display_categories.indexOf(inputName);
                            if (index > -1) {
                                settings.repPortal.crt_chart_page.display_categories.splice(index, 1);
                            }
                        }
                    } else settings.repPortal.crt_chart_page = {}
                } else settings.repPortal = {"crt_chart_page": {}}
                break;
        }
        chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(settings) }, function(){});
    });
})




//Loading the data to popup page
$( document ).ready(function() {
    chrome.storage.sync.get(["nokiaUserSettings"], function(data){
        if(data.hasOwnProperty('nokiaUserSettings')){
            const settings = JSON.parse(data.nokiaUserSettings);
            
            //Settings User data
            if(settings.hasOwnProperty('userData')){
                const inputIds = ['userName', 'competenceArea']
                for(var i in inputIds){
                    if(settings.userData.hasOwnProperty(inputIds[i]))
                        $('#'+inputIds[i]).val(settings.userData[inputIds[i]])
                }
            }

            //Settings Automatic TL Extender
            if(settings.hasOwnProperty('uteCloud') && settings.uteCloud.hasOwnProperty('autoExtendTestlineRes')){
                if(settings.uteCloud.hasOwnProperty('autoExtendTestlineRes')){
                    $('#autoExtendTestlineRes').prop("checked", settings.uteCloud.autoExtendTestlineRes)
                }
            }

            //Settings Warnings
            if(settings.hasOwnProperty('uteCloud') && settings.uteCloud.hasOwnProperty('warnings')){
                
                const warningInputs = ['tenMinuteWarning', 'thirtyMinuteWarning', 'oneHourWarning'];
                warningInputs.forEach((warningInput) => {
                    if(settings.uteCloud.warnings.hasOwnProperty(warningInput)){
                        $('#'+warningInput).prop("checked", settings.uteCloud.warnings[warningInput])
                    }
                })
            }

            //CIT TC Categories
            if(settings.hasOwnProperty('repPortal') && settings.repPortal.hasOwnProperty('cit_chart_page')){
                settings.repPortal.cit_chart_page.display_categories.forEach((category) => {
                    $('#'+category).prop("checked", true)
                })
            }

            //CRT TC Categories
            if(settings.hasOwnProperty('repPortal') && settings.repPortal.hasOwnProperty('crt_chart_page')){
                settings.repPortal.crt_chart_page.display_categories.forEach((category) => {
                    $('#'+category).prop("checked", true)
                })
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
    var email = $('#email').val().toLowerCase();
    var message = $('#bug-detail').val();
    if(name && email && message){
        if(validateEmail(email) && window.reportSending == false){
            window.reportSending = true;
            $.ajax({
                type: 'POST',
                url: "https://www.zopamo.com/nokia/nokia-testers-tool-bug-report",
                data: {"name": name, "email": email, "message": message, "metaData": navigator.userAgent},
                success: function(resultData) { $('#name').val(''); $('#email').val(''); $('#bug-detail').val(''); console.log(resultData); alert("You message is sent successfully. Thankyou"); }
            });
            setTimeout(function(){
                window.reportSending = false;
            }, 10000)
        }else if( window.reportSending == true) console.log("You have Just now sent the report. Can't send multiple times.")
        else alert('Please enter a valid email')
    }else alert("Please provide valid details")
})