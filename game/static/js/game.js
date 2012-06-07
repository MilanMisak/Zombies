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

    // Show a modal with instructions
    $('#instructions_modal').modal('show');

    // Disable page scrolling
    $(document).keydown(function(e) {
        if (e.keyCode >= 37 && e.keyCode <= 40)
            return false;
    });

    // Replaces a class of a given object
    var replaceClass = function(obj, whatClass, withClass) {
        var classes = $(obj).attr('class');
        $(obj).attr('class', classes.replace(whatClass, withClass));
    };

    // Action buttons
    var actionButtons = '#btn_move, #btn_barricade, #btn_shoot, #btn_reload';
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
    $(actionButtons).click(untoggleActionButtons);

    // Arrow buttons
    var arrowButtons = '#btn_arrow_left, #btn_arrow_up, #btn_arrow_right, #btn_arrow_down';
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
    $(arrowButtons).click(untoggleArrowButtons);

    // Disabling and enabling the arrow buttons depending on the selected action
    $('#btn_move, #btn_barricade, #btn_shoot').click(function() {
        $(arrowButtons).removeClass('disabled');
    });
    $('#btn_reload').click(function() {
        $(arrowButtons).removeClass('btn-warning').addClass('disabled btn-success');
    });
    
    // Enabling the GO button
    $(actionButtons).click(function() {
        $('#btn_arrow_go').removeClass('disabled');
    });
});
