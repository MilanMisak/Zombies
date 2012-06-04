$(document).ready(function() {
    var hasJoinedGameYet = false;

    var updateGameList = function() {
        $.getJSON('/ajax-games', function(data) {
            var items = [];

            $.each(data, function(key, val) {
                items.push('<li>' +
                '<span>' + val + '</span>' +
                '<a class="btn btn-danger btn_join_game" data-game-id="' + key + '">' +
                'Join</a>' +
                '</li>');
            });

            $('#game_list').html('<ul>' + items.toString() + '</ul>');
            if (items.length == 0)
                $('#game_list').html('<p>No available games</p>');

            $('.btn_join_game').click(function() {
                var game_id = $(this).attr('data-game-id');
                $.getJSON('ajax-join-game/' + game_id, function(data) {
                    hasJoinedGameYet = true;
                    $(this).addClass('disabled');
                });
            });
        }).error(function(data, status, xhr) {
            window.location.replace('/');
        });
    };

    var updateGameInfo = function() {
        $.getJSON('/ajax-game-info', function(data) {
            var items = [];

            $.each(data, function(key, val) {
                items.push('<li>' + val + '</li>');
            });

            $('#player_list').html('<ul>' + items.toString() + '</ul>');
        }).error(function(xhr, status, data) {
            if ('NO-GAME' === xhr.responseText && hasJoinedGameYet) {
                hasJoinedGameYet = false;
                $('#player_list').html('');
                alert('The game you joined was cancelled');
            }
        });
    };

    updateGameList();
    setInterval(updateGameList, 1000);
    setInterval(updateGameInfo, 1000);
});
