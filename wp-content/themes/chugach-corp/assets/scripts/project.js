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

	$('li.menu-item-has-children > a').on('click', function (e) {

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

  $('<div class="slick-arrows"></div>').insertAfter('.section-videos .slick');

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

  $('<div class="slick-arrows"></div>').insertAfter('.section-stories .slick');

  $('.section-stories .slick').slick({
	dots: false,
	infinite: true,
	speed: 300,
	slidesToShow: 1,
	slidesToScroll: 1,
	appendArrows: $('.section-stories .slick-arrows')
  });

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImExMXktdG9nZ2xlLmpzIiwiZ2VuZXNpcy1yZXNwb25zaXZlLW1lbnUuanMiLCJob3ZlckludGVudC5qcyIsImltYWdlc2xvYWRlZC5wa2dkLmpzIiwianF1ZXJ5Lm1hdGNoSGVpZ2h0LmpzIiwianF1ZXJ5LnNtb290aC1zY3JvbGwuanMiLCJqcXVlcnkud2F5cG9pbnRzLmpzIiwicmVjbGluZXIuanMiLCJzbGljay5qcyIsInN1cGVyZmlzaC5qcyIsIndheXBvaW50cy5pbnZpZXcuanMiLCJidXNpbmVzcy1saW5lcy5qcyIsImNhcmVlcnMuanMiLCJleHRlcm5hbC1saW5rcy5qcyIsImZhY2V0d3AuanMiLCJmaXhlZC1oZWFkZXIuanMiLCJnZW5lcmFsLmpzIiwiaW5saW5lLXN2Zy5qcyIsImxlYWRlcnNoaXAuanMiLCJsb2dpbi5qcyIsIm1vZGFsLXZpZGVvLmpzIiwib3BlcmF0aW5nLWNvbXBhbmllcy5qcyIsInJlZ2lvbnMuanMiLCJyZXNwb25zaXZlLXZpZGVvLWVtYmVkcy5qcyIsInJldmVhbC5qcyIsInNlYXJjaC5qcyIsInNtb290aC1zY3JvbGwuanMiXSwibmFtZXMiOlsiaW50ZXJuYWxJZCIsInRvZ2dsZXNNYXAiLCJ0YXJnZXRzTWFwIiwiJCIsInNlbGVjdG9yIiwiY29udGV4dCIsIkFycmF5IiwicHJvdG90eXBlIiwic2xpY2UiLCJjYWxsIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZ2V0Q2xvc2VzdFRvZ2dsZSIsImVsZW1lbnQiLCJjbG9zZXN0Iiwibm9kZVR5cGUiLCJoYXNBdHRyaWJ1dGUiLCJwYXJlbnROb2RlIiwiaGFuZGxlVG9nZ2xlIiwidG9nZ2xlIiwidGFyZ2V0IiwiZ2V0QXR0cmlidXRlIiwidG9nZ2xlcyIsImlkIiwiaXNFeHBhbmRlZCIsInNldEF0dHJpYnV0ZSIsImZvckVhY2giLCJpbm5lckhUTUwiLCJpbml0QTExeVRvZ2dsZSIsInJlZHVjZSIsImFjYyIsInB1c2giLCJ0YXJnZXRzIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImxhYmVsbGVkYnkiLCJqb2luIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwid2hpY2giLCJ3aW5kb3ciLCJhMTF5VG9nZ2xlIiwidW5kZWZpbmVkIiwicmVtb3ZlQ2xhc3MiLCJnZW5lc2lzTWVudVBhcmFtcyIsImdlbmVzaXNfcmVzcG9uc2l2ZV9tZW51IiwiZ2VuZXNpc01lbnVzVW5jaGVja2VkIiwibWVudUNsYXNzZXMiLCJnZW5lc2lzTWVudXMiLCJtZW51c1RvQ29tYmluZSIsImVhY2giLCJncm91cCIsImtleSIsInZhbHVlIiwibWVudVN0cmluZyIsIiRtZW51IiwibmV3U3RyaW5nIiwiYWRkQ2xhc3MiLCJyZXBsYWNlIiwib3RoZXJzIiwiY29tYmluZSIsImdlbmVzaXNNZW51IiwibWFpbk1lbnVCdXR0b25DbGFzcyIsInN1Yk1lbnVCdXR0b25DbGFzcyIsInJlc3BvbnNpdmVNZW51Q2xhc3MiLCJpbml0IiwiX2dldEFsbE1lbnVzQXJyYXkiLCJtZW51SWNvbkNsYXNzIiwic3ViTWVudUljb25DbGFzcyIsInRvZ2dsZUJ1dHRvbnMiLCJtZW51IiwiYXBwZW5kIiwibWFpbk1lbnUiLCJzdWJtZW51Iiwic3ViTWVudSIsIl9hZGRSZXNwb25zaXZlTWVudUNsYXNzIiwiX2FkZE1lbnVCdXR0b25zIiwib24iLCJfbWFpbm1lbnVUb2dnbGUiLCJfYWRkQ2xhc3NJRCIsIl9zdWJtZW51VG9nZ2xlIiwiX2RvUmVzaXplIiwidHJpZ2dlckhhbmRsZXIiLCJfZ2V0TWVudVNlbGVjdG9yU3RyaW5nIiwiZmluZCIsImJlZm9yZSIsIm1lbnVzVG9Ub2dnbGUiLCJjb25jYXQiLCJidXR0b25zIiwiYXR0ciIsIl9tYXliZUNsb3NlIiwiX3N1cGVyZmlzaFRvZ2dsZSIsIl9jaGFuZ2VTa2lwTGluayIsIl9jb21iaW5lTWVudXMiLCIkdGhpcyIsIm5hdiIsIm5leHQiLCJtYXRjaCIsInByaW1hcnlNZW51IiwiY29tYmluZWRNZW51cyIsImZpbHRlciIsImluZGV4IiwiX2dldERpc3BsYXlWYWx1ZSIsImFwcGVuZFRvIiwiaGlkZSIsInNob3ciLCJfdG9nZ2xlQXJpYSIsInRvZ2dsZUNsYXNzIiwic2xpZGVUb2dnbGUiLCJzaWJsaW5ncyIsInNsaWRlVXAiLCJfc3VwZXJmaXNoIiwiJGFyZ3MiLCJzdXBlcmZpc2giLCJtZW51VG9nZ2xlTGlzdCIsIm5ld1ZhbHVlIiwic3RhcnRMaW5rIiwiZW5kTGluayIsIiRpdGVtIiwibGluayIsIiRpZCIsImdldEVsZW1lbnRCeUlkIiwic3R5bGUiLCJnZXRDb21wdXRlZFN0eWxlIiwiZ2V0UHJvcGVydHlWYWx1ZSIsImF0dHJpYnV0ZSIsIml0ZW1BcnJheSIsIml0ZW1TdHJpbmciLCJtYXAiLCJtZW51TGlzdCIsInZhbHVlT2YiLCJyZWFkeSIsImpRdWVyeSIsImZuIiwiaG92ZXJJbnRlbnQiLCJoYW5kbGVySW4iLCJoYW5kbGVyT3V0IiwiY2ZnIiwiaW50ZXJ2YWwiLCJzZW5zaXRpdml0eSIsInRpbWVvdXQiLCJleHRlbmQiLCJpc0Z1bmN0aW9uIiwib3ZlciIsIm91dCIsImNYIiwiY1kiLCJwWCIsInBZIiwidHJhY2siLCJldiIsInBhZ2VYIiwicGFnZVkiLCJjb21wYXJlIiwib2IiLCJob3ZlckludGVudF90IiwiY2xlYXJUaW1lb3V0IiwiTWF0aCIsImFicyIsIm9mZiIsImhvdmVySW50ZW50X3MiLCJhcHBseSIsInNldFRpbWVvdXQiLCJkZWxheSIsImhhbmRsZUhvdmVyIiwiZSIsInR5cGUiLCJnbG9iYWwiLCJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwibW9kdWxlIiwiZXhwb3J0cyIsIkV2RW1pdHRlciIsInByb3RvIiwiZXZlbnROYW1lIiwibGlzdGVuZXIiLCJldmVudHMiLCJfZXZlbnRzIiwibGlzdGVuZXJzIiwiaW5kZXhPZiIsIm9uY2UiLCJvbmNlRXZlbnRzIiwiX29uY2VFdmVudHMiLCJvbmNlTGlzdGVuZXJzIiwic3BsaWNlIiwiZW1pdEV2ZW50IiwiYXJncyIsImkiLCJpc09uY2UiLCJhbGxPZmYiLCJyZXF1aXJlIiwiaW1hZ2VzTG9hZGVkIiwiY29uc29sZSIsImEiLCJiIiwicHJvcCIsImFycmF5U2xpY2UiLCJtYWtlQXJyYXkiLCJvYmoiLCJpc0FycmF5IiwiaXNBcnJheUxpa2UiLCJJbWFnZXNMb2FkZWQiLCJlbGVtIiwib3B0aW9ucyIsIm9uQWx3YXlzIiwicXVlcnlFbGVtIiwiZXJyb3IiLCJlbGVtZW50cyIsImdldEltYWdlcyIsImpxRGVmZXJyZWQiLCJEZWZlcnJlZCIsImNoZWNrIiwiYmluZCIsImNyZWF0ZSIsImltYWdlcyIsImFkZEVsZW1lbnRJbWFnZXMiLCJub2RlTmFtZSIsImFkZEltYWdlIiwiYmFja2dyb3VuZCIsImFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzIiwiZWxlbWVudE5vZGVUeXBlcyIsImNoaWxkSW1ncyIsImltZyIsImNoaWxkcmVuIiwiY2hpbGQiLCJyZVVSTCIsIm1hdGNoZXMiLCJleGVjIiwiYmFja2dyb3VuZEltYWdlIiwidXJsIiwiYWRkQmFja2dyb3VuZCIsImxvYWRpbmdJbWFnZSIsIkxvYWRpbmdJbWFnZSIsIkJhY2tncm91bmQiLCJfdGhpcyIsInByb2dyZXNzZWRDb3VudCIsImhhc0FueUJyb2tlbiIsImNvbXBsZXRlIiwib25Qcm9ncmVzcyIsImltYWdlIiwibWVzc2FnZSIsInByb2dyZXNzIiwiaXNMb2FkZWQiLCJub3RpZnkiLCJkZWJ1ZyIsImxvZyIsImlzQ29tcGxldGUiLCJqcU1ldGhvZCIsImdldElzSW1hZ2VDb21wbGV0ZSIsImNvbmZpcm0iLCJuYXR1cmFsV2lkdGgiLCJwcm94eUltYWdlIiwiSW1hZ2UiLCJzcmMiLCJoYW5kbGVFdmVudCIsIm1ldGhvZCIsIm9ubG9hZCIsInVuYmluZEV2ZW50cyIsIm9uZXJyb3IiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwibWFrZUpRdWVyeVBsdWdpbiIsImNhbGxiYWNrIiwiaW5zdGFuY2UiLCJwcm9taXNlIiwiX3ByZXZpb3VzUmVzaXplV2lkdGgiLCJfdXBkYXRlVGltZW91dCIsIl9wYXJzZSIsInBhcnNlRmxvYXQiLCJfcm93cyIsInRvbGVyYW5jZSIsIiRlbGVtZW50cyIsImxhc3RUb3AiLCJyb3dzIiwiJHRoYXQiLCJ0b3AiLCJvZmZzZXQiLCJjc3MiLCJsYXN0Um93IiwiZmxvb3IiLCJhZGQiLCJfcGFyc2VPcHRpb25zIiwib3B0cyIsImJ5Um93IiwicHJvcGVydHkiLCJyZW1vdmUiLCJtYXRjaEhlaWdodCIsInRoYXQiLCJfZ3JvdXBzIiwibm90IiwiX2FwcGx5IiwidmVyc2lvbiIsIl90aHJvdHRsZSIsIl9tYWludGFpblNjcm9sbCIsIl9iZWZvcmVVcGRhdGUiLCJfYWZ0ZXJVcGRhdGUiLCJzY3JvbGxUb3AiLCJodG1sSGVpZ2h0Iiwib3V0ZXJIZWlnaHQiLCIkaGlkZGVuUGFyZW50cyIsInBhcmVudHMiLCJkYXRhIiwiZGlzcGxheSIsInJvdyIsIiRyb3ciLCJ0YXJnZXRIZWlnaHQiLCJ2ZXJ0aWNhbFBhZGRpbmciLCJpcyIsIl9hcHBseURhdGFBcGkiLCJncm91cHMiLCJncm91cElkIiwiX3VwZGF0ZSIsInRocm90dGxlIiwid2luZG93V2lkdGgiLCJ3aWR0aCIsIm9wdGlvbk92ZXJyaWRlcyIsImRlZmF1bHRzIiwiZXhjbHVkZSIsImV4Y2x1ZGVXaXRoaW4iLCJkaXJlY3Rpb24iLCJkZWxlZ2F0ZVNlbGVjdG9yIiwic2Nyb2xsRWxlbWVudCIsInNjcm9sbFRhcmdldCIsImF1dG9Gb2N1cyIsImJlZm9yZVNjcm9sbCIsImFmdGVyU2Nyb2xsIiwiZWFzaW5nIiwic3BlZWQiLCJhdXRvQ29lZmZpY2llbnQiLCJwcmV2ZW50RGVmYXVsdCIsImdldFNjcm9sbGFibGUiLCJzY3JvbGxhYmxlIiwic2Nyb2xsZWQiLCJkaXIiLCJlbCIsInNjcm9sbGluZ0VsZW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJib2R5IiwiclJlbGF0aXZlIiwic2NybCIsInB1c2hTdGFjayIsImZpcnN0U2Nyb2xsYWJsZSIsInNtb290aFNjcm9sbCIsImV4dHJhIiwiZmlyc3QiLCJjbGlja0hhbmRsZXIiLCJlc2NhcGVTZWxlY3RvciIsInN0ciIsIiRsaW5rIiwidGhpc09wdHMiLCJlbENvdW50ZXIiLCJld2xDb3VudGVyIiwiaW5jbHVkZSIsImNsaWNrT3B0cyIsImxvY2F0aW9uUGF0aCIsImZpbHRlclBhdGgiLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwibGlua1BhdGgiLCJob3N0TWF0Y2giLCJob3N0bmFtZSIsInBhdGhNYXRjaCIsInRoaXNIYXNoIiwiaGFzaCIsImdldEV4cGxpY2l0T2Zmc2V0IiwidmFsIiwiZXhwbGljaXQiLCJyZWxhdGl2ZSIsInBhcnRzIiwicHgiLCJvbkFmdGVyU2Nyb2xsIiwiJHRndCIsImZvY3VzIiwiYWN0aXZlRWxlbWVudCIsInRhYkluZGV4IiwiJHNjcm9sbGVyIiwiZGVsdGEiLCJleHBsaWNpdE9mZnNldCIsInNjcm9sbFRhcmdldE9mZnNldCIsInNjcm9sbGVyT2Zmc2V0Iiwib2ZmUG9zIiwic2Nyb2xsRGlyIiwiYW5pUHJvcHMiLCJhbmlPcHRzIiwidGVzdCIsImR1cmF0aW9uIiwic3RlcCIsInN0b3AiLCJhbmltYXRlIiwic3RyaW5nIiwia2V5Q291bnRlciIsImFsbFdheXBvaW50cyIsIldheXBvaW50IiwiRXJyb3IiLCJoYW5kbGVyIiwiQWRhcHRlciIsImFkYXB0ZXIiLCJheGlzIiwiaG9yaXpvbnRhbCIsImVuYWJsZWQiLCJ0cmlnZ2VyUG9pbnQiLCJHcm91cCIsImZpbmRPckNyZWF0ZSIsIm5hbWUiLCJDb250ZXh0IiwiZmluZE9yQ3JlYXRlQnlFbGVtZW50Iiwib2Zmc2V0QWxpYXNlcyIsInF1ZXVlVHJpZ2dlciIsInRyaWdnZXIiLCJkZXN0cm95IiwiZGlzYWJsZSIsImVuYWJsZSIsInJlZnJlc2giLCJwcmV2aW91cyIsImludm9rZUFsbCIsImFsbFdheXBvaW50c0FycmF5Iiwid2F5cG9pbnRLZXkiLCJlbmQiLCJkZXN0cm95QWxsIiwiZGlzYWJsZUFsbCIsImVuYWJsZUFsbCIsInJlZnJlc2hBbGwiLCJ2aWV3cG9ydEhlaWdodCIsImlubmVySGVpZ2h0IiwiY2xpZW50SGVpZ2h0Iiwidmlld3BvcnRXaWR0aCIsImNsaWVudFdpZHRoIiwiYWRhcHRlcnMiLCJjb250aW51b3VzIiwiaW5uZXJXaWR0aCIsIm91dGVyV2lkdGgiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWVTaGltIiwiY29udGV4dHMiLCJvbGRXaW5kb3dMb2FkIiwiZGlkU2Nyb2xsIiwiZGlkUmVzaXplIiwib2xkU2Nyb2xsIiwieCIsInNjcm9sbExlZnQiLCJ5Iiwid2F5cG9pbnRzIiwidmVydGljYWwiLCJ3YXlwb2ludENvbnRleHRLZXkiLCJ3aW5kb3dDb250ZXh0IiwiY3JlYXRlVGhyb3R0bGVkU2Nyb2xsSGFuZGxlciIsImNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIiLCJ3YXlwb2ludCIsImNoZWNrRW1wdHkiLCJob3Jpem9udGFsRW1wdHkiLCJpc0VtcHR5T2JqZWN0IiwidmVydGljYWxFbXB0eSIsImlzV2luZG93Iiwic2VsZiIsInJlc2l6ZUhhbmRsZXIiLCJoYW5kbGVSZXNpemUiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzY3JvbGxIYW5kbGVyIiwiaGFuZGxlU2Nyb2xsIiwiaXNUb3VjaCIsInRyaWdnZXJlZEdyb3VwcyIsImF4ZXMiLCJuZXdTY3JvbGwiLCJmb3J3YXJkIiwiYmFja3dhcmQiLCJheGlzS2V5IiwiaXNGb3J3YXJkIiwid2FzQmVmb3JlVHJpZ2dlclBvaW50Iiwibm93QWZ0ZXJUcmlnZ2VyUG9pbnQiLCJjcm9zc2VkRm9yd2FyZCIsImNyb3NzZWRCYWNrd2FyZCIsImdyb3VwS2V5IiwiZmx1c2hUcmlnZ2VycyIsImNvbnRleHRPZmZzZXQiLCJsZWZ0IiwiY29udGV4dFNjcm9sbCIsImNvbnRleHREaW1lbnNpb24iLCJvZmZzZXRQcm9wIiwiYWRqdXN0bWVudCIsIm9sZFRyaWdnZXJQb2ludCIsImVsZW1lbnRPZmZzZXQiLCJmcmVzaFdheXBvaW50IiwiY29udGV4dE1vZGlmaWVyIiwid2FzQmVmb3JlU2Nyb2xsIiwibm93QWZ0ZXJTY3JvbGwiLCJ0cmlnZ2VyZWRCYWNrd2FyZCIsInRyaWdnZXJlZEZvcndhcmQiLCJjZWlsIiwiZmluZEJ5RWxlbWVudCIsImNvbnRleHRJZCIsInJlcXVlc3RGbiIsIm1velJlcXVlc3RBbmltYXRpb25GcmFtZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsImJ5VHJpZ2dlclBvaW50IiwiYnlSZXZlcnNlVHJpZ2dlclBvaW50IiwiY2xlYXJUcmlnZ2VyUXVldWVzIiwidHJpZ2dlclF1ZXVlcyIsInVwIiwiZG93biIsInJpZ2h0IiwicmV2ZXJzZSIsInNvcnQiLCJpbkFycmF5IiwiaXNMYXN0IiwibGFzdCIsIkpRdWVyeUFkYXB0ZXIiLCIkZWxlbWVudCIsImFyZ3VtZW50cyIsImNyZWF0ZUV4dGVuc2lvbiIsImZyYW1ld29yayIsIm92ZXJyaWRlcyIsIlplcHRvIiwicmVjbGluZXIiLCIkdyIsImxvYWRlZCIsInRpbWVyIiwiYXR0cmliIiwidGhyZXNob2xkIiwicHJpbnRhYmxlIiwibGl2ZSIsImdldFNjcmlwdCIsImxvYWQiLCIkZSIsInNvdXJjZSIsInByb2Nlc3MiLCJoZWlnaHQiLCJlb2YiLCJzY3JvbGxZIiwib2Zmc2V0SGVpZ2h0IiwiaW52aWV3Iiwid3QiLCJ3YiIsImV0IiwiZWIiLCJlbHMiLCJvbmUiLCJtYXRjaE1lZGlhIiwiYWRkTGlzdGVuZXIiLCJtcWwiLCJkZXJlY2xpbmVyIiwiU2xpY2siLCJpbnN0YW5jZVVpZCIsInNldHRpbmdzIiwiXyIsImRhdGFTZXR0aW5ncyIsImFjY2Vzc2liaWxpdHkiLCJhZGFwdGl2ZUhlaWdodCIsImFwcGVuZEFycm93cyIsImFwcGVuZERvdHMiLCJhcnJvd3MiLCJhc05hdkZvciIsInByZXZBcnJvdyIsIm5leHRBcnJvdyIsImF1dG9wbGF5IiwiYXV0b3BsYXlTcGVlZCIsImNlbnRlck1vZGUiLCJjZW50ZXJQYWRkaW5nIiwiY3NzRWFzZSIsImN1c3RvbVBhZ2luZyIsInNsaWRlciIsInRleHQiLCJkb3RzIiwiZG90c0NsYXNzIiwiZHJhZ2dhYmxlIiwiZWRnZUZyaWN0aW9uIiwiZmFkZSIsImZvY3VzT25TZWxlY3QiLCJmb2N1c09uQ2hhbmdlIiwiaW5maW5pdGUiLCJpbml0aWFsU2xpZGUiLCJsYXp5TG9hZCIsIm1vYmlsZUZpcnN0IiwicGF1c2VPbkhvdmVyIiwicGF1c2VPbkZvY3VzIiwicGF1c2VPbkRvdHNIb3ZlciIsInJlc3BvbmRUbyIsInJlc3BvbnNpdmUiLCJydGwiLCJzbGlkZSIsInNsaWRlc1BlclJvdyIsInNsaWRlc1RvU2hvdyIsInNsaWRlc1RvU2Nyb2xsIiwic3dpcGUiLCJzd2lwZVRvU2xpZGUiLCJ0b3VjaE1vdmUiLCJ0b3VjaFRocmVzaG9sZCIsInVzZUNTUyIsInVzZVRyYW5zZm9ybSIsInZhcmlhYmxlV2lkdGgiLCJ2ZXJ0aWNhbFN3aXBpbmciLCJ3YWl0Rm9yQW5pbWF0ZSIsInpJbmRleCIsImluaXRpYWxzIiwiYW5pbWF0aW5nIiwiZHJhZ2dpbmciLCJhdXRvUGxheVRpbWVyIiwiY3VycmVudERpcmVjdGlvbiIsImN1cnJlbnRMZWZ0IiwiY3VycmVudFNsaWRlIiwiJGRvdHMiLCJsaXN0V2lkdGgiLCJsaXN0SGVpZ2h0IiwibG9hZEluZGV4IiwiJG5leHRBcnJvdyIsIiRwcmV2QXJyb3ciLCJzY3JvbGxpbmciLCJzbGlkZUNvdW50Iiwic2xpZGVXaWR0aCIsIiRzbGlkZVRyYWNrIiwiJHNsaWRlcyIsInNsaWRpbmciLCJzbGlkZU9mZnNldCIsInN3aXBlTGVmdCIsInN3aXBpbmciLCIkbGlzdCIsInRvdWNoT2JqZWN0IiwidHJhbnNmb3Jtc0VuYWJsZWQiLCJ1bnNsaWNrZWQiLCJhY3RpdmVCcmVha3BvaW50IiwiYW5pbVR5cGUiLCJhbmltUHJvcCIsImJyZWFrcG9pbnRzIiwiYnJlYWtwb2ludFNldHRpbmdzIiwiY3NzVHJhbnNpdGlvbnMiLCJmb2N1c3NlZCIsImludGVycnVwdGVkIiwiaGlkZGVuIiwicGF1c2VkIiwicG9zaXRpb25Qcm9wIiwicm93Q291bnQiLCJzaG91bGRDbGljayIsIiRzbGlkZXIiLCIkc2xpZGVzQ2FjaGUiLCJ0cmFuc2Zvcm1UeXBlIiwidHJhbnNpdGlvblR5cGUiLCJ2aXNpYmlsaXR5Q2hhbmdlIiwid2luZG93VGltZXIiLCJvcmlnaW5hbFNldHRpbmdzIiwibW96SGlkZGVuIiwid2Via2l0SGlkZGVuIiwiYXV0b1BsYXkiLCJwcm94eSIsImF1dG9QbGF5Q2xlYXIiLCJhdXRvUGxheUl0ZXJhdG9yIiwiY2hhbmdlU2xpZGUiLCJzZWxlY3RIYW5kbGVyIiwic2V0UG9zaXRpb24iLCJzd2lwZUhhbmRsZXIiLCJkcmFnSGFuZGxlciIsImtleUhhbmRsZXIiLCJodG1sRXhwciIsInJlZ2lzdGVyQnJlYWtwb2ludHMiLCJhY3RpdmF0ZUFEQSIsImFkZFNsaWRlIiwic2xpY2tBZGQiLCJtYXJrdXAiLCJhZGRCZWZvcmUiLCJ1bmxvYWQiLCJpbnNlcnRCZWZvcmUiLCJlcSIsImluc2VydEFmdGVyIiwicHJlcGVuZFRvIiwiZGV0YWNoIiwicmVpbml0IiwiYW5pbWF0ZUhlaWdodCIsImFuaW1hdGVTbGlkZSIsInRhcmdldExlZnQiLCJhbmltUHJvcHMiLCJhbmltU3RhcnQiLCJub3ciLCJhcHBseVRyYW5zaXRpb24iLCJkaXNhYmxlVHJhbnNpdGlvbiIsImdldE5hdlRhcmdldCIsInNsaWNrIiwic2xpZGVIYW5kbGVyIiwidHJhbnNpdGlvbiIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsInNsaWRlVG8iLCJidWlsZEFycm93cyIsInJlbW92ZUF0dHIiLCJidWlsZERvdHMiLCJkb3QiLCJnZXREb3RDb3VudCIsImJ1aWxkT3V0Iiwid3JhcEFsbCIsInBhcmVudCIsIndyYXAiLCJzZXR1cEluZmluaXRlIiwidXBkYXRlRG90cyIsInNldFNsaWRlQ2xhc3NlcyIsImJ1aWxkUm93cyIsImMiLCJuZXdTbGlkZXMiLCJudW1PZlNsaWRlcyIsIm9yaWdpbmFsU2xpZGVzIiwic2xpZGVzUGVyU2VjdGlvbiIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJjcmVhdGVFbGVtZW50IiwiZ2V0IiwiYXBwZW5kQ2hpbGQiLCJlbXB0eSIsImNoZWNrUmVzcG9uc2l2ZSIsImluaXRpYWwiLCJmb3JjZVVwZGF0ZSIsImJyZWFrcG9pbnQiLCJ0YXJnZXRCcmVha3BvaW50IiwicmVzcG9uZFRvV2lkdGgiLCJ0cmlnZ2VyQnJlYWtwb2ludCIsInNsaWRlcldpZHRoIiwibWluIiwiaGFzT3duUHJvcGVydHkiLCJ1bnNsaWNrIiwiZG9udEFuaW1hdGUiLCIkdGFyZ2V0IiwiY3VycmVudFRhcmdldCIsImluZGV4T2Zmc2V0IiwidW5ldmVuT2Zmc2V0IiwiY2hlY2tOYXZpZ2FibGUiLCJuYXZpZ2FibGVzIiwicHJldk5hdmlnYWJsZSIsImdldE5hdmlnYWJsZUluZGV4ZXMiLCJuIiwiY2xlYW5VcEV2ZW50cyIsImludGVycnVwdCIsInZpc2liaWxpdHkiLCJjbGVhblVwU2xpZGVFdmVudHMiLCJvcmllbnRhdGlvbkNoYW5nZSIsInJlc2l6ZSIsImNsZWFuVXBSb3dzIiwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIiwic3RvcFByb3BhZ2F0aW9uIiwiZmFkZVNsaWRlIiwic2xpZGVJbmRleCIsIm9wYWNpdHkiLCJmYWRlU2xpZGVPdXQiLCJmaWx0ZXJTbGlkZXMiLCJzbGlja0ZpbHRlciIsImZvY3VzSGFuZGxlciIsIiRzZiIsImdldEN1cnJlbnQiLCJzbGlja0N1cnJlbnRTbGlkZSIsImJyZWFrUG9pbnQiLCJjb3VudGVyIiwicGFnZXJRdHkiLCJnZXRMZWZ0IiwidmVydGljYWxIZWlnaHQiLCJ2ZXJ0aWNhbE9mZnNldCIsInRhcmdldFNsaWRlIiwiY29lZiIsIm9mZnNldExlZnQiLCJnZXRPcHRpb24iLCJzbGlja0dldE9wdGlvbiIsIm9wdGlvbiIsImluZGV4ZXMiLCJtYXgiLCJnZXRTbGljayIsImdldFNsaWRlQ291bnQiLCJzbGlkZXNUcmF2ZXJzZWQiLCJzd2lwZWRTbGlkZSIsImNlbnRlck9mZnNldCIsImdvVG8iLCJzbGlja0dvVG8iLCJwYXJzZUludCIsImNyZWF0aW9uIiwiaGFzQ2xhc3MiLCJzZXRQcm9wcyIsInN0YXJ0TG9hZCIsImxvYWRTbGlkZXIiLCJpbml0aWFsaXplRXZlbnRzIiwidXBkYXRlQXJyb3dzIiwiaW5pdEFEQSIsIm51bURvdEdyb3VwcyIsInRhYkNvbnRyb2xJbmRleGVzIiwic2xpZGVDb250cm9sSW5kZXgiLCJhcmlhQnV0dG9uQ29udHJvbCIsIm1hcHBlZFNsaWRlSW5kZXgiLCJpbml0QXJyb3dFdmVudHMiLCJpbml0RG90RXZlbnRzIiwiaW5pdFNsaWRlRXZlbnRzIiwiYWN0aW9uIiwiaW5pdFVJIiwidGFnTmFtZSIsImtleUNvZGUiLCJsb2FkUmFuZ2UiLCJjbG9uZVJhbmdlIiwicmFuZ2VTdGFydCIsInJhbmdlRW5kIiwibG9hZEltYWdlcyIsImltYWdlc1Njb3BlIiwiaW1hZ2VTb3VyY2UiLCJpbWFnZVNyY1NldCIsImltYWdlU2l6ZXMiLCJpbWFnZVRvTG9hZCIsInByZXZTbGlkZSIsIm5leHRTbGlkZSIsInByb2dyZXNzaXZlTGF6eUxvYWQiLCJzbGlja05leHQiLCJwYXVzZSIsInNsaWNrUGF1c2UiLCJwbGF5Iiwic2xpY2tQbGF5IiwicG9zdFNsaWRlIiwiJGN1cnJlbnRTbGlkZSIsInByZXYiLCJzbGlja1ByZXYiLCJ0cnlDb3VudCIsIiRpbWdzVG9Mb2FkIiwiaW5pdGlhbGl6aW5nIiwibGFzdFZpc2libGVJbmRleCIsImN1cnJlbnRCcmVha3BvaW50IiwibCIsInJlc3BvbnNpdmVTZXR0aW5ncyIsIndpbmRvd0RlbGF5IiwicmVtb3ZlU2xpZGUiLCJzbGlja1JlbW92ZSIsInJlbW92ZUJlZm9yZSIsInJlbW92ZUFsbCIsInNldENTUyIsInBvc2l0aW9uIiwicG9zaXRpb25Qcm9wcyIsInNldERpbWVuc2lvbnMiLCJwYWRkaW5nIiwic2V0RmFkZSIsInNldEhlaWdodCIsInNldE9wdGlvbiIsInNsaWNrU2V0T3B0aW9uIiwiaXRlbSIsIm9wdCIsImJvZHlTdHlsZSIsIldlYmtpdFRyYW5zaXRpb24iLCJNb3pUcmFuc2l0aW9uIiwibXNUcmFuc2l0aW9uIiwiT1RyYW5zZm9ybSIsInBlcnNwZWN0aXZlUHJvcGVydHkiLCJ3ZWJraXRQZXJzcGVjdGl2ZSIsIk1velRyYW5zZm9ybSIsIk1velBlcnNwZWN0aXZlIiwid2Via2l0VHJhbnNmb3JtIiwibXNUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJhbGxTbGlkZXMiLCJyZW1haW5kZXIiLCJldmVuQ29lZiIsImluZmluaXRlQ291bnQiLCJjbG9uZSIsInRhcmdldEVsZW1lbnQiLCJzeW5jIiwiYW5pbVNsaWRlIiwib2xkU2xpZGUiLCJzbGlkZUxlZnQiLCJuYXZUYXJnZXQiLCJzd2lwZURpcmVjdGlvbiIsInhEaXN0IiwieURpc3QiLCJyIiwic3dpcGVBbmdsZSIsInN0YXJ0WCIsImN1clgiLCJzdGFydFkiLCJjdXJZIiwiYXRhbjIiLCJyb3VuZCIsIlBJIiwic3dpcGVFbmQiLCJzd2lwZUxlbmd0aCIsImVkZ2VIaXQiLCJtaW5Td2lwZSIsImZpbmdlckNvdW50Iiwib3JpZ2luYWxFdmVudCIsInRvdWNoZXMiLCJzd2lwZVN0YXJ0Iiwic3dpcGVNb3ZlIiwiZWRnZVdhc0hpdCIsImN1ckxlZnQiLCJwb3NpdGlvbk9mZnNldCIsInZlcnRpY2FsU3dpcGVMZW5ndGgiLCJjbGllbnRYIiwiY2xpZW50WSIsInNxcnQiLCJwb3ciLCJ1bmZpbHRlclNsaWRlcyIsInNsaWNrVW5maWx0ZXIiLCJmcm9tQnJlYWtwb2ludCIsInJldCIsInciLCJtZXRob2RzIiwiYmNDbGFzcyIsIm1lbnVDbGFzcyIsImFuY2hvckNsYXNzIiwibWVudUFycm93Q2xhc3MiLCJpb3MiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJub29wIiwid3A3IiwidW5wcmVmaXhlZFBvaW50ZXJFdmVudHMiLCJQb2ludGVyRXZlbnQiLCJ0b2dnbGVNZW51Q2xhc3NlcyIsIm8iLCJjbGFzc2VzIiwiY3NzQXJyb3dzIiwic2V0UGF0aFRvQ3VycmVudCIsInBhdGhDbGFzcyIsInBhdGhMZXZlbHMiLCJob3ZlckNsYXNzIiwicG9wVXBTZWxlY3RvciIsInRvZ2dsZUFuY2hvckNsYXNzIiwiJGxpIiwidG9nZ2xlVG91Y2hBY3Rpb24iLCJtc1RvdWNoQWN0aW9uIiwidG91Y2hBY3Rpb24iLCJnZXRNZW51IiwiJGVsIiwiZ2V0T3B0aW9ucyIsInNmVGltZXIiLCJjbG9zZSIsInJldGFpblBhdGgiLCIkcGF0aCIsIm9uSWRsZSIsInRvdWNoSGFuZGxlciIsIiR1bCIsIm9uSGFuZGxlVG91Y2giLCJhcHBseUhhbmRsZXJzIiwiZGlzYWJsZUhJIiwidG91Y2hldmVudCIsImluc3RhbnQiLCJzcGVlZE91dCIsIm9uQmVmb3JlSGlkZSIsImFuaW1hdGlvbk91dCIsIm9uSGlkZSIsIm9uQmVmb3JlU2hvdyIsImFuaW1hdGlvbiIsIm9uU2hvdyIsIiRoYXNQb3BVcCIsIm9uRGVzdHJveSIsInJlbW92ZURhdGEiLCJvcCIsIm9uSW5pdCIsIkludmlldyIsImNyZWF0ZVdheXBvaW50cyIsImNvbmZpZ3MiLCJjb25maWciLCJjcmVhdGVXYXlwb2ludCIsImVudGVyIiwiZW50ZXJlZCIsImV4aXQiLCJleGl0ZWQiLCIkbGVnZW5kIiwiJG1hcHMiLCJtb3VzZWxlYXZlIiwic2VhcmNoUGFyYW1zIiwiVVJMU2VhcmNoUGFyYW1zIiwic2VhcmNoIiwiaGFzIiwicGFyYW0iLCJmYWRlT3V0IiwicmVhY3RNYXRjaEhlaWdodCIsImVsQ2xhc3NOYW1lIiwiaXNJbnRlcm5hbExpbmsiLCJSZWdFeHAiLCJob3N0IiwiaHJlZiIsIkZXUCIsImZvdW5kYXRpb24iLCJGb3VuZGF0aW9uIiwicmVJbml0IiwibGFzdFNjcm9sbFRvcCIsIm5hdmJhckhlaWdodCIsInNjcm9sbCIsImhhc1Njcm9sbGVkIiwic3QiLCIkdG9nZ2xlIiwiYW5pbWF0ZU51bWJlcnMiLCJ2aWV3ZWQiLCJpc1Njcm9sbGVkSW50b1ZpZXciLCJkb2NWaWV3VG9wIiwiZG9jVmlld0JvdHRvbSIsImVsZW1Ub3AiLCJlbGVtQm90dG9tIiwiQ291bnRlciIsInRvU3RyaW5nIiwiJGltZyIsImltZ0lEIiwiaW1nQ2xhc3MiLCJpbWdVUkwiLCIkc3ZnIiwicmVwbGFjZVdpdGgiLCIkY29sdW1uIiwiY2xpY2siLCIkdGhpc0NvbHVtbiIsIk1lZGlhUXVlcnkiLCJhdExlYXN0IiwibGFiZWwiLCJwbGF5VmlkZW8iLCJzaXplIiwiJG1vZGFsIiwiJGlmcmFtZSIsImZyYW1lYm9yZGVyIiwiaHRtbCIsImdldExhc3RTaWJsaW5nSW5Sb3ciLCJjYW5kaWRhdGUiLCJlbGVtZW50VG9wIiwib2Zmc2V0VG9wIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwiJGdyaWQiLCJob3ZlciIsIiRhbGxfb2VtYmVkX3ZpZGVvcyIsImxvYWRSZWdpb24iLCIkcmVnaW9uIiwibG9hZE1hcCIsIiRtYXAiLCJsb2FkUHJvamVjdCIsIiRwcm9qZWN0IiwiaGlkZV9oZWFkZXJfbWVudSIsInNjcm9sbG5vdyIsImRyb3BTaGFkb3dzIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUVBLENBQUMsWUFBWTtBQUNYOztBQUVBLE1BQUlBLGFBQWEsQ0FBakI7QUFDQSxNQUFJQyxhQUFhLEVBQWpCO0FBQ0EsTUFBSUMsYUFBYSxFQUFqQjs7QUFFQSxXQUFTQyxDQUFULENBQVlDLFFBQVosRUFBc0JDLE9BQXRCLEVBQStCO0FBQzdCLFdBQU9DLE1BQU1DLFNBQU4sQ0FBZ0JDLEtBQWhCLENBQXNCQyxJQUF0QixDQUNMLENBQUNKLFdBQVdLLFFBQVosRUFBc0JDLGdCQUF0QixDQUF1Q1AsUUFBdkMsQ0FESyxDQUFQO0FBR0Q7O0FBRUQsV0FBU1EsZ0JBQVQsQ0FBMkJDLE9BQTNCLEVBQW9DO0FBQ2xDLFFBQUlBLFFBQVFDLE9BQVosRUFBcUI7QUFDbkIsYUFBT0QsUUFBUUMsT0FBUixDQUFnQixvQkFBaEIsQ0FBUDtBQUNEOztBQUVELFdBQU9ELE9BQVAsRUFBZ0I7QUFDZCxVQUFJQSxRQUFRRSxRQUFSLEtBQXFCLENBQXJCLElBQTBCRixRQUFRRyxZQUFSLENBQXFCLGtCQUFyQixDQUE5QixFQUF3RTtBQUN0RSxlQUFPSCxPQUFQO0FBQ0Q7O0FBRURBLGdCQUFVQSxRQUFRSSxVQUFsQjtBQUNEOztBQUVELFdBQU8sSUFBUDtBQUNEOztBQUVELFdBQVNDLFlBQVQsQ0FBdUJDLE1BQXZCLEVBQStCO0FBQzdCLFFBQUlDLFNBQVNELFVBQVVqQixXQUFXaUIsT0FBT0UsWUFBUCxDQUFvQixlQUFwQixDQUFYLENBQXZCOztBQUVBLFFBQUksQ0FBQ0QsTUFBTCxFQUFhO0FBQ1gsYUFBTyxLQUFQO0FBQ0Q7O0FBRUQsUUFBSUUsVUFBVXJCLFdBQVcsTUFBTW1CLE9BQU9HLEVBQXhCLENBQWQ7QUFDQSxRQUFJQyxhQUFhSixPQUFPQyxZQUFQLENBQW9CLGFBQXBCLE1BQXVDLE9BQXhEOztBQUVBRCxXQUFPSyxZQUFQLENBQW9CLGFBQXBCLEVBQW1DRCxVQUFuQztBQUNBRixZQUFRSSxPQUFSLENBQWdCLFVBQVVQLE1BQVYsRUFBa0I7QUFDaENBLGFBQU9NLFlBQVAsQ0FBb0IsZUFBcEIsRUFBcUMsQ0FBQ0QsVUFBdEM7QUFDQSxVQUFHLENBQUNBLFVBQUosRUFBZ0I7QUFDZCxZQUFHTCxPQUFPSCxZQUFQLENBQW9CLHVCQUFwQixDQUFILEVBQWlEO0FBQzdDRyxpQkFBT1EsU0FBUCxHQUFtQlIsT0FBT0UsWUFBUCxDQUFvQix1QkFBcEIsQ0FBbkI7QUFDSDtBQUNGLE9BSkQsTUFJTztBQUNMLFlBQUdGLE9BQU9ILFlBQVAsQ0FBb0IsdUJBQXBCLENBQUgsRUFBaUQ7QUFDN0NHLGlCQUFPUSxTQUFQLEdBQW1CUixPQUFPRSxZQUFQLENBQW9CLHVCQUFwQixDQUFuQjtBQUNIO0FBQ0g7QUFDRCxLQVhEO0FBWUQ7O0FBRUQsTUFBSU8saUJBQWlCLFNBQWpCQSxjQUFpQixDQUFVdkIsT0FBVixFQUFtQjtBQUN0Q0osaUJBQWFFLEVBQUUsb0JBQUYsRUFBd0JFLE9BQXhCLEVBQWlDd0IsTUFBakMsQ0FBd0MsVUFBVUMsR0FBVixFQUFlWCxNQUFmLEVBQXVCO0FBQzFFLFVBQUlmLFdBQVcsTUFBTWUsT0FBT0UsWUFBUCxDQUFvQixrQkFBcEIsQ0FBckI7QUFDQVMsVUFBSTFCLFFBQUosSUFBZ0IwQixJQUFJMUIsUUFBSixLQUFpQixFQUFqQztBQUNBMEIsVUFBSTFCLFFBQUosRUFBYzJCLElBQWQsQ0FBbUJaLE1BQW5CO0FBQ0EsYUFBT1csR0FBUDtBQUNELEtBTFksRUFLVjdCLFVBTFUsQ0FBYjs7QUFPQSxRQUFJK0IsVUFBVUMsT0FBT0MsSUFBUCxDQUFZakMsVUFBWixDQUFkO0FBQ0ErQixZQUFRRyxNQUFSLElBQWtCaEMsRUFBRTZCLE9BQUYsRUFBV04sT0FBWCxDQUFtQixVQUFVTixNQUFWLEVBQWtCO0FBQ3JELFVBQUlFLFVBQVVyQixXQUFXLE1BQU1tQixPQUFPRyxFQUF4QixDQUFkO0FBQ0EsVUFBSUMsYUFBYUosT0FBT0osWUFBUCxDQUFvQix1QkFBcEIsQ0FBakI7QUFDQSxVQUFJb0IsYUFBYSxFQUFqQjs7QUFFQWQsY0FBUUksT0FBUixDQUFnQixVQUFVUCxNQUFWLEVBQWtCO0FBQ2hDQSxlQUFPSSxFQUFQLElBQWFKLE9BQU9NLFlBQVAsQ0FBb0IsSUFBcEIsRUFBMEIsaUJBQWlCekIsWUFBM0MsQ0FBYjtBQUNBbUIsZUFBT00sWUFBUCxDQUFvQixlQUFwQixFQUFxQ0wsT0FBT0csRUFBNUM7QUFDQUosZUFBT00sWUFBUCxDQUFvQixlQUFwQixFQUFxQ0QsVUFBckM7QUFDQVksbUJBQVdMLElBQVgsQ0FBZ0JaLE9BQU9JLEVBQXZCO0FBQ0QsT0FMRDs7QUFPQUgsYUFBT0ssWUFBUCxDQUFvQixhQUFwQixFQUFtQyxDQUFDRCxVQUFwQztBQUNBSixhQUFPSixZQUFQLENBQW9CLGlCQUFwQixLQUEwQ0ksT0FBT0ssWUFBUCxDQUFvQixpQkFBcEIsRUFBdUNXLFdBQVdDLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBdkMsQ0FBMUM7O0FBRUFuQyxpQkFBV2tCLE9BQU9HLEVBQWxCLElBQXdCSCxNQUF4QjtBQUNELEtBaEJpQixDQUFsQjtBQWlCRCxHQTFCRDs7QUE0QkFWLFdBQVM0QixnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBWTtBQUN4RFY7QUFDRCxHQUZEOztBQUlBbEIsV0FBUzRCLGdCQUFULENBQTBCLE9BQTFCLEVBQW1DLFVBQVVDLEtBQVYsRUFBaUI7QUFDbEQsUUFBSXBCLFNBQVNQLGlCQUFpQjJCLE1BQU1uQixNQUF2QixDQUFiO0FBQ0FGLGlCQUFhQyxNQUFiO0FBQ0QsR0FIRDs7QUFLQVQsV0FBUzRCLGdCQUFULENBQTBCLE9BQTFCLEVBQW1DLFVBQVVDLEtBQVYsRUFBaUI7QUFDbEQsUUFBSUEsTUFBTUMsS0FBTixLQUFnQixFQUFoQixJQUFzQkQsTUFBTUMsS0FBTixLQUFnQixFQUExQyxFQUE4QztBQUM1QyxVQUFJckIsU0FBU1AsaUJBQWlCMkIsTUFBTW5CLE1BQXZCLENBQWI7QUFDQSxVQUFJRCxVQUFVQSxPQUFPRSxZQUFQLENBQW9CLE1BQXBCLE1BQWdDLFFBQTlDLEVBQXdEO0FBQ3RESCxxQkFBYUMsTUFBYjtBQUNEO0FBQ0Y7QUFDRixHQVBEOztBQVNBc0IsYUFBV0EsT0FBT0MsVUFBUCxHQUFvQmQsY0FBL0I7QUFDRCxDQXJHRDs7O0FDRkE7Ozs7Ozs7OztBQVNBLENBQUUsVUFBV2xCLFFBQVgsRUFBcUJQLENBQXJCLEVBQXdCd0MsU0FBeEIsRUFBb0M7O0FBRXJDOztBQUVBeEMsR0FBRSxNQUFGLEVBQVV5QyxXQUFWLENBQXNCLE9BQXRCOztBQUVBLEtBQUlDLG9CQUF5QixPQUFPQyx1QkFBUCxLQUFtQyxXQUFuQyxHQUFpRCxFQUFqRCxHQUFzREEsdUJBQW5GO0FBQUEsS0FDQ0Msd0JBQXlCRixrQkFBa0JHLFdBRDVDO0FBQUEsS0FFQ0MsZUFBeUIsRUFGMUI7QUFBQSxLQUdDQyxpQkFBeUIsRUFIMUI7O0FBS0E7Ozs7Ozs7QUFPQS9DLEdBQUVnRCxJQUFGLENBQVFKLHFCQUFSLEVBQStCLFVBQVVLLEtBQVYsRUFBa0I7O0FBRWhEO0FBQ0FILGVBQWFHLEtBQWIsSUFBc0IsRUFBdEI7O0FBRUE7QUFDQWpELElBQUVnRCxJQUFGLENBQVEsSUFBUixFQUFjLFVBQVVFLEdBQVYsRUFBZUMsS0FBZixFQUF1Qjs7QUFFcEMsT0FBSUMsYUFBYUQsS0FBakI7QUFBQSxPQUNDRSxRQUFhckQsRUFBRW1ELEtBQUYsQ0FEZDs7QUFHQTtBQUNBLE9BQUtFLE1BQU1yQixNQUFOLEdBQWUsQ0FBcEIsRUFBd0I7O0FBRXZCaEMsTUFBRWdELElBQUYsQ0FBUUssS0FBUixFQUFlLFVBQVVILEdBQVYsRUFBZUMsS0FBZixFQUF1Qjs7QUFFckMsU0FBSUcsWUFBWUYsYUFBYSxHQUFiLEdBQW1CRixHQUFuQzs7QUFFQWxELE9BQUUsSUFBRixFQUFRdUQsUUFBUixDQUFrQkQsVUFBVUUsT0FBVixDQUFrQixHQUFsQixFQUFzQixFQUF0QixDQUFsQjs7QUFFQVYsa0JBQWFHLEtBQWIsRUFBb0JyQixJQUFwQixDQUEwQjBCLFNBQTFCOztBQUVBLFNBQUssY0FBY0wsS0FBbkIsRUFBMkI7QUFDMUJGLHFCQUFlbkIsSUFBZixDQUFxQjBCLFNBQXJCO0FBQ0E7QUFFRCxLQVpEO0FBY0EsSUFoQkQsTUFnQk8sSUFBS0QsTUFBTXJCLE1BQU4sSUFBZ0IsQ0FBckIsRUFBeUI7O0FBRS9CYyxpQkFBYUcsS0FBYixFQUFvQnJCLElBQXBCLENBQTBCd0IsVUFBMUI7O0FBRUEsUUFBSyxjQUFjSCxLQUFuQixFQUEyQjtBQUMxQkYsb0JBQWVuQixJQUFmLENBQXFCd0IsVUFBckI7QUFDQTtBQUVEO0FBRUQsR0FoQ0Q7QUFrQ0EsRUF4Q0Q7O0FBMENBO0FBQ0EsS0FBSyxPQUFPTixhQUFhVyxNQUFwQixJQUE4QixXQUFuQyxFQUFpRDtBQUNoRFgsZUFBYVcsTUFBYixHQUFzQixFQUF0QjtBQUNBOztBQUVEO0FBQ0EsS0FBS1YsZUFBZWYsTUFBZixJQUF5QixDQUE5QixFQUFrQztBQUNqQ2MsZUFBYVcsTUFBYixDQUFvQjdCLElBQXBCLENBQTBCbUIsZUFBZSxDQUFmLENBQTFCO0FBQ0FELGVBQWFZLE9BQWIsR0FBdUIsSUFBdkI7QUFDQVgsbUJBQWlCLElBQWpCO0FBQ0E7O0FBRUQsS0FBSVksY0FBc0IsRUFBMUI7QUFBQSxLQUNDQyxzQkFBc0IsYUFEdkI7QUFBQSxLQUVDQyxxQkFBc0IsaUJBRnZCO0FBQUEsS0FHQ0Msc0JBQXNCLHlCQUh2Qjs7QUFLQTtBQUNBSCxhQUFZSSxJQUFaLEdBQW1CLFlBQVc7O0FBRTdCO0FBQ0EsTUFBSy9ELEVBQUdnRSxtQkFBSCxFQUF5QmhDLE1BQXpCLElBQW1DLENBQXhDLEVBQTRDO0FBQzNDO0FBQ0E7O0FBRUQsTUFBSWlDLGdCQUFvQixPQUFPdkIsa0JBQWtCdUIsYUFBekIsS0FBMkMsV0FBM0MsR0FBeUR2QixrQkFBa0J1QixhQUEzRSxHQUEyRixpQ0FBbkg7QUFBQSxNQUNDQyxtQkFBb0IsT0FBT3hCLGtCQUFrQndCLGdCQUF6QixLQUE4QyxXQUE5QyxHQUE0RHhCLGtCQUFrQndCLGdCQUE5RSxHQUFpRyw0Q0FEdEg7QUFBQSxNQUVDQyxnQkFBb0I7QUFDbkJDLFNBQU9wRSxFQUFHLFlBQUgsRUFBaUI7QUFDdkIsYUFBVTRELG1CQURhO0FBRXZCLHFCQUFrQixLQUZLO0FBR3ZCLG9CQUFpQixLQUhNO0FBSXZCLFlBQVc7QUFKWSxJQUFqQixFQU1MUyxNQU5LLENBTUdyRSxFQUFHLFVBQUgsRUFBZTtBQUN2QixhQUFVLG9CQURhO0FBRXZCLFlBQVMwQyxrQkFBa0I0QjtBQUZKLElBQWYsQ0FOSCxDQURZO0FBV25CQyxZQUFVdkUsRUFBRyxZQUFILEVBQWlCO0FBQzFCLGFBQVU2RCxrQkFEZ0I7QUFFMUIscUJBQWtCLEtBRlE7QUFHMUIsb0JBQWtCLEtBSFE7QUFJMUIsWUFBVztBQUplLElBQWpCLEVBTVJRLE1BTlEsQ0FNQXJFLEVBQUcsVUFBSCxFQUFlO0FBQ3ZCLGFBQVUsb0JBRGE7QUFFdkIsWUFBUzBDLGtCQUFrQjhCO0FBRkosSUFBZixDQU5BO0FBWFMsR0FGckI7O0FBeUJBO0FBQ0FDOztBQUVBO0FBQ0FDLGtCQUFpQlAsYUFBakI7O0FBRUE7QUFDQW5FLElBQUcsTUFBTTRELG1CQUFULEVBQStCTCxRQUEvQixDQUF5Q1UsYUFBekM7QUFDQWpFLElBQUcsTUFBTTZELGtCQUFULEVBQThCTixRQUE5QixDQUF3Q1csZ0JBQXhDO0FBQ0FsRSxJQUFHLE1BQU00RCxtQkFBVCxFQUErQmUsRUFBL0IsQ0FBbUMsOEJBQW5DLEVBQW1FQyxlQUFuRSxFQUFxRjVCLElBQXJGLENBQTJGNkIsV0FBM0Y7QUFDQTdFLElBQUcsTUFBTTZELGtCQUFULEVBQThCYyxFQUE5QixDQUFrQyw2QkFBbEMsRUFBaUVHLGNBQWpFO0FBQ0E5RSxJQUFHc0MsTUFBSCxFQUFZcUMsRUFBWixDQUFnQixvQkFBaEIsRUFBc0NJLFNBQXRDLEVBQWtEQyxjQUFsRCxDQUFrRSxvQkFBbEU7QUFDQSxFQTVDRDs7QUE4Q0E7Ozs7QUFJQSxVQUFTTixlQUFULENBQTBCUCxhQUExQixFQUEwQzs7QUFFekM7QUFDQW5FLElBQUdpRix1QkFBd0JuQyxZQUF4QixDQUFILEVBQTRDb0MsSUFBNUMsQ0FBa0QsV0FBbEQsRUFBZ0VDLE1BQWhFLENBQXdFaEIsY0FBY0ksT0FBdEY7O0FBR0EsTUFBS3hCLG1CQUFtQixJQUF4QixFQUErQjs7QUFFOUIsT0FBSXFDLGdCQUFnQnRDLGFBQWFXLE1BQWIsQ0FBb0I0QixNQUFwQixDQUE0QnRDLGVBQWUsQ0FBZixDQUE1QixDQUFwQjs7QUFFQztBQUNBL0MsS0FBR2lGLHVCQUF3QkcsYUFBeEIsQ0FBSCxFQUE2Q0QsTUFBN0MsQ0FBcURoQixjQUFjQyxJQUFuRTtBQUVELEdBUEQsTUFPTzs7QUFFTjtBQUNBcEUsS0FBR2lGLHVCQUF3Qm5DLGFBQWFXLE1BQXJDLENBQUgsRUFBbUQwQixNQUFuRCxDQUEyRGhCLGNBQWNDLElBQXpFO0FBRUE7QUFFRDs7QUFFRDs7O0FBR0EsVUFBU0ssdUJBQVQsR0FBbUM7QUFDbEN6RSxJQUFHaUYsdUJBQXdCbkMsWUFBeEIsQ0FBSCxFQUE0Q1MsUUFBNUMsQ0FBc0RPLG1CQUF0RDtBQUNBOztBQUVEOzs7QUFHQSxVQUFTaUIsU0FBVCxHQUFxQjtBQUNwQixNQUFJTyxVQUFZdEYsRUFBRywrQkFBSCxFQUFxQ3VGLElBQXJDLENBQTJDLElBQTNDLENBQWhCO0FBQ0EsTUFBSyxPQUFPRCxPQUFQLEtBQW1CLFdBQXhCLEVBQXNDO0FBQ3JDO0FBQ0E7QUFDREUsY0FBYUYsT0FBYjtBQUNBRyxtQkFBa0JILE9BQWxCO0FBQ0FJLGtCQUFpQkosT0FBakI7QUFDQUssZ0JBQWVMLE9BQWY7QUFDQTs7QUFFRDs7OztBQUlBLFVBQVNULFdBQVQsR0FBdUI7QUFDdEIsTUFBSWUsUUFBUTVGLEVBQUcsSUFBSCxDQUFaO0FBQUEsTUFDQzZGLE1BQVFELE1BQU1FLElBQU4sQ0FBWSxLQUFaLENBRFQ7QUFBQSxNQUVDMUUsS0FBUSxPQUZUOztBQUlBd0UsUUFBTUwsSUFBTixDQUFZLElBQVosRUFBa0Isb0JBQW9CdkYsRUFBRzZGLEdBQUgsRUFBU04sSUFBVCxDQUFlbkUsRUFBZixFQUFvQjJFLEtBQXBCLENBQTJCLFdBQTNCLENBQXRDO0FBQ0E7O0FBRUQ7Ozs7QUFJQSxVQUFTSixhQUFULENBQXdCTCxPQUF4QixFQUFpQzs7QUFFaEM7QUFDQSxNQUFLdkMsa0JBQWtCLElBQXZCLEVBQThCO0FBQzdCO0FBQ0E7O0FBRUQ7QUFDQSxNQUFJaUQsY0FBZ0JqRCxlQUFlLENBQWYsQ0FBcEI7QUFBQSxNQUNDa0QsZ0JBQWdCakcsRUFBRytDLGNBQUgsRUFBb0JtRCxNQUFwQixDQUE0QixVQUFTQyxLQUFULEVBQWdCO0FBQUUsT0FBS0EsUUFBUSxDQUFiLEVBQWlCO0FBQUUsV0FBT0EsS0FBUDtBQUFlO0FBQUUsR0FBbEYsQ0FEakI7O0FBR0E7QUFDQSxNQUFLLFdBQVdDLGlCQUFrQmQsT0FBbEIsQ0FBaEIsRUFBOEM7O0FBRTdDdEYsS0FBRWdELElBQUYsQ0FBUWlELGFBQVIsRUFBdUIsVUFBVS9DLEdBQVYsRUFBZUMsS0FBZixFQUF1QjtBQUM3Q25ELE1BQUVtRCxLQUFGLEVBQVMrQixJQUFULENBQWUsWUFBZixFQUE4QjNCLFFBQTlCLENBQXdDLGdCQUFnQkosTUFBTUssT0FBTixDQUFlLEdBQWYsRUFBbUIsRUFBbkIsQ0FBeEQsRUFBa0Y2QyxRQUFsRixDQUE0RkwsY0FBYyxzQkFBMUc7QUFDQSxJQUZEO0FBR0FoRyxLQUFHaUYsdUJBQXdCZ0IsYUFBeEIsQ0FBSCxFQUE2Q0ssSUFBN0M7QUFFQSxHQVBELE1BT087O0FBRU50RyxLQUFHaUYsdUJBQXdCZ0IsYUFBeEIsQ0FBSCxFQUE2Q00sSUFBN0M7QUFDQXZHLEtBQUVnRCxJQUFGLENBQVFpRCxhQUFSLEVBQXVCLFVBQVUvQyxHQUFWLEVBQWVDLEtBQWYsRUFBdUI7QUFDN0NuRCxNQUFHLGlCQUFpQm1ELE1BQU1LLE9BQU4sQ0FBZSxHQUFmLEVBQW1CLEVBQW5CLENBQXBCLEVBQThDNkMsUUFBOUMsQ0FBd0RsRCxRQUFRLHNCQUFoRSxFQUF5RlYsV0FBekYsQ0FBc0csZ0JBQWdCVSxNQUFNSyxPQUFOLENBQWUsR0FBZixFQUFtQixFQUFuQixDQUF0SDtBQUNBLElBRkQ7QUFJQTtBQUVEOztBQUVEOzs7QUFHQSxVQUFTb0IsZUFBVCxHQUEyQjtBQUMxQixNQUFJZ0IsUUFBUTVGLEVBQUcsSUFBSCxDQUFaO0FBQ0F3RyxjQUFhWixLQUFiLEVBQW9CLGNBQXBCO0FBQ0FZLGNBQWFaLEtBQWIsRUFBb0IsZUFBcEI7QUFDQUEsUUFBTWEsV0FBTixDQUFtQixXQUFuQjtBQUNBYixRQUFNRSxJQUFOLENBQVksS0FBWixFQUFvQlksV0FBcEIsQ0FBaUMsTUFBakM7QUFDQTs7QUFFRDs7O0FBR0EsVUFBUzVCLGNBQVQsR0FBMEI7O0FBRXpCLE1BQUljLFFBQVM1RixFQUFHLElBQUgsQ0FBYjtBQUFBLE1BQ0N5RCxTQUFTbUMsTUFBTWpGLE9BQU4sQ0FBZSxZQUFmLEVBQThCZ0csUUFBOUIsRUFEVjtBQUVBSCxjQUFhWixLQUFiLEVBQW9CLGNBQXBCO0FBQ0FZLGNBQWFaLEtBQWIsRUFBb0IsZUFBcEI7QUFDQUEsUUFBTWEsV0FBTixDQUFtQixXQUFuQjtBQUNBYixRQUFNRSxJQUFOLENBQVksV0FBWixFQUEwQlksV0FBMUIsQ0FBdUMsTUFBdkM7O0FBRUFqRCxTQUFPeUIsSUFBUCxDQUFhLE1BQU1yQixrQkFBbkIsRUFBd0NwQixXQUF4QyxDQUFxRCxXQUFyRCxFQUFtRThDLElBQW5FLENBQXlFLGNBQXpFLEVBQXlGLE9BQXpGO0FBQ0E5QixTQUFPeUIsSUFBUCxDQUFhLFdBQWIsRUFBMkIwQixPQUEzQixDQUFvQyxNQUFwQztBQUVBOztBQUVEOzs7O0FBSUEsVUFBU25CLGdCQUFULENBQTJCSCxPQUEzQixFQUFxQztBQUNwQyxNQUFJdUIsYUFBYTdHLEVBQUcsTUFBTThELG1CQUFOLEdBQTRCLGdCQUEvQixDQUFqQjtBQUFBLE1BQ0NnRCxRQUFhLFNBRGQ7QUFFQSxNQUFLLE9BQU9ELFdBQVdFLFNBQWxCLEtBQWdDLFVBQXJDLEVBQWtEO0FBQ2pEO0FBQ0E7QUFDRCxNQUFLLFdBQVdYLGlCQUFrQmQsT0FBbEIsQ0FBaEIsRUFBOEM7QUFDN0N3QixXQUFRO0FBQ1AsYUFBUyxDQURGO0FBRVAsaUJBQWEsRUFBQyxXQUFXLE1BQVosRUFGTjtBQUdQLGFBQVMsR0FIRjtBQUlQLGlCQUFhO0FBSk4sSUFBUjtBQU1BO0FBQ0RELGFBQVdFLFNBQVgsQ0FBc0JELEtBQXRCO0FBQ0E7O0FBRUQ7Ozs7QUFJQSxVQUFTcEIsZUFBVCxDQUEwQkosT0FBMUIsRUFBb0M7O0FBRW5DO0FBQ0EsTUFBSTBCLGlCQUFpQmhELG1CQUFyQjs7QUFFQTtBQUNBLE1BQUssQ0FBRWhFLEVBQUdnSCxjQUFILEVBQW9CaEYsTUFBdEIsR0FBK0IsQ0FBcEMsRUFBd0M7QUFDdkM7QUFDQTs7QUFFRGhDLElBQUVnRCxJQUFGLENBQVFnRSxjQUFSLEVBQXdCLFVBQVc5RCxHQUFYLEVBQWdCQyxLQUFoQixFQUF3Qjs7QUFFL0MsT0FBSThELFdBQVk5RCxNQUFNSyxPQUFOLENBQWUsR0FBZixFQUFvQixFQUFwQixDQUFoQjtBQUFBLE9BQ0MwRCxZQUFZLGFBQWFELFFBRDFCO0FBQUEsT0FFQ0UsVUFBWSxvQkFBb0JGLFFBRmpDOztBQUlBLE9BQUssVUFBVWIsaUJBQWtCZCxPQUFsQixDQUFmLEVBQTZDO0FBQzVDNEIsZ0JBQVksb0JBQW9CRCxRQUFoQztBQUNBRSxjQUFZLGFBQWFGLFFBQXpCO0FBQ0E7O0FBRUQsT0FBSUcsUUFBUXBILEVBQUcsaUNBQWlDa0gsU0FBakMsR0FBNkMsSUFBaEQsQ0FBWjs7QUFFQSxPQUFLbkUsbUJBQW1CLElBQW5CLElBQTJCSSxVQUFVSixlQUFlLENBQWYsQ0FBMUMsRUFBOEQ7QUFDN0RxRSxVQUFNWCxXQUFOLENBQW1CLGtCQUFuQjtBQUNBOztBQUVELE9BQUtXLE1BQU1wRixNQUFOLEdBQWUsQ0FBcEIsRUFBd0I7QUFDdkIsUUFBSXFGLE9BQVFELE1BQU03QixJQUFOLENBQVksTUFBWixDQUFaO0FBQ0M4QixXQUFRQSxLQUFLN0QsT0FBTCxDQUFjMEQsU0FBZCxFQUF5QkMsT0FBekIsQ0FBUjs7QUFFREMsVUFBTTdCLElBQU4sQ0FBWSxNQUFaLEVBQW9COEIsSUFBcEI7QUFDQSxJQUxELE1BS087QUFDTjtBQUNBO0FBRUQsR0ExQkQ7QUE0QkE7O0FBRUQ7Ozs7QUFJQSxVQUFTN0IsV0FBVCxDQUFzQkYsT0FBdEIsRUFBZ0M7QUFDL0IsTUFBSyxXQUFXYyxpQkFBa0JkLE9BQWxCLENBQWhCLEVBQThDO0FBQzdDLFVBQU8sSUFBUDtBQUNBOztBQUVEdEYsSUFBRyxNQUFNNEQsbUJBQU4sR0FBNEIsS0FBNUIsR0FBb0NFLG1CQUFwQyxHQUEwRCxtQkFBN0QsRUFDRXJCLFdBREYsQ0FDZSxXQURmLEVBRUU4QyxJQUZGLENBRVEsZUFGUixFQUV5QixLQUZ6QixFQUdFQSxJQUhGLENBR1EsY0FIUixFQUd3QixLQUh4Qjs7QUFLQXZGLElBQUcsTUFBTThELG1CQUFOLEdBQTRCLEtBQTVCLEdBQW9DQSxtQkFBcEMsR0FBMEQsWUFBN0QsRUFDRXlCLElBREYsQ0FDUSxPQURSLEVBQ2lCLEVBRGpCO0FBRUE7O0FBRUQ7Ozs7O0FBS0EsVUFBU2EsZ0JBQVQsQ0FBMkJrQixHQUEzQixFQUFpQztBQUNoQyxNQUFJNUcsVUFBVUgsU0FBU2dILGNBQVQsQ0FBeUJELEdBQXpCLENBQWQ7QUFBQSxNQUNDRSxRQUFVbEYsT0FBT21GLGdCQUFQLENBQXlCL0csT0FBekIsQ0FEWDtBQUVBLFNBQU84RyxNQUFNRSxnQkFBTixDQUF3QixTQUF4QixDQUFQO0FBQ0E7O0FBRUQ7Ozs7OztBQU1BLFVBQVNsQixXQUFULENBQXNCWixLQUF0QixFQUE2QitCLFNBQTdCLEVBQXlDO0FBQ3hDL0IsUUFBTUwsSUFBTixDQUFZb0MsU0FBWixFQUF1QixVQUFVeEIsS0FBVixFQUFpQmhELEtBQWpCLEVBQXlCO0FBQy9DLFVBQU8sWUFBWUEsS0FBbkI7QUFDQSxHQUZEO0FBR0E7O0FBRUQ7Ozs7OztBQU1BLFVBQVM4QixzQkFBVCxDQUFpQzJDLFNBQWpDLEVBQTZDOztBQUU1QyxNQUFJQyxhQUFhN0gsRUFBRThILEdBQUYsQ0FBT0YsU0FBUCxFQUFrQixVQUFVekUsS0FBVixFQUFpQkQsR0FBakIsRUFBdUI7QUFDekQsVUFBT0MsS0FBUDtBQUNBLEdBRmdCLENBQWpCOztBQUlBLFNBQU8wRSxXQUFXM0YsSUFBWCxDQUFpQixHQUFqQixDQUFQO0FBRUE7O0FBRUQ7Ozs7O0FBS0EsVUFBUzhCLGlCQUFULEdBQTZCOztBQUU1QjtBQUNBLE1BQUkrRCxXQUFXLEVBQWY7O0FBRUE7QUFDQSxNQUFLaEYsbUJBQW1CLElBQXhCLEVBQStCOztBQUU5Qi9DLEtBQUVnRCxJQUFGLENBQVFELGNBQVIsRUFBd0IsVUFBVUcsR0FBVixFQUFlQyxLQUFmLEVBQXVCO0FBQzlDNEUsYUFBU25HLElBQVQsQ0FBZXVCLE1BQU02RSxPQUFOLEVBQWY7QUFDQSxJQUZEO0FBSUE7O0FBRUQ7QUFDQWhJLElBQUVnRCxJQUFGLENBQVFGLGFBQWFXLE1BQXJCLEVBQTZCLFVBQVVQLEdBQVYsRUFBZUMsS0FBZixFQUF1QjtBQUNuRDRFLFlBQVNuRyxJQUFULENBQWV1QixNQUFNNkUsT0FBTixFQUFmO0FBQ0EsR0FGRDs7QUFJQSxNQUFLRCxTQUFTL0YsTUFBVCxHQUFrQixDQUF2QixFQUEyQjtBQUMxQixVQUFPK0YsUUFBUDtBQUNBLEdBRkQsTUFFTztBQUNOLFVBQU8sSUFBUDtBQUNBO0FBRUQ7O0FBRUQvSCxHQUFFTyxRQUFGLEVBQVkwSCxLQUFaLENBQWtCLFlBQVk7O0FBRTdCLE1BQUtqRSx3QkFBd0IsSUFBN0IsRUFBb0M7O0FBRW5DTCxlQUFZSSxJQUFaO0FBRUE7QUFFRCxFQVJEO0FBV0EsQ0ExWkQsRUEwWkl4RCxRQTFaSixFQTBaYzJILE1BMVpkOzs7OztBQ1RBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4QkEsQ0FBQyxVQUFTbEksQ0FBVCxFQUFZO0FBQ1RBLE1BQUVtSSxFQUFGLENBQUtDLFdBQUwsR0FBbUIsVUFBU0MsU0FBVCxFQUFtQkMsVUFBbkIsRUFBOEJySSxRQUE5QixFQUF3Qzs7QUFFdkQ7QUFDQSxZQUFJc0ksTUFBTTtBQUNOQyxzQkFBVSxHQURKO0FBRU5DLHlCQUFhLENBRlA7QUFHTkMscUJBQVM7QUFISCxTQUFWOztBQU1BLFlBQUssUUFBT0wsU0FBUCx5Q0FBT0EsU0FBUCxPQUFxQixRQUExQixFQUFxQztBQUNqQ0Usa0JBQU12SSxFQUFFMkksTUFBRixDQUFTSixHQUFULEVBQWNGLFNBQWQsQ0FBTjtBQUNILFNBRkQsTUFFTyxJQUFJckksRUFBRTRJLFVBQUYsQ0FBYU4sVUFBYixDQUFKLEVBQThCO0FBQ2pDQyxrQkFBTXZJLEVBQUUySSxNQUFGLENBQVNKLEdBQVQsRUFBYyxFQUFFTSxNQUFNUixTQUFSLEVBQW1CUyxLQUFLUixVQUF4QixFQUFvQ3JJLFVBQVVBLFFBQTlDLEVBQWQsQ0FBTjtBQUNILFNBRk0sTUFFQTtBQUNIc0ksa0JBQU12SSxFQUFFMkksTUFBRixDQUFTSixHQUFULEVBQWMsRUFBRU0sTUFBTVIsU0FBUixFQUFtQlMsS0FBS1QsU0FBeEIsRUFBbUNwSSxVQUFVcUksVUFBN0MsRUFBZCxDQUFOO0FBQ0g7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsWUFBSVMsRUFBSixFQUFRQyxFQUFSLEVBQVlDLEVBQVosRUFBZ0JDLEVBQWhCOztBQUVBO0FBQ0EsWUFBSUMsUUFBUSxTQUFSQSxLQUFRLENBQVNDLEVBQVQsRUFBYTtBQUNyQkwsaUJBQUtLLEdBQUdDLEtBQVI7QUFDQUwsaUJBQUtJLEdBQUdFLEtBQVI7QUFDSCxTQUhEOztBQUtBO0FBQ0EsWUFBSUMsVUFBVSxTQUFWQSxPQUFVLENBQVNILEVBQVQsRUFBWUksRUFBWixFQUFnQjtBQUMxQkEsZUFBR0MsYUFBSCxHQUFtQkMsYUFBYUYsR0FBR0MsYUFBaEIsQ0FBbkI7QUFDQTtBQUNBLGdCQUFPRSxLQUFLQyxHQUFMLENBQVNYLEtBQUdGLEVBQVosSUFBa0JZLEtBQUtDLEdBQUwsQ0FBU1YsS0FBR0YsRUFBWixDQUFwQixHQUF3Q1QsSUFBSUUsV0FBakQsRUFBK0Q7QUFDM0R6SSxrQkFBRXdKLEVBQUYsRUFBTUssR0FBTixDQUFVLHVCQUFWLEVBQWtDVixLQUFsQztBQUNBO0FBQ0FLLG1CQUFHTSxhQUFILEdBQW1CLENBQW5CO0FBQ0EsdUJBQU92QixJQUFJTSxJQUFKLENBQVNrQixLQUFULENBQWVQLEVBQWYsRUFBa0IsQ0FBQ0osRUFBRCxDQUFsQixDQUFQO0FBQ0gsYUFMRCxNQUtPO0FBQ0g7QUFDQUgscUJBQUtGLEVBQUwsQ0FBU0csS0FBS0YsRUFBTDtBQUNUO0FBQ0FRLG1CQUFHQyxhQUFILEdBQW1CTyxXQUFZLFlBQVU7QUFBQ1QsNEJBQVFILEVBQVIsRUFBWUksRUFBWjtBQUFpQixpQkFBeEMsRUFBMkNqQixJQUFJQyxRQUEvQyxDQUFuQjtBQUNIO0FBQ0osU0FkRDs7QUFnQkE7QUFDQSxZQUFJeUIsUUFBUSxTQUFSQSxLQUFRLENBQVNiLEVBQVQsRUFBWUksRUFBWixFQUFnQjtBQUN4QkEsZUFBR0MsYUFBSCxHQUFtQkMsYUFBYUYsR0FBR0MsYUFBaEIsQ0FBbkI7QUFDQUQsZUFBR00sYUFBSCxHQUFtQixDQUFuQjtBQUNBLG1CQUFPdkIsSUFBSU8sR0FBSixDQUFRaUIsS0FBUixDQUFjUCxFQUFkLEVBQWlCLENBQUNKLEVBQUQsQ0FBakIsQ0FBUDtBQUNILFNBSkQ7O0FBTUE7QUFDQSxZQUFJYyxjQUFjLFNBQWRBLFdBQWMsQ0FBU0MsQ0FBVCxFQUFZO0FBQzFCO0FBQ0EsZ0JBQUlmLEtBQUtsQixPQUFPUyxNQUFQLENBQWMsRUFBZCxFQUFpQndCLENBQWpCLENBQVQ7QUFDQSxnQkFBSVgsS0FBSyxJQUFUOztBQUVBO0FBQ0EsZ0JBQUlBLEdBQUdDLGFBQVAsRUFBc0I7QUFBRUQsbUJBQUdDLGFBQUgsR0FBbUJDLGFBQWFGLEdBQUdDLGFBQWhCLENBQW5CO0FBQW9EOztBQUU1RTtBQUNBLGdCQUFJVSxFQUFFQyxJQUFGLElBQVUsWUFBZCxFQUE0QjtBQUN4QjtBQUNBbkIscUJBQUtHLEdBQUdDLEtBQVIsQ0FBZUgsS0FBS0UsR0FBR0UsS0FBUjtBQUNmO0FBQ0F0SixrQkFBRXdKLEVBQUYsRUFBTTdFLEVBQU4sQ0FBUyx1QkFBVCxFQUFpQ3dFLEtBQWpDO0FBQ0E7QUFDQSxvQkFBSUssR0FBR00sYUFBSCxJQUFvQixDQUF4QixFQUEyQjtBQUFFTix1QkFBR0MsYUFBSCxHQUFtQk8sV0FBWSxZQUFVO0FBQUNULGdDQUFRSCxFQUFSLEVBQVdJLEVBQVg7QUFBZ0IscUJBQXZDLEVBQTBDakIsSUFBSUMsUUFBOUMsQ0FBbkI7QUFBNkU7O0FBRTFHO0FBQ0gsYUFURCxNQVNPO0FBQ0g7QUFDQXhJLGtCQUFFd0osRUFBRixFQUFNSyxHQUFOLENBQVUsdUJBQVYsRUFBa0NWLEtBQWxDO0FBQ0E7QUFDQSxvQkFBSUssR0FBR00sYUFBSCxJQUFvQixDQUF4QixFQUEyQjtBQUFFTix1QkFBR0MsYUFBSCxHQUFtQk8sV0FBWSxZQUFVO0FBQUNDLDhCQUFNYixFQUFOLEVBQVNJLEVBQVQ7QUFBYyxxQkFBckMsRUFBd0NqQixJQUFJRyxPQUE1QyxDQUFuQjtBQUEwRTtBQUMxRztBQUNKLFNBeEJEOztBQTBCQTtBQUNBLGVBQU8sS0FBSy9ELEVBQUwsQ0FBUSxFQUFDLDBCQUF5QnVGLFdBQTFCLEVBQXNDLDBCQUF5QkEsV0FBL0QsRUFBUixFQUFxRjNCLElBQUl0SSxRQUF6RixDQUFQO0FBQ0gsS0FqRkQ7QUFrRkgsQ0FuRkQsRUFtRkdpSSxNQW5GSDs7Ozs7QUM5QkE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7QUFFRSxXQUFVbUMsTUFBVixFQUFrQkMsT0FBbEIsRUFBNEI7QUFDNUI7QUFDQSw0QkFGNEIsQ0FFRDtBQUMzQixNQUFLLE9BQU9DLE1BQVAsSUFBaUIsVUFBakIsSUFBK0JBLE9BQU9DLEdBQTNDLEVBQWlEO0FBQy9DO0FBQ0FELFdBQVEsdUJBQVIsRUFBZ0NELE9BQWhDO0FBQ0QsR0FIRCxNQUdPLElBQUssUUFBT0csTUFBUCx5Q0FBT0EsTUFBUCxNQUFpQixRQUFqQixJQUE2QkEsT0FBT0MsT0FBekMsRUFBbUQ7QUFDeEQ7QUFDQUQsV0FBT0MsT0FBUCxHQUFpQkosU0FBakI7QUFDRCxHQUhNLE1BR0E7QUFDTDtBQUNBRCxXQUFPTSxTQUFQLEdBQW1CTCxTQUFuQjtBQUNEO0FBRUYsQ0FkQyxFQWNDLE9BQU9oSSxNQUFQLElBQWlCLFdBQWpCLEdBQStCQSxNQUEvQixZQWRELEVBYytDLFlBQVc7O0FBSTVELFdBQVNxSSxTQUFULEdBQXFCLENBQUU7O0FBRXZCLE1BQUlDLFFBQVFELFVBQVV2SyxTQUF0Qjs7QUFFQXdLLFFBQU1qRyxFQUFOLEdBQVcsVUFBVWtHLFNBQVYsRUFBcUJDLFFBQXJCLEVBQWdDO0FBQ3pDLFFBQUssQ0FBQ0QsU0FBRCxJQUFjLENBQUNDLFFBQXBCLEVBQStCO0FBQzdCO0FBQ0Q7QUFDRDtBQUNBLFFBQUlDLFNBQVMsS0FBS0MsT0FBTCxHQUFlLEtBQUtBLE9BQUwsSUFBZ0IsRUFBNUM7QUFDQTtBQUNBLFFBQUlDLFlBQVlGLE9BQVFGLFNBQVIsSUFBc0JFLE9BQVFGLFNBQVIsS0FBdUIsRUFBN0Q7QUFDQTtBQUNBLFFBQUtJLFVBQVVDLE9BQVYsQ0FBbUJKLFFBQW5CLEtBQWlDLENBQUMsQ0FBdkMsRUFBMkM7QUFDekNHLGdCQUFVckosSUFBVixDQUFnQmtKLFFBQWhCO0FBQ0Q7O0FBRUQsV0FBTyxJQUFQO0FBQ0QsR0FkRDs7QUFnQkFGLFFBQU1PLElBQU4sR0FBYSxVQUFVTixTQUFWLEVBQXFCQyxRQUFyQixFQUFnQztBQUMzQyxRQUFLLENBQUNELFNBQUQsSUFBYyxDQUFDQyxRQUFwQixFQUErQjtBQUM3QjtBQUNEO0FBQ0Q7QUFDQSxTQUFLbkcsRUFBTCxDQUFTa0csU0FBVCxFQUFvQkMsUUFBcEI7QUFDQTtBQUNBO0FBQ0EsUUFBSU0sYUFBYSxLQUFLQyxXQUFMLEdBQW1CLEtBQUtBLFdBQUwsSUFBb0IsRUFBeEQ7QUFDQTtBQUNBLFFBQUlDLGdCQUFnQkYsV0FBWVAsU0FBWixJQUEwQk8sV0FBWVAsU0FBWixLQUEyQixFQUF6RTtBQUNBO0FBQ0FTLGtCQUFlUixRQUFmLElBQTRCLElBQTVCOztBQUVBLFdBQU8sSUFBUDtBQUNELEdBZkQ7O0FBaUJBRixRQUFNZixHQUFOLEdBQVksVUFBVWdCLFNBQVYsRUFBcUJDLFFBQXJCLEVBQWdDO0FBQzFDLFFBQUlHLFlBQVksS0FBS0QsT0FBTCxJQUFnQixLQUFLQSxPQUFMLENBQWNILFNBQWQsQ0FBaEM7QUFDQSxRQUFLLENBQUNJLFNBQUQsSUFBYyxDQUFDQSxVQUFVakosTUFBOUIsRUFBdUM7QUFDckM7QUFDRDtBQUNELFFBQUltRSxRQUFROEUsVUFBVUMsT0FBVixDQUFtQkosUUFBbkIsQ0FBWjtBQUNBLFFBQUszRSxTQUFTLENBQUMsQ0FBZixFQUFtQjtBQUNqQjhFLGdCQUFVTSxNQUFWLENBQWtCcEYsS0FBbEIsRUFBeUIsQ0FBekI7QUFDRDs7QUFFRCxXQUFPLElBQVA7QUFDRCxHQVhEOztBQWFBeUUsUUFBTVksU0FBTixHQUFrQixVQUFVWCxTQUFWLEVBQXFCWSxJQUFyQixFQUE0QjtBQUM1QyxRQUFJUixZQUFZLEtBQUtELE9BQUwsSUFBZ0IsS0FBS0EsT0FBTCxDQUFjSCxTQUFkLENBQWhDO0FBQ0EsUUFBSyxDQUFDSSxTQUFELElBQWMsQ0FBQ0EsVUFBVWpKLE1BQTlCLEVBQXVDO0FBQ3JDO0FBQ0Q7QUFDRDtBQUNBaUosZ0JBQVlBLFVBQVU1SyxLQUFWLENBQWdCLENBQWhCLENBQVo7QUFDQW9MLFdBQU9BLFFBQVEsRUFBZjtBQUNBO0FBQ0EsUUFBSUgsZ0JBQWdCLEtBQUtELFdBQUwsSUFBb0IsS0FBS0EsV0FBTCxDQUFrQlIsU0FBbEIsQ0FBeEM7O0FBRUEsU0FBTSxJQUFJYSxJQUFFLENBQVosRUFBZUEsSUFBSVQsVUFBVWpKLE1BQTdCLEVBQXFDMEosR0FBckMsRUFBMkM7QUFDekMsVUFBSVosV0FBV0csVUFBVVMsQ0FBVixDQUFmO0FBQ0EsVUFBSUMsU0FBU0wsaUJBQWlCQSxjQUFlUixRQUFmLENBQTlCO0FBQ0EsVUFBS2EsTUFBTCxFQUFjO0FBQ1o7QUFDQTtBQUNBLGFBQUs5QixHQUFMLENBQVVnQixTQUFWLEVBQXFCQyxRQUFyQjtBQUNBO0FBQ0EsZUFBT1EsY0FBZVIsUUFBZixDQUFQO0FBQ0Q7QUFDRDtBQUNBQSxlQUFTZixLQUFULENBQWdCLElBQWhCLEVBQXNCMEIsSUFBdEI7QUFDRDs7QUFFRCxXQUFPLElBQVA7QUFDRCxHQTFCRDs7QUE0QkFiLFFBQU1nQixNQUFOLEdBQWUsWUFBVztBQUN4QixXQUFPLEtBQUtaLE9BQVo7QUFDQSxXQUFPLEtBQUtLLFdBQVo7QUFDRCxHQUhEOztBQUtBLFNBQU9WLFNBQVA7QUFFQyxDQXZHQyxDQUFGOztBQXlHQTs7Ozs7O0FBTUEsQ0FBRSxVQUFVckksTUFBVixFQUFrQmdJLE9BQWxCLEVBQTRCO0FBQUU7QUFDOUI7O0FBRUE7O0FBRUEsTUFBSyxPQUFPQyxNQUFQLElBQWlCLFVBQWpCLElBQStCQSxPQUFPQyxHQUEzQyxFQUFpRDtBQUMvQztBQUNBRCxXQUFRLENBQ04sdUJBRE0sQ0FBUixFQUVHLFVBQVVJLFNBQVYsRUFBc0I7QUFDdkIsYUFBT0wsUUFBU2hJLE1BQVQsRUFBaUJxSSxTQUFqQixDQUFQO0FBQ0QsS0FKRDtBQUtELEdBUEQsTUFPTyxJQUFLLFFBQU9GLE1BQVAseUNBQU9BLE1BQVAsTUFBaUIsUUFBakIsSUFBNkJBLE9BQU9DLE9BQXpDLEVBQW1EO0FBQ3hEO0FBQ0FELFdBQU9DLE9BQVAsR0FBaUJKLFFBQ2ZoSSxNQURlLEVBRWZ1SixRQUFRLFlBQVIsQ0FGZSxDQUFqQjtBQUlELEdBTk0sTUFNQTtBQUNMO0FBQ0F2SixXQUFPd0osWUFBUCxHQUFzQnhCLFFBQ3BCaEksTUFEb0IsRUFFcEJBLE9BQU9xSSxTQUZhLENBQXRCO0FBSUQ7QUFFRixDQTFCRCxFQTBCSSxPQUFPckksTUFBUCxLQUFrQixXQUFsQixHQUFnQ0EsTUFBaEMsWUExQko7O0FBNEJBOztBQUVBLFNBQVNnSSxPQUFULENBQWtCaEksTUFBbEIsRUFBMEJxSSxTQUExQixFQUFzQzs7QUFJdEMsTUFBSTNLLElBQUlzQyxPQUFPNEYsTUFBZjtBQUNBLE1BQUk2RCxVQUFVekosT0FBT3lKLE9BQXJCOztBQUVBOztBQUVBO0FBQ0EsV0FBU3BELE1BQVQsQ0FBaUJxRCxDQUFqQixFQUFvQkMsQ0FBcEIsRUFBd0I7QUFDdEIsU0FBTSxJQUFJQyxJQUFWLElBQWtCRCxDQUFsQixFQUFzQjtBQUNwQkQsUUFBR0UsSUFBSCxJQUFZRCxFQUFHQyxJQUFILENBQVo7QUFDRDtBQUNELFdBQU9GLENBQVA7QUFDRDs7QUFFRCxNQUFJRyxhQUFhaE0sTUFBTUMsU0FBTixDQUFnQkMsS0FBakM7O0FBRUE7QUFDQSxXQUFTK0wsU0FBVCxDQUFvQkMsR0FBcEIsRUFBMEI7QUFDeEIsUUFBS2xNLE1BQU1tTSxPQUFOLENBQWVELEdBQWYsQ0FBTCxFQUE0QjtBQUMxQjtBQUNBLGFBQU9BLEdBQVA7QUFDRDs7QUFFRCxRQUFJRSxjQUFjLFFBQU9GLEdBQVAseUNBQU9BLEdBQVAsTUFBYyxRQUFkLElBQTBCLE9BQU9BLElBQUlySyxNQUFYLElBQXFCLFFBQWpFO0FBQ0EsUUFBS3VLLFdBQUwsRUFBbUI7QUFDakI7QUFDQSxhQUFPSixXQUFXN0wsSUFBWCxDQUFpQitMLEdBQWpCLENBQVA7QUFDRDs7QUFFRDtBQUNBLFdBQU8sQ0FBRUEsR0FBRixDQUFQO0FBQ0Q7O0FBRUQ7O0FBRUE7Ozs7O0FBS0EsV0FBU0csWUFBVCxDQUF1QkMsSUFBdkIsRUFBNkJDLE9BQTdCLEVBQXNDQyxRQUF0QyxFQUFpRDtBQUMvQztBQUNBLFFBQUssRUFBRyxnQkFBZ0JILFlBQW5CLENBQUwsRUFBeUM7QUFDdkMsYUFBTyxJQUFJQSxZQUFKLENBQWtCQyxJQUFsQixFQUF3QkMsT0FBeEIsRUFBaUNDLFFBQWpDLENBQVA7QUFDRDtBQUNEO0FBQ0EsUUFBSUMsWUFBWUgsSUFBaEI7QUFDQSxRQUFLLE9BQU9BLElBQVAsSUFBZSxRQUFwQixFQUErQjtBQUM3Qkcsa0JBQVlyTSxTQUFTQyxnQkFBVCxDQUEyQmlNLElBQTNCLENBQVo7QUFDRDtBQUNEO0FBQ0EsUUFBSyxDQUFDRyxTQUFOLEVBQWtCO0FBQ2hCYixjQUFRYyxLQUFSLENBQWUsbUNBQW9DRCxhQUFhSCxJQUFqRCxDQUFmO0FBQ0E7QUFDRDs7QUFFRCxTQUFLSyxRQUFMLEdBQWdCVixVQUFXUSxTQUFYLENBQWhCO0FBQ0EsU0FBS0YsT0FBTCxHQUFlL0QsT0FBUSxFQUFSLEVBQVksS0FBSytELE9BQWpCLENBQWY7QUFDQTtBQUNBLFFBQUssT0FBT0EsT0FBUCxJQUFrQixVQUF2QixFQUFvQztBQUNsQ0MsaUJBQVdELE9BQVg7QUFDRCxLQUZELE1BRU87QUFDTC9ELGFBQVEsS0FBSytELE9BQWIsRUFBc0JBLE9BQXRCO0FBQ0Q7O0FBRUQsUUFBS0MsUUFBTCxFQUFnQjtBQUNkLFdBQUtoSSxFQUFMLENBQVMsUUFBVCxFQUFtQmdJLFFBQW5CO0FBQ0Q7O0FBRUQsU0FBS0ksU0FBTDs7QUFFQSxRQUFLL00sQ0FBTCxFQUFTO0FBQ1A7QUFDQSxXQUFLZ04sVUFBTCxHQUFrQixJQUFJaE4sRUFBRWlOLFFBQU4sRUFBbEI7QUFDRDs7QUFFRDtBQUNBakQsZUFBWSxLQUFLa0QsS0FBTCxDQUFXQyxJQUFYLENBQWlCLElBQWpCLENBQVo7QUFDRDs7QUFFRFgsZUFBYXBNLFNBQWIsR0FBeUIwQixPQUFPc0wsTUFBUCxDQUFlekMsVUFBVXZLLFNBQXpCLENBQXpCOztBQUVBb00sZUFBYXBNLFNBQWIsQ0FBdUJzTSxPQUF2QixHQUFpQyxFQUFqQzs7QUFFQUYsZUFBYXBNLFNBQWIsQ0FBdUIyTSxTQUF2QixHQUFtQyxZQUFXO0FBQzVDLFNBQUtNLE1BQUwsR0FBYyxFQUFkOztBQUVBO0FBQ0EsU0FBS1AsUUFBTCxDQUFjdkwsT0FBZCxDQUF1QixLQUFLK0wsZ0JBQTVCLEVBQThDLElBQTlDO0FBQ0QsR0FMRDs7QUFPQTs7O0FBR0FkLGVBQWFwTSxTQUFiLENBQXVCa04sZ0JBQXZCLEdBQTBDLFVBQVViLElBQVYsRUFBaUI7QUFDekQ7QUFDQSxRQUFLQSxLQUFLYyxRQUFMLElBQWlCLEtBQXRCLEVBQThCO0FBQzVCLFdBQUtDLFFBQUwsQ0FBZWYsSUFBZjtBQUNEO0FBQ0Q7QUFDQSxRQUFLLEtBQUtDLE9BQUwsQ0FBYWUsVUFBYixLQUE0QixJQUFqQyxFQUF3QztBQUN0QyxXQUFLQywwQkFBTCxDQUFpQ2pCLElBQWpDO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFFBQUk3TCxXQUFXNkwsS0FBSzdMLFFBQXBCO0FBQ0EsUUFBSyxDQUFDQSxRQUFELElBQWEsQ0FBQytNLGlCQUFrQi9NLFFBQWxCLENBQW5CLEVBQWtEO0FBQ2hEO0FBQ0Q7QUFDRCxRQUFJZ04sWUFBWW5CLEtBQUtqTSxnQkFBTCxDQUFzQixLQUF0QixDQUFoQjtBQUNBO0FBQ0EsU0FBTSxJQUFJa0wsSUFBRSxDQUFaLEVBQWVBLElBQUlrQyxVQUFVNUwsTUFBN0IsRUFBcUMwSixHQUFyQyxFQUEyQztBQUN6QyxVQUFJbUMsTUFBTUQsVUFBVWxDLENBQVYsQ0FBVjtBQUNBLFdBQUs4QixRQUFMLENBQWVLLEdBQWY7QUFDRDs7QUFFRDtBQUNBLFFBQUssT0FBTyxLQUFLbkIsT0FBTCxDQUFhZSxVQUFwQixJQUFrQyxRQUF2QyxFQUFrRDtBQUNoRCxVQUFJSyxXQUFXckIsS0FBS2pNLGdCQUFMLENBQXVCLEtBQUtrTSxPQUFMLENBQWFlLFVBQXBDLENBQWY7QUFDQSxXQUFNL0IsSUFBRSxDQUFSLEVBQVdBLElBQUlvQyxTQUFTOUwsTUFBeEIsRUFBZ0MwSixHQUFoQyxFQUFzQztBQUNwQyxZQUFJcUMsUUFBUUQsU0FBU3BDLENBQVQsQ0FBWjtBQUNBLGFBQUtnQywwQkFBTCxDQUFpQ0ssS0FBakM7QUFDRDtBQUNGO0FBQ0YsR0EvQkQ7O0FBaUNBLE1BQUlKLG1CQUFtQjtBQUNyQixPQUFHLElBRGtCO0FBRXJCLE9BQUcsSUFGa0I7QUFHckIsUUFBSTtBQUhpQixHQUF2Qjs7QUFNQW5CLGVBQWFwTSxTQUFiLENBQXVCc04sMEJBQXZCLEdBQW9ELFVBQVVqQixJQUFWLEVBQWlCO0FBQ25FLFFBQUlqRixRQUFRQyxpQkFBa0JnRixJQUFsQixDQUFaO0FBQ0EsUUFBSyxDQUFDakYsS0FBTixFQUFjO0FBQ1o7QUFDQTtBQUNEO0FBQ0Q7QUFDQSxRQUFJd0csUUFBUSx5QkFBWjtBQUNBLFFBQUlDLFVBQVVELE1BQU1FLElBQU4sQ0FBWTFHLE1BQU0yRyxlQUFsQixDQUFkO0FBQ0EsV0FBUUYsWUFBWSxJQUFwQixFQUEyQjtBQUN6QixVQUFJRyxNQUFNSCxXQUFXQSxRQUFRLENBQVIsQ0FBckI7QUFDQSxVQUFLRyxHQUFMLEVBQVc7QUFDVCxhQUFLQyxhQUFMLENBQW9CRCxHQUFwQixFQUF5QjNCLElBQXpCO0FBQ0Q7QUFDRHdCLGdCQUFVRCxNQUFNRSxJQUFOLENBQVkxRyxNQUFNMkcsZUFBbEIsQ0FBVjtBQUNEO0FBQ0YsR0FoQkQ7O0FBa0JBOzs7QUFHQTNCLGVBQWFwTSxTQUFiLENBQXVCb04sUUFBdkIsR0FBa0MsVUFBVUssR0FBVixFQUFnQjtBQUNoRCxRQUFJUyxlQUFlLElBQUlDLFlBQUosQ0FBa0JWLEdBQWxCLENBQW5CO0FBQ0EsU0FBS1IsTUFBTCxDQUFZekwsSUFBWixDQUFrQjBNLFlBQWxCO0FBQ0QsR0FIRDs7QUFLQTlCLGVBQWFwTSxTQUFiLENBQXVCaU8sYUFBdkIsR0FBdUMsVUFBVUQsR0FBVixFQUFlM0IsSUFBZixFQUFzQjtBQUMzRCxRQUFJZ0IsYUFBYSxJQUFJZSxVQUFKLENBQWdCSixHQUFoQixFQUFxQjNCLElBQXJCLENBQWpCO0FBQ0EsU0FBS1ksTUFBTCxDQUFZekwsSUFBWixDQUFrQjZMLFVBQWxCO0FBQ0QsR0FIRDs7QUFLQWpCLGVBQWFwTSxTQUFiLENBQXVCOE0sS0FBdkIsR0FBK0IsWUFBVztBQUN4QyxRQUFJdUIsUUFBUSxJQUFaO0FBQ0EsU0FBS0MsZUFBTCxHQUF1QixDQUF2QjtBQUNBLFNBQUtDLFlBQUwsR0FBb0IsS0FBcEI7QUFDQTtBQUNBLFFBQUssQ0FBQyxLQUFLdEIsTUFBTCxDQUFZckwsTUFBbEIsRUFBMkI7QUFDekIsV0FBSzRNLFFBQUw7QUFDQTtBQUNEOztBQUVELGFBQVNDLFVBQVQsQ0FBcUJDLEtBQXJCLEVBQTRCckMsSUFBNUIsRUFBa0NzQyxPQUFsQyxFQUE0QztBQUMxQztBQUNBL0UsaUJBQVksWUFBVztBQUNyQnlFLGNBQU1PLFFBQU4sQ0FBZ0JGLEtBQWhCLEVBQXVCckMsSUFBdkIsRUFBNkJzQyxPQUE3QjtBQUNELE9BRkQ7QUFHRDs7QUFFRCxTQUFLMUIsTUFBTCxDQUFZOUwsT0FBWixDQUFxQixVQUFVK00sWUFBVixFQUF5QjtBQUM1Q0EsbUJBQWFuRCxJQUFiLENBQW1CLFVBQW5CLEVBQStCMEQsVUFBL0I7QUFDQVAsbUJBQWFwQixLQUFiO0FBQ0QsS0FIRDtBQUlELEdBckJEOztBQXVCQVYsZUFBYXBNLFNBQWIsQ0FBdUI0TyxRQUF2QixHQUFrQyxVQUFVRixLQUFWLEVBQWlCckMsSUFBakIsRUFBdUJzQyxPQUF2QixFQUFpQztBQUNqRSxTQUFLTCxlQUFMO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQixLQUFLQSxZQUFMLElBQXFCLENBQUNHLE1BQU1HLFFBQWhEO0FBQ0E7QUFDQSxTQUFLekQsU0FBTCxDQUFnQixVQUFoQixFQUE0QixDQUFFLElBQUYsRUFBUXNELEtBQVIsRUFBZXJDLElBQWYsQ0FBNUI7QUFDQSxRQUFLLEtBQUtPLFVBQUwsSUFBbUIsS0FBS0EsVUFBTCxDQUFnQmtDLE1BQXhDLEVBQWlEO0FBQy9DLFdBQUtsQyxVQUFMLENBQWdCa0MsTUFBaEIsQ0FBd0IsSUFBeEIsRUFBOEJKLEtBQTlCO0FBQ0Q7QUFDRDtBQUNBLFFBQUssS0FBS0osZUFBTCxJQUF3QixLQUFLckIsTUFBTCxDQUFZckwsTUFBekMsRUFBa0Q7QUFDaEQsV0FBSzRNLFFBQUw7QUFDRDs7QUFFRCxRQUFLLEtBQUtsQyxPQUFMLENBQWF5QyxLQUFiLElBQXNCcEQsT0FBM0IsRUFBcUM7QUFDbkNBLGNBQVFxRCxHQUFSLENBQWEsZUFBZUwsT0FBNUIsRUFBcUNELEtBQXJDLEVBQTRDckMsSUFBNUM7QUFDRDtBQUNGLEdBaEJEOztBQWtCQUQsZUFBYXBNLFNBQWIsQ0FBdUJ3TyxRQUF2QixHQUFrQyxZQUFXO0FBQzNDLFFBQUkvRCxZQUFZLEtBQUs4RCxZQUFMLEdBQW9CLE1BQXBCLEdBQTZCLE1BQTdDO0FBQ0EsU0FBS1UsVUFBTCxHQUFrQixJQUFsQjtBQUNBLFNBQUs3RCxTQUFMLENBQWdCWCxTQUFoQixFQUEyQixDQUFFLElBQUYsQ0FBM0I7QUFDQSxTQUFLVyxTQUFMLENBQWdCLFFBQWhCLEVBQTBCLENBQUUsSUFBRixDQUExQjtBQUNBLFFBQUssS0FBS3dCLFVBQVYsRUFBdUI7QUFDckIsVUFBSXNDLFdBQVcsS0FBS1gsWUFBTCxHQUFvQixRQUFwQixHQUErQixTQUE5QztBQUNBLFdBQUszQixVQUFMLENBQWlCc0MsUUFBakIsRUFBNkIsSUFBN0I7QUFDRDtBQUNGLEdBVEQ7O0FBV0E7O0FBRUEsV0FBU2YsWUFBVCxDQUF1QlYsR0FBdkIsRUFBNkI7QUFDM0IsU0FBS0EsR0FBTCxHQUFXQSxHQUFYO0FBQ0Q7O0FBRURVLGVBQWFuTyxTQUFiLEdBQXlCMEIsT0FBT3NMLE1BQVAsQ0FBZXpDLFVBQVV2SyxTQUF6QixDQUF6Qjs7QUFFQW1PLGVBQWFuTyxTQUFiLENBQXVCOE0sS0FBdkIsR0FBK0IsWUFBVztBQUN4QztBQUNBO0FBQ0EsUUFBSW1DLGFBQWEsS0FBS0Usa0JBQUwsRUFBakI7QUFDQSxRQUFLRixVQUFMLEVBQWtCO0FBQ2hCO0FBQ0EsV0FBS0csT0FBTCxDQUFjLEtBQUszQixHQUFMLENBQVM0QixZQUFULEtBQTBCLENBQXhDLEVBQTJDLGNBQTNDO0FBQ0E7QUFDRDs7QUFFRDtBQUNBLFNBQUtDLFVBQUwsR0FBa0IsSUFBSUMsS0FBSixFQUFsQjtBQUNBLFNBQUtELFVBQUwsQ0FBZ0J2TixnQkFBaEIsQ0FBa0MsTUFBbEMsRUFBMEMsSUFBMUM7QUFDQSxTQUFLdU4sVUFBTCxDQUFnQnZOLGdCQUFoQixDQUFrQyxPQUFsQyxFQUEyQyxJQUEzQztBQUNBO0FBQ0EsU0FBSzBMLEdBQUwsQ0FBUzFMLGdCQUFULENBQTJCLE1BQTNCLEVBQW1DLElBQW5DO0FBQ0EsU0FBSzBMLEdBQUwsQ0FBUzFMLGdCQUFULENBQTJCLE9BQTNCLEVBQW9DLElBQXBDO0FBQ0EsU0FBS3VOLFVBQUwsQ0FBZ0JFLEdBQWhCLEdBQXNCLEtBQUsvQixHQUFMLENBQVMrQixHQUEvQjtBQUNELEdBbEJEOztBQW9CQXJCLGVBQWFuTyxTQUFiLENBQXVCbVAsa0JBQXZCLEdBQTRDLFlBQVc7QUFDckQ7QUFDQTtBQUNBLFdBQU8sS0FBSzFCLEdBQUwsQ0FBU2UsUUFBVCxJQUFxQixLQUFLZixHQUFMLENBQVM0QixZQUFyQztBQUNELEdBSkQ7O0FBTUFsQixlQUFhbk8sU0FBYixDQUF1Qm9QLE9BQXZCLEdBQWlDLFVBQVVQLFFBQVYsRUFBb0JGLE9BQXBCLEVBQThCO0FBQzdELFNBQUtFLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsU0FBS3pELFNBQUwsQ0FBZ0IsVUFBaEIsRUFBNEIsQ0FBRSxJQUFGLEVBQVEsS0FBS3FDLEdBQWIsRUFBa0JrQixPQUFsQixDQUE1QjtBQUNELEdBSEQ7O0FBS0E7O0FBRUE7QUFDQVIsZUFBYW5PLFNBQWIsQ0FBdUJ5UCxXQUF2QixHQUFxQyxVQUFVek4sS0FBVixFQUFrQjtBQUNyRCxRQUFJME4sU0FBUyxPQUFPMU4sTUFBTWdJLElBQTFCO0FBQ0EsUUFBSyxLQUFNMEYsTUFBTixDQUFMLEVBQXNCO0FBQ3BCLFdBQU1BLE1BQU4sRUFBZ0IxTixLQUFoQjtBQUNEO0FBQ0YsR0FMRDs7QUFPQW1NLGVBQWFuTyxTQUFiLENBQXVCMlAsTUFBdkIsR0FBZ0MsWUFBVztBQUN6QyxTQUFLUCxPQUFMLENBQWMsSUFBZCxFQUFvQixRQUFwQjtBQUNBLFNBQUtRLFlBQUw7QUFDRCxHQUhEOztBQUtBekIsZUFBYW5PLFNBQWIsQ0FBdUI2UCxPQUF2QixHQUFpQyxZQUFXO0FBQzFDLFNBQUtULE9BQUwsQ0FBYyxLQUFkLEVBQXFCLFNBQXJCO0FBQ0EsU0FBS1EsWUFBTDtBQUNELEdBSEQ7O0FBS0F6QixlQUFhbk8sU0FBYixDQUF1QjRQLFlBQXZCLEdBQXNDLFlBQVc7QUFDL0MsU0FBS04sVUFBTCxDQUFnQlEsbUJBQWhCLENBQXFDLE1BQXJDLEVBQTZDLElBQTdDO0FBQ0EsU0FBS1IsVUFBTCxDQUFnQlEsbUJBQWhCLENBQXFDLE9BQXJDLEVBQThDLElBQTlDO0FBQ0EsU0FBS3JDLEdBQUwsQ0FBU3FDLG1CQUFULENBQThCLE1BQTlCLEVBQXNDLElBQXRDO0FBQ0EsU0FBS3JDLEdBQUwsQ0FBU3FDLG1CQUFULENBQThCLE9BQTlCLEVBQXVDLElBQXZDO0FBQ0QsR0FMRDs7QUFPQTs7QUFFQSxXQUFTMUIsVUFBVCxDQUFxQkosR0FBckIsRUFBMEIxTixPQUExQixFQUFvQztBQUNsQyxTQUFLME4sR0FBTCxHQUFXQSxHQUFYO0FBQ0EsU0FBSzFOLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUttTixHQUFMLEdBQVcsSUFBSThCLEtBQUosRUFBWDtBQUNEOztBQUVEO0FBQ0FuQixhQUFXcE8sU0FBWCxHQUF1QjBCLE9BQU9zTCxNQUFQLENBQWVtQixhQUFhbk8sU0FBNUIsQ0FBdkI7O0FBRUFvTyxhQUFXcE8sU0FBWCxDQUFxQjhNLEtBQXJCLEdBQTZCLFlBQVc7QUFDdEMsU0FBS1csR0FBTCxDQUFTMUwsZ0JBQVQsQ0FBMkIsTUFBM0IsRUFBbUMsSUFBbkM7QUFDQSxTQUFLMEwsR0FBTCxDQUFTMUwsZ0JBQVQsQ0FBMkIsT0FBM0IsRUFBb0MsSUFBcEM7QUFDQSxTQUFLMEwsR0FBTCxDQUFTK0IsR0FBVCxHQUFlLEtBQUt4QixHQUFwQjtBQUNBO0FBQ0EsUUFBSWlCLGFBQWEsS0FBS0Usa0JBQUwsRUFBakI7QUFDQSxRQUFLRixVQUFMLEVBQWtCO0FBQ2hCLFdBQUtHLE9BQUwsQ0FBYyxLQUFLM0IsR0FBTCxDQUFTNEIsWUFBVCxLQUEwQixDQUF4QyxFQUEyQyxjQUEzQztBQUNBLFdBQUtPLFlBQUw7QUFDRDtBQUNGLEdBVkQ7O0FBWUF4QixhQUFXcE8sU0FBWCxDQUFxQjRQLFlBQXJCLEdBQW9DLFlBQVc7QUFDN0MsU0FBS25DLEdBQUwsQ0FBU3FDLG1CQUFULENBQThCLE1BQTlCLEVBQXNDLElBQXRDO0FBQ0EsU0FBS3JDLEdBQUwsQ0FBU3FDLG1CQUFULENBQThCLE9BQTlCLEVBQXVDLElBQXZDO0FBQ0QsR0FIRDs7QUFLQTFCLGFBQVdwTyxTQUFYLENBQXFCb1AsT0FBckIsR0FBK0IsVUFBVVAsUUFBVixFQUFvQkYsT0FBcEIsRUFBOEI7QUFDM0QsU0FBS0UsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLekQsU0FBTCxDQUFnQixVQUFoQixFQUE0QixDQUFFLElBQUYsRUFBUSxLQUFLOUssT0FBYixFQUFzQnFPLE9BQXRCLENBQTVCO0FBQ0QsR0FIRDs7QUFLQTs7QUFFQXZDLGVBQWEyRCxnQkFBYixHQUFnQyxVQUFVakksTUFBVixFQUFtQjtBQUNqREEsYUFBU0EsVUFBVTVGLE9BQU80RixNQUExQjtBQUNBLFFBQUssQ0FBQ0EsTUFBTixFQUFlO0FBQ2I7QUFDRDtBQUNEO0FBQ0FsSSxRQUFJa0ksTUFBSjtBQUNBO0FBQ0FsSSxNQUFFbUksRUFBRixDQUFLMkQsWUFBTCxHQUFvQixVQUFVWSxPQUFWLEVBQW1CMEQsUUFBbkIsRUFBOEI7QUFDaEQsVUFBSUMsV0FBVyxJQUFJN0QsWUFBSixDQUFrQixJQUFsQixFQUF3QkUsT0FBeEIsRUFBaUMwRCxRQUFqQyxDQUFmO0FBQ0EsYUFBT0MsU0FBU3JELFVBQVQsQ0FBb0JzRCxPQUFwQixDQUE2QnRRLEVBQUUsSUFBRixDQUE3QixDQUFQO0FBQ0QsS0FIRDtBQUlELEdBWkQ7QUFhQTtBQUNBd00sZUFBYTJELGdCQUFiOztBQUVBOztBQUVBLFNBQU8zRCxZQUFQO0FBRUMsQ0FsWEQ7Ozs7O0FDN0hBOzs7Ozs7QUFNQSxDQUFDLENBQUMsVUFBU2xDLE9BQVQsRUFBa0I7QUFBRTtBQUNsQjs7QUFDQSxRQUFJLE9BQU9DLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0NBLE9BQU9DLEdBQTNDLEVBQWdEO0FBQzVDO0FBQ0FELGVBQU8sQ0FBQyxRQUFELENBQVAsRUFBbUJELE9BQW5CO0FBQ0gsS0FIRCxNQUdPLElBQUksT0FBT0csTUFBUCxLQUFrQixXQUFsQixJQUFpQ0EsT0FBT0MsT0FBNUMsRUFBcUQ7QUFDeEQ7QUFDQUQsZUFBT0MsT0FBUCxHQUFpQkosUUFBUXVCLFFBQVEsUUFBUixDQUFSLENBQWpCO0FBQ0gsS0FITSxNQUdBO0FBQ0g7QUFDQXZCLGdCQUFRcEMsTUFBUjtBQUNIO0FBQ0osQ0FaQSxFQVlFLFVBQVNsSSxDQUFULEVBQVk7QUFDWDs7OztBQUlBLFFBQUl1USx1QkFBdUIsQ0FBQyxDQUE1QjtBQUFBLFFBQ0lDLGlCQUFpQixDQUFDLENBRHRCOztBQUdBOzs7OztBQUtBLFFBQUlDLFNBQVMsU0FBVEEsTUFBUyxDQUFTdE4sS0FBVCxFQUFnQjtBQUN6QjtBQUNBLGVBQU91TixXQUFXdk4sS0FBWCxLQUFxQixDQUE1QjtBQUNILEtBSEQ7O0FBS0E7Ozs7OztBQU1BLFFBQUl3TixRQUFRLFNBQVJBLEtBQVEsQ0FBUzdELFFBQVQsRUFBbUI7QUFDM0IsWUFBSThELFlBQVksQ0FBaEI7QUFBQSxZQUNJQyxZQUFZN1EsRUFBRThNLFFBQUYsQ0FEaEI7QUFBQSxZQUVJZ0UsVUFBVSxJQUZkO0FBQUEsWUFHSUMsT0FBTyxFQUhYOztBQUtBO0FBQ0FGLGtCQUFVN04sSUFBVixDQUFlLFlBQVU7QUFDckIsZ0JBQUlnTyxRQUFRaFIsRUFBRSxJQUFGLENBQVo7QUFBQSxnQkFDSWlSLE1BQU1ELE1BQU1FLE1BQU4sR0FBZUQsR0FBZixHQUFxQlIsT0FBT08sTUFBTUcsR0FBTixDQUFVLFlBQVYsQ0FBUCxDQUQvQjtBQUFBLGdCQUVJQyxVQUFVTCxLQUFLL08sTUFBTCxHQUFjLENBQWQsR0FBa0IrTyxLQUFLQSxLQUFLL08sTUFBTCxHQUFjLENBQW5CLENBQWxCLEdBQTBDLElBRnhEOztBQUlBLGdCQUFJb1AsWUFBWSxJQUFoQixFQUFzQjtBQUNsQjtBQUNBTCxxQkFBS25QLElBQUwsQ0FBVW9QLEtBQVY7QUFDSCxhQUhELE1BR087QUFDSDtBQUNBLG9CQUFJckgsS0FBSzBILEtBQUwsQ0FBVzFILEtBQUtDLEdBQUwsQ0FBU2tILFVBQVVHLEdBQW5CLENBQVgsS0FBdUNMLFNBQTNDLEVBQXNEO0FBQ2xERyx5QkFBS0EsS0FBSy9PLE1BQUwsR0FBYyxDQUFuQixJQUF3Qm9QLFFBQVFFLEdBQVIsQ0FBWU4sS0FBWixDQUF4QjtBQUNILGlCQUZELE1BRU87QUFDSDtBQUNBRCx5QkFBS25QLElBQUwsQ0FBVW9QLEtBQVY7QUFDSDtBQUNKOztBQUVEO0FBQ0FGLHNCQUFVRyxHQUFWO0FBQ0gsU0FwQkQ7O0FBc0JBLGVBQU9GLElBQVA7QUFDSCxLQTlCRDs7QUFnQ0E7Ozs7O0FBS0EsUUFBSVEsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFTN0UsT0FBVCxFQUFrQjtBQUNsQyxZQUFJOEUsT0FBTztBQUNQQyxtQkFBTyxJQURBO0FBRVBDLHNCQUFVLFFBRkg7QUFHUHpRLG9CQUFRLElBSEQ7QUFJUDBRLG9CQUFRO0FBSkQsU0FBWDs7QUFPQSxZQUFJLFFBQU9qRixPQUFQLHlDQUFPQSxPQUFQLE9BQW1CLFFBQXZCLEVBQWlDO0FBQzdCLG1CQUFPMU0sRUFBRTJJLE1BQUYsQ0FBUzZJLElBQVQsRUFBZTlFLE9BQWYsQ0FBUDtBQUNIOztBQUVELFlBQUksT0FBT0EsT0FBUCxLQUFtQixTQUF2QixFQUFrQztBQUM5QjhFLGlCQUFLQyxLQUFMLEdBQWEvRSxPQUFiO0FBQ0gsU0FGRCxNQUVPLElBQUlBLFlBQVksUUFBaEIsRUFBMEI7QUFDN0I4RSxpQkFBS0csTUFBTCxHQUFjLElBQWQ7QUFDSDs7QUFFRCxlQUFPSCxJQUFQO0FBQ0gsS0FuQkQ7O0FBcUJBOzs7OztBQUtBLFFBQUlJLGNBQWM1UixFQUFFbUksRUFBRixDQUFLeUosV0FBTCxHQUFtQixVQUFTbEYsT0FBVCxFQUFrQjtBQUNuRCxZQUFJOEUsT0FBT0QsY0FBYzdFLE9BQWQsQ0FBWDs7QUFFQTtBQUNBLFlBQUk4RSxLQUFLRyxNQUFULEVBQWlCO0FBQ2IsZ0JBQUlFLE9BQU8sSUFBWDs7QUFFQTtBQUNBLGlCQUFLVixHQUFMLENBQVNLLEtBQUtFLFFBQWQsRUFBd0IsRUFBeEI7O0FBRUE7QUFDQTFSLGNBQUVnRCxJQUFGLENBQU80TyxZQUFZRSxPQUFuQixFQUE0QixVQUFTNU8sR0FBVCxFQUFjRCxLQUFkLEVBQXFCO0FBQzdDQSxzQkFBTTZKLFFBQU4sR0FBaUI3SixNQUFNNkosUUFBTixDQUFlaUYsR0FBZixDQUFtQkYsSUFBbkIsQ0FBakI7QUFDSCxhQUZEOztBQUlBOztBQUVBLG1CQUFPLElBQVA7QUFDSDs7QUFFRCxZQUFJLEtBQUs3UCxNQUFMLElBQWUsQ0FBZixJQUFvQixDQUFDd1AsS0FBS3ZRLE1BQTlCLEVBQXNDO0FBQ2xDLG1CQUFPLElBQVA7QUFDSDs7QUFFRDtBQUNBMlEsb0JBQVlFLE9BQVosQ0FBb0JsUSxJQUFwQixDQUF5QjtBQUNyQmtMLHNCQUFVLElBRFc7QUFFckJKLHFCQUFTOEU7QUFGWSxTQUF6Qjs7QUFLQTtBQUNBSSxvQkFBWUksTUFBWixDQUFtQixJQUFuQixFQUF5QlIsSUFBekI7O0FBRUEsZUFBTyxJQUFQO0FBQ0gsS0FsQ0Q7O0FBb0NBOzs7O0FBSUFJLGdCQUFZSyxPQUFaLEdBQXNCLFFBQXRCO0FBQ0FMLGdCQUFZRSxPQUFaLEdBQXNCLEVBQXRCO0FBQ0FGLGdCQUFZTSxTQUFaLEdBQXdCLEVBQXhCO0FBQ0FOLGdCQUFZTyxlQUFaLEdBQThCLEtBQTlCO0FBQ0FQLGdCQUFZUSxhQUFaLEdBQTRCLElBQTVCO0FBQ0FSLGdCQUFZUyxZQUFaLEdBQTJCLElBQTNCO0FBQ0FULGdCQUFZakIsS0FBWixHQUFvQkEsS0FBcEI7QUFDQWlCLGdCQUFZbkIsTUFBWixHQUFxQkEsTUFBckI7QUFDQW1CLGdCQUFZTCxhQUFaLEdBQTRCQSxhQUE1Qjs7QUFFQTs7Ozs7QUFLQUssZ0JBQVlJLE1BQVosR0FBcUIsVUFBU2xGLFFBQVQsRUFBbUJKLE9BQW5CLEVBQTRCO0FBQzdDLFlBQUk4RSxPQUFPRCxjQUFjN0UsT0FBZCxDQUFYO0FBQUEsWUFDSW1FLFlBQVk3USxFQUFFOE0sUUFBRixDQURoQjtBQUFBLFlBRUlpRSxPQUFPLENBQUNGLFNBQUQsQ0FGWDs7QUFJQTtBQUNBLFlBQUl5QixZQUFZdFMsRUFBRXNDLE1BQUYsRUFBVWdRLFNBQVYsRUFBaEI7QUFBQSxZQUNJQyxhQUFhdlMsRUFBRSxNQUFGLEVBQVV3UyxXQUFWLENBQXNCLElBQXRCLENBRGpCOztBQUdBO0FBQ0EsWUFBSUMsaUJBQWlCNUIsVUFBVTZCLE9BQVYsR0FBb0J4TSxNQUFwQixDQUEyQixTQUEzQixDQUFyQjs7QUFFQTtBQUNBdU0sdUJBQWV6UCxJQUFmLENBQW9CLFlBQVc7QUFDM0IsZ0JBQUlnTyxRQUFRaFIsRUFBRSxJQUFGLENBQVo7QUFDQWdSLGtCQUFNMkIsSUFBTixDQUFXLGFBQVgsRUFBMEIzQixNQUFNekwsSUFBTixDQUFXLE9BQVgsQ0FBMUI7QUFDSCxTQUhEOztBQUtBO0FBQ0FrTix1QkFBZXRCLEdBQWYsQ0FBbUIsU0FBbkIsRUFBOEIsT0FBOUI7O0FBRUE7QUFDQSxZQUFJSyxLQUFLQyxLQUFMLElBQWMsQ0FBQ0QsS0FBS3ZRLE1BQXhCLEVBQWdDOztBQUU1QjtBQUNBNFAsc0JBQVU3TixJQUFWLENBQWUsWUFBVztBQUN0QixvQkFBSWdPLFFBQVFoUixFQUFFLElBQUYsQ0FBWjtBQUFBLG9CQUNJNFMsVUFBVTVCLE1BQU1HLEdBQU4sQ0FBVSxTQUFWLENBRGQ7O0FBR0E7QUFDQSxvQkFBSXlCLFlBQVksY0FBWixJQUE4QkEsWUFBWSxNQUExQyxJQUFvREEsWUFBWSxhQUFwRSxFQUFtRjtBQUMvRUEsOEJBQVUsT0FBVjtBQUNIOztBQUVEO0FBQ0E1QixzQkFBTTJCLElBQU4sQ0FBVyxhQUFYLEVBQTBCM0IsTUFBTXpMLElBQU4sQ0FBVyxPQUFYLENBQTFCOztBQUVBeUwsc0JBQU1HLEdBQU4sQ0FBVTtBQUNOLCtCQUFXeUIsT0FETDtBQUVOLG1DQUFlLEdBRlQ7QUFHTixzQ0FBa0IsR0FIWjtBQUlOLGtDQUFjLEdBSlI7QUFLTixxQ0FBaUIsR0FMWDtBQU1OLHdDQUFvQixHQU5kO0FBT04sMkNBQXVCLEdBUGpCO0FBUU4sOEJBQVUsT0FSSjtBQVNOLGdDQUFZO0FBVE4saUJBQVY7QUFXSCxhQXZCRDs7QUF5QkE7QUFDQTdCLG1CQUFPSixNQUFNRSxTQUFOLENBQVA7O0FBRUE7QUFDQUEsc0JBQVU3TixJQUFWLENBQWUsWUFBVztBQUN0QixvQkFBSWdPLFFBQVFoUixFQUFFLElBQUYsQ0FBWjtBQUNBZ1Isc0JBQU16TCxJQUFOLENBQVcsT0FBWCxFQUFvQnlMLE1BQU0yQixJQUFOLENBQVcsYUFBWCxLQUE2QixFQUFqRDtBQUNILGFBSEQ7QUFJSDs7QUFFRDNTLFVBQUVnRCxJQUFGLENBQU8rTixJQUFQLEVBQWEsVUFBUzdOLEdBQVQsRUFBYzJQLEdBQWQsRUFBbUI7QUFDNUIsZ0JBQUlDLE9BQU85UyxFQUFFNlMsR0FBRixDQUFYO0FBQUEsZ0JBQ0lFLGVBQWUsQ0FEbkI7O0FBR0EsZ0JBQUksQ0FBQ3ZCLEtBQUt2USxNQUFWLEVBQWtCO0FBQ2Q7QUFDQSxvQkFBSXVRLEtBQUtDLEtBQUwsSUFBY3FCLEtBQUs5USxNQUFMLElBQWUsQ0FBakMsRUFBb0M7QUFDaEM4USx5QkFBSzNCLEdBQUwsQ0FBU0ssS0FBS0UsUUFBZCxFQUF3QixFQUF4QjtBQUNBO0FBQ0g7O0FBRUQ7QUFDQW9CLHFCQUFLOVAsSUFBTCxDQUFVLFlBQVU7QUFDaEIsd0JBQUlnTyxRQUFRaFIsRUFBRSxJQUFGLENBQVo7QUFBQSx3QkFDSXdILFFBQVF3SixNQUFNekwsSUFBTixDQUFXLE9BQVgsQ0FEWjtBQUFBLHdCQUVJcU4sVUFBVTVCLE1BQU1HLEdBQU4sQ0FBVSxTQUFWLENBRmQ7O0FBSUE7QUFDQSx3QkFBSXlCLFlBQVksY0FBWixJQUE4QkEsWUFBWSxNQUExQyxJQUFvREEsWUFBWSxhQUFwRSxFQUFtRjtBQUMvRUEsa0NBQVUsT0FBVjtBQUNIOztBQUVEO0FBQ0Esd0JBQUl6QixNQUFNLEVBQUUsV0FBV3lCLE9BQWIsRUFBVjtBQUNBekIsd0JBQUlLLEtBQUtFLFFBQVQsSUFBcUIsRUFBckI7QUFDQVYsMEJBQU1HLEdBQU4sQ0FBVUEsR0FBVjs7QUFFQTtBQUNBLHdCQUFJSCxNQUFNd0IsV0FBTixDQUFrQixLQUFsQixJQUEyQk8sWUFBL0IsRUFBNkM7QUFDekNBLHVDQUFlL0IsTUFBTXdCLFdBQU4sQ0FBa0IsS0FBbEIsQ0FBZjtBQUNIOztBQUVEO0FBQ0Esd0JBQUloTCxLQUFKLEVBQVc7QUFDUHdKLDhCQUFNekwsSUFBTixDQUFXLE9BQVgsRUFBb0JpQyxLQUFwQjtBQUNILHFCQUZELE1BRU87QUFDSHdKLDhCQUFNRyxHQUFOLENBQVUsU0FBVixFQUFxQixFQUFyQjtBQUNIO0FBQ0osaUJBMUJEO0FBMkJILGFBbkNELE1BbUNPO0FBQ0g7QUFDQTRCLCtCQUFldkIsS0FBS3ZRLE1BQUwsQ0FBWXVSLFdBQVosQ0FBd0IsS0FBeEIsQ0FBZjtBQUNIOztBQUVEO0FBQ0FNLGlCQUFLOVAsSUFBTCxDQUFVLFlBQVU7QUFDaEIsb0JBQUlnTyxRQUFRaFIsRUFBRSxJQUFGLENBQVo7QUFBQSxvQkFDSWdULGtCQUFrQixDQUR0Qjs7QUFHQTtBQUNBLG9CQUFJeEIsS0FBS3ZRLE1BQUwsSUFBZStQLE1BQU1pQyxFQUFOLENBQVN6QixLQUFLdlEsTUFBZCxDQUFuQixFQUEwQztBQUN0QztBQUNIOztBQUVEO0FBQ0Esb0JBQUkrUCxNQUFNRyxHQUFOLENBQVUsWUFBVixNQUE0QixZQUFoQyxFQUE4QztBQUMxQzZCLHVDQUFtQnZDLE9BQU9PLE1BQU1HLEdBQU4sQ0FBVSxrQkFBVixDQUFQLElBQXdDVixPQUFPTyxNQUFNRyxHQUFOLENBQVUscUJBQVYsQ0FBUCxDQUEzRDtBQUNBNkIsdUNBQW1CdkMsT0FBT08sTUFBTUcsR0FBTixDQUFVLGFBQVYsQ0FBUCxJQUFtQ1YsT0FBT08sTUFBTUcsR0FBTixDQUFVLGdCQUFWLENBQVAsQ0FBdEQ7QUFDSDs7QUFFRDtBQUNBSCxzQkFBTUcsR0FBTixDQUFVSyxLQUFLRSxRQUFmLEVBQTBCcUIsZUFBZUMsZUFBaEIsR0FBbUMsSUFBNUQ7QUFDSCxhQWpCRDtBQWtCSCxTQS9ERDs7QUFpRUE7QUFDQVAsdUJBQWV6UCxJQUFmLENBQW9CLFlBQVc7QUFDM0IsZ0JBQUlnTyxRQUFRaFIsRUFBRSxJQUFGLENBQVo7QUFDQWdSLGtCQUFNekwsSUFBTixDQUFXLE9BQVgsRUFBb0J5TCxNQUFNMkIsSUFBTixDQUFXLGFBQVgsS0FBNkIsSUFBakQ7QUFDSCxTQUhEOztBQUtBO0FBQ0EsWUFBSWYsWUFBWU8sZUFBaEIsRUFBaUM7QUFDN0JuUyxjQUFFc0MsTUFBRixFQUFVZ1EsU0FBVixDQUFxQkEsWUFBWUMsVUFBYixHQUEyQnZTLEVBQUUsTUFBRixFQUFVd1MsV0FBVixDQUFzQixJQUF0QixDQUEvQztBQUNIOztBQUVELGVBQU8sSUFBUDtBQUNILEtBeklEOztBQTJJQTs7Ozs7QUFLQVosZ0JBQVlzQixhQUFaLEdBQTRCLFlBQVc7QUFDbkMsWUFBSUMsU0FBUyxFQUFiOztBQUVBO0FBQ0FuVCxVQUFFLGdDQUFGLEVBQW9DZ0QsSUFBcEMsQ0FBeUMsWUFBVztBQUNoRCxnQkFBSTRDLFFBQVE1RixFQUFFLElBQUYsQ0FBWjtBQUFBLGdCQUNJb1QsVUFBVXhOLE1BQU1MLElBQU4sQ0FBVyxTQUFYLEtBQXlCSyxNQUFNTCxJQUFOLENBQVcsbUJBQVgsQ0FEdkM7O0FBR0EsZ0JBQUk2TixXQUFXRCxNQUFmLEVBQXVCO0FBQ25CQSx1QkFBT0MsT0FBUCxJQUFrQkQsT0FBT0MsT0FBUCxFQUFnQjlCLEdBQWhCLENBQW9CMUwsS0FBcEIsQ0FBbEI7QUFDSCxhQUZELE1BRU87QUFDSHVOLHVCQUFPQyxPQUFQLElBQWtCeE4sS0FBbEI7QUFDSDtBQUNKLFNBVEQ7O0FBV0E7QUFDQTVGLFVBQUVnRCxJQUFGLENBQU9tUSxNQUFQLEVBQWUsWUFBVztBQUN0QixpQkFBS3ZCLFdBQUwsQ0FBaUIsSUFBakI7QUFDSCxTQUZEO0FBR0gsS0FuQkQ7O0FBcUJBOzs7OztBQUtBLFFBQUl5QixVQUFVLFNBQVZBLE9BQVUsQ0FBU2pSLEtBQVQsRUFBZ0I7QUFDMUIsWUFBSXdQLFlBQVlRLGFBQWhCLEVBQStCO0FBQzNCUix3QkFBWVEsYUFBWixDQUEwQmhRLEtBQTFCLEVBQWlDd1AsWUFBWUUsT0FBN0M7QUFDSDs7QUFFRDlSLFVBQUVnRCxJQUFGLENBQU80TyxZQUFZRSxPQUFuQixFQUE0QixZQUFXO0FBQ25DRix3QkFBWUksTUFBWixDQUFtQixLQUFLbEYsUUFBeEIsRUFBa0MsS0FBS0osT0FBdkM7QUFDSCxTQUZEOztBQUlBLFlBQUlrRixZQUFZUyxZQUFoQixFQUE4QjtBQUMxQlQsd0JBQVlTLFlBQVosQ0FBeUJqUSxLQUF6QixFQUFnQ3dQLFlBQVlFLE9BQTVDO0FBQ0g7QUFDSixLQVpEOztBQWNBRixnQkFBWXlCLE9BQVosR0FBc0IsVUFBU0MsUUFBVCxFQUFtQmxSLEtBQW5CLEVBQTBCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBLFlBQUlBLFNBQVNBLE1BQU1nSSxJQUFOLEtBQWUsUUFBNUIsRUFBc0M7QUFDbEMsZ0JBQUltSixjQUFjdlQsRUFBRXNDLE1BQUYsRUFBVWtSLEtBQVYsRUFBbEI7QUFDQSxnQkFBSUQsZ0JBQWdCaEQsb0JBQXBCLEVBQTBDO0FBQ3RDO0FBQ0g7QUFDREEsbUNBQXVCZ0QsV0FBdkI7QUFDSDs7QUFFRDtBQUNBLFlBQUksQ0FBQ0QsUUFBTCxFQUFlO0FBQ1hELG9CQUFRalIsS0FBUjtBQUNILFNBRkQsTUFFTyxJQUFJb08sbUJBQW1CLENBQUMsQ0FBeEIsRUFBMkI7QUFDOUJBLDZCQUFpQnhHLFdBQVcsWUFBVztBQUNuQ3FKLHdCQUFRalIsS0FBUjtBQUNBb08saUNBQWlCLENBQUMsQ0FBbEI7QUFDSCxhQUhnQixFQUdkb0IsWUFBWU0sU0FIRSxDQUFqQjtBQUlIO0FBQ0osS0FyQkQ7O0FBdUJBOzs7O0FBSUE7QUFDQWxTLE1BQUU0UixZQUFZc0IsYUFBZDs7QUFFQTtBQUNBLFFBQUl2TyxLQUFLM0UsRUFBRW1JLEVBQUYsQ0FBS3hELEVBQUwsR0FBVSxJQUFWLEdBQWlCLE1BQTFCOztBQUVBO0FBQ0EzRSxNQUFFc0MsTUFBRixFQUFVcUMsRUFBVixFQUFjLE1BQWQsRUFBc0IsVUFBU3ZDLEtBQVQsRUFBZ0I7QUFDbEN3UCxvQkFBWXlCLE9BQVosQ0FBb0IsS0FBcEIsRUFBMkJqUixLQUEzQjtBQUNILEtBRkQ7O0FBSUE7QUFDQXBDLE1BQUVzQyxNQUFGLEVBQVVxQyxFQUFWLEVBQWMsMEJBQWQsRUFBMEMsVUFBU3ZDLEtBQVQsRUFBZ0I7QUFDdER3UCxvQkFBWXlCLE9BQVosQ0FBb0IsSUFBcEIsRUFBMEJqUixLQUExQjtBQUNILEtBRkQ7QUFJSCxDQTdYQTs7Ozs7QUNORDs7Ozs7OztBQU9DLFdBQVNrSSxPQUFULEVBQWtCO0FBQ2pCLE1BQUksT0FBT0MsTUFBUCxLQUFrQixVQUFsQixJQUFnQ0EsT0FBT0MsR0FBM0MsRUFBZ0Q7QUFDOUM7QUFDQUQsV0FBTyxDQUFDLFFBQUQsQ0FBUCxFQUFtQkQsT0FBbkI7QUFDRCxHQUhELE1BR08sSUFBSSxRQUFPRyxNQUFQLHlDQUFPQSxNQUFQLE9BQWtCLFFBQWxCLElBQThCQSxPQUFPQyxPQUF6QyxFQUFrRDtBQUN2RDtBQUNBSixZQUFRdUIsUUFBUSxRQUFSLENBQVI7QUFDRCxHQUhNLE1BR0E7QUFDTDtBQUNBdkIsWUFBUXBDLE1BQVI7QUFDRDtBQUNGLENBWEEsRUFXQyxVQUFTbEksQ0FBVCxFQUFZOztBQUVaLE1BQUlpUyxVQUFVLE9BQWQ7QUFDQSxNQUFJd0Isa0JBQWtCLEVBQXRCO0FBQ0EsTUFBSUMsV0FBVztBQUNiQyxhQUFTLEVBREk7QUFFYkMsbUJBQWUsRUFGRjtBQUdiMUMsWUFBUSxDQUhLOztBQUtiO0FBQ0EyQyxlQUFXLEtBTkU7O0FBUWI7QUFDQTtBQUNBQyxzQkFBa0IsSUFWTDs7QUFZYjtBQUNBO0FBQ0FDLG1CQUFlLElBZEY7O0FBZ0JiO0FBQ0FDLGtCQUFjLElBakJEOztBQW1CYjtBQUNBQyxlQUFXLEtBcEJFOztBQXNCYjtBQUNBO0FBQ0FDLGtCQUFjLHdCQUFXLENBQUUsQ0F4QmQ7O0FBMEJiO0FBQ0E7QUFDQUMsaUJBQWEsdUJBQVcsQ0FBRSxDQTVCYjs7QUE4QmI7QUFDQTtBQUNBQyxZQUFRLE9BaENLOztBQWtDYjtBQUNBO0FBQ0E7QUFDQUMsV0FBTyxHQXJDTTs7QUF1Q2I7QUFDQUMscUJBQWlCLENBeENKOztBQTBDYjtBQUNBQyxvQkFBZ0I7QUEzQ0gsR0FBZjs7QUE4Q0EsTUFBSUMsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFTaEQsSUFBVCxFQUFlO0FBQ2pDLFFBQUlpRCxhQUFhLEVBQWpCO0FBQ0EsUUFBSUMsV0FBVyxLQUFmO0FBQ0EsUUFBSUMsTUFBTW5ELEtBQUttRCxHQUFMLElBQVluRCxLQUFLbUQsR0FBTCxLQUFhLE1BQXpCLEdBQWtDLFlBQWxDLEdBQWlELFdBQTNEOztBQUVBLFNBQUszUixJQUFMLENBQVUsWUFBVztBQUNuQixVQUFJNFIsS0FBSzVVLEVBQUUsSUFBRixDQUFUOztBQUVBLFVBQUksU0FBU08sUUFBVCxJQUFxQixTQUFTK0IsTUFBbEMsRUFBMEM7QUFDeEM7QUFDRDs7QUFFRCxVQUFJL0IsU0FBU3NVLGdCQUFULEtBQThCLFNBQVN0VSxTQUFTdVUsZUFBbEIsSUFBcUMsU0FBU3ZVLFNBQVN3VSxJQUFyRixDQUFKLEVBQWdHO0FBQzlGTixtQkFBVzdTLElBQVgsQ0FBZ0JyQixTQUFTc1UsZ0JBQXpCOztBQUVBLGVBQU8sS0FBUDtBQUNEOztBQUVELFVBQUlELEdBQUdELEdBQUgsTUFBWSxDQUFoQixFQUFtQjtBQUNqQkYsbUJBQVc3UyxJQUFYLENBQWdCLElBQWhCO0FBQ0QsT0FGRCxNQUVPO0FBQ0w7QUFDQWdULFdBQUdELEdBQUgsRUFBUSxDQUFSO0FBQ0FELG1CQUFXRSxHQUFHRCxHQUFILE1BQVksQ0FBdkI7O0FBRUEsWUFBSUQsUUFBSixFQUFjO0FBQ1pELHFCQUFXN1MsSUFBWCxDQUFnQixJQUFoQjtBQUNEO0FBQ0Q7QUFDQWdULFdBQUdELEdBQUgsRUFBUSxDQUFSO0FBQ0Q7QUFDRixLQTFCRDs7QUE0QkEsUUFBSSxDQUFDRixXQUFXelMsTUFBaEIsRUFBd0I7QUFDdEIsV0FBS2dCLElBQUwsQ0FBVSxZQUFXO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSSxTQUFTekMsU0FBU3VVLGVBQWxCLElBQXFDOVUsRUFBRSxJQUFGLEVBQVFtUixHQUFSLENBQVksZ0JBQVosTUFBa0MsUUFBM0UsRUFBcUY7QUFDbkZzRCx1QkFBYSxDQUFDLElBQUQsQ0FBYjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSSxDQUFDQSxXQUFXelMsTUFBWixJQUFzQixLQUFLdUwsUUFBTCxLQUFrQixNQUE1QyxFQUFvRDtBQUNsRGtILHVCQUFhLENBQUMsSUFBRCxDQUFiO0FBQ0Q7QUFDRixPQWhCRDtBQWlCRDs7QUFFRDtBQUNBLFFBQUlqRCxLQUFLb0QsRUFBTCxLQUFZLE9BQVosSUFBdUJILFdBQVd6UyxNQUFYLEdBQW9CLENBQS9DLEVBQWtEO0FBQ2hEeVMsbUJBQWEsQ0FBQ0EsV0FBVyxDQUFYLENBQUQsQ0FBYjtBQUNEOztBQUVELFdBQU9BLFVBQVA7QUFDRCxHQTNERDs7QUE2REEsTUFBSU8sWUFBWSxpQkFBaEI7O0FBRUFoVixJQUFFbUksRUFBRixDQUFLUSxNQUFMLENBQVk7QUFDVjhMLGdCQUFZLG9CQUFTRSxHQUFULEVBQWM7QUFDeEIsVUFBSU0sT0FBT1QsY0FBY2xVLElBQWQsQ0FBbUIsSUFBbkIsRUFBeUIsRUFBQ3FVLEtBQUtBLEdBQU4sRUFBekIsQ0FBWDs7QUFFQSxhQUFPLEtBQUtPLFNBQUwsQ0FBZUQsSUFBZixDQUFQO0FBQ0QsS0FMUztBQU1WRSxxQkFBaUIseUJBQVNSLEdBQVQsRUFBYztBQUM3QixVQUFJTSxPQUFPVCxjQUFjbFUsSUFBZCxDQUFtQixJQUFuQixFQUF5QixFQUFDc1UsSUFBSSxPQUFMLEVBQWNELEtBQUtBLEdBQW5CLEVBQXpCLENBQVg7O0FBRUEsYUFBTyxLQUFLTyxTQUFMLENBQWVELElBQWYsQ0FBUDtBQUNELEtBVlM7O0FBWVZHLGtCQUFjLHNCQUFTMUksT0FBVCxFQUFrQjJJLEtBQWxCLEVBQXlCO0FBQ3JDM0ksZ0JBQVVBLFdBQVcsRUFBckI7O0FBRUEsVUFBSUEsWUFBWSxTQUFoQixFQUEyQjtBQUN6QixZQUFJLENBQUMySSxLQUFMLEVBQVk7QUFDVixpQkFBTyxLQUFLQyxLQUFMLEdBQWEzQyxJQUFiLENBQWtCLFFBQWxCLENBQVA7QUFDRDs7QUFFRCxlQUFPLEtBQUszUCxJQUFMLENBQVUsWUFBVztBQUMxQixjQUFJNEMsUUFBUTVGLEVBQUUsSUFBRixDQUFaO0FBQ0EsY0FBSXdSLE9BQU94UixFQUFFMkksTUFBRixDQUFTL0MsTUFBTStNLElBQU4sQ0FBVyxRQUFYLEtBQXdCLEVBQWpDLEVBQXFDMEMsS0FBckMsQ0FBWDs7QUFFQXJWLFlBQUUsSUFBRixFQUFRMlMsSUFBUixDQUFhLFFBQWIsRUFBdUJuQixJQUF2QjtBQUNELFNBTE0sQ0FBUDtBQU1EOztBQUVELFVBQUlBLE9BQU94UixFQUFFMkksTUFBRixDQUFTLEVBQVQsRUFBYTNJLEVBQUVtSSxFQUFGLENBQUtpTixZQUFMLENBQWtCMUIsUUFBL0IsRUFBeUNoSCxPQUF6QyxDQUFYOztBQUVBLFVBQUk2SSxlQUFlLFNBQWZBLFlBQWUsQ0FBU25ULEtBQVQsRUFBZ0I7QUFDakMsWUFBSW9ULGlCQUFpQixTQUFqQkEsY0FBaUIsQ0FBU0MsR0FBVCxFQUFjO0FBQ2pDLGlCQUFPQSxJQUFJalMsT0FBSixDQUFZLFlBQVosRUFBMEIsTUFBMUIsQ0FBUDtBQUNELFNBRkQ7O0FBSUEsWUFBSTZELE9BQU8sSUFBWDtBQUNBLFlBQUlxTyxRQUFRMVYsRUFBRSxJQUFGLENBQVo7QUFDQSxZQUFJMlYsV0FBVzNWLEVBQUUySSxNQUFGLENBQVMsRUFBVCxFQUFhNkksSUFBYixFQUFtQmtFLE1BQU0vQyxJQUFOLENBQVcsUUFBWCxLQUF3QixFQUEzQyxDQUFmO0FBQ0EsWUFBSWdCLFVBQVVuQyxLQUFLbUMsT0FBbkI7QUFDQSxZQUFJQyxnQkFBZ0IrQixTQUFTL0IsYUFBN0I7QUFDQSxZQUFJZ0MsWUFBWSxDQUFoQjtBQUNBLFlBQUlDLGFBQWEsQ0FBakI7QUFDQSxZQUFJQyxVQUFVLElBQWQ7QUFDQSxZQUFJQyxZQUFZLEVBQWhCO0FBQ0EsWUFBSUMsZUFBZWhXLEVBQUVvVixZQUFGLENBQWVhLFVBQWYsQ0FBMEJDLFNBQVNDLFFBQW5DLENBQW5CO0FBQ0EsWUFBSUMsV0FBV3BXLEVBQUVvVixZQUFGLENBQWVhLFVBQWYsQ0FBMEI1TyxLQUFLOE8sUUFBL0IsQ0FBZjtBQUNBLFlBQUlFLFlBQVlILFNBQVNJLFFBQVQsS0FBc0JqUCxLQUFLaVAsUUFBM0IsSUFBdUMsQ0FBQ2pQLEtBQUtpUCxRQUE3RDtBQUNBLFlBQUlDLFlBQVlaLFNBQVMzQixZQUFULElBQTBCb0MsYUFBYUosWUFBdkQ7QUFDQSxZQUFJUSxXQUFXaEIsZUFBZW5PLEtBQUtvUCxJQUFwQixDQUFmOztBQUVBLFlBQUlELFlBQVksQ0FBQ3hXLEVBQUV3VyxRQUFGLEVBQVl4VSxNQUE3QixFQUFxQztBQUNuQzhULG9CQUFVLEtBQVY7QUFDRDs7QUFFRCxZQUFJLENBQUNILFNBQVMzQixZQUFWLEtBQTJCLENBQUNxQyxTQUFELElBQWMsQ0FBQ0UsU0FBZixJQUE0QixDQUFDQyxRQUF4RCxDQUFKLEVBQXVFO0FBQ3JFVixvQkFBVSxLQUFWO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsaUJBQU9BLFdBQVdGLFlBQVlqQyxRQUFRM1IsTUFBdEMsRUFBOEM7QUFDNUMsZ0JBQUkwVCxNQUFNekMsRUFBTixDQUFTdUMsZUFBZTdCLFFBQVFpQyxXQUFSLENBQWYsQ0FBVCxDQUFKLEVBQW9EO0FBQ2xERSx3QkFBVSxLQUFWO0FBQ0Q7QUFDRjs7QUFFRCxpQkFBT0EsV0FBV0QsYUFBYWpDLGNBQWM1UixNQUE3QyxFQUFxRDtBQUNuRCxnQkFBSTBULE1BQU0vVSxPQUFOLENBQWNpVCxjQUFjaUMsWUFBZCxDQUFkLEVBQTJDN1QsTUFBL0MsRUFBdUQ7QUFDckQ4VCx3QkFBVSxLQUFWO0FBQ0Q7QUFDRjtBQUNGOztBQUVELFlBQUlBLE9BQUosRUFBYTtBQUNYLGNBQUlILFNBQVNwQixjQUFiLEVBQTZCO0FBQzNCblMsa0JBQU1tUyxjQUFOO0FBQ0Q7O0FBRUR2VSxZQUFFMkksTUFBRixDQUFTb04sU0FBVCxFQUFvQkosUUFBcEIsRUFBOEI7QUFDNUIzQiwwQkFBYzJCLFNBQVMzQixZQUFULElBQXlCd0MsUUFEWDtBQUU1Qm5QLGtCQUFNQTtBQUZzQixXQUE5Qjs7QUFLQXJILFlBQUVvVixZQUFGLENBQWVXLFNBQWY7QUFDRDtBQUNGLE9BcEREOztBQXNEQSxVQUFJckosUUFBUW9ILGdCQUFSLEtBQTZCLElBQWpDLEVBQXVDO0FBQ3JDLGFBQ0NqSyxHQURELENBQ0ssb0JBREwsRUFDMkI2QyxRQUFRb0gsZ0JBRG5DLEVBRUNuUCxFQUZELENBRUksb0JBRkosRUFFMEIrSCxRQUFRb0gsZ0JBRmxDLEVBRW9EeUIsWUFGcEQ7QUFHRCxPQUpELE1BSU87QUFDTCxhQUNDMUwsR0FERCxDQUNLLG9CQURMLEVBRUNsRixFQUZELENBRUksb0JBRkosRUFFMEI0USxZQUYxQjtBQUdEOztBQUVELGFBQU8sSUFBUDtBQUNEO0FBL0ZTLEdBQVo7O0FBa0dBLE1BQUltQixvQkFBb0IsU0FBcEJBLGlCQUFvQixDQUFTQyxHQUFULEVBQWM7QUFDcEMsUUFBSUMsV0FBVyxFQUFDQyxVQUFVLEVBQVgsRUFBZjtBQUNBLFFBQUlDLFFBQVEsT0FBT0gsR0FBUCxLQUFlLFFBQWYsSUFBMkIzQixVQUFVOUcsSUFBVixDQUFleUksR0FBZixDQUF2Qzs7QUFFQSxRQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFuQixFQUE2QjtBQUMzQkMsZUFBU0csRUFBVCxHQUFjSixHQUFkO0FBQ0QsS0FGRCxNQUVPLElBQUlHLEtBQUosRUFBVztBQUNoQkYsZUFBU0MsUUFBVCxHQUFvQkMsTUFBTSxDQUFOLENBQXBCO0FBQ0FGLGVBQVNHLEVBQVQsR0FBY3JHLFdBQVdvRyxNQUFNLENBQU4sQ0FBWCxLQUF3QixDQUF0QztBQUNEOztBQUVELFdBQU9GLFFBQVA7QUFDRCxHQVpEOztBQWNBLE1BQUlJLGdCQUFnQixTQUFoQkEsYUFBZ0IsQ0FBU3hGLElBQVQsRUFBZTtBQUNqQyxRQUFJeUYsT0FBT2pYLEVBQUV3UixLQUFLd0MsWUFBUCxDQUFYOztBQUVBLFFBQUl4QyxLQUFLeUMsU0FBTCxJQUFrQmdELEtBQUtqVixNQUEzQixFQUFtQztBQUNqQ2lWLFdBQUssQ0FBTCxFQUFRQyxLQUFSOztBQUVBLFVBQUksQ0FBQ0QsS0FBS2hFLEVBQUwsQ0FBUTFTLFNBQVM0VyxhQUFqQixDQUFMLEVBQXNDO0FBQ3BDRixhQUFLL0ssSUFBTCxDQUFVLEVBQUNrTCxVQUFVLENBQUMsQ0FBWixFQUFWO0FBQ0FILGFBQUssQ0FBTCxFQUFRQyxLQUFSO0FBQ0Q7QUFDRjs7QUFFRDFGLFNBQUsyQyxXQUFMLENBQWlCN1QsSUFBakIsQ0FBc0JrUixLQUFLbkssSUFBM0IsRUFBaUNtSyxJQUFqQztBQUNELEdBYkQ7O0FBZUF4UixJQUFFb1YsWUFBRixHQUFpQixVQUFTMUksT0FBVCxFQUFrQnFLLEVBQWxCLEVBQXNCO0FBQ3JDLFFBQUlySyxZQUFZLFNBQVosSUFBeUIsUUFBT3FLLEVBQVAseUNBQU9BLEVBQVAsT0FBYyxRQUEzQyxFQUFxRDtBQUNuRCxhQUFPL1csRUFBRTJJLE1BQUYsQ0FBUzhLLGVBQVQsRUFBMEJzRCxFQUExQixDQUFQO0FBQ0Q7QUFDRCxRQUFJdkYsSUFBSixFQUFVNkYsU0FBVixFQUFxQmhELEtBQXJCLEVBQTRCaUQsS0FBNUI7QUFDQSxRQUFJQyxpQkFBaUJiLGtCQUFrQmhLLE9BQWxCLENBQXJCO0FBQ0EsUUFBSThLLHFCQUFxQixFQUF6QjtBQUNBLFFBQUlDLGlCQUFpQixDQUFyQjtBQUNBLFFBQUlDLFNBQVMsUUFBYjtBQUNBLFFBQUlDLFlBQVksV0FBaEI7QUFDQSxRQUFJQyxXQUFXLEVBQWY7QUFDQSxRQUFJQyxVQUFVLEVBQWQ7O0FBRUEsUUFBSU4sZUFBZVIsRUFBbkIsRUFBdUI7QUFDckJ2RixhQUFPeFIsRUFBRTJJLE1BQUYsQ0FBUyxFQUFDdEIsTUFBTSxJQUFQLEVBQVQsRUFBdUJySCxFQUFFbUksRUFBRixDQUFLaU4sWUFBTCxDQUFrQjFCLFFBQXpDLEVBQW1ERCxlQUFuRCxDQUFQO0FBQ0QsS0FGRCxNQUVPO0FBQ0xqQyxhQUFPeFIsRUFBRTJJLE1BQUYsQ0FBUyxFQUFDdEIsTUFBTSxJQUFQLEVBQVQsRUFBdUJySCxFQUFFbUksRUFBRixDQUFLaU4sWUFBTCxDQUFrQjFCLFFBQXpDLEVBQW1EaEgsV0FBVyxFQUE5RCxFQUFrRStHLGVBQWxFLENBQVA7O0FBRUEsVUFBSWpDLEtBQUt1QyxhQUFULEVBQXdCO0FBQ3RCMkQsaUJBQVMsVUFBVDs7QUFFQSxZQUFJbEcsS0FBS3VDLGFBQUwsQ0FBbUI1QyxHQUFuQixDQUF1QixVQUF2QixNQUF1QyxRQUEzQyxFQUFxRDtBQUNuREssZUFBS3VDLGFBQUwsQ0FBbUI1QyxHQUFuQixDQUF1QixVQUF2QixFQUFtQyxVQUFuQztBQUNEO0FBQ0Y7O0FBRUQsVUFBSTRGLEVBQUosRUFBUTtBQUNOUSx5QkFBaUJiLGtCQUFrQkssRUFBbEIsQ0FBakI7QUFDRDtBQUNGOztBQUVEWSxnQkFBWW5HLEtBQUtxQyxTQUFMLEtBQW1CLE1BQW5CLEdBQTRCLFlBQTVCLEdBQTJDOEQsU0FBdkQ7O0FBRUEsUUFBSW5HLEtBQUt1QyxhQUFULEVBQXdCO0FBQ3RCc0Qsa0JBQVk3RixLQUFLdUMsYUFBakI7O0FBRUEsVUFBSSxDQUFDd0QsZUFBZVIsRUFBaEIsSUFBc0IsQ0FBRSxpQkFBRCxDQUFvQmUsSUFBcEIsQ0FBeUJULFVBQVUsQ0FBVixFQUFhOUosUUFBdEMsQ0FBM0IsRUFBNEU7QUFDMUVrSyx5QkFBaUJKLFVBQVVNLFNBQVYsR0FBakI7QUFDRDtBQUNGLEtBTkQsTUFNTztBQUNMTixrQkFBWXJYLEVBQUUsWUFBRixFQUFnQm1WLGVBQWhCLENBQWdDM0QsS0FBS3FDLFNBQXJDLENBQVo7QUFDRDs7QUFFRDtBQUNBckMsU0FBSzBDLFlBQUwsQ0FBa0I1VCxJQUFsQixDQUF1QitXLFNBQXZCLEVBQWtDN0YsSUFBbEM7O0FBRUFnRyx5QkFBcUJELGVBQWVSLEVBQWYsR0FBb0JRLGNBQXBCLEdBQXFDO0FBQ3hEVixnQkFBVSxFQUQ4QztBQUV4REUsVUFBSy9XLEVBQUV3UixLQUFLd0MsWUFBUCxFQUFxQjBELE1BQXJCLE9BQWtDMVgsRUFBRXdSLEtBQUt3QyxZQUFQLEVBQXFCMEQsTUFBckIsSUFBK0JsRyxLQUFLcUMsU0FBcEMsQ0FBbkMsSUFBc0Y7QUFGbEMsS0FBMUQ7O0FBS0ErRCxhQUFTRCxTQUFULElBQXNCSCxtQkFBbUJYLFFBQW5CLElBQStCVyxtQkFBbUJULEVBQW5CLEdBQXdCVSxjQUF4QixHQUF5Q2pHLEtBQUtOLE1BQTdFLENBQXRCOztBQUVBbUQsWUFBUTdDLEtBQUs2QyxLQUFiOztBQUVBO0FBQ0EsUUFBSUEsVUFBVSxNQUFkLEVBQXNCOztBQUVwQjtBQUNBO0FBQ0FpRCxjQUFRM04sS0FBS0MsR0FBTCxDQUFTZ08sU0FBU0QsU0FBVCxJQUFzQk4sVUFBVU0sU0FBVixHQUEvQixDQUFSOztBQUVBO0FBQ0F0RCxjQUFRaUQsUUFBUTlGLEtBQUs4QyxlQUFyQjtBQUNEOztBQUVEdUQsY0FBVTtBQUNSRSxnQkFBVTFELEtBREY7QUFFUkQsY0FBUTVDLEtBQUs0QyxNQUZMO0FBR1J4RixnQkFBVSxvQkFBVztBQUNuQm9JLHNCQUFjeEYsSUFBZDtBQUNEO0FBTE8sS0FBVjs7QUFRQSxRQUFJQSxLQUFLd0csSUFBVCxFQUFlO0FBQ2JILGNBQVFHLElBQVIsR0FBZXhHLEtBQUt3RyxJQUFwQjtBQUNEOztBQUVELFFBQUlYLFVBQVVyVixNQUFkLEVBQXNCO0FBQ3BCcVYsZ0JBQVVZLElBQVYsR0FBaUJDLE9BQWpCLENBQXlCTixRQUF6QixFQUFtQ0MsT0FBbkM7QUFDRCxLQUZELE1BRU87QUFDTGIsb0JBQWN4RixJQUFkO0FBQ0Q7QUFDRixHQW5GRDs7QUFxRkF4UixJQUFFb1YsWUFBRixDQUFlbkQsT0FBZixHQUF5QkEsT0FBekI7QUFDQWpTLElBQUVvVixZQUFGLENBQWVhLFVBQWYsR0FBNEIsVUFBU2tDLE1BQVQsRUFBaUI7QUFDM0NBLGFBQVNBLFVBQVUsRUFBbkI7O0FBRUEsV0FBT0EsT0FDSjNVLE9BREksQ0FDSSxLQURKLEVBQ1csRUFEWCxFQUVKQSxPQUZJLENBRUksa0NBRkosRUFFd0MsRUFGeEMsRUFHSkEsT0FISSxDQUdJLEtBSEosRUFHVyxFQUhYLENBQVA7QUFJRCxHQVBEOztBQVNBO0FBQ0F4RCxJQUFFbUksRUFBRixDQUFLaU4sWUFBTCxDQUFrQjFCLFFBQWxCLEdBQTZCQSxRQUE3QjtBQUVELENBN1ZBLENBQUQ7OztBQ1BBOzs7Ozs7QUFNQyxhQUFXO0FBQ1Y7O0FBRUEsTUFBSTBFLGFBQWEsQ0FBakI7QUFDQSxNQUFJQyxlQUFlLEVBQW5COztBQUVBO0FBQ0EsV0FBU0MsUUFBVCxDQUFrQjVMLE9BQWxCLEVBQTJCO0FBQ3pCLFFBQUksQ0FBQ0EsT0FBTCxFQUFjO0FBQ1osWUFBTSxJQUFJNkwsS0FBSixDQUFVLDJDQUFWLENBQU47QUFDRDtBQUNELFFBQUksQ0FBQzdMLFFBQVFoTSxPQUFiLEVBQXNCO0FBQ3BCLFlBQU0sSUFBSTZYLEtBQUosQ0FBVSxrREFBVixDQUFOO0FBQ0Q7QUFDRCxRQUFJLENBQUM3TCxRQUFROEwsT0FBYixFQUFzQjtBQUNwQixZQUFNLElBQUlELEtBQUosQ0FBVSxrREFBVixDQUFOO0FBQ0Q7O0FBRUQsU0FBS3JWLEdBQUwsR0FBVyxjQUFja1YsVUFBekI7QUFDQSxTQUFLMUwsT0FBTCxHQUFlNEwsU0FBU0csT0FBVCxDQUFpQjlQLE1BQWpCLENBQXdCLEVBQXhCLEVBQTRCMlAsU0FBUzVFLFFBQXJDLEVBQStDaEgsT0FBL0MsQ0FBZjtBQUNBLFNBQUtoTSxPQUFMLEdBQWUsS0FBS2dNLE9BQUwsQ0FBYWhNLE9BQTVCO0FBQ0EsU0FBS2dZLE9BQUwsR0FBZSxJQUFJSixTQUFTRyxPQUFiLENBQXFCLEtBQUsvWCxPQUExQixDQUFmO0FBQ0EsU0FBSzBQLFFBQUwsR0FBZ0IxRCxRQUFROEwsT0FBeEI7QUFDQSxTQUFLRyxJQUFMLEdBQVksS0FBS2pNLE9BQUwsQ0FBYWtNLFVBQWIsR0FBMEIsWUFBMUIsR0FBeUMsVUFBckQ7QUFDQSxTQUFLQyxPQUFMLEdBQWUsS0FBS25NLE9BQUwsQ0FBYW1NLE9BQTVCO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQixJQUFwQjtBQUNBLFNBQUs3VixLQUFMLEdBQWFxVixTQUFTUyxLQUFULENBQWVDLFlBQWYsQ0FBNEI7QUFDdkNDLFlBQU0sS0FBS3ZNLE9BQUwsQ0FBYXpKLEtBRG9CO0FBRXZDMFYsWUFBTSxLQUFLQTtBQUY0QixLQUE1QixDQUFiO0FBSUEsU0FBS3pZLE9BQUwsR0FBZW9ZLFNBQVNZLE9BQVQsQ0FBaUJDLHFCQUFqQixDQUF1QyxLQUFLek0sT0FBTCxDQUFheE0sT0FBcEQsQ0FBZjs7QUFFQSxRQUFJb1ksU0FBU2MsYUFBVCxDQUF1QixLQUFLMU0sT0FBTCxDQUFhd0UsTUFBcEMsQ0FBSixFQUFpRDtBQUMvQyxXQUFLeEUsT0FBTCxDQUFhd0UsTUFBYixHQUFzQm9ILFNBQVNjLGFBQVQsQ0FBdUIsS0FBSzFNLE9BQUwsQ0FBYXdFLE1BQXBDLENBQXRCO0FBQ0Q7QUFDRCxTQUFLak8sS0FBTCxDQUFXcU8sR0FBWCxDQUFlLElBQWY7QUFDQSxTQUFLcFIsT0FBTCxDQUFhb1IsR0FBYixDQUFpQixJQUFqQjtBQUNBK0csaUJBQWEsS0FBS25WLEdBQWxCLElBQXlCLElBQXpCO0FBQ0FrVixrQkFBYyxDQUFkO0FBQ0Q7O0FBRUQ7QUFDQUUsV0FBU2xZLFNBQVQsQ0FBbUJpWixZQUFuQixHQUFrQyxVQUFTeEYsU0FBVCxFQUFvQjtBQUNwRCxTQUFLNVEsS0FBTCxDQUFXb1csWUFBWCxDQUF3QixJQUF4QixFQUE4QnhGLFNBQTlCO0FBQ0QsR0FGRDs7QUFJQTtBQUNBeUUsV0FBU2xZLFNBQVQsQ0FBbUJrWixPQUFuQixHQUE2QixVQUFTN04sSUFBVCxFQUFlO0FBQzFDLFFBQUksQ0FBQyxLQUFLb04sT0FBVixFQUFtQjtBQUNqQjtBQUNEO0FBQ0QsUUFBSSxLQUFLekksUUFBVCxFQUFtQjtBQUNqQixXQUFLQSxRQUFMLENBQWNyRyxLQUFkLENBQW9CLElBQXBCLEVBQTBCMEIsSUFBMUI7QUFDRDtBQUNGLEdBUEQ7O0FBU0E7QUFDQTtBQUNBNk0sV0FBU2xZLFNBQVQsQ0FBbUJtWixPQUFuQixHQUE2QixZQUFXO0FBQ3RDLFNBQUtyWixPQUFMLENBQWF5UixNQUFiLENBQW9CLElBQXBCO0FBQ0EsU0FBSzFPLEtBQUwsQ0FBVzBPLE1BQVgsQ0FBa0IsSUFBbEI7QUFDQSxXQUFPMEcsYUFBYSxLQUFLblYsR0FBbEIsQ0FBUDtBQUNELEdBSkQ7O0FBTUE7QUFDQTtBQUNBb1YsV0FBU2xZLFNBQVQsQ0FBbUJvWixPQUFuQixHQUE2QixZQUFXO0FBQ3RDLFNBQUtYLE9BQUwsR0FBZSxLQUFmO0FBQ0EsV0FBTyxJQUFQO0FBQ0QsR0FIRDs7QUFLQTtBQUNBO0FBQ0FQLFdBQVNsWSxTQUFULENBQW1CcVosTUFBbkIsR0FBNEIsWUFBVztBQUNyQyxTQUFLdlosT0FBTCxDQUFhd1osT0FBYjtBQUNBLFNBQUtiLE9BQUwsR0FBZSxJQUFmO0FBQ0EsV0FBTyxJQUFQO0FBQ0QsR0FKRDs7QUFNQTtBQUNBO0FBQ0FQLFdBQVNsWSxTQUFULENBQW1CMEYsSUFBbkIsR0FBMEIsWUFBVztBQUNuQyxXQUFPLEtBQUs3QyxLQUFMLENBQVc2QyxJQUFYLENBQWdCLElBQWhCLENBQVA7QUFDRCxHQUZEOztBQUlBO0FBQ0E7QUFDQXdTLFdBQVNsWSxTQUFULENBQW1CdVosUUFBbkIsR0FBOEIsWUFBVztBQUN2QyxXQUFPLEtBQUsxVyxLQUFMLENBQVcwVyxRQUFYLENBQW9CLElBQXBCLENBQVA7QUFDRCxHQUZEOztBQUlBO0FBQ0FyQixXQUFTc0IsU0FBVCxHQUFxQixVQUFTOUosTUFBVCxFQUFpQjtBQUNwQyxRQUFJK0osb0JBQW9CLEVBQXhCO0FBQ0EsU0FBSyxJQUFJQyxXQUFULElBQXdCekIsWUFBeEIsRUFBc0M7QUFDcEN3Qix3QkFBa0JqWSxJQUFsQixDQUF1QnlXLGFBQWF5QixXQUFiLENBQXZCO0FBQ0Q7QUFDRCxTQUFLLElBQUlwTyxJQUFJLENBQVIsRUFBV3FPLE1BQU1GLGtCQUFrQjdYLE1BQXhDLEVBQWdEMEosSUFBSXFPLEdBQXBELEVBQXlEck8sR0FBekQsRUFBOEQ7QUFDNURtTyx3QkFBa0JuTyxDQUFsQixFQUFxQm9FLE1BQXJCO0FBQ0Q7QUFDRixHQVJEOztBQVVBO0FBQ0E7QUFDQXdJLFdBQVMwQixVQUFULEdBQXNCLFlBQVc7QUFDL0IxQixhQUFTc0IsU0FBVCxDQUFtQixTQUFuQjtBQUNELEdBRkQ7O0FBSUE7QUFDQTtBQUNBdEIsV0FBUzJCLFVBQVQsR0FBc0IsWUFBVztBQUMvQjNCLGFBQVNzQixTQUFULENBQW1CLFNBQW5CO0FBQ0QsR0FGRDs7QUFJQTtBQUNBO0FBQ0F0QixXQUFTNEIsU0FBVCxHQUFxQixZQUFXO0FBQzlCNUIsYUFBU1ksT0FBVCxDQUFpQmlCLFVBQWpCO0FBQ0EsU0FBSyxJQUFJTCxXQUFULElBQXdCekIsWUFBeEIsRUFBc0M7QUFDcENBLG1CQUFheUIsV0FBYixFQUEwQmpCLE9BQTFCLEdBQW9DLElBQXBDO0FBQ0Q7QUFDRCxXQUFPLElBQVA7QUFDRCxHQU5EOztBQVFBO0FBQ0E7QUFDQVAsV0FBUzZCLFVBQVQsR0FBc0IsWUFBVztBQUMvQjdCLGFBQVNZLE9BQVQsQ0FBaUJpQixVQUFqQjtBQUNELEdBRkQ7O0FBSUE7QUFDQTtBQUNBN0IsV0FBUzhCLGNBQVQsR0FBMEIsWUFBVztBQUNuQyxXQUFPOVgsT0FBTytYLFdBQVAsSUFBc0I5WixTQUFTdVUsZUFBVCxDQUF5QndGLFlBQXREO0FBQ0QsR0FGRDs7QUFJQTtBQUNBO0FBQ0FoQyxXQUFTaUMsYUFBVCxHQUF5QixZQUFXO0FBQ2xDLFdBQU9oYSxTQUFTdVUsZUFBVCxDQUF5QjBGLFdBQWhDO0FBQ0QsR0FGRDs7QUFJQWxDLFdBQVNtQyxRQUFULEdBQW9CLEVBQXBCOztBQUVBbkMsV0FBUzVFLFFBQVQsR0FBb0I7QUFDbEJ4VCxhQUFTb0MsTUFEUztBQUVsQm9ZLGdCQUFZLElBRk07QUFHbEI3QixhQUFTLElBSFM7QUFJbEI1VixXQUFPLFNBSlc7QUFLbEIyVixnQkFBWSxLQUxNO0FBTWxCMUgsWUFBUTtBQU5VLEdBQXBCOztBQVNBb0gsV0FBU2MsYUFBVCxHQUF5QjtBQUN2QixzQkFBa0Isd0JBQVc7QUFDM0IsYUFBTyxLQUFLbFosT0FBTCxDQUFhbWEsV0FBYixLQUE2QixLQUFLM0IsT0FBTCxDQUFhbEcsV0FBYixFQUFwQztBQUNELEtBSHNCO0FBSXZCLHFCQUFpQix1QkFBVztBQUMxQixhQUFPLEtBQUt0UyxPQUFMLENBQWF5YSxVQUFiLEtBQTRCLEtBQUtqQyxPQUFMLENBQWFrQyxVQUFiLEVBQW5DO0FBQ0Q7QUFOc0IsR0FBekI7O0FBU0F0WSxTQUFPZ1csUUFBUCxHQUFrQkEsUUFBbEI7QUFDRCxDQW5LQSxHQUFELENBb0tFLGFBQVc7QUFDWDs7QUFFQSxXQUFTdUMseUJBQVQsQ0FBbUN6SyxRQUFuQyxFQUE2QztBQUMzQzlOLFdBQU8wSCxVQUFQLENBQWtCb0csUUFBbEIsRUFBNEIsT0FBTyxFQUFuQztBQUNEOztBQUVELE1BQUlnSSxhQUFhLENBQWpCO0FBQ0EsTUFBSTBDLFdBQVcsRUFBZjtBQUNBLE1BQUl4QyxXQUFXaFcsT0FBT2dXLFFBQXRCO0FBQ0EsTUFBSXlDLGdCQUFnQnpZLE9BQU95TixNQUEzQjs7QUFFQTtBQUNBLFdBQVNtSixPQUFULENBQWlCeFksT0FBakIsRUFBMEI7QUFDeEIsU0FBS0EsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsU0FBSytYLE9BQUwsR0FBZUgsU0FBU0csT0FBeEI7QUFDQSxTQUFLQyxPQUFMLEdBQWUsSUFBSSxLQUFLRCxPQUFULENBQWlCL1gsT0FBakIsQ0FBZjtBQUNBLFNBQUt3QyxHQUFMLEdBQVcsc0JBQXNCa1YsVUFBakM7QUFDQSxTQUFLNEMsU0FBTCxHQUFpQixLQUFqQjtBQUNBLFNBQUtDLFNBQUwsR0FBaUIsS0FBakI7QUFDQSxTQUFLQyxTQUFMLEdBQWlCO0FBQ2ZDLFNBQUcsS0FBS3pDLE9BQUwsQ0FBYTBDLFVBQWIsRUFEWTtBQUVmQyxTQUFHLEtBQUszQyxPQUFMLENBQWFwRyxTQUFiO0FBRlksS0FBakI7QUFJQSxTQUFLZ0osU0FBTCxHQUFpQjtBQUNmQyxnQkFBVSxFQURLO0FBRWYzQyxrQkFBWTtBQUZHLEtBQWpCOztBQUtBbFksWUFBUThhLGtCQUFSLEdBQTZCLEtBQUt0WSxHQUFsQztBQUNBNFgsYUFBU3BhLFFBQVE4YSxrQkFBakIsSUFBdUMsSUFBdkM7QUFDQXBELGtCQUFjLENBQWQ7QUFDQSxRQUFJLENBQUNFLFNBQVNtRCxhQUFkLEVBQTZCO0FBQzNCbkQsZUFBU21ELGFBQVQsR0FBeUIsSUFBekI7QUFDQW5ELGVBQVNtRCxhQUFULEdBQXlCLElBQUl2QyxPQUFKLENBQVk1VyxNQUFaLENBQXpCO0FBQ0Q7O0FBRUQsU0FBS29aLDRCQUFMO0FBQ0EsU0FBS0MsNEJBQUw7QUFDRDs7QUFFRDtBQUNBekMsVUFBUTlZLFNBQVIsQ0FBa0JrUixHQUFsQixHQUF3QixVQUFTc0ssUUFBVCxFQUFtQjtBQUN6QyxRQUFJakQsT0FBT2lELFNBQVNsUCxPQUFULENBQWlCa00sVUFBakIsR0FBOEIsWUFBOUIsR0FBNkMsVUFBeEQ7QUFDQSxTQUFLMEMsU0FBTCxDQUFlM0MsSUFBZixFQUFxQmlELFNBQVMxWSxHQUE5QixJQUFxQzBZLFFBQXJDO0FBQ0EsU0FBS2xDLE9BQUw7QUFDRCxHQUpEOztBQU1BO0FBQ0FSLFVBQVE5WSxTQUFSLENBQWtCeWIsVUFBbEIsR0FBK0IsWUFBVztBQUN4QyxRQUFJQyxrQkFBa0IsS0FBS3JELE9BQUwsQ0FBYXNELGFBQWIsQ0FBMkIsS0FBS1QsU0FBTCxDQUFlMUMsVUFBMUMsQ0FBdEI7QUFDQSxRQUFJb0QsZ0JBQWdCLEtBQUt2RCxPQUFMLENBQWFzRCxhQUFiLENBQTJCLEtBQUtULFNBQUwsQ0FBZUMsUUFBMUMsQ0FBcEI7QUFDQSxRQUFJVSxXQUFXLEtBQUt2YixPQUFMLElBQWdCLEtBQUtBLE9BQUwsQ0FBYTRCLE1BQTVDO0FBQ0EsUUFBSXdaLG1CQUFtQkUsYUFBbkIsSUFBb0MsQ0FBQ0MsUUFBekMsRUFBbUQ7QUFDakQsV0FBS3ZELE9BQUwsQ0FBYTdPLEdBQWIsQ0FBaUIsWUFBakI7QUFDQSxhQUFPaVIsU0FBUyxLQUFLNVgsR0FBZCxDQUFQO0FBQ0Q7QUFDRixHQVJEOztBQVVBO0FBQ0FnVyxVQUFROVksU0FBUixDQUFrQnViLDRCQUFsQixHQUFpRCxZQUFXO0FBQzFELFFBQUlPLE9BQU8sSUFBWDs7QUFFQSxhQUFTQyxhQUFULEdBQXlCO0FBQ3ZCRCxXQUFLRSxZQUFMO0FBQ0FGLFdBQUtqQixTQUFMLEdBQWlCLEtBQWpCO0FBQ0Q7O0FBRUQsU0FBS3ZDLE9BQUwsQ0FBYS9ULEVBQWIsQ0FBZ0Isa0JBQWhCLEVBQW9DLFlBQVc7QUFDN0MsVUFBSSxDQUFDdVgsS0FBS2pCLFNBQVYsRUFBcUI7QUFDbkJpQixhQUFLakIsU0FBTCxHQUFpQixJQUFqQjtBQUNBM0MsaUJBQVMrRCxxQkFBVCxDQUErQkYsYUFBL0I7QUFDRDtBQUNGLEtBTEQ7QUFNRCxHQWREOztBQWdCQTtBQUNBakQsVUFBUTlZLFNBQVIsQ0FBa0JzYiw0QkFBbEIsR0FBaUQsWUFBVztBQUMxRCxRQUFJUSxPQUFPLElBQVg7QUFDQSxhQUFTSSxhQUFULEdBQXlCO0FBQ3ZCSixXQUFLSyxZQUFMO0FBQ0FMLFdBQUtsQixTQUFMLEdBQWlCLEtBQWpCO0FBQ0Q7O0FBRUQsU0FBS3RDLE9BQUwsQ0FBYS9ULEVBQWIsQ0FBZ0Isa0JBQWhCLEVBQW9DLFlBQVc7QUFDN0MsVUFBSSxDQUFDdVgsS0FBS2xCLFNBQU4sSUFBbUIxQyxTQUFTa0UsT0FBaEMsRUFBeUM7QUFDdkNOLGFBQUtsQixTQUFMLEdBQWlCLElBQWpCO0FBQ0ExQyxpQkFBUytELHFCQUFULENBQStCQyxhQUEvQjtBQUNEO0FBQ0YsS0FMRDtBQU1ELEdBYkQ7O0FBZUE7QUFDQXBELFVBQVE5WSxTQUFSLENBQWtCZ2MsWUFBbEIsR0FBaUMsWUFBVztBQUMxQzlELGFBQVNZLE9BQVQsQ0FBaUJpQixVQUFqQjtBQUNELEdBRkQ7O0FBSUE7QUFDQWpCLFVBQVE5WSxTQUFSLENBQWtCbWMsWUFBbEIsR0FBaUMsWUFBVztBQUMxQyxRQUFJRSxrQkFBa0IsRUFBdEI7QUFDQSxRQUFJQyxPQUFPO0FBQ1Q5RCxrQkFBWTtBQUNWK0QsbUJBQVcsS0FBS2pFLE9BQUwsQ0FBYTBDLFVBQWIsRUFERDtBQUVWRixtQkFBVyxLQUFLQSxTQUFMLENBQWVDLENBRmhCO0FBR1Z5QixpQkFBUyxPQUhDO0FBSVZDLGtCQUFVO0FBSkEsT0FESDtBQU9UdEIsZ0JBQVU7QUFDUm9CLG1CQUFXLEtBQUtqRSxPQUFMLENBQWFwRyxTQUFiLEVBREg7QUFFUjRJLG1CQUFXLEtBQUtBLFNBQUwsQ0FBZUcsQ0FGbEI7QUFHUnVCLGlCQUFTLE1BSEQ7QUFJUkMsa0JBQVU7QUFKRjtBQVBELEtBQVg7O0FBZUEsU0FBSyxJQUFJQyxPQUFULElBQW9CSixJQUFwQixFQUEwQjtBQUN4QixVQUFJL0QsT0FBTytELEtBQUtJLE9BQUwsQ0FBWDtBQUNBLFVBQUlDLFlBQVlwRSxLQUFLZ0UsU0FBTCxHQUFpQmhFLEtBQUt1QyxTQUF0QztBQUNBLFVBQUlySCxZQUFZa0osWUFBWXBFLEtBQUtpRSxPQUFqQixHQUEyQmpFLEtBQUtrRSxRQUFoRDs7QUFFQSxXQUFLLElBQUkvQyxXQUFULElBQXdCLEtBQUt3QixTQUFMLENBQWV3QixPQUFmLENBQXhCLEVBQWlEO0FBQy9DLFlBQUlsQixXQUFXLEtBQUtOLFNBQUwsQ0FBZXdCLE9BQWYsRUFBd0JoRCxXQUF4QixDQUFmO0FBQ0EsWUFBSThCLFNBQVM5QyxZQUFULEtBQTBCLElBQTlCLEVBQW9DO0FBQ2xDO0FBQ0Q7QUFDRCxZQUFJa0Usd0JBQXdCckUsS0FBS3VDLFNBQUwsR0FBaUJVLFNBQVM5QyxZQUF0RDtBQUNBLFlBQUltRSx1QkFBdUJ0RSxLQUFLZ0UsU0FBTCxJQUFrQmYsU0FBUzlDLFlBQXREO0FBQ0EsWUFBSW9FLGlCQUFpQkYseUJBQXlCQyxvQkFBOUM7QUFDQSxZQUFJRSxrQkFBa0IsQ0FBQ0gscUJBQUQsSUFBMEIsQ0FBQ0Msb0JBQWpEO0FBQ0EsWUFBSUMsa0JBQWtCQyxlQUF0QixFQUF1QztBQUNyQ3ZCLG1CQUFTdkMsWUFBVCxDQUFzQnhGLFNBQXRCO0FBQ0E0SSwwQkFBZ0JiLFNBQVMzWSxLQUFULENBQWU3QixFQUEvQixJQUFxQ3dhLFNBQVMzWSxLQUE5QztBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxTQUFLLElBQUltYSxRQUFULElBQXFCWCxlQUFyQixFQUFzQztBQUNwQ0Esc0JBQWdCVyxRQUFoQixFQUEwQkMsYUFBMUI7QUFDRDs7QUFFRCxTQUFLbkMsU0FBTCxHQUFpQjtBQUNmQyxTQUFHdUIsS0FBSzlELFVBQUwsQ0FBZ0IrRCxTQURKO0FBRWZ0QixTQUFHcUIsS0FBS25CLFFBQUwsQ0FBY29CO0FBRkYsS0FBakI7QUFJRCxHQTlDRDs7QUFnREE7QUFDQXpELFVBQVE5WSxTQUFSLENBQWtCaWEsV0FBbEIsR0FBZ0MsWUFBVztBQUN6QztBQUNBLFFBQUksS0FBSzNaLE9BQUwsSUFBZ0IsS0FBS0EsT0FBTCxDQUFhNEIsTUFBakMsRUFBeUM7QUFDdkMsYUFBT2dXLFNBQVM4QixjQUFULEVBQVA7QUFDRDtBQUNEO0FBQ0EsV0FBTyxLQUFLMUIsT0FBTCxDQUFhMkIsV0FBYixFQUFQO0FBQ0QsR0FQRDs7QUFTQTtBQUNBbkIsVUFBUTlZLFNBQVIsQ0FBa0J1UixNQUFsQixHQUEyQixVQUFTaUssUUFBVCxFQUFtQjtBQUM1QyxXQUFPLEtBQUtOLFNBQUwsQ0FBZU0sU0FBU2pELElBQXhCLEVBQThCaUQsU0FBUzFZLEdBQXZDLENBQVA7QUFDQSxTQUFLMlksVUFBTDtBQUNELEdBSEQ7O0FBS0E7QUFDQTNDLFVBQVE5WSxTQUFSLENBQWtCdWEsVUFBbEIsR0FBK0IsWUFBVztBQUN4QztBQUNBLFFBQUksS0FBS2phLE9BQUwsSUFBZ0IsS0FBS0EsT0FBTCxDQUFhNEIsTUFBakMsRUFBeUM7QUFDdkMsYUFBT2dXLFNBQVNpQyxhQUFULEVBQVA7QUFDRDtBQUNEO0FBQ0EsV0FBTyxLQUFLN0IsT0FBTCxDQUFhaUMsVUFBYixFQUFQO0FBQ0QsR0FQRDs7QUFTQTtBQUNBO0FBQ0F6QixVQUFROVksU0FBUixDQUFrQm1aLE9BQWxCLEdBQTRCLFlBQVc7QUFDckMsUUFBSWxCLGVBQWUsRUFBbkI7QUFDQSxTQUFLLElBQUlNLElBQVQsSUFBaUIsS0FBSzJDLFNBQXRCLEVBQWlDO0FBQy9CLFdBQUssSUFBSXhCLFdBQVQsSUFBd0IsS0FBS3dCLFNBQUwsQ0FBZTNDLElBQWYsQ0FBeEIsRUFBOEM7QUFDNUNOLHFCQUFhelcsSUFBYixDQUFrQixLQUFLMFosU0FBTCxDQUFlM0MsSUFBZixFQUFxQm1CLFdBQXJCLENBQWxCO0FBQ0Q7QUFDRjtBQUNELFNBQUssSUFBSXBPLElBQUksQ0FBUixFQUFXcU8sTUFBTTFCLGFBQWFyVyxNQUFuQyxFQUEyQzBKLElBQUlxTyxHQUEvQyxFQUFvRHJPLEdBQXBELEVBQXlEO0FBQ3ZEMk0sbUJBQWEzTSxDQUFiLEVBQWdCNk4sT0FBaEI7QUFDRDtBQUNGLEdBVkQ7O0FBWUE7QUFDQTtBQUNBTCxVQUFROVksU0FBUixDQUFrQnNaLE9BQWxCLEdBQTRCLFlBQVc7QUFDckM7QUFDQSxRQUFJdUMsV0FBVyxLQUFLdmIsT0FBTCxJQUFnQixLQUFLQSxPQUFMLENBQWE0QixNQUE1QztBQUNBO0FBQ0EsUUFBSWdiLGdCQUFnQnJCLFdBQVd6WixTQUFYLEdBQXVCLEtBQUtrVyxPQUFMLENBQWF4SCxNQUFiLEVBQTNDO0FBQ0EsUUFBSXVMLGtCQUFrQixFQUF0QjtBQUNBLFFBQUlDLElBQUo7O0FBRUEsU0FBS0gsWUFBTDtBQUNBRyxXQUFPO0FBQ0w5RCxrQkFBWTtBQUNWMEUsdUJBQWVyQixXQUFXLENBQVgsR0FBZXFCLGNBQWNDLElBRGxDO0FBRVZDLHVCQUFldkIsV0FBVyxDQUFYLEdBQWUsS0FBS2YsU0FBTCxDQUFlQyxDQUZuQztBQUdWc0MsMEJBQWtCLEtBQUs5QyxVQUFMLEVBSFI7QUFJVk8sbUJBQVcsS0FBS0EsU0FBTCxDQUFlQyxDQUpoQjtBQUtWeUIsaUJBQVMsT0FMQztBQU1WQyxrQkFBVSxNQU5BO0FBT1ZhLG9CQUFZO0FBUEYsT0FEUDtBQVVMbkMsZ0JBQVU7QUFDUitCLHVCQUFlckIsV0FBVyxDQUFYLEdBQWVxQixjQUFjck0sR0FEcEM7QUFFUnVNLHVCQUFldkIsV0FBVyxDQUFYLEdBQWUsS0FBS2YsU0FBTCxDQUFlRyxDQUZyQztBQUdSb0MsMEJBQWtCLEtBQUtwRCxXQUFMLEVBSFY7QUFJUmEsbUJBQVcsS0FBS0EsU0FBTCxDQUFlRyxDQUpsQjtBQUtSdUIsaUJBQVMsTUFMRDtBQU1SQyxrQkFBVSxJQU5GO0FBT1JhLG9CQUFZO0FBUEo7QUFWTCxLQUFQOztBQXFCQSxTQUFLLElBQUlaLE9BQVQsSUFBb0JKLElBQXBCLEVBQTBCO0FBQ3hCLFVBQUkvRCxPQUFPK0QsS0FBS0ksT0FBTCxDQUFYO0FBQ0EsV0FBSyxJQUFJaEQsV0FBVCxJQUF3QixLQUFLd0IsU0FBTCxDQUFld0IsT0FBZixDQUF4QixFQUFpRDtBQUMvQyxZQUFJbEIsV0FBVyxLQUFLTixTQUFMLENBQWV3QixPQUFmLEVBQXdCaEQsV0FBeEIsQ0FBZjtBQUNBLFlBQUk2RCxhQUFhL0IsU0FBU2xQLE9BQVQsQ0FBaUJ3RSxNQUFsQztBQUNBLFlBQUkwTSxrQkFBa0JoQyxTQUFTOUMsWUFBL0I7QUFDQSxZQUFJK0UsZ0JBQWdCLENBQXBCO0FBQ0EsWUFBSUMsZ0JBQWdCRixtQkFBbUIsSUFBdkM7QUFDQSxZQUFJRyxlQUFKLEVBQXFCQyxlQUFyQixFQUFzQ0MsY0FBdEM7QUFDQSxZQUFJQyxpQkFBSixFQUF1QkMsZ0JBQXZCOztBQUVBLFlBQUl2QyxTQUFTbGIsT0FBVCxLQUFxQmtiLFNBQVNsYixPQUFULENBQWlCNEIsTUFBMUMsRUFBa0Q7QUFDaER1YiwwQkFBZ0JqQyxTQUFTbEQsT0FBVCxDQUFpQnhILE1BQWpCLEdBQTBCeUgsS0FBSytFLFVBQS9CLENBQWhCO0FBQ0Q7O0FBRUQsWUFBSSxPQUFPQyxVQUFQLEtBQXNCLFVBQTFCLEVBQXNDO0FBQ3BDQSx1QkFBYUEsV0FBVzVULEtBQVgsQ0FBaUI2UixRQUFqQixDQUFiO0FBQ0QsU0FGRCxNQUdLLElBQUksT0FBTytCLFVBQVAsS0FBc0IsUUFBMUIsRUFBb0M7QUFDdkNBLHVCQUFhak4sV0FBV2lOLFVBQVgsQ0FBYjtBQUNBLGNBQUkvQixTQUFTbFAsT0FBVCxDQUFpQndFLE1BQWpCLENBQXdCaEcsT0FBeEIsQ0FBZ0MsR0FBaEMsSUFBdUMsQ0FBRSxDQUE3QyxFQUFnRDtBQUM5Q3lTLHlCQUFhaFUsS0FBS3lVLElBQUwsQ0FBVXpGLEtBQUs4RSxnQkFBTCxHQUF3QkUsVUFBeEIsR0FBcUMsR0FBL0MsQ0FBYjtBQUNEO0FBQ0Y7O0FBRURJLDBCQUFrQnBGLEtBQUs2RSxhQUFMLEdBQXFCN0UsS0FBSzJFLGFBQTVDO0FBQ0ExQixpQkFBUzlDLFlBQVQsR0FBd0JuUCxLQUFLMEgsS0FBTCxDQUFXd00sZ0JBQWdCRSxlQUFoQixHQUFrQ0osVUFBN0MsQ0FBeEI7QUFDQUssMEJBQWtCSixrQkFBa0JqRixLQUFLdUMsU0FBekM7QUFDQStDLHlCQUFpQnJDLFNBQVM5QyxZQUFULElBQXlCSCxLQUFLdUMsU0FBL0M7QUFDQWdELDRCQUFvQkYsbUJBQW1CQyxjQUF2QztBQUNBRSwyQkFBbUIsQ0FBQ0gsZUFBRCxJQUFvQixDQUFDQyxjQUF4Qzs7QUFFQSxZQUFJLENBQUNILGFBQUQsSUFBa0JJLGlCQUF0QixFQUF5QztBQUN2Q3RDLG1CQUFTdkMsWUFBVCxDQUFzQlYsS0FBS2tFLFFBQTNCO0FBQ0FKLDBCQUFnQmIsU0FBUzNZLEtBQVQsQ0FBZTdCLEVBQS9CLElBQXFDd2EsU0FBUzNZLEtBQTlDO0FBQ0QsU0FIRCxNQUlLLElBQUksQ0FBQzZhLGFBQUQsSUFBa0JLLGdCQUF0QixFQUF3QztBQUMzQ3ZDLG1CQUFTdkMsWUFBVCxDQUFzQlYsS0FBS2lFLE9BQTNCO0FBQ0FILDBCQUFnQmIsU0FBUzNZLEtBQVQsQ0FBZTdCLEVBQS9CLElBQXFDd2EsU0FBUzNZLEtBQTlDO0FBQ0QsU0FISSxNQUlBLElBQUk2YSxpQkFBaUJuRixLQUFLdUMsU0FBTCxJQUFrQlUsU0FBUzlDLFlBQWhELEVBQThEO0FBQ2pFOEMsbUJBQVN2QyxZQUFULENBQXNCVixLQUFLaUUsT0FBM0I7QUFDQUgsMEJBQWdCYixTQUFTM1ksS0FBVCxDQUFlN0IsRUFBL0IsSUFBcUN3YSxTQUFTM1ksS0FBOUM7QUFDRDtBQUNGO0FBQ0Y7O0FBRURxVixhQUFTK0QscUJBQVQsQ0FBK0IsWUFBVztBQUN4QyxXQUFLLElBQUllLFFBQVQsSUFBcUJYLGVBQXJCLEVBQXNDO0FBQ3BDQSx3QkFBZ0JXLFFBQWhCLEVBQTBCQyxhQUExQjtBQUNEO0FBQ0YsS0FKRDs7QUFNQSxXQUFPLElBQVA7QUFDRCxHQXBGRDs7QUFzRkE7QUFDQW5FLFVBQVFDLHFCQUFSLEdBQWdDLFVBQVN6WSxPQUFULEVBQWtCO0FBQ2hELFdBQU93WSxRQUFRbUYsYUFBUixDQUFzQjNkLE9BQXRCLEtBQWtDLElBQUl3WSxPQUFKLENBQVl4WSxPQUFaLENBQXpDO0FBQ0QsR0FGRDs7QUFJQTtBQUNBd1ksVUFBUWlCLFVBQVIsR0FBcUIsWUFBVztBQUM5QixTQUFLLElBQUltRSxTQUFULElBQXNCeEQsUUFBdEIsRUFBZ0M7QUFDOUJBLGVBQVN3RCxTQUFULEVBQW9CNUUsT0FBcEI7QUFDRDtBQUNGLEdBSkQ7O0FBTUE7QUFDQTtBQUNBUixVQUFRbUYsYUFBUixHQUF3QixVQUFTM2QsT0FBVCxFQUFrQjtBQUN4QyxXQUFPb2EsU0FBU3BhLFFBQVE4YSxrQkFBakIsQ0FBUDtBQUNELEdBRkQ7O0FBSUFsWixTQUFPeU4sTUFBUCxHQUFnQixZQUFXO0FBQ3pCLFFBQUlnTCxhQUFKLEVBQW1CO0FBQ2pCQTtBQUNEO0FBQ0Q3QixZQUFRaUIsVUFBUjtBQUNELEdBTEQ7O0FBUUE3QixXQUFTK0QscUJBQVQsR0FBaUMsVUFBU2pNLFFBQVQsRUFBbUI7QUFDbEQsUUFBSW1PLFlBQVlqYyxPQUFPK1oscUJBQVAsSUFDZC9aLE9BQU9rYyx3QkFETyxJQUVkbGMsT0FBT21jLDJCQUZPLElBR2Q1RCx5QkFIRjtBQUlBMEQsY0FBVWplLElBQVYsQ0FBZWdDLE1BQWYsRUFBdUI4TixRQUF2QjtBQUNELEdBTkQ7QUFPQWtJLFdBQVNZLE9BQVQsR0FBbUJBLE9BQW5CO0FBQ0QsQ0FwVEMsR0FBRCxDQXFUQyxhQUFXO0FBQ1g7O0FBRUEsV0FBU3dGLGNBQVQsQ0FBd0IxUyxDQUF4QixFQUEyQkMsQ0FBM0IsRUFBOEI7QUFDNUIsV0FBT0QsRUFBRThNLFlBQUYsR0FBaUI3TSxFQUFFNk0sWUFBMUI7QUFDRDs7QUFFRCxXQUFTNkYscUJBQVQsQ0FBK0IzUyxDQUEvQixFQUFrQ0MsQ0FBbEMsRUFBcUM7QUFDbkMsV0FBT0EsRUFBRTZNLFlBQUYsR0FBaUI5TSxFQUFFOE0sWUFBMUI7QUFDRDs7QUFFRCxNQUFJM0YsU0FBUztBQUNYb0ksY0FBVSxFQURDO0FBRVgzQyxnQkFBWTtBQUZELEdBQWI7QUFJQSxNQUFJTixXQUFXaFcsT0FBT2dXLFFBQXRCOztBQUVBO0FBQ0EsV0FBU1MsS0FBVCxDQUFlck0sT0FBZixFQUF3QjtBQUN0QixTQUFLdU0sSUFBTCxHQUFZdk0sUUFBUXVNLElBQXBCO0FBQ0EsU0FBS04sSUFBTCxHQUFZak0sUUFBUWlNLElBQXBCO0FBQ0EsU0FBS3ZYLEVBQUwsR0FBVSxLQUFLNlgsSUFBTCxHQUFZLEdBQVosR0FBa0IsS0FBS04sSUFBakM7QUFDQSxTQUFLMkMsU0FBTCxHQUFpQixFQUFqQjtBQUNBLFNBQUtzRCxrQkFBTDtBQUNBekwsV0FBTyxLQUFLd0YsSUFBWixFQUFrQixLQUFLTSxJQUF2QixJQUErQixJQUEvQjtBQUNEOztBQUVEO0FBQ0FGLFFBQU0zWSxTQUFOLENBQWdCa1IsR0FBaEIsR0FBc0IsVUFBU3NLLFFBQVQsRUFBbUI7QUFDdkMsU0FBS04sU0FBTCxDQUFlMVosSUFBZixDQUFvQmdhLFFBQXBCO0FBQ0QsR0FGRDs7QUFJQTtBQUNBN0MsUUFBTTNZLFNBQU4sQ0FBZ0J3ZSxrQkFBaEIsR0FBcUMsWUFBVztBQUM5QyxTQUFLQyxhQUFMLEdBQXFCO0FBQ25CQyxVQUFJLEVBRGU7QUFFbkJDLFlBQU0sRUFGYTtBQUduQnhCLFlBQU0sRUFIYTtBQUluQnlCLGFBQU87QUFKWSxLQUFyQjtBQU1ELEdBUEQ7O0FBU0E7QUFDQWpHLFFBQU0zWSxTQUFOLENBQWdCaWQsYUFBaEIsR0FBZ0MsWUFBVztBQUN6QyxTQUFLLElBQUl4SixTQUFULElBQXNCLEtBQUtnTCxhQUEzQixFQUEwQztBQUN4QyxVQUFJdkQsWUFBWSxLQUFLdUQsYUFBTCxDQUFtQmhMLFNBQW5CLENBQWhCO0FBQ0EsVUFBSW9MLFVBQVVwTCxjQUFjLElBQWQsSUFBc0JBLGNBQWMsTUFBbEQ7QUFDQXlILGdCQUFVNEQsSUFBVixDQUFlRCxVQUFVTixxQkFBVixHQUFrQ0QsY0FBakQ7QUFDQSxXQUFLLElBQUloVCxJQUFJLENBQVIsRUFBV3FPLE1BQU11QixVQUFVdFosTUFBaEMsRUFBd0MwSixJQUFJcU8sR0FBNUMsRUFBaURyTyxLQUFLLENBQXRELEVBQXlEO0FBQ3ZELFlBQUlrUSxXQUFXTixVQUFVNVAsQ0FBVixDQUFmO0FBQ0EsWUFBSWtRLFNBQVNsUCxPQUFULENBQWlCZ08sVUFBakIsSUFBK0JoUCxNQUFNNFAsVUFBVXRaLE1BQVYsR0FBbUIsQ0FBNUQsRUFBK0Q7QUFDN0Q0WixtQkFBU3RDLE9BQVQsQ0FBaUIsQ0FBQ3pGLFNBQUQsQ0FBakI7QUFDRDtBQUNGO0FBQ0Y7QUFDRCxTQUFLK0ssa0JBQUw7QUFDRCxHQWJEOztBQWVBO0FBQ0E3RixRQUFNM1ksU0FBTixDQUFnQjBGLElBQWhCLEdBQXVCLFVBQVM4VixRQUFULEVBQW1CO0FBQ3hDLFNBQUtOLFNBQUwsQ0FBZTRELElBQWYsQ0FBb0JSLGNBQXBCO0FBQ0EsUUFBSXZZLFFBQVFtUyxTQUFTRyxPQUFULENBQWlCMEcsT0FBakIsQ0FBeUJ2RCxRQUF6QixFQUFtQyxLQUFLTixTQUF4QyxDQUFaO0FBQ0EsUUFBSThELFNBQVNqWixVQUFVLEtBQUttVixTQUFMLENBQWV0WixNQUFmLEdBQXdCLENBQS9DO0FBQ0EsV0FBT29kLFNBQVMsSUFBVCxHQUFnQixLQUFLOUQsU0FBTCxDQUFlblYsUUFBUSxDQUF2QixDQUF2QjtBQUNELEdBTEQ7O0FBT0E7QUFDQTRTLFFBQU0zWSxTQUFOLENBQWdCdVosUUFBaEIsR0FBMkIsVUFBU2lDLFFBQVQsRUFBbUI7QUFDNUMsU0FBS04sU0FBTCxDQUFlNEQsSUFBZixDQUFvQlIsY0FBcEI7QUFDQSxRQUFJdlksUUFBUW1TLFNBQVNHLE9BQVQsQ0FBaUIwRyxPQUFqQixDQUF5QnZELFFBQXpCLEVBQW1DLEtBQUtOLFNBQXhDLENBQVo7QUFDQSxXQUFPblYsUUFBUSxLQUFLbVYsU0FBTCxDQUFlblYsUUFBUSxDQUF2QixDQUFSLEdBQW9DLElBQTNDO0FBQ0QsR0FKRDs7QUFNQTtBQUNBNFMsUUFBTTNZLFNBQU4sQ0FBZ0JpWixZQUFoQixHQUErQixVQUFTdUMsUUFBVCxFQUFtQi9ILFNBQW5CLEVBQThCO0FBQzNELFNBQUtnTCxhQUFMLENBQW1CaEwsU0FBbkIsRUFBOEJqUyxJQUE5QixDQUFtQ2dhLFFBQW5DO0FBQ0QsR0FGRDs7QUFJQTtBQUNBN0MsUUFBTTNZLFNBQU4sQ0FBZ0J1UixNQUFoQixHQUF5QixVQUFTaUssUUFBVCxFQUFtQjtBQUMxQyxRQUFJelYsUUFBUW1TLFNBQVNHLE9BQVQsQ0FBaUIwRyxPQUFqQixDQUF5QnZELFFBQXpCLEVBQW1DLEtBQUtOLFNBQXhDLENBQVo7QUFDQSxRQUFJblYsUUFBUSxDQUFDLENBQWIsRUFBZ0I7QUFDZCxXQUFLbVYsU0FBTCxDQUFlL1AsTUFBZixDQUFzQnBGLEtBQXRCLEVBQTZCLENBQTdCO0FBQ0Q7QUFDRixHQUxEOztBQU9BO0FBQ0E7QUFDQTRTLFFBQU0zWSxTQUFOLENBQWdCa1YsS0FBaEIsR0FBd0IsWUFBVztBQUNqQyxXQUFPLEtBQUtnRyxTQUFMLENBQWUsQ0FBZixDQUFQO0FBQ0QsR0FGRDs7QUFJQTtBQUNBO0FBQ0F2QyxRQUFNM1ksU0FBTixDQUFnQmlmLElBQWhCLEdBQXVCLFlBQVc7QUFDaEMsV0FBTyxLQUFLL0QsU0FBTCxDQUFlLEtBQUtBLFNBQUwsQ0FBZXRaLE1BQWYsR0FBd0IsQ0FBdkMsQ0FBUDtBQUNELEdBRkQ7O0FBSUE7QUFDQStXLFFBQU1DLFlBQU4sR0FBcUIsVUFBU3RNLE9BQVQsRUFBa0I7QUFDckMsV0FBT3lHLE9BQU96RyxRQUFRaU0sSUFBZixFQUFxQmpNLFFBQVF1TSxJQUE3QixLQUFzQyxJQUFJRixLQUFKLENBQVVyTSxPQUFWLENBQTdDO0FBQ0QsR0FGRDs7QUFJQTRMLFdBQVNTLEtBQVQsR0FBaUJBLEtBQWpCO0FBQ0QsQ0F4R0MsR0FBRCxDQXlHQyxhQUFXO0FBQ1g7O0FBRUEsTUFBSS9ZLElBQUlzQyxPQUFPNEYsTUFBZjtBQUNBLE1BQUlvUSxXQUFXaFcsT0FBT2dXLFFBQXRCOztBQUVBLFdBQVNnSCxhQUFULENBQXVCNWUsT0FBdkIsRUFBZ0M7QUFDOUIsU0FBSzZlLFFBQUwsR0FBZ0J2ZixFQUFFVSxPQUFGLENBQWhCO0FBQ0Q7O0FBRURWLElBQUVnRCxJQUFGLENBQU8sQ0FDTCxhQURLLEVBRUwsWUFGSyxFQUdMLEtBSEssRUFJTCxRQUpLLEVBS0wsSUFMSyxFQU1MLGFBTkssRUFPTCxZQVBLLEVBUUwsWUFSSyxFQVNMLFdBVEssQ0FBUCxFQVVHLFVBQVMwSSxDQUFULEVBQVlvRSxNQUFaLEVBQW9CO0FBQ3JCd1Asa0JBQWNsZixTQUFkLENBQXdCMFAsTUFBeEIsSUFBa0MsWUFBVztBQUMzQyxVQUFJckUsT0FBT3RMLE1BQU1DLFNBQU4sQ0FBZ0JDLEtBQWhCLENBQXNCQyxJQUF0QixDQUEyQmtmLFNBQTNCLENBQVg7QUFDQSxhQUFPLEtBQUtELFFBQUwsQ0FBY3pQLE1BQWQsRUFBc0IvRixLQUF0QixDQUE0QixLQUFLd1YsUUFBakMsRUFBMkM5VCxJQUEzQyxDQUFQO0FBQ0QsS0FIRDtBQUlELEdBZkQ7O0FBaUJBekwsSUFBRWdELElBQUYsQ0FBTyxDQUNMLFFBREssRUFFTCxTQUZLLEVBR0wsZUFISyxDQUFQLEVBSUcsVUFBUzBJLENBQVQsRUFBWW9FLE1BQVosRUFBb0I7QUFDckJ3UCxrQkFBY3hQLE1BQWQsSUFBd0I5UCxFQUFFOFAsTUFBRixDQUF4QjtBQUNELEdBTkQ7O0FBUUF3SSxXQUFTbUMsUUFBVCxDQUFrQjdZLElBQWxCLENBQXVCO0FBQ3JCcVgsVUFBTSxRQURlO0FBRXJCUixhQUFTNkc7QUFGWSxHQUF2QjtBQUlBaEgsV0FBU0csT0FBVCxHQUFtQjZHLGFBQW5CO0FBQ0QsQ0F4Q0MsR0FBRCxDQXlDQyxhQUFXO0FBQ1g7O0FBRUEsTUFBSWhILFdBQVdoVyxPQUFPZ1csUUFBdEI7O0FBRUEsV0FBU21ILGVBQVQsQ0FBeUJDLFNBQXpCLEVBQW9DO0FBQ2xDLFdBQU8sWUFBVztBQUNoQixVQUFJcEUsWUFBWSxFQUFoQjtBQUNBLFVBQUlxRSxZQUFZSCxVQUFVLENBQVYsQ0FBaEI7O0FBRUEsVUFBSUUsVUFBVTlXLFVBQVYsQ0FBcUI0VyxVQUFVLENBQVYsQ0FBckIsQ0FBSixFQUF3QztBQUN0Q0csb0JBQVlELFVBQVUvVyxNQUFWLENBQWlCLEVBQWpCLEVBQXFCNlcsVUFBVSxDQUFWLENBQXJCLENBQVo7QUFDQUcsa0JBQVVuSCxPQUFWLEdBQW9CZ0gsVUFBVSxDQUFWLENBQXBCO0FBQ0Q7O0FBRUQsV0FBS3hjLElBQUwsQ0FBVSxZQUFXO0FBQ25CLFlBQUkwSixVQUFVZ1QsVUFBVS9XLE1BQVYsQ0FBaUIsRUFBakIsRUFBcUJnWCxTQUFyQixFQUFnQztBQUM1Q2pmLG1CQUFTO0FBRG1DLFNBQWhDLENBQWQ7QUFHQSxZQUFJLE9BQU9nTSxRQUFReE0sT0FBZixLQUEyQixRQUEvQixFQUF5QztBQUN2Q3dNLGtCQUFReE0sT0FBUixHQUFrQndmLFVBQVUsSUFBVixFQUFnQi9lLE9BQWhCLENBQXdCK0wsUUFBUXhNLE9BQWhDLEVBQXlDLENBQXpDLENBQWxCO0FBQ0Q7QUFDRG9iLGtCQUFVMVosSUFBVixDQUFlLElBQUkwVyxRQUFKLENBQWE1TCxPQUFiLENBQWY7QUFDRCxPQVJEOztBQVVBLGFBQU80TyxTQUFQO0FBQ0QsS0FwQkQ7QUFxQkQ7O0FBRUQsTUFBSWhaLE9BQU80RixNQUFYLEVBQW1CO0FBQ2pCNUYsV0FBTzRGLE1BQVAsQ0FBY0MsRUFBZCxDQUFpQnlULFFBQWpCLEdBQTRCNkQsZ0JBQWdCbmQsT0FBTzRGLE1BQXZCLENBQTVCO0FBQ0Q7QUFDRCxNQUFJNUYsT0FBT3NkLEtBQVgsRUFBa0I7QUFDaEJ0ZCxXQUFPc2QsS0FBUCxDQUFhelgsRUFBYixDQUFnQnlULFFBQWhCLEdBQTJCNkQsZ0JBQWdCbmQsT0FBT3NkLEtBQXZCLENBQTNCO0FBQ0Q7QUFDRixDQW5DQyxHQUFEOzs7QUNqbkJEOzs7Ozs7Ozs7O0FBVUEsQ0FBQyxDQUFDLFVBQVM1ZixDQUFULEVBQVk7O0FBRVpBLElBQUVtSSxFQUFGLENBQUswWCxRQUFMLEdBQWdCLFVBQVNuVCxPQUFULEVBQWtCO0FBQ2hDLFFBQUlvVCxLQUFLOWYsRUFBRXNDLE1BQUYsQ0FBVDtBQUFBLFFBQ0V3SyxXQUFXLElBRGI7QUFBQSxRQUVFN00sV0FBVyxLQUFLQSxRQUZsQjtBQUFBLFFBR0U4ZixNQUhGO0FBQUEsUUFJRUMsS0FKRjtBQUFBLFFBS0V0VCxVQUFVMU0sRUFBRTJJLE1BQUYsQ0FBUztBQUNqQnNYLGNBQVEsVUFEUyxFQUNHO0FBQ3JCM00sZ0JBQVUsR0FGUSxFQUVFO0FBQ3BCNE0saUJBQVcsR0FITyxFQUdFO0FBQ3BCQyxpQkFBVyxJQUpPLEVBSUU7QUFDcEJDLFlBQU0sSUFMWSxFQUtFO0FBQ25CQyxpQkFBVyxLQU5NLENBTUc7QUFOSCxLQUFULEVBT1AzVCxPQVBPLENBTFo7O0FBY0E7QUFDQSxhQUFTNFQsSUFBVCxDQUFjblcsQ0FBZCxFQUFpQjtBQUNmLFVBQUlvVyxLQUFLdmdCLEVBQUVtSyxDQUFGLENBQVQ7QUFBQSxVQUNFcVcsU0FBU0QsR0FBR2hiLElBQUgsQ0FBUW1ILFFBQVF1VCxNQUFoQixDQURYO0FBQUEsVUFFRTdWLE9BQU9tVyxHQUFHclUsSUFBSCxDQUFRLFNBQVIsQ0FGVDtBQUdBLFVBQUlzVSxNQUFKLEVBQVk7QUFDVkQsV0FBR2hkLFFBQUgsQ0FBWSxjQUFaOztBQUVBO0FBQ0E7QUFDQSxZQUFJLGdEQUFnRHVVLElBQWhELENBQXFEMU4sSUFBckQsQ0FBSixFQUFnRTtBQUM5RG1XLGFBQUdoYixJQUFILENBQVEsS0FBUixFQUFlaWIsTUFBZjtBQUNBRCxhQUFHLENBQUgsRUFBTXhRLE1BQU4sR0FBZSxVQUFTM0csRUFBVCxFQUFhO0FBQUUyRyxtQkFBT3dRLEVBQVA7QUFBYSxXQUEzQztBQUNELFNBSEQsTUFJSyxJQUFJQSxHQUFHNU4sSUFBSCxDQUFRLFFBQVIsQ0FBSixFQUF1QjtBQUMxQjNTLFlBQUVxZ0IsU0FBRixDQUFZRyxNQUFaLEVBQW9CLFVBQVNwWCxFQUFULEVBQWE7QUFBRTJHLG1CQUFPd1EsRUFBUDtBQUFhLFdBQWhEO0FBQ0QsU0FGSSxNQUdBO0FBQ0g7QUFDQUEsYUFBR0QsSUFBSCxDQUFRRSxNQUFSLEVBQWdCLFVBQVNwWCxFQUFULEVBQWE7QUFBRTJHLG1CQUFPd1EsRUFBUDtBQUFhLFdBQTVDO0FBQ0Q7QUFDRixPQWhCRCxNQWlCSztBQUNIeFEsZUFBT3dRLEVBQVAsRUFERyxDQUNTO0FBQ2I7QUFDRjs7QUFFRDtBQUNBLGFBQVN4USxNQUFULENBQWdCNUYsQ0FBaEIsRUFBbUI7O0FBRWpCO0FBQ0FBLFFBQUUxSCxXQUFGLENBQWMsY0FBZDtBQUNBMEgsUUFBRTVHLFFBQUYsQ0FBVyxhQUFYOztBQUVBO0FBQ0E0RyxRQUFFbVAsT0FBRixDQUFVLFVBQVY7QUFDRDs7QUFFRDtBQUNBLGFBQVNtSCxPQUFULEdBQW1CO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLFVBQUlyRyxpQkFBa0IsT0FBTzlYLE9BQU8rWCxXQUFkLEtBQThCLFdBQS9CLEdBQThDL1gsT0FBTytYLFdBQXJELEdBQW1FeUYsR0FBR1ksTUFBSCxFQUF4Rjs7QUFFQTtBQUNBLFVBQUlDLE1BQU9yZSxPQUFPK1gsV0FBUCxHQUFxQi9YLE9BQU9zZSxPQUE3QixJQUF5Q3JnQixTQUFTd1UsSUFBVCxDQUFjOEwsWUFBakU7O0FBRUE7QUFDQSxVQUFJQyxTQUFTaFUsU0FBUzVHLE1BQVQsQ0FBZ0IsWUFBVztBQUN0QyxZQUFJcWEsS0FBS3ZnQixFQUFFLElBQUYsQ0FBVDtBQUNBLFlBQUl1Z0IsR0FBR3BQLEdBQUgsQ0FBTyxTQUFQLEtBQXFCLE1BQXpCLEVBQWlDOztBQUVqQyxZQUFJNFAsS0FBS2pCLEdBQUd4TixTQUFILEVBQVQ7QUFBQSxZQUNFME8sS0FBS0QsS0FBSzNHLGNBRFo7QUFBQSxZQUVFNkcsS0FBS1YsR0FBR3JQLE1BQUgsR0FBWUQsR0FGbkI7QUFBQSxZQUdFaVEsS0FBS0QsS0FBS1YsR0FBR0csTUFBSCxFQUhaOztBQUtBLGVBQVFRLE1BQU1ILEtBQUtyVSxRQUFRd1QsU0FBbkIsSUFDTmUsTUFBTUQsS0FBS3RVLFFBQVF3VCxTQURkLElBQzRCUyxHQURuQztBQUVELE9BWFksQ0FBYjs7QUFhQVosZUFBU2UsT0FBT3hILE9BQVAsQ0FBZSxVQUFmLENBQVQ7QUFDQXhNLGlCQUFXQSxTQUFTaUYsR0FBVCxDQUFhZ08sTUFBYixDQUFYO0FBQ0Q7O0FBRUQ7QUFDQSxhQUFTaGMsSUFBVCxDQUFjb2QsR0FBZCxFQUFtQjs7QUFFakI7QUFDQUEsVUFBSUMsR0FBSixDQUFRLFVBQVIsRUFBb0IsWUFBVztBQUM3QmQsYUFBSyxJQUFMO0FBQ0QsT0FGRDs7QUFJQUc7QUFDRDs7QUFFRDtBQUNBWCxPQUFHbmIsRUFBSCxDQUFNLHFDQUFOLEVBQTZDLFVBQVN5RSxFQUFULEVBQWE7QUFDeEQsVUFBSTRXLEtBQUosRUFDRXRXLGFBQWFzVyxLQUFiLEVBRnNELENBRWpDO0FBQ3ZCQSxjQUFRaFcsV0FBVyxZQUFXO0FBQUU4VixXQUFHeEcsT0FBSCxDQUFXLFlBQVg7QUFBMkIsT0FBbkQsRUFBcUQ1TSxRQUFRNEcsUUFBN0QsQ0FBUjtBQUNELEtBSkQ7O0FBTUF3TSxPQUFHbmIsRUFBSCxDQUFNLGlCQUFOLEVBQXlCLFVBQVN5RSxFQUFULEVBQWE7QUFDcENxWDtBQUNELEtBRkQ7O0FBSUE7QUFDQSxRQUFJL1QsUUFBUTBULElBQVosRUFBa0I7QUFDaEJwZ0IsUUFBRU8sUUFBRixFQUFZb0UsRUFBWixDQUFlLGtCQUFmLEVBQW1DLFlBQVc7QUFDNUMsWUFBSTRiLEtBQUt2Z0IsRUFBRUMsUUFBRixFQUFZOFIsR0FBWixDQUFnQixjQUFoQixFQUFnQ0EsR0FBaEMsQ0FBb0MsZUFBcEMsQ0FBVDs7QUFFQWpGLG1CQUFXQSxTQUFTd0UsR0FBVCxDQUFhaVAsRUFBYixDQUFYO0FBQ0F4YyxhQUFLd2MsRUFBTDtBQUNELE9BTEQ7QUFNRDs7QUFFRDtBQUNBLFFBQUk3VCxRQUFReVQsU0FBUixJQUFxQjdkLE9BQU8rZSxVQUFoQyxFQUE0QztBQUN4Qy9lLGFBQ0crZSxVQURILENBQ2MsT0FEZCxFQUVHQyxXQUZILENBRWUsVUFBVUMsR0FBVixFQUFlO0FBQzFCLFlBQUlBLElBQUl0VCxPQUFSLEVBQWlCO0FBQ2ZqTyxZQUFFQyxRQUFGLEVBQVlxWixPQUFaLENBQW9CLFVBQXBCO0FBQ0Q7QUFDRixPQU5IO0FBT0g7O0FBRUR2VixTQUFLLElBQUw7QUFDQSxXQUFPLElBQVA7QUFDRCxHQTlIRDs7QUFnSUE7QUFDQS9ELElBQUVtSSxFQUFGLENBQUtxWixVQUFMLEdBQWtCLFVBQVM5VSxPQUFULEVBQWtCO0FBQ2xDLFFBQUlvVCxLQUFLOWYsRUFBRXNDLE1BQUYsQ0FBVDtBQUNBd2QsT0FBR2pXLEdBQUgsQ0FBTyxxQ0FBUDtBQUNBaVcsT0FBR2pXLEdBQUgsQ0FBTyxpQkFBUDtBQUNBN0osTUFBRU8sUUFBRixFQUFZc0osR0FBWixDQUFnQixrQkFBaEI7QUFDRCxHQUxEO0FBT0QsQ0ExSUEsRUEwSUUzQixNQTFJRjs7Ozs7QUNWRDs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTtBQUNBLENBQUUsV0FBU29DLE9BQVQsRUFBa0I7QUFDaEI7O0FBQ0EsUUFBSSxPQUFPQyxNQUFQLEtBQWtCLFVBQWxCLElBQWdDQSxPQUFPQyxHQUEzQyxFQUFnRDtBQUM1Q0QsZUFBTyxDQUFDLFFBQUQsQ0FBUCxFQUFtQkQsT0FBbkI7QUFDSCxLQUZELE1BRU8sSUFBSSxPQUFPSSxPQUFQLEtBQW1CLFdBQXZCLEVBQW9DO0FBQ3ZDRCxlQUFPQyxPQUFQLEdBQWlCSixRQUFRdUIsUUFBUSxRQUFSLENBQVIsQ0FBakI7QUFDSCxLQUZNLE1BRUE7QUFDSHZCLGdCQUFRcEMsTUFBUjtBQUNIO0FBRUosQ0FWQyxFQVVBLFVBQVNsSSxDQUFULEVBQVk7QUFDVjs7QUFDQSxRQUFJeWhCLFFBQVFuZixPQUFPbWYsS0FBUCxJQUFnQixFQUE1Qjs7QUFFQUEsWUFBUyxZQUFXOztBQUVoQixZQUFJQyxjQUFjLENBQWxCOztBQUVBLGlCQUFTRCxLQUFULENBQWUvZ0IsT0FBZixFQUF3QmloQixRQUF4QixFQUFrQzs7QUFFOUIsZ0JBQUlDLElBQUksSUFBUjtBQUFBLGdCQUFjQyxZQUFkOztBQUVBRCxjQUFFbE8sUUFBRixHQUFhO0FBQ1RvTywrQkFBZSxJQUROO0FBRVRDLGdDQUFnQixLQUZQO0FBR1RDLDhCQUFjaGlCLEVBQUVVLE9BQUYsQ0FITDtBQUlUdWhCLDRCQUFZamlCLEVBQUVVLE9BQUYsQ0FKSDtBQUtUd2hCLHdCQUFRLElBTEM7QUFNVEMsMEJBQVUsSUFORDtBQU9UQywyQkFBVyxrRkFQRjtBQVFUQywyQkFBVywwRUFSRjtBQVNUQywwQkFBVSxLQVREO0FBVVRDLCtCQUFlLElBVk47QUFXVEMsNEJBQVksS0FYSDtBQVlUQywrQkFBZSxNQVpOO0FBYVRDLHlCQUFTLE1BYkE7QUFjVEMsOEJBQWMsc0JBQVNDLE1BQVQsRUFBaUJsWCxDQUFqQixFQUFvQjtBQUM5QiwyQkFBTzFMLEVBQUUsMEJBQUYsRUFBOEI2aUIsSUFBOUIsQ0FBbUNuWCxJQUFJLENBQXZDLENBQVA7QUFDSCxpQkFoQlE7QUFpQlRvWCxzQkFBTSxLQWpCRztBQWtCVEMsMkJBQVcsWUFsQkY7QUFtQlRDLDJCQUFXLElBbkJGO0FBb0JUNU8sd0JBQVEsUUFwQkM7QUFxQlQ2Tyw4QkFBYyxJQXJCTDtBQXNCVEMsc0JBQU0sS0F0Qkc7QUF1QlRDLCtCQUFlLEtBdkJOO0FBd0JUQywrQkFBZSxLQXhCTjtBQXlCVEMsMEJBQVUsSUF6QkQ7QUEwQlRDLDhCQUFjLENBMUJMO0FBMkJUQywwQkFBVSxVQTNCRDtBQTRCVEMsNkJBQWEsS0E1Qko7QUE2QlRDLDhCQUFjLElBN0JMO0FBOEJUQyw4QkFBYyxJQTlCTDtBQStCVEMsa0NBQWtCLEtBL0JUO0FBZ0NUQywyQkFBVyxRQWhDRjtBQWlDVEMsNEJBQVksSUFqQ0g7QUFrQ1Q5UyxzQkFBTSxDQWxDRztBQW1DVCtTLHFCQUFLLEtBbkNJO0FBb0NUQyx1QkFBTyxFQXBDRTtBQXFDVEMsOEJBQWMsQ0FyQ0w7QUFzQ1RDLDhCQUFjLENBdENMO0FBdUNUQyxnQ0FBZ0IsQ0F2Q1A7QUF3Q1Q3UCx1QkFBTyxHQXhDRTtBQXlDVDhQLHVCQUFPLElBekNFO0FBMENUQyw4QkFBYyxLQTFDTDtBQTJDVEMsMkJBQVcsSUEzQ0Y7QUE0Q1RDLGdDQUFnQixDQTVDUDtBQTZDVEMsd0JBQVEsSUE3Q0M7QUE4Q1RDLDhCQUFjLElBOUNMO0FBK0NUQywrQkFBZSxLQS9DTjtBQWdEVGxKLDBCQUFVLEtBaEREO0FBaURUbUosaUNBQWlCLEtBakRSO0FBa0RUQyxnQ0FBZ0IsSUFsRFA7QUFtRFRDLHdCQUFRO0FBbkRDLGFBQWI7O0FBc0RBaEQsY0FBRWlELFFBQUYsR0FBYTtBQUNUQywyQkFBVyxLQURGO0FBRVRDLDBCQUFVLEtBRkQ7QUFHVEMsK0JBQWUsSUFITjtBQUlUQyxrQ0FBa0IsQ0FKVDtBQUtUQyw2QkFBYSxJQUxKO0FBTVRDLDhCQUFjLENBTkw7QUFPVHRSLDJCQUFXLENBUEY7QUFRVHVSLHVCQUFPLElBUkU7QUFTVEMsMkJBQVcsSUFURjtBQVVUQyw0QkFBWSxJQVZIO0FBV1RDLDJCQUFXLENBWEY7QUFZVEMsNEJBQVksSUFaSDtBQWFUQyw0QkFBWSxJQWJIO0FBY1RDLDJCQUFXLEtBZEY7QUFlVEMsNEJBQVksSUFmSDtBQWdCVEMsNEJBQVksSUFoQkg7QUFpQlRDLDZCQUFhLElBakJKO0FBa0JUQyx5QkFBUyxJQWxCQTtBQW1CVEMseUJBQVMsS0FuQkE7QUFvQlRDLDZCQUFhLENBcEJKO0FBcUJUQywyQkFBVyxJQXJCRjtBQXNCVEMseUJBQVMsS0F0QkE7QUF1QlRDLHVCQUFPLElBdkJFO0FBd0JUQyw2QkFBYSxFQXhCSjtBQXlCVEMsbUNBQW1CLEtBekJWO0FBMEJUQywyQkFBVztBQTFCRixhQUFiOztBQTZCQXRtQixjQUFFMkksTUFBRixDQUFTaVosQ0FBVCxFQUFZQSxFQUFFaUQsUUFBZDs7QUFFQWpELGNBQUUyRSxnQkFBRixHQUFxQixJQUFyQjtBQUNBM0UsY0FBRTRFLFFBQUYsR0FBYSxJQUFiO0FBQ0E1RSxjQUFFNkUsUUFBRixHQUFhLElBQWI7QUFDQTdFLGNBQUU4RSxXQUFGLEdBQWdCLEVBQWhCO0FBQ0E5RSxjQUFFK0Usa0JBQUYsR0FBdUIsRUFBdkI7QUFDQS9FLGNBQUVnRixjQUFGLEdBQW1CLEtBQW5CO0FBQ0FoRixjQUFFaUYsUUFBRixHQUFhLEtBQWI7QUFDQWpGLGNBQUVrRixXQUFGLEdBQWdCLEtBQWhCO0FBQ0FsRixjQUFFbUYsTUFBRixHQUFXLFFBQVg7QUFDQW5GLGNBQUVvRixNQUFGLEdBQVcsSUFBWDtBQUNBcEYsY0FBRXFGLFlBQUYsR0FBaUIsSUFBakI7QUFDQXJGLGNBQUVnQyxTQUFGLEdBQWMsSUFBZDtBQUNBaEMsY0FBRXNGLFFBQUYsR0FBYSxDQUFiO0FBQ0F0RixjQUFFdUYsV0FBRixHQUFnQixJQUFoQjtBQUNBdkYsY0FBRXdGLE9BQUYsR0FBWXBuQixFQUFFVSxPQUFGLENBQVo7QUFDQWtoQixjQUFFeUYsWUFBRixHQUFpQixJQUFqQjtBQUNBekYsY0FBRTBGLGFBQUYsR0FBa0IsSUFBbEI7QUFDQTFGLGNBQUUyRixjQUFGLEdBQW1CLElBQW5CO0FBQ0EzRixjQUFFNEYsZ0JBQUYsR0FBcUIsa0JBQXJCO0FBQ0E1RixjQUFFck8sV0FBRixHQUFnQixDQUFoQjtBQUNBcU8sY0FBRTZGLFdBQUYsR0FBZ0IsSUFBaEI7O0FBRUE1RiwyQkFBZTdoQixFQUFFVSxPQUFGLEVBQVdpUyxJQUFYLENBQWdCLE9BQWhCLEtBQTRCLEVBQTNDOztBQUVBaVAsY0FBRWxWLE9BQUYsR0FBWTFNLEVBQUUySSxNQUFGLENBQVMsRUFBVCxFQUFhaVosRUFBRWxPLFFBQWYsRUFBeUJpTyxRQUF6QixFQUFtQ0UsWUFBbkMsQ0FBWjs7QUFFQUQsY0FBRXVELFlBQUYsR0FBaUJ2RCxFQUFFbFYsT0FBRixDQUFVNFcsWUFBM0I7O0FBRUExQixjQUFFOEYsZ0JBQUYsR0FBcUI5RixFQUFFbFYsT0FBdkI7O0FBRUEsZ0JBQUksT0FBT25NLFNBQVNvbkIsU0FBaEIsS0FBOEIsV0FBbEMsRUFBK0M7QUFDM0MvRixrQkFBRW1GLE1BQUYsR0FBVyxXQUFYO0FBQ0FuRixrQkFBRTRGLGdCQUFGLEdBQXFCLHFCQUFyQjtBQUNILGFBSEQsTUFHTyxJQUFJLE9BQU9qbkIsU0FBU3FuQixZQUFoQixLQUFpQyxXQUFyQyxFQUFrRDtBQUNyRGhHLGtCQUFFbUYsTUFBRixHQUFXLGNBQVg7QUFDQW5GLGtCQUFFNEYsZ0JBQUYsR0FBcUIsd0JBQXJCO0FBQ0g7O0FBRUQ1RixjQUFFaUcsUUFBRixHQUFhN25CLEVBQUU4bkIsS0FBRixDQUFRbEcsRUFBRWlHLFFBQVYsRUFBb0JqRyxDQUFwQixDQUFiO0FBQ0FBLGNBQUVtRyxhQUFGLEdBQWtCL25CLEVBQUU4bkIsS0FBRixDQUFRbEcsRUFBRW1HLGFBQVYsRUFBeUJuRyxDQUF6QixDQUFsQjtBQUNBQSxjQUFFb0csZ0JBQUYsR0FBcUJob0IsRUFBRThuQixLQUFGLENBQVFsRyxFQUFFb0csZ0JBQVYsRUFBNEJwRyxDQUE1QixDQUFyQjtBQUNBQSxjQUFFcUcsV0FBRixHQUFnQmpvQixFQUFFOG5CLEtBQUYsQ0FBUWxHLEVBQUVxRyxXQUFWLEVBQXVCckcsQ0FBdkIsQ0FBaEI7QUFDQUEsY0FBRXJNLFlBQUYsR0FBaUJ2VixFQUFFOG5CLEtBQUYsQ0FBUWxHLEVBQUVyTSxZQUFWLEVBQXdCcU0sQ0FBeEIsQ0FBakI7QUFDQUEsY0FBRXNHLGFBQUYsR0FBa0Jsb0IsRUFBRThuQixLQUFGLENBQVFsRyxFQUFFc0csYUFBVixFQUF5QnRHLENBQXpCLENBQWxCO0FBQ0FBLGNBQUV1RyxXQUFGLEdBQWdCbm9CLEVBQUU4bkIsS0FBRixDQUFRbEcsRUFBRXVHLFdBQVYsRUFBdUJ2RyxDQUF2QixDQUFoQjtBQUNBQSxjQUFFd0csWUFBRixHQUFpQnBvQixFQUFFOG5CLEtBQUYsQ0FBUWxHLEVBQUV3RyxZQUFWLEVBQXdCeEcsQ0FBeEIsQ0FBakI7QUFDQUEsY0FBRXlHLFdBQUYsR0FBZ0Jyb0IsRUFBRThuQixLQUFGLENBQVFsRyxFQUFFeUcsV0FBVixFQUF1QnpHLENBQXZCLENBQWhCO0FBQ0FBLGNBQUUwRyxVQUFGLEdBQWV0b0IsRUFBRThuQixLQUFGLENBQVFsRyxFQUFFMEcsVUFBVixFQUFzQjFHLENBQXRCLENBQWY7O0FBRUFBLGNBQUVGLFdBQUYsR0FBZ0JBLGFBQWhCOztBQUVBO0FBQ0E7QUFDQTtBQUNBRSxjQUFFMkcsUUFBRixHQUFhLDJCQUFiOztBQUdBM0csY0FBRTRHLG1CQUFGO0FBQ0E1RyxjQUFFN2QsSUFBRixDQUFPLElBQVA7QUFFSDs7QUFFRCxlQUFPMGQsS0FBUDtBQUVILEtBN0pRLEVBQVQ7O0FBK0pBQSxVQUFNcmhCLFNBQU4sQ0FBZ0Jxb0IsV0FBaEIsR0FBOEIsWUFBVztBQUNyQyxZQUFJN0csSUFBSSxJQUFSOztBQUVBQSxVQUFFaUUsV0FBRixDQUFjM2dCLElBQWQsQ0FBbUIsZUFBbkIsRUFBb0NLLElBQXBDLENBQXlDO0FBQ3JDLDJCQUFlO0FBRHNCLFNBQXpDLEVBRUdMLElBRkgsQ0FFUSwwQkFGUixFQUVvQ0ssSUFGcEMsQ0FFeUM7QUFDckMsd0JBQVk7QUFEeUIsU0FGekM7QUFNSCxLQVREOztBQVdBa2MsVUFBTXJoQixTQUFOLENBQWdCc29CLFFBQWhCLEdBQTJCakgsTUFBTXJoQixTQUFOLENBQWdCdW9CLFFBQWhCLEdBQTJCLFVBQVNDLE1BQVQsRUFBaUJ6aUIsS0FBakIsRUFBd0IwaUIsU0FBeEIsRUFBbUM7O0FBRXJGLFlBQUlqSCxJQUFJLElBQVI7O0FBRUEsWUFBSSxPQUFPemIsS0FBUCxLQUFrQixTQUF0QixFQUFpQztBQUM3QjBpQix3QkFBWTFpQixLQUFaO0FBQ0FBLG9CQUFRLElBQVI7QUFDSCxTQUhELE1BR08sSUFBSUEsUUFBUSxDQUFSLElBQWNBLFNBQVN5YixFQUFFK0QsVUFBN0IsRUFBMEM7QUFDN0MsbUJBQU8sS0FBUDtBQUNIOztBQUVEL0QsVUFBRWtILE1BQUY7O0FBRUEsWUFBSSxPQUFPM2lCLEtBQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDNUIsZ0JBQUlBLFVBQVUsQ0FBVixJQUFleWIsRUFBRWtFLE9BQUYsQ0FBVTlqQixNQUFWLEtBQXFCLENBQXhDLEVBQTJDO0FBQ3ZDaEMsa0JBQUU0b0IsTUFBRixFQUFVdmlCLFFBQVYsQ0FBbUJ1YixFQUFFaUUsV0FBckI7QUFDSCxhQUZELE1BRU8sSUFBSWdELFNBQUosRUFBZTtBQUNsQjdvQixrQkFBRTRvQixNQUFGLEVBQVVHLFlBQVYsQ0FBdUJuSCxFQUFFa0UsT0FBRixDQUFVa0QsRUFBVixDQUFhN2lCLEtBQWIsQ0FBdkI7QUFDSCxhQUZNLE1BRUE7QUFDSG5HLGtCQUFFNG9CLE1BQUYsRUFBVUssV0FBVixDQUFzQnJILEVBQUVrRSxPQUFGLENBQVVrRCxFQUFWLENBQWE3aUIsS0FBYixDQUF0QjtBQUNIO0FBQ0osU0FSRCxNQVFPO0FBQ0gsZ0JBQUkwaUIsY0FBYyxJQUFsQixFQUF3QjtBQUNwQjdvQixrQkFBRTRvQixNQUFGLEVBQVVNLFNBQVYsQ0FBb0J0SCxFQUFFaUUsV0FBdEI7QUFDSCxhQUZELE1BRU87QUFDSDdsQixrQkFBRTRvQixNQUFGLEVBQVV2aUIsUUFBVixDQUFtQnViLEVBQUVpRSxXQUFyQjtBQUNIO0FBQ0o7O0FBRURqRSxVQUFFa0UsT0FBRixHQUFZbEUsRUFBRWlFLFdBQUYsQ0FBYy9YLFFBQWQsQ0FBdUIsS0FBS3BCLE9BQUwsQ0FBYXFYLEtBQXBDLENBQVo7O0FBRUFuQyxVQUFFaUUsV0FBRixDQUFjL1gsUUFBZCxDQUF1QixLQUFLcEIsT0FBTCxDQUFhcVgsS0FBcEMsRUFBMkNvRixNQUEzQzs7QUFFQXZILFVBQUVpRSxXQUFGLENBQWN4aEIsTUFBZCxDQUFxQnVkLEVBQUVrRSxPQUF2Qjs7QUFFQWxFLFVBQUVrRSxPQUFGLENBQVU5aUIsSUFBVixDQUFlLFVBQVNtRCxLQUFULEVBQWdCekYsT0FBaEIsRUFBeUI7QUFDcENWLGNBQUVVLE9BQUYsRUFBVzZFLElBQVgsQ0FBZ0Isa0JBQWhCLEVBQW9DWSxLQUFwQztBQUNILFNBRkQ7O0FBSUF5YixVQUFFeUYsWUFBRixHQUFpQnpGLEVBQUVrRSxPQUFuQjs7QUFFQWxFLFVBQUV3SCxNQUFGO0FBRUgsS0EzQ0Q7O0FBNkNBM0gsVUFBTXJoQixTQUFOLENBQWdCaXBCLGFBQWhCLEdBQWdDLFlBQVc7QUFDdkMsWUFBSXpILElBQUksSUFBUjtBQUNBLFlBQUlBLEVBQUVsVixPQUFGLENBQVV1WCxZQUFWLEtBQTJCLENBQTNCLElBQWdDckMsRUFBRWxWLE9BQUYsQ0FBVXFWLGNBQVYsS0FBNkIsSUFBN0QsSUFBcUVILEVBQUVsVixPQUFGLENBQVU2TyxRQUFWLEtBQXVCLEtBQWhHLEVBQXVHO0FBQ25HLGdCQUFJeEksZUFBZTZPLEVBQUVrRSxPQUFGLENBQVVrRCxFQUFWLENBQWFwSCxFQUFFdUQsWUFBZixFQUE2QjNTLFdBQTdCLENBQXlDLElBQXpDLENBQW5CO0FBQ0FvUCxjQUFFdUUsS0FBRixDQUFRak8sT0FBUixDQUFnQjtBQUNad0ksd0JBQVEzTjtBQURJLGFBQWhCLEVBRUc2TyxFQUFFbFYsT0FBRixDQUFVMkgsS0FGYjtBQUdIO0FBQ0osS0FSRDs7QUFVQW9OLFVBQU1yaEIsU0FBTixDQUFnQmtwQixZQUFoQixHQUErQixVQUFTQyxVQUFULEVBQXFCblosUUFBckIsRUFBK0I7O0FBRTFELFlBQUlvWixZQUFZLEVBQWhCO0FBQUEsWUFDSTVILElBQUksSUFEUjs7QUFHQUEsVUFBRXlILGFBQUY7O0FBRUEsWUFBSXpILEVBQUVsVixPQUFGLENBQVVvWCxHQUFWLEtBQWtCLElBQWxCLElBQTBCbEMsRUFBRWxWLE9BQUYsQ0FBVTZPLFFBQVYsS0FBdUIsS0FBckQsRUFBNEQ7QUFDeERnTyx5QkFBYSxDQUFDQSxVQUFkO0FBQ0g7QUFDRCxZQUFJM0gsRUFBRXlFLGlCQUFGLEtBQXdCLEtBQTVCLEVBQW1DO0FBQy9CLGdCQUFJekUsRUFBRWxWLE9BQUYsQ0FBVTZPLFFBQVYsS0FBdUIsS0FBM0IsRUFBa0M7QUFDOUJxRyxrQkFBRWlFLFdBQUYsQ0FBYzNOLE9BQWQsQ0FBc0I7QUFDbEJxRiwwQkFBTWdNO0FBRFksaUJBQXRCLEVBRUczSCxFQUFFbFYsT0FBRixDQUFVMkgsS0FGYixFQUVvQnVOLEVBQUVsVixPQUFGLENBQVUwSCxNQUY5QixFQUVzQ2hFLFFBRnRDO0FBR0gsYUFKRCxNQUlPO0FBQ0h3UixrQkFBRWlFLFdBQUYsQ0FBYzNOLE9BQWQsQ0FBc0I7QUFDbEJqSCx5QkFBS3NZO0FBRGEsaUJBQXRCLEVBRUczSCxFQUFFbFYsT0FBRixDQUFVMkgsS0FGYixFQUVvQnVOLEVBQUVsVixPQUFGLENBQVUwSCxNQUY5QixFQUVzQ2hFLFFBRnRDO0FBR0g7QUFFSixTQVhELE1BV087O0FBRUgsZ0JBQUl3UixFQUFFZ0YsY0FBRixLQUFxQixLQUF6QixFQUFnQztBQUM1QixvQkFBSWhGLEVBQUVsVixPQUFGLENBQVVvWCxHQUFWLEtBQWtCLElBQXRCLEVBQTRCO0FBQ3hCbEMsc0JBQUVzRCxXQUFGLEdBQWdCLENBQUV0RCxFQUFFc0QsV0FBcEI7QUFDSDtBQUNEbGxCLGtCQUFFO0FBQ0V5cEIsK0JBQVc3SCxFQUFFc0Q7QUFEZixpQkFBRixFQUVHaE4sT0FGSCxDQUVXO0FBQ1B1UiwrQkFBV0Y7QUFESixpQkFGWCxFQUlHO0FBQ0N4Uiw4QkFBVTZKLEVBQUVsVixPQUFGLENBQVUySCxLQURyQjtBQUVDRCw0QkFBUXdOLEVBQUVsVixPQUFGLENBQVUwSCxNQUZuQjtBQUdDNEQsMEJBQU0sY0FBUzBSLEdBQVQsRUFBYztBQUNoQkEsOEJBQU0vZixLQUFLeVUsSUFBTCxDQUFVc0wsR0FBVixDQUFOO0FBQ0EsNEJBQUk5SCxFQUFFbFYsT0FBRixDQUFVNk8sUUFBVixLQUF1QixLQUEzQixFQUFrQztBQUM5QmlPLHNDQUFVNUgsRUFBRTRFLFFBQVosSUFBd0IsZUFDcEJrRCxHQURvQixHQUNkLFVBRFY7QUFFQTlILDhCQUFFaUUsV0FBRixDQUFjMVUsR0FBZCxDQUFrQnFZLFNBQWxCO0FBQ0gseUJBSkQsTUFJTztBQUNIQSxzQ0FBVTVILEVBQUU0RSxRQUFaLElBQXdCLG1CQUNwQmtELEdBRG9CLEdBQ2QsS0FEVjtBQUVBOUgsOEJBQUVpRSxXQUFGLENBQWMxVSxHQUFkLENBQWtCcVksU0FBbEI7QUFDSDtBQUNKLHFCQWRGO0FBZUM1YSw4QkFBVSxvQkFBVztBQUNqQiw0QkFBSXdCLFFBQUosRUFBYztBQUNWQSxxQ0FBUzlQLElBQVQ7QUFDSDtBQUNKO0FBbkJGLGlCQUpIO0FBMEJILGFBOUJELE1BOEJPOztBQUVIc2hCLGtCQUFFK0gsZUFBRjtBQUNBSiw2QkFBYTVmLEtBQUt5VSxJQUFMLENBQVVtTCxVQUFWLENBQWI7O0FBRUEsb0JBQUkzSCxFQUFFbFYsT0FBRixDQUFVNk8sUUFBVixLQUF1QixLQUEzQixFQUFrQztBQUM5QmlPLDhCQUFVNUgsRUFBRTRFLFFBQVosSUFBd0IsaUJBQWlCK0MsVUFBakIsR0FBOEIsZUFBdEQ7QUFDSCxpQkFGRCxNQUVPO0FBQ0hDLDhCQUFVNUgsRUFBRTRFLFFBQVosSUFBd0IscUJBQXFCK0MsVUFBckIsR0FBa0MsVUFBMUQ7QUFDSDtBQUNEM0gsa0JBQUVpRSxXQUFGLENBQWMxVSxHQUFkLENBQWtCcVksU0FBbEI7O0FBRUEsb0JBQUlwWixRQUFKLEVBQWM7QUFDVnBHLCtCQUFXLFlBQVc7O0FBRWxCNFgsMEJBQUVnSSxpQkFBRjs7QUFFQXhaLGlDQUFTOVAsSUFBVDtBQUNILHFCQUxELEVBS0dzaEIsRUFBRWxWLE9BQUYsQ0FBVTJILEtBTGI7QUFNSDtBQUVKO0FBRUo7QUFFSixLQTlFRDs7QUFnRkFvTixVQUFNcmhCLFNBQU4sQ0FBZ0J5cEIsWUFBaEIsR0FBK0IsWUFBVzs7QUFFdEMsWUFBSWpJLElBQUksSUFBUjtBQUFBLFlBQ0lPLFdBQVdQLEVBQUVsVixPQUFGLENBQVV5VixRQUR6Qjs7QUFHQSxZQUFLQSxZQUFZQSxhQUFhLElBQTlCLEVBQXFDO0FBQ2pDQSx1QkFBV25pQixFQUFFbWlCLFFBQUYsRUFBWXBRLEdBQVosQ0FBZ0I2UCxFQUFFd0YsT0FBbEIsQ0FBWDtBQUNIOztBQUVELGVBQU9qRixRQUFQO0FBRUgsS0FYRDs7QUFhQVYsVUFBTXJoQixTQUFOLENBQWdCK2hCLFFBQWhCLEdBQTJCLFVBQVNoYyxLQUFULEVBQWdCOztBQUV2QyxZQUFJeWIsSUFBSSxJQUFSO0FBQUEsWUFDSU8sV0FBV1AsRUFBRWlJLFlBQUYsRUFEZjs7QUFHQSxZQUFLMUgsYUFBYSxJQUFiLElBQXFCLFFBQU9BLFFBQVAseUNBQU9BLFFBQVAsT0FBb0IsUUFBOUMsRUFBeUQ7QUFDckRBLHFCQUFTbmYsSUFBVCxDQUFjLFlBQVc7QUFDckIsb0JBQUkvQixTQUFTakIsRUFBRSxJQUFGLEVBQVE4cEIsS0FBUixDQUFjLFVBQWQsQ0FBYjtBQUNBLG9CQUFHLENBQUM3b0IsT0FBT3FsQixTQUFYLEVBQXNCO0FBQ2xCcmxCLDJCQUFPOG9CLFlBQVAsQ0FBb0I1akIsS0FBcEIsRUFBMkIsSUFBM0I7QUFDSDtBQUNKLGFBTEQ7QUFNSDtBQUVKLEtBZEQ7O0FBZ0JBc2IsVUFBTXJoQixTQUFOLENBQWdCdXBCLGVBQWhCLEdBQWtDLFVBQVM1RixLQUFULEVBQWdCOztBQUU5QyxZQUFJbkMsSUFBSSxJQUFSO0FBQUEsWUFDSW9JLGFBQWEsRUFEakI7O0FBR0EsWUFBSXBJLEVBQUVsVixPQUFGLENBQVV3VyxJQUFWLEtBQW1CLEtBQXZCLEVBQThCO0FBQzFCOEcsdUJBQVdwSSxFQUFFMkYsY0FBYixJQUErQjNGLEVBQUUwRixhQUFGLEdBQWtCLEdBQWxCLEdBQXdCMUYsRUFBRWxWLE9BQUYsQ0FBVTJILEtBQWxDLEdBQTBDLEtBQTFDLEdBQWtEdU4sRUFBRWxWLE9BQUYsQ0FBVWdXLE9BQTNGO0FBQ0gsU0FGRCxNQUVPO0FBQ0hzSCx1QkFBV3BJLEVBQUUyRixjQUFiLElBQStCLGFBQWEzRixFQUFFbFYsT0FBRixDQUFVMkgsS0FBdkIsR0FBK0IsS0FBL0IsR0FBdUN1TixFQUFFbFYsT0FBRixDQUFVZ1csT0FBaEY7QUFDSDs7QUFFRCxZQUFJZCxFQUFFbFYsT0FBRixDQUFVd1csSUFBVixLQUFtQixLQUF2QixFQUE4QjtBQUMxQnRCLGNBQUVpRSxXQUFGLENBQWMxVSxHQUFkLENBQWtCNlksVUFBbEI7QUFDSCxTQUZELE1BRU87QUFDSHBJLGNBQUVrRSxPQUFGLENBQVVrRCxFQUFWLENBQWFqRixLQUFiLEVBQW9CNVMsR0FBcEIsQ0FBd0I2WSxVQUF4QjtBQUNIO0FBRUosS0FqQkQ7O0FBbUJBdkksVUFBTXJoQixTQUFOLENBQWdCeW5CLFFBQWhCLEdBQTJCLFlBQVc7O0FBRWxDLFlBQUlqRyxJQUFJLElBQVI7O0FBRUFBLFVBQUVtRyxhQUFGOztBQUVBLFlBQUtuRyxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTlCLEVBQTZDO0FBQ3pDckMsY0FBRW9ELGFBQUYsR0FBa0JpRixZQUFhckksRUFBRW9HLGdCQUFmLEVBQWlDcEcsRUFBRWxWLE9BQUYsQ0FBVTZWLGFBQTNDLENBQWxCO0FBQ0g7QUFFSixLQVZEOztBQVlBZCxVQUFNcmhCLFNBQU4sQ0FBZ0IybkIsYUFBaEIsR0FBZ0MsWUFBVzs7QUFFdkMsWUFBSW5HLElBQUksSUFBUjs7QUFFQSxZQUFJQSxFQUFFb0QsYUFBTixFQUFxQjtBQUNqQmtGLDBCQUFjdEksRUFBRW9ELGFBQWhCO0FBQ0g7QUFFSixLQVJEOztBQVVBdkQsVUFBTXJoQixTQUFOLENBQWdCNG5CLGdCQUFoQixHQUFtQyxZQUFXOztBQUUxQyxZQUFJcEcsSUFBSSxJQUFSO0FBQUEsWUFDSXVJLFVBQVV2SSxFQUFFdUQsWUFBRixHQUFpQnZELEVBQUVsVixPQUFGLENBQVV3WCxjQUR6Qzs7QUFHQSxZQUFLLENBQUN0QyxFQUFFb0YsTUFBSCxJQUFhLENBQUNwRixFQUFFa0YsV0FBaEIsSUFBK0IsQ0FBQ2xGLEVBQUVpRixRQUF2QyxFQUFrRDs7QUFFOUMsZ0JBQUtqRixFQUFFbFYsT0FBRixDQUFVMlcsUUFBVixLQUF1QixLQUE1QixFQUFvQzs7QUFFaEMsb0JBQUt6QixFQUFFL04sU0FBRixLQUFnQixDQUFoQixJQUF1QitOLEVBQUV1RCxZQUFGLEdBQWlCLENBQW5CLEtBQTZCdkQsRUFBRStELFVBQUYsR0FBZSxDQUF0RSxFQUEyRTtBQUN2RS9ELHNCQUFFL04sU0FBRixHQUFjLENBQWQ7QUFDSCxpQkFGRCxNQUlLLElBQUsrTixFQUFFL04sU0FBRixLQUFnQixDQUFyQixFQUF5Qjs7QUFFMUJzVyw4QkFBVXZJLEVBQUV1RCxZQUFGLEdBQWlCdkQsRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQXJDOztBQUVBLHdCQUFLdEMsRUFBRXVELFlBQUYsR0FBaUIsQ0FBakIsS0FBdUIsQ0FBNUIsRUFBZ0M7QUFDNUJ2RCwwQkFBRS9OLFNBQUYsR0FBYyxDQUFkO0FBQ0g7QUFFSjtBQUVKOztBQUVEK04sY0FBRW1JLFlBQUYsQ0FBZ0JJLE9BQWhCO0FBRUg7QUFFSixLQTdCRDs7QUErQkExSSxVQUFNcmhCLFNBQU4sQ0FBZ0JncUIsV0FBaEIsR0FBOEIsWUFBVzs7QUFFckMsWUFBSXhJLElBQUksSUFBUjs7QUFFQSxZQUFJQSxFQUFFbFYsT0FBRixDQUFVd1YsTUFBVixLQUFxQixJQUF6QixFQUFnQzs7QUFFNUJOLGNBQUU2RCxVQUFGLEdBQWV6bEIsRUFBRTRoQixFQUFFbFYsT0FBRixDQUFVMFYsU0FBWixFQUF1QjdlLFFBQXZCLENBQWdDLGFBQWhDLENBQWY7QUFDQXFlLGNBQUU0RCxVQUFGLEdBQWV4bEIsRUFBRTRoQixFQUFFbFYsT0FBRixDQUFVMlYsU0FBWixFQUF1QjllLFFBQXZCLENBQWdDLGFBQWhDLENBQWY7O0FBRUEsZ0JBQUlxZSxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTdCLEVBQTRDOztBQUV4Q3JDLGtCQUFFNkQsVUFBRixDQUFhaGpCLFdBQWIsQ0FBeUIsY0FBekIsRUFBeUM0bkIsVUFBekMsQ0FBb0Qsc0JBQXBEO0FBQ0F6SSxrQkFBRTRELFVBQUYsQ0FBYS9pQixXQUFiLENBQXlCLGNBQXpCLEVBQXlDNG5CLFVBQXpDLENBQW9ELHNCQUFwRDs7QUFFQSxvQkFBSXpJLEVBQUUyRyxRQUFGLENBQVd6USxJQUFYLENBQWdCOEosRUFBRWxWLE9BQUYsQ0FBVTBWLFNBQTFCLENBQUosRUFBMEM7QUFDdENSLHNCQUFFNkQsVUFBRixDQUFheUQsU0FBYixDQUF1QnRILEVBQUVsVixPQUFGLENBQVVzVixZQUFqQztBQUNIOztBQUVELG9CQUFJSixFQUFFMkcsUUFBRixDQUFXelEsSUFBWCxDQUFnQjhKLEVBQUVsVixPQUFGLENBQVUyVixTQUExQixDQUFKLEVBQTBDO0FBQ3RDVCxzQkFBRTRELFVBQUYsQ0FBYW5mLFFBQWIsQ0FBc0J1YixFQUFFbFYsT0FBRixDQUFVc1YsWUFBaEM7QUFDSDs7QUFFRCxvQkFBSUosRUFBRWxWLE9BQUYsQ0FBVTJXLFFBQVYsS0FBdUIsSUFBM0IsRUFBaUM7QUFDN0J6QixzQkFBRTZELFVBQUYsQ0FDS2xpQixRQURMLENBQ2MsZ0JBRGQsRUFFS2dDLElBRkwsQ0FFVSxlQUZWLEVBRTJCLE1BRjNCO0FBR0g7QUFFSixhQW5CRCxNQW1CTzs7QUFFSHFjLGtCQUFFNkQsVUFBRixDQUFhblUsR0FBYixDQUFrQnNRLEVBQUU0RCxVQUFwQixFQUVLamlCLFFBRkwsQ0FFYyxjQUZkLEVBR0tnQyxJQUhMLENBR1U7QUFDRixxQ0FBaUIsTUFEZjtBQUVGLGdDQUFZO0FBRlYsaUJBSFY7QUFRSDtBQUVKO0FBRUosS0ExQ0Q7O0FBNENBa2MsVUFBTXJoQixTQUFOLENBQWdCa3FCLFNBQWhCLEdBQTRCLFlBQVc7O0FBRW5DLFlBQUkxSSxJQUFJLElBQVI7QUFBQSxZQUNJbFcsQ0FESjtBQUFBLFlBQ082ZSxHQURQOztBQUdBLFlBQUkzSSxFQUFFbFYsT0FBRixDQUFVb1csSUFBVixLQUFtQixJQUFuQixJQUEyQmxCLEVBQUUrRCxVQUFGLEdBQWUvRCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBeEQsRUFBc0U7O0FBRWxFckMsY0FBRXdGLE9BQUYsQ0FBVTdqQixRQUFWLENBQW1CLGNBQW5COztBQUVBZ25CLGtCQUFNdnFCLEVBQUUsUUFBRixFQUFZdUQsUUFBWixDQUFxQnFlLEVBQUVsVixPQUFGLENBQVVxVyxTQUEvQixDQUFOOztBQUVBLGlCQUFLclgsSUFBSSxDQUFULEVBQVlBLEtBQUtrVyxFQUFFNEksV0FBRixFQUFqQixFQUFrQzllLEtBQUssQ0FBdkMsRUFBMEM7QUFDdEM2ZSxvQkFBSWxtQixNQUFKLENBQVdyRSxFQUFFLFFBQUYsRUFBWXFFLE1BQVosQ0FBbUJ1ZCxFQUFFbFYsT0FBRixDQUFVaVcsWUFBVixDQUF1QnJpQixJQUF2QixDQUE0QixJQUE1QixFQUFrQ3NoQixDQUFsQyxFQUFxQ2xXLENBQXJDLENBQW5CLENBQVg7QUFDSDs7QUFFRGtXLGNBQUV3RCxLQUFGLEdBQVVtRixJQUFJbGtCLFFBQUosQ0FBYXViLEVBQUVsVixPQUFGLENBQVV1VixVQUF2QixDQUFWOztBQUVBTCxjQUFFd0QsS0FBRixDQUFRbGdCLElBQVIsQ0FBYSxJQUFiLEVBQW1Cb1EsS0FBbkIsR0FBMkIvUixRQUEzQixDQUFvQyxjQUFwQztBQUVIO0FBRUosS0FyQkQ7O0FBdUJBa2UsVUFBTXJoQixTQUFOLENBQWdCcXFCLFFBQWhCLEdBQTJCLFlBQVc7O0FBRWxDLFlBQUk3SSxJQUFJLElBQVI7O0FBRUFBLFVBQUVrRSxPQUFGLEdBQ0lsRSxFQUFFd0YsT0FBRixDQUNLdFosUUFETCxDQUNlOFQsRUFBRWxWLE9BQUYsQ0FBVXFYLEtBQVYsR0FBa0IscUJBRGpDLEVBRUt4Z0IsUUFGTCxDQUVjLGFBRmQsQ0FESjs7QUFLQXFlLFVBQUUrRCxVQUFGLEdBQWUvRCxFQUFFa0UsT0FBRixDQUFVOWpCLE1BQXpCOztBQUVBNGYsVUFBRWtFLE9BQUYsQ0FBVTlpQixJQUFWLENBQWUsVUFBU21ELEtBQVQsRUFBZ0J6RixPQUFoQixFQUF5QjtBQUNwQ1YsY0FBRVUsT0FBRixFQUNLNkUsSUFETCxDQUNVLGtCQURWLEVBQzhCWSxLQUQ5QixFQUVLd00sSUFGTCxDQUVVLGlCQUZWLEVBRTZCM1MsRUFBRVUsT0FBRixFQUFXNkUsSUFBWCxDQUFnQixPQUFoQixLQUE0QixFQUZ6RDtBQUdILFNBSkQ7O0FBTUFxYyxVQUFFd0YsT0FBRixDQUFVN2pCLFFBQVYsQ0FBbUIsY0FBbkI7O0FBRUFxZSxVQUFFaUUsV0FBRixHQUFpQmpFLEVBQUUrRCxVQUFGLEtBQWlCLENBQWxCLEdBQ1ozbEIsRUFBRSw0QkFBRixFQUFnQ3FHLFFBQWhDLENBQXlDdWIsRUFBRXdGLE9BQTNDLENBRFksR0FFWnhGLEVBQUVrRSxPQUFGLENBQVU0RSxPQUFWLENBQWtCLDRCQUFsQixFQUFnREMsTUFBaEQsRUFGSjs7QUFJQS9JLFVBQUV1RSxLQUFGLEdBQVV2RSxFQUFFaUUsV0FBRixDQUFjK0UsSUFBZCxDQUNOLDJCQURNLEVBQ3VCRCxNQUR2QixFQUFWO0FBRUEvSSxVQUFFaUUsV0FBRixDQUFjMVUsR0FBZCxDQUFrQixTQUFsQixFQUE2QixDQUE3Qjs7QUFFQSxZQUFJeVEsRUFBRWxWLE9BQUYsQ0FBVThWLFVBQVYsS0FBeUIsSUFBekIsSUFBaUNaLEVBQUVsVixPQUFGLENBQVUwWCxZQUFWLEtBQTJCLElBQWhFLEVBQXNFO0FBQ2xFeEMsY0FBRWxWLE9BQUYsQ0FBVXdYLGNBQVYsR0FBMkIsQ0FBM0I7QUFDSDs7QUFFRGxrQixVQUFFLGdCQUFGLEVBQW9CNGhCLEVBQUV3RixPQUF0QixFQUErQnJWLEdBQS9CLENBQW1DLE9BQW5DLEVBQTRDeE8sUUFBNUMsQ0FBcUQsZUFBckQ7O0FBRUFxZSxVQUFFaUosYUFBRjs7QUFFQWpKLFVBQUV3SSxXQUFGOztBQUVBeEksVUFBRTBJLFNBQUY7O0FBRUExSSxVQUFFa0osVUFBRjs7QUFHQWxKLFVBQUVtSixlQUFGLENBQWtCLE9BQU9uSixFQUFFdUQsWUFBVCxLQUEwQixRQUExQixHQUFxQ3ZELEVBQUV1RCxZQUF2QyxHQUFzRCxDQUF4RTs7QUFFQSxZQUFJdkQsRUFBRWxWLE9BQUYsQ0FBVXNXLFNBQVYsS0FBd0IsSUFBNUIsRUFBa0M7QUFDOUJwQixjQUFFdUUsS0FBRixDQUFRNWlCLFFBQVIsQ0FBaUIsV0FBakI7QUFDSDtBQUVKLEtBaEREOztBQWtEQWtlLFVBQU1yaEIsU0FBTixDQUFnQjRxQixTQUFoQixHQUE0QixZQUFXOztBQUVuQyxZQUFJcEosSUFBSSxJQUFSO0FBQUEsWUFBYzVWLENBQWQ7QUFBQSxZQUFpQkMsQ0FBakI7QUFBQSxZQUFvQmdmLENBQXBCO0FBQUEsWUFBdUJDLFNBQXZCO0FBQUEsWUFBa0NDLFdBQWxDO0FBQUEsWUFBK0NDLGNBQS9DO0FBQUEsWUFBOERDLGdCQUE5RDs7QUFFQUgsb0JBQVkzcUIsU0FBUytxQixzQkFBVCxFQUFaO0FBQ0FGLHlCQUFpQnhKLEVBQUV3RixPQUFGLENBQVV0WixRQUFWLEVBQWpCOztBQUVBLFlBQUc4VCxFQUFFbFYsT0FBRixDQUFVcUUsSUFBVixHQUFpQixDQUFwQixFQUF1Qjs7QUFFbkJzYSwrQkFBbUJ6SixFQUFFbFYsT0FBRixDQUFVc1gsWUFBVixHQUF5QnBDLEVBQUVsVixPQUFGLENBQVVxRSxJQUF0RDtBQUNBb2EsMEJBQWN4aEIsS0FBS3lVLElBQUwsQ0FDVmdOLGVBQWVwcEIsTUFBZixHQUF3QnFwQixnQkFEZCxDQUFkOztBQUlBLGlCQUFJcmYsSUFBSSxDQUFSLEVBQVdBLElBQUltZixXQUFmLEVBQTRCbmYsR0FBNUIsRUFBZ0M7QUFDNUIsb0JBQUkrWCxRQUFReGpCLFNBQVNnckIsYUFBVCxDQUF1QixLQUF2QixDQUFaO0FBQ0EscUJBQUl0ZixJQUFJLENBQVIsRUFBV0EsSUFBSTJWLEVBQUVsVixPQUFGLENBQVVxRSxJQUF6QixFQUErQjlFLEdBQS9CLEVBQW9DO0FBQ2hDLHdCQUFJNEcsTUFBTXRTLFNBQVNnckIsYUFBVCxDQUF1QixLQUF2QixDQUFWO0FBQ0EseUJBQUlOLElBQUksQ0FBUixFQUFXQSxJQUFJckosRUFBRWxWLE9BQUYsQ0FBVXNYLFlBQXpCLEVBQXVDaUgsR0FBdkMsRUFBNEM7QUFDeEMsNEJBQUlocUIsU0FBVStLLElBQUlxZixnQkFBSixJQUF5QnBmLElBQUkyVixFQUFFbFYsT0FBRixDQUFVc1gsWUFBZixHQUErQmlILENBQXZELENBQWQ7QUFDQSw0QkFBSUcsZUFBZUksR0FBZixDQUFtQnZxQixNQUFuQixDQUFKLEVBQWdDO0FBQzVCNFIsZ0NBQUk0WSxXQUFKLENBQWdCTCxlQUFlSSxHQUFmLENBQW1CdnFCLE1BQW5CLENBQWhCO0FBQ0g7QUFDSjtBQUNEOGlCLDBCQUFNMEgsV0FBTixDQUFrQjVZLEdBQWxCO0FBQ0g7QUFDRHFZLDBCQUFVTyxXQUFWLENBQXNCMUgsS0FBdEI7QUFDSDs7QUFFRG5DLGNBQUV3RixPQUFGLENBQVVzRSxLQUFWLEdBQWtCcm5CLE1BQWxCLENBQXlCNm1CLFNBQXpCO0FBQ0F0SixjQUFFd0YsT0FBRixDQUFVdFosUUFBVixHQUFxQkEsUUFBckIsR0FBZ0NBLFFBQWhDLEdBQ0txRCxHQURMLENBQ1M7QUFDRCx5QkFBUyxNQUFNeVEsRUFBRWxWLE9BQUYsQ0FBVXNYLFlBQWpCLEdBQWlDLEdBRHhDO0FBRUQsMkJBQVc7QUFGVixhQURUO0FBTUg7QUFFSixLQXRDRDs7QUF3Q0F2QyxVQUFNcmhCLFNBQU4sQ0FBZ0J1ckIsZUFBaEIsR0FBa0MsVUFBU0MsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0I7O0FBRTdELFlBQUlqSyxJQUFJLElBQVI7QUFBQSxZQUNJa0ssVUFESjtBQUFBLFlBQ2dCQyxnQkFEaEI7QUFBQSxZQUNrQ0MsY0FEbEM7QUFBQSxZQUNrREMsb0JBQW9CLEtBRHRFO0FBRUEsWUFBSUMsY0FBY3RLLEVBQUV3RixPQUFGLENBQVU1VCxLQUFWLEVBQWxCO0FBQ0EsWUFBSUQsY0FBY2pSLE9BQU9xWSxVQUFQLElBQXFCM2EsRUFBRXNDLE1BQUYsRUFBVWtSLEtBQVYsRUFBdkM7O0FBRUEsWUFBSW9PLEVBQUVnQyxTQUFGLEtBQWdCLFFBQXBCLEVBQThCO0FBQzFCb0ksNkJBQWlCelksV0FBakI7QUFDSCxTQUZELE1BRU8sSUFBSXFPLEVBQUVnQyxTQUFGLEtBQWdCLFFBQXBCLEVBQThCO0FBQ2pDb0ksNkJBQWlCRSxXQUFqQjtBQUNILFNBRk0sTUFFQSxJQUFJdEssRUFBRWdDLFNBQUYsS0FBZ0IsS0FBcEIsRUFBMkI7QUFDOUJvSSw2QkFBaUJyaUIsS0FBS3dpQixHQUFMLENBQVM1WSxXQUFULEVBQXNCMlksV0FBdEIsQ0FBakI7QUFDSDs7QUFFRCxZQUFLdEssRUFBRWxWLE9BQUYsQ0FBVW1YLFVBQVYsSUFDRGpDLEVBQUVsVixPQUFGLENBQVVtWCxVQUFWLENBQXFCN2hCLE1BRHBCLElBRUQ0ZixFQUFFbFYsT0FBRixDQUFVbVgsVUFBVixLQUF5QixJQUY3QixFQUVtQzs7QUFFL0JrSSwrQkFBbUIsSUFBbkI7O0FBRUEsaUJBQUtELFVBQUwsSUFBbUJsSyxFQUFFOEUsV0FBckIsRUFBa0M7QUFDOUIsb0JBQUk5RSxFQUFFOEUsV0FBRixDQUFjMEYsY0FBZCxDQUE2Qk4sVUFBN0IsQ0FBSixFQUE4QztBQUMxQyx3QkFBSWxLLEVBQUU4RixnQkFBRixDQUFtQmxFLFdBQW5CLEtBQW1DLEtBQXZDLEVBQThDO0FBQzFDLDRCQUFJd0ksaUJBQWlCcEssRUFBRThFLFdBQUYsQ0FBY29GLFVBQWQsQ0FBckIsRUFBZ0Q7QUFDNUNDLCtDQUFtQm5LLEVBQUU4RSxXQUFGLENBQWNvRixVQUFkLENBQW5CO0FBQ0g7QUFDSixxQkFKRCxNQUlPO0FBQ0gsNEJBQUlFLGlCQUFpQnBLLEVBQUU4RSxXQUFGLENBQWNvRixVQUFkLENBQXJCLEVBQWdEO0FBQzVDQywrQ0FBbUJuSyxFQUFFOEUsV0FBRixDQUFjb0YsVUFBZCxDQUFuQjtBQUNIO0FBQ0o7QUFDSjtBQUNKOztBQUVELGdCQUFJQyxxQkFBcUIsSUFBekIsRUFBK0I7QUFDM0Isb0JBQUluSyxFQUFFMkUsZ0JBQUYsS0FBdUIsSUFBM0IsRUFBaUM7QUFDN0Isd0JBQUl3RixxQkFBcUJuSyxFQUFFMkUsZ0JBQXZCLElBQTJDc0YsV0FBL0MsRUFBNEQ7QUFDeERqSywwQkFBRTJFLGdCQUFGLEdBQ0l3RixnQkFESjtBQUVBLDRCQUFJbkssRUFBRStFLGtCQUFGLENBQXFCb0YsZ0JBQXJCLE1BQTJDLFNBQS9DLEVBQTBEO0FBQ3REbkssOEJBQUV5SyxPQUFGLENBQVVOLGdCQUFWO0FBQ0gseUJBRkQsTUFFTztBQUNIbkssOEJBQUVsVixPQUFGLEdBQVkxTSxFQUFFMkksTUFBRixDQUFTLEVBQVQsRUFBYWlaLEVBQUU4RixnQkFBZixFQUNSOUYsRUFBRStFLGtCQUFGLENBQ0lvRixnQkFESixDQURRLENBQVo7QUFHQSxnQ0FBSUgsWUFBWSxJQUFoQixFQUFzQjtBQUNsQmhLLGtDQUFFdUQsWUFBRixHQUFpQnZELEVBQUVsVixPQUFGLENBQVU0VyxZQUEzQjtBQUNIO0FBQ0QxQiw4QkFBRWxJLE9BQUYsQ0FBVWtTLE9BQVY7QUFDSDtBQUNESyw0Q0FBb0JGLGdCQUFwQjtBQUNIO0FBQ0osaUJBakJELE1BaUJPO0FBQ0huSyxzQkFBRTJFLGdCQUFGLEdBQXFCd0YsZ0JBQXJCO0FBQ0Esd0JBQUluSyxFQUFFK0Usa0JBQUYsQ0FBcUJvRixnQkFBckIsTUFBMkMsU0FBL0MsRUFBMEQ7QUFDdERuSywwQkFBRXlLLE9BQUYsQ0FBVU4sZ0JBQVY7QUFDSCxxQkFGRCxNQUVPO0FBQ0huSywwQkFBRWxWLE9BQUYsR0FBWTFNLEVBQUUySSxNQUFGLENBQVMsRUFBVCxFQUFhaVosRUFBRThGLGdCQUFmLEVBQ1I5RixFQUFFK0Usa0JBQUYsQ0FDSW9GLGdCQURKLENBRFEsQ0FBWjtBQUdBLDRCQUFJSCxZQUFZLElBQWhCLEVBQXNCO0FBQ2xCaEssOEJBQUV1RCxZQUFGLEdBQWlCdkQsRUFBRWxWLE9BQUYsQ0FBVTRXLFlBQTNCO0FBQ0g7QUFDRDFCLDBCQUFFbEksT0FBRixDQUFVa1MsT0FBVjtBQUNIO0FBQ0RLLHdDQUFvQkYsZ0JBQXBCO0FBQ0g7QUFDSixhQWpDRCxNQWlDTztBQUNILG9CQUFJbkssRUFBRTJFLGdCQUFGLEtBQXVCLElBQTNCLEVBQWlDO0FBQzdCM0Usc0JBQUUyRSxnQkFBRixHQUFxQixJQUFyQjtBQUNBM0Usc0JBQUVsVixPQUFGLEdBQVlrVixFQUFFOEYsZ0JBQWQ7QUFDQSx3QkFBSWtFLFlBQVksSUFBaEIsRUFBc0I7QUFDbEJoSywwQkFBRXVELFlBQUYsR0FBaUJ2RCxFQUFFbFYsT0FBRixDQUFVNFcsWUFBM0I7QUFDSDtBQUNEMUIsc0JBQUVsSSxPQUFGLENBQVVrUyxPQUFWO0FBQ0FLLHdDQUFvQkYsZ0JBQXBCO0FBQ0g7QUFDSjs7QUFFRDtBQUNBLGdCQUFJLENBQUNILE9BQUQsSUFBWUssc0JBQXNCLEtBQXRDLEVBQThDO0FBQzFDckssa0JBQUV3RixPQUFGLENBQVU5TixPQUFWLENBQWtCLFlBQWxCLEVBQWdDLENBQUNzSSxDQUFELEVBQUlxSyxpQkFBSixDQUFoQztBQUNIO0FBQ0o7QUFFSixLQXRGRDs7QUF3RkF4SyxVQUFNcmhCLFNBQU4sQ0FBZ0I2bkIsV0FBaEIsR0FBOEIsVUFBUzdsQixLQUFULEVBQWdCa3FCLFdBQWhCLEVBQTZCOztBQUV2RCxZQUFJMUssSUFBSSxJQUFSO0FBQUEsWUFDSTJLLFVBQVV2c0IsRUFBRW9DLE1BQU1vcUIsYUFBUixDQURkO0FBQUEsWUFFSUMsV0FGSjtBQUFBLFlBRWlCekcsV0FGakI7QUFBQSxZQUU4QjBHLFlBRjlCOztBQUlBO0FBQ0EsWUFBR0gsUUFBUXRaLEVBQVIsQ0FBVyxHQUFYLENBQUgsRUFBb0I7QUFDaEI3USxrQkFBTW1TLGNBQU47QUFDSDs7QUFFRDtBQUNBLFlBQUcsQ0FBQ2dZLFFBQVF0WixFQUFSLENBQVcsSUFBWCxDQUFKLEVBQXNCO0FBQ2xCc1osc0JBQVVBLFFBQVE1ckIsT0FBUixDQUFnQixJQUFoQixDQUFWO0FBQ0g7O0FBRUQrckIsdUJBQWdCOUssRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV3WCxjQUF6QixLQUE0QyxDQUE1RDtBQUNBdUksc0JBQWNDLGVBQWUsQ0FBZixHQUFtQixDQUFDOUssRUFBRStELFVBQUYsR0FBZS9ELEVBQUV1RCxZQUFsQixJQUFrQ3ZELEVBQUVsVixPQUFGLENBQVV3WCxjQUE3RTs7QUFFQSxnQkFBUTloQixNQUFNdVEsSUFBTixDQUFXNUQsT0FBbkI7O0FBRUksaUJBQUssVUFBTDtBQUNJaVgsOEJBQWN5RyxnQkFBZ0IsQ0FBaEIsR0FBb0I3SyxFQUFFbFYsT0FBRixDQUFVd1gsY0FBOUIsR0FBK0N0QyxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixHQUF5QndJLFdBQXRGO0FBQ0Esb0JBQUk3SyxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTdCLEVBQTJDO0FBQ3ZDckMsc0JBQUVtSSxZQUFGLENBQWVuSSxFQUFFdUQsWUFBRixHQUFpQmEsV0FBaEMsRUFBNkMsS0FBN0MsRUFBb0RzRyxXQUFwRDtBQUNIO0FBQ0Q7O0FBRUosaUJBQUssTUFBTDtBQUNJdEcsOEJBQWN5RyxnQkFBZ0IsQ0FBaEIsR0FBb0I3SyxFQUFFbFYsT0FBRixDQUFVd1gsY0FBOUIsR0FBK0N1SSxXQUE3RDtBQUNBLG9CQUFJN0ssRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUE3QixFQUEyQztBQUN2Q3JDLHNCQUFFbUksWUFBRixDQUFlbkksRUFBRXVELFlBQUYsR0FBaUJhLFdBQWhDLEVBQTZDLEtBQTdDLEVBQW9Ec0csV0FBcEQ7QUFDSDtBQUNEOztBQUVKLGlCQUFLLE9BQUw7QUFDSSxvQkFBSW5tQixRQUFRL0QsTUFBTXVRLElBQU4sQ0FBV3hNLEtBQVgsS0FBcUIsQ0FBckIsR0FBeUIsQ0FBekIsR0FDUi9ELE1BQU11USxJQUFOLENBQVd4TSxLQUFYLElBQW9Cb21CLFFBQVFwbUIsS0FBUixLQUFrQnliLEVBQUVsVixPQUFGLENBQVV3WCxjQURwRDs7QUFHQXRDLGtCQUFFbUksWUFBRixDQUFlbkksRUFBRStLLGNBQUYsQ0FBaUJ4bUIsS0FBakIsQ0FBZixFQUF3QyxLQUF4QyxFQUErQ21tQixXQUEvQztBQUNBQyx3QkFBUXplLFFBQVIsR0FBbUJ3TCxPQUFuQixDQUEyQixPQUEzQjtBQUNBOztBQUVKO0FBQ0k7QUF6QlI7QUE0QkgsS0EvQ0Q7O0FBaURBbUksVUFBTXJoQixTQUFOLENBQWdCdXNCLGNBQWhCLEdBQWlDLFVBQVN4bUIsS0FBVCxFQUFnQjs7QUFFN0MsWUFBSXliLElBQUksSUFBUjtBQUFBLFlBQ0lnTCxVQURKO0FBQUEsWUFDZ0JDLGFBRGhCOztBQUdBRCxxQkFBYWhMLEVBQUVrTCxtQkFBRixFQUFiO0FBQ0FELHdCQUFnQixDQUFoQjtBQUNBLFlBQUkxbUIsUUFBUXltQixXQUFXQSxXQUFXNXFCLE1BQVgsR0FBb0IsQ0FBL0IsQ0FBWixFQUErQztBQUMzQ21FLG9CQUFReW1CLFdBQVdBLFdBQVc1cUIsTUFBWCxHQUFvQixDQUEvQixDQUFSO0FBQ0gsU0FGRCxNQUVPO0FBQ0gsaUJBQUssSUFBSStxQixDQUFULElBQWNILFVBQWQsRUFBMEI7QUFDdEIsb0JBQUl6bUIsUUFBUXltQixXQUFXRyxDQUFYLENBQVosRUFBMkI7QUFDdkI1bUIsNEJBQVEwbUIsYUFBUjtBQUNBO0FBQ0g7QUFDREEsZ0NBQWdCRCxXQUFXRyxDQUFYLENBQWhCO0FBQ0g7QUFDSjs7QUFFRCxlQUFPNW1CLEtBQVA7QUFDSCxLQXBCRDs7QUFzQkFzYixVQUFNcmhCLFNBQU4sQ0FBZ0I0c0IsYUFBaEIsR0FBZ0MsWUFBVzs7QUFFdkMsWUFBSXBMLElBQUksSUFBUjs7QUFFQSxZQUFJQSxFQUFFbFYsT0FBRixDQUFVb1csSUFBVixJQUFrQmxCLEVBQUV3RCxLQUFGLEtBQVksSUFBbEMsRUFBd0M7O0FBRXBDcGxCLGNBQUUsSUFBRixFQUFRNGhCLEVBQUV3RCxLQUFWLEVBQ0t2YixHQURMLENBQ1MsYUFEVCxFQUN3QitYLEVBQUVxRyxXQUQxQixFQUVLcGUsR0FGTCxDQUVTLGtCQUZULEVBRTZCN0osRUFBRThuQixLQUFGLENBQVFsRyxFQUFFcUwsU0FBVixFQUFxQnJMLENBQXJCLEVBQXdCLElBQXhCLENBRjdCLEVBR0svWCxHQUhMLENBR1Msa0JBSFQsRUFHNkI3SixFQUFFOG5CLEtBQUYsQ0FBUWxHLEVBQUVxTCxTQUFWLEVBQXFCckwsQ0FBckIsRUFBd0IsS0FBeEIsQ0FIN0I7O0FBS0EsZ0JBQUlBLEVBQUVsVixPQUFGLENBQVVvVixhQUFWLEtBQTRCLElBQWhDLEVBQXNDO0FBQ2xDRixrQkFBRXdELEtBQUYsQ0FBUXZiLEdBQVIsQ0FBWSxlQUFaLEVBQTZCK1gsRUFBRTBHLFVBQS9CO0FBQ0g7QUFDSjs7QUFFRDFHLFVBQUV3RixPQUFGLENBQVV2ZCxHQUFWLENBQWMsd0JBQWQ7O0FBRUEsWUFBSStYLEVBQUVsVixPQUFGLENBQVV3VixNQUFWLEtBQXFCLElBQXJCLElBQTZCTixFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTFELEVBQXdFO0FBQ3BFckMsY0FBRTZELFVBQUYsSUFBZ0I3RCxFQUFFNkQsVUFBRixDQUFhNWIsR0FBYixDQUFpQixhQUFqQixFQUFnQytYLEVBQUVxRyxXQUFsQyxDQUFoQjtBQUNBckcsY0FBRTRELFVBQUYsSUFBZ0I1RCxFQUFFNEQsVUFBRixDQUFhM2IsR0FBYixDQUFpQixhQUFqQixFQUFnQytYLEVBQUVxRyxXQUFsQyxDQUFoQjs7QUFFQSxnQkFBSXJHLEVBQUVsVixPQUFGLENBQVVvVixhQUFWLEtBQTRCLElBQWhDLEVBQXNDO0FBQ2xDRixrQkFBRTZELFVBQUYsSUFBZ0I3RCxFQUFFNkQsVUFBRixDQUFhNWIsR0FBYixDQUFpQixlQUFqQixFQUFrQytYLEVBQUUwRyxVQUFwQyxDQUFoQjtBQUNBMUcsa0JBQUU0RCxVQUFGLElBQWdCNUQsRUFBRTRELFVBQUYsQ0FBYTNiLEdBQWIsQ0FBaUIsZUFBakIsRUFBa0MrWCxFQUFFMEcsVUFBcEMsQ0FBaEI7QUFDSDtBQUNKOztBQUVEMUcsVUFBRXVFLEtBQUYsQ0FBUXRjLEdBQVIsQ0FBWSxrQ0FBWixFQUFnRCtYLEVBQUV3RyxZQUFsRDtBQUNBeEcsVUFBRXVFLEtBQUYsQ0FBUXRjLEdBQVIsQ0FBWSxpQ0FBWixFQUErQytYLEVBQUV3RyxZQUFqRDtBQUNBeEcsVUFBRXVFLEtBQUYsQ0FBUXRjLEdBQVIsQ0FBWSw4QkFBWixFQUE0QytYLEVBQUV3RyxZQUE5QztBQUNBeEcsVUFBRXVFLEtBQUYsQ0FBUXRjLEdBQVIsQ0FBWSxvQ0FBWixFQUFrRCtYLEVBQUV3RyxZQUFwRDs7QUFFQXhHLFVBQUV1RSxLQUFGLENBQVF0YyxHQUFSLENBQVksYUFBWixFQUEyQitYLEVBQUVyTSxZQUE3Qjs7QUFFQXZWLFVBQUVPLFFBQUYsRUFBWXNKLEdBQVosQ0FBZ0IrWCxFQUFFNEYsZ0JBQWxCLEVBQW9DNUYsRUFBRXNMLFVBQXRDOztBQUVBdEwsVUFBRXVMLGtCQUFGOztBQUVBLFlBQUl2TCxFQUFFbFYsT0FBRixDQUFVb1YsYUFBVixLQUE0QixJQUFoQyxFQUFzQztBQUNsQ0YsY0FBRXVFLEtBQUYsQ0FBUXRjLEdBQVIsQ0FBWSxlQUFaLEVBQTZCK1gsRUFBRTBHLFVBQS9CO0FBQ0g7O0FBRUQsWUFBSTFHLEVBQUVsVixPQUFGLENBQVV5VyxhQUFWLEtBQTRCLElBQWhDLEVBQXNDO0FBQ2xDbmpCLGNBQUU0aEIsRUFBRWlFLFdBQUosRUFBaUIvWCxRQUFqQixHQUE0QmpFLEdBQTVCLENBQWdDLGFBQWhDLEVBQStDK1gsRUFBRXNHLGFBQWpEO0FBQ0g7O0FBRURsb0IsVUFBRXNDLE1BQUYsRUFBVXVILEdBQVYsQ0FBYyxtQ0FBbUMrWCxFQUFFRixXQUFuRCxFQUFnRUUsRUFBRXdMLGlCQUFsRTs7QUFFQXB0QixVQUFFc0MsTUFBRixFQUFVdUgsR0FBVixDQUFjLHdCQUF3QitYLEVBQUVGLFdBQXhDLEVBQXFERSxFQUFFeUwsTUFBdkQ7O0FBRUFydEIsVUFBRSxtQkFBRixFQUF1QjRoQixFQUFFaUUsV0FBekIsRUFBc0NoYyxHQUF0QyxDQUEwQyxXQUExQyxFQUF1RCtYLEVBQUVyTixjQUF6RDs7QUFFQXZVLFVBQUVzQyxNQUFGLEVBQVV1SCxHQUFWLENBQWMsc0JBQXNCK1gsRUFBRUYsV0FBdEMsRUFBbURFLEVBQUV1RyxXQUFyRDtBQUVILEtBdkREOztBQXlEQTFHLFVBQU1yaEIsU0FBTixDQUFnQitzQixrQkFBaEIsR0FBcUMsWUFBVzs7QUFFNUMsWUFBSXZMLElBQUksSUFBUjs7QUFFQUEsVUFBRXVFLEtBQUYsQ0FBUXRjLEdBQVIsQ0FBWSxrQkFBWixFQUFnQzdKLEVBQUU4bkIsS0FBRixDQUFRbEcsRUFBRXFMLFNBQVYsRUFBcUJyTCxDQUFyQixFQUF3QixJQUF4QixDQUFoQztBQUNBQSxVQUFFdUUsS0FBRixDQUFRdGMsR0FBUixDQUFZLGtCQUFaLEVBQWdDN0osRUFBRThuQixLQUFGLENBQVFsRyxFQUFFcUwsU0FBVixFQUFxQnJMLENBQXJCLEVBQXdCLEtBQXhCLENBQWhDO0FBRUgsS0FQRDs7QUFTQUgsVUFBTXJoQixTQUFOLENBQWdCa3RCLFdBQWhCLEdBQThCLFlBQVc7O0FBRXJDLFlBQUkxTCxJQUFJLElBQVI7QUFBQSxZQUFjd0osY0FBZDs7QUFFQSxZQUFHeEosRUFBRWxWLE9BQUYsQ0FBVXFFLElBQVYsR0FBaUIsQ0FBcEIsRUFBdUI7QUFDbkJxYSw2QkFBaUJ4SixFQUFFa0UsT0FBRixDQUFVaFksUUFBVixHQUFxQkEsUUFBckIsRUFBakI7QUFDQXNkLDJCQUFlZixVQUFmLENBQTBCLE9BQTFCO0FBQ0F6SSxjQUFFd0YsT0FBRixDQUFVc0UsS0FBVixHQUFrQnJuQixNQUFsQixDQUF5QittQixjQUF6QjtBQUNIO0FBRUosS0FWRDs7QUFZQTNKLFVBQU1yaEIsU0FBTixDQUFnQm1WLFlBQWhCLEdBQStCLFVBQVNuVCxLQUFULEVBQWdCOztBQUUzQyxZQUFJd2YsSUFBSSxJQUFSOztBQUVBLFlBQUlBLEVBQUV1RixXQUFGLEtBQWtCLEtBQXRCLEVBQTZCO0FBQ3pCL2tCLGtCQUFNbXJCLHdCQUFOO0FBQ0FuckIsa0JBQU1vckIsZUFBTjtBQUNBcHJCLGtCQUFNbVMsY0FBTjtBQUNIO0FBRUosS0FWRDs7QUFZQWtOLFVBQU1yaEIsU0FBTixDQUFnQm1aLE9BQWhCLEdBQTBCLFVBQVNHLE9BQVQsRUFBa0I7O0FBRXhDLFlBQUlrSSxJQUFJLElBQVI7O0FBRUFBLFVBQUVtRyxhQUFGOztBQUVBbkcsVUFBRXdFLFdBQUYsR0FBZ0IsRUFBaEI7O0FBRUF4RSxVQUFFb0wsYUFBRjs7QUFFQWh0QixVQUFFLGVBQUYsRUFBbUI0aEIsRUFBRXdGLE9BQXJCLEVBQThCK0IsTUFBOUI7O0FBRUEsWUFBSXZILEVBQUV3RCxLQUFOLEVBQWE7QUFDVHhELGNBQUV3RCxLQUFGLENBQVF6VCxNQUFSO0FBQ0g7O0FBRUQsWUFBS2lRLEVBQUU2RCxVQUFGLElBQWdCN0QsRUFBRTZELFVBQUYsQ0FBYXpqQixNQUFsQyxFQUEyQzs7QUFFdkM0ZixjQUFFNkQsVUFBRixDQUNLaGpCLFdBREwsQ0FDaUIseUNBRGpCLEVBRUs0bkIsVUFGTCxDQUVnQixvQ0FGaEIsRUFHS2xaLEdBSEwsQ0FHUyxTQUhULEVBR21CLEVBSG5COztBQUtBLGdCQUFLeVEsRUFBRTJHLFFBQUYsQ0FBV3pRLElBQVgsQ0FBaUI4SixFQUFFbFYsT0FBRixDQUFVMFYsU0FBM0IsQ0FBTCxFQUE2QztBQUN6Q1Isa0JBQUU2RCxVQUFGLENBQWE5VCxNQUFiO0FBQ0g7QUFDSjs7QUFFRCxZQUFLaVEsRUFBRTRELFVBQUYsSUFBZ0I1RCxFQUFFNEQsVUFBRixDQUFheGpCLE1BQWxDLEVBQTJDOztBQUV2QzRmLGNBQUU0RCxVQUFGLENBQ0svaUIsV0FETCxDQUNpQix5Q0FEakIsRUFFSzRuQixVQUZMLENBRWdCLG9DQUZoQixFQUdLbFosR0FITCxDQUdTLFNBSFQsRUFHbUIsRUFIbkI7O0FBS0EsZ0JBQUt5USxFQUFFMkcsUUFBRixDQUFXelEsSUFBWCxDQUFpQjhKLEVBQUVsVixPQUFGLENBQVUyVixTQUEzQixDQUFMLEVBQTZDO0FBQ3pDVCxrQkFBRTRELFVBQUYsQ0FBYTdULE1BQWI7QUFDSDtBQUNKOztBQUdELFlBQUlpUSxFQUFFa0UsT0FBTixFQUFlOztBQUVYbEUsY0FBRWtFLE9BQUYsQ0FDS3JqQixXQURMLENBQ2lCLG1FQURqQixFQUVLNG5CLFVBRkwsQ0FFZ0IsYUFGaEIsRUFHS0EsVUFITCxDQUdnQixrQkFIaEIsRUFJS3JuQixJQUpMLENBSVUsWUFBVTtBQUNaaEQsa0JBQUUsSUFBRixFQUFRdUYsSUFBUixDQUFhLE9BQWIsRUFBc0J2RixFQUFFLElBQUYsRUFBUTJTLElBQVIsQ0FBYSxpQkFBYixDQUF0QjtBQUNILGFBTkw7O0FBUUFpUCxjQUFFaUUsV0FBRixDQUFjL1gsUUFBZCxDQUF1QixLQUFLcEIsT0FBTCxDQUFhcVgsS0FBcEMsRUFBMkNvRixNQUEzQzs7QUFFQXZILGNBQUVpRSxXQUFGLENBQWNzRCxNQUFkOztBQUVBdkgsY0FBRXVFLEtBQUYsQ0FBUWdELE1BQVI7O0FBRUF2SCxjQUFFd0YsT0FBRixDQUFVL2lCLE1BQVYsQ0FBaUJ1ZCxFQUFFa0UsT0FBbkI7QUFDSDs7QUFFRGxFLFVBQUUwTCxXQUFGOztBQUVBMUwsVUFBRXdGLE9BQUYsQ0FBVTNrQixXQUFWLENBQXNCLGNBQXRCO0FBQ0FtZixVQUFFd0YsT0FBRixDQUFVM2tCLFdBQVYsQ0FBc0IsbUJBQXRCO0FBQ0FtZixVQUFFd0YsT0FBRixDQUFVM2tCLFdBQVYsQ0FBc0IsY0FBdEI7O0FBRUFtZixVQUFFMEUsU0FBRixHQUFjLElBQWQ7O0FBRUEsWUFBRyxDQUFDNU0sT0FBSixFQUFhO0FBQ1RrSSxjQUFFd0YsT0FBRixDQUFVOU4sT0FBVixDQUFrQixTQUFsQixFQUE2QixDQUFDc0ksQ0FBRCxDQUE3QjtBQUNIO0FBRUosS0F4RUQ7O0FBMEVBSCxVQUFNcmhCLFNBQU4sQ0FBZ0J3cEIsaUJBQWhCLEdBQW9DLFVBQVM3RixLQUFULEVBQWdCOztBQUVoRCxZQUFJbkMsSUFBSSxJQUFSO0FBQUEsWUFDSW9JLGFBQWEsRUFEakI7O0FBR0FBLG1CQUFXcEksRUFBRTJGLGNBQWIsSUFBK0IsRUFBL0I7O0FBRUEsWUFBSTNGLEVBQUVsVixPQUFGLENBQVV3VyxJQUFWLEtBQW1CLEtBQXZCLEVBQThCO0FBQzFCdEIsY0FBRWlFLFdBQUYsQ0FBYzFVLEdBQWQsQ0FBa0I2WSxVQUFsQjtBQUNILFNBRkQsTUFFTztBQUNIcEksY0FBRWtFLE9BQUYsQ0FBVWtELEVBQVYsQ0FBYWpGLEtBQWIsRUFBb0I1UyxHQUFwQixDQUF3QjZZLFVBQXhCO0FBQ0g7QUFFSixLQWJEOztBQWVBdkksVUFBTXJoQixTQUFOLENBQWdCcXRCLFNBQWhCLEdBQTRCLFVBQVNDLFVBQVQsRUFBcUJ0ZCxRQUFyQixFQUErQjs7QUFFdkQsWUFBSXdSLElBQUksSUFBUjs7QUFFQSxZQUFJQSxFQUFFZ0YsY0FBRixLQUFxQixLQUF6QixFQUFnQzs7QUFFNUJoRixjQUFFa0UsT0FBRixDQUFVa0QsRUFBVixDQUFhMEUsVUFBYixFQUF5QnZjLEdBQXpCLENBQTZCO0FBQ3pCeVQsd0JBQVFoRCxFQUFFbFYsT0FBRixDQUFVa1k7QUFETyxhQUE3Qjs7QUFJQWhELGNBQUVrRSxPQUFGLENBQVVrRCxFQUFWLENBQWEwRSxVQUFiLEVBQXlCeFYsT0FBekIsQ0FBaUM7QUFDN0J5Vix5QkFBUztBQURvQixhQUFqQyxFQUVHL0wsRUFBRWxWLE9BQUYsQ0FBVTJILEtBRmIsRUFFb0J1TixFQUFFbFYsT0FBRixDQUFVMEgsTUFGOUIsRUFFc0NoRSxRQUZ0QztBQUlILFNBVkQsTUFVTzs7QUFFSHdSLGNBQUUrSCxlQUFGLENBQWtCK0QsVUFBbEI7O0FBRUE5TCxjQUFFa0UsT0FBRixDQUFVa0QsRUFBVixDQUFhMEUsVUFBYixFQUF5QnZjLEdBQXpCLENBQTZCO0FBQ3pCd2MseUJBQVMsQ0FEZ0I7QUFFekIvSSx3QkFBUWhELEVBQUVsVixPQUFGLENBQVVrWTtBQUZPLGFBQTdCOztBQUtBLGdCQUFJeFUsUUFBSixFQUFjO0FBQ1ZwRywyQkFBVyxZQUFXOztBQUVsQjRYLHNCQUFFZ0ksaUJBQUYsQ0FBb0I4RCxVQUFwQjs7QUFFQXRkLDZCQUFTOVAsSUFBVDtBQUNILGlCQUxELEVBS0dzaEIsRUFBRWxWLE9BQUYsQ0FBVTJILEtBTGI7QUFNSDtBQUVKO0FBRUosS0FsQ0Q7O0FBb0NBb04sVUFBTXJoQixTQUFOLENBQWdCd3RCLFlBQWhCLEdBQStCLFVBQVNGLFVBQVQsRUFBcUI7O0FBRWhELFlBQUk5TCxJQUFJLElBQVI7O0FBRUEsWUFBSUEsRUFBRWdGLGNBQUYsS0FBcUIsS0FBekIsRUFBZ0M7O0FBRTVCaEYsY0FBRWtFLE9BQUYsQ0FBVWtELEVBQVYsQ0FBYTBFLFVBQWIsRUFBeUJ4VixPQUF6QixDQUFpQztBQUM3QnlWLHlCQUFTLENBRG9CO0FBRTdCL0ksd0JBQVFoRCxFQUFFbFYsT0FBRixDQUFVa1ksTUFBVixHQUFtQjtBQUZFLGFBQWpDLEVBR0doRCxFQUFFbFYsT0FBRixDQUFVMkgsS0FIYixFQUdvQnVOLEVBQUVsVixPQUFGLENBQVUwSCxNQUg5QjtBQUtILFNBUEQsTUFPTzs7QUFFSHdOLGNBQUUrSCxlQUFGLENBQWtCK0QsVUFBbEI7O0FBRUE5TCxjQUFFa0UsT0FBRixDQUFVa0QsRUFBVixDQUFhMEUsVUFBYixFQUF5QnZjLEdBQXpCLENBQTZCO0FBQ3pCd2MseUJBQVMsQ0FEZ0I7QUFFekIvSSx3QkFBUWhELEVBQUVsVixPQUFGLENBQVVrWSxNQUFWLEdBQW1CO0FBRkYsYUFBN0I7QUFLSDtBQUVKLEtBdEJEOztBQXdCQW5ELFVBQU1yaEIsU0FBTixDQUFnQnl0QixZQUFoQixHQUErQnBNLE1BQU1yaEIsU0FBTixDQUFnQjB0QixXQUFoQixHQUE4QixVQUFTNW5CLE1BQVQsRUFBaUI7O0FBRTFFLFlBQUkwYixJQUFJLElBQVI7O0FBRUEsWUFBSTFiLFdBQVcsSUFBZixFQUFxQjs7QUFFakIwYixjQUFFeUYsWUFBRixHQUFpQnpGLEVBQUVrRSxPQUFuQjs7QUFFQWxFLGNBQUVrSCxNQUFGOztBQUVBbEgsY0FBRWlFLFdBQUYsQ0FBYy9YLFFBQWQsQ0FBdUIsS0FBS3BCLE9BQUwsQ0FBYXFYLEtBQXBDLEVBQTJDb0YsTUFBM0M7O0FBRUF2SCxjQUFFeUYsWUFBRixDQUFlbmhCLE1BQWYsQ0FBc0JBLE1BQXRCLEVBQThCRyxRQUE5QixDQUF1Q3ViLEVBQUVpRSxXQUF6Qzs7QUFFQWpFLGNBQUV3SCxNQUFGO0FBRUg7QUFFSixLQWxCRDs7QUFvQkEzSCxVQUFNcmhCLFNBQU4sQ0FBZ0IydEIsWUFBaEIsR0FBK0IsWUFBVzs7QUFFdEMsWUFBSW5NLElBQUksSUFBUjs7QUFFQUEsVUFBRXdGLE9BQUYsQ0FDS3ZkLEdBREwsQ0FDUyx3QkFEVCxFQUVLbEYsRUFGTCxDQUVRLHdCQUZSLEVBRWtDLEdBRmxDLEVBRXVDLFVBQVN2QyxLQUFULEVBQWdCOztBQUVuREEsa0JBQU1tckIsd0JBQU47QUFDQSxnQkFBSVMsTUFBTWh1QixFQUFFLElBQUYsQ0FBVjs7QUFFQWdLLHVCQUFXLFlBQVc7O0FBRWxCLG9CQUFJNFgsRUFBRWxWLE9BQUYsQ0FBVWdYLFlBQWQsRUFBNkI7QUFDekI5QixzQkFBRWlGLFFBQUYsR0FBYW1ILElBQUkvYSxFQUFKLENBQU8sUUFBUCxDQUFiO0FBQ0EyTyxzQkFBRWlHLFFBQUY7QUFDSDtBQUVKLGFBUEQsRUFPRyxDQVBIO0FBU0gsU0FoQkQ7QUFpQkgsS0FyQkQ7O0FBdUJBcEcsVUFBTXJoQixTQUFOLENBQWdCNnRCLFVBQWhCLEdBQTZCeE0sTUFBTXJoQixTQUFOLENBQWdCOHRCLGlCQUFoQixHQUFvQyxZQUFXOztBQUV4RSxZQUFJdE0sSUFBSSxJQUFSO0FBQ0EsZUFBT0EsRUFBRXVELFlBQVQ7QUFFSCxLQUxEOztBQU9BMUQsVUFBTXJoQixTQUFOLENBQWdCb3FCLFdBQWhCLEdBQThCLFlBQVc7O0FBRXJDLFlBQUk1SSxJQUFJLElBQVI7O0FBRUEsWUFBSXVNLGFBQWEsQ0FBakI7QUFDQSxZQUFJQyxVQUFVLENBQWQ7QUFDQSxZQUFJQyxXQUFXLENBQWY7O0FBRUEsWUFBSXpNLEVBQUVsVixPQUFGLENBQVUyVyxRQUFWLEtBQXVCLElBQTNCLEVBQWlDO0FBQzdCLGdCQUFJekIsRUFBRStELFVBQUYsSUFBZ0IvRCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBOUIsRUFBNEM7QUFDdkMsa0JBQUVvSyxRQUFGO0FBQ0osYUFGRCxNQUVPO0FBQ0gsdUJBQU9GLGFBQWF2TSxFQUFFK0QsVUFBdEIsRUFBa0M7QUFDOUIsc0JBQUUwSSxRQUFGO0FBQ0FGLGlDQUFhQyxVQUFVeE0sRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQWpDO0FBQ0FrSywrQkFBV3hNLEVBQUVsVixPQUFGLENBQVV3WCxjQUFWLElBQTRCdEMsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQXRDLEdBQXFEckMsRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQS9ELEdBQWdGdEMsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQXJHO0FBQ0g7QUFDSjtBQUNKLFNBVkQsTUFVTyxJQUFJckMsRUFBRWxWLE9BQUYsQ0FBVThWLFVBQVYsS0FBeUIsSUFBN0IsRUFBbUM7QUFDdEM2TCx1QkFBV3pNLEVBQUUrRCxVQUFiO0FBQ0gsU0FGTSxNQUVBLElBQUcsQ0FBQy9ELEVBQUVsVixPQUFGLENBQVV5VixRQUFkLEVBQXdCO0FBQzNCa00sdUJBQVcsSUFBSTFrQixLQUFLeVUsSUFBTCxDQUFVLENBQUN3RCxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTFCLElBQTBDckMsRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQTlELENBQWY7QUFDSCxTQUZNLE1BRUQ7QUFDRixtQkFBT2lLLGFBQWF2TSxFQUFFK0QsVUFBdEIsRUFBa0M7QUFDOUIsa0JBQUUwSSxRQUFGO0FBQ0FGLDZCQUFhQyxVQUFVeE0sRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQWpDO0FBQ0FrSywyQkFBV3hNLEVBQUVsVixPQUFGLENBQVV3WCxjQUFWLElBQTRCdEMsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQXRDLEdBQXFEckMsRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQS9ELEdBQWdGdEMsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQXJHO0FBQ0g7QUFDSjs7QUFFRCxlQUFPb0ssV0FBVyxDQUFsQjtBQUVILEtBaENEOztBQWtDQTVNLFVBQU1yaEIsU0FBTixDQUFnQmt1QixPQUFoQixHQUEwQixVQUFTWixVQUFULEVBQXFCOztBQUUzQyxZQUFJOUwsSUFBSSxJQUFSO0FBQUEsWUFDSTJILFVBREo7QUFBQSxZQUVJZ0YsY0FGSjtBQUFBLFlBR0lDLGlCQUFpQixDQUhyQjtBQUFBLFlBSUlDLFdBSko7QUFBQSxZQUtJQyxJQUxKOztBQU9BOU0sVUFBRW9FLFdBQUYsR0FBZ0IsQ0FBaEI7QUFDQXVJLHlCQUFpQjNNLEVBQUVrRSxPQUFGLENBQVV4USxLQUFWLEdBQWtCOUMsV0FBbEIsQ0FBOEIsSUFBOUIsQ0FBakI7O0FBRUEsWUFBSW9QLEVBQUVsVixPQUFGLENBQVUyVyxRQUFWLEtBQXVCLElBQTNCLEVBQWlDO0FBQzdCLGdCQUFJekIsRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUE3QixFQUEyQztBQUN2Q3JDLGtCQUFFb0UsV0FBRixHQUFpQnBFLEVBQUVnRSxVQUFGLEdBQWVoRSxFQUFFbFYsT0FBRixDQUFVdVgsWUFBMUIsR0FBMEMsQ0FBQyxDQUEzRDtBQUNBeUssdUJBQU8sQ0FBQyxDQUFSOztBQUVBLG9CQUFJOU0sRUFBRWxWLE9BQUYsQ0FBVTZPLFFBQVYsS0FBdUIsSUFBdkIsSUFBK0JxRyxFQUFFbFYsT0FBRixDQUFVOFYsVUFBVixLQUF5QixJQUE1RCxFQUFrRTtBQUM5RCx3QkFBSVosRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQVYsS0FBMkIsQ0FBL0IsRUFBa0M7QUFDOUJ5SywrQkFBTyxDQUFDLEdBQVI7QUFDSCxxQkFGRCxNQUVPLElBQUk5TSxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixLQUEyQixDQUEvQixFQUFrQztBQUNyQ3lLLCtCQUFPLENBQUMsQ0FBUjtBQUNIO0FBQ0o7QUFDREYsaUNBQWtCRCxpQkFBaUIzTSxFQUFFbFYsT0FBRixDQUFVdVgsWUFBNUIsR0FBNEN5SyxJQUE3RDtBQUNIO0FBQ0QsZ0JBQUk5TSxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQXpCLEtBQTRDLENBQWhELEVBQW1EO0FBQy9DLG9CQUFJd0osYUFBYTlMLEVBQUVsVixPQUFGLENBQVV3WCxjQUF2QixHQUF3Q3RDLEVBQUUrRCxVQUExQyxJQUF3RC9ELEVBQUUrRCxVQUFGLEdBQWUvRCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBckYsRUFBbUc7QUFDL0Ysd0JBQUl5SixhQUFhOUwsRUFBRStELFVBQW5CLEVBQStCO0FBQzNCL0QsMEJBQUVvRSxXQUFGLEdBQWlCLENBQUNwRSxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixJQUEwQnlKLGFBQWE5TCxFQUFFK0QsVUFBekMsQ0FBRCxJQUF5RC9ELEVBQUVnRSxVQUE1RCxHQUEwRSxDQUFDLENBQTNGO0FBQ0E0SSx5Q0FBa0IsQ0FBQzVNLEVBQUVsVixPQUFGLENBQVV1WCxZQUFWLElBQTBCeUosYUFBYTlMLEVBQUUrRCxVQUF6QyxDQUFELElBQXlENEksY0FBMUQsR0FBNEUsQ0FBQyxDQUE5RjtBQUNILHFCQUhELE1BR087QUFDSDNNLDBCQUFFb0UsV0FBRixHQUFrQnBFLEVBQUUrRCxVQUFGLEdBQWUvRCxFQUFFbFYsT0FBRixDQUFVd1gsY0FBMUIsR0FBNEN0QyxFQUFFZ0UsVUFBL0MsR0FBNkQsQ0FBQyxDQUE5RTtBQUNBNEkseUNBQW1CNU0sRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV3WCxjQUExQixHQUE0Q3FLLGNBQTdDLEdBQStELENBQUMsQ0FBakY7QUFDSDtBQUNKO0FBQ0o7QUFDSixTQXpCRCxNQXlCTztBQUNILGdCQUFJYixhQUFhOUwsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQXZCLEdBQXNDckMsRUFBRStELFVBQTVDLEVBQXdEO0FBQ3BEL0Qsa0JBQUVvRSxXQUFGLEdBQWdCLENBQUUwSCxhQUFhOUwsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQXhCLEdBQXdDckMsRUFBRStELFVBQTNDLElBQXlEL0QsRUFBRWdFLFVBQTNFO0FBQ0E0SSxpQ0FBaUIsQ0FBRWQsYUFBYTlMLEVBQUVsVixPQUFGLENBQVV1WCxZQUF4QixHQUF3Q3JDLEVBQUUrRCxVQUEzQyxJQUF5RDRJLGNBQTFFO0FBQ0g7QUFDSjs7QUFFRCxZQUFJM00sRUFBRStELFVBQUYsSUFBZ0IvRCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBOUIsRUFBNEM7QUFDeENyQyxjQUFFb0UsV0FBRixHQUFnQixDQUFoQjtBQUNBd0ksNkJBQWlCLENBQWpCO0FBQ0g7O0FBRUQsWUFBSTVNLEVBQUVsVixPQUFGLENBQVU4VixVQUFWLEtBQXlCLElBQXpCLElBQWlDWixFQUFFK0QsVUFBRixJQUFnQi9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUEvRCxFQUE2RTtBQUN6RXJDLGNBQUVvRSxXQUFGLEdBQWtCcEUsRUFBRWdFLFVBQUYsR0FBZWpjLEtBQUswSCxLQUFMLENBQVd1USxFQUFFbFYsT0FBRixDQUFVdVgsWUFBckIsQ0FBaEIsR0FBc0QsQ0FBdkQsR0FBOERyQyxFQUFFZ0UsVUFBRixHQUFlaEUsRUFBRStELFVBQWxCLEdBQWdDLENBQTdHO0FBQ0gsU0FGRCxNQUVPLElBQUkvRCxFQUFFbFYsT0FBRixDQUFVOFYsVUFBVixLQUF5QixJQUF6QixJQUFpQ1osRUFBRWxWLE9BQUYsQ0FBVTJXLFFBQVYsS0FBdUIsSUFBNUQsRUFBa0U7QUFDckV6QixjQUFFb0UsV0FBRixJQUFpQnBFLEVBQUVnRSxVQUFGLEdBQWVqYyxLQUFLMEgsS0FBTCxDQUFXdVEsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQVYsR0FBeUIsQ0FBcEMsQ0FBZixHQUF3RHJDLEVBQUVnRSxVQUEzRTtBQUNILFNBRk0sTUFFQSxJQUFJaEUsRUFBRWxWLE9BQUYsQ0FBVThWLFVBQVYsS0FBeUIsSUFBN0IsRUFBbUM7QUFDdENaLGNBQUVvRSxXQUFGLEdBQWdCLENBQWhCO0FBQ0FwRSxjQUFFb0UsV0FBRixJQUFpQnBFLEVBQUVnRSxVQUFGLEdBQWVqYyxLQUFLMEgsS0FBTCxDQUFXdVEsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQVYsR0FBeUIsQ0FBcEMsQ0FBaEM7QUFDSDs7QUFFRCxZQUFJckMsRUFBRWxWLE9BQUYsQ0FBVTZPLFFBQVYsS0FBdUIsS0FBM0IsRUFBa0M7QUFDOUJnTyx5QkFBZW1FLGFBQWE5TCxFQUFFZ0UsVUFBaEIsR0FBOEIsQ0FBQyxDQUFoQyxHQUFxQ2hFLEVBQUVvRSxXQUFwRDtBQUNILFNBRkQsTUFFTztBQUNIdUQseUJBQWVtRSxhQUFhYSxjQUFkLEdBQWdDLENBQUMsQ0FBbEMsR0FBdUNDLGNBQXBEO0FBQ0g7O0FBRUQsWUFBSTVNLEVBQUVsVixPQUFGLENBQVUrWCxhQUFWLEtBQTRCLElBQWhDLEVBQXNDOztBQUVsQyxnQkFBSTdDLEVBQUUrRCxVQUFGLElBQWdCL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTFCLElBQTBDckMsRUFBRWxWLE9BQUYsQ0FBVTJXLFFBQVYsS0FBdUIsS0FBckUsRUFBNEU7QUFDeEVvTCw4QkFBYzdNLEVBQUVpRSxXQUFGLENBQWMvWCxRQUFkLENBQXVCLGNBQXZCLEVBQXVDa2IsRUFBdkMsQ0FBMEMwRSxVQUExQyxDQUFkO0FBQ0gsYUFGRCxNQUVPO0FBQ0hlLDhCQUFjN00sRUFBRWlFLFdBQUYsQ0FBYy9YLFFBQWQsQ0FBdUIsY0FBdkIsRUFBdUNrYixFQUF2QyxDQUEwQzBFLGFBQWE5TCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBakUsQ0FBZDtBQUNIOztBQUVELGdCQUFJckMsRUFBRWxWLE9BQUYsQ0FBVW9YLEdBQVYsS0FBa0IsSUFBdEIsRUFBNEI7QUFDeEIsb0JBQUkySyxZQUFZLENBQVosQ0FBSixFQUFvQjtBQUNoQmxGLGlDQUFhLENBQUMzSCxFQUFFaUUsV0FBRixDQUFjclMsS0FBZCxLQUF3QmliLFlBQVksQ0FBWixFQUFlRSxVQUF2QyxHQUFvREYsWUFBWWpiLEtBQVosRUFBckQsSUFBNEUsQ0FBQyxDQUExRjtBQUNILGlCQUZELE1BRU87QUFDSCtWLGlDQUFjLENBQWQ7QUFDSDtBQUNKLGFBTkQsTUFNTztBQUNIQSw2QkFBYWtGLFlBQVksQ0FBWixJQUFpQkEsWUFBWSxDQUFaLEVBQWVFLFVBQWYsR0FBNEIsQ0FBQyxDQUE5QyxHQUFrRCxDQUEvRDtBQUNIOztBQUVELGdCQUFJL00sRUFBRWxWLE9BQUYsQ0FBVThWLFVBQVYsS0FBeUIsSUFBN0IsRUFBbUM7QUFDL0Isb0JBQUlaLEVBQUUrRCxVQUFGLElBQWdCL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTFCLElBQTBDckMsRUFBRWxWLE9BQUYsQ0FBVTJXLFFBQVYsS0FBdUIsS0FBckUsRUFBNEU7QUFDeEVvTCxrQ0FBYzdNLEVBQUVpRSxXQUFGLENBQWMvWCxRQUFkLENBQXVCLGNBQXZCLEVBQXVDa2IsRUFBdkMsQ0FBMEMwRSxVQUExQyxDQUFkO0FBQ0gsaUJBRkQsTUFFTztBQUNIZSxrQ0FBYzdNLEVBQUVpRSxXQUFGLENBQWMvWCxRQUFkLENBQXVCLGNBQXZCLEVBQXVDa2IsRUFBdkMsQ0FBMEMwRSxhQUFhOUwsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQXZCLEdBQXNDLENBQWhGLENBQWQ7QUFDSDs7QUFFRCxvQkFBSXJDLEVBQUVsVixPQUFGLENBQVVvWCxHQUFWLEtBQWtCLElBQXRCLEVBQTRCO0FBQ3hCLHdCQUFJMkssWUFBWSxDQUFaLENBQUosRUFBb0I7QUFDaEJsRixxQ0FBYSxDQUFDM0gsRUFBRWlFLFdBQUYsQ0FBY3JTLEtBQWQsS0FBd0JpYixZQUFZLENBQVosRUFBZUUsVUFBdkMsR0FBb0RGLFlBQVlqYixLQUFaLEVBQXJELElBQTRFLENBQUMsQ0FBMUY7QUFDSCxxQkFGRCxNQUVPO0FBQ0grVixxQ0FBYyxDQUFkO0FBQ0g7QUFDSixpQkFORCxNQU1PO0FBQ0hBLGlDQUFha0YsWUFBWSxDQUFaLElBQWlCQSxZQUFZLENBQVosRUFBZUUsVUFBZixHQUE0QixDQUFDLENBQTlDLEdBQWtELENBQS9EO0FBQ0g7O0FBRURwRiw4QkFBYyxDQUFDM0gsRUFBRXVFLEtBQUYsQ0FBUTNTLEtBQVIsS0FBa0JpYixZQUFZN1QsVUFBWixFQUFuQixJQUErQyxDQUE3RDtBQUNIO0FBQ0o7O0FBRUQsZUFBTzJPLFVBQVA7QUFFSCxLQXpHRDs7QUEyR0E5SCxVQUFNcmhCLFNBQU4sQ0FBZ0J3dUIsU0FBaEIsR0FBNEJuTixNQUFNcmhCLFNBQU4sQ0FBZ0J5dUIsY0FBaEIsR0FBaUMsVUFBU0MsTUFBVCxFQUFpQjs7QUFFMUUsWUFBSWxOLElBQUksSUFBUjs7QUFFQSxlQUFPQSxFQUFFbFYsT0FBRixDQUFVb2lCLE1BQVYsQ0FBUDtBQUVILEtBTkQ7O0FBUUFyTixVQUFNcmhCLFNBQU4sQ0FBZ0Iwc0IsbUJBQWhCLEdBQXNDLFlBQVc7O0FBRTdDLFlBQUlsTCxJQUFJLElBQVI7QUFBQSxZQUNJdU0sYUFBYSxDQURqQjtBQUFBLFlBRUlDLFVBQVUsQ0FGZDtBQUFBLFlBR0lXLFVBQVUsRUFIZDtBQUFBLFlBSUlDLEdBSko7O0FBTUEsWUFBSXBOLEVBQUVsVixPQUFGLENBQVUyVyxRQUFWLEtBQXVCLEtBQTNCLEVBQWtDO0FBQzlCMkwsa0JBQU1wTixFQUFFK0QsVUFBUjtBQUNILFNBRkQsTUFFTztBQUNId0kseUJBQWF2TSxFQUFFbFYsT0FBRixDQUFVd1gsY0FBVixHQUEyQixDQUFDLENBQXpDO0FBQ0FrSyxzQkFBVXhNLEVBQUVsVixPQUFGLENBQVV3WCxjQUFWLEdBQTJCLENBQUMsQ0FBdEM7QUFDQThLLGtCQUFNcE4sRUFBRStELFVBQUYsR0FBZSxDQUFyQjtBQUNIOztBQUVELGVBQU93SSxhQUFhYSxHQUFwQixFQUF5QjtBQUNyQkQsb0JBQVFudEIsSUFBUixDQUFhdXNCLFVBQWI7QUFDQUEseUJBQWFDLFVBQVV4TSxFQUFFbFYsT0FBRixDQUFVd1gsY0FBakM7QUFDQWtLLHVCQUFXeE0sRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQVYsSUFBNEJ0QyxFQUFFbFYsT0FBRixDQUFVdVgsWUFBdEMsR0FBcURyQyxFQUFFbFYsT0FBRixDQUFVd1gsY0FBL0QsR0FBZ0Z0QyxFQUFFbFYsT0FBRixDQUFVdVgsWUFBckc7QUFDSDs7QUFFRCxlQUFPOEssT0FBUDtBQUVILEtBeEJEOztBQTBCQXROLFVBQU1yaEIsU0FBTixDQUFnQjZ1QixRQUFoQixHQUEyQixZQUFXOztBQUVsQyxlQUFPLElBQVA7QUFFSCxLQUpEOztBQU1BeE4sVUFBTXJoQixTQUFOLENBQWdCOHVCLGFBQWhCLEdBQWdDLFlBQVc7O0FBRXZDLFlBQUl0TixJQUFJLElBQVI7QUFBQSxZQUNJdU4sZUFESjtBQUFBLFlBQ3FCQyxXQURyQjtBQUFBLFlBQ2tDQyxZQURsQzs7QUFHQUEsdUJBQWV6TixFQUFFbFYsT0FBRixDQUFVOFYsVUFBVixLQUF5QixJQUF6QixHQUFnQ1osRUFBRWdFLFVBQUYsR0FBZWpjLEtBQUswSCxLQUFMLENBQVd1USxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixHQUF5QixDQUFwQyxDQUEvQyxHQUF3RixDQUF2Rzs7QUFFQSxZQUFJckMsRUFBRWxWLE9BQUYsQ0FBVTBYLFlBQVYsS0FBMkIsSUFBL0IsRUFBcUM7QUFDakN4QyxjQUFFaUUsV0FBRixDQUFjM2dCLElBQWQsQ0FBbUIsY0FBbkIsRUFBbUNsQyxJQUFuQyxDQUF3QyxVQUFTbUQsS0FBVCxFQUFnQjRkLEtBQWhCLEVBQXVCO0FBQzNELG9CQUFJQSxNQUFNNEssVUFBTixHQUFtQlUsWUFBbkIsR0FBbUNydkIsRUFBRStqQixLQUFGLEVBQVNuSixVQUFULEtBQXdCLENBQTNELEdBQWlFZ0gsRUFBRXFFLFNBQUYsR0FBYyxDQUFDLENBQXBGLEVBQXdGO0FBQ3BGbUosa0NBQWNyTCxLQUFkO0FBQ0EsMkJBQU8sS0FBUDtBQUNIO0FBQ0osYUFMRDs7QUFPQW9MLDhCQUFrQnhsQixLQUFLQyxHQUFMLENBQVM1SixFQUFFb3ZCLFdBQUYsRUFBZTdwQixJQUFmLENBQW9CLGtCQUFwQixJQUEwQ3FjLEVBQUV1RCxZQUFyRCxLQUFzRSxDQUF4Rjs7QUFFQSxtQkFBT2dLLGVBQVA7QUFFSCxTQVpELE1BWU87QUFDSCxtQkFBT3ZOLEVBQUVsVixPQUFGLENBQVV3WCxjQUFqQjtBQUNIO0FBRUosS0F2QkQ7O0FBeUJBekMsVUFBTXJoQixTQUFOLENBQWdCa3ZCLElBQWhCLEdBQXVCN04sTUFBTXJoQixTQUFOLENBQWdCbXZCLFNBQWhCLEdBQTRCLFVBQVN4TCxLQUFULEVBQWdCdUksV0FBaEIsRUFBNkI7O0FBRTVFLFlBQUkxSyxJQUFJLElBQVI7O0FBRUFBLFVBQUVxRyxXQUFGLENBQWM7QUFDVnRWLGtCQUFNO0FBQ0Y1RCx5QkFBUyxPQURQO0FBRUY1SSx1QkFBT3FwQixTQUFTekwsS0FBVDtBQUZMO0FBREksU0FBZCxFQUtHdUksV0FMSDtBQU9ILEtBWEQ7O0FBYUE3SyxVQUFNcmhCLFNBQU4sQ0FBZ0IyRCxJQUFoQixHQUF1QixVQUFTMHJCLFFBQVQsRUFBbUI7O0FBRXRDLFlBQUk3TixJQUFJLElBQVI7O0FBRUEsWUFBSSxDQUFDNWhCLEVBQUU0aEIsRUFBRXdGLE9BQUosRUFBYXNJLFFBQWIsQ0FBc0IsbUJBQXRCLENBQUwsRUFBaUQ7O0FBRTdDMXZCLGNBQUU0aEIsRUFBRXdGLE9BQUosRUFBYTdqQixRQUFiLENBQXNCLG1CQUF0Qjs7QUFFQXFlLGNBQUVvSixTQUFGO0FBQ0FwSixjQUFFNkksUUFBRjtBQUNBN0ksY0FBRStOLFFBQUY7QUFDQS9OLGNBQUVnTyxTQUFGO0FBQ0FoTyxjQUFFaU8sVUFBRjtBQUNBak8sY0FBRWtPLGdCQUFGO0FBQ0FsTyxjQUFFbU8sWUFBRjtBQUNBbk8sY0FBRWtKLFVBQUY7QUFDQWxKLGNBQUUrSixlQUFGLENBQWtCLElBQWxCO0FBQ0EvSixjQUFFbU0sWUFBRjtBQUVIOztBQUVELFlBQUkwQixRQUFKLEVBQWM7QUFDVjdOLGNBQUV3RixPQUFGLENBQVU5TixPQUFWLENBQWtCLE1BQWxCLEVBQTBCLENBQUNzSSxDQUFELENBQTFCO0FBQ0g7O0FBRUQsWUFBSUEsRUFBRWxWLE9BQUYsQ0FBVW9WLGFBQVYsS0FBNEIsSUFBaEMsRUFBc0M7QUFDbENGLGNBQUVvTyxPQUFGO0FBQ0g7O0FBRUQsWUFBS3BPLEVBQUVsVixPQUFGLENBQVU0VixRQUFmLEVBQTBCOztBQUV0QlYsY0FBRW9GLE1BQUYsR0FBVyxLQUFYO0FBQ0FwRixjQUFFaUcsUUFBRjtBQUVIO0FBRUosS0FwQ0Q7O0FBc0NBcEcsVUFBTXJoQixTQUFOLENBQWdCNHZCLE9BQWhCLEdBQTBCLFlBQVc7QUFDakMsWUFBSXBPLElBQUksSUFBUjtBQUFBLFlBQ1FxTyxlQUFldG1CLEtBQUt5VSxJQUFMLENBQVV3RCxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQW5DLENBRHZCO0FBQUEsWUFFUWlNLG9CQUFvQnRPLEVBQUVrTCxtQkFBRixHQUF3QjVtQixNQUF4QixDQUErQixVQUFTeVEsR0FBVCxFQUFjO0FBQzdELG1CQUFRQSxPQUFPLENBQVIsSUFBZUEsTUFBTWlMLEVBQUUrRCxVQUE5QjtBQUNILFNBRm1CLENBRjVCOztBQU1BL0QsVUFBRWtFLE9BQUYsQ0FBVXhVLEdBQVYsQ0FBY3NRLEVBQUVpRSxXQUFGLENBQWMzZ0IsSUFBZCxDQUFtQixlQUFuQixDQUFkLEVBQW1ESyxJQUFuRCxDQUF3RDtBQUNwRCwyQkFBZSxNQURxQztBQUVwRCx3QkFBWTtBQUZ3QyxTQUF4RCxFQUdHTCxJQUhILENBR1EsMEJBSFIsRUFHb0NLLElBSHBDLENBR3lDO0FBQ3JDLHdCQUFZO0FBRHlCLFNBSHpDOztBQU9BLFlBQUlxYyxFQUFFd0QsS0FBRixLQUFZLElBQWhCLEVBQXNCO0FBQ2xCeEQsY0FBRWtFLE9BQUYsQ0FBVS9ULEdBQVYsQ0FBYzZQLEVBQUVpRSxXQUFGLENBQWMzZ0IsSUFBZCxDQUFtQixlQUFuQixDQUFkLEVBQW1EbEMsSUFBbkQsQ0FBd0QsVUFBUzBJLENBQVQsRUFBWTtBQUNoRSxvQkFBSXlrQixvQkFBb0JELGtCQUFrQmhsQixPQUFsQixDQUEwQlEsQ0FBMUIsQ0FBeEI7O0FBRUExTCxrQkFBRSxJQUFGLEVBQVF1RixJQUFSLENBQWE7QUFDVCw0QkFBUSxVQURDO0FBRVQsMEJBQU0sZ0JBQWdCcWMsRUFBRUYsV0FBbEIsR0FBZ0NoVyxDQUY3QjtBQUdULGdDQUFZLENBQUM7QUFISixpQkFBYjs7QUFNQSxvQkFBSXlrQixzQkFBc0IsQ0FBQyxDQUEzQixFQUE4QjtBQUMzQix3QkFBSUMsb0JBQW9CLHdCQUF3QnhPLEVBQUVGLFdBQTFCLEdBQXdDeU8saUJBQWhFO0FBQ0Esd0JBQUlud0IsRUFBRSxNQUFNb3dCLGlCQUFSLEVBQTJCcHVCLE1BQS9CLEVBQXVDO0FBQ3JDaEMsMEJBQUUsSUFBRixFQUFRdUYsSUFBUixDQUFhO0FBQ1QsZ0RBQW9CNnFCO0FBRFgseUJBQWI7QUFHRDtBQUNIO0FBQ0osYUFqQkQ7O0FBbUJBeE8sY0FBRXdELEtBQUYsQ0FBUTdmLElBQVIsQ0FBYSxNQUFiLEVBQXFCLFNBQXJCLEVBQWdDTCxJQUFoQyxDQUFxQyxJQUFyQyxFQUEyQ2xDLElBQTNDLENBQWdELFVBQVMwSSxDQUFULEVBQVk7QUFDeEQsb0JBQUkya0IsbUJBQW1CSCxrQkFBa0J4a0IsQ0FBbEIsQ0FBdkI7O0FBRUExTCxrQkFBRSxJQUFGLEVBQVF1RixJQUFSLENBQWE7QUFDVCw0QkFBUTtBQURDLGlCQUFiOztBQUlBdkYsa0JBQUUsSUFBRixFQUFRa0YsSUFBUixDQUFhLFFBQWIsRUFBdUJvUSxLQUF2QixHQUErQi9QLElBQS9CLENBQW9DO0FBQ2hDLDRCQUFRLEtBRHdCO0FBRWhDLDBCQUFNLHdCQUF3QnFjLEVBQUVGLFdBQTFCLEdBQXdDaFcsQ0FGZDtBQUdoQyxxQ0FBaUIsZ0JBQWdCa1csRUFBRUYsV0FBbEIsR0FBZ0MyTyxnQkFIakI7QUFJaEMsa0NBQWUza0IsSUFBSSxDQUFMLEdBQVUsTUFBVixHQUFtQnVrQixZQUpEO0FBS2hDLHFDQUFpQixJQUxlO0FBTWhDLGdDQUFZO0FBTm9CLGlCQUFwQztBQVNILGFBaEJELEVBZ0JHakgsRUFoQkgsQ0FnQk1wSCxFQUFFdUQsWUFoQlIsRUFnQnNCamdCLElBaEJ0QixDQWdCMkIsUUFoQjNCLEVBZ0JxQ0ssSUFoQnJDLENBZ0IwQztBQUN0QyxpQ0FBaUIsTUFEcUI7QUFFdEMsNEJBQVk7QUFGMEIsYUFoQjFDLEVBbUJHd1UsR0FuQkg7QUFvQkg7O0FBRUQsYUFBSyxJQUFJck8sSUFBRWtXLEVBQUV1RCxZQUFSLEVBQXNCNkosTUFBSXRqQixJQUFFa1csRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTNDLEVBQXlEdlksSUFBSXNqQixHQUE3RCxFQUFrRXRqQixHQUFsRSxFQUF1RTtBQUNyRSxnQkFBSWtXLEVBQUVsVixPQUFGLENBQVUwVyxhQUFkLEVBQTZCO0FBQzNCeEIsa0JBQUVrRSxPQUFGLENBQVVrRCxFQUFWLENBQWF0ZCxDQUFiLEVBQWdCbkcsSUFBaEIsQ0FBcUIsRUFBQyxZQUFZLEdBQWIsRUFBckI7QUFDRCxhQUZELE1BRU87QUFDTHFjLGtCQUFFa0UsT0FBRixDQUFVa0QsRUFBVixDQUFhdGQsQ0FBYixFQUFnQjJlLFVBQWhCLENBQTJCLFVBQTNCO0FBQ0Q7QUFDRjs7QUFFRHpJLFVBQUU2RyxXQUFGO0FBRUgsS0FsRUQ7O0FBb0VBaEgsVUFBTXJoQixTQUFOLENBQWdCa3dCLGVBQWhCLEdBQWtDLFlBQVc7O0FBRXpDLFlBQUkxTyxJQUFJLElBQVI7O0FBRUEsWUFBSUEsRUFBRWxWLE9BQUYsQ0FBVXdWLE1BQVYsS0FBcUIsSUFBckIsSUFBNkJOLEVBQUUrRCxVQUFGLEdBQWUvRCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBMUQsRUFBd0U7QUFDcEVyQyxjQUFFNkQsVUFBRixDQUNJNWIsR0FESixDQUNRLGFBRFIsRUFFSWxGLEVBRkosQ0FFTyxhQUZQLEVBRXNCO0FBQ2RvSyx5QkFBUztBQURLLGFBRnRCLEVBSU02UyxFQUFFcUcsV0FKUjtBQUtBckcsY0FBRTRELFVBQUYsQ0FDSTNiLEdBREosQ0FDUSxhQURSLEVBRUlsRixFQUZKLENBRU8sYUFGUCxFQUVzQjtBQUNkb0sseUJBQVM7QUFESyxhQUZ0QixFQUlNNlMsRUFBRXFHLFdBSlI7O0FBTUEsZ0JBQUlyRyxFQUFFbFYsT0FBRixDQUFVb1YsYUFBVixLQUE0QixJQUFoQyxFQUFzQztBQUNsQ0Ysa0JBQUU2RCxVQUFGLENBQWE5Z0IsRUFBYixDQUFnQixlQUFoQixFQUFpQ2lkLEVBQUUwRyxVQUFuQztBQUNBMUcsa0JBQUU0RCxVQUFGLENBQWE3Z0IsRUFBYixDQUFnQixlQUFoQixFQUFpQ2lkLEVBQUUwRyxVQUFuQztBQUNIO0FBQ0o7QUFFSixLQXRCRDs7QUF3QkE3RyxVQUFNcmhCLFNBQU4sQ0FBZ0Jtd0IsYUFBaEIsR0FBZ0MsWUFBVzs7QUFFdkMsWUFBSTNPLElBQUksSUFBUjs7QUFFQSxZQUFJQSxFQUFFbFYsT0FBRixDQUFVb1csSUFBVixLQUFtQixJQUFuQixJQUEyQmxCLEVBQUUrRCxVQUFGLEdBQWUvRCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBeEQsRUFBc0U7QUFDbEVqa0IsY0FBRSxJQUFGLEVBQVE0aEIsRUFBRXdELEtBQVYsRUFBaUJ6Z0IsRUFBakIsQ0FBb0IsYUFBcEIsRUFBbUM7QUFDL0JvSyx5QkFBUztBQURzQixhQUFuQyxFQUVHNlMsRUFBRXFHLFdBRkw7O0FBSUEsZ0JBQUlyRyxFQUFFbFYsT0FBRixDQUFVb1YsYUFBVixLQUE0QixJQUFoQyxFQUFzQztBQUNsQ0Ysa0JBQUV3RCxLQUFGLENBQVF6Z0IsRUFBUixDQUFXLGVBQVgsRUFBNEJpZCxFQUFFMEcsVUFBOUI7QUFDSDtBQUNKOztBQUVELFlBQUkxRyxFQUFFbFYsT0FBRixDQUFVb1csSUFBVixLQUFtQixJQUFuQixJQUEyQmxCLEVBQUVsVixPQUFGLENBQVVpWCxnQkFBVixLQUErQixJQUExRCxJQUFrRS9CLEVBQUUrRCxVQUFGLEdBQWUvRCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBL0YsRUFBNkc7O0FBRXpHamtCLGNBQUUsSUFBRixFQUFRNGhCLEVBQUV3RCxLQUFWLEVBQ0t6Z0IsRUFETCxDQUNRLGtCQURSLEVBQzRCM0UsRUFBRThuQixLQUFGLENBQVFsRyxFQUFFcUwsU0FBVixFQUFxQnJMLENBQXJCLEVBQXdCLElBQXhCLENBRDVCLEVBRUtqZCxFQUZMLENBRVEsa0JBRlIsRUFFNEIzRSxFQUFFOG5CLEtBQUYsQ0FBUWxHLEVBQUVxTCxTQUFWLEVBQXFCckwsQ0FBckIsRUFBd0IsS0FBeEIsQ0FGNUI7QUFJSDtBQUVKLEtBdEJEOztBQXdCQUgsVUFBTXJoQixTQUFOLENBQWdCb3dCLGVBQWhCLEdBQWtDLFlBQVc7O0FBRXpDLFlBQUk1TyxJQUFJLElBQVI7O0FBRUEsWUFBS0EsRUFBRWxWLE9BQUYsQ0FBVStXLFlBQWYsRUFBOEI7O0FBRTFCN0IsY0FBRXVFLEtBQUYsQ0FBUXhoQixFQUFSLENBQVcsa0JBQVgsRUFBK0IzRSxFQUFFOG5CLEtBQUYsQ0FBUWxHLEVBQUVxTCxTQUFWLEVBQXFCckwsQ0FBckIsRUFBd0IsSUFBeEIsQ0FBL0I7QUFDQUEsY0FBRXVFLEtBQUYsQ0FBUXhoQixFQUFSLENBQVcsa0JBQVgsRUFBK0IzRSxFQUFFOG5CLEtBQUYsQ0FBUWxHLEVBQUVxTCxTQUFWLEVBQXFCckwsQ0FBckIsRUFBd0IsS0FBeEIsQ0FBL0I7QUFFSDtBQUVKLEtBWEQ7O0FBYUFILFVBQU1yaEIsU0FBTixDQUFnQjB2QixnQkFBaEIsR0FBbUMsWUFBVzs7QUFFMUMsWUFBSWxPLElBQUksSUFBUjs7QUFFQUEsVUFBRTBPLGVBQUY7O0FBRUExTyxVQUFFMk8sYUFBRjtBQUNBM08sVUFBRTRPLGVBQUY7O0FBRUE1TyxVQUFFdUUsS0FBRixDQUFReGhCLEVBQVIsQ0FBVyxrQ0FBWCxFQUErQztBQUMzQzhyQixvQkFBUTtBQURtQyxTQUEvQyxFQUVHN08sRUFBRXdHLFlBRkw7QUFHQXhHLFVBQUV1RSxLQUFGLENBQVF4aEIsRUFBUixDQUFXLGlDQUFYLEVBQThDO0FBQzFDOHJCLG9CQUFRO0FBRGtDLFNBQTlDLEVBRUc3TyxFQUFFd0csWUFGTDtBQUdBeEcsVUFBRXVFLEtBQUYsQ0FBUXhoQixFQUFSLENBQVcsOEJBQVgsRUFBMkM7QUFDdkM4ckIsb0JBQVE7QUFEK0IsU0FBM0MsRUFFRzdPLEVBQUV3RyxZQUZMO0FBR0F4RyxVQUFFdUUsS0FBRixDQUFReGhCLEVBQVIsQ0FBVyxvQ0FBWCxFQUFpRDtBQUM3QzhyQixvQkFBUTtBQURxQyxTQUFqRCxFQUVHN08sRUFBRXdHLFlBRkw7O0FBSUF4RyxVQUFFdUUsS0FBRixDQUFReGhCLEVBQVIsQ0FBVyxhQUFYLEVBQTBCaWQsRUFBRXJNLFlBQTVCOztBQUVBdlYsVUFBRU8sUUFBRixFQUFZb0UsRUFBWixDQUFlaWQsRUFBRTRGLGdCQUFqQixFQUFtQ3huQixFQUFFOG5CLEtBQUYsQ0FBUWxHLEVBQUVzTCxVQUFWLEVBQXNCdEwsQ0FBdEIsQ0FBbkM7O0FBRUEsWUFBSUEsRUFBRWxWLE9BQUYsQ0FBVW9WLGFBQVYsS0FBNEIsSUFBaEMsRUFBc0M7QUFDbENGLGNBQUV1RSxLQUFGLENBQVF4aEIsRUFBUixDQUFXLGVBQVgsRUFBNEJpZCxFQUFFMEcsVUFBOUI7QUFDSDs7QUFFRCxZQUFJMUcsRUFBRWxWLE9BQUYsQ0FBVXlXLGFBQVYsS0FBNEIsSUFBaEMsRUFBc0M7QUFDbENuakIsY0FBRTRoQixFQUFFaUUsV0FBSixFQUFpQi9YLFFBQWpCLEdBQTRCbkosRUFBNUIsQ0FBK0IsYUFBL0IsRUFBOENpZCxFQUFFc0csYUFBaEQ7QUFDSDs7QUFFRGxvQixVQUFFc0MsTUFBRixFQUFVcUMsRUFBVixDQUFhLG1DQUFtQ2lkLEVBQUVGLFdBQWxELEVBQStEMWhCLEVBQUU4bkIsS0FBRixDQUFRbEcsRUFBRXdMLGlCQUFWLEVBQTZCeEwsQ0FBN0IsQ0FBL0Q7O0FBRUE1aEIsVUFBRXNDLE1BQUYsRUFBVXFDLEVBQVYsQ0FBYSx3QkFBd0JpZCxFQUFFRixXQUF2QyxFQUFvRDFoQixFQUFFOG5CLEtBQUYsQ0FBUWxHLEVBQUV5TCxNQUFWLEVBQWtCekwsQ0FBbEIsQ0FBcEQ7O0FBRUE1aEIsVUFBRSxtQkFBRixFQUF1QjRoQixFQUFFaUUsV0FBekIsRUFBc0NsaEIsRUFBdEMsQ0FBeUMsV0FBekMsRUFBc0RpZCxFQUFFck4sY0FBeEQ7O0FBRUF2VSxVQUFFc0MsTUFBRixFQUFVcUMsRUFBVixDQUFhLHNCQUFzQmlkLEVBQUVGLFdBQXJDLEVBQWtERSxFQUFFdUcsV0FBcEQ7QUFDQW5vQixVQUFFNGhCLEVBQUV1RyxXQUFKO0FBRUgsS0EzQ0Q7O0FBNkNBMUcsVUFBTXJoQixTQUFOLENBQWdCc3dCLE1BQWhCLEdBQXlCLFlBQVc7O0FBRWhDLFlBQUk5TyxJQUFJLElBQVI7O0FBRUEsWUFBSUEsRUFBRWxWLE9BQUYsQ0FBVXdWLE1BQVYsS0FBcUIsSUFBckIsSUFBNkJOLEVBQUUrRCxVQUFGLEdBQWUvRCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBMUQsRUFBd0U7O0FBRXBFckMsY0FBRTZELFVBQUYsQ0FBYWxmLElBQWI7QUFDQXFiLGNBQUU0RCxVQUFGLENBQWFqZixJQUFiO0FBRUg7O0FBRUQsWUFBSXFiLEVBQUVsVixPQUFGLENBQVVvVyxJQUFWLEtBQW1CLElBQW5CLElBQTJCbEIsRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUF4RCxFQUFzRTs7QUFFbEVyQyxjQUFFd0QsS0FBRixDQUFRN2UsSUFBUjtBQUVIO0FBRUosS0FqQkQ7O0FBbUJBa2IsVUFBTXJoQixTQUFOLENBQWdCa29CLFVBQWhCLEdBQTZCLFVBQVNsbUIsS0FBVCxFQUFnQjs7QUFFekMsWUFBSXdmLElBQUksSUFBUjtBQUNDO0FBQ0QsWUFBRyxDQUFDeGYsTUFBTW5CLE1BQU4sQ0FBYTB2QixPQUFiLENBQXFCNXFCLEtBQXJCLENBQTJCLHVCQUEzQixDQUFKLEVBQXlEO0FBQ3JELGdCQUFJM0QsTUFBTXd1QixPQUFOLEtBQWtCLEVBQWxCLElBQXdCaFAsRUFBRWxWLE9BQUYsQ0FBVW9WLGFBQVYsS0FBNEIsSUFBeEQsRUFBOEQ7QUFDMURGLGtCQUFFcUcsV0FBRixDQUFjO0FBQ1Z0ViwwQkFBTTtBQUNGNUQsaUNBQVM2UyxFQUFFbFYsT0FBRixDQUFVb1gsR0FBVixLQUFrQixJQUFsQixHQUF5QixNQUF6QixHQUFtQztBQUQxQztBQURJLGlCQUFkO0FBS0gsYUFORCxNQU1PLElBQUkxaEIsTUFBTXd1QixPQUFOLEtBQWtCLEVBQWxCLElBQXdCaFAsRUFBRWxWLE9BQUYsQ0FBVW9WLGFBQVYsS0FBNEIsSUFBeEQsRUFBOEQ7QUFDakVGLGtCQUFFcUcsV0FBRixDQUFjO0FBQ1Z0ViwwQkFBTTtBQUNGNUQsaUNBQVM2UyxFQUFFbFYsT0FBRixDQUFVb1gsR0FBVixLQUFrQixJQUFsQixHQUF5QixVQUF6QixHQUFzQztBQUQ3QztBQURJLGlCQUFkO0FBS0g7QUFDSjtBQUVKLEtBcEJEOztBQXNCQXJDLFVBQU1yaEIsU0FBTixDQUFnQm1qQixRQUFoQixHQUEyQixZQUFXOztBQUVsQyxZQUFJM0IsSUFBSSxJQUFSO0FBQUEsWUFDSWlQLFNBREo7QUFBQSxZQUNlQyxVQURmO0FBQUEsWUFDMkJDLFVBRDNCO0FBQUEsWUFDdUNDLFFBRHZDOztBQUdBLGlCQUFTQyxVQUFULENBQW9CQyxXQUFwQixFQUFpQzs7QUFFN0JseEIsY0FBRSxnQkFBRixFQUFvQmt4QixXQUFwQixFQUFpQ2x1QixJQUFqQyxDQUFzQyxZQUFXOztBQUU3QyxvQkFBSThMLFFBQVE5TyxFQUFFLElBQUYsQ0FBWjtBQUFBLG9CQUNJbXhCLGNBQWNueEIsRUFBRSxJQUFGLEVBQVF1RixJQUFSLENBQWEsV0FBYixDQURsQjtBQUFBLG9CQUVJNnJCLGNBQWNweEIsRUFBRSxJQUFGLEVBQVF1RixJQUFSLENBQWEsYUFBYixDQUZsQjtBQUFBLG9CQUdJOHJCLGFBQWNyeEIsRUFBRSxJQUFGLEVBQVF1RixJQUFSLENBQWEsWUFBYixLQUE4QnFjLEVBQUV3RixPQUFGLENBQVU3aEIsSUFBVixDQUFlLFlBQWYsQ0FIaEQ7QUFBQSxvQkFJSStyQixjQUFjL3dCLFNBQVNnckIsYUFBVCxDQUF1QixLQUF2QixDQUpsQjs7QUFNQStGLDRCQUFZdmhCLE1BQVosR0FBcUIsWUFBVzs7QUFFNUJqQiwwQkFDS29KLE9BREwsQ0FDYSxFQUFFeVYsU0FBUyxDQUFYLEVBRGIsRUFDNkIsR0FEN0IsRUFDa0MsWUFBVzs7QUFFckMsNEJBQUl5RCxXQUFKLEVBQWlCO0FBQ2J0aUIsa0NBQ0t2SixJQURMLENBQ1UsUUFEVixFQUNvQjZyQixXQURwQjs7QUFHQSxnQ0FBSUMsVUFBSixFQUFnQjtBQUNadmlCLHNDQUNLdkosSUFETCxDQUNVLE9BRFYsRUFDbUI4ckIsVUFEbkI7QUFFSDtBQUNKOztBQUVEdmlCLDhCQUNLdkosSUFETCxDQUNVLEtBRFYsRUFDaUI0ckIsV0FEakIsRUFFS2paLE9BRkwsQ0FFYSxFQUFFeVYsU0FBUyxDQUFYLEVBRmIsRUFFNkIsR0FGN0IsRUFFa0MsWUFBVztBQUNyQzdlLGtDQUNLdWIsVUFETCxDQUNnQixrQ0FEaEIsRUFFSzVuQixXQUZMLENBRWlCLGVBRmpCO0FBR0gseUJBTkw7QUFPQW1mLDBCQUFFd0YsT0FBRixDQUFVOU4sT0FBVixDQUFrQixZQUFsQixFQUFnQyxDQUFDc0ksQ0FBRCxFQUFJOVMsS0FBSixFQUFXcWlCLFdBQVgsQ0FBaEM7QUFDSCxxQkFyQkw7QUF1QkgsaUJBekJEOztBQTJCQUcsNEJBQVlyaEIsT0FBWixHQUFzQixZQUFXOztBQUU3Qm5CLDBCQUNLdWIsVUFETCxDQUNpQixXQURqQixFQUVLNW5CLFdBRkwsQ0FFa0IsZUFGbEIsRUFHS2MsUUFITCxDQUdlLHNCQUhmOztBQUtBcWUsc0JBQUV3RixPQUFGLENBQVU5TixPQUFWLENBQWtCLGVBQWxCLEVBQW1DLENBQUVzSSxDQUFGLEVBQUs5UyxLQUFMLEVBQVlxaUIsV0FBWixDQUFuQztBQUVILGlCQVREOztBQVdBRyw0QkFBWTFoQixHQUFaLEdBQWtCdWhCLFdBQWxCO0FBRUgsYUFoREQ7QUFrREg7O0FBRUQsWUFBSXZQLEVBQUVsVixPQUFGLENBQVU4VixVQUFWLEtBQXlCLElBQTdCLEVBQW1DO0FBQy9CLGdCQUFJWixFQUFFbFYsT0FBRixDQUFVMlcsUUFBVixLQUF1QixJQUEzQixFQUFpQztBQUM3QjBOLDZCQUFhblAsRUFBRXVELFlBQUYsSUFBa0J2RCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixHQUF5QixDQUF6QixHQUE2QixDQUEvQyxDQUFiO0FBQ0ErTSwyQkFBV0QsYUFBYW5QLEVBQUVsVixPQUFGLENBQVV1WCxZQUF2QixHQUFzQyxDQUFqRDtBQUNILGFBSEQsTUFHTztBQUNIOE0sNkJBQWFwbkIsS0FBS3FsQixHQUFMLENBQVMsQ0FBVCxFQUFZcE4sRUFBRXVELFlBQUYsSUFBa0J2RCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixHQUF5QixDQUF6QixHQUE2QixDQUEvQyxDQUFaLENBQWI7QUFDQStNLDJCQUFXLEtBQUtwUCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixHQUF5QixDQUF6QixHQUE2QixDQUFsQyxJQUF1Q3JDLEVBQUV1RCxZQUFwRDtBQUNIO0FBQ0osU0FSRCxNQVFPO0FBQ0g0TCx5QkFBYW5QLEVBQUVsVixPQUFGLENBQVUyVyxRQUFWLEdBQXFCekIsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQVYsR0FBeUJyQyxFQUFFdUQsWUFBaEQsR0FBK0R2RCxFQUFFdUQsWUFBOUU7QUFDQTZMLHVCQUFXcm5CLEtBQUt5VSxJQUFMLENBQVUyUyxhQUFhblAsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQWpDLENBQVg7QUFDQSxnQkFBSXJDLEVBQUVsVixPQUFGLENBQVV3VyxJQUFWLEtBQW1CLElBQXZCLEVBQTZCO0FBQ3pCLG9CQUFJNk4sYUFBYSxDQUFqQixFQUFvQkE7QUFDcEIsb0JBQUlDLFlBQVlwUCxFQUFFK0QsVUFBbEIsRUFBOEJxTDtBQUNqQztBQUNKOztBQUVESCxvQkFBWWpQLEVBQUV3RixPQUFGLENBQVVsaUIsSUFBVixDQUFlLGNBQWYsRUFBK0I3RSxLQUEvQixDQUFxQzB3QixVQUFyQyxFQUFpREMsUUFBakQsQ0FBWjs7QUFFQSxZQUFJcFAsRUFBRWxWLE9BQUYsQ0FBVTZXLFFBQVYsS0FBdUIsYUFBM0IsRUFBMEM7QUFDdEMsZ0JBQUlnTyxZQUFZUixhQUFhLENBQTdCO0FBQUEsZ0JBQ0lTLFlBQVlSLFFBRGhCO0FBQUEsZ0JBRUlsTCxVQUFVbEUsRUFBRXdGLE9BQUYsQ0FBVWxpQixJQUFWLENBQWUsY0FBZixDQUZkOztBQUlBLGlCQUFLLElBQUl3RyxJQUFJLENBQWIsRUFBZ0JBLElBQUlrVyxFQUFFbFYsT0FBRixDQUFVd1gsY0FBOUIsRUFBOEN4WSxHQUE5QyxFQUFtRDtBQUMvQyxvQkFBSTZsQixZQUFZLENBQWhCLEVBQW1CQSxZQUFZM1AsRUFBRStELFVBQUYsR0FBZSxDQUEzQjtBQUNuQmtMLDRCQUFZQSxVQUFVdmYsR0FBVixDQUFjd1UsUUFBUWtELEVBQVIsQ0FBV3VJLFNBQVgsQ0FBZCxDQUFaO0FBQ0FWLDRCQUFZQSxVQUFVdmYsR0FBVixDQUFjd1UsUUFBUWtELEVBQVIsQ0FBV3dJLFNBQVgsQ0FBZCxDQUFaO0FBQ0FEO0FBQ0FDO0FBQ0g7QUFDSjs7QUFFRFAsbUJBQVdKLFNBQVg7O0FBRUEsWUFBSWpQLEVBQUUrRCxVQUFGLElBQWdCL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTlCLEVBQTRDO0FBQ3hDNk0seUJBQWFsUCxFQUFFd0YsT0FBRixDQUFVbGlCLElBQVYsQ0FBZSxjQUFmLENBQWI7QUFDQStyQix1QkFBV0gsVUFBWDtBQUNILFNBSEQsTUFJQSxJQUFJbFAsRUFBRXVELFlBQUYsSUFBa0J2RCxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQS9DLEVBQTZEO0FBQ3pENk0seUJBQWFsUCxFQUFFd0YsT0FBRixDQUFVbGlCLElBQVYsQ0FBZSxlQUFmLEVBQWdDN0UsS0FBaEMsQ0FBc0MsQ0FBdEMsRUFBeUN1aEIsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQW5ELENBQWI7QUFDQWdOLHVCQUFXSCxVQUFYO0FBQ0gsU0FIRCxNQUdPLElBQUlsUCxFQUFFdUQsWUFBRixLQUFtQixDQUF2QixFQUEwQjtBQUM3QjJMLHlCQUFhbFAsRUFBRXdGLE9BQUYsQ0FBVWxpQixJQUFWLENBQWUsZUFBZixFQUFnQzdFLEtBQWhDLENBQXNDdWhCLEVBQUVsVixPQUFGLENBQVV1WCxZQUFWLEdBQXlCLENBQUMsQ0FBaEUsQ0FBYjtBQUNBZ04sdUJBQVdILFVBQVg7QUFDSDtBQUVKLEtBMUdEOztBQTRHQXJQLFVBQU1yaEIsU0FBTixDQUFnQnl2QixVQUFoQixHQUE2QixZQUFXOztBQUVwQyxZQUFJak8sSUFBSSxJQUFSOztBQUVBQSxVQUFFdUcsV0FBRjs7QUFFQXZHLFVBQUVpRSxXQUFGLENBQWMxVSxHQUFkLENBQWtCO0FBQ2R3YyxxQkFBUztBQURLLFNBQWxCOztBQUlBL0wsVUFBRXdGLE9BQUYsQ0FBVTNrQixXQUFWLENBQXNCLGVBQXRCOztBQUVBbWYsVUFBRThPLE1BQUY7O0FBRUEsWUFBSTlPLEVBQUVsVixPQUFGLENBQVU2VyxRQUFWLEtBQXVCLGFBQTNCLEVBQTBDO0FBQ3RDM0IsY0FBRTZQLG1CQUFGO0FBQ0g7QUFFSixLQWxCRDs7QUFvQkFoUSxVQUFNcmhCLFNBQU4sQ0FBZ0IwRixJQUFoQixHQUF1QjJiLE1BQU1yaEIsU0FBTixDQUFnQnN4QixTQUFoQixHQUE0QixZQUFXOztBQUUxRCxZQUFJOVAsSUFBSSxJQUFSOztBQUVBQSxVQUFFcUcsV0FBRixDQUFjO0FBQ1Z0VixrQkFBTTtBQUNGNUQseUJBQVM7QUFEUDtBQURJLFNBQWQ7QUFNSCxLQVZEOztBQVlBMFMsVUFBTXJoQixTQUFOLENBQWdCZ3RCLGlCQUFoQixHQUFvQyxZQUFXOztBQUUzQyxZQUFJeEwsSUFBSSxJQUFSOztBQUVBQSxVQUFFK0osZUFBRjtBQUNBL0osVUFBRXVHLFdBQUY7QUFFSCxLQVBEOztBQVNBMUcsVUFBTXJoQixTQUFOLENBQWdCdXhCLEtBQWhCLEdBQXdCbFEsTUFBTXJoQixTQUFOLENBQWdCd3hCLFVBQWhCLEdBQTZCLFlBQVc7O0FBRTVELFlBQUloUSxJQUFJLElBQVI7O0FBRUFBLFVBQUVtRyxhQUFGO0FBQ0FuRyxVQUFFb0YsTUFBRixHQUFXLElBQVg7QUFFSCxLQVBEOztBQVNBdkYsVUFBTXJoQixTQUFOLENBQWdCeXhCLElBQWhCLEdBQXVCcFEsTUFBTXJoQixTQUFOLENBQWdCMHhCLFNBQWhCLEdBQTRCLFlBQVc7O0FBRTFELFlBQUlsUSxJQUFJLElBQVI7O0FBRUFBLFVBQUVpRyxRQUFGO0FBQ0FqRyxVQUFFbFYsT0FBRixDQUFVNFYsUUFBVixHQUFxQixJQUFyQjtBQUNBVixVQUFFb0YsTUFBRixHQUFXLEtBQVg7QUFDQXBGLFVBQUVpRixRQUFGLEdBQWEsS0FBYjtBQUNBakYsVUFBRWtGLFdBQUYsR0FBZ0IsS0FBaEI7QUFFSCxLQVZEOztBQVlBckYsVUFBTXJoQixTQUFOLENBQWdCMnhCLFNBQWhCLEdBQTRCLFVBQVM1ckIsS0FBVCxFQUFnQjs7QUFFeEMsWUFBSXliLElBQUksSUFBUjs7QUFFQSxZQUFJLENBQUNBLEVBQUUwRSxTQUFQLEVBQW1COztBQUVmMUUsY0FBRXdGLE9BQUYsQ0FBVTlOLE9BQVYsQ0FBa0IsYUFBbEIsRUFBaUMsQ0FBQ3NJLENBQUQsRUFBSXpiLEtBQUosQ0FBakM7O0FBRUF5YixjQUFFa0QsU0FBRixHQUFjLEtBQWQ7O0FBRUEsZ0JBQUlsRCxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTdCLEVBQTJDO0FBQ3ZDckMsa0JBQUV1RyxXQUFGO0FBQ0g7O0FBRUR2RyxjQUFFcUUsU0FBRixHQUFjLElBQWQ7O0FBRUEsZ0JBQUtyRSxFQUFFbFYsT0FBRixDQUFVNFYsUUFBZixFQUEwQjtBQUN0QlYsa0JBQUVpRyxRQUFGO0FBQ0g7O0FBRUQsZ0JBQUlqRyxFQUFFbFYsT0FBRixDQUFVb1YsYUFBVixLQUE0QixJQUFoQyxFQUFzQztBQUNsQ0Ysa0JBQUVvTyxPQUFGOztBQUVBLG9CQUFJcE8sRUFBRWxWLE9BQUYsQ0FBVTBXLGFBQWQsRUFBNkI7QUFDekIsd0JBQUk0TyxnQkFBZ0JoeUIsRUFBRTRoQixFQUFFa0UsT0FBRixDQUFVMEYsR0FBVixDQUFjNUosRUFBRXVELFlBQWhCLENBQUYsQ0FBcEI7QUFDQTZNLGtDQUFjenNCLElBQWQsQ0FBbUIsVUFBbkIsRUFBK0IsQ0FBL0IsRUFBa0MyUixLQUFsQztBQUNIO0FBQ0o7QUFFSjtBQUVKLEtBL0JEOztBQWlDQXVLLFVBQU1yaEIsU0FBTixDQUFnQjZ4QixJQUFoQixHQUF1QnhRLE1BQU1yaEIsU0FBTixDQUFnQjh4QixTQUFoQixHQUE0QixZQUFXOztBQUUxRCxZQUFJdFEsSUFBSSxJQUFSOztBQUVBQSxVQUFFcUcsV0FBRixDQUFjO0FBQ1Z0VixrQkFBTTtBQUNGNUQseUJBQVM7QUFEUDtBQURJLFNBQWQ7QUFNSCxLQVZEOztBQVlBMFMsVUFBTXJoQixTQUFOLENBQWdCbVUsY0FBaEIsR0FBaUMsVUFBU25TLEtBQVQsRUFBZ0I7O0FBRTdDQSxjQUFNbVMsY0FBTjtBQUVILEtBSkQ7O0FBTUFrTixVQUFNcmhCLFNBQU4sQ0FBZ0JxeEIsbUJBQWhCLEdBQXNDLFVBQVVVLFFBQVYsRUFBcUI7O0FBRXZEQSxtQkFBV0EsWUFBWSxDQUF2Qjs7QUFFQSxZQUFJdlEsSUFBSSxJQUFSO0FBQUEsWUFDSXdRLGNBQWNweUIsRUFBRyxnQkFBSCxFQUFxQjRoQixFQUFFd0YsT0FBdkIsQ0FEbEI7QUFBQSxZQUVJdFksS0FGSjtBQUFBLFlBR0lxaUIsV0FISjtBQUFBLFlBSUlDLFdBSko7QUFBQSxZQUtJQyxVQUxKO0FBQUEsWUFNSUMsV0FOSjs7QUFRQSxZQUFLYyxZQUFZcHdCLE1BQWpCLEVBQTBCOztBQUV0QjhNLG9CQUFRc2pCLFlBQVk5YyxLQUFaLEVBQVI7QUFDQTZiLDBCQUFjcmlCLE1BQU12SixJQUFOLENBQVcsV0FBWCxDQUFkO0FBQ0E2ckIsMEJBQWN0aUIsTUFBTXZKLElBQU4sQ0FBVyxhQUFYLENBQWQ7QUFDQThyQix5QkFBY3ZpQixNQUFNdkosSUFBTixDQUFXLFlBQVgsS0FBNEJxYyxFQUFFd0YsT0FBRixDQUFVN2hCLElBQVYsQ0FBZSxZQUFmLENBQTFDO0FBQ0ErckIsMEJBQWMvd0IsU0FBU2dyQixhQUFULENBQXVCLEtBQXZCLENBQWQ7O0FBRUErRix3QkFBWXZoQixNQUFaLEdBQXFCLFlBQVc7O0FBRTVCLG9CQUFJcWhCLFdBQUosRUFBaUI7QUFDYnRpQiwwQkFDS3ZKLElBREwsQ0FDVSxRQURWLEVBQ29CNnJCLFdBRHBCOztBQUdBLHdCQUFJQyxVQUFKLEVBQWdCO0FBQ1p2aUIsOEJBQ0t2SixJQURMLENBQ1UsT0FEVixFQUNtQjhyQixVQURuQjtBQUVIO0FBQ0o7O0FBRUR2aUIsc0JBQ0t2SixJQURMLENBQ1csS0FEWCxFQUNrQjRyQixXQURsQixFQUVLOUcsVUFGTCxDQUVnQixrQ0FGaEIsRUFHSzVuQixXQUhMLENBR2lCLGVBSGpCOztBQUtBLG9CQUFLbWYsRUFBRWxWLE9BQUYsQ0FBVXFWLGNBQVYsS0FBNkIsSUFBbEMsRUFBeUM7QUFDckNILHNCQUFFdUcsV0FBRjtBQUNIOztBQUVEdkcsa0JBQUV3RixPQUFGLENBQVU5TixPQUFWLENBQWtCLFlBQWxCLEVBQWdDLENBQUVzSSxDQUFGLEVBQUs5UyxLQUFMLEVBQVlxaUIsV0FBWixDQUFoQztBQUNBdlAsa0JBQUU2UCxtQkFBRjtBQUVILGFBeEJEOztBQTBCQUgsd0JBQVlyaEIsT0FBWixHQUFzQixZQUFXOztBQUU3QixvQkFBS2tpQixXQUFXLENBQWhCLEVBQW9COztBQUVoQjs7Ozs7QUFLQW5vQiwrQkFBWSxZQUFXO0FBQ25CNFgsMEJBQUU2UCxtQkFBRixDQUF1QlUsV0FBVyxDQUFsQztBQUNILHFCQUZELEVBRUcsR0FGSDtBQUlILGlCQVhELE1BV087O0FBRUhyakIsMEJBQ0t1YixVQURMLENBQ2lCLFdBRGpCLEVBRUs1bkIsV0FGTCxDQUVrQixlQUZsQixFQUdLYyxRQUhMLENBR2Usc0JBSGY7O0FBS0FxZSxzQkFBRXdGLE9BQUYsQ0FBVTlOLE9BQVYsQ0FBa0IsZUFBbEIsRUFBbUMsQ0FBRXNJLENBQUYsRUFBSzlTLEtBQUwsRUFBWXFpQixXQUFaLENBQW5DOztBQUVBdlAsc0JBQUU2UCxtQkFBRjtBQUVIO0FBRUosYUExQkQ7O0FBNEJBSCx3QkFBWTFoQixHQUFaLEdBQWtCdWhCLFdBQWxCO0FBRUgsU0FoRUQsTUFnRU87O0FBRUh2UCxjQUFFd0YsT0FBRixDQUFVOU4sT0FBVixDQUFrQixpQkFBbEIsRUFBcUMsQ0FBRXNJLENBQUYsQ0FBckM7QUFFSDtBQUVKLEtBbEZEOztBQW9GQUgsVUFBTXJoQixTQUFOLENBQWdCc1osT0FBaEIsR0FBMEIsVUFBVTJZLFlBQVYsRUFBeUI7O0FBRS9DLFlBQUl6USxJQUFJLElBQVI7QUFBQSxZQUFjdUQsWUFBZDtBQUFBLFlBQTRCbU4sZ0JBQTVCOztBQUVBQSwyQkFBbUIxUSxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTVDOztBQUVBO0FBQ0E7QUFDQSxZQUFJLENBQUNyQyxFQUFFbFYsT0FBRixDQUFVMlcsUUFBWCxJQUF5QnpCLEVBQUV1RCxZQUFGLEdBQWlCbU4sZ0JBQTlDLEVBQWtFO0FBQzlEMVEsY0FBRXVELFlBQUYsR0FBaUJtTixnQkFBakI7QUFDSDs7QUFFRDtBQUNBLFlBQUsxUSxFQUFFK0QsVUFBRixJQUFnQi9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUEvQixFQUE4QztBQUMxQ3JDLGNBQUV1RCxZQUFGLEdBQWlCLENBQWpCO0FBRUg7O0FBRURBLHVCQUFldkQsRUFBRXVELFlBQWpCOztBQUVBdkQsVUFBRXJJLE9BQUYsQ0FBVSxJQUFWOztBQUVBdlosVUFBRTJJLE1BQUYsQ0FBU2laLENBQVQsRUFBWUEsRUFBRWlELFFBQWQsRUFBd0IsRUFBRU0sY0FBY0EsWUFBaEIsRUFBeEI7O0FBRUF2RCxVQUFFN2QsSUFBRjs7QUFFQSxZQUFJLENBQUNzdUIsWUFBTCxFQUFvQjs7QUFFaEJ6USxjQUFFcUcsV0FBRixDQUFjO0FBQ1Z0VixzQkFBTTtBQUNGNUQsNkJBQVMsT0FEUDtBQUVGNUksMkJBQU9nZjtBQUZMO0FBREksYUFBZCxFQUtHLEtBTEg7QUFPSDtBQUVKLEtBckNEOztBQXVDQTFELFVBQU1yaEIsU0FBTixDQUFnQm9vQixtQkFBaEIsR0FBc0MsWUFBVzs7QUFFN0MsWUFBSTVHLElBQUksSUFBUjtBQUFBLFlBQWNrSyxVQUFkO0FBQUEsWUFBMEJ5RyxpQkFBMUI7QUFBQSxZQUE2Q0MsQ0FBN0M7QUFBQSxZQUNJQyxxQkFBcUI3USxFQUFFbFYsT0FBRixDQUFVbVgsVUFBVixJQUF3QixJQURqRDs7QUFHQSxZQUFLN2pCLEVBQUVvSyxJQUFGLENBQU9xb0Isa0JBQVAsTUFBK0IsT0FBL0IsSUFBMENBLG1CQUFtQnp3QixNQUFsRSxFQUEyRTs7QUFFdkU0ZixjQUFFZ0MsU0FBRixHQUFjaEMsRUFBRWxWLE9BQUYsQ0FBVWtYLFNBQVYsSUFBdUIsUUFBckM7O0FBRUEsaUJBQU1rSSxVQUFOLElBQW9CMkcsa0JBQXBCLEVBQXlDOztBQUVyQ0Qsb0JBQUk1USxFQUFFOEUsV0FBRixDQUFjMWtCLE1BQWQsR0FBcUIsQ0FBekI7O0FBRUEsb0JBQUl5d0IsbUJBQW1CckcsY0FBbkIsQ0FBa0NOLFVBQWxDLENBQUosRUFBbUQ7QUFDL0N5Ryx3Q0FBb0JFLG1CQUFtQjNHLFVBQW5CLEVBQStCQSxVQUFuRDs7QUFFQTtBQUNBO0FBQ0EsMkJBQU8wRyxLQUFLLENBQVosRUFBZ0I7QUFDWiw0QkFBSTVRLEVBQUU4RSxXQUFGLENBQWM4TCxDQUFkLEtBQW9CNVEsRUFBRThFLFdBQUYsQ0FBYzhMLENBQWQsTUFBcUJELGlCQUE3QyxFQUFpRTtBQUM3RDNRLDhCQUFFOEUsV0FBRixDQUFjbmIsTUFBZCxDQUFxQmluQixDQUFyQixFQUF1QixDQUF2QjtBQUNIO0FBQ0RBO0FBQ0g7O0FBRUQ1USxzQkFBRThFLFdBQUYsQ0FBYzlrQixJQUFkLENBQW1CMndCLGlCQUFuQjtBQUNBM1Esc0JBQUUrRSxrQkFBRixDQUFxQjRMLGlCQUFyQixJQUEwQ0UsbUJBQW1CM0csVUFBbkIsRUFBK0JuSyxRQUF6RTtBQUVIO0FBRUo7O0FBRURDLGNBQUU4RSxXQUFGLENBQWN4SCxJQUFkLENBQW1CLFVBQVNsVCxDQUFULEVBQVlDLENBQVosRUFBZTtBQUM5Qix1QkFBUzJWLEVBQUVsVixPQUFGLENBQVU4VyxXQUFaLEdBQTRCeFgsSUFBRUMsQ0FBOUIsR0FBa0NBLElBQUVELENBQTNDO0FBQ0gsYUFGRDtBQUlIO0FBRUosS0F0Q0Q7O0FBd0NBeVYsVUFBTXJoQixTQUFOLENBQWdCZ3BCLE1BQWhCLEdBQXlCLFlBQVc7O0FBRWhDLFlBQUl4SCxJQUFJLElBQVI7O0FBRUFBLFVBQUVrRSxPQUFGLEdBQ0lsRSxFQUFFaUUsV0FBRixDQUNLL1gsUUFETCxDQUNjOFQsRUFBRWxWLE9BQUYsQ0FBVXFYLEtBRHhCLEVBRUt4Z0IsUUFGTCxDQUVjLGFBRmQsQ0FESjs7QUFLQXFlLFVBQUUrRCxVQUFGLEdBQWUvRCxFQUFFa0UsT0FBRixDQUFVOWpCLE1BQXpCOztBQUVBLFlBQUk0ZixFQUFFdUQsWUFBRixJQUFrQnZELEVBQUUrRCxVQUFwQixJQUFrQy9ELEVBQUV1RCxZQUFGLEtBQW1CLENBQXpELEVBQTREO0FBQ3hEdkQsY0FBRXVELFlBQUYsR0FBaUJ2RCxFQUFFdUQsWUFBRixHQUFpQnZELEVBQUVsVixPQUFGLENBQVV3WCxjQUE1QztBQUNIOztBQUVELFlBQUl0QyxFQUFFK0QsVUFBRixJQUFnQi9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUE5QixFQUE0QztBQUN4Q3JDLGNBQUV1RCxZQUFGLEdBQWlCLENBQWpCO0FBQ0g7O0FBRUR2RCxVQUFFNEcsbUJBQUY7O0FBRUE1RyxVQUFFK04sUUFBRjtBQUNBL04sVUFBRWlKLGFBQUY7QUFDQWpKLFVBQUV3SSxXQUFGO0FBQ0F4SSxVQUFFbU8sWUFBRjtBQUNBbk8sVUFBRTBPLGVBQUY7QUFDQTFPLFVBQUUwSSxTQUFGO0FBQ0ExSSxVQUFFa0osVUFBRjtBQUNBbEosVUFBRTJPLGFBQUY7QUFDQTNPLFVBQUV1TCxrQkFBRjtBQUNBdkwsVUFBRTRPLGVBQUY7O0FBRUE1TyxVQUFFK0osZUFBRixDQUFrQixLQUFsQixFQUF5QixJQUF6Qjs7QUFFQSxZQUFJL0osRUFBRWxWLE9BQUYsQ0FBVXlXLGFBQVYsS0FBNEIsSUFBaEMsRUFBc0M7QUFDbENuakIsY0FBRTRoQixFQUFFaUUsV0FBSixFQUFpQi9YLFFBQWpCLEdBQTRCbkosRUFBNUIsQ0FBK0IsYUFBL0IsRUFBOENpZCxFQUFFc0csYUFBaEQ7QUFDSDs7QUFFRHRHLFVBQUVtSixlQUFGLENBQWtCLE9BQU9uSixFQUFFdUQsWUFBVCxLQUEwQixRQUExQixHQUFxQ3ZELEVBQUV1RCxZQUF2QyxHQUFzRCxDQUF4RTs7QUFFQXZELFVBQUV1RyxXQUFGO0FBQ0F2RyxVQUFFbU0sWUFBRjs7QUFFQW5NLFVBQUVvRixNQUFGLEdBQVcsQ0FBQ3BGLEVBQUVsVixPQUFGLENBQVU0VixRQUF0QjtBQUNBVixVQUFFaUcsUUFBRjs7QUFFQWpHLFVBQUV3RixPQUFGLENBQVU5TixPQUFWLENBQWtCLFFBQWxCLEVBQTRCLENBQUNzSSxDQUFELENBQTVCO0FBRUgsS0FoREQ7O0FBa0RBSCxVQUFNcmhCLFNBQU4sQ0FBZ0JpdEIsTUFBaEIsR0FBeUIsWUFBVzs7QUFFaEMsWUFBSXpMLElBQUksSUFBUjs7QUFFQSxZQUFJNWhCLEVBQUVzQyxNQUFGLEVBQVVrUixLQUFWLE9BQXNCb08sRUFBRXJPLFdBQTVCLEVBQXlDO0FBQ3JDN0oseUJBQWFrWSxFQUFFOFEsV0FBZjtBQUNBOVEsY0FBRThRLFdBQUYsR0FBZ0Jwd0IsT0FBTzBILFVBQVAsQ0FBa0IsWUFBVztBQUN6QzRYLGtCQUFFck8sV0FBRixHQUFnQnZULEVBQUVzQyxNQUFGLEVBQVVrUixLQUFWLEVBQWhCO0FBQ0FvTyxrQkFBRStKLGVBQUY7QUFDQSxvQkFBSSxDQUFDL0osRUFBRTBFLFNBQVAsRUFBbUI7QUFBRTFFLHNCQUFFdUcsV0FBRjtBQUFrQjtBQUMxQyxhQUplLEVBSWIsRUFKYSxDQUFoQjtBQUtIO0FBQ0osS0FaRDs7QUFjQTFHLFVBQU1yaEIsU0FBTixDQUFnQnV5QixXQUFoQixHQUE4QmxSLE1BQU1yaEIsU0FBTixDQUFnQnd5QixXQUFoQixHQUE4QixVQUFTenNCLEtBQVQsRUFBZ0Iwc0IsWUFBaEIsRUFBOEJDLFNBQTlCLEVBQXlDOztBQUVqRyxZQUFJbFIsSUFBSSxJQUFSOztBQUVBLFlBQUksT0FBT3piLEtBQVAsS0FBa0IsU0FBdEIsRUFBaUM7QUFDN0Iwc0IsMkJBQWUxc0IsS0FBZjtBQUNBQSxvQkFBUTBzQixpQkFBaUIsSUFBakIsR0FBd0IsQ0FBeEIsR0FBNEJqUixFQUFFK0QsVUFBRixHQUFlLENBQW5EO0FBQ0gsU0FIRCxNQUdPO0FBQ0h4ZixvQkFBUTBzQixpQkFBaUIsSUFBakIsR0FBd0IsRUFBRTFzQixLQUExQixHQUFrQ0EsS0FBMUM7QUFDSDs7QUFFRCxZQUFJeWIsRUFBRStELFVBQUYsR0FBZSxDQUFmLElBQW9CeGYsUUFBUSxDQUE1QixJQUFpQ0EsUUFBUXliLEVBQUUrRCxVQUFGLEdBQWUsQ0FBNUQsRUFBK0Q7QUFDM0QsbUJBQU8sS0FBUDtBQUNIOztBQUVEL0QsVUFBRWtILE1BQUY7O0FBRUEsWUFBSWdLLGNBQWMsSUFBbEIsRUFBd0I7QUFDcEJsUixjQUFFaUUsV0FBRixDQUFjL1gsUUFBZCxHQUF5QjZELE1BQXpCO0FBQ0gsU0FGRCxNQUVPO0FBQ0hpUSxjQUFFaUUsV0FBRixDQUFjL1gsUUFBZCxDQUF1QixLQUFLcEIsT0FBTCxDQUFhcVgsS0FBcEMsRUFBMkNpRixFQUEzQyxDQUE4QzdpQixLQUE5QyxFQUFxRHdMLE1BQXJEO0FBQ0g7O0FBRURpUSxVQUFFa0UsT0FBRixHQUFZbEUsRUFBRWlFLFdBQUYsQ0FBYy9YLFFBQWQsQ0FBdUIsS0FBS3BCLE9BQUwsQ0FBYXFYLEtBQXBDLENBQVo7O0FBRUFuQyxVQUFFaUUsV0FBRixDQUFjL1gsUUFBZCxDQUF1QixLQUFLcEIsT0FBTCxDQUFhcVgsS0FBcEMsRUFBMkNvRixNQUEzQzs7QUFFQXZILFVBQUVpRSxXQUFGLENBQWN4aEIsTUFBZCxDQUFxQnVkLEVBQUVrRSxPQUF2Qjs7QUFFQWxFLFVBQUV5RixZQUFGLEdBQWlCekYsRUFBRWtFLE9BQW5COztBQUVBbEUsVUFBRXdILE1BQUY7QUFFSCxLQWpDRDs7QUFtQ0EzSCxVQUFNcmhCLFNBQU4sQ0FBZ0IyeUIsTUFBaEIsR0FBeUIsVUFBU0MsUUFBVCxFQUFtQjs7QUFFeEMsWUFBSXBSLElBQUksSUFBUjtBQUFBLFlBQ0lxUixnQkFBZ0IsRUFEcEI7QUFBQSxZQUVJOVgsQ0FGSjtBQUFBLFlBRU9FLENBRlA7O0FBSUEsWUFBSXVHLEVBQUVsVixPQUFGLENBQVVvWCxHQUFWLEtBQWtCLElBQXRCLEVBQTRCO0FBQ3hCa1AsdUJBQVcsQ0FBQ0EsUUFBWjtBQUNIO0FBQ0Q3WCxZQUFJeUcsRUFBRXFGLFlBQUYsSUFBa0IsTUFBbEIsR0FBMkJ0ZCxLQUFLeVUsSUFBTCxDQUFVNFUsUUFBVixJQUFzQixJQUFqRCxHQUF3RCxLQUE1RDtBQUNBM1gsWUFBSXVHLEVBQUVxRixZQUFGLElBQWtCLEtBQWxCLEdBQTBCdGQsS0FBS3lVLElBQUwsQ0FBVTRVLFFBQVYsSUFBc0IsSUFBaEQsR0FBdUQsS0FBM0Q7O0FBRUFDLHNCQUFjclIsRUFBRXFGLFlBQWhCLElBQWdDK0wsUUFBaEM7O0FBRUEsWUFBSXBSLEVBQUV5RSxpQkFBRixLQUF3QixLQUE1QixFQUFtQztBQUMvQnpFLGNBQUVpRSxXQUFGLENBQWMxVSxHQUFkLENBQWtCOGhCLGFBQWxCO0FBQ0gsU0FGRCxNQUVPO0FBQ0hBLDRCQUFnQixFQUFoQjtBQUNBLGdCQUFJclIsRUFBRWdGLGNBQUYsS0FBcUIsS0FBekIsRUFBZ0M7QUFDNUJxTSw4QkFBY3JSLEVBQUU0RSxRQUFoQixJQUE0QixlQUFlckwsQ0FBZixHQUFtQixJQUFuQixHQUEwQkUsQ0FBMUIsR0FBOEIsR0FBMUQ7QUFDQXVHLGtCQUFFaUUsV0FBRixDQUFjMVUsR0FBZCxDQUFrQjhoQixhQUFsQjtBQUNILGFBSEQsTUFHTztBQUNIQSw4QkFBY3JSLEVBQUU0RSxRQUFoQixJQUE0QixpQkFBaUJyTCxDQUFqQixHQUFxQixJQUFyQixHQUE0QkUsQ0FBNUIsR0FBZ0MsUUFBNUQ7QUFDQXVHLGtCQUFFaUUsV0FBRixDQUFjMVUsR0FBZCxDQUFrQjhoQixhQUFsQjtBQUNIO0FBQ0o7QUFFSixLQTNCRDs7QUE2QkF4UixVQUFNcmhCLFNBQU4sQ0FBZ0I4eUIsYUFBaEIsR0FBZ0MsWUFBVzs7QUFFdkMsWUFBSXRSLElBQUksSUFBUjs7QUFFQSxZQUFJQSxFQUFFbFYsT0FBRixDQUFVNk8sUUFBVixLQUF1QixLQUEzQixFQUFrQztBQUM5QixnQkFBSXFHLEVBQUVsVixPQUFGLENBQVU4VixVQUFWLEtBQXlCLElBQTdCLEVBQW1DO0FBQy9CWixrQkFBRXVFLEtBQUYsQ0FBUWhWLEdBQVIsQ0FBWTtBQUNSZ2lCLDZCQUFVLFNBQVN2UixFQUFFbFYsT0FBRixDQUFVK1Y7QUFEckIsaUJBQVo7QUFHSDtBQUNKLFNBTkQsTUFNTztBQUNIYixjQUFFdUUsS0FBRixDQUFRekYsTUFBUixDQUFla0IsRUFBRWtFLE9BQUYsQ0FBVXhRLEtBQVYsR0FBa0I5QyxXQUFsQixDQUE4QixJQUE5QixJQUFzQ29QLEVBQUVsVixPQUFGLENBQVV1WCxZQUEvRDtBQUNBLGdCQUFJckMsRUFBRWxWLE9BQUYsQ0FBVThWLFVBQVYsS0FBeUIsSUFBN0IsRUFBbUM7QUFDL0JaLGtCQUFFdUUsS0FBRixDQUFRaFYsR0FBUixDQUFZO0FBQ1JnaUIsNkJBQVV2UixFQUFFbFYsT0FBRixDQUFVK1YsYUFBVixHQUEwQjtBQUQ1QixpQkFBWjtBQUdIO0FBQ0o7O0FBRURiLFVBQUV5RCxTQUFGLEdBQWN6RCxFQUFFdUUsS0FBRixDQUFRM1MsS0FBUixFQUFkO0FBQ0FvTyxVQUFFMEQsVUFBRixHQUFlMUQsRUFBRXVFLEtBQUYsQ0FBUXpGLE1BQVIsRUFBZjs7QUFHQSxZQUFJa0IsRUFBRWxWLE9BQUYsQ0FBVTZPLFFBQVYsS0FBdUIsS0FBdkIsSUFBZ0NxRyxFQUFFbFYsT0FBRixDQUFVK1gsYUFBVixLQUE0QixLQUFoRSxFQUF1RTtBQUNuRTdDLGNBQUVnRSxVQUFGLEdBQWVqYyxLQUFLeVUsSUFBTCxDQUFVd0QsRUFBRXlELFNBQUYsR0FBY3pELEVBQUVsVixPQUFGLENBQVV1WCxZQUFsQyxDQUFmO0FBQ0FyQyxjQUFFaUUsV0FBRixDQUFjclMsS0FBZCxDQUFvQjdKLEtBQUt5VSxJQUFMLENBQVd3RCxFQUFFZ0UsVUFBRixHQUFlaEUsRUFBRWlFLFdBQUYsQ0FBYy9YLFFBQWQsQ0FBdUIsY0FBdkIsRUFBdUM5TCxNQUFqRSxDQUFwQjtBQUVILFNBSkQsTUFJTyxJQUFJNGYsRUFBRWxWLE9BQUYsQ0FBVStYLGFBQVYsS0FBNEIsSUFBaEMsRUFBc0M7QUFDekM3QyxjQUFFaUUsV0FBRixDQUFjclMsS0FBZCxDQUFvQixPQUFPb08sRUFBRStELFVBQTdCO0FBQ0gsU0FGTSxNQUVBO0FBQ0gvRCxjQUFFZ0UsVUFBRixHQUFlamMsS0FBS3lVLElBQUwsQ0FBVXdELEVBQUV5RCxTQUFaLENBQWY7QUFDQXpELGNBQUVpRSxXQUFGLENBQWNuRixNQUFkLENBQXFCL1csS0FBS3lVLElBQUwsQ0FBV3dELEVBQUVrRSxPQUFGLENBQVV4USxLQUFWLEdBQWtCOUMsV0FBbEIsQ0FBOEIsSUFBOUIsSUFBc0NvUCxFQUFFaUUsV0FBRixDQUFjL1gsUUFBZCxDQUF1QixjQUF2QixFQUF1QzlMLE1BQXhGLENBQXJCO0FBQ0g7O0FBRUQsWUFBSWtQLFNBQVMwUSxFQUFFa0UsT0FBRixDQUFVeFEsS0FBVixHQUFrQnNGLFVBQWxCLENBQTZCLElBQTdCLElBQXFDZ0gsRUFBRWtFLE9BQUYsQ0FBVXhRLEtBQVYsR0FBa0I5QixLQUFsQixFQUFsRDtBQUNBLFlBQUlvTyxFQUFFbFYsT0FBRixDQUFVK1gsYUFBVixLQUE0QixLQUFoQyxFQUF1QzdDLEVBQUVpRSxXQUFGLENBQWMvWCxRQUFkLENBQXVCLGNBQXZCLEVBQXVDMEYsS0FBdkMsQ0FBNkNvTyxFQUFFZ0UsVUFBRixHQUFlMVUsTUFBNUQ7QUFFMUMsS0FyQ0Q7O0FBdUNBdVEsVUFBTXJoQixTQUFOLENBQWdCZ3pCLE9BQWhCLEdBQTBCLFlBQVc7O0FBRWpDLFlBQUl4UixJQUFJLElBQVI7QUFBQSxZQUNJMkgsVUFESjs7QUFHQTNILFVBQUVrRSxPQUFGLENBQVU5aUIsSUFBVixDQUFlLFVBQVNtRCxLQUFULEVBQWdCekYsT0FBaEIsRUFBeUI7QUFDcEM2b0IseUJBQWMzSCxFQUFFZ0UsVUFBRixHQUFlemYsS0FBaEIsR0FBeUIsQ0FBQyxDQUF2QztBQUNBLGdCQUFJeWIsRUFBRWxWLE9BQUYsQ0FBVW9YLEdBQVYsS0FBa0IsSUFBdEIsRUFBNEI7QUFDeEI5akIsa0JBQUVVLE9BQUYsRUFBV3lRLEdBQVgsQ0FBZTtBQUNYNmhCLDhCQUFVLFVBREM7QUFFWGhVLDJCQUFPdUssVUFGSTtBQUdYdFkseUJBQUssQ0FITTtBQUlYMlQsNEJBQVFoRCxFQUFFbFYsT0FBRixDQUFVa1ksTUFBVixHQUFtQixDQUpoQjtBQUtYK0ksNkJBQVM7QUFMRSxpQkFBZjtBQU9ILGFBUkQsTUFRTztBQUNIM3RCLGtCQUFFVSxPQUFGLEVBQVd5USxHQUFYLENBQWU7QUFDWDZoQiw4QkFBVSxVQURDO0FBRVh6ViwwQkFBTWdNLFVBRks7QUFHWHRZLHlCQUFLLENBSE07QUFJWDJULDRCQUFRaEQsRUFBRWxWLE9BQUYsQ0FBVWtZLE1BQVYsR0FBbUIsQ0FKaEI7QUFLWCtJLDZCQUFTO0FBTEUsaUJBQWY7QUFPSDtBQUNKLFNBbkJEOztBQXFCQS9MLFVBQUVrRSxPQUFGLENBQVVrRCxFQUFWLENBQWFwSCxFQUFFdUQsWUFBZixFQUE2QmhVLEdBQTdCLENBQWlDO0FBQzdCeVQsb0JBQVFoRCxFQUFFbFYsT0FBRixDQUFVa1ksTUFBVixHQUFtQixDQURFO0FBRTdCK0kscUJBQVM7QUFGb0IsU0FBakM7QUFLSCxLQS9CRDs7QUFpQ0FsTSxVQUFNcmhCLFNBQU4sQ0FBZ0JpekIsU0FBaEIsR0FBNEIsWUFBVzs7QUFFbkMsWUFBSXpSLElBQUksSUFBUjs7QUFFQSxZQUFJQSxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixLQUEyQixDQUEzQixJQUFnQ3JDLEVBQUVsVixPQUFGLENBQVVxVixjQUFWLEtBQTZCLElBQTdELElBQXFFSCxFQUFFbFYsT0FBRixDQUFVNk8sUUFBVixLQUF1QixLQUFoRyxFQUF1RztBQUNuRyxnQkFBSXhJLGVBQWU2TyxFQUFFa0UsT0FBRixDQUFVa0QsRUFBVixDQUFhcEgsRUFBRXVELFlBQWYsRUFBNkIzUyxXQUE3QixDQUF5QyxJQUF6QyxDQUFuQjtBQUNBb1AsY0FBRXVFLEtBQUYsQ0FBUWhWLEdBQVIsQ0FBWSxRQUFaLEVBQXNCNEIsWUFBdEI7QUFDSDtBQUVKLEtBVEQ7O0FBV0EwTyxVQUFNcmhCLFNBQU4sQ0FBZ0JrekIsU0FBaEIsR0FDQTdSLE1BQU1yaEIsU0FBTixDQUFnQm16QixjQUFoQixHQUFpQyxZQUFXOztBQUV4Qzs7Ozs7Ozs7Ozs7OztBQWFBLFlBQUkzUixJQUFJLElBQVI7QUFBQSxZQUFjNFEsQ0FBZDtBQUFBLFlBQWlCZ0IsSUFBakI7QUFBQSxZQUF1QjFFLE1BQXZCO0FBQUEsWUFBK0IzckIsS0FBL0I7QUFBQSxZQUFzQ3VXLFVBQVUsS0FBaEQ7QUFBQSxZQUF1RHRQLElBQXZEOztBQUVBLFlBQUlwSyxFQUFFb0ssSUFBRixDQUFRb1YsVUFBVSxDQUFWLENBQVIsTUFBMkIsUUFBL0IsRUFBMEM7O0FBRXRDc1AscUJBQVV0UCxVQUFVLENBQVYsQ0FBVjtBQUNBOUYsc0JBQVU4RixVQUFVLENBQVYsQ0FBVjtBQUNBcFYsbUJBQU8sVUFBUDtBQUVILFNBTkQsTUFNTyxJQUFLcEssRUFBRW9LLElBQUYsQ0FBUW9WLFVBQVUsQ0FBVixDQUFSLE1BQTJCLFFBQWhDLEVBQTJDOztBQUU5Q3NQLHFCQUFVdFAsVUFBVSxDQUFWLENBQVY7QUFDQXJjLG9CQUFRcWMsVUFBVSxDQUFWLENBQVI7QUFDQTlGLHNCQUFVOEYsVUFBVSxDQUFWLENBQVY7O0FBRUEsZ0JBQUtBLFVBQVUsQ0FBVixNQUFpQixZQUFqQixJQUFpQ3hmLEVBQUVvSyxJQUFGLENBQVFvVixVQUFVLENBQVYsQ0FBUixNQUEyQixPQUFqRSxFQUEyRTs7QUFFdkVwVix1QkFBTyxZQUFQO0FBRUgsYUFKRCxNQUlPLElBQUssT0FBT29WLFVBQVUsQ0FBVixDQUFQLEtBQXdCLFdBQTdCLEVBQTJDOztBQUU5Q3BWLHVCQUFPLFFBQVA7QUFFSDtBQUVKOztBQUVELFlBQUtBLFNBQVMsUUFBZCxFQUF5Qjs7QUFFckJ3WCxjQUFFbFYsT0FBRixDQUFVb2lCLE1BQVYsSUFBb0IzckIsS0FBcEI7QUFHSCxTQUxELE1BS08sSUFBS2lILFNBQVMsVUFBZCxFQUEyQjs7QUFFOUJwSyxjQUFFZ0QsSUFBRixDQUFROHJCLE1BQVIsRUFBaUIsVUFBVTJFLEdBQVYsRUFBZTljLEdBQWYsRUFBcUI7O0FBRWxDaUwsa0JBQUVsVixPQUFGLENBQVUrbUIsR0FBVixJQUFpQjljLEdBQWpCO0FBRUgsYUFKRDtBQU9ILFNBVE0sTUFTQSxJQUFLdk0sU0FBUyxZQUFkLEVBQTZCOztBQUVoQyxpQkFBTW9wQixJQUFOLElBQWNyd0IsS0FBZCxFQUFzQjs7QUFFbEIsb0JBQUluRCxFQUFFb0ssSUFBRixDQUFRd1gsRUFBRWxWLE9BQUYsQ0FBVW1YLFVBQWxCLE1BQW1DLE9BQXZDLEVBQWlEOztBQUU3Q2pDLHNCQUFFbFYsT0FBRixDQUFVbVgsVUFBVixHQUF1QixDQUFFMWdCLE1BQU1xd0IsSUFBTixDQUFGLENBQXZCO0FBRUgsaUJBSkQsTUFJTzs7QUFFSGhCLHdCQUFJNVEsRUFBRWxWLE9BQUYsQ0FBVW1YLFVBQVYsQ0FBcUI3aEIsTUFBckIsR0FBNEIsQ0FBaEM7O0FBRUE7QUFDQSwyQkFBT3d3QixLQUFLLENBQVosRUFBZ0I7O0FBRVosNEJBQUk1USxFQUFFbFYsT0FBRixDQUFVbVgsVUFBVixDQUFxQjJPLENBQXJCLEVBQXdCMUcsVUFBeEIsS0FBdUMzb0IsTUFBTXF3QixJQUFOLEVBQVkxSCxVQUF2RCxFQUFvRTs7QUFFaEVsSyw4QkFBRWxWLE9BQUYsQ0FBVW1YLFVBQVYsQ0FBcUJ0WSxNQUFyQixDQUE0QmluQixDQUE1QixFQUE4QixDQUE5QjtBQUVIOztBQUVEQTtBQUVIOztBQUVENVEsc0JBQUVsVixPQUFGLENBQVVtWCxVQUFWLENBQXFCamlCLElBQXJCLENBQTJCdUIsTUFBTXF3QixJQUFOLENBQTNCO0FBRUg7QUFFSjtBQUVKOztBQUVELFlBQUs5WixPQUFMLEVBQWU7O0FBRVhrSSxjQUFFa0gsTUFBRjtBQUNBbEgsY0FBRXdILE1BQUY7QUFFSDtBQUVKLEtBaEdEOztBQWtHQTNILFVBQU1yaEIsU0FBTixDQUFnQituQixXQUFoQixHQUE4QixZQUFXOztBQUVyQyxZQUFJdkcsSUFBSSxJQUFSOztBQUVBQSxVQUFFc1IsYUFBRjs7QUFFQXRSLFVBQUV5UixTQUFGOztBQUVBLFlBQUl6UixFQUFFbFYsT0FBRixDQUFVd1csSUFBVixLQUFtQixLQUF2QixFQUE4QjtBQUMxQnRCLGNBQUVtUixNQUFGLENBQVNuUixFQUFFME0sT0FBRixDQUFVMU0sRUFBRXVELFlBQVosQ0FBVDtBQUNILFNBRkQsTUFFTztBQUNIdkQsY0FBRXdSLE9BQUY7QUFDSDs7QUFFRHhSLFVBQUV3RixPQUFGLENBQVU5TixPQUFWLENBQWtCLGFBQWxCLEVBQWlDLENBQUNzSSxDQUFELENBQWpDO0FBRUgsS0FoQkQ7O0FBa0JBSCxVQUFNcmhCLFNBQU4sQ0FBZ0J1dkIsUUFBaEIsR0FBMkIsWUFBVzs7QUFFbEMsWUFBSS9OLElBQUksSUFBUjtBQUFBLFlBQ0k4UixZQUFZbnpCLFNBQVN3VSxJQUFULENBQWN2TixLQUQ5Qjs7QUFHQW9hLFVBQUVxRixZQUFGLEdBQWlCckYsRUFBRWxWLE9BQUYsQ0FBVTZPLFFBQVYsS0FBdUIsSUFBdkIsR0FBOEIsS0FBOUIsR0FBc0MsTUFBdkQ7O0FBRUEsWUFBSXFHLEVBQUVxRixZQUFGLEtBQW1CLEtBQXZCLEVBQThCO0FBQzFCckYsY0FBRXdGLE9BQUYsQ0FBVTdqQixRQUFWLENBQW1CLGdCQUFuQjtBQUNILFNBRkQsTUFFTztBQUNIcWUsY0FBRXdGLE9BQUYsQ0FBVTNrQixXQUFWLENBQXNCLGdCQUF0QjtBQUNIOztBQUVELFlBQUlpeEIsVUFBVUMsZ0JBQVYsS0FBK0JueEIsU0FBL0IsSUFDQWt4QixVQUFVRSxhQUFWLEtBQTRCcHhCLFNBRDVCLElBRUFreEIsVUFBVUcsWUFBVixLQUEyQnJ4QixTQUYvQixFQUUwQztBQUN0QyxnQkFBSW9mLEVBQUVsVixPQUFGLENBQVU2WCxNQUFWLEtBQXFCLElBQXpCLEVBQStCO0FBQzNCM0Msa0JBQUVnRixjQUFGLEdBQW1CLElBQW5CO0FBQ0g7QUFDSjs7QUFFRCxZQUFLaEYsRUFBRWxWLE9BQUYsQ0FBVXdXLElBQWYsRUFBc0I7QUFDbEIsZ0JBQUssT0FBT3RCLEVBQUVsVixPQUFGLENBQVVrWSxNQUFqQixLQUE0QixRQUFqQyxFQUE0QztBQUN4QyxvQkFBSWhELEVBQUVsVixPQUFGLENBQVVrWSxNQUFWLEdBQW1CLENBQXZCLEVBQTJCO0FBQ3ZCaEQsc0JBQUVsVixPQUFGLENBQVVrWSxNQUFWLEdBQW1CLENBQW5CO0FBQ0g7QUFDSixhQUpELE1BSU87QUFDSGhELGtCQUFFbFYsT0FBRixDQUFVa1ksTUFBVixHQUFtQmhELEVBQUVsTyxRQUFGLENBQVdrUixNQUE5QjtBQUNIO0FBQ0o7O0FBRUQsWUFBSThPLFVBQVVJLFVBQVYsS0FBeUJ0eEIsU0FBN0IsRUFBd0M7QUFDcENvZixjQUFFNEUsUUFBRixHQUFhLFlBQWI7QUFDQTVFLGNBQUUwRixhQUFGLEdBQWtCLGNBQWxCO0FBQ0ExRixjQUFFMkYsY0FBRixHQUFtQixhQUFuQjtBQUNBLGdCQUFJbU0sVUFBVUssbUJBQVYsS0FBa0N2eEIsU0FBbEMsSUFBK0NreEIsVUFBVU0saUJBQVYsS0FBZ0N4eEIsU0FBbkYsRUFBOEZvZixFQUFFNEUsUUFBRixHQUFhLEtBQWI7QUFDakc7QUFDRCxZQUFJa04sVUFBVU8sWUFBVixLQUEyQnp4QixTQUEvQixFQUEwQztBQUN0Q29mLGNBQUU0RSxRQUFGLEdBQWEsY0FBYjtBQUNBNUUsY0FBRTBGLGFBQUYsR0FBa0IsZ0JBQWxCO0FBQ0ExRixjQUFFMkYsY0FBRixHQUFtQixlQUFuQjtBQUNBLGdCQUFJbU0sVUFBVUssbUJBQVYsS0FBa0N2eEIsU0FBbEMsSUFBK0NreEIsVUFBVVEsY0FBVixLQUE2QjF4QixTQUFoRixFQUEyRm9mLEVBQUU0RSxRQUFGLEdBQWEsS0FBYjtBQUM5RjtBQUNELFlBQUlrTixVQUFVUyxlQUFWLEtBQThCM3hCLFNBQWxDLEVBQTZDO0FBQ3pDb2YsY0FBRTRFLFFBQUYsR0FBYSxpQkFBYjtBQUNBNUUsY0FBRTBGLGFBQUYsR0FBa0IsbUJBQWxCO0FBQ0ExRixjQUFFMkYsY0FBRixHQUFtQixrQkFBbkI7QUFDQSxnQkFBSW1NLFVBQVVLLG1CQUFWLEtBQWtDdnhCLFNBQWxDLElBQStDa3hCLFVBQVVNLGlCQUFWLEtBQWdDeHhCLFNBQW5GLEVBQThGb2YsRUFBRTRFLFFBQUYsR0FBYSxLQUFiO0FBQ2pHO0FBQ0QsWUFBSWtOLFVBQVVVLFdBQVYsS0FBMEI1eEIsU0FBOUIsRUFBeUM7QUFDckNvZixjQUFFNEUsUUFBRixHQUFhLGFBQWI7QUFDQTVFLGNBQUUwRixhQUFGLEdBQWtCLGVBQWxCO0FBQ0ExRixjQUFFMkYsY0FBRixHQUFtQixjQUFuQjtBQUNBLGdCQUFJbU0sVUFBVVUsV0FBVixLQUEwQjV4QixTQUE5QixFQUF5Q29mLEVBQUU0RSxRQUFGLEdBQWEsS0FBYjtBQUM1QztBQUNELFlBQUlrTixVQUFVVyxTQUFWLEtBQXdCN3hCLFNBQXhCLElBQXFDb2YsRUFBRTRFLFFBQUYsS0FBZSxLQUF4RCxFQUErRDtBQUMzRDVFLGNBQUU0RSxRQUFGLEdBQWEsV0FBYjtBQUNBNUUsY0FBRTBGLGFBQUYsR0FBa0IsV0FBbEI7QUFDQTFGLGNBQUUyRixjQUFGLEdBQW1CLFlBQW5CO0FBQ0g7QUFDRDNGLFVBQUV5RSxpQkFBRixHQUFzQnpFLEVBQUVsVixPQUFGLENBQVU4WCxZQUFWLElBQTJCNUMsRUFBRTRFLFFBQUYsS0FBZSxJQUFmLElBQXVCNUUsRUFBRTRFLFFBQUYsS0FBZSxLQUF2RjtBQUNILEtBN0REOztBQWdFQS9FLFVBQU1yaEIsU0FBTixDQUFnQjJxQixlQUFoQixHQUFrQyxVQUFTNWtCLEtBQVQsRUFBZ0I7O0FBRTlDLFlBQUl5YixJQUFJLElBQVI7QUFBQSxZQUNJeU4sWUFESjtBQUFBLFlBQ2tCaUYsU0FEbEI7QUFBQSxZQUM2QjdILFdBRDdCO0FBQUEsWUFDMEM4SCxTQUQxQzs7QUFHQUQsb0JBQVkxUyxFQUFFd0YsT0FBRixDQUNQbGlCLElBRE8sQ0FDRixjQURFLEVBRVB6QyxXQUZPLENBRUsseUNBRkwsRUFHUDhDLElBSE8sQ0FHRixhQUhFLEVBR2EsTUFIYixDQUFaOztBQUtBcWMsVUFBRWtFLE9BQUYsQ0FDS2tELEVBREwsQ0FDUTdpQixLQURSLEVBRUs1QyxRQUZMLENBRWMsZUFGZDs7QUFJQSxZQUFJcWUsRUFBRWxWLE9BQUYsQ0FBVThWLFVBQVYsS0FBeUIsSUFBN0IsRUFBbUM7O0FBRS9CLGdCQUFJZ1MsV0FBVzVTLEVBQUVsVixPQUFGLENBQVV1WCxZQUFWLEdBQXlCLENBQXpCLEtBQStCLENBQS9CLEdBQW1DLENBQW5DLEdBQXVDLENBQXREOztBQUVBb0wsMkJBQWUxbEIsS0FBSzBILEtBQUwsQ0FBV3VRLEVBQUVsVixPQUFGLENBQVV1WCxZQUFWLEdBQXlCLENBQXBDLENBQWY7O0FBRUEsZ0JBQUlyQyxFQUFFbFYsT0FBRixDQUFVMlcsUUFBVixLQUF1QixJQUEzQixFQUFpQzs7QUFFN0Isb0JBQUlsZCxTQUFTa3BCLFlBQVQsSUFBeUJscEIsU0FBVXliLEVBQUUrRCxVQUFGLEdBQWUsQ0FBaEIsR0FBcUIwSixZQUEzRCxFQUF5RTtBQUNyRXpOLHNCQUFFa0UsT0FBRixDQUNLemxCLEtBREwsQ0FDVzhGLFFBQVFrcEIsWUFBUixHQUF1Qm1GLFFBRGxDLEVBQzRDcnVCLFFBQVFrcEIsWUFBUixHQUF1QixDQURuRSxFQUVLOXJCLFFBRkwsQ0FFYyxjQUZkLEVBR0tnQyxJQUhMLENBR1UsYUFIVixFQUd5QixPQUh6QjtBQUtILGlCQU5ELE1BTU87O0FBRUhrbkIsa0NBQWM3SyxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixHQUF5QjlkLEtBQXZDO0FBQ0FtdUIsOEJBQ0tqMEIsS0FETCxDQUNXb3NCLGNBQWM0QyxZQUFkLEdBQTZCLENBQTdCLEdBQWlDbUYsUUFENUMsRUFDc0QvSCxjQUFjNEMsWUFBZCxHQUE2QixDQURuRixFQUVLOXJCLFFBRkwsQ0FFYyxjQUZkLEVBR0tnQyxJQUhMLENBR1UsYUFIVixFQUd5QixPQUh6QjtBQUtIOztBQUVELG9CQUFJWSxVQUFVLENBQWQsRUFBaUI7O0FBRWJtdUIsOEJBQ0t0TCxFQURMLENBQ1FzTCxVQUFVdHlCLE1BQVYsR0FBbUIsQ0FBbkIsR0FBdUI0ZixFQUFFbFYsT0FBRixDQUFVdVgsWUFEekMsRUFFSzFnQixRQUZMLENBRWMsY0FGZDtBQUlILGlCQU5ELE1BTU8sSUFBSTRDLFVBQVV5YixFQUFFK0QsVUFBRixHQUFlLENBQTdCLEVBQWdDOztBQUVuQzJPLDhCQUNLdEwsRUFETCxDQUNRcEgsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBRGxCLEVBRUsxZ0IsUUFGTCxDQUVjLGNBRmQ7QUFJSDtBQUVKOztBQUVEcWUsY0FBRWtFLE9BQUYsQ0FDS2tELEVBREwsQ0FDUTdpQixLQURSLEVBRUs1QyxRQUZMLENBRWMsY0FGZDtBQUlILFNBNUNELE1BNENPOztBQUVILGdCQUFJNEMsU0FBUyxDQUFULElBQWNBLFNBQVV5YixFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQXJELEVBQW9FOztBQUVoRXJDLGtCQUFFa0UsT0FBRixDQUNLemxCLEtBREwsQ0FDVzhGLEtBRFgsRUFDa0JBLFFBQVF5YixFQUFFbFYsT0FBRixDQUFVdVgsWUFEcEMsRUFFSzFnQixRQUZMLENBRWMsY0FGZCxFQUdLZ0MsSUFITCxDQUdVLGFBSFYsRUFHeUIsT0FIekI7QUFLSCxhQVBELE1BT08sSUFBSSt1QixVQUFVdHlCLE1BQVYsSUFBb0I0ZixFQUFFbFYsT0FBRixDQUFVdVgsWUFBbEMsRUFBZ0Q7O0FBRW5EcVEsMEJBQ0svd0IsUUFETCxDQUNjLGNBRGQsRUFFS2dDLElBRkwsQ0FFVSxhQUZWLEVBRXlCLE9BRnpCO0FBSUgsYUFOTSxNQU1BOztBQUVIZ3ZCLDRCQUFZM1MsRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUFyQztBQUNBd0ksOEJBQWM3SyxFQUFFbFYsT0FBRixDQUFVMlcsUUFBVixLQUF1QixJQUF2QixHQUE4QnpCLEVBQUVsVixPQUFGLENBQVV1WCxZQUFWLEdBQXlCOWQsS0FBdkQsR0FBK0RBLEtBQTdFOztBQUVBLG9CQUFJeWIsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQVYsSUFBMEJyQyxFQUFFbFYsT0FBRixDQUFVd1gsY0FBcEMsSUFBdUR0QyxFQUFFK0QsVUFBRixHQUFleGYsS0FBaEIsR0FBeUJ5YixFQUFFbFYsT0FBRixDQUFVdVgsWUFBN0YsRUFBMkc7O0FBRXZHcVEsOEJBQ0tqMEIsS0FETCxDQUNXb3NCLGVBQWU3SyxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixHQUF5QnNRLFNBQXhDLENBRFgsRUFDK0Q5SCxjQUFjOEgsU0FEN0UsRUFFS2h4QixRQUZMLENBRWMsY0FGZCxFQUdLZ0MsSUFITCxDQUdVLGFBSFYsRUFHeUIsT0FIekI7QUFLSCxpQkFQRCxNQU9POztBQUVIK3VCLDhCQUNLajBCLEtBREwsQ0FDV29zQixXQURYLEVBQ3dCQSxjQUFjN0ssRUFBRWxWLE9BQUYsQ0FBVXVYLFlBRGhELEVBRUsxZ0IsUUFGTCxDQUVjLGNBRmQsRUFHS2dDLElBSEwsQ0FHVSxhQUhWLEVBR3lCLE9BSHpCO0FBS0g7QUFFSjtBQUVKOztBQUVELFlBQUlxYyxFQUFFbFYsT0FBRixDQUFVNlcsUUFBVixLQUF1QixVQUF2QixJQUFxQzNCLEVBQUVsVixPQUFGLENBQVU2VyxRQUFWLEtBQXVCLGFBQWhFLEVBQStFO0FBQzNFM0IsY0FBRTJCLFFBQUY7QUFDSDtBQUNKLEtBckdEOztBQXVHQTlCLFVBQU1yaEIsU0FBTixDQUFnQnlxQixhQUFoQixHQUFnQyxZQUFXOztBQUV2QyxZQUFJakosSUFBSSxJQUFSO0FBQUEsWUFDSWxXLENBREo7QUFBQSxZQUNPZ2lCLFVBRFA7QUFBQSxZQUNtQitHLGFBRG5COztBQUdBLFlBQUk3UyxFQUFFbFYsT0FBRixDQUFVd1csSUFBVixLQUFtQixJQUF2QixFQUE2QjtBQUN6QnRCLGNBQUVsVixPQUFGLENBQVU4VixVQUFWLEdBQXVCLEtBQXZCO0FBQ0g7O0FBRUQsWUFBSVosRUFBRWxWLE9BQUYsQ0FBVTJXLFFBQVYsS0FBdUIsSUFBdkIsSUFBK0J6QixFQUFFbFYsT0FBRixDQUFVd1csSUFBVixLQUFtQixLQUF0RCxFQUE2RDs7QUFFekR3Syx5QkFBYSxJQUFiOztBQUVBLGdCQUFJOUwsRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUE3QixFQUEyQzs7QUFFdkMsb0JBQUlyQyxFQUFFbFYsT0FBRixDQUFVOFYsVUFBVixLQUF5QixJQUE3QixFQUFtQztBQUMvQmlTLG9DQUFnQjdTLEVBQUVsVixPQUFGLENBQVV1WCxZQUFWLEdBQXlCLENBQXpDO0FBQ0gsaUJBRkQsTUFFTztBQUNId1Esb0NBQWdCN1MsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTFCO0FBQ0g7O0FBRUQscUJBQUt2WSxJQUFJa1csRUFBRStELFVBQVgsRUFBdUJqYSxJQUFLa1csRUFBRStELFVBQUYsR0FDcEI4TyxhQURSLEVBQ3dCL29CLEtBQUssQ0FEN0IsRUFDZ0M7QUFDNUJnaUIsaUNBQWFoaUIsSUFBSSxDQUFqQjtBQUNBMUwsc0JBQUU0aEIsRUFBRWtFLE9BQUYsQ0FBVTRILFVBQVYsQ0FBRixFQUF5QmdILEtBQXpCLENBQStCLElBQS9CLEVBQXFDbnZCLElBQXJDLENBQTBDLElBQTFDLEVBQWdELEVBQWhELEVBQ0tBLElBREwsQ0FDVSxrQkFEVixFQUM4Qm1vQixhQUFhOUwsRUFBRStELFVBRDdDLEVBRUt1RCxTQUZMLENBRWV0SCxFQUFFaUUsV0FGakIsRUFFOEJ0aUIsUUFGOUIsQ0FFdUMsY0FGdkM7QUFHSDtBQUNELHFCQUFLbUksSUFBSSxDQUFULEVBQVlBLElBQUkrb0IsZ0JBQWlCN1MsRUFBRStELFVBQW5DLEVBQStDamEsS0FBSyxDQUFwRCxFQUF1RDtBQUNuRGdpQixpQ0FBYWhpQixDQUFiO0FBQ0ExTCxzQkFBRTRoQixFQUFFa0UsT0FBRixDQUFVNEgsVUFBVixDQUFGLEVBQXlCZ0gsS0FBekIsQ0FBK0IsSUFBL0IsRUFBcUNudkIsSUFBckMsQ0FBMEMsSUFBMUMsRUFBZ0QsRUFBaEQsRUFDS0EsSUFETCxDQUNVLGtCQURWLEVBQzhCbW9CLGFBQWE5TCxFQUFFK0QsVUFEN0MsRUFFS3RmLFFBRkwsQ0FFY3ViLEVBQUVpRSxXQUZoQixFQUU2QnRpQixRQUY3QixDQUVzQyxjQUZ0QztBQUdIO0FBQ0RxZSxrQkFBRWlFLFdBQUYsQ0FBYzNnQixJQUFkLENBQW1CLGVBQW5CLEVBQW9DQSxJQUFwQyxDQUF5QyxNQUF6QyxFQUFpRGxDLElBQWpELENBQXNELFlBQVc7QUFDN0RoRCxzQkFBRSxJQUFGLEVBQVF1RixJQUFSLENBQWEsSUFBYixFQUFtQixFQUFuQjtBQUNILGlCQUZEO0FBSUg7QUFFSjtBQUVKLEtBMUNEOztBQTRDQWtjLFVBQU1yaEIsU0FBTixDQUFnQjZzQixTQUFoQixHQUE0QixVQUFVanNCLE1BQVYsRUFBbUI7O0FBRTNDLFlBQUk0Z0IsSUFBSSxJQUFSOztBQUVBLFlBQUksQ0FBQzVnQixNQUFMLEVBQWM7QUFDVjRnQixjQUFFaUcsUUFBRjtBQUNIO0FBQ0RqRyxVQUFFa0YsV0FBRixHQUFnQjlsQixNQUFoQjtBQUVILEtBVEQ7O0FBV0F5Z0IsVUFBTXJoQixTQUFOLENBQWdCOG5CLGFBQWhCLEdBQWdDLFVBQVM5bEIsS0FBVCxFQUFnQjs7QUFFNUMsWUFBSXdmLElBQUksSUFBUjs7QUFFQSxZQUFJK1MsZ0JBQ0EzMEIsRUFBRW9DLE1BQU1uQixNQUFSLEVBQWdCZ1MsRUFBaEIsQ0FBbUIsY0FBbkIsSUFDSWpULEVBQUVvQyxNQUFNbkIsTUFBUixDQURKLEdBRUlqQixFQUFFb0MsTUFBTW5CLE1BQVIsRUFBZ0J5UixPQUFoQixDQUF3QixjQUF4QixDQUhSOztBQUtBLFlBQUl2TSxRQUFRcXBCLFNBQVNtRixjQUFjcHZCLElBQWQsQ0FBbUIsa0JBQW5CLENBQVQsQ0FBWjs7QUFFQSxZQUFJLENBQUNZLEtBQUwsRUFBWUEsUUFBUSxDQUFSOztBQUVaLFlBQUl5YixFQUFFK0QsVUFBRixJQUFnQi9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUE5QixFQUE0Qzs7QUFFeENyQyxjQUFFbUksWUFBRixDQUFlNWpCLEtBQWYsRUFBc0IsS0FBdEIsRUFBNkIsSUFBN0I7QUFDQTtBQUVIOztBQUVEeWIsVUFBRW1JLFlBQUYsQ0FBZTVqQixLQUFmO0FBRUgsS0F0QkQ7O0FBd0JBc2IsVUFBTXJoQixTQUFOLENBQWdCMnBCLFlBQWhCLEdBQStCLFVBQVM1akIsS0FBVCxFQUFnQnl1QixJQUFoQixFQUFzQnRJLFdBQXRCLEVBQW1DOztBQUU5RCxZQUFJbUMsV0FBSjtBQUFBLFlBQWlCb0csU0FBakI7QUFBQSxZQUE0QkMsUUFBNUI7QUFBQSxZQUFzQ0MsU0FBdEM7QUFBQSxZQUFpRHhMLGFBQWEsSUFBOUQ7QUFBQSxZQUNJM0gsSUFBSSxJQURSO0FBQUEsWUFDY29ULFNBRGQ7O0FBR0FKLGVBQU9BLFFBQVEsS0FBZjs7QUFFQSxZQUFJaFQsRUFBRWtELFNBQUYsS0FBZ0IsSUFBaEIsSUFBd0JsRCxFQUFFbFYsT0FBRixDQUFVaVksY0FBVixLQUE2QixJQUF6RCxFQUErRDtBQUMzRDtBQUNIOztBQUVELFlBQUkvQyxFQUFFbFYsT0FBRixDQUFVd1csSUFBVixLQUFtQixJQUFuQixJQUEyQnRCLEVBQUV1RCxZQUFGLEtBQW1CaGYsS0FBbEQsRUFBeUQ7QUFDckQ7QUFDSDs7QUFFRCxZQUFJeXVCLFNBQVMsS0FBYixFQUFvQjtBQUNoQmhULGNBQUVPLFFBQUYsQ0FBV2hjLEtBQVg7QUFDSDs7QUFFRHNvQixzQkFBY3RvQixLQUFkO0FBQ0FvakIscUJBQWEzSCxFQUFFME0sT0FBRixDQUFVRyxXQUFWLENBQWI7QUFDQXNHLG9CQUFZblQsRUFBRTBNLE9BQUYsQ0FBVTFNLEVBQUV1RCxZQUFaLENBQVo7O0FBRUF2RCxVQUFFc0QsV0FBRixHQUFnQnRELEVBQUVxRSxTQUFGLEtBQWdCLElBQWhCLEdBQXVCOE8sU0FBdkIsR0FBbUNuVCxFQUFFcUUsU0FBckQ7O0FBRUEsWUFBSXJFLEVBQUVsVixPQUFGLENBQVUyVyxRQUFWLEtBQXVCLEtBQXZCLElBQWdDekIsRUFBRWxWLE9BQUYsQ0FBVThWLFVBQVYsS0FBeUIsS0FBekQsS0FBbUVyYyxRQUFRLENBQVIsSUFBYUEsUUFBUXliLEVBQUU0SSxXQUFGLEtBQWtCNUksRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQXBILENBQUosRUFBeUk7QUFDckksZ0JBQUl0QyxFQUFFbFYsT0FBRixDQUFVd1csSUFBVixLQUFtQixLQUF2QixFQUE4QjtBQUMxQnVMLDhCQUFjN00sRUFBRXVELFlBQWhCO0FBQ0Esb0JBQUltSCxnQkFBZ0IsSUFBaEIsSUFBd0IxSyxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQXJELEVBQW1FO0FBQy9EckMsc0JBQUUwSCxZQUFGLENBQWV5TCxTQUFmLEVBQTBCLFlBQVc7QUFDakNuVCwwQkFBRW1RLFNBQUYsQ0FBWXRELFdBQVo7QUFDSCxxQkFGRDtBQUdILGlCQUpELE1BSU87QUFDSDdNLHNCQUFFbVEsU0FBRixDQUFZdEQsV0FBWjtBQUNIO0FBQ0o7QUFDRDtBQUNILFNBWkQsTUFZTyxJQUFJN00sRUFBRWxWLE9BQUYsQ0FBVTJXLFFBQVYsS0FBdUIsS0FBdkIsSUFBZ0N6QixFQUFFbFYsT0FBRixDQUFVOFYsVUFBVixLQUF5QixJQUF6RCxLQUFrRXJjLFFBQVEsQ0FBUixJQUFhQSxRQUFTeWIsRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV3WCxjQUFqSCxDQUFKLEVBQXVJO0FBQzFJLGdCQUFJdEMsRUFBRWxWLE9BQUYsQ0FBVXdXLElBQVYsS0FBbUIsS0FBdkIsRUFBOEI7QUFDMUJ1TCw4QkFBYzdNLEVBQUV1RCxZQUFoQjtBQUNBLG9CQUFJbUgsZ0JBQWdCLElBQWhCLElBQXdCMUssRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUFyRCxFQUFtRTtBQUMvRHJDLHNCQUFFMEgsWUFBRixDQUFleUwsU0FBZixFQUEwQixZQUFXO0FBQ2pDblQsMEJBQUVtUSxTQUFGLENBQVl0RCxXQUFaO0FBQ0gscUJBRkQ7QUFHSCxpQkFKRCxNQUlPO0FBQ0g3TSxzQkFBRW1RLFNBQUYsQ0FBWXRELFdBQVo7QUFDSDtBQUNKO0FBQ0Q7QUFDSDs7QUFFRCxZQUFLN00sRUFBRWxWLE9BQUYsQ0FBVTRWLFFBQWYsRUFBMEI7QUFDdEI0SCwwQkFBY3RJLEVBQUVvRCxhQUFoQjtBQUNIOztBQUVELFlBQUl5SixjQUFjLENBQWxCLEVBQXFCO0FBQ2pCLGdCQUFJN00sRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV3WCxjQUF6QixLQUE0QyxDQUFoRCxFQUFtRDtBQUMvQzJRLDRCQUFZalQsRUFBRStELFVBQUYsR0FBZ0IvRCxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQXJEO0FBQ0gsYUFGRCxNQUVPO0FBQ0gyUSw0QkFBWWpULEVBQUUrRCxVQUFGLEdBQWU4SSxXQUEzQjtBQUNIO0FBQ0osU0FORCxNQU1PLElBQUlBLGVBQWU3TSxFQUFFK0QsVUFBckIsRUFBaUM7QUFDcEMsZ0JBQUkvRCxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXdYLGNBQXpCLEtBQTRDLENBQWhELEVBQW1EO0FBQy9DMlEsNEJBQVksQ0FBWjtBQUNILGFBRkQsTUFFTztBQUNIQSw0QkFBWXBHLGNBQWM3TSxFQUFFK0QsVUFBNUI7QUFDSDtBQUNKLFNBTk0sTUFNQTtBQUNIa1Asd0JBQVlwRyxXQUFaO0FBQ0g7O0FBRUQ3TSxVQUFFa0QsU0FBRixHQUFjLElBQWQ7O0FBRUFsRCxVQUFFd0YsT0FBRixDQUFVOU4sT0FBVixDQUFrQixjQUFsQixFQUFrQyxDQUFDc0ksQ0FBRCxFQUFJQSxFQUFFdUQsWUFBTixFQUFvQjBQLFNBQXBCLENBQWxDOztBQUVBQyxtQkFBV2xULEVBQUV1RCxZQUFiO0FBQ0F2RCxVQUFFdUQsWUFBRixHQUFpQjBQLFNBQWpCOztBQUVBalQsVUFBRW1KLGVBQUYsQ0FBa0JuSixFQUFFdUQsWUFBcEI7O0FBRUEsWUFBS3ZELEVBQUVsVixPQUFGLENBQVV5VixRQUFmLEVBQTBCOztBQUV0QjZTLHdCQUFZcFQsRUFBRWlJLFlBQUYsRUFBWjtBQUNBbUwsd0JBQVlBLFVBQVVsTCxLQUFWLENBQWdCLFVBQWhCLENBQVo7O0FBRUEsZ0JBQUtrTCxVQUFVclAsVUFBVixJQUF3QnFQLFVBQVV0b0IsT0FBVixDQUFrQnVYLFlBQS9DLEVBQThEO0FBQzFEK1EsMEJBQVVqSyxlQUFWLENBQTBCbkosRUFBRXVELFlBQTVCO0FBQ0g7QUFFSjs7QUFFRHZELFVBQUVrSixVQUFGO0FBQ0FsSixVQUFFbU8sWUFBRjs7QUFFQSxZQUFJbk8sRUFBRWxWLE9BQUYsQ0FBVXdXLElBQVYsS0FBbUIsSUFBdkIsRUFBNkI7QUFDekIsZ0JBQUlvSixnQkFBZ0IsSUFBcEIsRUFBMEI7O0FBRXRCMUssa0JBQUVnTSxZQUFGLENBQWVrSCxRQUFmOztBQUVBbFQsa0JBQUU2TCxTQUFGLENBQVlvSCxTQUFaLEVBQXVCLFlBQVc7QUFDOUJqVCxzQkFBRW1RLFNBQUYsQ0FBWThDLFNBQVo7QUFDSCxpQkFGRDtBQUlILGFBUkQsTUFRTztBQUNIalQsa0JBQUVtUSxTQUFGLENBQVk4QyxTQUFaO0FBQ0g7QUFDRGpULGNBQUV5SCxhQUFGO0FBQ0E7QUFDSDs7QUFFRCxZQUFJaUQsZ0JBQWdCLElBQWhCLElBQXdCMUssRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUFyRCxFQUFtRTtBQUMvRHJDLGNBQUUwSCxZQUFGLENBQWVDLFVBQWYsRUFBMkIsWUFBVztBQUNsQzNILGtCQUFFbVEsU0FBRixDQUFZOEMsU0FBWjtBQUNILGFBRkQ7QUFHSCxTQUpELE1BSU87QUFDSGpULGNBQUVtUSxTQUFGLENBQVk4QyxTQUFaO0FBQ0g7QUFFSixLQXRIRDs7QUF3SEFwVCxVQUFNcmhCLFNBQU4sQ0FBZ0J3dkIsU0FBaEIsR0FBNEIsWUFBVzs7QUFFbkMsWUFBSWhPLElBQUksSUFBUjs7QUFFQSxZQUFJQSxFQUFFbFYsT0FBRixDQUFVd1YsTUFBVixLQUFxQixJQUFyQixJQUE2Qk4sRUFBRStELFVBQUYsR0FBZS9ELEVBQUVsVixPQUFGLENBQVV1WCxZQUExRCxFQUF3RTs7QUFFcEVyQyxjQUFFNkQsVUFBRixDQUFhbmYsSUFBYjtBQUNBc2IsY0FBRTRELFVBQUYsQ0FBYWxmLElBQWI7QUFFSDs7QUFFRCxZQUFJc2IsRUFBRWxWLE9BQUYsQ0FBVW9XLElBQVYsS0FBbUIsSUFBbkIsSUFBMkJsQixFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQXhELEVBQXNFOztBQUVsRXJDLGNBQUV3RCxLQUFGLENBQVE5ZSxJQUFSO0FBRUg7O0FBRURzYixVQUFFd0YsT0FBRixDQUFVN2pCLFFBQVYsQ0FBbUIsZUFBbkI7QUFFSCxLQW5CRDs7QUFxQkFrZSxVQUFNcmhCLFNBQU4sQ0FBZ0I2MEIsY0FBaEIsR0FBaUMsWUFBVzs7QUFFeEMsWUFBSUMsS0FBSjtBQUFBLFlBQVdDLEtBQVg7QUFBQSxZQUFrQkMsQ0FBbEI7QUFBQSxZQUFxQkMsVUFBckI7QUFBQSxZQUFpQ3pULElBQUksSUFBckM7O0FBRUFzVCxnQkFBUXRULEVBQUV3RSxXQUFGLENBQWNrUCxNQUFkLEdBQXVCMVQsRUFBRXdFLFdBQUYsQ0FBY21QLElBQTdDO0FBQ0FKLGdCQUFRdlQsRUFBRXdFLFdBQUYsQ0FBY29QLE1BQWQsR0FBdUI1VCxFQUFFd0UsV0FBRixDQUFjcVAsSUFBN0M7QUFDQUwsWUFBSXpyQixLQUFLK3JCLEtBQUwsQ0FBV1AsS0FBWCxFQUFrQkQsS0FBbEIsQ0FBSjs7QUFFQUcscUJBQWExckIsS0FBS2dzQixLQUFMLENBQVdQLElBQUksR0FBSixHQUFVenJCLEtBQUtpc0IsRUFBMUIsQ0FBYjtBQUNBLFlBQUlQLGFBQWEsQ0FBakIsRUFBb0I7QUFDaEJBLHlCQUFhLE1BQU0xckIsS0FBS0MsR0FBTCxDQUFTeXJCLFVBQVQsQ0FBbkI7QUFDSDs7QUFFRCxZQUFLQSxjQUFjLEVBQWYsSUFBdUJBLGNBQWMsQ0FBekMsRUFBNkM7QUFDekMsbUJBQVF6VCxFQUFFbFYsT0FBRixDQUFVb1gsR0FBVixLQUFrQixLQUFsQixHQUEwQixNQUExQixHQUFtQyxPQUEzQztBQUNIO0FBQ0QsWUFBS3VSLGNBQWMsR0FBZixJQUF3QkEsY0FBYyxHQUExQyxFQUFnRDtBQUM1QyxtQkFBUXpULEVBQUVsVixPQUFGLENBQVVvWCxHQUFWLEtBQWtCLEtBQWxCLEdBQTBCLE1BQTFCLEdBQW1DLE9BQTNDO0FBQ0g7QUFDRCxZQUFLdVIsY0FBYyxHQUFmLElBQXdCQSxjQUFjLEdBQTFDLEVBQWdEO0FBQzVDLG1CQUFRelQsRUFBRWxWLE9BQUYsQ0FBVW9YLEdBQVYsS0FBa0IsS0FBbEIsR0FBMEIsT0FBMUIsR0FBb0MsTUFBNUM7QUFDSDtBQUNELFlBQUlsQyxFQUFFbFYsT0FBRixDQUFVZ1ksZUFBVixLQUE4QixJQUFsQyxFQUF3QztBQUNwQyxnQkFBSzJRLGNBQWMsRUFBZixJQUF1QkEsY0FBYyxHQUF6QyxFQUErQztBQUMzQyx1QkFBTyxNQUFQO0FBQ0gsYUFGRCxNQUVPO0FBQ0gsdUJBQU8sSUFBUDtBQUNIO0FBQ0o7O0FBRUQsZUFBTyxVQUFQO0FBRUgsS0FoQ0Q7O0FBa0NBNVQsVUFBTXJoQixTQUFOLENBQWdCeTFCLFFBQWhCLEdBQTJCLFVBQVN6ekIsS0FBVCxFQUFnQjs7QUFFdkMsWUFBSXdmLElBQUksSUFBUjtBQUFBLFlBQ0krRCxVQURKO0FBQUEsWUFFSTlSLFNBRko7O0FBSUErTixVQUFFbUQsUUFBRixHQUFhLEtBQWI7QUFDQW5ELFVBQUVzRSxPQUFGLEdBQVksS0FBWjs7QUFFQSxZQUFJdEUsRUFBRThELFNBQU4sRUFBaUI7QUFDYjlELGNBQUU4RCxTQUFGLEdBQWMsS0FBZDtBQUNBLG1CQUFPLEtBQVA7QUFDSDs7QUFFRDlELFVBQUVrRixXQUFGLEdBQWdCLEtBQWhCO0FBQ0FsRixVQUFFdUYsV0FBRixHQUFrQnZGLEVBQUV3RSxXQUFGLENBQWMwUCxXQUFkLEdBQTRCLEVBQTlCLEdBQXFDLEtBQXJDLEdBQTZDLElBQTdEOztBQUVBLFlBQUtsVSxFQUFFd0UsV0FBRixDQUFjbVAsSUFBZCxLQUF1Qi95QixTQUE1QixFQUF3QztBQUNwQyxtQkFBTyxLQUFQO0FBQ0g7O0FBRUQsWUFBS29mLEVBQUV3RSxXQUFGLENBQWMyUCxPQUFkLEtBQTBCLElBQS9CLEVBQXNDO0FBQ2xDblUsY0FBRXdGLE9BQUYsQ0FBVTlOLE9BQVYsQ0FBa0IsTUFBbEIsRUFBMEIsQ0FBQ3NJLENBQUQsRUFBSUEsRUFBRXFULGNBQUYsRUFBSixDQUExQjtBQUNIOztBQUVELFlBQUtyVCxFQUFFd0UsV0FBRixDQUFjMFAsV0FBZCxJQUE2QmxVLEVBQUV3RSxXQUFGLENBQWM0UCxRQUFoRCxFQUEyRDs7QUFFdkRuaUIsd0JBQVkrTixFQUFFcVQsY0FBRixFQUFaOztBQUVBLG9CQUFTcGhCLFNBQVQ7O0FBRUkscUJBQUssTUFBTDtBQUNBLHFCQUFLLE1BQUw7O0FBRUk4UixpQ0FDSS9ELEVBQUVsVixPQUFGLENBQVUwWCxZQUFWLEdBQ0l4QyxFQUFFK0ssY0FBRixDQUFrQi9LLEVBQUV1RCxZQUFGLEdBQWlCdkQsRUFBRXNOLGFBQUYsRUFBbkMsQ0FESixHQUVJdE4sRUFBRXVELFlBQUYsR0FBaUJ2RCxFQUFFc04sYUFBRixFQUh6Qjs7QUFLQXROLHNCQUFFcUQsZ0JBQUYsR0FBcUIsQ0FBckI7O0FBRUE7O0FBRUoscUJBQUssT0FBTDtBQUNBLHFCQUFLLElBQUw7O0FBRUlVLGlDQUNJL0QsRUFBRWxWLE9BQUYsQ0FBVTBYLFlBQVYsR0FDSXhDLEVBQUUrSyxjQUFGLENBQWtCL0ssRUFBRXVELFlBQUYsR0FBaUJ2RCxFQUFFc04sYUFBRixFQUFuQyxDQURKLEdBRUl0TixFQUFFdUQsWUFBRixHQUFpQnZELEVBQUVzTixhQUFGLEVBSHpCOztBQUtBdE4sc0JBQUVxRCxnQkFBRixHQUFxQixDQUFyQjs7QUFFQTs7QUFFSjs7QUExQko7O0FBK0JBLGdCQUFJcFIsYUFBYSxVQUFqQixFQUE4Qjs7QUFFMUIrTixrQkFBRW1JLFlBQUYsQ0FBZ0JwRSxVQUFoQjtBQUNBL0Qsa0JBQUV3RSxXQUFGLEdBQWdCLEVBQWhCO0FBQ0F4RSxrQkFBRXdGLE9BQUYsQ0FBVTlOLE9BQVYsQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBQ3NJLENBQUQsRUFBSS9OLFNBQUosQ0FBM0I7QUFFSDtBQUVKLFNBM0NELE1BMkNPOztBQUVILGdCQUFLK04sRUFBRXdFLFdBQUYsQ0FBY2tQLE1BQWQsS0FBeUIxVCxFQUFFd0UsV0FBRixDQUFjbVAsSUFBNUMsRUFBbUQ7O0FBRS9DM1Qsa0JBQUVtSSxZQUFGLENBQWdCbkksRUFBRXVELFlBQWxCO0FBQ0F2RCxrQkFBRXdFLFdBQUYsR0FBZ0IsRUFBaEI7QUFFSDtBQUVKO0FBRUosS0EvRUQ7O0FBaUZBM0UsVUFBTXJoQixTQUFOLENBQWdCZ29CLFlBQWhCLEdBQStCLFVBQVNobUIsS0FBVCxFQUFnQjs7QUFFM0MsWUFBSXdmLElBQUksSUFBUjs7QUFFQSxZQUFLQSxFQUFFbFYsT0FBRixDQUFVeVgsS0FBVixLQUFvQixLQUFyQixJQUFnQyxnQkFBZ0I1akIsUUFBaEIsSUFBNEJxaEIsRUFBRWxWLE9BQUYsQ0FBVXlYLEtBQVYsS0FBb0IsS0FBcEYsRUFBNEY7QUFDeEY7QUFDSCxTQUZELE1BRU8sSUFBSXZDLEVBQUVsVixPQUFGLENBQVVzVyxTQUFWLEtBQXdCLEtBQXhCLElBQWlDNWdCLE1BQU1nSSxJQUFOLENBQVdjLE9BQVgsQ0FBbUIsT0FBbkIsTUFBZ0MsQ0FBQyxDQUF0RSxFQUF5RTtBQUM1RTtBQUNIOztBQUVEMFcsVUFBRXdFLFdBQUYsQ0FBYzZQLFdBQWQsR0FBNEI3ekIsTUFBTTh6QixhQUFOLElBQXVCOXpCLE1BQU04ekIsYUFBTixDQUFvQkMsT0FBcEIsS0FBZ0MzekIsU0FBdkQsR0FDeEJKLE1BQU04ekIsYUFBTixDQUFvQkMsT0FBcEIsQ0FBNEJuMEIsTUFESixHQUNhLENBRHpDOztBQUdBNGYsVUFBRXdFLFdBQUYsQ0FBYzRQLFFBQWQsR0FBeUJwVSxFQUFFeUQsU0FBRixHQUFjekQsRUFBRWxWLE9BQUYsQ0FDbEM0WCxjQURMOztBQUdBLFlBQUkxQyxFQUFFbFYsT0FBRixDQUFVZ1ksZUFBVixLQUE4QixJQUFsQyxFQUF3QztBQUNwQzlDLGNBQUV3RSxXQUFGLENBQWM0UCxRQUFkLEdBQXlCcFUsRUFBRTBELFVBQUYsR0FBZTFELEVBQUVsVixPQUFGLENBQ25DNFgsY0FETDtBQUVIOztBQUVELGdCQUFRbGlCLE1BQU11USxJQUFOLENBQVc4ZCxNQUFuQjs7QUFFSSxpQkFBSyxPQUFMO0FBQ0k3TyxrQkFBRXdVLFVBQUYsQ0FBYWgwQixLQUFiO0FBQ0E7O0FBRUosaUJBQUssTUFBTDtBQUNJd2Ysa0JBQUV5VSxTQUFGLENBQVlqMEIsS0FBWjtBQUNBOztBQUVKLGlCQUFLLEtBQUw7QUFDSXdmLGtCQUFFaVUsUUFBRixDQUFXenpCLEtBQVg7QUFDQTs7QUFaUjtBQWdCSCxLQXJDRDs7QUF1Q0FxZixVQUFNcmhCLFNBQU4sQ0FBZ0JpMkIsU0FBaEIsR0FBNEIsVUFBU2owQixLQUFULEVBQWdCOztBQUV4QyxZQUFJd2YsSUFBSSxJQUFSO0FBQUEsWUFDSTBVLGFBQWEsS0FEakI7QUFBQSxZQUVJQyxPQUZKO0FBQUEsWUFFYXRCLGNBRmI7QUFBQSxZQUU2QmEsV0FGN0I7QUFBQSxZQUUwQ1UsY0FGMUM7QUFBQSxZQUUwREwsT0FGMUQ7QUFBQSxZQUVtRU0sbUJBRm5FOztBQUlBTixrQkFBVS96QixNQUFNOHpCLGFBQU4sS0FBd0IxekIsU0FBeEIsR0FBb0NKLE1BQU04ekIsYUFBTixDQUFvQkMsT0FBeEQsR0FBa0UsSUFBNUU7O0FBRUEsWUFBSSxDQUFDdlUsRUFBRW1ELFFBQUgsSUFBZW5ELEVBQUU4RCxTQUFqQixJQUE4QnlRLFdBQVdBLFFBQVFuMEIsTUFBUixLQUFtQixDQUFoRSxFQUFtRTtBQUMvRCxtQkFBTyxLQUFQO0FBQ0g7O0FBRUR1MEIsa0JBQVUzVSxFQUFFME0sT0FBRixDQUFVMU0sRUFBRXVELFlBQVosQ0FBVjs7QUFFQXZELFVBQUV3RSxXQUFGLENBQWNtUCxJQUFkLEdBQXFCWSxZQUFZM3pCLFNBQVosR0FBd0IyekIsUUFBUSxDQUFSLEVBQVc5c0IsS0FBbkMsR0FBMkNqSCxNQUFNczBCLE9BQXRFO0FBQ0E5VSxVQUFFd0UsV0FBRixDQUFjcVAsSUFBZCxHQUFxQlUsWUFBWTN6QixTQUFaLEdBQXdCMnpCLFFBQVEsQ0FBUixFQUFXN3NCLEtBQW5DLEdBQTJDbEgsTUFBTXUwQixPQUF0RTs7QUFFQS9VLFVBQUV3RSxXQUFGLENBQWMwUCxXQUFkLEdBQTRCbnNCLEtBQUtnc0IsS0FBTCxDQUFXaHNCLEtBQUtpdEIsSUFBTCxDQUNuQ2p0QixLQUFLa3RCLEdBQUwsQ0FBU2pWLEVBQUV3RSxXQUFGLENBQWNtUCxJQUFkLEdBQXFCM1QsRUFBRXdFLFdBQUYsQ0FBY2tQLE1BQTVDLEVBQW9ELENBQXBELENBRG1DLENBQVgsQ0FBNUI7O0FBR0FtQiw4QkFBc0I5c0IsS0FBS2dzQixLQUFMLENBQVdoc0IsS0FBS2l0QixJQUFMLENBQzdCanRCLEtBQUtrdEIsR0FBTCxDQUFTalYsRUFBRXdFLFdBQUYsQ0FBY3FQLElBQWQsR0FBcUI3VCxFQUFFd0UsV0FBRixDQUFjb1AsTUFBNUMsRUFBb0QsQ0FBcEQsQ0FENkIsQ0FBWCxDQUF0Qjs7QUFHQSxZQUFJLENBQUM1VCxFQUFFbFYsT0FBRixDQUFVZ1ksZUFBWCxJQUE4QixDQUFDOUMsRUFBRXNFLE9BQWpDLElBQTRDdVEsc0JBQXNCLENBQXRFLEVBQXlFO0FBQ3JFN1UsY0FBRThELFNBQUYsR0FBYyxJQUFkO0FBQ0EsbUJBQU8sS0FBUDtBQUNIOztBQUVELFlBQUk5RCxFQUFFbFYsT0FBRixDQUFVZ1ksZUFBVixLQUE4QixJQUFsQyxFQUF3QztBQUNwQzlDLGNBQUV3RSxXQUFGLENBQWMwUCxXQUFkLEdBQTRCVyxtQkFBNUI7QUFDSDs7QUFFRHhCLHlCQUFpQnJULEVBQUVxVCxjQUFGLEVBQWpCOztBQUVBLFlBQUk3eUIsTUFBTTh6QixhQUFOLEtBQXdCMXpCLFNBQXhCLElBQXFDb2YsRUFBRXdFLFdBQUYsQ0FBYzBQLFdBQWQsR0FBNEIsQ0FBckUsRUFBd0U7QUFDcEVsVSxjQUFFc0UsT0FBRixHQUFZLElBQVo7QUFDQTlqQixrQkFBTW1TLGNBQU47QUFDSDs7QUFFRGlpQix5QkFBaUIsQ0FBQzVVLEVBQUVsVixPQUFGLENBQVVvWCxHQUFWLEtBQWtCLEtBQWxCLEdBQTBCLENBQTFCLEdBQThCLENBQUMsQ0FBaEMsS0FBc0NsQyxFQUFFd0UsV0FBRixDQUFjbVAsSUFBZCxHQUFxQjNULEVBQUV3RSxXQUFGLENBQWNrUCxNQUFuQyxHQUE0QyxDQUE1QyxHQUFnRCxDQUFDLENBQXZGLENBQWpCO0FBQ0EsWUFBSTFULEVBQUVsVixPQUFGLENBQVVnWSxlQUFWLEtBQThCLElBQWxDLEVBQXdDO0FBQ3BDOFIsNkJBQWlCNVUsRUFBRXdFLFdBQUYsQ0FBY3FQLElBQWQsR0FBcUI3VCxFQUFFd0UsV0FBRixDQUFjb1AsTUFBbkMsR0FBNEMsQ0FBNUMsR0FBZ0QsQ0FBQyxDQUFsRTtBQUNIOztBQUdETSxzQkFBY2xVLEVBQUV3RSxXQUFGLENBQWMwUCxXQUE1Qjs7QUFFQWxVLFVBQUV3RSxXQUFGLENBQWMyUCxPQUFkLEdBQXdCLEtBQXhCOztBQUVBLFlBQUluVSxFQUFFbFYsT0FBRixDQUFVMlcsUUFBVixLQUF1QixLQUEzQixFQUFrQztBQUM5QixnQkFBS3pCLEVBQUV1RCxZQUFGLEtBQW1CLENBQW5CLElBQXdCOFAsbUJBQW1CLE9BQTVDLElBQXlEclQsRUFBRXVELFlBQUYsSUFBa0J2RCxFQUFFNEksV0FBRixFQUFsQixJQUFxQ3lLLG1CQUFtQixNQUFySCxFQUE4SDtBQUMxSGEsOEJBQWNsVSxFQUFFd0UsV0FBRixDQUFjMFAsV0FBZCxHQUE0QmxVLEVBQUVsVixPQUFGLENBQVV1VyxZQUFwRDtBQUNBckIsa0JBQUV3RSxXQUFGLENBQWMyUCxPQUFkLEdBQXdCLElBQXhCO0FBQ0g7QUFDSjs7QUFFRCxZQUFJblUsRUFBRWxWLE9BQUYsQ0FBVTZPLFFBQVYsS0FBdUIsS0FBM0IsRUFBa0M7QUFDOUJxRyxjQUFFcUUsU0FBRixHQUFjc1EsVUFBVVQsY0FBY1UsY0FBdEM7QUFDSCxTQUZELE1BRU87QUFDSDVVLGNBQUVxRSxTQUFGLEdBQWNzUSxVQUFXVCxlQUFlbFUsRUFBRXVFLEtBQUYsQ0FBUXpGLE1BQVIsS0FBbUJrQixFQUFFeUQsU0FBcEMsQ0FBRCxHQUFtRG1SLGNBQTNFO0FBQ0g7QUFDRCxZQUFJNVUsRUFBRWxWLE9BQUYsQ0FBVWdZLGVBQVYsS0FBOEIsSUFBbEMsRUFBd0M7QUFDcEM5QyxjQUFFcUUsU0FBRixHQUFjc1EsVUFBVVQsY0FBY1UsY0FBdEM7QUFDSDs7QUFFRCxZQUFJNVUsRUFBRWxWLE9BQUYsQ0FBVXdXLElBQVYsS0FBbUIsSUFBbkIsSUFBMkJ0QixFQUFFbFYsT0FBRixDQUFVMlgsU0FBVixLQUF3QixLQUF2RCxFQUE4RDtBQUMxRCxtQkFBTyxLQUFQO0FBQ0g7O0FBRUQsWUFBSXpDLEVBQUVrRCxTQUFGLEtBQWdCLElBQXBCLEVBQTBCO0FBQ3RCbEQsY0FBRXFFLFNBQUYsR0FBYyxJQUFkO0FBQ0EsbUJBQU8sS0FBUDtBQUNIOztBQUVEckUsVUFBRW1SLE1BQUYsQ0FBU25SLEVBQUVxRSxTQUFYO0FBRUgsS0E1RUQ7O0FBOEVBeEUsVUFBTXJoQixTQUFOLENBQWdCZzJCLFVBQWhCLEdBQTZCLFVBQVNoMEIsS0FBVCxFQUFnQjs7QUFFekMsWUFBSXdmLElBQUksSUFBUjtBQUFBLFlBQ0l1VSxPQURKOztBQUdBdlUsVUFBRWtGLFdBQUYsR0FBZ0IsSUFBaEI7O0FBRUEsWUFBSWxGLEVBQUV3RSxXQUFGLENBQWM2UCxXQUFkLEtBQThCLENBQTlCLElBQW1DclUsRUFBRStELFVBQUYsSUFBZ0IvRCxFQUFFbFYsT0FBRixDQUFVdVgsWUFBakUsRUFBK0U7QUFDM0VyQyxjQUFFd0UsV0FBRixHQUFnQixFQUFoQjtBQUNBLG1CQUFPLEtBQVA7QUFDSDs7QUFFRCxZQUFJaGtCLE1BQU04ekIsYUFBTixLQUF3QjF6QixTQUF4QixJQUFxQ0osTUFBTTh6QixhQUFOLENBQW9CQyxPQUFwQixLQUFnQzN6QixTQUF6RSxFQUFvRjtBQUNoRjJ6QixzQkFBVS96QixNQUFNOHpCLGFBQU4sQ0FBb0JDLE9BQXBCLENBQTRCLENBQTVCLENBQVY7QUFDSDs7QUFFRHZVLFVBQUV3RSxXQUFGLENBQWNrUCxNQUFkLEdBQXVCMVQsRUFBRXdFLFdBQUYsQ0FBY21QLElBQWQsR0FBcUJZLFlBQVkzekIsU0FBWixHQUF3QjJ6QixRQUFROXNCLEtBQWhDLEdBQXdDakgsTUFBTXMwQixPQUExRjtBQUNBOVUsVUFBRXdFLFdBQUYsQ0FBY29QLE1BQWQsR0FBdUI1VCxFQUFFd0UsV0FBRixDQUFjcVAsSUFBZCxHQUFxQlUsWUFBWTN6QixTQUFaLEdBQXdCMnpCLFFBQVE3c0IsS0FBaEMsR0FBd0NsSCxNQUFNdTBCLE9BQTFGOztBQUVBL1UsVUFBRW1ELFFBQUYsR0FBYSxJQUFiO0FBRUgsS0FyQkQ7O0FBdUJBdEQsVUFBTXJoQixTQUFOLENBQWdCMDJCLGNBQWhCLEdBQWlDclYsTUFBTXJoQixTQUFOLENBQWdCMjJCLGFBQWhCLEdBQWdDLFlBQVc7O0FBRXhFLFlBQUluVixJQUFJLElBQVI7O0FBRUEsWUFBSUEsRUFBRXlGLFlBQUYsS0FBbUIsSUFBdkIsRUFBNkI7O0FBRXpCekYsY0FBRWtILE1BQUY7O0FBRUFsSCxjQUFFaUUsV0FBRixDQUFjL1gsUUFBZCxDQUF1QixLQUFLcEIsT0FBTCxDQUFhcVgsS0FBcEMsRUFBMkNvRixNQUEzQzs7QUFFQXZILGNBQUV5RixZQUFGLENBQWVoaEIsUUFBZixDQUF3QnViLEVBQUVpRSxXQUExQjs7QUFFQWpFLGNBQUV3SCxNQUFGO0FBRUg7QUFFSixLQWhCRDs7QUFrQkEzSCxVQUFNcmhCLFNBQU4sQ0FBZ0Iwb0IsTUFBaEIsR0FBeUIsWUFBVzs7QUFFaEMsWUFBSWxILElBQUksSUFBUjs7QUFFQTVoQixVQUFFLGVBQUYsRUFBbUI0aEIsRUFBRXdGLE9BQXJCLEVBQThCelYsTUFBOUI7O0FBRUEsWUFBSWlRLEVBQUV3RCxLQUFOLEVBQWE7QUFDVHhELGNBQUV3RCxLQUFGLENBQVF6VCxNQUFSO0FBQ0g7O0FBRUQsWUFBSWlRLEVBQUU2RCxVQUFGLElBQWdCN0QsRUFBRTJHLFFBQUYsQ0FBV3pRLElBQVgsQ0FBZ0I4SixFQUFFbFYsT0FBRixDQUFVMFYsU0FBMUIsQ0FBcEIsRUFBMEQ7QUFDdERSLGNBQUU2RCxVQUFGLENBQWE5VCxNQUFiO0FBQ0g7O0FBRUQsWUFBSWlRLEVBQUU0RCxVQUFGLElBQWdCNUQsRUFBRTJHLFFBQUYsQ0FBV3pRLElBQVgsQ0FBZ0I4SixFQUFFbFYsT0FBRixDQUFVMlYsU0FBMUIsQ0FBcEIsRUFBMEQ7QUFDdERULGNBQUU0RCxVQUFGLENBQWE3VCxNQUFiO0FBQ0g7O0FBRURpUSxVQUFFa0UsT0FBRixDQUNLcmpCLFdBREwsQ0FDaUIsc0RBRGpCLEVBRUs4QyxJQUZMLENBRVUsYUFGVixFQUV5QixNQUZ6QixFQUdLNEwsR0FITCxDQUdTLE9BSFQsRUFHa0IsRUFIbEI7QUFLSCxLQXZCRDs7QUF5QkFzUSxVQUFNcmhCLFNBQU4sQ0FBZ0Jpc0IsT0FBaEIsR0FBMEIsVUFBUzJLLGNBQVQsRUFBeUI7O0FBRS9DLFlBQUlwVixJQUFJLElBQVI7QUFDQUEsVUFBRXdGLE9BQUYsQ0FBVTlOLE9BQVYsQ0FBa0IsU0FBbEIsRUFBNkIsQ0FBQ3NJLENBQUQsRUFBSW9WLGNBQUosQ0FBN0I7QUFDQXBWLFVBQUVySSxPQUFGO0FBRUgsS0FORDs7QUFRQWtJLFVBQU1yaEIsU0FBTixDQUFnQjJ2QixZQUFoQixHQUErQixZQUFXOztBQUV0QyxZQUFJbk8sSUFBSSxJQUFSO0FBQUEsWUFDSXlOLFlBREo7O0FBR0FBLHVCQUFlMWxCLEtBQUswSCxLQUFMLENBQVd1USxFQUFFbFYsT0FBRixDQUFVdVgsWUFBVixHQUF5QixDQUFwQyxDQUFmOztBQUVBLFlBQUtyQyxFQUFFbFYsT0FBRixDQUFVd1YsTUFBVixLQUFxQixJQUFyQixJQUNETixFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBRHhCLElBRUQsQ0FBQ3JDLEVBQUVsVixPQUFGLENBQVUyVyxRQUZmLEVBRTBCOztBQUV0QnpCLGNBQUU2RCxVQUFGLENBQWFoakIsV0FBYixDQUF5QixnQkFBekIsRUFBMkM4QyxJQUEzQyxDQUFnRCxlQUFoRCxFQUFpRSxPQUFqRTtBQUNBcWMsY0FBRTRELFVBQUYsQ0FBYS9pQixXQUFiLENBQXlCLGdCQUF6QixFQUEyQzhDLElBQTNDLENBQWdELGVBQWhELEVBQWlFLE9BQWpFOztBQUVBLGdCQUFJcWMsRUFBRXVELFlBQUYsS0FBbUIsQ0FBdkIsRUFBMEI7O0FBRXRCdkQsa0JBQUU2RCxVQUFGLENBQWFsaUIsUUFBYixDQUFzQixnQkFBdEIsRUFBd0NnQyxJQUF4QyxDQUE2QyxlQUE3QyxFQUE4RCxNQUE5RDtBQUNBcWMsa0JBQUU0RCxVQUFGLENBQWEvaUIsV0FBYixDQUF5QixnQkFBekIsRUFBMkM4QyxJQUEzQyxDQUFnRCxlQUFoRCxFQUFpRSxPQUFqRTtBQUVILGFBTEQsTUFLTyxJQUFJcWMsRUFBRXVELFlBQUYsSUFBa0J2RCxFQUFFK0QsVUFBRixHQUFlL0QsRUFBRWxWLE9BQUYsQ0FBVXVYLFlBQTNDLElBQTJEckMsRUFBRWxWLE9BQUYsQ0FBVThWLFVBQVYsS0FBeUIsS0FBeEYsRUFBK0Y7O0FBRWxHWixrQkFBRTRELFVBQUYsQ0FBYWppQixRQUFiLENBQXNCLGdCQUF0QixFQUF3Q2dDLElBQXhDLENBQTZDLGVBQTdDLEVBQThELE1BQTlEO0FBQ0FxYyxrQkFBRTZELFVBQUYsQ0FBYWhqQixXQUFiLENBQXlCLGdCQUF6QixFQUEyQzhDLElBQTNDLENBQWdELGVBQWhELEVBQWlFLE9BQWpFO0FBRUgsYUFMTSxNQUtBLElBQUlxYyxFQUFFdUQsWUFBRixJQUFrQnZELEVBQUUrRCxVQUFGLEdBQWUsQ0FBakMsSUFBc0MvRCxFQUFFbFYsT0FBRixDQUFVOFYsVUFBVixLQUF5QixJQUFuRSxFQUF5RTs7QUFFNUVaLGtCQUFFNEQsVUFBRixDQUFhamlCLFFBQWIsQ0FBc0IsZ0JBQXRCLEVBQXdDZ0MsSUFBeEMsQ0FBNkMsZUFBN0MsRUFBOEQsTUFBOUQ7QUFDQXFjLGtCQUFFNkQsVUFBRixDQUFhaGpCLFdBQWIsQ0FBeUIsZ0JBQXpCLEVBQTJDOEMsSUFBM0MsQ0FBZ0QsZUFBaEQsRUFBaUUsT0FBakU7QUFFSDtBQUVKO0FBRUosS0FqQ0Q7O0FBbUNBa2MsVUFBTXJoQixTQUFOLENBQWdCMHFCLFVBQWhCLEdBQTZCLFlBQVc7O0FBRXBDLFlBQUlsSixJQUFJLElBQVI7O0FBRUEsWUFBSUEsRUFBRXdELEtBQUYsS0FBWSxJQUFoQixFQUFzQjs7QUFFbEJ4RCxjQUFFd0QsS0FBRixDQUNLbGdCLElBREwsQ0FDVSxJQURWLEVBRVN6QyxXQUZULENBRXFCLGNBRnJCLEVBR1NzWCxHQUhUOztBQUtBNkgsY0FBRXdELEtBQUYsQ0FDS2xnQixJQURMLENBQ1UsSUFEVixFQUVLOGpCLEVBRkwsQ0FFUXJmLEtBQUswSCxLQUFMLENBQVd1USxFQUFFdUQsWUFBRixHQUFpQnZELEVBQUVsVixPQUFGLENBQVV3WCxjQUF0QyxDQUZSLEVBR0szZ0IsUUFITCxDQUdjLGNBSGQ7QUFLSDtBQUVKLEtBbEJEOztBQW9CQWtlLFVBQU1yaEIsU0FBTixDQUFnQjhzQixVQUFoQixHQUE2QixZQUFXOztBQUVwQyxZQUFJdEwsSUFBSSxJQUFSOztBQUVBLFlBQUtBLEVBQUVsVixPQUFGLENBQVU0VixRQUFmLEVBQTBCOztBQUV0QixnQkFBSy9oQixTQUFTcWhCLEVBQUVtRixNQUFYLENBQUwsRUFBMEI7O0FBRXRCbkYsa0JBQUVrRixXQUFGLEdBQWdCLElBQWhCO0FBRUgsYUFKRCxNQUlPOztBQUVIbEYsa0JBQUVrRixXQUFGLEdBQWdCLEtBQWhCO0FBRUg7QUFFSjtBQUVKLEtBbEJEOztBQW9CQTltQixNQUFFbUksRUFBRixDQUFLMmhCLEtBQUwsR0FBYSxZQUFXO0FBQ3BCLFlBQUlsSSxJQUFJLElBQVI7QUFBQSxZQUNJNlIsTUFBTWpVLFVBQVUsQ0FBVixDQURWO0FBQUEsWUFFSS9ULE9BQU90TCxNQUFNQyxTQUFOLENBQWdCQyxLQUFoQixDQUFzQkMsSUFBdEIsQ0FBMkJrZixTQUEzQixFQUFzQyxDQUF0QyxDQUZYO0FBQUEsWUFHSWdULElBQUk1USxFQUFFNWYsTUFIVjtBQUFBLFlBSUkwSixDQUpKO0FBQUEsWUFLSXVyQixHQUxKO0FBTUEsYUFBS3ZyQixJQUFJLENBQVQsRUFBWUEsSUFBSThtQixDQUFoQixFQUFtQjltQixHQUFuQixFQUF3QjtBQUNwQixnQkFBSSxRQUFPK25CLEdBQVAseUNBQU9BLEdBQVAsTUFBYyxRQUFkLElBQTBCLE9BQU9BLEdBQVAsSUFBYyxXQUE1QyxFQUNJN1IsRUFBRWxXLENBQUYsRUFBS29lLEtBQUwsR0FBYSxJQUFJckksS0FBSixDQUFVRyxFQUFFbFcsQ0FBRixDQUFWLEVBQWdCK25CLEdBQWhCLENBQWIsQ0FESixLQUdJd0QsTUFBTXJWLEVBQUVsVyxDQUFGLEVBQUtvZSxLQUFMLENBQVcySixHQUFYLEVBQWdCMXBCLEtBQWhCLENBQXNCNlgsRUFBRWxXLENBQUYsRUFBS29lLEtBQTNCLEVBQWtDcmUsSUFBbEMsQ0FBTjtBQUNKLGdCQUFJLE9BQU93ckIsR0FBUCxJQUFjLFdBQWxCLEVBQStCLE9BQU9BLEdBQVA7QUFDbEM7QUFDRCxlQUFPclYsQ0FBUDtBQUNILEtBZkQ7QUFpQkgsQ0FqN0ZDLENBQUQ7Ozs7O0FDakJEOzs7Ozs7Ozs7QUFTQSxDQUFDLENBQUMsVUFBVTVoQixDQUFWLEVBQWFrM0IsQ0FBYixFQUFnQjtBQUNqQjs7QUFFQSxLQUFJQyxVQUFXLFlBQVk7QUFDMUI7QUFDQSxNQUFJbE0sSUFBSTtBQUNObU0sWUFBUyxlQURIO0FBRU5DLGNBQVcsZUFGTDtBQUdOQyxnQkFBYSxZQUhQO0FBSU5DLG1CQUFnQjtBQUpWLEdBQVI7QUFBQSxNQU1DQyxNQUFPLFlBQVk7QUFDbEIsT0FBSUEsTUFBTSxzREFBc0QxZixJQUF0RCxDQUEyRDJmLFVBQVVDLFNBQXJFLENBQVY7QUFDQSxPQUFJRixHQUFKLEVBQVM7QUFDUjtBQUNBeDNCLE1BQUUsTUFBRixFQUFVbVIsR0FBVixDQUFjLFFBQWQsRUFBd0IsU0FBeEIsRUFBbUN4TSxFQUFuQyxDQUFzQyxPQUF0QyxFQUErQzNFLEVBQUUyM0IsSUFBakQ7QUFDQTtBQUNELFVBQU9ILEdBQVA7QUFDQSxHQVBLLEVBTlA7QUFBQSxNQWNDSSxNQUFPLFlBQVk7QUFDbEIsT0FBSXB3QixRQUFRakgsU0FBU3VVLGVBQVQsQ0FBeUJ0TixLQUFyQztBQUNBLFVBQVEsY0FBY0EsS0FBZCxJQUF1QixVQUFVQSxLQUFqQyxJQUEwQyxZQUFZc1EsSUFBWixDQUFpQjJmLFVBQVVDLFNBQTNCLENBQWxEO0FBQ0EsR0FISyxFQWRQO0FBQUEsTUFrQkNHLDBCQUEyQixZQUFZO0FBQ3RDLFVBQVEsQ0FBQyxDQUFDWCxFQUFFWSxZQUFaO0FBQ0EsR0FGeUIsRUFsQjNCO0FBQUEsTUFxQkNDLG9CQUFvQixTQUFwQkEsaUJBQW9CLENBQVUxMEIsS0FBVixFQUFpQjIwQixDQUFqQixFQUFvQjFtQixHQUFwQixFQUF5QjtBQUM1QyxPQUFJMm1CLFVBQVVoTixFQUFFb00sU0FBaEI7QUFBQSxPQUNDdm5CLE1BREQ7QUFFQSxPQUFJa29CLEVBQUVFLFNBQU4sRUFBaUI7QUFDaEJELGVBQVcsTUFBTWhOLEVBQUVzTSxjQUFuQjtBQUNBO0FBQ0R6bkIsWUFBVXdCLEdBQUQsR0FBUSxVQUFSLEdBQXFCLGFBQTlCO0FBQ0FqTyxTQUFNeU0sTUFBTixFQUFjbW9CLE9BQWQ7QUFDQSxHQTdCRjtBQUFBLE1BOEJDRSxtQkFBbUIsU0FBbkJBLGdCQUFtQixDQUFVOTBCLEtBQVYsRUFBaUIyMEIsQ0FBakIsRUFBb0I7QUFDdEMsVUFBTzMwQixNQUFNNkIsSUFBTixDQUFXLFFBQVE4eUIsRUFBRUksU0FBckIsRUFBZ0MvM0IsS0FBaEMsQ0FBc0MsQ0FBdEMsRUFBeUMyM0IsRUFBRUssVUFBM0MsRUFDTDkwQixRQURLLENBQ0l5MEIsRUFBRU0sVUFBRixHQUFlLEdBQWYsR0FBcUJyTixFQUFFbU0sT0FEM0IsRUFFSmx4QixNQUZJLENBRUcsWUFBWTtBQUNuQixXQUFRbEcsRUFBRSxJQUFGLEVBQVE4TixRQUFSLENBQWlCa3FCLEVBQUVPLGFBQW5CLEVBQWtDanlCLElBQWxDLEdBQXlDQyxJQUF6QyxHQUFnRHZFLE1BQXhEO0FBQ0EsSUFKSSxFQUlGUyxXQUpFLENBSVV1MUIsRUFBRUksU0FKWixDQUFQO0FBS0EsR0FwQ0Y7QUFBQSxNQXFDQ0ksb0JBQW9CLFNBQXBCQSxpQkFBb0IsQ0FBVUMsR0FBVixFQUFlbm5CLEdBQWYsRUFBb0I7QUFDdkMsT0FBSXhCLFNBQVV3QixHQUFELEdBQVEsVUFBUixHQUFxQixhQUFsQztBQUNBbW5CLE9BQUkzcUIsUUFBSixDQUFhLEdBQWIsRUFBa0JnQyxNQUFsQixFQUEwQm1iLEVBQUVxTSxXQUE1QjtBQUNBLEdBeENGO0FBQUEsTUF5Q0NvQixvQkFBb0IsU0FBcEJBLGlCQUFvQixDQUFVcjFCLEtBQVYsRUFBaUI7QUFDcEMsT0FBSXMxQixnQkFBZ0J0MUIsTUFBTThOLEdBQU4sQ0FBVSxpQkFBVixDQUFwQjtBQUNBLE9BQUl5bkIsY0FBY3YxQixNQUFNOE4sR0FBTixDQUFVLGNBQVYsQ0FBbEI7QUFDQXluQixpQkFBY0EsZUFBZUQsYUFBN0I7QUFDQUMsaUJBQWVBLGdCQUFnQixPQUFqQixHQUE0QixNQUE1QixHQUFxQyxPQUFuRDtBQUNBdjFCLFNBQU04TixHQUFOLENBQVU7QUFDVCx1QkFBbUJ5bkIsV0FEVjtBQUVULG9CQUFnQkE7QUFGUCxJQUFWO0FBSUEsR0FsREY7QUFBQSxNQW1EQ0MsVUFBVSxTQUFWQSxPQUFVLENBQVVDLEdBQVYsRUFBZTtBQUN4QixVQUFPQSxJQUFJbjRCLE9BQUosQ0FBWSxNQUFNc3FCLEVBQUVvTSxTQUFwQixDQUFQO0FBQ0EsR0FyREY7QUFBQSxNQXNEQzBCLGFBQWEsU0FBYkEsVUFBYSxDQUFVRCxHQUFWLEVBQWU7QUFDM0IsVUFBT0QsUUFBUUMsR0FBUixFQUFhbm1CLElBQWIsQ0FBa0IsV0FBbEIsQ0FBUDtBQUNBLEdBeERGO0FBQUEsTUF5REM5SixPQUFPLFNBQVBBLElBQU8sR0FBWTtBQUNsQixPQUFJakQsUUFBUTVGLEVBQUUsSUFBRixDQUFaO0FBQUEsT0FDQ2c0QixJQUFJZSxXQUFXbnpCLEtBQVgsQ0FETDtBQUVBOEQsZ0JBQWFzdUIsRUFBRWdCLE9BQWY7QUFDQXB6QixTQUFNZSxRQUFOLEdBQWlCSSxTQUFqQixDQUEyQixNQUEzQixFQUFtQ2dULEdBQW5DLEdBQXlDaFQsU0FBekMsQ0FBbUQsTUFBbkQ7QUFDQSxHQTlERjtBQUFBLE1BK0RDa3lCLFFBQVEsU0FBUkEsS0FBUSxDQUFVakIsQ0FBVixFQUFhO0FBQ3BCQSxLQUFFa0IsVUFBRixHQUFnQmw1QixFQUFFbWYsT0FBRixDQUFVLEtBQUssQ0FBTCxDQUFWLEVBQW1CNlksRUFBRW1CLEtBQXJCLElBQThCLENBQUMsQ0FBL0M7QUFDQSxRQUFLcHlCLFNBQUwsQ0FBZSxNQUFmOztBQUVBLE9BQUksQ0FBQyxLQUFLMkwsT0FBTCxDQUFhLE1BQU1zbEIsRUFBRU0sVUFBckIsRUFBaUN0MkIsTUFBdEMsRUFBOEM7QUFDN0NnMkIsTUFBRW9CLE1BQUYsQ0FBUzk0QixJQUFULENBQWN1NEIsUUFBUSxJQUFSLENBQWQ7QUFDQSxRQUFJYixFQUFFbUIsS0FBRixDQUFRbjNCLE1BQVosRUFBb0I7QUFDbkJoQyxPQUFFOG5CLEtBQUYsQ0FBUWpmLElBQVIsRUFBY212QixFQUFFbUIsS0FBaEI7QUFDQTtBQUNEO0FBQ0QsR0F6RUY7QUFBQSxNQTBFQ3J3QixNQUFNLFNBQU5BLEdBQU0sR0FBWTtBQUNqQixPQUFJbEQsUUFBUTVGLEVBQUUsSUFBRixDQUFaO0FBQUEsT0FDQ2c0QixJQUFJZSxXQUFXbnpCLEtBQVgsQ0FETDtBQUVBLE9BQUk0eEIsR0FBSixFQUFTO0FBQ1J4M0IsTUFBRThuQixLQUFGLENBQVFtUixLQUFSLEVBQWVyekIsS0FBZixFQUFzQm95QixDQUF0QjtBQUNBLElBRkQsTUFHSztBQUNKdHVCLGlCQUFhc3VCLEVBQUVnQixPQUFmO0FBQ0FoQixNQUFFZ0IsT0FBRixHQUFZaHZCLFdBQVdoSyxFQUFFOG5CLEtBQUYsQ0FBUW1SLEtBQVIsRUFBZXJ6QixLQUFmLEVBQXNCb3lCLENBQXRCLENBQVgsRUFBcUNBLEVBQUUvdEIsS0FBdkMsQ0FBWjtBQUNBO0FBQ0QsR0FwRkY7QUFBQSxNQXFGQ292QixlQUFlLFNBQWZBLFlBQWUsQ0FBVWx2QixDQUFWLEVBQWE7QUFDM0IsT0FBSXZFLFFBQVE1RixFQUFFLElBQUYsQ0FBWjtBQUFBLE9BQ0NnNEIsSUFBSWUsV0FBV256QixLQUFYLENBREw7QUFBQSxPQUVDMHpCLE1BQU0xekIsTUFBTWUsUUFBTixDQUFld0QsRUFBRXdJLElBQUYsQ0FBTzRsQixhQUF0QixDQUZQOztBQUlBLE9BQUlQLEVBQUV1QixhQUFGLENBQWdCajVCLElBQWhCLENBQXFCZzVCLEdBQXJCLE1BQThCLEtBQWxDLEVBQXlDO0FBQ3hDLFdBQU8sSUFBUDtBQUNBOztBQUVELE9BQUlBLElBQUl0M0IsTUFBSixHQUFhLENBQWIsSUFBa0JzM0IsSUFBSXJtQixFQUFKLENBQU8sU0FBUCxDQUF0QixFQUF5QztBQUN4Q3JOLFVBQU13YixHQUFOLENBQVUsaUJBQVYsRUFBNkIsS0FBN0I7QUFDQSxRQUFJalgsRUFBRUMsSUFBRixLQUFXLGVBQVgsSUFBOEJELEVBQUVDLElBQUYsS0FBVyxhQUE3QyxFQUE0RDtBQUMzRHhFLFdBQU0wVCxPQUFOLENBQWMsT0FBZDtBQUNBLEtBRkQsTUFFTztBQUNOdFosT0FBRThuQixLQUFGLENBQVFqZixJQUFSLEVBQWNqRCxNQUFNK2tCLE1BQU4sQ0FBYSxJQUFiLENBQWQ7QUFDQTtBQUNEO0FBQ0QsR0F0R0Y7QUFBQSxNQXVHQzZPLGdCQUFnQixTQUFoQkEsYUFBZ0IsQ0FBVW4yQixLQUFWLEVBQWlCMjBCLENBQWpCLEVBQW9CO0FBQ25DLE9BQUluMkIsVUFBVSxZQUFZbTJCLEVBQUVPLGFBQWQsR0FBOEIsR0FBNUM7QUFDQSxPQUFJdjRCLEVBQUVtSSxFQUFGLENBQUtDLFdBQUwsSUFBb0IsQ0FBQzR2QixFQUFFeUIsU0FBM0IsRUFBc0M7QUFDckNwMkIsVUFBTStFLFdBQU4sQ0FBa0JTLElBQWxCLEVBQXdCQyxHQUF4QixFQUE2QmpILE9BQTdCO0FBQ0EsSUFGRCxNQUdLO0FBQ0p3QixVQUNFc0IsRUFERixDQUNLLHNCQURMLEVBQzZCOUMsT0FEN0IsRUFDc0NnSCxJQUR0QyxFQUVFbEUsRUFGRixDQUVLLHNCQUZMLEVBRTZCOUMsT0FGN0IsRUFFc0NpSCxHQUZ0QztBQUdBO0FBQ0QsT0FBSTR3QixhQUFhLHlCQUFqQjtBQUNBLE9BQUk3Qix1QkFBSixFQUE2QjtBQUM1QjZCLGlCQUFhLHVCQUFiO0FBQ0E7QUFDRCxPQUFJLENBQUNsQyxHQUFMLEVBQVU7QUFDVGtDLGtCQUFjLHFCQUFkO0FBQ0E7QUFDRCxPQUFJOUIsR0FBSixFQUFTO0FBQ1I4QixrQkFBYyxzQkFBZDtBQUNBO0FBQ0RyMkIsU0FDRXNCLEVBREYsQ0FDSyxtQkFETCxFQUMwQixJQUQxQixFQUNnQ2tFLElBRGhDLEVBRUVsRSxFQUZGLENBRUssb0JBRkwsRUFFMkIsSUFGM0IsRUFFaUNtRSxHQUZqQyxFQUdFbkUsRUFIRixDQUdLKzBCLFVBSEwsRUFHaUIsR0FIakIsRUFHc0IxQixDQUh0QixFQUd5QnFCLFlBSHpCO0FBSUEsR0EvSEY7O0FBaUlBLFNBQU87QUFDTjtBQUNBL3lCLFNBQU0sY0FBVXF6QixPQUFWLEVBQW1CO0FBQ3hCLFFBQUksS0FBSzMzQixNQUFULEVBQWlCO0FBQ2hCLFNBQUk0RCxRQUFRLElBQVo7QUFBQSxTQUNDb3lCLElBQUllLFdBQVduekIsS0FBWCxDQURMO0FBRUEsU0FBSSxDQUFDb3lCLENBQUwsRUFBUTtBQUNQLGFBQU8sSUFBUDtBQUNBO0FBQ0QsU0FBSWptQixNQUFPaW1CLEVBQUVrQixVQUFGLEtBQWlCLElBQWxCLEdBQTBCbEIsRUFBRW1CLEtBQTVCLEdBQW9DLEVBQTlDO0FBQUEsU0FDQ0csTUFBTTF6QixNQUFNVixJQUFOLENBQVcsUUFBUTh5QixFQUFFTSxVQUFyQixFQUFpQ2huQixHQUFqQyxDQUFxQyxJQUFyQyxFQUEyQ1MsR0FBM0MsQ0FBK0NBLEdBQS9DLEVBQW9EdFAsV0FBcEQsQ0FBZ0V1MUIsRUFBRU0sVUFBbEUsRUFBOEV4cUIsUUFBOUUsQ0FBdUZrcUIsRUFBRU8sYUFBekYsQ0FEUDtBQUFBLFNBRUNsa0IsUUFBUTJqQixFQUFFNEIsUUFGWDs7QUFJQSxTQUFJRCxPQUFKLEVBQWE7QUFDWkwsVUFBSS95QixJQUFKO0FBQ0E4TixjQUFRLENBQVI7QUFDQTtBQUNEMmpCLE9BQUVrQixVQUFGLEdBQWUsS0FBZjs7QUFFQSxTQUFJbEIsRUFBRTZCLFlBQUYsQ0FBZXY1QixJQUFmLENBQW9CZzVCLEdBQXBCLE1BQTZCLEtBQWpDLEVBQXdDO0FBQ3ZDLGFBQU8sSUFBUDtBQUNBOztBQUVEQSxTQUFJcmhCLElBQUosQ0FBUyxJQUFULEVBQWUsSUFBZixFQUFxQkMsT0FBckIsQ0FBNkI4ZixFQUFFOEIsWUFBL0IsRUFBNkN6bEIsS0FBN0MsRUFBb0QsWUFBWTtBQUMvRCxVQUFJek8sUUFBUTVGLEVBQUUsSUFBRixDQUFaO0FBQ0FnNEIsUUFBRStCLE1BQUYsQ0FBU3o1QixJQUFULENBQWNzRixLQUFkO0FBQ0EsTUFIRDtBQUlBO0FBQ0QsV0FBTyxJQUFQO0FBQ0EsSUE3Qks7QUE4Qk5XLFNBQU0sZ0JBQVk7QUFDakIsUUFBSXl4QixJQUFJZSxXQUFXLElBQVgsQ0FBUjtBQUNBLFFBQUksQ0FBQ2YsQ0FBTCxFQUFRO0FBQ1AsWUFBTyxJQUFQO0FBQ0E7QUFDRCxRQUFJcHlCLFFBQVEsS0FBS3JDLFFBQUwsQ0FBY3kwQixFQUFFTSxVQUFoQixDQUFaO0FBQUEsUUFDQ2dCLE1BQU0xekIsTUFBTWtJLFFBQU4sQ0FBZWtxQixFQUFFTyxhQUFqQixDQURQOztBQUdBLFFBQUlQLEVBQUVnQyxZQUFGLENBQWUxNUIsSUFBZixDQUFvQmc1QixHQUFwQixNQUE2QixLQUFqQyxFQUF3QztBQUN2QyxZQUFPLElBQVA7QUFDQTs7QUFFREEsUUFBSXJoQixJQUFKLENBQVMsSUFBVCxFQUFlLElBQWYsRUFBcUJDLE9BQXJCLENBQTZCOGYsRUFBRWlDLFNBQS9CLEVBQTBDakMsRUFBRTNqQixLQUE1QyxFQUFtRCxZQUFZO0FBQzlEMmpCLE9BQUVrQyxNQUFGLENBQVM1NUIsSUFBVCxDQUFjZzVCLEdBQWQ7QUFDQSxLQUZEO0FBR0EsV0FBTyxJQUFQO0FBQ0EsSUE5Q0s7QUErQ04vZixZQUFTLG1CQUFZO0FBQ3BCLFdBQU8sS0FBS3ZXLElBQUwsQ0FBVSxZQUFZO0FBQzVCLFNBQUk0QyxRQUFRNUYsRUFBRSxJQUFGLENBQVo7QUFBQSxTQUNDZzRCLElBQUlweUIsTUFBTStNLElBQU4sQ0FBVyxXQUFYLENBREw7QUFBQSxTQUVDd25CLFNBRkQ7QUFHQSxTQUFJLENBQUNuQyxDQUFMLEVBQVE7QUFDUCxhQUFPLEtBQVA7QUFDQTtBQUNEbUMsaUJBQVl2MEIsTUFBTVYsSUFBTixDQUFXOHlCLEVBQUVPLGFBQWIsRUFBNEI1TixNQUE1QixDQUFtQyxJQUFuQyxDQUFaO0FBQ0FqaEIsa0JBQWFzdUIsRUFBRWdCLE9BQWY7QUFDQWpCLHVCQUFrQm55QixLQUFsQixFQUF5Qm95QixDQUF6QjtBQUNBUSx1QkFBa0IyQixTQUFsQjtBQUNBekIsdUJBQWtCOXlCLEtBQWxCO0FBQ0E7QUFDQUEsV0FBTWlFLEdBQU4sQ0FBVSxZQUFWLEVBQXdCQSxHQUF4QixDQUE0QixjQUE1QjtBQUNBO0FBQ0Fzd0IsZUFBVXJzQixRQUFWLENBQW1Ca3FCLEVBQUVPLGFBQXJCLEVBQW9DaHpCLElBQXBDLENBQXlDLE9BQXpDLEVBQWtELFVBQVVtRyxDQUFWLEVBQWFsRSxLQUFiLEVBQW9CO0FBQ3JFLFVBQUksT0FBT0EsS0FBUCxLQUFpQixXQUFyQixFQUFrQztBQUNqQyxjQUFPQSxNQUFNaEUsT0FBTixDQUFjLGlCQUFkLEVBQWlDLEVBQWpDLENBQVA7QUFDQTtBQUNELE1BSkQ7QUFLQTtBQUNBdzBCLE9BQUVtQixLQUFGLENBQVExMkIsV0FBUixDQUFvQnUxQixFQUFFTSxVQUFGLEdBQWUsR0FBZixHQUFxQnJOLEVBQUVtTSxPQUEzQyxFQUFvRDd6QixRQUFwRCxDQUE2RHkwQixFQUFFSSxTQUEvRDtBQUNBeHlCLFdBQU1WLElBQU4sQ0FBVyxNQUFNOHlCLEVBQUVNLFVBQW5CLEVBQStCNzFCLFdBQS9CLENBQTJDdTFCLEVBQUVNLFVBQTdDO0FBQ0FOLE9BQUVvQyxTQUFGLENBQVk5NUIsSUFBWixDQUFpQnNGLEtBQWpCO0FBQ0FBLFdBQU15MEIsVUFBTixDQUFpQixXQUFqQjtBQUNBLEtBekJNLENBQVA7QUEwQkEsSUExRUs7QUEyRU50MkIsU0FBTSxjQUFVdTJCLEVBQVYsRUFBYztBQUNuQixXQUFPLEtBQUt0M0IsSUFBTCxDQUFVLFlBQVk7QUFDNUIsU0FBSTRDLFFBQVE1RixFQUFFLElBQUYsQ0FBWjtBQUNBLFNBQUk0RixNQUFNK00sSUFBTixDQUFXLFdBQVgsQ0FBSixFQUE2QjtBQUM1QixhQUFPLEtBQVA7QUFDQTtBQUNELFNBQUlxbEIsSUFBSWg0QixFQUFFMkksTUFBRixDQUFTLEVBQVQsRUFBYTNJLEVBQUVtSSxFQUFGLENBQUtwQixTQUFMLENBQWUyTSxRQUE1QixFQUFzQzRtQixFQUF0QyxDQUFSO0FBQUEsU0FDQ0gsWUFBWXYwQixNQUFNVixJQUFOLENBQVc4eUIsRUFBRU8sYUFBYixFQUE0QjVOLE1BQTVCLENBQW1DLElBQW5DLENBRGI7QUFFQXFOLE9BQUVtQixLQUFGLEdBQVVoQixpQkFBaUJ2eUIsS0FBakIsRUFBd0JveUIsQ0FBeEIsQ0FBVjs7QUFFQXB5QixXQUFNK00sSUFBTixDQUFXLFdBQVgsRUFBd0JxbEIsQ0FBeEI7O0FBRUFELHVCQUFrQm55QixLQUFsQixFQUF5Qm95QixDQUF6QixFQUE0QixJQUE1QjtBQUNBUSx1QkFBa0IyQixTQUFsQixFQUE2QixJQUE3QjtBQUNBekIsdUJBQWtCOXlCLEtBQWxCO0FBQ0E0ekIsbUJBQWM1ekIsS0FBZCxFQUFxQm95QixDQUFyQjs7QUFFQW1DLGVBQVVwb0IsR0FBVixDQUFjLE1BQU1rWixFQUFFbU0sT0FBdEIsRUFBK0Jyd0IsU0FBL0IsQ0FBeUMsTUFBekMsRUFBaUQsSUFBakQ7O0FBRUFpeEIsT0FBRXVDLE1BQUYsQ0FBU2o2QixJQUFULENBQWMsSUFBZDtBQUNBLEtBbkJNLENBQVA7QUFvQkE7QUFoR0ssR0FBUDtBQWtHQSxFQXJPYSxFQUFkOztBQXVPQU4sR0FBRW1JLEVBQUYsQ0FBS3BCLFNBQUwsR0FBaUIsVUFBVStJLE1BQVYsRUFBa0JyRSxJQUFsQixFQUF3QjtBQUN4QyxNQUFJMHJCLFFBQVFybkIsTUFBUixDQUFKLEVBQXFCO0FBQ3BCLFVBQU9xbkIsUUFBUXJuQixNQUFSLEVBQWdCL0YsS0FBaEIsQ0FBc0IsSUFBdEIsRUFBNEI1SixNQUFNQyxTQUFOLENBQWdCQyxLQUFoQixDQUFzQkMsSUFBdEIsQ0FBMkJrZixTQUEzQixFQUFzQyxDQUF0QyxDQUE1QixDQUFQO0FBQ0EsR0FGRCxNQUdLLElBQUksUUFBTzFQLE1BQVAseUNBQU9BLE1BQVAsT0FBa0IsUUFBbEIsSUFBOEIsQ0FBRUEsTUFBcEMsRUFBNEM7QUFDaEQsVUFBT3FuQixRQUFRcHpCLElBQVIsQ0FBYWdHLEtBQWIsQ0FBbUIsSUFBbkIsRUFBeUJ5VixTQUF6QixDQUFQO0FBQ0EsR0FGSSxNQUdBO0FBQ0osVUFBT3hmLEVBQUU2TSxLQUFGLENBQVEsWUFBYWlELE1BQWIsR0FBc0Isd0NBQTlCLENBQVA7QUFDQTtBQUNELEVBVkQ7O0FBWUE5UCxHQUFFbUksRUFBRixDQUFLcEIsU0FBTCxDQUFlMk0sUUFBZixHQUEwQjtBQUN6QjZrQixpQkFBZSxhQURVLEVBQ0s7QUFDOUJELGNBQVksU0FGYTtBQUd6QkYsYUFBVyxtQkFIYztBQUl6QkMsY0FBWSxDQUphO0FBS3pCcHVCLFNBQU8sR0FMa0I7QUFNekJnd0IsYUFBVyxFQUFDdE0sU0FBUyxNQUFWLEVBTmM7QUFPekJtTSxnQkFBYyxFQUFDbk0sU0FBUyxNQUFWLEVBUFc7QUFRekJ0WixTQUFPLFFBUmtCO0FBU3pCdWxCLFlBQVUsTUFUZTtBQVV6QjFCLGFBQVcsSUFWYztBQVd6QnVCLGFBQVcsS0FYYztBQVl6QmMsVUFBUXY2QixFQUFFMjNCLElBWmU7QUFhekJxQyxnQkFBY2g2QixFQUFFMjNCLElBYlM7QUFjekJ1QyxVQUFRbDZCLEVBQUUyM0IsSUFkZTtBQWV6QmtDLGdCQUFjNzVCLEVBQUUyM0IsSUFmUztBQWdCekJvQyxVQUFRLzVCLEVBQUUyM0IsSUFoQmU7QUFpQnpCeUIsVUFBUXA1QixFQUFFMjNCLElBakJlO0FBa0J6QnlDLGFBQVdwNkIsRUFBRTIzQixJQWxCWTtBQW1CekI0QixpQkFBZXY1QixFQUFFMjNCO0FBbkJRLEVBQTFCO0FBc0JBLENBNVFBLEVBNFFFenZCLE1BNVFGLEVBNFFVNUYsTUE1UVY7OztBQ1REOzs7Ozs7QUFNQyxhQUFXO0FBQ1Y7O0FBRUEsV0FBU3ExQixJQUFULEdBQWdCLENBQUU7O0FBRWxCLE1BQUlyZixXQUFXaFcsT0FBT2dXLFFBQXRCOztBQUVBO0FBQ0EsV0FBU2tpQixNQUFULENBQWdCOXRCLE9BQWhCLEVBQXlCO0FBQ3ZCLFNBQUtBLE9BQUwsR0FBZTRMLFNBQVNHLE9BQVQsQ0FBaUI5UCxNQUFqQixDQUF3QixFQUF4QixFQUE0QjZ4QixPQUFPOW1CLFFBQW5DLEVBQTZDaEgsT0FBN0MsQ0FBZjtBQUNBLFNBQUtpTSxJQUFMLEdBQVksS0FBS2pNLE9BQUwsQ0FBYWtNLFVBQWIsR0FBMEIsWUFBMUIsR0FBeUMsVUFBckQ7QUFDQSxTQUFLMEMsU0FBTCxHQUFpQixFQUFqQjtBQUNBLFNBQUs1YSxPQUFMLEdBQWUsS0FBS2dNLE9BQUwsQ0FBYWhNLE9BQTVCO0FBQ0EsU0FBSys1QixlQUFMO0FBQ0Q7O0FBRUQ7QUFDQUQsU0FBT3A2QixTQUFQLENBQWlCcTZCLGVBQWpCLEdBQW1DLFlBQVc7QUFDNUMsUUFBSUMsVUFBVTtBQUNabmYsZ0JBQVUsQ0FBQztBQUNUd0QsY0FBTSxPQURHO0FBRVRELFlBQUksUUFGSztBQUdUNU4sZ0JBQVE7QUFIQyxPQUFELEVBSVA7QUFDRDZOLGNBQU0sU0FETDtBQUVERCxZQUFJLE1BRkg7QUFHRDVOLGdCQUFRO0FBSFAsT0FKTyxFQVFQO0FBQ0Q2TixjQUFNLE1BREw7QUFFREQsWUFBSSxTQUZIO0FBR0Q1TixnQkFBUTtBQUhQLE9BUk8sRUFZUDtBQUNENk4sY0FBTSxRQURMO0FBRURELFlBQUksT0FGSDtBQUdENU4sZ0JBQVEsa0JBQVc7QUFDakIsaUJBQU8sQ0FBQyxLQUFLd0gsT0FBTCxDQUFhbEcsV0FBYixFQUFSO0FBQ0Q7QUFMQSxPQVpPLENBREU7QUFvQlpvRyxrQkFBWSxDQUFDO0FBQ1hvRyxlQUFPLE9BREk7QUFFWHpCLGNBQU0sUUFGSztBQUdYck0sZ0JBQVE7QUFIRyxPQUFELEVBSVQ7QUFDRDhOLGVBQU8sU0FETjtBQUVEekIsY0FBTSxNQUZMO0FBR0RyTSxnQkFBUTtBQUhQLE9BSlMsRUFRVDtBQUNEOE4sZUFBTyxNQUROO0FBRUR6QixjQUFNLFNBRkw7QUFHRHJNLGdCQUFRO0FBSFAsT0FSUyxFQVlUO0FBQ0Q4TixlQUFPLFFBRE47QUFFRHpCLGNBQU0sT0FGTDtBQUdEck0sZ0JBQVEsa0JBQVc7QUFDakIsaUJBQU8sQ0FBQyxLQUFLd0gsT0FBTCxDQUFha0MsVUFBYixFQUFSO0FBQ0Q7QUFMQSxPQVpTO0FBcEJBLEtBQWQ7O0FBeUNBLFNBQUssSUFBSWxQLElBQUksQ0FBUixFQUFXcU8sTUFBTTJnQixRQUFRLEtBQUsvaEIsSUFBYixFQUFtQjNXLE1BQXpDLEVBQWlEMEosSUFBSXFPLEdBQXJELEVBQTBEck8sR0FBMUQsRUFBK0Q7QUFDN0QsVUFBSWl2QixTQUFTRCxRQUFRLEtBQUsvaEIsSUFBYixFQUFtQmpOLENBQW5CLENBQWI7QUFDQSxXQUFLa3ZCLGNBQUwsQ0FBb0JELE1BQXBCO0FBQ0Q7QUFDRixHQTlDRDs7QUFnREE7QUFDQUgsU0FBT3A2QixTQUFQLENBQWlCdzZCLGNBQWpCLEdBQWtDLFVBQVNELE1BQVQsRUFBaUI7QUFDakQsUUFBSXplLE9BQU8sSUFBWDtBQUNBLFNBQUtaLFNBQUwsQ0FBZTFaLElBQWYsQ0FBb0IsSUFBSTBXLFFBQUosQ0FBYTtBQUMvQnBZLGVBQVMsS0FBS3dNLE9BQUwsQ0FBYXhNLE9BRFM7QUFFL0JRLGVBQVMsS0FBS2dNLE9BQUwsQ0FBYWhNLE9BRlM7QUFHL0JtWSxlQUFTLEtBQUtuTSxPQUFMLENBQWFtTSxPQUhTO0FBSS9CTCxlQUFVLFVBQVNtaUIsTUFBVCxFQUFpQjtBQUN6QixlQUFPLFVBQVM5bUIsU0FBVCxFQUFvQjtBQUN6QnFJLGVBQUt4UCxPQUFMLENBQWFpdUIsT0FBTzltQixTQUFQLENBQWIsRUFBZ0N2VCxJQUFoQyxDQUFxQzRiLElBQXJDLEVBQTJDckksU0FBM0M7QUFDRCxTQUZEO0FBR0QsT0FKUyxDQUlSOG1CLE1BSlEsQ0FKcUI7QUFTL0J6cEIsY0FBUXlwQixPQUFPenBCLE1BVGdCO0FBVS9CMEgsa0JBQVksS0FBS2xNLE9BQUwsQ0FBYWtNO0FBVk0sS0FBYixDQUFwQjtBQVlELEdBZEQ7O0FBZ0JBO0FBQ0E0aEIsU0FBT3A2QixTQUFQLENBQWlCbVosT0FBakIsR0FBMkIsWUFBVztBQUNwQyxTQUFLLElBQUk3TixJQUFJLENBQVIsRUFBV3FPLE1BQU0sS0FBS3VCLFNBQUwsQ0FBZXRaLE1BQXJDLEVBQTZDMEosSUFBSXFPLEdBQWpELEVBQXNEck8sR0FBdEQsRUFBMkQ7QUFDekQsV0FBSzRQLFNBQUwsQ0FBZTVQLENBQWYsRUFBa0I2TixPQUFsQjtBQUNEO0FBQ0QsU0FBSytCLFNBQUwsR0FBaUIsRUFBakI7QUFDRCxHQUxEOztBQU9Ba2YsU0FBT3A2QixTQUFQLENBQWlCb1osT0FBakIsR0FBMkIsWUFBVztBQUNwQyxTQUFLLElBQUk5TixJQUFJLENBQVIsRUFBV3FPLE1BQU0sS0FBS3VCLFNBQUwsQ0FBZXRaLE1BQXJDLEVBQTZDMEosSUFBSXFPLEdBQWpELEVBQXNEck8sR0FBdEQsRUFBMkQ7QUFDekQsV0FBSzRQLFNBQUwsQ0FBZTVQLENBQWYsRUFBa0I4TixPQUFsQjtBQUNEO0FBQ0YsR0FKRDs7QUFNQWdoQixTQUFPcDZCLFNBQVAsQ0FBaUJxWixNQUFqQixHQUEwQixZQUFXO0FBQ25DLFNBQUssSUFBSS9OLElBQUksQ0FBUixFQUFXcU8sTUFBTSxLQUFLdUIsU0FBTCxDQUFldFosTUFBckMsRUFBNkMwSixJQUFJcU8sR0FBakQsRUFBc0RyTyxHQUF0RCxFQUEyRDtBQUN6RCxXQUFLNFAsU0FBTCxDQUFlNVAsQ0FBZixFQUFrQitOLE1BQWxCO0FBQ0Q7QUFDRixHQUpEOztBQU1BK2dCLFNBQU85bUIsUUFBUCxHQUFrQjtBQUNoQnhULGFBQVNvQyxNQURPO0FBRWhCdVcsYUFBUyxJQUZPO0FBR2hCZ2lCLFdBQU9sRCxJQUhTO0FBSWhCbUQsYUFBU25ELElBSk87QUFLaEJvRCxVQUFNcEQsSUFMVTtBQU1oQnFELFlBQVFyRDtBQU5RLEdBQWxCOztBQVNBcmYsV0FBU2tpQixNQUFULEdBQWtCQSxNQUFsQjtBQUNELENBaEhBLEdBQUQ7OztBQ05BLENBQUMsVUFBU3g2QixDQUFULEVBQVk7O0FBRVo7O0FBRUEsUUFBSWk3QixVQUFVajdCLEVBQUcscUNBQUgsQ0FBZDs7QUFFRyxRQUFJazdCLFFBQVFsN0IsRUFBRyxtQ0FBSCxDQUFaOztBQUVBQSxNQUFFc0MsTUFBRixFQUFVZ2UsSUFBVixDQUFlLFlBQVc7QUFDdEI0YSxjQUFNaGpCLE9BQU4sQ0FBYyxFQUFDLFdBQVUsR0FBWCxFQUFkLEVBQThCLEdBQTlCO0FBQ0gsS0FGRDs7QUFJQTtBQUNBK2lCLFlBQVF0MkIsRUFBUixDQUFXLE9BQVgsRUFBbUIsUUFBbkIsRUFBNkIsWUFBVzs7QUFFcEMsWUFBRzNFLEVBQUUsTUFBRixFQUFVMHZCLFFBQVYsQ0FBbUIsZ0JBQW5CLENBQUgsRUFBeUM7QUFDckM7QUFDSDs7QUFFRCxZQUFJdHVCLEtBQUtwQixFQUFFLElBQUYsRUFBUTJTLElBQVIsQ0FBYSxLQUFiLENBQVQ7QUFDQSxZQUFHM1MsRUFBRW9CLEVBQUYsRUFBTStQLEdBQU4sQ0FBVSxTQUFWLEtBQXdCLENBQTNCLEVBQThCO0FBQzFCblIsY0FBRSxNQUFGLEVBQVVpWSxJQUFWLEdBQWlCeFYsV0FBakIsQ0FBNkIsUUFBN0IsRUFBdUNzUCxHQUF2QyxDQUEyQzNRLEVBQTNDLEVBQStDOFcsT0FBL0MsQ0FBdUQsRUFBQyxXQUFVLEdBQVgsRUFBdkQsRUFBdUUsR0FBdkU7QUFDQWxZLGNBQUVvQixFQUFGLEVBQU02VyxJQUFOLEdBQWFDLE9BQWIsQ0FBcUIsRUFBQyxXQUFVLEdBQVgsRUFBckIsRUFBcUMsR0FBckM7QUFDSDtBQUVKLEtBWkQ7O0FBY0EraUIsWUFBUXQyQixFQUFSLENBQVcsT0FBWCxFQUFtQixRQUFuQixFQUE2QixZQUFXO0FBQ3BDM0UsVUFBRSxNQUFGLEVBQVVpWSxJQUFWLEdBQWlCeFYsV0FBakIsQ0FBNkIsUUFBN0I7QUFDQSxZQUFJckIsS0FBS3BCLEVBQUUsSUFBRixFQUFRMlMsSUFBUixDQUFhLEtBQWIsQ0FBVDtBQUNBLFlBQUczUyxFQUFFb0IsRUFBRixFQUFNK1AsR0FBTixDQUFVLFNBQVYsS0FBd0IsQ0FBM0IsRUFBOEI7QUFDMUJuUixjQUFFLE1BQUYsRUFBVWlZLElBQVYsR0FBaUJsRyxHQUFqQixDQUFxQjNRLEVBQXJCLEVBQXlCK1AsR0FBekIsQ0FBNkIsRUFBQyxXQUFVLEdBQVgsRUFBN0I7QUFDQW5SLGNBQUVvQixFQUFGLEVBQU02VyxJQUFOLEdBQWE5RyxHQUFiLENBQWlCLEVBQUMsV0FBVSxHQUFYLEVBQWpCO0FBQ0g7O0FBRURuUixVQUFFb0IsRUFBRixFQUFNbUMsUUFBTixDQUFlLFFBQWY7QUFFSCxLQVZEOztBQVlBMDNCLFlBQVFFLFVBQVIsQ0FBbUIsWUFBVzs7QUFFMUIsWUFBR243QixFQUFFLE1BQUYsRUFBVTB2QixRQUFWLENBQW1CLGdCQUFuQixDQUFILEVBQXlDO0FBQ3JDO0FBQ0g7O0FBRUQxdkIsVUFBRSxNQUFGLEVBQVVpWSxJQUFWLEdBQWlCeFYsV0FBakIsQ0FBNkIsUUFBN0IsRUFBdUN5VixPQUF2QyxDQUErQyxFQUFDLFdBQVUsR0FBWCxFQUEvQyxFQUErRCxHQUEvRDtBQUNBbFksVUFBRSxRQUFGLEVBQVlpWSxJQUFaLEdBQW1CQyxPQUFuQixDQUEyQixFQUFDLFdBQVUsR0FBWCxFQUEzQixFQUEyQyxHQUEzQztBQUNILEtBUkQ7QUFVSCxDQWpERCxFQWlER2hRLE1BakRIOzs7QUNBQyxXQUFVM0gsUUFBVixFQUFvQitCLE1BQXBCLEVBQTRCdEMsQ0FBNUIsRUFBK0I7O0FBRTVCOztBQUVBLFFBQUdBLEVBQUUsd0JBQUYsRUFBNEJnQyxNQUEvQixFQUF1QztBQUNuQyxZQUFJbzVCLGVBQWUsSUFBSUMsZUFBSixDQUFvQi80QixPQUFPNFQsUUFBUCxDQUFnQm9sQixNQUFwQyxDQUFuQjtBQUNBLFlBQUdGLGFBQWFHLEdBQWIsQ0FBaUIsUUFBakIsQ0FBSCxFQUErQjtBQUMzQixnQkFBSUMsUUFBUUosYUFBYTVQLEdBQWIsQ0FBaUIsUUFBakIsQ0FBWjtBQUNBLGdCQUFHZ1EsVUFBVSxNQUFiLEVBQXFCO0FBQ3JCeDdCLGtCQUFFLFlBQUYsRUFBZ0JrWSxPQUFoQixDQUF3QixFQUFFNUYsV0FBV3RTLEVBQUUsZUFBRixFQUFtQmtSLE1BQW5CLEdBQTRCRCxHQUE1QixHQUFpQyxFQUE5QyxFQUF4QixFQUE0RSxJQUE1RTtBQUNJalIsa0JBQUUsc0NBQUYsRUFBMEN5N0IsT0FBMUM7QUFDSDtBQUVKOztBQUVEbjVCLGVBQU9vNUIsZ0JBQVAsR0FBMEIsVUFBU0MsV0FBVCxFQUFzQjtBQUM5QzM3QixjQUFFLDZCQUFGLEVBQWlDNFIsV0FBakMsQ0FBNkMsRUFBRWlCLEtBQUssSUFBUCxFQUE3QztBQUNELFNBRkQ7QUFHSDtBQUVKLENBcEJBLEVBb0JDdFMsUUFwQkQsRUFvQlcrQixNQXBCWCxFQW9CbUI0RixNQXBCbkIsQ0FBRDs7O0FDQUMsV0FBVTNILFFBQVYsRUFBb0IrQixNQUFwQixFQUE0QnRDLENBQTVCLEVBQStCOztBQUUvQjs7QUFFQTs7QUFFQUEsR0FBRSxHQUFGLEVBQU8rUixHQUFQLENBQVcsMENBQVgsRUFBdUQvTyxJQUF2RCxDQUE0RCxZQUFZO0FBQ3ZFLE1BQUk0NEIsaUJBQWlCLElBQUlDLE1BQUosQ0FBVyxNQUFNdjVCLE9BQU80VCxRQUFQLENBQWdCNGxCLElBQXRCLEdBQTZCLEdBQXhDLENBQXJCO0FBQ0EsTUFBSyxDQUFFRixlQUFlOWpCLElBQWYsQ0FBb0IsS0FBS2lrQixJQUF6QixDQUFQLEVBQXdDO0FBQ3ZDLzdCLEtBQUUsSUFBRixFQUFRdUYsSUFBUixDQUFhLFFBQWIsRUFBdUIsUUFBdkI7QUFDQTtBQUNELEVBTEQ7O0FBT0d2RixHQUFFLGlCQUFGLEVBQXFCdUYsSUFBckIsQ0FBMEIsUUFBMUIsRUFBb0MsUUFBcEM7QUFFSCxDQWZBLEVBZUNoRixRQWZELEVBZVcrQixNQWZYLEVBZW1CNEYsTUFmbkIsQ0FBRDs7O0FDQUEsQ0FBQyxVQUFTbEksQ0FBVCxFQUFZO0FBQ1RBLE1BQUVPLFFBQUYsRUFBWW9FLEVBQVosQ0FBZSxnQkFBZixFQUFpQyxZQUFXO0FBQ3hDLFlBQUlxM0IsSUFBSWpjLE1BQVIsRUFBZ0I7QUFDWixnQkFBSTllLFNBQVNqQixFQUFFLG1CQUFGLENBQWI7QUFDQSxnQkFBSWtSLFNBQVMsQ0FBQyxHQUFkOztBQUVBLGdCQUFJbFIsRUFBRSxrQkFBRixFQUFzQmdDLE1BQTFCLEVBQW1DO0FBQy9CLG9CQUFJZixTQUFTakIsRUFBRSxrQkFBRixDQUFiO0FBQ0gsYUFGRCxNQUVPLElBQUlBLEVBQUUseUJBQUYsRUFBNkJnQyxNQUFqQyxFQUEwQztBQUM3QyxvQkFBSWYsU0FBU2pCLEVBQUUseUJBQUYsQ0FBYjtBQUNBa1IseUJBQVMsQ0FBQyxFQUFWO0FBQ0g7O0FBRURsUixjQUFFb1YsWUFBRixDQUFlO0FBQ1hwQiw4QkFBYy9TLE1BREg7QUFFWGlRLHdCQUFRQTtBQUZHLGFBQWY7O0FBS0FsUixjQUFFLGVBQUYsRUFBbUJpOEIsVUFBbkIsQ0FBOEIsT0FBOUI7O0FBRUFDLHVCQUFXQyxNQUFYLENBQWtCLFdBQWxCO0FBQ0g7QUFFSixLQXRCRDtBQXlCSCxDQTFCRCxFQTBCR2owQixNQTFCSDs7O0FDQUMsV0FBVTNILFFBQVYsRUFBb0IrQixNQUFwQixFQUE0QnRDLENBQTVCLEVBQStCOztBQUUvQjs7QUFFRyxRQUFJZ2IsU0FBSjtBQUNBLFFBQUlvaEIsZ0JBQWdCLENBQXBCO0FBQ0EsUUFBSTlrQixRQUFRLEdBQVo7QUFDQSxRQUFJK2tCLGVBQWVyOEIsRUFBRSxjQUFGLEVBQWtCd1MsV0FBbEIsRUFBbkI7O0FBRUF4UyxNQUFFc0MsTUFBRixFQUFVZzZCLE1BQVYsQ0FBaUIsVUFBU2w2QixLQUFULEVBQWU7QUFDNUI0WSxvQkFBWSxJQUFaO0FBQ0gsS0FGRDs7QUFJQWlQLGdCQUFZLFlBQVc7QUFDbkIsWUFBSWpQLFNBQUosRUFBZTtBQUNYdWhCO0FBQ0F2aEIsd0JBQVksS0FBWjtBQUNIO0FBQ0osS0FMRCxFQUtHLEdBTEg7O0FBT0EsYUFBU3VoQixXQUFULEdBQXVCO0FBQ25CLFlBQUlDLEtBQUt4OEIsRUFBRXNDLE1BQUYsRUFBVWdRLFNBQVYsRUFBVDs7QUFFQTtBQUNBLFlBQUczSSxLQUFLQyxHQUFMLENBQVN3eUIsZ0JBQWdCSSxFQUF6QixLQUFnQ2xsQixLQUFuQyxFQUEwQztBQUN0QztBQUNIOztBQUVEO0FBQ0EsWUFBSWtsQixLQUFLSixhQUFULEVBQXVCO0FBQ25CO0FBQ0EsZ0JBQUdJLEtBQUtILFlBQVIsRUFBc0I7QUFDbEJyOEIsa0JBQUUsY0FBRixFQUFrQnVELFFBQWxCLENBQTJCLE9BQTNCLEVBQW9DZCxXQUFwQyxDQUFnRCxVQUFoRCxFQUE0RGMsUUFBNUQsQ0FBcUUsZUFBckU7QUFDSDtBQUNKLFNBTEQsTUFLTztBQUNIO0FBQ0EsZ0JBQUkrVCxRQUFNK2tCLFlBQVAsR0FBdUJHLEVBQXZCLEdBQTRCeDhCLEVBQUVzQyxNQUFGLEVBQVVvZSxNQUFWLEVBQTVCLEdBQWlEMWdCLEVBQUVPLFFBQUYsRUFBWW1nQixNQUFaLEVBQXBELEVBQTBFOztBQUV0RTFnQixrQkFBRSxjQUFGLEVBQWtCeUMsV0FBbEIsQ0FBOEIsUUFBOUIsRUFBd0NjLFFBQXhDLENBQWlELFVBQWpEO0FBQ0g7QUFDSjs7QUFFRCxZQUFHaTVCLE1BQU9sbEIsUUFBTStrQixZQUFoQixFQUErQjtBQUMzQnI4QixjQUFFLGNBQUYsRUFBa0J5QyxXQUFsQixDQUE4Qix1QkFBOUI7QUFDSDs7QUFFRDI1Qix3QkFBZ0JJLEVBQWhCO0FBQ0g7QUFFSixDQWpEQSxFQWlEQ2o4QixRQWpERCxFQWlEVytCLE1BakRYLEVBaURtQjRGLE1BakRuQixDQUFEOzs7QUNBQyxXQUFVM0gsUUFBVixFQUFvQitCLE1BQXBCLEVBQTRCdEMsQ0FBNUIsRUFBK0I7O0FBRS9COztBQUVBOztBQUNBQSxNQUFFTyxRQUFGLEVBQVkwN0IsVUFBWjs7QUFFR2o4QixNQUFFLE1BQUYsRUFBVXVELFFBQVYsQ0FBbUIsZ0JBQW5COztBQUVBdkQsTUFBRSxjQUFGLEVBQWtCMkUsRUFBbEIsQ0FBcUIsT0FBckIsRUFBNkIsVUFBU3dGLENBQVQsRUFBVzs7QUFFcENuSyxVQUFFb1YsWUFBRixDQUFlO0FBQ1hsRSxvQkFBUSxDQUFDLEdBREU7QUFFWDhDLDBCQUFjaFUsRUFBRSwwQkFBRjtBQUZILFNBQWY7QUFJSCxLQU5EOztBQVFBOztBQUVBQSxNQUFFLCtCQUFGLEVBQW1DMkUsRUFBbkMsQ0FBc0MsT0FBdEMsRUFBOEMsVUFBU3dGLENBQVQsRUFBVzs7QUFFckQsWUFBSXN5QixVQUFVejhCLEVBQUUsSUFBRixFQUFRMnFCLE1BQVIsR0FBaUJ6bEIsSUFBakIsQ0FBc0Isa0JBQXRCLENBQWQ7O0FBRUEsWUFBSXUzQixRQUFReHBCLEVBQVIsQ0FBVyxVQUFYLENBQUosRUFBNkI7QUFDekJ3cEIsb0JBQVFuakIsT0FBUixDQUFnQixPQUFoQjtBQUNBblAsY0FBRW9LLGNBQUY7QUFDSDtBQUlKLEtBWEQ7O0FBY0F2VSxNQUFFc0MsTUFBRixFQUFVZzZCLE1BQVYsQ0FBaUJJLGNBQWpCOztBQUVBMThCLE1BQUVzQyxNQUFGLEVBQVVxQyxFQUFWLENBQWEsYUFBYixFQUEyQixVQUFTd0YsQ0FBVCxFQUFXO0FBQ2xDdXlCO0FBQ0gsS0FGRDtBQUdBLFFBQUlDLFNBQVMsS0FBYjs7QUFFQSxhQUFTQyxrQkFBVCxDQUE0Qm53QixJQUE1QixFQUFrQzs7QUFFOUIsWUFBSSxDQUFFek0sRUFBRXlNLElBQUYsRUFBUXpLLE1BQWQsRUFBdUI7QUFDbkIsbUJBQU8sS0FBUDtBQUNIOztBQUVELFlBQUk2NkIsYUFBYTc4QixFQUFFc0MsTUFBRixFQUFVZ1EsU0FBVixFQUFqQjtBQUNBLFlBQUl3cUIsZ0JBQWdCRCxhQUFhNzhCLEVBQUVzQyxNQUFGLEVBQVVvZSxNQUFWLEVBQWpDOztBQUVBLFlBQUlxYyxVQUFVLzhCLEVBQUV5TSxJQUFGLEVBQVF5RSxNQUFSLEdBQWlCRCxHQUEvQjtBQUNBLFlBQUkrckIsYUFBYUQsVUFBVS84QixFQUFFeU0sSUFBRixFQUFRaVUsTUFBUixFQUEzQjs7QUFFQSxlQUFTc2MsY0FBY0YsYUFBZixJQUFrQ0MsV0FBV0YsVUFBckQ7QUFDSDs7QUFFRCxhQUFTSCxjQUFULEdBQTBCO0FBQ3hCLFlBQUlFLG1CQUFtQjU4QixFQUFFLFVBQUYsQ0FBbkIsS0FBcUMsQ0FBQzI4QixNQUExQyxFQUFrRDtBQUM5Q0EscUJBQVMsSUFBVDtBQUNBMzhCLGNBQUUsU0FBRixFQUFhZ0QsSUFBYixDQUFrQixZQUFZO0FBQzlCaEQsa0JBQUUsSUFBRixFQUFRbVIsR0FBUixDQUFZLFNBQVosRUFBdUIsQ0FBdkI7QUFDQW5SLGtCQUFFLElBQUYsRUFBUWtNLElBQVIsQ0FBYSxTQUFiLEVBQXVCLENBQXZCLEVBQTBCZ00sT0FBMUIsQ0FBa0M7QUFDOUIra0IsNkJBQVNqOUIsRUFBRSxJQUFGLEVBQVE2aUIsSUFBUixHQUFlcmYsT0FBZixDQUF1QixJQUF2QixFQUE2QixFQUE3QjtBQURxQixpQkFBbEMsRUFFRztBQUNDdVUsOEJBQVUsSUFEWDtBQUVDM0QsNEJBQVEsT0FGVDtBQUdDNEQsMEJBQU0sY0FBVTBSLEdBQVYsRUFBZTtBQUNqQjFwQiwwQkFBRSxJQUFGLEVBQVE2aUIsSUFBUixDQUFhbFosS0FBS3lVLElBQUwsQ0FBVXNMLEdBQVYsRUFBZXdULFFBQWYsR0FBMEIxNUIsT0FBMUIsQ0FBa0MsMEJBQWxDLEVBQThELEtBQTlELENBQWI7QUFDSDtBQUxGLGlCQUZIO0FBU0QsYUFYQztBQVlIO0FBQ0Y7O0FBRUR4RCxNQUFFLFlBQUYsRUFBZ0JnRCxJQUFoQixDQUFxQixZQUFZO0FBQzdCLFlBQUdoRCxFQUFFLElBQUYsRUFBUWtGLElBQVIsQ0FBYSxZQUFiLEVBQTJCbEQsTUFBOUIsRUFBc0M7QUFDbENoQyxjQUFFLElBQUYsRUFBUWtGLElBQVIsQ0FBYSxRQUFiLEVBQXVCcUIsSUFBdkI7QUFDSDtBQUNKLEtBSkQ7O0FBTUF2RyxNQUFFLFlBQUYsRUFBZ0IyRSxFQUFoQixDQUFtQixPQUFuQixFQUEyQixRQUEzQixFQUFvQyxVQUFTd0YsQ0FBVCxFQUFXO0FBQzNDQSxVQUFFb0ssY0FBRjtBQUNBOztBQUVBO0FBQ0E7QUFDQXZVLFVBQUUsSUFBRixFQUFRMFMsT0FBUixDQUFnQixLQUFoQixFQUF1QnhOLElBQXZCLENBQTRCLElBQTVCLEVBQWtDekMsV0FBbEMsQ0FBOEMsT0FBOUM7QUFDQXpDLFVBQUUsSUFBRixFQUFRMlIsTUFBUjtBQUNILEtBUkQ7QUFZSCxDQTNGQSxFQTJGQ3BSLFFBM0ZELEVBMkZXK0IsTUEzRlgsRUEyRm1CNEYsTUEzRm5CLENBQUQ7OztBQ0FDLFdBQVUzSCxRQUFWLEVBQW9CK0IsTUFBcEIsRUFBNEJ0QyxDQUE1QixFQUErQjs7QUFFL0I7O0FBRUE7O0FBRU9BLEdBQUUsU0FBRixFQUFhZ0QsSUFBYixDQUFrQixZQUFVO0FBQ3hCLE1BQUltNkIsT0FBT2oxQixPQUFPLElBQVAsQ0FBWDtBQUNBLE1BQUlrMUIsUUFBUUQsS0FBSzUzQixJQUFMLENBQVUsSUFBVixDQUFaO0FBQ0EsTUFBSTgzQixXQUFXRixLQUFLNTNCLElBQUwsQ0FBVSxPQUFWLENBQWY7QUFDQSxNQUFJKzNCLFNBQVNILEtBQUs1M0IsSUFBTCxDQUFVLEtBQVYsQ0FBYjs7QUFFVnZGLElBQUV3ckIsR0FBRixDQUFNOFIsTUFBTixFQUFjLFVBQVMzcUIsSUFBVCxFQUFlO0FBQzVCO0FBQ0EsT0FBSTRxQixPQUFPcjFCLE9BQU95SyxJQUFQLEVBQWF6TixJQUFiLENBQWtCLEtBQWxCLENBQVg7O0FBRUE7QUFDQSxPQUFHLE9BQU9rNEIsS0FBUCxLQUFpQixXQUFwQixFQUFpQztBQUNoQ0csV0FBT0EsS0FBS2g0QixJQUFMLENBQVUsSUFBVixFQUFnQjYzQixLQUFoQixDQUFQO0FBQ0E7QUFDRDtBQUNBLE9BQUcsT0FBT0MsUUFBUCxLQUFvQixXQUF2QixFQUFvQztBQUNuQ0UsV0FBT0EsS0FBS2g0QixJQUFMLENBQVUsT0FBVixFQUFtQjgzQixXQUFTLGVBQTVCLENBQVA7QUFDQTs7QUFFRDtBQUNBRSxVQUFPQSxLQUFLbFQsVUFBTCxDQUFnQixTQUFoQixDQUFQOztBQUVBO0FBQ0E4UyxRQUFLSyxXQUFMLENBQWlCRCxJQUFqQjtBQUVBLEdBbkJELEVBbUJHLEtBbkJIO0FBcUJBLEVBM0JNO0FBK0JQLENBckNBLEVBcUNDaDlCLFFBckNELEVBcUNXK0IsTUFyQ1gsRUFxQ21CNEYsTUFyQ25CLENBQUQ7OztBQ0FBLENBQUMsVUFBU2xJLENBQVQsRUFBWTs7QUFFWjs7QUFHRyxNQUFJeTlCLFVBQVV6OUIsRUFBRSxtQ0FBRixDQUFkOztBQUVBO0FBQ0F5OUIsVUFBUXY0QixJQUFSLENBQWEsNkNBQWIsRUFBNER3NEIsS0FBNUQsQ0FBa0UsWUFBVzs7QUFFM0UsUUFBSUMsY0FBYzM5QixFQUFFLElBQUYsRUFBUVcsT0FBUixDQUFnQixTQUFoQixDQUFsQjs7QUFFQSxRQUFJZzlCLFlBQVlqTyxRQUFaLENBQXFCLGNBQXJCLENBQUosRUFBMEM7QUFDeEM7QUFDQStOLGNBQVExckIsR0FBUixDQUFZNHJCLFdBQVosRUFBeUJsN0IsV0FBekIsQ0FBcUMsYUFBckMsRUFBb0RjLFFBQXBELENBQTZELDBCQUE3RDtBQUNBO0FBQ0FvNkIsa0JBQVlsN0IsV0FBWixDQUF3QiwwQkFBeEIsRUFBb0RjLFFBQXBELENBQTZELGFBQTdEOztBQUVBLFVBQUlrNkIsUUFBUTFyQixHQUFSLENBQVk0ckIsV0FBWixFQUF5QmpPLFFBQXpCLENBQWtDLGFBQWxDLENBQUosRUFBc0Q7QUFDcEQ7QUFDRCxPQUZELE1BRU87QUFDTCtOLGdCQUFRMXJCLEdBQVIsQ0FBWTRyQixXQUFaLEVBQXlCcDZCLFFBQXpCLENBQWtDLGFBQWxDO0FBQ0Q7O0FBR0QsVUFBSTJOLFNBQVMsQ0FBYjtBQUNBLFVBQUlnckIsV0FBVzBCLFVBQVgsQ0FBc0JDLE9BQXRCLENBQThCLFFBQTlCLENBQUosRUFBOEM7QUFDNUMsWUFBSTNzQixTQUFTLENBQUMsR0FBZDtBQUNEOztBQUVEbFIsUUFBRW9WLFlBQUYsQ0FBZTtBQUNYcEIsc0JBQWMycEIsV0FESDtBQUVYO0FBQ0F6cEIsc0JBQWMsd0JBQVc7QUFDckJsVSxZQUFFLGNBQUYsRUFBa0J1RCxRQUFsQixDQUEyQixRQUEzQjtBQUNIO0FBTFUsT0FBZjtBQVFELEtBMUJELE1BMEJPO0FBQ0xvNkIsa0JBQVlsN0IsV0FBWixDQUF3QixhQUF4QixFQUF1Q2MsUUFBdkMsQ0FBZ0QsY0FBaEQ7QUFDQWs2QixjQUFRMXJCLEdBQVIsQ0FBWTRyQixXQUFaLEVBQXlCbDdCLFdBQXpCLENBQXFDLGFBQXJDO0FBQ0Q7QUFDRixHQWxDRDs7QUFvQ0E7QUFDQWc3QixVQUFRdjRCLElBQVIsQ0FBYSxlQUFiLEVBQThCdzRCLEtBQTlCLENBQW9DLFlBQVc7O0FBRTdDLFFBQUlDLGNBQWMzOUIsRUFBRSxJQUFGLEVBQVEwUyxPQUFSLENBQWdCLG1CQUFoQixFQUFxQy9SLE9BQXJDLENBQTZDLFNBQTdDLENBQWxCOztBQUVBZzlCLGdCQUFZbDdCLFdBQVosQ0FBd0IsYUFBeEIsRUFBdUNjLFFBQXZDLENBQWdELDBCQUFoRDtBQUNBazZCLFlBQVExckIsR0FBUixDQUFZNHJCLFdBQVosRUFBeUJsN0IsV0FBekIsQ0FBcUMsYUFBckM7QUFFRCxHQVBEO0FBU0gsQ0F0REQsRUFzREd5RixNQXRESDs7O0FDQUMsV0FBVTNILFFBQVYsRUFBb0IrQixNQUFwQixFQUE0QnRDLENBQTVCLEVBQStCOztBQUUvQjs7QUFFR0EsTUFBRSx5Q0FBRixFQUE2Q2dELElBQTdDLENBQWtELFlBQVk7QUFDMUQsWUFBSTg2QixRQUFROTlCLEVBQUUsSUFBRixFQUFRMnFCLE1BQVIsR0FBaUJ6bEIsSUFBakIsQ0FBc0IsT0FBdEIsRUFBK0IyZCxJQUEvQixFQUFaO0FBQ0E3aUIsVUFBRSxJQUFGLEVBQVF1RixJQUFSLENBQWMsYUFBZCxFQUE2QnU0QixLQUE3QjtBQUNILEtBSEQ7QUFLSCxDQVRBLEVBU0N2OUIsUUFURCxFQVNXK0IsTUFUWCxFQVNtQjRGLE1BVG5CLENBQUQ7OztBQ0FDLFdBQVUzSCxRQUFWLEVBQW9CK0IsTUFBcEIsRUFBNEJ0QyxDQUE1QixFQUErQjs7QUFFL0I7O0FBR0dBLE1BQUVPLFFBQUYsRUFBWW9FLEVBQVosQ0FBZSxPQUFmLEVBQXdCLGFBQXhCLEVBQXVDbzVCLFNBQXZDOztBQUVBLGFBQVNBLFNBQVQsR0FBcUI7O0FBRWpCO0FBQ0EsWUFBSS85QixFQUFFLHlCQUFGLEVBQTZCZytCLElBQTdCLEVBQUosRUFBMEM7QUFDdENoK0IsY0FBRSx5QkFBRixFQUE2QixDQUE3QixFQUFnQzJ4QixLQUFoQztBQUNIOztBQUVELFlBQUkvckIsUUFBUTVGLEVBQUUsSUFBRixDQUFaOztBQUVBLFlBQUlvTyxNQUFNeEksTUFBTStNLElBQU4sQ0FBVyxLQUFYLENBQVY7O0FBRUEsWUFBSXNyQixTQUFTaitCLEVBQUUsTUFBTTRGLE1BQU0rTSxJQUFOLENBQVcsTUFBWCxDQUFSLENBQWI7O0FBRUE7Ozs7Ozs7QUFPQSxZQUFJdXJCLFVBQVVsK0IsRUFBRSxVQUFGLEVBQWM7QUFDeEI0UCxpQkFBS3hCLEdBRG1CO0FBRXhCaE4sZ0JBQUssT0FGbUI7QUFHeEIrOEIseUJBQWEsQ0FIVztBQUl4QnpZLHVCQUFXO0FBSmEsU0FBZCxDQUFkOztBQU9Bd1ksZ0JBQVE3M0IsUUFBUixDQUFpQixvQkFBakIsRUFBdUM0M0IsTUFBdkM7QUFJSDs7QUFFRDtBQUNBaitCLE1BQUVPLFFBQUYsRUFBWW9FLEVBQVosQ0FDRSxrQkFERixFQUNzQixjQUR0QixFQUNzQyxZQUFZO0FBQzlDM0UsVUFBRSxJQUFGLEVBQVFrRixJQUFSLENBQWEsb0JBQWIsRUFBbUNrNUIsSUFBbkMsQ0FBd0MsRUFBeEM7QUFDQSxZQUFJcCtCLEVBQUUseUJBQUYsRUFBNkJnK0IsSUFBN0IsRUFBSixFQUEwQztBQUN0Q2grQixjQUFFLHlCQUFGLEVBQTZCLENBQTdCLEVBQWdDNnhCLElBQWhDO0FBQ0g7QUFFRixLQVBIO0FBV0gsQ0FwREEsRUFvREN0eEIsUUFwREQsRUFvRFcrQixNQXBEWCxFQW9EbUI0RixNQXBEbkIsQ0FBRDs7O0FDQUEsQ0FBQyxVQUFTbEksQ0FBVCxFQUFZOztBQUVaOztBQUdHLFFBQUlxK0Isc0JBQXNCLFNBQXRCQSxtQkFBc0IsQ0FBVTM5QixPQUFWLEVBQW1CO0FBQ3pDLFlBQUk0OUIsWUFBWTU5QixPQUFoQjtBQUFBLFlBQ0k2OUIsYUFBYTc5QixRQUFRODlCLFNBRHpCOztBQUdBO0FBQ0E7QUFDQSxlQUFPRixVQUFVRyxrQkFBVixLQUFpQyxJQUF4QyxFQUE4QztBQUMxQyxnQkFBSUgsVUFBVUcsa0JBQVYsQ0FBNkJELFNBQTdCLEdBQXlDRCxVQUE3QyxFQUF5RDtBQUNyRCx1QkFBT0QsU0FBUDtBQUNIO0FBQ0RBLHdCQUFZQSxVQUFVRyxrQkFBdEI7QUFDSDtBQUNELGVBQU9ILFNBQVA7QUFDSCxLQWJEOztBQWVBLFFBQUlJLFFBQVExK0IsRUFBRSwyQkFBRixDQUFaO0FBQ0EsUUFBSXk5QixVQUFVejlCLEVBQUUscUNBQUYsQ0FBZDs7QUFFQTtBQUNBeTlCLFlBQVF2NEIsSUFBUixDQUFhLDZDQUFiLEVBQTREdzRCLEtBQTVELENBQWtFLFlBQVc7O0FBRXpFLFlBQUlDLGNBQWMzOUIsRUFBRSxJQUFGLEVBQVFXLE9BQVIsQ0FBZ0IsU0FBaEIsQ0FBbEI7O0FBRUE7QUFDQSxZQUFJMGUsT0FBT2dmLG9CQUFvQlYsWUFBWSxDQUFaLENBQXBCLENBQVg7O0FBRUEzOUIsVUFBRSxVQUFGLEVBQWMyUixNQUFkOztBQUVBO0FBQ0Fnc0Isb0JBQVl6NEIsSUFBWixDQUFpQixtQkFBakIsRUFDS3d2QixLQURMLEdBRUtqeUIsV0FGTCxDQUVpQixNQUZqQixFQUdLbW9CLElBSEwsQ0FHVSx5QkFIVixFQUdxQ0QsTUFIckMsR0FJSzFCLFdBSkwsQ0FJaUJqcEIsRUFBRXFmLElBQUYsQ0FKakI7O0FBT0EsWUFBSXNlLFlBQVlqTyxRQUFaLENBQXFCLGNBQXJCLENBQUosRUFBMEM7QUFDMUM7QUFDSStOLG9CQUFRMXJCLEdBQVIsQ0FBWTRyQixXQUFaLEVBQXlCbDdCLFdBQXpCLENBQXFDLGFBQXJDLEVBQW9EYyxRQUFwRCxDQUE2RCwwQkFBN0Q7QUFDQTtBQUNBbzZCLHdCQUFZbDdCLFdBQVosQ0FBd0IsMEJBQXhCLEVBQW9EYyxRQUFwRCxDQUE2RCxhQUE3RDs7QUFFSixnQkFBSWs2QixRQUFRMXJCLEdBQVIsQ0FBWTRyQixXQUFaLEVBQXlCak8sUUFBekIsQ0FBa0MsYUFBbEMsQ0FBSixFQUFzRDtBQUNwRDtBQUNELGFBRkQsTUFFTztBQUNMK04sd0JBQVExckIsR0FBUixDQUFZNHJCLFdBQVosRUFBeUJwNkIsUUFBekIsQ0FBa0MsYUFBbEM7QUFDRDs7QUFHRCxnQkFBSTJOLFNBQVMsQ0FBYjtBQUNBLGdCQUFJZ3JCLFdBQVcwQixVQUFYLENBQXNCQyxPQUF0QixDQUE4QixRQUE5QixDQUFKLEVBQThDO0FBQzVDLG9CQUFJM3NCLFNBQVMsQ0FBQyxHQUFkO0FBQ0Q7O0FBRURsUixjQUFFb1YsWUFBRixDQUFlO0FBQ1hwQiw4QkFBYzJwQixXQURIO0FBRVg7QUFDQXpwQiw4QkFBYyx3QkFBVztBQUNyQmxVLHNCQUFFLGNBQUYsRUFBa0J1RCxRQUFsQixDQUEyQixRQUEzQjtBQUNIO0FBTFUsYUFBZjtBQVFELFNBMUJDLE1BMEJLO0FBQ0xvNkIsd0JBQVlsN0IsV0FBWixDQUF3QixhQUF4QixFQUF1Q2MsUUFBdkMsQ0FBZ0QsY0FBaEQ7QUFDQWs2QixvQkFBUTFyQixHQUFSLENBQVk0ckIsV0FBWixFQUF5Qmw3QixXQUF6QixDQUFxQyxhQUFyQztBQUNEO0FBQ0YsS0EvQ0Q7O0FBaURBO0FBQ0FpOEIsVUFBTS81QixFQUFOLENBQVMsT0FBVCxFQUFpQixRQUFqQixFQUEyQixZQUFXO0FBQ3BDKzVCLGNBQU14NUIsSUFBTixDQUFXLFVBQVgsRUFBdUJ5TSxNQUF2QjtBQUNBOHJCLGdCQUFRaDdCLFdBQVIsQ0FBb0IsYUFBcEIsRUFBbUNjLFFBQW5DLENBQTRDLDBCQUE1QztBQUNELEtBSEQ7O0FBS0F2RCxNQUFFc0MsTUFBRixFQUFVK3FCLE1BQVYsQ0FBaUIsWUFBVztBQUN4QnFSLGNBQU14NUIsSUFBTixDQUFXLFVBQVgsRUFBdUJ5TSxNQUF2QjtBQUNBOHJCLGdCQUFRaDdCLFdBQVIsQ0FBb0IsYUFBcEIsRUFBbUNjLFFBQW5DLENBQTRDLDBCQUE1QztBQUNILEtBSEQ7QUFLSCxDQXBGRCxFQW9GRzJFLE1BcEZIOzs7QWRBQyxXQUFVM0gsUUFBVixFQUFvQitCLE1BQXBCLEVBQTRCdEMsQ0FBNUIsRUFBK0I7O0FBRS9COztBQUVHQSxNQUFFLE9BQUYsRUFBVzZmLFFBQVgsQ0FBb0I7QUFDaEJJLGdCQUFRLFVBRFEsRUFDSTtBQUNwQjNNLGtCQUFVLEdBRk0sRUFFSTtBQUNwQjRNLG1CQUFXLEdBSEssRUFHSTtBQUNwQkMsbUJBQVcsSUFKSyxFQUlJO0FBQ3BCQyxjQUFNLElBTFUsQ0FLSTtBQUxKLEtBQXBCOztBQVFBcGdCLE1BQUVPLFFBQUYsRUFBWW9FLEVBQVosQ0FBZSxVQUFmLEVBQTJCLE9BQTNCLEVBQW9DLFlBQVc7QUFDM0MsWUFBSTRiLEtBQUt2Z0IsRUFBRSxJQUFGLENBQVQ7QUFDQTtBQUNBO0FBQ0gsS0FKRDtBQU1ILENBbEJBLEVBa0JDTyxRQWxCRCxFQWtCVytCLE1BbEJYLEVBa0JtQjRGLE1BbEJuQixDQUFEOzs7QWVBQyxXQUFVM0gsUUFBVixFQUFvQitCLE1BQXBCLEVBQTRCdEMsQ0FBNUIsRUFBK0I7O0FBRS9COztBQUVHQSxNQUFFLHFDQUFGLEVBQXlDMkUsRUFBekMsQ0FBNkMsT0FBN0MsRUFBc0QsVUFBU3dGLENBQVQsRUFBWTtBQUM5RCxZQUFJK0csU0FBU2xSLEVBQUUsSUFBRixFQUFRa1IsTUFBUixFQUFiO0FBQ0EsWUFBSWlLLElBQUl4UixLQUFLMEgsS0FBTCxDQUFXLENBQUNsSCxFQUFFZCxLQUFGLEdBQVU2SCxPQUFPcU0sSUFBbEIsSUFBMEJ2ZCxFQUFFLElBQUYsRUFBUXdULEtBQVIsRUFBMUIsR0FBNEMsS0FBdkQsSUFBOEQsR0FBdEU7QUFDQSxZQUFJNkgsSUFBSTFSLEtBQUswSCxLQUFMLENBQVcsQ0FBQ2xILEVBQUViLEtBQUYsR0FBVTRILE9BQU9ELEdBQWxCLElBQXlCalIsRUFBRSxJQUFGLEVBQVEwZ0IsTUFBUixFQUF6QixHQUE0QyxLQUF2RCxJQUE4RCxHQUF0RTs7QUFFQTFnQixVQUFFLFdBQUYsRUFBZTJXLEdBQWYsQ0FBb0J3RSxJQUFJLEdBQUosR0FBVUUsQ0FBOUI7QUFDSCxLQU5EOztBQVFBcmIsTUFBRyxpQkFBSCxFQUF1QjIrQixLQUF2QixDQUNFLFlBQVc7QUFDVDMrQixVQUFFLGlCQUFGLEVBQXFCeUMsV0FBckIsQ0FBa0MsT0FBbEM7QUFDQSxZQUFJckIsS0FBS3BCLEVBQUUsSUFBRixFQUFRMlMsSUFBUixDQUFhLFFBQWIsQ0FBVDtBQUNBM1MsVUFBRW9CLEVBQUYsRUFBTW1DLFFBQU4sQ0FBZSxPQUFmO0FBQ0QsS0FMSCxFQUtLLFlBQVc7QUFDWnZELFVBQUUsaUJBQUYsRUFBcUJ5QyxXQUFyQixDQUFrQyxPQUFsQztBQUNELEtBUEg7O0FBVUF6QyxNQUFFLHdDQUFGLEVBQTRDMkUsRUFBNUMsQ0FBZ0QsT0FBaEQsRUFBeUQsVUFBU3dGLENBQVQsRUFBWTtBQUNqRTtBQUNILEtBRkQ7O0FBS0FuSyxNQUFFLHdDQUFGLEVBQTRDMkUsRUFBNUMsQ0FBZ0QsT0FBaEQsRUFBeUQsVUFBU3dGLENBQVQsRUFBWTtBQUNqRSxZQUFJL0ksS0FBS3BCLEVBQUUsSUFBRixFQUFRMlMsSUFBUixDQUFhLFFBQWIsQ0FBVDtBQUNBO0FBQ0gsS0FIRDs7QUFNQTNTLE1BQUVzQyxNQUFGLEVBQVVnZSxJQUFWLENBQWUsWUFBVztBQUN0QnRnQixVQUFFLDRDQUFGLEVBQWdEbVIsR0FBaEQsQ0FBb0QsU0FBcEQsRUFBK0QsQ0FBL0Q7QUFDSCxLQUZEO0FBSUgsQ0FyQ0EsRUFxQ0M1USxRQXJDRCxFQXFDVytCLE1BckNYLEVBcUNtQjRGLE1BckNuQixDQUFEOzs7QUNBQyxXQUFVM0gsUUFBVixFQUFvQitCLE1BQXBCLEVBQTRCdEMsQ0FBNUIsRUFBK0I7O0FBRS9COztBQUVBOztBQUNBLEtBQUk0K0IscUJBQXFCNStCLEVBQUUsOENBQUYsQ0FBekI7O0FBRUE0K0Isb0JBQW1CNTdCLElBQW5CLENBQXdCLFlBQVc7O0FBRWxDLE1BQUl5TCxRQUFRek8sRUFBRSxJQUFGLENBQVo7O0FBRUEsTUFBSXlPLE1BQU1rYyxNQUFOLENBQWEsa0JBQWIsRUFBaUMzb0IsTUFBakMsS0FBNEMsQ0FBaEQsRUFBbUQ7QUFDakR5TSxTQUFNbWMsSUFBTixDQUFXLHFDQUFYO0FBQ0Q7O0FBRURuYyxRQUFNNGIsVUFBTixDQUFpQixRQUFqQixFQUEyQkEsVUFBM0IsQ0FBc0MsT0FBdEM7QUFFQyxFQVZGO0FBYUEsQ0FwQkEsRUFvQkM5cEIsUUFwQkQsRUFvQlcrQixNQXBCWCxFQW9CbUI0RixNQXBCbkIsQ0FBRDs7O0FDQUE7QUFDQyxXQUFVM0gsUUFBVixFQUFvQitCLE1BQXBCLEVBQTRCdEMsQ0FBNUIsRUFBK0I7O0FBRS9COztBQUVHQSxNQUFFTyxRQUFGLEVBQVlvRSxFQUFaLENBQWUsT0FBZixFQUF3Qiw0Q0FBeEIsRUFBc0VrNkIsVUFBdEU7O0FBRUEsYUFBU0EsVUFBVCxHQUFzQjtBQUNsQixZQUFJajVCLFFBQVE1RixFQUFFLElBQUYsQ0FBWjtBQUNBLFlBQUk4K0IsVUFBVTkrQixFQUFFLE1BQU00RixNQUFNK00sSUFBTixDQUFXLFFBQVgsQ0FBUixDQUFkO0FBQ0EsWUFBSXNyQixTQUFTaitCLEVBQUUsTUFBTTRGLE1BQU0rTSxJQUFOLENBQVcsTUFBWCxDQUFSLENBQWI7O0FBRUEsWUFBSW1zQixRQUFRZCxJQUFSLEVBQUosRUFBcUI7QUFDbkJoK0IsY0FBRSxZQUFGLEVBQWdCaStCLE1BQWhCLEVBQXlCRyxJQUF6QixDQUE4QlUsUUFBUVYsSUFBUixFQUE5QjtBQUNEO0FBQ0o7O0FBR0RwK0IsTUFBRU8sUUFBRixFQUFZb0UsRUFBWixDQUFlLGtCQUFmLEVBQW1DLFVBQW5DLEVBQStDLFlBQVk7QUFDdkQzRSxVQUFFLElBQUYsRUFBUWtGLElBQVIsQ0FBYSxZQUFiLEVBQTJCd21CLEtBQTNCO0FBQ0E7QUFDQTFyQixVQUFFLGlCQUFGLEVBQXFCeUMsV0FBckIsQ0FBa0MsT0FBbEM7QUFDSCxLQUpEOztBQU9BekMsTUFBRU8sUUFBRixFQUFZb0UsRUFBWixDQUFlLE9BQWYsRUFBd0IsK0NBQXhCLEVBQXlFbzZCLE9BQXpFOztBQUVBLGFBQVNBLE9BQVQsR0FBbUI7QUFDZixZQUFJbjVCLFFBQVE1RixFQUFFLElBQUYsQ0FBWjtBQUNBLFlBQUlnL0IsT0FBT2gvQixFQUFFLE1BQU00RixNQUFNK00sSUFBTixDQUFXLFNBQVgsQ0FBUixDQUFYO0FBQ0EsWUFBSXNyQixTQUFTaitCLEVBQUUsTUFBTTRGLE1BQU0rTSxJQUFOLENBQVcsTUFBWCxDQUFSLENBQWI7O0FBRUEsWUFBSXFzQixLQUFLaEIsSUFBTCxFQUFKLEVBQWtCO0FBQ2hCaCtCLGNBQUUsWUFBRixFQUFnQmkrQixNQUFoQixFQUF5QkcsSUFBekIsQ0FBOEJZLEtBQUtaLElBQUwsRUFBOUI7QUFDRDtBQUNKOztBQUdEcCtCLE1BQUVPLFFBQUYsRUFBWW9FLEVBQVosQ0FBZSxrQkFBZixFQUFtQyxPQUFuQyxFQUE0QyxZQUFZO0FBQ3BEM0UsVUFBRSxJQUFGLEVBQVFrRixJQUFSLENBQWEsWUFBYixFQUEyQndtQixLQUEzQjtBQUNBMXJCLFVBQUUsTUFBRixFQUFVaVksSUFBVixHQUFpQnhWLFdBQWpCLENBQTZCLFFBQTdCLEVBQXVDME8sR0FBdkMsQ0FBMkMsRUFBQyxXQUFVLEdBQVgsRUFBM0M7QUFDQW5SLFVBQUUsUUFBRixFQUFZaVksSUFBWixHQUFtQjlHLEdBQW5CLENBQXVCLEVBQUMsV0FBVSxHQUFYLEVBQXZCO0FBQ0gsS0FKRDs7QUFPQW5SLE1BQUVPLFFBQUYsRUFBWW9FLEVBQVosQ0FBZSxPQUFmLEVBQXdCLHlEQUF4QixFQUFtRnM2QixXQUFuRjs7QUFFQSxhQUFTQSxXQUFULEdBQXVCO0FBQ25CLFlBQUlyNUIsUUFBUTVGLEVBQUUsSUFBRixDQUFaO0FBQ0EsWUFBSWsvQixXQUFXbC9CLEVBQUUsTUFBTTRGLE1BQU0rTSxJQUFOLENBQVcsU0FBWCxDQUFSLENBQWY7QUFDQSxZQUFJc3JCLFNBQVNqK0IsRUFBRSxNQUFNNEYsTUFBTStNLElBQU4sQ0FBVyxNQUFYLENBQVIsQ0FBYjs7QUFFQSxZQUFJdXNCLFNBQVNsQixJQUFULEVBQUosRUFBc0I7QUFDcEJoK0IsY0FBRSxZQUFGLEVBQWdCaStCLE1BQWhCLEVBQXlCRyxJQUF6QixDQUE4QmMsU0FBU2QsSUFBVCxFQUE5QjtBQUNEO0FBQ0o7O0FBR0RwK0IsTUFBRU8sUUFBRixFQUFZb0UsRUFBWixDQUFlLGtCQUFmLEVBQW1DLFdBQW5DLEVBQWdELFlBQVk7QUFDeEQzRSxVQUFFLElBQUYsRUFBUWtGLElBQVIsQ0FBYSxZQUFiLEVBQTJCd21CLEtBQTNCO0FBQ0gsS0FGRDtBQUtILENBOURBLEVBOERDbnJCLFFBOURELEVBOERXK0IsTUE5RFgsRUE4RG1CNEYsTUE5RG5CLENBQUQ7OztBQ0RDLFdBQVUzSCxRQUFWLEVBQW9CK0IsTUFBcEIsRUFBNEJ0QyxDQUE1QixFQUErQjs7QUFFL0I7O0FBRUFBLElBQUVPLFFBQUYsRUFBWW9FLEVBQVosQ0FDSyxnQkFETCxFQUN1QixlQUR2QixFQUN3QyxZQUFZO0FBQzdDM0UsTUFBRSxJQUFGLEVBQVFrRixJQUFSLENBQWEsT0FBYixFQUFzQm9RLEtBQXRCLEdBQThCNEIsS0FBOUI7QUFDRCxHQUhOO0FBTUEsQ0FWQSxFQVVDM1csUUFWRCxFQVVXK0IsTUFWWCxFQVVtQjRGLE1BVm5CLENBQUQ7OztBakJBQyxXQUFVM0gsUUFBVixFQUFvQitCLE1BQXBCLEVBQTRCdEMsQ0FBNUIsRUFBK0I7O0FBRS9COztBQUVHQSxJQUFHLGtDQUFILEVBQXdDaXBCLFdBQXhDLENBQXFELHdCQUFyRDs7QUFFQWpwQixJQUFFLHdCQUFGLEVBQTRCOHBCLEtBQTVCLENBQWtDO0FBQ2hDaEgsVUFBTSxLQUQwQjtBQUVoQ08sY0FBVSxJQUZzQjtBQUdoQ2hQLFdBQU8sR0FIeUI7QUFJaEM0UCxrQkFBYyxDQUprQjtBQUtoQ0Msb0JBQWdCLENBTGdCO0FBTWhDbEMsa0JBQWNoaUIsRUFBRSwrQkFBRixDQU5rQjtBQU9oQzZqQixnQkFBWSxDQUNWO0FBQ0VpSSxrQkFBWSxHQURkO0FBRUVuSyxnQkFBVTtBQUNSc0Msc0JBQWMsQ0FETjtBQUVSQyx3QkFBZ0I7QUFGUjtBQUZaLEtBRFU7QUFQb0IsR0FBbEM7O0FBa0JBbGtCLElBQUcsa0NBQUgsRUFBd0NpcEIsV0FBeEMsQ0FBcUQseUJBQXJEOztBQUVBanBCLElBQUUseUJBQUYsRUFBNkI4cEIsS0FBN0IsQ0FBbUM7QUFDakNoSCxVQUFNLEtBRDJCO0FBRWpDTyxjQUFVLElBRnVCO0FBR2pDaFAsV0FBTyxHQUgwQjtBQUlqQzRQLGtCQUFjLENBSm1CO0FBS2pDQyxvQkFBZ0IsQ0FMaUI7QUFNakNsQyxrQkFBY2hpQixFQUFFLGdDQUFGO0FBTm1CLEdBQW5DOztBQVVBQSxJQUFHLGtDQUFILEVBQXdDaXBCLFdBQXhDLENBQXFELGdDQUFyRDs7QUFFQWpwQixJQUFFLGdDQUFGLEVBQW9DOHBCLEtBQXBDLENBQTBDO0FBQ3RDNUcsVUFBTSxJQURnQztBQUV0Q0osVUFBTSxJQUZnQztBQUd0Q08sY0FBVSxJQUg0QjtBQUl0Q2hQLFdBQU8sR0FKK0I7QUFLdEM0UCxrQkFBYyxDQUx3QjtBQU10Q0Msb0JBQWdCLENBTnNCO0FBT3RDbkMsb0JBQWdCLEtBUHNCO0FBUXRDQyxrQkFBY2hpQixFQUFFLHVDQUFGO0FBUndCLEdBQTFDOztBQVdBQSxJQUFFLCtCQUFGLEVBQW1DMkUsRUFBbkMsQ0FBc0MsT0FBdEMsRUFBOEMsWUFBOUMsRUFBNEQsVUFBU3dGLENBQVQsRUFBVztBQUNuRUEsTUFBRW9LLGNBQUY7QUFDQSxRQUFJbVosYUFBYTF0QixFQUFFLElBQUYsRUFBUTJxQixNQUFSLEdBQWlCeGtCLEtBQWpCLEVBQWpCO0FBQ0FuRyxNQUFHLGdDQUFILEVBQXNDOHBCLEtBQXRDLENBQTZDLFdBQTdDLEVBQTBEMEYsU0FBUzlCLFVBQVQsQ0FBMUQ7QUFDSCxHQUpEOztBQVFBMXRCLElBQUcsNkNBQUgsRUFBbURpcEIsV0FBbkQsQ0FBZ0UsK0JBQWhFOztBQUVBanBCLElBQUUsK0JBQUYsRUFBbUM4cEIsS0FBbkMsQ0FBeUM7QUFDdkNoSCxVQUFNLEtBRGlDO0FBRXZDTyxjQUFVLElBRjZCO0FBR3ZDaFAsV0FBTyxHQUhnQztBQUl2QzRQLGtCQUFjLENBSnlCO0FBS3ZDQyxvQkFBZ0IsQ0FMdUI7QUFNdkNsQyxrQkFBY2hpQixFQUFFLHNDQUFGLENBTnlCO0FBT3ZDNmpCLGdCQUFZLENBQ1Y7QUFDRWlJLGtCQUFZLElBRGQ7QUFFRW5LLGdCQUFVO0FBQ1JzQyxzQkFBYyxDQUROO0FBRVJDLHdCQUFnQjtBQUZSO0FBRlosS0FEVSxFQVFWO0FBQ0U0SCxrQkFBWSxHQURkO0FBRUVuSyxnQkFBVTtBQUNSc0Msc0JBQWMsQ0FETjtBQUVSQyx3QkFBZ0I7QUFGUjtBQUZaLEtBUlUsRUFlVjtBQUNFNEgsa0JBQVksR0FEZDtBQUVFbkssZ0JBQVU7QUFDUnNDLHNCQUFjLENBRE47QUFFUkMsd0JBQWdCO0FBRlI7QUFLWjtBQUNBO0FBQ0E7QUFUQSxLQWZVO0FBUDJCLEdBQXpDOztBQW1DQWxrQixJQUFHLGtDQUFILEVBQXdDaXBCLFdBQXhDLENBQXFELDhCQUFyRDtBQUNBanBCLElBQUUsOEJBQUYsRUFBa0M4cEIsS0FBbEMsQ0FBd0M7QUFDdENoSCxVQUFNLEtBRGdDO0FBRXRDWixZQUFRLElBRjhCO0FBR3RDbUIsY0FBVSxJQUg0QjtBQUl0Q2hQLFdBQU8sR0FKK0I7QUFLdEM0UCxrQkFBYyxDQUx3QjtBQU10Q0Msb0JBQWdCLENBTnNCO0FBT3RDbEMsa0JBQWNoaUIsRUFBRSxxQ0FBRjtBQVB3QixHQUF4QztBQVVILENBekdBLEVBeUdDTyxRQXpHRCxFQXlHVytCLE1BekdYLEVBeUdtQjRGLE1BekduQixDQUFEOzs7QWtCQUMsV0FBVTNILFFBQVYsRUFBb0IrQixNQUFwQixFQUE0QnRDLENBQTVCLEVBQStCOztBQUUvQjs7QUFFRyxhQUFTbS9CLGdCQUFULENBQTJCLzZCLElBQTNCLEVBQWtDOztBQUU5QixZQUFJUixzQkFBc0IsYUFBMUI7QUFBQSxZQUNORSxzQkFBc0IseUJBRGhCOztBQUdBOUQsVUFBR29FLE9BQU8sSUFBUCxHQUFjUixtQkFBZCxHQUFvQyxHQUFwQyxHQUEwQ1EsSUFBMUMsR0FBaUQsSUFBakQsR0FBd0ROLG1CQUF4RCxHQUE4RSxtQkFBakYsRUFDSnJCLFdBREksQ0FDUyxXQURULEVBRUo4QyxJQUZJLENBRUUsZUFGRixFQUVtQixLQUZuQixFQUdKQSxJQUhJLENBR0UsY0FIRixFQUdrQixLQUhsQjs7QUFLTnZGLFVBQUdvRSxPQUFPLElBQVAsR0FBY04sbUJBQWQsR0FBb0MsR0FBcEMsR0FBMENNLElBQTFDLEdBQWlELElBQWpELEdBQXdETixtQkFBeEQsR0FBOEUsWUFBakYsRUFDRXlCLElBREYsQ0FDUSxPQURSLEVBQ2lCLEVBRGpCO0FBRUc7O0FBRUQsUUFBSTY1QixZQUFZLFNBQVpBLFNBQVksQ0FBU2oxQixDQUFULEVBQVk7O0FBRXhCLFlBQUlsSixNQUFKOztBQUVBO0FBQ0EsWUFBSWtKLENBQUosRUFBTztBQUNIQSxjQUFFb0ssY0FBRjtBQUNBdFQscUJBQVMsS0FBS3dWLElBQWQ7QUFDSDtBQUNEO0FBSkEsYUFLSztBQUNEeFYseUJBQVNpVixTQUFTTyxJQUFsQjtBQUNIOztBQUVEO0FBQ0F6VyxVQUFFb1YsWUFBRixDQUFlO0FBQ1hwQiwwQkFBYy9TLE1BREg7QUFFWGlULDBCQUFjLHdCQUFXO0FBQ3JCbFUsa0JBQUUsY0FBRixFQUFrQnlDLFdBQWxCLENBQThCLHVCQUE5QjtBQUNILGFBSlU7QUFLWDBSLHlCQUFhLHVCQUFXO0FBQ3BCblUsa0JBQUUsY0FBRixFQUFrQnlDLFdBQWxCLENBQThCLHVCQUE5QjtBQUNBLG9CQUFHekMsRUFBRWlCLE1BQUYsRUFBVXl1QixRQUFWLENBQW1CLGFBQW5CLENBQUgsRUFBdUM7QUFDbkMxdkIsc0JBQUVpQixNQUFGLEVBQVVpRSxJQUFWLENBQWUsU0FBZixFQUEwQm9VLE9BQTFCLENBQWtDLE9BQWxDO0FBQ0g7QUFDSjs7QUFWVSxTQUFmO0FBYUgsS0E1QkQ7O0FBOEJBO0FBQ0EsUUFBSXBELFNBQVNPLElBQWIsRUFBbUI7QUFDZnpXLFVBQUUsWUFBRixFQUFnQnNTLFNBQWhCLENBQTBCLENBQTFCLEVBQTZCL0wsSUFBN0I7QUFDQTtBQUNBNjRCO0FBQ0g7O0FBRUQ7QUFDQXAvQixNQUFFLHVCQUFGLEVBQTJCZ0QsSUFBM0IsQ0FBZ0MsWUFBVTtBQUN0QztBQUNBLFlBQUksS0FBS21ULFFBQUwsQ0FBYzNTLE9BQWQsQ0FBc0IsS0FBdEIsRUFBNEIsRUFBNUIsTUFBb0MwUyxTQUFTQyxRQUFULENBQWtCM1MsT0FBbEIsQ0FBMEIsS0FBMUIsRUFBZ0MsRUFBaEMsQ0FBcEMsSUFBMkUsS0FBSzhTLFFBQUwsS0FBa0JKLFNBQVNJLFFBQTFHLEVBQW9IO0FBQ2hIO0FBQ0F0VyxjQUFFLElBQUYsRUFBUXVGLElBQVIsQ0FBYSxNQUFiLEVBQXFCLEtBQUtrUixJQUExQjtBQUNIO0FBQ0osS0FORDs7QUFRQTtBQUNBO0FBQ0F6VyxNQUFFLE1BQUYsRUFBVTJFLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLDBCQUF0QixFQUFrRHk2QixTQUFsRDtBQUVILENBcEVBLEVBb0VDNytCLFFBcEVELEVBb0VXK0IsTUFwRVgsRUFvRW1CNEYsTUFwRW5CLENBQUQ7OztBakJBQyxXQUFVM0gsUUFBVixFQUFvQitCLE1BQXBCLEVBQTRCdEMsQ0FBNUIsRUFBK0I7O0FBRS9COztBQUVBQSxTQUFFLGVBQUYsRUFBbUIrRyxTQUFuQixDQUE2QjtBQUN0QmtELHFCQUFNLEdBRGdCO0FBRXRCO0FBQ0FvMUIsMkJBQVksQ0FBQztBQUhTLFFBQTdCO0FBT0EsQ0FYQSxFQVdDOStCLFFBWEQsRUFXVytCLE1BWFgsRUFXbUI0RixNQVhuQixDQUFEIiwiZmlsZSI6InByb2plY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBodHRwczovL2VkZW5zcGlla2VybWFubi5naXRodWIuaW8vYTExeS10b2dnbGUvXG5cbihmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgaW50ZXJuYWxJZCA9IDA7XG4gIHZhciB0b2dnbGVzTWFwID0ge307XG4gIHZhciB0YXJnZXRzTWFwID0ge307XG5cbiAgZnVuY3Rpb24gJCAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoXG4gICAgICAoY29udGV4dCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q2xvc2VzdFRvZ2dsZSAoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50LmNsb3Nlc3QpIHtcbiAgICAgIHJldHVybiBlbGVtZW50LmNsb3Nlc3QoJ1tkYXRhLWExMXktdG9nZ2xlXScpO1xuICAgIH1cblxuICAgIHdoaWxlIChlbGVtZW50KSB7XG4gICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMSAmJiBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZScpKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgfVxuXG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlVG9nZ2xlICh0b2dnbGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdG9nZ2xlICYmIHRhcmdldHNNYXBbdG9nZ2xlLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpXTtcblxuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHRvZ2dsZXMgPSB0b2dnbGVzTWFwWycjJyArIHRhcmdldC5pZF07XG4gICAgdmFyIGlzRXhwYW5kZWQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicpID09PSAnZmFsc2UnO1xuXG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCBpc0V4cGFuZGVkKTtcbiAgICB0b2dnbGVzLmZvckVhY2goZnVuY3Rpb24gKHRvZ2dsZSkge1xuICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICFpc0V4cGFuZGVkKTtcbiAgICAgIGlmKCFpc0V4cGFuZGVkKSB7XG4gICAgICAgIGlmKHRvZ2dsZS5oYXNBdHRyaWJ1dGUoJ2RhdGEtYTExeS10b2dnbGUtbGVzcycpKSB7XG4gICAgICAgICAgICB0b2dnbGUuaW5uZXJIVE1MID0gdG9nZ2xlLmdldEF0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZS1sZXNzJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKHRvZ2dsZS5oYXNBdHRyaWJ1dGUoJ2RhdGEtYTExeS10b2dnbGUtbW9yZScpKSB7XG4gICAgICAgICAgICB0b2dnbGUuaW5uZXJIVE1MID0gdG9nZ2xlLmdldEF0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZS1tb3JlJyk7XG4gICAgICAgIH1cbiAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdmFyIGluaXRBMTF5VG9nZ2xlID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICB0b2dnbGVzTWFwID0gJCgnW2RhdGEtYTExeS10b2dnbGVdJywgY29udGV4dCkucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHRvZ2dsZSkge1xuICAgICAgdmFyIHNlbGVjdG9yID0gJyMnICsgdG9nZ2xlLmdldEF0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZScpO1xuICAgICAgYWNjW3NlbGVjdG9yXSA9IGFjY1tzZWxlY3Rvcl0gfHwgW107XG4gICAgICBhY2Nbc2VsZWN0b3JdLnB1c2godG9nZ2xlKTtcbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgdG9nZ2xlc01hcCk7XG5cbiAgICB2YXIgdGFyZ2V0cyA9IE9iamVjdC5rZXlzKHRvZ2dsZXNNYXApO1xuICAgIHRhcmdldHMubGVuZ3RoICYmICQodGFyZ2V0cykuZm9yRWFjaChmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICB2YXIgdG9nZ2xlcyA9IHRvZ2dsZXNNYXBbJyMnICsgdGFyZ2V0LmlkXTtcbiAgICAgIHZhciBpc0V4cGFuZGVkID0gdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZS1vcGVuJyk7XG4gICAgICB2YXIgbGFiZWxsZWRieSA9IFtdO1xuXG4gICAgICB0b2dnbGVzLmZvckVhY2goZnVuY3Rpb24gKHRvZ2dsZSkge1xuICAgICAgICB0b2dnbGUuaWQgfHwgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnaWQnLCAnYTExeS10b2dnbGUtJyArIGludGVybmFsSWQrKyk7XG4gICAgICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnLCB0YXJnZXQuaWQpO1xuICAgICAgICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgaXNFeHBhbmRlZCk7ICAgICAgICBcbiAgICAgICAgbGFiZWxsZWRieS5wdXNoKHRvZ2dsZS5pZCk7XG4gICAgICB9KTtcblxuICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAhaXNFeHBhbmRlZCk7XG4gICAgICB0YXJnZXQuaGFzQXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknKSB8fCB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCBsYWJlbGxlZGJ5LmpvaW4oJyAnKSk7XG5cbiAgICAgIHRhcmdldHNNYXBbdGFyZ2V0LmlkXSA9IHRhcmdldDtcbiAgICB9KTtcbiAgfTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIGluaXRBMTF5VG9nZ2xlKCk7XG4gIH0pO1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIHRvZ2dsZSA9IGdldENsb3Nlc3RUb2dnbGUoZXZlbnQudGFyZ2V0KTtcbiAgICBoYW5kbGVUb2dnbGUodG9nZ2xlKTtcbiAgfSk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEzIHx8IGV2ZW50LndoaWNoID09PSAzMikge1xuICAgICAgdmFyIHRvZ2dsZSA9IGdldENsb3Nlc3RUb2dnbGUoZXZlbnQudGFyZ2V0KTtcbiAgICAgIGlmICh0b2dnbGUgJiYgdG9nZ2xlLmdldEF0dHJpYnV0ZSgncm9sZScpID09PSAnYnV0dG9uJykge1xuICAgICAgICBoYW5kbGVUb2dnbGUodG9nZ2xlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHdpbmRvdyAmJiAod2luZG93LmExMXlUb2dnbGUgPSBpbml0QTExeVRvZ2dsZSk7XG59KSgpO1xuIiwiLyoqXG4gKiBUaGlzIHNjcmlwdCBhZGRzIHRoZSBhY2Nlc3NpYmlsaXR5LXJlYWR5IHJlc3BvbnNpdmUgbWVudXMgR2VuZXNpcyBGcmFtZXdvcmsgY2hpbGQgdGhlbWVzLlxuICpcbiAqIEBhdXRob3IgU3R1ZGlvUHJlc3NcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9jb3B5YmxvZ2dlci9yZXNwb25zaXZlLW1lbnVzXG4gKiBAdmVyc2lvbiAxLjEuM1xuICogQGxpY2Vuc2UgR1BMLTIuMCtcbiAqL1xuXG4oIGZ1bmN0aW9uICggZG9jdW1lbnQsICQsIHVuZGVmaW5lZCApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0JCgnYm9keScpLnJlbW92ZUNsYXNzKCduby1qcycpO1xuXG5cdHZhciBnZW5lc2lzTWVudVBhcmFtcyAgICAgID0gdHlwZW9mIGdlbmVzaXNfcmVzcG9uc2l2ZV9tZW51ID09PSAndW5kZWZpbmVkJyA/ICcnIDogZ2VuZXNpc19yZXNwb25zaXZlX21lbnUsXG5cdFx0Z2VuZXNpc01lbnVzVW5jaGVja2VkICA9IGdlbmVzaXNNZW51UGFyYW1zLm1lbnVDbGFzc2VzLFxuXHRcdGdlbmVzaXNNZW51cyAgICAgICAgICAgPSB7fSxcblx0XHRtZW51c1RvQ29tYmluZSAgICAgICAgID0gW107XG5cblx0LyoqXG5cdCAqIFZhbGlkYXRlIHRoZSBtZW51cyBwYXNzZWQgYnkgdGhlIHRoZW1lIHdpdGggd2hhdCdzIGJlaW5nIGxvYWRlZCBvbiB0aGUgcGFnZSxcblx0ICogYW5kIHBhc3MgdGhlIG5ldyBhbmQgYWNjdXJhdGUgaW5mb3JtYXRpb24gdG8gb3VyIG5ldyBkYXRhLlxuXHQgKiBAcGFyYW0ge2dlbmVzaXNNZW51c1VuY2hlY2tlZH0gUmF3IGRhdGEgZnJvbSB0aGUgbG9jYWxpemVkIHNjcmlwdCBpbiB0aGUgdGhlbWUuXG5cdCAqIEByZXR1cm4ge2FycmF5fSBnZW5lc2lzTWVudXMgYXJyYXkgZ2V0cyBwb3B1bGF0ZWQgd2l0aCB1cGRhdGVkIGRhdGEuXG5cdCAqIEByZXR1cm4ge2FycmF5fSBtZW51c1RvQ29tYmluZSBhcnJheSBnZXRzIHBvcHVsYXRlZCB3aXRoIHJlbGV2YW50IGRhdGEuXG5cdCAqL1xuXHQkLmVhY2goIGdlbmVzaXNNZW51c1VuY2hlY2tlZCwgZnVuY3Rpb24oIGdyb3VwICkge1xuXG5cdFx0Ly8gTWlycm9yIG91ciBncm91cCBvYmplY3QgdG8gcG9wdWxhdGUuXG5cdFx0Z2VuZXNpc01lbnVzW2dyb3VwXSA9IFtdO1xuXG5cdFx0Ly8gTG9vcCB0aHJvdWdoIGVhY2ggaW5zdGFuY2Ugb2YgdGhlIHNwZWNpZmllZCBtZW51IG9uIHRoZSBwYWdlLlxuXHRcdCQuZWFjaCggdGhpcywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cblx0XHRcdHZhciBtZW51U3RyaW5nID0gdmFsdWUsXG5cdFx0XHRcdCRtZW51ICAgICAgPSAkKHZhbHVlKTtcblxuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgbW9yZSB0aGFuIG9uZSBpbnN0YW5jZSwgYXBwZW5kIHRoZSBpbmRleCBhbmQgdXBkYXRlIGFycmF5LlxuXHRcdFx0aWYgKCAkbWVudS5sZW5ndGggPiAxICkge1xuXG5cdFx0XHRcdCQuZWFjaCggJG1lbnUsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXG5cdFx0XHRcdFx0dmFyIG5ld1N0cmluZyA9IG1lbnVTdHJpbmcgKyAnLScgKyBrZXk7XG5cblx0XHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKCBuZXdTdHJpbmcucmVwbGFjZSgnLicsJycpICk7XG5cblx0XHRcdFx0XHRnZW5lc2lzTWVudXNbZ3JvdXBdLnB1c2goIG5ld1N0cmluZyApO1xuXG5cdFx0XHRcdFx0aWYgKCAnY29tYmluZScgPT09IGdyb3VwICkge1xuXHRcdFx0XHRcdFx0bWVudXNUb0NvbWJpbmUucHVzaCggbmV3U3RyaW5nICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCAkbWVudS5sZW5ndGggPT0gMSApIHtcblxuXHRcdFx0XHRnZW5lc2lzTWVudXNbZ3JvdXBdLnB1c2goIG1lbnVTdHJpbmcgKTtcblxuXHRcdFx0XHRpZiAoICdjb21iaW5lJyA9PT0gZ3JvdXAgKSB7XG5cdFx0XHRcdFx0bWVudXNUb0NvbWJpbmUucHVzaCggbWVudVN0cmluZyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cdH0pO1xuXG5cdC8vIE1ha2Ugc3VyZSB0aGVyZSBpcyBzb21ldGhpbmcgdG8gdXNlIGZvciB0aGUgJ290aGVycycgYXJyYXkuXG5cdGlmICggdHlwZW9mIGdlbmVzaXNNZW51cy5vdGhlcnMgPT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0Z2VuZXNpc01lbnVzLm90aGVycyA9IFtdO1xuXHR9XG5cblx0Ly8gSWYgdGhlcmUncyBvbmx5IG9uZSBtZW51IG9uIHRoZSBwYWdlIGZvciBjb21iaW5pbmcsIHB1c2ggaXQgdG8gdGhlICdvdGhlcnMnIGFycmF5IGFuZCBudWxsaWZ5IG91ciAnY29tYmluZScgdmFyaWFibGUuXG5cdGlmICggbWVudXNUb0NvbWJpbmUubGVuZ3RoID09IDEgKSB7XG5cdFx0Z2VuZXNpc01lbnVzLm90aGVycy5wdXNoKCBtZW51c1RvQ29tYmluZVswXSApO1xuXHRcdGdlbmVzaXNNZW51cy5jb21iaW5lID0gbnVsbDtcblx0XHRtZW51c1RvQ29tYmluZSA9IG51bGw7XG5cdH1cblxuXHR2YXIgZ2VuZXNpc01lbnUgICAgICAgICA9IHt9LFxuXHRcdG1haW5NZW51QnV0dG9uQ2xhc3MgPSAnbWVudS10b2dnbGUnLFxuXHRcdHN1Yk1lbnVCdXR0b25DbGFzcyAgPSAnc3ViLW1lbnUtdG9nZ2xlJyxcblx0XHRyZXNwb25zaXZlTWVudUNsYXNzID0gJ2dlbmVzaXMtcmVzcG9uc2l2ZS1tZW51JztcblxuXHQvLyBJbml0aWFsaXplLlxuXHRnZW5lc2lzTWVudS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBFeGl0IGVhcmx5IGlmIHRoZXJlIGFyZSBubyBtZW51cyB0byBkbyBhbnl0aGluZy5cblx0XHRpZiAoICQoIF9nZXRBbGxNZW51c0FycmF5KCkgKS5sZW5ndGggPT0gMCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgbWVudUljb25DbGFzcyAgICAgPSB0eXBlb2YgZ2VuZXNpc01lbnVQYXJhbXMubWVudUljb25DbGFzcyAhPT0gJ3VuZGVmaW5lZCcgPyBnZW5lc2lzTWVudVBhcmFtcy5tZW51SWNvbkNsYXNzIDogJ2Rhc2hpY29ucy1iZWZvcmUgZGFzaGljb25zLW1lbnUnLFxuXHRcdFx0c3ViTWVudUljb25DbGFzcyAgPSB0eXBlb2YgZ2VuZXNpc01lbnVQYXJhbXMuc3ViTWVudUljb25DbGFzcyAhPT0gJ3VuZGVmaW5lZCcgPyBnZW5lc2lzTWVudVBhcmFtcy5zdWJNZW51SWNvbkNsYXNzIDogJ2Rhc2hpY29ucy1iZWZvcmUgZGFzaGljb25zLWFycm93LWRvd24tYWx0MicsXG5cdFx0XHR0b2dnbGVCdXR0b25zICAgICA9IHtcblx0XHRcdFx0bWVudSA6ICQoICc8YnV0dG9uIC8+Jywge1xuXHRcdFx0XHRcdCdjbGFzcycgOiBtYWluTWVudUJ1dHRvbkNsYXNzLFxuXHRcdFx0XHRcdCdhcmlhLWV4cGFuZGVkJyA6IGZhbHNlLFxuXHRcdFx0XHRcdCdhcmlhLXByZXNzZWQnIDogZmFsc2UsXG5cdFx0XHRcdFx0J3JvbGUnXHRcdFx0OiAnYnV0dG9uJyxcblx0XHRcdFx0XHR9IClcblx0XHRcdFx0XHQuYXBwZW5kKCAkKCAnPHNwYW4gLz4nLCB7XG5cdFx0XHRcdFx0XHQnY2xhc3MnIDogJ3NjcmVlbi1yZWFkZXItdGV4dCcsXG5cdFx0XHRcdFx0XHQndGV4dCcgOiBnZW5lc2lzTWVudVBhcmFtcy5tYWluTWVudVxuXHRcdFx0XHRcdH0gKSApLFxuXHRcdFx0XHRzdWJtZW51IDogJCggJzxidXR0b24gLz4nLCB7XG5cdFx0XHRcdFx0J2NsYXNzJyA6IHN1Yk1lbnVCdXR0b25DbGFzcyxcblx0XHRcdFx0XHQnYXJpYS1leHBhbmRlZCcgOiBmYWxzZSxcblx0XHRcdFx0XHQnYXJpYS1wcmVzc2VkJyAgOiBmYWxzZSxcblx0XHRcdFx0XHQndGV4dCdcdFx0XHQ6ICcnXG5cdFx0XHRcdFx0fSApXG5cdFx0XHRcdFx0LmFwcGVuZCggJCggJzxzcGFuIC8+Jywge1xuXHRcdFx0XHRcdFx0J2NsYXNzJyA6ICdzY3JlZW4tcmVhZGVyLXRleHQnLFxuXHRcdFx0XHRcdFx0J3RleHQnIDogZ2VuZXNpc01lbnVQYXJhbXMuc3ViTWVudVxuXHRcdFx0XHRcdH0gKSApXG5cdFx0XHR9O1xuXG5cdFx0Ly8gQWRkIHRoZSByZXNwb25zaXZlIG1lbnUgY2xhc3MgdG8gdGhlIGFjdGl2ZSBtZW51cy5cblx0XHRfYWRkUmVzcG9uc2l2ZU1lbnVDbGFzcygpO1xuXG5cdFx0Ly8gQWRkIHRoZSBtYWluIG5hdiBidXR0b24gdG8gdGhlIHByaW1hcnkgbWVudSwgb3IgZXhpdCB0aGUgcGx1Z2luLlxuXHRcdF9hZGRNZW51QnV0dG9ucyggdG9nZ2xlQnV0dG9ucyApO1xuXG5cdFx0Ly8gU2V0dXAgYWRkaXRpb25hbCBjbGFzc2VzLlxuXHRcdCQoICcuJyArIG1haW5NZW51QnV0dG9uQ2xhc3MgKS5hZGRDbGFzcyggbWVudUljb25DbGFzcyApO1xuXHRcdCQoICcuJyArIHN1Yk1lbnVCdXR0b25DbGFzcyApLmFkZENsYXNzKCBzdWJNZW51SWNvbkNsYXNzICk7XG5cdFx0JCggJy4nICsgbWFpbk1lbnVCdXR0b25DbGFzcyApLm9uKCAnY2xpY2suZ2VuZXNpc01lbnUtbWFpbmJ1dHRvbicsIF9tYWlubWVudVRvZ2dsZSApLmVhY2goIF9hZGRDbGFzc0lEICk7XG5cdFx0JCggJy4nICsgc3ViTWVudUJ1dHRvbkNsYXNzICkub24oICdjbGljay5nZW5lc2lzTWVudS1zdWJidXR0b24nLCBfc3VibWVudVRvZ2dsZSApO1xuXHRcdCQoIHdpbmRvdyApLm9uKCAncmVzaXplLmdlbmVzaXNNZW51JywgX2RvUmVzaXplICkudHJpZ2dlckhhbmRsZXIoICdyZXNpemUuZ2VuZXNpc01lbnUnICk7XG5cdH07XG5cblx0LyoqXG5cdCAqIEFkZCBtZW51IHRvZ2dsZSBidXR0b24gdG8gYXBwcm9wcmlhdGUgbWVudXMuXG5cdCAqIEBwYXJhbSB7dG9nZ2xlQnV0dG9uc30gT2JqZWN0IG9mIG1lbnUgYnV0dG9ucyB0byB1c2UgZm9yIHRvZ2dsZXMuXG5cdCAqL1xuXHRmdW5jdGlvbiBfYWRkTWVudUJ1dHRvbnMoIHRvZ2dsZUJ1dHRvbnMgKSB7XG5cblx0XHQvLyBBcHBseSBzdWIgbWVudSB0b2dnbGUgdG8gZWFjaCBzdWItbWVudSBmb3VuZCBpbiB0aGUgbWVudUxpc3QuXG5cdFx0JCggX2dldE1lbnVTZWxlY3RvclN0cmluZyggZ2VuZXNpc01lbnVzICkgKS5maW5kKCAnLnN1Yi1tZW51JyApLmJlZm9yZSggdG9nZ2xlQnV0dG9ucy5zdWJtZW51ICk7XG5cblxuXHRcdGlmICggbWVudXNUb0NvbWJpbmUgIT09IG51bGwgKSB7XG5cblx0XHRcdHZhciBtZW51c1RvVG9nZ2xlID0gZ2VuZXNpc01lbnVzLm90aGVycy5jb25jYXQoIG1lbnVzVG9Db21iaW5lWzBdICk7XG5cblx0XHQgXHQvLyBPbmx5IGFkZCBtZW51IGJ1dHRvbiB0aGUgcHJpbWFyeSBtZW51IGFuZCBuYXZzIE5PVCBpbiB0aGUgY29tYmluZSB2YXJpYWJsZS5cblx0XHQgXHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBtZW51c1RvVG9nZ2xlICkgKS5iZWZvcmUoIHRvZ2dsZUJ1dHRvbnMubWVudSApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gQXBwbHkgdGhlIG1haW4gbWVudSB0b2dnbGUgdG8gYWxsIG1lbnVzIGluIHRoZSBsaXN0LlxuXHRcdFx0JCggX2dldE1lbnVTZWxlY3RvclN0cmluZyggZ2VuZXNpc01lbnVzLm90aGVycyApICkuYmVmb3JlKCB0b2dnbGVCdXR0b25zLm1lbnUgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCB0aGUgcmVzcG9uc2l2ZSBtZW51IGNsYXNzLlxuXHQgKi9cblx0ZnVuY3Rpb24gX2FkZFJlc3BvbnNpdmVNZW51Q2xhc3MoKSB7XG5cdFx0JCggX2dldE1lbnVTZWxlY3RvclN0cmluZyggZ2VuZXNpc01lbnVzICkgKS5hZGRDbGFzcyggcmVzcG9uc2l2ZU1lbnVDbGFzcyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV4ZWN1dGUgb3VyIHJlc3BvbnNpdmUgbWVudSBmdW5jdGlvbnMgb24gd2luZG93IHJlc2l6aW5nLlxuXHQgKi9cblx0ZnVuY3Rpb24gX2RvUmVzaXplKCkge1xuXHRcdHZhciBidXR0b25zICAgPSAkKCAnYnV0dG9uW2lkXj1cImdlbmVzaXMtbW9iaWxlLVwiXScgKS5hdHRyKCAnaWQnICk7XG5cdFx0aWYgKCB0eXBlb2YgYnV0dG9ucyA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdF9tYXliZUNsb3NlKCBidXR0b25zICk7XG5cdFx0X3N1cGVyZmlzaFRvZ2dsZSggYnV0dG9ucyApO1xuXHRcdF9jaGFuZ2VTa2lwTGluayggYnV0dG9ucyApO1xuXHRcdF9jb21iaW5lTWVudXMoIGJ1dHRvbnMgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgdGhlIG5hdi0gY2xhc3Mgb2YgdGhlIHJlbGF0ZWQgbmF2aWdhdGlvbiBtZW51IGFzXG5cdCAqIGFuIElEIHRvIGFzc29jaWF0ZWQgYnV0dG9uIChoZWxwcyB0YXJnZXQgc3BlY2lmaWMgYnV0dG9ucyBvdXRzaWRlIG9mIGNvbnRleHQpLlxuXHQgKi9cblx0ZnVuY3Rpb24gX2FkZENsYXNzSUQoKSB7XG5cdFx0dmFyICR0aGlzID0gJCggdGhpcyApLFxuXHRcdFx0bmF2ICAgPSAkdGhpcy5uZXh0KCAnbmF2JyApLFxuXHRcdFx0aWQgICAgPSAnY2xhc3MnO1xuXG5cdFx0JHRoaXMuYXR0ciggJ2lkJywgJ2dlbmVzaXMtbW9iaWxlLScgKyAkKCBuYXYgKS5hdHRyKCBpZCApLm1hdGNoKCAvbmF2LVxcdypcXGIvICkgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb21iaW5lIG91ciBtZW51cyBpZiB0aGUgbW9iaWxlIG1lbnUgaXMgdmlzaWJsZS5cblx0ICogQHBhcmFtcyBidXR0b25zXG5cdCAqL1xuXHRmdW5jdGlvbiBfY29tYmluZU1lbnVzKCBidXR0b25zICl7XG5cblx0XHQvLyBFeGl0IGVhcmx5IGlmIHRoZXJlIGFyZSBubyBtZW51cyB0byBjb21iaW5lLlxuXHRcdGlmICggbWVudXNUb0NvbWJpbmUgPT0gbnVsbCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBTcGxpdCB1cCB0aGUgbWVudXMgdG8gY29tYmluZSBiYXNlZCBvbiBvcmRlciBvZiBhcHBlYXJhbmNlIGluIHRoZSBhcnJheS5cblx0XHR2YXIgcHJpbWFyeU1lbnUgICA9IG1lbnVzVG9Db21iaW5lWzBdLFxuXHRcdFx0Y29tYmluZWRNZW51cyA9ICQoIG1lbnVzVG9Db21iaW5lICkuZmlsdGVyKCBmdW5jdGlvbihpbmRleCkgeyBpZiAoIGluZGV4ID4gMCApIHsgcmV0dXJuIGluZGV4OyB9IH0pO1xuXG5cdFx0Ly8gSWYgdGhlIHJlc3BvbnNpdmUgbWVudSBpcyBhY3RpdmUsIGFwcGVuZCBpdGVtcyBpbiAnY29tYmluZWRNZW51cycgb2JqZWN0IHRvIHRoZSAncHJpbWFyeU1lbnUnIG9iamVjdC5cblx0XHRpZiAoICdub25lJyAhPT0gX2dldERpc3BsYXlWYWx1ZSggYnV0dG9ucyApICkge1xuXG5cdFx0XHQkLmVhY2goIGNvbWJpbmVkTWVudXMsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdFx0XHQkKHZhbHVlKS5maW5kKCAnLm1lbnUgPiBsaScgKS5hZGRDbGFzcyggJ21vdmVkLWl0ZW0tJyArIHZhbHVlLnJlcGxhY2UoICcuJywnJyApICkuYXBwZW5kVG8oIHByaW1hcnlNZW51ICsgJyB1bC5nZW5lc2lzLW5hdi1tZW51JyApO1xuXHRcdFx0fSk7XG5cdFx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBjb21iaW5lZE1lbnVzICkgKS5oaWRlKCk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBjb21iaW5lZE1lbnVzICkgKS5zaG93KCk7XG5cdFx0XHQkLmVhY2goIGNvbWJpbmVkTWVudXMsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdFx0XHQkKCAnLm1vdmVkLWl0ZW0tJyArIHZhbHVlLnJlcGxhY2UoICcuJywnJyApICkuYXBwZW5kVG8oIHZhbHVlICsgJyB1bC5nZW5lc2lzLW5hdi1tZW51JyApLnJlbW92ZUNsYXNzKCAnbW92ZWQtaXRlbS0nICsgdmFsdWUucmVwbGFjZSggJy4nLCcnICkgKTtcblx0XHRcdH0pO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQWN0aW9uIHRvIGhhcHBlbiB3aGVuIHRoZSBtYWluIG1lbnUgYnV0dG9uIGlzIGNsaWNrZWQuXG5cdCAqL1xuXHRmdW5jdGlvbiBfbWFpbm1lbnVUb2dnbGUoKSB7XG5cdFx0dmFyICR0aGlzID0gJCggdGhpcyApO1xuXHRcdF90b2dnbGVBcmlhKCAkdGhpcywgJ2FyaWEtcHJlc3NlZCcgKTtcblx0XHRfdG9nZ2xlQXJpYSggJHRoaXMsICdhcmlhLWV4cGFuZGVkJyApO1xuXHRcdCR0aGlzLnRvZ2dsZUNsYXNzKCAnYWN0aXZhdGVkJyApO1xuXHRcdCR0aGlzLm5leHQoICduYXYnICkuc2xpZGVUb2dnbGUoICdmYXN0JyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFjdGlvbiBmb3Igc3VibWVudSB0b2dnbGVzLlxuXHQgKi9cblx0ZnVuY3Rpb24gX3N1Ym1lbnVUb2dnbGUoKSB7XG5cblx0XHR2YXIgJHRoaXMgID0gJCggdGhpcyApLFxuXHRcdFx0b3RoZXJzID0gJHRoaXMuY2xvc2VzdCggJy5tZW51LWl0ZW0nICkuc2libGluZ3MoKTtcblx0XHRfdG9nZ2xlQXJpYSggJHRoaXMsICdhcmlhLXByZXNzZWQnICk7XG5cdFx0X3RvZ2dsZUFyaWEoICR0aGlzLCAnYXJpYS1leHBhbmRlZCcgKTtcblx0XHQkdGhpcy50b2dnbGVDbGFzcyggJ2FjdGl2YXRlZCcgKTtcblx0XHQkdGhpcy5uZXh0KCAnLnN1Yi1tZW51JyApLnNsaWRlVG9nZ2xlKCAnZmFzdCcgKTtcblxuXHRcdG90aGVycy5maW5kKCAnLicgKyBzdWJNZW51QnV0dG9uQ2xhc3MgKS5yZW1vdmVDbGFzcyggJ2FjdGl2YXRlZCcgKS5hdHRyKCAnYXJpYS1wcmVzc2VkJywgJ2ZhbHNlJyApO1xuXHRcdG90aGVycy5maW5kKCAnLnN1Yi1tZW51JyApLnNsaWRlVXAoICdmYXN0JyApO1xuXG5cdH1cblxuXHQvKipcblx0ICogQWN0aXZhdGUvZGVhY3RpdmF0ZSBzdXBlcmZpc2guXG5cdCAqIEBwYXJhbXMgYnV0dG9uc1xuXHQgKi9cblx0ZnVuY3Rpb24gX3N1cGVyZmlzaFRvZ2dsZSggYnV0dG9ucyApIHtcblx0XHR2YXIgX3N1cGVyZmlzaCA9ICQoICcuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnIC5qcy1zdXBlcmZpc2gnICksXG5cdFx0XHQkYXJncyAgICAgID0gJ2Rlc3Ryb3knO1xuXHRcdGlmICggdHlwZW9mIF9zdXBlcmZpc2guc3VwZXJmaXNoICE9PSAnZnVuY3Rpb24nICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoICdub25lJyA9PT0gX2dldERpc3BsYXlWYWx1ZSggYnV0dG9ucyApICkge1xuXHRcdFx0JGFyZ3MgPSB7XG5cdFx0XHRcdCdkZWxheSc6IDAsXG5cdFx0XHRcdCdhbmltYXRpb24nOiB7J29wYWNpdHknOiAnc2hvdyd9LFxuXHRcdFx0XHQnc3BlZWQnOiAzMDAsXG5cdFx0XHRcdCdkaXNhYmxlSEknOiB0cnVlXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRfc3VwZXJmaXNoLnN1cGVyZmlzaCggJGFyZ3MgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb2RpZnkgc2tpcCBsaW5rIHRvIG1hdGNoIG1vYmlsZSBidXR0b25zLlxuXHQgKiBAcGFyYW0gYnV0dG9uc1xuXHQgKi9cblx0ZnVuY3Rpb24gX2NoYW5nZVNraXBMaW5rKCBidXR0b25zICkge1xuXG5cdFx0Ly8gU3RhcnQgd2l0aCBhbiBlbXB0eSBhcnJheS5cblx0XHR2YXIgbWVudVRvZ2dsZUxpc3QgPSBfZ2V0QWxsTWVudXNBcnJheSgpO1xuXG5cdFx0Ly8gRXhpdCBvdXQgaWYgdGhlcmUgYXJlIG5vIG1lbnUgaXRlbXMgdG8gdXBkYXRlLlxuXHRcdGlmICggISAkKCBtZW51VG9nZ2xlTGlzdCApLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JC5lYWNoKCBtZW51VG9nZ2xlTGlzdCwgZnVuY3Rpb24gKCBrZXksIHZhbHVlICkge1xuXG5cdFx0XHR2YXIgbmV3VmFsdWUgID0gdmFsdWUucmVwbGFjZSggJy4nLCAnJyApLFxuXHRcdFx0XHRzdGFydExpbmsgPSAnZ2VuZXNpcy0nICsgbmV3VmFsdWUsXG5cdFx0XHRcdGVuZExpbmsgICA9ICdnZW5lc2lzLW1vYmlsZS0nICsgbmV3VmFsdWU7XG5cblx0XHRcdGlmICggJ25vbmUnID09IF9nZXREaXNwbGF5VmFsdWUoIGJ1dHRvbnMgKSApIHtcblx0XHRcdFx0c3RhcnRMaW5rID0gJ2dlbmVzaXMtbW9iaWxlLScgKyBuZXdWYWx1ZTtcblx0XHRcdFx0ZW5kTGluayAgID0gJ2dlbmVzaXMtJyArIG5ld1ZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgJGl0ZW0gPSAkKCAnLmdlbmVzaXMtc2tpcC1saW5rIGFbaHJlZj1cIiMnICsgc3RhcnRMaW5rICsgJ1wiXScgKTtcblxuXHRcdFx0aWYgKCBtZW51c1RvQ29tYmluZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gbWVudXNUb0NvbWJpbmVbMF0gKSB7XG5cdFx0XHRcdCRpdGVtLnRvZ2dsZUNsYXNzKCAnc2tpcC1saW5rLWhpZGRlbicgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCAkaXRlbS5sZW5ndGggPiAwICkge1xuXHRcdFx0XHR2YXIgbGluayAgPSAkaXRlbS5hdHRyKCAnaHJlZicgKTtcblx0XHRcdFx0XHRsaW5rICA9IGxpbmsucmVwbGFjZSggc3RhcnRMaW5rLCBlbmRMaW5rICk7XG5cblx0XHRcdFx0JGl0ZW0uYXR0ciggJ2hyZWYnLCBsaW5rICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlIGFsbCB0aGUgbWVudSB0b2dnbGVzIGlmIGJ1dHRvbnMgYXJlIGhpZGRlbi5cblx0ICogQHBhcmFtIGJ1dHRvbnNcblx0ICovXG5cdGZ1bmN0aW9uIF9tYXliZUNsb3NlKCBidXR0b25zICkge1xuXHRcdGlmICggJ25vbmUnICE9PSBfZ2V0RGlzcGxheVZhbHVlKCBidXR0b25zICkgKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQkKCAnLicgKyBtYWluTWVudUJ1dHRvbkNsYXNzICsgJywgLicgKyByZXNwb25zaXZlTWVudUNsYXNzICsgJyAuc3ViLW1lbnUtdG9nZ2xlJyApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoICdhY3RpdmF0ZWQnIClcblx0XHRcdC5hdHRyKCAnYXJpYS1leHBhbmRlZCcsIGZhbHNlIClcblx0XHRcdC5hdHRyKCAnYXJpYS1wcmVzc2VkJywgZmFsc2UgKTtcblxuXHRcdCQoICcuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnLCAuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnIC5zdWItbWVudScgKVxuXHRcdFx0LmF0dHIoICdzdHlsZScsICcnICk7XG5cdH1cblxuXHQvKipcblx0ICogR2VuZXJpYyBmdW5jdGlvbiB0byBnZXQgdGhlIGRpc3BsYXkgdmFsdWUgb2YgYW4gZWxlbWVudC5cblx0ICogQHBhcmFtICB7aWR9ICRpZCBJRCB0byBjaGVja1xuXHQgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICBDU1MgdmFsdWUgb2YgZGlzcGxheSBwcm9wZXJ0eVxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldERpc3BsYXlWYWx1ZSggJGlkICkge1xuXHRcdHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICRpZCApLFxuXHRcdFx0c3R5bGUgICA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCBlbGVtZW50ICk7XG5cdFx0cmV0dXJuIHN0eWxlLmdldFByb3BlcnR5VmFsdWUoICdkaXNwbGF5JyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRvZ2dsZSBhcmlhIGF0dHJpYnV0ZXMuXG5cdCAqIEBwYXJhbSAge2J1dHRvbn0gJHRoaXMgICAgIHBhc3NlZCB0aHJvdWdoXG5cdCAqIEBwYXJhbSAge2FyaWEteHh9IGF0dHJpYnV0ZSBhcmlhIGF0dHJpYnV0ZSB0byB0b2dnbGVcblx0ICogQHJldHVybiB7Ym9vbH0gICAgICAgICAgIGZyb20gX2FyaWFSZXR1cm5cblx0ICovXG5cdGZ1bmN0aW9uIF90b2dnbGVBcmlhKCAkdGhpcywgYXR0cmlidXRlICkge1xuXHRcdCR0aGlzLmF0dHIoIGF0dHJpYnV0ZSwgZnVuY3Rpb24oIGluZGV4LCB2YWx1ZSApIHtcblx0XHRcdHJldHVybiAnZmFsc2UnID09PSB2YWx1ZTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZnVuY3Rpb24gdG8gcmV0dXJuIGEgY29tbWEgc2VwYXJhdGVkIHN0cmluZyBvZiBtZW51IHNlbGVjdG9ycy5cblx0ICogQHBhcmFtIHtpdGVtQXJyYXl9IEFycmF5IG9mIG1lbnUgaXRlbXMgdG8gbG9vcCB0aHJvdWdoLlxuXHQgKiBAcGFyYW0ge2lnbm9yZVNlY29uZGFyeX0gYm9vbGVhbiBvZiB3aGV0aGVyIHRvIGlnbm9yZSB0aGUgJ3NlY29uZGFyeScgbWVudSBpdGVtLlxuXHQgKiBAcmV0dXJuIHtzdHJpbmd9IENvbW1hLXNlcGFyYXRlZCBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBpdGVtQXJyYXkgKSB7XG5cblx0XHR2YXIgaXRlbVN0cmluZyA9ICQubWFwKCBpdGVtQXJyYXksIGZ1bmN0aW9uKCB2YWx1ZSwga2V5ICkge1xuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGl0ZW1TdHJpbmcuam9pbiggJywnICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZnVuY3Rpb24gdG8gcmV0dXJuIGEgZ3JvdXAgYXJyYXkgb2YgYWxsIHRoZSBtZW51cyBpblxuXHQgKiBib3RoIHRoZSAnb3RoZXJzJyBhbmQgJ2NvbWJpbmUnIGFycmF5cy5cblx0ICogQHJldHVybiB7YXJyYXl9IEFycmF5IG9mIGFsbCBtZW51IGl0ZW1zIGFzIGNsYXNzIHNlbGVjdG9ycy5cblx0ICovXG5cdGZ1bmN0aW9uIF9nZXRBbGxNZW51c0FycmF5KCkge1xuXG5cdFx0Ly8gU3RhcnQgd2l0aCBhbiBlbXB0eSBhcnJheS5cblx0XHR2YXIgbWVudUxpc3QgPSBbXTtcblxuXHRcdC8vIElmIHRoZXJlIGFyZSBtZW51cyBpbiB0aGUgJ21lbnVzVG9Db21iaW5lJyBhcnJheSwgYWRkIHRoZW0gdG8gJ21lbnVMaXN0Jy5cblx0XHRpZiAoIG1lbnVzVG9Db21iaW5lICE9PSBudWxsICkge1xuXG5cdFx0XHQkLmVhY2goIG1lbnVzVG9Db21iaW5lLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHRcdFx0bWVudUxpc3QucHVzaCggdmFsdWUudmFsdWVPZigpICk7XG5cdFx0XHR9KTtcblxuXHRcdH1cblxuXHRcdC8vIEFkZCBtZW51cyBpbiB0aGUgJ290aGVycycgYXJyYXkgdG8gJ21lbnVMaXN0Jy5cblx0XHQkLmVhY2goIGdlbmVzaXNNZW51cy5vdGhlcnMsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdFx0bWVudUxpc3QucHVzaCggdmFsdWUudmFsdWVPZigpICk7XG5cdFx0fSk7XG5cblx0XHRpZiAoIG1lbnVMaXN0Lmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRyZXR1cm4gbWVudUxpc3Q7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHR9XG5cblx0JChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuXG5cdFx0aWYgKCBfZ2V0QWxsTWVudXNBcnJheSgpICE9PSBudWxsICkge1xuXG5cdFx0XHRnZW5lc2lzTWVudS5pbml0KCk7XG5cblx0XHR9XG5cblx0fSk7XG5cblxufSkoIGRvY3VtZW50LCBqUXVlcnkgKTtcbiIsIi8qKlxuICogaG92ZXJJbnRlbnQgaXMgc2ltaWxhciB0byBqUXVlcnkncyBidWlsdC1pbiBcImhvdmVyXCIgbWV0aG9kIGV4Y2VwdCB0aGF0XG4gKiBpbnN0ZWFkIG9mIGZpcmluZyB0aGUgaGFuZGxlckluIGZ1bmN0aW9uIGltbWVkaWF0ZWx5LCBob3ZlckludGVudCBjaGVja3NcbiAqIHRvIHNlZSBpZiB0aGUgdXNlcidzIG1vdXNlIGhhcyBzbG93ZWQgZG93biAoYmVuZWF0aCB0aGUgc2Vuc2l0aXZpdHlcbiAqIHRocmVzaG9sZCkgYmVmb3JlIGZpcmluZyB0aGUgZXZlbnQuIFRoZSBoYW5kbGVyT3V0IGZ1bmN0aW9uIGlzIG9ubHlcbiAqIGNhbGxlZCBhZnRlciBhIG1hdGNoaW5nIGhhbmRsZXJJbi5cbiAqXG4gKiBob3ZlckludGVudCByNyAvLyAyMDEzLjAzLjExIC8vIGpRdWVyeSAxLjkuMStcbiAqIGh0dHA6Ly9jaGVybmUubmV0L2JyaWFuL3Jlc291cmNlcy9qcXVlcnkuaG92ZXJJbnRlbnQuaHRtbFxuICpcbiAqIFlvdSBtYXkgdXNlIGhvdmVySW50ZW50IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIGxpY2Vuc2UuIEJhc2ljYWxseSB0aGF0XG4gKiBtZWFucyB5b3UgYXJlIGZyZWUgdG8gdXNlIGhvdmVySW50ZW50IGFzIGxvbmcgYXMgdGhpcyBoZWFkZXIgaXMgbGVmdCBpbnRhY3QuXG4gKiBDb3B5cmlnaHQgMjAwNywgMjAxMyBCcmlhbiBDaGVybmVcbiAqXG4gKiAvLyBiYXNpYyB1c2FnZSAuLi4ganVzdCBsaWtlIC5ob3ZlcigpXG4gKiAuaG92ZXJJbnRlbnQoIGhhbmRsZXJJbiwgaGFuZGxlck91dCApXG4gKiAuaG92ZXJJbnRlbnQoIGhhbmRsZXJJbk91dCApXG4gKlxuICogLy8gYmFzaWMgdXNhZ2UgLi4uIHdpdGggZXZlbnQgZGVsZWdhdGlvbiFcbiAqIC5ob3ZlckludGVudCggaGFuZGxlckluLCBoYW5kbGVyT3V0LCBzZWxlY3RvciApXG4gKiAuaG92ZXJJbnRlbnQoIGhhbmRsZXJJbk91dCwgc2VsZWN0b3IgKVxuICpcbiAqIC8vIHVzaW5nIGEgYmFzaWMgY29uZmlndXJhdGlvbiBvYmplY3RcbiAqIC5ob3ZlckludGVudCggY29uZmlnIClcbiAqXG4gKiBAcGFyYW0gIGhhbmRsZXJJbiAgIGZ1bmN0aW9uIE9SIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0gIGhhbmRsZXJPdXQgIGZ1bmN0aW9uIE9SIHNlbGVjdG9yIGZvciBkZWxlZ2F0aW9uIE9SIHVuZGVmaW5lZFxuICogQHBhcmFtICBzZWxlY3RvciAgICBzZWxlY3RvciBPUiB1bmRlZmluZWRcbiAqIEBhdXRob3IgQnJpYW4gQ2hlcm5lIDxicmlhbihhdCljaGVybmUoZG90KW5ldD5cbiAqKi9cbihmdW5jdGlvbigkKSB7XG4gICAgJC5mbi5ob3ZlckludGVudCA9IGZ1bmN0aW9uKGhhbmRsZXJJbixoYW5kbGVyT3V0LHNlbGVjdG9yKSB7XG5cbiAgICAgICAgLy8gZGVmYXVsdCBjb25maWd1cmF0aW9uIHZhbHVlc1xuICAgICAgICB2YXIgY2ZnID0ge1xuICAgICAgICAgICAgaW50ZXJ2YWw6IDEwMCxcbiAgICAgICAgICAgIHNlbnNpdGl2aXR5OiA3LFxuICAgICAgICAgICAgdGltZW91dDogMFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICggdHlwZW9mIGhhbmRsZXJJbiA9PT0gXCJvYmplY3RcIiApIHtcbiAgICAgICAgICAgIGNmZyA9ICQuZXh0ZW5kKGNmZywgaGFuZGxlckluICk7XG4gICAgICAgIH0gZWxzZSBpZiAoJC5pc0Z1bmN0aW9uKGhhbmRsZXJPdXQpKSB7XG4gICAgICAgICAgICBjZmcgPSAkLmV4dGVuZChjZmcsIHsgb3ZlcjogaGFuZGxlckluLCBvdXQ6IGhhbmRsZXJPdXQsIHNlbGVjdG9yOiBzZWxlY3RvciB9ICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjZmcgPSAkLmV4dGVuZChjZmcsIHsgb3ZlcjogaGFuZGxlckluLCBvdXQ6IGhhbmRsZXJJbiwgc2VsZWN0b3I6IGhhbmRsZXJPdXQgfSApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5zdGFudGlhdGUgdmFyaWFibGVzXG4gICAgICAgIC8vIGNYLCBjWSA9IGN1cnJlbnQgWCBhbmQgWSBwb3NpdGlvbiBvZiBtb3VzZSwgdXBkYXRlZCBieSBtb3VzZW1vdmUgZXZlbnRcbiAgICAgICAgLy8gcFgsIHBZID0gcHJldmlvdXMgWCBhbmQgWSBwb3NpdGlvbiBvZiBtb3VzZSwgc2V0IGJ5IG1vdXNlb3ZlciBhbmQgcG9sbGluZyBpbnRlcnZhbFxuICAgICAgICB2YXIgY1gsIGNZLCBwWCwgcFk7XG5cbiAgICAgICAgLy8gQSBwcml2YXRlIGZ1bmN0aW9uIGZvciBnZXR0aW5nIG1vdXNlIHBvc2l0aW9uXG4gICAgICAgIHZhciB0cmFjayA9IGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgICAgICBjWCA9IGV2LnBhZ2VYO1xuICAgICAgICAgICAgY1kgPSBldi5wYWdlWTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBIHByaXZhdGUgZnVuY3Rpb24gZm9yIGNvbXBhcmluZyBjdXJyZW50IGFuZCBwcmV2aW91cyBtb3VzZSBwb3NpdGlvblxuICAgICAgICB2YXIgY29tcGFyZSA9IGZ1bmN0aW9uKGV2LG9iKSB7XG4gICAgICAgICAgICBvYi5ob3ZlckludGVudF90ID0gY2xlYXJUaW1lb3V0KG9iLmhvdmVySW50ZW50X3QpO1xuICAgICAgICAgICAgLy8gY29tcGFyZSBtb3VzZSBwb3NpdGlvbnMgdG8gc2VlIGlmIHRoZXkndmUgY3Jvc3NlZCB0aGUgdGhyZXNob2xkXG4gICAgICAgICAgICBpZiAoICggTWF0aC5hYnMocFgtY1gpICsgTWF0aC5hYnMocFktY1kpICkgPCBjZmcuc2Vuc2l0aXZpdHkgKSB7XG4gICAgICAgICAgICAgICAgJChvYikub2ZmKFwibW91c2Vtb3ZlLmhvdmVySW50ZW50XCIsdHJhY2spO1xuICAgICAgICAgICAgICAgIC8vIHNldCBob3ZlckludGVudCBzdGF0ZSB0byB0cnVlIChzbyBtb3VzZU91dCBjYW4gYmUgY2FsbGVkKVxuICAgICAgICAgICAgICAgIG9iLmhvdmVySW50ZW50X3MgPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiBjZmcub3Zlci5hcHBseShvYixbZXZdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gc2V0IHByZXZpb3VzIGNvb3JkaW5hdGVzIGZvciBuZXh0IHRpbWVcbiAgICAgICAgICAgICAgICBwWCA9IGNYOyBwWSA9IGNZO1xuICAgICAgICAgICAgICAgIC8vIHVzZSBzZWxmLWNhbGxpbmcgdGltZW91dCwgZ3VhcmFudGVlcyBpbnRlcnZhbHMgYXJlIHNwYWNlZCBvdXQgcHJvcGVybHkgKGF2b2lkcyBKYXZhU2NyaXB0IHRpbWVyIGJ1Z3MpXG4gICAgICAgICAgICAgICAgb2IuaG92ZXJJbnRlbnRfdCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7Y29tcGFyZShldiwgb2IpO30gLCBjZmcuaW50ZXJ2YWwgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBIHByaXZhdGUgZnVuY3Rpb24gZm9yIGRlbGF5aW5nIHRoZSBtb3VzZU91dCBmdW5jdGlvblxuICAgICAgICB2YXIgZGVsYXkgPSBmdW5jdGlvbihldixvYikge1xuICAgICAgICAgICAgb2IuaG92ZXJJbnRlbnRfdCA9IGNsZWFyVGltZW91dChvYi5ob3ZlckludGVudF90KTtcbiAgICAgICAgICAgIG9iLmhvdmVySW50ZW50X3MgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGNmZy5vdXQuYXBwbHkob2IsW2V2XSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQSBwcml2YXRlIGZ1bmN0aW9uIGZvciBoYW5kbGluZyBtb3VzZSAnaG92ZXJpbmcnXG4gICAgICAgIHZhciBoYW5kbGVIb3ZlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIC8vIGNvcHkgb2JqZWN0cyB0byBiZSBwYXNzZWQgaW50byB0IChyZXF1aXJlZCBmb3IgZXZlbnQgb2JqZWN0IHRvIGJlIHBhc3NlZCBpbiBJRSlcbiAgICAgICAgICAgIHZhciBldiA9IGpRdWVyeS5leHRlbmQoe30sZSk7XG4gICAgICAgICAgICB2YXIgb2IgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyBjYW5jZWwgaG92ZXJJbnRlbnQgdGltZXIgaWYgaXQgZXhpc3RzXG4gICAgICAgICAgICBpZiAob2IuaG92ZXJJbnRlbnRfdCkgeyBvYi5ob3ZlckludGVudF90ID0gY2xlYXJUaW1lb3V0KG9iLmhvdmVySW50ZW50X3QpOyB9XG5cbiAgICAgICAgICAgIC8vIGlmIGUudHlwZSA9PSBcIm1vdXNlZW50ZXJcIlxuICAgICAgICAgICAgaWYgKGUudHlwZSA9PSBcIm1vdXNlZW50ZXJcIikge1xuICAgICAgICAgICAgICAgIC8vIHNldCBcInByZXZpb3VzXCIgWCBhbmQgWSBwb3NpdGlvbiBiYXNlZCBvbiBpbml0aWFsIGVudHJ5IHBvaW50XG4gICAgICAgICAgICAgICAgcFggPSBldi5wYWdlWDsgcFkgPSBldi5wYWdlWTtcbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgXCJjdXJyZW50XCIgWCBhbmQgWSBwb3NpdGlvbiBiYXNlZCBvbiBtb3VzZW1vdmVcbiAgICAgICAgICAgICAgICAkKG9iKS5vbihcIm1vdXNlbW92ZS5ob3ZlckludGVudFwiLHRyYWNrKTtcbiAgICAgICAgICAgICAgICAvLyBzdGFydCBwb2xsaW5nIGludGVydmFsIChzZWxmLWNhbGxpbmcgdGltZW91dCkgdG8gY29tcGFyZSBtb3VzZSBjb29yZGluYXRlcyBvdmVyIHRpbWVcbiAgICAgICAgICAgICAgICBpZiAob2IuaG92ZXJJbnRlbnRfcyAhPSAxKSB7IG9iLmhvdmVySW50ZW50X3QgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpe2NvbXBhcmUoZXYsb2IpO30gLCBjZmcuaW50ZXJ2YWwgKTt9XG5cbiAgICAgICAgICAgICAgICAvLyBlbHNlIGUudHlwZSA9PSBcIm1vdXNlbGVhdmVcIlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB1bmJpbmQgZXhwZW5zaXZlIG1vdXNlbW92ZSBldmVudFxuICAgICAgICAgICAgICAgICQob2IpLm9mZihcIm1vdXNlbW92ZS5ob3ZlckludGVudFwiLHRyYWNrKTtcbiAgICAgICAgICAgICAgICAvLyBpZiBob3ZlckludGVudCBzdGF0ZSBpcyB0cnVlLCB0aGVuIGNhbGwgdGhlIG1vdXNlT3V0IGZ1bmN0aW9uIGFmdGVyIHRoZSBzcGVjaWZpZWQgZGVsYXlcbiAgICAgICAgICAgICAgICBpZiAob2IuaG92ZXJJbnRlbnRfcyA9PSAxKSB7IG9iLmhvdmVySW50ZW50X3QgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpe2RlbGF5KGV2LG9iKTt9ICwgY2ZnLnRpbWVvdXQgKTt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gbGlzdGVuIGZvciBtb3VzZWVudGVyIGFuZCBtb3VzZWxlYXZlXG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsnbW91c2VlbnRlci5ob3ZlckludGVudCc6aGFuZGxlSG92ZXIsJ21vdXNlbGVhdmUuaG92ZXJJbnRlbnQnOmhhbmRsZUhvdmVyfSwgY2ZnLnNlbGVjdG9yKTtcbiAgICB9O1xufSkoalF1ZXJ5KTsiLCIvKiFcbiAqIGltYWdlc0xvYWRlZCBQQUNLQUdFRCB2NC4xLjRcbiAqIEphdmFTY3JpcHQgaXMgYWxsIGxpa2UgXCJZb3UgaW1hZ2VzIGFyZSBkb25lIHlldCBvciB3aGF0P1wiXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbi8qKlxuICogRXZFbWl0dGVyIHYxLjEuMFxuICogTGlsJyBldmVudCBlbWl0dGVyXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbi8qIGpzaGludCB1bnVzZWQ6IHRydWUsIHVuZGVmOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggZ2xvYmFsLCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLyogZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgd2luZG93ICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EIC0gUmVxdWlyZUpTXG4gICAgZGVmaW5lKCAnZXYtZW1pdHRlci9ldi1lbWl0dGVyJyxmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlMgLSBCcm93c2VyaWZ5LCBXZWJwYWNrXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZ2xvYmFsLkV2RW1pdHRlciA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24oKSB7XG5cblxuXG5mdW5jdGlvbiBFdkVtaXR0ZXIoKSB7fVxuXG52YXIgcHJvdG8gPSBFdkVtaXR0ZXIucHJvdG90eXBlO1xuXG5wcm90by5vbiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzZXQgZXZlbnRzIGhhc2hcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IGxpc3RlbmVycyBhcnJheVxuICB2YXIgbGlzdGVuZXJzID0gZXZlbnRzWyBldmVudE5hbWUgXSA9IGV2ZW50c1sgZXZlbnROYW1lIF0gfHwgW107XG4gIC8vIG9ubHkgYWRkIG9uY2VcbiAgaWYgKCBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKSA9PSAtMSApIHtcbiAgICBsaXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub25jZSA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBhZGQgZXZlbnRcbiAgdGhpcy5vbiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAvLyBzZXQgb25jZSBmbGFnXG4gIC8vIHNldCBvbmNlRXZlbnRzIGhhc2hcbiAgdmFyIG9uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IG9uY2VMaXN0ZW5lcnMgb2JqZWN0XG4gIHZhciBvbmNlTGlzdGVuZXJzID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSB8fCB7fTtcbiAgLy8gc2V0IGZsYWdcbiAgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vZmYgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKCBsaXN0ZW5lciApO1xuICBpZiAoIGluZGV4ICE9IC0xICkge1xuICAgIGxpc3RlbmVycy5zcGxpY2UoIGluZGV4LCAxICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmVtaXRFdmVudCA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGFyZ3MgKSB7XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzWyBldmVudE5hbWUgXTtcbiAgaWYgKCAhbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBjb3B5IG92ZXIgdG8gYXZvaWQgaW50ZXJmZXJlbmNlIGlmIC5vZmYoKSBpbiBsaXN0ZW5lclxuICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuc2xpY2UoMCk7XG4gIGFyZ3MgPSBhcmdzIHx8IFtdO1xuICAvLyBvbmNlIHN0dWZmXG4gIHZhciBvbmNlTGlzdGVuZXJzID0gdGhpcy5fb25jZUV2ZW50cyAmJiB0aGlzLl9vbmNlRXZlbnRzWyBldmVudE5hbWUgXTtcblxuICBmb3IgKCB2YXIgaT0wOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXVxuICAgIHZhciBpc09uY2UgPSBvbmNlTGlzdGVuZXJzICYmIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF07XG4gICAgaWYgKCBpc09uY2UgKSB7XG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJcbiAgICAgIC8vIHJlbW92ZSBiZWZvcmUgdHJpZ2dlciB0byBwcmV2ZW50IHJlY3Vyc2lvblxuICAgICAgdGhpcy5vZmYoIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgICAgIC8vIHVuc2V0IG9uY2UgZmxhZ1xuICAgICAgZGVsZXRlIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF07XG4gICAgfVxuICAgIC8vIHRyaWdnZXIgbGlzdGVuZXJcbiAgICBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5hbGxPZmYgPSBmdW5jdGlvbigpIHtcbiAgZGVsZXRlIHRoaXMuX2V2ZW50cztcbiAgZGVsZXRlIHRoaXMuX29uY2VFdmVudHM7XG59O1xuXG5yZXR1cm4gRXZFbWl0dGVyO1xuXG59KSk7XG5cbi8qIVxuICogaW1hZ2VzTG9hZGVkIHY0LjEuNFxuICogSmF2YVNjcmlwdCBpcyBhbGwgbGlrZSBcIllvdSBpbWFnZXMgYXJlIGRvbmUgeWV0IG9yIHdoYXQ/XCJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkgeyAndXNlIHN0cmljdCc7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuXG4gIC8qZ2xvYmFsIGRlZmluZTogZmFsc2UsIG1vZHVsZTogZmFsc2UsIHJlcXVpcmU6IGZhbHNlICovXG5cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInXG4gICAgXSwgZnVuY3Rpb24oIEV2RW1pdHRlciApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZXYtZW1pdHRlcicpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5pbWFnZXNMb2FkZWQgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LkV2RW1pdHRlclxuICAgICk7XG4gIH1cblxufSkoIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyxcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIGZhY3RvcnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIgKSB7XG5cblxuXG52YXIgJCA9IHdpbmRvdy5qUXVlcnk7XG52YXIgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGV4dGVuZCBvYmplY3RzXG5mdW5jdGlvbiBleHRlbmQoIGEsIGIgKSB7XG4gIGZvciAoIHZhciBwcm9wIGluIGIgKSB7XG4gICAgYVsgcHJvcCBdID0gYlsgcHJvcCBdO1xuICB9XG4gIHJldHVybiBhO1xufVxuXG52YXIgYXJyYXlTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuLy8gdHVybiBlbGVtZW50IG9yIG5vZGVMaXN0IGludG8gYW4gYXJyYXlcbmZ1bmN0aW9uIG1ha2VBcnJheSggb2JqICkge1xuICBpZiAoIEFycmF5LmlzQXJyYXkoIG9iaiApICkge1xuICAgIC8vIHVzZSBvYmplY3QgaWYgYWxyZWFkeSBhbiBhcnJheVxuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgaXNBcnJheUxpa2UgPSB0eXBlb2Ygb2JqID09ICdvYmplY3QnICYmIHR5cGVvZiBvYmoubGVuZ3RoID09ICdudW1iZXInO1xuICBpZiAoIGlzQXJyYXlMaWtlICkge1xuICAgIC8vIGNvbnZlcnQgbm9kZUxpc3QgdG8gYXJyYXlcbiAgICByZXR1cm4gYXJyYXlTbGljZS5jYWxsKCBvYmogKTtcbiAgfVxuXG4gIC8vIGFycmF5IG9mIHNpbmdsZSBpbmRleFxuICByZXR1cm4gWyBvYmogXTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gaW1hZ2VzTG9hZGVkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogQHBhcmFtIHtBcnJheSwgRWxlbWVudCwgTm9kZUxpc3QsIFN0cmluZ30gZWxlbVxuICogQHBhcmFtIHtPYmplY3Qgb3IgRnVuY3Rpb259IG9wdGlvbnMgLSBpZiBmdW5jdGlvbiwgdXNlIGFzIGNhbGxiYWNrXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkFsd2F5cyAtIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKi9cbmZ1bmN0aW9uIEltYWdlc0xvYWRlZCggZWxlbSwgb3B0aW9ucywgb25BbHdheXMgKSB7XG4gIC8vIGNvZXJjZSBJbWFnZXNMb2FkZWQoKSB3aXRob3V0IG5ldywgdG8gYmUgbmV3IEltYWdlc0xvYWRlZCgpXG4gIGlmICggISggdGhpcyBpbnN0YW5jZW9mIEltYWdlc0xvYWRlZCApICkge1xuICAgIHJldHVybiBuZXcgSW1hZ2VzTG9hZGVkKCBlbGVtLCBvcHRpb25zLCBvbkFsd2F5cyApO1xuICB9XG4gIC8vIHVzZSBlbGVtIGFzIHNlbGVjdG9yIHN0cmluZ1xuICB2YXIgcXVlcnlFbGVtID0gZWxlbTtcbiAgaWYgKCB0eXBlb2YgZWxlbSA9PSAnc3RyaW5nJyApIHtcbiAgICBxdWVyeUVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCBlbGVtICk7XG4gIH1cbiAgLy8gYmFpbCBpZiBiYWQgZWxlbWVudFxuICBpZiAoICFxdWVyeUVsZW0gKSB7XG4gICAgY29uc29sZS5lcnJvciggJ0JhZCBlbGVtZW50IGZvciBpbWFnZXNMb2FkZWQgJyArICggcXVlcnlFbGVtIHx8IGVsZW0gKSApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuZWxlbWVudHMgPSBtYWtlQXJyYXkoIHF1ZXJ5RWxlbSApO1xuICB0aGlzLm9wdGlvbnMgPSBleHRlbmQoIHt9LCB0aGlzLm9wdGlvbnMgKTtcbiAgLy8gc2hpZnQgYXJndW1lbnRzIGlmIG5vIG9wdGlvbnMgc2V0XG4gIGlmICggdHlwZW9mIG9wdGlvbnMgPT0gJ2Z1bmN0aW9uJyApIHtcbiAgICBvbkFsd2F5cyA9IG9wdGlvbnM7XG4gIH0gZWxzZSB7XG4gICAgZXh0ZW5kKCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIGlmICggb25BbHdheXMgKSB7XG4gICAgdGhpcy5vbiggJ2Fsd2F5cycsIG9uQWx3YXlzICk7XG4gIH1cblxuICB0aGlzLmdldEltYWdlcygpO1xuXG4gIGlmICggJCApIHtcbiAgICAvLyBhZGQgalF1ZXJ5IERlZmVycmVkIG9iamVjdFxuICAgIHRoaXMuanFEZWZlcnJlZCA9IG5ldyAkLkRlZmVycmVkKCk7XG4gIH1cblxuICAvLyBIQUNLIGNoZWNrIGFzeW5jIHRvIGFsbG93IHRpbWUgdG8gYmluZCBsaXN0ZW5lcnNcbiAgc2V0VGltZW91dCggdGhpcy5jaGVjay5iaW5kKCB0aGlzICkgKTtcbn1cblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV2RW1pdHRlci5wcm90b3R5cGUgKTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5vcHRpb25zID0ge307XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuZ2V0SW1hZ2VzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1hZ2VzID0gW107XG5cbiAgLy8gZmlsdGVyICYgZmluZCBpdGVtcyBpZiB3ZSBoYXZlIGFuIGl0ZW0gc2VsZWN0b3JcbiAgdGhpcy5lbGVtZW50cy5mb3JFYWNoKCB0aGlzLmFkZEVsZW1lbnRJbWFnZXMsIHRoaXMgKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50XG4gKi9cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuYWRkRWxlbWVudEltYWdlcyA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICAvLyBmaWx0ZXIgc2libGluZ3NcbiAgaWYgKCBlbGVtLm5vZGVOYW1lID09ICdJTUcnICkge1xuICAgIHRoaXMuYWRkSW1hZ2UoIGVsZW0gKTtcbiAgfVxuICAvLyBnZXQgYmFja2dyb3VuZCBpbWFnZSBvbiBlbGVtZW50XG4gIGlmICggdGhpcy5vcHRpb25zLmJhY2tncm91bmQgPT09IHRydWUgKSB7XG4gICAgdGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyggZWxlbSApO1xuICB9XG5cbiAgLy8gZmluZCBjaGlsZHJlblxuICAvLyBubyBub24tZWxlbWVudCBub2RlcywgIzE0M1xuICB2YXIgbm9kZVR5cGUgPSBlbGVtLm5vZGVUeXBlO1xuICBpZiAoICFub2RlVHlwZSB8fCAhZWxlbWVudE5vZGVUeXBlc1sgbm9kZVR5cGUgXSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGNoaWxkSW1ncyA9IGVsZW0ucXVlcnlTZWxlY3RvckFsbCgnaW1nJyk7XG4gIC8vIGNvbmNhdCBjaGlsZEVsZW1zIHRvIGZpbHRlckZvdW5kIGFycmF5XG4gIGZvciAoIHZhciBpPTA7IGkgPCBjaGlsZEltZ3MubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGltZyA9IGNoaWxkSW1nc1tpXTtcbiAgICB0aGlzLmFkZEltYWdlKCBpbWcgKTtcbiAgfVxuXG4gIC8vIGdldCBjaGlsZCBiYWNrZ3JvdW5kIGltYWdlc1xuICBpZiAoIHR5cGVvZiB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCA9PSAnc3RyaW5nJyApIHtcbiAgICB2YXIgY2hpbGRyZW4gPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kICk7XG4gICAgZm9yICggaT0wOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgIHRoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMoIGNoaWxkICk7XG4gICAgfVxuICB9XG59O1xuXG52YXIgZWxlbWVudE5vZGVUeXBlcyA9IHtcbiAgMTogdHJ1ZSxcbiAgOTogdHJ1ZSxcbiAgMTE6IHRydWVcbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSggZWxlbSApO1xuICBpZiAoICFzdHlsZSApIHtcbiAgICAvLyBGaXJlZm94IHJldHVybnMgbnVsbCBpZiBpbiBhIGhpZGRlbiBpZnJhbWUgaHR0cHM6Ly9idWd6aWwubGEvNTQ4Mzk3XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGdldCB1cmwgaW5zaWRlIHVybChcIi4uLlwiKVxuICB2YXIgcmVVUkwgPSAvdXJsXFwoKFsnXCJdKT8oLio/KVxcMVxcKS9naTtcbiAgdmFyIG1hdGNoZXMgPSByZVVSTC5leGVjKCBzdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgKTtcbiAgd2hpbGUgKCBtYXRjaGVzICE9PSBudWxsICkge1xuICAgIHZhciB1cmwgPSBtYXRjaGVzICYmIG1hdGNoZXNbMl07XG4gICAgaWYgKCB1cmwgKSB7XG4gICAgICB0aGlzLmFkZEJhY2tncm91bmQoIHVybCwgZWxlbSApO1xuICAgIH1cbiAgICBtYXRjaGVzID0gcmVVUkwuZXhlYyggc3R5bGUuYmFja2dyb3VuZEltYWdlICk7XG4gIH1cbn07XG5cbi8qKlxuICogQHBhcmFtIHtJbWFnZX0gaW1nXG4gKi9cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuYWRkSW1hZ2UgPSBmdW5jdGlvbiggaW1nICkge1xuICB2YXIgbG9hZGluZ0ltYWdlID0gbmV3IExvYWRpbmdJbWFnZSggaW1nICk7XG4gIHRoaXMuaW1hZ2VzLnB1c2goIGxvYWRpbmdJbWFnZSApO1xufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRCYWNrZ3JvdW5kID0gZnVuY3Rpb24oIHVybCwgZWxlbSApIHtcbiAgdmFyIGJhY2tncm91bmQgPSBuZXcgQmFja2dyb3VuZCggdXJsLCBlbGVtICk7XG4gIHRoaXMuaW1hZ2VzLnB1c2goIGJhY2tncm91bmQgKTtcbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5wcm9ncmVzc2VkQ291bnQgPSAwO1xuICB0aGlzLmhhc0FueUJyb2tlbiA9IGZhbHNlO1xuICAvLyBjb21wbGV0ZSBpZiBubyBpbWFnZXNcbiAgaWYgKCAhdGhpcy5pbWFnZXMubGVuZ3RoICkge1xuICAgIHRoaXMuY29tcGxldGUoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBvblByb2dyZXNzKCBpbWFnZSwgZWxlbSwgbWVzc2FnZSApIHtcbiAgICAvLyBIQUNLIC0gQ2hyb21lIHRyaWdnZXJzIGV2ZW50IGJlZm9yZSBvYmplY3QgcHJvcGVydGllcyBoYXZlIGNoYW5nZWQuICM4M1xuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgX3RoaXMucHJvZ3Jlc3MoIGltYWdlLCBlbGVtLCBtZXNzYWdlICk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLmltYWdlcy5mb3JFYWNoKCBmdW5jdGlvbiggbG9hZGluZ0ltYWdlICkge1xuICAgIGxvYWRpbmdJbWFnZS5vbmNlKCAncHJvZ3Jlc3MnLCBvblByb2dyZXNzICk7XG4gICAgbG9hZGluZ0ltYWdlLmNoZWNrKCk7XG4gIH0pO1xufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5wcm9ncmVzcyA9IGZ1bmN0aW9uKCBpbWFnZSwgZWxlbSwgbWVzc2FnZSApIHtcbiAgdGhpcy5wcm9ncmVzc2VkQ291bnQrKztcbiAgdGhpcy5oYXNBbnlCcm9rZW4gPSB0aGlzLmhhc0FueUJyb2tlbiB8fCAhaW1hZ2UuaXNMb2FkZWQ7XG4gIC8vIHByb2dyZXNzIGV2ZW50XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIGltYWdlLCBlbGVtIF0gKTtcbiAgaWYgKCB0aGlzLmpxRGVmZXJyZWQgJiYgdGhpcy5qcURlZmVycmVkLm5vdGlmeSApIHtcbiAgICB0aGlzLmpxRGVmZXJyZWQubm90aWZ5KCB0aGlzLCBpbWFnZSApO1xuICB9XG4gIC8vIGNoZWNrIGlmIGNvbXBsZXRlZFxuICBpZiAoIHRoaXMucHJvZ3Jlc3NlZENvdW50ID09IHRoaXMuaW1hZ2VzLmxlbmd0aCApIHtcbiAgICB0aGlzLmNvbXBsZXRlKCk7XG4gIH1cblxuICBpZiAoIHRoaXMub3B0aW9ucy5kZWJ1ZyAmJiBjb25zb2xlICkge1xuICAgIGNvbnNvbGUubG9nKCAncHJvZ3Jlc3M6ICcgKyBtZXNzYWdlLCBpbWFnZSwgZWxlbSApO1xuICB9XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBldmVudE5hbWUgPSB0aGlzLmhhc0FueUJyb2tlbiA/ICdmYWlsJyA6ICdkb25lJztcbiAgdGhpcy5pc0NvbXBsZXRlID0gdHJ1ZTtcbiAgdGhpcy5lbWl0RXZlbnQoIGV2ZW50TmFtZSwgWyB0aGlzIF0gKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdhbHdheXMnLCBbIHRoaXMgXSApO1xuICBpZiAoIHRoaXMuanFEZWZlcnJlZCApIHtcbiAgICB2YXIganFNZXRob2QgPSB0aGlzLmhhc0FueUJyb2tlbiA/ICdyZWplY3QnIDogJ3Jlc29sdmUnO1xuICAgIHRoaXMuanFEZWZlcnJlZFsganFNZXRob2QgXSggdGhpcyApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gTG9hZGluZ0ltYWdlKCBpbWcgKSB7XG4gIHRoaXMuaW1nID0gaW1nO1xufVxuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oKSB7XG4gIC8vIElmIGNvbXBsZXRlIGlzIHRydWUgYW5kIGJyb3dzZXIgc3VwcG9ydHMgbmF0dXJhbCBzaXplcyxcbiAgLy8gdHJ5IHRvIGNoZWNrIGZvciBpbWFnZSBzdGF0dXMgbWFudWFsbHkuXG4gIHZhciBpc0NvbXBsZXRlID0gdGhpcy5nZXRJc0ltYWdlQ29tcGxldGUoKTtcbiAgaWYgKCBpc0NvbXBsZXRlICkge1xuICAgIC8vIHJlcG9ydCBiYXNlZCBvbiBuYXR1cmFsV2lkdGhcbiAgICB0aGlzLmNvbmZpcm0oIHRoaXMuaW1nLm5hdHVyYWxXaWR0aCAhPT0gMCwgJ25hdHVyYWxXaWR0aCcgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBJZiBub25lIG9mIHRoZSBjaGVja3MgYWJvdmUgbWF0Y2hlZCwgc2ltdWxhdGUgbG9hZGluZyBvbiBkZXRhY2hlZCBlbGVtZW50LlxuICB0aGlzLnByb3h5SW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgdGhpcy5wcm94eUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICAvLyBiaW5kIHRvIGltYWdlIGFzIHdlbGwgZm9yIEZpcmVmb3guICMxOTFcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgdGhpcy5wcm94eUltYWdlLnNyYyA9IHRoaXMuaW1nLnNyYztcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuZ2V0SXNJbWFnZUNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGNoZWNrIGZvciBub24temVybywgbm9uLXVuZGVmaW5lZCBuYXR1cmFsV2lkdGhcbiAgLy8gZml4ZXMgU2FmYXJpK0luZmluaXRlU2Nyb2xsK01hc29ucnkgYnVnIGluZmluaXRlLXNjcm9sbCM2NzFcbiAgcmV0dXJuIHRoaXMuaW1nLmNvbXBsZXRlICYmIHRoaXMuaW1nLm5hdHVyYWxXaWR0aDtcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuY29uZmlybSA9IGZ1bmN0aW9uKCBpc0xvYWRlZCwgbWVzc2FnZSApIHtcbiAgdGhpcy5pc0xvYWRlZCA9IGlzTG9hZGVkO1xuICB0aGlzLmVtaXRFdmVudCggJ3Byb2dyZXNzJywgWyB0aGlzLCB0aGlzLmltZywgbWVzc2FnZSBdICk7XG59O1xuXG4vLyAtLS0tLSBldmVudHMgLS0tLS0gLy9cblxuLy8gdHJpZ2dlciBzcGVjaWZpZWQgaGFuZGxlciBmb3IgZXZlbnQgdHlwZVxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIG1ldGhvZCA9ICdvbicgKyBldmVudC50eXBlO1xuICBpZiAoIHRoaXNbIG1ldGhvZCBdICkge1xuICAgIHRoaXNbIG1ldGhvZCBdKCBldmVudCApO1xuICB9XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvbmZpcm0oIHRydWUsICdvbmxvYWQnICk7XG4gIHRoaXMudW5iaW5kRXZlbnRzKCk7XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb25maXJtKCBmYWxzZSwgJ29uZXJyb3InICk7XG4gIHRoaXMudW5iaW5kRXZlbnRzKCk7XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLnVuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBCYWNrZ3JvdW5kIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIEJhY2tncm91bmQoIHVybCwgZWxlbWVudCApIHtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG59XG5cbi8vIGluaGVyaXQgTG9hZGluZ0ltYWdlIHByb3RvdHlwZVxuQmFja2dyb3VuZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMb2FkaW5nSW1hZ2UucHJvdG90eXBlICk7XG5cbkJhY2tncm91bmQucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIHRoaXMuaW1nLnNyYyA9IHRoaXMudXJsO1xuICAvLyBjaGVjayBpZiBpbWFnZSBpcyBhbHJlYWR5IGNvbXBsZXRlXG4gIHZhciBpc0NvbXBsZXRlID0gdGhpcy5nZXRJc0ltYWdlQ29tcGxldGUoKTtcbiAgaWYgKCBpc0NvbXBsZXRlICkge1xuICAgIHRoaXMuY29uZmlybSggdGhpcy5pbWcubmF0dXJhbFdpZHRoICE9PSAwLCAnbmF0dXJhbFdpZHRoJyApO1xuICAgIHRoaXMudW5iaW5kRXZlbnRzKCk7XG4gIH1cbn07XG5cbkJhY2tncm91bmQucHJvdG90eXBlLnVuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xufTtcblxuQmFja2dyb3VuZC5wcm90b3R5cGUuY29uZmlybSA9IGZ1bmN0aW9uKCBpc0xvYWRlZCwgbWVzc2FnZSApIHtcbiAgdGhpcy5pc0xvYWRlZCA9IGlzTG9hZGVkO1xuICB0aGlzLmVtaXRFdmVudCggJ3Byb2dyZXNzJywgWyB0aGlzLCB0aGlzLmVsZW1lbnQsIG1lc3NhZ2UgXSApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0galF1ZXJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbkltYWdlc0xvYWRlZC5tYWtlSlF1ZXJ5UGx1Z2luID0gZnVuY3Rpb24oIGpRdWVyeSApIHtcbiAgalF1ZXJ5ID0galF1ZXJ5IHx8IHdpbmRvdy5qUXVlcnk7XG4gIGlmICggIWpRdWVyeSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gc2V0IGxvY2FsIHZhcmlhYmxlXG4gICQgPSBqUXVlcnk7XG4gIC8vICQoKS5pbWFnZXNMb2FkZWQoKVxuICAkLmZuLmltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCBvcHRpb25zLCBjYWxsYmFjayApIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBuZXcgSW1hZ2VzTG9hZGVkKCB0aGlzLCBvcHRpb25zLCBjYWxsYmFjayApO1xuICAgIHJldHVybiBpbnN0YW5jZS5qcURlZmVycmVkLnByb21pc2UoICQodGhpcykgKTtcbiAgfTtcbn07XG4vLyB0cnkgbWFraW5nIHBsdWdpblxuSW1hZ2VzTG9hZGVkLm1ha2VKUXVlcnlQbHVnaW4oKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbWFnZXNMb2FkZWQ7XG5cbn0pO1xuXG4iLCIvKipcbioganF1ZXJ5LW1hdGNoLWhlaWdodCBtYXN0ZXIgYnkgQGxpYWJydVxuKiBodHRwOi8vYnJtLmlvL2pxdWVyeS1tYXRjaC1oZWlnaHQvXG4qIExpY2Vuc2U6IE1JVFxuKi9cblxuOyhmdW5jdGlvbihmYWN0b3J5KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXh0cmEtc2VtaVxuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRFxuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICAvLyBDb21tb25KU1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEdsb2JhbFxuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxufSkoZnVuY3Rpb24oJCkge1xuICAgIC8qXG4gICAgKiAgaW50ZXJuYWxcbiAgICAqL1xuXG4gICAgdmFyIF9wcmV2aW91c1Jlc2l6ZVdpZHRoID0gLTEsXG4gICAgICAgIF91cGRhdGVUaW1lb3V0ID0gLTE7XG5cbiAgICAvKlxuICAgICogIF9wYXJzZVxuICAgICogIHZhbHVlIHBhcnNlIHV0aWxpdHkgZnVuY3Rpb25cbiAgICAqL1xuXG4gICAgdmFyIF9wYXJzZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIC8vIHBhcnNlIHZhbHVlIGFuZCBjb252ZXJ0IE5hTiB0byAwXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKSB8fCAwO1xuICAgIH07XG5cbiAgICAvKlxuICAgICogIF9yb3dzXG4gICAgKiAgdXRpbGl0eSBmdW5jdGlvbiByZXR1cm5zIGFycmF5IG9mIGpRdWVyeSBzZWxlY3Rpb25zIHJlcHJlc2VudGluZyBlYWNoIHJvd1xuICAgICogIChhcyBkaXNwbGF5ZWQgYWZ0ZXIgZmxvYXQgd3JhcHBpbmcgYXBwbGllZCBieSBicm93c2VyKVxuICAgICovXG5cbiAgICB2YXIgX3Jvd3MgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgICAgICB2YXIgdG9sZXJhbmNlID0gMSxcbiAgICAgICAgICAgICRlbGVtZW50cyA9ICQoZWxlbWVudHMpLFxuICAgICAgICAgICAgbGFzdFRvcCA9IG51bGwsXG4gICAgICAgICAgICByb3dzID0gW107XG5cbiAgICAgICAgLy8gZ3JvdXAgZWxlbWVudHMgYnkgdGhlaXIgdG9wIHBvc2l0aW9uXG4gICAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIHRvcCA9ICR0aGF0Lm9mZnNldCgpLnRvcCAtIF9wYXJzZSgkdGhhdC5jc3MoJ21hcmdpbi10b3AnKSksXG4gICAgICAgICAgICAgICAgbGFzdFJvdyA9IHJvd3MubGVuZ3RoID4gMCA/IHJvd3Nbcm93cy5sZW5ndGggLSAxXSA6IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChsYXN0Um93ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gZmlyc3QgaXRlbSBvbiB0aGUgcm93LCBzbyBqdXN0IHB1c2ggaXRcbiAgICAgICAgICAgICAgICByb3dzLnB1c2goJHRoYXQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgcm93IHRvcCBpcyB0aGUgc2FtZSwgYWRkIHRvIHRoZSByb3cgZ3JvdXBcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5mbG9vcihNYXRoLmFicyhsYXN0VG9wIC0gdG9wKSkgPD0gdG9sZXJhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJvd3Nbcm93cy5sZW5ndGggLSAxXSA9IGxhc3RSb3cuYWRkKCR0aGF0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2Ugc3RhcnQgYSBuZXcgcm93IGdyb3VwXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaCgkdGhhdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIHRoZSBsYXN0IHJvdyB0b3BcbiAgICAgICAgICAgIGxhc3RUb3AgPSB0b3A7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByb3dzO1xuICAgIH07XG5cbiAgICAvKlxuICAgICogIF9wYXJzZU9wdGlvbnNcbiAgICAqICBoYW5kbGUgcGx1Z2luIG9wdGlvbnNcbiAgICAqL1xuXG4gICAgdmFyIF9wYXJzZU9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHZhciBvcHRzID0ge1xuICAgICAgICAgICAgYnlSb3c6IHRydWUsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2hlaWdodCcsXG4gICAgICAgICAgICB0YXJnZXQ6IG51bGwsXG4gICAgICAgICAgICByZW1vdmU6IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuICQuZXh0ZW5kKG9wdHMsIG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIG9wdHMuYnlSb3cgPSBvcHRpb25zO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMgPT09ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICBvcHRzLnJlbW92ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3B0cztcbiAgICB9O1xuXG4gICAgLypcbiAgICAqICBtYXRjaEhlaWdodFxuICAgICogIHBsdWdpbiBkZWZpbml0aW9uXG4gICAgKi9cblxuICAgIHZhciBtYXRjaEhlaWdodCA9ICQuZm4ubWF0Y2hIZWlnaHQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHZhciBvcHRzID0gX3BhcnNlT3B0aW9ucyhvcHRpb25zKTtcblxuICAgICAgICAvLyBoYW5kbGUgcmVtb3ZlXG4gICAgICAgIGlmIChvcHRzLnJlbW92ZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgZml4ZWQgaGVpZ2h0IGZyb20gYWxsIHNlbGVjdGVkIGVsZW1lbnRzXG4gICAgICAgICAgICB0aGlzLmNzcyhvcHRzLnByb3BlcnR5LCAnJyk7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSBzZWxlY3RlZCBlbGVtZW50cyBmcm9tIGFsbCBncm91cHNcbiAgICAgICAgICAgICQuZWFjaChtYXRjaEhlaWdodC5fZ3JvdXBzLCBmdW5jdGlvbihrZXksIGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMgPSBncm91cC5lbGVtZW50cy5ub3QodGhhdCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gVE9ETzogY2xlYW51cCBlbXB0eSBncm91cHNcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5sZW5ndGggPD0gMSAmJiAhb3B0cy50YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8ga2VlcCB0cmFjayBvZiB0aGlzIGdyb3VwIHNvIHdlIGNhbiByZS1hcHBseSBsYXRlciBvbiBsb2FkIGFuZCByZXNpemUgZXZlbnRzXG4gICAgICAgIG1hdGNoSGVpZ2h0Ll9ncm91cHMucHVzaCh7XG4gICAgICAgICAgICBlbGVtZW50czogdGhpcyxcbiAgICAgICAgICAgIG9wdGlvbnM6IG9wdHNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gbWF0Y2ggZWFjaCBlbGVtZW50J3MgaGVpZ2h0IHRvIHRoZSB0YWxsZXN0IGVsZW1lbnQgaW4gdGhlIHNlbGVjdGlvblxuICAgICAgICBtYXRjaEhlaWdodC5fYXBwbHkodGhpcywgb3B0cyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgcGx1Z2luIGdsb2JhbCBvcHRpb25zXG4gICAgKi9cblxuICAgIG1hdGNoSGVpZ2h0LnZlcnNpb24gPSAnbWFzdGVyJztcbiAgICBtYXRjaEhlaWdodC5fZ3JvdXBzID0gW107XG4gICAgbWF0Y2hIZWlnaHQuX3Rocm90dGxlID0gODA7XG4gICAgbWF0Y2hIZWlnaHQuX21haW50YWluU2Nyb2xsID0gZmFsc2U7XG4gICAgbWF0Y2hIZWlnaHQuX2JlZm9yZVVwZGF0ZSA9IG51bGw7XG4gICAgbWF0Y2hIZWlnaHQuX2FmdGVyVXBkYXRlID0gbnVsbDtcbiAgICBtYXRjaEhlaWdodC5fcm93cyA9IF9yb3dzO1xuICAgIG1hdGNoSGVpZ2h0Ll9wYXJzZSA9IF9wYXJzZTtcbiAgICBtYXRjaEhlaWdodC5fcGFyc2VPcHRpb25zID0gX3BhcnNlT3B0aW9ucztcblxuICAgIC8qXG4gICAgKiAgbWF0Y2hIZWlnaHQuX2FwcGx5XG4gICAgKiAgYXBwbHkgbWF0Y2hIZWlnaHQgdG8gZ2l2ZW4gZWxlbWVudHNcbiAgICAqL1xuXG4gICAgbWF0Y2hIZWlnaHQuX2FwcGx5ID0gZnVuY3Rpb24oZWxlbWVudHMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHMgPSBfcGFyc2VPcHRpb25zKG9wdGlvbnMpLFxuICAgICAgICAgICAgJGVsZW1lbnRzID0gJChlbGVtZW50cyksXG4gICAgICAgICAgICByb3dzID0gWyRlbGVtZW50c107XG5cbiAgICAgICAgLy8gdGFrZSBub3RlIG9mIHNjcm9sbCBwb3NpdGlvblxuICAgICAgICB2YXIgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxuICAgICAgICAgICAgaHRtbEhlaWdodCA9ICQoJ2h0bWwnKS5vdXRlckhlaWdodCh0cnVlKTtcblxuICAgICAgICAvLyBnZXQgaGlkZGVuIHBhcmVudHNcbiAgICAgICAgdmFyICRoaWRkZW5QYXJlbnRzID0gJGVsZW1lbnRzLnBhcmVudHMoKS5maWx0ZXIoJzpoaWRkZW4nKTtcblxuICAgICAgICAvLyBjYWNoZSB0aGUgb3JpZ2luYWwgaW5saW5lIHN0eWxlXG4gICAgICAgICRoaWRkZW5QYXJlbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpO1xuICAgICAgICAgICAgJHRoYXQuZGF0YSgnc3R5bGUtY2FjaGUnLCAkdGhhdC5hdHRyKCdzdHlsZScpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gdGVtcG9yYXJpbHkgbXVzdCBmb3JjZSBoaWRkZW4gcGFyZW50cyB2aXNpYmxlXG4gICAgICAgICRoaWRkZW5QYXJlbnRzLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuXG4gICAgICAgIC8vIGdldCByb3dzIGlmIHVzaW5nIGJ5Um93LCBvdGhlcndpc2UgYXNzdW1lIG9uZSByb3dcbiAgICAgICAgaWYgKG9wdHMuYnlSb3cgJiYgIW9wdHMudGFyZ2V0KSB7XG5cbiAgICAgICAgICAgIC8vIG11c3QgZmlyc3QgZm9yY2UgYW4gYXJiaXRyYXJ5IGVxdWFsIGhlaWdodCBzbyBmbG9hdGluZyBlbGVtZW50cyBicmVhayBldmVubHlcbiAgICAgICAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXkgPSAkdGhhdC5jc3MoJ2Rpc3BsYXknKTtcblxuICAgICAgICAgICAgICAgIC8vIHRlbXBvcmFyaWx5IGZvcmNlIGEgdXNhYmxlIGRpc3BsYXkgdmFsdWVcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheSAhPT0gJ2lubGluZS1ibG9jaycgJiYgZGlzcGxheSAhPT0gJ2ZsZXgnICYmIGRpc3BsYXkgIT09ICdpbmxpbmUtZmxleCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gY2FjaGUgdGhlIG9yaWdpbmFsIGlubGluZSBzdHlsZVxuICAgICAgICAgICAgICAgICR0aGF0LmRhdGEoJ3N0eWxlLWNhY2hlJywgJHRoYXQuYXR0cignc3R5bGUnKSk7XG5cbiAgICAgICAgICAgICAgICAkdGhhdC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAnZGlzcGxheSc6IGRpc3BsYXksXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLXRvcCc6ICcwJyxcbiAgICAgICAgICAgICAgICAgICAgJ3BhZGRpbmctYm90dG9tJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAnbWFyZ2luLXRvcCc6ICcwJyxcbiAgICAgICAgICAgICAgICAgICAgJ21hcmdpbi1ib3R0b20nOiAnMCcsXG4gICAgICAgICAgICAgICAgICAgICdib3JkZXItdG9wLXdpZHRoJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAnYm9yZGVyLWJvdHRvbS13aWR0aCc6ICcwJyxcbiAgICAgICAgICAgICAgICAgICAgJ2hlaWdodCc6ICcxMDBweCcsXG4gICAgICAgICAgICAgICAgICAgICdvdmVyZmxvdyc6ICdoaWRkZW4nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ2V0IHRoZSBhcnJheSBvZiByb3dzIChiYXNlZCBvbiBlbGVtZW50IHRvcCBwb3NpdGlvbilcbiAgICAgICAgICAgIHJvd3MgPSBfcm93cygkZWxlbWVudHMpO1xuXG4gICAgICAgICAgICAvLyByZXZlcnQgb3JpZ2luYWwgaW5saW5lIHN0eWxlc1xuICAgICAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGF0ID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICAkdGhhdC5hdHRyKCdzdHlsZScsICR0aGF0LmRhdGEoJ3N0eWxlLWNhY2hlJykgfHwgJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkLmVhY2gocm93cywgZnVuY3Rpb24oa2V5LCByb3cpIHtcbiAgICAgICAgICAgIHZhciAkcm93ID0gJChyb3cpLFxuICAgICAgICAgICAgICAgIHRhcmdldEhlaWdodCA9IDA7XG5cbiAgICAgICAgICAgIGlmICghb3B0cy50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAvLyBza2lwIGFwcGx5IHRvIHJvd3Mgd2l0aCBvbmx5IG9uZSBpdGVtXG4gICAgICAgICAgICAgICAgaWYgKG9wdHMuYnlSb3cgJiYgJHJvdy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAkcm93LmNzcyhvcHRzLnByb3BlcnR5LCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBpdGVyYXRlIHRoZSByb3cgYW5kIGZpbmQgdGhlIG1heCBoZWlnaHRcbiAgICAgICAgICAgICAgICAkcm93LmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0aGF0ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlID0gJHRoYXQuYXR0cignc3R5bGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXkgPSAkdGhhdC5jc3MoJ2Rpc3BsYXknKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB0ZW1wb3JhcmlseSBmb3JjZSBhIHVzYWJsZSBkaXNwbGF5IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5ICE9PSAnaW5saW5lLWJsb2NrJyAmJiBkaXNwbGF5ICE9PSAnZmxleCcgJiYgZGlzcGxheSAhPT0gJ2lubGluZS1mbGV4Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgd2UgZ2V0IHRoZSBjb3JyZWN0IGFjdHVhbCBoZWlnaHQgKGFuZCBub3QgYSBwcmV2aW91c2x5IHNldCBoZWlnaHQgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHZhciBjc3MgPSB7ICdkaXNwbGF5JzogZGlzcGxheSB9O1xuICAgICAgICAgICAgICAgICAgICBjc3Nbb3B0cy5wcm9wZXJ0eV0gPSAnJztcbiAgICAgICAgICAgICAgICAgICAgJHRoYXQuY3NzKGNzcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZmluZCB0aGUgbWF4IGhlaWdodCAoaW5jbHVkaW5nIHBhZGRpbmcsIGJ1dCBub3QgbWFyZ2luKVxuICAgICAgICAgICAgICAgICAgICBpZiAoJHRoYXQub3V0ZXJIZWlnaHQoZmFsc2UpID4gdGFyZ2V0SGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRIZWlnaHQgPSAkdGhhdC5vdXRlckhlaWdodChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyByZXZlcnQgc3R5bGVzXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRoYXQuYXR0cignc3R5bGUnLCBzdHlsZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhhdC5jc3MoJ2Rpc3BsYXknLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGFyZ2V0IHNldCwgdXNlIHRoZSBoZWlnaHQgb2YgdGhlIHRhcmdldCBlbGVtZW50XG4gICAgICAgICAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gb3B0cy50YXJnZXQub3V0ZXJIZWlnaHQoZmFsc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpdGVyYXRlIHRoZSByb3cgYW5kIGFwcGx5IHRoZSBoZWlnaHQgdG8gYWxsIGVsZW1lbnRzXG4gICAgICAgICAgICAkcm93LmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbFBhZGRpbmcgPSAwO1xuXG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgYXBwbHkgdG8gYSB0YXJnZXRcbiAgICAgICAgICAgICAgICBpZiAob3B0cy50YXJnZXQgJiYgJHRoYXQuaXMob3B0cy50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBoYW5kbGUgcGFkZGluZyBhbmQgYm9yZGVyIGNvcnJlY3RseSAocmVxdWlyZWQgd2hlbiBub3QgdXNpbmcgYm9yZGVyLWJveClcbiAgICAgICAgICAgICAgICBpZiAoJHRoYXQuY3NzKCdib3gtc2l6aW5nJykgIT09ICdib3JkZXItYm94Jykge1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbFBhZGRpbmcgKz0gX3BhcnNlKCR0aGF0LmNzcygnYm9yZGVyLXRvcC13aWR0aCcpKSArIF9wYXJzZSgkdGhhdC5jc3MoJ2JvcmRlci1ib3R0b20td2lkdGgnKSk7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUGFkZGluZyArPSBfcGFyc2UoJHRoYXQuY3NzKCdwYWRkaW5nLXRvcCcpKSArIF9wYXJzZSgkdGhhdC5jc3MoJ3BhZGRpbmctYm90dG9tJykpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgaGVpZ2h0IChhY2NvdW50aW5nIGZvciBwYWRkaW5nIGFuZCBib3JkZXIpXG4gICAgICAgICAgICAgICAgJHRoYXQuY3NzKG9wdHMucHJvcGVydHksICh0YXJnZXRIZWlnaHQgLSB2ZXJ0aWNhbFBhZGRpbmcpICsgJ3B4Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmV2ZXJ0IGhpZGRlbiBwYXJlbnRzXG4gICAgICAgICRoaWRkZW5QYXJlbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpO1xuICAgICAgICAgICAgJHRoYXQuYXR0cignc3R5bGUnLCAkdGhhdC5kYXRhKCdzdHlsZS1jYWNoZScpIHx8IG51bGwpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyByZXN0b3JlIHNjcm9sbCBwb3NpdGlvbiBpZiBlbmFibGVkXG4gICAgICAgIGlmIChtYXRjaEhlaWdodC5fbWFpbnRhaW5TY3JvbGwpIHtcbiAgICAgICAgICAgICQod2luZG93KS5zY3JvbGxUb3AoKHNjcm9sbFRvcCAvIGh0bWxIZWlnaHQpICogJCgnaHRtbCcpLm91dGVySGVpZ2h0KHRydWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKlxuICAgICogIG1hdGNoSGVpZ2h0Ll9hcHBseURhdGFBcGlcbiAgICAqICBhcHBsaWVzIG1hdGNoSGVpZ2h0IHRvIGFsbCBlbGVtZW50cyB3aXRoIGEgZGF0YS1tYXRjaC1oZWlnaHQgYXR0cmlidXRlXG4gICAgKi9cblxuICAgIG1hdGNoSGVpZ2h0Ll9hcHBseURhdGFBcGkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdyb3VwcyA9IHt9O1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIGdyb3VwcyBieSB0aGVpciBncm91cElkIHNldCBieSBlbGVtZW50cyB1c2luZyBkYXRhLW1hdGNoLWhlaWdodFxuICAgICAgICAkKCdbZGF0YS1tYXRjaC1oZWlnaHRdLCBbZGF0YS1taF0nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBncm91cElkID0gJHRoaXMuYXR0cignZGF0YS1taCcpIHx8ICR0aGlzLmF0dHIoJ2RhdGEtbWF0Y2gtaGVpZ2h0Jyk7XG5cbiAgICAgICAgICAgIGlmIChncm91cElkIGluIGdyb3Vwcykge1xuICAgICAgICAgICAgICAgIGdyb3Vwc1tncm91cElkXSA9IGdyb3Vwc1tncm91cElkXS5hZGQoJHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBncm91cHNbZ3JvdXBJZF0gPSAkdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gYXBwbHkgbWF0Y2hIZWlnaHQgdG8gZWFjaCBncm91cFxuICAgICAgICAkLmVhY2goZ3JvdXBzLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMubWF0Y2hIZWlnaHQodHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKlxuICAgICogIG1hdGNoSGVpZ2h0Ll91cGRhdGVcbiAgICAqICB1cGRhdGVzIG1hdGNoSGVpZ2h0IG9uIGFsbCBjdXJyZW50IGdyb3VwcyB3aXRoIHRoZWlyIGNvcnJlY3Qgb3B0aW9uc1xuICAgICovXG5cbiAgICB2YXIgX3VwZGF0ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChtYXRjaEhlaWdodC5fYmVmb3JlVXBkYXRlKSB7XG4gICAgICAgICAgICBtYXRjaEhlaWdodC5fYmVmb3JlVXBkYXRlKGV2ZW50LCBtYXRjaEhlaWdodC5fZ3JvdXBzKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQuZWFjaChtYXRjaEhlaWdodC5fZ3JvdXBzLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG1hdGNoSGVpZ2h0Ll9hcHBseSh0aGlzLmVsZW1lbnRzLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAobWF0Y2hIZWlnaHQuX2FmdGVyVXBkYXRlKSB7XG4gICAgICAgICAgICBtYXRjaEhlaWdodC5fYWZ0ZXJVcGRhdGUoZXZlbnQsIG1hdGNoSGVpZ2h0Ll9ncm91cHMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG1hdGNoSGVpZ2h0Ll91cGRhdGUgPSBmdW5jdGlvbih0aHJvdHRsZSwgZXZlbnQpIHtcbiAgICAgICAgLy8gcHJldmVudCB1cGRhdGUgaWYgZmlyZWQgZnJvbSBhIHJlc2l6ZSBldmVudFxuICAgICAgICAvLyB3aGVyZSB0aGUgdmlld3BvcnQgd2lkdGggaGFzbid0IGFjdHVhbGx5IGNoYW5nZWRcbiAgICAgICAgLy8gZml4ZXMgYW4gZXZlbnQgbG9vcGluZyBidWcgaW4gSUU4XG4gICAgICAgIGlmIChldmVudCAmJiBldmVudC50eXBlID09PSAncmVzaXplJykge1xuICAgICAgICAgICAgdmFyIHdpbmRvd1dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgICAgICBpZiAod2luZG93V2lkdGggPT09IF9wcmV2aW91c1Jlc2l6ZVdpZHRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3ByZXZpb3VzUmVzaXplV2lkdGggPSB3aW5kb3dXaWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRocm90dGxlIHVwZGF0ZXNcbiAgICAgICAgaWYgKCF0aHJvdHRsZSkge1xuICAgICAgICAgICAgX3VwZGF0ZShldmVudCk7XG4gICAgICAgIH0gZWxzZSBpZiAoX3VwZGF0ZVRpbWVvdXQgPT09IC0xKSB7XG4gICAgICAgICAgICBfdXBkYXRlVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgX3VwZGF0ZShldmVudCk7XG4gICAgICAgICAgICAgICAgX3VwZGF0ZVRpbWVvdXQgPSAtMTtcbiAgICAgICAgICAgIH0sIG1hdGNoSGVpZ2h0Ll90aHJvdHRsZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLypcbiAgICAqICBiaW5kIGV2ZW50c1xuICAgICovXG5cbiAgICAvLyBhcHBseSBvbiBET00gcmVhZHkgZXZlbnRcbiAgICAkKG1hdGNoSGVpZ2h0Ll9hcHBseURhdGFBcGkpO1xuXG4gICAgLy8gdXNlIG9uIG9yIGJpbmQgd2hlcmUgc3VwcG9ydGVkXG4gICAgdmFyIG9uID0gJC5mbi5vbiA/ICdvbicgOiAnYmluZCc7XG5cbiAgICAvLyB1cGRhdGUgaGVpZ2h0cyBvbiBsb2FkIGFuZCByZXNpemUgZXZlbnRzXG4gICAgJCh3aW5kb3cpW29uXSgnbG9hZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIG1hdGNoSGVpZ2h0Ll91cGRhdGUoZmFsc2UsIGV2ZW50KTtcbiAgICB9KTtcblxuICAgIC8vIHRocm90dGxlZCB1cGRhdGUgaGVpZ2h0cyBvbiByZXNpemUgZXZlbnRzXG4gICAgJCh3aW5kb3cpW29uXSgncmVzaXplIG9yaWVudGF0aW9uY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbWF0Y2hIZWlnaHQuX3VwZGF0ZSh0cnVlLCBldmVudCk7XG4gICAgfSk7XG5cbn0pO1xuIiwiLyohXG4gKiBqUXVlcnkgU21vb3RoIFNjcm9sbCAtIHYyLjIuMCAtIDIwMTctMDUtMDVcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9rc3dlZGJlcmcvanF1ZXJ5LXNtb290aC1zY3JvbGxcbiAqIENvcHlyaWdodCAoYykgMjAxNyBLYXJsIFN3ZWRiZXJnXG4gKiBMaWNlbnNlZCBNSVRcbiAqL1xuXG4oZnVuY3Rpb24oZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIENvbW1vbkpTXG4gICAgZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZmFjdG9yeShqUXVlcnkpO1xuICB9XG59KGZ1bmN0aW9uKCQpIHtcblxuICB2YXIgdmVyc2lvbiA9ICcyLjIuMCc7XG4gIHZhciBvcHRpb25PdmVycmlkZXMgPSB7fTtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGV4Y2x1ZGU6IFtdLFxuICAgIGV4Y2x1ZGVXaXRoaW46IFtdLFxuICAgIG9mZnNldDogMCxcblxuICAgIC8vIG9uZSBvZiAndG9wJyBvciAnbGVmdCdcbiAgICBkaXJlY3Rpb246ICd0b3AnLFxuXG4gICAgLy8gaWYgc2V0LCBiaW5kIGNsaWNrIGV2ZW50cyB0aHJvdWdoIGRlbGVnYXRpb25cbiAgICAvLyAgc3VwcG9ydGVkIHNpbmNlIGpRdWVyeSAxLjQuMlxuICAgIGRlbGVnYXRlU2VsZWN0b3I6IG51bGwsXG5cbiAgICAvLyBqUXVlcnkgc2V0IG9mIGVsZW1lbnRzIHlvdSB3aXNoIHRvIHNjcm9sbCAoZm9yICQuc21vb3RoU2Nyb2xsKS5cbiAgICAvLyAgaWYgbnVsbCAoZGVmYXVsdCksICQoJ2h0bWwsIGJvZHknKS5maXJzdFNjcm9sbGFibGUoKSBpcyB1c2VkLlxuICAgIHNjcm9sbEVsZW1lbnQ6IG51bGwsXG5cbiAgICAvLyBvbmx5IHVzZSBpZiB5b3Ugd2FudCB0byBvdmVycmlkZSBkZWZhdWx0IGJlaGF2aW9yXG4gICAgc2Nyb2xsVGFyZ2V0OiBudWxsLFxuXG4gICAgLy8gYXV0b21hdGljYWxseSBmb2N1cyB0aGUgdGFyZ2V0IGVsZW1lbnQgYWZ0ZXIgc2Nyb2xsaW5nIHRvIGl0XG4gICAgYXV0b0ZvY3VzOiBmYWxzZSxcblxuICAgIC8vIGZuKG9wdHMpIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBiZWZvcmUgc2Nyb2xsaW5nIG9jY3Vycy5cbiAgICAvLyBgdGhpc2AgaXMgdGhlIGVsZW1lbnQocykgYmVpbmcgc2Nyb2xsZWRcbiAgICBiZWZvcmVTY3JvbGw6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvLyBmbihvcHRzKSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgYWZ0ZXIgc2Nyb2xsaW5nIG9jY3Vycy5cbiAgICAvLyBgdGhpc2AgaXMgdGhlIHRyaWdnZXJpbmcgZWxlbWVudFxuICAgIGFmdGVyU2Nyb2xsOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgLy8gZWFzaW5nIG5hbWUuIGpRdWVyeSBjb21lcyB3aXRoIFwic3dpbmdcIiBhbmQgXCJsaW5lYXIuXCIgRm9yIG90aGVycywgeW91J2xsIG5lZWQgYW4gZWFzaW5nIHBsdWdpblxuICAgIC8vIGZyb20galF1ZXJ5IFVJIG9yIGVsc2V3aGVyZVxuICAgIGVhc2luZzogJ3N3aW5nJyxcblxuICAgIC8vIHNwZWVkIGNhbiBiZSBhIG51bWJlciBvciAnYXV0bydcbiAgICAvLyBpZiAnYXV0bycsIHRoZSBzcGVlZCB3aWxsIGJlIGNhbGN1bGF0ZWQgYmFzZWQgb24gdGhlIGZvcm11bGE6XG4gICAgLy8gKGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uIC0gdGFyZ2V0IHNjcm9sbCBwb3NpdGlvbikgLyBhdXRvQ29lZmZpY1xuICAgIHNwZWVkOiA0MDAsXG5cbiAgICAvLyBjb2VmZmljaWVudCBmb3IgXCJhdXRvXCIgc3BlZWRcbiAgICBhdXRvQ29lZmZpY2llbnQ6IDIsXG5cbiAgICAvLyAkLmZuLnNtb290aFNjcm9sbCBvbmx5OiB3aGV0aGVyIHRvIHByZXZlbnQgdGhlIGRlZmF1bHQgY2xpY2sgYWN0aW9uXG4gICAgcHJldmVudERlZmF1bHQ6IHRydWVcbiAgfTtcblxuICB2YXIgZ2V0U2Nyb2xsYWJsZSA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgICB2YXIgc2Nyb2xsYWJsZSA9IFtdO1xuICAgIHZhciBzY3JvbGxlZCA9IGZhbHNlO1xuICAgIHZhciBkaXIgPSBvcHRzLmRpciAmJiBvcHRzLmRpciA9PT0gJ2xlZnQnID8gJ3Njcm9sbExlZnQnIDogJ3Njcm9sbFRvcCc7XG5cbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWwgPSAkKHRoaXMpO1xuXG4gICAgICBpZiAodGhpcyA9PT0gZG9jdW1lbnQgfHwgdGhpcyA9PT0gd2luZG93KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGRvY3VtZW50LnNjcm9sbGluZ0VsZW1lbnQgJiYgKHRoaXMgPT09IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCB0aGlzID09PSBkb2N1bWVudC5ib2R5KSkge1xuICAgICAgICBzY3JvbGxhYmxlLnB1c2goZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudCk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZWxbZGlyXSgpID4gMCkge1xuICAgICAgICBzY3JvbGxhYmxlLnB1c2godGhpcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiBzY3JvbGwoVG9wfExlZnQpID09PSAwLCBudWRnZSB0aGUgZWxlbWVudCAxcHggYW5kIHNlZSBpZiBpdCBtb3Zlc1xuICAgICAgICBlbFtkaXJdKDEpO1xuICAgICAgICBzY3JvbGxlZCA9IGVsW2Rpcl0oKSA+IDA7XG5cbiAgICAgICAgaWYgKHNjcm9sbGVkKSB7XG4gICAgICAgICAgc2Nyb2xsYWJsZS5wdXNoKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRoZW4gcHV0IGl0IGJhY2ssIG9mIGNvdXJzZVxuICAgICAgICBlbFtkaXJdKDApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCFzY3JvbGxhYmxlLmxlbmd0aCkge1xuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBJZiBubyBzY3JvbGxhYmxlIGVsZW1lbnRzIGFuZCA8aHRtbD4gaGFzIHNjcm9sbC1iZWhhdmlvcjpzbW9vdGggYmVjYXVzZVxuICAgICAgICAvLyBcIldoZW4gdGhpcyBwcm9wZXJ0eSBpcyBzcGVjaWZpZWQgb24gdGhlIHJvb3QgZWxlbWVudCwgaXQgYXBwbGllcyB0byB0aGUgdmlld3BvcnQgaW5zdGVhZC5cIlxuICAgICAgICAvLyBhbmQgXCJUaGUgc2Nyb2xsLWJlaGF2aW9yIHByb3BlcnR5IG9mIHRoZSDigKYgYm9keSBlbGVtZW50IGlzICpub3QqIHByb3BhZ2F0ZWQgdG8gdGhlIHZpZXdwb3J0LlwiXG4gICAgICAgIC8vIOKGkiBodHRwczovL2RyYWZ0cy5jc3N3Zy5vcmcvY3Nzb20tdmlldy8jcHJvcGRlZi1zY3JvbGwtYmVoYXZpb3JcbiAgICAgICAgaWYgKHRoaXMgPT09IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAkKHRoaXMpLmNzcygnc2Nyb2xsQmVoYXZpb3InKSA9PT0gJ3Ntb290aCcpIHtcbiAgICAgICAgICBzY3JvbGxhYmxlID0gW3RoaXNdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgc3RpbGwgbm8gc2Nyb2xsYWJsZSBlbGVtZW50cywgZmFsbCBiYWNrIHRvIDxib2R5PixcbiAgICAgICAgLy8gaWYgaXQncyBpbiB0aGUgalF1ZXJ5IGNvbGxlY3Rpb25cbiAgICAgICAgLy8gKGRvaW5nIHRoaXMgYmVjYXVzZSBTYWZhcmkgc2V0cyBzY3JvbGxUb3AgYXN5bmMsXG4gICAgICAgIC8vIHNvIGNhbid0IHNldCBpdCB0byAxIGFuZCBpbW1lZGlhdGVseSBnZXQgdGhlIHZhbHVlLilcbiAgICAgICAgaWYgKCFzY3JvbGxhYmxlLmxlbmd0aCAmJiB0aGlzLm5vZGVOYW1lID09PSAnQk9EWScpIHtcbiAgICAgICAgICBzY3JvbGxhYmxlID0gW3RoaXNdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBVc2UgdGhlIGZpcnN0IHNjcm9sbGFibGUgZWxlbWVudCBpZiB3ZSdyZSBjYWxsaW5nIGZpcnN0U2Nyb2xsYWJsZSgpXG4gICAgaWYgKG9wdHMuZWwgPT09ICdmaXJzdCcgJiYgc2Nyb2xsYWJsZS5sZW5ndGggPiAxKSB7XG4gICAgICBzY3JvbGxhYmxlID0gW3Njcm9sbGFibGVbMF1dO1xuICAgIH1cblxuICAgIHJldHVybiBzY3JvbGxhYmxlO1xuICB9O1xuXG4gIHZhciByUmVsYXRpdmUgPSAvXihbXFwtXFwrXT0pKFxcZCspLztcblxuICAkLmZuLmV4dGVuZCh7XG4gICAgc2Nyb2xsYWJsZTogZnVuY3Rpb24oZGlyKSB7XG4gICAgICB2YXIgc2NybCA9IGdldFNjcm9sbGFibGUuY2FsbCh0aGlzLCB7ZGlyOiBkaXJ9KTtcblxuICAgICAgcmV0dXJuIHRoaXMucHVzaFN0YWNrKHNjcmwpO1xuICAgIH0sXG4gICAgZmlyc3RTY3JvbGxhYmxlOiBmdW5jdGlvbihkaXIpIHtcbiAgICAgIHZhciBzY3JsID0gZ2V0U2Nyb2xsYWJsZS5jYWxsKHRoaXMsIHtlbDogJ2ZpcnN0JywgZGlyOiBkaXJ9KTtcblxuICAgICAgcmV0dXJuIHRoaXMucHVzaFN0YWNrKHNjcmwpO1xuICAgIH0sXG5cbiAgICBzbW9vdGhTY3JvbGw6IGZ1bmN0aW9uKG9wdGlvbnMsIGV4dHJhKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgaWYgKG9wdGlvbnMgPT09ICdvcHRpb25zJykge1xuICAgICAgICBpZiAoIWV4dHJhKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3QoKS5kYXRhKCdzc09wdHMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICB2YXIgb3B0cyA9ICQuZXh0ZW5kKCR0aGlzLmRhdGEoJ3NzT3B0cycpIHx8IHt9LCBleHRyYSk7XG5cbiAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3NzT3B0cycsIG9wdHMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdmFyIG9wdHMgPSAkLmV4dGVuZCh7fSwgJC5mbi5zbW9vdGhTY3JvbGwuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgICB2YXIgY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGVzY2FwZVNlbGVjdG9yID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oOnxcXC58XFwvKS9nLCAnXFxcXCQxJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGxpbmsgPSB0aGlzO1xuICAgICAgICB2YXIgJGxpbmsgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgdGhpc09wdHMgPSAkLmV4dGVuZCh7fSwgb3B0cywgJGxpbmsuZGF0YSgnc3NPcHRzJykgfHwge30pO1xuICAgICAgICB2YXIgZXhjbHVkZSA9IG9wdHMuZXhjbHVkZTtcbiAgICAgICAgdmFyIGV4Y2x1ZGVXaXRoaW4gPSB0aGlzT3B0cy5leGNsdWRlV2l0aGluO1xuICAgICAgICB2YXIgZWxDb3VudGVyID0gMDtcbiAgICAgICAgdmFyIGV3bENvdW50ZXIgPSAwO1xuICAgICAgICB2YXIgaW5jbHVkZSA9IHRydWU7XG4gICAgICAgIHZhciBjbGlja09wdHMgPSB7fTtcbiAgICAgICAgdmFyIGxvY2F0aW9uUGF0aCA9ICQuc21vb3RoU2Nyb2xsLmZpbHRlclBhdGgobG9jYXRpb24ucGF0aG5hbWUpO1xuICAgICAgICB2YXIgbGlua1BhdGggPSAkLnNtb290aFNjcm9sbC5maWx0ZXJQYXRoKGxpbmsucGF0aG5hbWUpO1xuICAgICAgICB2YXIgaG9zdE1hdGNoID0gbG9jYXRpb24uaG9zdG5hbWUgPT09IGxpbmsuaG9zdG5hbWUgfHwgIWxpbmsuaG9zdG5hbWU7XG4gICAgICAgIHZhciBwYXRoTWF0Y2ggPSB0aGlzT3B0cy5zY3JvbGxUYXJnZXQgfHwgKGxpbmtQYXRoID09PSBsb2NhdGlvblBhdGgpO1xuICAgICAgICB2YXIgdGhpc0hhc2ggPSBlc2NhcGVTZWxlY3RvcihsaW5rLmhhc2gpO1xuXG4gICAgICAgIGlmICh0aGlzSGFzaCAmJiAhJCh0aGlzSGFzaCkubGVuZ3RoKSB7XG4gICAgICAgICAgaW5jbHVkZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzT3B0cy5zY3JvbGxUYXJnZXQgJiYgKCFob3N0TWF0Y2ggfHwgIXBhdGhNYXRjaCB8fCAhdGhpc0hhc2gpKSB7XG4gICAgICAgICAgaW5jbHVkZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdoaWxlIChpbmNsdWRlICYmIGVsQ291bnRlciA8IGV4Y2x1ZGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoJGxpbmsuaXMoZXNjYXBlU2VsZWN0b3IoZXhjbHVkZVtlbENvdW50ZXIrK10pKSkge1xuICAgICAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd2hpbGUgKGluY2x1ZGUgJiYgZXdsQ291bnRlciA8IGV4Y2x1ZGVXaXRoaW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoJGxpbmsuY2xvc2VzdChleGNsdWRlV2l0aGluW2V3bENvdW50ZXIrK10pLmxlbmd0aCkge1xuICAgICAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluY2x1ZGUpIHtcbiAgICAgICAgICBpZiAodGhpc09wdHMucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJC5leHRlbmQoY2xpY2tPcHRzLCB0aGlzT3B0cywge1xuICAgICAgICAgICAgc2Nyb2xsVGFyZ2V0OiB0aGlzT3B0cy5zY3JvbGxUYXJnZXQgfHwgdGhpc0hhc2gsXG4gICAgICAgICAgICBsaW5rOiBsaW5rXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAkLnNtb290aFNjcm9sbChjbGlja09wdHMpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBpZiAob3B0aW9ucy5kZWxlZ2F0ZVNlbGVjdG9yICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgLm9mZignY2xpY2suc21vb3Roc2Nyb2xsJywgb3B0aW9ucy5kZWxlZ2F0ZVNlbGVjdG9yKVxuICAgICAgICAub24oJ2NsaWNrLnNtb290aHNjcm9sbCcsIG9wdGlvbnMuZGVsZWdhdGVTZWxlY3RvciwgY2xpY2tIYW5kbGVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgLm9mZignY2xpY2suc21vb3Roc2Nyb2xsJylcbiAgICAgICAgLm9uKCdjbGljay5zbW9vdGhzY3JvbGwnLCBjbGlja0hhbmRsZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBnZXRFeHBsaWNpdE9mZnNldCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHZhciBleHBsaWNpdCA9IHtyZWxhdGl2ZTogJyd9O1xuICAgIHZhciBwYXJ0cyA9IHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmIHJSZWxhdGl2ZS5leGVjKHZhbCk7XG5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGV4cGxpY2l0LnB4ID0gdmFsO1xuICAgIH0gZWxzZSBpZiAocGFydHMpIHtcbiAgICAgIGV4cGxpY2l0LnJlbGF0aXZlID0gcGFydHNbMV07XG4gICAgICBleHBsaWNpdC5weCA9IHBhcnNlRmxvYXQocGFydHNbMl0pIHx8IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cGxpY2l0O1xuICB9O1xuXG4gIHZhciBvbkFmdGVyU2Nyb2xsID0gZnVuY3Rpb24ob3B0cykge1xuICAgIHZhciAkdGd0ID0gJChvcHRzLnNjcm9sbFRhcmdldCk7XG5cbiAgICBpZiAob3B0cy5hdXRvRm9jdXMgJiYgJHRndC5sZW5ndGgpIHtcbiAgICAgICR0Z3RbMF0uZm9jdXMoKTtcblxuICAgICAgaWYgKCEkdGd0LmlzKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgICR0Z3QucHJvcCh7dGFiSW5kZXg6IC0xfSk7XG4gICAgICAgICR0Z3RbMF0uZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvcHRzLmFmdGVyU2Nyb2xsLmNhbGwob3B0cy5saW5rLCBvcHRzKTtcbiAgfTtcblxuICAkLnNtb290aFNjcm9sbCA9IGZ1bmN0aW9uKG9wdGlvbnMsIHB4KSB7XG4gICAgaWYgKG9wdGlvbnMgPT09ICdvcHRpb25zJyAmJiB0eXBlb2YgcHggPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gJC5leHRlbmQob3B0aW9uT3ZlcnJpZGVzLCBweCk7XG4gICAgfVxuICAgIHZhciBvcHRzLCAkc2Nyb2xsZXIsIHNwZWVkLCBkZWx0YTtcbiAgICB2YXIgZXhwbGljaXRPZmZzZXQgPSBnZXRFeHBsaWNpdE9mZnNldChvcHRpb25zKTtcbiAgICB2YXIgc2Nyb2xsVGFyZ2V0T2Zmc2V0ID0ge307XG4gICAgdmFyIHNjcm9sbGVyT2Zmc2V0ID0gMDtcbiAgICB2YXIgb2ZmUG9zID0gJ29mZnNldCc7XG4gICAgdmFyIHNjcm9sbERpciA9ICdzY3JvbGxUb3AnO1xuICAgIHZhciBhbmlQcm9wcyA9IHt9O1xuICAgIHZhciBhbmlPcHRzID0ge307XG5cbiAgICBpZiAoZXhwbGljaXRPZmZzZXQucHgpIHtcbiAgICAgIG9wdHMgPSAkLmV4dGVuZCh7bGluazogbnVsbH0sICQuZm4uc21vb3RoU2Nyb2xsLmRlZmF1bHRzLCBvcHRpb25PdmVycmlkZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRzID0gJC5leHRlbmQoe2xpbms6IG51bGx9LCAkLmZuLnNtb290aFNjcm9sbC5kZWZhdWx0cywgb3B0aW9ucyB8fCB7fSwgb3B0aW9uT3ZlcnJpZGVzKTtcblxuICAgICAgaWYgKG9wdHMuc2Nyb2xsRWxlbWVudCkge1xuICAgICAgICBvZmZQb3MgPSAncG9zaXRpb24nO1xuXG4gICAgICAgIGlmIChvcHRzLnNjcm9sbEVsZW1lbnQuY3NzKCdwb3NpdGlvbicpID09PSAnc3RhdGljJykge1xuICAgICAgICAgIG9wdHMuc2Nyb2xsRWxlbWVudC5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHB4KSB7XG4gICAgICAgIGV4cGxpY2l0T2Zmc2V0ID0gZ2V0RXhwbGljaXRPZmZzZXQocHgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNjcm9sbERpciA9IG9wdHMuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAnc2Nyb2xsTGVmdCcgOiBzY3JvbGxEaXI7XG5cbiAgICBpZiAob3B0cy5zY3JvbGxFbGVtZW50KSB7XG4gICAgICAkc2Nyb2xsZXIgPSBvcHRzLnNjcm9sbEVsZW1lbnQ7XG5cbiAgICAgIGlmICghZXhwbGljaXRPZmZzZXQucHggJiYgISgvXig/OkhUTUx8Qk9EWSkkLykudGVzdCgkc2Nyb2xsZXJbMF0ubm9kZU5hbWUpKSB7XG4gICAgICAgIHNjcm9sbGVyT2Zmc2V0ID0gJHNjcm9sbGVyW3Njcm9sbERpcl0oKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjcm9sbGVyID0gJCgnaHRtbCwgYm9keScpLmZpcnN0U2Nyb2xsYWJsZShvcHRzLmRpcmVjdGlvbik7XG4gICAgfVxuXG4gICAgLy8gYmVmb3JlU2Nyb2xsIGNhbGxiYWNrIGZ1bmN0aW9uIG11c3QgZmlyZSBiZWZvcmUgY2FsY3VsYXRpbmcgb2Zmc2V0XG4gICAgb3B0cy5iZWZvcmVTY3JvbGwuY2FsbCgkc2Nyb2xsZXIsIG9wdHMpO1xuXG4gICAgc2Nyb2xsVGFyZ2V0T2Zmc2V0ID0gZXhwbGljaXRPZmZzZXQucHggPyBleHBsaWNpdE9mZnNldCA6IHtcbiAgICAgIHJlbGF0aXZlOiAnJyxcbiAgICAgIHB4OiAoJChvcHRzLnNjcm9sbFRhcmdldClbb2ZmUG9zXSgpICYmICQob3B0cy5zY3JvbGxUYXJnZXQpW29mZlBvc10oKVtvcHRzLmRpcmVjdGlvbl0pIHx8IDBcbiAgICB9O1xuXG4gICAgYW5pUHJvcHNbc2Nyb2xsRGlyXSA9IHNjcm9sbFRhcmdldE9mZnNldC5yZWxhdGl2ZSArIChzY3JvbGxUYXJnZXRPZmZzZXQucHggKyBzY3JvbGxlck9mZnNldCArIG9wdHMub2Zmc2V0KTtcblxuICAgIHNwZWVkID0gb3B0cy5zcGVlZDtcblxuICAgIC8vIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlIHRoZSBzcGVlZCBvZiB0aGUgc2Nyb2xsIGJhc2VkIG9uIGRpc3RhbmNlIC8gY29lZmZpY2llbnRcbiAgICBpZiAoc3BlZWQgPT09ICdhdXRvJykge1xuXG4gICAgICAvLyAkc2Nyb2xsZXJbc2Nyb2xsRGlyXSgpIGlzIHBvc2l0aW9uIGJlZm9yZSBzY3JvbGwsIGFuaVByb3BzW3Njcm9sbERpcl0gaXMgcG9zaXRpb24gYWZ0ZXJcbiAgICAgIC8vIFdoZW4gZGVsdGEgaXMgZ3JlYXRlciwgc3BlZWQgd2lsbCBiZSBncmVhdGVyLlxuICAgICAgZGVsdGEgPSBNYXRoLmFicyhhbmlQcm9wc1tzY3JvbGxEaXJdIC0gJHNjcm9sbGVyW3Njcm9sbERpcl0oKSk7XG5cbiAgICAgIC8vIERpdmlkZSB0aGUgZGVsdGEgYnkgdGhlIGNvZWZmaWNpZW50XG4gICAgICBzcGVlZCA9IGRlbHRhIC8gb3B0cy5hdXRvQ29lZmZpY2llbnQ7XG4gICAgfVxuXG4gICAgYW5pT3B0cyA9IHtcbiAgICAgIGR1cmF0aW9uOiBzcGVlZCxcbiAgICAgIGVhc2luZzogb3B0cy5lYXNpbmcsXG4gICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIG9uQWZ0ZXJTY3JvbGwob3B0cyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChvcHRzLnN0ZXApIHtcbiAgICAgIGFuaU9wdHMuc3RlcCA9IG9wdHMuc3RlcDtcbiAgICB9XG5cbiAgICBpZiAoJHNjcm9sbGVyLmxlbmd0aCkge1xuICAgICAgJHNjcm9sbGVyLnN0b3AoKS5hbmltYXRlKGFuaVByb3BzLCBhbmlPcHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb25BZnRlclNjcm9sbChvcHRzKTtcbiAgICB9XG4gIH07XG5cbiAgJC5zbW9vdGhTY3JvbGwudmVyc2lvbiA9IHZlcnNpb247XG4gICQuc21vb3RoU2Nyb2xsLmZpbHRlclBhdGggPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICBzdHJpbmcgPSBzdHJpbmcgfHwgJyc7XG5cbiAgICByZXR1cm4gc3RyaW5nXG4gICAgICAucmVwbGFjZSgvXlxcLy8sICcnKVxuICAgICAgLnJlcGxhY2UoLyg/OmluZGV4fGRlZmF1bHQpLlthLXpBLVpdezMsNH0kLywgJycpXG4gICAgICAucmVwbGFjZSgvXFwvJC8sICcnKTtcbiAgfTtcblxuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgJC5mbi5zbW9vdGhTY3JvbGwuZGVmYXVsdHMgPSBkZWZhdWx0cztcblxufSkpO1xuIiwiLyohXG5XYXlwb2ludHMgLSA0LjAuMVxuQ29weXJpZ2h0IMKpIDIwMTEtMjAxNiBDYWxlYiBUcm91Z2h0b25cbkxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbmh0dHBzOi8vZ2l0aHViLmNvbS9pbWFrZXdlYnRoaW5ncy93YXlwb2ludHMvYmxvYi9tYXN0ZXIvbGljZW5zZXMudHh0XG4qL1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICB2YXIga2V5Q291bnRlciA9IDBcbiAgdmFyIGFsbFdheXBvaW50cyA9IHt9XG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3dheXBvaW50ICovXG4gIGZ1bmN0aW9uIFdheXBvaW50KG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gb3B0aW9ucyBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3InKVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMuZWxlbWVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBlbGVtZW50IG9wdGlvbiBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3InKVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMuaGFuZGxlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBoYW5kbGVyIG9wdGlvbiBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3InKVxuICAgIH1cblxuICAgIHRoaXMua2V5ID0gJ3dheXBvaW50LScgKyBrZXlDb3VudGVyXG4gICAgdGhpcy5vcHRpb25zID0gV2F5cG9pbnQuQWRhcHRlci5leHRlbmQoe30sIFdheXBvaW50LmRlZmF1bHRzLCBvcHRpb25zKVxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMub3B0aW9ucy5lbGVtZW50XG4gICAgdGhpcy5hZGFwdGVyID0gbmV3IFdheXBvaW50LkFkYXB0ZXIodGhpcy5lbGVtZW50KVxuICAgIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmhhbmRsZXJcbiAgICB0aGlzLmF4aXMgPSB0aGlzLm9wdGlvbnMuaG9yaXpvbnRhbCA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCdcbiAgICB0aGlzLmVuYWJsZWQgPSB0aGlzLm9wdGlvbnMuZW5hYmxlZFxuICAgIHRoaXMudHJpZ2dlclBvaW50ID0gbnVsbFxuICAgIHRoaXMuZ3JvdXAgPSBXYXlwb2ludC5Hcm91cC5maW5kT3JDcmVhdGUoe1xuICAgICAgbmFtZTogdGhpcy5vcHRpb25zLmdyb3VwLFxuICAgICAgYXhpczogdGhpcy5heGlzXG4gICAgfSlcbiAgICB0aGlzLmNvbnRleHQgPSBXYXlwb2ludC5Db250ZXh0LmZpbmRPckNyZWF0ZUJ5RWxlbWVudCh0aGlzLm9wdGlvbnMuY29udGV4dClcblxuICAgIGlmIChXYXlwb2ludC5vZmZzZXRBbGlhc2VzW3RoaXMub3B0aW9ucy5vZmZzZXRdKSB7XG4gICAgICB0aGlzLm9wdGlvbnMub2Zmc2V0ID0gV2F5cG9pbnQub2Zmc2V0QWxpYXNlc1t0aGlzLm9wdGlvbnMub2Zmc2V0XVxuICAgIH1cbiAgICB0aGlzLmdyb3VwLmFkZCh0aGlzKVxuICAgIHRoaXMuY29udGV4dC5hZGQodGhpcylcbiAgICBhbGxXYXlwb2ludHNbdGhpcy5rZXldID0gdGhpc1xuICAgIGtleUNvdW50ZXIgKz0gMVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUucXVldWVUcmlnZ2VyID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5ncm91cC5xdWV1ZVRyaWdnZXIodGhpcywgZGlyZWN0aW9uKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICh0aGlzLmNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kZXN0cm95ICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250ZXh0LnJlbW92ZSh0aGlzKVxuICAgIHRoaXMuZ3JvdXAucmVtb3ZlKHRoaXMpXG4gICAgZGVsZXRlIGFsbFdheXBvaW50c1t0aGlzLmtleV1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZGlzYWJsZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZW5hYmxlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRleHQucmVmcmVzaCgpXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL25leHQgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5ncm91cC5uZXh0KHRoaXMpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3ByZXZpb3VzICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5wcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdyb3VwLnByZXZpb3VzKHRoaXMpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50Lmludm9rZUFsbCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIHZhciBhbGxXYXlwb2ludHNBcnJheSA9IFtdXG4gICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gYWxsV2F5cG9pbnRzKSB7XG4gICAgICBhbGxXYXlwb2ludHNBcnJheS5wdXNoKGFsbFdheXBvaW50c1t3YXlwb2ludEtleV0pXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBhbGxXYXlwb2ludHNBcnJheS5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgYWxsV2F5cG9pbnRzQXJyYXlbaV1bbWV0aG9kXSgpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kZXN0cm95LWFsbCAqL1xuICBXYXlwb2ludC5kZXN0cm95QWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuaW52b2tlQWxsKCdkZXN0cm95JylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZGlzYWJsZS1hbGwgKi9cbiAgV2F5cG9pbnQuZGlzYWJsZUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50Lmludm9rZUFsbCgnZGlzYWJsZScpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2VuYWJsZS1hbGwgKi9cbiAgV2F5cG9pbnQuZW5hYmxlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiBhbGxXYXlwb2ludHMpIHtcbiAgICAgIGFsbFdheXBvaW50c1t3YXlwb2ludEtleV0uZW5hYmxlZCA9IHRydWVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvcmVmcmVzaC1hbGwgKi9cbiAgV2F5cG9pbnQucmVmcmVzaEFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50LkNvbnRleHQucmVmcmVzaEFsbCgpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3ZpZXdwb3J0LWhlaWdodCAqL1xuICBXYXlwb2ludC52aWV3cG9ydEhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS92aWV3cG9ydC13aWR0aCAqL1xuICBXYXlwb2ludC52aWV3cG9ydFdpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aFxuICB9XG5cbiAgV2F5cG9pbnQuYWRhcHRlcnMgPSBbXVxuXG4gIFdheXBvaW50LmRlZmF1bHRzID0ge1xuICAgIGNvbnRleHQ6IHdpbmRvdyxcbiAgICBjb250aW51b3VzOiB0cnVlLFxuICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgZ3JvdXA6ICdkZWZhdWx0JyxcbiAgICBob3Jpem9udGFsOiBmYWxzZSxcbiAgICBvZmZzZXQ6IDBcbiAgfVxuXG4gIFdheXBvaW50Lm9mZnNldEFsaWFzZXMgPSB7XG4gICAgJ2JvdHRvbS1pbi12aWV3JzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmlubmVySGVpZ2h0KCkgLSB0aGlzLmFkYXB0ZXIub3V0ZXJIZWlnaHQoKVxuICAgIH0sXG4gICAgJ3JpZ2h0LWluLXZpZXcnOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuaW5uZXJXaWR0aCgpIC0gdGhpcy5hZGFwdGVyLm91dGVyV2lkdGgoKVxuICAgIH1cbiAgfVxuXG4gIHdpbmRvdy5XYXlwb2ludCA9IFdheXBvaW50XG59KCkpXG47KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICBmdW5jdGlvbiByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTaGltKGNhbGxiYWNrKSB7XG4gICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MClcbiAgfVxuXG4gIHZhciBrZXlDb3VudGVyID0gMFxuICB2YXIgY29udGV4dHMgPSB7fVxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcbiAgdmFyIG9sZFdpbmRvd0xvYWQgPSB3aW5kb3cub25sb2FkXG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQgKi9cbiAgZnVuY3Rpb24gQ29udGV4dChlbGVtZW50KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxuICAgIHRoaXMuQWRhcHRlciA9IFdheXBvaW50LkFkYXB0ZXJcbiAgICB0aGlzLmFkYXB0ZXIgPSBuZXcgdGhpcy5BZGFwdGVyKGVsZW1lbnQpXG4gICAgdGhpcy5rZXkgPSAnd2F5cG9pbnQtY29udGV4dC0nICsga2V5Q291bnRlclxuICAgIHRoaXMuZGlkU2Nyb2xsID0gZmFsc2VcbiAgICB0aGlzLmRpZFJlc2l6ZSA9IGZhbHNlXG4gICAgdGhpcy5vbGRTY3JvbGwgPSB7XG4gICAgICB4OiB0aGlzLmFkYXB0ZXIuc2Nyb2xsTGVmdCgpLFxuICAgICAgeTogdGhpcy5hZGFwdGVyLnNjcm9sbFRvcCgpXG4gICAgfVxuICAgIHRoaXMud2F5cG9pbnRzID0ge1xuICAgICAgdmVydGljYWw6IHt9LFxuICAgICAgaG9yaXpvbnRhbDoge31cbiAgICB9XG5cbiAgICBlbGVtZW50LndheXBvaW50Q29udGV4dEtleSA9IHRoaXMua2V5XG4gICAgY29udGV4dHNbZWxlbWVudC53YXlwb2ludENvbnRleHRLZXldID0gdGhpc1xuICAgIGtleUNvdW50ZXIgKz0gMVxuICAgIGlmICghV2F5cG9pbnQud2luZG93Q29udGV4dCkge1xuICAgICAgV2F5cG9pbnQud2luZG93Q29udGV4dCA9IHRydWVcbiAgICAgIFdheXBvaW50LndpbmRvd0NvbnRleHQgPSBuZXcgQ29udGV4dCh3aW5kb3cpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyKClcbiAgICB0aGlzLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHZhciBheGlzID0gd2F5cG9pbnQub3B0aW9ucy5ob3Jpem9udGFsID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ1xuICAgIHRoaXMud2F5cG9pbnRzW2F4aXNdW3dheXBvaW50LmtleV0gPSB3YXlwb2ludFxuICAgIHRoaXMucmVmcmVzaCgpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmNoZWNrRW1wdHkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaG9yaXpvbnRhbEVtcHR5ID0gdGhpcy5BZGFwdGVyLmlzRW1wdHlPYmplY3QodGhpcy53YXlwb2ludHMuaG9yaXpvbnRhbClcbiAgICB2YXIgdmVydGljYWxFbXB0eSA9IHRoaXMuQWRhcHRlci5pc0VtcHR5T2JqZWN0KHRoaXMud2F5cG9pbnRzLnZlcnRpY2FsKVxuICAgIHZhciBpc1dpbmRvdyA9IHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93XG4gICAgaWYgKGhvcml6b250YWxFbXB0eSAmJiB2ZXJ0aWNhbEVtcHR5ICYmICFpc1dpbmRvdykge1xuICAgICAgdGhpcy5hZGFwdGVyLm9mZignLndheXBvaW50cycpXG4gICAgICBkZWxldGUgY29udGV4dHNbdGhpcy5rZXldXG4gICAgfVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5jcmVhdGVUaHJvdHRsZWRSZXNpemVIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgICBmdW5jdGlvbiByZXNpemVIYW5kbGVyKCkge1xuICAgICAgc2VsZi5oYW5kbGVSZXNpemUoKVxuICAgICAgc2VsZi5kaWRSZXNpemUgPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuYWRhcHRlci5vbigncmVzaXplLndheXBvaW50cycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFzZWxmLmRpZFJlc2l6ZSkge1xuICAgICAgICBzZWxmLmRpZFJlc2l6ZSA9IHRydWVcbiAgICAgICAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlc2l6ZUhhbmRsZXIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuY3JlYXRlVGhyb3R0bGVkU2Nyb2xsSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIGZ1bmN0aW9uIHNjcm9sbEhhbmRsZXIoKSB7XG4gICAgICBzZWxmLmhhbmRsZVNjcm9sbCgpXG4gICAgICBzZWxmLmRpZFNjcm9sbCA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5hZGFwdGVyLm9uKCdzY3JvbGwud2F5cG9pbnRzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXNlbGYuZGlkU2Nyb2xsIHx8IFdheXBvaW50LmlzVG91Y2gpIHtcbiAgICAgICAgc2VsZi5kaWRTY3JvbGwgPSB0cnVlXG4gICAgICAgIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZShzY3JvbGxIYW5kbGVyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmhhbmRsZVJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50LkNvbnRleHQucmVmcmVzaEFsbCgpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmhhbmRsZVNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cmlnZ2VyZWRHcm91cHMgPSB7fVxuICAgIHZhciBheGVzID0ge1xuICAgICAgaG9yaXpvbnRhbDoge1xuICAgICAgICBuZXdTY3JvbGw6IHRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgZm9yd2FyZDogJ3JpZ2h0JyxcbiAgICAgICAgYmFja3dhcmQ6ICdsZWZ0J1xuICAgICAgfSxcbiAgICAgIHZlcnRpY2FsOiB7XG4gICAgICAgIG5ld1Njcm9sbDogdGhpcy5hZGFwdGVyLnNjcm9sbFRvcCgpLFxuICAgICAgICBvbGRTY3JvbGw6IHRoaXMub2xkU2Nyb2xsLnksXG4gICAgICAgIGZvcndhcmQ6ICdkb3duJyxcbiAgICAgICAgYmFja3dhcmQ6ICd1cCdcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBheGlzS2V5IGluIGF4ZXMpIHtcbiAgICAgIHZhciBheGlzID0gYXhlc1theGlzS2V5XVxuICAgICAgdmFyIGlzRm9yd2FyZCA9IGF4aXMubmV3U2Nyb2xsID4gYXhpcy5vbGRTY3JvbGxcbiAgICAgIHZhciBkaXJlY3Rpb24gPSBpc0ZvcndhcmQgPyBheGlzLmZvcndhcmQgOiBheGlzLmJhY2t3YXJkXG5cbiAgICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIHRoaXMud2F5cG9pbnRzW2F4aXNLZXldKSB7XG4gICAgICAgIHZhciB3YXlwb2ludCA9IHRoaXMud2F5cG9pbnRzW2F4aXNLZXldW3dheXBvaW50S2V5XVxuICAgICAgICBpZiAod2F5cG9pbnQudHJpZ2dlclBvaW50ID09PSBudWxsKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICB2YXIgd2FzQmVmb3JlVHJpZ2dlclBvaW50ID0gYXhpcy5vbGRTY3JvbGwgPCB3YXlwb2ludC50cmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIG5vd0FmdGVyVHJpZ2dlclBvaW50ID0gYXhpcy5uZXdTY3JvbGwgPj0gd2F5cG9pbnQudHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBjcm9zc2VkRm9yd2FyZCA9IHdhc0JlZm9yZVRyaWdnZXJQb2ludCAmJiBub3dBZnRlclRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgY3Jvc3NlZEJhY2t3YXJkID0gIXdhc0JlZm9yZVRyaWdnZXJQb2ludCAmJiAhbm93QWZ0ZXJUcmlnZ2VyUG9pbnRcbiAgICAgICAgaWYgKGNyb3NzZWRGb3J3YXJkIHx8IGNyb3NzZWRCYWNrd2FyZCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihkaXJlY3Rpb24pXG4gICAgICAgICAgdHJpZ2dlcmVkR3JvdXBzW3dheXBvaW50Lmdyb3VwLmlkXSA9IHdheXBvaW50Lmdyb3VwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBncm91cEtleSBpbiB0cmlnZ2VyZWRHcm91cHMpIHtcbiAgICAgIHRyaWdnZXJlZEdyb3Vwc1tncm91cEtleV0uZmx1c2hUcmlnZ2VycygpXG4gICAgfVxuXG4gICAgdGhpcy5vbGRTY3JvbGwgPSB7XG4gICAgICB4OiBheGVzLmhvcml6b250YWwubmV3U2Nyb2xsLFxuICAgICAgeTogYXhlcy52ZXJ0aWNhbC5uZXdTY3JvbGxcbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmlubmVySGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgLyplc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cbiAgICBpZiAodGhpcy5lbGVtZW50ID09IHRoaXMuZWxlbWVudC53aW5kb3cpIHtcbiAgICAgIHJldHVybiBXYXlwb2ludC52aWV3cG9ydEhlaWdodCgpXG4gICAgfVxuICAgIC8qZXNsaW50LWVuYWJsZSBlcWVxZXEgKi9cbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmlubmVySGVpZ2h0KClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICBkZWxldGUgdGhpcy53YXlwb2ludHNbd2F5cG9pbnQuYXhpc11bd2F5cG9pbnQua2V5XVxuICAgIHRoaXMuY2hlY2tFbXB0eSgpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmlubmVyV2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIGlmICh0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvdykge1xuICAgICAgcmV0dXJuIFdheXBvaW50LnZpZXdwb3J0V2lkdGgoKVxuICAgIH1cbiAgICAvKmVzbGludC1lbmFibGUgZXFlcWVxICovXG4gICAgcmV0dXJuIHRoaXMuYWRhcHRlci5pbm5lcldpZHRoKClcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dC1kZXN0cm95ICovXG4gIENvbnRleHQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWxsV2F5cG9pbnRzID0gW11cbiAgICBmb3IgKHZhciBheGlzIGluIHRoaXMud2F5cG9pbnRzKSB7XG4gICAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiB0aGlzLndheXBvaW50c1theGlzXSkge1xuICAgICAgICBhbGxXYXlwb2ludHMucHVzaCh0aGlzLndheXBvaW50c1theGlzXVt3YXlwb2ludEtleV0pXG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBhbGxXYXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIGFsbFdheXBvaW50c1tpXS5kZXN0cm95KClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQtcmVmcmVzaCAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgLyplc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cbiAgICB2YXIgaXNXaW5kb3cgPSB0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvd1xuICAgIC8qZXNsaW50LWVuYWJsZSBlcWVxZXEgKi9cbiAgICB2YXIgY29udGV4dE9mZnNldCA9IGlzV2luZG93ID8gdW5kZWZpbmVkIDogdGhpcy5hZGFwdGVyLm9mZnNldCgpXG4gICAgdmFyIHRyaWdnZXJlZEdyb3VwcyA9IHt9XG4gICAgdmFyIGF4ZXNcblxuICAgIHRoaXMuaGFuZGxlU2Nyb2xsKClcbiAgICBheGVzID0ge1xuICAgICAgaG9yaXpvbnRhbDoge1xuICAgICAgICBjb250ZXh0T2Zmc2V0OiBpc1dpbmRvdyA/IDAgOiBjb250ZXh0T2Zmc2V0LmxlZnQsXG4gICAgICAgIGNvbnRleHRTY3JvbGw6IGlzV2luZG93ID8gMCA6IHRoaXMub2xkU2Nyb2xsLngsXG4gICAgICAgIGNvbnRleHREaW1lbnNpb246IHRoaXMuaW5uZXJXaWR0aCgpLFxuICAgICAgICBvbGRTY3JvbGw6IHRoaXMub2xkU2Nyb2xsLngsXG4gICAgICAgIGZvcndhcmQ6ICdyaWdodCcsXG4gICAgICAgIGJhY2t3YXJkOiAnbGVmdCcsXG4gICAgICAgIG9mZnNldFByb3A6ICdsZWZ0J1xuICAgICAgfSxcbiAgICAgIHZlcnRpY2FsOiB7XG4gICAgICAgIGNvbnRleHRPZmZzZXQ6IGlzV2luZG93ID8gMCA6IGNvbnRleHRPZmZzZXQudG9wLFxuICAgICAgICBjb250ZXh0U2Nyb2xsOiBpc1dpbmRvdyA/IDAgOiB0aGlzLm9sZFNjcm9sbC55LFxuICAgICAgICBjb250ZXh0RGltZW5zaW9uOiB0aGlzLmlubmVySGVpZ2h0KCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueSxcbiAgICAgICAgZm9yd2FyZDogJ2Rvd24nLFxuICAgICAgICBiYWNrd2FyZDogJ3VwJyxcbiAgICAgICAgb2Zmc2V0UHJvcDogJ3RvcCdcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBheGlzS2V5IGluIGF4ZXMpIHtcbiAgICAgIHZhciBheGlzID0gYXhlc1theGlzS2V5XVxuICAgICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gdGhpcy53YXlwb2ludHNbYXhpc0tleV0pIHtcbiAgICAgICAgdmFyIHdheXBvaW50ID0gdGhpcy53YXlwb2ludHNbYXhpc0tleV1bd2F5cG9pbnRLZXldXG4gICAgICAgIHZhciBhZGp1c3RtZW50ID0gd2F5cG9pbnQub3B0aW9ucy5vZmZzZXRcbiAgICAgICAgdmFyIG9sZFRyaWdnZXJQb2ludCA9IHdheXBvaW50LnRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgZWxlbWVudE9mZnNldCA9IDBcbiAgICAgICAgdmFyIGZyZXNoV2F5cG9pbnQgPSBvbGRUcmlnZ2VyUG9pbnQgPT0gbnVsbFxuICAgICAgICB2YXIgY29udGV4dE1vZGlmaWVyLCB3YXNCZWZvcmVTY3JvbGwsIG5vd0FmdGVyU2Nyb2xsXG4gICAgICAgIHZhciB0cmlnZ2VyZWRCYWNrd2FyZCwgdHJpZ2dlcmVkRm9yd2FyZFxuXG4gICAgICAgIGlmICh3YXlwb2ludC5lbGVtZW50ICE9PSB3YXlwb2ludC5lbGVtZW50LndpbmRvdykge1xuICAgICAgICAgIGVsZW1lbnRPZmZzZXQgPSB3YXlwb2ludC5hZGFwdGVyLm9mZnNldCgpW2F4aXMub2Zmc2V0UHJvcF1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgYWRqdXN0bWVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGFkanVzdG1lbnQgPSBhZGp1c3RtZW50LmFwcGx5KHdheXBvaW50KVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBhZGp1c3RtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGFkanVzdG1lbnQgPSBwYXJzZUZsb2F0KGFkanVzdG1lbnQpXG4gICAgICAgICAgaWYgKHdheXBvaW50Lm9wdGlvbnMub2Zmc2V0LmluZGV4T2YoJyUnKSA+IC0gMSkge1xuICAgICAgICAgICAgYWRqdXN0bWVudCA9IE1hdGguY2VpbChheGlzLmNvbnRleHREaW1lbnNpb24gKiBhZGp1c3RtZW50IC8gMTAwKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHRNb2RpZmllciA9IGF4aXMuY29udGV4dFNjcm9sbCAtIGF4aXMuY29udGV4dE9mZnNldFxuICAgICAgICB3YXlwb2ludC50cmlnZ2VyUG9pbnQgPSBNYXRoLmZsb29yKGVsZW1lbnRPZmZzZXQgKyBjb250ZXh0TW9kaWZpZXIgLSBhZGp1c3RtZW50KVxuICAgICAgICB3YXNCZWZvcmVTY3JvbGwgPSBvbGRUcmlnZ2VyUG9pbnQgPCBheGlzLm9sZFNjcm9sbFxuICAgICAgICBub3dBZnRlclNjcm9sbCA9IHdheXBvaW50LnRyaWdnZXJQb2ludCA+PSBheGlzLm9sZFNjcm9sbFxuICAgICAgICB0cmlnZ2VyZWRCYWNrd2FyZCA9IHdhc0JlZm9yZVNjcm9sbCAmJiBub3dBZnRlclNjcm9sbFxuICAgICAgICB0cmlnZ2VyZWRGb3J3YXJkID0gIXdhc0JlZm9yZVNjcm9sbCAmJiAhbm93QWZ0ZXJTY3JvbGxcblxuICAgICAgICBpZiAoIWZyZXNoV2F5cG9pbnQgJiYgdHJpZ2dlcmVkQmFja3dhcmQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoYXhpcy5iYWNrd2FyZClcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghZnJlc2hXYXlwb2ludCAmJiB0cmlnZ2VyZWRGb3J3YXJkKSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGF4aXMuZm9yd2FyZClcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmcmVzaFdheXBvaW50ICYmIGF4aXMub2xkU2Nyb2xsID49IHdheXBvaW50LnRyaWdnZXJQb2ludCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihheGlzLmZvcndhcmQpXG4gICAgICAgICAgdHJpZ2dlcmVkR3JvdXBzW3dheXBvaW50Lmdyb3VwLmlkXSA9IHdheXBvaW50Lmdyb3VwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBncm91cEtleSBpbiB0cmlnZ2VyZWRHcm91cHMpIHtcbiAgICAgICAgdHJpZ2dlcmVkR3JvdXBzW2dyb3VwS2V5XS5mbHVzaFRyaWdnZXJzKClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5maW5kT3JDcmVhdGVCeUVsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIENvbnRleHQuZmluZEJ5RWxlbWVudChlbGVtZW50KSB8fCBuZXcgQ29udGV4dChlbGVtZW50KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnJlZnJlc2hBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBjb250ZXh0SWQgaW4gY29udGV4dHMpIHtcbiAgICAgIGNvbnRleHRzW2NvbnRleHRJZF0ucmVmcmVzaCgpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0LWZpbmQtYnktZWxlbWVudCAqL1xuICBDb250ZXh0LmZpbmRCeUVsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIGNvbnRleHRzW2VsZW1lbnQud2F5cG9pbnRDb250ZXh0S2V5XVxuICB9XG5cbiAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChvbGRXaW5kb3dMb2FkKSB7XG4gICAgICBvbGRXaW5kb3dMb2FkKClcbiAgICB9XG4gICAgQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG5cbiAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxdWVzdEZuID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lU2hpbVxuICAgIHJlcXVlc3RGbi5jYWxsKHdpbmRvdywgY2FsbGJhY2spXG4gIH1cbiAgV2F5cG9pbnQuQ29udGV4dCA9IENvbnRleHRcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGZ1bmN0aW9uIGJ5VHJpZ2dlclBvaW50KGEsIGIpIHtcbiAgICByZXR1cm4gYS50cmlnZ2VyUG9pbnQgLSBiLnRyaWdnZXJQb2ludFxuICB9XG5cbiAgZnVuY3Rpb24gYnlSZXZlcnNlVHJpZ2dlclBvaW50KGEsIGIpIHtcbiAgICByZXR1cm4gYi50cmlnZ2VyUG9pbnQgLSBhLnRyaWdnZXJQb2ludFxuICB9XG5cbiAgdmFyIGdyb3VwcyA9IHtcbiAgICB2ZXJ0aWNhbDoge30sXG4gICAgaG9yaXpvbnRhbDoge31cbiAgfVxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZ3JvdXAgKi9cbiAgZnVuY3Rpb24gR3JvdXAob3B0aW9ucykge1xuICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZVxuICAgIHRoaXMuYXhpcyA9IG9wdGlvbnMuYXhpc1xuICAgIHRoaXMuaWQgPSB0aGlzLm5hbWUgKyAnLScgKyB0aGlzLmF4aXNcbiAgICB0aGlzLndheXBvaW50cyA9IFtdXG4gICAgdGhpcy5jbGVhclRyaWdnZXJRdWV1ZXMoKVxuICAgIGdyb3Vwc1t0aGlzLmF4aXNdW3RoaXMubmFtZV0gPSB0aGlzXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHRoaXMud2F5cG9pbnRzLnB1c2god2F5cG9pbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5jbGVhclRyaWdnZXJRdWV1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRyaWdnZXJRdWV1ZXMgPSB7XG4gICAgICB1cDogW10sXG4gICAgICBkb3duOiBbXSxcbiAgICAgIGxlZnQ6IFtdLFxuICAgICAgcmlnaHQ6IFtdXG4gICAgfVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUuZmx1c2hUcmlnZ2VycyA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGRpcmVjdGlvbiBpbiB0aGlzLnRyaWdnZXJRdWV1ZXMpIHtcbiAgICAgIHZhciB3YXlwb2ludHMgPSB0aGlzLnRyaWdnZXJRdWV1ZXNbZGlyZWN0aW9uXVxuICAgICAgdmFyIHJldmVyc2UgPSBkaXJlY3Rpb24gPT09ICd1cCcgfHwgZGlyZWN0aW9uID09PSAnbGVmdCdcbiAgICAgIHdheXBvaW50cy5zb3J0KHJldmVyc2UgPyBieVJldmVyc2VUcmlnZ2VyUG9pbnQgOiBieVRyaWdnZXJQb2ludClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB3YXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIHdheXBvaW50ID0gd2F5cG9pbnRzW2ldXG4gICAgICAgIGlmICh3YXlwb2ludC5vcHRpb25zLmNvbnRpbnVvdXMgfHwgaSA9PT0gd2F5cG9pbnRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB3YXlwb2ludC50cmlnZ2VyKFtkaXJlY3Rpb25dKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY2xlYXJUcmlnZ2VyUXVldWVzKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHRoaXMud2F5cG9pbnRzLnNvcnQoYnlUcmlnZ2VyUG9pbnQpXG4gICAgdmFyIGluZGV4ID0gV2F5cG9pbnQuQWRhcHRlci5pbkFycmF5KHdheXBvaW50LCB0aGlzLndheXBvaW50cylcbiAgICB2YXIgaXNMYXN0ID0gaW5kZXggPT09IHRoaXMud2F5cG9pbnRzLmxlbmd0aCAtIDFcbiAgICByZXR1cm4gaXNMYXN0ID8gbnVsbCA6IHRoaXMud2F5cG9pbnRzW2luZGV4ICsgMV1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLnByZXZpb3VzID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB0aGlzLndheXBvaW50cy5zb3J0KGJ5VHJpZ2dlclBvaW50KVxuICAgIHZhciBpbmRleCA9IFdheXBvaW50LkFkYXB0ZXIuaW5BcnJheSh3YXlwb2ludCwgdGhpcy53YXlwb2ludHMpXG4gICAgcmV0dXJuIGluZGV4ID8gdGhpcy53YXlwb2ludHNbaW5kZXggLSAxXSA6IG51bGxcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLnF1ZXVlVHJpZ2dlciA9IGZ1bmN0aW9uKHdheXBvaW50LCBkaXJlY3Rpb24pIHtcbiAgICB0aGlzLnRyaWdnZXJRdWV1ZXNbZGlyZWN0aW9uXS5wdXNoKHdheXBvaW50KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB2YXIgaW5kZXggPSBXYXlwb2ludC5BZGFwdGVyLmluQXJyYXkod2F5cG9pbnQsIHRoaXMud2F5cG9pbnRzKVxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLndheXBvaW50cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9maXJzdCAqL1xuICBHcm91cC5wcm90b3R5cGUuZmlyc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy53YXlwb2ludHNbMF1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvbGFzdCAqL1xuICBHcm91cC5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLndheXBvaW50c1t0aGlzLndheXBvaW50cy5sZW5ndGggLSAxXVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5maW5kT3JDcmVhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgcmV0dXJuIGdyb3Vwc1tvcHRpb25zLmF4aXNdW29wdGlvbnMubmFtZV0gfHwgbmV3IEdyb3VwKG9wdGlvbnMpXG4gIH1cblxuICBXYXlwb2ludC5Hcm91cCA9IEdyb3VwXG59KCkpXG47KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICB2YXIgJCA9IHdpbmRvdy5qUXVlcnlcbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG5cbiAgZnVuY3Rpb24gSlF1ZXJ5QWRhcHRlcihlbGVtZW50KSB7XG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudClcbiAgfVxuXG4gICQuZWFjaChbXG4gICAgJ2lubmVySGVpZ2h0JyxcbiAgICAnaW5uZXJXaWR0aCcsXG4gICAgJ29mZicsXG4gICAgJ29mZnNldCcsXG4gICAgJ29uJyxcbiAgICAnb3V0ZXJIZWlnaHQnLFxuICAgICdvdXRlcldpZHRoJyxcbiAgICAnc2Nyb2xsTGVmdCcsXG4gICAgJ3Njcm9sbFRvcCdcbiAgXSwgZnVuY3Rpb24oaSwgbWV0aG9kKSB7XG4gICAgSlF1ZXJ5QWRhcHRlci5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgICByZXR1cm4gdGhpcy4kZWxlbWVudFttZXRob2RdLmFwcGx5KHRoaXMuJGVsZW1lbnQsIGFyZ3MpXG4gICAgfVxuICB9KVxuXG4gICQuZWFjaChbXG4gICAgJ2V4dGVuZCcsXG4gICAgJ2luQXJyYXknLFxuICAgICdpc0VtcHR5T2JqZWN0J1xuICBdLCBmdW5jdGlvbihpLCBtZXRob2QpIHtcbiAgICBKUXVlcnlBZGFwdGVyW21ldGhvZF0gPSAkW21ldGhvZF1cbiAgfSlcblxuICBXYXlwb2ludC5hZGFwdGVycy5wdXNoKHtcbiAgICBuYW1lOiAnanF1ZXJ5JyxcbiAgICBBZGFwdGVyOiBKUXVlcnlBZGFwdGVyXG4gIH0pXG4gIFdheXBvaW50LkFkYXB0ZXIgPSBKUXVlcnlBZGFwdGVyXG59KCkpXG47KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICBmdW5jdGlvbiBjcmVhdGVFeHRlbnNpb24oZnJhbWV3b3JrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHdheXBvaW50cyA9IFtdXG4gICAgICB2YXIgb3ZlcnJpZGVzID0gYXJndW1lbnRzWzBdXG5cbiAgICAgIGlmIChmcmFtZXdvcmsuaXNGdW5jdGlvbihhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG92ZXJyaWRlcyA9IGZyYW1ld29yay5leHRlbmQoe30sIGFyZ3VtZW50c1sxXSlcbiAgICAgICAgb3ZlcnJpZGVzLmhhbmRsZXIgPSBhcmd1bWVudHNbMF1cbiAgICAgIH1cblxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IGZyYW1ld29yay5leHRlbmQoe30sIG92ZXJyaWRlcywge1xuICAgICAgICAgIGVsZW1lbnQ6IHRoaXNcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNvbnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgb3B0aW9ucy5jb250ZXh0ID0gZnJhbWV3b3JrKHRoaXMpLmNsb3Nlc3Qob3B0aW9ucy5jb250ZXh0KVswXVxuICAgICAgICB9XG4gICAgICAgIHdheXBvaW50cy5wdXNoKG5ldyBXYXlwb2ludChvcHRpb25zKSlcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiB3YXlwb2ludHNcbiAgICB9XG4gIH1cblxuICBpZiAod2luZG93LmpRdWVyeSkge1xuICAgIHdpbmRvdy5qUXVlcnkuZm4ud2F5cG9pbnQgPSBjcmVhdGVFeHRlbnNpb24od2luZG93LmpRdWVyeSlcbiAgfVxuICBpZiAod2luZG93LlplcHRvKSB7XG4gICAgd2luZG93LlplcHRvLmZuLndheXBvaW50ID0gY3JlYXRlRXh0ZW5zaW9uKHdpbmRvdy5aZXB0bylcbiAgfVxufSgpKVxuOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuICAgICQoXCIubGF6eVwiKS5yZWNsaW5lcih7XG4gICAgICAgIGF0dHJpYjogXCJkYXRhLXNyY1wiLCAvLyBzZWxlY3RvciBmb3IgYXR0cmlidXRlIGNvbnRhaW5pbmcgdGhlIG1lZGlhIHNyY1xuICAgICAgICB0aHJvdHRsZTogMzAwLCAgICAgIC8vIG1pbGxpc2Vjb25kIGludGVydmFsIGF0IHdoaWNoIHRvIHByb2Nlc3MgZXZlbnRzXG4gICAgICAgIHRocmVzaG9sZDogMTAwLCAgICAgLy8gc2Nyb2xsIGRpc3RhbmNlIGZyb20gZWxlbWVudCBiZWZvcmUgaXRzIGxvYWRlZFxuICAgICAgICBwcmludGFibGU6IHRydWUsICAgIC8vIGJlIHByaW50ZXIgZnJpZW5kbHkgYW5kIHNob3cgYWxsIGVsZW1lbnRzIG9uIGRvY3VtZW50IHByaW50XG4gICAgICAgIGxpdmU6IHRydWUgICAgICAgICAgLy8gYXV0byBiaW5kIGxhenkgbG9hZGluZyB0byBhamF4IGxvYWRlZCBlbGVtZW50c1xuICAgIH0pO1xuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdsYXp5bG9hZCcsICcubGF6eScsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGUgPSAkKHRoaXMpO1xuICAgICAgICAvLyBkbyBzb21ldGhpbmcgd2l0aCB0aGUgZWxlbWVudCB0byBiZSBsb2FkZWQuLi5cbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2xhenlsb2FkJywgJGUpO1xuICAgIH0pO1xuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JzsgICAgXG4gICAgXG4gICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi12aWRlb3MgLnNsaWNrJyApO1xuICAgIFxuICAgICQoJy5zZWN0aW9uLXZpZGVvcyAuc2xpY2snKS5zbGljayh7XG4gICAgICBkb3RzOiBmYWxzZSxcbiAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgIHNsaWRlc1RvU2hvdzogMixcbiAgICAgIHNsaWRlc1RvU2Nyb2xsOiAyLFxuICAgICAgYXBwZW5kQXJyb3dzOiAkKCcuc2VjdGlvbi12aWRlb3MgLnNsaWNrLWFycm93cycpLFxuICAgICAgcmVzcG9uc2l2ZTogW1xuICAgICAgICB7XG4gICAgICAgICAgYnJlYWtwb2ludDogOTc5LFxuICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pOyAgXG4gICAgXG4gICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi1zdG9yaWVzIC5zbGljaycgKTtcbiAgICBcbiAgICAkKCcuc2VjdGlvbi1zdG9yaWVzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICBzcGVlZDogMzAwLFxuICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zZWN0aW9uLXN0b3JpZXMgLnNsaWNrLWFycm93cycpXG4gICAgfSk7XG4gICAgXG4gICAgXG4gICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi1jb3JlLWJlaGF2aW9ycyAuc2xpY2snICk7XG4gICAgXG4gICAgJCgnLnNlY3Rpb24tY29yZS1iZWhhdmlvcnMgLnNsaWNrJykuc2xpY2soe1xuICAgICAgICBmYWRlOiB0cnVlLFxuICAgICAgICBkb3RzOiB0cnVlLFxuICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IGZhbHNlLFxuICAgICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zZWN0aW9uLWNvcmUtYmVoYXZpb3JzIC5zbGljay1hcnJvd3MnKVxuICAgIH0pO1xuICAgIFxuICAgICQoJy5zZWN0aW9uLWNvcmUtYmVoYXZpb3JzIC5ncmlkJykub24oJ2NsaWNrJywnLmdyaWQtaXRlbScsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBzbGlkZUluZGV4ID0gJCh0aGlzKS5wYXJlbnQoKS5pbmRleCgpO1xuICAgICAgICAkKCAnLnNlY3Rpb24tY29yZS1iZWhhdmlvcnMgLnNsaWNrJyApLnNsaWNrKCAnc2xpY2tHb1RvJywgcGFyc2VJbnQoc2xpZGVJbmRleCkgKTtcbiAgICB9KTtcbiAgICBcbiAgICBcbiAgICBcbiAgICAkKCAnPGRpdiBjbGFzcz1cImNvbHVtbiByb3cgc2xpY2stYXJyb3dzXCI+PC9kaXY+JyApLmluc2VydEFmdGVyKCAnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cyAuc2xpY2snICk7XG4gICAgXG4gICAgJCgnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cyAuc2xpY2snKS5zbGljayh7XG4gICAgICBkb3RzOiBmYWxzZSxcbiAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgIHNsaWRlc1RvU2hvdzogNCxcbiAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgYXBwZW5kQXJyb3dzOiAkKCcuc2VjdGlvbi1yZWxhdGVkLXBvc3RzIC5zbGljay1hcnJvd3MnKSxcbiAgICAgIHJlc3BvbnNpdmU6IFtcbiAgICAgICAge1xuICAgICAgICAgIGJyZWFrcG9pbnQ6IDEyMDAsXG4gICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGJyZWFrcG9pbnQ6IDk4MCxcbiAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAyLFxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBicmVha3BvaW50OiA0ODAsXG4gICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFlvdSBjYW4gdW5zbGljayBhdCBhIGdpdmVuIGJyZWFrcG9pbnQgbm93IGJ5IGFkZGluZzpcbiAgICAgICAgLy8gc2V0dGluZ3M6IFwidW5zbGlja1wiXG4gICAgICAgIC8vIGluc3RlYWQgb2YgYSBzZXR0aW5ncyBvYmplY3RcbiAgICAgIF1cbiAgICB9KTtcbiAgICBcbiAgICAkKCAnPGRpdiBjbGFzcz1cInNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLXRlc3RpbW9uaWFscyAuc2xpY2snICk7XG4gICAgJCgnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgYXJyb3dzOiB0cnVlLFxuICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICBzcGVlZDogMzAwLFxuICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zZWN0aW9uLXRlc3RpbW9uaWFscyAuc2xpY2stYXJyb3dzJyksXG4gICAgfSk7XG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQkKFwiLmpzLXN1cGVyZmlzaFwiKS5zdXBlcmZpc2goe1xuICAgICAgICBkZWxheToxMDAsXG4gICAgICAgIC8vYW5pbWF0aW9uOntvcGFjaXR5Olwic2hvd1wiLGhlaWdodDpcInNob3dcIn0sXG4gICAgICAgIGRyb3BTaGFkb3dzOiExXG4gICAgfSk7XG4gICAgXG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG4iLCIvKiFcbldheXBvaW50cyBJbnZpZXcgU2hvcnRjdXQgLSA0LjAuMVxuQ29weXJpZ2h0IMKpIDIwMTEtMjAxNiBDYWxlYiBUcm91Z2h0b25cbkxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbmh0dHBzOi8vZ2l0aHViLmNvbS9pbWFrZXdlYnRoaW5ncy93YXlwb2ludHMvYmxvYi9tYXN0ZXIvbGljZW5zZXMudHh0XG4qL1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICBmdW5jdGlvbiBub29wKCkge31cblxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9zaG9ydGN1dHMvaW52aWV3ICovXG4gIGZ1bmN0aW9uIEludmlldyhvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gV2F5cG9pbnQuQWRhcHRlci5leHRlbmQoe30sIEludmlldy5kZWZhdWx0cywgb3B0aW9ucylcbiAgICB0aGlzLmF4aXMgPSB0aGlzLm9wdGlvbnMuaG9yaXpvbnRhbCA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCdcbiAgICB0aGlzLndheXBvaW50cyA9IFtdXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy5vcHRpb25zLmVsZW1lbnRcbiAgICB0aGlzLmNyZWF0ZVdheXBvaW50cygpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEludmlldy5wcm90b3R5cGUuY3JlYXRlV2F5cG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvbmZpZ3MgPSB7XG4gICAgICB2ZXJ0aWNhbDogW3tcbiAgICAgICAgZG93bjogJ2VudGVyJyxcbiAgICAgICAgdXA6ICdleGl0ZWQnLFxuICAgICAgICBvZmZzZXQ6ICcxMDAlJ1xuICAgICAgfSwge1xuICAgICAgICBkb3duOiAnZW50ZXJlZCcsXG4gICAgICAgIHVwOiAnZXhpdCcsXG4gICAgICAgIG9mZnNldDogJ2JvdHRvbS1pbi12aWV3J1xuICAgICAgfSwge1xuICAgICAgICBkb3duOiAnZXhpdCcsXG4gICAgICAgIHVwOiAnZW50ZXJlZCcsXG4gICAgICAgIG9mZnNldDogMFxuICAgICAgfSwge1xuICAgICAgICBkb3duOiAnZXhpdGVkJyxcbiAgICAgICAgdXA6ICdlbnRlcicsXG4gICAgICAgIG9mZnNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIC10aGlzLmFkYXB0ZXIub3V0ZXJIZWlnaHQoKVxuICAgICAgICB9XG4gICAgICB9XSxcbiAgICAgIGhvcml6b250YWw6IFt7XG4gICAgICAgIHJpZ2h0OiAnZW50ZXInLFxuICAgICAgICBsZWZ0OiAnZXhpdGVkJyxcbiAgICAgICAgb2Zmc2V0OiAnMTAwJSdcbiAgICAgIH0sIHtcbiAgICAgICAgcmlnaHQ6ICdlbnRlcmVkJyxcbiAgICAgICAgbGVmdDogJ2V4aXQnLFxuICAgICAgICBvZmZzZXQ6ICdyaWdodC1pbi12aWV3J1xuICAgICAgfSwge1xuICAgICAgICByaWdodDogJ2V4aXQnLFxuICAgICAgICBsZWZ0OiAnZW50ZXJlZCcsXG4gICAgICAgIG9mZnNldDogMFxuICAgICAgfSwge1xuICAgICAgICByaWdodDogJ2V4aXRlZCcsXG4gICAgICAgIGxlZnQ6ICdlbnRlcicsXG4gICAgICAgIG9mZnNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIC10aGlzLmFkYXB0ZXIub3V0ZXJXaWR0aCgpXG4gICAgICAgIH1cbiAgICAgIH1dXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGNvbmZpZ3NbdGhpcy5heGlzXS5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdmFyIGNvbmZpZyA9IGNvbmZpZ3NbdGhpcy5heGlzXVtpXVxuICAgICAgdGhpcy5jcmVhdGVXYXlwb2ludChjb25maWcpXG4gICAgfVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBJbnZpZXcucHJvdG90eXBlLmNyZWF0ZVdheXBvaW50ID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgdGhpcy53YXlwb2ludHMucHVzaChuZXcgV2F5cG9pbnQoe1xuICAgICAgY29udGV4dDogdGhpcy5vcHRpb25zLmNvbnRleHQsXG4gICAgICBlbGVtZW50OiB0aGlzLm9wdGlvbnMuZWxlbWVudCxcbiAgICAgIGVuYWJsZWQ6IHRoaXMub3B0aW9ucy5lbmFibGVkLFxuICAgICAgaGFuZGxlcjogKGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgICAgICAgc2VsZi5vcHRpb25zW2NvbmZpZ1tkaXJlY3Rpb25dXS5jYWxsKHNlbGYsIGRpcmVjdGlvbilcbiAgICAgICAgfVxuICAgICAgfShjb25maWcpKSxcbiAgICAgIG9mZnNldDogY29uZmlnLm9mZnNldCxcbiAgICAgIGhvcml6b250YWw6IHRoaXMub3B0aW9ucy5ob3Jpem9udGFsXG4gICAgfSkpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgSW52aWV3LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMud2F5cG9pbnRzLmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzLndheXBvaW50c1tpXS5kZXN0cm95KClcbiAgICB9XG4gICAgdGhpcy53YXlwb2ludHMgPSBbXVxuICB9XG5cbiAgSW52aWV3LnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMud2F5cG9pbnRzLmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzLndheXBvaW50c1tpXS5kaXNhYmxlKClcbiAgICB9XG4gIH1cblxuICBJbnZpZXcucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLndheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpcy53YXlwb2ludHNbaV0uZW5hYmxlKClcbiAgICB9XG4gIH1cblxuICBJbnZpZXcuZGVmYXVsdHMgPSB7XG4gICAgY29udGV4dDogd2luZG93LFxuICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgZW50ZXI6IG5vb3AsXG4gICAgZW50ZXJlZDogbm9vcCxcbiAgICBleGl0OiBub29wLFxuICAgIGV4aXRlZDogbm9vcFxuICB9XG5cbiAgV2F5cG9pbnQuSW52aWV3ID0gSW52aWV3XG59KCkpXG47IiwiKGZ1bmN0aW9uKCQpIHtcblx0XG5cdCd1c2Ugc3RyaWN0JztcdFxuXHRcblx0dmFyICRsZWdlbmQgPSAkKCAnLnNlY3Rpb24tYnVzaW5lc3MtbGluZXMtbWFwIC5sZWdlbmQnICk7XG4gICAgXG4gICAgdmFyICRtYXBzID0gJCggJy5zZWN0aW9uLWJ1c2luZXNzLWxpbmVzLW1hcCAubWFwcycgKTtcbiAgICBcbiAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgJG1hcHMuYW5pbWF0ZSh7J29wYWNpdHknOicxJ30sNTAwKTtcbiAgICB9KTtcbiAgICAgICAgXG4gICAgLy9jbG9zZSBjYXJkIHdoZW4gY2xpY2sgb24gY3Jvc3NcbiAgICAkbGVnZW5kLm9uKCdob3ZlcicsJ2J1dHRvbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICBcbiAgICAgICAgaWYoJCgnYm9keScpLmhhc0NsYXNzKCdpcy1yZXZlYWwtb3BlbicpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnbWFwJyk7XG4gICAgICAgIGlmKCQoaWQpLmNzcygnb3BhY2l0eScpID09IDApIHtcbiAgICAgICAgICAgICQoJy5tYXAnKS5zdG9wKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLm5vdChpZCkuYW5pbWF0ZSh7J29wYWNpdHknOicwJ30sMTAwKTtcbiAgICAgICAgICAgICQoaWQpLnN0b3AoKS5hbmltYXRlKHsnb3BhY2l0eSc6JzEnfSwxMDApO1xuICAgICAgICB9XG4gICAgIFxuICAgIH0pO1xuICAgIFxuICAgICRsZWdlbmQub24oJ2NsaWNrJywnYnV0dG9uJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJy5tYXAnKS5zdG9wKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnbWFwJyk7XG4gICAgICAgIGlmKCQoaWQpLmNzcygnb3BhY2l0eScpID09IDApIHtcbiAgICAgICAgICAgICQoJy5tYXAnKS5zdG9wKCkubm90KGlkKS5jc3MoeydvcGFjaXR5JzonMCd9KTtcbiAgICAgICAgICAgICQoaWQpLnN0b3AoKS5jc3MoeydvcGFjaXR5JzonMSd9KTsgICAgICAgICAgICBcbiAgICAgICAgfSBcbiAgICAgICAgXG4gICAgICAgICQoaWQpLmFkZENsYXNzKCdhY3RpdmUnKTsgICBcbiAgICAgXG4gICAgfSk7XG4gICAgXG4gICAgJGxlZ2VuZC5tb3VzZWxlYXZlKGZ1bmN0aW9uKCkge1xuICAgICAgICBcbiAgICAgICAgaWYoJCgnYm9keScpLmhhc0NsYXNzKCdpcy1yZXZlYWwtb3BlbicpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICQoJy5tYXAnKS5zdG9wKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmFuaW1hdGUoeydvcGFjaXR5JzonMCd9LDEwMCk7XG4gICAgICAgICQoJyNtYXAtMCcpLnN0b3AoKS5hbmltYXRlKHsnb3BhY2l0eSc6JzEnfSwxMDApO1xuICAgIH0pO1xuXG59KShqUXVlcnkpOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIGlmKCQoJy5wYWdlLXRlbXBsYXRlLWNhcmVlcnMnKS5sZW5ndGgpIHtcbiAgICAgICAgdmFyIHNlYXJjaFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICAgIGlmKHNlYXJjaFBhcmFtcy5oYXMoJ3NlYXJjaCcpKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW0gPSBzZWFyY2hQYXJhbXMuZ2V0KCdzZWFyY2gnKTtcbiAgICAgICAgICAgIGlmKHBhcmFtID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoeyBzY3JvbGxUb3A6ICQoJyNjYXJlZXJzLXJvb3QnKS5vZmZzZXQoKS50b3AgLTM1IH0sIDEwMDApO1xuICAgICAgICAgICAgICAgICQoXCJtYWluIHNlY3Rpb246bm90KCcuY2FyZWVycy1zZWN0aW9uJylcIikuZmFkZU91dCgpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICB9XG4gICAgXG4gICAgICAgIHdpbmRvdy5yZWFjdE1hdGNoSGVpZ2h0ID0gZnVuY3Rpb24oZWxDbGFzc05hbWUpIHtcbiAgICAgICAgICAkKCcuY2FyZWVycy1zZWN0aW9uIC5jb2x1bW4gaDMnKS5tYXRjaEhlaWdodCh7IHJvdzogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgIH1cblxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0Ly8gT3BlbiBleHRlcm5hbCBsaW5rcyBpbiBuZXcgd2luZG93IChleGNsdWUgc2N2IGltYWdlIG1hcHMsIGVtYWlsLCB0ZWwgYW5kIGZvb2JveClcblxuXHQkKCdhJykubm90KCdzdmcgYSwgW2hyZWYqPVwidGVsOlwiXSwgW2NsYXNzKj1cImZvb2JveFwiXScpLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdHZhciBpc0ludGVybmFsTGluayA9IG5ldyBSZWdFeHAoJy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyAnLycpO1xuXHRcdGlmICggISBpc0ludGVybmFsTGluay50ZXN0KHRoaXMuaHJlZikgKSB7XG5cdFx0XHQkKHRoaXMpLmF0dHIoJ3RhcmdldCcsICdfYmxhbmsnKTtcblx0XHR9XG5cdH0pO1xuXHRcbiAgICAkKCdhW2hyZWYqPVwiLnBkZlwiXScpLmF0dHIoJ3RhcmdldCcsICdfYmxhbmsnKTtcblxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiKGZ1bmN0aW9uKCQpIHtcbiAgICAkKGRvY3VtZW50KS5vbignZmFjZXR3cC1sb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKEZXUC5sb2FkZWQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKCcuZmFjZXR3cC10ZW1wbGF0ZScpO1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9IC0xNTA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKCcuZmFjZXR3cC1maWx0ZXJzJykubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKCcuZmFjZXR3cC1maWx0ZXJzJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoICQoJy5mYWNldHdwLWN1c3RvbS1maWx0ZXJzJykubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKCcuZmFjZXR3cC1jdXN0b20tZmlsdGVycycpO1xuICAgICAgICAgICAgICAgIG9mZnNldCA9IC02MDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5zbW9vdGhTY3JvbGwoe1xuICAgICAgICAgICAgICAgIHNjcm9sbFRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgICAgICAgIG9mZnNldDogb2Zmc2V0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnI2Jvb2stZmlsdGVycycpLmZvdW5kYXRpb24oJ2Nsb3NlJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEZvdW5kYXRpb24ucmVJbml0KCdlcXVhbGl6ZXInKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9KTtcbiAgICBcbiAgICBcbn0pKGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBkaWRTY3JvbGw7XG4gICAgdmFyIGxhc3RTY3JvbGxUb3AgPSAwO1xuICAgIHZhciBkZWx0YSA9IDIwMDtcbiAgICB2YXIgbmF2YmFySGVpZ2h0ID0gJCgnLnNpdGUtaGVhZGVyJykub3V0ZXJIZWlnaHQoKTtcbiAgICBcbiAgICAkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgZGlkU2Nyb2xsID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBcbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGRpZFNjcm9sbCkge1xuICAgICAgICAgICAgaGFzU2Nyb2xsZWQoKTtcbiAgICAgICAgICAgIGRpZFNjcm9sbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwgMjUwKTtcbiAgICBcbiAgICBmdW5jdGlvbiBoYXNTY3JvbGxlZCgpIHtcbiAgICAgICAgdmFyIHN0ID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuICAgICAgICBcbiAgICAgICAgLy8gTWFrZSBzY3JvbGwgbW9yZSB0aGFuIGRlbHRhXG4gICAgICAgIGlmKE1hdGguYWJzKGxhc3RTY3JvbGxUb3AgLSBzdCkgPD0gZGVsdGEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAvLyBJZiBzY3JvbGxlZCBkb3duIGFuZCBwYXN0IHRoZSBuYXZiYXIsIGFkZCBjbGFzcyAubmF2LXVwLlxuICAgICAgICBpZiAoc3QgPiBsYXN0U2Nyb2xsVG9wKXtcbiAgICAgICAgICAgIC8vIFNjcm9sbCBEb3duXG4gICAgICAgICAgICBpZihzdCA+IG5hdmJhckhlaWdodCkge1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLmFkZENsYXNzKCdmaXhlZCcpLnJlbW92ZUNsYXNzKCduYXYtZG93bicpLmFkZENsYXNzKCduYXYtdXAgc2hyaW5rJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTY3JvbGwgVXBcbiAgICAgICAgICAgIGlmKChkZWx0YStuYXZiYXJIZWlnaHQpICsgc3QgKyAkKHdpbmRvdykuaGVpZ2h0KCkgPCAkKGRvY3VtZW50KS5oZWlnaHQoKSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLnJlbW92ZUNsYXNzKCduYXYtdXAnKS5hZGRDbGFzcygnbmF2LWRvd24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoc3QgPD0gKGRlbHRhK25hdmJhckhlaWdodCkpIHtcbiAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLnJlbW92ZUNsYXNzKCdmaXhlZCBuYXYtZG93biBzaHJpbmsnKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgbGFzdFNjcm9sbFRvcCA9IHN0O1xuICAgIH1cblxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0Ly8gTG9hZCBGb3VuZGF0aW9uXG5cdCQoZG9jdW1lbnQpLmZvdW5kYXRpb24oKTtcbiAgICBcbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ2RvY3VtZW50LXJlYWR5Jyk7XG4gICBcbiAgICAkKCcuc2Nyb2xsLW5leHQnKS5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xuICAgICAgICBcbiAgICAgICAgJC5zbW9vdGhTY3JvbGwoe1xuICAgICAgICAgICAgb2Zmc2V0OiAtMTAwLFxuICAgICAgICAgICAgc2Nyb2xsVGFyZ2V0OiAkKCdtYWluIHNlY3Rpb246Zmlyc3QtY2hpbGQnKSxcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gVG9nZ2xlIG1lbnVcbiAgICBcbiAgICAkKCdsaS5tZW51LWl0ZW0taGFzLWNoaWxkcmVuID4gYScpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICAgIFxuICAgICAgICB2YXIgJHRvZ2dsZSA9ICQodGhpcykucGFyZW50KCkuZmluZCgnLnN1Yi1tZW51LXRvZ2dsZScpO1xuICAgICAgICBcbiAgICAgICAgaWYoICR0b2dnbGUuaXMoJzp2aXNpYmxlJykgKSB7XG4gICAgICAgICAgICAkdG9nZ2xlLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuXG4gICAgfSk7XG4gICAgXG4gIFxuICAgICQod2luZG93KS5zY3JvbGwoYW5pbWF0ZU51bWJlcnMpO1xuICAgIFxuICAgICQod2luZG93KS5vbihcImxvYWQgc2Nyb2xsXCIsZnVuY3Rpb24oZSl7XG4gICAgICAgIGFuaW1hdGVOdW1iZXJzKCk7IFxuICAgIH0pO1xuICAgIHZhciB2aWV3ZWQgPSBmYWxzZTtcbiAgICBcbiAgICBmdW5jdGlvbiBpc1Njcm9sbGVkSW50b1ZpZXcoZWxlbSkge1xuICAgICAgICBcbiAgICAgICAgaWYoICEgJChlbGVtKS5sZW5ndGggKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBkb2NWaWV3VG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuICAgICAgICB2YXIgZG9jVmlld0JvdHRvbSA9IGRvY1ZpZXdUb3AgKyAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgXG4gICAgICAgIHZhciBlbGVtVG9wID0gJChlbGVtKS5vZmZzZXQoKS50b3A7XG4gICAgICAgIHZhciBlbGVtQm90dG9tID0gZWxlbVRvcCArICQoZWxlbSkuaGVpZ2h0KCk7XG4gICAgXG4gICAgICAgIHJldHVybiAoKGVsZW1Cb3R0b20gPD0gZG9jVmlld0JvdHRvbSkgJiYgKGVsZW1Ub3AgPj0gZG9jVmlld1RvcCkpO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiBhbmltYXRlTnVtYmVycygpIHtcbiAgICAgIGlmIChpc1Njcm9sbGVkSW50b1ZpZXcoJChcIi5udW1iZXJzXCIpKSAmJiAhdmlld2VkKSB7XG4gICAgICAgICAgdmlld2VkID0gdHJ1ZTtcbiAgICAgICAgICAkKCcubnVtYmVyJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJCh0aGlzKS5jc3MoJ29wYWNpdHknLCAxKTtcbiAgICAgICAgICAkKHRoaXMpLnByb3AoJ0NvdW50ZXInLDApLmFuaW1hdGUoe1xuICAgICAgICAgICAgICBDb3VudGVyOiAkKHRoaXMpLnRleHQoKS5yZXBsYWNlKC8sL2csICcnKVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDQwMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgc3RlcDogZnVuY3Rpb24gKG5vdykge1xuICAgICAgICAgICAgICAgICAgJCh0aGlzKS50ZXh0KE1hdGguY2VpbChub3cpLnRvU3RyaW5nKCkucmVwbGFjZSgvKFxcZCkoPz0oXFxkXFxkXFxkKSsoPyFcXGQpKS9nLCBcIiQxLFwiKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJCgnLnVsLWV4cGFuZCcpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBpZigkKHRoaXMpLmZpbmQoJ2xpOnZpc2libGUnKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICQodGhpcykuZmluZCgnc3BhbiBhJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgJCgnLnVsLWV4cGFuZCcpLm9uKCdjbGljaycsJ3NwYW4gYScsZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy92YXIgJGNoaWxkcmVuID0gJCh0aGlzKS5wcmV2KCd1bCcpLmNoaWxkcmVuKCk7XG4gICAgICAgIFxuICAgICAgICAvLyRjaGlsZHJlbi5jc3MoJ2Rpc3BsYXknLCAnaW5saW5lJyk7XG4gICAgICAgIC8vcmV0dXJuIGZhbHNlO1xuICAgICAgICAkKHRoaXMpLnBhcmVudHMoJ2RpdicpLmZpbmQoJ3VsJykucmVtb3ZlQ2xhc3MoJ3Nob3J0Jyk7XG4gICAgICAgICQodGhpcykucmVtb3ZlKCk7ICBcbiAgICB9KTtcblxuICAgIFxuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvLyBSZXBsYWNlIGFsbCBTVkcgaW1hZ2VzIHdpdGggaW5saW5lIFNWRyAodXNlIGFzIG5lZWRlZCBzbyB5b3UgY2FuIHNldCBob3ZlciBmaWxscylcblxuICAgICAgICAkKCdpbWcuc3ZnJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyICRpbWcgPSBqUXVlcnkodGhpcyk7XG4gICAgICAgICAgICB2YXIgaW1nSUQgPSAkaW1nLmF0dHIoJ2lkJyk7XG4gICAgICAgICAgICB2YXIgaW1nQ2xhc3MgPSAkaW1nLmF0dHIoJ2NsYXNzJyk7XG4gICAgICAgICAgICB2YXIgaW1nVVJMID0gJGltZy5hdHRyKCdzcmMnKTtcblxuXHRcdCQuZ2V0KGltZ1VSTCwgZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0Ly8gR2V0IHRoZSBTVkcgdGFnLCBpZ25vcmUgdGhlIHJlc3Rcblx0XHRcdHZhciAkc3ZnID0galF1ZXJ5KGRhdGEpLmZpbmQoJ3N2ZycpO1xuXG5cdFx0XHQvLyBBZGQgcmVwbGFjZWQgaW1hZ2UncyBJRCB0byB0aGUgbmV3IFNWR1xuXHRcdFx0aWYodHlwZW9mIGltZ0lEICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHQkc3ZnID0gJHN2Zy5hdHRyKCdpZCcsIGltZ0lEKTtcblx0XHRcdH1cblx0XHRcdC8vIEFkZCByZXBsYWNlZCBpbWFnZSdzIGNsYXNzZXMgdG8gdGhlIG5ldyBTVkdcblx0XHRcdGlmKHR5cGVvZiBpbWdDbGFzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0JHN2ZyA9ICRzdmcuYXR0cignY2xhc3MnLCBpbWdDbGFzcysnIHJlcGxhY2VkLXN2ZycpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZW1vdmUgYW55IGludmFsaWQgWE1MIHRhZ3MgYXMgcGVyIGh0dHA6Ly92YWxpZGF0b3IudzMub3JnXG5cdFx0XHQkc3ZnID0gJHN2Zy5yZW1vdmVBdHRyKCd4bWxuczphJyk7XG5cblx0XHRcdC8vIFJlcGxhY2UgaW1hZ2Ugd2l0aCBuZXcgU1ZHXG5cdFx0XHQkaW1nLnJlcGxhY2VXaXRoKCRzdmcpO1xuXG5cdFx0fSwgJ3htbCcpO1xuXG5cdH0pO1xuXG4gICAgXG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiIsIihmdW5jdGlvbigkKSB7XG5cdFxuXHQndXNlIHN0cmljdCc7XHRcblx0XG5cdFxuICAgIHZhciAkY29sdW1uID0gJCgnLnNlY3Rpb24tbGVhZGVyc2hpcCAuZ3JpZCAuY29sdW1uJyk7XG4gICAgXG4gICAgLy9vcGVuIGFuZCBjbG9zZSBjb2x1bW5cbiAgICAkY29sdW1uLmZpbmQoJy5qcy1leHBhbmRlciAub3BlbiwgLmpzLWV4cGFuZGVyIC50aHVtYm5haWwnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgIHZhciAkdGhpc0NvbHVtbiA9ICQodGhpcykuY2xvc2VzdCgnLmNvbHVtbicpO1xuICAgIFxuICAgICAgaWYgKCR0aGlzQ29sdW1uLmhhc0NsYXNzKCdpcy1jb2xsYXBzZWQnKSkge1xuICAgICAgICAvLyBzaWJsaW5ncyByZW1vdmUgb3BlbiBjbGFzcyBhbmQgYWRkIGNsb3NlZCBjbGFzc2VzXG4gICAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkIGlzLWluYWN0aXZlJyk7XG4gICAgICAgIC8vIHJlbW92ZSBjbG9zZWQgY2xhc3NlcywgYWRkIHBlbiBjbGFzc1xuICAgICAgICAkdGhpc0NvbHVtbi5yZW1vdmVDbGFzcygnaXMtY29sbGFwc2VkIGlzLWluYWN0aXZlJykuYWRkQ2xhc3MoJ2lzLWV4cGFuZGVkJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLmhhc0NsYXNzKCdpcy1pbmFjdGl2ZScpKSB7XG4gICAgICAgICAgLy9kbyBub3RoaW5nXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLmFkZENsYXNzKCdpcy1pbmFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdmFyIG9mZnNldCA9IDA7XG4gICAgICAgIGlmKCBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCgneGxhcmdlJykgKSB7XG4gICAgICAgICAgdmFyIG9mZnNldCA9IC0xMDA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgIHNjcm9sbFRhcmdldDogJHRoaXNDb2x1bW4sXG4gICAgICAgICAgICAvL29mZnNldDogb2Zmc2V0LFxuICAgICAgICAgICAgYmVmb3JlU2Nyb2xsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5hZGRDbGFzcygnbmF2LXVwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHRoaXNDb2x1bW4ucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xuICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikucmVtb3ZlQ2xhc3MoJ2lzLWluYWN0aXZlJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgLy9jbG9zZSBjYXJkIHdoZW4gY2xpY2sgb24gY3Jvc3NcbiAgICAkY29sdW1uLmZpbmQoJy5qcy1jb2xsYXBzZXInKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgIHZhciAkdGhpc0NvbHVtbiA9ICQodGhpcykucGFyZW50cygnLmNvbHVtbl9fZXhwYW5kZXInKS5jbG9zZXN0KCcuY29sdW1uJyk7XG4gICAgXG4gICAgICAkdGhpc0NvbHVtbi5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkIGlzLWluYWN0aXZlJyk7XG4gICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikucmVtb3ZlQ2xhc3MoJ2lzLWluYWN0aXZlJyk7XG4gICAgXG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuICAgIFxuICAgICQoJyNsb2dpbmZvcm0gOmlucHV0LCAjcGFzc3dvcmRmb3JtIDppbnB1dCcpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGFiZWwgPSAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJ2xhYmVsJykudGV4dCgpO1xuICAgICAgICAkKHRoaXMpLmF0dHIoICdwbGFjZWhvbGRlcicsIGxhYmVsICk7XG4gICAgfSk7XG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG4gICAgXG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5wbGF5LXZpZGVvJywgcGxheVZpZGVvKTtcbiAgICBcbiAgICBmdW5jdGlvbiBwbGF5VmlkZW8oKSB7XG4gICAgICAgIFxuICAgICAgICAvLyBTdG9wIGFsbCBiYWNrZ3JvdW5kIHZpZGVvc1xuICAgICAgICBpZiggJCgnLmJhY2tncm91bmQtdmlkZW8gdmlkZW8nKS5zaXplKCkgKSB7XG4gICAgICAgICAgICAkKCcuYmFja2dyb3VuZC12aWRlbyB2aWRlbycpWzBdLnBhdXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgdmFyIHVybCA9ICR0aGlzLmRhdGEoJ3NyYycpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICB2YXIgJG1vZGFsID0gJCgnIycgKyAkdGhpcy5kYXRhKCdvcGVuJykpO1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgJC5hamF4KHVybClcbiAgICAgICAgICAuZG9uZShmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICRtb2RhbC5maW5kKCcuZmxleC12aWRlbycpLmh0bWwocmVzcCkuZm91bmRhdGlvbignb3BlbicpO1xuICAgICAgICB9KTtcbiAgICAgICAgKi9cbiAgICAgICAgXG4gICAgICAgIHZhciAkaWZyYW1lID0gJCgnPGlmcmFtZT4nLCB7XG4gICAgICAgICAgICBzcmM6IHVybCxcbiAgICAgICAgICAgIGlkOiAgJ3ZpZGVvJyxcbiAgICAgICAgICAgIGZyYW1lYm9yZGVyOiAwLFxuICAgICAgICAgICAgc2Nyb2xsaW5nOiAnbm8nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICRpZnJhbWUuYXBwZW5kVG8oJy52aWRlby1wbGFjZWhvbGRlcicsICRtb2RhbCApOyAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8vIE1ha2Ugc3VyZSB2aWRlb3MgZG9uJ3QgcGxheSBpbiBiYWNrZ3JvdW5kXG4gICAgJChkb2N1bWVudCkub24oXG4gICAgICAnY2xvc2VkLnpmLnJldmVhbCcsICcjbW9kYWwtdmlkZW8nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykuZmluZCgnLnZpZGVvLXBsYWNlaG9sZGVyJykuaHRtbCgnJyk7XG4gICAgICAgIGlmKCAkKCcuYmFja2dyb3VuZC12aWRlbyB2aWRlbycpLnNpemUoKSApIHtcbiAgICAgICAgICAgICQoJy5iYWNrZ3JvdW5kLXZpZGVvIHZpZGVvJylbMF0ucGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgfVxuICAgICk7XG4gICAgICAgIFxuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcbiIsIihmdW5jdGlvbigkKSB7XG5cdFxuXHQndXNlIHN0cmljdCc7XHRcblx0XG5cdFxuICAgIHZhciBnZXRMYXN0U2libGluZ0luUm93ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGNhbmRpZGF0ZSA9IGVsZW1lbnQsXG4gICAgICAgICAgICBlbGVtZW50VG9wID0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgICAgIFxuICAgICAgICAvLyBMb29wIHRocm91Z2ggdGhlIGVsZW1lbnTigJlzIG5leHQgc2libGluZ3MgYW5kIGxvb2sgZm9yIHRoZSBmaXJzdCBvbmUgd2hpY2hcbiAgICAgICAgLy8gaXMgcG9zaXRpb25lZCBmdXJ0aGVyIGRvd24gdGhlIHBhZ2UuXG4gICAgICAgIHdoaWxlIChjYW5kaWRhdGUubmV4dEVsZW1lbnRTaWJsaW5nICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY2FuZGlkYXRlLm5leHRFbGVtZW50U2libGluZy5vZmZzZXRUb3AgPiBlbGVtZW50VG9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbmRpZGF0ZSA9IGNhbmRpZGF0ZS5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICB9O1xuICAgIFxuICAgIHZhciAkZ3JpZCA9ICQoJy5zZWN0aW9uLWJ1c2luZXNzZXMgLmdyaWQnKTtcbiAgICB2YXIgJGNvbHVtbiA9ICQoJy5zZWN0aW9uLWJ1c2luZXNzZXMgLmdyaWQgPiAuY29sdW1uJyk7XG4gICAgXG4gICAgLy9vcGVuIGFuZCBjbG9zZSBjb2x1bW5cbiAgICAkY29sdW1uLmZpbmQoJy5qcy1leHBhbmRlciAub3BlbiwgLmpzLWV4cGFuZGVyIC50aHVtYm5haWwnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgdmFyICR0aGlzQ29sdW1uID0gJCh0aGlzKS5jbG9zZXN0KCcuY29sdW1uJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBHZXQgbGFzdCBzaWJsaW5nIGluIHJvd1xuICAgICAgICB2YXIgbGFzdCA9IGdldExhc3RTaWJsaW5nSW5Sb3coJHRoaXNDb2x1bW5bMF0pO1xuICAgICAgICBcbiAgICAgICAgJCgnLmRldGFpbHMnKS5yZW1vdmUoKTtcbiAgICAgICAgXG4gICAgICAgIC8vY29uc29sZS5sb2coJChsYXN0KS5pbmRleCgpKTtcbiAgICAgICAgJHRoaXNDb2x1bW4uZmluZCgnLmNvbHVtbl9fZXhwYW5kZXInKVxuICAgICAgICAgICAgLmNsb25lKClcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZScpXG4gICAgICAgICAgICAud3JhcCgnPGRpdiBjbGFzcz1cImRldGFpbHNcIiAvPicpLnBhcmVudCgpXG4gICAgICAgICAgICAuaW5zZXJ0QWZ0ZXIoJChsYXN0KSk7XG4gICAgICBcbiAgICBcbiAgICAgICAgaWYgKCR0aGlzQ29sdW1uLmhhc0NsYXNzKCdpcy1jb2xsYXBzZWQnKSkge1xuICAgICAgICAvLyBzaWJsaW5ncyByZW1vdmUgb3BlbiBjbGFzcyBhbmQgYWRkIGNsb3NlZCBjbGFzc2VzXG4gICAgICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCBpcy1pbmFjdGl2ZScpO1xuICAgICAgICAgICAgLy8gcmVtb3ZlIGNsb3NlZCBjbGFzc2VzLCBhZGQgcGVuIGNsYXNzXG4gICAgICAgICAgICAkdGhpc0NvbHVtbi5yZW1vdmVDbGFzcygnaXMtY29sbGFwc2VkIGlzLWluYWN0aXZlJykuYWRkQ2xhc3MoJ2lzLWV4cGFuZGVkJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLmhhc0NsYXNzKCdpcy1pbmFjdGl2ZScpKSB7XG4gICAgICAgICAgLy9kbyBub3RoaW5nXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLmFkZENsYXNzKCdpcy1pbmFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdmFyIG9mZnNldCA9IDA7XG4gICAgICAgIGlmKCBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCgneGxhcmdlJykgKSB7XG4gICAgICAgICAgdmFyIG9mZnNldCA9IC0xMDA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgIHNjcm9sbFRhcmdldDogJHRoaXNDb2x1bW4sXG4gICAgICAgICAgICAvL29mZnNldDogb2Zmc2V0LFxuICAgICAgICAgICAgYmVmb3JlU2Nyb2xsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5hZGRDbGFzcygnbmF2LXVwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHRoaXNDb2x1bW4ucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xuICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikucmVtb3ZlQ2xhc3MoJ2lzLWluYWN0aXZlJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgLy9jbG9zZSBjYXJkIHdoZW4gY2xpY2sgb24gY3Jvc3NcbiAgICAkZ3JpZC5vbignY2xpY2snLCcuY2xvc2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICRncmlkLmZpbmQoJy5kZXRhaWxzJykucmVtb3ZlKCk7XG4gICAgICAkY29sdW1uLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICB9KTtcbiAgICBcbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAkZ3JpZC5maW5kKCcuZGV0YWlscycpLnJlbW92ZSgpO1xuICAgICAgICAkY29sdW1uLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG4gICAgXG4gICAgJCgnLnBhZ2UtdGVtcGxhdGUtcmVnaW9ucyAjbWFwLWJveCBpbWcnKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgb2Zmc2V0ID0gJCh0aGlzKS5vZmZzZXQoKTtcbiAgICAgICAgdmFyIHggPSBNYXRoLmZsb29yKChlLnBhZ2VYIC0gb2Zmc2V0LmxlZnQpIC8gJCh0aGlzKS53aWR0aCgpICogMTAwMDApLzEwMDtcbiAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKChlLnBhZ2VZIC0gb2Zmc2V0LnRvcCkgLyAkKHRoaXMpLmhlaWdodCgpICogMTAwMDApLzEwMDtcbiAgICAgICAgXG4gICAgICAgICQoJyNtb3VzZS14eScpLnZhbCggeCArICcvJyArIHkgKTsgICAgIFxuICAgIH0pO1xuICAgIFxuICAgICQoIFwiLm1hcC1rZXkgYnV0dG9uXCIgKS5ob3ZlcihcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcjbWFwLWJveCBidXR0b24nKS5yZW1vdmVDbGFzcyggXCJob3ZlclwiICk7XG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnbWFya2VyJyk7XG4gICAgICAgICQoaWQpLmFkZENsYXNzKCdob3ZlcicpO1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJyNtYXAtYm94IGJ1dHRvbicpLnJlbW92ZUNsYXNzKCBcImhvdmVyXCIgKTtcbiAgICAgIH1cbiAgICApO1xuICAgIFxuICAgICQoJy5wYWdlLXRlbXBsYXRlLXJlZ2lvbnMgI21hcC1ib3ggYnV0dG9uJykub24oICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgLy8kKHRoaXMpLmFkZENsYXNzKCdob3ZlcicpO1xuICAgIH0pO1xuICAgIFxuICAgIFxuICAgICQoJy5wYWdlLXRlbXBsYXRlLXJlZ2lvbnMgLm1hcC1rZXkgYnV0dG9uJykub24oICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdtYXJrZXInKTtcbiAgICAgICAgLy8kKGlkKS5hZGRDbGFzcygnaG92ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICBcbiAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnLnBhZ2UtdGVtcGxhdGUtcmVnaW9ucyAjbWFwLWJveCAubG9jYXRpb25zJykuY3NzKCdvcGFjaXR5JywgMSk7XG4gICAgfSk7XG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG5cblxuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIFJlc3BvbnNpdmUgdmlkZW8gZW1iZWRzXG5cdHZhciAkYWxsX29lbWJlZF92aWRlb3MgPSAkKFwiaWZyYW1lW3NyYyo9J3lvdXR1YmUnXSwgaWZyYW1lW3NyYyo9J3ZpbWVvJ11cIik7XG5cblx0JGFsbF9vZW1iZWRfdmlkZW9zLmVhY2goZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgX3RoaXMgPSAkKHRoaXMpO1xuXG5cdFx0aWYgKF90aGlzLnBhcmVudCgnLmVtYmVkLWNvbnRhaW5lcicpLmxlbmd0aCA9PT0gMCkge1xuXHRcdCAgX3RoaXMud3JhcCgnPGRpdiBjbGFzcz1cImVtYmVkLWNvbnRhaW5lclwiPjwvZGl2PicpO1xuXHRcdH1cblxuXHRcdF90aGlzLnJlbW92ZUF0dHIoJ2hlaWdodCcpLnJlbW92ZUF0dHIoJ3dpZHRoJyk7XG5cbiBcdH0pO1xuICAgIFxuXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG4iLCIvLyBSZXZlYWxcbihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnBhZ2UtdGVtcGxhdGUtcmVnaW9ucyBidXR0b25bZGF0YS1yZWdpb25dJywgbG9hZFJlZ2lvbik7XG4gICAgXG4gICAgZnVuY3Rpb24gbG9hZFJlZ2lvbigpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgdmFyICRyZWdpb24gPSAkKCcjJyArICR0aGlzLmRhdGEoJ3JlZ2lvbicpICk7XG4gICAgICAgIHZhciAkbW9kYWwgPSAkKCcjJyArICR0aGlzLmRhdGEoJ29wZW4nKSk7XG4gICAgICAgIFxuICAgICAgICBpZiggJHJlZ2lvbi5zaXplKCkgKSB7XG4gICAgICAgICAgJCgnLmNvbnRhaW5lcicsICRtb2RhbCApLmh0bWwoJHJlZ2lvbi5odG1sKCkpOyBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbG9zZWQuemYucmV2ZWFsJywgJyNyZWdpb25zJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICAvLyByZW1vdmUgYWN0aW9uIGJ1dHRvbiBjbGFzc1xuICAgICAgICAkKCcjbWFwLWJveCBidXR0b24nKS5yZW1vdmVDbGFzcyggXCJob3ZlclwiICk7XG4gICAgfSk7XG4gICAgXG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy50ZW1wbGF0ZS1idXNpbmVzcy1saW5lcyBidXR0b25bZGF0YS1jb250ZW50XScsIGxvYWRNYXApO1xuICAgIFxuICAgIGZ1bmN0aW9uIGxvYWRNYXAoKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkbWFwID0gJCgnIycgKyAkdGhpcy5kYXRhKCdjb250ZW50JykgKTtcbiAgICAgICAgdmFyICRtb2RhbCA9ICQoJyMnICsgJHRoaXMuZGF0YSgnb3BlbicpKTtcbiAgICAgICAgXG4gICAgICAgIGlmKCAkbWFwLnNpemUoKSApIHtcbiAgICAgICAgICAkKCcuY29udGFpbmVyJywgJG1vZGFsICkuaHRtbCgkbWFwLmh0bWwoKSk7IFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2Nsb3NlZC56Zi5yZXZlYWwnLCAnI21hcHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykuZmluZCgnLmNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgICQoJy5tYXAnKS5zdG9wKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmNzcyh7J29wYWNpdHknOicwJ30pO1xuICAgICAgICAkKCcjbWFwLTAnKS5zdG9wKCkuY3NzKHsnb3BhY2l0eSc6JzEnfSk7XG4gICAgfSk7XG4gICAgXG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy50ZW1wbGF0ZS1wb3J0Zm9saW8tbGFuZC1yZXNvdXJjZXMgYnV0dG9uW2RhdGEtcHJvamVjdF0nLCBsb2FkUHJvamVjdCk7XG4gICAgXG4gICAgZnVuY3Rpb24gbG9hZFByb2plY3QoKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkcHJvamVjdCA9ICQoJyMnICsgJHRoaXMuZGF0YSgncHJvamVjdCcpICk7XG4gICAgICAgIHZhciAkbW9kYWwgPSAkKCcjJyArICR0aGlzLmRhdGEoJ29wZW4nKSk7XG4gICAgICAgIFxuICAgICAgICBpZiggJHByb2plY3Quc2l6ZSgpICkge1xuICAgICAgICAgICQoJy5jb250YWluZXInLCAkbW9kYWwgKS5odG1sKCRwcm9qZWN0Lmh0bWwoKSk7IFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2Nsb3NlZC56Zi5yZXZlYWwnLCAnI3Byb2plY3RzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5jb250YWluZXInKS5lbXB0eSgpO1xuICAgIH0pO1xuICAgICAgICBcbiAgICBcbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cblxuXG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0JChkb2N1bWVudCkub24oXG4gICAgICAnb3Blbi56Zi5yZXZlYWwnLCAnI21vZGFsLXNlYXJjaCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKFwiaW5wdXRcIikuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgfVxuICAgICk7XG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBmdW5jdGlvbiBoaWRlX2hlYWRlcl9tZW51KCBtZW51ICkge1xuICAgICAgICBcbiAgICAgICAgdmFyIG1haW5NZW51QnV0dG9uQ2xhc3MgPSAnbWVudS10b2dnbGUnLFxuXHRcdHJlc3BvbnNpdmVNZW51Q2xhc3MgPSAnZ2VuZXNpcy1yZXNwb25zaXZlLW1lbnUnO1xuICAgICAgICBcbiAgICAgICAgJCggbWVudSArICcgLicgKyBtYWluTWVudUJ1dHRvbkNsYXNzICsgJywnICsgbWVudSArICcgLicgKyByZXNwb25zaXZlTWVudUNsYXNzICsgJyAuc3ViLW1lbnUtdG9nZ2xlJyApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoICdhY3RpdmF0ZWQnIClcblx0XHRcdC5hdHRyKCAnYXJpYS1leHBhbmRlZCcsIGZhbHNlIClcblx0XHRcdC5hdHRyKCAnYXJpYS1wcmVzc2VkJywgZmFsc2UgKTtcblxuXHRcdCQoIG1lbnUgKyAnIC4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcsJyArIG1lbnUgKyAnIC4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLnN1Yi1tZW51JyApXG5cdFx0XHQuYXR0ciggJ3N0eWxlJywgJycgKTtcbiAgICB9XG4gICAgXG4gICAgdmFyIHNjcm9sbG5vdyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgLy8gaWYgc2Nyb2xsbm93KCktZnVuY3Rpb24gd2FzIHRyaWdnZXJlZCBieSBhbiBldmVudFxuICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGhpcy5oYXNoO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVsc2UgaXQgd2FzIGNhbGxlZCB3aGVuIHBhZ2Ugd2l0aCBhICNoYXNoIHdhcyBsb2FkZWRcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQgPSBsb2NhdGlvbi5oYXNoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2FtZSBwYWdlIHNjcm9sbFxuICAgICAgICAkLnNtb290aFNjcm9sbCh7XG4gICAgICAgICAgICBzY3JvbGxUYXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgIGJlZm9yZVNjcm9sbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCgnLnNpdGUtaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2ZpeGVkIHNocmluayBuYXYtZG93bicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFmdGVyU2Nyb2xsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnZml4ZWQgc2hyaW5rIG5hdi1kb3duJyk7XG4gICAgICAgICAgICAgICAgaWYoJCh0YXJnZXQpLmhhc0NsYXNzKCd0eXBlLXBlb3BsZScpICkge1xuICAgICAgICAgICAgICAgICAgICAkKHRhcmdldCkuZmluZCgnLmhlYWRlcicpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBpZiBwYWdlIGhhcyBhICNoYXNoXG4gICAgaWYgKGxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgJCgnaHRtbCwgYm9keScpLnNjcm9sbFRvcCgwKS5zaG93KCk7XG4gICAgICAgIC8vIHNtb290aC1zY3JvbGwgdG8gaGFzaFxuICAgICAgICBzY3JvbGxub3coKTtcbiAgICB9XG5cbiAgICAvLyBmb3IgZWFjaCA8YT4tZWxlbWVudCB0aGF0IGNvbnRhaW5zIGEgXCIvXCIgYW5kIGEgXCIjXCJcbiAgICAkKCdhW2hyZWYqPVwiL1wiXVtocmVmKj0jXScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gaWYgdGhlIHBhdGhuYW1lIG9mIHRoZSBocmVmIHJlZmVyZW5jZXMgdGhlIHNhbWUgcGFnZVxuICAgICAgICBpZiAodGhpcy5wYXRobmFtZS5yZXBsYWNlKC9eXFwvLywnJykgPT09IGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCcnKSAmJiB0aGlzLmhvc3RuYW1lID09PSBsb2NhdGlvbi5ob3N0bmFtZSkge1xuICAgICAgICAgICAgLy8gb25seSBrZWVwIHRoZSBoYXNoLCBpLmUuIGRvIG5vdCBrZWVwIHRoZSBwYXRobmFtZVxuICAgICAgICAgICAgJCh0aGlzKS5hdHRyKFwiaHJlZlwiLCB0aGlzLmhhc2gpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBzZWxlY3QgYWxsIGhyZWYtZWxlbWVudHMgdGhhdCBzdGFydCB3aXRoICNcbiAgICAvLyBpbmNsdWRpbmcgdGhlIG9uZXMgdGhhdCB3ZXJlIHN0cmlwcGVkIGJ5IHRoZWlyIHBhdGhuYW1lIGp1c3QgYWJvdmVcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJ2FbaHJlZl49I106bm90KFtocmVmPSNdKScsIHNjcm9sbG5vdyApO1xuXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG4iXX0=
