//https://rep-portal.wroclaw.nsn-rdnet.net/api/qc/instances/?fields=test_suite&id=15013335
function generateRobotFileCopyBtn(hostName){
    $('.ag-header-viewport .ag-header-cell .display-name').each(function(index){
        if($(this).html() == 'Name'){
            $('.ag-center-cols-clipper [role="rowgroup"] [role="row"]').each(async function(rowIndex){
                if($(this).find('.ag-cell').eq(index).find('.ag-cell-wrapper .robot-file-copy-btn').length == 0){
                    var tiName = $(this).find('.ag-cell').eq(index).find('a').html()
                    var link = $(this).find('.ag-cell').eq(index).find('a').attr('href');
                    var instanceId = (link.split('details/')[1]).replaceAll('/', '');
                    var url = "https://"+hostName+"/api/qc/instances/?fields=test_suite&id="+instanceId;
                    var resultJson = await getJsonData(url);
                    var robotFilePath = resultJson[0].test_suite
                    var robotCopyBtnHtml = (robotFilePath && robotFilePath != "") ? '<a onclick="return false;" href="https://verify.this/'+tiName+'" class="robot-file-copy-btn" title="Copy Robot File Path"><i class="far fa-copy"></i></a>'
                                                            : '<a onclick="return false;" href="#" class="robot-file-copy-btn no-path" title="No Robot File Path"><i class="fas fa-ban"></i></a>'
                    
                    $(this).find('.ag-cell').eq(index).find('.ag-cell-wrapper').append(robotCopyBtnHtml)
                    $(this).find('.ag-cell').eq(index).find('.ag-cell-wrapper .robot-file-copy-btn').on('click', function(){
                        extExecCopy(robotFilePath)
                        if(!$(this).hasClass('no-path')) sendMessage('Robot File Path Copied!', '.main-container', 'font-size:0.9em')
                        else sendMessage('No Robot File Path is Copied!', '.main-container', 'font-size:0.9em')
                    })
                }
                if(rowIndex >= 2){ //requests overloading fail safe
                    return false;
                }
            })
            return false;
        }
    })
}