// Outside the document ready handler for immediate execution
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

$(document).ready(function() {
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
    
    // Enabling the GO button and flashing action instructions
    $(actionButtons).click(function(e) {
        if (this != undefined) {
            if ($(this).attr('id') != 'btn_reload') {
                $('#btn_arrow_go').addClass('disabled');
                $('#instruction_label').html('Pick a direction and click GO');
            } else {
                $('#btn_arrow_go').removeClass('disabled');
                $('#instruction_label').html('Click GO');
            }
            $('#instruction_label').fadeIn();
            $('#instruction_label').fadeOut(1000);
        }
    });

    // Flashing arrow instructions
    $(arrowButtons).click(function(e) {
        $('#instruction_label').html('Click GO');
        $('#instruction_label').fadeIn();
        $('#instruction_label').fadeOut('slow');
        $('#btn_arrow_go').removeClass('disabled');
    });

    // Showing the instructions modal
    $('#btn_show_instructions').click(function() {
        $('#instructions_modal').modal();
        return false;
    });

    // Flashing the select action instruction
    $('#instructions_modal').on('hidden', function() {
        $('#instruction_label').html('Select an action');
        $('#instruction_label').fadeIn();
        $('#instruction_label').fadeOut('slow');
    });

    // The GO action
    $('#btn_arrow_go').click(function() {
        //TODO 

        $(actionButtons).removeClass('disabled');
        for (var id in actionIDs) {
            var actionID = actionIDs[id];
            if ($(actionID).hasClass('btn-warning')) {
                replaceClass(actionID, 'btn-warning', 'btn-success');
            }
        }

        $(arrowButtons).addClass('disabled');
        for (var id in arrowIDs) {
            var arrowID = arrowIDs[id];
            if ($(arrowID).hasClass('btn-warning')) {
                replaceClass(arrowID, 'btn-warning', 'btn-success');
            }
        }

        $('#btn_arrow_go').addClass('disabled');

        return false;
    });
});
