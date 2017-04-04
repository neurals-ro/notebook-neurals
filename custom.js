let injVar = 'query';
let getQuery = () => {
  let q = window.location.search.substring(1);
  let pairs = {};
  q = q.split('&').forEach(p => {
    let f = p.split('=');
    pairs[f[0]] = f[1];
  });
  return pairs;
};

define([
  'base/js/namespace',
  'base/js/events',
  'notebook/js/cell',
  'codemirror/lib/codemirror'
], function(Jupyter, events, cell, CodeMirror) {

  CodeMirror.defineInitHook(function(cm) {
    let doc = cm.getDoc();
    let injection = injVar + ' = ' + JSON.stringify(getQuery());
    //let injection = injVar + ' = ' + getQuery()._id;
    let restartKernel = function (k, ev) {
      events.off('kernel_ready.Kernel', restartKernel);
      console.log('--------restartKernel', k, ev)

      Jupyter.notebook.execute_all_cells();
    };
    let inject = function(codem, ev) {
      cm.off('change', inject);

      let val = codem.getValue();
      if(val.indexOf(injVar) == 0) {
        val = val.substring(val.indexOf('\n')+1);
      }
      codem.setValue(injection + '\n' + val);
      events.on('kernel_ready.Kernel', restartKernel);
    }
    cm.on('change', inject);
  });
});
