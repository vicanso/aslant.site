jQuery(function($) {
  var myCodeMirrorList = [];
  $('.varnishGeneratorContainer .generatorItem').each(function(i) {
    var obj = $(this);
    var titleHeight = obj.find('h3').height();
    var editor = obj.find('.editor').height(obj.height() - titleHeight);
    var mirror = CodeMirror(editor.get(0), {
      value: i === 0 ? JT_GLOBALS.varnishConfig : '',
      lineNumbers: true,
      mode: 'yaml',
    });
    myCodeMirrorList.push(mirror);
  });

  var generating = false;
  $('.varnishGeneratorContainer .generate').click(function() {
    if (generating) {
      return;
    }
    generating = true;
    var obj = $(this);
    obj.text('Generating...');
    var val = myCodeMirrorList[0].getValue();
    $.ajax({
      url: '/varnish-generator',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        config: val,
      }),
    }).done(function(res) {
      myCodeMirrorList[1].setValue(res.vcl);
    }).fail(function(res) {
      myCodeMirrorList[1].setValue('Create varnish vcl fail, please check the config');
    }).always(function() {
      generating = false;
      obj.text('Generate');
    });
  });
});
