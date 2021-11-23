
if(window.location.hostname == "cloud.ute.nsn-rdnet.net"){
    const uteHostName = "https://cloud.ute.nsn-rdnet.net";

    //Current_URL = "https://rep-portal.wroclaw.nsn-rdnet.net/reports/test-runs/?user_stats=flag%253Dtests_to_analyze%2526is_99_planned%253DFalse%2526username%253Dbelvenka"

    //API = "https://rep-portal.wroclaw.nsn-rdnet.net/api/automatic-test/runs/report/?fields=no,id,result_color,url,qc_test_instance__m_path,qc_test_set,test_case__qc_instance_number,test_case__name,hyperlink_set__test_logs_url,rain_url,configuration,qc_test_instance__res_tester,end,result,env_issue_type,comment,test_line,test_col__testline_type,builds,qc_test_instance__organization,pronto&limit=25&user_stats=flag%253Dtests_to_analyze%2526is_99_planned%253DFalse%2526username%253Dbelvenka"

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
                                    $("#table tr[data-index='"+i+"'] td.cell-type .crop").append(' <span class="build-detail ext-elm-tag" title="Click to Copy" value="'+buildDetail+'">'+buildDetailHTML+'</span>');
                                }
                                break;
                            }  
                        }

                        if($("#table tr[data-index='"+i+"'] td.cell-type .crop").has('.tl-name').length == 0){
                            for(var k = dom_nodes.find("#menu-1>div.resource-property-indent-wrapper>a").length; k>0; k--){
                                if(dom_nodes.find("#menu-1>div.resource-property-indent-wrapper>a").eq(k).children(".resource-key-label").html() == "name"){
                                    var tlName = dom_nodes.find("#menu-1>div.resource-property-indent-wrapper>a").eq(k).html();
                                    tlName = tlName.split("</span>: ")[1] || NaN;
                                    //console.log(tlName);
                                    $("#table tr[data-index='"+i+"'] td.cell-type .crop").append(' <span class="tl-name ext-elm-tag">'+tlName+'</span>');
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
        $("#table tbody tr td .cell-id").each(function(){
            let executionLink = uteHostName+"/execution/12724775/show"
            //console.log("Link: "+$(this).find(".crop a").attr("href"));
            async function commit(thisElm, executionLink){
                const htmlDOM = await getWebContent(executionLink);
                console.log(htmlDOM)
                var dom_nodes = $($.parseHTML(htmlDOM));
                let totalCases, passedCases = 0;
                dom_nodes.find('table .status').each(function(){
                    totalCases += 1;
                    if(thisElm.has("passed")){
                        passedCases+=1;
                    }
                })
                if(!thisElm.hasClass("ext-elm"))
                    thisElm.find(".crop").append(" <span class='ext-elm green-tag ext-elm-tag'>"+passedCases+"/"+totalCases+" Passed</span>")
            }
            commit($(this), executionLink)
            
        })
    }


    if(window.location.pathname == "/user/reservations"){
        $('#table').ready(function(){
            updateUteCloudPage();

            setTimeout(function(){ 
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

            $(document).ready(function(){
                $("#table tbody tr td .cell-type .crop .build-detail").click(function(){
                    console.log('%cUTE_Cloud.js line:108 "Click Detected!"', 'color: #007acc;', "Click Detected! - "+$(this).attr('value'));
                    //navigator.clipboard.writeText($(this).attr('value')).then(() => alert("Copied Build Detail")) //copying build detail to clipbord
                })
            })    
        })

        setTimeout(function(){ //Updates while surfing through pages numbers
            $('ul.pagination li a').on('click', updateUteCloudPage);
        }, 1000)

        var x = setInterval(updateUteCloudPage, 2000); //Timer function
    }




    //Execution Status
    if(window.location.pathname == "/execution/search/"){
        $('#table').ready(function(){
            setTimeout(function(){ 
                loadExecutionStatus();
            }, 1000)
        })
    }
    console.log(window.location.pathname)

}
