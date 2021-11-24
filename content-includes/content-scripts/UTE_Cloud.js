
$("body").prepend("<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css'></link>");
if(window.location.hostname == "cloud.ute.nsn-rdnet.net"){
    const uteHostName = "https://cloud.ute.nsn-rdnet.net";

    //Current_URL = "https://rep-portal.wroclaw.nsn-rdnet.net/reports/test-runs/?user_stats=flag%253Dtests_to_analyze%2526is_99_planned%253DFalse%2526username%253Dbelvenka"

    //API = "https://rep-portal.wroclaw.nsn-rdnet.net/api/automatic-test/runs/report/?fields=no,id,result_color,url,qc_test_instance__m_path,qc_test_set,test_case__qc_instance_number,test_case__name,hyperlink_set__test_logs_url,rain_url,configuration,qc_test_instance__res_tester,end,result,env_issue_type,comment,test_line,test_col__testline_type,builds,qc_test_instance__organization,pronto&limit=25&user_stats=flag%253Dtests_to_analyze%2526is_99_planned%253DFalse%2526username%253Dbelvenka"
    var scriptLoaded = false;
    const updateUteCloudPage = () => {
        var rows = parseInt($('.page-size').html()) || 30;
        setTimeout(function(){  
            for(var i = 0; i<rows; i++){
                var status = $("tr[data-index='"+i+"'] td.cell-status .crop").html();
                var endTime = $("tr[data-index='"+i+"'] td.cell-res_end .crop").html();
                var timeLeft = getTimeLeft(endTime) || NaN;

                //Adding border-left && time left
                switch(status != undefined && status.toLowerCase()){
                    case "confirmed":
                        if($("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.time-left').length){
                            $("#table tr[data-index='"+i+"'] td.cell-type .crop .time-left").html(timeLeft+'</span>');
                        }else{
                            $("#table tr[data-index='"+i+"'] td.cell-type .crop").append(' <span class="time-left ext-elm-tag">'+timeLeft+'</span>');
                        }
                        if(timeLeft.includes("Finished")){ //modify styles to finished testline
                            $("#table tr[data-index='"+i+"'] td.cell-type .crop .time-left").css({"background-color" : "orange"});
                        }
                        $('#table tr[data-index='+i+'] td:nth-child(1)').css({"border-left": "3px solid #10bb1a"});
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



                //Adding Build Detail & TL Name // || $("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.tl-name').length
                if($("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.build-detail').length > 0 && $("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.tl-name').length > 0){
                    //console.log(i+" contains build detail");
                }else{
                    var URL = "https://cloud.ute.nsn-rdnet.net" + $("tr[data-index='"+i+"'] td.cell-uuid_or_id a").attr('href');

                    async function onCommit(URL, i) {
                        const htmlDOM = await getWebContent(URL);
                        //console.log("data: "+htmlDOM);
                        var dom_nodes = $($.parseHTML(htmlDOM));
                        for(var j = 0; j<dom_nodes.find('table tbody tr').length; j++){
                            if(dom_nodes.find('table tbody tr:nth-child('+j+') td:first-child').html() == "Requested build"){
                                var buildDetail = dom_nodes.find('table tbody tr:nth-child('+j+') td:last-child a').html();
                                var build = buildDetail.split('_')[0] || NaN;
                                var buildDetailHTML = build+"<span class='show-on-hover'>"+buildDetail.replace(build, "")+"</span>";
                                //console.log("Build detail is available for "+i+" : "+$("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.build-detail').length)
                                if($("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.build-detail').length == 0){
                                    $("#table tr[data-index='"+i+"'] td.cell-type .crop").append(' <span class="build-detail ext-elm-tag" title="Click to Copy Build">'+buildDetailHTML+'</span>');
                                    $("#table tr[data-index='"+i+"'] td.cell-type .crop .build-detail").on("click", function(){extExecCopy(buildDetail, "Build Detail Copied!")})
                                }
                                break;
                            }  
                        }

                        if($("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.tl-name').length == 0){
                            for(var k = dom_nodes.find("#menu-1>div.resource-property-indent-wrapper>a").length-1; k>=0; k--){
                                if(dom_nodes.find("#menu-1>div.resource-property-indent-wrapper>a").eq(k).children(".resource-key-label").html() == "name"){
                                    var tlName = dom_nodes.find("#menu-1>div.resource-property-indent-wrapper>a").eq(k).html();
                                    tlName = tlName.split("</span>: ")[1] || NaN;
                                    //console.log(tlName);
                                    $("#table tr[data-index='"+i+"'] td.cell-type .crop").append(' <span class="tl-name ext-elm-tag">'+tlName+'</span>');
                                    //return;
                                }
                                //console.log(k);
                            }
                        }

                        if($("#table tr[data-index='"+i+"'] td.cell-uuid_or_id").has('.copy-ip-address').length == 0){
                            var elm1 = "#menu-1 #res1nested2list1nested2>div>a"
                            var elm2 = "#menu-1 #res1nested1list1nested2>div>a"
                            var targetElm = (dom_nodes.find(elm1).length) ? elm1 : elm2;
                            for(var k = 0; k<dom_nodes.find(targetElm).length; k++){
                                if(dom_nodes.find(targetElm).eq(k).children(".resource-key-label").html() == "address"){
                                    var ipAddr = dom_nodes.find(targetElm).eq(k).html();
                                    ipAddr = ipAddr.split("</span>: ")[1] || NaN;
                                    console.log(ipAddr);
                                    $("#table tr[data-index='"+i+"'] td.cell-uuid_or_id").append(' <button class="copy-ip-address" style="margin-left: 10px" title="Copy IP Address"><i class="far fa-copy"></i></button>');
                                    $("#table tr[data-index='"+i+"'] td.cell-uuid_or_id .copy-ip-address").on("click", function(){extExecCopy(ipAddr, "IP Address Copied!")})
                                    //return;
                                }
                                //console.log(k);
                            }
                        }
                        
                    }
                    onCommit(URL, i);
                }
            }
        }, 1000)
    }


    
    const loadExecutionStatus = () => {
        setTimeout(function(){  
            $("#table tbody tr td.cell-id").each(function(){
                if($(this).find('.ext-elm').length == 0){
                    let executionLink = uteHostName+$(this).find(".crop a").attr('href');
                    //console.log("Link: "+$(this).find(".crop a").attr('href'));
                    async function commit(thisElm, execURL){
                        const htmlDOM = await getWebContent(execURL);
                        var dom_nodes = $($.parseHTML(htmlDOM));
                        let totalCases = 0, passedCases = 0, failedCases = 0, norun = 0, canceledCased = 0;
                        dom_nodes.find('table .status').each(function(key){
                            totalCases++;
                            if($(this).hasClass("passed")) passedCases++;
                            if($(this).hasClass("failed")) failedCases++;
                            if($(this).hasClass("canceled")) canceledCased++;
                            if($(this).hasClass("run")) norun++;
                        })
                        var plural = (totalCases > 1) ? "s" : "";
                        var output = " <span class='blue-tag ext-elm-tag'>"+totalCases+" Case"+plural+" in total</span>"
                        if(passedCases > 0) output += " <span class='green-tag ext-elm-tag'>"+passedCases+" Passed</span>"
                        if(failedCases > 0) output += " <span class='red-tag ext-elm-tag'>"+failedCases+" Failed</span>"
                        if(canceledCased > 0) output += " <span class='red-tag ext-elm-tag'>"+canceledCased+" Canceled</span>"
                        if(norun > 0) output += " <span class='grey-tag ext-elm-tag'>"+norun+" Run</span>"
                        if(thisElm.find('.ext-elm').length == 0)
                            thisElm.find(".crop").append(" <span class='ext-elm'>"+output+"</span>")
                    }
                    var execStatus = $(this).parent().find('.cell-status .crop').html()
                    var areTagsShowable = (execStatus == "Execution finished") ? true : (execStatus == "Execution canceled") ? true : (execStatus == "Dry run failure") ? true : false;

                    if(areTagsShowable){
                        commit($(this), executionLink)
                    }
                }
                
            })
            $('#table tbody tr td.cell-id').css("width", "40ch");
            $("#table tbody tr").each(function(){
                var execStatus = $(this).find('.cell-status .crop').html()
                //var idElm = $(this).find('.cell-id');
                //console.log(execStatus.trim());
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
                        $(this).addClass('orange-indication');
                        break;
                    default:
                        $(this).addClass('grey-indication');
                        break;
                }
            })
        }, 1000)
    }


    if(window.location.pathname == "/user/reservations"){
        $('#table').ready(function(){
            updateUteCloudPage();
            setTimeout(function(){ 
                $("table thead .cell-uuid_or_id .th-inner").append(" <span class='ext-elm'>&ensp;|&ensp;IP</span>");
                $('ul.pagination li a').on('click', updateUteCloudPage);

                //Link hover makes type cell hover
                $("#table tbody tr td:first-child").hover(function(){
                    $(this).parent().children('.cell-owner').addClass('cell-overlapped');
                    $(this).parent().children('.cell-type').children('.crop').addClass('cell-overlapping');
                },function(){
                    $(this).parent().children('.cell-type').children('.crop').removeClass('cell-overlapping');
                    $(this).parent().children('.cell-owner').removeClass('cell-overlapped');
                })  
            }, 1000)
        })

        setTimeout(function(){ //Updates while surfing through pages numbers
            $('ul.pagination li a').on('click', updateUteCloudPage);
        }, 1000)

        var x = setInterval(updateUteCloudPage, 1000); //Timer function
    }




    //Execution Status
    if(window.location.pathname == "/execution/search/"){
        $('#table').ready(function(){
            setTimeout(function(){ 
                loadExecutionStatus();
            }, 1000)
            //var x = setInterval(, 1000); 
            // setTimeout(function(){ //Updates while surfing through pages numbers
            //     $('ul.pagination li a').on('click', loadExecutionStatus);
            // }, 5000) 
        })
        var x = setInterval(loadExecutionStatus, 5000);
    }
    
    console.log(window.location.pathname)

}
