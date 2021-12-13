//api: https://rep-portal.wroclaw.nsn-rdnet.net/api/charts/cit_build_progress/?ca__pos_neg=%22RAN_L2_SW_BLR_2%22&from=2021-11-20&promotion__pos_neg=%22CIT%22&swbranch=SRAN+SBTS00+COMMON&to=2021-12-15
const uteHostName = "https://rep-portal.wroclaw.nsn-rdnet.net";

async function citProgress(searchParams){
    var competenceArea = getSearchParam(searchParams, 'ca');
    var ft = getSearchParam(searchParams, 'ft');
    var URL = uteHostName+"/api/charts/cit_build_progress/?ca__pos_neg="+competenceArea+"&from="+ft.split(',')[0]+"&promotion__pos_neg=\"CIT\"&swbranch=SRAN+SBTS00+COMMON"+"&to="+ft.split(',')[1]

    const citJson = await getJsonData(URL);
    for(var i in citJson.xticks){
        var build = citJson.xticks[i].split(" ")[0];
        var date = citJson.xticks[i].split(" ")[1];
        if(build.includes('_')){
            console.log(build);
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
                    <div class="item">
                        <div class="item-header active"><span>2021-12-12&emsp;211211_000014</span><i class="fas fa-chevron-down"></i></div>
                        <div class="item-content">
                            <div class="group">
                                <div class="group_title env-issue">Environmental Issue</div>
                                <table class="stats-table">
                                    <thead>
                                        <tr>
                                            <th>&emsp;</th>
                                            <th>Responsible Tester</th>
                                            <th>TC Count</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="item">
                        <div class="item-header active"><span>2021-12-12&emsp;211211_000014</span></div>
                        <div class="item-content">
                            <div class="group">
                                <div class="group_title env-issue">Environmental Issue</div>
                                <table class="stats-table">
                                    <thead>
                                        <tr>
                                            <th>&emsp;</th>
                                            <th>Responsible Tester</th>
                                            <th>TC Count</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>

                            <div class="group">
                                <div class="group_title env-issue">Environmental Issue</div>
                                <table class="stats-table">
                                    <thead>
                                        <tr>
                                            <th>&emsp;</th>
                                            <th>Responsible Tester</th>
                                            <th>TC Count</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>

                            <div class="group">
                                <div class="group_title env-issue">Environmental Issue</div>
                                <table class="stats-table">
                                    <thead>
                                        <tr>
                                            <th>&emsp;</th>
                                            <th>Responsible Tester</th>
                                            <th>TC Count</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
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
    // console.log(get_TC_Stats(URL))
}

citProgress(window.location.search)

