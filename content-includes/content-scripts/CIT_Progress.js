//api: https://rep-portal.wroclaw.nsn-rdnet.net/api/charts/cit_build_progress/?ca__pos_neg=%22RAN_L2_SW_BLR_2%22&from=2021-11-20&promotion__pos_neg=%22CIT%22&swbranch=SRAN+SBTS00+COMMON&to=2021-12-15

//CIT Individual report: https://rep-portal.wroclaw.nsn-rdnet.net/api/qc-beta/instances/report/?build=SBTS00_ENB_9999_211213_000005&cit_id=:hash:55d5f8933c916e93ea03f743159ea204&fields=res_tester&limit=1000
const uteHostName = "https://rep-portal.wroclaw.nsn-rdnet.net";

async function buildItemHtml(url){
    var params = url.split('?')

    let reportApi = uteHostName+'/api/qc-beta/instances/report/?build='+getSearchParam(params, 'build')+'&cit_id='+getSearchParam(params, 'cit_id')+'&fields=res_tester&limit=1000';
    let data = await getJsonData(reportApi);
    return 

}

async function citProgress(searchParams){
    var competenceArea = getSearchParam(searchParams, 'ca');
    var ft = getSearchParam(searchParams, 'ft');

    var URL = uteHostName+"/api/charts/cit_build_progress/?ca__pos_neg="+competenceArea+"&from="+ft.split(',')[0]+"&promotion__pos_neg=\"CIT\"&swbranch=SRAN+SBTS00+COMMON"+"&to="+ft.split(',')[1]

    const citJson = await getJsonData(URL);
    var seriesData = [];
    for(var i in citJson.series){
        switch(citJson.series[i].key){
            case 'No Run':
            case 'Environment Issue':
            case 'Not Analyzed':
            case 'Failed':
            case 'Blocked':
                seriesData.push(citJson.series[i])
                break;
        }
    }
    citJson.series = seriesData;
    console.log(citJson);
    var items_html = ``;
    for(var i in citJson.xticks){
        var build = citJson.xticks[i].split(" ")[0];
        var date = citJson.xticks[i].split(" ")[1];
        var toBeShown = false;
        if(build.includes('_')){

            if(citJson.xticks[i].includes(build)){
                var TC_Count = 0;
                for(var j in citJson.series){
                    TC_Count += citJson.series[j].values[i].y
                }    
            }

            if(TC_Count > 0){
                items_html += `<div class="item" build='${build}'>
                                    <div class="item-header"><span>${build.substr(1)}&emsp;${date}</span><i class="fas fa-chevron-down"></i></div>
                                    <div class="item-content"></div>
                                </div>`
            }else{
                items_html += `<div class="item">
                                    <div class="item-header" style="background-color: rgb(107, 194, 20)"><span>${build.substr(1)}&emsp;${date}</span><span>All Passed</span></div>
                                </div>`
            }
            

        }
    }
    
    
    const insertionElm = '.navbar-header'
    if($(insertionElm).find(".ext-wrapper").length == 0){
        $(insertionElm).append(`<div class='ext-wrapper'>
                                    <div class='report-stats'>
                                        <div class='stats-view-btn ext-action-btn'>CIT&nbsp;Progress&ensp;<i class='fas fa-chart-bar'></i></div>
                                        <div class="stats-viewer">
                                            <!-- <div class="cases-type unknownn"> <span style="font-size: 0.8em">cases</span></div> -->
                                            <div class="stats-wrapper">
                                                ${items_html}
                                            </div>
                                        </div>
                                    </div>
                                </div>`
        );
        //const header = $('.top-panel .view-title')
        $(insertionElm+" .ext-wrapper .report-stats .stats-viewer").hide();
        $(insertionElm+' .ext-wrapper .report-stats .stats-view-btn').on("click", (event) => {
            // console.log("Team progress click detected")
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

    $(insertionElm+" .ext-wrapper .stats-viewer .item .item-header i").on('click', function(){
        function reset(){
            $(insertionElm+" .ext-wrapper .stats-viewer .item .item-header i").addClass('fa-chevron-down'); $(insertionElm+" .ext-wrapper .stats-viewer .item .item-header i").removeClass('fa-chevron-up');
            $(insertionElm+" .ext-wrapper .stats-viewer .item .item-header i").find('item-content').hide();
        }
        if($(this).hasClass('fa-chevron-down')){//open
            // reset();
            $(this).addClass('fa-chevron-up'); $(this).removeClass('fa-chevron-down');
            $(this).parent().parent().children('item-content').show();
        }else{//close
            $(this).addClass('fa-chevron-down'); $(this).removeClass('fa-chevron-up');
            $(this).find('item-content').hide();
        }
        var build = $(this).parent().attr('build')
        var output  = '';
        for(var i in citJson.xticks){
            if(citJson.xticks[i].includes(build)){
                for(var j in citJson.series){
                    if(citJson.series[j].values[i].y > 0){
                        switch(citJson.series[j].key){
                            case 'No Run':
                                console.log(citJson.xticks[i] +" -(norun)-> "+ citJson.series[j].values[i].y);
                                break;
                            case 'Environment Issue':
                                console.log(citJson.xticks[i] +" -(Env Issue)-> "+ citJson.series[j].values[i].y);
                                break;
                            case 'Not Analyzed':
                                console.log(citJson.xticks[i] +" -(Not Analysed)-> "+ citJson.series[j].values[i].y);
                                break;
                            case 'Failed':
                                console.log(citJson.xticks[i] +" -(Failed)-> "+ citJson.series[j].values[i].y);
                            // case 'Passed':
                                break;

                        }
                    }
                    
                }
                break;
            }
        }
    })
    // console.log(get_TC_Stats(URL))
}



