var instructionsModalShown = false;

var ajaxErrorCount = 0;

isTurn = false;
initialisedPlayers = false;

var updateGameState = function() {
    $.getJSON('/ajax-game-state', function(data) {
        ajaxErrorCount = 0;
        console.log(data)

        if (!initialisedPlayers && ALL_LOADED) {
            for(var newPlayer in data.players) {
                addPlayer(mainRoom, 'pink', newPlayer);
            }
        }

        if (data.yourTurn) {
            $('#your_turn_display').fadeIn('fast');
	        if (!isTurn && ALL_LOADED) {
                isTurn = true;
                enableControls();
	        }
        } else {
            $('#your_turn_display').fadeOut('slow');
	        disableControls();
            isTurn = false;
        }
    }).error(function(xhr, status, data) {
        ajaxErrorCount++;
        if (ajaxErrorCount < AJAX_ERROR_ALLOWANCE)
            return;
        ajaxErrorCount = 0;

        if (instructionsModalShown) {
            $('#instructions_modal').modal('hide');
        }

        var reason = '';
        if ('NO-GAME' === xhr.responseText) {
            reason = 'the game was cancelled.';
        } else {
            reason = 'your player has been wiped off the server. ' +
                'Are you experiencing any internet connection issues?';
        }

        showErrorModal(reason, '', '/');
    });
};

updateGameState();
setInterval(updateGameState, 1000);

// Show a modal with instructions, other resources are loading in background
$('#instructions_modal').on('show', function() {
    instructionsModalShown = true;
});
$('#instructions_modal').modal('show');


$(document).ready(function() {
    $('#your_turn_display').hide();
});
