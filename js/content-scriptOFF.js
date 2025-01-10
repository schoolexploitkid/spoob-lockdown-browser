"use strict";
console.log("content script");
const script = document.createElement("script");
script.textContent =
`"use strict";
{
	const handlers = [];
	
	window.addEventListener("beforeunload",function(event){
		const readOnlyEvent = new Proxy(event,{
			set: function(target, property, value){
				console.log(\`Stopped page from setting "\${property}" to "\${value}" on beforeunload event\`);
				return true;
			}
		});
		for(let i = 0;i < handlers.length;i++){
			handlers[i](readOnlyEvent);
		}
	});
	
	function handle(func){
		console.log("Stopped page from adding beforeunload event listener");
		if(typeof func === "function" && !handlers.includes(func)){
			handlers.push(func);
		}
	}
	
	Object.defineProperty(window, "onbeforeunload", {
		set: function(value) {
			handle(value);
		}
	})

	const original = EventTarget.prototype.addEventListener;
	EventTarget.prototype.addEventListener = function(name,func) {
		if (name === "beforeunload") {
			handle(func);
		} else {
			original.apply(this, arguments);
		}
	};
	document.currentScript.remove();
}`;
document.documentElement.appendChild(script);