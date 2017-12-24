;(function($) {
  var analyzeWrapper = $('.analyzeWrapper');
  var analyzing = false;


  function sum() {
    var trList = analyzeWrapper.find('.analyzeResult table tbody tr');
    var counts = [];
    trList.each(function () {
      $(this).find('td').each(function(index) {
        if (index === 0) {
          return;
        }
        var item = $(this);
        var text = item.text();
        if (!text) {
          return;
        }
        var v = parseInt(text.replace(/,/, ''));
        // console.dir(v);
        if (!counts[index - 1]) {
          counts[index - 1] = 0;
        }
        counts[index - 1] += v;
      });
    });
    var max = counts[counts.length - 1];
    var getDesc = function (index) {
      var v = counts[index];
      var perecnt = (v * 100 / max).toFixed(2);
      return v.toLocaleString() + '(' + perecnt + '%)';
    };
    var html = '<tr>' +
      '<td>汇总</td>' +
      '<td>' + getDesc(0) + '</td>' +
      '<td>' + getDesc(1) + '</td>' +
      '<td>' + getDesc(2) + '</td>' +
      '<td>' + max.toLocaleString() + '</td>' +
    '</tr>';
    analyzeWrapper.find('.analyzeResult table tbody').append(html);
  }

  function doCompressAnalyze(items, trList) {
    if (!items.length) {
      sum();
      return;
    }
    var item = items.shift();
    var tr = trList.shift();
    var url = encodeURIComponent(item.url);
    $.ajax({
      url: '/tiny-web/compress?url=' + url + '&type=' + item.type,
    }).then(function(res) {
      var tds = tr.find('td');
      tds.eq(1).text(res.original.toLocaleString());
      tds.eq(4).text(res.bytes.toLocaleString());
      if (res.br) {
        tds.eq(2).text(res.gzip.toLocaleString());
        tds.eq(3).text(res.br.toLocaleString());
      } else if (res.webp) {
        var v = res.png || res.jpeg;
        tds.eq(2).text(v.toLocaleString());
        tds.eq(3).text(res.webp.toLocaleString());
      }
      doCompressAnalyze(items, trList);
    }).catch(function(err) {
      doCompressAnalyze(items, trList);
    });
  }

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
      $.each(res.list, function(index, item) {
        var html = '<tr>' +
        '<td title="'  + item.url + '">' + item.file + '</td>' +
        '<td></td>' +
        '<td></td>' +
        '<td></td>' +
        '<td></td>' +
        '</tr>';
        arr.push(html);
      });
      analyzeResult.removeClass('hidden');
      var trList = [];
      analyzeResult.find('tbody').html(arr.join('')).find('tr').each(function() {
        trList.push($(this));
      });
      doCompressAnalyze(res.list, trList);
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