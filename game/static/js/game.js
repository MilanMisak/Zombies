$(document).ready(function() {
    var updateGameInfo = function() {
        $.getJSON('/ajax-game-info', function(data) {
        }).error(function(xhr, status, data) {
            alert('Oops! An error has occurred.');
            window.location.replace('/');
        });
    };

    updateGameInfo();
    setInterval(updateGameInfo, 1000);

    $('#instructions_modal').modal('show');

    var replaceClass = function(obj, whatClass, withClass) {
        var classes = $(obj).attr('class');
        $(obj).attr('class', classes.replace(whatClass, withClass));
    };

    // Action buttons
    var actionIDs = ['#btn_move', '#btn_barricade', '#btn_shoot', '#btn_reload'];
    var untoggleActionButtons = function(e) {
        for (var id in actionIDs) {
            var actionID = actionIDs[id];
            if ($(actionID).hasClass('btn-warning')) {
                replaceClass(actionID, 'btn-warning', 'btn-success');
            }
        }
        if (this != undefined)
            replaceClass(this, 'btn-success', 'btn-warning');
        return false;
    };
    $('.control_btn_left, .control_btn_right').click(untoggleActionButtons);

    // Arrow buttons
    var arrowIDs = ['#btn_arrow_left', '#btn_arrow_up', '#btn_arrow_right', '#btn_arrow_down'];
    var untoggleArrowButtons = function(e) {
        for (var id in arrowIDs) {
            var arrowID = arrowIDs[id];
            if ($(arrowID).hasClass('btn-warning')) {
                replaceClass(arrowID, 'btn-warning', 'btn-success');
            console.log('untoggling ' + arrowID + ' ' + id);
            }
        }
        if (this != undefined)
            replaceClass(this, 'btn-success', 'btn-warning');
        return false;
    };
    $('#btn_arrow_left, #btn_arrow_up, #btn_arrow_right, #btn_arrow_down').click(untoggleArrowButtons);
});
