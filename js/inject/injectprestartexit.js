//var script = document.createElement('script');
//script.innerHTML = 'rldb_prestart_finished();';
//document.body.appendChild(script);

var info = document.createElement('h1');
info.innerHTML = 'Please wait for exam to load...';
document.body.appendChild(info);


var but = document.createElement('button');
but.innerHTML = 'Click to exam exam and restart LDB';
but.onclick = function() {rldb_prestart_finished();};
document.body.appendChild(but);


