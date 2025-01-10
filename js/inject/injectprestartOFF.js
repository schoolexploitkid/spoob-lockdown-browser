//var script = document.createElement('script');
//script.innerHTML = 'rldb_prestart_finished();';
//document.body.appendChild(script);

var but = document.createElement('button');
but.innerHTML = 'Click Me Again2';
but.onclick = function() {alert('go'); rldb_prestart_finished();};
document.body.appendChild(but);


