const repPortalHostName = "rep-portal.wroclaw.nsn-rdnet.net";
window.isLoading = false;

if(window.location.hostname == repPortalHostName){
    
    //passed
    //https://rep-portal.wroclaw.nsn-rdnet.net/api/qc-beta/instances/report/?fields=id%2Cm_path%2Ctest_set__name%2Cname%2Curl%2Cstatus%2Cstatus_color%2Cplatform%2Ctest_subarea%2Ctest_object%2Ctest_entity%2Ctest_lvl_area%2Cca%2Corganization%2Cphase%2Cdet_auto_lvl%2Cres_tester%2Cfeature%2Cbacklog_id%2Crequirement%2Cfault_report_id_link%2Csuspended&id__in=%3Ahash%3A1faf5bc07f1b097ba868563cf3a2cf98&limit=25&tep_status__passed=%3Ahash%3A1faf5bc07f1b097ba868563cf3a2cf98
    //https://rep-portal.wroclaw.nsn-rdnet.net/reports/qc/?id=%3Ahash%3A1faf5bc07f1b097ba868563cf3a2cf98&tep_status_passed=%3Ahash%3A1faf5bc07f1b097ba868563cf3a2cf98
    
    //norun
    //https://rep-portal.wroclaw.nsn-rdnet.net/api/qc-beta/instances/report/?fields=res_tester&id__in=%3Ahash%3Acd36ef7a991d4c2986d63987cf6f8566&tep_status__norun=%3Ahash%3Acd36ef7a991d4c2986d63987cf6f8566
    //https://rep-portal.wroclaw.nsn-rdnet.net/reports/qc/?id=%3Ahash%3Acd36ef7a991d4c2986d63987cf6f8566&tep_status_norun=%3Ahash%3Acd36ef7a991d4c2986d63987cf6f8566

    // https://rep-portal.wroclaw.nsn-rdnet.net/api/qc-beta/instances/report/?build=SBTS22R2_ENB_0000_001564_000013&fields=res_tester&id__in=%3Ahash%3A564f8d24be498fdca4ee0c46e8e0abc4&limit=25&organization__pos_neg=RAN_L2_SW_BLR_2_Dev6SG&wall_status=-passed%2C-failed
    

    //cit_id
    //https://rep-portal.wroclaw.nsn-rdnet.net/api/qc-beta/instances/report/?build=SBTS00_ENB_9999_211122_000003&cit_id=%3Ahash%3A73e13e3a7a1786b832cad30ed2c67437&fields=id%2Cm_path%2Ctest_set__name%2Cname%2Curl%2Cstatus%2Cstatus_color%2Cwall_status__status%2Cplatform%2Ctest_subarea%2Ctest_object%2Ctest_entity%2Ctest_lvl_area%2Cca%2Corganization%2Cphase%2Cres_tester%2Cfeature%2Crequirement%2Cfunction_area%2Crelease%2CRIS%2Clocation%2Chw_id%2Ccomment%2Cacceptance_criteria%2Csw_build%2Clast_testrun__timestamp%2Cstats%2Cpronto_on_build&limit=25&tep_sw_build=SBTS00_ENB_9999_211122_000003
    //https://rep-portal.wroclaw.nsn-rdnet.net/reports/qc/?build=SBTS00_ENB_9999_211122_000003&cit_id=%3Ahash%3A73e13e3a7a1786b832cad30ed2c67437&tep_sw_build=SBTS00_ENB_9999_211122_000003&columns=no,m_path,test_set.name,name,status,wall_status.status,platform,test_subarea,test_object,test_entity,function_area,test_lvl_area,ca,organization,phase,release,RIS,location,hw_id,fault_report_id,comment,res_tester,feature,requirement,acceptance_criteria,sw_build,last_testrun.timestamp,stats,all_prontos,add_test_run,pronto_on_build

    //Get Robot File Path
    //https://rep-portal.wroclaw.nsn-rdnet.net/api/qc/instances/?fields=test_suite&id=9013667
        // Triggered on new Api Request
        async function setTeamProgress(searchParams, userSettings, reqApiUrl){
            const insertionElm = '.navbar-container .rep-title'
            var params = new URLSearchParams(searchParams)

            // console.log("calling Team progress..")

            // setTimeout(() => {
                if(reqApiUrl){
                    //team progress btn exists
                // }else{
                    //norun || passed || failed
                    let api_url = new URL(reqApiUrl)
                    let res_tester = null;
                    if(api_url.searchParams.has('res_tester__username_full_name__pos_neg')){
                        res_tester = getSearchParam(api_url.searchParams, 'res_tester__username_full_name__pos_neg')
                        api_url.searchParams.delete('res_tester__username_full_name__pos_neg');
                    }
                    var casesStatus = params.has('cit_id') ? 'CIT' : params.has('tep_status_norun') ? "no run" : params.has("tep_status_passed") ? "passed" : params.has("tep_status_failed") ? "failed" : "";
                    var casesStatusClassName = (casesStatus == "no run") ? "no-run" : (casesStatus == "passed") ? "passed" : (casesStatus == "failed") ? "failed" : "unknownn";

                    $(insertionElm).css('display', 'flex')
                    var statsHTML = await get_TC_Stats(api_url.href, userSettings)

                    var statsHTML_DOM = $($.parseHTML(statsHTML));
                    statsHTML_DOM.find('tr').each(function() {
                        if(res_tester && $(this).find('td.tester-name').html().includes(res_tester)){
                            $(this).css({'background-color': '#4c7ee6', 'color': '#fcfcfc'});
                            return false
                        }
                    })

                    if($(insertionElm).find(".ext-wrapper#team-progress").length == 0){
                        $(insertionElm).append(`<div class='ext-wrapper' id='team-progress' style='order:2'>
                                                                <div class='report-stats'>
                                                                    <div class='stats-view-btn ext-action-btn'>Team&nbsp;Progress&ensp;<i class='fas fa-chart-bar'></i></div>
                                                                    <div class='stats-viewer'>
                                                                        <div class="cases-type ${casesStatusClassName}"><span>${casesStatus} <span style="font-size: 0.9em">TC's</span></span><span></span><button class='refresh-btn'><i class="fas fa-sync-alt"></i>&ensp;Refresh</button></div>
                                                                        <div class="stats-wrapper">
                                                                            <table class="stats-table">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>&emsp;</th>
                                                                                        <th>Responsible Tester</th>
                                                                                        <th>TC Count</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                ${statsHTML_DOM.html()}
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>`
                        );
                        //const header = $('.top-panel .view-title')
                        if(userSettings.repPortal.isTeamProgressOpen != true)
                            $(insertionElm+" .ext-wrapper#team-progress .report-stats .stats-viewer").hide();
                        $(insertionElm+' .ext-wrapper#team-progress .report-stats .stats-view-btn').on("click", (event) => {
                            // console.log("Team progress click detected")
                            event.stopPropagation();
                            $(insertionElm+" .ext-wrapper#team-progress .report-stats .stats-viewer").toggle();

                            //Setting Team Progress Visibility
                            if($(insertionElm+' .ext-wrapper#team-progress .report-stats .stats-viewer').is(":visible") == true){
                                toogleTeamProgress(true)
                            }else toogleTeamProgress(false)

                        })
                        $(insertionElm+" .ext-wrapper#team-progress .report-stats .stats-viewer").on("click", (event) => {
                            event.stopPropagation();
                        })

                        $(window).click(() => {
                            if($(insertionElm+' .ext-wrapper#team-progress .report-stats .stats-viewer').is(":visible") == true){
                                $(insertionElm+" .ext-wrapper#team-progress .report-stats .stats-viewer").hide();
                                toogleTeamProgress(false)
                            }
                        });
                        
                        $('.stats-viewer .refresh-btn').on('click', function(){
                            location.reload();
                        })
                    }else{
                        $(insertionElm).find(".ext-wrapper#team-progress .stats-viewer table tbody").html(statsHTML);
                    }
                    

                    //Click res tester to filter his/her cases
                    $(insertionElm+' .ext-wrapper#team-progress .report-stats .stats-viewer table tbody tr td.tester-name').on("click", function(e){
                        var respTester = $(this).html();
                        const url = new URL(window.location);
                        url.searchParams.set('res_tester', respTester);
                        window.history.pushState({}, '', url);
                        location.reload()
                    })
                }
            // }, 1000)
        }


        function parseTestsToAnalyze(searchParams, userSettings){
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
        if(data.hasOwnProperty('nokiaUserSettings')){
            userSettings = JSON.parse(data.nokiaUserSettings)
            function repPortalPageInit(load){
                //Tests to analyze feature
                if(window.location.pathname == "/reports/test-runs/"){
                    $(function(){
                        $(".main-container").ready(function() {
                            setTimeout(function(){
                                if($(".main-container h2.table-title .ext-testcase-analyzer").length == 0){
                                    $(".main-container h2.table-title").append("<div class='ext-testcase-analyzer ext-action-btn'>Analyze&nbsp;Errors&ensp;<i class='fas fa-flask'></i></div>");
                                }
                                $(".main-container .ext-testcase-analyzer").on("click", function(){
                                    clearInterval(spinnerInterval);
                                    parseTestsToAnalyze(window.location.search, userSettings);
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
                    if($(".main-container .ext-testcase-analyzer").length) $(".main-container .ext-testcase-analyzer").remove();
                }


                //Robot File Path Copy button Generation Feature
                if(window.location.pathname == "/reports/qc/"){
                    setTimeout(function(){
                        $(".navbar-container").ready(function() {
                            if($(".navbar-container .rep-title ").find('.ext-wrapper#robot-path-copy-btn-generator').length == 0){
                                $(".navbar-container .rep-title").append(`<div class='ext-wrapper' id='robot-path-copy-btn-generator' style='order:3'>
                                                                        <div class='report-stats'>
                                                                            <div class='stats-view-btn ext-action-btn'>Load&nbsp;Robot&nbsp;Paths&ensp;<i class="fas fa-cloud-download-alt"></i></div>
                                                                        </div>
                                                                    </div>`);
                                $('.navbar-container #robot-path-copy-btn-generator').on('click', function(){
                                    generateRobotFileCopyBtn(window.location.hostname);
                                })
                            };
                        })
                    },1000)
                }
                //Ext Elements Remover
                else{
                    $(".navbar-container").ready(function() {
                        if($(".navbar-container .ext-wrapper").length) $(".navbar-container .ext-wrapper").remove();
                    })
                }
            }
            
            repPortalPageInit()
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if(request.message === 'TabUpdated') {
                    var load = false;
                    repPortalPageInit(load);
                }
                sendResponse({status: 'ok'});
            })

            //Team Progress Feature
            if(!chrome.runtime.lastError){
                chrome.runtime.onConnect.addListener(function(port) {
                    if(port.name === 'apiWebRequest' && window.location.pathname == "/reports/qc/") {
                        port.onMessage.addListener(function(msg){
                            setTeamProgress(window.location.search, userSettings, msg.url);
                        })
                    }
                })
            }else{
                // console.log(chrome.runtime.lastError.message);
            }

            // chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            //     if(request.message === 'TabUpdated' && window.location.pathname == "/reports/qc/") {
            //         var port = chrome.runtime.connect({name: "apiWebRequest"});
            //         port.postMessage({request: "Get Last API Request", tabId: sender.tab.id});
            //         port.onMessage.addListener(function(msg) {
            //             setTeamProgress(window.location.search, userSettings, msg.url);
            //         });
            //     }
            // })


            //CIT Charts Page - CIT Progress Featutre
            if(window.location.pathname == "/charts/cit_build_progress/"){
                citProgress(window.location.search, userSettings)
            }

            //CRT Charts Page - CRT Progress Featutre
            if(window.location.pathname == "/charts/tep/"){
                crtProgress(window.location.search, userSettings)
            }
        }
    })

}   