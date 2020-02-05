'use strict';

// https://edenspiekermann.github.io/a11y-toggle/

(function () {
  'use strict';

  var internalId = 0;
  var togglesMap = {};
  var targetsMap = {};

  function $(selector, context) {
	return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function getClosestToggle(element) {
	if (element.closest) {
	  return element.closest('[data-a11y-toggle]');
	}

	while (element) {
	  if (element.nodeType === 1 && element.hasAttribute('data-a11y-toggle')) {
		return element;
	  }

	  element = element.parentNode;
	}

	return null;
  }

  function handleToggle(toggle) {
	var target = toggle && targetsMap[toggle.getAttribute('aria-controls')];

	if (!target) {
	  return false;
	}

	var toggles = togglesMap['#' + target.id];
	var isExpanded = target.getAttribute('aria-hidden') === 'false';

	target.setAttribute('aria-hidden', isExpanded);
	toggles.forEach(function (toggle) {
	  toggle.setAttribute('aria-expanded', !isExpanded);
	  if (!isExpanded) {
		if (toggle.hasAttribute('data-a11y-toggle-less')) {
		  toggle.innerHTML = toggle.getAttribute('data-a11y-toggle-less');
		}
	  } else {
		if (toggle.hasAttribute('data-a11y-toggle-more')) {
		  toggle.innerHTML = toggle.getAttribute('data-a11y-toggle-more');
		}
	  }
	});
  }

  var initA11yToggle = function initA11yToggle(context) {
	togglesMap = $('[data-a11y-toggle]', context).reduce(function (acc, toggle) {
	  var selector = '#' + toggle.getAttribute('data-a11y-toggle');
	  acc[selector] = acc[selector] || [];
	  acc[selector].push(toggle);
	  return acc;
	}, togglesMap);

	var targets = Object.keys(togglesMap);
	targets.length && $(targets).forEach(function (target) {
	  var toggles = togglesMap['#' + target.id];
	  var isExpanded = target.hasAttribute('data-a11y-toggle-open');
	  var labelledby = [];

	  toggles.forEach(function (toggle) {
		toggle.id || toggle.setAttribute('id', 'a11y-toggle-' + internalId++);
		toggle.setAttribute('aria-controls', target.id);
		toggle.setAttribute('aria-expanded', isExpanded);
		labelledby.push(toggle.id);
	  });

	  target.setAttribute('aria-hidden', !isExpanded);
	  target.hasAttribute('aria-labelledby') || target.setAttribute('aria-labelledby', labelledby.join(' '));

	  targetsMap[target.id] = target;
	});
  };

  document.addEventListener('DOMContentLoaded', function () {
	initA11yToggle();
  });

  document.addEventListener('click', function (event) {
	var toggle = getClosestToggle(event.target);
	handleToggle(toggle);
  });

  document.addEventListener('keyup', function (event) {
	if (event.which === 13 || event.which === 32) {
	  var toggle = getClosestToggle(event.target);
	  if (toggle && toggle.getAttribute('role') === 'button') {
		handleToggle(toggle);
	  }
	}
  });

  window && (window.a11yToggle = initA11yToggle);
})();
'use strict';

/**
 * This script adds the accessibility-ready responsive menus Genesis Framework child themes.
 *
 * @author StudioPress
 * @link https://github.com/copyblogger/responsive-menus
 * @version 1.1.3
 * @license GPL-2.0+
 */

(function (document, $, undefined) {

	'use strict';

	$('body').removeClass('no-js');

	var genesisMenuParams = typeof genesis_responsive_menu === 'undefined' ? '' : genesis_responsive_menu,
		genesisMenusUnchecked = genesisMenuParams.menuClasses,
		genesisMenus = {},
		menusToCombine = [];

	/**
  * Validate the menus passed by the theme with what's being loaded on the page,
  * and pass the new and accurate information to our new data.
  * @param {genesisMenusUnchecked} Raw data from the localized script in the theme.
  * @return {array} genesisMenus array gets populated with updated data.
  * @return {array} menusToCombine array gets populated with relevant data.
  */
	$.each(genesisMenusUnchecked, function (group) {

		// Mirror our group object to populate.
		genesisMenus[group] = [];

		// Loop through each instance of the specified menu on the page.
		$.each(this, function (key, value) {

			var menuString = value,
				$menu = $(value);

			// If there is more than one instance, append the index and update array.
			if ($menu.length > 1) {

				$.each($menu, function (key, value) {

					var newString = menuString + '-' + key;

					$(this).addClass(newString.replace('.', ''));

					genesisMenus[group].push(newString);

					if ('combine' === group) {
						menusToCombine.push(newString);
					}
				});
			} else if ($menu.length == 1) {

				genesisMenus[group].push(menuString);

				if ('combine' === group) {
					menusToCombine.push(menuString);
				}
			}
		});
	});

	// Make sure there is something to use for the 'others' array.
	if (typeof genesisMenus.others == 'undefined') {
		genesisMenus.others = [];
	}

	// If there's only one menu on the page for combining, push it to the 'others' array and nullify our 'combine' variable.
	if (menusToCombine.length == 1) {
		genesisMenus.others.push(menusToCombine[0]);
		genesisMenus.combine = null;
		menusToCombine = null;
	}

	var genesisMenu = {},
		mainMenuButtonClass = 'menu-toggle',
		subMenuButtonClass = 'sub-menu-toggle',
		responsiveMenuClass = 'genesis-responsive-menu';

	// Initialize.
	genesisMenu.init = function () {

		// Exit early if there are no menus to do anything.
		if ($(_getAllMenusArray()).length == 0) {
			return;
		}

		var menuIconClass = typeof genesisMenuParams.menuIconClass !== 'undefined' ? genesisMenuParams.menuIconClass : 'dashicons-before dashicons-menu',
			subMenuIconClass = typeof genesisMenuParams.subMenuIconClass !== 'undefined' ? genesisMenuParams.subMenuIconClass : 'dashicons-before dashicons-arrow-down-alt2',
			toggleButtons = {
			menu: $('<button />', {
				'class': mainMenuButtonClass,
				'aria-expanded': false,
				'aria-pressed': false,
				'role': 'button'
			}).append($('<span />', {
				'class': 'screen-reader-text',
				'text': genesisMenuParams.mainMenu
			})),
			submenu: $('<button />', {
				'class': subMenuButtonClass,
				'aria-expanded': false,
				'aria-pressed': false,
				'text': ''
			}).append($('<span />', {
				'class': 'screen-reader-text',
				'text': genesisMenuParams.subMenu
			}))
		};

		// Add the responsive menu class to the active menus.
		_addResponsiveMenuClass();

		// Add the main nav button to the primary menu, or exit the plugin.
		_addMenuButtons(toggleButtons);

		// Setup additional classes.
		$('.' + mainMenuButtonClass).addClass(menuIconClass);
		$('.' + subMenuButtonClass).addClass(subMenuIconClass);
		$('.' + mainMenuButtonClass).on('click.genesisMenu-mainbutton', _mainmenuToggle).each(_addClassID);
		$('.' + subMenuButtonClass).on('click.genesisMenu-subbutton', _submenuToggle);
		$(window).on('resize.genesisMenu', _doResize).triggerHandler('resize.genesisMenu');
	};

	/**
  * Add menu toggle button to appropriate menus.
  * @param {toggleButtons} Object of menu buttons to use for toggles.
  */
	function _addMenuButtons(toggleButtons) {

		// Apply sub menu toggle to each sub-menu found in the menuList.
		$(_getMenuSelectorString(genesisMenus)).find('.sub-menu').before(toggleButtons.submenu);

		if (menusToCombine !== null) {

			var menusToToggle = genesisMenus.others.concat(menusToCombine[0]);

			// Only add menu button the primary menu and navs NOT in the combine variable.
			$(_getMenuSelectorString(menusToToggle)).before(toggleButtons.menu);
		} else {

			// Apply the main menu toggle to all menus in the list.
			$(_getMenuSelectorString(genesisMenus.others)).before(toggleButtons.menu);
		}
	}

	/**
  * Add the responsive menu class.
  */
	function _addResponsiveMenuClass() {
		$(_getMenuSelectorString(genesisMenus)).addClass(responsiveMenuClass);
	}

	/**
  * Execute our responsive menu functions on window resizing.
  */
	function _doResize() {
		var buttons = $('button[id^="genesis-mobile-"]').attr('id');
		if (typeof buttons === 'undefined') {
			return;
		}
		_maybeClose(buttons);
		_superfishToggle(buttons);
		_changeSkipLink(buttons);
		_combineMenus(buttons);
	}

	/**
  * Add the nav- class of the related navigation menu as
  * an ID to associated button (helps target specific buttons outside of context).
  */
	function _addClassID() {
		var $this = $(this),
			nav = $this.next('nav'),
			id = 'class';

		$this.attr('id', 'genesis-mobile-' + $(nav).attr(id).match(/nav-\w*\b/));
	}

	/**
  * Combine our menus if the mobile menu is visible.
  * @params buttons
  */
	function _combineMenus(buttons) {

		// Exit early if there are no menus to combine.
		if (menusToCombine == null) {
			return;
		}

		// Split up the menus to combine based on order of appearance in the array.
		var primaryMenu = menusToCombine[0],
			combinedMenus = $(menusToCombine).filter(function (index) {
			if (index > 0) {
				return index;
			}
		});

		// If the responsive menu is active, append items in 'combinedMenus' object to the 'primaryMenu' object.
		if ('none' !== _getDisplayValue(buttons)) {

			$.each(combinedMenus, function (key, value) {
				$(value).find('.menu > li').addClass('moved-item-' + value.replace('.', '')).appendTo(primaryMenu + ' ul.genesis-nav-menu');
			});
			$(_getMenuSelectorString(combinedMenus)).hide();
		} else {

			$(_getMenuSelectorString(combinedMenus)).show();
			$.each(combinedMenus, function (key, value) {
				$('.moved-item-' + value.replace('.', '')).appendTo(value + ' ul.genesis-nav-menu').removeClass('moved-item-' + value.replace('.', ''));
			});
		}
	}

	/**
  * Action to happen when the main menu button is clicked.
  */
	function _mainmenuToggle() {
		var $this = $(this);
		_toggleAria($this, 'aria-pressed');
		_toggleAria($this, 'aria-expanded');
		$this.toggleClass('activated');
		$this.next('nav').slideToggle('fast');
	}

	/**
  * Action for submenu toggles.
  */
	function _submenuToggle() {

		var $this = $(this),
			others = $this.closest('.menu-item').siblings();
		_toggleAria($this, 'aria-pressed');
		_toggleAria($this, 'aria-expanded');
		$this.toggleClass('activated');
		$this.next('.sub-menu').slideToggle('fast');

		others.find('.' + subMenuButtonClass).removeClass('activated').attr('aria-pressed', 'false');
		others.find('.sub-menu').slideUp('fast');
	}

	/**
  * Activate/deactivate superfish.
  * @params buttons
  */
	function _superfishToggle(buttons) {
		var _superfish = $('.' + responsiveMenuClass + ' .js-superfish'),
			$args = 'destroy';
		if (typeof _superfish.superfish !== 'function') {
			return;
		}
		if ('none' === _getDisplayValue(buttons)) {
			$args = {
				'delay': 0,
				'animation': { 'opacity': 'show' },
				'speed': 300,
				'disableHI': true
			};
		}
		_superfish.superfish($args);
	}

	/**
  * Modify skip link to match mobile buttons.
  * @param buttons
  */
	function _changeSkipLink(buttons) {

		// Start with an empty array.
		var menuToggleList = _getAllMenusArray();

		// Exit out if there are no menu items to update.
		if (!$(menuToggleList).length > 0) {
			return;
		}

		$.each(menuToggleList, function (key, value) {

			var newValue = value.replace('.', ''),
				startLink = 'genesis-' + newValue,
				endLink = 'genesis-mobile-' + newValue;

			if ('none' == _getDisplayValue(buttons)) {
				startLink = 'genesis-mobile-' + newValue;
				endLink = 'genesis-' + newValue;
			}

			var $item = $('.genesis-skip-link a[href="#' + startLink + '"]');

			if (menusToCombine !== null && value !== menusToCombine[0]) {
				$item.toggleClass('skip-link-hidden');
			}

			if ($item.length > 0) {
				var link = $item.attr('href');
				link = link.replace(startLink, endLink);

				$item.attr('href', link);
			} else {
				return;
			}
		});
	}

	/**
  * Close all the menu toggles if buttons are hidden.
  * @param buttons
  */
	function _maybeClose(buttons) {
		if ('none' !== _getDisplayValue(buttons)) {
			return true;
		}

		$('.' + mainMenuButtonClass + ', .' + responsiveMenuClass + ' .sub-menu-toggle').removeClass('activated').attr('aria-expanded', false).attr('aria-pressed', false);

		$('.' + responsiveMenuClass + ', .' + responsiveMenuClass + ' .sub-menu').attr('style', '');
	}

	/**
  * Generic function to get the display value of an element.
  * @param  {id} $id ID to check
  * @return {string}	 CSS value of display property
  */
	function _getDisplayValue($id) {
		var element = document.getElementById($id),
			style = window.getComputedStyle(element);
		return style.getPropertyValue('display');
	}

	/**
  * Toggle aria attributes.
  * @param  {button} $this	 passed through
  * @param  {aria-xx} attribute aria attribute to toggle
  * @return {bool}		   from _ariaReturn
  */
	function _toggleAria($this, attribute) {
		$this.attr(attribute, function (index, value) {
			return 'false' === value;
		});
	}

	/**
  * Helper function to return a comma separated string of menu selectors.
  * @param {itemArray} Array of menu items to loop through.
  * @param {ignoreSecondary} boolean of whether to ignore the 'secondary' menu item.
  * @return {string} Comma-separated string.
  */
	function _getMenuSelectorString(itemArray) {

		var itemString = $.map(itemArray, function (value, key) {
			return value;
		});

		return itemString.join(',');
	}

	/**
  * Helper function to return a group array of all the menus in
  * both the 'others' and 'combine' arrays.
  * @return {array} Array of all menu items as class selectors.
  */
	function _getAllMenusArray() {

		// Start with an empty array.
		var menuList = [];

		// If there are menus in the 'menusToCombine' array, add them to 'menuList'.
		if (menusToCombine !== null) {

			$.each(menusToCombine, function (key, value) {
				menuList.push(value.valueOf());
			});
		}

		// Add menus in the 'others' array to 'menuList'.
		$.each(genesisMenus.others, function (key, value) {
			menuList.push(value.valueOf());
		});

		if (menuList.length > 0) {
			return menuList;
		} else {
			return null;
		}
	}

	$(document).ready(function () {

		if (_getAllMenusArray() !== null) {

			genesisMenu.init();
		}
	});
})(document, jQuery);
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * hoverIntent is similar to jQuery's built-in "hover" method except that
 * instead of firing the handlerIn function immediately, hoverIntent checks
 * to see if the user's mouse has slowed down (beneath the sensitivity
 * threshold) before firing the event. The handlerOut function is only
 * called after a matching handlerIn.
 *
 * hoverIntent r7 // 2013.03.11 // jQuery 1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2013 Brian Cherne
 *
 * // basic usage ... just like .hover()
 * .hoverIntent( handlerIn, handlerOut )
 * .hoverIntent( handlerInOut )
 *
 * // basic usage ... with event delegation!
 * .hoverIntent( handlerIn, handlerOut, selector )
 * .hoverIntent( handlerInOut, selector )
 *
 * // using a basic configuration object
 * .hoverIntent( config )
 *
 * @param  handlerIn   function OR configuration object
 * @param  handlerOut  function OR selector for delegation OR undefined
 * @param  selector	selector OR undefined
 * @author Brian Cherne <brian(at)cherne(dot)net>
 **/
(function ($) {
	$.fn.hoverIntent = function (handlerIn, handlerOut, selector) {

		// default configuration values
		var cfg = {
			interval: 100,
			sensitivity: 7,
			timeout: 0
		};

		if ((typeof handlerIn === "undefined" ? "undefined" : _typeof(handlerIn)) === "object") {
			cfg = $.extend(cfg, handlerIn);
		} else if ($.isFunction(handlerOut)) {
			cfg = $.extend(cfg, { over: handlerIn, out: handlerOut, selector: selector });
		} else {
			cfg = $.extend(cfg, { over: handlerIn, out: handlerIn, selector: handlerOut });
		}

		// instantiate variables
		// cX, cY = current X and Y position of mouse, updated by mousemove event
		// pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
		var cX, cY, pX, pY;

		// A private function for getting mouse position
		var track = function track(ev) {
			cX = ev.pageX;
			cY = ev.pageY;
		};

		// A private function for comparing current and previous mouse position
		var compare = function compare(ev, ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			// compare mouse positions to see if they've crossed the threshold
			if (Math.abs(pX - cX) + Math.abs(pY - cY) < cfg.sensitivity) {
				$(ob).off("mousemove.hoverIntent", track);
				// set hoverIntent state to true (so mouseOut can be called)
				ob.hoverIntent_s = 1;
				return cfg.over.apply(ob, [ev]);
			} else {
				// set previous coordinates for next time
				pX = cX;pY = cY;
				// use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
				ob.hoverIntent_t = setTimeout(function () {
					compare(ev, ob);
				}, cfg.interval);
			}
		};

		// A private function for delaying the mouseOut function
		var delay = function delay(ev, ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			ob.hoverIntent_s = 0;
			return cfg.out.apply(ob, [ev]);
		};

		// A private function for handling mouse 'hovering'
		var handleHover = function handleHover(e) {
			// copy objects to be passed into t (required for event object to be passed in IE)
			var ev = jQuery.extend({}, e);
			var ob = this;

			// cancel hoverIntent timer if it exists
			if (ob.hoverIntent_t) {
				ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			}

			// if e.type == "mouseenter"
			if (e.type == "mouseenter") {
				// set "previous" X and Y position based on initial entry point
				pX = ev.pageX;pY = ev.pageY;
				// update "current" X and Y position based on mousemove
				$(ob).on("mousemove.hoverIntent", track);
				// start polling interval (self-calling timeout) to compare mouse coordinates over time
				if (ob.hoverIntent_s != 1) {
					ob.hoverIntent_t = setTimeout(function () {
						compare(ev, ob);
					}, cfg.interval);
				}

				// else e.type == "mouseleave"
			} else {
				// unbind expensive mousemove event
				$(ob).off("mousemove.hoverIntent", track);
				// if hoverIntent state is true, then call the mouseOut function after the specified delay
				if (ob.hoverIntent_s == 1) {
					ob.hoverIntent_t = setTimeout(function () {
						delay(ev, ob);
					}, cfg.timeout);
				}
			}
		};

		// listen for mouseenter and mouseleave
		return this.on({ 'mouseenter.hoverIntent': handleHover, 'mouseleave.hoverIntent': handleHover }, cfg.selector);
	};
})(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * imagesLoaded PACKAGED v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

/**
 * EvEmitter v1.1.0
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

(function (global, factory) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, window */
  if (typeof define == 'function' && define.amd) {
	// AMD - RequireJS
	define('ev-emitter/ev-emitter', factory);
  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module.exports) {
	// CommonJS - Browserify, Webpack
	module.exports = factory();
  } else {
	// Browser globals
	global.EvEmitter = factory();
  }
})(typeof window != 'undefined' ? window : undefined, function () {

  function EvEmitter() {}

  var proto = EvEmitter.prototype;

  proto.on = function (eventName, listener) {
	if (!eventName || !listener) {
	  return;
	}
	// set events hash
	var events = this._events = this._events || {};
	// set listeners array
	var listeners = events[eventName] = events[eventName] || [];
	// only add once
	if (listeners.indexOf(listener) == -1) {
	  listeners.push(listener);
	}

	return this;
  };

  proto.once = function (eventName, listener) {
	if (!eventName || !listener) {
	  return;
	}
	// add event
	this.on(eventName, listener);
	// set once flag
	// set onceEvents hash
	var onceEvents = this._onceEvents = this._onceEvents || {};
	// set onceListeners object
	var onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
	// set flag
	onceListeners[listener] = true;

	return this;
  };

  proto.off = function (eventName, listener) {
	var listeners = this._events && this._events[eventName];
	if (!listeners || !listeners.length) {
	  return;
	}
	var index = listeners.indexOf(listener);
	if (index != -1) {
	  listeners.splice(index, 1);
	}

	return this;
  };

  proto.emitEvent = function (eventName, args) {
	var listeners = this._events && this._events[eventName];
	if (!listeners || !listeners.length) {
	  return;
	}
	// copy over to avoid interference if .off() in listener
	listeners = listeners.slice(0);
	args = args || [];
	// once stuff
	var onceListeners = this._onceEvents && this._onceEvents[eventName];

	for (var i = 0; i < listeners.length; i++) {
	  var listener = listeners[i];
	  var isOnce = onceListeners && onceListeners[listener];
	  if (isOnce) {
		// remove listener
		// remove before trigger to prevent recursion
		this.off(eventName, listener);
		// unset once flag
		delete onceListeners[listener];
	  }
	  // trigger listener
	  listener.apply(this, args);
	}

	return this;
  };

  proto.allOff = function () {
	delete this._events;
	delete this._onceEvents;
  };

  return EvEmitter;
});

/*!
 * imagesLoaded v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

(function (window, factory) {
  'use strict';
  // universal module definition

  /*global define: false, module: false, require: false */

  if (typeof define == 'function' && define.amd) {
	// AMD
	define(['ev-emitter/ev-emitter'], function (EvEmitter) {
	  return factory(window, EvEmitter);
	});
  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module.exports) {
	// CommonJS
	module.exports = factory(window, require('ev-emitter'));
  } else {
	// browser global
	window.imagesLoaded = factory(window, window.EvEmitter);
  }
})(typeof window !== 'undefined' ? window : undefined,

// --------------------------  factory -------------------------- //

function factory(window, EvEmitter) {

  var $ = window.jQuery;
  var console = window.console;

  // -------------------------- helpers -------------------------- //

  // extend objects
  function extend(a, b) {
	for (var prop in b) {
	  a[prop] = b[prop];
	}
	return a;
  }

  var arraySlice = Array.prototype.slice;

  // turn element or nodeList into an array
  function makeArray(obj) {
	if (Array.isArray(obj)) {
	  // use object if already an array
	  return obj;
	}

	var isArrayLike = (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == 'object' && typeof obj.length == 'number';
	if (isArrayLike) {
	  // convert nodeList to array
	  return arraySlice.call(obj);
	}

	// array of single index
	return [obj];
  }

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded(elem, options, onAlways) {
	// coerce ImagesLoaded() without new, to be new ImagesLoaded()
	if (!(this instanceof ImagesLoaded)) {
	  return new ImagesLoaded(elem, options, onAlways);
	}
	// use elem as selector string
	var queryElem = elem;
	if (typeof elem == 'string') {
	  queryElem = document.querySelectorAll(elem);
	}
	// bail if bad element
	if (!queryElem) {
	  console.error('Bad element for imagesLoaded ' + (queryElem || elem));
	  return;
	}

	this.elements = makeArray(queryElem);
	this.options = extend({}, this.options);
	// shift arguments if no options set
	if (typeof options == 'function') {
	  onAlways = options;
	} else {
	  extend(this.options, options);
	}

	if (onAlways) {
	  this.on('always', onAlways);
	}

	this.getImages();

	if ($) {
	  // add jQuery Deferred object
	  this.jqDeferred = new $.Deferred();
	}

	// HACK check async to allow time to bind listeners
	setTimeout(this.check.bind(this));
  }

  ImagesLoaded.prototype = Object.create(EvEmitter.prototype);

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function () {
	this.images = [];

	// filter & find items if we have an item selector
	this.elements.forEach(this.addElementImages, this);
  };

  /**
   * @param {Node} element
   */
  ImagesLoaded.prototype.addElementImages = function (elem) {
	// filter siblings
	if (elem.nodeName == 'IMG') {
	  this.addImage(elem);
	}
	// get background image on element
	if (this.options.background === true) {
	  this.addElementBackgroundImages(elem);
	}

	// find children
	// no non-element nodes, #143
	var nodeType = elem.nodeType;
	if (!nodeType || !elementNodeTypes[nodeType]) {
	  return;
	}
	var childImgs = elem.querySelectorAll('img');
	// concat childElems to filterFound array
	for (var i = 0; i < childImgs.length; i++) {
	  var img = childImgs[i];
	  this.addImage(img);
	}

	// get child background images
	if (typeof this.options.background == 'string') {
	  var children = elem.querySelectorAll(this.options.background);
	  for (i = 0; i < children.length; i++) {
		var child = children[i];
		this.addElementBackgroundImages(child);
	  }
	}
  };

  var elementNodeTypes = {
	1: true,
	9: true,
	11: true
  };

  ImagesLoaded.prototype.addElementBackgroundImages = function (elem) {
	var style = getComputedStyle(elem);
	if (!style) {
	  // Firefox returns null if in a hidden iframe https://bugzil.la/548397
	  return;
	}
	// get url inside url("...")
	var reURL = /url\((['"])?(.*?)\1\)/gi;
	var matches = reURL.exec(style.backgroundImage);
	while (matches !== null) {
	  var url = matches && matches[2];
	  if (url) {
		this.addBackground(url, elem);
	  }
	  matches = reURL.exec(style.backgroundImage);
	}
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function (img) {
	var loadingImage = new LoadingImage(img);
	this.images.push(loadingImage);
  };

  ImagesLoaded.prototype.addBackground = function (url, elem) {
	var background = new Background(url, elem);
	this.images.push(background);
  };

  ImagesLoaded.prototype.check = function () {
	var _this = this;
	this.progressedCount = 0;
	this.hasAnyBroken = false;
	// complete if no images
	if (!this.images.length) {
	  this.complete();
	  return;
	}

	function onProgress(image, elem, message) {
	  // HACK - Chrome triggers event before object properties have changed. #83
	  setTimeout(function () {
		_this.progress(image, elem, message);
	  });
	}

	this.images.forEach(function (loadingImage) {
	  loadingImage.once('progress', onProgress);
	  loadingImage.check();
	});
  };

  ImagesLoaded.prototype.progress = function (image, elem, message) {
	this.progressedCount++;
	this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
	// progress event
	this.emitEvent('progress', [this, image, elem]);
	if (this.jqDeferred && this.jqDeferred.notify) {
	  this.jqDeferred.notify(this, image);
	}
	// check if completed
	if (this.progressedCount == this.images.length) {
	  this.complete();
	}

	if (this.options.debug && console) {
	  console.log('progress: ' + message, image, elem);
	}
  };

  ImagesLoaded.prototype.complete = function () {
	var eventName = this.hasAnyBroken ? 'fail' : 'done';
	this.isComplete = true;
	this.emitEvent(eventName, [this]);
	this.emitEvent('always', [this]);
	if (this.jqDeferred) {
	  var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
	  this.jqDeferred[jqMethod](this);
	}
  };

  // --------------------------  -------------------------- //

  function LoadingImage(img) {
	this.img = img;
  }

  LoadingImage.prototype = Object.create(EvEmitter.prototype);

  LoadingImage.prototype.check = function () {
	// If complete is true and browser supports natural sizes,
	// try to check for image status manually.
	var isComplete = this.getIsImageComplete();
	if (isComplete) {
	  // report based on naturalWidth
	  this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
	  return;
	}

	// If none of the checks above matched, simulate loading on detached element.
	this.proxyImage = new Image();
	this.proxyImage.addEventListener('load', this);
	this.proxyImage.addEventListener('error', this);
	// bind to image as well for Firefox. #191
	this.img.addEventListener('load', this);
	this.img.addEventListener('error', this);
	this.proxyImage.src = this.img.src;
  };

  LoadingImage.prototype.getIsImageComplete = function () {
	// check for non-zero, non-undefined naturalWidth
	// fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
	return this.img.complete && this.img.naturalWidth;
  };

  LoadingImage.prototype.confirm = function (isLoaded, message) {
	this.isLoaded = isLoaded;
	this.emitEvent('progress', [this, this.img, message]);
  };

  // ----- events ----- //

  // trigger specified handler for event type
  LoadingImage.prototype.handleEvent = function (event) {
	var method = 'on' + event.type;
	if (this[method]) {
	  this[method](event);
	}
  };

  LoadingImage.prototype.onload = function () {
	this.confirm(true, 'onload');
	this.unbindEvents();
  };

  LoadingImage.prototype.onerror = function () {
	this.confirm(false, 'onerror');
	this.unbindEvents();
  };

  LoadingImage.prototype.unbindEvents = function () {
	this.proxyImage.removeEventListener('load', this);
	this.proxyImage.removeEventListener('error', this);
	this.img.removeEventListener('load', this);
	this.img.removeEventListener('error', this);
  };

  // -------------------------- Background -------------------------- //

  function Background(url, element) {
	this.url = url;
	this.element = element;
	this.img = new Image();
  }

  // inherit LoadingImage prototype
  Background.prototype = Object.create(LoadingImage.prototype);

  Background.prototype.check = function () {
	this.img.addEventListener('load', this);
	this.img.addEventListener('error', this);
	this.img.src = this.url;
	// check if image is already complete
	var isComplete = this.getIsImageComplete();
	if (isComplete) {
	  this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
	  this.unbindEvents();
	}
  };

  Background.prototype.unbindEvents = function () {
	this.img.removeEventListener('load', this);
	this.img.removeEventListener('error', this);
  };

  Background.prototype.confirm = function (isLoaded, message) {
	this.isLoaded = isLoaded;
	this.emitEvent('progress', [this, this.element, message]);
  };

  // -------------------------- jQuery -------------------------- //

  ImagesLoaded.makeJQueryPlugin = function (jQuery) {
	jQuery = jQuery || window.jQuery;
	if (!jQuery) {
	  return;
	}
	// set local variable
	$ = jQuery;
	// $().imagesLoaded()
	$.fn.imagesLoaded = function (options, callback) {
	  var instance = new ImagesLoaded(this, options, callback);
	  return instance.jqDeferred.promise($(this));
	};
  };
  // try making plugin
  ImagesLoaded.makeJQueryPlugin();

  // --------------------------  -------------------------- //

  return ImagesLoaded;
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
* jquery-match-height master by @liabru
* http://brm.io/jquery-match-height/
* License: MIT
*/

;(function (factory) {
	// eslint-disable-line no-extra-semi
	'use strict';

	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof module !== 'undefined' && module.exports) {
		// CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Global
		factory(jQuery);
	}
})(function ($) {
	/*
	*  internal
	*/

	var _previousResizeWidth = -1,
		_updateTimeout = -1;

	/*
	*  _parse
	*  value parse utility function
	*/

	var _parse = function _parse(value) {
		// parse value and convert NaN to 0
		return parseFloat(value) || 0;
	};

	/*
	*  _rows
	*  utility function returns array of jQuery selections representing each row
	*  (as displayed after float wrapping applied by browser)
	*/

	var _rows = function _rows(elements) {
		var tolerance = 1,
			$elements = $(elements),
			lastTop = null,
			rows = [];

		// group elements by their top position
		$elements.each(function () {
			var $that = $(this),
				top = $that.offset().top - _parse($that.css('margin-top')),
				lastRow = rows.length > 0 ? rows[rows.length - 1] : null;

			if (lastRow === null) {
				// first item on the row, so just push it
				rows.push($that);
			} else {
				// if the row top is the same, add to the row group
				if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
					rows[rows.length - 1] = lastRow.add($that);
				} else {
					// otherwise start a new row group
					rows.push($that);
				}
			}

			// keep track of the last row top
			lastTop = top;
		});

		return rows;
	};

	/*
	*  _parseOptions
	*  handle plugin options
	*/

	var _parseOptions = function _parseOptions(options) {
		var opts = {
			byRow: true,
			property: 'height',
			target: null,
			remove: false
		};

		if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return $.extend(opts, options);
		}

		if (typeof options === 'boolean') {
			opts.byRow = options;
		} else if (options === 'remove') {
			opts.remove = true;
		}

		return opts;
	};

	/*
	*  matchHeight
	*  plugin definition
	*/

	var matchHeight = $.fn.matchHeight = function (options) {
		var opts = _parseOptions(options);

		// handle remove
		if (opts.remove) {
			var that = this;

			// remove fixed height from all selected elements
			this.css(opts.property, '');

			// remove selected elements from all groups
			$.each(matchHeight._groups, function (key, group) {
				group.elements = group.elements.not(that);
			});

			// TODO: cleanup empty groups

			return this;
		}

		if (this.length <= 1 && !opts.target) {
			return this;
		}

		// keep track of this group so we can re-apply later on load and resize events
		matchHeight._groups.push({
			elements: this,
			options: opts
		});

		// match each element's height to the tallest element in the selection
		matchHeight._apply(this, opts);

		return this;
	};

	/*
	*  plugin global options
	*/

	matchHeight.version = 'master';
	matchHeight._groups = [];
	matchHeight._throttle = 80;
	matchHeight._maintainScroll = false;
	matchHeight._beforeUpdate = null;
	matchHeight._afterUpdate = null;
	matchHeight._rows = _rows;
	matchHeight._parse = _parse;
	matchHeight._parseOptions = _parseOptions;

	/*
	*  matchHeight._apply
	*  apply matchHeight to given elements
	*/

	matchHeight._apply = function (elements, options) {
		var opts = _parseOptions(options),
			$elements = $(elements),
			rows = [$elements];

		// take note of scroll position
		var scrollTop = $(window).scrollTop(),
			htmlHeight = $('html').outerHeight(true);

		// get hidden parents
		var $hiddenParents = $elements.parents().filter(':hidden');

		// cache the original inline style
		$hiddenParents.each(function () {
			var $that = $(this);
			$that.data('style-cache', $that.attr('style'));
		});

		// temporarily must force hidden parents visible
		$hiddenParents.css('display', 'block');

		// get rows if using byRow, otherwise assume one row
		if (opts.byRow && !opts.target) {

			// must first force an arbitrary equal height so floating elements break evenly
			$elements.each(function () {
				var $that = $(this),
					display = $that.css('display');

				// temporarily force a usable display value
				if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
					display = 'block';
				}

				// cache the original inline style
				$that.data('style-cache', $that.attr('style'));

				$that.css({
					'display': display,
					'padding-top': '0',
					'padding-bottom': '0',
					'margin-top': '0',
					'margin-bottom': '0',
					'border-top-width': '0',
					'border-bottom-width': '0',
					'height': '100px',
					'overflow': 'hidden'
				});
			});

			// get the array of rows (based on element top position)
			rows = _rows($elements);

			// revert original inline styles
			$elements.each(function () {
				var $that = $(this);
				$that.attr('style', $that.data('style-cache') || '');
			});
		}

		$.each(rows, function (key, row) {
			var $row = $(row),
				targetHeight = 0;

			if (!opts.target) {
				// skip apply to rows with only one item
				if (opts.byRow && $row.length <= 1) {
					$row.css(opts.property, '');
					return;
				}

				// iterate the row and find the max height
				$row.each(function () {
					var $that = $(this),
						style = $that.attr('style'),
						display = $that.css('display');

					// temporarily force a usable display value
					if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
						display = 'block';
					}

					// ensure we get the correct actual height (and not a previously set height value)
					var css = { 'display': display };
					css[opts.property] = '';
					$that.css(css);

					// find the max height (including padding, but not margin)
					if ($that.outerHeight(false) > targetHeight) {
						targetHeight = $that.outerHeight(false);
					}

					// revert styles
					if (style) {
						$that.attr('style', style);
					} else {
						$that.css('display', '');
					}
				});
			} else {
				// if target set, use the height of the target element
				targetHeight = opts.target.outerHeight(false);
			}

			// iterate the row and apply the height to all elements
			$row.each(function () {
				var $that = $(this),
					verticalPadding = 0;

				// don't apply to a target
				if (opts.target && $that.is(opts.target)) {
					return;
				}

				// handle padding and border correctly (required when not using border-box)
				if ($that.css('box-sizing') !== 'border-box') {
					verticalPadding += _parse($that.css('border-top-width')) + _parse($that.css('border-bottom-width'));
					verticalPadding += _parse($that.css('padding-top')) + _parse($that.css('padding-bottom'));
				}

				// set the height (accounting for padding and border)
				$that.css(opts.property, targetHeight - verticalPadding + 'px');
			});
		});

		// revert hidden parents
		$hiddenParents.each(function () {
			var $that = $(this);
			$that.attr('style', $that.data('style-cache') || null);
		});

		// restore scroll position if enabled
		if (matchHeight._maintainScroll) {
			$(window).scrollTop(scrollTop / htmlHeight * $('html').outerHeight(true));
		}

		return this;
	};

	/*
	*  matchHeight._applyDataApi
	*  applies matchHeight to all elements with a data-match-height attribute
	*/

	matchHeight._applyDataApi = function () {
		var groups = {};

		// generate groups by their groupId set by elements using data-match-height
		$('[data-match-height], [data-mh]').each(function () {
			var $this = $(this),
				groupId = $this.attr('data-mh') || $this.attr('data-match-height');

			if (groupId in groups) {
				groups[groupId] = groups[groupId].add($this);
			} else {
				groups[groupId] = $this;
			}
		});

		// apply matchHeight to each group
		$.each(groups, function () {
			this.matchHeight(true);
		});
	};

	/*
	*  matchHeight._update
	*  updates matchHeight on all current groups with their correct options
	*/

	var _update = function _update(event) {
		if (matchHeight._beforeUpdate) {
			matchHeight._beforeUpdate(event, matchHeight._groups);
		}

		$.each(matchHeight._groups, function () {
			matchHeight._apply(this.elements, this.options);
		});

		if (matchHeight._afterUpdate) {
			matchHeight._afterUpdate(event, matchHeight._groups);
		}
	};

	matchHeight._update = function (throttle, event) {
		// prevent update if fired from a resize event
		// where the viewport width hasn't actually changed
		// fixes an event looping bug in IE8
		if (event && event.type === 'resize') {
			var windowWidth = $(window).width();
			if (windowWidth === _previousResizeWidth) {
				return;
			}
			_previousResizeWidth = windowWidth;
		}

		// throttle updates
		if (!throttle) {
			_update(event);
		} else if (_updateTimeout === -1) {
			_updateTimeout = setTimeout(function () {
				_update(event);
				_updateTimeout = -1;
			}, matchHeight._throttle);
		}
	};

	/*
	*  bind events
	*/

	// apply on DOM ready event
	$(matchHeight._applyDataApi);

	// use on or bind where supported
	var on = $.fn.on ? 'on' : 'bind';

	// update heights on load and resize events
	$(window)[on]('load', function (event) {
		matchHeight._update(false, event);
	});

	// throttled update heights on resize events
	$(window)[on]('resize orientationchange', function (event) {
		matchHeight._update(true, event);
	});
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * jQuery Smooth Scroll - v2.2.0 - 2017-05-05
 * https://github.com/kswedberg/jquery-smooth-scroll
 * Copyright (c) 2017 Karl Swedberg
 * Licensed MIT
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
	// AMD. Register as an anonymous module.
	define(['jquery'], factory);
  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
	// CommonJS
	factory(require('jquery'));
  } else {
	// Browser globals
	factory(jQuery);
  }
})(function ($) {

  var version = '2.2.0';
  var optionOverrides = {};
  var defaults = {
	exclude: [],
	excludeWithin: [],
	offset: 0,

	// one of 'top' or 'left'
	direction: 'top',

	// if set, bind click events through delegation
	//  supported since jQuery 1.4.2
	delegateSelector: null,

	// jQuery set of elements you wish to scroll (for $.smoothScroll).
	//  if null (default), $('html, body').firstScrollable() is used.
	scrollElement: null,

	// only use if you want to override default behavior
	scrollTarget: null,

	// automatically focus the target element after scrolling to it
	autoFocus: false,

	// fn(opts) function to be called before scrolling occurs.
	// `this` is the element(s) being scrolled
	beforeScroll: function beforeScroll() {},

	// fn(opts) function to be called after scrolling occurs.
	// `this` is the triggering element
	afterScroll: function afterScroll() {},

	// easing name. jQuery comes with "swing" and "linear." For others, you'll need an easing plugin
	// from jQuery UI or elsewhere
	easing: 'swing',

	// speed can be a number or 'auto'
	// if 'auto', the speed will be calculated based on the formula:
	// (current scroll position - target scroll position) / autoCoeffic
	speed: 400,

	// coefficient for "auto" speed
	autoCoefficient: 2,

	// $.fn.smoothScroll only: whether to prevent the default click action
	preventDefault: true
  };

  var getScrollable = function getScrollable(opts) {
	var scrollable = [];
	var scrolled = false;
	var dir = opts.dir && opts.dir === 'left' ? 'scrollLeft' : 'scrollTop';

	this.each(function () {
	  var el = $(this);

	  if (this === document || this === window) {
		return;
	  }

	  if (document.scrollingElement && (this === document.documentElement || this === document.body)) {
		scrollable.push(document.scrollingElement);

		return false;
	  }

	  if (el[dir]() > 0) {
		scrollable.push(this);
	  } else {
		// if scroll(Top|Left) === 0, nudge the element 1px and see if it moves
		el[dir](1);
		scrolled = el[dir]() > 0;

		if (scrolled) {
		  scrollable.push(this);
		}
		// then put it back, of course
		el[dir](0);
	  }
	});

	if (!scrollable.length) {
	  this.each(function () {
		// If no scrollable elements and <html> has scroll-behavior:smooth because
		// "When this property is specified on the root element, it applies to the viewport instead."
		// and "The scroll-behavior property of the … body element is *not* propagated to the viewport."
		// → https://drafts.csswg.org/cssom-view/#propdef-scroll-behavior
		if (this === document.documentElement && $(this).css('scrollBehavior') === 'smooth') {
		  scrollable = [this];
		}

		// If still no scrollable elements, fall back to <body>,
		// if it's in the jQuery collection
		// (doing this because Safari sets scrollTop async,
		// so can't set it to 1 and immediately get the value.)
		if (!scrollable.length && this.nodeName === 'BODY') {
		  scrollable = [this];
		}
	  });
	}

	// Use the first scrollable element if we're calling firstScrollable()
	if (opts.el === 'first' && scrollable.length > 1) {
	  scrollable = [scrollable[0]];
	}

	return scrollable;
  };

  var rRelative = /^([\-\+]=)(\d+)/;

  $.fn.extend({
	scrollable: function scrollable(dir) {
	  var scrl = getScrollable.call(this, { dir: dir });

	  return this.pushStack(scrl);
	},
	firstScrollable: function firstScrollable(dir) {
	  var scrl = getScrollable.call(this, { el: 'first', dir: dir });

	  return this.pushStack(scrl);
	},

	smoothScroll: function smoothScroll(options, extra) {
	  options = options || {};

	  if (options === 'options') {
		if (!extra) {
		  return this.first().data('ssOpts');
		}

		return this.each(function () {
		  var $this = $(this);
		  var opts = $.extend($this.data('ssOpts') || {}, extra);

		  $(this).data('ssOpts', opts);
		});
	  }

	  var opts = $.extend({}, $.fn.smoothScroll.defaults, options);

	  var clickHandler = function clickHandler(event) {
		var escapeSelector = function escapeSelector(str) {
		  return str.replace(/(:|\.|\/)/g, '\\$1');
		};

		var link = this;
		var $link = $(this);
		var thisOpts = $.extend({}, opts, $link.data('ssOpts') || {});
		var exclude = opts.exclude;
		var excludeWithin = thisOpts.excludeWithin;
		var elCounter = 0;
		var ewlCounter = 0;
		var include = true;
		var clickOpts = {};
		var locationPath = $.smoothScroll.filterPath(location.pathname);
		var linkPath = $.smoothScroll.filterPath(link.pathname);
		var hostMatch = location.hostname === link.hostname || !link.hostname;
		var pathMatch = thisOpts.scrollTarget || linkPath === locationPath;
		var thisHash = escapeSelector(link.hash);

		if (thisHash && !$(thisHash).length) {
		  include = false;
		}

		if (!thisOpts.scrollTarget && (!hostMatch || !pathMatch || !thisHash)) {
		  include = false;
		} else {
		  while (include && elCounter < exclude.length) {
			if ($link.is(escapeSelector(exclude[elCounter++]))) {
			  include = false;
			}
		  }

		  while (include && ewlCounter < excludeWithin.length) {
			if ($link.closest(excludeWithin[ewlCounter++]).length) {
			  include = false;
			}
		  }
		}

		if (include) {
		  if (thisOpts.preventDefault) {
			event.preventDefault();
		  }

		  $.extend(clickOpts, thisOpts, {
			scrollTarget: thisOpts.scrollTarget || thisHash,
			link: link
		  });

		  $.smoothScroll(clickOpts);
		}
	  };

	  if (options.delegateSelector !== null) {
		this.off('click.smoothscroll', options.delegateSelector).on('click.smoothscroll', options.delegateSelector, clickHandler);
	  } else {
		this.off('click.smoothscroll').on('click.smoothscroll', clickHandler);
	  }

	  return this;
	}
  });

  var getExplicitOffset = function getExplicitOffset(val) {
	var explicit = { relative: '' };
	var parts = typeof val === 'string' && rRelative.exec(val);

	if (typeof val === 'number') {
	  explicit.px = val;
	} else if (parts) {
	  explicit.relative = parts[1];
	  explicit.px = parseFloat(parts[2]) || 0;
	}

	return explicit;
  };

  var onAfterScroll = function onAfterScroll(opts) {
	var $tgt = $(opts.scrollTarget);

	if (opts.autoFocus && $tgt.length) {
	  $tgt[0].focus();

	  if (!$tgt.is(document.activeElement)) {
		$tgt.prop({ tabIndex: -1 });
		$tgt[0].focus();
	  }
	}

	opts.afterScroll.call(opts.link, opts);
  };

  $.smoothScroll = function (options, px) {
	if (options === 'options' && (typeof px === 'undefined' ? 'undefined' : _typeof(px)) === 'object') {
	  return $.extend(optionOverrides, px);
	}
	var opts, $scroller, speed, delta;
	var explicitOffset = getExplicitOffset(options);
	var scrollTargetOffset = {};
	var scrollerOffset = 0;
	var offPos = 'offset';
	var scrollDir = 'scrollTop';
	var aniProps = {};
	var aniOpts = {};

	if (explicitOffset.px) {
	  opts = $.extend({ link: null }, $.fn.smoothScroll.defaults, optionOverrides);
	} else {
	  opts = $.extend({ link: null }, $.fn.smoothScroll.defaults, options || {}, optionOverrides);

	  if (opts.scrollElement) {
		offPos = 'position';

		if (opts.scrollElement.css('position') === 'static') {
		  opts.scrollElement.css('position', 'relative');
		}
	  }

	  if (px) {
		explicitOffset = getExplicitOffset(px);
	  }
	}

	scrollDir = opts.direction === 'left' ? 'scrollLeft' : scrollDir;

	if (opts.scrollElement) {
	  $scroller = opts.scrollElement;

	  if (!explicitOffset.px && !/^(?:HTML|BODY)$/.test($scroller[0].nodeName)) {
		scrollerOffset = $scroller[scrollDir]();
	  }
	} else {
	  $scroller = $('html, body').firstScrollable(opts.direction);
	}

	// beforeScroll callback function must fire before calculating offset
	opts.beforeScroll.call($scroller, opts);

	scrollTargetOffset = explicitOffset.px ? explicitOffset : {
	  relative: '',
	  px: $(opts.scrollTarget)[offPos]() && $(opts.scrollTarget)[offPos]()[opts.direction] || 0
	};

	aniProps[scrollDir] = scrollTargetOffset.relative + (scrollTargetOffset.px + scrollerOffset + opts.offset);

	speed = opts.speed;

	// automatically calculate the speed of the scroll based on distance / coefficient
	if (speed === 'auto') {

	  // $scroller[scrollDir]() is position before scroll, aniProps[scrollDir] is position after
	  // When delta is greater, speed will be greater.
	  delta = Math.abs(aniProps[scrollDir] - $scroller[scrollDir]());

	  // Divide the delta by the coefficient
	  speed = delta / opts.autoCoefficient;
	}

	aniOpts = {
	  duration: speed,
	  easing: opts.easing,
	  complete: function complete() {
		onAfterScroll(opts);
	  }
	};

	if (opts.step) {
	  aniOpts.step = opts.step;
	}

	if ($scroller.length) {
	  $scroller.stop().animate(aniProps, aniOpts);
	} else {
	  onAfterScroll(opts);
	}
  };

  $.smoothScroll.version = version;
  $.smoothScroll.filterPath = function (string) {
	string = string || '';

	return string.replace(/^\//, '').replace(/(?:index|default).[a-zA-Z]{3,4}$/, '').replace(/\/$/, '');
  };

  // default options
  $.fn.smoothScroll.defaults = defaults;
});
'use strict';

/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function () {
  'use strict';

  var keyCounter = 0;
  var allWaypoints = {};

  /* http://imakewebthings.com/waypoints/api/waypoint */
  function Waypoint(options) {
	if (!options) {
	  throw new Error('No options passed to Waypoint constructor');
	}
	if (!options.element) {
	  throw new Error('No element option passed to Waypoint constructor');
	}
	if (!options.handler) {
	  throw new Error('No handler option passed to Waypoint constructor');
	}

	this.key = 'waypoint-' + keyCounter;
	this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options);
	this.element = this.options.element;
	this.adapter = new Waypoint.Adapter(this.element);
	this.callback = options.handler;
	this.axis = this.options.horizontal ? 'horizontal' : 'vertical';
	this.enabled = this.options.enabled;
	this.triggerPoint = null;
	this.group = Waypoint.Group.findOrCreate({
	  name: this.options.group,
	  axis: this.axis
	});
	this.context = Waypoint.Context.findOrCreateByElement(this.options.context);

	if (Waypoint.offsetAliases[this.options.offset]) {
	  this.options.offset = Waypoint.offsetAliases[this.options.offset];
	}
	this.group.add(this);
	this.context.add(this);
	allWaypoints[this.key] = this;
	keyCounter += 1;
  }

  /* Private */
  Waypoint.prototype.queueTrigger = function (direction) {
	this.group.queueTrigger(this, direction);
  };

  /* Private */
  Waypoint.prototype.trigger = function (args) {
	if (!this.enabled) {
	  return;
	}
	if (this.callback) {
	  this.callback.apply(this, args);
	}
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy */
  Waypoint.prototype.destroy = function () {
	this.context.remove(this);
	this.group.remove(this);
	delete allWaypoints[this.key];
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable */
  Waypoint.prototype.disable = function () {
	this.enabled = false;
	return this;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable */
  Waypoint.prototype.enable = function () {
	this.context.refresh();
	this.enabled = true;
	return this;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/next */
  Waypoint.prototype.next = function () {
	return this.group.next(this);
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/previous */
  Waypoint.prototype.previous = function () {
	return this.group.previous(this);
  };

  /* Private */
  Waypoint.invokeAll = function (method) {
	var allWaypointsArray = [];
	for (var waypointKey in allWaypoints) {
	  allWaypointsArray.push(allWaypoints[waypointKey]);
	}
	for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
	  allWaypointsArray[i][method]();
	}
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy-all */
  Waypoint.destroyAll = function () {
	Waypoint.invokeAll('destroy');
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable-all */
  Waypoint.disableAll = function () {
	Waypoint.invokeAll('disable');
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable-all */
  Waypoint.enableAll = function () {
	Waypoint.Context.refreshAll();
	for (var waypointKey in allWaypoints) {
	  allWaypoints[waypointKey].enabled = true;
	}
	return this;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/refresh-all */
  Waypoint.refreshAll = function () {
	Waypoint.Context.refreshAll();
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-height */
  Waypoint.viewportHeight = function () {
	return window.innerHeight || document.documentElement.clientHeight;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-width */
  Waypoint.viewportWidth = function () {
	return document.documentElement.clientWidth;
  };

  Waypoint.adapters = [];

  Waypoint.defaults = {
	context: window,
	continuous: true,
	enabled: true,
	group: 'default',
	horizontal: false,
	offset: 0
  };

  Waypoint.offsetAliases = {
	'bottom-in-view': function bottomInView() {
	  return this.context.innerHeight() - this.adapter.outerHeight();
	},
	'right-in-view': function rightInView() {
	  return this.context.innerWidth() - this.adapter.outerWidth();
	}
  };

  window.Waypoint = Waypoint;
})();(function () {
  'use strict';

  function requestAnimationFrameShim(callback) {
	window.setTimeout(callback, 1000 / 60);
  }

  var keyCounter = 0;
  var contexts = {};
  var Waypoint = window.Waypoint;
  var oldWindowLoad = window.onload;

  /* http://imakewebthings.com/waypoints/api/context */
  function Context(element) {
	this.element = element;
	this.Adapter = Waypoint.Adapter;
	this.adapter = new this.Adapter(element);
	this.key = 'waypoint-context-' + keyCounter;
	this.didScroll = false;
	this.didResize = false;
	this.oldScroll = {
	  x: this.adapter.scrollLeft(),
	  y: this.adapter.scrollTop()
	};
	this.waypoints = {
	  vertical: {},
	  horizontal: {}
	};

	element.waypointContextKey = this.key;
	contexts[element.waypointContextKey] = this;
	keyCounter += 1;
	if (!Waypoint.windowContext) {
	  Waypoint.windowContext = true;
	  Waypoint.windowContext = new Context(window);
	}

	this.createThrottledScrollHandler();
	this.createThrottledResizeHandler();
  }

  /* Private */
  Context.prototype.add = function (waypoint) {
	var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical';
	this.waypoints[axis][waypoint.key] = waypoint;
	this.refresh();
  };

  /* Private */
  Context.prototype.checkEmpty = function () {
	var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal);
	var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical);
	var isWindow = this.element == this.element.window;
	if (horizontalEmpty && verticalEmpty && !isWindow) {
	  this.adapter.off('.waypoints');
	  delete contexts[this.key];
	}
  };

  /* Private */
  Context.prototype.createThrottledResizeHandler = function () {
	var self = this;

	function resizeHandler() {
	  self.handleResize();
	  self.didResize = false;
	}

	this.adapter.on('resize.waypoints', function () {
	  if (!self.didResize) {
		self.didResize = true;
		Waypoint.requestAnimationFrame(resizeHandler);
	  }
	});
  };

  /* Private */
  Context.prototype.createThrottledScrollHandler = function () {
	var self = this;
	function scrollHandler() {
	  self.handleScroll();
	  self.didScroll = false;
	}

	this.adapter.on('scroll.waypoints', function () {
	  if (!self.didScroll || Waypoint.isTouch) {
		self.didScroll = true;
		Waypoint.requestAnimationFrame(scrollHandler);
	  }
	});
  };

  /* Private */
  Context.prototype.handleResize = function () {
	Waypoint.Context.refreshAll();
  };

  /* Private */
  Context.prototype.handleScroll = function () {
	var triggeredGroups = {};
	var axes = {
	  horizontal: {
		newScroll: this.adapter.scrollLeft(),
		oldScroll: this.oldScroll.x,
		forward: 'right',
		backward: 'left'
	  },
	  vertical: {
		newScroll: this.adapter.scrollTop(),
		oldScroll: this.oldScroll.y,
		forward: 'down',
		backward: 'up'
	  }
	};

	for (var axisKey in axes) {
	  var axis = axes[axisKey];
	  var isForward = axis.newScroll > axis.oldScroll;
	  var direction = isForward ? axis.forward : axis.backward;

	  for (var waypointKey in this.waypoints[axisKey]) {
		var waypoint = this.waypoints[axisKey][waypointKey];
		if (waypoint.triggerPoint === null) {
		  continue;
		}
		var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint;
		var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint;
		var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint;
		var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint;
		if (crossedForward || crossedBackward) {
		  waypoint.queueTrigger(direction);
		  triggeredGroups[waypoint.group.id] = waypoint.group;
		}
	  }
	}

	for (var groupKey in triggeredGroups) {
	  triggeredGroups[groupKey].flushTriggers();
	}

	this.oldScroll = {
	  x: axes.horizontal.newScroll,
	  y: axes.vertical.newScroll
	};
  };

  /* Private */
  Context.prototype.innerHeight = function () {
	/*eslint-disable eqeqeq */
	if (this.element == this.element.window) {
	  return Waypoint.viewportHeight();
	}
	/*eslint-enable eqeqeq */
	return this.adapter.innerHeight();
  };

  /* Private */
  Context.prototype.remove = function (waypoint) {
	delete this.waypoints[waypoint.axis][waypoint.key];
	this.checkEmpty();
  };

  /* Private */
  Context.prototype.innerWidth = function () {
	/*eslint-disable eqeqeq */
	if (this.element == this.element.window) {
	  return Waypoint.viewportWidth();
	}
	/*eslint-enable eqeqeq */
	return this.adapter.innerWidth();
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-destroy */
  Context.prototype.destroy = function () {
	var allWaypoints = [];
	for (var axis in this.waypoints) {
	  for (var waypointKey in this.waypoints[axis]) {
		allWaypoints.push(this.waypoints[axis][waypointKey]);
	  }
	}
	for (var i = 0, end = allWaypoints.length; i < end; i++) {
	  allWaypoints[i].destroy();
	}
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-refresh */
  Context.prototype.refresh = function () {
	/*eslint-disable eqeqeq */
	var isWindow = this.element == this.element.window;
	/*eslint-enable eqeqeq */
	var contextOffset = isWindow ? undefined : this.adapter.offset();
	var triggeredGroups = {};
	var axes;

	this.handleScroll();
	axes = {
	  horizontal: {
		contextOffset: isWindow ? 0 : contextOffset.left,
		contextScroll: isWindow ? 0 : this.oldScroll.x,
		contextDimension: this.innerWidth(),
		oldScroll: this.oldScroll.x,
		forward: 'right',
		backward: 'left',
		offsetProp: 'left'
	  },
	  vertical: {
		contextOffset: isWindow ? 0 : contextOffset.top,
		contextScroll: isWindow ? 0 : this.oldScroll.y,
		contextDimension: this.innerHeight(),
		oldScroll: this.oldScroll.y,
		forward: 'down',
		backward: 'up',
		offsetProp: 'top'
	  }
	};

	for (var axisKey in axes) {
	  var axis = axes[axisKey];
	  for (var waypointKey in this.waypoints[axisKey]) {
		var waypoint = this.waypoints[axisKey][waypointKey];
		var adjustment = waypoint.options.offset;
		var oldTriggerPoint = waypoint.triggerPoint;
		var elementOffset = 0;
		var freshWaypoint = oldTriggerPoint == null;
		var contextModifier, wasBeforeScroll, nowAfterScroll;
		var triggeredBackward, triggeredForward;

		if (waypoint.element !== waypoint.element.window) {
		  elementOffset = waypoint.adapter.offset()[axis.offsetProp];
		}

		if (typeof adjustment === 'function') {
		  adjustment = adjustment.apply(waypoint);
		} else if (typeof adjustment === 'string') {
		  adjustment = parseFloat(adjustment);
		  if (waypoint.options.offset.indexOf('%') > -1) {
			adjustment = Math.ceil(axis.contextDimension * adjustment / 100);
		  }
		}

		contextModifier = axis.contextScroll - axis.contextOffset;
		waypoint.triggerPoint = Math.floor(elementOffset + contextModifier - adjustment);
		wasBeforeScroll = oldTriggerPoint < axis.oldScroll;
		nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll;
		triggeredBackward = wasBeforeScroll && nowAfterScroll;
		triggeredForward = !wasBeforeScroll && !nowAfterScroll;

		if (!freshWaypoint && triggeredBackward) {
		  waypoint.queueTrigger(axis.backward);
		  triggeredGroups[waypoint.group.id] = waypoint.group;
		} else if (!freshWaypoint && triggeredForward) {
		  waypoint.queueTrigger(axis.forward);
		  triggeredGroups[waypoint.group.id] = waypoint.group;
		} else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
		  waypoint.queueTrigger(axis.forward);
		  triggeredGroups[waypoint.group.id] = waypoint.group;
		}
	  }
	}

	Waypoint.requestAnimationFrame(function () {
	  for (var groupKey in triggeredGroups) {
		triggeredGroups[groupKey].flushTriggers();
	  }
	});

	return this;
  };

  /* Private */
  Context.findOrCreateByElement = function (element) {
	return Context.findByElement(element) || new Context(element);
  };

  /* Private */
  Context.refreshAll = function () {
	for (var contextId in contexts) {
	  contexts[contextId].refresh();
	}
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-find-by-element */
  Context.findByElement = function (element) {
	return contexts[element.waypointContextKey];
  };

  window.onload = function () {
	if (oldWindowLoad) {
	  oldWindowLoad();
	}
	Context.refreshAll();
  };

  Waypoint.requestAnimationFrame = function (callback) {
	var requestFn = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || requestAnimationFrameShim;
	requestFn.call(window, callback);
  };
  Waypoint.Context = Context;
})();(function () {
  'use strict';

  function byTriggerPoint(a, b) {
	return a.triggerPoint - b.triggerPoint;
  }

  function byReverseTriggerPoint(a, b) {
	return b.triggerPoint - a.triggerPoint;
  }

  var groups = {
	vertical: {},
	horizontal: {}
  };
  var Waypoint = window.Waypoint;

  /* http://imakewebthings.com/waypoints/api/group */
  function Group(options) {
	this.name = options.name;
	this.axis = options.axis;
	this.id = this.name + '-' + this.axis;
	this.waypoints = [];
	this.clearTriggerQueues();
	groups[this.axis][this.name] = this;
  }

  /* Private */
  Group.prototype.add = function (waypoint) {
	this.waypoints.push(waypoint);
  };

  /* Private */
  Group.prototype.clearTriggerQueues = function () {
	this.triggerQueues = {
	  up: [],
	  down: [],
	  left: [],
	  right: []
	};
  };

  /* Private */
  Group.prototype.flushTriggers = function () {
	for (var direction in this.triggerQueues) {
	  var waypoints = this.triggerQueues[direction];
	  var reverse = direction === 'up' || direction === 'left';
	  waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint);
	  for (var i = 0, end = waypoints.length; i < end; i += 1) {
		var waypoint = waypoints[i];
		if (waypoint.options.continuous || i === waypoints.length - 1) {
		  waypoint.trigger([direction]);
		}
	  }
	}
	this.clearTriggerQueues();
  };

  /* Private */
  Group.prototype.next = function (waypoint) {
	this.waypoints.sort(byTriggerPoint);
	var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
	var isLast = index === this.waypoints.length - 1;
	return isLast ? null : this.waypoints[index + 1];
  };

  /* Private */
  Group.prototype.previous = function (waypoint) {
	this.waypoints.sort(byTriggerPoint);
	var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
	return index ? this.waypoints[index - 1] : null;
  };

  /* Private */
  Group.prototype.queueTrigger = function (waypoint, direction) {
	this.triggerQueues[direction].push(waypoint);
  };

  /* Private */
  Group.prototype.remove = function (waypoint) {
	var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
	if (index > -1) {
	  this.waypoints.splice(index, 1);
	}
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/first */
  Group.prototype.first = function () {
	return this.waypoints[0];
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/last */
  Group.prototype.last = function () {
	return this.waypoints[this.waypoints.length - 1];
  };

  /* Private */
  Group.findOrCreate = function (options) {
	return groups[options.axis][options.name] || new Group(options);
  };

  Waypoint.Group = Group;
})();(function () {
  'use strict';

  var $ = window.jQuery;
  var Waypoint = window.Waypoint;

  function JQueryAdapter(element) {
	this.$element = $(element);
  }

  $.each(['innerHeight', 'innerWidth', 'off', 'offset', 'on', 'outerHeight', 'outerWidth', 'scrollLeft', 'scrollTop'], function (i, method) {
	JQueryAdapter.prototype[method] = function () {
	  var args = Array.prototype.slice.call(arguments);
	  return this.$element[method].apply(this.$element, args);
	};
  });

  $.each(['extend', 'inArray', 'isEmptyObject'], function (i, method) {
	JQueryAdapter[method] = $[method];
  });

  Waypoint.adapters.push({
	name: 'jquery',
	Adapter: JQueryAdapter
  });
  Waypoint.Adapter = JQueryAdapter;
})();(function () {
  'use strict';

  var Waypoint = window.Waypoint;

  function createExtension(framework) {
	return function () {
	  var waypoints = [];
	  var overrides = arguments[0];

	  if (framework.isFunction(arguments[0])) {
		overrides = framework.extend({}, arguments[1]);
		overrides.handler = arguments[0];
	  }

	  this.each(function () {
		var options = framework.extend({}, overrides, {
		  element: this
		});
		if (typeof options.context === 'string') {
		  options.context = framework(this).closest(options.context)[0];
		}
		waypoints.push(new Waypoint(options));
	  });

	  return waypoints;
	};
  }

  if (window.jQuery) {
	window.jQuery.fn.waypoint = createExtension(window.jQuery);
  }
  if (window.Zepto) {
	window.Zepto.fn.waypoint = createExtension(window.Zepto);
  }
})();
'use strict';

/**
 * Recliner.js
 * A super lightweight production ready jQuery plugin
 * for lazy loading images and other dynamic content.
 *
 * Licensed under the MIT license.
 * Copyright 2014 Kam Low
 * http://sourcey.com
 */

;(function ($) {

  $.fn.recliner = function (options) {
	var $w = $(window),
		elements = this,
		selector = this.selector,
		loaded,
		timer,
		options = $.extend({
	  attrib: 'data-src', // Selector for attribute containing the media src
	  throttle: 300, // Millisecond interval at which to process events
	  threshold: 100, // Scroll distance from element before its loaded
	  printable: true, // Be printer friendly and show all elements on document print
	  live: true, // Auto bind lazy loading to ajax loaded elements
	  getScript: false // Load content with `getScript` rather than `ajax`
	}, options);

	// Load the element source
	function load(e) {
	  var $e = $(e),
		  source = $e.attr(options.attrib),
		  type = $e.prop('tagName');
	  if (source) {
		$e.addClass('lazy-loading');

		// Elements with [src] attribute: <audio>, <embed>, <iframe>, <img>, <input>, <script>, <source>, <track>, <video> (https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes)
		// Excepts: <input>, <script> (use options.getScript instead)
		if (/^(IMG|IFRAME|AUDIO|EMBED|SOURCE|TRACK|VIDEO)$/.test(type)) {
		  $e.attr('src', source);
		  $e[0].onload = function (ev) {
			onload($e);
		  };
		} else if ($e.data('script')) {
		  $.getScript(source, function (ev) {
			onload($e);
		  });
		} else {
		  // Ajax load non image and iframe elements
		  $e.load(source, function (ev) {
			onload($e);
		  });
		}
	  } else {
		onload($e); // set as loaded if no action taken
	  }
	}

	// Handle element load complete
	function onload(e) {

	  // Remove loading and add loaded class to all elements
	  e.removeClass('lazy-loading');
	  e.addClass('lazy-loaded');

	  // Handle lazyshow event for custom processing
	  e.trigger('lazyshow');
	}

	// Process the next elements in the queue
	function process() {
	  // If no Doctype is declared jQuery's $(window).height() does not work properly
	  // See http://stackoverflow.com/a/25274520/322253
	  // Therefore use innerHeight instead (if available)
	  var viewportHeight = typeof window.innerHeight !== 'undefined' ? window.innerHeight : $w.height();

	  // Detect if the scroll position is at the bottom of the page
	  var eof = window.innerHeight + window.scrollY >= document.body.offsetHeight;

	  // elements = elements.not('.lazy-loaded').not('.lazy-loading');
	  var inview = elements.filter(function () {
		var $e = $(this);
		if ($e.css('display') == 'none') return;

		var wt = $w.scrollTop(),
			wb = wt + viewportHeight,
			et = $e.offset().top,
			eb = et + $e.height();

		return eb >= wt - options.threshold && et <= wb + options.threshold || eof;
	  });

	  loaded = inview.trigger('lazyload');
	  elements = elements.not(loaded);
	}

	// Initialize elements for lazy loading
	function init(els) {

	  // Bind the lazyload event for loading elements
	  els.one('lazyload', function () {
		load(this);
	  });

	  process();
	}

	// Bind lazy loading events
	$w.on('scroll.lazy resize.lazy lookup.lazy', function (ev) {
	  if (timer) clearTimeout(timer); // throttle events for best performance
	  timer = setTimeout(function () {
		$w.trigger('lazyupdate');
	  }, options.throttle);
	});

	$w.on('lazyupdate.lazy', function (ev) {
	  process();
	});

	// Handle elements loaded into the dom via ajax
	if (options.live) {
	  $(document).on('ajaxSuccess.lazy', function () {
		var $e = $(selector).not('.lazy-loaded').not('.lazy-loading');

		elements = elements.add($e);
		init($e);
	  });
	}

	// Be printer friendly and show all elements on document print
	if (options.printable && window.matchMedia) {
	  window.matchMedia('print').addListener(function (mql) {
		if (mql.matches) {
		  $(selector).trigger('lazyload');
		}
	  });
	}

	init(this);
	return this;
  };

  // Unbind Recliner events
  $.fn.derecliner = function (options) {
	var $w = $(window);
	$w.off('scroll.lazy resize.lazy lookup.lazy');
	$w.off('lazyupdate.lazy');
	$(document).off('ajaxSuccess.lazy');
  };
})(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
	 _ _	  _	   _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
				   |__/

 Version: 1.8.0
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
	Docs: http://kenwheeler.github.io/slick
	Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
;(function (factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports !== 'undefined') {
		module.exports = factory(require('jquery'));
	} else {
		factory(jQuery);
	}
})(function ($) {
	'use strict';

	var Slick = window.Slick || {};

	Slick = function () {

		var instanceUid = 0;

		function Slick(element, settings) {

			var _ = this,
				dataSettings;

			_.defaults = {
				accessibility: true,
				adaptiveHeight: false,
				appendArrows: $(element),
				appendDots: $(element),
				arrows: true,
				asNavFor: null,
				prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
				nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
				autoplay: false,
				autoplaySpeed: 3000,
				centerMode: false,
				centerPadding: '50px',
				cssEase: 'ease',
				customPaging: function customPaging(slider, i) {
					return $('<button type="button" />').text(i + 1);
				},
				dots: false,
				dotsClass: 'slick-dots',
				draggable: true,
				easing: 'linear',
				edgeFriction: 0.35,
				fade: false,
				focusOnSelect: false,
				focusOnChange: false,
				infinite: true,
				initialSlide: 0,
				lazyLoad: 'ondemand',
				mobileFirst: false,
				pauseOnHover: true,
				pauseOnFocus: true,
				pauseOnDotsHover: false,
				respondTo: 'window',
				responsive: null,
				rows: 1,
				rtl: false,
				slide: '',
				slidesPerRow: 1,
				slidesToShow: 1,
				slidesToScroll: 1,
				speed: 500,
				swipe: true,
				swipeToSlide: false,
				touchMove: true,
				touchThreshold: 5,
				useCSS: true,
				useTransform: true,
				variableWidth: false,
				vertical: false,
				verticalSwiping: false,
				waitForAnimate: true,
				zIndex: 1000
			};

			_.initials = {
				animating: false,
				dragging: false,
				autoPlayTimer: null,
				currentDirection: 0,
				currentLeft: null,
				currentSlide: 0,
				direction: 1,
				$dots: null,
				listWidth: null,
				listHeight: null,
				loadIndex: 0,
				$nextArrow: null,
				$prevArrow: null,
				scrolling: false,
				slideCount: null,
				slideWidth: null,
				$slideTrack: null,
				$slides: null,
				sliding: false,
				slideOffset: 0,
				swipeLeft: null,
				swiping: false,
				$list: null,
				touchObject: {},
				transformsEnabled: false,
				unslicked: false
			};

			$.extend(_, _.initials);

			_.activeBreakpoint = null;
			_.animType = null;
			_.animProp = null;
			_.breakpoints = [];
			_.breakpointSettings = [];
			_.cssTransitions = false;
			_.focussed = false;
			_.interrupted = false;
			_.hidden = 'hidden';
			_.paused = true;
			_.positionProp = null;
			_.respondTo = null;
			_.rowCount = 1;
			_.shouldClick = true;
			_.$slider = $(element);
			_.$slidesCache = null;
			_.transformType = null;
			_.transitionType = null;
			_.visibilityChange = 'visibilitychange';
			_.windowWidth = 0;
			_.windowTimer = null;

			dataSettings = $(element).data('slick') || {};

			_.options = $.extend({}, _.defaults, settings, dataSettings);

			_.currentSlide = _.options.initialSlide;

			_.originalSettings = _.options;

			if (typeof document.mozHidden !== 'undefined') {
				_.hidden = 'mozHidden';
				_.visibilityChange = 'mozvisibilitychange';
			} else if (typeof document.webkitHidden !== 'undefined') {
				_.hidden = 'webkitHidden';
				_.visibilityChange = 'webkitvisibilitychange';
			}

			_.autoPlay = $.proxy(_.autoPlay, _);
			_.autoPlayClear = $.proxy(_.autoPlayClear, _);
			_.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
			_.changeSlide = $.proxy(_.changeSlide, _);
			_.clickHandler = $.proxy(_.clickHandler, _);
			_.selectHandler = $.proxy(_.selectHandler, _);
			_.setPosition = $.proxy(_.setPosition, _);
			_.swipeHandler = $.proxy(_.swipeHandler, _);
			_.dragHandler = $.proxy(_.dragHandler, _);
			_.keyHandler = $.proxy(_.keyHandler, _);

			_.instanceUid = instanceUid++;

			// A simple way to check for HTML strings
			// Strict HTML recognition (must start with <)
			// Extracted from jQuery v1.11 source
			_.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

			_.registerBreakpoints();
			_.init(true);
		}

		return Slick;
	}();

	Slick.prototype.activateADA = function () {
		var _ = this;

		_.$slideTrack.find('.slick-active').attr({
			'aria-hidden': 'false'
		}).find('a, input, button, select').attr({
			'tabindex': '0'
		});
	};

	Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

		var _ = this;

		if (typeof index === 'boolean') {
			addBefore = index;
			index = null;
		} else if (index < 0 || index >= _.slideCount) {
			return false;
		}

		_.unload();

		if (typeof index === 'number') {
			if (index === 0 && _.$slides.length === 0) {
				$(markup).appendTo(_.$slideTrack);
			} else if (addBefore) {
				$(markup).insertBefore(_.$slides.eq(index));
			} else {
				$(markup).insertAfter(_.$slides.eq(index));
			}
		} else {
			if (addBefore === true) {
				$(markup).prependTo(_.$slideTrack);
			} else {
				$(markup).appendTo(_.$slideTrack);
			}
		}

		_.$slides = _.$slideTrack.children(this.options.slide);

		_.$slideTrack.children(this.options.slide).detach();

		_.$slideTrack.append(_.$slides);

		_.$slides.each(function (index, element) {
			$(element).attr('data-slick-index', index);
		});

		_.$slidesCache = _.$slides;

		_.reinit();
	};

	Slick.prototype.animateHeight = function () {
		var _ = this;
		if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
			var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
			_.$list.animate({
				height: targetHeight
			}, _.options.speed);
		}
	};

	Slick.prototype.animateSlide = function (targetLeft, callback) {

		var animProps = {},
			_ = this;

		_.animateHeight();

		if (_.options.rtl === true && _.options.vertical === false) {
			targetLeft = -targetLeft;
		}
		if (_.transformsEnabled === false) {
			if (_.options.vertical === false) {
				_.$slideTrack.animate({
					left: targetLeft
				}, _.options.speed, _.options.easing, callback);
			} else {
				_.$slideTrack.animate({
					top: targetLeft
				}, _.options.speed, _.options.easing, callback);
			}
		} else {

			if (_.cssTransitions === false) {
				if (_.options.rtl === true) {
					_.currentLeft = -_.currentLeft;
				}
				$({
					animStart: _.currentLeft
				}).animate({
					animStart: targetLeft
				}, {
					duration: _.options.speed,
					easing: _.options.easing,
					step: function step(now) {
						now = Math.ceil(now);
						if (_.options.vertical === false) {
							animProps[_.animType] = 'translate(' + now + 'px, 0px)';
							_.$slideTrack.css(animProps);
						} else {
							animProps[_.animType] = 'translate(0px,' + now + 'px)';
							_.$slideTrack.css(animProps);
						}
					},
					complete: function complete() {
						if (callback) {
							callback.call();
						}
					}
				});
			} else {

				_.applyTransition();
				targetLeft = Math.ceil(targetLeft);

				if (_.options.vertical === false) {
					animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
				} else {
					animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
				}
				_.$slideTrack.css(animProps);

				if (callback) {
					setTimeout(function () {

						_.disableTransition();

						callback.call();
					}, _.options.speed);
				}
			}
		}
	};

	Slick.prototype.getNavTarget = function () {

		var _ = this,
			asNavFor = _.options.asNavFor;

		if (asNavFor && asNavFor !== null) {
			asNavFor = $(asNavFor).not(_.$slider);
		}

		return asNavFor;
	};

	Slick.prototype.asNavFor = function (index) {

		var _ = this,
			asNavFor = _.getNavTarget();

		if (asNavFor !== null && (typeof asNavFor === 'undefined' ? 'undefined' : _typeof(asNavFor)) === 'object') {
			asNavFor.each(function () {
				var target = $(this).slick('getSlick');
				if (!target.unslicked) {
					target.slideHandler(index, true);
				}
			});
		}
	};

	Slick.prototype.applyTransition = function (slide) {

		var _ = this,
			transition = {};

		if (_.options.fade === false) {
			transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
		} else {
			transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
		}

		if (_.options.fade === false) {
			_.$slideTrack.css(transition);
		} else {
			_.$slides.eq(slide).css(transition);
		}
	};

	Slick.prototype.autoPlay = function () {

		var _ = this;

		_.autoPlayClear();

		if (_.slideCount > _.options.slidesToShow) {
			_.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
		}
	};

	Slick.prototype.autoPlayClear = function () {

		var _ = this;

		if (_.autoPlayTimer) {
			clearInterval(_.autoPlayTimer);
		}
	};

	Slick.prototype.autoPlayIterator = function () {

		var _ = this,
			slideTo = _.currentSlide + _.options.slidesToScroll;

		if (!_.paused && !_.interrupted && !_.focussed) {

			if (_.options.infinite === false) {

				if (_.direction === 1 && _.currentSlide + 1 === _.slideCount - 1) {
					_.direction = 0;
				} else if (_.direction === 0) {

					slideTo = _.currentSlide - _.options.slidesToScroll;

					if (_.currentSlide - 1 === 0) {
						_.direction = 1;
					}
				}
			}

			_.slideHandler(slideTo);
		}
	};

	Slick.prototype.buildArrows = function () {

		var _ = this;

		if (_.options.arrows === true) {

			_.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
			_.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

			if (_.slideCount > _.options.slidesToShow) {

				_.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
				_.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

				if (_.htmlExpr.test(_.options.prevArrow)) {
					_.$prevArrow.prependTo(_.options.appendArrows);
				}

				if (_.htmlExpr.test(_.options.nextArrow)) {
					_.$nextArrow.appendTo(_.options.appendArrows);
				}

				if (_.options.infinite !== true) {
					_.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
				}
			} else {

				_.$prevArrow.add(_.$nextArrow).addClass('slick-hidden').attr({
					'aria-disabled': 'true',
					'tabindex': '-1'
				});
			}
		}
	};

	Slick.prototype.buildDots = function () {

		var _ = this,
			i,
			dot;

		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

			_.$slider.addClass('slick-dotted');

			dot = $('<ul />').addClass(_.options.dotsClass);

			for (i = 0; i <= _.getDotCount(); i += 1) {
				dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
			}

			_.$dots = dot.appendTo(_.options.appendDots);

			_.$dots.find('li').first().addClass('slick-active');
		}
	};

	Slick.prototype.buildOut = function () {

		var _ = this;

		_.$slides = _.$slider.children(_.options.slide + ':not(.slick-cloned)').addClass('slick-slide');

		_.slideCount = _.$slides.length;

		_.$slides.each(function (index, element) {
			$(element).attr('data-slick-index', index).data('originalStyling', $(element).attr('style') || '');
		});

		_.$slider.addClass('slick-slider');

		_.$slideTrack = _.slideCount === 0 ? $('<div class="slick-track"/>').appendTo(_.$slider) : _.$slides.wrapAll('<div class="slick-track"/>').parent();

		_.$list = _.$slideTrack.wrap('<div class="slick-list"/>').parent();
		_.$slideTrack.css('opacity', 0);

		if (_.options.centerMode === true || _.options.swipeToSlide === true) {
			_.options.slidesToScroll = 1;
		}

		$('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

		_.setupInfinite();

		_.buildArrows();

		_.buildDots();

		_.updateDots();

		_.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

		if (_.options.draggable === true) {
			_.$list.addClass('draggable');
		}
	};

	Slick.prototype.buildRows = function () {

		var _ = this,
			a,
			b,
			c,
			newSlides,
			numOfSlides,
			originalSlides,
			slidesPerSection;

		newSlides = document.createDocumentFragment();
		originalSlides = _.$slider.children();

		if (_.options.rows > 0) {

			slidesPerSection = _.options.slidesPerRow * _.options.rows;
			numOfSlides = Math.ceil(originalSlides.length / slidesPerSection);

			for (a = 0; a < numOfSlides; a++) {
				var slide = document.createElement('div');
				for (b = 0; b < _.options.rows; b++) {
					var row = document.createElement('div');
					for (c = 0; c < _.options.slidesPerRow; c++) {
						var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);
						if (originalSlides.get(target)) {
							row.appendChild(originalSlides.get(target));
						}
					}
					slide.appendChild(row);
				}
				newSlides.appendChild(slide);
			}

			_.$slider.empty().append(newSlides);
			_.$slider.children().children().children().css({
				'width': 100 / _.options.slidesPerRow + '%',
				'display': 'inline-block'
			});
		}
	};

	Slick.prototype.checkResponsive = function (initial, forceUpdate) {

		var _ = this,
			breakpoint,
			targetBreakpoint,
			respondToWidth,
			triggerBreakpoint = false;
		var sliderWidth = _.$slider.width();
		var windowWidth = window.innerWidth || $(window).width();

		if (_.respondTo === 'window') {
			respondToWidth = windowWidth;
		} else if (_.respondTo === 'slider') {
			respondToWidth = sliderWidth;
		} else if (_.respondTo === 'min') {
			respondToWidth = Math.min(windowWidth, sliderWidth);
		}

		if (_.options.responsive && _.options.responsive.length && _.options.responsive !== null) {

			targetBreakpoint = null;

			for (breakpoint in _.breakpoints) {
				if (_.breakpoints.hasOwnProperty(breakpoint)) {
					if (_.originalSettings.mobileFirst === false) {
						if (respondToWidth < _.breakpoints[breakpoint]) {
							targetBreakpoint = _.breakpoints[breakpoint];
						}
					} else {
						if (respondToWidth > _.breakpoints[breakpoint]) {
							targetBreakpoint = _.breakpoints[breakpoint];
						}
					}
				}
			}

			if (targetBreakpoint !== null) {
				if (_.activeBreakpoint !== null) {
					if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
						_.activeBreakpoint = targetBreakpoint;
						if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
							_.unslick(targetBreakpoint);
						} else {
							_.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);
							if (initial === true) {
								_.currentSlide = _.options.initialSlide;
							}
							_.refresh(initial);
						}
						triggerBreakpoint = targetBreakpoint;
					}
				} else {
					_.activeBreakpoint = targetBreakpoint;
					if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
						_.unslick(targetBreakpoint);
					} else {
						_.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);
						if (initial === true) {
							_.currentSlide = _.options.initialSlide;
						}
						_.refresh(initial);
					}
					triggerBreakpoint = targetBreakpoint;
				}
			} else {
				if (_.activeBreakpoint !== null) {
					_.activeBreakpoint = null;
					_.options = _.originalSettings;
					if (initial === true) {
						_.currentSlide = _.options.initialSlide;
					}
					_.refresh(initial);
					triggerBreakpoint = targetBreakpoint;
				}
			}

			// only trigger breakpoints during an actual break. not on initialize.
			if (!initial && triggerBreakpoint !== false) {
				_.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
			}
		}
	};

	Slick.prototype.changeSlide = function (event, dontAnimate) {

		var _ = this,
			$target = $(event.currentTarget),
			indexOffset,
			slideOffset,
			unevenOffset;

		// If target is a link, prevent default action.
		if ($target.is('a')) {
			event.preventDefault();
		}

		// If target is not the <li> element (ie: a child), find the <li>.
		if (!$target.is('li')) {
			$target = $target.closest('li');
		}

		unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
		indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

		switch (event.data.message) {

			case 'previous':
				slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
				if (_.slideCount > _.options.slidesToShow) {
					_.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
				}
				break;

			case 'next':
				slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
				if (_.slideCount > _.options.slidesToShow) {
					_.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
				}
				break;

			case 'index':
				var index = event.data.index === 0 ? 0 : event.data.index || $target.index() * _.options.slidesToScroll;

				_.slideHandler(_.checkNavigable(index), false, dontAnimate);
				$target.children().trigger('focus');
				break;

			default:
				return;
		}
	};

	Slick.prototype.checkNavigable = function (index) {

		var _ = this,
			navigables,
			prevNavigable;

		navigables = _.getNavigableIndexes();
		prevNavigable = 0;
		if (index > navigables[navigables.length - 1]) {
			index = navigables[navigables.length - 1];
		} else {
			for (var n in navigables) {
				if (index < navigables[n]) {
					index = prevNavigable;
					break;
				}
				prevNavigable = navigables[n];
			}
		}

		return index;
	};

	Slick.prototype.cleanUpEvents = function () {

		var _ = this;

		if (_.options.dots && _.$dots !== null) {

			$('li', _.$dots).off('click.slick', _.changeSlide).off('mouseenter.slick', $.proxy(_.interrupt, _, true)).off('mouseleave.slick', $.proxy(_.interrupt, _, false));

			if (_.options.accessibility === true) {
				_.$dots.off('keydown.slick', _.keyHandler);
			}
		}

		_.$slider.off('focus.slick blur.slick');

		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
			_.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
			_.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

			if (_.options.accessibility === true) {
				_.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
				_.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
			}
		}

		_.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
		_.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
		_.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
		_.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

		_.$list.off('click.slick', _.clickHandler);

		$(document).off(_.visibilityChange, _.visibility);

		_.cleanUpSlideEvents();

		if (_.options.accessibility === true) {
			_.$list.off('keydown.slick', _.keyHandler);
		}

		if (_.options.focusOnSelect === true) {
			$(_.$slideTrack).children().off('click.slick', _.selectHandler);
		}

		$(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

		$(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

		$('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

		$(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
	};

	Slick.prototype.cleanUpSlideEvents = function () {

		var _ = this;

		_.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
		_.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));
	};

	Slick.prototype.cleanUpRows = function () {

		var _ = this,
			originalSlides;

		if (_.options.rows > 0) {
			originalSlides = _.$slides.children().children();
			originalSlides.removeAttr('style');
			_.$slider.empty().append(originalSlides);
		}
	};

	Slick.prototype.clickHandler = function (event) {

		var _ = this;

		if (_.shouldClick === false) {
			event.stopImmediatePropagation();
			event.stopPropagation();
			event.preventDefault();
		}
	};

	Slick.prototype.destroy = function (refresh) {

		var _ = this;

		_.autoPlayClear();

		_.touchObject = {};

		_.cleanUpEvents();

		$('.slick-cloned', _.$slider).detach();

		if (_.$dots) {
			_.$dots.remove();
		}

		if (_.$prevArrow && _.$prevArrow.length) {

			_.$prevArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

			if (_.htmlExpr.test(_.options.prevArrow)) {
				_.$prevArrow.remove();
			}
		}

		if (_.$nextArrow && _.$nextArrow.length) {

			_.$nextArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

			if (_.htmlExpr.test(_.options.nextArrow)) {
				_.$nextArrow.remove();
			}
		}

		if (_.$slides) {

			_.$slides.removeClass('slick-slide slick-active slick-center slick-visible slick-current').removeAttr('aria-hidden').removeAttr('data-slick-index').each(function () {
				$(this).attr('style', $(this).data('originalStyling'));
			});

			_.$slideTrack.children(this.options.slide).detach();

			_.$slideTrack.detach();

			_.$list.detach();

			_.$slider.append(_.$slides);
		}

		_.cleanUpRows();

		_.$slider.removeClass('slick-slider');
		_.$slider.removeClass('slick-initialized');
		_.$slider.removeClass('slick-dotted');

		_.unslicked = true;

		if (!refresh) {
			_.$slider.trigger('destroy', [_]);
		}
	};

	Slick.prototype.disableTransition = function (slide) {

		var _ = this,
			transition = {};

		transition[_.transitionType] = '';

		if (_.options.fade === false) {
			_.$slideTrack.css(transition);
		} else {
			_.$slides.eq(slide).css(transition);
		}
	};

	Slick.prototype.fadeSlide = function (slideIndex, callback) {

		var _ = this;

		if (_.cssTransitions === false) {

			_.$slides.eq(slideIndex).css({
				zIndex: _.options.zIndex
			});

			_.$slides.eq(slideIndex).animate({
				opacity: 1
			}, _.options.speed, _.options.easing, callback);
		} else {

			_.applyTransition(slideIndex);

			_.$slides.eq(slideIndex).css({
				opacity: 1,
				zIndex: _.options.zIndex
			});

			if (callback) {
				setTimeout(function () {

					_.disableTransition(slideIndex);

					callback.call();
				}, _.options.speed);
			}
		}
	};

	Slick.prototype.fadeSlideOut = function (slideIndex) {

		var _ = this;

		if (_.cssTransitions === false) {

			_.$slides.eq(slideIndex).animate({
				opacity: 0,
				zIndex: _.options.zIndex - 2
			}, _.options.speed, _.options.easing);
		} else {

			_.applyTransition(slideIndex);

			_.$slides.eq(slideIndex).css({
				opacity: 0,
				zIndex: _.options.zIndex - 2
			});
		}
	};

	Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

		var _ = this;

		if (filter !== null) {

			_.$slidesCache = _.$slides;

			_.unload();

			_.$slideTrack.children(this.options.slide).detach();

			_.$slidesCache.filter(filter).appendTo(_.$slideTrack);

			_.reinit();
		}
	};

	Slick.prototype.focusHandler = function () {

		var _ = this;

		_.$slider.off('focus.slick blur.slick').on('focus.slick blur.slick', '*', function (event) {

			event.stopImmediatePropagation();
			var $sf = $(this);

			setTimeout(function () {

				if (_.options.pauseOnFocus) {
					_.focussed = $sf.is(':focus');
					_.autoPlay();
				}
			}, 0);
		});
	};

	Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

		var _ = this;
		return _.currentSlide;
	};

	Slick.prototype.getDotCount = function () {

		var _ = this;

		var breakPoint = 0;
		var counter = 0;
		var pagerQty = 0;

		if (_.options.infinite === true) {
			if (_.slideCount <= _.options.slidesToShow) {
				++pagerQty;
			} else {
				while (breakPoint < _.slideCount) {
					++pagerQty;
					breakPoint = counter + _.options.slidesToScroll;
					counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
				}
			}
		} else if (_.options.centerMode === true) {
			pagerQty = _.slideCount;
		} else if (!_.options.asNavFor) {
			pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
		} else {
			while (breakPoint < _.slideCount) {
				++pagerQty;
				breakPoint = counter + _.options.slidesToScroll;
				counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
			}
		}

		return pagerQty - 1;
	};

	Slick.prototype.getLeft = function (slideIndex) {

		var _ = this,
			targetLeft,
			verticalHeight,
			verticalOffset = 0,
			targetSlide,
			coef;

		_.slideOffset = 0;
		verticalHeight = _.$slides.first().outerHeight(true);

		if (_.options.infinite === true) {
			if (_.slideCount > _.options.slidesToShow) {
				_.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
				coef = -1;

				if (_.options.vertical === true && _.options.centerMode === true) {
					if (_.options.slidesToShow === 2) {
						coef = -1.5;
					} else if (_.options.slidesToShow === 1) {
						coef = -2;
					}
				}
				verticalOffset = verticalHeight * _.options.slidesToShow * coef;
			}
			if (_.slideCount % _.options.slidesToScroll !== 0) {
				if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
					if (slideIndex > _.slideCount) {
						_.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
						verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
					} else {
						_.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
						verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
					}
				}
			}
		} else {
			if (slideIndex + _.options.slidesToShow > _.slideCount) {
				_.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
				verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
			}
		}

		if (_.slideCount <= _.options.slidesToShow) {
			_.slideOffset = 0;
			verticalOffset = 0;
		}

		if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
			_.slideOffset = _.slideWidth * Math.floor(_.options.slidesToShow) / 2 - _.slideWidth * _.slideCount / 2;
		} else if (_.options.centerMode === true && _.options.infinite === true) {
			_.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
		} else if (_.options.centerMode === true) {
			_.slideOffset = 0;
			_.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
		}

		if (_.options.vertical === false) {
			targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
		} else {
			targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
		}

		if (_.options.variableWidth === true) {

			if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
				targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
			} else {
				targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
			}

			if (_.options.rtl === true) {
				if (targetSlide[0]) {
					targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
				} else {
					targetLeft = 0;
				}
			} else {
				targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
			}

			if (_.options.centerMode === true) {
				if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
					targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
				} else {
					targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
				}

				if (_.options.rtl === true) {
					if (targetSlide[0]) {
						targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
					} else {
						targetLeft = 0;
					}
				} else {
					targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
				}

				targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
			}
		}

		return targetLeft;
	};

	Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

		var _ = this;

		return _.options[option];
	};

	Slick.prototype.getNavigableIndexes = function () {

		var _ = this,
			breakPoint = 0,
			counter = 0,
			indexes = [],
			max;

		if (_.options.infinite === false) {
			max = _.slideCount;
		} else {
			breakPoint = _.options.slidesToScroll * -1;
			counter = _.options.slidesToScroll * -1;
			max = _.slideCount * 2;
		}

		while (breakPoint < max) {
			indexes.push(breakPoint);
			breakPoint = counter + _.options.slidesToScroll;
			counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
		}

		return indexes;
	};

	Slick.prototype.getSlick = function () {

		return this;
	};

	Slick.prototype.getSlideCount = function () {

		var _ = this,
			slidesTraversed,
			swipedSlide,
			centerOffset;

		centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

		if (_.options.swipeToSlide === true) {
			_.$slideTrack.find('.slick-slide').each(function (index, slide) {
				if (slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > _.swipeLeft * -1) {
					swipedSlide = slide;
					return false;
				}
			});

			slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

			return slidesTraversed;
		} else {
			return _.options.slidesToScroll;
		}
	};

	Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

		var _ = this;

		_.changeSlide({
			data: {
				message: 'index',
				index: parseInt(slide)
			}
		}, dontAnimate);
	};

	Slick.prototype.init = function (creation) {

		var _ = this;

		if (!$(_.$slider).hasClass('slick-initialized')) {

			$(_.$slider).addClass('slick-initialized');

			_.buildRows();
			_.buildOut();
			_.setProps();
			_.startLoad();
			_.loadSlider();
			_.initializeEvents();
			_.updateArrows();
			_.updateDots();
			_.checkResponsive(true);
			_.focusHandler();
		}

		if (creation) {
			_.$slider.trigger('init', [_]);
		}

		if (_.options.accessibility === true) {
			_.initADA();
		}

		if (_.options.autoplay) {

			_.paused = false;
			_.autoPlay();
		}
	};

	Slick.prototype.initADA = function () {
		var _ = this,
			numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
			tabControlIndexes = _.getNavigableIndexes().filter(function (val) {
			return val >= 0 && val < _.slideCount;
		});

		_.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
			'aria-hidden': 'true',
			'tabindex': '-1'
		}).find('a, input, button, select').attr({
			'tabindex': '-1'
		});

		if (_.$dots !== null) {
			_.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
				var slideControlIndex = tabControlIndexes.indexOf(i);

				$(this).attr({
					'role': 'tabpanel',
					'id': 'slick-slide' + _.instanceUid + i,
					'tabindex': -1
				});

				if (slideControlIndex !== -1) {
					var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex;
					if ($('#' + ariaButtonControl).length) {
						$(this).attr({
							'aria-describedby': ariaButtonControl
						});
					}
				}
			});

			_.$dots.attr('role', 'tablist').find('li').each(function (i) {
				var mappedSlideIndex = tabControlIndexes[i];

				$(this).attr({
					'role': 'presentation'
				});

				$(this).find('button').first().attr({
					'role': 'tab',
					'id': 'slick-slide-control' + _.instanceUid + i,
					'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
					'aria-label': i + 1 + ' of ' + numDotGroups,
					'aria-selected': null,
					'tabindex': '-1'
				});
			}).eq(_.currentSlide).find('button').attr({
				'aria-selected': 'true',
				'tabindex': '0'
			}).end();
		}

		for (var i = _.currentSlide, max = i + _.options.slidesToShow; i < max; i++) {
			if (_.options.focusOnChange) {
				_.$slides.eq(i).attr({ 'tabindex': '0' });
			} else {
				_.$slides.eq(i).removeAttr('tabindex');
			}
		}

		_.activateADA();
	};

	Slick.prototype.initArrowEvents = function () {

		var _ = this;

		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
			_.$prevArrow.off('click.slick').on('click.slick', {
				message: 'previous'
			}, _.changeSlide);
			_.$nextArrow.off('click.slick').on('click.slick', {
				message: 'next'
			}, _.changeSlide);

			if (_.options.accessibility === true) {
				_.$prevArrow.on('keydown.slick', _.keyHandler);
				_.$nextArrow.on('keydown.slick', _.keyHandler);
			}
		}
	};

	Slick.prototype.initDotEvents = function () {

		var _ = this;

		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
			$('li', _.$dots).on('click.slick', {
				message: 'index'
			}, _.changeSlide);

			if (_.options.accessibility === true) {
				_.$dots.on('keydown.slick', _.keyHandler);
			}
		}

		if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

			$('li', _.$dots).on('mouseenter.slick', $.proxy(_.interrupt, _, true)).on('mouseleave.slick', $.proxy(_.interrupt, _, false));
		}
	};

	Slick.prototype.initSlideEvents = function () {

		var _ = this;

		if (_.options.pauseOnHover) {

			_.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
			_.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));
		}
	};

	Slick.prototype.initializeEvents = function () {

		var _ = this;

		_.initArrowEvents();

		_.initDotEvents();
		_.initSlideEvents();

		_.$list.on('touchstart.slick mousedown.slick', {
			action: 'start'
		}, _.swipeHandler);
		_.$list.on('touchmove.slick mousemove.slick', {
			action: 'move'
		}, _.swipeHandler);
		_.$list.on('touchend.slick mouseup.slick', {
			action: 'end'
		}, _.swipeHandler);
		_.$list.on('touchcancel.slick mouseleave.slick', {
			action: 'end'
		}, _.swipeHandler);

		_.$list.on('click.slick', _.clickHandler);

		$(document).on(_.visibilityChange, $.proxy(_.visibility, _));

		if (_.options.accessibility === true) {
			_.$list.on('keydown.slick', _.keyHandler);
		}

		if (_.options.focusOnSelect === true) {
			$(_.$slideTrack).children().on('click.slick', _.selectHandler);
		}

		$(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

		$(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

		$('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

		$(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
		$(_.setPosition);
	};

	Slick.prototype.initUI = function () {

		var _ = this;

		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

			_.$prevArrow.show();
			_.$nextArrow.show();
		}

		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

			_.$dots.show();
		}
	};

	Slick.prototype.keyHandler = function (event) {

		var _ = this;
		//Dont slide if the cursor is inside the form fields and arrow keys are pressed
		if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
			if (event.keyCode === 37 && _.options.accessibility === true) {
				_.changeSlide({
					data: {
						message: _.options.rtl === true ? 'next' : 'previous'
					}
				});
			} else if (event.keyCode === 39 && _.options.accessibility === true) {
				_.changeSlide({
					data: {
						message: _.options.rtl === true ? 'previous' : 'next'
					}
				});
			}
		}
	};

	Slick.prototype.lazyLoad = function () {

		var _ = this,
			loadRange,
			cloneRange,
			rangeStart,
			rangeEnd;

		function loadImages(imagesScope) {

			$('img[data-lazy]', imagesScope).each(function () {

				var image = $(this),
					imageSource = $(this).attr('data-lazy'),
					imageSrcSet = $(this).attr('data-srcset'),
					imageSizes = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
					imageToLoad = document.createElement('img');

				imageToLoad.onload = function () {

					image.animate({ opacity: 0 }, 100, function () {

						if (imageSrcSet) {
							image.attr('srcset', imageSrcSet);

							if (imageSizes) {
								image.attr('sizes', imageSizes);
							}
						}

						image.attr('src', imageSource).animate({ opacity: 1 }, 200, function () {
							image.removeAttr('data-lazy data-srcset data-sizes').removeClass('slick-loading');
						});
						_.$slider.trigger('lazyLoaded', [_, image, imageSource]);
					});
				};

				imageToLoad.onerror = function () {

					image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

					_.$slider.trigger('lazyLoadError', [_, image, imageSource]);
				};

				imageToLoad.src = imageSource;
			});
		}

		if (_.options.centerMode === true) {
			if (_.options.infinite === true) {
				rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
				rangeEnd = rangeStart + _.options.slidesToShow + 2;
			} else {
				rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
				rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
			}
		} else {
			rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
			rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
			if (_.options.fade === true) {
				if (rangeStart > 0) rangeStart--;
				if (rangeEnd <= _.slideCount) rangeEnd++;
			}
		}

		loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

		if (_.options.lazyLoad === 'anticipated') {
			var prevSlide = rangeStart - 1,
				nextSlide = rangeEnd,
				$slides = _.$slider.find('.slick-slide');

			for (var i = 0; i < _.options.slidesToScroll; i++) {
				if (prevSlide < 0) prevSlide = _.slideCount - 1;
				loadRange = loadRange.add($slides.eq(prevSlide));
				loadRange = loadRange.add($slides.eq(nextSlide));
				prevSlide--;
				nextSlide++;
			}
		}

		loadImages(loadRange);

		if (_.slideCount <= _.options.slidesToShow) {
			cloneRange = _.$slider.find('.slick-slide');
			loadImages(cloneRange);
		} else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
			cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
			loadImages(cloneRange);
		} else if (_.currentSlide === 0) {
			cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
			loadImages(cloneRange);
		}
	};

	Slick.prototype.loadSlider = function () {

		var _ = this;

		_.setPosition();

		_.$slideTrack.css({
			opacity: 1
		});

		_.$slider.removeClass('slick-loading');

		_.initUI();

		if (_.options.lazyLoad === 'progressive') {
			_.progressiveLazyLoad();
		}
	};

	Slick.prototype.next = Slick.prototype.slickNext = function () {

		var _ = this;

		_.changeSlide({
			data: {
				message: 'next'
			}
		});
	};

	Slick.prototype.orientationChange = function () {

		var _ = this;

		_.checkResponsive();
		_.setPosition();
	};

	Slick.prototype.pause = Slick.prototype.slickPause = function () {

		var _ = this;

		_.autoPlayClear();
		_.paused = true;
	};

	Slick.prototype.play = Slick.prototype.slickPlay = function () {

		var _ = this;

		_.autoPlay();
		_.options.autoplay = true;
		_.paused = false;
		_.focussed = false;
		_.interrupted = false;
	};

	Slick.prototype.postSlide = function (index) {

		var _ = this;

		if (!_.unslicked) {

			_.$slider.trigger('afterChange', [_, index]);

			_.animating = false;

			if (_.slideCount > _.options.slidesToShow) {
				_.setPosition();
			}

			_.swipeLeft = null;

			if (_.options.autoplay) {
				_.autoPlay();
			}

			if (_.options.accessibility === true) {
				_.initADA();

				if (_.options.focusOnChange) {
					var $currentSlide = $(_.$slides.get(_.currentSlide));
					$currentSlide.attr('tabindex', 0).focus();
				}
			}
		}
	};

	Slick.prototype.prev = Slick.prototype.slickPrev = function () {

		var _ = this;

		_.changeSlide({
			data: {
				message: 'previous'
			}
		});
	};

	Slick.prototype.preventDefault = function (event) {

		event.preventDefault();
	};

	Slick.prototype.progressiveLazyLoad = function (tryCount) {

		tryCount = tryCount || 1;

		var _ = this,
			$imgsToLoad = $('img[data-lazy]', _.$slider),
			image,
			imageSource,
			imageSrcSet,
			imageSizes,
			imageToLoad;

		if ($imgsToLoad.length) {

			image = $imgsToLoad.first();
			imageSource = image.attr('data-lazy');
			imageSrcSet = image.attr('data-srcset');
			imageSizes = image.attr('data-sizes') || _.$slider.attr('data-sizes');
			imageToLoad = document.createElement('img');

			imageToLoad.onload = function () {

				if (imageSrcSet) {
					image.attr('srcset', imageSrcSet);

					if (imageSizes) {
						image.attr('sizes', imageSizes);
					}
				}

				image.attr('src', imageSource).removeAttr('data-lazy data-srcset data-sizes').removeClass('slick-loading');

				if (_.options.adaptiveHeight === true) {
					_.setPosition();
				}

				_.$slider.trigger('lazyLoaded', [_, image, imageSource]);
				_.progressiveLazyLoad();
			};

			imageToLoad.onerror = function () {

				if (tryCount < 3) {

					/**
					 * try to load the image 3 times,
					 * leave a slight delay so we don't get
					 * servers blocking the request.
					 */
					setTimeout(function () {
						_.progressiveLazyLoad(tryCount + 1);
					}, 500);
				} else {

					image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

					_.$slider.trigger('lazyLoadError', [_, image, imageSource]);

					_.progressiveLazyLoad();
				}
			};

			imageToLoad.src = imageSource;
		} else {

			_.$slider.trigger('allImagesLoaded', [_]);
		}
	};

	Slick.prototype.refresh = function (initializing) {

		var _ = this,
			currentSlide,
			lastVisibleIndex;

		lastVisibleIndex = _.slideCount - _.options.slidesToShow;

		// in non-infinite sliders, we don't want to go past the
		// last visible index.
		if (!_.options.infinite && _.currentSlide > lastVisibleIndex) {
			_.currentSlide = lastVisibleIndex;
		}

		// if less slides than to show, go to start.
		if (_.slideCount <= _.options.slidesToShow) {
			_.currentSlide = 0;
		}

		currentSlide = _.currentSlide;

		_.destroy(true);

		$.extend(_, _.initials, { currentSlide: currentSlide });

		_.init();

		if (!initializing) {

			_.changeSlide({
				data: {
					message: 'index',
					index: currentSlide
				}
			}, false);
		}
	};

	Slick.prototype.registerBreakpoints = function () {

		var _ = this,
			breakpoint,
			currentBreakpoint,
			l,
			responsiveSettings = _.options.responsive || null;

		if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {

			_.respondTo = _.options.respondTo || 'window';

			for (breakpoint in responsiveSettings) {

				l = _.breakpoints.length - 1;

				if (responsiveSettings.hasOwnProperty(breakpoint)) {
					currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

					// loop through the breakpoints and cut out any existing
					// ones with the same breakpoint number, we don't want dupes.
					while (l >= 0) {
						if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
							_.breakpoints.splice(l, 1);
						}
						l--;
					}

					_.breakpoints.push(currentBreakpoint);
					_.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;
				}
			}

			_.breakpoints.sort(function (a, b) {
				return _.options.mobileFirst ? a - b : b - a;
			});
		}
	};

	Slick.prototype.reinit = function () {

		var _ = this;

		_.$slides = _.$slideTrack.children(_.options.slide).addClass('slick-slide');

		_.slideCount = _.$slides.length;

		if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
			_.currentSlide = _.currentSlide - _.options.slidesToScroll;
		}

		if (_.slideCount <= _.options.slidesToShow) {
			_.currentSlide = 0;
		}

		_.registerBreakpoints();

		_.setProps();
		_.setupInfinite();
		_.buildArrows();
		_.updateArrows();
		_.initArrowEvents();
		_.buildDots();
		_.updateDots();
		_.initDotEvents();
		_.cleanUpSlideEvents();
		_.initSlideEvents();

		_.checkResponsive(false, true);

		if (_.options.focusOnSelect === true) {
			$(_.$slideTrack).children().on('click.slick', _.selectHandler);
		}

		_.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

		_.setPosition();
		_.focusHandler();

		_.paused = !_.options.autoplay;
		_.autoPlay();

		_.$slider.trigger('reInit', [_]);
	};

	Slick.prototype.resize = function () {

		var _ = this;

		if ($(window).width() !== _.windowWidth) {
			clearTimeout(_.windowDelay);
			_.windowDelay = window.setTimeout(function () {
				_.windowWidth = $(window).width();
				_.checkResponsive();
				if (!_.unslicked) {
					_.setPosition();
				}
			}, 50);
		}
	};

	Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

		var _ = this;

		if (typeof index === 'boolean') {
			removeBefore = index;
			index = removeBefore === true ? 0 : _.slideCount - 1;
		} else {
			index = removeBefore === true ? --index : index;
		}

		if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
			return false;
		}

		_.unload();

		if (removeAll === true) {
			_.$slideTrack.children().remove();
		} else {
			_.$slideTrack.children(this.options.slide).eq(index).remove();
		}

		_.$slides = _.$slideTrack.children(this.options.slide);

		_.$slideTrack.children(this.options.slide).detach();

		_.$slideTrack.append(_.$slides);

		_.$slidesCache = _.$slides;

		_.reinit();
	};

	Slick.prototype.setCSS = function (position) {

		var _ = this,
			positionProps = {},
			x,
			y;

		if (_.options.rtl === true) {
			position = -position;
		}
		x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
		y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

		positionProps[_.positionProp] = position;

		if (_.transformsEnabled === false) {
			_.$slideTrack.css(positionProps);
		} else {
			positionProps = {};
			if (_.cssTransitions === false) {
				positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
				_.$slideTrack.css(positionProps);
			} else {
				positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
				_.$slideTrack.css(positionProps);
			}
		}
	};

	Slick.prototype.setDimensions = function () {

		var _ = this;

		if (_.options.vertical === false) {
			if (_.options.centerMode === true) {
				_.$list.css({
					padding: '0px ' + _.options.centerPadding
				});
			}
		} else {
			_.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
			if (_.options.centerMode === true) {
				_.$list.css({
					padding: _.options.centerPadding + ' 0px'
				});
			}
		}

		_.listWidth = _.$list.width();
		_.listHeight = _.$list.height();

		if (_.options.vertical === false && _.options.variableWidth === false) {
			_.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
			_.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children('.slick-slide').length));
		} else if (_.options.variableWidth === true) {
			_.$slideTrack.width(5000 * _.slideCount);
		} else {
			_.slideWidth = Math.ceil(_.listWidth);
			_.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length));
		}

		var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
		if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);
	};

	Slick.prototype.setFade = function () {

		var _ = this,
			targetLeft;

		_.$slides.each(function (index, element) {
			targetLeft = _.slideWidth * index * -1;
			if (_.options.rtl === true) {
				$(element).css({
					position: 'relative',
					right: targetLeft,
					top: 0,
					zIndex: _.options.zIndex - 2,
					opacity: 0
				});
			} else {
				$(element).css({
					position: 'relative',
					left: targetLeft,
					top: 0,
					zIndex: _.options.zIndex - 2,
					opacity: 0
				});
			}
		});

		_.$slides.eq(_.currentSlide).css({
			zIndex: _.options.zIndex - 1,
			opacity: 1
		});
	};

	Slick.prototype.setHeight = function () {

		var _ = this;

		if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
			var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
			_.$list.css('height', targetHeight);
		}
	};

	Slick.prototype.setOption = Slick.prototype.slickSetOption = function () {

		/**
		 * accepts arguments in format of:
		 *
		 *  - for changing a single option's value:
		 *	 .slick("setOption", option, value, refresh )
		 *
		 *  - for changing a set of responsive options:
		 *	 .slick("setOption", 'responsive', [{}, ...], refresh )
		 *
		 *  - for updating multiple values at once (not responsive)
		 *	 .slick("setOption", { 'option': value, ... }, refresh )
		 */

		var _ = this,
			l,
			item,
			option,
			value,
			refresh = false,
			type;

		if ($.type(arguments[0]) === 'object') {

			option = arguments[0];
			refresh = arguments[1];
			type = 'multiple';
		} else if ($.type(arguments[0]) === 'string') {

			option = arguments[0];
			value = arguments[1];
			refresh = arguments[2];

			if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {

				type = 'responsive';
			} else if (typeof arguments[1] !== 'undefined') {

				type = 'single';
			}
		}

		if (type === 'single') {

			_.options[option] = value;
		} else if (type === 'multiple') {

			$.each(option, function (opt, val) {

				_.options[opt] = val;
			});
		} else if (type === 'responsive') {

			for (item in value) {

				if ($.type(_.options.responsive) !== 'array') {

					_.options.responsive = [value[item]];
				} else {

					l = _.options.responsive.length - 1;

					// loop through the responsive object and splice out duplicates.
					while (l >= 0) {

						if (_.options.responsive[l].breakpoint === value[item].breakpoint) {

							_.options.responsive.splice(l, 1);
						}

						l--;
					}

					_.options.responsive.push(value[item]);
				}
			}
		}

		if (refresh) {

			_.unload();
			_.reinit();
		}
	};

	Slick.prototype.setPosition = function () {

		var _ = this;

		_.setDimensions();

		_.setHeight();

		if (_.options.fade === false) {
			_.setCSS(_.getLeft(_.currentSlide));
		} else {
			_.setFade();
		}

		_.$slider.trigger('setPosition', [_]);
	};

	Slick.prototype.setProps = function () {

		var _ = this,
			bodyStyle = document.body.style;

		_.positionProp = _.options.vertical === true ? 'top' : 'left';

		if (_.positionProp === 'top') {
			_.$slider.addClass('slick-vertical');
		} else {
			_.$slider.removeClass('slick-vertical');
		}

		if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
			if (_.options.useCSS === true) {
				_.cssTransitions = true;
			}
		}

		if (_.options.fade) {
			if (typeof _.options.zIndex === 'number') {
				if (_.options.zIndex < 3) {
					_.options.zIndex = 3;
				}
			} else {
				_.options.zIndex = _.defaults.zIndex;
			}
		}

		if (bodyStyle.OTransform !== undefined) {
			_.animType = 'OTransform';
			_.transformType = '-o-transform';
			_.transitionType = 'OTransition';
			if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
		}
		if (bodyStyle.MozTransform !== undefined) {
			_.animType = 'MozTransform';
			_.transformType = '-moz-transform';
			_.transitionType = 'MozTransition';
			if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
		}
		if (bodyStyle.webkitTransform !== undefined) {
			_.animType = 'webkitTransform';
			_.transformType = '-webkit-transform';
			_.transitionType = 'webkitTransition';
			if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
		}
		if (bodyStyle.msTransform !== undefined) {
			_.animType = 'msTransform';
			_.transformType = '-ms-transform';
			_.transitionType = 'msTransition';
			if (bodyStyle.msTransform === undefined) _.animType = false;
		}
		if (bodyStyle.transform !== undefined && _.animType !== false) {
			_.animType = 'transform';
			_.transformType = 'transform';
			_.transitionType = 'transition';
		}
		_.transformsEnabled = _.options.useTransform && _.animType !== null && _.animType !== false;
	};

	Slick.prototype.setSlideClasses = function (index) {

		var _ = this,
			centerOffset,
			allSlides,
			indexOffset,
			remainder;

		allSlides = _.$slider.find('.slick-slide').removeClass('slick-active slick-center slick-current').attr('aria-hidden', 'true');

		_.$slides.eq(index).addClass('slick-current');

		if (_.options.centerMode === true) {

			var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

			centerOffset = Math.floor(_.options.slidesToShow / 2);

			if (_.options.infinite === true) {

				if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
					_.$slides.slice(index - centerOffset + evenCoef, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
				} else {

					indexOffset = _.options.slidesToShow + index;
					allSlides.slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
				}

				if (index === 0) {

					allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
				} else if (index === _.slideCount - 1) {

					allSlides.eq(_.options.slidesToShow).addClass('slick-center');
				}
			}

			_.$slides.eq(index).addClass('slick-center');
		} else {

			if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {

				_.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
			} else if (allSlides.length <= _.options.slidesToShow) {

				allSlides.addClass('slick-active').attr('aria-hidden', 'false');
			} else {

				remainder = _.slideCount % _.options.slidesToShow;
				indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

				if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {

					allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass('slick-active').attr('aria-hidden', 'false');
				} else {

					allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
				}
			}
		}

		if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
			_.lazyLoad();
		}
	};

	Slick.prototype.setupInfinite = function () {

		var _ = this,
			i,
			slideIndex,
			infiniteCount;

		if (_.options.fade === true) {
			_.options.centerMode = false;
		}

		if (_.options.infinite === true && _.options.fade === false) {

			slideIndex = null;

			if (_.slideCount > _.options.slidesToShow) {

				if (_.options.centerMode === true) {
					infiniteCount = _.options.slidesToShow + 1;
				} else {
					infiniteCount = _.options.slidesToShow;
				}

				for (i = _.slideCount; i > _.slideCount - infiniteCount; i -= 1) {
					slideIndex = i - 1;
					$(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex - _.slideCount).prependTo(_.$slideTrack).addClass('slick-cloned');
				}
				for (i = 0; i < infiniteCount + _.slideCount; i += 1) {
					slideIndex = i;
					$(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex + _.slideCount).appendTo(_.$slideTrack).addClass('slick-cloned');
				}
				_.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
					$(this).attr('id', '');
				});
			}
		}
	};

	Slick.prototype.interrupt = function (toggle) {

		var _ = this;

		if (!toggle) {
			_.autoPlay();
		}
		_.interrupted = toggle;
	};

	Slick.prototype.selectHandler = function (event) {

		var _ = this;

		var targetElement = $(event.target).is('.slick-slide') ? $(event.target) : $(event.target).parents('.slick-slide');

		var index = parseInt(targetElement.attr('data-slick-index'));

		if (!index) index = 0;

		if (_.slideCount <= _.options.slidesToShow) {

			_.slideHandler(index, false, true);
			return;
		}

		_.slideHandler(index);
	};

	Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

		var targetSlide,
			animSlide,
			oldSlide,
			slideLeft,
			targetLeft = null,
			_ = this,
			navTarget;

		sync = sync || false;

		if (_.animating === true && _.options.waitForAnimate === true) {
			return;
		}

		if (_.options.fade === true && _.currentSlide === index) {
			return;
		}

		if (sync === false) {
			_.asNavFor(index);
		}

		targetSlide = index;
		targetLeft = _.getLeft(targetSlide);
		slideLeft = _.getLeft(_.currentSlide);

		_.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

		if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
			if (_.options.fade === false) {
				targetSlide = _.currentSlide;
				if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
					_.animateSlide(slideLeft, function () {
						_.postSlide(targetSlide);
					});
				} else {
					_.postSlide(targetSlide);
				}
			}
			return;
		} else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
			if (_.options.fade === false) {
				targetSlide = _.currentSlide;
				if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
					_.animateSlide(slideLeft, function () {
						_.postSlide(targetSlide);
					});
				} else {
					_.postSlide(targetSlide);
				}
			}
			return;
		}

		if (_.options.autoplay) {
			clearInterval(_.autoPlayTimer);
		}

		if (targetSlide < 0) {
			if (_.slideCount % _.options.slidesToScroll !== 0) {
				animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
			} else {
				animSlide = _.slideCount + targetSlide;
			}
		} else if (targetSlide >= _.slideCount) {
			if (_.slideCount % _.options.slidesToScroll !== 0) {
				animSlide = 0;
			} else {
				animSlide = targetSlide - _.slideCount;
			}
		} else {
			animSlide = targetSlide;
		}

		_.animating = true;

		_.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

		oldSlide = _.currentSlide;
		_.currentSlide = animSlide;

		_.setSlideClasses(_.currentSlide);

		if (_.options.asNavFor) {

			navTarget = _.getNavTarget();
			navTarget = navTarget.slick('getSlick');

			if (navTarget.slideCount <= navTarget.options.slidesToShow) {
				navTarget.setSlideClasses(_.currentSlide);
			}
		}

		_.updateDots();
		_.updateArrows();

		if (_.options.fade === true) {
			if (dontAnimate !== true) {

				_.fadeSlideOut(oldSlide);

				_.fadeSlide(animSlide, function () {
					_.postSlide(animSlide);
				});
			} else {
				_.postSlide(animSlide);
			}
			_.animateHeight();
			return;
		}

		if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
			_.animateSlide(targetLeft, function () {
				_.postSlide(animSlide);
			});
		} else {
			_.postSlide(animSlide);
		}
	};

	Slick.prototype.startLoad = function () {

		var _ = this;

		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

			_.$prevArrow.hide();
			_.$nextArrow.hide();
		}

		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

			_.$dots.hide();
		}

		_.$slider.addClass('slick-loading');
	};

	Slick.prototype.swipeDirection = function () {

		var xDist,
			yDist,
			r,
			swipeAngle,
			_ = this;

		xDist = _.touchObject.startX - _.touchObject.curX;
		yDist = _.touchObject.startY - _.touchObject.curY;
		r = Math.atan2(yDist, xDist);

		swipeAngle = Math.round(r * 180 / Math.PI);
		if (swipeAngle < 0) {
			swipeAngle = 360 - Math.abs(swipeAngle);
		}

		if (swipeAngle <= 45 && swipeAngle >= 0) {
			return _.options.rtl === false ? 'left' : 'right';
		}
		if (swipeAngle <= 360 && swipeAngle >= 315) {
			return _.options.rtl === false ? 'left' : 'right';
		}
		if (swipeAngle >= 135 && swipeAngle <= 225) {
			return _.options.rtl === false ? 'right' : 'left';
		}
		if (_.options.verticalSwiping === true) {
			if (swipeAngle >= 35 && swipeAngle <= 135) {
				return 'down';
			} else {
				return 'up';
			}
		}

		return 'vertical';
	};

	Slick.prototype.swipeEnd = function (event) {

		var _ = this,
			slideCount,
			direction;

		_.dragging = false;
		_.swiping = false;

		if (_.scrolling) {
			_.scrolling = false;
			return false;
		}

		_.interrupted = false;
		_.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

		if (_.touchObject.curX === undefined) {
			return false;
		}

		if (_.touchObject.edgeHit === true) {
			_.$slider.trigger('edge', [_, _.swipeDirection()]);
		}

		if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

			direction = _.swipeDirection();

			switch (direction) {

				case 'left':
				case 'down':

					slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();

					_.currentDirection = 0;

					break;

				case 'right':
				case 'up':

					slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();

					_.currentDirection = 1;

					break;

				default:

			}

			if (direction != 'vertical') {

				_.slideHandler(slideCount);
				_.touchObject = {};
				_.$slider.trigger('swipe', [_, direction]);
			}
		} else {

			if (_.touchObject.startX !== _.touchObject.curX) {

				_.slideHandler(_.currentSlide);
				_.touchObject = {};
			}
		}
	};

	Slick.prototype.swipeHandler = function (event) {

		var _ = this;

		if (_.options.swipe === false || 'ontouchend' in document && _.options.swipe === false) {
			return;
		} else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
			return;
		}

		_.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ? event.originalEvent.touches.length : 1;

		_.touchObject.minSwipe = _.listWidth / _.options.touchThreshold;

		if (_.options.verticalSwiping === true) {
			_.touchObject.minSwipe = _.listHeight / _.options.touchThreshold;
		}

		switch (event.data.action) {

			case 'start':
				_.swipeStart(event);
				break;

			case 'move':
				_.swipeMove(event);
				break;

			case 'end':
				_.swipeEnd(event);
				break;

		}
	};

	Slick.prototype.swipeMove = function (event) {

		var _ = this,
			edgeWasHit = false,
			curLeft,
			swipeDirection,
			swipeLength,
			positionOffset,
			touches,
			verticalSwipeLength;

		touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

		if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
			return false;
		}

		curLeft = _.getLeft(_.currentSlide);

		_.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
		_.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

		_.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

		verticalSwipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

		if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
			_.scrolling = true;
			return false;
		}

		if (_.options.verticalSwiping === true) {
			_.touchObject.swipeLength = verticalSwipeLength;
		}

		swipeDirection = _.swipeDirection();

		if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
			_.swiping = true;
			event.preventDefault();
		}

		positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
		if (_.options.verticalSwiping === true) {
			positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
		}

		swipeLength = _.touchObject.swipeLength;

		_.touchObject.edgeHit = false;

		if (_.options.infinite === false) {
			if (_.currentSlide === 0 && swipeDirection === 'right' || _.currentSlide >= _.getDotCount() && swipeDirection === 'left') {
				swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
				_.touchObject.edgeHit = true;
			}
		}

		if (_.options.vertical === false) {
			_.swipeLeft = curLeft + swipeLength * positionOffset;
		} else {
			_.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
		}
		if (_.options.verticalSwiping === true) {
			_.swipeLeft = curLeft + swipeLength * positionOffset;
		}

		if (_.options.fade === true || _.options.touchMove === false) {
			return false;
		}

		if (_.animating === true) {
			_.swipeLeft = null;
			return false;
		}

		_.setCSS(_.swipeLeft);
	};

	Slick.prototype.swipeStart = function (event) {

		var _ = this,
			touches;

		_.interrupted = true;

		if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
			_.touchObject = {};
			return false;
		}

		if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
			touches = event.originalEvent.touches[0];
		}

		_.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
		_.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

		_.dragging = true;
	};

	Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

		var _ = this;

		if (_.$slidesCache !== null) {

			_.unload();

			_.$slideTrack.children(this.options.slide).detach();

			_.$slidesCache.appendTo(_.$slideTrack);

			_.reinit();
		}
	};

	Slick.prototype.unload = function () {

		var _ = this;

		$('.slick-cloned', _.$slider).remove();

		if (_.$dots) {
			_.$dots.remove();
		}

		if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
			_.$prevArrow.remove();
		}

		if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
			_.$nextArrow.remove();
		}

		_.$slides.removeClass('slick-slide slick-active slick-visible slick-current').attr('aria-hidden', 'true').css('width', '');
	};

	Slick.prototype.unslick = function (fromBreakpoint) {

		var _ = this;
		_.$slider.trigger('unslick', [_, fromBreakpoint]);
		_.destroy();
	};

	Slick.prototype.updateArrows = function () {

		var _ = this,
			centerOffset;

		centerOffset = Math.floor(_.options.slidesToShow / 2);

		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow && !_.options.infinite) {

			_.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
			_.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

			if (_.currentSlide === 0) {

				_.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
				_.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
			} else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

				_.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
				_.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
			} else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

				_.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
				_.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
			}
		}
	};

	Slick.prototype.updateDots = function () {

		var _ = this;

		if (_.$dots !== null) {

			_.$dots.find('li').removeClass('slick-active').end();

			_.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active');
		}
	};

	Slick.prototype.visibility = function () {

		var _ = this;

		if (_.options.autoplay) {

			if (document[_.hidden]) {

				_.interrupted = true;
			} else {

				_.interrupted = false;
			}
		}
	};

	$.fn.slick = function () {
		var _ = this,
			opt = arguments[0],
			args = Array.prototype.slice.call(arguments, 1),
			l = _.length,
			i,
			ret;
		for (i = 0; i < l; i++) {
			if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) == 'object' || typeof opt == 'undefined') _[i].slick = new Slick(_[i], opt);else ret = _[i].slick[opt].apply(_[i].slick, args);
			if (typeof ret != 'undefined') return ret;
		}
		return _;
	};
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * jQuery Superfish Menu Plugin - v1.7.10
 * Copyright (c) 2018 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 *	http://www.opensource.org/licenses/mit-license.php
 *	http://www.gnu.org/licenses/gpl.html
 */

;(function ($, w) {
	"use strict";

	var methods = function () {
		// private properties and methods go here
		var c = {
			bcClass: 'sf-breadcrumb',
			menuClass: 'sf-js-enabled',
			anchorClass: 'sf-with-ul',
			menuArrowClass: 'sf-arrows'
		},
			ios = function () {
			var ios = /^(?![\w\W]*Windows Phone)[\w\W]*(iPhone|iPad|iPod)/i.test(navigator.userAgent);
			if (ios) {
				// tap anywhere on iOS to unfocus a submenu
				$('html').css('cursor', 'pointer').on('click', $.noop);
			}
			return ios;
		}(),
			wp7 = function () {
			var style = document.documentElement.style;
			return 'behavior' in style && 'fill' in style && /iemobile/i.test(navigator.userAgent);
		}(),
			unprefixedPointerEvents = function () {
			return !!w.PointerEvent;
		}(),
			toggleMenuClasses = function toggleMenuClasses($menu, o, add) {
			var classes = c.menuClass,
				method;
			if (o.cssArrows) {
				classes += ' ' + c.menuArrowClass;
			}
			method = add ? 'addClass' : 'removeClass';
			$menu[method](classes);
		},
			setPathToCurrent = function setPathToCurrent($menu, o) {
			return $menu.find('li.' + o.pathClass).slice(0, o.pathLevels).addClass(o.hoverClass + ' ' + c.bcClass).filter(function () {
				return $(this).children(o.popUpSelector).hide().show().length;
			}).removeClass(o.pathClass);
		},
			toggleAnchorClass = function toggleAnchorClass($li, add) {
			var method = add ? 'addClass' : 'removeClass';
			$li.children('a')[method](c.anchorClass);
		},
			toggleTouchAction = function toggleTouchAction($menu) {
			var msTouchAction = $menu.css('ms-touch-action');
			var touchAction = $menu.css('touch-action');
			touchAction = touchAction || msTouchAction;
			touchAction = touchAction === 'pan-y' ? 'auto' : 'pan-y';
			$menu.css({
				'ms-touch-action': touchAction,
				'touch-action': touchAction
			});
		},
			getMenu = function getMenu($el) {
			return $el.closest('.' + c.menuClass);
		},
			getOptions = function getOptions($el) {
			return getMenu($el).data('sfOptions');
		},
			over = function over() {
			var $this = $(this),
				o = getOptions($this);
			clearTimeout(o.sfTimer);
			$this.siblings().superfish('hide').end().superfish('show');
		},
			close = function close(o) {
			o.retainPath = $.inArray(this[0], o.$path) > -1;
			this.superfish('hide');

			if (!this.parents('.' + o.hoverClass).length) {
				o.onIdle.call(getMenu(this));
				if (o.$path.length) {
					$.proxy(over, o.$path)();
				}
			}
		},
			out = function out() {
			var $this = $(this),
				o = getOptions($this);
			if (ios) {
				$.proxy(close, $this, o)();
			} else {
				clearTimeout(o.sfTimer);
				o.sfTimer = setTimeout($.proxy(close, $this, o), o.delay);
			}
		},
			touchHandler = function touchHandler(e) {
			var $this = $(this),
				o = getOptions($this),
				$ul = $this.siblings(e.data.popUpSelector);

			if (o.onHandleTouch.call($ul) === false) {
				return this;
			}

			if ($ul.length > 0 && $ul.is(':hidden')) {
				$this.one('click.superfish', false);
				if (e.type === 'MSPointerDown' || e.type === 'pointerdown') {
					$this.trigger('focus');
				} else {
					$.proxy(over, $this.parent('li'))();
				}
			}
		},
			applyHandlers = function applyHandlers($menu, o) {
			var targets = 'li:has(' + o.popUpSelector + ')';
			if ($.fn.hoverIntent && !o.disableHI) {
				$menu.hoverIntent(over, out, targets);
			} else {
				$menu.on('mouseenter.superfish', targets, over).on('mouseleave.superfish', targets, out);
			}
			var touchevent = 'MSPointerDown.superfish';
			if (unprefixedPointerEvents) {
				touchevent = 'pointerdown.superfish';
			}
			if (!ios) {
				touchevent += ' touchend.superfish';
			}
			if (wp7) {
				touchevent += ' mousedown.superfish';
			}
			$menu.on('focusin.superfish', 'li', over).on('focusout.superfish', 'li', out).on(touchevent, 'a', o, touchHandler);
		};

		return {
			// public methods
			hide: function hide(instant) {
				if (this.length) {
					var $this = this,
						o = getOptions($this);
					if (!o) {
						return this;
					}
					var not = o.retainPath === true ? o.$path : '',
						$ul = $this.find('li.' + o.hoverClass).add(this).not(not).removeClass(o.hoverClass).children(o.popUpSelector),
						speed = o.speedOut;

					if (instant) {
						$ul.show();
						speed = 0;
					}
					o.retainPath = false;

					if (o.onBeforeHide.call($ul) === false) {
						return this;
					}

					$ul.stop(true, true).animate(o.animationOut, speed, function () {
						var $this = $(this);
						o.onHide.call($this);
					});
				}
				return this;
			},
			show: function show() {
				var o = getOptions(this);
				if (!o) {
					return this;
				}
				var $this = this.addClass(o.hoverClass),
					$ul = $this.children(o.popUpSelector);

				if (o.onBeforeShow.call($ul) === false) {
					return this;
				}

				$ul.stop(true, true).animate(o.animation, o.speed, function () {
					o.onShow.call($ul);
				});
				return this;
			},
			destroy: function destroy() {
				return this.each(function () {
					var $this = $(this),
						o = $this.data('sfOptions'),
						$hasPopUp;
					if (!o) {
						return false;
					}
					$hasPopUp = $this.find(o.popUpSelector).parent('li');
					clearTimeout(o.sfTimer);
					toggleMenuClasses($this, o);
					toggleAnchorClass($hasPopUp);
					toggleTouchAction($this);
					// remove event handlers
					$this.off('.superfish').off('.hoverIntent');
					// clear animation's inline display style
					$hasPopUp.children(o.popUpSelector).attr('style', function (i, style) {
						if (typeof style !== 'undefined') {
							return style.replace(/display[^;]+;?/g, '');
						}
					});
					// reset 'current' path classes
					o.$path.removeClass(o.hoverClass + ' ' + c.bcClass).addClass(o.pathClass);
					$this.find('.' + o.hoverClass).removeClass(o.hoverClass);
					o.onDestroy.call($this);
					$this.removeData('sfOptions');
				});
			},
			init: function init(op) {
				return this.each(function () {
					var $this = $(this);
					if ($this.data('sfOptions')) {
						return false;
					}
					var o = $.extend({}, $.fn.superfish.defaults, op),
						$hasPopUp = $this.find(o.popUpSelector).parent('li');
					o.$path = setPathToCurrent($this, o);

					$this.data('sfOptions', o);

					toggleMenuClasses($this, o, true);
					toggleAnchorClass($hasPopUp, true);
					toggleTouchAction($this);
					applyHandlers($this, o);

					$hasPopUp.not('.' + c.bcClass).superfish('hide', true);

					o.onInit.call(this);
				});
			}
		};
	}();

	$.fn.superfish = function (method, args) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ((typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			return $.error('Method ' + method + ' does not exist on jQuery.fn.superfish');
		}
	};

	$.fn.superfish.defaults = {
		popUpSelector: 'ul,.sf-mega', // within menu context
		hoverClass: 'sfHover',
		pathClass: 'overrideThisToUse',
		pathLevels: 1,
		delay: 800,
		animation: { opacity: 'show' },
		animationOut: { opacity: 'hide' },
		speed: 'normal',
		speedOut: 'fast',
		cssArrows: true,
		disableHI: false,
		onInit: $.noop,
		onBeforeShow: $.noop,
		onShow: $.noop,
		onBeforeHide: $.noop,
		onHide: $.noop,
		onIdle: $.noop,
		onDestroy: $.noop,
		onHandleTouch: $.noop
	};
})(jQuery, window);
'use strict';

/*!
Waypoints Inview Shortcut - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function () {
  'use strict';

  function noop() {}

  var Waypoint = window.Waypoint;

  /* http://imakewebthings.com/waypoints/shortcuts/inview */
  function Inview(options) {
	this.options = Waypoint.Adapter.extend({}, Inview.defaults, options);
	this.axis = this.options.horizontal ? 'horizontal' : 'vertical';
	this.waypoints = [];
	this.element = this.options.element;
	this.createWaypoints();
  }

  /* Private */
  Inview.prototype.createWaypoints = function () {
	var configs = {
	  vertical: [{
		down: 'enter',
		up: 'exited',
		offset: '100%'
	  }, {
		down: 'entered',
		up: 'exit',
		offset: 'bottom-in-view'
	  }, {
		down: 'exit',
		up: 'entered',
		offset: 0
	  }, {
		down: 'exited',
		up: 'enter',
		offset: function offset() {
		  return -this.adapter.outerHeight();
		}
	  }],
	  horizontal: [{
		right: 'enter',
		left: 'exited',
		offset: '100%'
	  }, {
		right: 'entered',
		left: 'exit',
		offset: 'right-in-view'
	  }, {
		right: 'exit',
		left: 'entered',
		offset: 0
	  }, {
		right: 'exited',
		left: 'enter',
		offset: function offset() {
		  return -this.adapter.outerWidth();
		}
	  }]
	};

	for (var i = 0, end = configs[this.axis].length; i < end; i++) {
	  var config = configs[this.axis][i];
	  this.createWaypoint(config);
	}
  };

  /* Private */
  Inview.prototype.createWaypoint = function (config) {
	var self = this;
	this.waypoints.push(new Waypoint({
	  context: this.options.context,
	  element: this.options.element,
	  enabled: this.options.enabled,
	  handler: function (config) {
		return function (direction) {
		  self.options[config[direction]].call(self, direction);
		};
	  }(config),
	  offset: config.offset,
	  horizontal: this.options.horizontal
	}));
  };

  /* Public */
  Inview.prototype.destroy = function () {
	for (var i = 0, end = this.waypoints.length; i < end; i++) {
	  this.waypoints[i].destroy();
	}
	this.waypoints = [];
  };

  Inview.prototype.disable = function () {
	for (var i = 0, end = this.waypoints.length; i < end; i++) {
	  this.waypoints[i].disable();
	}
  };

  Inview.prototype.enable = function () {
	for (var i = 0, end = this.waypoints.length; i < end; i++) {
	  this.waypoints[i].enable();
	}
  };

  Inview.defaults = {
	context: window,
	enabled: true,
	enter: noop,
	entered: noop,
	exit: noop,
	exited: noop
  };

  Waypoint.Inview = Inview;
})();
'use strict';

(function ($) {

	'use strict';

	var $legend = $('.section-business-lines-map .legend');

	var $maps = $('.section-business-lines-map .maps');

	$(window).load(function () {
		$maps.animate({ 'opacity': '1' }, 500);
	});

	//close card when click on cross
	$legend.on('hover', 'button', function () {

		if ($('body').hasClass('is-reveal-open')) {
			return;
		}

		var id = $(this).data('map');
		if ($(id).css('opacity') == 0) {
			$('.map').stop().removeClass('active').not(id).animate({ 'opacity': '0' }, 100);
			$(id).stop().animate({ 'opacity': '1' }, 100);
		}
	});

	$legend.on('click', 'button', function () {
		$('.map').stop().removeClass('active');
		var id = $(this).data('map');
		if ($(id).css('opacity') == 0) {
			$('.map').stop().not(id).css({ 'opacity': '0' });
			$(id).stop().css({ 'opacity': '1' });
		}

		$(id).addClass('active');
	});

	$legend.mouseleave(function () {

		if ($('body').hasClass('is-reveal-open')) {
			return;
		}

		$('.map').stop().removeClass('active').animate({ 'opacity': '0' }, 100);
		$('#map-0').stop().animate({ 'opacity': '1' }, 100);
	});
})(jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	if ($('.page-template-careers').length) {
		var searchParams = new URLSearchParams(window.location.search);
		if (searchParams.has('search')) {
			var param = searchParams.get('search');
			if (param === 'true') {
				$("html, body").animate({ scrollTop: $('#careers-root').offset().top - 35 }, 1000);
				$("main section:not('.careers-section')").fadeOut();
			}
		}

		window.reactMatchHeight = function (elClassName) {
			$('.careers-section .column h3').matchHeight({ row: true });
		};
	}
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	// Open external links in new window (exclue scv image maps, email, tel and foobox)

	$('a').not('svg a, [href*="tel:"], [class*="foobox"]').each(function () {
		var isInternalLink = new RegExp('/' + window.location.host + '/');
		if (!isInternalLink.test(this.href)) {
			$(this).attr('target', '_blank');
		}
	});

	$('a[href*=".pdf"]').attr('target', '_blank');
})(document, window, jQuery);
'use strict';

(function ($) {
	$(document).on('facetwp-loaded', function () {
		if (FWP.loaded) {
			var target = $('.facetwp-template');
			var offset = -150;

			if ($('.facetwp-filters').length) {
				var target = $('.facetwp-filters');
			} else if ($('.facetwp-custom-filters').length) {
				var target = $('.facetwp-custom-filters');
				offset = -60;
			}

			$.smoothScroll({
				scrollTarget: target,
				offset: offset
			});

			$('#book-filters').foundation('close');

			Foundation.reInit('equalizer');
		}
	});
})(jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	var didScroll;
	var lastScrollTop = 0;
	var delta = 200;
	var navbarHeight = $('.site-header').outerHeight();

	$(window).scroll(function (event) {
		didScroll = true;
	});

	setInterval(function () {
		if (didScroll) {
			hasScrolled();
			didScroll = false;
		}
	}, 250);

	function hasScrolled() {
		var st = $(window).scrollTop();

		// Make scroll more than delta
		if (Math.abs(lastScrollTop - st) <= delta) {
			return;
		}

		// If scrolled down and past the navbar, add class .nav-up.
		if (st > lastScrollTop) {
			// Scroll Down
			if (st > navbarHeight) {
				$('.site-header').addClass('fixed').removeClass('nav-down').addClass('nav-up shrink');
			}
		} else {
			// Scroll Up
			if (delta + navbarHeight + st + $(window).height() < $(document).height()) {

				$('.site-header').removeClass('nav-up').addClass('nav-down');
			}
		}

		if (st <= delta + navbarHeight) {
			$('.site-header').removeClass('fixed nav-down shrink');
		}

		lastScrollTop = st;
	}
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	// Load Foundation

	$(document).foundation();

	$('body').addClass('document-ready');

	$('.scroll-next').on('click', function (e) {

		$.smoothScroll({
			offset: -100,
			scrollTarget: $('main section:first-child')
		});
	});

	// Toggle menu

	$('li.menu-item-has-children > a[href^="#"]').on('click', function (e) {

		var $toggle = $(this).parent().find('.sub-menu-toggle');

		if ($toggle.is(':visible')) {
			$toggle.trigger('click');
			e.preventDefault();
		}
	});

	$(window).scroll(animateNumbers);

	$(window).on("load scroll", function (e) {
		animateNumbers();
	});
	var viewed = false;

	function isScrolledIntoView(elem) {

		if (!$(elem).length) {
			return false;
		}

		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();

		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();

		return elemBottom <= docViewBottom && elemTop >= docViewTop;
	}

	function animateNumbers() {
		if (isScrolledIntoView($(".numbers")) && !viewed) {
			viewed = true;
			$('.number').each(function () {
				$(this).css('opacity', 1);
				$(this).prop('Counter', 0).animate({
					Counter: $(this).text().replace(/,/g, '')
				}, {
					duration: 4000,
					easing: 'swing',
					step: function step(now) {
						$(this).text(Math.ceil(now).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
					}
				});
			});
		}
	}

	$('.ul-expand').each(function () {
		if ($(this).find('li:visible').length) {
			$(this).find('span a').show();
		}
	});

	$('.ul-expand').on('click', 'span a', function (e) {
		e.preventDefault();
		//var $children = $(this).prev('ul').children();

		//$children.css('display', 'inline');
		//return false;
		$(this).parents('div').find('ul').removeClass('short');
		$(this).remove();
	});
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	// Replace all SVG images with inline SVG (use as needed so you can set hover fills)

	$('img.svg').each(function () {
		var $img = jQuery(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');

		$.get(imgURL, function (data) {
			// Get the SVG tag, ignore the rest
			var $svg = jQuery(data).find('svg');

			// Add replaced image's ID to the new SVG
			if (typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			// Add replaced image's classes to the new SVG
			if (typeof imgClass !== 'undefined') {
				$svg = $svg.attr('class', imgClass + ' replaced-svg');
			}

			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');

			// Replace image with new SVG
			$img.replaceWith($svg);
		}, 'xml');
	});
})(document, window, jQuery);
'use strict';

(function ($) {

  'use strict';

  var $column = $('.section-leadership .grid .column');

  //open and close column
  $column.find('.js-expander .open, .js-expander .thumbnail').click(function () {

	var $thisColumn = $(this).closest('.column');

	if ($thisColumn.hasClass('is-collapsed')) {
	  // siblings remove open class and add closed classes
	  $column.not($thisColumn).removeClass('is-expanded').addClass('is-collapsed is-inactive');
	  // remove closed classes, add pen class
	  $thisColumn.removeClass('is-collapsed is-inactive').addClass('is-expanded');

	  if ($column.not($thisColumn).hasClass('is-inactive')) {
		//do nothing
	  } else {
		$column.not($thisColumn).addClass('is-inactive');
	  }

	  var offset = 0;
	  if (Foundation.MediaQuery.atLeast('xlarge')) {
		var offset = -100;
	  }

	  $.smoothScroll({
		scrollTarget: $thisColumn,
		//offset: offset,
		beforeScroll: function beforeScroll() {
		  $('.site-header').addClass('nav-up');
		}
	  });
	} else {
	  $thisColumn.removeClass('is-expanded').addClass('is-collapsed');
	  $column.not($thisColumn).removeClass('is-inactive');
	}
  });

  //close card when click on cross
  $column.find('.js-collapser').click(function () {

	var $thisColumn = $(this).parents('.column__expander').closest('.column');

	$thisColumn.removeClass('is-expanded').addClass('is-collapsed is-inactive');
	$column.not($thisColumn).removeClass('is-inactive');
  });
})(jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	$('#loginform :input, #passwordform :input').each(function () {
		var label = $(this).parent().find('label').text();
		$(this).attr('placeholder', label);
	});
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	$(document).on('click', '.play-video', playVideo);

	function playVideo() {

		// Stop all background videos
		if ($('.background-video video').size()) {
			$('.background-video video')[0].pause();
		}

		var $this = $(this);

		var url = $this.data('src');

		var $modal = $('#' + $this.data('open'));

		/*
		$.ajax(url)
		  .done(function(resp){
			$modal.find('.flex-video').html(resp).foundation('open');
		});
		*/

		var $iframe = $('<iframe>', {
			src: url,
			id: 'video',
			frameborder: 0,
			scrolling: 'no'
		});

		$iframe.appendTo('.video-placeholder', $modal);
	}

	// Make sure videos don't play in background
	$(document).on('closed.zf.reveal', '#modal-video', function () {
		$(this).find('.video-placeholder').html('');
		if ($('.background-video video').size()) {
			$('.background-video video')[0].play();
		}
	});
})(document, window, jQuery);
'use strict';

(function ($) {

	'use strict';

	var getLastSiblingInRow = function getLastSiblingInRow(element) {
		var candidate = element,
			elementTop = element.offsetTop;

		// Loop through the element’s next siblings and look for the first one which
		// is positioned further down the page.
		while (candidate.nextElementSibling !== null) {
			if (candidate.nextElementSibling.offsetTop > elementTop) {
				return candidate;
			}
			candidate = candidate.nextElementSibling;
		}
		return candidate;
	};

	var $grid = $('.section-businesses .grid');
	var $column = $('.section-businesses .grid > .column');

	//open and close column
	$column.find('.js-expander .open, .js-expander .thumbnail').click(function () {

		var $thisColumn = $(this).closest('.column');

		// Get last sibling in row
		var last = getLastSiblingInRow($thisColumn[0]);

		$('.details').remove();

		//console.log($(last).index());
		$thisColumn.find('.column__expander').clone().removeClass('hide').wrap('<div class="details" />').parent().insertAfter($(last));

		if ($thisColumn.hasClass('is-collapsed')) {
			// siblings remove open class and add closed classes
			$column.not($thisColumn).removeClass('is-expanded').addClass('is-collapsed is-inactive');
			// remove closed classes, add pen class
			$thisColumn.removeClass('is-collapsed is-inactive').addClass('is-expanded');

			if ($column.not($thisColumn).hasClass('is-inactive')) {
				//do nothing
			} else {
				$column.not($thisColumn).addClass('is-inactive');
			}

			var offset = 0;
			if (Foundation.MediaQuery.atLeast('xlarge')) {
				var offset = -100;
			}

			$.smoothScroll({
				scrollTarget: $thisColumn,
				//offset: offset,
				beforeScroll: function beforeScroll() {
					$('.site-header').addClass('nav-up');
				}
			});
		} else {
			$thisColumn.removeClass('is-expanded').addClass('is-collapsed');
			$column.not($thisColumn).removeClass('is-inactive');
		}
	});

	//close card when click on cross
	$grid.on('click', '.close', function () {
		$grid.find('.details').remove();
		$column.removeClass('is-expanded').addClass('is-collapsed is-inactive');
	});

	$(window).resize(function () {
		$grid.find('.details').remove();
		$column.removeClass('is-expanded').addClass('is-collapsed is-inactive');
	});
})(jQuery);
"use strict";

(function (document, window, $) {

	'use strict';

	$(".lazy").recliner({
		attrib: "data-src", // selector for attribute containing the media src
		throttle: 300, // millisecond interval at which to process events
		threshold: 100, // scroll distance from element before its loaded
		printable: true, // be printer friendly and show all elements on document print
		live: true // auto bind lazy loading to ajax loaded elements
	});

	$(document).on('lazyload', '.lazy', function () {
		var $e = $(this);
		// do something with the element to be loaded...
		// console.log('lazyload', $e);
	});
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	$('.page-template-regions #map-box img').on('click', function (e) {
		var offset = $(this).offset();
		var x = Math.floor((e.pageX - offset.left) / $(this).width() * 10000) / 100;
		var y = Math.floor((e.pageY - offset.top) / $(this).height() * 10000) / 100;

		$('#mouse-xy').val(x + '/' + y);
	});

	$(".map-key button").hover(function () {
		$('#map-box button').removeClass("hover");
		var id = $(this).data('marker');
		$(id).addClass('hover');
	}, function () {
		$('#map-box button').removeClass("hover");
	});

	$('.page-template-regions #map-box button').on('click', function (e) {
		//$(this).addClass('hover');
	});

	$('.page-template-regions .map-key button').on('click', function (e) {
		var id = $(this).data('marker');
		//$(id).addClass('hover');
	});

	$(window).load(function () {
		$('.page-template-regions #map-box .locations').css('opacity', 1);
	});
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	// Responsive video embeds

	var $all_oembed_videos = $("iframe[src*='youtube'], iframe[src*='vimeo']");

	$all_oembed_videos.each(function () {

		var _this = $(this);

		if (_this.parent('.embed-container').length === 0) {
			_this.wrap('<div class="embed-container"></div>');
		}

		_this.removeAttr('height').removeAttr('width');
	});
})(document, window, jQuery);
'use strict';

// Reveal
(function (document, window, $) {

	'use strict';

	$(document).on('click', '.page-template-regions button[data-region]', loadRegion);

	function loadRegion() {
		var $this = $(this);
		var $region = $('#' + $this.data('region'));
		var $modal = $('#' + $this.data('open'));

		if ($region.size()) {
			$('.container', $modal).html($region.html());
		}
	}

	$(document).on('closed.zf.reveal', '#regions', function () {
		$(this).find('.container').empty();
		// remove action button class
		$('#map-box button').removeClass("hover");
	});

	$(document).on('click', '.template-business-lines button[data-content]', loadMap);

	function loadMap() {
		var $this = $(this);
		var $map = $('#' + $this.data('content'));
		var $modal = $('#' + $this.data('open'));

		if ($map.size()) {
			$('.container', $modal).html($map.html());
		}
	}

	$(document).on('closed.zf.reveal', '#maps', function () {
		$(this).find('.container').empty();
		$('.map').stop().removeClass('active').css({ 'opacity': '0' });
		$('#map-0').stop().css({ 'opacity': '1' });
	});

	$(document).on('click', '.template-portfolio-land-resources button[data-project]', loadProject);

	function loadProject() {
		var $this = $(this);
		var $project = $('#' + $this.data('project'));
		var $modal = $('#' + $this.data('open'));

		if ($project.size()) {
			$('.container', $modal).html($project.html());
		}
	}

	$(document).on('closed.zf.reveal', '#projects', function () {
		$(this).find('.container').empty();
	});
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

  'use strict';

  $(document).on('open.zf.reveal', '#modal-search', function () {
	$(this).find("input").first().focus();
  });
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

  'use strict';

  var $section_videos = $('.section-videos');
  if ($('.slick', $section_videos).length) {

	$('<div class="slick-arrows"></div>').insertAfter('.section-videos .slick');

	$('.section-videos').imagesLoaded({ background: '.background' }).done(function (instance) {

	  $('.section-videos .slick').slick({
		dots: false,
		infinite: true,
		speed: 300,
		slidesToShow: 2,
		slidesToScroll: 2,
		appendArrows: $('.section-videos .slick-arrows'),
		responsive: [{
		  breakpoint: 979,
		  settings: {
			slidesToShow: 1,
			slidesToScroll: 1
		  }
		}]
	  });

	  $section_videos.addClass('images-loaded');
	});
  }

  var $section_stories = $('.section-stories');
  if ($('.slick', $section_stories).length) {

	$('.section-stories').imagesLoaded({ background: 'a' }).done(function (instance) {

	  $('<div class="slick-arrows"></div>').insertAfter('.section-stories .slick');

	  $('.section-stories .slick').slick({
		dots: false,
		infinite: true,
		speed: 300,
		slidesToShow: 1,
		slidesToScroll: 1,
		appendArrows: $('.section-stories .slick-arrows')
	  });

	  $section_stories.addClass('images-loaded');
	});
  }

  var $singlePostSlider = $('.single-post .slider');
  if ($('.slick', $singlePostSlider).length) {

	$singlePostSlider.imagesLoaded({ background: true }).done(function (instance) {

	  $('.slick', $singlePostSlider).slick({
		dots: false,
		infinite: true,
		speed: 300,
		slidesToShow: 1,
		slidesToScroll: 1,
		appendArrows: $('.slick-arrows', $singlePostSlider)
	  });

	  $singlePostSlider.addClass('images-loaded');
	});
  }

  $('<div class="slick-arrows"></div>').insertAfter('.section-core-behaviors .slick');

  $('.section-core-behaviors .slick').slick({
	fade: true,
	dots: true,
	infinite: true,
	speed: 300,
	slidesToShow: 1,
	slidesToScroll: 1,
	adaptiveHeight: false,
	appendArrows: $('.section-core-behaviors .slick-arrows')
  });

  $('.section-core-behaviors .grid').on('click', '.grid-item', function (e) {
	e.preventDefault();
	var slideIndex = $(this).parent().index();
	$('.section-core-behaviors .slick').slick('slickGoTo', parseInt(slideIndex));
  });

  // Related Posts

  var $section_related_posts = $('.section-related-posts');
  if ($('.slick', $section_related_posts).length) {

	//$( '<div class="slick-arrows"></div>' ).insertAfter( '.section-related-posts .slick' );

	$('.section-related-posts').imagesLoaded({ background: '.post-hero' }).done(function (instance) {

	  $('<div class="column row slick-arrows"></div>').insertAfter('.section-related-posts .slick');

	  $('.section-related-posts .slick').slick({
		dots: false,
		infinite: true,
		speed: 300,
		slidesToShow: 4,
		slidesToScroll: 1,
		appendArrows: $('.section-related-posts .slick-arrows'),
		responsive: [{
		  breakpoint: 1200,
		  settings: {
			slidesToShow: 3,
			slidesToScroll: 1
		  }
		}, {
		  breakpoint: 980,
		  settings: {
			slidesToShow: 2,
			slidesToScroll: 1
		  }
		}, {
		  breakpoint: 480,
		  settings: {
			slidesToShow: 1,
			slidesToScroll: 1
		  }
		  // You can unslick at a given breakpoint now by adding:
		  // settings: "unslick"
		  // instead of a settings object
		}]
	  });

	  $section_related_posts.addClass('images-loaded');
	});
  }

  var $section_testimonials = $('.section-testimonials');
  if ($('.slick', $section_testimonials).length) {

	$('<div class="slick-arrows"></div>').insertAfter('.section-testimonials .slick');

	$('.section-testimonials').imagesLoaded().done(function (instance) {

	  $('<div class="slick-arrows"></div>').insertAfter('.section-testimonials .slick');
	  $('.section-testimonials .slick').slick({
		dots: false,
		arrows: true,
		infinite: true,
		speed: 300,
		slidesToShow: 1,
		slidesToScroll: 1,
		appendArrows: $('.section-testimonials .slick-arrows')
	  });

	  $section_testimonials.addClass('images-loaded');
	});
  }
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	function hide_header_menu(menu) {

		var mainMenuButtonClass = 'menu-toggle',
			responsiveMenuClass = 'genesis-responsive-menu';

		$(menu + ' .' + mainMenuButtonClass + ',' + menu + ' .' + responsiveMenuClass + ' .sub-menu-toggle').removeClass('activated').attr('aria-expanded', false).attr('aria-pressed', false);

		$(menu + ' .' + responsiveMenuClass + ',' + menu + ' .' + responsiveMenuClass + ' .sub-menu').attr('style', '');
	}

	var scrollnow = function scrollnow(e) {

		var target;

		// if scrollnow()-function was triggered by an event
		if (e) {
			e.preventDefault();
			target = this.hash;
		}
		// else it was called when page with a #hash was loaded
		else {
				target = location.hash;
			}

		// same page scroll
		$.smoothScroll({
			scrollTarget: target,
			beforeScroll: function beforeScroll() {
				$('.site-header').removeClass('fixed shrink nav-down');
			},
			afterScroll: function afterScroll() {
				$('.site-header').removeClass('fixed shrink nav-down');
				if ($(target).hasClass('type-people')) {
					$(target).find('.header').trigger('click');
				}
			}

		});
	};

	// if page has a #hash
	if (location.hash) {
		$('html, body').scrollTop(0).show();
		// smooth-scroll to hash
		scrollnow();
	}

	// for each <a>-element that contains a "/" and a "#"
	$('a[href*="/"][href*=#]').each(function () {
		// if the pathname of the href references the same page
		if (this.pathname.replace(/^\//, '') === location.pathname.replace(/^\//, '') && this.hostname === location.hostname) {
			// only keep the hash, i.e. do not keep the pathname
			$(this).attr("href", this.hash);
		}
	});

	// select all href-elements that start with #
	// including the ones that were stripped by their pathname just above
	$('body').on('click', 'a[href^=#]:not([href=#])', scrollnow);
})(document, window, jQuery);
"use strict";

(function (document, window, $) {

	   'use strict';

	   $(".js-superfish").superfish({
			  delay: 100,
			  //animation:{opacity:"show",height:"show"},
			  dropShadows: !1
	   });
})(document, window, jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImExMXktdG9nZ2xlLmpzIiwiZ2VuZXNpcy1yZXNwb25zaXZlLW1lbnUuanMiLCJob3ZlckludGVudC5qcyIsImltYWdlc2xvYWRlZC5wa2dkLmpzIiwianF1ZXJ5Lm1hdGNoSGVpZ2h0LmpzIiwianF1ZXJ5LnNtb290aC1zY3JvbGwuanMiLCJqcXVlcnkud2F5cG9pbnRzLmpzIiwicmVjbGluZXIuanMiLCJzbGljay5qcyIsInN1cGVyZmlzaC5qcyIsIndheXBvaW50cy5pbnZpZXcuanMiLCJidXNpbmVzcy1saW5lcy5qcyIsImNhcmVlcnMuanMiLCJleHRlcm5hbC1saW5rcy5qcyIsImZhY2V0d3AuanMiLCJmaXhlZC1oZWFkZXIuanMiLCJnZW5lcmFsLmpzIiwiaW5saW5lLXN2Zy5qcyIsImxlYWRlcnNoaXAuanMiLCJsb2dpbi5qcyIsIm1vZGFsLXZpZGVvLmpzIiwib3BlcmF0aW5nLWNvbXBhbmllcy5qcyIsInJlZ2lvbnMuanMiLCJyZXNwb25zaXZlLXZpZGVvLWVtYmVkcy5qcyIsInJldmVhbC5qcyIsInNlYXJjaC5qcyIsInNtb290aC1zY3JvbGwuanMiXSwibmFtZXMiOlsiaW50ZXJuYWxJZCIsInRvZ2dsZXNNYXAiLCJ0YXJnZXRzTWFwIiwiJCIsInNlbGVjdG9yIiwiY29udGV4dCIsIkFycmF5IiwicHJvdG90eXBlIiwic2xpY2UiLCJjYWxsIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZ2V0Q2xvc2VzdFRvZ2dsZSIsImVsZW1lbnQiLCJjbG9zZXN0Iiwibm9kZVR5cGUiLCJoYXNBdHRyaWJ1dGUiLCJwYXJlbnROb2RlIiwiaGFuZGxlVG9nZ2xlIiwidG9nZ2xlIiwidGFyZ2V0IiwiZ2V0QXR0cmlidXRlIiwidG9nZ2xlcyIsImlkIiwiaXNFeHBhbmRlZCIsInNldEF0dHJpYnV0ZSIsImZvckVhY2giLCJpbm5lckhUTUwiLCJpbml0QTExeVRvZ2dsZSIsInJlZHVjZSIsImFjYyIsInB1c2giLCJ0YXJnZXRzIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImxhYmVsbGVkYnkiLCJqb2luIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwid2hpY2giLCJ3aW5kb3ciLCJhMTF5VG9nZ2xlIiwidW5kZWZpbmVkIiwicmVtb3ZlQ2xhc3MiLCJnZW5lc2lzTWVudVBhcmFtcyIsImdlbmVzaXNfcmVzcG9uc2l2ZV9tZW51IiwiZ2VuZXNpc01lbnVzVW5jaGVja2VkIiwibWVudUNsYXNzZXMiLCJnZW5lc2lzTWVudXMiLCJtZW51c1RvQ29tYmluZSIsImVhY2giLCJncm91cCIsImtleSIsInZhbHVlIiwibWVudVN0cmluZyIsIiRtZW51IiwibmV3U3RyaW5nIiwiYWRkQ2xhc3MiLCJyZXBsYWNlIiwib3RoZXJzIiwiY29tYmluZSIsImdlbmVzaXNNZW51IiwibWFpbk1lbnVCdXR0b25DbGFzcyIsInN1Yk1lbnVCdXR0b25DbGFzcyIsInJlc3BvbnNpdmVNZW51Q2xhc3MiLCJpbml0IiwiX2dldEFsbE1lbnVzQXJyYXkiLCJtZW51SWNvbkNsYXNzIiwic3ViTWVudUljb25DbGFzcyIsInRvZ2dsZUJ1dHRvbnMiLCJtZW51IiwiYXBwZW5kIiwibWFpbk1lbnUiLCJzdWJtZW51Iiwic3ViTWVudSIsIl9hZGRSZXNwb25zaXZlTWVudUNsYXNzIiwiX2FkZE1lbnVCdXR0b25zIiwib24iLCJfbWFpbm1lbnVUb2dnbGUiLCJfYWRkQ2xhc3NJRCIsIl9zdWJtZW51VG9nZ2xlIiwiX2RvUmVzaXplIiwidHJpZ2dlckhhbmRsZXIiLCJfZ2V0TWVudVNlbGVjdG9yU3RyaW5nIiwiZmluZCIsImJlZm9yZSIsIm1lbnVzVG9Ub2dnbGUiLCJjb25jYXQiLCJidXR0b25zIiwiYXR0ciIsIl9tYXliZUNsb3NlIiwiX3N1cGVyZmlzaFRvZ2dsZSIsIl9jaGFuZ2VTa2lwTGluayIsIl9jb21iaW5lTWVudXMiLCIkdGhpcyIsIm5hdiIsIm5leHQiLCJtYXRjaCIsInByaW1hcnlNZW51IiwiY29tYmluZWRNZW51cyIsImZpbHRlciIsImluZGV4IiwiX2dldERpc3BsYXlWYWx1ZSIsImFwcGVuZFRvIiwiaGlkZSIsInNob3ciLCJfdG9nZ2xlQXJpYSIsInRvZ2dsZUNsYXNzIiwic2xpZGVUb2dnbGUiLCJzaWJsaW5ncyIsInNsaWRlVXAiLCJfc3VwZXJmaXNoIiwiJGFyZ3MiLCJzdXBlcmZpc2giLCJtZW51VG9nZ2xlTGlzdCIsIm5ld1ZhbHVlIiwic3RhcnRMaW5rIiwiZW5kTGluayIsIiRpdGVtIiwibGluayIsIiRpZCIsImdldEVsZW1lbnRCeUlkIiwic3R5bGUiLCJnZXRDb21wdXRlZFN0eWxlIiwiZ2V0UHJvcGVydHlWYWx1ZSIsImF0dHJpYnV0ZSIsIml0ZW1BcnJheSIsIml0ZW1TdHJpbmciLCJtYXAiLCJtZW51TGlzdCIsInZhbHVlT2YiLCJyZWFkeSIsImpRdWVyeSIsImZuIiwiaG92ZXJJbnRlbnQiLCJoYW5kbGVySW4iLCJoYW5kbGVyT3V0IiwiY2ZnIiwiaW50ZXJ2YWwiLCJzZW5zaXRpdml0eSIsInRpbWVvdXQiLCJleHRlbmQiLCJpc0Z1bmN0aW9uIiwib3ZlciIsIm91dCIsImNYIiwiY1kiLCJwWCIsInBZIiwidHJhY2siLCJldiIsInBhZ2VYIiwicGFnZVkiLCJjb21wYXJlIiwib2IiLCJob3ZlckludGVudF90IiwiY2xlYXJUaW1lb3V0IiwiTWF0aCIsImFicyIsIm9mZiIsImhvdmVySW50ZW50X3MiLCJhcHBseSIsInNldFRpbWVvdXQiLCJkZWxheSIsImhhbmRsZUhvdmVyIiwiZSIsInR5cGUiLCJnbG9iYWwiLCJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwibW9kdWxlIiwiZXhwb3J0cyIsIkV2RW1pdHRlciIsInByb3RvIiwiZXZlbnROYW1lIiwibGlzdGVuZXIiLCJldmVudHMiLCJfZXZlbnRzIiwibGlzdGVuZXJzIiwiaW5kZXhPZiIsIm9uY2UiLCJvbmNlRXZlbnRzIiwiX29uY2VFdmVudHMiLCJvbmNlTGlzdGVuZXJzIiwic3BsaWNlIiwiZW1pdEV2ZW50IiwiYXJncyIsImkiLCJpc09uY2UiLCJhbGxPZmYiLCJyZXF1aXJlIiwiaW1hZ2VzTG9hZGVkIiwiY29uc29sZSIsImEiLCJiIiwicHJvcCIsImFycmF5U2xpY2UiLCJtYWtlQXJyYXkiLCJvYmoiLCJpc0FycmF5IiwiaXNBcnJheUxpa2UiLCJJbWFnZXNMb2FkZWQiLCJlbGVtIiwib3B0aW9ucyIsIm9uQWx3YXlzIiwicXVlcnlFbGVtIiwiZXJyb3IiLCJlbGVtZW50cyIsImdldEltYWdlcyIsImpxRGVmZXJyZWQiLCJEZWZlcnJlZCIsImNoZWNrIiwiYmluZCIsImNyZWF0ZSIsImltYWdlcyIsImFkZEVsZW1lbnRJbWFnZXMiLCJub2RlTmFtZSIsImFkZEltYWdlIiwiYmFja2dyb3VuZCIsImFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzIiwiZWxlbWVudE5vZGVUeXBlcyIsImNoaWxkSW1ncyIsImltZyIsImNoaWxkcmVuIiwiY2hpbGQiLCJyZVVSTCIsIm1hdGNoZXMiLCJleGVjIiwiYmFja2dyb3VuZEltYWdlIiwidXJsIiwiYWRkQmFja2dyb3VuZCIsImxvYWRpbmdJbWFnZSIsIkxvYWRpbmdJbWFnZSIsIkJhY2tncm91bmQiLCJfdGhpcyIsInByb2dyZXNzZWRDb3VudCIsImhhc0FueUJyb2tlbiIsImNvbXBsZXRlIiwib25Qcm9ncmVzcyIsImltYWdlIiwibWVzc2FnZSIsInByb2dyZXNzIiwiaXNMb2FkZWQiLCJub3RpZnkiLCJkZWJ1ZyIsImxvZyIsImlzQ29tcGxldGUiLCJqcU1ldGhvZCIsImdldElzSW1hZ2VDb21wbGV0ZSIsImNvbmZpcm0iLCJuYXR1cmFsV2lkdGgiLCJwcm94eUltYWdlIiwiSW1hZ2UiLCJzcmMiLCJoYW5kbGVFdmVudCIsIm1ldGhvZCIsIm9ubG9hZCIsInVuYmluZEV2ZW50cyIsIm9uZXJyb3IiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwibWFrZUpRdWVyeVBsdWdpbiIsImNhbGxiYWNrIiwiaW5zdGFuY2UiLCJwcm9taXNlIiwiX3ByZXZpb3VzUmVzaXplV2lkdGgiLCJfdXBkYXRlVGltZW91dCIsIl9wYXJzZSIsInBhcnNlRmxvYXQiLCJfcm93cyIsInRvbGVyYW5jZSIsIiRlbGVtZW50cyIsImxhc3RUb3AiLCJyb3dzIiwiJHRoYXQiLCJ0b3AiLCJvZmZzZXQiLCJjc3MiLCJsYXN0Um93IiwiZmxvb3IiLCJhZGQiLCJfcGFyc2VPcHRpb25zIiwib3B0cyIsImJ5Um93IiwicHJvcGVydHkiLCJyZW1vdmUiLCJtYXRjaEhlaWdodCIsInRoYXQiLCJfZ3JvdXBzIiwibm90IiwiX2FwcGx5IiwidmVyc2lvbiIsIl90aHJvdHRsZSIsIl9tYWludGFpblNjcm9sbCIsIl9iZWZvcmVVcGRhdGUiLCJfYWZ0ZXJVcGRhdGUiLCJzY3JvbGxUb3AiLCJodG1sSGVpZ2h0Iiwib3V0ZXJIZWlnaHQiLCIkaGlkZGVuUGFyZW50cyIsInBhcmVudHMiLCJkYXRhIiwiZGlzcGxheSIsInJvdyIsIiRyb3ciLCJ0YXJnZXRIZWlnaHQiLCJ2ZXJ0aWNhbFBhZGRpbmciLCJpcyIsIl9hcHBseURhdGFBcGkiLCJncm91cHMiLCJncm91cElkIiwiX3VwZGF0ZSIsInRocm90dGxlIiwid2luZG93V2lkdGgiLCJ3aWR0aCIsIm9wdGlvbk92ZXJyaWRlcyIsImRlZmF1bHRzIiwiZXhjbHVkZSIsImV4Y2x1ZGVXaXRoaW4iLCJkaXJlY3Rpb24iLCJkZWxlZ2F0ZVNlbGVjdG9yIiwic2Nyb2xsRWxlbWVudCIsInNjcm9sbFRhcmdldCIsImF1dG9Gb2N1cyIsImJlZm9yZVNjcm9sbCIsImFmdGVyU2Nyb2xsIiwiZWFzaW5nIiwic3BlZWQiLCJhdXRvQ29lZmZpY2llbnQiLCJwcmV2ZW50RGVmYXVsdCIsImdldFNjcm9sbGFibGUiLCJzY3JvbGxhYmxlIiwic2Nyb2xsZWQiLCJkaXIiLCJlbCIsInNjcm9sbGluZ0VsZW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJib2R5IiwiclJlbGF0aXZlIiwic2NybCIsInB1c2hTdGFjayIsImZpcnN0U2Nyb2xsYWJsZSIsInNtb290aFNjcm9sbCIsImV4dHJhIiwiZmlyc3QiLCJjbGlja0hhbmRsZXIiLCJlc2NhcGVTZWxlY3RvciIsInN0ciIsIiRsaW5rIiwidGhpc09wdHMiLCJlbENvdW50ZXIiLCJld2xDb3VudGVyIiwiaW5jbHVkZSIsImNsaWNrT3B0cyIsImxvY2F0aW9uUGF0aCIsImZpbHRlclBhdGgiLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwibGlua1BhdGgiLCJob3N0TWF0Y2giLCJob3N0bmFtZSIsInBhdGhNYXRjaCIsInRoaXNIYXNoIiwiaGFzaCIsImdldEV4cGxpY2l0T2Zmc2V0IiwidmFsIiwiZXhwbGljaXQiLCJyZWxhdGl2ZSIsInBhcnRzIiwicHgiLCJvbkFmdGVyU2Nyb2xsIiwiJHRndCIsImZvY3VzIiwiYWN0aXZlRWxlbWVudCIsInRhYkluZGV4IiwiJHNjcm9sbGVyIiwiZGVsdGEiLCJleHBsaWNpdE9mZnNldCIsInNjcm9sbFRhcmdldE9mZnNldCIsInNjcm9sbGVyT2Zmc2V0Iiwib2ZmUG9zIiwic2Nyb2xsRGlyIiwiYW5pUHJvcHMiLCJhbmlPcHRzIiwidGVzdCIsImR1cmF0aW9uIiwic3RlcCIsInN0b3AiLCJhbmltYXRlIiwic3RyaW5nIiwia2V5Q291bnRlciIsImFsbFdheXBvaW50cyIsIldheXBvaW50IiwiRXJyb3IiLCJoYW5kbGVyIiwiQWRhcHRlciIsImFkYXB0ZXIiLCJheGlzIiwiaG9yaXpvbnRhbCIsImVuYWJsZWQiLCJ0cmlnZ2VyUG9pbnQiLCJHcm91cCIsImZpbmRPckNyZWF0ZSIsIm5hbWUiLCJDb250ZXh0IiwiZmluZE9yQ3JlYXRlQnlFbGVtZW50Iiwib2Zmc2V0QWxpYXNlcyIsInF1ZXVlVHJpZ2dlciIsInRyaWdnZXIiLCJkZXN0cm95IiwiZGlzYWJsZSIsImVuYWJsZSIsInJlZnJlc2giLCJwcmV2aW91cyIsImludm9rZUFsbCIsImFsbFdheXBvaW50c0FycmF5Iiwid2F5cG9pbnRLZXkiLCJlbmQiLCJkZXN0cm95QWxsIiwiZGlzYWJsZUFsbCIsImVuYWJsZUFsbCIsInJlZnJlc2hBbGwiLCJ2aWV3cG9ydEhlaWdodCIsImlubmVySGVpZ2h0IiwiY2xpZW50SGVpZ2h0Iiwidmlld3BvcnRXaWR0aCIsImNsaWVudFdpZHRoIiwiYWRhcHRlcnMiLCJjb250aW51b3VzIiwiaW5uZXJXaWR0aCIsIm91dGVyV2lkdGgiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWVTaGltIiwiY29udGV4dHMiLCJvbGRXaW5kb3dMb2FkIiwiZGlkU2Nyb2xsIiwiZGlkUmVzaXplIiwib2xkU2Nyb2xsIiwieCIsInNjcm9sbExlZnQiLCJ5Iiwid2F5cG9pbnRzIiwidmVydGljYWwiLCJ3YXlwb2ludENvbnRleHRLZXkiLCJ3aW5kb3dDb250ZXh0IiwiY3JlYXRlVGhyb3R0bGVkU2Nyb2xsSGFuZGxlciIsImNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIiLCJ3YXlwb2ludCIsImNoZWNrRW1wdHkiLCJob3Jpem9udGFsRW1wdHkiLCJpc0VtcHR5T2JqZWN0IiwidmVydGljYWxFbXB0eSIsImlzV2luZG93Iiwic2VsZiIsInJlc2l6ZUhhbmRsZXIiLCJoYW5kbGVSZXNpemUiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzY3JvbGxIYW5kbGVyIiwiaGFuZGxlU2Nyb2xsIiwiaXNUb3VjaCIsInRyaWdnZXJlZEdyb3VwcyIsImF4ZXMiLCJuZXdTY3JvbGwiLCJmb3J3YXJkIiwiYmFja3dhcmQiLCJheGlzS2V5IiwiaXNGb3J3YXJkIiwid2FzQmVmb3JlVHJpZ2dlclBvaW50Iiwibm93QWZ0ZXJUcmlnZ2VyUG9pbnQiLCJjcm9zc2VkRm9yd2FyZCIsImNyb3NzZWRCYWNrd2FyZCIsImdyb3VwS2V5IiwiZmx1c2hUcmlnZ2VycyIsImNvbnRleHRPZmZzZXQiLCJsZWZ0IiwiY29udGV4dFNjcm9sbCIsImNvbnRleHREaW1lbnNpb24iLCJvZmZzZXRQcm9wIiwiYWRqdXN0bWVudCIsIm9sZFRyaWdnZXJQb2ludCIsImVsZW1lbnRPZmZzZXQiLCJmcmVzaFdheXBvaW50IiwiY29udGV4dE1vZGlmaWVyIiwid2FzQmVmb3JlU2Nyb2xsIiwibm93QWZ0ZXJTY3JvbGwiLCJ0cmlnZ2VyZWRCYWNrd2FyZCIsInRyaWdnZXJlZEZvcndhcmQiLCJjZWlsIiwiZmluZEJ5RWxlbWVudCIsImNvbnRleHRJZCIsInJlcXVlc3RGbiIsIm1velJlcXVlc3RBbmltYXRpb25GcmFtZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsImJ5VHJpZ2dlclBvaW50IiwiYnlSZXZlcnNlVHJpZ2dlclBvaW50IiwiY2xlYXJUcmlnZ2VyUXVldWVzIiwidHJpZ2dlclF1ZXVlcyIsInVwIiwiZG93biIsInJpZ2h0IiwicmV2ZXJzZSIsInNvcnQiLCJpbkFycmF5IiwiaXNMYXN0IiwibGFzdCIsIkpRdWVyeUFkYXB0ZXIiLCIkZWxlbWVudCIsImFyZ3VtZW50cyIsImNyZWF0ZUV4dGVuc2lvbiIsImZyYW1ld29yayIsIm92ZXJyaWRlcyIsIlplcHRvIiwicmVjbGluZXIiLCIkdyIsImxvYWRlZCIsInRpbWVyIiwiYXR0cmliIiwidGhyZXNob2xkIiwicHJpbnRhYmxlIiwibGl2ZSIsImdldFNjcmlwdCIsImxvYWQiLCIkZSIsInNvdXJjZSIsInByb2Nlc3MiLCJoZWlnaHQiLCJlb2YiLCJzY3JvbGxZIiwib2Zmc2V0SGVpZ2h0IiwiaW52aWV3Iiwid3QiLCJ3YiIsImV0IiwiZWIiLCJlbHMiLCJvbmUiLCJtYXRjaE1lZGlhIiwiYWRkTGlzdGVuZXIiLCJtcWwiLCJkZXJlY2xpbmVyIiwiU2xpY2siLCJpbnN0YW5jZVVpZCIsInNldHRpbmdzIiwiXyIsImRhdGFTZXR0aW5ncyIsImFjY2Vzc2liaWxpdHkiLCJhZGFwdGl2ZUhlaWdodCIsImFwcGVuZEFycm93cyIsImFwcGVuZERvdHMiLCJhcnJvd3MiLCJhc05hdkZvciIsInByZXZBcnJvdyIsIm5leHRBcnJvdyIsImF1dG9wbGF5IiwiYXV0b3BsYXlTcGVlZCIsImNlbnRlck1vZGUiLCJjZW50ZXJQYWRkaW5nIiwiY3NzRWFzZSIsImN1c3RvbVBhZ2luZyIsInNsaWRlciIsInRleHQiLCJkb3RzIiwiZG90c0NsYXNzIiwiZHJhZ2dhYmxlIiwiZWRnZUZyaWN0aW9uIiwiZmFkZSIsImZvY3VzT25TZWxlY3QiLCJmb2N1c09uQ2hhbmdlIiwiaW5maW5pdGUiLCJpbml0aWFsU2xpZGUiLCJsYXp5TG9hZCIsIm1vYmlsZUZpcnN0IiwicGF1c2VPbkhvdmVyIiwicGF1c2VPbkZvY3VzIiwicGF1c2VPbkRvdHNIb3ZlciIsInJlc3BvbmRUbyIsInJlc3BvbnNpdmUiLCJydGwiLCJzbGlkZSIsInNsaWRlc1BlclJvdyIsInNsaWRlc1RvU2hvdyIsInNsaWRlc1RvU2Nyb2xsIiwic3dpcGUiLCJzd2lwZVRvU2xpZGUiLCJ0b3VjaE1vdmUiLCJ0b3VjaFRocmVzaG9sZCIsInVzZUNTUyIsInVzZVRyYW5zZm9ybSIsInZhcmlhYmxlV2lkdGgiLCJ2ZXJ0aWNhbFN3aXBpbmciLCJ3YWl0Rm9yQW5pbWF0ZSIsInpJbmRleCIsImluaXRpYWxzIiwiYW5pbWF0aW5nIiwiZHJhZ2dpbmciLCJhdXRvUGxheVRpbWVyIiwiY3VycmVudERpcmVjdGlvbiIsImN1cnJlbnRMZWZ0IiwiY3VycmVudFNsaWRlIiwiJGRvdHMiLCJsaXN0V2lkdGgiLCJsaXN0SGVpZ2h0IiwibG9hZEluZGV4IiwiJG5leHRBcnJvdyIsIiRwcmV2QXJyb3ciLCJzY3JvbGxpbmciLCJzbGlkZUNvdW50Iiwic2xpZGVXaWR0aCIsIiRzbGlkZVRyYWNrIiwiJHNsaWRlcyIsInNsaWRpbmciLCJzbGlkZU9mZnNldCIsInN3aXBlTGVmdCIsInN3aXBpbmciLCIkbGlzdCIsInRvdWNoT2JqZWN0IiwidHJhbnNmb3Jtc0VuYWJsZWQiLCJ1bnNsaWNrZWQiLCJhY3RpdmVCcmVha3BvaW50IiwiYW5pbVR5cGUiLCJhbmltUHJvcCIsImJyZWFrcG9pbnRzIiwiYnJlYWtwb2ludFNldHRpbmdzIiwiY3NzVHJhbnNpdGlvbnMiLCJmb2N1c3NlZCIsImludGVycnVwdGVkIiwiaGlkZGVuIiwicGF1c2VkIiwicG9zaXRpb25Qcm9wIiwicm93Q291bnQiLCJzaG91bGRDbGljayIsIiRzbGlkZXIiLCIkc2xpZGVzQ2FjaGUiLCJ0cmFuc2Zvcm1UeXBlIiwidHJhbnNpdGlvblR5cGUiLCJ2aXNpYmlsaXR5Q2hhbmdlIiwid2luZG93VGltZXIiLCJvcmlnaW5hbFNldHRpbmdzIiwibW96SGlkZGVuIiwid2Via2l0SGlkZGVuIiwiYXV0b1BsYXkiLCJwcm94eSIsImF1dG9QbGF5Q2xlYXIiLCJhdXRvUGxheUl0ZXJhdG9yIiwiY2hhbmdlU2xpZGUiLCJzZWxlY3RIYW5kbGVyIiwic2V0UG9zaXRpb24iLCJzd2lwZUhhbmRsZXIiLCJkcmFnSGFuZGxlciIsImtleUhhbmRsZXIiLCJodG1sRXhwciIsInJlZ2lzdGVyQnJlYWtwb2ludHMiLCJhY3RpdmF0ZUFEQSIsImFkZFNsaWRlIiwic2xpY2tBZGQiLCJtYXJrdXAiLCJhZGRCZWZvcmUiLCJ1bmxvYWQiLCJpbnNlcnRCZWZvcmUiLCJlcSIsImluc2VydEFmdGVyIiwicHJlcGVuZFRvIiwiZGV0YWNoIiwicmVpbml0IiwiYW5pbWF0ZUhlaWdodCIsImFuaW1hdGVTbGlkZSIsInRhcmdldExlZnQiLCJhbmltUHJvcHMiLCJhbmltU3RhcnQiLCJub3ciLCJhcHBseVRyYW5zaXRpb24iLCJkaXNhYmxlVHJhbnNpdGlvbiIsImdldE5hdlRhcmdldCIsInNsaWNrIiwic2xpZGVIYW5kbGVyIiwidHJhbnNpdGlvbiIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsInNsaWRlVG8iLCJidWlsZEFycm93cyIsInJlbW92ZUF0dHIiLCJidWlsZERvdHMiLCJkb3QiLCJnZXREb3RDb3VudCIsImJ1aWxkT3V0Iiwid3JhcEFsbCIsInBhcmVudCIsIndyYXAiLCJzZXR1cEluZmluaXRlIiwidXBkYXRlRG90cyIsInNldFNsaWRlQ2xhc3NlcyIsImJ1aWxkUm93cyIsImMiLCJuZXdTbGlkZXMiLCJudW1PZlNsaWRlcyIsIm9yaWdpbmFsU2xpZGVzIiwic2xpZGVzUGVyU2VjdGlvbiIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJjcmVhdGVFbGVtZW50IiwiZ2V0IiwiYXBwZW5kQ2hpbGQiLCJlbXB0eSIsImNoZWNrUmVzcG9uc2l2ZSIsImluaXRpYWwiLCJmb3JjZVVwZGF0ZSIsImJyZWFrcG9pbnQiLCJ0YXJnZXRCcmVha3BvaW50IiwicmVzcG9uZFRvV2lkdGgiLCJ0cmlnZ2VyQnJlYWtwb2ludCIsInNsaWRlcldpZHRoIiwibWluIiwiaGFzT3duUHJvcGVydHkiLCJ1bnNsaWNrIiwiZG9udEFuaW1hdGUiLCIkdGFyZ2V0IiwiY3VycmVudFRhcmdldCIsImluZGV4T2Zmc2V0IiwidW5ldmVuT2Zmc2V0IiwiY2hlY2tOYXZpZ2FibGUiLCJuYXZpZ2FibGVzIiwicHJldk5hdmlnYWJsZSIsImdldE5hdmlnYWJsZUluZGV4ZXMiLCJuIiwiY2xlYW5VcEV2ZW50cyIsImludGVycnVwdCIsInZpc2liaWxpdHkiLCJjbGVhblVwU2xpZGVFdmVudHMiLCJvcmllbnRhdGlvbkNoYW5nZSIsInJlc2l6ZSIsImNsZWFuVXBSb3dzIiwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIiwic3RvcFByb3BhZ2F0aW9uIiwiZmFkZVNsaWRlIiwic2xpZGVJbmRleCIsIm9wYWNpdHkiLCJmYWRlU2xpZGVPdXQiLCJmaWx0ZXJTbGlkZXMiLCJzbGlja0ZpbHRlciIsImZvY3VzSGFuZGxlciIsIiRzZiIsImdldEN1cnJlbnQiLCJzbGlja0N1cnJlbnRTbGlkZSIsImJyZWFrUG9pbnQiLCJjb3VudGVyIiwicGFnZXJRdHkiLCJnZXRMZWZ0IiwidmVydGljYWxIZWlnaHQiLCJ2ZXJ0aWNhbE9mZnNldCIsInRhcmdldFNsaWRlIiwiY29lZiIsIm9mZnNldExlZnQiLCJnZXRPcHRpb24iLCJzbGlja0dldE9wdGlvbiIsIm9wdGlvbiIsImluZGV4ZXMiLCJtYXgiLCJnZXRTbGljayIsImdldFNsaWRlQ291bnQiLCJzbGlkZXNUcmF2ZXJzZWQiLCJzd2lwZWRTbGlkZSIsImNlbnRlck9mZnNldCIsImdvVG8iLCJzbGlja0dvVG8iLCJwYXJzZUludCIsImNyZWF0aW9uIiwiaGFzQ2xhc3MiLCJzZXRQcm9wcyIsInN0YXJ0TG9hZCIsImxvYWRTbGlkZXIiLCJpbml0aWFsaXplRXZlbnRzIiwidXBkYXRlQXJyb3dzIiwiaW5pdEFEQSIsIm51bURvdEdyb3VwcyIsInRhYkNvbnRyb2xJbmRleGVzIiwic2xpZGVDb250cm9sSW5kZXgiLCJhcmlhQnV0dG9uQ29udHJvbCIsIm1hcHBlZFNsaWRlSW5kZXgiLCJpbml0QXJyb3dFdmVudHMiLCJpbml0RG90RXZlbnRzIiwiaW5pdFNsaWRlRXZlbnRzIiwiYWN0aW9uIiwiaW5pdFVJIiwidGFnTmFtZSIsImtleUNvZGUiLCJsb2FkUmFuZ2UiLCJjbG9uZVJhbmdlIiwicmFuZ2VTdGFydCIsInJhbmdlRW5kIiwibG9hZEltYWdlcyIsImltYWdlc1Njb3BlIiwiaW1hZ2VTb3VyY2UiLCJpbWFnZVNyY1NldCIsImltYWdlU2l6ZXMiLCJpbWFnZVRvTG9hZCIsInByZXZTbGlkZSIsIm5leHRTbGlkZSIsInByb2dyZXNzaXZlTGF6eUxvYWQiLCJzbGlja05leHQiLCJwYXVzZSIsInNsaWNrUGF1c2UiLCJwbGF5Iiwic2xpY2tQbGF5IiwicG9zdFNsaWRlIiwiJGN1cnJlbnRTbGlkZSIsInByZXYiLCJzbGlja1ByZXYiLCJ0cnlDb3VudCIsIiRpbWdzVG9Mb2FkIiwiaW5pdGlhbGl6aW5nIiwibGFzdFZpc2libGVJbmRleCIsImN1cnJlbnRCcmVha3BvaW50IiwibCIsInJlc3BvbnNpdmVTZXR0aW5ncyIsIndpbmRvd0RlbGF5IiwicmVtb3ZlU2xpZGUiLCJzbGlja1JlbW92ZSIsInJlbW92ZUJlZm9yZSIsInJlbW92ZUFsbCIsInNldENTUyIsInBvc2l0aW9uIiwicG9zaXRpb25Qcm9wcyIsInNldERpbWVuc2lvbnMiLCJwYWRkaW5nIiwic2V0RmFkZSIsInNldEhlaWdodCIsInNldE9wdGlvbiIsInNsaWNrU2V0T3B0aW9uIiwiaXRlbSIsIm9wdCIsImJvZHlTdHlsZSIsIldlYmtpdFRyYW5zaXRpb24iLCJNb3pUcmFuc2l0aW9uIiwibXNUcmFuc2l0aW9uIiwiT1RyYW5zZm9ybSIsInBlcnNwZWN0aXZlUHJvcGVydHkiLCJ3ZWJraXRQZXJzcGVjdGl2ZSIsIk1velRyYW5zZm9ybSIsIk1velBlcnNwZWN0aXZlIiwid2Via2l0VHJhbnNmb3JtIiwibXNUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJhbGxTbGlkZXMiLCJyZW1haW5kZXIiLCJldmVuQ29lZiIsImluZmluaXRlQ291bnQiLCJjbG9uZSIsInRhcmdldEVsZW1lbnQiLCJzeW5jIiwiYW5pbVNsaWRlIiwib2xkU2xpZGUiLCJzbGlkZUxlZnQiLCJuYXZUYXJnZXQiLCJzd2lwZURpcmVjdGlvbiIsInhEaXN0IiwieURpc3QiLCJyIiwic3dpcGVBbmdsZSIsInN0YXJ0WCIsImN1clgiLCJzdGFydFkiLCJjdXJZIiwiYXRhbjIiLCJyb3VuZCIsIlBJIiwic3dpcGVFbmQiLCJzd2lwZUxlbmd0aCIsImVkZ2VIaXQiLCJtaW5Td2lwZSIsImZpbmdlckNvdW50Iiwib3JpZ2luYWxFdmVudCIsInRvdWNoZXMiLCJzd2lwZVN0YXJ0Iiwic3dpcGVNb3ZlIiwiZWRnZVdhc0hpdCIsImN1ckxlZnQiLCJwb3NpdGlvbk9mZnNldCIsInZlcnRpY2FsU3dpcGVMZW5ndGgiLCJjbGllbnRYIiwiY2xpZW50WSIsInNxcnQiLCJwb3ciLCJ1bmZpbHRlclNsaWRlcyIsInNsaWNrVW5maWx0ZXIiLCJmcm9tQnJlYWtwb2ludCIsInJldCIsInciLCJtZXRob2RzIiwiYmNDbGFzcyIsIm1lbnVDbGFzcyIsImFuY2hvckNsYXNzIiwibWVudUFycm93Q2xhc3MiLCJpb3MiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJub29wIiwid3A3IiwidW5wcmVmaXhlZFBvaW50ZXJFdmVudHMiLCJQb2ludGVyRXZlbnQiLCJ0b2dnbGVNZW51Q2xhc3NlcyIsIm8iLCJjbGFzc2VzIiwiY3NzQXJyb3dzIiwic2V0UGF0aFRvQ3VycmVudCIsInBhdGhDbGFzcyIsInBhdGhMZXZlbHMiLCJob3ZlckNsYXNzIiwicG9wVXBTZWxlY3RvciIsInRvZ2dsZUFuY2hvckNsYXNzIiwiJGxpIiwidG9nZ2xlVG91Y2hBY3Rpb24iLCJtc1RvdWNoQWN0aW9uIiwidG91Y2hBY3Rpb24iLCJnZXRNZW51IiwiJGVsIiwiZ2V0T3B0aW9ucyIsInNmVGltZXIiLCJjbG9zZSIsInJldGFpblBhdGgiLCIkcGF0aCIsIm9uSWRsZSIsInRvdWNoSGFuZGxlciIsIiR1bCIsIm9uSGFuZGxlVG91Y2giLCJhcHBseUhhbmRsZXJzIiwiZGlzYWJsZUhJIiwidG91Y2hldmVudCIsImluc3RhbnQiLCJzcGVlZE91dCIsIm9uQmVmb3JlSGlkZSIsImFuaW1hdGlvbk91dCIsIm9uSGlkZSIsIm9uQmVmb3JlU2hvdyIsImFuaW1hdGlvbiIsIm9uU2hvdyIsIiRoYXNQb3BVcCIsIm9uRGVzdHJveSIsInJlbW92ZURhdGEiLCJvcCIsIm9uSW5pdCIsIkludmlldyIsImNyZWF0ZVdheXBvaW50cyIsImNvbmZpZ3MiLCJjb25maWciLCJjcmVhdGVXYXlwb2ludCIsImVudGVyIiwiZW50ZXJlZCIsImV4aXQiLCJleGl0ZWQiLCIkbGVnZW5kIiwiJG1hcHMiLCJtb3VzZWxlYXZlIiwic2VhcmNoUGFyYW1zIiwiVVJMU2VhcmNoUGFyYW1zIiwic2VhcmNoIiwiaGFzIiwicGFyYW0iLCJmYWRlT3V0IiwicmVhY3RNYXRjaEhlaWdodCIsImVsQ2xhc3NOYW1lIiwiaXNJbnRlcm5hbExpbmsiLCJSZWdFeHAiLCJob3N0IiwiaHJlZiIsIkZXUCIsImZvdW5kYXRpb24iLCJGb3VuZGF0aW9uIiwicmVJbml0IiwibGFzdFNjcm9sbFRvcCIsIm5hdmJhckhlaWdodCIsInNjcm9sbCIsImhhc1Njcm9sbGVkIiwic3QiLCIkdG9nZ2xlIiwiYW5pbWF0ZU51bWJlcnMiLCJ2aWV3ZWQiLCJpc1Njcm9sbGVkSW50b1ZpZXciLCJkb2NWaWV3VG9wIiwiZG9jVmlld0JvdHRvbSIsImVsZW1Ub3AiLCJlbGVtQm90dG9tIiwiQ291bnRlciIsInRvU3RyaW5nIiwiJGltZyIsImltZ0lEIiwiaW1nQ2xhc3MiLCJpbWdVUkwiLCIkc3ZnIiwicmVwbGFjZVdpdGgiLCIkY29sdW1uIiwiY2xpY2siLCIkdGhpc0NvbHVtbiIsIk1lZGlhUXVlcnkiLCJhdExlYXN0IiwibGFiZWwiLCJwbGF5VmlkZW8iLCJzaXplIiwiJG1vZGFsIiwiJGlmcmFtZSIsImZyYW1lYm9yZGVyIiwiaHRtbCIsImdldExhc3RTaWJsaW5nSW5Sb3ciLCJjYW5kaWRhdGUiLCJlbGVtZW50VG9wIiwib2Zmc2V0VG9wIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwiJGdyaWQiLCJob3ZlciIsIiRhbGxfb2VtYmVkX3ZpZGVvcyIsImxvYWRSZWdpb24iLCIkcmVnaW9uIiwibG9hZE1hcCIsIiRtYXAiLCJsb2FkUHJvamVjdCIsIiRwcm9qZWN0IiwiJHNlY3Rpb25fdmlkZW9zIiwiZG9uZSIsIiRzZWN0aW9uX3N0b3JpZXMiLCIkc2luZ2xlUG9zdFNsaWRlciIsIiRzZWN0aW9uX3JlbGF0ZWRfcG9zdHMiLCIkc2VjdGlvbl90ZXN0aW1vbmlhbHMiLCJoaWRlX2hlYWRlcl9tZW51Iiwic2Nyb2xsbm93IiwiZHJvcFNoYWRvd3MiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBRUEsQ0FBQyxZQUFZO0FBQ1g7O0FBRUEsTUFBSUEsYUFBYSxDQUFqQjtBQUNBLE1BQUlDLGFBQWEsRUFBakI7QUFDQSxNQUFJQyxhQUFhLEVBQWpCOztBQUVBLFdBQVNDLENBQVQsQ0FBWUMsUUFBWixFQUFzQkMsT0FBdEIsRUFBK0I7QUFDN0IsV0FBT0MsTUFBTUMsU0FBTixDQUFnQkMsS0FBaEIsQ0FBc0JDLElBQXRCLENBQ0wsQ0FBQ0osV0FBV0ssUUFBWixFQUFzQkMsZ0JBQXRCLENBQXVDUCxRQUF2QyxDQURLLENBQVA7QUFHRDs7QUFFRCxXQUFTUSxnQkFBVCxDQUEyQkMsT0FBM0IsRUFBb0M7QUFDbEMsUUFBSUEsUUFBUUMsT0FBWixFQUFxQjtBQUNuQixhQUFPRCxRQUFRQyxPQUFSLENBQWdCLG9CQUFoQixDQUFQO0FBQ0Q7O0FBRUQsV0FBT0QsT0FBUCxFQUFnQjtBQUNkLFVBQUlBLFFBQVFFLFFBQVIsS0FBcUIsQ0FBckIsSUFBMEJG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QUF0QixFQUE0QixFQUE1QixNQUFvQzBTLFNBQVNDLFFBQVQsQ0FBa0IzUyxPQUFsQixDQUEwQixLQUExQixFQUFnQyxFQUFoQyxDQUFwQyxJQUEyRSxLQUFLOFMsUUFBTCxLQUFrQkosU0FBU0ksUUFBMUcsRUFBb0g7QUFDaEg7QUFDQXRXLGNBQUUsSUFBRixFQUFRdUYsSUFBUixDQUFhLE1BQWIsRUFBcUIsS0FBS2tSLElBQTFCO0FBQ0g7QUFDSixLQU5EOztBQVFBO0FBQ0E7QUFDQXpXLE1BQUUsTUFBRixFQUFVMkUsRUFBVixDQUFhLE9BQWIsRUFBc0IsMEJBQXRCLEVBQWtEKzZCLFNBQWxEO0FBRUgsQ0FwRUEsRUFvRUNuL0IsUUFwRUQsRUFvRVcrQixNQXBFWCxFQW9FbUI0RixNQXBFbkIsQ0FBRDs7O0FqQkFDLFdBQVUzSCxRQUFWLEVBQW9CK0IsTUFBcEIsRUFBNEJ0QyxDQUE1QixFQUErQjs7QUFFL0I7O0FBRUFBLFNBQUUsZUFBRixFQUFtQitHLFNBQW5CLENBQTZCO0FBQ3RCa0QscUJBQU0sR0FEZ0I7QUFFdEI7QUFDQTAxQiwyQkFBWSxDQUFDO0FBSFMsUUFBN0I7QUFPQSxDQVhBLEVBV0NwL0IsUUFYRCxFQVdXK0IsTUFYWCxFQVdtQjRGLE1BWG5CLENBQUQiLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGh0dHBzOi8vZWRlbnNwaWVrZXJtYW5uLmdpdGh1Yi5pby9hMTF5LXRvZ2dsZS9cblxuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBpbnRlcm5hbElkID0gMDtcbiAgdmFyIHRvZ2dsZXNNYXAgPSB7fTtcbiAgdmFyIHRhcmdldHNNYXAgPSB7fTtcblxuICBmdW5jdGlvbiAkIChzZWxlY3RvciwgY29udGV4dCkge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcbiAgICAgIChjb250ZXh0IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDbG9zZXN0VG9nZ2xlIChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQuY2xvc2VzdCkge1xuICAgICAgcmV0dXJuIGVsZW1lbnQuY2xvc2VzdCgnW2RhdGEtYTExeS10b2dnbGVdJyk7XG4gICAgfVxuXG4gICAgd2hpbGUgKGVsZW1lbnQpIHtcbiAgICAgIGlmIChlbGVtZW50Lm5vZGVUeXBlID09PSAxICYmIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlJykpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVUb2dnbGUgKHRvZ2dsZSkge1xuICAgIHZhciB0YXJnZXQgPSB0b2dnbGUgJiYgdGFyZ2V0c01hcFt0b2dnbGUuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyldO1xuXG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgdG9nZ2xlcyA9IHRvZ2dsZXNNYXBbJyMnICsgdGFyZ2V0LmlkXTtcbiAgICB2YXIgaXNFeHBhbmRlZCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJykgPT09ICdmYWxzZSc7XG5cbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGlzRXhwYW5kZWQpO1xuICAgIHRvZ2dsZXMuZm9yRWFjaChmdW5jdGlvbiAodG9nZ2xlKSB7XG4gICAgICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgIWlzRXhwYW5kZWQpO1xuICAgICAgaWYoIWlzRXhwYW5kZWQpIHtcbiAgICAgICAgaWYodG9nZ2xlLmhhc0F0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZS1sZXNzJykpIHtcbiAgICAgICAgICAgIHRvZ2dsZS5pbm5lckhUTUwgPSB0b2dnbGUuZ2V0QXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLWxlc3MnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYodG9nZ2xlLmhhc0F0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZS1tb3JlJykpIHtcbiAgICAgICAgICAgIHRvZ2dsZS5pbm5lckhUTUwgPSB0b2dnbGUuZ2V0QXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLW1vcmUnKTtcbiAgICAgICAgfVxuICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB2YXIgaW5pdEExMXlUb2dnbGUgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIHRvZ2dsZXNNYXAgPSAkKCdbZGF0YS1hMTF5LXRvZ2dsZV0nLCBjb250ZXh0KS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgdG9nZ2xlKSB7XG4gICAgICB2YXIgc2VsZWN0b3IgPSAnIycgKyB0b2dnbGUuZ2V0QXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlJyk7XG4gICAgICBhY2Nbc2VsZWN0b3JdID0gYWNjW3NlbGVjdG9yXSB8fCBbXTtcbiAgICAgIGFjY1tzZWxlY3Rvcl0ucHVzaCh0b2dnbGUpO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB0b2dnbGVzTWFwKTtcblxuICAgIHZhciB0YXJnZXRzID0gT2JqZWN0LmtleXModG9nZ2xlc01hcCk7XG4gICAgdGFyZ2V0cy5sZW5ndGggJiYgJCh0YXJnZXRzKS5mb3JFYWNoKGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIHZhciB0b2dnbGVzID0gdG9nZ2xlc01hcFsnIycgKyB0YXJnZXQuaWRdO1xuICAgICAgdmFyIGlzRXhwYW5kZWQgPSB0YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLW9wZW4nKTtcbiAgICAgIHZhciBsYWJlbGxlZGJ5ID0gW107XG5cbiAgICAgIHRvZ2dsZXMuZm9yRWFjaChmdW5jdGlvbiAodG9nZ2xlKSB7XG4gICAgICAgIHRvZ2dsZS5pZCB8fCB0b2dnbGUuc2V0QXR0cmlidXRlKCdpZCcsICdhMTF5LXRvZ2dsZS0nICsgaW50ZXJuYWxJZCsrKTtcbiAgICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycsIHRhcmdldC5pZCk7XG4gICAgICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBpc0V4cGFuZGVkKTsgICAgICAgIFxuICAgICAgICBsYWJlbGxlZGJ5LnB1c2godG9nZ2xlLmlkKTtcbiAgICAgIH0pO1xuXG4gICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICFpc0V4cGFuZGVkKTtcbiAgICAgIHRhcmdldC5oYXNBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScpIHx8IHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsIGxhYmVsbGVkYnkuam9pbignICcpKTtcblxuICAgICAgdGFyZ2V0c01hcFt0YXJnZXQuaWRdID0gdGFyZ2V0O1xuICAgIH0pO1xuICB9O1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgaW5pdEExMXlUb2dnbGUoKTtcbiAgfSk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgdG9nZ2xlID0gZ2V0Q2xvc2VzdFRvZ2dsZShldmVudC50YXJnZXQpO1xuICAgIGhhbmRsZVRvZ2dsZSh0b2dnbGUpO1xuICB9KTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudC53aGljaCA9PT0gMTMgfHwgZXZlbnQud2hpY2ggPT09IDMyKSB7XG4gICAgICB2YXIgdG9nZ2xlID0gZ2V0Q2xvc2VzdFRvZ2dsZShldmVudC50YXJnZXQpO1xuICAgICAgaWYgKHRvZ2dsZSAmJiB0b2dnbGUuZ2V0QXR0cmlidXRlKCdyb2xlJykgPT09ICdidXR0b24nKSB7XG4gICAgICAgIGhhbmRsZVRvZ2dsZSh0b2dnbGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93ICYmICh3aW5kb3cuYTExeVRvZ2dsZSA9IGluaXRBMTF5VG9nZ2xlKTtcbn0pKCk7XG4iLCIvKipcbiAqIFRoaXMgc2NyaXB0IGFkZHMgdGhlIGFjY2Vzc2liaWxpdHktcmVhZHkgcmVzcG9uc2l2ZSBtZW51cyBHZW5lc2lzIEZyYW1ld29yayBjaGlsZCB0aGVtZXMuXG4gKlxuICogQGF1dGhvciBTdHVkaW9QcmVzc1xuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2NvcHlibG9nZ2VyL3Jlc3BvbnNpdmUtbWVudXNcbiAqIEB2ZXJzaW9uIDEuMS4zXG4gKiBAbGljZW5zZSBHUEwtMi4wK1xuICovXG5cbiggZnVuY3Rpb24gKCBkb2N1bWVudCwgJCwgdW5kZWZpbmVkICkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG5cblx0dmFyIGdlbmVzaXNNZW51UGFyYW1zICAgICAgPSB0eXBlb2YgZ2VuZXNpc19yZXNwb25zaXZlX21lbnUgPT09ICd1bmRlZmluZWQnID8gJycgOiBnZW5lc2lzX3Jlc3BvbnNpdmVfbWVudSxcblx0XHRnZW5lc2lzTWVudXNVbmNoZWNrZWQgID0gZ2VuZXNpc01lbnVQYXJhbXMubWVudUNsYXNzZXMsXG5cdFx0Z2VuZXNpc01lbnVzICAgICAgICAgICA9IHt9LFxuXHRcdG1lbnVzVG9Db21iaW5lICAgICAgICAgPSBbXTtcblxuXHQvKipcblx0ICogVmFsaWRhdGUgdGhlIG1lbnVzIHBhc3NlZCBieSB0aGUgdGhlbWUgd2l0aCB3aGF0J3MgYmVpbmcgbG9hZGVkIG9uIHRoZSBwYWdlLFxuXHQgKiBhbmQgcGFzcyB0aGUgbmV3IGFuZCBhY2N1cmF0ZSBpbmZvcm1hdGlvbiB0byBvdXIgbmV3IGRhdGEuXG5cdCAqIEBwYXJhbSB7Z2VuZXNpc01lbnVzVW5jaGVja2VkfSBSYXcgZGF0YSBmcm9tIHRoZSBsb2NhbGl6ZWQgc2NyaXB0IGluIHRoZSB0aGVtZS5cblx0ICogQHJldHVybiB7YXJyYXl9IGdlbmVzaXNNZW51cyBhcnJheSBnZXRzIHBvcHVsYXRlZCB3aXRoIHVwZGF0ZWQgZGF0YS5cblx0ICogQHJldHVybiB7YXJyYXl9IG1lbnVzVG9Db21iaW5lIGFycmF5IGdldHMgcG9wdWxhdGVkIHdpdGggcmVsZXZhbnQgZGF0YS5cblx0ICovXG5cdCQuZWFjaCggZ2VuZXNpc01lbnVzVW5jaGVja2VkLCBmdW5jdGlvbiggZ3JvdXAgKSB7XG5cblx0XHQvLyBNaXJyb3Igb3VyIGdyb3VwIG9iamVjdCB0byBwb3B1bGF0ZS5cblx0XHRnZW5lc2lzTWVudXNbZ3JvdXBdID0gW107XG5cblx0XHQvLyBMb29wIHRocm91Z2ggZWFjaCBpbnN0YW5jZSBvZiB0aGUgc3BlY2lmaWVkIG1lbnUgb24gdGhlIHBhZ2UuXG5cdFx0JC5lYWNoKCB0aGlzLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblxuXHRcdFx0dmFyIG1lbnVTdHJpbmcgPSB2YWx1ZSxcblx0XHRcdFx0JG1lbnUgICAgICA9ICQodmFsdWUpO1xuXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIGluc3RhbmNlLCBhcHBlbmQgdGhlIGluZGV4IGFuZCB1cGRhdGUgYXJyYXkuXG5cdFx0XHRpZiAoICRtZW51Lmxlbmd0aCA+IDEgKSB7XG5cblx0XHRcdFx0JC5lYWNoKCAkbWVudSwgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cblx0XHRcdFx0XHR2YXIgbmV3U3RyaW5nID0gbWVudVN0cmluZyArICctJyArIGtleTtcblxuXHRcdFx0XHRcdCQodGhpcykuYWRkQ2xhc3MoIG5ld1N0cmluZy5yZXBsYWNlKCcuJywnJykgKTtcblxuXHRcdFx0XHRcdGdlbmVzaXNNZW51c1tncm91cF0ucHVzaCggbmV3U3RyaW5nICk7XG5cblx0XHRcdFx0XHRpZiAoICdjb21iaW5lJyA9PT0gZ3JvdXAgKSB7XG5cdFx0XHRcdFx0XHRtZW51c1RvQ29tYmluZS5wdXNoKCBuZXdTdHJpbmcgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSk7XG5cblx0XHRcdH0gZWxzZSBpZiAoICRtZW51Lmxlbmd0aCA9PSAxICkge1xuXG5cdFx0XHRcdGdlbmVzaXNNZW51c1tncm91cF0ucHVzaCggbWVudVN0cmluZyApO1xuXG5cdFx0XHRcdGlmICggJ2NvbWJpbmUnID09PSBncm91cCApIHtcblx0XHRcdFx0XHRtZW51c1RvQ29tYmluZS5wdXNoKCBtZW51U3RyaW5nICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0fSk7XG5cblx0Ly8gTWFrZSBzdXJlIHRoZXJlIGlzIHNvbWV0aGluZyB0byB1c2UgZm9yIHRoZSAnb3RoZXJzJyBhcnJheS5cblx0aWYgKCB0eXBlb2YgZ2VuZXNpc01lbnVzLm90aGVycyA9PSAndW5kZWZpbmVkJyApIHtcblx0XHRnZW5lc2lzTWVudXMub3RoZXJzID0gW107XG5cdH1cblxuXHQvLyBJZiB0aGVyZSdzIG9ubHkgb25lIG1lbnUgb24gdGhlIHBhZ2UgZm9yIGNvbWJpbmluZywgcHVzaCBpdCB0byB0aGUgJ290aGVycycgYXJyYXkgYW5kIG51bGxpZnkgb3VyICdjb21iaW5lJyB2YXJpYWJsZS5cblx0aWYgKCBtZW51c1RvQ29tYmluZS5sZW5ndGggPT0gMSApIHtcblx0XHRnZW5lc2lzTWVudXMub3RoZXJzLnB1c2goIG1lbnVzVG9Db21iaW5lWzBdICk7XG5cdFx0Z2VuZXNpc01lbnVzLmNvbWJpbmUgPSBudWxsO1xuXHRcdG1lbnVzVG9Db21iaW5lID0gbnVsbDtcblx0fVxuXG5cdHZhciBnZW5lc2lzTWVudSAgICAgICAgID0ge30sXG5cdFx0bWFpbk1lbnVCdXR0b25DbGFzcyA9ICdtZW51LXRvZ2dsZScsXG5cdFx0c3ViTWVudUJ1dHRvbkNsYXNzICA9ICdzdWItbWVudS10b2dnbGUnLFxuXHRcdHJlc3BvbnNpdmVNZW51Q2xhc3MgPSAnZ2VuZXNpcy1yZXNwb25zaXZlLW1lbnUnO1xuXG5cdC8vIEluaXRpYWxpemUuXG5cdGdlbmVzaXNNZW51LmluaXQgPSBmdW5jdGlvbigpIHtcblxuXHRcdC8vIEV4aXQgZWFybHkgaWYgdGhlcmUgYXJlIG5vIG1lbnVzIHRvIGRvIGFueXRoaW5nLlxuXHRcdGlmICggJCggX2dldEFsbE1lbnVzQXJyYXkoKSApLmxlbmd0aCA9PSAwICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBtZW51SWNvbkNsYXNzICAgICA9IHR5cGVvZiBnZW5lc2lzTWVudVBhcmFtcy5tZW51SWNvbkNsYXNzICE9PSAndW5kZWZpbmVkJyA/IGdlbmVzaXNNZW51UGFyYW1zLm1lbnVJY29uQ2xhc3MgOiAnZGFzaGljb25zLWJlZm9yZSBkYXNoaWNvbnMtbWVudScsXG5cdFx0XHRzdWJNZW51SWNvbkNsYXNzICA9IHR5cGVvZiBnZW5lc2lzTWVudVBhcmFtcy5zdWJNZW51SWNvbkNsYXNzICE9PSAndW5kZWZpbmVkJyA/IGdlbmVzaXNNZW51UGFyYW1zLnN1Yk1lbnVJY29uQ2xhc3MgOiAnZGFzaGljb25zLWJlZm9yZSBkYXNoaWNvbnMtYXJyb3ctZG93bi1hbHQyJyxcblx0XHRcdHRvZ2dsZUJ1dHRvbnMgICAgID0ge1xuXHRcdFx0XHRtZW51IDogJCggJzxidXR0b24gLz4nLCB7XG5cdFx0XHRcdFx0J2NsYXNzJyA6IG1haW5NZW51QnV0dG9uQ2xhc3MsXG5cdFx0XHRcdFx0J2FyaWEtZXhwYW5kZWQnIDogZmFsc2UsXG5cdFx0XHRcdFx0J2FyaWEtcHJlc3NlZCcgOiBmYWxzZSxcblx0XHRcdFx0XHQncm9sZSdcdFx0XHQ6ICdidXR0b24nLFxuXHRcdFx0XHRcdH0gKVxuXHRcdFx0XHRcdC5hcHBlbmQoICQoICc8c3BhbiAvPicsIHtcblx0XHRcdFx0XHRcdCdjbGFzcycgOiAnc2NyZWVuLXJlYWRlci10ZXh0Jyxcblx0XHRcdFx0XHRcdCd0ZXh0JyA6IGdlbmVzaXNNZW51UGFyYW1zLm1haW5NZW51XG5cdFx0XHRcdFx0fSApICksXG5cdFx0XHRcdHN1Ym1lbnUgOiAkKCAnPGJ1dHRvbiAvPicsIHtcblx0XHRcdFx0XHQnY2xhc3MnIDogc3ViTWVudUJ1dHRvbkNsYXNzLFxuXHRcdFx0XHRcdCdhcmlhLWV4cGFuZGVkJyA6IGZhbHNlLFxuXHRcdFx0XHRcdCdhcmlhLXByZXNzZWQnICA6IGZhbHNlLFxuXHRcdFx0XHRcdCd0ZXh0J1x0XHRcdDogJydcblx0XHRcdFx0XHR9IClcblx0XHRcdFx0XHQuYXBwZW5kKCAkKCAnPHNwYW4gLz4nLCB7XG5cdFx0XHRcdFx0XHQnY2xhc3MnIDogJ3NjcmVlbi1yZWFkZXItdGV4dCcsXG5cdFx0XHRcdFx0XHQndGV4dCcgOiBnZW5lc2lzTWVudVBhcmFtcy5zdWJNZW51XG5cdFx0XHRcdFx0fSApIClcblx0XHRcdH07XG5cblx0XHQvLyBBZGQgdGhlIHJlc3BvbnNpdmUgbWVudSBjbGFzcyB0byB0aGUgYWN0aXZlIG1lbnVzLlxuXHRcdF9hZGRSZXNwb25zaXZlTWVudUNsYXNzKCk7XG5cblx0XHQvLyBBZGQgdGhlIG1haW4gbmF2IGJ1dHRvbiB0byB0aGUgcHJpbWFyeSBtZW51LCBvciBleGl0IHRoZSBwbHVnaW4uXG5cdFx0X2FkZE1lbnVCdXR0b25zKCB0b2dnbGVCdXR0b25zICk7XG5cblx0XHQvLyBTZXR1cCBhZGRpdGlvbmFsIGNsYXNzZXMuXG5cdFx0JCggJy4nICsgbWFpbk1lbnVCdXR0b25DbGFzcyApLmFkZENsYXNzKCBtZW51SWNvbkNsYXNzICk7XG5cdFx0JCggJy4nICsgc3ViTWVudUJ1dHRvbkNsYXNzICkuYWRkQ2xhc3MoIHN1Yk1lbnVJY29uQ2xhc3MgKTtcblx0XHQkKCAnLicgKyBtYWluTWVudUJ1dHRvbkNsYXNzICkub24oICdjbGljay5nZW5lc2lzTWVudS1tYWluYnV0dG9uJywgX21haW5tZW51VG9nZ2xlICkuZWFjaCggX2FkZENsYXNzSUQgKTtcblx0XHQkKCAnLicgKyBzdWJNZW51QnV0dG9uQ2xhc3MgKS5vbiggJ2NsaWNrLmdlbmVzaXNNZW51LXN1YmJ1dHRvbicsIF9zdWJtZW51VG9nZ2xlICk7XG5cdFx0JCggd2luZG93ICkub24oICdyZXNpemUuZ2VuZXNpc01lbnUnLCBfZG9SZXNpemUgKS50cmlnZ2VySGFuZGxlciggJ3Jlc2l6ZS5nZW5lc2lzTWVudScgKTtcblx0fTtcblxuXHQvKipcblx0ICogQWRkIG1lbnUgdG9nZ2xlIGJ1dHRvbiB0byBhcHByb3ByaWF0ZSBtZW51cy5cblx0ICogQHBhcmFtIHt0b2dnbGVCdXR0b25zfSBPYmplY3Qgb2YgbWVudSBidXR0b25zIHRvIHVzZSBmb3IgdG9nZ2xlcy5cblx0ICovXG5cdGZ1bmN0aW9uIF9hZGRNZW51QnV0dG9ucyggdG9nZ2xlQnV0dG9ucyApIHtcblxuXHRcdC8vIEFwcGx5IHN1YiBtZW51IHRvZ2dsZSB0byBlYWNoIHN1Yi1tZW51IGZvdW5kIGluIHRoZSBtZW51TGlzdC5cblx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBnZW5lc2lzTWVudXMgKSApLmZpbmQoICcuc3ViLW1lbnUnICkuYmVmb3JlKCB0b2dnbGVCdXR0b25zLnN1Ym1lbnUgKTtcblxuXG5cdFx0aWYgKCBtZW51c1RvQ29tYmluZSAhPT0gbnVsbCApIHtcblxuXHRcdFx0dmFyIG1lbnVzVG9Ub2dnbGUgPSBnZW5lc2lzTWVudXMub3RoZXJzLmNvbmNhdCggbWVudXNUb0NvbWJpbmVbMF0gKTtcblxuXHRcdCBcdC8vIE9ubHkgYWRkIG1lbnUgYnV0dG9uIHRoZSBwcmltYXJ5IG1lbnUgYW5kIG5hdnMgTk9UIGluIHRoZSBjb21iaW5lIHZhcmlhYmxlLlxuXHRcdCBcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIG1lbnVzVG9Ub2dnbGUgKSApLmJlZm9yZSggdG9nZ2xlQnV0dG9ucy5tZW51ICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBBcHBseSB0aGUgbWFpbiBtZW51IHRvZ2dsZSB0byBhbGwgbWVudXMgaW4gdGhlIGxpc3QuXG5cdFx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBnZW5lc2lzTWVudXMub3RoZXJzICkgKS5iZWZvcmUoIHRvZ2dsZUJ1dHRvbnMubWVudSApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQWRkIHRoZSByZXNwb25zaXZlIG1lbnUgY2xhc3MuXG5cdCAqL1xuXHRmdW5jdGlvbiBfYWRkUmVzcG9uc2l2ZU1lbnVDbGFzcygpIHtcblx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBnZW5lc2lzTWVudXMgKSApLmFkZENsYXNzKCByZXNwb25zaXZlTWVudUNsYXNzICk7XG5cdH1cblxuXHQvKipcblx0ICogRXhlY3V0ZSBvdXIgcmVzcG9uc2l2ZSBtZW51IGZ1bmN0aW9ucyBvbiB3aW5kb3cgcmVzaXppbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiBfZG9SZXNpemUoKSB7XG5cdFx0dmFyIGJ1dHRvbnMgICA9ICQoICdidXR0b25baWRePVwiZ2VuZXNpcy1tb2JpbGUtXCJdJyApLmF0dHIoICdpZCcgKTtcblx0XHRpZiAoIHR5cGVvZiBidXR0b25zID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0X21heWJlQ2xvc2UoIGJ1dHRvbnMgKTtcblx0XHRfc3VwZXJmaXNoVG9nZ2xlKCBidXR0b25zICk7XG5cdFx0X2NoYW5nZVNraXBMaW5rKCBidXR0b25zICk7XG5cdFx0X2NvbWJpbmVNZW51cyggYnV0dG9ucyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCB0aGUgbmF2LSBjbGFzcyBvZiB0aGUgcmVsYXRlZCBuYXZpZ2F0aW9uIG1lbnUgYXNcblx0ICogYW4gSUQgdG8gYXNzb2NpYXRlZCBidXR0b24gKGhlbHBzIHRhcmdldCBzcGVjaWZpYyBidXR0b25zIG91dHNpZGUgb2YgY29udGV4dCkuXG5cdCAqL1xuXHRmdW5jdGlvbiBfYWRkQ2xhc3NJRCgpIHtcblx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0XHRuYXYgICA9ICR0aGlzLm5leHQoICduYXYnICksXG5cdFx0XHRpZCAgICA9ICdjbGFzcyc7XG5cblx0XHQkdGhpcy5hdHRyKCAnaWQnLCAnZ2VuZXNpcy1tb2JpbGUtJyArICQoIG5hdiApLmF0dHIoIGlkICkubWF0Y2goIC9uYXYtXFx3KlxcYi8gKSApO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbWJpbmUgb3VyIG1lbnVzIGlmIHRoZSBtb2JpbGUgbWVudSBpcyB2aXNpYmxlLlxuXHQgKiBAcGFyYW1zIGJ1dHRvbnNcblx0ICovXG5cdGZ1bmN0aW9uIF9jb21iaW5lTWVudXMoIGJ1dHRvbnMgKXtcblxuXHRcdC8vIEV4aXQgZWFybHkgaWYgdGhlcmUgYXJlIG5vIG1lbnVzIHRvIGNvbWJpbmUuXG5cdFx0aWYgKCBtZW51c1RvQ29tYmluZSA9PSBudWxsICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNwbGl0IHVwIHRoZSBtZW51cyB0byBjb21iaW5lIGJhc2VkIG9uIG9yZGVyIG9mIGFwcGVhcmFuY2UgaW4gdGhlIGFycmF5LlxuXHRcdHZhciBwcmltYXJ5TWVudSAgID0gbWVudXNUb0NvbWJpbmVbMF0sXG5cdFx0XHRjb21iaW5lZE1lbnVzID0gJCggbWVudXNUb0NvbWJpbmUgKS5maWx0ZXIoIGZ1bmN0aW9uKGluZGV4KSB7IGlmICggaW5kZXggPiAwICkgeyByZXR1cm4gaW5kZXg7IH0gfSk7XG5cblx0XHQvLyBJZiB0aGUgcmVzcG9uc2l2ZSBtZW51IGlzIGFjdGl2ZSwgYXBwZW5kIGl0ZW1zIGluICdjb21iaW5lZE1lbnVzJyBvYmplY3QgdG8gdGhlICdwcmltYXJ5TWVudScgb2JqZWN0LlxuXHRcdGlmICggJ25vbmUnICE9PSBfZ2V0RGlzcGxheVZhbHVlKCBidXR0b25zICkgKSB7XG5cblx0XHRcdCQuZWFjaCggY29tYmluZWRNZW51cywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRcdCQodmFsdWUpLmZpbmQoICcubWVudSA+IGxpJyApLmFkZENsYXNzKCAnbW92ZWQtaXRlbS0nICsgdmFsdWUucmVwbGFjZSggJy4nLCcnICkgKS5hcHBlbmRUbyggcHJpbWFyeU1lbnUgKyAnIHVsLmdlbmVzaXMtbmF2LW1lbnUnICk7XG5cdFx0XHR9KTtcblx0XHRcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGNvbWJpbmVkTWVudXMgKSApLmhpZGUoKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGNvbWJpbmVkTWVudXMgKSApLnNob3coKTtcblx0XHRcdCQuZWFjaCggY29tYmluZWRNZW51cywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRcdCQoICcubW92ZWQtaXRlbS0nICsgdmFsdWUucmVwbGFjZSggJy4nLCcnICkgKS5hcHBlbmRUbyggdmFsdWUgKyAnIHVsLmdlbmVzaXMtbmF2LW1lbnUnICkucmVtb3ZlQ2xhc3MoICdtb3ZlZC1pdGVtLScgKyB2YWx1ZS5yZXBsYWNlKCAnLicsJycgKSApO1xuXHRcdFx0fSk7XG5cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBBY3Rpb24gdG8gaGFwcGVuIHdoZW4gdGhlIG1haW4gbWVudSBidXR0b24gaXMgY2xpY2tlZC5cblx0ICovXG5cdGZ1bmN0aW9uIF9tYWlubWVudVRvZ2dsZSgpIHtcblx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICk7XG5cdFx0X3RvZ2dsZUFyaWEoICR0aGlzLCAnYXJpYS1wcmVzc2VkJyApO1xuXHRcdF90b2dnbGVBcmlhKCAkdGhpcywgJ2FyaWEtZXhwYW5kZWQnICk7XG5cdFx0JHRoaXMudG9nZ2xlQ2xhc3MoICdhY3RpdmF0ZWQnICk7XG5cdFx0JHRoaXMubmV4dCggJ25hdicgKS5zbGlkZVRvZ2dsZSggJ2Zhc3QnICk7XG5cdH1cblxuXHQvKipcblx0ICogQWN0aW9uIGZvciBzdWJtZW51IHRvZ2dsZXMuXG5cdCAqL1xuXHRmdW5jdGlvbiBfc3VibWVudVRvZ2dsZSgpIHtcblxuXHRcdHZhciAkdGhpcyAgPSAkKCB0aGlzICksXG5cdFx0XHRvdGhlcnMgPSAkdGhpcy5jbG9zZXN0KCAnLm1lbnUtaXRlbScgKS5zaWJsaW5ncygpO1xuXHRcdF90b2dnbGVBcmlhKCAkdGhpcywgJ2FyaWEtcHJlc3NlZCcgKTtcblx0XHRfdG9nZ2xlQXJpYSggJHRoaXMsICdhcmlhLWV4cGFuZGVkJyApO1xuXHRcdCR0aGlzLnRvZ2dsZUNsYXNzKCAnYWN0aXZhdGVkJyApO1xuXHRcdCR0aGlzLm5leHQoICcuc3ViLW1lbnUnICkuc2xpZGVUb2dnbGUoICdmYXN0JyApO1xuXG5cdFx0b3RoZXJzLmZpbmQoICcuJyArIHN1Yk1lbnVCdXR0b25DbGFzcyApLnJlbW92ZUNsYXNzKCAnYWN0aXZhdGVkJyApLmF0dHIoICdhcmlhLXByZXNzZWQnLCAnZmFsc2UnICk7XG5cdFx0b3RoZXJzLmZpbmQoICcuc3ViLW1lbnUnICkuc2xpZGVVcCggJ2Zhc3QnICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBBY3RpdmF0ZS9kZWFjdGl2YXRlIHN1cGVyZmlzaC5cblx0ICogQHBhcmFtcyBidXR0b25zXG5cdCAqL1xuXHRmdW5jdGlvbiBfc3VwZXJmaXNoVG9nZ2xlKCBidXR0b25zICkge1xuXHRcdHZhciBfc3VwZXJmaXNoID0gJCggJy4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLmpzLXN1cGVyZmlzaCcgKSxcblx0XHRcdCRhcmdzICAgICAgPSAnZGVzdHJveSc7XG5cdFx0aWYgKCB0eXBlb2YgX3N1cGVyZmlzaC5zdXBlcmZpc2ggIT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmICggJ25vbmUnID09PSBfZ2V0RGlzcGxheVZhbHVlKCBidXR0b25zICkgKSB7XG5cdFx0XHQkYXJncyA9IHtcblx0XHRcdFx0J2RlbGF5JzogMCxcblx0XHRcdFx0J2FuaW1hdGlvbic6IHsnb3BhY2l0eSc6ICdzaG93J30sXG5cdFx0XHRcdCdzcGVlZCc6IDMwMCxcblx0XHRcdFx0J2Rpc2FibGVISSc6IHRydWVcblx0XHRcdH07XG5cdFx0fVxuXHRcdF9zdXBlcmZpc2guc3VwZXJmaXNoKCAkYXJncyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vZGlmeSBza2lwIGxpbmsgdG8gbWF0Y2ggbW9iaWxlIGJ1dHRvbnMuXG5cdCAqIEBwYXJhbSBidXR0b25zXG5cdCAqL1xuXHRmdW5jdGlvbiBfY2hhbmdlU2tpcExpbmsoIGJ1dHRvbnMgKSB7XG5cblx0XHQvLyBTdGFydCB3aXRoIGFuIGVtcHR5IGFycmF5LlxuXHRcdHZhciBtZW51VG9nZ2xlTGlzdCA9IF9nZXRBbGxNZW51c0FycmF5KCk7XG5cblx0XHQvLyBFeGl0IG91dCBpZiB0aGVyZSBhcmUgbm8gbWVudSBpdGVtcyB0byB1cGRhdGUuXG5cdFx0aWYgKCAhICQoIG1lbnVUb2dnbGVMaXN0ICkubGVuZ3RoID4gMCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkLmVhY2goIG1lbnVUb2dnbGVMaXN0LCBmdW5jdGlvbiAoIGtleSwgdmFsdWUgKSB7XG5cblx0XHRcdHZhciBuZXdWYWx1ZSAgPSB2YWx1ZS5yZXBsYWNlKCAnLicsICcnICksXG5cdFx0XHRcdHN0YXJ0TGluayA9ICdnZW5lc2lzLScgKyBuZXdWYWx1ZSxcblx0XHRcdFx0ZW5kTGluayAgID0gJ2dlbmVzaXMtbW9iaWxlLScgKyBuZXdWYWx1ZTtcblxuXHRcdFx0aWYgKCAnbm9uZScgPT0gX2dldERpc3BsYXlWYWx1ZSggYnV0dG9ucyApICkge1xuXHRcdFx0XHRzdGFydExpbmsgPSAnZ2VuZXNpcy1tb2JpbGUtJyArIG5ld1ZhbHVlO1xuXHRcdFx0XHRlbmRMaW5rICAgPSAnZ2VuZXNpcy0nICsgbmV3VmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciAkaXRlbSA9ICQoICcuZ2VuZXNpcy1za2lwLWxpbmsgYVtocmVmPVwiIycgKyBzdGFydExpbmsgKyAnXCJdJyApO1xuXG5cdFx0XHRpZiAoIG1lbnVzVG9Db21iaW5lICE9PSBudWxsICYmIHZhbHVlICE9PSBtZW51c1RvQ29tYmluZVswXSApIHtcblx0XHRcdFx0JGl0ZW0udG9nZ2xlQ2xhc3MoICdza2lwLWxpbmstaGlkZGVuJyApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICRpdGVtLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRcdHZhciBsaW5rICA9ICRpdGVtLmF0dHIoICdocmVmJyApO1xuXHRcdFx0XHRcdGxpbmsgID0gbGluay5yZXBsYWNlKCBzdGFydExpbmssIGVuZExpbmsgKTtcblxuXHRcdFx0XHQkaXRlbS5hdHRyKCAnaHJlZicsIGxpbmsgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cdH1cblxuXHQvKipcblx0ICogQ2xvc2UgYWxsIHRoZSBtZW51IHRvZ2dsZXMgaWYgYnV0dG9ucyBhcmUgaGlkZGVuLlxuXHQgKiBAcGFyYW0gYnV0dG9uc1xuXHQgKi9cblx0ZnVuY3Rpb24gX21heWJlQ2xvc2UoIGJ1dHRvbnMgKSB7XG5cdFx0aWYgKCAnbm9uZScgIT09IF9nZXREaXNwbGF5VmFsdWUoIGJ1dHRvbnMgKSApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdCQoICcuJyArIG1haW5NZW51QnV0dG9uQ2xhc3MgKyAnLCAuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnIC5zdWItbWVudS10b2dnbGUnIClcblx0XHRcdC5yZW1vdmVDbGFzcyggJ2FjdGl2YXRlZCcgKVxuXHRcdFx0LmF0dHIoICdhcmlhLWV4cGFuZGVkJywgZmFsc2UgKVxuXHRcdFx0LmF0dHIoICdhcmlhLXByZXNzZWQnLCBmYWxzZSApO1xuXG5cdFx0JCggJy4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcsIC4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLnN1Yi1tZW51JyApXG5cdFx0XHQuYXR0ciggJ3N0eWxlJywgJycgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZW5lcmljIGZ1bmN0aW9uIHRvIGdldCB0aGUgZGlzcGxheSB2YWx1ZSBvZiBhbiBlbGVtZW50LlxuXHQgKiBAcGFyYW0gIHtpZH0gJGlkIElEIHRvIGNoZWNrXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gICAgIENTUyB2YWx1ZSBvZiBkaXNwbGF5IHByb3BlcnR5XG5cdCAqL1xuXHRmdW5jdGlvbiBfZ2V0RGlzcGxheVZhbHVlKCAkaWQgKSB7XG5cdFx0dmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJGlkICksXG5cdFx0XHRzdHlsZSAgID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoIGVsZW1lbnQgKTtcblx0XHRyZXR1cm4gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSggJ2Rpc3BsYXknICk7XG5cdH1cblxuXHQvKipcblx0ICogVG9nZ2xlIGFyaWEgYXR0cmlidXRlcy5cblx0ICogQHBhcmFtICB7YnV0dG9ufSAkdGhpcyAgICAgcGFzc2VkIHRocm91Z2hcblx0ICogQHBhcmFtICB7YXJpYS14eH0gYXR0cmlidXRlIGFyaWEgYXR0cmlidXRlIHRvIHRvZ2dsZVxuXHQgKiBAcmV0dXJuIHtib29sfSAgICAgICAgICAgZnJvbSBfYXJpYVJldHVyblxuXHQgKi9cblx0ZnVuY3Rpb24gX3RvZ2dsZUFyaWEoICR0aGlzLCBhdHRyaWJ1dGUgKSB7XG5cdFx0JHRoaXMuYXR0ciggYXR0cmlidXRlLCBmdW5jdGlvbiggaW5kZXgsIHZhbHVlICkge1xuXHRcdFx0cmV0dXJuICdmYWxzZScgPT09IHZhbHVlO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciBmdW5jdGlvbiB0byByZXR1cm4gYSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIG9mIG1lbnUgc2VsZWN0b3JzLlxuXHQgKiBAcGFyYW0ge2l0ZW1BcnJheX0gQXJyYXkgb2YgbWVudSBpdGVtcyB0byBsb29wIHRocm91Z2guXG5cdCAqIEBwYXJhbSB7aWdub3JlU2Vjb25kYXJ5fSBib29sZWFuIG9mIHdoZXRoZXIgdG8gaWdub3JlIHRoZSAnc2Vjb25kYXJ5JyBtZW51IGl0ZW0uXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gQ29tbWEtc2VwYXJhdGVkIHN0cmluZy5cblx0ICovXG5cdGZ1bmN0aW9uIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGl0ZW1BcnJheSApIHtcblxuXHRcdHZhciBpdGVtU3RyaW5nID0gJC5tYXAoIGl0ZW1BcnJheSwgZnVuY3Rpb24oIHZhbHVlLCBrZXkgKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gaXRlbVN0cmluZy5qb2luKCAnLCcgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciBmdW5jdGlvbiB0byByZXR1cm4gYSBncm91cCBhcnJheSBvZiBhbGwgdGhlIG1lbnVzIGluXG5cdCAqIGJvdGggdGhlICdvdGhlcnMnIGFuZCAnY29tYmluZScgYXJyYXlzLlxuXHQgKiBAcmV0dXJuIHthcnJheX0gQXJyYXkgb2YgYWxsIG1lbnUgaXRlbXMgYXMgY2xhc3Mgc2VsZWN0b3JzLlxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldEFsbE1lbnVzQXJyYXkoKSB7XG5cblx0XHQvLyBTdGFydCB3aXRoIGFuIGVtcHR5IGFycmF5LlxuXHRcdHZhciBtZW51TGlzdCA9IFtdO1xuXG5cdFx0Ly8gSWYgdGhlcmUgYXJlIG1lbnVzIGluIHRoZSAnbWVudXNUb0NvbWJpbmUnIGFycmF5LCBhZGQgdGhlbSB0byAnbWVudUxpc3QnLlxuXHRcdGlmICggbWVudXNUb0NvbWJpbmUgIT09IG51bGwgKSB7XG5cblx0XHRcdCQuZWFjaCggbWVudXNUb0NvbWJpbmUsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdFx0XHRtZW51TGlzdC5wdXNoKCB2YWx1ZS52YWx1ZU9mKCkgKTtcblx0XHRcdH0pO1xuXG5cdFx0fVxuXG5cdFx0Ly8gQWRkIG1lbnVzIGluIHRoZSAnb3RoZXJzJyBhcnJheSB0byAnbWVudUxpc3QnLlxuXHRcdCQuZWFjaCggZ2VuZXNpc01lbnVzLm90aGVycywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRtZW51TGlzdC5wdXNoKCB2YWx1ZS52YWx1ZU9mKCkgKTtcblx0XHR9KTtcblxuXHRcdGlmICggbWVudUxpc3QubGVuZ3RoID4gMCApIHtcblx0XHRcdHJldHVybiBtZW51TGlzdDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdH1cblxuXHQkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoIF9nZXRBbGxNZW51c0FycmF5KCkgIT09IG51bGwgKSB7XG5cblx0XHRcdGdlbmVzaXNNZW51LmluaXQoKTtcblxuXHRcdH1cblxuXHR9KTtcblxuXG59KSggZG9jdW1lbnQsIGpRdWVyeSApO1xuIiwiLyoqXG4gKiBob3ZlckludGVudCBpcyBzaW1pbGFyIHRvIGpRdWVyeSdzIGJ1aWx0LWluIFwiaG92ZXJcIiBtZXRob2QgZXhjZXB0IHRoYXRcbiAqIGluc3RlYWQgb2YgZmlyaW5nIHRoZSBoYW5kbGVySW4gZnVuY3Rpb24gaW1tZWRpYXRlbHksIGhvdmVySW50ZW50IGNoZWNrc1xuICogdG8gc2VlIGlmIHRoZSB1c2VyJ3MgbW91c2UgaGFzIHNsb3dlZCBkb3duIChiZW5lYXRoIHRoZSBzZW5zaXRpdml0eVxuICogdGhyZXNob2xkKSBiZWZvcmUgZmlyaW5nIHRoZSBldmVudC4gVGhlIGhhbmRsZXJPdXQgZnVuY3Rpb24gaXMgb25seVxuICogY2FsbGVkIGFmdGVyIGEgbWF0Y2hpbmcgaGFuZGxlckluLlxuICpcbiAqIGhvdmVySW50ZW50IHI3IC8vIDIwMTMuMDMuMTEgLy8galF1ZXJ5IDEuOS4xK1xuICogaHR0cDovL2NoZXJuZS5uZXQvYnJpYW4vcmVzb3VyY2VzL2pxdWVyeS5ob3ZlckludGVudC5odG1sXG4gKlxuICogWW91IG1heSB1c2UgaG92ZXJJbnRlbnQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgbGljZW5zZS4gQmFzaWNhbGx5IHRoYXRcbiAqIG1lYW5zIHlvdSBhcmUgZnJlZSB0byB1c2UgaG92ZXJJbnRlbnQgYXMgbG9uZyBhcyB0aGlzIGhlYWRlciBpcyBsZWZ0IGludGFjdC5cbiAqIENvcHlyaWdodCAyMDA3LCAyMDEzIEJyaWFuIENoZXJuZVxuICpcbiAqIC8vIGJhc2ljIHVzYWdlIC4uLiBqdXN0IGxpa2UgLmhvdmVyKClcbiAqIC5ob3ZlckludGVudCggaGFuZGxlckluLCBoYW5kbGVyT3V0IClcbiAqIC5ob3ZlckludGVudCggaGFuZGxlckluT3V0IClcbiAqXG4gKiAvLyBiYXNpYyB1c2FnZSAuLi4gd2l0aCBldmVudCBkZWxlZ2F0aW9uIVxuICogLmhvdmVySW50ZW50KCBoYW5kbGVySW4sIGhhbmRsZXJPdXQsIHNlbGVjdG9yIClcbiAqIC5ob3ZlckludGVudCggaGFuZGxlckluT3V0LCBzZWxlY3RvciApXG4gKlxuICogLy8gdXNpbmcgYSBiYXNpYyBjb25maWd1cmF0aW9uIG9iamVjdFxuICogLmhvdmVySW50ZW50KCBjb25maWcgKVxuICpcbiAqIEBwYXJhbSAgaGFuZGxlckluICAgZnVuY3Rpb24gT1IgY29uZmlndXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSAgaGFuZGxlck91dCAgZnVuY3Rpb24gT1Igc2VsZWN0b3IgZm9yIGRlbGVnYXRpb24gT1IgdW5kZWZpbmVkXG4gKiBAcGFyYW0gIHNlbGVjdG9yICAgIHNlbGVjdG9yIE9SIHVuZGVmaW5lZFxuICogQGF1dGhvciBCcmlhbiBDaGVybmUgPGJyaWFuKGF0KWNoZXJuZShkb3QpbmV0PlxuICoqL1xuKGZ1bmN0aW9uKCQpIHtcbiAgICAkLmZuLmhvdmVySW50ZW50ID0gZnVuY3Rpb24oaGFuZGxlckluLGhhbmRsZXJPdXQsc2VsZWN0b3IpIHtcblxuICAgICAgICAvLyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gdmFsdWVzXG4gICAgICAgIHZhciBjZmcgPSB7XG4gICAgICAgICAgICBpbnRlcnZhbDogMTAwLFxuICAgICAgICAgICAgc2Vuc2l0aXZpdHk6IDcsXG4gICAgICAgICAgICB0aW1lb3V0OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCB0eXBlb2YgaGFuZGxlckluID09PSBcIm9iamVjdFwiICkge1xuICAgICAgICAgICAgY2ZnID0gJC5leHRlbmQoY2ZnLCBoYW5kbGVySW4gKTtcbiAgICAgICAgfSBlbHNlIGlmICgkLmlzRnVuY3Rpb24oaGFuZGxlck91dCkpIHtcbiAgICAgICAgICAgIGNmZyA9ICQuZXh0ZW5kKGNmZywgeyBvdmVyOiBoYW5kbGVySW4sIG91dDogaGFuZGxlck91dCwgc2VsZWN0b3I6IHNlbGVjdG9yIH0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNmZyA9ICQuZXh0ZW5kKGNmZywgeyBvdmVyOiBoYW5kbGVySW4sIG91dDogaGFuZGxlckluLCBzZWxlY3RvcjogaGFuZGxlck91dCB9ICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbnN0YW50aWF0ZSB2YXJpYWJsZXNcbiAgICAgICAgLy8gY1gsIGNZID0gY3VycmVudCBYIGFuZCBZIHBvc2l0aW9uIG9mIG1vdXNlLCB1cGRhdGVkIGJ5IG1vdXNlbW92ZSBldmVudFxuICAgICAgICAvLyBwWCwgcFkgPSBwcmV2aW91cyBYIGFuZCBZIHBvc2l0aW9uIG9mIG1vdXNlLCBzZXQgYnkgbW91c2VvdmVyIGFuZCBwb2xsaW5nIGludGVydmFsXG4gICAgICAgIHZhciBjWCwgY1ksIHBYLCBwWTtcblxuICAgICAgICAvLyBBIHByaXZhdGUgZnVuY3Rpb24gZm9yIGdldHRpbmcgbW91c2UgcG9zaXRpb25cbiAgICAgICAgdmFyIHRyYWNrID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgICAgIGNYID0gZXYucGFnZVg7XG4gICAgICAgICAgICBjWSA9IGV2LnBhZ2VZO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEEgcHJpdmF0ZSBmdW5jdGlvbiBmb3IgY29tcGFyaW5nIGN1cnJlbnQgYW5kIHByZXZpb3VzIG1vdXNlIHBvc2l0aW9uXG4gICAgICAgIHZhciBjb21wYXJlID0gZnVuY3Rpb24oZXYsb2IpIHtcbiAgICAgICAgICAgIG9iLmhvdmVySW50ZW50X3QgPSBjbGVhclRpbWVvdXQob2IuaG92ZXJJbnRlbnRfdCk7XG4gICAgICAgICAgICAvLyBjb21wYXJlIG1vdXNlIHBvc2l0aW9ucyB0byBzZWUgaWYgdGhleSd2ZSBjcm9zc2VkIHRoZSB0aHJlc2hvbGRcbiAgICAgICAgICAgIGlmICggKCBNYXRoLmFicyhwWC1jWCkgKyBNYXRoLmFicyhwWS1jWSkgKSA8IGNmZy5zZW5zaXRpdml0eSApIHtcbiAgICAgICAgICAgICAgICAkKG9iKS5vZmYoXCJtb3VzZW1vdmUuaG92ZXJJbnRlbnRcIix0cmFjayk7XG4gICAgICAgICAgICAgICAgLy8gc2V0IGhvdmVySW50ZW50IHN0YXRlIHRvIHRydWUgKHNvIG1vdXNlT3V0IGNhbiBiZSBjYWxsZWQpXG4gICAgICAgICAgICAgICAgb2IuaG92ZXJJbnRlbnRfcyA9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNmZy5vdmVyLmFwcGx5KG9iLFtldl0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBzZXQgcHJldmlvdXMgY29vcmRpbmF0ZXMgZm9yIG5leHQgdGltZVxuICAgICAgICAgICAgICAgIHBYID0gY1g7IHBZID0gY1k7XG4gICAgICAgICAgICAgICAgLy8gdXNlIHNlbGYtY2FsbGluZyB0aW1lb3V0LCBndWFyYW50ZWVzIGludGVydmFscyBhcmUgc3BhY2VkIG91dCBwcm9wZXJseSAoYXZvaWRzIEphdmFTY3JpcHQgdGltZXIgYnVncylcbiAgICAgICAgICAgICAgICBvYi5ob3ZlckludGVudF90ID0gc2V0VGltZW91dCggZnVuY3Rpb24oKXtjb21wYXJlKGV2LCBvYik7fSAsIGNmZy5pbnRlcnZhbCApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEEgcHJpdmF0ZSBmdW5jdGlvbiBmb3IgZGVsYXlpbmcgdGhlIG1vdXNlT3V0IGZ1bmN0aW9uXG4gICAgICAgIHZhciBkZWxheSA9IGZ1bmN0aW9uKGV2LG9iKSB7XG4gICAgICAgICAgICBvYi5ob3ZlckludGVudF90ID0gY2xlYXJUaW1lb3V0KG9iLmhvdmVySW50ZW50X3QpO1xuICAgICAgICAgICAgb2IuaG92ZXJJbnRlbnRfcyA9IDA7XG4gICAgICAgICAgICByZXR1cm4gY2ZnLm91dC5hcHBseShvYixbZXZdKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBIHByaXZhdGUgZnVuY3Rpb24gZm9yIGhhbmRsaW5nIG1vdXNlICdob3ZlcmluZydcbiAgICAgICAgdmFyIGhhbmRsZUhvdmVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgLy8gY29weSBvYmplY3RzIHRvIGJlIHBhc3NlZCBpbnRvIHQgKHJlcXVpcmVkIGZvciBldmVudCBvYmplY3QgdG8gYmUgcGFzc2VkIGluIElFKVxuICAgICAgICAgICAgdmFyIGV2ID0galF1ZXJ5LmV4dGVuZCh7fSxlKTtcbiAgICAgICAgICAgIHZhciBvYiA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIGNhbmNlbCBob3ZlckludGVudCB0aW1lciBpZiBpdCBleGlzdHNcbiAgICAgICAgICAgIGlmIChvYi5ob3ZlckludGVudF90KSB7IG9iLmhvdmVySW50ZW50X3QgPSBjbGVhclRpbWVvdXQob2IuaG92ZXJJbnRlbnRfdCk7IH1cblxuICAgICAgICAgICAgLy8gaWYgZS50eXBlID09IFwibW91c2VlbnRlclwiXG4gICAgICAgICAgICBpZiAoZS50eXBlID09IFwibW91c2VlbnRlclwiKSB7XG4gICAgICAgICAgICAgICAgLy8gc2V0IFwicHJldmlvdXNcIiBYIGFuZCBZIHBvc2l0aW9uIGJhc2VkIG9uIGluaXRpYWwgZW50cnkgcG9pbnRcbiAgICAgICAgICAgICAgICBwWCA9IGV2LnBhZ2VYOyBwWSA9IGV2LnBhZ2VZO1xuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBcImN1cnJlbnRcIiBYIGFuZCBZIHBvc2l0aW9uIGJhc2VkIG9uIG1vdXNlbW92ZVxuICAgICAgICAgICAgICAgICQob2IpLm9uKFwibW91c2Vtb3ZlLmhvdmVySW50ZW50XCIsdHJhY2spO1xuICAgICAgICAgICAgICAgIC8vIHN0YXJ0IHBvbGxpbmcgaW50ZXJ2YWwgKHNlbGYtY2FsbGluZyB0aW1lb3V0KSB0byBjb21wYXJlIG1vdXNlIGNvb3JkaW5hdGVzIG92ZXIgdGltZVxuICAgICAgICAgICAgICAgIGlmIChvYi5ob3ZlckludGVudF9zICE9IDEpIHsgb2IuaG92ZXJJbnRlbnRfdCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7Y29tcGFyZShldixvYik7fSAsIGNmZy5pbnRlcnZhbCApO31cblxuICAgICAgICAgICAgICAgIC8vIGVsc2UgZS50eXBlID09IFwibW91c2VsZWF2ZVwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHVuYmluZCBleHBlbnNpdmUgbW91c2Vtb3ZlIGV2ZW50XG4gICAgICAgICAgICAgICAgJChvYikub2ZmKFwibW91c2Vtb3ZlLmhvdmVySW50ZW50XCIsdHJhY2spO1xuICAgICAgICAgICAgICAgIC8vIGlmIGhvdmVySW50ZW50IHN0YXRlIGlzIHRydWUsIHRoZW4gY2FsbCB0aGUgbW91c2VPdXQgZnVuY3Rpb24gYWZ0ZXIgdGhlIHNwZWNpZmllZCBkZWxheVxuICAgICAgICAgICAgICAgIGlmIChvYi5ob3ZlckludGVudF9zID09IDEpIHsgb2IuaG92ZXJJbnRlbnRfdCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7ZGVsYXkoZXYsb2IpO30gLCBjZmcudGltZW91dCApO31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBsaXN0ZW4gZm9yIG1vdXNlZW50ZXIgYW5kIG1vdXNlbGVhdmVcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeydtb3VzZWVudGVyLmhvdmVySW50ZW50JzpoYW5kbGVIb3ZlciwnbW91c2VsZWF2ZS5ob3ZlckludGVudCc6aGFuZGxlSG92ZXJ9LCBjZmcuc2VsZWN0b3IpO1xuICAgIH07XG59KShqUXVlcnkpOyIsIi8qIVxuICogaW1hZ2VzTG9hZGVkIFBBQ0tBR0VEIHY0LjEuNFxuICogSmF2YVNjcmlwdCBpcyBhbGwgbGlrZSBcIllvdSBpbWFnZXMgYXJlIGRvbmUgeWV0IG9yIHdoYXQ/XCJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLyoqXG4gKiBFdkVtaXR0ZXIgdjEuMS4wXG4gKiBMaWwnIGV2ZW50IGVtaXR0ZXJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLyoganNoaW50IHVudXNlZDogdHJ1ZSwgdW5kZWY6IHRydWUsIHN0cmljdDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCBnbG9iYWwsIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKiBnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCB3aW5kb3cgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTUQgLSBSZXF1aXJlSlNcbiAgICBkZWZpbmUoICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInLGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KUyAtIEJyb3dzZXJpZnksIFdlYnBhY2tcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBnbG9iYWwuRXZFbWl0dGVyID0gZmFjdG9yeSgpO1xuICB9XG5cbn0oIHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLCBmdW5jdGlvbigpIHtcblxuXG5cbmZ1bmN0aW9uIEV2RW1pdHRlcigpIHt9XG5cbnZhciBwcm90byA9IEV2RW1pdHRlci5wcm90b3R5cGU7XG5cbnByb3RvLm9uID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNldCBldmVudHMgaGFzaFxuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICAvLyBzZXQgbGlzdGVuZXJzIGFycmF5XG4gIHZhciBsaXN0ZW5lcnMgPSBldmVudHNbIGV2ZW50TmFtZSBdID0gZXZlbnRzWyBldmVudE5hbWUgXSB8fCBbXTtcbiAgLy8gb25seSBhZGQgb25jZVxuICBpZiAoIGxpc3RlbmVycy5pbmRleE9mKCBsaXN0ZW5lciApID09IC0xICkge1xuICAgIGxpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vbmNlID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGFkZCBldmVudFxuICB0aGlzLm9uKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gIC8vIHNldCBvbmNlIGZsYWdcbiAgLy8gc2V0IG9uY2VFdmVudHMgaGFzaFxuICB2YXIgb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzIHx8IHt9O1xuICAvLyBzZXQgb25jZUxpc3RlbmVycyBvYmplY3RcbiAgdmFyIG9uY2VMaXN0ZW5lcnMgPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdIHx8IHt9O1xuICAvLyBzZXQgZmxhZ1xuICBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLm9mZiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgYXJncyApIHtcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGNvcHkgb3ZlciB0byBhdm9pZCBpbnRlcmZlcmVuY2UgaWYgLm9mZigpIGluIGxpc3RlbmVyXG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSgwKTtcbiAgYXJncyA9IGFyZ3MgfHwgW107XG4gIC8vIG9uY2Ugc3R1ZmZcbiAgdmFyIG9uY2VMaXN0ZW5lcnMgPSB0aGlzLl9vbmNlRXZlbnRzICYmIHRoaXMuX29uY2VFdmVudHNbIGV2ZW50TmFtZSBdO1xuXG4gIGZvciAoIHZhciBpPTA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldXG4gICAgdmFyIGlzT25jZSA9IG9uY2VMaXN0ZW5lcnMgJiYgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICBpZiAoIGlzT25jZSApIHtcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgICAgLy8gcmVtb3ZlIGJlZm9yZSB0cmlnZ2VyIHRvIHByZXZlbnQgcmVjdXJzaW9uXG4gICAgICB0aGlzLm9mZiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAgICAgLy8gdW5zZXQgb25jZSBmbGFnXG4gICAgICBkZWxldGUgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgLy8gdHJpZ2dlciBsaXN0ZW5lclxuICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmFsbE9mZiA9IGZ1bmN0aW9uKCkge1xuICBkZWxldGUgdGhpcy5fZXZlbnRzO1xuICBkZWxldGUgdGhpcy5fb25jZUV2ZW50cztcbn07XG5cbnJldHVybiBFdkVtaXR0ZXI7XG5cbn0pKTtcblxuLyohXG4gKiBpbWFnZXNMb2FkZWQgdjQuMS40XG4gKiBKYXZhU2NyaXB0IGlzIGFsbCBsaWtlIFwiWW91IGltYWdlcyBhcmUgZG9uZSB5ZXQgb3Igd2hhdD9cIlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7ICd1c2Ugc3RyaWN0JztcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG5cbiAgLypnbG9iYWwgZGVmaW5lOiBmYWxzZSwgbW9kdWxlOiBmYWxzZSwgcmVxdWlyZTogZmFsc2UgKi9cblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2V2LWVtaXR0ZXIvZXYtZW1pdHRlcidcbiAgICBdLCBmdW5jdGlvbiggRXZFbWl0dGVyICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdldi1lbWl0dGVyJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LmltYWdlc0xvYWRlZCA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuRXZFbWl0dGVyXG4gICAgKTtcbiAgfVxuXG59KSggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLFxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgZmFjdG9yeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApIHtcblxuXG5cbnZhciAkID0gd2luZG93LmpRdWVyeTtcbnZhciBjb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZXh0ZW5kIG9iamVjdHNcbmZ1bmN0aW9uIGV4dGVuZCggYSwgYiApIHtcbiAgZm9yICggdmFyIHByb3AgaW4gYiApIHtcbiAgICBhWyBwcm9wIF0gPSBiWyBwcm9wIF07XG4gIH1cbiAgcmV0dXJuIGE7XG59XG5cbnZhciBhcnJheVNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4vLyB0dXJuIGVsZW1lbnQgb3Igbm9kZUxpc3QgaW50byBhbiBhcnJheVxuZnVuY3Rpb24gbWFrZUFycmF5KCBvYmogKSB7XG4gIGlmICggQXJyYXkuaXNBcnJheSggb2JqICkgKSB7XG4gICAgLy8gdXNlIG9iamVjdCBpZiBhbHJlYWR5IGFuIGFycmF5XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciBpc0FycmF5TGlrZSA9IHR5cGVvZiBvYmogPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iai5sZW5ndGggPT0gJ251bWJlcic7XG4gIGlmICggaXNBcnJheUxpa2UgKSB7XG4gICAgLy8gY29udmVydCBub2RlTGlzdCB0byBhcnJheVxuICAgIHJldHVybiBhcnJheVNsaWNlLmNhbGwoIG9iaiApO1xuICB9XG5cbiAgLy8gYXJyYXkgb2Ygc2luZ2xlIGluZGV4XG4gIHJldHVybiBbIG9iaiBdO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBpbWFnZXNMb2FkZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBAcGFyYW0ge0FycmF5LCBFbGVtZW50LCBOb2RlTGlzdCwgU3RyaW5nfSBlbGVtXG4gKiBAcGFyYW0ge09iamVjdCBvciBGdW5jdGlvbn0gb3B0aW9ucyAtIGlmIGZ1bmN0aW9uLCB1c2UgYXMgY2FsbGJhY2tcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9uQWx3YXlzIC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gSW1hZ2VzTG9hZGVkKCBlbGVtLCBvcHRpb25zLCBvbkFsd2F5cyApIHtcbiAgLy8gY29lcmNlIEltYWdlc0xvYWRlZCgpIHdpdGhvdXQgbmV3LCB0byBiZSBuZXcgSW1hZ2VzTG9hZGVkKClcbiAgaWYgKCAhKCB0aGlzIGluc3RhbmNlb2YgSW1hZ2VzTG9hZGVkICkgKSB7XG4gICAgcmV0dXJuIG5ldyBJbWFnZXNMb2FkZWQoIGVsZW0sIG9wdGlvbnMsIG9uQWx3YXlzICk7XG4gIH1cbiAgLy8gdXNlIGVsZW0gYXMgc2VsZWN0b3Igc3RyaW5nXG4gIHZhciBxdWVyeUVsZW0gPSBlbGVtO1xuICBpZiAoIHR5cGVvZiBlbGVtID09ICdzdHJpbmcnICkge1xuICAgIHF1ZXJ5RWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIGVsZW0gKTtcbiAgfVxuICAvLyBiYWlsIGlmIGJhZCBlbGVtZW50XG4gIGlmICggIXF1ZXJ5RWxlbSApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnQmFkIGVsZW1lbnQgZm9yIGltYWdlc0xvYWRlZCAnICsgKCBxdWVyeUVsZW0gfHwgZWxlbSApICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5lbGVtZW50cyA9IG1ha2VBcnJheSggcXVlcnlFbGVtICk7XG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZCgge30sIHRoaXMub3B0aW9ucyApO1xuICAvLyBzaGlmdCBhcmd1bWVudHMgaWYgbm8gb3B0aW9ucyBzZXRcbiAgaWYgKCB0eXBlb2Ygb3B0aW9ucyA9PSAnZnVuY3Rpb24nICkge1xuICAgIG9uQWx3YXlzID0gb3B0aW9ucztcbiAgfSBlbHNlIHtcbiAgICBleHRlbmQoIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xuICB9XG5cbiAgaWYgKCBvbkFsd2F5cyApIHtcbiAgICB0aGlzLm9uKCAnYWx3YXlzJywgb25BbHdheXMgKTtcbiAgfVxuXG4gIHRoaXMuZ2V0SW1hZ2VzKCk7XG5cbiAgaWYgKCAkICkge1xuICAgIC8vIGFkZCBqUXVlcnkgRGVmZXJyZWQgb2JqZWN0XG4gICAgdGhpcy5qcURlZmVycmVkID0gbmV3ICQuRGVmZXJyZWQoKTtcbiAgfVxuXG4gIC8vIEhBQ0sgY2hlY2sgYXN5bmMgdG8gYWxsb3cgdGltZSB0byBiaW5kIGxpc3RlbmVyc1xuICBzZXRUaW1lb3V0KCB0aGlzLmNoZWNrLmJpbmQoIHRoaXMgKSApO1xufVxuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLm9wdGlvbnMgPSB7fTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5nZXRJbWFnZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWFnZXMgPSBbXTtcblxuICAvLyBmaWx0ZXIgJiBmaW5kIGl0ZW1zIGlmIHdlIGhhdmUgYW4gaXRlbSBzZWxlY3RvclxuICB0aGlzLmVsZW1lbnRzLmZvckVhY2goIHRoaXMuYWRkRWxlbWVudEltYWdlcywgdGhpcyApO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnRcbiAqL1xuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRFbGVtZW50SW1hZ2VzID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIC8vIGZpbHRlciBzaWJsaW5nc1xuICBpZiAoIGVsZW0ubm9kZU5hbWUgPT0gJ0lNRycgKSB7XG4gICAgdGhpcy5hZGRJbWFnZSggZWxlbSApO1xuICB9XG4gIC8vIGdldCBiYWNrZ3JvdW5kIGltYWdlIG9uIGVsZW1lbnRcbiAgaWYgKCB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCA9PT0gdHJ1ZSApIHtcbiAgICB0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKCBlbGVtICk7XG4gIH1cblxuICAvLyBmaW5kIGNoaWxkcmVuXG4gIC8vIG5vIG5vbi1lbGVtZW50IG5vZGVzLCAjMTQzXG4gIHZhciBub2RlVHlwZSA9IGVsZW0ubm9kZVR5cGU7XG4gIGlmICggIW5vZGVUeXBlIHx8ICFlbGVtZW50Tm9kZVR5cGVzWyBub2RlVHlwZSBdICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgY2hpbGRJbWdzID0gZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKTtcbiAgLy8gY29uY2F0IGNoaWxkRWxlbXMgdG8gZmlsdGVyRm91bmQgYXJyYXlcbiAgZm9yICggdmFyIGk9MDsgaSA8IGNoaWxkSW1ncy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgaW1nID0gY2hpbGRJbWdzW2ldO1xuICAgIHRoaXMuYWRkSW1hZ2UoIGltZyApO1xuICB9XG5cbiAgLy8gZ2V0IGNoaWxkIGJhY2tncm91bmQgaW1hZ2VzXG4gIGlmICggdHlwZW9mIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kID09ICdzdHJpbmcnICkge1xuICAgIHZhciBjaGlsZHJlbiA9IGVsZW0ucXVlcnlTZWxlY3RvckFsbCggdGhpcy5vcHRpb25zLmJhY2tncm91bmQgKTtcbiAgICBmb3IgKCBpPTA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgdGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyggY2hpbGQgKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBlbGVtZW50Tm9kZVR5cGVzID0ge1xuICAxOiB0cnVlLFxuICA5OiB0cnVlLFxuICAxMTogdHJ1ZVxufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKCBlbGVtICk7XG4gIGlmICggIXN0eWxlICkge1xuICAgIC8vIEZpcmVmb3ggcmV0dXJucyBudWxsIGlmIGluIGEgaGlkZGVuIGlmcmFtZSBodHRwczovL2J1Z3ppbC5sYS81NDgzOTdcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZ2V0IHVybCBpbnNpZGUgdXJsKFwiLi4uXCIpXG4gIHZhciByZVVSTCA9IC91cmxcXCgoWydcIl0pPyguKj8pXFwxXFwpL2dpO1xuICB2YXIgbWF0Y2hlcyA9IHJlVVJMLmV4ZWMoIHN0eWxlLmJhY2tncm91bmRJbWFnZSApO1xuICB3aGlsZSAoIG1hdGNoZXMgIT09IG51bGwgKSB7XG4gICAgdmFyIHVybCA9IG1hdGNoZXMgJiYgbWF0Y2hlc1syXTtcbiAgICBpZiAoIHVybCApIHtcbiAgICAgIHRoaXMuYWRkQmFja2dyb3VuZCggdXJsLCBlbGVtICk7XG4gICAgfVxuICAgIG1hdGNoZXMgPSByZVVSTC5leGVjKCBzdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge0ltYWdlfSBpbWdcbiAqL1xuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRJbWFnZSA9IGZ1bmN0aW9uKCBpbWcgKSB7XG4gIHZhciBsb2FkaW5nSW1hZ2UgPSBuZXcgTG9hZGluZ0ltYWdlKCBpbWcgKTtcbiAgdGhpcy5pbWFnZXMucHVzaCggbG9hZGluZ0ltYWdlICk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEJhY2tncm91bmQgPSBmdW5jdGlvbiggdXJsLCBlbGVtICkge1xuICB2YXIgYmFja2dyb3VuZCA9IG5ldyBCYWNrZ3JvdW5kKCB1cmwsIGVsZW0gKTtcbiAgdGhpcy5pbWFnZXMucHVzaCggYmFja2dyb3VuZCApO1xufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLnByb2dyZXNzZWRDb3VudCA9IDA7XG4gIHRoaXMuaGFzQW55QnJva2VuID0gZmFsc2U7XG4gIC8vIGNvbXBsZXRlIGlmIG5vIGltYWdlc1xuICBpZiAoICF0aGlzLmltYWdlcy5sZW5ndGggKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uUHJvZ3Jlc3MoIGltYWdlLCBlbGVtLCBtZXNzYWdlICkge1xuICAgIC8vIEhBQ0sgLSBDaHJvbWUgdHJpZ2dlcnMgZXZlbnQgYmVmb3JlIG9iamVjdCBwcm9wZXJ0aWVzIGhhdmUgY2hhbmdlZC4gIzgzXG4gICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5wcm9ncmVzcyggaW1hZ2UsIGVsZW0sIG1lc3NhZ2UgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuaW1hZ2VzLmZvckVhY2goIGZ1bmN0aW9uKCBsb2FkaW5nSW1hZ2UgKSB7XG4gICAgbG9hZGluZ0ltYWdlLm9uY2UoICdwcm9ncmVzcycsIG9uUHJvZ3Jlc3MgKTtcbiAgICBsb2FkaW5nSW1hZ2UuY2hlY2soKTtcbiAgfSk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24oIGltYWdlLCBlbGVtLCBtZXNzYWdlICkge1xuICB0aGlzLnByb2dyZXNzZWRDb3VudCsrO1xuICB0aGlzLmhhc0FueUJyb2tlbiA9IHRoaXMuaGFzQW55QnJva2VuIHx8ICFpbWFnZS5pc0xvYWRlZDtcbiAgLy8gcHJvZ3Jlc3MgZXZlbnRcbiAgdGhpcy5lbWl0RXZlbnQoICdwcm9ncmVzcycsIFsgdGhpcywgaW1hZ2UsIGVsZW0gXSApO1xuICBpZiAoIHRoaXMuanFEZWZlcnJlZCAmJiB0aGlzLmpxRGVmZXJyZWQubm90aWZ5ICkge1xuICAgIHRoaXMuanFEZWZlcnJlZC5ub3RpZnkoIHRoaXMsIGltYWdlICk7XG4gIH1cbiAgLy8gY2hlY2sgaWYgY29tcGxldGVkXG4gIGlmICggdGhpcy5wcm9ncmVzc2VkQ291bnQgPT0gdGhpcy5pbWFnZXMubGVuZ3RoICkge1xuICAgIHRoaXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIGlmICggdGhpcy5vcHRpb25zLmRlYnVnICYmIGNvbnNvbGUgKSB7XG4gICAgY29uc29sZS5sb2coICdwcm9ncmVzczogJyArIG1lc3NhZ2UsIGltYWdlLCBlbGVtICk7XG4gIH1cbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGV2ZW50TmFtZSA9IHRoaXMuaGFzQW55QnJva2VuID8gJ2ZhaWwnIDogJ2RvbmUnO1xuICB0aGlzLmlzQ29tcGxldGUgPSB0cnVlO1xuICB0aGlzLmVtaXRFdmVudCggZXZlbnROYW1lLCBbIHRoaXMgXSApO1xuICB0aGlzLmVtaXRFdmVudCggJ2Fsd2F5cycsIFsgdGhpcyBdICk7XG4gIGlmICggdGhpcy5qcURlZmVycmVkICkge1xuICAgIHZhciBqcU1ldGhvZCA9IHRoaXMuaGFzQW55QnJva2VuID8gJ3JlamVjdCcgOiAncmVzb2x2ZSc7XG4gICAgdGhpcy5qcURlZmVycmVkWyBqcU1ldGhvZCBdKCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBMb2FkaW5nSW1hZ2UoIGltZyApIHtcbiAgdGhpcy5pbWcgPSBpbWc7XG59XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgLy8gSWYgY29tcGxldGUgaXMgdHJ1ZSBhbmQgYnJvd3NlciBzdXBwb3J0cyBuYXR1cmFsIHNpemVzLFxuICAvLyB0cnkgdG8gY2hlY2sgZm9yIGltYWdlIHN0YXR1cyBtYW51YWxseS5cbiAgdmFyIGlzQ29tcGxldGUgPSB0aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO1xuICBpZiAoIGlzQ29tcGxldGUgKSB7XG4gICAgLy8gcmVwb3J0IGJhc2VkIG9uIG5hdHVyYWxXaWR0aFxuICAgIHRoaXMuY29uZmlybSggdGhpcy5pbWcubmF0dXJhbFdpZHRoICE9PSAwLCAnbmF0dXJhbFdpZHRoJyApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIElmIG5vbmUgb2YgdGhlIGNoZWNrcyBhYm92ZSBtYXRjaGVkLCBzaW11bGF0ZSBsb2FkaW5nIG9uIGRldGFjaGVkIGVsZW1lbnQuXG4gIHRoaXMucHJveHlJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIC8vIGJpbmQgdG8gaW1hZ2UgYXMgd2VsbCBmb3IgRmlyZWZveC4gIzE5MVxuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLnByb3h5SW1hZ2Uuc3JjID0gdGhpcy5pbWcuc3JjO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5nZXRJc0ltYWdlQ29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gY2hlY2sgZm9yIG5vbi16ZXJvLCBub24tdW5kZWZpbmVkIG5hdHVyYWxXaWR0aFxuICAvLyBmaXhlcyBTYWZhcmkrSW5maW5pdGVTY3JvbGwrTWFzb25yeSBidWcgaW5maW5pdGUtc2Nyb2xsIzY3MVxuICByZXR1cm4gdGhpcy5pbWcuY29tcGxldGUgJiYgdGhpcy5pbWcubmF0dXJhbFdpZHRoO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5jb25maXJtID0gZnVuY3Rpb24oIGlzTG9hZGVkLCBtZXNzYWdlICkge1xuICB0aGlzLmlzTG9hZGVkID0gaXNMb2FkZWQ7XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIHRoaXMuaW1nLCBtZXNzYWdlIF0gKTtcbn07XG5cbi8vIC0tLS0tIGV2ZW50cyAtLS0tLSAvL1xuXG4vLyB0cmlnZ2VyIHNwZWNpZmllZCBoYW5kbGVyIGZvciBldmVudCB0eXBlXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29uZmlybSggdHJ1ZSwgJ29ubG9hZCcgKTtcbiAgdGhpcy51bmJpbmRFdmVudHMoKTtcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvbmZpcm0oIGZhbHNlLCAnb25lcnJvcicgKTtcbiAgdGhpcy51bmJpbmRFdmVudHMoKTtcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUudW5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEJhY2tncm91bmQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gQmFja2dyb3VuZCggdXJsLCBlbGVtZW50ICkge1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcbn1cblxuLy8gaW5oZXJpdCBMb2FkaW5nSW1hZ2UgcHJvdG90eXBlXG5CYWNrZ3JvdW5kLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExvYWRpbmdJbWFnZS5wcm90b3R5cGUgKTtcblxuQmFja2dyb3VuZC5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgdGhpcy5pbWcuc3JjID0gdGhpcy51cmw7XG4gIC8vIGNoZWNrIGlmIGltYWdlIGlzIGFscmVhZHkgY29tcGxldGVcbiAgdmFyIGlzQ29tcGxldGUgPSB0aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO1xuICBpZiAoIGlzQ29tcGxldGUgKSB7XG4gICAgdGhpcy5jb25maXJtKCB0aGlzLmltZy5uYXR1cmFsV2lkdGggIT09IDAsICduYXR1cmFsV2lkdGgnICk7XG4gICAgdGhpcy51bmJpbmRFdmVudHMoKTtcbiAgfVxufTtcblxuQmFja2dyb3VuZC5wcm90b3R5cGUudW5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG59O1xuXG5CYWNrZ3JvdW5kLnByb3RvdHlwZS5jb25maXJtID0gZnVuY3Rpb24oIGlzTG9hZGVkLCBtZXNzYWdlICkge1xuICB0aGlzLmlzTG9hZGVkID0gaXNMb2FkZWQ7XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIHRoaXMuZWxlbWVudCwgbWVzc2FnZSBdICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBqUXVlcnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuSW1hZ2VzTG9hZGVkLm1ha2VKUXVlcnlQbHVnaW4gPSBmdW5jdGlvbiggalF1ZXJ5ICkge1xuICBqUXVlcnkgPSBqUXVlcnkgfHwgd2luZG93LmpRdWVyeTtcbiAgaWYgKCAhalF1ZXJ5ICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzZXQgbG9jYWwgdmFyaWFibGVcbiAgJCA9IGpRdWVyeTtcbiAgLy8gJCgpLmltYWdlc0xvYWRlZCgpXG4gICQuZm4uaW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oIG9wdGlvbnMsIGNhbGxiYWNrICkge1xuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBJbWFnZXNMb2FkZWQoIHRoaXMsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG4gICAgcmV0dXJuIGluc3RhbmNlLmpxRGVmZXJyZWQucHJvbWlzZSggJCh0aGlzKSApO1xuICB9O1xufTtcbi8vIHRyeSBtYWtpbmcgcGx1Z2luXG5JbWFnZXNMb2FkZWQubWFrZUpRdWVyeVBsdWdpbigpO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucmV0dXJuIEltYWdlc0xvYWRlZDtcblxufSk7XG5cbiIsIi8qKlxuKiBqcXVlcnktbWF0Y2gtaGVpZ2h0IG1hc3RlciBieSBAbGlhYnJ1XG4qIGh0dHA6Ly9icm0uaW8vanF1ZXJ5LW1hdGNoLWhlaWdodC9cbiogTGljZW5zZTogTUlUXG4qL1xuXG47KGZ1bmN0aW9uKGZhY3RvcnkpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1leHRyYS1zZW1pXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1EXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIC8vIENvbW1vbkpTXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gR2xvYmFsXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KShmdW5jdGlvbigkKSB7XG4gICAgLypcbiAgICAqICBpbnRlcm5hbFxuICAgICovXG5cbiAgICB2YXIgX3ByZXZpb3VzUmVzaXplV2lkdGggPSAtMSxcbiAgICAgICAgX3VwZGF0ZVRpbWVvdXQgPSAtMTtcblxuICAgIC8qXG4gICAgKiAgX3BhcnNlXG4gICAgKiAgdmFsdWUgcGFyc2UgdXRpbGl0eSBmdW5jdGlvblxuICAgICovXG5cbiAgICB2YXIgX3BhcnNlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgLy8gcGFyc2UgdmFsdWUgYW5kIGNvbnZlcnQgTmFOIHRvIDBcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpIHx8IDA7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgX3Jvd3NcbiAgICAqICB1dGlsaXR5IGZ1bmN0aW9uIHJldHVybnMgYXJyYXkgb2YgalF1ZXJ5IHNlbGVjdGlvbnMgcmVwcmVzZW50aW5nIGVhY2ggcm93XG4gICAgKiAgKGFzIGRpc3BsYXllZCBhZnRlciBmbG9hdCB3cmFwcGluZyBhcHBsaWVkIGJ5IGJyb3dzZXIpXG4gICAgKi9cblxuICAgIHZhciBfcm93cyA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgIHZhciB0b2xlcmFuY2UgPSAxLFxuICAgICAgICAgICAgJGVsZW1lbnRzID0gJChlbGVtZW50cyksXG4gICAgICAgICAgICBsYXN0VG9wID0gbnVsbCxcbiAgICAgICAgICAgIHJvd3MgPSBbXTtcblxuICAgICAgICAvLyBncm91cCBlbGVtZW50cyBieSB0aGVpciB0b3AgcG9zaXRpb25cbiAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgdG9wID0gJHRoYXQub2Zmc2V0KCkudG9wIC0gX3BhcnNlKCR0aGF0LmNzcygnbWFyZ2luLXRvcCcpKSxcbiAgICAgICAgICAgICAgICBsYXN0Um93ID0gcm93cy5sZW5ndGggPiAwID8gcm93c1tyb3dzLmxlbmd0aCAtIDFdIDogbnVsbDtcblxuICAgICAgICAgICAgaWYgKGxhc3RSb3cgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBpdGVtIG9uIHRoZSByb3csIHNvIGp1c3QgcHVzaCBpdFxuICAgICAgICAgICAgICAgIHJvd3MucHVzaCgkdGhhdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSByb3cgdG9wIGlzIHRoZSBzYW1lLCBhZGQgdG8gdGhlIHJvdyBncm91cFxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmZsb29yKE1hdGguYWJzKGxhc3RUb3AgLSB0b3ApKSA8PSB0b2xlcmFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcm93c1tyb3dzLmxlbmd0aCAtIDFdID0gbGFzdFJvdy5hZGQoJHRoYXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBzdGFydCBhIG5ldyByb3cgZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKCR0aGF0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIGxhc3Qgcm93IHRvcFxuICAgICAgICAgICAgbGFzdFRvcCA9IHRvcDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJvd3M7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgX3BhcnNlT3B0aW9uc1xuICAgICogIGhhbmRsZSBwbHVnaW4gb3B0aW9uc1xuICAgICovXG5cbiAgICB2YXIgX3BhcnNlT3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICBieVJvdzogdHJ1ZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnaGVpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldDogbnVsbCxcbiAgICAgICAgICAgIHJlbW92ZTogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5leHRlbmQob3B0cywgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgb3B0cy5ieVJvdyA9IG9wdGlvbnM7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucyA9PT0gJ3JlbW92ZScpIHtcbiAgICAgICAgICAgIG9wdHMucmVtb3ZlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgIH07XG5cbiAgICAvKlxuICAgICogIG1hdGNoSGVpZ2h0XG4gICAgKiAgcGx1Z2luIGRlZmluaXRpb25cbiAgICAqL1xuXG4gICAgdmFyIG1hdGNoSGVpZ2h0ID0gJC5mbi5tYXRjaEhlaWdodCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHMgPSBfcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIGhhbmRsZSByZW1vdmVcbiAgICAgICAgaWYgKG9wdHMucmVtb3ZlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSBmaXhlZCBoZWlnaHQgZnJvbSBhbGwgc2VsZWN0ZWQgZWxlbWVudHNcbiAgICAgICAgICAgIHRoaXMuY3NzKG9wdHMucHJvcGVydHksICcnKTtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIHNlbGVjdGVkIGVsZW1lbnRzIGZyb20gYWxsIGdyb3Vwc1xuICAgICAgICAgICAgJC5lYWNoKG1hdGNoSGVpZ2h0Ll9ncm91cHMsIGZ1bmN0aW9uKGtleSwgZ3JvdXApIHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cyA9IGdyb3VwLmVsZW1lbnRzLm5vdCh0aGF0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBjbGVhbnVwIGVtcHR5IGdyb3Vwc1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA8PSAxICYmICFvcHRzLnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIHRoaXMgZ3JvdXAgc28gd2UgY2FuIHJlLWFwcGx5IGxhdGVyIG9uIGxvYWQgYW5kIHJlc2l6ZSBldmVudHNcbiAgICAgICAgbWF0Y2hIZWlnaHQuX2dyb3Vwcy5wdXNoKHtcbiAgICAgICAgICAgIGVsZW1lbnRzOiB0aGlzLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0c1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBtYXRjaCBlYWNoIGVsZW1lbnQncyBoZWlnaHQgdG8gdGhlIHRhbGxlc3QgZWxlbWVudCBpbiB0aGUgc2VsZWN0aW9uXG4gICAgICAgIG1hdGNoSGVpZ2h0Ll9hcHBseSh0aGlzLCBvcHRzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLypcbiAgICAqICBwbHVnaW4gZ2xvYmFsIG9wdGlvbnNcbiAgICAqL1xuXG4gICAgbWF0Y2hIZWlnaHQudmVyc2lvbiA9ICdtYXN0ZXInO1xuICAgIG1hdGNoSGVpZ2h0Ll9ncm91cHMgPSBbXTtcbiAgICBtYXRjaEhlaWdodC5fdGhyb3R0bGUgPSA4MDtcbiAgICBtYXRjaEhlaWdodC5fbWFpbnRhaW5TY3JvbGwgPSBmYWxzZTtcbiAgICBtYXRjaEhlaWdodC5fYmVmb3JlVXBkYXRlID0gbnVsbDtcbiAgICBtYXRjaEhlaWdodC5fYWZ0ZXJVcGRhdGUgPSBudWxsO1xuICAgIG1hdGNoSGVpZ2h0Ll9yb3dzID0gX3Jvd3M7XG4gICAgbWF0Y2hIZWlnaHQuX3BhcnNlID0gX3BhcnNlO1xuICAgIG1hdGNoSGVpZ2h0Ll9wYXJzZU9wdGlvbnMgPSBfcGFyc2VPcHRpb25zO1xuXG4gICAgLypcbiAgICAqICBtYXRjaEhlaWdodC5fYXBwbHlcbiAgICAqICBhcHBseSBtYXRjaEhlaWdodCB0byBnaXZlbiBlbGVtZW50c1xuICAgICovXG5cbiAgICBtYXRjaEhlaWdodC5fYXBwbHkgPSBmdW5jdGlvbihlbGVtZW50cywgb3B0aW9ucykge1xuICAgICAgICB2YXIgb3B0cyA9IF9wYXJzZU9wdGlvbnMob3B0aW9ucyksXG4gICAgICAgICAgICAkZWxlbWVudHMgPSAkKGVsZW1lbnRzKSxcbiAgICAgICAgICAgIHJvd3MgPSBbJGVsZW1lbnRzXTtcblxuICAgICAgICAvLyB0YWtlIG5vdGUgb2Ygc2Nyb2xsIHBvc2l0aW9uXG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXG4gICAgICAgICAgICBodG1sSGVpZ2h0ID0gJCgnaHRtbCcpLm91dGVySGVpZ2h0KHRydWUpO1xuXG4gICAgICAgIC8vIGdldCBoaWRkZW4gcGFyZW50c1xuICAgICAgICB2YXIgJGhpZGRlblBhcmVudHMgPSAkZWxlbWVudHMucGFyZW50cygpLmZpbHRlcignOmhpZGRlbicpO1xuXG4gICAgICAgIC8vIGNhY2hlIHRoZSBvcmlnaW5hbCBpbmxpbmUgc3R5bGVcbiAgICAgICAgJGhpZGRlblBhcmVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyk7XG4gICAgICAgICAgICAkdGhhdC5kYXRhKCdzdHlsZS1jYWNoZScsICR0aGF0LmF0dHIoJ3N0eWxlJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyB0ZW1wb3JhcmlseSBtdXN0IGZvcmNlIGhpZGRlbiBwYXJlbnRzIHZpc2libGVcbiAgICAgICAgJGhpZGRlblBhcmVudHMuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cbiAgICAgICAgLy8gZ2V0IHJvd3MgaWYgdXNpbmcgYnlSb3csIG90aGVyd2lzZSBhc3N1bWUgb25lIHJvd1xuICAgICAgICBpZiAob3B0cy5ieVJvdyAmJiAhb3B0cy50YXJnZXQpIHtcblxuICAgICAgICAgICAgLy8gbXVzdCBmaXJzdCBmb3JjZSBhbiBhcmJpdHJhcnkgZXF1YWwgaGVpZ2h0IHNvIGZsb2F0aW5nIGVsZW1lbnRzIGJyZWFrIGV2ZW5seVxuICAgICAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGF0ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICR0aGF0LmNzcygnZGlzcGxheScpO1xuXG4gICAgICAgICAgICAgICAgLy8gdGVtcG9yYXJpbHkgZm9yY2UgYSB1c2FibGUgZGlzcGxheSB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5ICE9PSAnaW5saW5lLWJsb2NrJyAmJiBkaXNwbGF5ICE9PSAnZmxleCcgJiYgZGlzcGxheSAhPT0gJ2lubGluZS1mbGV4Jykge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBjYWNoZSB0aGUgb3JpZ2luYWwgaW5saW5lIHN0eWxlXG4gICAgICAgICAgICAgICAgJHRoYXQuZGF0YSgnc3R5bGUtY2FjaGUnLCAkdGhhdC5hdHRyKCdzdHlsZScpKTtcblxuICAgICAgICAgICAgICAgICR0aGF0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICdkaXNwbGF5JzogZGlzcGxheSxcbiAgICAgICAgICAgICAgICAgICAgJ3BhZGRpbmctdG9wJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1ib3R0b20nOiAnMCcsXG4gICAgICAgICAgICAgICAgICAgICdtYXJnaW4tdG9wJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAnbWFyZ2luLWJvdHRvbSc6ICcwJyxcbiAgICAgICAgICAgICAgICAgICAgJ2JvcmRlci10b3Atd2lkdGgnOiAnMCcsXG4gICAgICAgICAgICAgICAgICAgICdib3JkZXItYm90dG9tLXdpZHRoJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogJzEwMHB4JyxcbiAgICAgICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBnZXQgdGhlIGFycmF5IG9mIHJvd3MgKGJhc2VkIG9uIGVsZW1lbnQgdG9wIHBvc2l0aW9uKVxuICAgICAgICAgICAgcm93cyA9IF9yb3dzKCRlbGVtZW50cyk7XG5cbiAgICAgICAgICAgIC8vIHJldmVydCBvcmlnaW5hbCBpbmxpbmUgc3R5bGVzXG4gICAgICAgICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICR0aGF0LmF0dHIoJ3N0eWxlJywgJHRoYXQuZGF0YSgnc3R5bGUtY2FjaGUnKSB8fCAnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICQuZWFjaChyb3dzLCBmdW5jdGlvbihrZXksIHJvdykge1xuICAgICAgICAgICAgdmFyICRyb3cgPSAkKHJvdyksXG4gICAgICAgICAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gMDtcblxuICAgICAgICAgICAgaWYgKCFvcHRzLnRhcmdldCkge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgYXBwbHkgdG8gcm93cyB3aXRoIG9ubHkgb25lIGl0ZW1cbiAgICAgICAgICAgICAgICBpZiAob3B0cy5ieVJvdyAmJiAkcm93Lmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICRyb3cuY3NzKG9wdHMucHJvcGVydHksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGUgdGhlIHJvdyBhbmQgZmluZCB0aGUgbWF4IGhlaWdodFxuICAgICAgICAgICAgICAgICRyb3cuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGUgPSAkdGhhdC5hdHRyKCdzdHlsZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICR0aGF0LmNzcygnZGlzcGxheScpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRlbXBvcmFyaWx5IGZvcmNlIGEgdXNhYmxlIGRpc3BsYXkgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXkgIT09ICdpbmxpbmUtYmxvY2snICYmIGRpc3BsYXkgIT09ICdmbGV4JyAmJiBkaXNwbGF5ICE9PSAnaW5saW5lLWZsZXgnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB3ZSBnZXQgdGhlIGNvcnJlY3QgYWN0dWFsIGhlaWdodCAoYW5kIG5vdCBhIHByZXZpb3VzbHkgc2V0IGhlaWdodCB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNzcyA9IHsgJ2Rpc3BsYXknOiBkaXNwbGF5IH07XG4gICAgICAgICAgICAgICAgICAgIGNzc1tvcHRzLnByb3BlcnR5XSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAkdGhhdC5jc3MoY3NzKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIHRoZSBtYXggaGVpZ2h0IChpbmNsdWRpbmcgcGFkZGluZywgYnV0IG5vdCBtYXJnaW4pXG4gICAgICAgICAgICAgICAgICAgIGlmICgkdGhhdC5vdXRlckhlaWdodChmYWxzZSkgPiB0YXJnZXRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEhlaWdodCA9ICR0aGF0Lm91dGVySGVpZ2h0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldmVydCBzdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhhdC5hdHRyKCdzdHlsZScsIHN0eWxlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGF0LmNzcygnZGlzcGxheScsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0YXJnZXQgc2V0LCB1c2UgdGhlIGhlaWdodCBvZiB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICB0YXJnZXRIZWlnaHQgPSBvcHRzLnRhcmdldC5vdXRlckhlaWdodChmYWxzZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGl0ZXJhdGUgdGhlIHJvdyBhbmQgYXBwbHkgdGhlIGhlaWdodCB0byBhbGwgZWxlbWVudHNcbiAgICAgICAgICAgICRyb3cuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUGFkZGluZyA9IDA7XG5cbiAgICAgICAgICAgICAgICAvLyBkb24ndCBhcHBseSB0byBhIHRhcmdldFxuICAgICAgICAgICAgICAgIGlmIChvcHRzLnRhcmdldCAmJiAkdGhhdC5pcyhvcHRzLnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBwYWRkaW5nIGFuZCBib3JkZXIgY29ycmVjdGx5IChyZXF1aXJlZCB3aGVuIG5vdCB1c2luZyBib3JkZXItYm94KVxuICAgICAgICAgICAgICAgIGlmICgkdGhhdC5jc3MoJ2JveC1zaXppbmcnKSAhPT0gJ2JvcmRlci1ib3gnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUGFkZGluZyArPSBfcGFyc2UoJHRoYXQuY3NzKCdib3JkZXItdG9wLXdpZHRoJykpICsgX3BhcnNlKCR0aGF0LmNzcygnYm9yZGVyLWJvdHRvbS13aWR0aCcpKTtcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxQYWRkaW5nICs9IF9wYXJzZSgkdGhhdC5jc3MoJ3BhZGRpbmctdG9wJykpICsgX3BhcnNlKCR0aGF0LmNzcygncGFkZGluZy1ib3R0b20nKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBoZWlnaHQgKGFjY291bnRpbmcgZm9yIHBhZGRpbmcgYW5kIGJvcmRlcilcbiAgICAgICAgICAgICAgICAkdGhhdC5jc3Mob3B0cy5wcm9wZXJ0eSwgKHRhcmdldEhlaWdodCAtIHZlcnRpY2FsUGFkZGluZykgKyAncHgnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyByZXZlcnQgaGlkZGVuIHBhcmVudHNcbiAgICAgICAgJGhpZGRlblBhcmVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyk7XG4gICAgICAgICAgICAkdGhhdC5hdHRyKCdzdHlsZScsICR0aGF0LmRhdGEoJ3N0eWxlLWNhY2hlJykgfHwgbnVsbCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHJlc3RvcmUgc2Nyb2xsIHBvc2l0aW9uIGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKG1hdGNoSGVpZ2h0Ll9tYWludGFpblNjcm9sbCkge1xuICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbFRvcCgoc2Nyb2xsVG9wIC8gaHRtbEhlaWdodCkgKiAkKCdodG1sJykub3V0ZXJIZWlnaHQodHJ1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgbWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaVxuICAgICogIGFwcGxpZXMgbWF0Y2hIZWlnaHQgdG8gYWxsIGVsZW1lbnRzIHdpdGggYSBkYXRhLW1hdGNoLWhlaWdodCBhdHRyaWJ1dGVcbiAgICAqL1xuXG4gICAgbWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ3JvdXBzID0ge307XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgZ3JvdXBzIGJ5IHRoZWlyIGdyb3VwSWQgc2V0IGJ5IGVsZW1lbnRzIHVzaW5nIGRhdGEtbWF0Y2gtaGVpZ2h0XG4gICAgICAgICQoJ1tkYXRhLW1hdGNoLWhlaWdodF0sIFtkYXRhLW1oXScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGdyb3VwSWQgPSAkdGhpcy5hdHRyKCdkYXRhLW1oJykgfHwgJHRoaXMuYXR0cignZGF0YS1tYXRjaC1oZWlnaHQnKTtcblxuICAgICAgICAgICAgaWYgKGdyb3VwSWQgaW4gZ3JvdXBzKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBzW2dyb3VwSWRdID0gZ3JvdXBzW2dyb3VwSWRdLmFkZCgkdGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyb3Vwc1tncm91cElkXSA9ICR0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBhcHBseSBtYXRjaEhlaWdodCB0byBlYWNoIGdyb3VwXG4gICAgICAgICQuZWFjaChncm91cHMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5tYXRjaEhlaWdodCh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgbWF0Y2hIZWlnaHQuX3VwZGF0ZVxuICAgICogIHVwZGF0ZXMgbWF0Y2hIZWlnaHQgb24gYWxsIGN1cnJlbnQgZ3JvdXBzIHdpdGggdGhlaXIgY29ycmVjdCBvcHRpb25zXG4gICAgKi9cblxuICAgIHZhciBfdXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKG1hdGNoSGVpZ2h0Ll9iZWZvcmVVcGRhdGUpIHtcbiAgICAgICAgICAgIG1hdGNoSGVpZ2h0Ll9iZWZvcmVVcGRhdGUoZXZlbnQsIG1hdGNoSGVpZ2h0Ll9ncm91cHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgJC5lYWNoKG1hdGNoSGVpZ2h0Ll9ncm91cHMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbWF0Y2hIZWlnaHQuX2FwcGx5KHRoaXMuZWxlbWVudHMsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChtYXRjaEhlaWdodC5fYWZ0ZXJVcGRhdGUpIHtcbiAgICAgICAgICAgIG1hdGNoSGVpZ2h0Ll9hZnRlclVwZGF0ZShldmVudCwgbWF0Y2hIZWlnaHQuX2dyb3Vwcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbWF0Y2hIZWlnaHQuX3VwZGF0ZSA9IGZ1bmN0aW9uKHRocm90dGxlLCBldmVudCkge1xuICAgICAgICAvLyBwcmV2ZW50IHVwZGF0ZSBpZiBmaXJlZCBmcm9tIGEgcmVzaXplIGV2ZW50XG4gICAgICAgIC8vIHdoZXJlIHRoZSB2aWV3cG9ydCB3aWR0aCBoYXNuJ3QgYWN0dWFsbHkgY2hhbmdlZFxuICAgICAgICAvLyBmaXhlcyBhbiBldmVudCBsb29waW5nIGJ1ZyBpbiBJRThcbiAgICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdyZXNpemUnKSB7XG4gICAgICAgICAgICB2YXIgd2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3dXaWR0aCA9PT0gX3ByZXZpb3VzUmVzaXplV2lkdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfcHJldmlvdXNSZXNpemVXaWR0aCA9IHdpbmRvd1dpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhyb3R0bGUgdXBkYXRlc1xuICAgICAgICBpZiAoIXRocm90dGxlKSB7XG4gICAgICAgICAgICBfdXBkYXRlKGV2ZW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChfdXBkYXRlVGltZW91dCA9PT0gLTEpIHtcbiAgICAgICAgICAgIF91cGRhdGVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfdXBkYXRlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBfdXBkYXRlVGltZW91dCA9IC0xO1xuICAgICAgICAgICAgfSwgbWF0Y2hIZWlnaHQuX3Rocm90dGxlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICogIGJpbmQgZXZlbnRzXG4gICAgKi9cblxuICAgIC8vIGFwcGx5IG9uIERPTSByZWFkeSBldmVudFxuICAgICQobWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaSk7XG5cbiAgICAvLyB1c2Ugb24gb3IgYmluZCB3aGVyZSBzdXBwb3J0ZWRcbiAgICB2YXIgb24gPSAkLmZuLm9uID8gJ29uJyA6ICdiaW5kJztcblxuICAgIC8vIHVwZGF0ZSBoZWlnaHRzIG9uIGxvYWQgYW5kIHJlc2l6ZSBldmVudHNcbiAgICAkKHdpbmRvdylbb25dKCdsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbWF0Y2hIZWlnaHQuX3VwZGF0ZShmYWxzZSwgZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhyb3R0bGVkIHVwZGF0ZSBoZWlnaHRzIG9uIHJlc2l6ZSBldmVudHNcbiAgICAkKHdpbmRvdylbb25dKCdyZXNpemUgb3JpZW50YXRpb25jaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBtYXRjaEhlaWdodC5fdXBkYXRlKHRydWUsIGV2ZW50KTtcbiAgICB9KTtcblxufSk7XG4iLCIvKiFcbiAqIGpRdWVyeSBTbW9vdGggU2Nyb2xsIC0gdjIuMi4wIC0gMjAxNy0wNS0wNVxuICogaHR0cHM6Ly9naXRodWIuY29tL2tzd2VkYmVyZy9qcXVlcnktc21vb3RoLXNjcm9sbFxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU3dlZGJlcmdcbiAqIExpY2Vuc2VkIE1JVFxuICovXG5cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBmYWN0b3J5KGpRdWVyeSk7XG4gIH1cbn0oZnVuY3Rpb24oJCkge1xuXG4gIHZhciB2ZXJzaW9uID0gJzIuMi4wJztcbiAgdmFyIG9wdGlvbk92ZXJyaWRlcyA9IHt9O1xuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgZXhjbHVkZTogW10sXG4gICAgZXhjbHVkZVdpdGhpbjogW10sXG4gICAgb2Zmc2V0OiAwLFxuXG4gICAgLy8gb25lIG9mICd0b3AnIG9yICdsZWZ0J1xuICAgIGRpcmVjdGlvbjogJ3RvcCcsXG5cbiAgICAvLyBpZiBzZXQsIGJpbmQgY2xpY2sgZXZlbnRzIHRocm91Z2ggZGVsZWdhdGlvblxuICAgIC8vICBzdXBwb3J0ZWQgc2luY2UgalF1ZXJ5IDEuNC4yXG4gICAgZGVsZWdhdGVTZWxlY3RvcjogbnVsbCxcblxuICAgIC8vIGpRdWVyeSBzZXQgb2YgZWxlbWVudHMgeW91IHdpc2ggdG8gc2Nyb2xsIChmb3IgJC5zbW9vdGhTY3JvbGwpLlxuICAgIC8vICBpZiBudWxsIChkZWZhdWx0KSwgJCgnaHRtbCwgYm9keScpLmZpcnN0U2Nyb2xsYWJsZSgpIGlzIHVzZWQuXG4gICAgc2Nyb2xsRWxlbWVudDogbnVsbCxcblxuICAgIC8vIG9ubHkgdXNlIGlmIHlvdSB3YW50IHRvIG92ZXJyaWRlIGRlZmF1bHQgYmVoYXZpb3JcbiAgICBzY3JvbGxUYXJnZXQ6IG51bGwsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGZvY3VzIHRoZSB0YXJnZXQgZWxlbWVudCBhZnRlciBzY3JvbGxpbmcgdG8gaXRcbiAgICBhdXRvRm9jdXM6IGZhbHNlLFxuXG4gICAgLy8gZm4ob3B0cykgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGJlZm9yZSBzY3JvbGxpbmcgb2NjdXJzLlxuICAgIC8vIGB0aGlzYCBpcyB0aGUgZWxlbWVudChzKSBiZWluZyBzY3JvbGxlZFxuICAgIGJlZm9yZVNjcm9sbDogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8vIGZuKG9wdHMpIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZnRlciBzY3JvbGxpbmcgb2NjdXJzLlxuICAgIC8vIGB0aGlzYCBpcyB0aGUgdHJpZ2dlcmluZyBlbGVtZW50XG4gICAgYWZ0ZXJTY3JvbGw6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvLyBlYXNpbmcgbmFtZS4galF1ZXJ5IGNvbWVzIHdpdGggXCJzd2luZ1wiIGFuZCBcImxpbmVhci5cIiBGb3Igb3RoZXJzLCB5b3UnbGwgbmVlZCBhbiBlYXNpbmcgcGx1Z2luXG4gICAgLy8gZnJvbSBqUXVlcnkgVUkgb3IgZWxzZXdoZXJlXG4gICAgZWFzaW5nOiAnc3dpbmcnLFxuXG4gICAgLy8gc3BlZWQgY2FuIGJlIGEgbnVtYmVyIG9yICdhdXRvJ1xuICAgIC8vIGlmICdhdXRvJywgdGhlIHNwZWVkIHdpbGwgYmUgY2FsY3VsYXRlZCBiYXNlZCBvbiB0aGUgZm9ybXVsYTpcbiAgICAvLyAoY3VycmVudCBzY3JvbGwgcG9zaXRpb24gLSB0YXJnZXQgc2Nyb2xsIHBvc2l0aW9uKSAvIGF1dG9Db2VmZmljXG4gICAgc3BlZWQ6IDQwMCxcblxuICAgIC8vIGNvZWZmaWNpZW50IGZvciBcImF1dG9cIiBzcGVlZFxuICAgIGF1dG9Db2VmZmljaWVudDogMixcblxuICAgIC8vICQuZm4uc21vb3RoU2Nyb2xsIG9ubHk6IHdoZXRoZXIgdG8gcHJldmVudCB0aGUgZGVmYXVsdCBjbGljayBhY3Rpb25cbiAgICBwcmV2ZW50RGVmYXVsdDogdHJ1ZVxuICB9O1xuXG4gIHZhciBnZXRTY3JvbGxhYmxlID0gZnVuY3Rpb24ob3B0cykge1xuICAgIHZhciBzY3JvbGxhYmxlID0gW107XG4gICAgdmFyIHNjcm9sbGVkID0gZmFsc2U7XG4gICAgdmFyIGRpciA9IG9wdHMuZGlyICYmIG9wdHMuZGlyID09PSAnbGVmdCcgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJztcblxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbCA9ICQodGhpcyk7XG5cbiAgICAgIGlmICh0aGlzID09PSBkb2N1bWVudCB8fCB0aGlzID09PSB3aW5kb3cpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudCAmJiAodGhpcyA9PT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IHRoaXMgPT09IGRvY3VtZW50LmJvZHkpKSB7XG4gICAgICAgIHNjcm9sbGFibGUucHVzaChkb2N1bWVudC5zY3JvbGxpbmdFbGVtZW50KTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbFtkaXJdKCkgPiAwKSB7XG4gICAgICAgIHNjcm9sbGFibGUucHVzaCh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIHNjcm9sbChUb3B8TGVmdCkgPT09IDAsIG51ZGdlIHRoZSBlbGVtZW50IDFweCBhbmQgc2VlIGlmIGl0IG1vdmVzXG4gICAgICAgIGVsW2Rpcl0oMSk7XG4gICAgICAgIHNjcm9sbGVkID0gZWxbZGlyXSgpID4gMDtcblxuICAgICAgICBpZiAoc2Nyb2xsZWQpIHtcbiAgICAgICAgICBzY3JvbGxhYmxlLnB1c2godGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhlbiBwdXQgaXQgYmFjaywgb2YgY291cnNlXG4gICAgICAgIGVsW2Rpcl0oMCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIXNjcm9sbGFibGUubGVuZ3RoKSB7XG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIElmIG5vIHNjcm9sbGFibGUgZWxlbWVudHMgYW5kIDxodG1sPiBoYXMgc2Nyb2xsLWJlaGF2aW9yOnNtb290aCBiZWNhdXNlXG4gICAgICAgIC8vIFwiV2hlbiB0aGlzIHByb3BlcnR5IGlzIHNwZWNpZmllZCBvbiB0aGUgcm9vdCBlbGVtZW50LCBpdCBhcHBsaWVzIHRvIHRoZSB2aWV3cG9ydCBpbnN0ZWFkLlwiXG4gICAgICAgIC8vIGFuZCBcIlRoZSBzY3JvbGwtYmVoYXZpb3IgcHJvcGVydHkgb2YgdGhlIOKApiBib2R5IGVsZW1lbnQgaXMgKm5vdCogcHJvcGFnYXRlZCB0byB0aGUgdmlld3BvcnQuXCJcbiAgICAgICAgLy8g4oaSIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3NvbS12aWV3LyNwcm9wZGVmLXNjcm9sbC1iZWhhdmlvclxuICAgICAgICBpZiAodGhpcyA9PT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICQodGhpcykuY3NzKCdzY3JvbGxCZWhhdmlvcicpID09PSAnc21vb3RoJykge1xuICAgICAgICAgIHNjcm9sbGFibGUgPSBbdGhpc107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBzdGlsbCBubyBzY3JvbGxhYmxlIGVsZW1lbnRzLCBmYWxsIGJhY2sgdG8gPGJvZHk+LFxuICAgICAgICAvLyBpZiBpdCdzIGluIHRoZSBqUXVlcnkgY29sbGVjdGlvblxuICAgICAgICAvLyAoZG9pbmcgdGhpcyBiZWNhdXNlIFNhZmFyaSBzZXRzIHNjcm9sbFRvcCBhc3luYyxcbiAgICAgICAgLy8gc28gY2FuJ3Qgc2V0IGl0IHRvIDEgYW5kIGltbWVkaWF0ZWx5IGdldCB0aGUgdmFsdWUuKVxuICAgICAgICBpZiAoIXNjcm9sbGFibGUubGVuZ3RoICYmIHRoaXMubm9kZU5hbWUgPT09ICdCT0RZJykge1xuICAgICAgICAgIHNjcm9sbGFibGUgPSBbdGhpc107XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFVzZSB0aGUgZmlyc3Qgc2Nyb2xsYWJsZSBlbGVtZW50IGlmIHdlJ3JlIGNhbGxpbmcgZmlyc3RTY3JvbGxhYmxlKClcbiAgICBpZiAob3B0cy5lbCA9PT0gJ2ZpcnN0JyAmJiBzY3JvbGxhYmxlLmxlbmd0aCA+IDEpIHtcbiAgICAgIHNjcm9sbGFibGUgPSBbc2Nyb2xsYWJsZVswXV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNjcm9sbGFibGU7XG4gIH07XG5cbiAgdmFyIHJSZWxhdGl2ZSA9IC9eKFtcXC1cXCtdPSkoXFxkKykvO1xuXG4gICQuZm4uZXh0ZW5kKHtcbiAgICBzY3JvbGxhYmxlOiBmdW5jdGlvbihkaXIpIHtcbiAgICAgIHZhciBzY3JsID0gZ2V0U2Nyb2xsYWJsZS5jYWxsKHRoaXMsIHtkaXI6IGRpcn0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soc2NybCk7XG4gICAgfSxcbiAgICBmaXJzdFNjcm9sbGFibGU6IGZ1bmN0aW9uKGRpcikge1xuICAgICAgdmFyIHNjcmwgPSBnZXRTY3JvbGxhYmxlLmNhbGwodGhpcywge2VsOiAnZmlyc3QnLCBkaXI6IGRpcn0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soc2NybCk7XG4gICAgfSxcblxuICAgIHNtb290aFNjcm9sbDogZnVuY3Rpb24ob3B0aW9ucywgZXh0cmEpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICBpZiAob3B0aW9ucyA9PT0gJ29wdGlvbnMnKSB7XG4gICAgICAgIGlmICghZXh0cmEpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoJ3NzT3B0cycpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgIHZhciBvcHRzID0gJC5leHRlbmQoJHRoaXMuZGF0YSgnc3NPcHRzJykgfHwge30sIGV4dHJhKTtcblxuICAgICAgICAgICQodGhpcykuZGF0YSgnc3NPcHRzJywgb3B0cyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3B0cyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnNtb290aFNjcm9sbC5kZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAgIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZXNjYXBlU2VsZWN0b3IgPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyg6fFxcLnxcXC8pL2csICdcXFxcJDEnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbGluayA9IHRoaXM7XG4gICAgICAgIHZhciAkbGluayA9ICQodGhpcyk7XG4gICAgICAgIHZhciB0aGlzT3B0cyA9ICQuZXh0ZW5kKHt9LCBvcHRzLCAkbGluay5kYXRhKCdzc09wdHMnKSB8fCB7fSk7XG4gICAgICAgIHZhciBleGNsdWRlID0gb3B0cy5leGNsdWRlO1xuICAgICAgICB2YXIgZXhjbHVkZVdpdGhpbiA9IHRoaXNPcHRzLmV4Y2x1ZGVXaXRoaW47XG4gICAgICAgIHZhciBlbENvdW50ZXIgPSAwO1xuICAgICAgICB2YXIgZXdsQ291bnRlciA9IDA7XG4gICAgICAgIHZhciBpbmNsdWRlID0gdHJ1ZTtcbiAgICAgICAgdmFyIGNsaWNrT3B0cyA9IHt9O1xuICAgICAgICB2YXIgbG9jYXRpb25QYXRoID0gJC5zbW9vdGhTY3JvbGwuZmlsdGVyUGF0aChsb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgICAgIHZhciBsaW5rUGF0aCA9ICQuc21vb3RoU2Nyb2xsLmZpbHRlclBhdGgobGluay5wYXRobmFtZSk7XG4gICAgICAgIHZhciBob3N0TWF0Y2ggPSBsb2NhdGlvbi5ob3N0bmFtZSA9PT0gbGluay5ob3N0bmFtZSB8fCAhbGluay5ob3N0bmFtZTtcbiAgICAgICAgdmFyIHBhdGhNYXRjaCA9IHRoaXNPcHRzLnNjcm9sbFRhcmdldCB8fCAobGlua1BhdGggPT09IGxvY2F0aW9uUGF0aCk7XG4gICAgICAgIHZhciB0aGlzSGFzaCA9IGVzY2FwZVNlbGVjdG9yKGxpbmsuaGFzaCk7XG5cbiAgICAgICAgaWYgKHRoaXNIYXNoICYmICEkKHRoaXNIYXNoKS5sZW5ndGgpIHtcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXNPcHRzLnNjcm9sbFRhcmdldCAmJiAoIWhvc3RNYXRjaCB8fCAhcGF0aE1hdGNoIHx8ICF0aGlzSGFzaCkpIHtcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2hpbGUgKGluY2x1ZGUgJiYgZWxDb3VudGVyIDwgZXhjbHVkZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICgkbGluay5pcyhlc2NhcGVTZWxlY3RvcihleGNsdWRlW2VsQ291bnRlcisrXSkpKSB7XG4gICAgICAgICAgICAgIGluY2x1ZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3aGlsZSAoaW5jbHVkZSAmJiBld2xDb3VudGVyIDwgZXhjbHVkZVdpdGhpbi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICgkbGluay5jbG9zZXN0KGV4Y2x1ZGVXaXRoaW5bZXdsQ291bnRlcisrXSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGluY2x1ZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5jbHVkZSkge1xuICAgICAgICAgIGlmICh0aGlzT3B0cy5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkLmV4dGVuZChjbGlja09wdHMsIHRoaXNPcHRzLCB7XG4gICAgICAgICAgICBzY3JvbGxUYXJnZXQ6IHRoaXNPcHRzLnNjcm9sbFRhcmdldCB8fCB0aGlzSGFzaCxcbiAgICAgICAgICAgIGxpbms6IGxpbmtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgICQuc21vb3RoU2Nyb2xsKGNsaWNrT3B0cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChvcHRpb25zLmRlbGVnYXRlU2VsZWN0b3IgIT09IG51bGwpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAub2ZmKCdjbGljay5zbW9vdGhzY3JvbGwnLCBvcHRpb25zLmRlbGVnYXRlU2VsZWN0b3IpXG4gICAgICAgIC5vbignY2xpY2suc21vb3Roc2Nyb2xsJywgb3B0aW9ucy5kZWxlZ2F0ZVNlbGVjdG9yLCBjbGlja0hhbmRsZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAub2ZmKCdjbGljay5zbW9vdGhzY3JvbGwnKVxuICAgICAgICAub24oJ2NsaWNrLnNtb290aHNjcm9sbCcsIGNsaWNrSGFuZGxlcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGdldEV4cGxpY2l0T2Zmc2V0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIGV4cGxpY2l0ID0ge3JlbGF0aXZlOiAnJ307XG4gICAgdmFyIHBhcnRzID0gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiYgclJlbGF0aXZlLmV4ZWModmFsKTtcblxuICAgIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgICAgZXhwbGljaXQucHggPSB2YWw7XG4gICAgfSBlbHNlIGlmIChwYXJ0cykge1xuICAgICAgZXhwbGljaXQucmVsYXRpdmUgPSBwYXJ0c1sxXTtcbiAgICAgIGV4cGxpY2l0LnB4ID0gcGFyc2VGbG9hdChwYXJ0c1syXSkgfHwgMDtcbiAgICB9XG5cbiAgICByZXR1cm4gZXhwbGljaXQ7XG4gIH07XG5cbiAgdmFyIG9uQWZ0ZXJTY3JvbGwgPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgdmFyICR0Z3QgPSAkKG9wdHMuc2Nyb2xsVGFyZ2V0KTtcblxuICAgIGlmIChvcHRzLmF1dG9Gb2N1cyAmJiAkdGd0Lmxlbmd0aCkge1xuICAgICAgJHRndFswXS5mb2N1cygpO1xuXG4gICAgICBpZiAoISR0Z3QuaXMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgJHRndC5wcm9wKHt0YWJJbmRleDogLTF9KTtcbiAgICAgICAgJHRndFswXS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9wdHMuYWZ0ZXJTY3JvbGwuY2FsbChvcHRzLmxpbmssIG9wdHMpO1xuICB9O1xuXG4gICQuc21vb3RoU2Nyb2xsID0gZnVuY3Rpb24ob3B0aW9ucywgcHgpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gJ29wdGlvbnMnICYmIHR5cGVvZiBweCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiAkLmV4dGVuZChvcHRpb25PdmVycmlkZXMsIHB4KTtcbiAgICB9XG4gICAgdmFyIG9wdHMsICRzY3JvbGxlciwgc3BlZWQsIGRlbHRhO1xuICAgIHZhciBleHBsaWNpdE9mZnNldCA9IGdldEV4cGxpY2l0T2Zmc2V0KG9wdGlvbnMpO1xuICAgIHZhciBzY3JvbGxUYXJnZXRPZmZzZXQgPSB7fTtcbiAgICB2YXIgc2Nyb2xsZXJPZmZzZXQgPSAwO1xuICAgIHZhciBvZmZQb3MgPSAnb2Zmc2V0JztcbiAgICB2YXIgc2Nyb2xsRGlyID0gJ3Njcm9sbFRvcCc7XG4gICAgdmFyIGFuaVByb3BzID0ge307XG4gICAgdmFyIGFuaU9wdHMgPSB7fTtcblxuICAgIGlmIChleHBsaWNpdE9mZnNldC5weCkge1xuICAgICAgb3B0cyA9ICQuZXh0ZW5kKHtsaW5rOiBudWxsfSwgJC5mbi5zbW9vdGhTY3JvbGwuZGVmYXVsdHMsIG9wdGlvbk92ZXJyaWRlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdHMgPSAkLmV4dGVuZCh7bGluazogbnVsbH0sICQuZm4uc21vb3RoU2Nyb2xsLmRlZmF1bHRzLCBvcHRpb25zIHx8IHt9LCBvcHRpb25PdmVycmlkZXMpO1xuXG4gICAgICBpZiAob3B0cy5zY3JvbGxFbGVtZW50KSB7XG4gICAgICAgIG9mZlBvcyA9ICdwb3NpdGlvbic7XG5cbiAgICAgICAgaWYgKG9wdHMuc2Nyb2xsRWxlbWVudC5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgb3B0cy5zY3JvbGxFbGVtZW50LmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocHgpIHtcbiAgICAgICAgZXhwbGljaXRPZmZzZXQgPSBnZXRFeHBsaWNpdE9mZnNldChweCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2Nyb2xsRGlyID0gb3B0cy5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICdzY3JvbGxMZWZ0JyA6IHNjcm9sbERpcjtcblxuICAgIGlmIChvcHRzLnNjcm9sbEVsZW1lbnQpIHtcbiAgICAgICRzY3JvbGxlciA9IG9wdHMuc2Nyb2xsRWxlbWVudDtcblxuICAgICAgaWYgKCFleHBsaWNpdE9mZnNldC5weCAmJiAhKC9eKD86SFRNTHxCT0RZKSQvKS50ZXN0KCRzY3JvbGxlclswXS5ub2RlTmFtZSkpIHtcbiAgICAgICAgc2Nyb2xsZXJPZmZzZXQgPSAkc2Nyb2xsZXJbc2Nyb2xsRGlyXSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2Nyb2xsZXIgPSAkKCdodG1sLCBib2R5JykuZmlyc3RTY3JvbGxhYmxlKG9wdHMuZGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBiZWZvcmVTY3JvbGwgY2FsbGJhY2sgZnVuY3Rpb24gbXVzdCBmaXJlIGJlZm9yZSBjYWxjdWxhdGluZyBvZmZzZXRcbiAgICBvcHRzLmJlZm9yZVNjcm9sbC5jYWxsKCRzY3JvbGxlciwgb3B0cyk7XG5cbiAgICBzY3JvbGxUYXJnZXRPZmZzZXQgPSBleHBsaWNpdE9mZnNldC5weCA/IGV4cGxpY2l0T2Zmc2V0IDoge1xuICAgICAgcmVsYXRpdmU6ICcnLFxuICAgICAgcHg6ICgkKG9wdHMuc2Nyb2xsVGFyZ2V0KVtvZmZQb3NdKCkgJiYgJChvcHRzLnNjcm9sbFRhcmdldClbb2ZmUG9zXSgpW29wdHMuZGlyZWN0aW9uXSkgfHwgMFxuICAgIH07XG5cbiAgICBhbmlQcm9wc1tzY3JvbGxEaXJdID0gc2Nyb2xsVGFyZ2V0T2Zmc2V0LnJlbGF0aXZlICsgKHNjcm9sbFRhcmdldE9mZnNldC5weCArIHNjcm9sbGVyT2Zmc2V0ICsgb3B0cy5vZmZzZXQpO1xuXG4gICAgc3BlZWQgPSBvcHRzLnNwZWVkO1xuXG4gICAgLy8gYXV0b21hdGljYWxseSBjYWxjdWxhdGUgdGhlIHNwZWVkIG9mIHRoZSBzY3JvbGwgYmFzZWQgb24gZGlzdGFuY2UgLyBjb2VmZmljaWVudFxuICAgIGlmIChzcGVlZCA9PT0gJ2F1dG8nKSB7XG5cbiAgICAgIC8vICRzY3JvbGxlcltzY3JvbGxEaXJdKCkgaXMgcG9zaXRpb24gYmVmb3JlIHNjcm9sbCwgYW5pUHJvcHNbc2Nyb2xsRGlyXSBpcyBwb3NpdGlvbiBhZnRlclxuICAgICAgLy8gV2hlbiBkZWx0YSBpcyBncmVhdGVyLCBzcGVlZCB3aWxsIGJlIGdyZWF0ZXIuXG4gICAgICBkZWx0YSA9IE1hdGguYWJzKGFuaVByb3BzW3Njcm9sbERpcl0gLSAkc2Nyb2xsZXJbc2Nyb2xsRGlyXSgpKTtcblxuICAgICAgLy8gRGl2aWRlIHRoZSBkZWx0YSBieSB0aGUgY29lZmZpY2llbnRcbiAgICAgIHNwZWVkID0gZGVsdGEgLyBvcHRzLmF1dG9Db2VmZmljaWVudDtcbiAgICB9XG5cbiAgICBhbmlPcHRzID0ge1xuICAgICAgZHVyYXRpb246IHNwZWVkLFxuICAgICAgZWFzaW5nOiBvcHRzLmVhc2luZyxcbiAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgb25BZnRlclNjcm9sbChvcHRzKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG9wdHMuc3RlcCkge1xuICAgICAgYW5pT3B0cy5zdGVwID0gb3B0cy5zdGVwO1xuICAgIH1cblxuICAgIGlmICgkc2Nyb2xsZXIubGVuZ3RoKSB7XG4gICAgICAkc2Nyb2xsZXIuc3RvcCgpLmFuaW1hdGUoYW5pUHJvcHMsIGFuaU9wdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbkFmdGVyU2Nyb2xsKG9wdHMpO1xuICAgIH1cbiAgfTtcblxuICAkLnNtb290aFNjcm9sbC52ZXJzaW9uID0gdmVyc2lvbjtcbiAgJC5zbW9vdGhTY3JvbGwuZmlsdGVyUGF0aCA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHN0cmluZyA9IHN0cmluZyB8fCAnJztcblxuICAgIHJldHVybiBzdHJpbmdcbiAgICAgIC5yZXBsYWNlKC9eXFwvLywgJycpXG4gICAgICAucmVwbGFjZSgvKD86aW5kZXh8ZGVmYXVsdCkuW2EtekEtWl17Myw0fSQvLCAnJylcbiAgICAgIC5yZXBsYWNlKC9cXC8kLywgJycpO1xuICB9O1xuXG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICAkLmZuLnNtb290aFNjcm9sbC5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuXG59KSk7XG4iLCIvKiFcbldheXBvaW50cyAtIDQuMC4xXG5Db3B5cmlnaHQgwqkgMjAxMS0yMDE2IENhbGViIFRyb3VnaHRvblxuTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuaHR0cHM6Ly9naXRodWIuY29tL2ltYWtld2VidGhpbmdzL3dheXBvaW50cy9ibG9iL21hc3Rlci9saWNlbnNlcy50eHRcbiovXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciBrZXlDb3VudGVyID0gMFxuICB2YXIgYWxsV2F5cG9pbnRzID0ge31cblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvd2F5cG9pbnQgKi9cbiAgZnVuY3Rpb24gV2F5cG9pbnQob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBvcHRpb25zIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5lbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGVsZW1lbnQgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5oYW5kbGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGhhbmRsZXIgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuXG4gICAgdGhpcy5rZXkgPSAnd2F5cG9pbnQtJyArIGtleUNvdW50ZXJcbiAgICB0aGlzLm9wdGlvbnMgPSBXYXlwb2ludC5BZGFwdGVyLmV4dGVuZCh7fSwgV2F5cG9pbnQuZGVmYXVsdHMsIG9wdGlvbnMpXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy5vcHRpb25zLmVsZW1lbnRcbiAgICB0aGlzLmFkYXB0ZXIgPSBuZXcgV2F5cG9pbnQuQWRhcHRlcih0aGlzLmVsZW1lbnQpXG4gICAgdGhpcy5jYWxsYmFjayA9IG9wdGlvbnMuaGFuZGxlclxuICAgIHRoaXMuYXhpcyA9IHRoaXMub3B0aW9ucy5ob3Jpem9udGFsID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ1xuICAgIHRoaXMuZW5hYmxlZCA9IHRoaXMub3B0aW9ucy5lbmFibGVkXG4gICAgdGhpcy50cmlnZ2VyUG9pbnQgPSBudWxsXG4gICAgdGhpcy5ncm91cCA9IFdheXBvaW50Lkdyb3VwLmZpbmRPckNyZWF0ZSh7XG4gICAgICBuYW1lOiB0aGlzLm9wdGlvbnMuZ3JvdXAsXG4gICAgICBheGlzOiB0aGlzLmF4aXNcbiAgICB9KVxuICAgIHRoaXMuY29udGV4dCA9IFdheXBvaW50LkNvbnRleHQuZmluZE9yQ3JlYXRlQnlFbGVtZW50KHRoaXMub3B0aW9ucy5jb250ZXh0KVxuXG4gICAgaWYgKFdheXBvaW50Lm9mZnNldEFsaWFzZXNbdGhpcy5vcHRpb25zLm9mZnNldF0pIHtcbiAgICAgIHRoaXMub3B0aW9ucy5vZmZzZXQgPSBXYXlwb2ludC5vZmZzZXRBbGlhc2VzW3RoaXMub3B0aW9ucy5vZmZzZXRdXG4gICAgfVxuICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMpXG4gICAgdGhpcy5jb250ZXh0LmFkZCh0aGlzKVxuICAgIGFsbFdheXBvaW50c1t0aGlzLmtleV0gPSB0aGlzXG4gICAga2V5Q291bnRlciArPSAxXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5xdWV1ZVRyaWdnZXIgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgICB0aGlzLmdyb3VwLnF1ZXVlVHJpZ2dlcih0aGlzLCBkaXJlY3Rpb24pXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24oYXJncykge1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHRoaXMuY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuY2FsbGJhY2suYXBwbHkodGhpcywgYXJncylcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rlc3Ryb3kgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRleHQucmVtb3ZlKHRoaXMpXG4gICAgdGhpcy5ncm91cC5yZW1vdmUodGhpcylcbiAgICBkZWxldGUgYWxsV2F5cG9pbnRzW3RoaXMua2V5XVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kaXNhYmxlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2VcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9lbmFibGUgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGV4dC5yZWZyZXNoKClcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvbmV4dCAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdyb3VwLm5leHQodGhpcylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvcHJldmlvdXMgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLnByZXZpb3VzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXAucHJldmlvdXModGhpcylcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgV2F5cG9pbnQuaW52b2tlQWxsID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgdmFyIGFsbFdheXBvaW50c0FycmF5ID0gW11cbiAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiBhbGxXYXlwb2ludHMpIHtcbiAgICAgIGFsbFdheXBvaW50c0FycmF5LnB1c2goYWxsV2F5cG9pbnRzW3dheXBvaW50S2V5XSlcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGFsbFdheXBvaW50c0FycmF5Lmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBhbGxXYXlwb2ludHNBcnJheVtpXVttZXRob2RdKClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rlc3Ryb3ktYWxsICovXG4gIFdheXBvaW50LmRlc3Ryb3lBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5pbnZva2VBbGwoJ2Rlc3Ryb3knKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kaXNhYmxlLWFsbCAqL1xuICBXYXlwb2ludC5kaXNhYmxlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuaW52b2tlQWxsKCdkaXNhYmxlJylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZW5hYmxlLWFsbCAqL1xuICBXYXlwb2ludC5lbmFibGVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5Db250ZXh0LnJlZnJlc2hBbGwoKVxuICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIGFsbFdheXBvaW50cykge1xuICAgICAgYWxsV2F5cG9pbnRzW3dheXBvaW50S2V5XS5lbmFibGVkID0gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9yZWZyZXNoLWFsbCAqL1xuICBXYXlwb2ludC5yZWZyZXNoQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvdmlld3BvcnQtaGVpZ2h0ICovXG4gIFdheXBvaW50LnZpZXdwb3J0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3ZpZXdwb3J0LXdpZHRoICovXG4gIFdheXBvaW50LnZpZXdwb3J0V2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoXG4gIH1cblxuICBXYXlwb2ludC5hZGFwdGVycyA9IFtdXG5cbiAgV2F5cG9pbnQuZGVmYXVsdHMgPSB7XG4gICAgY29udGV4dDogd2luZG93LFxuICAgIGNvbnRpbnVvdXM6IHRydWUsXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBncm91cDogJ2RlZmF1bHQnLFxuICAgIGhvcml6b250YWw6IGZhbHNlLFxuICAgIG9mZnNldDogMFxuICB9XG5cbiAgV2F5cG9pbnQub2Zmc2V0QWxpYXNlcyA9IHtcbiAgICAnYm90dG9tLWluLXZpZXcnOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuaW5uZXJIZWlnaHQoKSAtIHRoaXMuYWRhcHRlci5vdXRlckhlaWdodCgpXG4gICAgfSxcbiAgICAncmlnaHQtaW4tdmlldyc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5pbm5lcldpZHRoKCkgLSB0aGlzLmFkYXB0ZXIub3V0ZXJXaWR0aCgpXG4gICAgfVxuICB9XG5cbiAgd2luZG93LldheXBvaW50ID0gV2F5cG9pbnRcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGZ1bmN0aW9uIHJlcXVlc3RBbmltYXRpb25GcmFtZVNoaW0oY2FsbGJhY2spIHtcbiAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKVxuICB9XG5cbiAgdmFyIGtleUNvdW50ZXIgPSAwXG4gIHZhciBjb250ZXh0cyA9IHt9XG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuICB2YXIgb2xkV2luZG93TG9hZCA9IHdpbmRvdy5vbmxvYWRcblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dCAqL1xuICBmdW5jdGlvbiBDb250ZXh0KGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG4gICAgdGhpcy5BZGFwdGVyID0gV2F5cG9pbnQuQWRhcHRlclxuICAgIHRoaXMuYWRhcHRlciA9IG5ldyB0aGlzLkFkYXB0ZXIoZWxlbWVudClcbiAgICB0aGlzLmtleSA9ICd3YXlwb2ludC1jb250ZXh0LScgKyBrZXlDb3VudGVyXG4gICAgdGhpcy5kaWRTY3JvbGwgPSBmYWxzZVxuICAgIHRoaXMuZGlkUmVzaXplID0gZmFsc2VcbiAgICB0aGlzLm9sZFNjcm9sbCA9IHtcbiAgICAgIHg6IHRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCksXG4gICAgICB5OiB0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKClcbiAgICB9XG4gICAgdGhpcy53YXlwb2ludHMgPSB7XG4gICAgICB2ZXJ0aWNhbDoge30sXG4gICAgICBob3Jpem9udGFsOiB7fVxuICAgIH1cblxuICAgIGVsZW1lbnQud2F5cG9pbnRDb250ZXh0S2V5ID0gdGhpcy5rZXlcbiAgICBjb250ZXh0c1tlbGVtZW50LndheXBvaW50Q29udGV4dEtleV0gPSB0aGlzXG4gICAga2V5Q291bnRlciArPSAxXG4gICAgaWYgKCFXYXlwb2ludC53aW5kb3dDb250ZXh0KSB7XG4gICAgICBXYXlwb2ludC53aW5kb3dDb250ZXh0ID0gdHJ1ZVxuICAgICAgV2F5cG9pbnQud2luZG93Q29udGV4dCA9IG5ldyBDb250ZXh0KHdpbmRvdylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXIoKVxuICAgIHRoaXMuY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlcigpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdmFyIGF4aXMgPSB3YXlwb2ludC5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy53YXlwb2ludHNbYXhpc11bd2F5cG9pbnQua2V5XSA9IHdheXBvaW50XG4gICAgdGhpcy5yZWZyZXNoKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuY2hlY2tFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBob3Jpem9udGFsRW1wdHkgPSB0aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy5ob3Jpem9udGFsKVxuICAgIHZhciB2ZXJ0aWNhbEVtcHR5ID0gdGhpcy5BZGFwdGVyLmlzRW1wdHlPYmplY3QodGhpcy53YXlwb2ludHMudmVydGljYWwpXG4gICAgdmFyIGlzV2luZG93ID0gdGhpcy5lbGVtZW50ID09IHRoaXMuZWxlbWVudC53aW5kb3dcbiAgICBpZiAoaG9yaXpvbnRhbEVtcHR5ICYmIHZlcnRpY2FsRW1wdHkgJiYgIWlzV2luZG93KSB7XG4gICAgICB0aGlzLmFkYXB0ZXIub2ZmKCcud2F5cG9pbnRzJylcbiAgICAgIGRlbGV0ZSBjb250ZXh0c1t0aGlzLmtleV1cbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgIGZ1bmN0aW9uIHJlc2l6ZUhhbmRsZXIoKSB7XG4gICAgICBzZWxmLmhhbmRsZVJlc2l6ZSgpXG4gICAgICBzZWxmLmRpZFJlc2l6ZSA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5hZGFwdGVyLm9uKCdyZXNpemUud2F5cG9pbnRzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXNlbGYuZGlkUmVzaXplKSB7XG4gICAgICAgIHNlbGYuZGlkUmVzaXplID0gdHJ1ZVxuICAgICAgICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVzaXplSGFuZGxlcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5jcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgZnVuY3Rpb24gc2Nyb2xsSGFuZGxlcigpIHtcbiAgICAgIHNlbGYuaGFuZGxlU2Nyb2xsKClcbiAgICAgIHNlbGYuZGlkU2Nyb2xsID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmFkYXB0ZXIub24oJ3Njcm9sbC53YXlwb2ludHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghc2VsZi5kaWRTY3JvbGwgfHwgV2F5cG9pbnQuaXNUb3VjaCkge1xuICAgICAgICBzZWxmLmRpZFNjcm9sbCA9IHRydWVcbiAgICAgICAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbEhhbmRsZXIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyaWdnZXJlZEdyb3VwcyA9IHt9XG4gICAgdmFyIGF4ZXMgPSB7XG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIG5ld1Njcm9sbDogdGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC54LFxuICAgICAgICBmb3J3YXJkOiAncmlnaHQnLFxuICAgICAgICBiYWNrd2FyZDogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgdmVydGljYWw6IHtcbiAgICAgICAgbmV3U2Nyb2xsOiB0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueSxcbiAgICAgICAgZm9yd2FyZDogJ2Rvd24nLFxuICAgICAgICBiYWNrd2FyZDogJ3VwJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGF4aXNLZXkgaW4gYXhlcykge1xuICAgICAgdmFyIGF4aXMgPSBheGVzW2F4aXNLZXldXG4gICAgICB2YXIgaXNGb3J3YXJkID0gYXhpcy5uZXdTY3JvbGwgPiBheGlzLm9sZFNjcm9sbFxuICAgICAgdmFyIGRpcmVjdGlvbiA9IGlzRm9yd2FyZCA/IGF4aXMuZm9yd2FyZCA6IGF4aXMuYmFja3dhcmRcblxuICAgICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gdGhpcy53YXlwb2ludHNbYXhpc0tleV0pIHtcbiAgICAgICAgdmFyIHdheXBvaW50ID0gdGhpcy53YXlwb2ludHNbYXhpc0tleV1bd2F5cG9pbnRLZXldXG4gICAgICAgIGlmICh3YXlwb2ludC50cmlnZ2VyUG9pbnQgPT09IG51bGwpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHZhciB3YXNCZWZvcmVUcmlnZ2VyUG9pbnQgPSBheGlzLm9sZFNjcm9sbCA8IHdheXBvaW50LnRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgbm93QWZ0ZXJUcmlnZ2VyUG9pbnQgPSBheGlzLm5ld1Njcm9sbCA+PSB3YXlwb2ludC50cmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIGNyb3NzZWRGb3J3YXJkID0gd2FzQmVmb3JlVHJpZ2dlclBvaW50ICYmIG5vd0FmdGVyVHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBjcm9zc2VkQmFja3dhcmQgPSAhd2FzQmVmb3JlVHJpZ2dlclBvaW50ICYmICFub3dBZnRlclRyaWdnZXJQb2ludFxuICAgICAgICBpZiAoY3Jvc3NlZEZvcndhcmQgfHwgY3Jvc3NlZEJhY2t3YXJkKSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGRpcmVjdGlvbilcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGdyb3VwS2V5IGluIHRyaWdnZXJlZEdyb3Vwcykge1xuICAgICAgdHJpZ2dlcmVkR3JvdXBzW2dyb3VwS2V5XS5mbHVzaFRyaWdnZXJzKClcbiAgICB9XG5cbiAgICB0aGlzLm9sZFNjcm9sbCA9IHtcbiAgICAgIHg6IGF4ZXMuaG9yaXpvbnRhbC5uZXdTY3JvbGwsXG4gICAgICB5OiBheGVzLnZlcnRpY2FsLm5ld1Njcm9sbFxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaW5uZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIGlmICh0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvdykge1xuICAgICAgcmV0dXJuIFdheXBvaW50LnZpZXdwb3J0SGVpZ2h0KClcbiAgICB9XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHJldHVybiB0aGlzLmFkYXB0ZXIuaW5uZXJIZWlnaHQoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIGRlbGV0ZSB0aGlzLndheXBvaW50c1t3YXlwb2ludC5heGlzXVt3YXlwb2ludC5rZXldXG4gICAgdGhpcy5jaGVja0VtcHR5KClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaW5uZXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgaWYgKHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93KSB7XG4gICAgICByZXR1cm4gV2F5cG9pbnQudmlld3BvcnRXaWR0aCgpXG4gICAgfVxuICAgIC8qZXNsaW50LWVuYWJsZSBlcWVxZXEgKi9cbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmlubmVyV2lkdGgoKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0LWRlc3Ryb3kgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbGxXYXlwb2ludHMgPSBbXVxuICAgIGZvciAodmFyIGF4aXMgaW4gdGhpcy53YXlwb2ludHMpIHtcbiAgICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIHRoaXMud2F5cG9pbnRzW2F4aXNdKSB7XG4gICAgICAgIGFsbFdheXBvaW50cy5wdXNoKHRoaXMud2F5cG9pbnRzW2F4aXNdW3dheXBvaW50S2V5XSlcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGFsbFdheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgYWxsV2F5cG9pbnRzW2ldLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dC1yZWZyZXNoICovXG4gIENvbnRleHQucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIHZhciBpc1dpbmRvdyA9IHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHZhciBjb250ZXh0T2Zmc2V0ID0gaXNXaW5kb3cgPyB1bmRlZmluZWQgOiB0aGlzLmFkYXB0ZXIub2Zmc2V0KClcbiAgICB2YXIgdHJpZ2dlcmVkR3JvdXBzID0ge31cbiAgICB2YXIgYXhlc1xuXG4gICAgdGhpcy5oYW5kbGVTY3JvbGwoKVxuICAgIGF4ZXMgPSB7XG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIGNvbnRleHRPZmZzZXQ6IGlzV2luZG93ID8gMCA6IGNvbnRleHRPZmZzZXQubGVmdCxcbiAgICAgICAgY29udGV4dFNjcm9sbDogaXNXaW5kb3cgPyAwIDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgY29udGV4dERpbWVuc2lvbjogdGhpcy5pbm5lcldpZHRoKCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgZm9yd2FyZDogJ3JpZ2h0JyxcbiAgICAgICAgYmFja3dhcmQ6ICdsZWZ0JyxcbiAgICAgICAgb2Zmc2V0UHJvcDogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgdmVydGljYWw6IHtcbiAgICAgICAgY29udGV4dE9mZnNldDogaXNXaW5kb3cgPyAwIDogY29udGV4dE9mZnNldC50b3AsXG4gICAgICAgIGNvbnRleHRTY3JvbGw6IGlzV2luZG93ID8gMCA6IHRoaXMub2xkU2Nyb2xsLnksXG4gICAgICAgIGNvbnRleHREaW1lbnNpb246IHRoaXMuaW5uZXJIZWlnaHQoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC55LFxuICAgICAgICBmb3J3YXJkOiAnZG93bicsXG4gICAgICAgIGJhY2t3YXJkOiAndXAnLFxuICAgICAgICBvZmZzZXRQcm9wOiAndG9wJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGF4aXNLZXkgaW4gYXhlcykge1xuICAgICAgdmFyIGF4aXMgPSBheGVzW2F4aXNLZXldXG4gICAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiB0aGlzLndheXBvaW50c1theGlzS2V5XSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB0aGlzLndheXBvaW50c1theGlzS2V5XVt3YXlwb2ludEtleV1cbiAgICAgICAgdmFyIGFkanVzdG1lbnQgPSB3YXlwb2ludC5vcHRpb25zLm9mZnNldFxuICAgICAgICB2YXIgb2xkVHJpZ2dlclBvaW50ID0gd2F5cG9pbnQudHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBlbGVtZW50T2Zmc2V0ID0gMFxuICAgICAgICB2YXIgZnJlc2hXYXlwb2ludCA9IG9sZFRyaWdnZXJQb2ludCA9PSBudWxsXG4gICAgICAgIHZhciBjb250ZXh0TW9kaWZpZXIsIHdhc0JlZm9yZVNjcm9sbCwgbm93QWZ0ZXJTY3JvbGxcbiAgICAgICAgdmFyIHRyaWdnZXJlZEJhY2t3YXJkLCB0cmlnZ2VyZWRGb3J3YXJkXG5cbiAgICAgICAgaWYgKHdheXBvaW50LmVsZW1lbnQgIT09IHdheXBvaW50LmVsZW1lbnQud2luZG93KSB7XG4gICAgICAgICAgZWxlbWVudE9mZnNldCA9IHdheXBvaW50LmFkYXB0ZXIub2Zmc2V0KClbYXhpcy5vZmZzZXRQcm9wXVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhZGp1c3RtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgYWRqdXN0bWVudCA9IGFkanVzdG1lbnQuYXBwbHkod2F5cG9pbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGFkanVzdG1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgYWRqdXN0bWVudCA9IHBhcnNlRmxvYXQoYWRqdXN0bWVudClcbiAgICAgICAgICBpZiAod2F5cG9pbnQub3B0aW9ucy5vZmZzZXQuaW5kZXhPZignJScpID4gLSAxKSB7XG4gICAgICAgICAgICBhZGp1c3RtZW50ID0gTWF0aC5jZWlsKGF4aXMuY29udGV4dERpbWVuc2lvbiAqIGFkanVzdG1lbnQgLyAxMDApXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dE1vZGlmaWVyID0gYXhpcy5jb250ZXh0U2Nyb2xsIC0gYXhpcy5jb250ZXh0T2Zmc2V0XG4gICAgICAgIHdheXBvaW50LnRyaWdnZXJQb2ludCA9IE1hdGguZmxvb3IoZWxlbWVudE9mZnNldCArIGNvbnRleHRNb2RpZmllciAtIGFkanVzdG1lbnQpXG4gICAgICAgIHdhc0JlZm9yZVNjcm9sbCA9IG9sZFRyaWdnZXJQb2ludCA8IGF4aXMub2xkU2Nyb2xsXG4gICAgICAgIG5vd0FmdGVyU2Nyb2xsID0gd2F5cG9pbnQudHJpZ2dlclBvaW50ID49IGF4aXMub2xkU2Nyb2xsXG4gICAgICAgIHRyaWdnZXJlZEJhY2t3YXJkID0gd2FzQmVmb3JlU2Nyb2xsICYmIG5vd0FmdGVyU2Nyb2xsXG4gICAgICAgIHRyaWdnZXJlZEZvcndhcmQgPSAhd2FzQmVmb3JlU2Nyb2xsICYmICFub3dBZnRlclNjcm9sbFxuXG4gICAgICAgIGlmICghZnJlc2hXYXlwb2ludCAmJiB0cmlnZ2VyZWRCYWNrd2FyZCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihheGlzLmJhY2t3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFmcmVzaFdheXBvaW50ICYmIHRyaWdnZXJlZEZvcndhcmQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoYXhpcy5mb3J3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZyZXNoV2F5cG9pbnQgJiYgYXhpcy5vbGRTY3JvbGwgPj0gd2F5cG9pbnQudHJpZ2dlclBvaW50KSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGF4aXMuZm9yd2FyZClcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGdyb3VwS2V5IGluIHRyaWdnZXJlZEdyb3Vwcykge1xuICAgICAgICB0cmlnZ2VyZWRHcm91cHNbZ3JvdXBLZXldLmZsdXNoVHJpZ2dlcnMoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LmZpbmRPckNyZWF0ZUJ5RWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gQ29udGV4dC5maW5kQnlFbGVtZW50KGVsZW1lbnQpIHx8IG5ldyBDb250ZXh0KGVsZW1lbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucmVmcmVzaEFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGNvbnRleHRJZCBpbiBjb250ZXh0cykge1xuICAgICAgY29udGV4dHNbY29udGV4dElkXS5yZWZyZXNoKClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQtZmluZC1ieS1lbGVtZW50ICovXG4gIENvbnRleHQuZmluZEJ5RWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gY29udGV4dHNbZWxlbWVudC53YXlwb2ludENvbnRleHRLZXldXG4gIH1cblxuICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKG9sZFdpbmRvd0xvYWQpIHtcbiAgICAgIG9sZFdpbmRvd0xvYWQoKVxuICAgIH1cbiAgICBDb250ZXh0LnJlZnJlc2hBbGwoKVxuICB9XG5cblxuICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciByZXF1ZXN0Rm4gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTaGltXG4gICAgcmVxdWVzdEZuLmNhbGwod2luZG93LCBjYWxsYmFjaylcbiAgfVxuICBXYXlwb2ludC5Db250ZXh0ID0gQ29udGV4dFxufSgpKVxuOyhmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZnVuY3Rpb24gYnlUcmlnZ2VyUG9pbnQoYSwgYikge1xuICAgIHJldHVybiBhLnRyaWdnZXJQb2ludCAtIGIudHJpZ2dlclBvaW50XG4gIH1cblxuICBmdW5jdGlvbiBieVJldmVyc2VUcmlnZ2VyUG9pbnQoYSwgYikge1xuICAgIHJldHVybiBiLnRyaWdnZXJQb2ludCAtIGEudHJpZ2dlclBvaW50XG4gIH1cblxuICB2YXIgZ3JvdXBzID0ge1xuICAgIHZlcnRpY2FsOiB7fSxcbiAgICBob3Jpem9udGFsOiB7fVxuICB9XG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9ncm91cCAqL1xuICBmdW5jdGlvbiBHcm91cChvcHRpb25zKSB7XG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lXG4gICAgdGhpcy5heGlzID0gb3B0aW9ucy5heGlzXG4gICAgdGhpcy5pZCA9IHRoaXMubmFtZSArICctJyArIHRoaXMuYXhpc1xuICAgIHRoaXMud2F5cG9pbnRzID0gW11cbiAgICB0aGlzLmNsZWFyVHJpZ2dlclF1ZXVlcygpXG4gICAgZ3JvdXBzW3RoaXMuYXhpc11bdGhpcy5uYW1lXSA9IHRoaXNcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdGhpcy53YXlwb2ludHMucHVzaCh3YXlwb2ludClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLmNsZWFyVHJpZ2dlclF1ZXVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudHJpZ2dlclF1ZXVlcyA9IHtcbiAgICAgIHVwOiBbXSxcbiAgICAgIGRvd246IFtdLFxuICAgICAgbGVmdDogW10sXG4gICAgICByaWdodDogW11cbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5mbHVzaFRyaWdnZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgZGlyZWN0aW9uIGluIHRoaXMudHJpZ2dlclF1ZXVlcykge1xuICAgICAgdmFyIHdheXBvaW50cyA9IHRoaXMudHJpZ2dlclF1ZXVlc1tkaXJlY3Rpb25dXG4gICAgICB2YXIgcmV2ZXJzZSA9IGRpcmVjdGlvbiA9PT0gJ3VwJyB8fCBkaXJlY3Rpb24gPT09ICdsZWZ0J1xuICAgICAgd2F5cG9pbnRzLnNvcnQocmV2ZXJzZSA/IGJ5UmV2ZXJzZVRyaWdnZXJQb2ludCA6IGJ5VHJpZ2dlclBvaW50KVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHdheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkgKz0gMSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB3YXlwb2ludHNbaV1cbiAgICAgICAgaWYgKHdheXBvaW50Lm9wdGlvbnMuY29udGludW91cyB8fCBpID09PSB3YXlwb2ludHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHdheXBvaW50LnRyaWdnZXIoW2RpcmVjdGlvbl0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jbGVhclRyaWdnZXJRdWV1ZXMoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdGhpcy53YXlwb2ludHMuc29ydChieVRyaWdnZXJQb2ludClcbiAgICB2YXIgaW5kZXggPSBXYXlwb2ludC5BZGFwdGVyLmluQXJyYXkod2F5cG9pbnQsIHRoaXMud2F5cG9pbnRzKVxuICAgIHZhciBpc0xhc3QgPSBpbmRleCA9PT0gdGhpcy53YXlwb2ludHMubGVuZ3RoIC0gMVxuICAgIHJldHVybiBpc0xhc3QgPyBudWxsIDogdGhpcy53YXlwb2ludHNbaW5kZXggKyAxXVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHRoaXMud2F5cG9pbnRzLnNvcnQoYnlUcmlnZ2VyUG9pbnQpXG4gICAgdmFyIGluZGV4ID0gV2F5cG9pbnQuQWRhcHRlci5pbkFycmF5KHdheXBvaW50LCB0aGlzLndheXBvaW50cylcbiAgICByZXR1cm4gaW5kZXggPyB0aGlzLndheXBvaW50c1tpbmRleCAtIDFdIDogbnVsbFxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucXVldWVUcmlnZ2VyID0gZnVuY3Rpb24od2F5cG9pbnQsIGRpcmVjdGlvbikge1xuICAgIHRoaXMudHJpZ2dlclF1ZXVlc1tkaXJlY3Rpb25dLnB1c2god2F5cG9pbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHZhciBpbmRleCA9IFdheXBvaW50LkFkYXB0ZXIuaW5BcnJheSh3YXlwb2ludCwgdGhpcy53YXlwb2ludHMpXG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMud2F5cG9pbnRzLnNwbGljZShpbmRleCwgMSlcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2ZpcnN0ICovXG4gIEdyb3VwLnByb3RvdHlwZS5maXJzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLndheXBvaW50c1swXVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9sYXN0ICovXG4gIEdyb3VwLnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMud2F5cG9pbnRzW3RoaXMud2F5cG9pbnRzLmxlbmd0aCAtIDFdXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLmZpbmRPckNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gZ3JvdXBzW29wdGlvbnMuYXhpc11bb3B0aW9ucy5uYW1lXSB8fCBuZXcgR3JvdXAob3B0aW9ucylcbiAgfVxuXG4gIFdheXBvaW50Lkdyb3VwID0gR3JvdXBcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciAkID0gd2luZG93LmpRdWVyeVxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICBmdW5jdGlvbiBKUXVlcnlBZGFwdGVyKGVsZW1lbnQpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KVxuICB9XG5cbiAgJC5lYWNoKFtcbiAgICAnaW5uZXJIZWlnaHQnLFxuICAgICdpbm5lcldpZHRoJyxcbiAgICAnb2ZmJyxcbiAgICAnb2Zmc2V0JyxcbiAgICAnb24nLFxuICAgICdvdXRlckhlaWdodCcsXG4gICAgJ291dGVyV2lkdGgnLFxuICAgICdzY3JvbGxMZWZ0JyxcbiAgICAnc2Nyb2xsVG9wJ1xuICBdLCBmdW5jdGlvbihpLCBtZXRob2QpIHtcbiAgICBKUXVlcnlBZGFwdGVyLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgIHJldHVybiB0aGlzLiRlbGVtZW50W21ldGhvZF0uYXBwbHkodGhpcy4kZWxlbWVudCwgYXJncylcbiAgICB9XG4gIH0pXG5cbiAgJC5lYWNoKFtcbiAgICAnZXh0ZW5kJyxcbiAgICAnaW5BcnJheScsXG4gICAgJ2lzRW1wdHlPYmplY3QnXG4gIF0sIGZ1bmN0aW9uKGksIG1ldGhvZCkge1xuICAgIEpRdWVyeUFkYXB0ZXJbbWV0aG9kXSA9ICRbbWV0aG9kXVxuICB9KVxuXG4gIFdheXBvaW50LmFkYXB0ZXJzLnB1c2goe1xuICAgIG5hbWU6ICdqcXVlcnknLFxuICAgIEFkYXB0ZXI6IEpRdWVyeUFkYXB0ZXJcbiAgfSlcbiAgV2F5cG9pbnQuQWRhcHRlciA9IEpRdWVyeUFkYXB0ZXJcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUV4dGVuc2lvbihmcmFtZXdvcmspIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgd2F5cG9pbnRzID0gW11cbiAgICAgIHZhciBvdmVycmlkZXMgPSBhcmd1bWVudHNbMF1cblxuICAgICAgaWYgKGZyYW1ld29yay5pc0Z1bmN0aW9uKGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3ZlcnJpZGVzID0gZnJhbWV3b3JrLmV4dGVuZCh7fSwgYXJndW1lbnRzWzFdKVxuICAgICAgICBvdmVycmlkZXMuaGFuZGxlciA9IGFyZ3VtZW50c1swXVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gZnJhbWV3b3JrLmV4dGVuZCh7fSwgb3ZlcnJpZGVzLCB7XG4gICAgICAgICAgZWxlbWVudDogdGhpc1xuICAgICAgICB9KVxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuY29udGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBvcHRpb25zLmNvbnRleHQgPSBmcmFtZXdvcmsodGhpcykuY2xvc2VzdChvcHRpb25zLmNvbnRleHQpWzBdXG4gICAgICAgIH1cbiAgICAgICAgd2F5cG9pbnRzLnB1c2gobmV3IFdheXBvaW50KG9wdGlvbnMpKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHdheXBvaW50c1xuICAgIH1cbiAgfVxuXG4gIGlmICh3aW5kb3cualF1ZXJ5KSB7XG4gICAgd2luZG93LmpRdWVyeS5mbi53YXlwb2ludCA9IGNyZWF0ZUV4dGVuc2lvbih3aW5kb3cualF1ZXJ5KVxuICB9XG4gIGlmICh3aW5kb3cuWmVwdG8pIHtcbiAgICB3aW5kb3cuWmVwdG8uZm4ud2F5cG9pbnQgPSBjcmVhdGVFeHRlbnNpb24od2luZG93LlplcHRvKVxuICB9XG59KCkpXG47IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG4gICAgJChcIi5sYXp5XCIpLnJlY2xpbmVyKHtcbiAgICAgICAgYXR0cmliOiBcImRhdGEtc3JjXCIsIC8vIHNlbGVjdG9yIGZvciBhdHRyaWJ1dGUgY29udGFpbmluZyB0aGUgbWVkaWEgc3JjXG4gICAgICAgIHRocm90dGxlOiAzMDAsICAgICAgLy8gbWlsbGlzZWNvbmQgaW50ZXJ2YWwgYXQgd2hpY2ggdG8gcHJvY2VzcyBldmVudHNcbiAgICAgICAgdGhyZXNob2xkOiAxMDAsICAgICAvLyBzY3JvbGwgZGlzdGFuY2UgZnJvbSBlbGVtZW50IGJlZm9yZSBpdHMgbG9hZGVkXG4gICAgICAgIHByaW50YWJsZTogdHJ1ZSwgICAgLy8gYmUgcHJpbnRlciBmcmllbmRseSBhbmQgc2hvdyBhbGwgZWxlbWVudHMgb24gZG9jdW1lbnQgcHJpbnRcbiAgICAgICAgbGl2ZTogdHJ1ZSAgICAgICAgICAvLyBhdXRvIGJpbmQgbGF6eSBsb2FkaW5nIHRvIGFqYXggbG9hZGVkIGVsZW1lbnRzXG4gICAgfSk7XG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2xhenlsb2FkJywgJy5sYXp5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZSA9ICQodGhpcyk7XG4gICAgICAgIC8vIGRvIHNvbWV0aGluZyB3aXRoIHRoZSBlbGVtZW50IHRvIGJlIGxvYWRlZC4uLlxuICAgICAgICAvLyBjb25zb2xlLmxvZygnbGF6eWxvYWQnLCAkZSk7XG4gICAgfSk7XG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnOyAgICBcbiAgICBcbiAgICBcbiAgICBcbiAgICBsZXQgJHNlY3Rpb25fdmlkZW9zID0gJCgnLnNlY3Rpb24tdmlkZW9zJyk7XG4gICAgaWYgKCAkKCcuc2xpY2snLCAkc2VjdGlvbl92aWRlb3MpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi12aWRlb3MgLnNsaWNrJyApO1xuICAgICAgICBcbiAgICAgICAgJCgnLnNlY3Rpb24tdmlkZW9zJykuaW1hZ2VzTG9hZGVkKCB7YmFja2dyb3VuZDogJy5iYWNrZ3JvdW5kJ30pXG4gICAgICAgIFxuICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuICAgIFxuICAgICAgICAgICAgJCgnLnNlY3Rpb24tdmlkZW9zIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDIsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAyLFxuICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zZWN0aW9uLXZpZGVvcyAuc2xpY2stYXJyb3dzJyksXG4gICAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBicmVha3BvaW50OiA5NzksXG4gICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTsgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICRzZWN0aW9uX3ZpZGVvcy5hZGRDbGFzcygnaW1hZ2VzLWxvYWRlZCcpO1xuICAgICAgICBcbiAgICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBsZXQgJHNlY3Rpb25fc3RvcmllcyA9ICQoJy5zZWN0aW9uLXN0b3JpZXMnKTtcbiAgICBpZiAoICQoJy5zbGljaycsICRzZWN0aW9uX3N0b3JpZXMpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgJCgnLnNlY3Rpb24tc3RvcmllcycpLmltYWdlc0xvYWRlZCh7YmFja2dyb3VuZDogJ2EnfSlcbiAgICAgICAgXG4gICAgICAgIC5kb25lKCBmdW5jdGlvbiggaW5zdGFuY2UgKSB7XG4gICAgXG4gICAgICAgICAgICAkKCAnPGRpdiBjbGFzcz1cInNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLXN0b3JpZXMgLnNsaWNrJyApO1xuICAgICAgICBcbiAgICAgICAgICAgICQoJy5zZWN0aW9uLXN0b3JpZXMgLnNsaWNrJykuc2xpY2soe1xuICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICAgIGFwcGVuZEFycm93czogJCgnLnNlY3Rpb24tc3RvcmllcyAuc2xpY2stYXJyb3dzJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNlY3Rpb25fc3Rvcmllcy5hZGRDbGFzcygnaW1hZ2VzLWxvYWRlZCcpO1xuICAgICAgICBcbiAgICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBsZXQgJHNpbmdsZVBvc3RTbGlkZXIgPSAkKCcuc2luZ2xlLXBvc3QgLnNsaWRlcicpO1xuICAgIGlmICggJCgnLnNsaWNrJywgJHNpbmdsZVBvc3RTbGlkZXIpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgJHNpbmdsZVBvc3RTbGlkZXIuaW1hZ2VzTG9hZGVkKHtiYWNrZ3JvdW5kOiB0cnVlfSlcbiAgICAgICAgXG4gICAgICAgIC5kb25lKCBmdW5jdGlvbiggaW5zdGFuY2UgKSB7XG4gICAgICAgIFxuICAgICAgICAgICAgJCgnLnNsaWNrJywgJHNpbmdsZVBvc3RTbGlkZXIpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zbGljay1hcnJvd3MnLCAkc2luZ2xlUG9zdFNsaWRlcilcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNpbmdsZVBvc3RTbGlkZXIuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcbiAgICAgICAgXG4gICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi1jb3JlLWJlaGF2aW9ycyAuc2xpY2snICk7XG4gICAgXG4gICAgJCgnLnNlY3Rpb24tY29yZS1iZWhhdmlvcnMgLnNsaWNrJykuc2xpY2soe1xuICAgICAgICBmYWRlOiB0cnVlLFxuICAgICAgICBkb3RzOiB0cnVlLFxuICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IGZhbHNlLFxuICAgICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zZWN0aW9uLWNvcmUtYmVoYXZpb3JzIC5zbGljay1hcnJvd3MnKVxuICAgIH0pO1xuICAgIFxuICAgICQoJy5zZWN0aW9uLWNvcmUtYmVoYXZpb3JzIC5ncmlkJykub24oJ2NsaWNrJywnLmdyaWQtaXRlbScsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBzbGlkZUluZGV4ID0gJCh0aGlzKS5wYXJlbnQoKS5pbmRleCgpO1xuICAgICAgICAkKCAnLnNlY3Rpb24tY29yZS1iZWhhdmlvcnMgLnNsaWNrJyApLnNsaWNrKCAnc2xpY2tHb1RvJywgcGFyc2VJbnQoc2xpZGVJbmRleCkgKTtcbiAgICB9KTtcbiAgICBcbiAgICBcbiAgICAvLyBSZWxhdGVkIFBvc3RzXG4gICAgXG5sZXQgJHNlY3Rpb25fcmVsYXRlZF9wb3N0cyA9ICQoJy5zZWN0aW9uLXJlbGF0ZWQtcG9zdHMnKTtcbiAgICBpZiAoICQoJy5zbGljaycsICRzZWN0aW9uX3JlbGF0ZWRfcG9zdHMpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgLy8kKCAnPGRpdiBjbGFzcz1cInNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLXJlbGF0ZWQtcG9zdHMgLnNsaWNrJyApO1xuICAgICAgICBcbiAgICAgICAgJCgnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cycpLmltYWdlc0xvYWRlZCgge2JhY2tncm91bmQ6ICcucG9zdC1oZXJvJ30pXG4gICAgICAgIFxuICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuICAgIFxuICAgICAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJjb2x1bW4gcm93IHNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLXJlbGF0ZWQtcG9zdHMgLnNsaWNrJyApO1xuICAgIFxuICAgICAgICAgICAgJCgnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cyAuc2xpY2snKS5zbGljayh7XG4gICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA0LFxuICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgICAgICAgYXBwZW5kQXJyb3dzOiAkKCcuc2VjdGlvbi1yZWxhdGVkLXBvc3RzIC5zbGljay1hcnJvd3MnKSxcbiAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IDEyMDAsXG4gICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogOTgwLFxuICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAyLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogNDgwLFxuICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBZb3UgY2FuIHVuc2xpY2sgYXQgYSBnaXZlbiBicmVha3BvaW50IG5vdyBieSBhZGRpbmc6XG4gICAgICAgICAgICAgICAgLy8gc2V0dGluZ3M6IFwidW5zbGlja1wiXG4gICAgICAgICAgICAgICAgLy8gaW5zdGVhZCBvZiBhIHNldHRpbmdzIG9iamVjdFxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTsgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICRzZWN0aW9uX3JlbGF0ZWRfcG9zdHMuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcbiAgICAgICAgXG4gICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgbGV0ICRzZWN0aW9uX3Rlc3RpbW9uaWFscyA9ICQoJy5zZWN0aW9uLXRlc3RpbW9uaWFscycpO1xuICAgIGlmICggJCgnLnNsaWNrJywgJHNlY3Rpb25fdGVzdGltb25pYWxzKS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICQoICc8ZGl2IGNsYXNzPVwic2xpY2stYXJyb3dzXCI+PC9kaXY+JyApLmluc2VydEFmdGVyKCAnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljaycgKTtcbiAgICAgICAgXG4gICAgICAgICQoJy5zZWN0aW9uLXRlc3RpbW9uaWFscycpLmltYWdlc0xvYWRlZCgpXG4gICAgICAgIFxuICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuICAgIFxuICAgICAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi10ZXN0aW1vbmlhbHMgLnNsaWNrJyApO1xuICAgICAgICAgICAgJCgnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICAgIGFwcGVuZEFycm93czogJCgnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljay1hcnJvd3MnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNlY3Rpb25fdGVzdGltb25pYWxzLmFkZENsYXNzKCdpbWFnZXMtbG9hZGVkJyk7XG4gICAgICAgIFxuICAgICAgICAgfSk7XG4gICAgfVxuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0JChcIi5qcy1zdXBlcmZpc2hcIikuc3VwZXJmaXNoKHtcbiAgICAgICAgZGVsYXk6MTAwLFxuICAgICAgICAvL2FuaW1hdGlvbjp7b3BhY2l0eTpcInNob3dcIixoZWlnaHQ6XCJzaG93XCJ9LFxuICAgICAgICBkcm9wU2hhZG93czohMVxuICAgIH0pO1xuICAgIFxuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiLyohXG5XYXlwb2ludHMgSW52aWV3IFNob3J0Y3V0IC0gNC4wLjFcbkNvcHlyaWdodCDCqSAyMDExLTIwMTYgQ2FsZWIgVHJvdWdodG9uXG5MaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5odHRwczovL2dpdGh1Yi5jb20vaW1ha2V3ZWJ0aGluZ3Mvd2F5cG9pbnRzL2Jsb2IvbWFzdGVyL2xpY2Vuc2VzLnR4dFxuKi9cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZnVuY3Rpb24gbm9vcCgpIHt9XG5cbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvc2hvcnRjdXRzL2ludmlldyAqL1xuICBmdW5jdGlvbiBJbnZpZXcob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IFdheXBvaW50LkFkYXB0ZXIuZXh0ZW5kKHt9LCBJbnZpZXcuZGVmYXVsdHMsIG9wdGlvbnMpXG4gICAgdGhpcy5heGlzID0gdGhpcy5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy53YXlwb2ludHMgPSBbXVxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMub3B0aW9ucy5lbGVtZW50XG4gICAgdGhpcy5jcmVhdGVXYXlwb2ludHMoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBJbnZpZXcucHJvdG90eXBlLmNyZWF0ZVdheXBvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb25maWdzID0ge1xuICAgICAgdmVydGljYWw6IFt7XG4gICAgICAgIGRvd246ICdlbnRlcicsXG4gICAgICAgIHVwOiAnZXhpdGVkJyxcbiAgICAgICAgb2Zmc2V0OiAnMTAwJSdcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2VudGVyZWQnLFxuICAgICAgICB1cDogJ2V4aXQnLFxuICAgICAgICBvZmZzZXQ6ICdib3R0b20taW4tdmlldydcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2V4aXQnLFxuICAgICAgICB1cDogJ2VudGVyZWQnLFxuICAgICAgICBvZmZzZXQ6IDBcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2V4aXRlZCcsXG4gICAgICAgIHVwOiAnZW50ZXInLFxuICAgICAgICBvZmZzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAtdGhpcy5hZGFwdGVyLm91dGVySGVpZ2h0KClcbiAgICAgICAgfVxuICAgICAgfV0sXG4gICAgICBob3Jpem9udGFsOiBbe1xuICAgICAgICByaWdodDogJ2VudGVyJyxcbiAgICAgICAgbGVmdDogJ2V4aXRlZCcsXG4gICAgICAgIG9mZnNldDogJzEwMCUnXG4gICAgICB9LCB7XG4gICAgICAgIHJpZ2h0OiAnZW50ZXJlZCcsXG4gICAgICAgIGxlZnQ6ICdleGl0JyxcbiAgICAgICAgb2Zmc2V0OiAncmlnaHQtaW4tdmlldydcbiAgICAgIH0sIHtcbiAgICAgICAgcmlnaHQ6ICdleGl0JyxcbiAgICAgICAgbGVmdDogJ2VudGVyZWQnLFxuICAgICAgICBvZmZzZXQ6IDBcbiAgICAgIH0sIHtcbiAgICAgICAgcmlnaHQ6ICdleGl0ZWQnLFxuICAgICAgICBsZWZ0OiAnZW50ZXInLFxuICAgICAgICBvZmZzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAtdGhpcy5hZGFwdGVyLm91dGVyV2lkdGgoKVxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBjb25maWdzW3RoaXMuYXhpc10ubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHZhciBjb25maWcgPSBjb25maWdzW3RoaXMuYXhpc11baV1cbiAgICAgIHRoaXMuY3JlYXRlV2F5cG9pbnQoY29uZmlnKVxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgSW52aWV3LnByb3RvdHlwZS5jcmVhdGVXYXlwb2ludCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIHRoaXMud2F5cG9pbnRzLnB1c2gobmV3IFdheXBvaW50KHtcbiAgICAgIGNvbnRleHQ6IHRoaXMub3B0aW9ucy5jb250ZXh0LFxuICAgICAgZWxlbWVudDogdGhpcy5vcHRpb25zLmVsZW1lbnQsXG4gICAgICBlbmFibGVkOiB0aGlzLm9wdGlvbnMuZW5hYmxlZCxcbiAgICAgIGhhbmRsZXI6IChmdW5jdGlvbihjb25maWcpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgICAgIHNlbGYub3B0aW9uc1tjb25maWdbZGlyZWN0aW9uXV0uY2FsbChzZWxmLCBkaXJlY3Rpb24pXG4gICAgICAgIH1cbiAgICAgIH0oY29uZmlnKSksXG4gICAgICBvZmZzZXQ6IGNvbmZpZy5vZmZzZXQsXG4gICAgICBob3Jpem9udGFsOiB0aGlzLm9wdGlvbnMuaG9yaXpvbnRhbFxuICAgIH0pKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIEludmlldy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLndheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpcy53YXlwb2ludHNbaV0uZGVzdHJveSgpXG4gICAgfVxuICAgIHRoaXMud2F5cG9pbnRzID0gW11cbiAgfVxuXG4gIEludmlldy5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLndheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpcy53YXlwb2ludHNbaV0uZGlzYWJsZSgpXG4gICAgfVxuICB9XG5cbiAgSW52aWV3LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy53YXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXMud2F5cG9pbnRzW2ldLmVuYWJsZSgpXG4gICAgfVxuICB9XG5cbiAgSW52aWV3LmRlZmF1bHRzID0ge1xuICAgIGNvbnRleHQ6IHdpbmRvdyxcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGVudGVyOiBub29wLFxuICAgIGVudGVyZWQ6IG5vb3AsXG4gICAgZXhpdDogbm9vcCxcbiAgICBleGl0ZWQ6IG5vb3BcbiAgfVxuXG4gIFdheXBvaW50LkludmlldyA9IEludmlld1xufSgpKVxuOyIsIihmdW5jdGlvbigkKSB7XG5cdFxuXHQndXNlIHN0cmljdCc7XHRcblx0XG5cdHZhciAkbGVnZW5kID0gJCggJy5zZWN0aW9uLWJ1c2luZXNzLWxpbmVzLW1hcCAubGVnZW5kJyApO1xuICAgIFxuICAgIHZhciAkbWFwcyA9ICQoICcuc2VjdGlvbi1idXNpbmVzcy1saW5lcy1tYXAgLm1hcHMnICk7XG4gICAgXG4gICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRtYXBzLmFuaW1hdGUoeydvcGFjaXR5JzonMSd9LDUwMCk7XG4gICAgfSk7XG4gICAgICAgIFxuICAgIC8vY2xvc2UgY2FyZCB3aGVuIGNsaWNrIG9uIGNyb3NzXG4gICAgJGxlZ2VuZC5vbignaG92ZXInLCdidXR0b24nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIGlmKCQoJ2JvZHknKS5oYXNDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcCcpO1xuICAgICAgICBpZigkKGlkKS5jc3MoJ29wYWNpdHknKSA9PSAwKSB7XG4gICAgICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5ub3QoaWQpLmFuaW1hdGUoeydvcGFjaXR5JzonMCd9LDEwMCk7XG4gICAgICAgICAgICAkKGlkKS5zdG9wKCkuYW5pbWF0ZSh7J29wYWNpdHknOicxJ30sMTAwKTtcbiAgICAgICAgfVxuICAgICBcbiAgICB9KTtcbiAgICBcbiAgICAkbGVnZW5kLm9uKCdjbGljaycsJ2J1dHRvbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcCcpO1xuICAgICAgICBpZigkKGlkKS5jc3MoJ29wYWNpdHknKSA9PSAwKSB7XG4gICAgICAgICAgICAkKCcubWFwJykuc3RvcCgpLm5vdChpZCkuY3NzKHsnb3BhY2l0eSc6JzAnfSk7XG4gICAgICAgICAgICAkKGlkKS5zdG9wKCkuY3NzKHsnb3BhY2l0eSc6JzEnfSk7ICAgICAgICAgICAgXG4gICAgICAgIH0gXG4gICAgICAgIFxuICAgICAgICAkKGlkKS5hZGRDbGFzcygnYWN0aXZlJyk7ICAgXG4gICAgIFxuICAgIH0pO1xuICAgIFxuICAgICRsZWdlbmQubW91c2VsZWF2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIGlmKCQoJ2JvZHknKS5oYXNDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5hbmltYXRlKHsnb3BhY2l0eSc6JzAnfSwxMDApO1xuICAgICAgICAkKCcjbWFwLTAnKS5zdG9wKCkuYW5pbWF0ZSh7J29wYWNpdHknOicxJ30sMTAwKTtcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBpZigkKCcucGFnZS10ZW1wbGF0ZS1jYXJlZXJzJykubGVuZ3RoKSB7XG4gICAgICAgIHZhciBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuICAgICAgICBpZihzZWFyY2hQYXJhbXMuaGFzKCdzZWFyY2gnKSkge1xuICAgICAgICAgICAgdmFyIHBhcmFtID0gc2VhcmNoUGFyYW1zLmdldCgnc2VhcmNoJyk7XG4gICAgICAgICAgICBpZihwYXJhbSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkKCcjY2FyZWVycy1yb290Jykub2Zmc2V0KCkudG9wIC0zNSB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgICAkKFwibWFpbiBzZWN0aW9uOm5vdCgnLmNhcmVlcnMtc2VjdGlvbicpXCIpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB3aW5kb3cucmVhY3RNYXRjaEhlaWdodCA9IGZ1bmN0aW9uKGVsQ2xhc3NOYW1lKSB7XG4gICAgICAgICAgJCgnLmNhcmVlcnMtc2VjdGlvbiAuY29sdW1uIGgzJykubWF0Y2hIZWlnaHQoeyByb3c6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIE9wZW4gZXh0ZXJuYWwgbGlua3MgaW4gbmV3IHdpbmRvdyAoZXhjbHVlIHNjdiBpbWFnZSBtYXBzLCBlbWFpbCwgdGVsIGFuZCBmb29ib3gpXG5cblx0JCgnYScpLm5vdCgnc3ZnIGEsIFtocmVmKj1cInRlbDpcIl0sIFtjbGFzcyo9XCJmb29ib3hcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaXNJbnRlcm5hbExpbmsgPSBuZXcgUmVnRXhwKCcvJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgJy8nKTtcblx0XHRpZiAoICEgaXNJbnRlcm5hbExpbmsudGVzdCh0aGlzLmhyZWYpICkge1xuXHRcdFx0JCh0aGlzKS5hdHRyKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG5cdFx0fVxuXHR9KTtcblx0XG4gICAgJCgnYVtocmVmKj1cIi5wZGZcIl0nKS5hdHRyKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiIsIihmdW5jdGlvbigkKSB7XG4gICAgJChkb2N1bWVudCkub24oJ2ZhY2V0d3AtbG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChGV1AubG9hZGVkKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCgnLmZhY2V0d3AtdGVtcGxhdGUnKTtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSAtMTUwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCgnLmZhY2V0d3AtZmlsdGVycycpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCgnLmZhY2V0d3AtZmlsdGVycycpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCAkKCcuZmFjZXR3cC1jdXN0b20tZmlsdGVycycpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCgnLmZhY2V0d3AtY3VzdG9tLWZpbHRlcnMnKTtcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSAtNjA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgICAgICBzY3JvbGxUYXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IG9mZnNldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNib29rLWZpbHRlcnMnKS5mb3VuZGF0aW9uKCdjbG9zZScpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBGb3VuZGF0aW9uLnJlSW5pdCgnZXF1YWxpemVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSk7XG4gICAgXG4gICAgXG59KShqUXVlcnkpOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgZGlkU2Nyb2xsO1xuICAgIHZhciBsYXN0U2Nyb2xsVG9wID0gMDtcbiAgICB2YXIgZGVsdGEgPSAyMDA7XG4gICAgdmFyIG5hdmJhckhlaWdodCA9ICQoJy5zaXRlLWhlYWRlcicpLm91dGVySGVpZ2h0KCk7XG4gICAgXG4gICAgJCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbihldmVudCl7XG4gICAgICAgIGRpZFNjcm9sbCA9IHRydWU7XG4gICAgfSk7XG4gICAgXG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChkaWRTY3JvbGwpIHtcbiAgICAgICAgICAgIGhhc1Njcm9sbGVkKCk7XG4gICAgICAgICAgICBkaWRTY3JvbGwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIDI1MCk7XG4gICAgXG4gICAgZnVuY3Rpb24gaGFzU2Nyb2xsZWQoKSB7XG4gICAgICAgIHZhciBzdCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2Ugc2Nyb2xsIG1vcmUgdGhhbiBkZWx0YVxuICAgICAgICBpZihNYXRoLmFicyhsYXN0U2Nyb2xsVG9wIC0gc3QpIDw9IGRlbHRhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgLy8gSWYgc2Nyb2xsZWQgZG93biBhbmQgcGFzdCB0aGUgbmF2YmFyLCBhZGQgY2xhc3MgLm5hdi11cC5cbiAgICAgICAgaWYgKHN0ID4gbGFzdFNjcm9sbFRvcCl7XG4gICAgICAgICAgICAvLyBTY3JvbGwgRG93blxuICAgICAgICAgICAgaWYoc3QgPiBuYXZiYXJIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5hZGRDbGFzcygnZml4ZWQnKS5yZW1vdmVDbGFzcygnbmF2LWRvd24nKS5hZGRDbGFzcygnbmF2LXVwIHNocmluaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2Nyb2xsIFVwXG4gICAgICAgICAgICBpZigoZGVsdGErbmF2YmFySGVpZ2h0KSArIHN0ICsgJCh3aW5kb3cpLmhlaWdodCgpIDwgJChkb2N1bWVudCkuaGVpZ2h0KCkpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnbmF2LXVwJykuYWRkQ2xhc3MoJ25hdi1kb3duJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKHN0IDw9IChkZWx0YStuYXZiYXJIZWlnaHQpKSB7XG4gICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnZml4ZWQgbmF2LWRvd24gc2hyaW5rJyk7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgIGxhc3RTY3JvbGxUb3AgPSBzdDtcbiAgICB9XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIExvYWQgRm91bmRhdGlvblxuXHQkKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG4gICAgXG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdkb2N1bWVudC1yZWFkeScpO1xuICAgXG4gICAgJCgnLnNjcm9sbC1uZXh0Jykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgICAgXG4gICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgIG9mZnNldDogLTEwMCxcbiAgICAgICAgICAgIHNjcm9sbFRhcmdldDogJCgnbWFpbiBzZWN0aW9uOmZpcnN0LWNoaWxkJyksXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFRvZ2dsZSBtZW51XG4gICAgXG4gICAgJCgnbGkubWVudS1pdGVtLWhhcy1jaGlsZHJlbiA+IGFbaHJlZl49XCIjXCJdJykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgICAgXG4gICAgICAgIHZhciAkdG9nZ2xlID0gJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuc3ViLW1lbnUtdG9nZ2xlJyk7XG4gICAgICAgIFxuICAgICAgICBpZiggJHRvZ2dsZS5pcygnOnZpc2libGUnKSApIHtcbiAgICAgICAgICAgICR0b2dnbGUudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG5cbiAgICB9KTtcbiAgICBcbiAgXG4gICAgJCh3aW5kb3cpLnNjcm9sbChhbmltYXRlTnVtYmVycyk7XG4gICAgXG4gICAgJCh3aW5kb3cpLm9uKFwibG9hZCBzY3JvbGxcIixmdW5jdGlvbihlKXtcbiAgICAgICAgYW5pbWF0ZU51bWJlcnMoKTsgXG4gICAgfSk7XG4gICAgdmFyIHZpZXdlZCA9IGZhbHNlO1xuICAgIFxuICAgIGZ1bmN0aW9uIGlzU2Nyb2xsZWRJbnRvVmlldyhlbGVtKSB7XG4gICAgICAgIFxuICAgICAgICBpZiggISAkKGVsZW0pLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIGRvY1ZpZXdUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgICAgIHZhciBkb2NWaWV3Qm90dG9tID0gZG9jVmlld1RvcCArICQod2luZG93KS5oZWlnaHQoKTtcbiAgICBcbiAgICAgICAgdmFyIGVsZW1Ub3AgPSAkKGVsZW0pLm9mZnNldCgpLnRvcDtcbiAgICAgICAgdmFyIGVsZW1Cb3R0b20gPSBlbGVtVG9wICsgJChlbGVtKS5oZWlnaHQoKTtcbiAgICBcbiAgICAgICAgcmV0dXJuICgoZWxlbUJvdHRvbSA8PSBkb2NWaWV3Qm90dG9tKSAmJiAoZWxlbVRvcCA+PSBkb2NWaWV3VG9wKSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGFuaW1hdGVOdW1iZXJzKCkge1xuICAgICAgaWYgKGlzU2Nyb2xsZWRJbnRvVmlldygkKFwiLm51bWJlcnNcIikpICYmICF2aWV3ZWQpIHtcbiAgICAgICAgICB2aWV3ZWQgPSB0cnVlO1xuICAgICAgICAgICQoJy5udW1iZXInKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkKHRoaXMpLmNzcygnb3BhY2l0eScsIDEpO1xuICAgICAgICAgICQodGhpcykucHJvcCgnQ291bnRlcicsMCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgIENvdW50ZXI6ICQodGhpcykudGV4dCgpLnJlcGxhY2UoLywvZywgJycpXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogNDAwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICBzdGVwOiBmdW5jdGlvbiAobm93KSB7XG4gICAgICAgICAgICAgICAgICAkKHRoaXMpLnRleHQoTWF0aC5jZWlsKG5vdykudG9TdHJpbmcoKS5yZXBsYWNlKC8oXFxkKSg/PShcXGRcXGRcXGQpKyg/IVxcZCkpL2csIFwiJDEsXCIpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkKCcudWwtZXhwYW5kJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKCQodGhpcykuZmluZCgnbGk6dmlzaWJsZScpLmxlbmd0aCkge1xuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCdzcGFuIGEnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAkKCcudWwtZXhwYW5kJykub24oJ2NsaWNrJywnc3BhbiBhJyxmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvL3ZhciAkY2hpbGRyZW4gPSAkKHRoaXMpLnByZXYoJ3VsJykuY2hpbGRyZW4oKTtcbiAgICAgICAgXG4gICAgICAgIC8vJGNoaWxkcmVuLmNzcygnZGlzcGxheScsICdpbmxpbmUnKTtcbiAgICAgICAgLy9yZXR1cm4gZmFsc2U7XG4gICAgICAgICQodGhpcykucGFyZW50cygnZGl2JykuZmluZCgndWwnKS5yZW1vdmVDbGFzcygnc2hvcnQnKTtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTsgIFxuICAgIH0pO1xuXG4gICAgXG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIFJlcGxhY2UgYWxsIFNWRyBpbWFnZXMgd2l0aCBpbmxpbmUgU1ZHICh1c2UgYXMgbmVlZGVkIHNvIHlvdSBjYW4gc2V0IGhvdmVyIGZpbGxzKVxuXG4gICAgICAgICQoJ2ltZy5zdmcnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgJGltZyA9IGpRdWVyeSh0aGlzKTtcbiAgICAgICAgICAgIHZhciBpbWdJRCA9ICRpbWcuYXR0cignaWQnKTtcbiAgICAgICAgICAgIHZhciBpbWdDbGFzcyA9ICRpbWcuYXR0cignY2xhc3MnKTtcbiAgICAgICAgICAgIHZhciBpbWdVUkwgPSAkaW1nLmF0dHIoJ3NyYycpO1xuXG5cdFx0JC5nZXQoaW1nVVJMLCBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHQvLyBHZXQgdGhlIFNWRyB0YWcsIGlnbm9yZSB0aGUgcmVzdFxuXHRcdFx0dmFyICRzdmcgPSBqUXVlcnkoZGF0YSkuZmluZCgnc3ZnJyk7XG5cblx0XHRcdC8vIEFkZCByZXBsYWNlZCBpbWFnZSdzIElEIHRvIHRoZSBuZXcgU1ZHXG5cdFx0XHRpZih0eXBlb2YgaW1nSUQgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdCRzdmcgPSAkc3ZnLmF0dHIoJ2lkJywgaW1nSUQpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gQWRkIHJlcGxhY2VkIGltYWdlJ3MgY2xhc3NlcyB0byB0aGUgbmV3IFNWR1xuXHRcdFx0aWYodHlwZW9mIGltZ0NsYXNzICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHQkc3ZnID0gJHN2Zy5hdHRyKCdjbGFzcycsIGltZ0NsYXNzKycgcmVwbGFjZWQtc3ZnJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlbW92ZSBhbnkgaW52YWxpZCBYTUwgdGFncyBhcyBwZXIgaHR0cDovL3ZhbGlkYXRvci53My5vcmdcblx0XHRcdCRzdmcgPSAkc3ZnLnJlbW92ZUF0dHIoJ3htbG5zOmEnKTtcblxuXHRcdFx0Ly8gUmVwbGFjZSBpbWFnZSB3aXRoIG5ldyBTVkdcblx0XHRcdCRpbWcucmVwbGFjZVdpdGgoJHN2Zyk7XG5cblx0XHR9LCAneG1sJyk7XG5cblx0fSk7XG5cbiAgICBcblxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiKGZ1bmN0aW9uKCQpIHtcblx0XG5cdCd1c2Ugc3RyaWN0JztcdFxuXHRcblx0XG4gICAgdmFyICRjb2x1bW4gPSAkKCcuc2VjdGlvbi1sZWFkZXJzaGlwIC5ncmlkIC5jb2x1bW4nKTtcbiAgICBcbiAgICAvL29wZW4gYW5kIGNsb3NlIGNvbHVtblxuICAgICRjb2x1bW4uZmluZCgnLmpzLWV4cGFuZGVyIC5vcGVuLCAuanMtZXhwYW5kZXIgLnRodW1ibmFpbCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgdmFyICR0aGlzQ29sdW1uID0gJCh0aGlzKS5jbG9zZXN0KCcuY29sdW1uJyk7XG4gICAgXG4gICAgICBpZiAoJHRoaXNDb2x1bW4uaGFzQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpKSB7XG4gICAgICAgIC8vIHNpYmxpbmdzIHJlbW92ZSBvcGVuIGNsYXNzIGFuZCBhZGQgY2xvc2VkIGNsYXNzZXNcbiAgICAgICAgJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICAgICAgLy8gcmVtb3ZlIGNsb3NlZCBjbGFzc2VzLCBhZGQgcGVuIGNsYXNzXG4gICAgICAgICR0aGlzQ29sdW1uLnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKS5hZGRDbGFzcygnaXMtZXhwYW5kZWQnKTtcbiAgICAgICAgXG4gICAgICAgIGlmICgkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikuaGFzQ2xhc3MoJ2lzLWluYWN0aXZlJykpIHtcbiAgICAgICAgICAvL2RvIG5vdGhpbmdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikuYWRkQ2xhc3MoJ2lzLWluYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgICAgaWYoIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KCd4bGFyZ2UnKSApIHtcbiAgICAgICAgICB2YXIgb2Zmc2V0ID0gLTEwMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJC5zbW9vdGhTY3JvbGwoe1xuICAgICAgICAgICAgc2Nyb2xsVGFyZ2V0OiAkdGhpc0NvbHVtbixcbiAgICAgICAgICAgIC8vb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgICAgICBiZWZvcmVTY3JvbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLmFkZENsYXNzKCduYXYtdXAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdGhpc0NvbHVtbi5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtaW5hY3RpdmUnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvL2Nsb3NlIGNhcmQgd2hlbiBjbGljayBvbiBjcm9zc1xuICAgICRjb2x1bW4uZmluZCgnLmpzLWNvbGxhcHNlcicpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgdmFyICR0aGlzQ29sdW1uID0gJCh0aGlzKS5wYXJlbnRzKCcuY29sdW1uX19leHBhbmRlcicpLmNsb3Nlc3QoJy5jb2x1bW4nKTtcbiAgICBcbiAgICAgICR0aGlzQ29sdW1uLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtaW5hY3RpdmUnKTtcbiAgICBcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG4gICAgXG4gICAgJCgnI2xvZ2luZm9ybSA6aW5wdXQsICNwYXNzd29yZGZvcm0gOmlucHV0JykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsYWJlbCA9ICQodGhpcykucGFyZW50KCkuZmluZCgnbGFiZWwnKS50ZXh0KCk7XG4gICAgICAgICQodGhpcykuYXR0ciggJ3BsYWNlaG9sZGVyJywgbGFiZWwgKTtcbiAgICB9KTtcbiAgICBcbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnBsYXktdmlkZW8nLCBwbGF5VmlkZW8pO1xuICAgIFxuICAgIGZ1bmN0aW9uIHBsYXlWaWRlbygpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIFN0b3AgYWxsIGJhY2tncm91bmQgdmlkZW9zXG4gICAgICAgIGlmKCAkKCcuYmFja2dyb3VuZC12aWRlbyB2aWRlbycpLnNpemUoKSApIHtcbiAgICAgICAgICAgICQoJy5iYWNrZ3JvdW5kLXZpZGVvIHZpZGVvJylbMF0ucGF1c2UoKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIFxuICAgICAgICB2YXIgdXJsID0gJHRoaXMuZGF0YSgnc3JjJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHZhciAkbW9kYWwgPSAkKCcjJyArICR0aGlzLmRhdGEoJ29wZW4nKSk7XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAkLmFqYXgodXJsKVxuICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgJG1vZGFsLmZpbmQoJy5mbGV4LXZpZGVvJykuaHRtbChyZXNwKS5mb3VuZGF0aW9uKCdvcGVuJyk7XG4gICAgICAgIH0pO1xuICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgdmFyICRpZnJhbWUgPSAkKCc8aWZyYW1lPicsIHtcbiAgICAgICAgICAgIHNyYzogdXJsLFxuICAgICAgICAgICAgaWQ6ICAndmlkZW8nLFxuICAgICAgICAgICAgZnJhbWVib3JkZXI6IDAsXG4gICAgICAgICAgICBzY3JvbGxpbmc6ICdubydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgJGlmcmFtZS5hcHBlbmRUbygnLnZpZGVvLXBsYWNlaG9sZGVyJywgJG1vZGFsICk7ICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLy8gTWFrZSBzdXJlIHZpZGVvcyBkb24ndCBwbGF5IGluIGJhY2tncm91bmRcbiAgICAkKGRvY3VtZW50KS5vbihcbiAgICAgICdjbG9zZWQuemYucmV2ZWFsJywgJyNtb2RhbC12aWRlbycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcudmlkZW8tcGxhY2Vob2xkZXInKS5odG1sKCcnKTtcbiAgICAgICAgaWYoICQoJy5iYWNrZ3JvdW5kLXZpZGVvIHZpZGVvJykuc2l6ZSgpICkge1xuICAgICAgICAgICAgJCgnLmJhY2tncm91bmQtdmlkZW8gdmlkZW8nKVswXS5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICB9XG4gICAgKTtcbiAgICAgICAgXG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uKCQpIHtcblx0XG5cdCd1c2Ugc3RyaWN0JztcdFxuXHRcblx0XG4gICAgdmFyIGdldExhc3RTaWJsaW5nSW5Sb3cgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICB2YXIgY2FuZGlkYXRlID0gZWxlbWVudCxcbiAgICAgICAgICAgIGVsZW1lbnRUb3AgPSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICAgICAgXG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCB0aGUgZWxlbWVudOKAmXMgbmV4dCBzaWJsaW5ncyBhbmQgbG9vayBmb3IgdGhlIGZpcnN0IG9uZSB3aGljaFxuICAgICAgICAvLyBpcyBwb3NpdGlvbmVkIGZ1cnRoZXIgZG93biB0aGUgcGFnZS5cbiAgICAgICAgd2hpbGUgKGNhbmRpZGF0ZS5uZXh0RWxlbWVudFNpYmxpbmcgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjYW5kaWRhdGUubmV4dEVsZW1lbnRTaWJsaW5nLm9mZnNldFRvcCA+IGVsZW1lbnRUb3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FuZGlkYXRlID0gY2FuZGlkYXRlLm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgIH07XG4gICAgXG4gICAgdmFyICRncmlkID0gJCgnLnNlY3Rpb24tYnVzaW5lc3NlcyAuZ3JpZCcpO1xuICAgIHZhciAkY29sdW1uID0gJCgnLnNlY3Rpb24tYnVzaW5lc3NlcyAuZ3JpZCA+IC5jb2x1bW4nKTtcbiAgICBcbiAgICAvL29wZW4gYW5kIGNsb3NlIGNvbHVtblxuICAgICRjb2x1bW4uZmluZCgnLmpzLWV4cGFuZGVyIC5vcGVuLCAuanMtZXhwYW5kZXIgLnRodW1ibmFpbCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICB2YXIgJHRoaXNDb2x1bW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5jb2x1bW4nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEdldCBsYXN0IHNpYmxpbmcgaW4gcm93XG4gICAgICAgIHZhciBsYXN0ID0gZ2V0TGFzdFNpYmxpbmdJblJvdygkdGhpc0NvbHVtblswXSk7XG4gICAgICAgIFxuICAgICAgICAkKCcuZGV0YWlscycpLnJlbW92ZSgpO1xuICAgICAgICBcbiAgICAgICAgLy9jb25zb2xlLmxvZygkKGxhc3QpLmluZGV4KCkpO1xuICAgICAgICAkdGhpc0NvbHVtbi5maW5kKCcuY29sdW1uX19leHBhbmRlcicpXG4gICAgICAgICAgICAuY2xvbmUoKVxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdoaWRlJylcbiAgICAgICAgICAgIC53cmFwKCc8ZGl2IGNsYXNzPVwiZGV0YWlsc1wiIC8+JykucGFyZW50KClcbiAgICAgICAgICAgIC5pbnNlcnRBZnRlcigkKGxhc3QpKTtcbiAgICAgIFxuICAgIFxuICAgICAgICBpZiAoJHRoaXNDb2x1bW4uaGFzQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpKSB7XG4gICAgICAgIC8vIHNpYmxpbmdzIHJlbW92ZSBvcGVuIGNsYXNzIGFuZCBhZGQgY2xvc2VkIGNsYXNzZXNcbiAgICAgICAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkIGlzLWluYWN0aXZlJyk7XG4gICAgICAgICAgICAvLyByZW1vdmUgY2xvc2VkIGNsYXNzZXMsIGFkZCBwZW4gY2xhc3NcbiAgICAgICAgICAgICR0aGlzQ29sdW1uLnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKS5hZGRDbGFzcygnaXMtZXhwYW5kZWQnKTtcbiAgICAgICAgXG4gICAgICAgIGlmICgkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikuaGFzQ2xhc3MoJ2lzLWluYWN0aXZlJykpIHtcbiAgICAgICAgICAvL2RvIG5vdGhpbmdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikuYWRkQ2xhc3MoJ2lzLWluYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgICAgaWYoIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KCd4bGFyZ2UnKSApIHtcbiAgICAgICAgICB2YXIgb2Zmc2V0ID0gLTEwMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJC5zbW9vdGhTY3JvbGwoe1xuICAgICAgICAgICAgc2Nyb2xsVGFyZ2V0OiAkdGhpc0NvbHVtbixcbiAgICAgICAgICAgIC8vb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgICAgICBiZWZvcmVTY3JvbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLmFkZENsYXNzKCduYXYtdXAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdGhpc0NvbHVtbi5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtaW5hY3RpdmUnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvL2Nsb3NlIGNhcmQgd2hlbiBjbGljayBvbiBjcm9zc1xuICAgICRncmlkLm9uKCdjbGljaycsJy5jbG9zZScsIGZ1bmN0aW9uKCkge1xuICAgICAgJGdyaWQuZmluZCgnLmRldGFpbHMnKS5yZW1vdmUoKTtcbiAgICAgICRjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCBpcy1pbmFjdGl2ZScpO1xuICAgIH0pO1xuICAgIFxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICAgICRncmlkLmZpbmQoJy5kZXRhaWxzJykucmVtb3ZlKCk7XG4gICAgICAgICRjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCBpcy1pbmFjdGl2ZScpO1xuICAgIH0pO1xuXG59KShqUXVlcnkpOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICAkKCcucGFnZS10ZW1wbGF0ZS1yZWdpb25zICNtYXAtYm94IGltZycpLm9uKCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBvZmZzZXQgPSAkKHRoaXMpLm9mZnNldCgpO1xuICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoKGUucGFnZVggLSBvZmZzZXQubGVmdCkgLyAkKHRoaXMpLndpZHRoKCkgKiAxMDAwMCkvMTAwO1xuICAgICAgICB2YXIgeSA9IE1hdGguZmxvb3IoKGUucGFnZVkgLSBvZmZzZXQudG9wKSAvICQodGhpcykuaGVpZ2h0KCkgKiAxMDAwMCkvMTAwO1xuICAgICAgICBcbiAgICAgICAgJCgnI21vdXNlLXh5JykudmFsKCB4ICsgJy8nICsgeSApOyAgICAgXG4gICAgfSk7XG4gICAgXG4gICAgJCggXCIubWFwLWtleSBidXR0b25cIiApLmhvdmVyKFxuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJyNtYXAtYm94IGJ1dHRvbicpLnJlbW92ZUNsYXNzKCBcImhvdmVyXCIgKTtcbiAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdtYXJrZXInKTtcbiAgICAgICAgJChpZCkuYWRkQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnI21hcC1ib3ggYnV0dG9uJykucmVtb3ZlQ2xhc3MoIFwiaG92ZXJcIiApO1xuICAgICAgfVxuICAgICk7XG4gICAgXG4gICAgJCgnLnBhZ2UtdGVtcGxhdGUtcmVnaW9ucyAjbWFwLWJveCBidXR0b24nKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAvLyQodGhpcykuYWRkQ2xhc3MoJ2hvdmVyJyk7XG4gICAgfSk7XG4gICAgXG4gICAgXG4gICAgJCgnLnBhZ2UtdGVtcGxhdGUtcmVnaW9ucyAubWFwLWtleSBidXR0b24nKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcmtlcicpO1xuICAgICAgICAvLyQoaWQpLmFkZENsYXNzKCdob3ZlcicpO1xuICAgIH0pO1xuICAgIFxuICAgIFxuICAgICQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcucGFnZS10ZW1wbGF0ZS1yZWdpb25zICNtYXAtYm94IC5sb2NhdGlvbnMnKS5jc3MoJ29wYWNpdHknLCAxKTtcbiAgICB9KTtcbiAgICBcbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cblxuXG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0Ly8gUmVzcG9uc2l2ZSB2aWRlbyBlbWJlZHNcblx0dmFyICRhbGxfb2VtYmVkX3ZpZGVvcyA9ICQoXCJpZnJhbWVbc3JjKj0neW91dHViZSddLCBpZnJhbWVbc3JjKj0ndmltZW8nXVwiKTtcblxuXHQkYWxsX29lbWJlZF92aWRlb3MuZWFjaChmdW5jdGlvbigpIHtcblxuXHRcdHZhciBfdGhpcyA9ICQodGhpcyk7XG5cblx0XHRpZiAoX3RoaXMucGFyZW50KCcuZW1iZWQtY29udGFpbmVyJykubGVuZ3RoID09PSAwKSB7XG5cdFx0ICBfdGhpcy53cmFwKCc8ZGl2IGNsYXNzPVwiZW1iZWQtY29udGFpbmVyXCI+PC9kaXY+Jyk7XG5cdFx0fVxuXG5cdFx0X3RoaXMucmVtb3ZlQXR0cignaGVpZ2h0JykucmVtb3ZlQXR0cignd2lkdGgnKTtcblxuIFx0fSk7XG4gICAgXG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiIsIi8vIFJldmVhbFxuKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucGFnZS10ZW1wbGF0ZS1yZWdpb25zIGJ1dHRvbltkYXRhLXJlZ2lvbl0nLCBsb2FkUmVnaW9uKTtcbiAgICBcbiAgICBmdW5jdGlvbiBsb2FkUmVnaW9uKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgJHJlZ2lvbiA9ICQoJyMnICsgJHRoaXMuZGF0YSgncmVnaW9uJykgKTtcbiAgICAgICAgdmFyICRtb2RhbCA9ICQoJyMnICsgJHRoaXMuZGF0YSgnb3BlbicpKTtcbiAgICAgICAgXG4gICAgICAgIGlmKCAkcmVnaW9uLnNpemUoKSApIHtcbiAgICAgICAgICAkKCcuY29udGFpbmVyJywgJG1vZGFsICkuaHRtbCgkcmVnaW9uLmh0bWwoKSk7IFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2Nsb3NlZC56Zi5yZXZlYWwnLCAnI3JlZ2lvbnMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykuZmluZCgnLmNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIC8vIHJlbW92ZSBhY3Rpb24gYnV0dG9uIGNsYXNzXG4gICAgICAgICQoJyNtYXAtYm94IGJ1dHRvbicpLnJlbW92ZUNsYXNzKCBcImhvdmVyXCIgKTtcbiAgICB9KTtcbiAgICBcbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnRlbXBsYXRlLWJ1c2luZXNzLWxpbmVzIGJ1dHRvbltkYXRhLWNvbnRlbnRdJywgbG9hZE1hcCk7XG4gICAgXG4gICAgZnVuY3Rpb24gbG9hZE1hcCgpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgdmFyICRtYXAgPSAkKCcjJyArICR0aGlzLmRhdGEoJ2NvbnRlbnQnKSApO1xuICAgICAgICB2YXIgJG1vZGFsID0gJCgnIycgKyAkdGhpcy5kYXRhKCdvcGVuJykpO1xuICAgICAgICBcbiAgICAgICAgaWYoICRtYXAuc2l6ZSgpICkge1xuICAgICAgICAgICQoJy5jb250YWluZXInLCAkbW9kYWwgKS5odG1sKCRtYXAuaHRtbCgpKTsgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xvc2VkLnpmLnJldmVhbCcsICcjbWFwcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcuY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgJCgnLm1hcCcpLnN0b3AoKS5yZW1vdmVDbGFzcygnYWN0aXZlJykuY3NzKHsnb3BhY2l0eSc6JzAnfSk7XG4gICAgICAgICQoJyNtYXAtMCcpLnN0b3AoKS5jc3MoeydvcGFjaXR5JzonMSd9KTtcbiAgICB9KTtcbiAgICBcbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnRlbXBsYXRlLXBvcnRmb2xpby1sYW5kLXJlc291cmNlcyBidXR0b25bZGF0YS1wcm9qZWN0XScsIGxvYWRQcm9qZWN0KTtcbiAgICBcbiAgICBmdW5jdGlvbiBsb2FkUHJvamVjdCgpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgdmFyICRwcm9qZWN0ID0gJCgnIycgKyAkdGhpcy5kYXRhKCdwcm9qZWN0JykgKTtcbiAgICAgICAgdmFyICRtb2RhbCA9ICQoJyMnICsgJHRoaXMuZGF0YSgnb3BlbicpKTtcbiAgICAgICAgXG4gICAgICAgIGlmKCAkcHJvamVjdC5zaXplKCkgKSB7XG4gICAgICAgICAgJCgnLmNvbnRhaW5lcicsICRtb2RhbCApLmh0bWwoJHByb2plY3QuaHRtbCgpKTsgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xvc2VkLnpmLnJldmVhbCcsICcjcHJvamVjdHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykuZmluZCgnLmNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgfSk7XG4gICAgICAgIFxuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuXG5cbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQkKGRvY3VtZW50KS5vbihcbiAgICAgICdvcGVuLnpmLnJldmVhbCcsICcjbW9kYWwtc2VhcmNoJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoXCJpbnB1dFwiKS5maXJzdCgpLmZvY3VzKCk7XG4gICAgICB9XG4gICAgKTtcbiAgICBcbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIGZ1bmN0aW9uIGhpZGVfaGVhZGVyX21lbnUoIG1lbnUgKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgbWFpbk1lbnVCdXR0b25DbGFzcyA9ICdtZW51LXRvZ2dsZScsXG5cdFx0cmVzcG9uc2l2ZU1lbnVDbGFzcyA9ICdnZW5lc2lzLXJlc3BvbnNpdmUtbWVudSc7XG4gICAgICAgIFxuICAgICAgICAkKCBtZW51ICsgJyAuJyArIG1haW5NZW51QnV0dG9uQ2xhc3MgKyAnLCcgKyBtZW51ICsgJyAuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnIC5zdWItbWVudS10b2dnbGUnIClcblx0XHRcdC5yZW1vdmVDbGFzcyggJ2FjdGl2YXRlZCcgKVxuXHRcdFx0LmF0dHIoICdhcmlhLWV4cGFuZGVkJywgZmFsc2UgKVxuXHRcdFx0LmF0dHIoICdhcmlhLXByZXNzZWQnLCBmYWxzZSApO1xuXG5cdFx0JCggbWVudSArICcgLicgKyByZXNwb25zaXZlTWVudUNsYXNzICsgJywnICsgbWVudSArICcgLicgKyByZXNwb25zaXZlTWVudUNsYXNzICsgJyAuc3ViLW1lbnUnIClcblx0XHRcdC5hdHRyKCAnc3R5bGUnLCAnJyApO1xuICAgIH1cbiAgICBcbiAgICB2YXIgc2Nyb2xsbm93ID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBcbiAgICAgICAgdmFyIHRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAvLyBpZiBzY3JvbGxub3coKS1mdW5jdGlvbiB3YXMgdHJpZ2dlcmVkIGJ5IGFuIGV2ZW50XG4gICAgICAgIGlmIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0YXJnZXQgPSB0aGlzLmhhc2g7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBpdCB3YXMgY2FsbGVkIHdoZW4gcGFnZSB3aXRoIGEgI2hhc2ggd2FzIGxvYWRlZFxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldCA9IGxvY2F0aW9uLmhhc2g7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzYW1lIHBhZ2Ugc2Nyb2xsXG4gICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgIHNjcm9sbFRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgICAgYmVmb3JlU2Nyb2xsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnZml4ZWQgc2hyaW5rIG5hdi1kb3duJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWZ0ZXJTY3JvbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLnJlbW92ZUNsYXNzKCdmaXhlZCBzaHJpbmsgbmF2LWRvd24nKTtcbiAgICAgICAgICAgICAgICBpZigkKHRhcmdldCkuaGFzQ2xhc3MoJ3R5cGUtcGVvcGxlJykgKSB7XG4gICAgICAgICAgICAgICAgICAgICQodGFyZ2V0KS5maW5kKCcuaGVhZGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIGlmIHBhZ2UgaGFzIGEgI2hhc2hcbiAgICBpZiAobG9jYXRpb24uaGFzaCkge1xuICAgICAgICAkKCdodG1sLCBib2R5Jykuc2Nyb2xsVG9wKDApLnNob3coKTtcbiAgICAgICAgLy8gc21vb3RoLXNjcm9sbCB0byBoYXNoXG4gICAgICAgIHNjcm9sbG5vdygpO1xuICAgIH1cblxuICAgIC8vIGZvciBlYWNoIDxhPi1lbGVtZW50IHRoYXQgY29udGFpbnMgYSBcIi9cIiBhbmQgYSBcIiNcIlxuICAgICQoJ2FbaHJlZio9XCIvXCJdW2hyZWYqPSNdJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAvLyBpZiB0aGUgcGF0aG5hbWUgb2YgdGhlIGhyZWYgcmVmZXJlbmNlcyB0aGUgc2FtZSBwYWdlXG4gICAgICAgIGlmICh0aGlzLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCcnKSA9PT0gbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sJycpICYmIHRoaXMuaG9zdG5hbWUgPT09IGxvY2F0aW9uLmhvc3RuYW1lKSB7XG4gICAgICAgICAgICAvLyBvbmx5IGtlZXAgdGhlIGhhc2gsIGkuZS4gZG8gbm90IGtlZXAgdGhlIHBhdGhuYW1lXG4gICAgICAgICAgICAkKHRoaXMpLmF0dHIoXCJocmVmXCIsIHRoaXMuaGFzaCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHNlbGVjdCBhbGwgaHJlZi1lbGVtZW50cyB0aGF0IHN0YXJ0IHdpdGggI1xuICAgIC8vIGluY2x1ZGluZyB0aGUgb25lcyB0aGF0IHdlcmUgc3RyaXBwZWQgYnkgdGhlaXIgcGF0aG5hbWUganVzdCBhYm92ZVxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnYVtocmVmXj0jXTpub3QoW2hyZWY9I10pJywgc2Nyb2xsbm93ICk7XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiJdfQ==
