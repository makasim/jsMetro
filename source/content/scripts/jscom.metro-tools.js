(function ($) {
	"use strict";
	
	if(!$.js){
		$.js = {
			version: "1.2"
		};
	}
	
	/* SCROLLTO
	 * Author: John Sedlak
	 * Created: 2012-02-08
	 * Use: $(selector).scrollTo()
	 */
	$.fn.scrollTo = function(options) {
		var bodyElement = $('body');
		
		var controller = bodyElement.data('jscom.ScrollToController');
		if (controller == null) {
			controller = new ScrollToController();
			bodyElement.data('jscom.ScrollToController', controller);
		}
		
		controller.scrollTo(this, options);
		
		return controller;
	};
	
	function ScrollToController() {
		this.destination = 0;	// The destination
		this.target = null;		// The element we are scrolling to
		this.timerId = null;	// Used to clear the timeout		
		this.last = new Date();	// Storage of last update
		this.time = 5;			// The limit of the timer
		this.count = 0;			// The current timer counter
		this.total = 0;			// The total amount of movement in pixels
		this.original = 0;		// The scroll position we are coming from
	}
	
	ScrollToController.prototype = {
		
		scrollTo: function(element, options) {
			/* Setup the settings & options */
			var defaults = { 
				offset: element.offset().top - element.height(), 
				target: null,
				time: 5
			};
			
			var settings = $.extend(
				{ }, 
				defaults, 
				options
			);
			
			
			var that = this;
			
			// Clear the timer if we haven't yet
			if (this.timerId != null) {
				clearTimeout(this.timerId);
			}
			
			// Setup the variables
			this.destination = settings.offset;
			this.target = settings.target;
			this.time = settings.time;
			this.original = $(window).scrollTop();
			this.total = this.destination - this.original;
			this.last = new Date();
			this.count = 0;
			
			/*
			alert(
				'original: ' + this.original
				+ '\ntotal: ' + this.total
				+ '\ndestination: ' + this.destination
			);
			*/
			
			// Start the scroll
			this.timerId = setTimeout(
				function() {
					that.update();
				}, 
				16
			);
		},
		
		update: function() {
			var newTime = new Date(),
				delta = (newTime - this.last) / 100.0,
				that = this;
				
			this.last = newTime;
			this.count = this.count + delta;
			
			var percent = this.count / this.time;
			if (percent > 1) {
				percent = 1;
			}
			
			//$('body').scrollTop(percent * this.total + this.original);
			$(window).scrollTop(percent * this.total + this.original);
			
			clearTimeout(this.timerId);
			
			if (percent < 1) {
				this.timerId = setTimeout(
					function() {
						that.update();
					},
					16
				);
			}
		}
	};
	
	/* COLLAPSIBLE
	 * Author: John Sedlak
	 * Created: 2012-02-07
	 * Use: $(selector).collapsible(options)
	 */
	$.fn.collapsible = function(options) {		
		/* Setup the settings & options */
		var defaults = { 
			collapsibleSelector: '.collapsible',
			toggleSelector: '>a',
			hidden: null,
			visible: null,
			autoCollapse: true,
			parentSelector: this.selector
		};
		
		var settings = $.extend(
			{ }, 
			defaults, 
			options
		);
		
		if (settings.autoCollapse) {
			this.find(settings.collapsibleSelector).addClass('collapsed').slideUp(0);
		}
		
		var handleToggleSwitch = function(element, toggle) {
			var collapsible = element,
				parent = collapsible.parents(settings.parentSelector);
			
			if (collapsible.hasClass('collapsed')) {
				collapsible.slideUp(settings.hidden(parent, toggle));
			}
			else {
				collapsible.slideDown(settings.visible(parent, toggle));
			}
		};
		
		return this.each(function() {
			var that = $(this),
				elements = that.find(settings.toggleSelector);
				
			that.find(settings.collapsibleSelector).each(function() {
				var collapsible = $(this);
				var toggle = collapsible.parents(settings.parentSelector).find(settings.toggleSelector);
				
				handleToggleSwitch(collapsible, toggle);
			});
			
			elements.click(function(event) {
				event.preventDefault();
				
				var toggle = $(this);
				var collapsibles = toggle.parents(settings.parentSelector).find(settings.collapsibleSelector);
				
				collapsibles
					.toggleClass('collapsed')
					.each(function() {
						handleToggleSwitch($(this), toggle);
					});
			});
		});
	};
	
	/* NOTIFY
	 * Author: John Sedlak
	 * Created: 2012-02-06
	 * Use: $.js.notify(message, options)
	 */
    $.js.notify = function (message, options) {
		
		var bodyElement = $('body');
		
		var controller = bodyElement.data('jscom.NotifyController');
		if (controller == null) {
			controller = new NotifyController(options);
			bodyElement.data('jscom.NotifyController', controller);
		}
		
		if (message != null && message.length > 0) {
			controller.notify(message, options);
		}
		
		return controller;
    };
	
	function NotifyController(options) {
		// Helper elements & variables
		var bodyElement = $('body'),
			that = this;
		
		var notificationElement = bodyElement.find('#JSNotification');

		if (notificationElement == null || notificationElement.length <= 0) {
			bodyElement.append('<div id="JSNotification"></div>');
			notificationElement = bodyElement.find('#JSNotification');
			notificationElement.html('<p></p><div class="progress"><!--progress--></div>');
		}		

		this.updateSettings(options);

		this.target = notificationElement;
		this.timer = null;
		this.timestamp = 0;
		
		this.target.hover(
			function() { 
				$(this).addClass('mouse-over'); 
			},
			function() { 
				$(this).removeClass('mouse-over'); that.onMouseOut(); 
			}
		);
		
		this.target.every(1, 0, function() {
			that.update();
		});
	};
	
	NotifyController.prototype = {
	
		updateSettings: function(options) {
			/* Setup the settings & options */
			var defaults = { 
				timeout: 4000, 
				cssClass: 'default' 
			};
			
			var settings = $.extend(
				{ }, 
				defaults, 
				options
			);
			
			this.timeout = settings.timeout;
			this.cssClass = settings.cssClass;
		},
		
		notify: function(message, options) {
			if (this.timer != null) {
				clearTimeout(this.timer);
				this.timer = null;
			}
			this.target.attr('class', '');
			this.updateSettings(options);
			
			var timestamp = new Date();

			this.target.find('p').html(
				'<span class="datestamp">' + 
				timestamp.format("h:MM:ss TT").toString() + 
				'</span><span class="message">' + 
				message + 
				'</span>'
			);
			this.timestamp = timestamp;
			this.target.addClass('active').addClass(this.cssClass);
			
			
			var that = this;
			this.timer = setTimeout(
				function() { 
					that.close(); 
				}, 
				this.timeout
			);
		},
	
		update: function() {
			if (this.target.hasClass('mouse-over')) {		
				this.timestamp = new Date();
				
				return;
			}
			
			var time = new Date();
			var delta = time - this.timestamp;
			
			var percent = (delta / this.timeout * 100).toFixed(0);
			if (percent > 100) {
				percent = 100;
			}
			
			this.target.find('.progress').css('width', percent.toString() + '%');
		},
	
		onMouseOut: function() {
			if (this.timer != null) {
				clearTimeout(this.timer);
				this.timer = null;
			}
			
			var that = this;
			this.timer = setTimeout(
				function() { 
					that.close(); 
				}, 
				this.timeout
			);
			
			this.timestamp = new Date();
		},
	
		close: function() {
			if (this.target.hasClass('mouse-over')) {
				return;
			}
			
			this.target.removeClass('active'); //.removeClass(this.cssClass);
		}
	};
	
	/* EVERY
	 * Author: John Sedlak
	 * Created: 2012-02-06
	 * Use: $(selector).every(interval, pause, callback, [id])
	 */
	$.fn.every = function(interval, pauseInterval, callback, id) {
		if (id == null) { 
			id = ''; 
		}
		
		var controller = this.data('jscom.EveryController-' + id);
		
		if (controller == null) {
			controller = new EveryController(this, interval, pauseInterval, callback);
		
			this.data('jscom.EveryController-' + id, controller);
		}
		
		controller.init();
		
		return controller;
	};

	function EveryController(element, interval, pauseInterval, callback) {
		this.element = element;
		this.interval = interval;
		this.pauseInterval = pauseInterval;
		this.callback = callback;
		
		this.timerId = null;
	}

	EveryController.prototype = {
		init: function() {
			this.reset();
		},

		reset: function() {
			// Clear the timer
			clearTimeout(this.timerId);
			
			var that = this;
			
			// Wait for a bit...
			this.timerId = setTimeout(function() { that.timeOut(); }, this.interval);
		},

		timeOut: function () {
			// Reset the timer and perform the callback
			clearTimeout(this.timerId);
			if (this.callback) {
				this.callback();
			}

			// Setup the delay (adjust for animation)
			var that = this;
			this.timerId = setTimeout(
				function () { 
					that.reset(); 
				},
				this.pauseInterval
			);
		}
	};

})(jQuery);
