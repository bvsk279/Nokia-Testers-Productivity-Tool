const repPortalHostName = "rep-portal.wroclaw.nsn-rdnet.net";

if(window.location.hostname == repPortalHostName){
    
    //Tests to analyse feature
    if(window.location.pathname == "/reports/test-runs/"){
        
    }

    //No run stats
    // if(window.location.pathname == "/reports/qc/"){
    //     setTimeout(function(){
    //         commit(window.location.search);
    //     }, 1000)
    // }
    
    //passed
    //https://rep-portal.wroclaw.nsn-rdnet.net/api/qc-beta/instances/report/?fields=id%2Cm_path%2Ctest_set__name%2Cname%2Curl%2Cstatus%2Cstatus_color%2Cplatform%2Ctest_subarea%2Ctest_object%2Ctest_entity%2Ctest_lvl_area%2Cca%2Corganization%2Cphase%2Cdet_auto_lvl%2Cres_tester%2Cfeature%2Cbacklog_id%2Crequirement%2Cfault_report_id_link%2Csuspended&id__in=%3Ahash%3A1faf5bc07f1b097ba868563cf3a2cf98&limit=25&tep_status__passed=%3Ahash%3A1faf5bc07f1b097ba868563cf3a2cf98
    //https://rep-portal.wroclaw.nsn-rdnet.net/reports/qc/?id=%3Ahash%3A1faf5bc07f1b097ba868563cf3a2cf98&tep_status_passed=%3Ahash%3A1faf5bc07f1b097ba868563cf3a2cf98
    
    //norun
    //https://rep-portal.wroclaw.nsn-rdnet.net/api/qc-beta/instances/report/?fields=res_tester&id__in=%3Ahash%3Acd36ef7a991d4c2986d63987cf6f8566&tep_status__norun=%3Ahash%3Acd36ef7a991d4c2986d63987cf6f8566
    //https://rep-portal.wroclaw.nsn-rdnet.net/reports/qc/?id=%3Ahash%3Acd36ef7a991d4c2986d63987cf6f8566&tep_status_norun=%3Ahash%3Acd36ef7a991d4c2986d63987cf6f8566
    

    //cit_id
    //https://rep-portal.wroclaw.nsn-rdnet.net/api/qc-beta/instances/report/?build=SBTS00_ENB_9999_211122_000003&cit_id=%3Ahash%3A73e13e3a7a1786b832cad30ed2c67437&fields=id%2Cm_path%2Ctest_set__name%2Cname%2Curl%2Cstatus%2Cstatus_color%2Cwall_status__status%2Cplatform%2Ctest_subarea%2Ctest_object%2Ctest_entity%2Ctest_lvl_area%2Cca%2Corganization%2Cphase%2Cres_tester%2Cfeature%2Crequirement%2Cfunction_area%2Crelease%2CRIS%2Clocation%2Chw_id%2Ccomment%2Cacceptance_criteria%2Csw_build%2Clast_testrun__timestamp%2Cstats%2Cpronto_on_build&limit=25&tep_sw_build=SBTS00_ENB_9999_211122_000003
    //https://rep-portal.wroclaw.nsn-rdnet.net/reports/qc/?build=SBTS00_ENB_9999_211122_000003&cit_id=%3Ahash%3A73e13e3a7a1786b832cad30ed2c67437&tep_sw_build=SBTS00_ENB_9999_211122_000003&columns=no,m_path,test_set.name,name,status,wall_status.status,platform,test_subarea,test_object,test_entity,function_area,test_lvl_area,ca,organization,phase,release,RIS,location,hw_id,fault_report_id,comment,res_tester,feature,requirement,acceptance_criteria,sw_build,last_testrun.timestamp,stats,all_prontos,add_test_run,pronto_on_build

        async function setTeamProgress(searchParams, userSettings){
            const insertionElm = '.navbar-container .rep-title'
            var params = new URLSearchParams(searchParams)

            var report_id = params.get('id') || params.get('cit_id')
            if($(insertionElm).find(".ext-wrapper").length == 0 && report_id != null){
                //team progress btn exists
            //}else{
                //norun || passed || failed
                var casesStatus = params.has('tep_status_norun') ? "no run" : params.has("tep_status_passed") ? "passed" : params.has("tep_status_failed") ? "failed" : "";
                var casesStatusClassName = (casesStatus == "no run") ? "no-run" : (casesStatus == "passed") ? "passed" : (casesStatus == "failed") ? "failed" : "unknownn";
                //alert("Cases Type: "+casesStatus );

                $(insertionElm).css('display', 'flex')
                var apiURL = null
                if(params.has('cit_id')){ //CIT
                    apiURL = "https://"+repPortalHostName+"/api/qc-beta/instances/report/"+searchParams+"&fields=res_tester,ca&limit=1000";
                }else{ //CRT
                    apiURL = "https://"+repPortalHostName+"/api/qc-beta/instances/report/?fields=res_tester,ca&id__in="+report_id+"&tep_status__norun="+report_id+"&limit=1000";
                }
                
                
                var jsonData = await getJsonData(apiURL)
                if(jsonData.results.length==1000){
                    const newapiURL = apiURL+"&offset=1000";
                    const newjsonData = await getJsonData(newapiURL)
                    jsonData.results = jsonData.results.concat(newjsonData.results)
                }

                var jsonDataResults = jsonData.results;
                // jsonDataResults = jsonData.results.filter(item => {console.log(item); console.log(competenceArea); console.log(item.ca == competenceArea); return item.ca == competenceArea})
                
                var names = []
                for(var i in jsonDataResults){
                    var name = jsonDataResults[i].res_tester;
                    if(name) names.push(name)
                }
    
                var map = names.reduce(function(p, c) {p[c] = (p[c] || 0) + 1; return p }, {});
                var sortedNames = Object.keys(map).sort(function(a, b) {return map[b] - map[a] });
                var count = 0;
                var statsHTML = ""
                for(var i in sortedNames){
                    count += 1;
                    if(userSettings.userData.userName != undefined && userSettings.userData.userName != null && userSettings.userData.userName != '' && sortedNames[i].includes(userSettings.userData.userName)){
                        statsHTML += `<tr style='border: 3px solid #0fc10f'>
                                        <th>${count}</th>
                                        <td class='tester-name'>${sortedNames[i]}</td>
                                        <td>${map[sortedNames[i]]}</td>
                                    </tr>`;
                    }else{
                        statsHTML += `<tr>
                                        <th>${count}</th>
                                        <td class='tester-name'>${sortedNames[i]}</td>
                                        <td>${map[sortedNames[i]]}</td>
                                    </tr>`;
                    }
                    //console.log( sortedNames[i] + "-> " + map[sortedNames[i]])

                //console.log(sortedNames[i] + "-> " + jsonDataResults.filter((data)=>data.res_tester == sortedNames[i]).length)
                }
                statsHTML += "<tr><th></th><td><b>Grand total</b></td><td><b>"+names.length+"</b></td></tr>";

                if($(insertionElm).find(".ext-wrapper").length == 0){
                    $(insertionElm).append(`<div class='ext-wrapper'>
                                                            <div class='report-stats'>
                                                                <div class='stats-view-btn ext-action-btn'>Team&nbsp;Progress&ensp;<i class='fas fa-chart-bar'></i></div>
                                                                <div class='stats-viewer'>
                                                                    <div class="cases-type ${casesStatusClassName}">${casesStatus} <span style="font-size: 0.8em">cases</span></div>
                                                                    <div class="stats-wrapper">
                                                                        <table class="stats-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>&emsp;</th>
                                                                                    <th>Responsible Tester</th>
                                                                                    <th>TC Count</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>${statsHTML}</tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>`
                    );
                    //const header = $('.top-panel .view-title')
                    $(insertionElm+" .ext-wrapper .report-stats .stats-viewer").hide();
                    console.log("Click function is executing...")
                    $(insertionElm+' .ext-wrapper .report-stats .stats-view-btn').on("click", (event) => {
                        console.log("Team progress click detected")
                        event.stopPropagation();
                        $(insertionElm+" .ext-wrapper .report-stats .stats-viewer").toggle();
                    })
                    $(insertionElm+" .ext-wrapper .report-stats .stats-viewer").on("click", (event) => {
                        event.stopPropagation();
                    })

                    $(window).click(() => {
                        if($(insertionElm+' .ext-wrapper .report-stats .stats-viewer').is(":visible") == true){
                            $(insertionElm+" .ext-wrapper .report-stats .stats-viewer").hide();
                        }
                    });
                }
                

                //Click res tester to filter his/her cases
                $(insertionElm+' .ext-wrapper .report-stats .stats-viewer table tbody tr td.tester-name').on("click", function(e){
                    var respTester = $(this).html();
                    const url = new URL(window.location);
                    url.searchParams.set('res_tester', respTester);
                    window.history.pushState({}, '', url);
                    location.reload()
                })
            }
            

        }
        
        //Access Header Cell: [container-id=\"'body'\"] .ui-grid-header-cell:nth-child(1) [role="columnheader"] span.ui-grid-header-cell-label

        //Access Row Number: [container-id=\"'body'\"] .ui-grid-canvas>div:nth-child(1)
        //Access Cell Content: [container-id=\"'body'\"] .ui-grid-canvas>div:nth-child(1) [ui-grid-cell]:nth-child($CELL_NO) .ui-grid-cell-contents 


        function parseTestsToAnalyse(searchParams, userSettings){
            // const header = "[container-id=\"'body'\"] .ui-grid-header-cell [role='columnheader'] span.ui-grid-header-cell-label";
            const header = "[container-id=\"'body'\"] .ui-grid-header-cell [role='columnheader']";
            const newCellWidth = 250; //px
            var newColumnNumber = 0;
            $(header).each(function(index){
                if($(this).find("span.ui-grid-header-cell-label").html() == "Log"){
                    newColumnNumber = index+1;
                    //Adding Header Cell and Setting Width
                    var newContainerHeaderWidth = parseInt($("[container-id=\"'body'\"] .ui-grid-header-canvas").width())+5+newCellWidth;
                    $("[container-id=\"'body'\"] .ui-grid-header-canvas").attr('style', "width:"+newContainerHeaderWidth.toString()+"px !important")

                    if($("[container-id=\"'body'\"] .ui-grid-header .ext-elm-header-cell").length == 0){
                        $(this).parent().after(getHeaderCell(newCellWidth));
                    }
                    
                    //Adding Column cells and Setting width
                    if($("[container-id=\"'body'\"] .ui-grid-row .ext-elm-col-cell").length == 0){
                        var newContainerBodyWidth = parseInt($("[container-id=\"'body'\"] .ui-grid-canvas").width())+5+newCellWidth;
                        $("[container-id=\"'body'\"] .ui-grid-canvas").attr('style', "width:"+newContainerBodyWidth.toString()+"px !important")
                    }
                    //Looping through rows - Adding Empty Rows
                    if($("[container-id=\"'body'\"] .ui-grid-row .ext-elm-col-cell").length == 0){
                        $("[container-id=\"'body'\"] .ui-grid-row").each(function(){
                            $(this).find('.ui-grid-cell:nth-child('+newColumnNumber+')').after(getColumnCell(newCellWidth, ""));
                        })
                    }
                    $("[container-id=\"'body'\"] .ui-grid-row").each(function(){
                        var logURL = $(this).find(".ui-grid-cell:nth-child("+newColumnNumber+") .ui-grid-cell-contents>a:first-child").attr('href');

                        logURL = logURL.replace("log.html", "output.xml")
                        logURL = logURL.replace("http://", "https://")
                        
                        async function getLogErrorMesage(elm, logURL) {

                            const logHTML = await getWebContent(logURL)
                            //console.log(logHTML);
                            xml = $.parseXML(logHTML);
                            $xml_nodes = $( xml )
                            var errorMessage = $xml_nodes.find('#s1>status[status="FAIL"]').text();
                            
                            if(errorMessage == undefined || errorMessage == ''){
                                $xml_nodes.find('#s1 status[status="FAIL"]').each(function(){
                                    if($(this).text()){
                                        errorMessage = $(this).text();
                                    }  
                                })
                            }
                            

                            errorMessage = errorMessage.substring(0, 70)+"<span style='user-select: none'>...</span>";
                            errorMessage = errorMessage.replace("Suite setup failed:", "<span style='color:red'>Suite setup failed:</span>")
                            errorMessage = errorMessage.replace("Suite teardown failed:", "<span style='color:red'>Suite teardown failed:</span>")
                            
                            if(elm.find(".ext-elm-col-cell").length == 0){
                                //elm.find('.ui-grid-cell:nth-child('+newColumnNumber+')').after(getColumnCell(newCellWidth, errorMessage));
                            }else{
                                //elm.find('.ui-grid-cell:nth-child('+(newColumnNumber+1)+')').html(getColumnCell(newCellWidth, errorMessage));
                                elm.find('.ext-elm-col-cell .ext-cell-contents').html(errorMessage);
                            }
                        }

                        getLogErrorMesage($(this), logURL)

                    })
                    
                    return;
                }
            })
            if($("[container-id=\"'body'\"] .ui-grid-header-cell:nth-child(8) [role='columnheader'] span.ui-grid-header-cell-label").html() == "Log"){
                
            }
        }
//TODO: ADD chrome.onInstall Action. To show buttons right after the Extention is added to chrome



    var spinnerInterval = null
    var userSettings = null
    chrome.storage.sync.get(["nokiaUserSettings"], function(data){
        // var data = {nokiaUserSettings:{}}
        if(data.nokiaUserSettings){
            userSettings = JSON.parse(data.nokiaUserSettings)
            function repPortalPageInit(load){
                if(window.location.pathname == "/reports/qc/"){
                    $(function() {
                        $(".navbar-container").ready(function() {

                            setTimeout(function(){
                                //console.time('Execution Time');
                                setTeamProgress(window.location.search, userSettings);
                                //console.timeEnd('Execution Time');

                            }, 1000)

                        })
                    })
                }else{
                    if($(".navbar-container .ext-wrapper").length) $(".navbar-container .ext-wrapper").remove();
                }


                if(window.location.pathname == "/reports/test-runs/"){
                    $(function(){
                        $(".main-container").ready(function() {
                            setTimeout(function(){
                                if($(".main-container h2.table-title .ext-testcase-analyser").length == 0){
                                    $(".main-container h2.table-title").append("<div class='ext-testcase-analyser ext-action-btn'>Analyse Errors&ensp;<i class='fas fa-flask'></i></div>");
                                }
                                $(".main-container .ext-testcase-analyser").on("click", function(){
                                    clearInterval(spinnerInterval);
                                    parseTestsToAnalyse(window.location.search, userSettings);
                                })
                            }, 1000)
                        })

                        $("[container-id=\"'body'\"] .ui-grid-canvas .ui-grid-row").ready(function() {
                            spinnerInterval = setInterval(() => {
                                if($("[container-id=\"'body'\"] .ui-grid-row .ext-cell-contents").length > 0 ){
                                    $("[container-id=\"'body'\"] .ui-grid-row").each(function(){
                                        if(load == false){
                                            $(this).find(".ext-cell-contents").empty()
                                            load = true
                                        }
                                    })
                                    //clearInterval(spinnerInterval);
                                }
                            }, 1000);
                        })
                    })
                }else{
                    if($(".main-container .ext-testcase-analyser").length) $(".main-container .ext-testcase-analyser").remove();
                }
            }

            repPortalPageInit()
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if(request.message === 'TabUpdated') {
                    var load = false;
                    // console.log("Entering into the Tab Updating section")
                    repPortalPageInit(load)
                }
            })
        }
    })
}
// chrome.storage.sync.get(["nokiaUserSettings"], function(data){
//     console.log("Nokia User Settings Before: "+data.nokiaUserSettings)
// })

// chrome.storage.sync.remove("nokiaUserSettings", function(Items) {
//     console.log("Removed: "+Items);
//     alert('removed nokia user Settings');
// })