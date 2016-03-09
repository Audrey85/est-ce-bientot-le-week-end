// text-animation

!function($) {

	"use strict";

	var Typed = function(el, options) {

		// chosen element to manipulate text
		this.el = $(el);

		// options
		this.options = $.extend({}, $.fn.typed.defaults, options);

		// attribute to type into
		this.isInput = this.el.is('input');
		this.attr = this.options.attr;

		// show cursor
		this.showCursor = this.isInput ? false : this.options.showCursor;

		// text content of element
		this.elContent = this.attr ? this.el.attr(this.attr) : this.el.text()

		// html or plain text
		this.contentType = this.options.contentType;

		// typing speed
		this.typeSpeed = this.options.typeSpeed;

		// add a delay before typing starts
		this.startDelay = this.options.startDelay;

		// backspacing speed
		this.backSpeed = this.options.backSpeed;

		// amount of time to wait before backspacing
		this.backDelay = this.options.backDelay;

		// div containing strings
		this.stringsElement = this.options.stringsElement;

		// input strings of text
		this.strings = this.options.strings;

		// character number position of current string
		this.strPos = 0;

		// current array position
		this.arrayPos = 0;

		// number to stop backspacing on.
		// default 0, can change depending on how many chars
		// you want to remove at the time
		this.stopNum = 0;

		// Looping logic
		this.loop = this.options.loop;
		this.loopCount = this.options.loopCount;
		this.curLoop = 0;

		// for stopping
		this.stop = false;

		// custom cursor
		this.cursorChar = this.options.cursorChar;

		// shuffle the strings
		this.shuffle = this.options.shuffle;
		// the order of strings
		this.sequence = [];

		// All systems go!
		this.build();
	};

	Typed.prototype = {

		constructor : Typed

		,
		init : function() {
			var self = this;
			self.timeout = setTimeout(function() {
				for (var i = 0; i < self.strings.length; ++i)
					self.sequence[i] = i;

				// shuffle the array if true
				if (self.shuffle)
					self.sequence = self.shuffleArray(self.sequence);

				// Start typing
				self.typewrite(self.strings[self.sequence[self.arrayPos]],
						self.strPos);
			}, self.startDelay);
		}

		,
		build : function() {
			var self = this;
			// Insert cursor
			if (this.showCursor === true) {
				this.cursor = $("<span class=\"typed-cursor\">"
						+ this.cursorChar + "</span>");
				this.el.after(this.cursor);
			}
			if (this.stringsElement) {
				self.strings = [];
				this.stringsElement.hide();
				var strings = this.stringsElement.find('p');
				$.each(strings, function(key, value) {
					self.strings.push($(value).html());
				});
			}
			this.init();
		}

		// pass current string state to each function, types 1 char per call
		,
		typewrite : function(curString, curStrPos) {
			// exit when stopped
			if (this.stop === true) {
				return;
			}

			var humanize = Math.round(Math.random() * (100 - 30))
					+ this.typeSpeed;
			var self = this;

			self.timeout = setTimeout(
					function() {
						var charPause = 0;
						var substr = curString.substr(curStrPos);
						if (substr.charAt(0) === '^') {
							var skip = 1; // skip atleast 1
							if (/^\^\d+/.test(substr)) {
								substr = /\d+/.exec(substr)[0];
								skip += substr.length;
								charPause = parseInt(substr);
							}

							// strip out the escape character and pause value so
							// they're not printed
							curString = curString.substring(0, curStrPos)
									+ curString.substring(curStrPos + skip);
						}

						if (self.contentType === 'html') {
							// skip over html tags while typing
							var curChar = curString.substr(curStrPos).charAt(0)
							if (curChar === '<' || curChar === '&') {
								var tag = '';
								var endTag = '';
								if (curChar === '<') {
									endTag = '>'
								} else {
									endTag = ';'
								}
								while (curString.substr(curStrPos).charAt(0) !== endTag) {
									tag += curString.substr(curStrPos)
											.charAt(0);
									curStrPos++;
								}
								curStrPos++;
								tag += endTag;
							}
						}

						// timeout for any pause after a character
						self.timeout = setTimeout(function() {
							if (curStrPos === curString.length) {
								// fires callback function
								self.options.onStringTyped(self.arrayPos);

								// is this the final string
								if (self.arrayPos === self.strings.length - 1) {
									// animation that occurs on the last typed
									// string
									self.options.callback();

									self.curLoop++;

									// quit if we wont loop back
									if (self.loop === false
											|| self.curLoop === self.loopCount)
										return;
								}

								self.timeout = setTimeout(function() {
									self.backspace(curString, curStrPos);
								}, self.backDelay);
							} else {

								/* call before functions if applicable */
								if (curStrPos === 0)
									self.options.preStringTyped(self.arrayPos);

								var nextString = curString.substr(0,
										curStrPos + 1);
								if (self.attr) {
									self.el.attr(self.attr, nextString);
								} else {
									if (self.isInput) {
										self.el.val(nextString);
									} else if (self.contentType === 'html') {
										self.el.html(nextString);
									} else {
										self.el.text(nextString);
									}
								}

								// add characters one by one
								curStrPos++;
								// loop the function
								self.typewrite(curString, curStrPos);
							}
							// end of character pause
						}, charPause);

						// humanized value for typing
					}, humanize);

		}

		,
		backspace : function(curString, curStrPos) {
			// exit when stopped
			if (this.stop === true) {
				return;
			}

			var humanize = Math.round(Math.random() * (100 - 30))
					+ this.backSpeed;
			var self = this;

			self.timeout = setTimeout(function() {

				if (self.contentType === 'html') {
					// skip over html tags while backspacing
					if (curString.substr(curStrPos).charAt(0) === '>') {
						var tag = '';
						while (curString.substr(curStrPos).charAt(0) !== '<') {
							tag -= curString.substr(curStrPos).charAt(0);
							curStrPos--;
						}
						curStrPos--;
						tag += '<';
					}
				}

				// ----- continue important stuff ----- //
				// replace text with base text + typed characters
				var nextString = curString.substr(0, curStrPos);
				if (self.attr) {
					self.el.attr(self.attr, nextString);
				} else {
					if (self.isInput) {
						self.el.val(nextString);
					} else if (self.contentType === 'html') {
						self.el.html(nextString);
					} else {
						self.el.text(nextString);
					}
				}

				// if the number (id of character in current string) is
				// less than the stop number, keep going
				if (curStrPos > self.stopNum) {
					// subtract characters one by one
					curStrPos--;
					// loop the function
					self.backspace(curString, curStrPos);
				}
				// if the stop number has been reached, increase
				// array position to next string
				else if (curStrPos <= self.stopNum) {
					self.arrayPos++;

					if (self.arrayPos === self.strings.length) {
						self.arrayPos = 0;

						// Shuffle sequence again
						if (self.shuffle)
							self.sequence = self.shuffleArray(self.sequence);

						self.init();
					} else
						self.typewrite(
								self.strings[self.sequence[self.arrayPos]],
								curStrPos);
				}

				// humanized value for typing
			}, humanize);

		}

		,
		shuffleArray : function(array) {
			var tmp, current, top = array.length;
			if (top)
				while (--top) {
					current = Math.floor(Math.random() * (top + 1));
					tmp = array[current];
					array[current] = array[top];
					array[top] = tmp;
				}
			return array;
		},
		reset : function() {
			var self = this;
			clearInterval(self.timeout);
			var id = this.el.attr('id');
			this.el.after('<span id="' + id + '"/>')
			this.el.remove();
			if (typeof this.cursor !== 'undefined') {
				this.cursor.remove();
			}
			// Send the callback
			self.options.resetCallback();
		}

	};

	$.fn.typed = function(option) {
		return this
				.each(function() {
					var $this = $(this), data = $this.data('typed'), options = typeof option == 'object'
							&& option;
					if (!data)
						$this.data('typed', (data = new Typed(this, options)));
					if (typeof option == 'string')
						data[option]();
				});
	};

	$.fn.typed.defaults = {
		strings : [ "These are the default values...",
				"You know what you should do?", "Use your own!",
				"Have a great day!" ],
		stringsElement : null,
		// typing speed
		typeSpeed : 0,
		// time before typing starts
		startDelay : 0,
		// backspacing speed
		backSpeed : 0,
		// shuffle the strings
		shuffle : false,
		// time before backspacing
		backDelay : 500,
		// loop
		loop : false,
		// false = infinite
		loopCount : false,
		// show cursor
		showCursor : true,
		// character for cursor
		cursorChar : "|",
		// attribute to type (null == text)
		attr : null,
		// either html or text
		contentType : 'html',
		// call when done callback function
		callback : function() {
		},
		// starting callback function before each string
		preStringTyped : function() {
		},
		// callback for every typed string
		onStringTyped : function() {
		},
		// callback for reset
		resetCallback : function() {
		}
	};
}(window.jQuery);

$(function() {

	$("#typed").typed({
		// strings: ["Typed.js is a <strong>jQuery</strong> plugin.", "It
		// <em>types</em> out sentences.", "And then deletes them.", "Try it
		// out!"],
		stringsElement : $('#typed-strings'),
		typeSpeed : 30,
		backDelay : 500,
		loop : false,
		contentType : 'html', // or text
		// defaults to false for infinite loop
		loopCount : false,
	});
});

// circuit coloré animation

window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame || window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame || function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
})();

var c;
var $;
var w;
var h;
var arr = [];
var num = 50;

var rndCol = function(alpha) {
	var r = (Math.floor(Math.random() * 255));
	var g = (Math.floor(Math.random() * 255));
	var b = (Math.floor(Math.random() * 255));
	if (alpha) {
		return 'rgba(' + r + ',' + g + ',' + b + ',' + '.05)';
	} else {
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	}
}

window.onload = function() {
	c = document.getElementById("canv");
	$ = c.getContext("2d");
	w = c.width = window.innerWidth;
	h = c.height = window.innerHeight;

	var grd = $.createLinearGradient(0, 0, w, 1);
	grd.addColorStop("0", "hsla(0, 0%, 0%, 1)");
	grd.addColorStop("0.1", "hsla(255, 255%, 255%, 1)");
	grd.addColorStop("0.2", "hsla(0,15%,15%,1)");
	grd.addColorStop("0.3", rndCol());
	grd.addColorStop("0.4", rndCol());
	grd.addColorStop("0.5", "hsla(255, 255%, 255%, .7)");
	grd.addColorStop("0.6", "hsla(0, 5%, 10%, 1)");
	grd.addColorStop("0.7", rndCol());
	grd.addColorStop("0.8", "hsla(0, 10%, 5%, 1)");
	grd.addColorStop("0.9", rndCol());
	grd.addColorStop(".95", rndCol());
	grd.addColorStop("1.0", "hsla(255, 255%, 255%, .75)");

	$.fillStyle = grd;

	for (var i = 0; i < num; i++) {
		arr.push(new Line());
	}
	run();
}

function run() {
	window.requestAnimFrame(run);
	loop();
}

function loop() {

	$.fillStyle = "hsla(0,0%,100%,.0)";
	$.fillRect(0, 0, w, h);
	$.globalCompositeOperation = 'source-over';

	for ( var i in arr) {
		var line = arr[i];
		line.update();
		line.draw();
	}
}

var Line = function() {
	var grd = $.createLinearGradient(0, 0, w, 1);
	grd.addColorStop("0", "#ff0078");
	grd.addColorStop("0.1", "#ff0078");
	grd.addColorStop("1", "#ff0078");
	grd.addColorStop("1", rndCol());
	grd.addColorStop("1", rndCol());
	grd.addColorStop("1", rndCol());
	grd.addColorStop("1", rndCol());
	grd.addColorStop("0.7", rndCol());
	grd.addColorStop("0.8", rndCol());
	grd.addColorStop("0.9", rndCol());
	grd.addColorStop(".95", "hsla(0, 5%, 5%, 1)");
	grd.addColorStop("1.0", "hsla(255, 255%, 255%, 1)");

	this.prevX = w / 2;
	this.prevY = h / 2;

	this._X = 0;
	this._Y = 0;

	this.color = grd;
}

Line.prototype.update = function() {
	this._X = this.prevX + (Math.random() * 10) - 5;
	this._Y = this.prevY + (Math.random() * 10) - 5;

	if (this._X < 0 || this._X > w || this._Y < 0 || this._Y > h) {
		arr.push(new Line());
		return;
	}
}

Line.prototype.draw = function() {
	$.globalCompositeOperation = 'difference';
	$.beginPath();
	$.lineWidth = Math.random() * 1 + 2;
	$.strokeStyle = this.color;
	$.moveTo(this.prevX, this.prevY);
	$.lineTo(this._X, this._Y);
	$.stroke();

	this.prevX = this._X;
	this.prevY = this._Y;
}

function particles() {

	this.r = randomIntFromInterval(2, 12);

	var innerR = Math.round(Math.random() * 130) + 1;
	var innerA = Math.round(Math.random() * 360) + 1;

	this.x = cx + innerR * Math.cos(innerA * rad);
	this.y = cy + 20 + innerR * Math.sin(innerA * rad);

	this.ix = (Math.random()) * (Math.random() < 0.5 ? -1 : 1); // positive or
	// negative
	this.iy = (Math.random()) * (Math.random() < 0.5 ? -1 : 1); // positive or
	// negative
	this.alpha = Math.random();
	this.c = "rgba(" + colors[Math.round(Math.random() * colors.length) + 0]
			+ "," + this.alpha + ")";
	// //this.c = "rgb("+colors[Math.round(Math.random() * colors.length) +
	// 1]+")";

}

function Draw() {
	ctx.fillStyle = "rgba(0,0,0,.0)";
	ctx.fillRect(0, 0, cw, ch);
	for (var i = 0; i < p.length; i++) {
		ctx.fillStyle = p[i].c;

		// the current path for isPointInPath
		thePath(p[i].r);

		if (ctx.isPointInPath(p[i].x, p[i].y)) {
			p[i].x += p[i].ix;
			p[i].y += p[i].iy;
			ctx.beginPath();
			ctx.arc(p[i].x, p[i].y, p[i].r, 0, 2 * Math.PI);
			ctx.fill();

		} else {
			p[i].ix = -1 * p[i].ix;
			p[i].iy = -1 * p[i].iy;
			p[i].x += p[i].ix;
			p[i].y += p[i].iy;

		}
	}

	window.requestAnimationFrame(Draw);
}

function thePath(r) {

	// draw a heart
	ctx.beginPath();
	ctx.moveTo(250, 200);
	ctx.arc(350, 200, 100 - r, Math.PI, Math.PI * 0.23);
	ctx.lineTo(250, 450);
	ctx.arc(150, 200, 100 - r, Math.PI * 0.77, 0);
	// NO stroke!!!
}

function randomIntFromInterval(mn, mx) {
	return ~~(Math.random() * (mx - mn + 1) + mn);
}

function Rain(X, Y, nombre) {
	if (!nombre) {
		nombre = nombreb;
	}
	while (nombre--) {
		particules.push({
			vitesseX : (Math.random() * 0.25),
			vitesseY : (Math.random() * 9) + 1,
			X : X,
			Y : Y,
			alpha : 1,
			couleur : "hsla(" + controls.color + "," + controls.saturation
					+ "%, " + controls.lightness + "%," + controls.opacity
					+ ")",
		})
	}
}

function explosion(X, Y, couleur, nombre) {
	if (!nombre) {
		nombre = nombrebase;
	}
	while (nombre--) {
		gouttes.push({
			vitesseX : (Math.random() * 4 - 2),
			vitesseY : (Math.random() * -4),
			X : X,
			Y : Y,
			radius : 0.65 + Math.floor(Math.random() * 1.6),
			alpha : 1,
			couleur : couleur
		})
	}
}

function rendu(ctx) {

	if (controls.multi == true) {
		controls.color = 240 + Math.random() * 80;
	}

	ctx.save();
	ctx.fillStyle = '#f3f3f3';
	ctx.fillRect(0, 0, width, height);

	var particuleslocales = particules;
	var goutteslocales = gouttes;
	var tau = Math.PI * 2;

	for (var i = 0, particulesactives; particulesactives = particuleslocales[i]; i++) {

		ctx.globalAlpha = particulesactives.alpha;
		ctx.fillStyle = particulesactives.couleur;
		ctx.fillRect(particulesactives.X, particulesactives.Y,
				particulesactives.vitesseY / 4, particulesactives.vitesseY);
	}

	for (var i = 0, gouttesactives; gouttesactives = goutteslocales[i]; i++) {

		ctx.globalAlpha = gouttesactives.alpha;
		ctx.fillStyle = gouttesactives.couleur;

		ctx.beginPath();
		ctx.arc(gouttesactives.X, gouttesactives.Y, gouttesactives.radius, 0,
				tau);
		ctx.fill();
	}
	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;

	if (controls.Object == "Umbrella") {
		ctx.beginPath();
		ctx.arc(mouse.X, mouse.Y + 10, 138, 1 * Math.PI, 2 * Math.PI, false);
		ctx.lineWidth = 3;
		ctx.strokeStyle = "hsla(0,100%,100%,1)";
		ctx.stroke();
	}
	if (controls.Object == "Cup") {
		ctx.beginPath();
		ctx.arc(mouse.X, mouse.Y + 10, 143, 1 * Math.PI, 2 * Math.PI, true);
		ctx.lineWidth = 3;
		ctx.strokeStyle = "hsla(0,100%,100%,1)";
		ctx.stroke();
	}
	if (controls.Object == "Circle") {
		ctx.beginPath();
		ctx.arc(mouse.X, mouse.Y + 10, 138, 1 * Math.PI, 3 * Math.PI, false);
		ctx.lineWidth = 3;
		ctx.strokeStyle = "hsla(0,100%,100%,1)";
		ctx.stroke();
	}
	ctx.restore();

	if (controls.auto) {
		controls.color += controls.speed;
		if (controls.color >= 360) {
			controls.color = 0;
		}
	}
}

function update() {

	var particuleslocales = particules;
	var goutteslocales = gouttes;

	for (var i = 0, particulesactives; particulesactives = particuleslocales[i]; i++) {
		particulesactives.X += particulesactives.vitesseX;
		particulesactives.Y += particulesactives.vitesseY + 5;
		if (particulesactives.Y > height - 15) {
			particuleslocales.splice(i--, 1);
			explosion(particulesactives.X, particulesactives.Y,
					particulesactives.couleur);
		}
		var umbrella = (particulesactives.X - mouse.X)
				* (particulesactives.X - mouse.X)
				+ (particulesactives.Y - mouse.Y)
				* (particulesactives.Y - mouse.Y);
		if (controls.Object == "Umbrella") {
			if (umbrella < 20000 && umbrella > 10000
					&& particulesactives.Y < mouse.Y) {
				explosion(particulesactives.X, particulesactives.Y,
						particulesactives.couleur);
				particuleslocales.splice(i--, 1);
			}
		}
		if (controls.Object == "Cup") {
			if (umbrella > 20000 && umbrella < 30000
					&& particulesactives.X + 138 > mouse.X
					&& particulesactives.X - 138 < mouse.X
					&& particulesactives.Y > mouse.Y) {
				explosion(particulesactives.X, particulesactives.Y,
						particulesactives.couleur);
				particuleslocales.splice(i--, 1);
			}
		}
		if (controls.Object == "Circle") {
			if (umbrella < 20000) {
				explosion(particulesactives.X, particulesactives.Y,
						particulesactives.couleur);
				particuleslocales.splice(i--, 1);
			}
		}
	}

	for (var i = 0, gouttesactives; gouttesactives = goutteslocales[i]; i++) {
		gouttesactives.X += gouttesactives.vitesseX;
		gouttesactives.Y += gouttesactives.vitesseY;
		gouttesactives.radius -= 0.075;
		if (gouttesactives.alpha > 0) {
			gouttesactives.alpha -= 0.005;
		} else {
			gouttesactives.alpha = 0;
		}
		if (gouttesactives.radius < 0) {
			goutteslocales.splice(i--, 1);
		}
	}

	var i = controls.rain;
	while (i--) {
		Rain(Math.floor((Math.random() * width)), -15);
	}
}

// Fonction de l'animation pour la page Non
function etoileNon() {

	// Star Numbers
	var starsNumber = 500, canvas = document.getElementById('divCanvas'), context = canvas
			.getContext('2d'), width = window.innerWidth, height = window.innerHeight, x = 100, y = 300, i = 0, t = 0, stars = [], colors = [
			'#e7fcff', '#217cee', '#eef310', '#fe8028', '#87f903' ];

	function Star() {

		// Random Position
		this.x = Math.random() * width;
		this.y = Math.random() * height;

		// Location Starting
		this.speed = 0;

		// Colors
		this.color = colors[Math.floor(Math.random() * colors.length)];

		// Size Limits
		this.size = Math.random();
	}

	function draw() {

		// Colors
		var star;

		// Canvas Size
		canvas.width = width;
		canvas.height = height;

		for (t = 0; t < stars.length; t += 1) {

			// Getting Star
			star = stars[t];

			// Building
			context.beginPath();
			context.fillStyle = star.color;
			context.arc(star.x, star.y, star.size, Math.PI * 2, false);
			context.fill();

			// Animation
			star.x -= star.speed;

			// Keeping Stars on canvas
			if (star.x < -star.size) {
				star.x = width + star.size;
			}

			if (star.size < 5) {
				star.speed = 1;
			}

			if (star.size < 4) {
				star.speed = 0.5;
			}

			if (star.size < 3) {
				star.speed = 0.25;
			}
		}
	}

	for (i = 0; i < starsNumber; i += 1) {
		stars.push(new Star());
	}

	setInterval(draw, 20);

}

// Fonction de l'animation pour la page Oui
function etoileOui() {

	// Star Numbers
	var starsNumber = 500, canvas = document.getElementById('divCanvas'), context = canvas
			.getContext('2d'), width = window.innerWidth, height = window.innerHeight, x = 100, y = 300, i = 0, t = 0, stars = [], colors = [
			'#e7fcff', // Sirius (Canis Major)
			'#217cee', // Rigel (Orion)
			'#eef310', // Sun & Capella (Auriga)
			'#fe8028', // Albedaran (Taurus)
			'#87f903' // Betelgeuse (Orion)
	];

	function Star() {

		// Random Position
		this.x = Math.random() * width;
		this.y = Math.random() * height;

		// Location Starting
		this.speed = 0;

		// Colors
		this.color = colors[Math.floor(Math.random() * colors.length)];

		// Size Limits
		this.size = Math.random();
	}

	function draw() {

		// Colors
		var star;

		// Canvas Size
		canvas.width = width;
		canvas.height = height;

		for (t = 0; t < stars.length; t += 1) {

			// Getting Star
			star = stars[t];

			// Building
			context.beginPath();
			context.fillStyle = star.color;
			context.arc(star.x, star.y, star.size, Math.PI * 2, false);
			context.fill();

			// Animation
			star.x -= star.speed;

			// Keeping Stars on canvas
			if (star.x < -star.size) {
				star.x = width + star.size;
			}

			if (star.size < 5) {
				star.speed = 1;
			}

			if (star.size < 4) {
				star.speed = 0.5;
			}

			if (star.size < 3) {
				star.speed = 0.25;
			}
		}
	}

	for (i = 0; i < starsNumber; i += 1) {
		stars.push(new Star());
	}

	setInterval(draw, 20);

};

// fonction pour l'animation de la page presque
function animPresque() {

	// Star Numbers
	var starsNumber = 500, canvas = document
			.getElementById('divCanvas'), context = canvas
			.getContext('2d'), width = window.innerWidth, height = window.innerHeight, x = 100, y = 300, i = 0, t = 0, stars = [], colors = [
			'#e7fcff', // Sirius        (Canis Major)
			'#217cee', // Rigel         (Orion)
			'#eef310', // Sun & Capella (Auriga)
			'#fe8028', // Albedaran     (Taurus)
			'#87f903' // Betelgeuse    (Orion)
	];

	function Star() {

		// Random Position
		this.x = Math.random() * width;
		this.y = Math.random() * height;

		// Location Starting
		this.speed = 0;

		// Colors
		this.color = colors[Math.floor(Math.random() * colors.length)];

		// Size Limits
		this.size = Math.random();
	}

	function draw() {

		// Colors
		var star;

		// Canvas Size
		canvas.width = width;
		canvas.height = height;

		for (t = 0; t < stars.length; t += 1) {

			// Getting Star
			star = stars[t];

			// Building
			context.beginPath();
			context.fillStyle = star.color;
			context.arc(star.x, star.y, star.size, Math.PI * 2, false);
			context.fill();

			// Animation
			star.x -= star.speed;

			// Keeping Stars on canvas
			if (star.x < -star.size) {
				star.x = width + star.size;
			}

			if (star.size < 5) {
				star.speed = 1;
			}

			if (star.size < 4) {
				star.speed = 0.5;
			}

			if (star.size < 3) {
				star.speed = 0.25;
			}
		}
	}

	for (i = 0; i < starsNumber; i += 1) {
		stars.push(new Star());
	}

	setInterval(draw, 20);

}