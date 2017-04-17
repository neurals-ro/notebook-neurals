let injVar = 'query';
let server = 'http://localhost:7777';
let apiUrl = '/api/file/';

// Get URL query params;
let getQuery = () => {
  let q = window.location.search.substring(1);
  let pairs = {};
  q = q.split('&').forEach(p => {
    let f = p.split('=');
    pairs[f[0]] = f[1];
  });
  return pairs;
};

let getNotebook = function(url, callback) {
  let jqxhr = $.get(url, function( data ) {
    let jqxhr2 = $.get(data.notebook, function( ndata ) {
      callback(JSON.parse(ndata));
    });
  });
}

define([
  'base/js/namespace',
  'base/js/events',
  'notebook/js/cell',
  'codemirror/lib/codemirror'
], function(Jupyter, events, cell, CodeMirror) {
  console.log('------- custom')
  let //firstCell = 0,
    query = getQuery(),
    recipe = query._id,
    url = server + apiUrl + recipe,
    injection = injVar + ' = ' + JSON.stringify(query) + '\n',
    indexes = [],
    cells, cellsFirstNo;

  let restartKernel = function (k, ev) {
    events.off('kernel_ready.Kernel', restartKernel);
    Jupyter.notebook.execute_all_cells();
  };
  console.log('before notebook_loading.Notebook');
  //events.on('notebook_loading.Notebook', function () {
  //window.setTimeout(function() {
    console.log('notebook_loading.Notebook');

    // Delete all cells
    let ncells = Jupyter.notebook.ncells();
    for(let i=0; i < ncells; i++)
      indexes.push(i);
    console.log('DELETE CELLS', indexes);
    Jupyter.notebook.delete_cells(indexes);

    let firstCell = Jupyter.notebook.insert_cell_at_index('code', 0);


    let jqxhr = $.get(url, function( data ) {
      if(data)
        injection += 'recipe = ' + JSON.stringify(data) + '\n';
      if(data.kmodel)
        injection += 'kurl = ' + JSON.stringify(data.kmodel) + '\n';
      injection += 'server = "' + server + '"\n';

      let jqxhr2 = $.get(data.notebook, function( ndata ) {
        if(typeof ndata === 'string')
          ndata = JSON.parse(ndata);
        //console.log('ndata', ndata)
        cells = ndata.cells;
        cells.forEach(function(cell) {
          let jcell = Jupyter.notebook.insert_cell_at_bottom(cell.cell_type);
          jcell.set_text(cell.source.join('\n'));
        });
      });

      let jqxhr3 = $.get(data.kmodel, function( kdata ) {
        console.log('kdata', kdata, typeof kdata)
        if(typeof kdata === 'object') {
          kdata = JSON.stringify(kdata);
        }
        injection += "kmodel = '" + kdata + "'" + "\n";
        firstCell.set_text(injection);
      });

      //events.on('kernel_ready.Kernel', restartKernel);
    });
  //});
  //}, 500);
});
