var instructionsModalShown = false;

var ajaxErrorCount = 0;

isTurn = false;
initialisedPlayers = false;
ALL_LOADED = false;
lastPlayerToMove = null;

var updateGameState = function() {
    if (!ALL_LOADED)
	return;

    $.getJSON('/ajax-game-state', function(data) {
        ajaxErrorCount = 0;
        console.log(data)

        if (!initialisedPlayers) {
            for(var newPlayer in data.players) {
		        if (newPlayer != data.yourPk) {
                    addPlayer('green' ,mainRoom, newPlayer);
                }
            }
	        initialisedPlayers = true;
        }
	
        if (data.yourTurn) {
	        if (!isTurn) {
                $('#your_turn_display').fadeIn('fast');
                isTurn = true;
                enableControls();
            }
        } else {
	        if (isTurn) {
                $('#your_turn_display').fadeOut('slow');
	            disableControls();
                isTurn = false;
	        } else if (lastPlayerToMove != data.lastPlayersPk) {
            	lastPlayerToMove = data.lastPlayersPk;
                
                switch(data.lastAction) {
                    case "Move":
                        movingPlayer = getPlayer(lastPlayerToMove);
                        Move(movingPlayer, data.lastDirection);
                        break;
                    default:
                        break;
                }   
            }
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
