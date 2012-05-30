$(document).ready(function() {
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
                alert('You just joined the game with ID: ' + $(this).attr('data-game-id'));
                $(this).addClass('disabled');
            });
        });
    };

    updateGameList();
    setInterval(updateGameList, 1000);
});
