var instructionsModalShown = false;

var ajaxErrorCount = 0;

isTurn = false;
initialisedPlayers = false;
ALL_LOADED = false;
lastPlayerToMove = null;

/* Execute moves using data from the server. */
var executeMoves = function(data) {
    if (!ALL_LOADED)
	return;

    if (!initialisedPlayers) {
        console.log(data.players);
        for (var i = 0; i < data.players.length; i++) {
	    newPlayer = data.players[i];
            if (newPlayer.pk != data.yourPk) {
                addPlayer('green' ,mainRoom, newPlayer.pk);
		console.log(newPlayer.pk);
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
        }
    }
    if (lastPlayerToMove != data.lastPlayersPk) {
        lastPlayerToMove = data.lastPlayersPk;
	console.log(lastPlayerToMove);
	if (lastPlayerToMove == 0 || lastPlayerToMove == -1)
	    return;

        movingPlayer = getPlayer(lastPlayerToMove);

        switch(data.lastAction) {
        case "Move":
            move(movingPlayer, data.lastDirection);
            break;
        case "Ammo":
            if (movingPlayer.holdingBox) {
                drop(movingPlayer);
            } else {
                pickUp(movingPlayer);
            }
            break;
        case "Shoot":
            shoot(movingPlayer, data.lastDirection);
            break;
        case "Reload":
            reload(movingPlayer);
            break;
        case "Barricade":
            barricade(movingPlayer, data.lastDirection);
            break;
        case "Debarricade":
            breakBarricade(movingPlayer, data.lastDirection);
            break;
        }
    }
};

var updateGameState = function() {
    if (!ALL_LOADED)
	return;

    $.getJSON('/ajax-game-state', function(data) {
        ajaxErrorCount = 0;

        executeMoves(data);
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
