$(document).ready(function() {
	console.log("canvas autostart ready...");

	setTimeout(function() {
		var b = $("button");

		console.log("Button?");
		console.log(b);

		if (b) {
			console.log("found button!");
		}

		b.click();
		b.trigger("click");
	}, 150);

	
})

