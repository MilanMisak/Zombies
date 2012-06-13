$(document).ready(function() {
    // Disable page scrolling with arrow keys
    $(document).keydown(function(e) {
        if (e.keyCode >= 37 && e.keyCode <= 40)
            return false;
    });

    // Replaces a class of a given object
    var replaceClass = function(obj, whatClass, withClass) {
        var classes = $(obj).attr('class');
        $(obj).attr('class', classes.replace(whatClass, withClass));
    };

    var notPressed = 'btn-success';  // Green
    var pressed = 'btn-warning'; // Yellow

    // Toggles a button with a given selector
    var toggle = function(aux, selector) {
        replaceClass(selector, notPressed, pressed);
    };

    // Untoggles a button with a given selector
    var untoggle = function(aux, selector) {
        replaceClass(selector, pressed, notPressed);
    };

    // Checks if a button is toggled
    var isToggled = function(selector) {
        return $(selector).hasClass(pressed);
    };

    // Checks if a button is disabled
    var isDisabled = function(obj) {
        return obj != undefined && $(obj).hasClass('disabled');
    };

    var selectedAction = null;
    var selectedDirection = null;

    // Action buttons
    var actionIDs = ['#btn_move', '#btn_shoot', '#btn_ammo', '#btn_reload', '#btn_barricade', '#btn_debarricade'];
    var untoggleActionButtons = function(e) {
        if (isDisabled(this))
            return false;
        selectedAction = $(this).attr('data-action');
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
            return false;
        selectedDirection = $(this).attr('data-direction');
        $.each(arrowIDs, untoggle);
        if (this != undefined)
            toggle(null, '#' + $(this).attr('id'));
        return false;
    };
    $.each(arrowIDs, function(i, v) {
        $(v).click(untoggleArrowButtons);
    });

    // Disabling and enabling the arrow buttons depending on the selected action
    $('#btn_move, #btn_shoot, #btn_barricade, #btn_debarricade').click(function() {
        if (isDisabled(this))
            return false;
        $.each(arrowIDs, function(i, v) {
             $(v).removeClass('disabled');
        });
    });
    $('#btn_ammo, #btn_reload').click(function() {
        if (isDisabled(this))
            return false;
        $.each(arrowIDs, function(i, v) {
             $(v).addClass('disabled');
             untoggle(null, v);
        });
        selectedDirection = null;
    });

    // A callback for enabling the GO button and flashing action instructions
    var enableGoAndFlashActionInstructions = function(e) {
        if (this == undefined || isDisabled(this))
            return false;
        var id = $(this).attr('id');
        if (id === 'btn_ammo' || id === 'btn_reload') {
            $('#btn_arrow_go').removeClass('disabled');
            $('#instruction_label').html('Click GO');
        } else {
	    if (selectedDirection == null)
                $('#btn_arrow_go').addClass('disabled');
            $('#instruction_label').html('Pick a direction and click GO');
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

    var invalidSelection = function(text) {
        $('#instruction_label').html('<span style="color: red;">' + text + '</span>');
        $('#instruction_label').fadeIn();
        $('#instruction_label').fadeOut('slow');
    }

    // The GO action
    $('#btn_arrow_go').click(function(e) {
        if (isDisabled(this))
            return false;

        var actionAccepted = false;

        switch (selectedAction) {
        case 'Move':
            if (canMove(localPlayer, selectedDirection)) {
                move(localPlayer, selectedDirection);
                actionAccepted = true;
            } else {
               invalidSelection('Yo, you cant move there brah'); 
            }
            break;
        case 'Ammo':
            if (localPlayer.holdingBox) { 
                if (canDrop(localPlayer)) {
                    drop(localPlayer);
                    $('#btn_ammo').html('Pick up Box');
                    actionAccepted = true;
                } else {
                    invalidSelection('Serious problems if this is displayed');
                }
            } else {
                if (canPickUp(localPlayer)) {
                    pickUp(localPlayer);
                    $('#btn_ammo').html('Drop Box');
                    actionAccepted = true;
                } else {
                    invalidSelection('You cant pick up the box.');
                }
            }
            break;
        case 'Shoot':
            if (canShoot(localPlayer, selectedDirection)) {
                shoot(localPlayer, selectedDirection);
                $('#ammo_display').html(localPlayer.ammo);
                actionAccepted = true;
            } else {
                invalidSelection("You can't shoot there"); 
            }
            break;
        case 'Reload':
            if (canReload(localPlayer)) {
                reload(localPlayer);
                $('#ammo_display').html(localPlayer.ammo);
                actionAccepted = true;
            } else {
                invalidSelection("You can't reload"); 
            }
            break;
        case 'Barricade':
            if (canBarricade(localPlayer, selectedDirection)) {
                barricade(localPlayer, selectedDirection);
                actionAccepted = true;
            } else {
                invalidSelection("You can't barricade there"); 
            }
            break;
        case 'Debarricade':
            if (canBreakBarricade(localPlayer, selectedDirection)) {
                breakBarricade(localPlayer, selectedDirection);
                actionAccepted = true;
            } else {
                invalidSelection("There is nothing to break"); 
            }
            break;
        default:
            break;
        }


        // Put buttons in their initial state
        // TODO - Signal end of turn
        if (actionAccepted) {
            selectedDirection = selectedDirection || '';
            $.getJSON('/ajax-make-turn/' + selectedAction + '/' + selectedDirection, function(data) {});

            disableControls();
            $('#your_turn_display').fadeOut('slow');
            isTurn = false;
        }

        return false;
    });

    disableControls = function() {
        $.each(actionIDs, disable);
        $.each(arrowIDs, disable);
        $('#btn_arrow_go').addClass('disabled');
        selectedAction = null;
    };
    disableControls();

    enableControls = function() {
        $.each(actionIDs, enable);
    };	

});
