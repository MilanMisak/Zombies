var documentReady = false;

// Outside the document ready handler for immediate execution
var updateGameInfo = function() {
    $.getJSON('/ajax-game-info', function(data) {
        if (!documentReady)
            return;

        var items = [];

        $.each(data[2], function(key, val) {
            items.push('<li>' + val + '</li>');
        });

        $('#player_list').html('<ul>' + items.join('') + '</ul>');
    }).error(function(xhr, status, data) {
        alert('The game you created was cancelled. Please try again');
        window.location.replace('/');
    });
};

updateGameInfo();
setInterval(updateGameInfo, 1000);

$(document).ready(function() {
    documentReady = true;
});
