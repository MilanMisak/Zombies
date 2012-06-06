$(document).ready(function() {
    var updateGameInfo = function() {
        $.getJSON('/ajax-game-info', function(data) {
        }).error(function(xhr, status, data) {
            alert('Oops! An error has occurred.');
            window.location.replace('/');
        });
    };

    updateGameInfo();
    setInterval(updateGameInfo, 1000);

    $('#instructions_modal').modal('show');
});
