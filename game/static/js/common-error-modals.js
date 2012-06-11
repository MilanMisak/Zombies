var AJAX_ERROR_ALLOWANCE = 10; // Keep in sync with models.py setting
var errorModalShown = false;

/* Shows an error modal with given reason and details. Also, if redirectURL
   is provided a redirect to a given URL will happen after a model is closed. */
var showErrorModal = function(reason, details, redirectURL) {
    redirectURL = redirectURL || '';

    $('#error_reason').html(reason);
    $('#error_details').html(details);
    $('#error_modal').on('hide', function() {
        errorModalShown = false;
        if (redirectURL !== '') {
            window.location.replace(redirectURL);
        }
    });
    $('#error_modal').modal('show');
};
