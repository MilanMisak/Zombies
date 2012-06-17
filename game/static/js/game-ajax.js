var instructionsModalShown = false;

var ajaxErrorCount = 0;

isTurn = false;
initialisedPlayers = false;
ALL_LOADED = false;
turnNumber = 0;

var playerColours = ['#ff0000', '#0000ff', '#ffff00', '#00ff00',
    '#ff7f00', '#ff00ff', '#00ffff', '#7f00ff', '#005f00', '#000000'];

/* Execute moves using data from the server. */
var executeMoves = function(data) {
    if (!ALL_LOADED)
        return;

    // Update the list of players
    if ($('#players_list').length) {
        var playersList = [];
        $.each(data.players, function(i, v) {
            playersList.push('<li class="player' + (!v.alive ? ' dead' : '') +
                (data.currentPlayersPk == v.pk ? ' current' : '') + '"><span style="background-color: ' +
                playerColours[v.index - 1] + '">&nbsp;</span> ' + v.name + ' (' + v.score + ')</li>');
        });
        playersList.push('<li class="player' + (data.currentPlayersPk == -1 ? ' current' : '') +
            '"><span style="background-color: #eee">&nbsp;</span>&nbsp;Snails</li>');
        $('#players_list').html(playersList.join(''));
    }

    // Update the score
    if ($('#score_display').length && data.lastPlayersPk == 0) {
        $('#score_display').html(data.yourScore);
    }

    if (!initialisedPlayers && entityLoaded != undefined) {
        for (var i = 0; i < data.players.length; i++) {
            var newPlayer = data.players[i];
            if (newPlayer.pk != data.yourPk) {
                addPlayer(playerColours[newPlayer.index - 1], roomList[newPlayer.room], newPlayer.pk, newPlayer.ammo, newPlayer.carrying_ammo_box);
            } else {
                localPlayer = new Ghost(playerColours[newPlayer.index - 1], roomList[newPlayer.room], 0, newPlayer.ammo, newPlayer.carrying_ammo_box);
                if (localPlayer.holdingBox) {
                    localPlayer.pickUp();
                    $('#btn_ammo').html('Drop Box');
                }
            }
        }
        turnNumber = data.turnsPlayed;

        for (var i = 0; i < data.barricades.length; i++) {
            newBarricade = barricadeList[data.barricades[i].index];
            newBarricade.health = data.barricades[i].health;
            newBarricade.exists = true;
            newBarricade.item.visible = true;
        }

        for (var i = 0; i < data.snails.length; i++) {
            var snails = data.snails[i];
            SnailGroup.spawn(snails.pk, (snails.health / 20), roomList[snails.room], snails.health);
        }

        console.log(data);
        ammoBox.room = roomList[data.ammo_box.room];
        ammoBox.position = ammoBox.room.position.add(new Point(0, 70));
        ammoBox.visible = !data.ammo_box.in_transit;

        view.draw();
        initialisedPlayers = true;
    }

    if (data.yourTurn && !isTurn) {
        $('#your_turn_display').fadeIn('fast');
        isTurn = true;
        enableControls();
    } else if (!data.yourTurn && isTurn) {
        $('#your_turn_display').fadeOut('slow');
        disableControls();
        isTurn = false;
    }
    if (turnNumber != data.turnsPlayed) {
        turnNumber = data.turnsPlayed;
        if (data.lastPlayersPk == 0)
            return;
                
        if (data.lastPlayersPk == -1) {
        }

        movingPlayer = getPlayer(data.lastPlayersPk);

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

    /*Kill players if they leave the game. */
    for (var i = 0; i < playerList.length; i++) {
        var stillInGame = false;
        var ghost = playerList[i];
        for (var j = 0; j < data.players.length; j++) {
            var player = data.players[j];
            if (ghost.id == player.pk) {
                stillInGame = true;
                break;
            }
        }
        
        if (!stillInGame)
            ghost.die();
    }
};

/* Check the game state is the same as on the server. */




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
