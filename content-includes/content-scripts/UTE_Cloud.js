
if(window.location.hostname == "cloud.ute.nsn-rdnet.net"){
    const uteHostName = "https://cloud.ute.nsn-rdnet.net";
    //Current_URL = "https://rep-portal.wroclaw.nsn-rdnet.net/reports/test-runs/?user_stats=flag%253Dtests_to_analyze%2526is_99_planned%253DFalse%2526username%253Dbelvenka"

    //API = "https://rep-portal.wroclaw.nsn-rdnet.net/api/automatic-test/runs/report/?fields=no,id,result_color,url,qc_test_instance__m_path,qc_test_set,test_case__qc_instance_number,test_case__name,hyperlink_set__test_logs_url,rain_url,configuration,qc_test_instance__res_tester,end,result,env_issue_type,comment,test_line,test_col__testline_type,builds,qc_test_instance__organization,pronto&limit=25&user_stats=flag%253Dtests_to_analyze%2526is_99_planned%253DFalse%2526username%253Dbelvenka"
    var scriptLoaded = false;
    const updateUteCloudPage = (userSettings) => {
        var navHeight = $('header nav').css('height')
        var popMessageStyles = 'font-size:1em; margin-bottom: -10px; background-color: #1449a3; color: #fcfcfc; top: calc('+navHeight+' + 10px); bottom: unset;';
        //TODO: optimizing the loading using window.loaded array variable and storing the loading statuses in the same
        var rows = parseInt($('.page-size').html()) || 30;
        setTimeout(async function(){
            for(var i = 0; i<rows; i++){
                var endTime = $("tr[data-index='"+i+"'] td.cell-res_end .crop").html();
                var URLPath = $("tr[data-index='"+i+"'] td.cell-uuid_or_id a").attr('href');

                var detectAlarmId = null
                if($("tr[data-index='"+i+"'] td.cell-type .crop audio").length > 0){
                    detectAlarmId = $("tr[data-index='"+i+"'] td.cell-type .crop audio").attr('id')
                }

                //Adding border-left && time left
                //if($("tr[data-index='"+i+"'] td:first-child").find('.ext-indication').length == 0){
                    var status = $("tr[data-index='"+i+"'] td.cell-status .crop").html();
                    //console.log(status);
                    switch(status != undefined && status.toLowerCase()){
                        case "confirmed":
                            var topology = $("tr[data-index='"+i+"'] td.cell-type .crop").html().split(' <span')[0];
                            var tl_name = $("tr[data-index='"+i+"'] td.cell-type .crop .tl-name").html() || '';
                            var tl_start = $("tr[data-index='"+i+"'] td.cell-res_start .crop").html() || '';
                            var timeLeft = await getTimeLeft(endTime, detectAlarmId, `https://cloud.ute.nsn-rdnet.net${URLPath}`, topology, tl_name, tl_start, userSettings) || "";
                            if($("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.time-left').length){
                                $("#table tr[data-index='"+i+"'] td.cell-type .crop .time-left").html(timeLeft+'</span>');
                            }else{
                                $("#table tr[data-index='"+i+"'] td.cell-type .crop").append(' <span class="time-left ext-elm-tag">'+timeLeft+'</span>');
                            }
                            if(timeLeft.includes("Finished")){ //modify styles to finished testline
                                $("#table tr[data-index='"+i+"'] td.cell-type .crop .time-left").css({"background-color" : "orange"});
                            }
                            $('#table tr[data-index='+i+'] td:nth-child(1)').css({"border-left": "3px solid #10bb1a"});
                            if($("#table tr[data-index='"+i+"'] td.cell-type .crop").find('audio').length == 0)
                                $("#table tr[data-index='"+i+"'] td.cell-type .crop").append("<audio muted='muted' autoplay='' id='audio-"+URLPath.split('/')[2]+"' type='audio/mpeg'></audio>")
                            break;
                        case "pending for testline":
                        case "testline assigned":
                            $('#table tr[data-index='+i+'] td:nth-child(1)').css({"border-left": "3px solid orange"});
                            break;
                        case "finished":
                            $('#table tr[data-index='+i+'] td:nth-child(1)').css({"border-left": "3px solid #ccc"});
                            break;
                        case "canceled":
                            $('#table tr[data-index='+i+'] td:nth-child(1)').css({"border-left": "3px solid red"});
                            break;
                    }
                // }
                


                //Adding Build Detail & TL Name
                var reservationDate = $("#table tr[data-index='"+i+"'] td.cell-req_date .crop").html()
                var yesterday = new Date(new Date().getTime() - 24*60*60*1000);
                var resDate = new Date(reservationDate);
                if($("#table tr[data-index='"+i+"'] td.cell-type .crop .build-detail").length == 0 && yesterday<=resDate){
                    //console.log(i+" contains build detail");
                // }else{
                    // var URLPath = $("tr[data-index='"+i+"'] td.cell-uuid_or_id a").attr('href');
                    var URL = "https://cloud.ute.nsn-rdnet.net" + URLPath;

                    async function onCommit(URL, i, status) {
                        if(!URL) return false
                        const htmlDOM = await getWebContent(URL);
                        var dom_nodes = $($.parseHTML(htmlDOM));
                        for(var j = 0; j<dom_nodes.find('table tbody tr').length; j++){
                            if(dom_nodes.find('table tbody tr:nth-child('+j+') td:first-child').html() == "Requested build"){
                                var buildDetail = dom_nodes.find('table tbody tr:nth-child('+j+') td:last-child a').html();
                                var build = buildDetail.split('_')[0] || NaN;
                                var buildDetailHTML = build+"<span class='show-on-hover'>"+buildDetail.replace(build, "")+"</span>";
                                //console.log("Build detail is available for "+i+" : "+$("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.build-detail').length)
                                if($("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.build-detail').length == 0){
                                    $("#table tr[data-index='"+i+"'] td.cell-type .crop").append(' <span class="build-detail ext-elm-tag" title="Click to Copy Build">'+buildDetailHTML+'</span>');
                                    $("#table tr[data-index='"+i+"'] td.cell-type .crop .build-detail").on("click", function(){
                                        extExecCopy(buildDetail)
                                        sendMessage("Build Detail Copied!", "body", popMessageStyles);
                                    })
                                }
                                //break;
                            }
                        }
                        var tlName = ''
                        if($("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.tl-name').length == 0){
                            for(var k = dom_nodes.find("#menu-1>div.resource-property-indent-wrapper>a").length-1; k>=0; k--){
                                if(dom_nodes.find("#menu-1>div.resource-property-indent-wrapper>a").eq(k).children(".resource-key-label").html() == "name"){
                                    tlName = dom_nodes.find("#menu-1>div.resource-property-indent-wrapper>a").eq(k).html();
                                    tlName = tlName.split("</span>: ")[1] || NaN;
                                    //console.log(tlName);
                                    $("#table tr[data-index='"+i+"'] td.cell-type .crop").append(' <span class="tl-name ext-elm-tag">'+tlName+'</span>');
                                    $("#table tr[data-index='"+i+"'] td.cell-type .crop .tl-name").on("click", function(){
                                        extExecCopy(tlName)
                                        sendMessage("Testline Name Copied!", "body", popMessageStyles);
                                    })
                                    //return;
                                }
                                //console.log(k);
                            }
                        }

                        if($("#table tr[data-index='"+i+"'] td.cell-uuid_or_id").has('.copy-ip-address').length == 0 && status == 'Confirmed'){
                            var elm1 = "#menu-1 #res1nested2list1nested2>div>a"
                            var elm2 = "#menu-1 #res1nested1list1nested2>div>a"
                            var targetElm = (dom_nodes.find(elm1).length) ? elm1 : elm2;
                            for(var k = 0; k<dom_nodes.find(targetElm).length; k++){
                                if(dom_nodes.find(targetElm).eq(k).children(".resource-key-label").html() == "address"){
                                    //IP address
                                    var ipAddr = dom_nodes.find(targetElm).eq(k).html();
                                    ipAddr = ipAddr.split("</span>: ")[1] || NaN;
                                    
                                    //TL Password
                                    var tl_pwd = "Password-Unavailable"
                                    dom_nodes.find('table tr td:first-child').each(function(){
                                        if($(this).html() == "Testline password"){
                                            tl_pwd = $(this).next().text();
                                        }
                                    })

                                    $("#table tr[data-index='"+i+"'] td.cell-uuid_or_id").append(' <button class="copy-ip-address" style="margin-left: 10px" title="Copy IP Address"><i class="far fa-copy"></i></button>');
                                    $("#table tr[data-index='"+i+"'] td.cell-uuid_or_id .copy-ip-address").on("click", function(){
                                        extExecCopy(ipAddr+" || "+tl_pwd)
                                        sendMessage("VM IP Address & Password Copied!", "body", popMessageStyles);

                                    })
                                    //return;
                                }
                                //console.log(k);
                            }     
                        }
                    }
                    if(URLPath != undefined && URLPath != null && URLPath != '') onCommit(URL, i, status);
                }
            }
        }, 1000)
    }


    
    const loadExecutionStatus = (userSettings) => {
        setTimeout(function(){
            $("#table tbody tr").each(function(){
                var execStatus = $(this).find('.cell-status .crop').html()
                //var idElm = $(this).find('.cell-id');
                //console.log(execStatus.trim());
                if(execStatus){
                    switch(execStatus.trim()){
                        case "Execution finished":
                            $(this).addClass('green-indication');
                            break;
                        case "Dry run failure":
                        case "Execution canceled":
                            $(this).addClass('red-indication');
                            break;
                        case "Testline pending":
                        case "Execution pending":
                        case "Execution started":
                        case "Dry run started":
                        case "Dry run pending":
                        case "New":
                            $(this).addClass('orange-indication');
                            break;
                        default:
                            $(this).addClass('grey-indication');
                            break;
                    }
                } 
            })
            
            //Setting the ID filed width Start
            var elm = $('#table thead tr th.cell-id .th-inner')
            var isWiden = userSettings.uteCloud.execPage.isIdExtended || false
            if(isWiden == true){
                elm.find('i.fas').removeClass('fa-chevron-right')
                elm.find('i.fas').addClass('fa-chevron-left')
                $("#table thead tr th.cell-id, #table tbody tr td.cell-id").css('width', '40ch')  
            }//Setting the ID field width END
            
            $("#table tbody tr td.cell-id").each(function(){
                if($(this).length > 0 && $(this).find('.ext-elm').length == 0 && $(this).css('visibility') == 'visible'){
                    // var execStatus = $(this).parent().parent().find('.cell-status .crop').html()
                    let executionLink = uteHostName+$(this).find(".crop a").attr('href');
                    //console.log("Link: "+$(this).find(".crop a").attr('href'));
                    async function commit(thisElm, execURL, execStatus){
                        if(!execURL) return false
                        const htmlDOM = await getWebContent(execURL);
                        var dom_nodes = $($.parseHTML(htmlDOM));
                        let totalCases = 0, passedCases = 0, failedCases = 0, norun = 0, canceledCased = 0;
                        let logsUrl = null
                        dom_nodes.find('table .status').each(function(key){
                            totalCases++;
                            if($(this).hasClass("passed")) passedCases++;
                            if($(this).hasClass("failed")) failedCases++;
                            if($(this).hasClass("canceled")) canceledCased++;
                            if($(this).hasClass("run")) norun++;
                        })

                        var owner = " <span class='blue-tag ext-elm-tag'>-</span>";
                        var reportStatus = 'blue'
                        var reportURL = null
                        //QC Report Check
                        dom_nodes.find('table tr').each(async function(){
                            const fieldName = $(this).find('td').eq(0).html();
                            const fieldValue = $(this).find('td').eq(1).html();
                            if(fieldName != undefined && fieldName.includes("Reporting Portal Test Reports")){
                                if(!fieldValue.includes("Not available")){
                                    reportStatus = 'green'
                                    reportURL = $(this).find('td').eq(1).find('a').attr('href')
                                }
                                return false    
                            }
                        })
                        
                        dom_nodes.find('table tr').each(function(){
                            const fieldName = $(this).find('td').eq(0).html();
                            const fieldValue = $(this).find('td').eq(1).html().trim();

                            if(fieldName == 'Logs'){
                                logsUrl = $(this).find('td').eq(1).find('a').attr('href')
                            }

                            if(fieldName != undefined && fieldName.includes("Owner")){
                                if(fieldValue.includes("Cloud Regression")){
                                    owner = ` <span class='blue-tag ext-elm-tag owner-cloud-reg' title='Cloud Regression${reportURL ? ' - Reported Link' : ' - Not Reported'}'>${reportURL ? `<a href='${reportURL}' target='_blank'>CR</a>` : `CR`}</span>`
                                }else{
                                    owner = ` <span class='blue-tag ext-elm-tag owner-cloud-reg' title='Manual Execution${reportURL ? ' - Reported Link' : ' - Not Reported'}'>${reportURL ? `<a href='${reportURL}' target='_blank'>M</a>` : `M`}</span>`
                                }
                                return false
                            }
                        })


                        var plural = (totalCases > 1) ? "s" : "";
                        var output = ''
                        if(execStatus == "Execution finished" || execStatus == "Execution canceled"){
                            output += owner // Adding Exec Owner
                            output += " <span class='blue-tag ext-elm-tag' title='Logs Link'><a href='"+logsUrl+"' target='_blank'>"+totalCases+" Case"+plural+"</a></span>"
                            if(passedCases > 0) output += " <span class='green-tag ext-elm-tag'>"+passedCases+" Passed</span>"
                            if(failedCases > 0) output += " <span class='red-tag ext-elm-tag'>"+failedCases+" Failed</span>"
                            if(canceledCased > 0) output += " <span class='red-tag ext-elm-tag'>"+canceledCased+" Canceled</span>"
                            if(norun > 0) output += " <span class='grey-tag ext-elm-tag'>"+norun+" Run</span>"
                            
                        }else{
                            output += owner // Adding Exec Owner
                        }
                        
                        if(thisElm.find('.ext-elm').length == 0)
                            thisElm.find(".crop").append(" <span class='ext-elm'>"+output+"</span>")
                    }
                    var execStatus = $(this).parent().find('.cell-status .crop').html()
                    //var areTagsShowable = (execStatus == "Execution finished") ? true : (execStatus == "Execution canceled") ? true : (execStatus == "Dry run failure") ? true : false;

                    //if(areTagsShowable){
                        commit($(this), executionLink, execStatus)
                    //}
                }
            })

        }, 1000)
    }

    var userSettings = null
    chrome.storage.sync.get(["nokiaUserSettings"], function(data){
        if(data.hasOwnProperty('nokiaUserSettings')){
            userSettings = JSON.parse(data.nokiaUserSettings)
            if(window.location.pathname == "/user/reservations"){
                $('#table').ready(function(){
                    updateUteCloudPage(userSettings);
                    setTimeout(function(){ 
                        $("table thead .cell-uuid_or_id .th-inner").append(" <span class='ext-elm'>&ensp;|&ensp;IP</span>");
                        // $('ul.pagination li a').on('click', function(){updateUteCloudPage(userSettings)});

                        //Link hover makes type cell hover
                        $("#table tbody tr td:first-child").hover(function(){
                            $(this).parent().children('.cell-owner').addClass('cell-overlapped');
                            $(this).parent().children('.cell-type').children('.crop').addClass('cell-overlapping');
                        },function(){
                            $(this).parent().children('.cell-type').children('.crop').removeClass('cell-overlapping');
                            $(this).parent().children('.cell-owner').removeClass('cell-overlapped');
                        })

                        $("#table th.cell-type .column-expand").on("click", function(){
                            chrome.storage.sync.get(["nokiaUserSettings"], function(data){
                                var isExtended = false
                                if($(this).hasClass('expanded')){
                                    isExtended = true;
                                }
                                var userSettings = JSON.parse(data.nokiaUserSettings)
                                userSettings.uteCloud = $.extend(userSettings.uteCloud, {isIdExtended: isExtended})
                                chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(userSettings) }, function(){});
                            })
                            
                        })
                    }, 1000)
                })

                var y = setInterval(function(){
                    updateUteCloudPage(userSettings)
                }, 2000); //Timer function
            }



            
            //Execution Status
            if(window.location.pathname == "/execution/search/"){
                $('#table').ready(function(){
                    var x = setInterval(function(){
                        if($('#table tbody tr td.cell-id').find('a').length > 0){
                            setTimeout(function(){
                                loadExecutionStatus(userSettings)

                                //New: window, old: 'ul.pagination li, #search_button'
                                $(window).on('click', function(){
                                    var x = setInterval(function(){
                                        if($('.fixed-table-loading').css('display') == 'none'){
                                            setTimeout(function(){
                                                loadExecutionStatus(userSettings)
                                            }, 500)
                                            clearInterval(x)
                                        }
                                    }, 500);
                                })
                            }, 500)
                            clearInterval(x)
                        }
                    }, 500);
                    

                    var elm = $('#table thead tr th.cell-id .th-inner')
                        if(elm.find('.ext-elm').length == 0)
                            elm.append(" <span class='ext-elm id-field-extention-toggler'><i class='fas fa-chevron-right'></i></span>")

                    var isWiden = userSettings.uteCloud.execPage.isIdExtended || false
                    elm.find('.id-field-extention-toggler').click(function(){
                        if($(this).hasClass('active')){
                            elm.find('i.fas').removeClass('fa-chevron-left')
                            elm.find('i.fas').addClass('fa-chevron-right')
                            $("#table thead tr th.cell-id, #table tbody tr td.cell-id").css('width', '10ch')
                            isWiden = false
                        }else{
                            elm.find('i.fas').removeClass('fa-chevron-right')
                            elm.find('i.fas').addClass('fa-chevron-left')
                            $("#table thead tr th.cell-id, #table tbody tr td.cell-id").css('width', '40ch')
                            isWiden = true
                        }
                        $(this).toggleClass("active")
                        userSettings.uteCloud.execPage.isIdExtended = isWiden
                        chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(userSettings) }, function(){})
                    })
                    
                    if($('#container').find('ext-elms-info').length == 0)
                        $('#container').append(`<div class="ext-elms-info">
                                                    <span class='blue-tag ext-elm-tag' title='Manual Execution'>M</span> - Manual Single Run
                                                    <span class='blue-tag ext-elm-tag' title='Cloud Regression'>CR</span> - Cloud Regression
                                                    <span class='blue-tag ext-elm-tag' title='Manual Execution - Reported'><a href='#'>M</a></span> /
                                                    <span class='blue-tag ext-elm-tag' title='Cloud Regression - Reported' style='margin-left: 0px'><a href='#'>CR</a></span> - Reported Links
                                                </div>`)
                })
            }
        }
    })
}