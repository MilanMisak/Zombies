$(document).ready(function() {
    var joinedGame = false;

    var updateGameList = function() {
        $.getJSON('/games', function(data) {
            var items = [];

            $.each(data, function(key, val) {
                items.push('<li>' +
                '<span>' + val + '</span>' +
                '<a class="btn btn-danger btn_join_game" data-game-id="' + key + '">' +
                'Join</a>' +
                '</li>');
            });

            $('#game_list').html('<ul>' + items.toString() + '</ul>');

            $('.btn_join_game').click(function() {
                var game_id = $(this).attr('data-game-id');
                $.getJSON('join/' + game_id, function(data) {
                    joinedGame = true;
                    $(this).addClass('disabled');
                });
            });
        }).error(function(data, status, xhr) {
            //alert(data.responseText + ':' + data.statusText);
            window.location.replace('/');
        });
    };

    var updatePlayersList = function() {
        $.getJSON('/players-in-game', function(data) {
            var items = [];

            $.each(data, function(key, val) {
                items.push('<li>' + val + '</li>');
            });

            $('#player_list').html('<ul>' + items.toString() + '</ul>');
        }).error(function(xhr, status, data) {
            if ('NO-GAME' === xhr.responseText && joinedGame) {
                joinedGame = false;
                alert('The game you joined was cancelled');
            }
        });
    };

    updateGameList();
    setInterval(updateGameList, 1000);
    setInterval(updatePlayersList, 1000);
});
