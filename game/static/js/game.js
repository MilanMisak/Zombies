var instructionsModalShown = false;
var errorModalShown = false;

// Outside the document ready handler for immediate execution
var updateGameInfo = function() {
    $.getJSON('/ajax-game-info', function(data) {
    }).error(function(xhr, status, data) {
        if (errorModalShown)
            return;
        errorModalShown = true;

        if (instructionsModalShown) {
            $('#instructions_modal').modal('hide');
        }

        if ('NO-GAME' === xhr.responseText) {
            $('#error_reason').html('the game was cancelled.');
        } else {
            $('#error_reason').html('your player has been wiped off the server. ' +
                'Are you experiencing any internet connection issues?');
        }

        $('#error_modal').on('hide', function() {
            window.location.replace('/');
        });
        $('#error_modal').modal('show');
    });
};

updateGameInfo();
setInterval(updateGameInfo, 1000);

// Show a modal with instructions
$('#instructions_modal').on('show', function() {
    instructionsModalShown = true;
});
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

    var green = 'btn-success';  // Not pressed
    var yellow = 'btn-warning'; // Pressed

    // Toggles a button with a given selector
    var toggle = function(aux, selector) {
        replaceClass(selector, green, yellow);
    };

    // Untoggles a button with a given selector 
    var untoggle = function(aux, selector) {
        replaceClass(selector, yellow, green);
    };

    // Checks if a button is toggled
    var isToggled = function(selector) {
        return $(selector).hasClass(yellow);
    };

    // Checks if a button is disabled
    var isDisabled = function(obj) {
        return obj != undefined && $(obj).hasClass('disabled');
    };

    // Action buttons
    var actionIDs = ['#btn_move', '#btn_barricade', '#btn_shoot', '#btn_reload'];
    var untoggleActionButtons = function(e) {
        if (isDisabled(this))
            return;
        $.each(actionIDs, untoggle);
        if (this != undefined)
            toggle(null, '#' + $(this).attr('id'));
        return false;
    };
    $.each(actionIDs, function(i, v) {
        $(v).click(untoggleActionButtons);
    });

    // Arrow buttons
    var arrowIDs = ['#btn_arrow_left', '#btn_arrow_up', '#btn_arrow_right', '#btn_arrow_down'];
    var untoggleArrowButtons = function(e) {
        if (isDisabled(this))
            return;
        $.each(arrowIDs, untoggle);
        if (this != undefined)
            toggle(null, '#' + $(this).attr('id'));
        return false;
    };
    $.each(arrowIDs, function(i, v) {
        $(v).click(untoggleArrowButtons);
    });

    // Disabling and enabling the arrow buttons depending on the selected action
    $('#btn_move, #btn_barricade, #btn_shoot').click(function() {
        $.each(arrowIDs, function(i, v) {
             $(v).removeClass('disabled');
        });
    });
    $('#btn_reload').click(function() {
        $.each(arrowIDs, function(i, v) {
             $(v).addClass('disabled');
             untoggle(null, v);
        });
    });
    
    // A callback for enabling the GO button and flashing action instructions
    var enableGoAndFlashActionInstructions = function(e) {
        if (this == undefined)
            return;
        if ($(this).attr('id') != 'btn_reload') {
            $('#btn_arrow_go').addClass('disabled');
            $('#instruction_label').html('Pick a direction and click GO');
        } else {
            $('#btn_arrow_go').removeClass('disabled');
            $('#instruction_label').html('Click GO');
        }
        $('#instruction_label').fadeIn();
        $('#instruction_label').fadeOut(1000);
    };
    $.each(actionIDs, function(i, v) {
        $(v).click(enableGoAndFlashActionInstructions);
    });

    // Flashes arrow instructions
    var flashArrowInstructions = function(e) {
        if (isDisabled(this))
            return;
        $('#instruction_label').html('Click GO');
        $('#instruction_label').fadeIn();
        $('#instruction_label').fadeOut('slow');
        $('#btn_arrow_go').removeClass('disabled');
    };
    $.each(arrowIDs, function(i, v) {
        $(v).click(flashArrowInstructions); 
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

    // Enable a button
    var enable = function(aux, selector) {
        $(selector).removeClass('disabled');
        if (isToggled(selector))
            untoggle(null, selector);
    };
    
    // Disable a button
    var disable = function(aux, selector) {
        $(selector).addClass('disabled');
        if (isToggled(selector))
            untoggle(null, selector);
    };

    // The GO action
    $('#btn_arrow_go').click(function(e) {
        if (isDisabled(this))
            return;
        
        //TODO 

        $.each(actionIDs, enable);
        $.each(arrowIDs, disable);
        
        $('#btn_arrow_go').addClass('disabled');

        return false;
    });
});
