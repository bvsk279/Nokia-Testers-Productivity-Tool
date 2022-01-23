//api: https://rep-portal.wroclaw.nsn-rdnet.net/api/charts/cit_build_progress/?ca__pos_neg=%22RAN_L2_SW_BLR_2%22&from=2021-11-20&promotion__pos_neg=%22CIT%22&swbranch=SRAN+SBTS00+COMMON&to=2021-12-15

//CIT Individual report: https://rep-portal.wroclaw.nsn-rdnet.net/api/qc-beta/instances/report/?build=SBTS00_ENB_9999_211213_000005&cit_id=:hash:55d5f8933c916e93ea03f743159ea204&fields=res_tester&limit=1000
const uteHostName = "https://rep-portal.wroclaw.nsn-rdnet.net";

// async function buildItemHtml(url){
//     var params = url.split('?')

//     let reportApi = uteHostName+'/api/qc-beta/instances/report/?build='+getSearchParam(params, 'build')+'&cit_id='+getSearchParam(params, 'cit_id')+'&fields=res_tester&limit=1000';
//     let data = await getJsonData(reportApi);
//     return 

// }

async function getGroupHtml(url, className, title, userSettings){
    var params = url.split('?')[1]
    var bg_style = "background-color:";
    bg_style += (className == 'no-run') ? "#ccc"
                : (className == 'env-issue') ? "#9E229C"
                : (className == 'not-analyzed') ? "#FF9233"
                : (className == 'failed') ? "red"
                : "#111"

    let reportApi = uteHostName+'/api/qc-beta/instances/report/?build='+getSearchParam(params, 'build')+'&cit_id='+getSearchParam(params, 'cit_id')+'&fields=res_tester&limit=1000&extension_request=true';
    // console.log(reportApi);
    var statsHTML = await get_TC_Stats(reportApi, userSettings)
    var dom_nodes = $($.parseHTML(statsHTML));
    // console.log(dom_nodes.html());
    var count = dom_nodes.find('tr:last-child>td:last-child>b').html();
    var cell_styles = "border: 1px solid #ccc; padding: 3px 5px; line-height: 20px;";
    dom_nodes.find("tr>td, tr>th").each(function(){
        $(this).attr('style', cell_styles)
    })
    dom_nodes.find('tr:last-child').remove();
    var groupHTML = ``
    if(statsHTML){
        var grp_title_styles = "font-weight: bold; padding: 2px 10px; width: 100%; padding-top: 5px";
        var table_styles = "width: 350px; border-collapse: collapse; border: 1px solid #ccc;";
        groupHTML += `<div class="group" style="font-size: 0.9em">
                        <div class="group_title ${className}" style="${grp_title_styles};${bg_style}"><span>${title}&ensp;(&nbsp;${count}&nbsp;)</span> &ensp; <a target='_blank' href='${uteHostName}${url}' style='color:inherit; padding: 3px 5px'><i class="fas fa-link"></i></a></div>
                        <table class="stats-table" style="font-size: 1.1em; ${table_styles}">
                            <thead> 
                                <tr>
                                    <th style="${cell_styles}">&emsp;</th>
                                    <th style="${cell_styles}">Responsible Tester</th>
                                    <th style="${cell_styles}">TI Count</th>
                                </tr>
                            </thead>
                            <tbody url="${url}">
                                ${dom_nodes.html()}
                            </tbody>
                        </table>
                    </div>`
    }
    
    return groupHTML;
}

async function citProgress(searchParams, userSettings){
    var competenceArea = getSearchParam(searchParams, 'ca');
    var ft = getSearchParam(searchParams, 'ft');

    var swbranch = getSearchParam(searchParams, 'swbranch')
    var branch = getSearchParam(searchParams, 'branch')
    var build = ""
    if(swbranch) build = "swbranch="+swbranch
    else if(branch) build = "branch="+branch
    var URL = uteHostName+"/api/charts/cit_build_progress/?ca__pos_neg="+competenceArea+"&from="+ft.split(',')[0]+"&promotion__pos_neg=\"CIT\"&"+build+"&to="+ft.split(',')[1]

    const citJson = await getJsonData(URL);
    var seriesData = [];
    var series = {noRun:null, envIssue:null, notAnalyzed:null, failed:null, blocked:null}
    for(var i in citJson.series){
        switch(citJson.series[i].key){
            case 'No Run':
                series.noRun = citJson.series[i]
                break;
            case 'Environment Issue':
                series.envIssue = citJson.series[i]
                break;
            case 'Not Analyzed':
                series.notAnalyzed = citJson.series[i]
                break;
            case 'Failed':
                series.failed = citJson.series[i]
                break;
            case 'Blocked':
                series.blocked = citJson.series[i]
                break;
        }
    }
    if(series.noRun) seriesData.push(series.noRun)
    if(series.envIssue) seriesData.push(series.envIssue)
    if(series.notAnalyzed) seriesData.push(series.notAnalyzed)
    if(series.failed) seriesData.push(series.failed)
    if(series.blocked) seriesData.push(series.blocked)
    

    citJson.series = seriesData;
    // console.log(citJson);

    var item_hdr_styles = `padding: 5px 8px; font-weight: bold; background-color: #636363 !important; color: #fcfcfc; min-width: 350px; border-top: 1px solid #ccc`
    var items_html = ``;
    for(var i in citJson.xticks){
        var build = citJson.xticks[i].split(" ")[0];
        var date = citJson.xticks[i].split(" ")[1];
        //     const months = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sep','Oct','Nov','Dec'];
        //     var dateSplit = date.split('-')
        //     var dateFormat = dateSplit[2]+'-'+months[parseInt(dateSplit[1])-1]+'-'+dateSplit[0]
        // var toBeShown = false;
        if(build.includes('_')){

            if(citJson.xticks[i].includes(build)){
                var TC_Count = 0;
                for(var j in citJson.series){
                    TC_Count += citJson.series[j].values[i].y
                }
            }

            if(TC_Count > 0){
                items_html += `<div class="item" build='${build}'>
                                    <div class="item-header" style="${item_hdr_styles}"><span>${build.substr(1)}&emsp;${date}</span><i class="fas fa-chevron-up"></i></div>
                                    <div class="item-content">
                                        <div style="text-align: center"><i class="fa fa-spinner fa-spin" style="font-size:24px"></i></div>
                                    </div>
                                </div>`
            }else{
                items_html += `<div class="item">
                                    <div class="item-header" style="background-color: rgb(107, 194, 20)"><span>${build.substr(1)}&emsp;${date}</span><span>All Passed</span></div>
                                </div>`
            }

        }
    }

    function getCurrentTime() {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        minutes = minutes < 10 ? '0'+minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }
    
    const insertionElm = '.navbar-header'
    if($(insertionElm).find(".ext-wrapper").length == 0){
        $(insertionElm).append(`<div class='ext-wrapper cit-progress'>
                                    <div class='report-stats'>
                                        <div class='stats-view-btn ext-action-btn'>CIT&nbsp;Progress&ensp;<i class='fas fa-chart-bar'></i></div>
                                        <div class="stats-viewer">
                                            <div class="cases-type" style="text-transform:unset; display: block">Last Loaded At <span>${getCurrentTime()}</span></div>
                                            <div class="stats-wrapper" style="width:100%; max-width:500px">
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

    $(insertionElm+" .ext-wrapper .stats-viewer .item .item-header").on('click', async function(){
        if(!navigator.onLine){
            alert("Please Check Your Internet Connection!");
        }
        
        function reset(){
            $(insertionElm+" .ext-wrapper .stats-viewer .item .item-header i").addClass('fa-chevron-down'); $(insertionElm+" .ext-wrapper .stats-viewer .item .item-header i").removeClass('fa-chevron-up');
            $(insertionElm+" .ext-wrapper .stats-viewer .item .item-header i").find('item-content').hide();
        }
        if($(this).find('i').hasClass('fa-chevron-up')){//open
            // reset();
            $(this).find('i').addClass('fa-chevron-down'); $(this).find('i').removeClass('fa-chevron-up');
            $(this).parent().children('.item-content').show('fast');
            if($(this).parent().find('.item-content .group').length > 0) return
        }else{//close
            $(this).find('i').addClass('fa-chevron-up'); $(this).find('i').removeClass('fa-chevron-down');
            $(this).parent().children('.item-content').hide('fast');
            return;
        }
        var build = $(this).parent().attr('build')
        var output  = '<div class="item-content_wrapper">';
        for(var i in citJson.xticks){
            if(citJson.xticks[i].includes(build)){
                for(var j in citJson.series){
                    if(citJson.series[j].values[i].y > 0){
                        switch(citJson.series[j].key){
                            case 'No Run':
                                output += await getGroupHtml(citJson.series[j].values[i].url, "no-run", "No Run", userSettings)
                                break;
                            case 'Environment Issue':
                                output += await getGroupHtml(citJson.series[j].values[i].url, "env-issue", "Environment Issue", userSettings)
                                break;
                            case 'Not Analyzed':
                                output += await getGroupHtml(citJson.series[j].values[i].url, "not-analyzed", "Not Analyzed", userSettings)
                                break;
                            case 'Failed':
                                output += await getGroupHtml(citJson.series[j].values[i].url, "failed", "Failed", userSettings)
                            // case 'Passed':
                                break;
                        }
                    }
                }
                break;
            }
        }
        output += '</div>'
        $(this).parent().find('.item-content').show()
        $(this).parent().find('.item-content').html(output)
        $(this).parent().find('.item-content table').css('width', '100%')

        $(this).parent().find('table tbody>tr>td:nth-child(2)').on('click', function(){
            var tester = $(this).html();
            var URL = $(this).parent().parent().attr('url')
            window.open(URL+"&res_tester="+tester, '_blank')
        })
    })

}