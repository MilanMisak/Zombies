$(document).ready(function() {
    var updatePlayerList = function () {
        $.getJSON('/players-in-game', function(data) {
            var items = [];

            $.each(data, function(key, val) {
                items.push('<li>' + val + '</li>');
            });

            $('#player_list').html('<ul>' + items.toString() + '</ul>');
        });
    };

    updatePlayerList();
    setInterval(updatePlayerList, 1000);
});
