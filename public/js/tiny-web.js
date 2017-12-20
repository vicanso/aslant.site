;(function($) {
  var analyzeWrapper = $('.analyzeWrapper');
  var analyzing = false;
  $('.tinyContainer .inputWrapper a').click(function() {
    var url = $('.tinyContainer .inputWrapper input').val();
    if (!url || analyzing) {
      return;
    }
    var tips = analyzeWrapper.find('.tips').show();
    var analyzeResult = analyzeWrapper.find('.analyzeResult');
    analyzeResult.addClass('hidden');
    tips.html('<p class="tac">正在分析中，请稍候...</p>');
    analyzing = true;
    $.ajax({
      url: '/tiny-web/analyze?url=' + encodeURIComponent(url),
    }).then(function(res) {
      analyzing = false;
      tips.hide();
      var arr = [];
      var counts = {
        original: 0,
        gzip: 0,
        br: 0,
        bytes: 0,
      };
      $.each(res, function(index, item) {
        counts.original += item.original;
        counts.gzip += item.gzip;
        counts.br += item.br;
        counts.bytes += item.bytes;

        var html = '<tr>' +
          '<td title="'  + item.url + '">' + item.file + '</td>' +
          '<td>' + item.original.toLocaleString() + '</td>' +
          '<td>' + item.gzip.toLocaleString() + '</td>' +
          '<td>' + item.br.toLocaleString() + '</td>' +
          '<td>' + item.bytes.toLocaleString() + '</td>' +
        '</tr>';
        arr.push(html);
      });
      var getCountDesc = function (key) {
        var value = counts[key];
        var percent = (100 * value / counts.bytes).toFixed(2)
        return value.toLocaleString() + '(' + percent + '%)';
      };
      arr.push('<tr>' +
        '<td>汇总</td>' +
        '<td>' + getCountDesc('original') + '</td>' +
        '<td>' + getCountDesc('gzip') + '</td>' +
        '<td>' + getCountDesc('br') + '</td>' +
        '<td>' + counts.bytes.toLocaleString() + '</td>' +
      '</tr>')
      analyzeResult.removeClass('hidden');
      analyzeResult.find('tbody').html(arr.join(''));
    }).catch(function(res) {
      analyzing = false;
      tips.html('<p class="tac">很抱歉，服务出错，分析失败</p>');
    });
  });

  function initFixTableHeader() {
    var analyzeResult = analyzeWrapper.find('.analyzeResult');
    analyzeResult.removeClass('hidden');
    var thead = analyzeWrapper.find('table thead');
    var theadClone = thead.clone();
    var offset = thead.offset();
    theadClone.css({
      position: 'fixed',
      left: offset.left,
      top: 0,
    }).width(thead.width());
    theadClone.find('tr').width('100%');
    var thList = theadClone.find('th');
    thead.find('th').each(function (index) {
      var obj = $(this);
      var width = obj.outerWidth();
      thList.eq(index).width(width);
    });
    theadClone.insertAfter(thead);
    theadClone.hide();
    analyzeResult.addClass('hidden');
    var doc = $(document);
    var isShowing = false;
    doc.scroll(function() {
      var top = doc.scrollTop();
      if (top > offset.top) {
        if (!isShowing) {
          theadClone.show();
        }
        isShowing = true;
      } else {
        if (isShowing) {
          theadClone.hide();
        }
        isShowing = false;
      }
    });
  }

  initFixTableHeader();

})(jQuery);