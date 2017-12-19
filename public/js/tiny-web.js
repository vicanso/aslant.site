;(function($) {
  $('.tinyContainer .inputWrapper a').click(function() {
    var url = $('.tinyContainer .inputWrapper input').val();
    if (url) {
      location.href = "/tiny-web/?url=" + encodeURIComponent(url);
    }
  });
})(jQuery);