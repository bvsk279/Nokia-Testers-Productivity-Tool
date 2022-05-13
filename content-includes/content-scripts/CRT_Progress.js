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

var cell_styles = "border: 1px solid #ccc; padding: 3px 5px; line-height: 20px;";
var table_styles = "width: 350px; border-collapse: collapse; border: 1px solid #ccc;";
var totalTestsURL = null

async function get_CRT_GroupHtml(url, className, title, userSettings){
    if(url == null) return '';
    var bg_style = "background-color:";
    bg_style += (className == 'no-run') ? "#ccc"
                : (className == 'passed') ? "rgb(107, 194, 20)"
                : (className == 'failed') ? "red"
                : (className == 'cloud') ? "#48eaea"
                : "#111";


    let reportApi = (URL) =>{ 
        return uteHostName+'/api/qc-beta/instances/report/?'+'id__in='+getSearchParam(URL.split('?')[1], 'id')+'&fields=res_tester&limit=1000&extension_request=true';
    }

    var statsHTML = await get_TC_Stats(reportApi(url), userSettings)
    var dom_nodes = $($.parseHTML(statsHTML));
    // console.log(dom_nodes.html());
    var count = dom_nodes.find('tr:last-child>td:last-child>b').html();
    dom_nodes.find("tr>td, tr>th").each(function(){
        $(this).attr('style', cell_styles)
    })
    dom_nodes.find('tr:last-child').remove();

    //Show TC % that are cloudified - Count & TC % (ex: 60 - 89%) 
    if(className == 'cloud' && userSettings.repPortal.crt_chart_page.display_categories.includes("crt_"+className) && totalTestsURL){
        var totalJson = await getTotalTCsJson(reportApi(totalTestsURL))
        // console.log(totalJson)

        var names = []
        for(var i in totalJson){
            var name = totalJson[i].res_tester;
            if(name) names.push(name)
        }
        var map = names.reduce(function(p, c) {p[c] = (p[c] || 0) + 1; return p }, {});
        // var sortedNames = Object.keys(map).sort(function(a, b) {return map[b] - map[a] });
        // console.log(sortedNames)
        for(var i = 0; i<dom_nodes.find('tr').length; i++){
            var tester = dom_nodes.find('tr').eq(i).find('td.tester-name').html()
            var cloudCount = dom_nodes.find('tr').eq(i).find('td:last-child').html()
            var totalCount = parseInt(map[tester])
            var cloudifiedPercent = ((cloudCount / totalCount)*100).toFixed(0)
            dom_nodes.find('tr').eq(i).find('td').eq(1).html(`<span title='Clouded Cases'>${cloudCount}</span>/<span title='Total Cases'>${totalCount}</span> <span style="font-size: 0.9em" title='Cloudified Percentage'>&nbsp;(${cloudifiedPercent}<span style="font-size: 0.8em">%</span>)</span>`)
        }
    }

    var groupHTML = ``
    if(statsHTML){
        var grp_title_styles = "font-weight: bold; padding: 2px 10px; width: 100%; padding-top: 5px";
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

    // https://rep-portal.wroclaw.nsn-rdnet.net/charts/tep/?period=day&test_cycle=twice%20per%20Feature%20Build%20(2%20weeks%20%2B%20rest)&releases=RAN00&regression_status=rg_CIT,rg_CRT,nf_CIT,nf_CRT&ca=%22RAN_L2_SW_BLR_2%22&det_auto_lvl=-%2299%20-%20Planned%22
    // https://rep-portal.wroclaw.nsn-rdnet.net/api/charts/tep/?&det_auto_lvl__pos_neg=-%2299+-+Planned%22&period=day&regression_status__name__pos_neg=rg_CIT,rg_CRT,nf_CIT,nf_CRT&releases=RAN00&test_cycle=twice+per+Feature+Build+(2+weeks+%2B+rest)
    var URL =  `${uteHostName}/api/charts/tep/?ca__pos_neg=${competenceArea}&det_auto_lvl__pos_neg=${det_auto_lvl}&period=${period}&regression_status__name__pos_neg=${regression_status}&releases=${releases}&test_cycle=twice%20per%20Feature%20Build%20(2%20weeks%20%2B%20rest)`

    const citJson = await getJsonData(URL);
    var seriesData = [];
    var series = {noRun:null, failed:null, passed:null, cloud:null, total:null, cloudified:null}
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
            case 'Cloud':
                series.cloud = citJson.series[i]
                break;
            case 'Total':
                series.total = citJson.series[i]
                break;
            case 'Cloud Test Ratio':
                series.cloudified = citJson.series[i]
                break;
        }
    }
    if(series.noRun) seriesData.push(series.noRun)
    if(series.failed) seriesData.push(series.failed)
    if(series.passed) seriesData.push(series.passed)
    if(series.cloud) seriesData.push(series.cloud)
    if(series.total) seriesData.push(series.total)
    if(series.cloudified) seriesData.push(series.cloudified)
    
    citJson.series = seriesData;

    var item_hdr_styles = `padding: 5px 8px; font-weight: bold; background-color: #636363 !important; color: #fcfcfc; min-width: 350px; border-top: 1px solid #ccc`
    var items_html = ``;

    // Getting CRT Last FB details
    const cit_passed_series = citJson.series.filter((category) => category.key.toLowerCase() === "passed")[0]
    let last_FB_xtick = 0;
    let lastCount = 1000000;
    for(let j = cit_passed_series.values.length-1; j>=0; j--){
        let value = cit_passed_series.values[j]
        if(value.y > lastCount){
            last_FB_xtick = value.x;
            break
        }
        lastCount = value.y;
    }
    const xticks = [citJson.xticks[last_FB_xtick], citJson.xticks[citJson.xticks.length - 1]]

    xticks.forEach((date) => {
        let index = citJson.xticks.indexOf(date);
        var TC_Count = 0;
        for(var j in citJson.series){
            TC_Count += citJson.series[j].values[index].y
        }

        if(TC_Count > 0){
            items_html += `<div class="item" date="${date}">
                                <div class="item-header" style="${item_hdr_styles}"><span>${citJson.xticks[index]}&ensp;${xticks.indexOf(date) == 0 ? 'Last&nbsp;FB' : 'Current'}&nbsp;Status</span><i class="fas fa-chevron-up"></i></div>
                                <div class="item-content">
                                    <div style="text-align: center"><i class="fa fa-spinner fa-spin" style="font-size:24px"></i></div>
                                </div>
                            </div>`
        }else{
            items_html += `<div class="item" date="${date}">
                                <div class="item-header" style="background-color: rgb(107, 194, 20)"><span>${citJson.xticks[index]}&ensp;CRT Status</span> <span>All Passed</span></div>
                            </div>`
        }
    })



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
                $(insertionElm+" .ext-wrapper .stats-viewer .item:last-child .item-header").click();
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

        var date = $(this).parent().attr('date')
        var output  = '<div class="item-content_wrapper">';

        let index = citJson.xticks.indexOf(date);
        // if(index < citJson.xticks.length-1){
            let count = {noRun: 0, failed: 0, passed: 0, cloud: 0, total: 0, cloudified: 0 }
            let URL = {noRun: '', failed: '', passed: '', cloud: ''}

            citJson.series.map((item) => {
                let category = item.key;
                switch(category.toLowerCase()){
                    case 'no run':
                        count.noRun = item.values[index].y;
                        URL.noRun = item.values[index].url;
                        break;
                    case 'failed':
                        count.failed = item.values[index].y;
                        URL.failed = item.values[index].url;
                        break;
                    case 'passed':
                        count.passed = item.values[index].y;
                        URL.passed = item.values[index].url;
                        break;
                    case 'cloud':
                        count.cloud = item.values[index].y;
                        URL.cloud = item.values[index].url;
                        break;
                    case 'total':
                        count.total = item.values[index].y;
                        URL.total = item.values[index].url;
                        totalTestsURL = URL.total
                        break;
                    case 'cloud test ratio':
                        cloudified = item.values[index].y;
                        break;
                }
            })
            output+= `<div class="group" style="font-size: 0.9em">
                        <table class="stats-table statistics" style="font-size: 1.1em; ${table_styles}">
                            <!-- <thead> 
                                <tr>
                                    <th style="${cell_styles}" colspan='2'>STATS</th>
                                </tr>
                            </thead> -->
                            <tbody>
                                <tr><td><div class="color-palette no-run"></div><p><a href='${URL.noRun}' target='_blank'>No Run TC's</a></p></td><td>${count.noRun}</td></tr>
                                <tr><td><div class="color-palette failed"></div><p><a href='${URL.failed}' target='_blank'>Failed TC's</a></p></td><td>${count.failed}</td></tr>
                                <tr><td><div class="color-palette passed"></div><p><a href='${URL.passed}' target='_blank'>Passed TC's</a></p></td><td>${count.passed}</td></tr>
                                <tr><td><div class="color-palette cloud"></div><p><a href='${URL.cloud}' target='_blank'>Cloud TC's</a></p></td><td>${count.cloud}</td></tr>
                                <tr><td><div class="color-palette total"></div><p><a href='${URL.total}' target='_blank'>Total TC's</a></p></td><td>${count.total}</td></tr>
                                <tr><td><p><b>Cloudified Ratio</b></p></td><td>${cloudified+' %'}</td></tr>
                            </tbody>
                        </table>
                    </div>`
        // }
        
        if(citJson.xticks[index]){
            for(var j in citJson.series){
                if(citJson.series[j].values[index].y > 0){
                    switch(citJson.series[j].key){
                        case 'No Run':
                            output += await get_CRT_GroupHtml(citJson.series[j].values[index].url, "no-run", "No Run", userSettings)
                            break;
                        case 'Failed':
                            output += await get_CRT_GroupHtml(citJson.series[j].values[index].url, "failed", "Failed", userSettings)
                            break;
                        case 'Passed':
                            output += await get_CRT_GroupHtml(citJson.series[j].values[index].url, "passed", "Passed", userSettings)
                            break;
                        case 'Cloud':
                            output += await get_CRT_GroupHtml(citJson.series[j].values[index].url, "cloud", "Cloud", userSettings)
                            break;
                    }
                }
            }
        }

        output += '</div>'
        $(this).parent().find('.item-content').show()
        $(this).parent().find('.item-content').html(output)
        $(this).parent().find('.item-content table').css('width', '100%')

        $(this).parent().find('table.stats-table tbody>tr>td:nth-child(2)').on('click', function(){
            if($(this).parent().parent().parent().hasClass('statistics')) return false;
            var tester = $(this).html();
            var URL = $(this).parent().parent().attr('url')
            window.open(URL+"&res_tester="+tester, '_blank')
        })
    })
}