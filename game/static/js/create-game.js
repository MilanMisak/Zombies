$(document).ready(function() {
    var updateGameInfo = function() {
        $.getJSON('/ajax-game-info', function(data) {
            var items = [];

            $.each(data[1], function(key, val) {
                items.push('<li>' + val + '</li>');
            });

            $('#player_list').html('<ul>' + items.join('') + '</ul>');
        }).error(function(xhr, status, data) {
            alert('The game you created was cancelled');
            window.location.replace('/');
        });
    };

    updateGameInfo();
    setInterval(updateGameInfo, 1000);
});
