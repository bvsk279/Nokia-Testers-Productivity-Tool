window.CRT_STATUS_CLICK = false;

function getCurrentTime() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

async function get_CRT_GroupHtml(url, className, title, userSettings){
    var params = url.split('?')[1]
    var bg_style = "background-color:";
    bg_style += (className == 'no-run') ? "#ccc"
                : (className == 'passed') ? "rgb(107, 194, 20)"
                : (className == 'failed') ? "red"
                : "#111"

    let reportApi = uteHostName+'/api/qc-beta/instances/report/?'+'id__in='+getSearchParam(params, 'id')+'&fields=res_tester&limit=1000&extension_request=true';
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
        if(userSettings.repPortal.crt_chart_page.display_categories.includes("crt_"+className)){
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
        }else{
            groupHTML += `<div class="group" style="font-size: 0.9em" title="Turn On - Display Passed Cases Category in Settings to Show the List">
                        <div class="group_title ${className}" style="${grp_title_styles};${bg_style}"><span>${title} cases exists &ensp;(&nbsp;${count}&nbsp;)</span></div>
                    </div>`
        }
        
    }
    
    return groupHTML;
}

async function crtProgress(searchParams, userSettings){
    let competenceArea = getSearchParam(searchParams, 'ca');
    let releases = getSearchParam(searchParams, 'releases');
    let det_auto_lvl = getSearchParam(searchParams, 'det_auto_lvl')

    let period = getSearchParam(searchParams, 'period')
    let regression_status = getSearchParam(searchParams, 'regression_status')
    let test_cycle = getSearchParam(searchParams, 'test_cycle')

    https://rep-portal.wroclaw.nsn-rdnet.net/charts/tep/?period=day&test_cycle=twice%20per%20Feature%20Build%20(2%20weeks%20%2B%20rest)&releases=RAN00&regression_status=rg_CIT,rg_CRT,nf_CIT,nf_CRT&ca=%22RAN_L2_SW_BLR_2%22&det_auto_lvl=-%2299%20-%20Planned%22
    // https://rep-portal.wroclaw.nsn-rdnet.net/api/charts/tep/?&det_auto_lvl__pos_neg=-%2299+-+Planned%22&period=day&regression_status__name__pos_neg=rg_CIT,rg_CRT,nf_CIT,nf_CRT&releases=RAN00&test_cycle=twice+per+Feature+Build+(2+weeks+%2B+rest)
    var URL =  `${uteHostName}/api/charts/tep/?ca__pos_neg=${competenceArea}&det_auto_lvl__pos_neg=${det_auto_lvl}&period=${period}&regression_status__name__pos_neg=${regression_status}&releases=${releases}&test_cycle=twice%20per%20Feature%20Build%20(2%20weeks%20%2B%20rest)`

    const citJson = await getJsonData(URL);
    var seriesData = [];
    var series = {noRun:null, failed:null, passed:null}
    for(var i in citJson.series){
        switch(citJson.series[i].key){
            case 'No Run':
                series.noRun = citJson.series[i]
                break;
            case 'Failed':
                series.failed = citJson.series[i]
                break;
            case 'Passed':
                series.passed = citJson.series[i]
                break;
        }
    }
    if(series.noRun) seriesData.push(series.noRun)
    if(series.failed) seriesData.push(series.failed)
    if(series.passed) seriesData.push(series.passed)
    
    citJson.series = seriesData;

    var item_hdr_styles = `padding: 5px 8px; font-weight: bold; background-color: #636363 !important; color: #fcfcfc; min-width: 350px; border-top: 1px solid #ccc`
    var items_html = ``;



    const last_xtick = citJson.xticks.length - 1;

    var TC_Count = 0;
    for(var j in citJson.series){
        TC_Count += citJson.series[j].values[last_xtick].y
    }

    if(TC_Count > 0){
        items_html += `<div class="item">
                            <div class="item-header" style="${item_hdr_styles}"><span>${citJson.xticks[last_xtick]}&ensp;CRT Status</span><i class="fas fa-chevron-up"></i></div>
                            <div class="item-content">
                                <div style="text-align: center"><i class="fa fa-spinner fa-spin" style="font-size:24px"></i></div>
                            </div>
                        </div>`
    }else{
        items_html += `<div class="item">
                            <div class="item-header" style="background-color: rgb(107, 194, 20)"><span>${citJson.xticks[last_xtick]}&ensp;CRT Status</span> <span>All Passed</span></div>
                        </div>`
    }





    const insertionElm = '.navbar-header'
    if($(insertionElm).find(".ext-wrapper").length == 0){
        $(insertionElm).append(`<div class='ext-wrapper cit-progress'>
                                    <div class='report-stats'>
                                        <div class='stats-view-btn ext-action-btn'>Current CRT ${releases ? releases.substr(0,5)+`${releases.length > 5 ? "..." : ''}` : ''} Status&ensp;<i class='fas fa-chart-bar'></i></div>
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
            if(window.CRT_STATUS_CLICK == false){
                $(insertionElm+" .ext-wrapper .stats-viewer .item .item-header").click();
                window.CRT_STATUS_CLICK = true
            }
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

    $(insertionElm+" .ext-wrapper .stats-viewer .item .item-header").on("click", async function(){
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

        var output  = '<div class="item-content_wrapper">';

        const last_xtick = citJson.xticks.length - 1;

        if(citJson.xticks[last_xtick]){
            for(var j in citJson.series){
                if(citJson.series[j].values[last_xtick].y > 0){
                    const lastElement = citJson.series[j].values.length-1;
                    switch(citJson.series[j].key){
                        case 'No Run':
                            output += await get_CRT_GroupHtml(citJson.series[j].values[lastElement].url, "no-run", "No Run", userSettings)
                            break;
                        case 'Failed':
                            output += await get_CRT_GroupHtml(citJson.series[j].values[lastElement].url, "failed", "Failed", userSettings)
                            break;
                        case 'Passed':
                            output += await get_CRT_GroupHtml(citJson.series[j].values[lastElement].url, "passed", "Passed", userSettings)
                            break;
                    }
                }
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