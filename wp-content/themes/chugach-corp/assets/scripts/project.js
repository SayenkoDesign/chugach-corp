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
"use strict";

(function (a) {
  if (typeof define === "function" && define.amd) {
	define(["jquery"], a);
  } else {
	a(jQuery);
  }
})(function (a) {
  a.fn.addBack = a.fn.addBack || a.fn.andSelf;a.fn.extend({ actual: function actual(b, l) {
	  if (!this[b]) {
		throw '$.actual => The jQuery method "' + b + '" you called does not exist';
	  }var f = { absolute: false, clone: false, includeMargin: false, display: "block" };var i = a.extend(f, l);var e = this.eq(0);var h, j;if (i.clone === true) {
		h = function h() {
		  var m = "position: absolute !important; top: -1000 !important; ";
		  e = e.clone().attr("style", m).appendTo("body");
		};j = function j() {
		  e.remove();
		};
	  } else {
		var g = [];var d = "";var c;h = function h() {
		  c = e.parents().addBack().filter(":hidden");
		  d += "visibility: hidden !important; display: " + i.display + " !important; ";if (i.absolute === true) {
			d += "position: absolute !important; ";
		  }c.each(function () {
			var m = a(this);
			var n = m.attr("style");g.push(n);m.attr("style", n ? n + ";" + d : d);
		  });
		};j = function j() {
		  c.each(function (m) {
			var o = a(this);var n = g[m];if (n === undefined) {
			  o.removeAttr("style");
			} else {
			  o.attr("style", n);
			}
		  });
		};
	  }h();var k = /(outer)/.test(b) ? e[b](i.includeMargin) : e[b]();j();return k;
	} });
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! js-cookie v3.0.1 | MIT */
;
(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = global || self, function () {
	var current = global.Cookies;
	var exports = global.Cookies = factory();
	exports.noConflict = function () {
	  global.Cookies = current;return exports;
	};
  }());
})(undefined, function () {
  'use strict';

  /* eslint-disable no-var */

  function assign(target) {
	for (var i = 1; i < arguments.length; i++) {
	  var source = arguments[i];
	  for (var key in source) {
		target[key] = source[key];
	  }
	}
	return target;
  }
  /* eslint-enable no-var */

  /* eslint-disable no-var */
  var defaultConverter = {
	read: function read(value) {
	  if (value[0] === '"') {
		value = value.slice(1, -1);
	  }
	  return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
	},
	write: function write(value) {
	  return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
	}
  };
  /* eslint-enable no-var */

  /* eslint-disable no-var */

  function init(converter, defaultAttributes) {
	function set(key, value, attributes) {
	  if (typeof document === 'undefined') {
		return;
	  }

	  attributes = assign({}, defaultAttributes, attributes);

	  if (typeof attributes.expires === 'number') {
		attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
	  }
	  if (attributes.expires) {
		attributes.expires = attributes.expires.toUTCString();
	  }

	  key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);

	  var stringifiedAttributes = '';
	  for (var attributeName in attributes) {
		if (!attributes[attributeName]) {
		  continue;
		}

		stringifiedAttributes += '; ' + attributeName;

		if (attributes[attributeName] === true) {
		  continue;
		}

		// Considers RFC 6265 section 5.2:
		// ...
		// 3.  If the remaining unparsed-attributes contains a %x3B (";")
		//	 character:
		// Consume the characters of the unparsed-attributes up to,
		// not including, the first %x3B (";") character.
		// ...
		stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
	  }

	  return document.cookie = key + '=' + converter.write(value, key) + stringifiedAttributes;
	}

	function get(key) {
	  if (typeof document === 'undefined' || arguments.length && !key) {
		return;
	  }

	  // To prevent the for loop in the first place assign an empty array
	  // in case there are no cookies at all.
	  var cookies = document.cookie ? document.cookie.split('; ') : [];
	  var jar = {};
	  for (var i = 0; i < cookies.length; i++) {
		var parts = cookies[i].split('=');
		var value = parts.slice(1).join('=');

		try {
		  var foundKey = decodeURIComponent(parts[0]);
		  jar[foundKey] = converter.read(value, foundKey);

		  if (key === foundKey) {
			break;
		  }
		} catch (e) {}
	  }

	  return key ? jar[key] : jar;
	}

	return Object.create({
	  set: set,
	  get: get,
	  remove: function remove(key, attributes) {
		set(key, '', assign({}, attributes, {
		  expires: -1
		}));
	  },
	  withAttributes: function withAttributes(attributes) {
		return init(this.converter, assign({}, this.attributes, attributes));
	  },
	  withConverter: function withConverter(converter) {
		return init(assign({}, this.converter, converter), this.attributes);
	  }
	}, {
	  attributes: { value: Object.freeze(defaultAttributes) },
	  converter: { value: Object.freeze(converter) }
	});
  }

  var api = init(defaultConverter, { path: '/' });
  /* eslint-enable no-var */

  return api;
});
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
"use strict";

(function (document, window, $) {

	'use strict';

	var $stickyHeader = $(".sticky-header .site-header");
	var $stickyNav = $(".sticky-nav");
	var $body = $('body');
	var $wpAdminBar = 0;
	var height = 0;

	var showNotificationBar = Cookies.get('show-notification-bar');

	$(window).on("load", function () {

		console.log(showNotificationBar);

		if ('no' === showNotificationBar) {
			return;
		}

		var $notificationBar = $('.section-notification-bar');

		$notificationBar.removeClass('hide');

		height = $notificationBar.actual('height') + $wpAdminBar;

		setTimeout(function () {
			if (Foundation.MediaQuery.atLeast('xlarge')) {
				$body.css('margin-top', height);
			} else {
				$body.css('margin-top', '0');
				$body.removeAttr('style');
			}
		}, 3000);
	});

	$(window).on("resize", function () {

		var $notificationBar = $('.section-notification-bar');

		height = $notificationBar.height() + $wpAdminBar;

		if (Foundation.MediaQuery.atLeast('xlarge')) {
			$body.css('margin-top', height);
		} else {
			$body.removeAttr('style');
		}
	});

	$(window).on("scroll", function () {

		var hasNotificationBar = true;
		var $notificationBar = $('.section-notification-bar');

		if (!$notificationBar.length && $notificationBar.not(":visible")) {
			$body.removeAttr('style');
			$stickyHeader.removeAttr('style');
			$stickyNav.removeAttr('style');
			hasNotificationBar = false;
			//return;
		}

		if ($(window).scrollTop() >= height) {
			$stickyHeader.addClass("fixed");
			$stickyNav.addClass("fixed");
			$body.removeAttr('style');
			$notificationBar.addClass('hide');
		} else {
			$stickyHeader.removeClass("fixed");
			$stickyNav.removeClass("fixed");
			$notificationBar.removeClass('hide');
			if (hasNotificationBar && Foundation.MediaQuery.atLeast('xlarge')) {
				$body.css('margin-top', height);
			} else {
				$body.removeAttr('style');
			}
		}
	});

	$(document).on('close.zf.trigger', '.section-notification-bar[data-closable]', function (e) {
		$body.css('margin-top', 'auto');
		$body.removeAttr('style');
		$stickyHeader.removeAttr('style');
		$stickyNav.removeAttr('style');
		$('.section-notification-bar').remove();
		Cookies.set('show-notification-bar', 'no', { expires: 1 });
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
'use strict';

(function (document, window, $) {

	'use strict';

	var $filterButtons = $('.faq-filter-button');

	$('.faq-filter-button').click(function () {
		var filterValue = $(this).attr('data-filter');

		var $allFaqs = $('.faq');

		var $newActiveFaqs = '';
		var $newDeactivatedFaqs = '';
		if (filterValue == '*') {
			$newActiveFaqs = $('.faq');
		} else {
			$newActiveFaqs = $(filterValue);
			$newDeactivatedFaqs = $('.faq').not(filterValue);
			console.log($newDeactivatedFaqs);
		}

		/**
		 * Close open accordions
		 *  - if new filter doesn't have them
		 */
		if ($newDeactivatedFaqs) {
			$newDeactivatedFaqs.each(function () {
				var $this = $(this);
				if ($this.hasClass('is-active')) {
					$this.find('.accordion-title').trigger('click');
				}
			});
		}

		$allFaqs.each(function () {
			$(this).hide();
			$(this).addClass('faq-hidden');
			$(this).removeClass('faq-shown');
		});
		$newActiveFaqs.each(function () {
			$(this).show();
			$(this).addClass('faq-shown');
			$(this).removeClass('faq-hidden');
		});

		$filterButtons.each(function () {
			$(this).removeClass('active');
		});
		$(this).addClass('active');
	});
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	var $html = $('html');
	var $on_page_links = $('#on-page-links');
	var $links_container = $('.on-page-links-container');
	var $menu_button = $('.on-page-mobile-nav-toggle');
	var $menu_width = $('.on-page-links-list').width();

	$on_page_links.addClass('init');

	// console.log('init mobile nav');

	// check if it should force to hamburger
	function on_page_links_mobile_display() {
		var $links_container_width = $links_container.width();
		// var $menu_width   = $('.on-page-links-list').width();

		var $items_width = $menu_width + 40;
		var $display_menu = $items_width >= $links_container_width;

		return $display_menu;
	}

	// adds/removes classes based on screen width
	function on_page_links_mobile_classes() {

		var $display_menu = on_page_links_mobile_display();

		if (!$display_menu) {
			$on_page_links.removeClass('on-page-mobile-nav-active');
			$on_page_links.removeClass('on-page-mobile-nav-display');
			// console.log('begone classes');
		} else if (!$on_page_links.hasClass('on-page-mobile-nav-display')) {
			$on_page_links.addClass('on-page-mobile-nav-display');
			// console.log('right_size_for_mobile_nav');
		}
	}

	function mobileNav_activate() {
		$on_page_links.addClass('on-page-mobile-nav-active');
	}

	function mobileNav_deactivate() {
		$on_page_links.removeClass('on-page-mobile-nav-active');
	}

	function mobileNav_toggle() {

		if ($on_page_links.hasClass('on-page-mobile-nav-active')) {
			mobileNav_deactivate();
			$menu_button.html('Menu');
		} else {
			mobileNav_activate();
			$menu_button.html('Close');
		}
	}

	// add proper class on document load
	$(document).ready(function () {
		on_page_links_mobile_classes();
	});

	// do it again when *everything* is loaded
	$(window).bind('load', function () {
		on_page_links_mobile_classes();
	});

	// adjust display classes on resize
	// SHOULD THROTTLE THIS THING
	$(window).resize(function () {});

	/* On resize (throttled) */
	window.addEventListener('resize', on_page_links_resizer, false);

	var timer = null;
	function on_page_links_resizer() {

		timer = timer || setTimeout(function () {
			timer = null;
			on_page_links_mobile_classes();
		}, 50);
	}

	// on clicking .on-page-mobile-nav-open
	/**
	 * WooCommerce was giving me issues with doubleclicking
	 *   - Had to add a class to body to cancel out a double-clicked thing
	 */
	$menu_button.click(function (e) {
		e.preventDefault();

		mobileNav_toggle();
	});

	// if open, close on pressing escape key
	// $(document).on('keydown',function(e) {
	//	 if (e.keyCode === 27 && $('html').hasClass('on-page-mobile-nav-active')) { // ESC
	//		 $('html').removeClass('on-page-mobile-nav-active');
	//	 }
	// });
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

	'use strict';

	var $resources_accordion_links = $('.resources-accordion-title');
	var $trigger_width = 550;
	var $window_width = $(window).width();

	function resourcesAccordionsInitClose() {

		console.log('window: ' + $window_width + ', trigger: ' + $trigger_width);

		var $is_mobile = false;
		if ($window_width < $trigger_width) {
			$is_mobile = true;
		}

		$resources_accordion_links.each(function () {
			var $this = $(this);
			if ($is_mobile && $this.parent().hasClass('is-active')) {
				$this.trigger('click');
			}
		});
	}

	function resourcesAccordionResizeClose() {

		$window_width = $(window).width();
		console.log('window: ' + $window_width + ', trigger: ' + $trigger_width);

		var $is_mobile = false;
		if ($window_width < $trigger_width) {
			$is_mobile = true;
		}

		$resources_accordion_links.each(function () {
			var $this = $(this);
			if (!$is_mobile && !$this.parent().hasClass('is-active')) {
				$this.trigger('click');
			}
		});
	}

	// add proper class on document load
	$(document).ready(function () {
		resourcesAccordionsInitClose();
	});

	// do it again when *everything* is loaded
	$(window).bind('load', function () {
		resourcesAccordionsInitClose();
	});

	/* On resize (throttled) */
	window.addEventListener('resize', resourcesAccordionsResizer, false);

	var timer = null;
	function resourcesAccordionsResizer() {

		timer = timer || setTimeout(function () {
			timer = null;
			resourcesAccordionResizeClose();
		}, 100);
	}
})(document, window, jQuery);
'use strict';

(function (document, window, $) {

  'use strict';

  /**
   * Pagebuilder Image Library
   */

  var $pagebuilder_image_library = jQuery('.pagebuilder-section-image-library');
  if ($pagebuilder_image_library) {
	$pagebuilder_image_library.each(function () {

	  var $this = jQuery(this);

	  /**
	   * Set up the slider stuff
	   */
	  var $autoplay = false;
	  var $autoplaySpeed = 6000;
	  if ($this.attr('data-autoplay')) {
		$autoplay = true;
		if ($this.attr('data-autoplay-speed')) {
		  $autoplaySpeed = $this.attr('data-autoplay-speed');
		}
	  }
	  if ($('.slick', $this).length) {
		var imageLibraryCaptionResizer = function imageLibraryCaptionResizer() {
		  timer = timer || setTimeout(function () {
			timer = null;
			if ($captions) {
			  $captions.each(function () {
				var $caption = $(this);
				var $captionHeight = $caption.height();
				console.log($captionHeight);
				$caption.css('margin-bottom', $captionHeight * -1 + 'px');
			  });
			}
		  }, 50);
		};

		$this.find('.slick').slick({
		  dots: false,
		  arrows: true,
		  infinite: true,
		  speed: 300,
		  draggable: true,
		  lazyLoad: 'ondemand',
		  autoplay: $autoplay,
		  autoplaySpeed: $autoplaySpeed,
		  slidesToShow: 3,
		  slidesToScroll: 1,
		  centerMode: true,
		  centerPadding: '0px',
		  prevArrow: $this.find('.slick-prev'),
		  nextArrow: $this.find('.slick-next')
		});

		/**
		 * Set the heights of all the captions
		 */
		var $captions = $this.find('.image-caption');
		if ($captions) {
		  $captions.each(function () {
			var $caption = $(this);
			var $captionHeight = $caption.height();
			// console.log($captionHeight);
			$caption.css('margin-bottom', $captionHeight * -1 + 'px');
		  });
		}

		/* On resize (throttled) */
		window.addEventListener('resize', imageLibraryCaptionResizer, false);

		var timer = null;


		$this.imagesLoaded().done(function (instance) {
		  $this.addClass('images-loaded');
		});
	  }
	  jQuery(this).lightGallery({
		selector: '.slick-slide:not(.slick-cloned) .image-modal-link',
		thumbnail: false
	  });
	});
  }

  /**
   * Pagebuilder Full-width image carousel
   */
  var $pagebuilder_full_width_image_carousel = $('.pagebuilder-section-full-width-image-carousel');
  if ($pagebuilder_full_width_image_carousel) {
	$pagebuilder_full_width_image_carousel.each(function () {
	  var $this = $(this);
	  var $autoplay = false;
	  var $autoplaySpeed = 6000;
	  if ($this.attr('data-autoplay')) {
		$autoplay = true;
		if ($this.attr('data-autoplay-speed')) {
		  $autoplaySpeed = $this.attr('data-autoplay-speed');
		}
	  }
	  console.log('autoplay status: ' + $autoplay + ', autoplay speed: ' + $autoplaySpeed);
	  if ($('.slick', $this).length) {

		$this.find('.slick').slick({
		  dots: false,
		  arrows: true,
		  infinite: true,
		  speed: 300,
		  autoplay: $autoplay,
		  autoplaySpeed: $autoplaySpeed,
		  lazyLoad: 'ondemand',
		  slidesToShow: 1,
		  slidesToScroll: 1,
		  prevArrow: $this.find('.slick-prev'),
		  nextArrow: $this.find('.slick-next')
		});

		$this.imagesLoaded().done(function (instance) {
		  $this.addClass('images-loaded');
		});
	  }
	});
  }

  /**
   * Pagebuilder steps
   */
  var $pagebuilder_steps = $('.pagebuilder-section-steps');
  if ($pagebuilder_steps) {
	$pagebuilder_steps.each(function () {
	  var $this = $(this);
	  var $autoplay = false;
	  var $autoplaySpeed = 6000;
	  if ($this.attr('data-autoplay')) {
		$autoplay = true;
		if ($this.attr('data-autoplay-speed')) {
		  $autoplaySpeed = $this.attr('data-autoplay-speed');
		}
	  }
	  if ($('.slick', $this).length) {

		$this.find('.slick').slick({
		  dots: false,
		  arrows: true,
		  infinite: false,
		  speed: 300,
		  autoplay: $autoplay,
		  autoplaySpeed: $autoplaySpeed,
		  slidesToShow: 4,
		  slidesToScroll: 1,
		  prevArrow: $this.find('.slick-prev'),
		  nextArrow: $this.find('.slick-next'),
		  responsive: [{
			breakpoint: 1024,
			settings: {
			  slidesToShow: 3
			}
		  }, {
			breakpoint: 750,
			settings: {
			  slidesToShow: 2
			}
		  }, {
			breakpoint: 550,
			settings: {
			  slidesToShow: 1
			}
		  }]
		});
	  }
	});
  }
})(document, window, jQuery);
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
		adaptiveHeight: true,
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
	$('a[href*="/"][href*="#"]').each(function () {
		// if the pathname of the href references the same page
		if (this.pathname.replace(/^\//, '') === location.pathname.replace(/^\//, '') && this.hostname === location.hostname) {
			// only keep the hash, i.e. do not keep the pathname
			$(this).attr("href", this.hash);
		}
	});

	// select all href-elements that start with #
	// including the ones that were stripped by their pathname just above
	$('body').on('click', 'a[href^="#"]:not([href="#"])', scrollnow);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImExMXktdG9nZ2xlLmpzIiwiZ2VuZXNpcy1yZXNwb25zaXZlLW1lbnUuanMiLCJob3ZlckludGVudC5qcyIsImltYWdlc2xvYWRlZC5wa2dkLmpzIiwianF1ZXJ5LmFjdHVhbC5qcyIsImpxdWVyeS5tYXRjaEhlaWdodC5qcyIsImpxdWVyeS5zbW9vdGgtc2Nyb2xsLmpzIiwianF1ZXJ5LndheXBvaW50cy5qcyIsImpzLmNvb2tpZS5qcyIsInJlY2xpbmVyLmpzIiwic2xpY2suanMiLCJzdXBlcmZpc2guanMiLCJ3YXlwb2ludHMuaW52aWV3LmpzIiwiYnVzaW5lc3MtbGluZXMuanMiLCJjYXJlZXJzLmpzIiwiZXh0ZXJuYWwtbGlua3MuanMiLCJmaXhlZC1oZWFkZXIuanMiLCJnZW5lcmFsLmpzIiwiaW5saW5lLXN2Zy5qcyIsImxlYWRlcnNoaXAuanMiLCJsb2dpbi5qcyIsIm1vZGFsLXZpZGVvLmpzIiwibm90aWZpY2F0aW9uLWJhci5qcyIsIm9wZXJhdGluZy1jb21wYW5pZXMuanMiLCJwYWdlYnVpbGRlci1mYXEtZmlsdGVycy5qcyIsInBhZ2VidWlsZGVyLW5hdi5qcyIsInBhZ2VidWlsZGVyLXJlc291cmNlcy1hY2NvcmRpb24uanMiLCJwYWdlYnVpbGRlci1zbGlkZXJzLmpzIiwicmVnaW9ucy5qcyIsInJlc3BvbnNpdmUtdmlkZW8tZW1iZWRzLmpzIiwicmV2ZWFsLmpzIiwic2VhcmNoLmpzIiwic21vb3RoLXNjcm9sbC5qcyJdLCJuYW1lcyI6WyJpbnRlcm5hbElkIiwidG9nZ2xlc01hcCIsInRhcmdldHNNYXAiLCIkIiwic2VsZWN0b3IiLCJjb250ZXh0IiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImNhbGwiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJnZXRDbG9zZXN0VG9nZ2xlIiwiZWxlbWVudCIsImNsb3Nlc3QiLCJub2RlVHlwZSIsImhhc0F0dHJpYnV0ZSIsInBhcmVudE5vZGUiLCJoYW5kbGVUb2dnbGUiLCJ0b2dnbGUiLCJ0YXJnZXQiLCJnZXRBdHRyaWJ1dGUiLCJ0b2dnbGVzIiwiaWQiLCJpc0V4cGFuZGVkIiwic2V0QXR0cmlidXRlIiwiZm9yRWFjaCIsImlubmVySFRNTCIsImluaXRBMTF5VG9nZ2xlIiwicmVkdWNlIiwiYWNjIiwicHVzaCIsInRhcmdldHMiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwibGFiZWxsZWRieSIsImpvaW4iLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJ3aGljaCIsIndpbmRvdyIsImExMXlUb2dnbGUiLCJ1bmRlZmluZWQiLCJyZW1vdmVDbGFzcyIsImdlbmVzaXNNZW51UGFyYW1zIiwiZ2VuZXNpc19yZXNwb25zaXZlX21lbnUiLCJnZW5lc2lzTWVudXNVbmNoZWNrZWQiLCJtZW51Q2xhc3NlcyIsImdlbmVzaXNNZW51cyIsIm1lbnVzVG9Db21iaW5lIiwiZWFjaCIsImdyb3VwIiwia2V5IiwidmFsdWUiLCJtZW51U3RyaW5nIiwiJG1lbnUiLCJuZXdTdHJpbmciLCJhZGRDbGFzcyIsInJlcGxhY2UiLCJvdGhlcnMiLCJjb21iaW5lIiwiZ2VuZXNpc01lbnUiLCJtYWluTWVudUJ1dHRvbkNsYXNzIiwic3ViTWVudUJ1dHRvbkNsYXNzIiwicmVzcG9uc2l2ZU1lbnVDbGFzcyIsImluaXQiLCJfZ2V0QWxsTWVudXNBcnJheSIsIm1lbnVJY29uQ2xhc3MiLCJzdWJNZW51SWNvbkNsYXNzIiwidG9nZ2xlQnV0dG9ucyIsIm1lbnUiLCJhcHBlbmQiLCJtYWluTWVudSIsInN1Ym1lbnUiLCJzdWJNZW51IiwiX2FkZFJlc3BvbnNpdmVNZW51Q2xhc3MiLCJfYWRkTWVudUJ1dHRvbnMiLCJvbiIsIl9tYWlubWVudVRvZ2dsZSIsIl9hZGRDbGFzc0lEIiwiX3N1Ym1lbnVUb2dnbGUiLCJfZG9SZXNpemUiLCJ0cmlnZ2VySGFuZGxlciIsIl9nZXRNZW51U2VsZWN0b3JTdHJpbmciLCJmaW5kIiwiYmVmb3JlIiwibWVudXNUb1RvZ2dsZSIsImNvbmNhdCIsImJ1dHRvbnMiLCJhdHRyIiwiX21heWJlQ2xvc2UiLCJfc3VwZXJmaXNoVG9nZ2xlIiwiX2NoYW5nZVNraXBMaW5rIiwiX2NvbWJpbmVNZW51cyIsIiR0aGlzIiwibmF2IiwibmV4dCIsIm1hdGNoIiwicHJpbWFyeU1lbnUiLCJjb21iaW5lZE1lbnVzIiwiZmlsdGVyIiwiaW5kZXgiLCJfZ2V0RGlzcGxheVZhbHVlIiwiYXBwZW5kVG8iLCJoaWRlIiwic2hvdyIsIl90b2dnbGVBcmlhIiwidG9nZ2xlQ2xhc3MiLCJzbGlkZVRvZ2dsZSIsInNpYmxpbmdzIiwic2xpZGVVcCIsIl9zdXBlcmZpc2giLCIkYXJncyIsInN1cGVyZmlzaCIsIm1lbnVUb2dnbGVMaXN0IiwibmV3VmFsdWUiLCJzdGFydExpbmsiLCJlbmRMaW5rIiwiJGl0ZW0iLCJsaW5rIiwiJGlkIiwiZ2V0RWxlbWVudEJ5SWQiLCJzdHlsZSIsImdldENvbXB1dGVkU3R5bGUiLCJnZXRQcm9wZXJ0eVZhbHVlIiwiYXR0cmlidXRlIiwiaXRlbUFycmF5IiwiaXRlbVN0cmluZyIsIm1hcCIsIm1lbnVMaXN0IiwidmFsdWVPZiIsInJlYWR5IiwialF1ZXJ5IiwiZm4iLCJob3ZlckludGVudCIsImhhbmRsZXJJbiIsImhhbmRsZXJPdXQiLCJjZmciLCJpbnRlcnZhbCIsInNlbnNpdGl2aXR5IiwidGltZW91dCIsImV4dGVuZCIsImlzRnVuY3Rpb24iLCJvdmVyIiwib3V0IiwiY1giLCJjWSIsInBYIiwicFkiLCJ0cmFjayIsImV2IiwicGFnZVgiLCJwYWdlWSIsImNvbXBhcmUiLCJvYiIsImhvdmVySW50ZW50X3QiLCJjbGVhclRpbWVvdXQiLCJNYXRoIiwiYWJzIiwib2ZmIiwiaG92ZXJJbnRlbnRfcyIsImFwcGx5Iiwic2V0VGltZW91dCIsImRlbGF5IiwiaGFuZGxlSG92ZXIiLCJlIiwidHlwZSIsImdsb2JhbCIsImZhY3RvcnkiLCJkZWZpbmUiLCJhbWQiLCJtb2R1bGUiLCJleHBvcnRzIiwiRXZFbWl0dGVyIiwicHJvdG8iLCJldmVudE5hbWUiLCJsaXN0ZW5lciIsImV2ZW50cyIsIl9ldmVudHMiLCJsaXN0ZW5lcnMiLCJpbmRleE9mIiwib25jZSIsIm9uY2VFdmVudHMiLCJfb25jZUV2ZW50cyIsIm9uY2VMaXN0ZW5lcnMiLCJzcGxpY2UiLCJlbWl0RXZlbnQiLCJhcmdzIiwiaSIsImlzT25jZSIsImFsbE9mZiIsInJlcXVpcmUiLCJpbWFnZXNMb2FkZWQiLCJjb25zb2xlIiwiYSIsImIiLCJwcm9wIiwiYXJyYXlTbGljZSIsIm1ha2VBcnJheSIsIm9iaiIsImlzQXJyYXkiLCJpc0FycmF5TGlrZSIsIkltYWdlc0xvYWRlZCIsImVsZW0iLCJvcHRpb25zIiwib25BbHdheXMiLCJxdWVyeUVsZW0iLCJlcnJvciIsImVsZW1lbnRzIiwiZ2V0SW1hZ2VzIiwianFEZWZlcnJlZCIsIkRlZmVycmVkIiwiY2hlY2siLCJiaW5kIiwiY3JlYXRlIiwiaW1hZ2VzIiwiYWRkRWxlbWVudEltYWdlcyIsIm5vZGVOYW1lIiwiYWRkSW1hZ2UiLCJiYWNrZ3JvdW5kIiwiYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMiLCJlbGVtZW50Tm9kZVR5cGVzIiwiY2hpbGRJbWdzIiwiaW1nIiwiY2hpbGRyZW4iLCJjaGlsZCIsInJlVVJMIiwibWF0Y2hlcyIsImV4ZWMiLCJiYWNrZ3JvdW5kSW1hZ2UiLCJ1cmwiLCJhZGRCYWNrZ3JvdW5kIiwibG9hZGluZ0ltYWdlIiwiTG9hZGluZ0ltYWdlIiwiQmFja2dyb3VuZCIsIl90aGlzIiwicHJvZ3Jlc3NlZENvdW50IiwiaGFzQW55QnJva2VuIiwiY29tcGxldGUiLCJvblByb2dyZXNzIiwiaW1hZ2UiLCJtZXNzYWdlIiwicHJvZ3Jlc3MiLCJpc0xvYWRlZCIsIm5vdGlmeSIsImRlYnVnIiwibG9nIiwiaXNDb21wbGV0ZSIsImpxTWV0aG9kIiwiZ2V0SXNJbWFnZUNvbXBsZXRlIiwiY29uZmlybSIsIm5hdHVyYWxXaWR0aCIsInByb3h5SW1hZ2UiLCJJbWFnZSIsInNyYyIsImhhbmRsZUV2ZW50IiwibWV0aG9kIiwib25sb2FkIiwidW5iaW5kRXZlbnRzIiwib25lcnJvciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJtYWtlSlF1ZXJ5UGx1Z2luIiwiY2FsbGJhY2siLCJpbnN0YW5jZSIsInByb21pc2UiLCJhZGRCYWNrIiwiYW5kU2VsZiIsImFjdHVhbCIsImwiLCJmIiwiYWJzb2x1dGUiLCJjbG9uZSIsImluY2x1ZGVNYXJnaW4iLCJkaXNwbGF5IiwiZXEiLCJoIiwiaiIsIm0iLCJyZW1vdmUiLCJnIiwiZCIsImMiLCJwYXJlbnRzIiwibiIsIm8iLCJyZW1vdmVBdHRyIiwiayIsInRlc3QiLCJfcHJldmlvdXNSZXNpemVXaWR0aCIsIl91cGRhdGVUaW1lb3V0IiwiX3BhcnNlIiwicGFyc2VGbG9hdCIsIl9yb3dzIiwidG9sZXJhbmNlIiwiJGVsZW1lbnRzIiwibGFzdFRvcCIsInJvd3MiLCIkdGhhdCIsInRvcCIsIm9mZnNldCIsImNzcyIsImxhc3RSb3ciLCJmbG9vciIsImFkZCIsIl9wYXJzZU9wdGlvbnMiLCJvcHRzIiwiYnlSb3ciLCJwcm9wZXJ0eSIsIm1hdGNoSGVpZ2h0IiwidGhhdCIsIl9ncm91cHMiLCJub3QiLCJfYXBwbHkiLCJ2ZXJzaW9uIiwiX3Rocm90dGxlIiwiX21haW50YWluU2Nyb2xsIiwiX2JlZm9yZVVwZGF0ZSIsIl9hZnRlclVwZGF0ZSIsInNjcm9sbFRvcCIsImh0bWxIZWlnaHQiLCJvdXRlckhlaWdodCIsIiRoaWRkZW5QYXJlbnRzIiwiZGF0YSIsInJvdyIsIiRyb3ciLCJ0YXJnZXRIZWlnaHQiLCJ2ZXJ0aWNhbFBhZGRpbmciLCJpcyIsIl9hcHBseURhdGFBcGkiLCJncm91cHMiLCJncm91cElkIiwiX3VwZGF0ZSIsInRocm90dGxlIiwid2luZG93V2lkdGgiLCJ3aWR0aCIsIm9wdGlvbk92ZXJyaWRlcyIsImRlZmF1bHRzIiwiZXhjbHVkZSIsImV4Y2x1ZGVXaXRoaW4iLCJkaXJlY3Rpb24iLCJkZWxlZ2F0ZVNlbGVjdG9yIiwic2Nyb2xsRWxlbWVudCIsInNjcm9sbFRhcmdldCIsImF1dG9Gb2N1cyIsImJlZm9yZVNjcm9sbCIsImFmdGVyU2Nyb2xsIiwiZWFzaW5nIiwic3BlZWQiLCJhdXRvQ29lZmZpY2llbnQiLCJwcmV2ZW50RGVmYXVsdCIsImdldFNjcm9sbGFibGUiLCJzY3JvbGxhYmxlIiwic2Nyb2xsZWQiLCJkaXIiLCJlbCIsInNjcm9sbGluZ0VsZW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJib2R5IiwiclJlbGF0aXZlIiwic2NybCIsInB1c2hTdGFjayIsImZpcnN0U2Nyb2xsYWJsZSIsInNtb290aFNjcm9sbCIsImV4dHJhIiwiZmlyc3QiLCJjbGlja0hhbmRsZXIiLCJlc2NhcGVTZWxlY3RvciIsInN0ciIsIiRsaW5rIiwidGhpc09wdHMiLCJlbENvdW50ZXIiLCJld2xDb3VudGVyIiwiaW5jbHVkZSIsImNsaWNrT3B0cyIsImxvY2F0aW9uUGF0aCIsImZpbHRlclBhdGgiLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwibGlua1BhdGgiLCJob3N0TWF0Y2giLCJob3N0bmFtZSIsInBhdGhNYXRjaCIsInRoaXNIYXNoIiwiaGFzaCIsImdldEV4cGxpY2l0T2Zmc2V0IiwidmFsIiwiZXhwbGljaXQiLCJyZWxhdGl2ZSIsInBhcnRzIiwicHgiLCJvbkFmdGVyU2Nyb2xsIiwiJHRndCIsImZvY3VzIiwiYWN0aXZlRWxlbWVudCIsInRhYkluZGV4IiwiJHNjcm9sbGVyIiwiZGVsdGEiLCJleHBsaWNpdE9mZnNldCIsInNjcm9sbFRhcmdldE9mZnNldCIsInNjcm9sbGVyT2Zmc2V0Iiwib2ZmUG9zIiwic2Nyb2xsRGlyIiwiYW5pUHJvcHMiLCJhbmlPcHRzIiwiZHVyYXRpb24iLCJzdGVwIiwic3RvcCIsImFuaW1hdGUiLCJzdHJpbmciLCJrZXlDb3VudGVyIiwiYWxsV2F5cG9pbnRzIiwiV2F5cG9pbnQiLCJFcnJvciIsImhhbmRsZXIiLCJBZGFwdGVyIiwiYWRhcHRlciIsImF4aXMiLCJob3Jpem9udGFsIiwiZW5hYmxlZCIsInRyaWdnZXJQb2ludCIsIkdyb3VwIiwiZmluZE9yQ3JlYXRlIiwibmFtZSIsIkNvbnRleHQiLCJmaW5kT3JDcmVhdGVCeUVsZW1lbnQiLCJvZmZzZXRBbGlhc2VzIiwicXVldWVUcmlnZ2VyIiwidHJpZ2dlciIsImRlc3Ryb3kiLCJkaXNhYmxlIiwiZW5hYmxlIiwicmVmcmVzaCIsInByZXZpb3VzIiwiaW52b2tlQWxsIiwiYWxsV2F5cG9pbnRzQXJyYXkiLCJ3YXlwb2ludEtleSIsImVuZCIsImRlc3Ryb3lBbGwiLCJkaXNhYmxlQWxsIiwiZW5hYmxlQWxsIiwicmVmcmVzaEFsbCIsInZpZXdwb3J0SGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJ2aWV3cG9ydFdpZHRoIiwiY2xpZW50V2lkdGgiLCJhZGFwdGVycyIsImNvbnRpbnVvdXMiLCJpbm5lcldpZHRoIiwib3V0ZXJXaWR0aCIsInJlcXVlc3RBbmltYXRpb25GcmFtZVNoaW0iLCJjb250ZXh0cyIsIm9sZFdpbmRvd0xvYWQiLCJkaWRTY3JvbGwiLCJkaWRSZXNpemUiLCJvbGRTY3JvbGwiLCJ4Iiwic2Nyb2xsTGVmdCIsInkiLCJ3YXlwb2ludHMiLCJ2ZXJ0aWNhbCIsIndheXBvaW50Q29udGV4dEtleSIsIndpbmRvd0NvbnRleHQiLCJjcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyIiwiY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlciIsIndheXBvaW50IiwiY2hlY2tFbXB0eSIsImhvcml6b250YWxFbXB0eSIsImlzRW1wdHlPYmplY3QiLCJ2ZXJ0aWNhbEVtcHR5IiwiaXNXaW5kb3ciLCJzZWxmIiwicmVzaXplSGFuZGxlciIsImhhbmRsZVJlc2l6ZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInNjcm9sbEhhbmRsZXIiLCJoYW5kbGVTY3JvbGwiLCJpc1RvdWNoIiwidHJpZ2dlcmVkR3JvdXBzIiwiYXhlcyIsIm5ld1Njcm9sbCIsImZvcndhcmQiLCJiYWNrd2FyZCIsImF4aXNLZXkiLCJpc0ZvcndhcmQiLCJ3YXNCZWZvcmVUcmlnZ2VyUG9pbnQiLCJub3dBZnRlclRyaWdnZXJQb2ludCIsImNyb3NzZWRGb3J3YXJkIiwiY3Jvc3NlZEJhY2t3YXJkIiwiZ3JvdXBLZXkiLCJmbHVzaFRyaWdnZXJzIiwiY29udGV4dE9mZnNldCIsImxlZnQiLCJjb250ZXh0U2Nyb2xsIiwiY29udGV4dERpbWVuc2lvbiIsIm9mZnNldFByb3AiLCJhZGp1c3RtZW50Iiwib2xkVHJpZ2dlclBvaW50IiwiZWxlbWVudE9mZnNldCIsImZyZXNoV2F5cG9pbnQiLCJjb250ZXh0TW9kaWZpZXIiLCJ3YXNCZWZvcmVTY3JvbGwiLCJub3dBZnRlclNjcm9sbCIsInRyaWdnZXJlZEJhY2t3YXJkIiwidHJpZ2dlcmVkRm9yd2FyZCIsImNlaWwiLCJmaW5kQnlFbGVtZW50IiwiY29udGV4dElkIiwicmVxdWVzdEZuIiwibW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwid2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiYnlUcmlnZ2VyUG9pbnQiLCJieVJldmVyc2VUcmlnZ2VyUG9pbnQiLCJjbGVhclRyaWdnZXJRdWV1ZXMiLCJ0cmlnZ2VyUXVldWVzIiwidXAiLCJkb3duIiwicmlnaHQiLCJyZXZlcnNlIiwic29ydCIsImluQXJyYXkiLCJpc0xhc3QiLCJsYXN0IiwiSlF1ZXJ5QWRhcHRlciIsIiRlbGVtZW50IiwiYXJndW1lbnRzIiwiY3JlYXRlRXh0ZW5zaW9uIiwiZnJhbWV3b3JrIiwib3ZlcnJpZGVzIiwiWmVwdG8iLCJjdXJyZW50IiwiQ29va2llcyIsIm5vQ29uZmxpY3QiLCJhc3NpZ24iLCJzb3VyY2UiLCJkZWZhdWx0Q29udmVydGVyIiwicmVhZCIsImRlY29kZVVSSUNvbXBvbmVudCIsIndyaXRlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY29udmVydGVyIiwiZGVmYXVsdEF0dHJpYnV0ZXMiLCJzZXQiLCJhdHRyaWJ1dGVzIiwiZXhwaXJlcyIsIkRhdGUiLCJub3ciLCJ0b1VUQ1N0cmluZyIsImVzY2FwZSIsInN0cmluZ2lmaWVkQXR0cmlidXRlcyIsImF0dHJpYnV0ZU5hbWUiLCJzcGxpdCIsImNvb2tpZSIsImdldCIsImNvb2tpZXMiLCJqYXIiLCJmb3VuZEtleSIsIndpdGhBdHRyaWJ1dGVzIiwid2l0aENvbnZlcnRlciIsImZyZWV6ZSIsImFwaSIsInBhdGgiLCJyZWNsaW5lciIsIiR3IiwibG9hZGVkIiwidGltZXIiLCJhdHRyaWIiLCJ0aHJlc2hvbGQiLCJwcmludGFibGUiLCJsaXZlIiwiZ2V0U2NyaXB0IiwibG9hZCIsIiRlIiwicHJvY2VzcyIsImhlaWdodCIsImVvZiIsInNjcm9sbFkiLCJvZmZzZXRIZWlnaHQiLCJpbnZpZXciLCJ3dCIsIndiIiwiZXQiLCJlYiIsImVscyIsIm9uZSIsIm1hdGNoTWVkaWEiLCJhZGRMaXN0ZW5lciIsIm1xbCIsImRlcmVjbGluZXIiLCJTbGljayIsImluc3RhbmNlVWlkIiwic2V0dGluZ3MiLCJfIiwiZGF0YVNldHRpbmdzIiwiYWNjZXNzaWJpbGl0eSIsImFkYXB0aXZlSGVpZ2h0IiwiYXBwZW5kQXJyb3dzIiwiYXBwZW5kRG90cyIsImFycm93cyIsImFzTmF2Rm9yIiwicHJldkFycm93IiwibmV4dEFycm93IiwiYXV0b3BsYXkiLCJhdXRvcGxheVNwZWVkIiwiY2VudGVyTW9kZSIsImNlbnRlclBhZGRpbmciLCJjc3NFYXNlIiwiY3VzdG9tUGFnaW5nIiwic2xpZGVyIiwidGV4dCIsImRvdHMiLCJkb3RzQ2xhc3MiLCJkcmFnZ2FibGUiLCJlZGdlRnJpY3Rpb24iLCJmYWRlIiwiZm9jdXNPblNlbGVjdCIsImZvY3VzT25DaGFuZ2UiLCJpbmZpbml0ZSIsImluaXRpYWxTbGlkZSIsImxhenlMb2FkIiwibW9iaWxlRmlyc3QiLCJwYXVzZU9uSG92ZXIiLCJwYXVzZU9uRm9jdXMiLCJwYXVzZU9uRG90c0hvdmVyIiwicmVzcG9uZFRvIiwicmVzcG9uc2l2ZSIsInJ0bCIsInNsaWRlIiwic2xpZGVzUGVyUm93Iiwic2xpZGVzVG9TaG93Iiwic2xpZGVzVG9TY3JvbGwiLCJzd2lwZSIsInN3aXBlVG9TbGlkZSIsInRvdWNoTW92ZSIsInRvdWNoVGhyZXNob2xkIiwidXNlQ1NTIiwidXNlVHJhbnNmb3JtIiwidmFyaWFibGVXaWR0aCIsInZlcnRpY2FsU3dpcGluZyIsIndhaXRGb3JBbmltYXRlIiwiekluZGV4IiwiaW5pdGlhbHMiLCJhbmltYXRpbmciLCJkcmFnZ2luZyIsImF1dG9QbGF5VGltZXIiLCJjdXJyZW50RGlyZWN0aW9uIiwiY3VycmVudExlZnQiLCJjdXJyZW50U2xpZGUiLCIkZG90cyIsImxpc3RXaWR0aCIsImxpc3RIZWlnaHQiLCJsb2FkSW5kZXgiLCIkbmV4dEFycm93IiwiJHByZXZBcnJvdyIsInNjcm9sbGluZyIsInNsaWRlQ291bnQiLCJzbGlkZVdpZHRoIiwiJHNsaWRlVHJhY2siLCIkc2xpZGVzIiwic2xpZGluZyIsInNsaWRlT2Zmc2V0Iiwic3dpcGVMZWZ0Iiwic3dpcGluZyIsIiRsaXN0IiwidG91Y2hPYmplY3QiLCJ0cmFuc2Zvcm1zRW5hYmxlZCIsInVuc2xpY2tlZCIsImFjdGl2ZUJyZWFrcG9pbnQiLCJhbmltVHlwZSIsImFuaW1Qcm9wIiwiYnJlYWtwb2ludHMiLCJicmVha3BvaW50U2V0dGluZ3MiLCJjc3NUcmFuc2l0aW9ucyIsImZvY3Vzc2VkIiwiaW50ZXJydXB0ZWQiLCJoaWRkZW4iLCJwYXVzZWQiLCJwb3NpdGlvblByb3AiLCJyb3dDb3VudCIsInNob3VsZENsaWNrIiwiJHNsaWRlciIsIiRzbGlkZXNDYWNoZSIsInRyYW5zZm9ybVR5cGUiLCJ0cmFuc2l0aW9uVHlwZSIsInZpc2liaWxpdHlDaGFuZ2UiLCJ3aW5kb3dUaW1lciIsIm9yaWdpbmFsU2V0dGluZ3MiLCJtb3pIaWRkZW4iLCJ3ZWJraXRIaWRkZW4iLCJhdXRvUGxheSIsInByb3h5IiwiYXV0b1BsYXlDbGVhciIsImF1dG9QbGF5SXRlcmF0b3IiLCJjaGFuZ2VTbGlkZSIsInNlbGVjdEhhbmRsZXIiLCJzZXRQb3NpdGlvbiIsInN3aXBlSGFuZGxlciIsImRyYWdIYW5kbGVyIiwia2V5SGFuZGxlciIsImh0bWxFeHByIiwicmVnaXN0ZXJCcmVha3BvaW50cyIsImFjdGl2YXRlQURBIiwiYWRkU2xpZGUiLCJzbGlja0FkZCIsIm1hcmt1cCIsImFkZEJlZm9yZSIsInVubG9hZCIsImluc2VydEJlZm9yZSIsImluc2VydEFmdGVyIiwicHJlcGVuZFRvIiwiZGV0YWNoIiwicmVpbml0IiwiYW5pbWF0ZUhlaWdodCIsImFuaW1hdGVTbGlkZSIsInRhcmdldExlZnQiLCJhbmltUHJvcHMiLCJhbmltU3RhcnQiLCJhcHBseVRyYW5zaXRpb24iLCJkaXNhYmxlVHJhbnNpdGlvbiIsImdldE5hdlRhcmdldCIsInNsaWNrIiwic2xpZGVIYW5kbGVyIiwidHJhbnNpdGlvbiIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsInNsaWRlVG8iLCJidWlsZEFycm93cyIsImJ1aWxkRG90cyIsImRvdCIsImdldERvdENvdW50IiwiYnVpbGRPdXQiLCJ3cmFwQWxsIiwicGFyZW50Iiwid3JhcCIsInNldHVwSW5maW5pdGUiLCJ1cGRhdGVEb3RzIiwic2V0U2xpZGVDbGFzc2VzIiwiYnVpbGRSb3dzIiwibmV3U2xpZGVzIiwibnVtT2ZTbGlkZXMiLCJvcmlnaW5hbFNsaWRlcyIsInNsaWRlc1BlclNlY3Rpb24iLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY3JlYXRlRWxlbWVudCIsImFwcGVuZENoaWxkIiwiZW1wdHkiLCJjaGVja1Jlc3BvbnNpdmUiLCJpbml0aWFsIiwiZm9yY2VVcGRhdGUiLCJicmVha3BvaW50IiwidGFyZ2V0QnJlYWtwb2ludCIsInJlc3BvbmRUb1dpZHRoIiwidHJpZ2dlckJyZWFrcG9pbnQiLCJzbGlkZXJXaWR0aCIsIm1pbiIsImhhc093blByb3BlcnR5IiwidW5zbGljayIsImRvbnRBbmltYXRlIiwiJHRhcmdldCIsImN1cnJlbnRUYXJnZXQiLCJpbmRleE9mZnNldCIsInVuZXZlbk9mZnNldCIsImNoZWNrTmF2aWdhYmxlIiwibmF2aWdhYmxlcyIsInByZXZOYXZpZ2FibGUiLCJnZXROYXZpZ2FibGVJbmRleGVzIiwiY2xlYW5VcEV2ZW50cyIsImludGVycnVwdCIsInZpc2liaWxpdHkiLCJjbGVhblVwU2xpZGVFdmVudHMiLCJvcmllbnRhdGlvbkNoYW5nZSIsInJlc2l6ZSIsImNsZWFuVXBSb3dzIiwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIiwic3RvcFByb3BhZ2F0aW9uIiwiZmFkZVNsaWRlIiwic2xpZGVJbmRleCIsIm9wYWNpdHkiLCJmYWRlU2xpZGVPdXQiLCJmaWx0ZXJTbGlkZXMiLCJzbGlja0ZpbHRlciIsImZvY3VzSGFuZGxlciIsIiRzZiIsImdldEN1cnJlbnQiLCJzbGlja0N1cnJlbnRTbGlkZSIsImJyZWFrUG9pbnQiLCJjb3VudGVyIiwicGFnZXJRdHkiLCJnZXRMZWZ0IiwidmVydGljYWxIZWlnaHQiLCJ2ZXJ0aWNhbE9mZnNldCIsInRhcmdldFNsaWRlIiwiY29lZiIsIm9mZnNldExlZnQiLCJnZXRPcHRpb24iLCJzbGlja0dldE9wdGlvbiIsIm9wdGlvbiIsImluZGV4ZXMiLCJtYXgiLCJnZXRTbGljayIsImdldFNsaWRlQ291bnQiLCJzbGlkZXNUcmF2ZXJzZWQiLCJzd2lwZWRTbGlkZSIsImNlbnRlck9mZnNldCIsImdvVG8iLCJzbGlja0dvVG8iLCJwYXJzZUludCIsImNyZWF0aW9uIiwiaGFzQ2xhc3MiLCJzZXRQcm9wcyIsInN0YXJ0TG9hZCIsImxvYWRTbGlkZXIiLCJpbml0aWFsaXplRXZlbnRzIiwidXBkYXRlQXJyb3dzIiwiaW5pdEFEQSIsIm51bURvdEdyb3VwcyIsInRhYkNvbnRyb2xJbmRleGVzIiwic2xpZGVDb250cm9sSW5kZXgiLCJhcmlhQnV0dG9uQ29udHJvbCIsIm1hcHBlZFNsaWRlSW5kZXgiLCJpbml0QXJyb3dFdmVudHMiLCJpbml0RG90RXZlbnRzIiwiaW5pdFNsaWRlRXZlbnRzIiwiYWN0aW9uIiwiaW5pdFVJIiwidGFnTmFtZSIsImtleUNvZGUiLCJsb2FkUmFuZ2UiLCJjbG9uZVJhbmdlIiwicmFuZ2VTdGFydCIsInJhbmdlRW5kIiwibG9hZEltYWdlcyIsImltYWdlc1Njb3BlIiwiaW1hZ2VTb3VyY2UiLCJpbWFnZVNyY1NldCIsImltYWdlU2l6ZXMiLCJpbWFnZVRvTG9hZCIsInByZXZTbGlkZSIsIm5leHRTbGlkZSIsInByb2dyZXNzaXZlTGF6eUxvYWQiLCJzbGlja05leHQiLCJwYXVzZSIsInNsaWNrUGF1c2UiLCJwbGF5Iiwic2xpY2tQbGF5IiwicG9zdFNsaWRlIiwiJGN1cnJlbnRTbGlkZSIsInByZXYiLCJzbGlja1ByZXYiLCJ0cnlDb3VudCIsIiRpbWdzVG9Mb2FkIiwiaW5pdGlhbGl6aW5nIiwibGFzdFZpc2libGVJbmRleCIsImN1cnJlbnRCcmVha3BvaW50IiwicmVzcG9uc2l2ZVNldHRpbmdzIiwid2luZG93RGVsYXkiLCJyZW1vdmVTbGlkZSIsInNsaWNrUmVtb3ZlIiwicmVtb3ZlQmVmb3JlIiwicmVtb3ZlQWxsIiwic2V0Q1NTIiwicG9zaXRpb24iLCJwb3NpdGlvblByb3BzIiwic2V0RGltZW5zaW9ucyIsInBhZGRpbmciLCJzZXRGYWRlIiwic2V0SGVpZ2h0Iiwic2V0T3B0aW9uIiwic2xpY2tTZXRPcHRpb24iLCJpdGVtIiwib3B0IiwiYm9keVN0eWxlIiwiV2Via2l0VHJhbnNpdGlvbiIsIk1velRyYW5zaXRpb24iLCJtc1RyYW5zaXRpb24iLCJPVHJhbnNmb3JtIiwicGVyc3BlY3RpdmVQcm9wZXJ0eSIsIndlYmtpdFBlcnNwZWN0aXZlIiwiTW96VHJhbnNmb3JtIiwiTW96UGVyc3BlY3RpdmUiLCJ3ZWJraXRUcmFuc2Zvcm0iLCJtc1RyYW5zZm9ybSIsInRyYW5zZm9ybSIsImFsbFNsaWRlcyIsInJlbWFpbmRlciIsImV2ZW5Db2VmIiwiaW5maW5pdGVDb3VudCIsInRhcmdldEVsZW1lbnQiLCJzeW5jIiwiYW5pbVNsaWRlIiwib2xkU2xpZGUiLCJzbGlkZUxlZnQiLCJuYXZUYXJnZXQiLCJzd2lwZURpcmVjdGlvbiIsInhEaXN0IiwieURpc3QiLCJyIiwic3dpcGVBbmdsZSIsInN0YXJ0WCIsImN1clgiLCJzdGFydFkiLCJjdXJZIiwiYXRhbjIiLCJyb3VuZCIsIlBJIiwic3dpcGVFbmQiLCJzd2lwZUxlbmd0aCIsImVkZ2VIaXQiLCJtaW5Td2lwZSIsImZpbmdlckNvdW50Iiwib3JpZ2luYWxFdmVudCIsInRvdWNoZXMiLCJzd2lwZVN0YXJ0Iiwic3dpcGVNb3ZlIiwiZWRnZVdhc0hpdCIsImN1ckxlZnQiLCJwb3NpdGlvbk9mZnNldCIsInZlcnRpY2FsU3dpcGVMZW5ndGgiLCJjbGllbnRYIiwiY2xpZW50WSIsInNxcnQiLCJwb3ciLCJ1bmZpbHRlclNsaWRlcyIsInNsaWNrVW5maWx0ZXIiLCJmcm9tQnJlYWtwb2ludCIsInJldCIsInciLCJtZXRob2RzIiwiYmNDbGFzcyIsIm1lbnVDbGFzcyIsImFuY2hvckNsYXNzIiwibWVudUFycm93Q2xhc3MiLCJpb3MiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJub29wIiwid3A3IiwidW5wcmVmaXhlZFBvaW50ZXJFdmVudHMiLCJQb2ludGVyRXZlbnQiLCJ0b2dnbGVNZW51Q2xhc3NlcyIsImNsYXNzZXMiLCJjc3NBcnJvd3MiLCJzZXRQYXRoVG9DdXJyZW50IiwicGF0aENsYXNzIiwicGF0aExldmVscyIsImhvdmVyQ2xhc3MiLCJwb3BVcFNlbGVjdG9yIiwidG9nZ2xlQW5jaG9yQ2xhc3MiLCIkbGkiLCJ0b2dnbGVUb3VjaEFjdGlvbiIsIm1zVG91Y2hBY3Rpb24iLCJ0b3VjaEFjdGlvbiIsImdldE1lbnUiLCIkZWwiLCJnZXRPcHRpb25zIiwic2ZUaW1lciIsImNsb3NlIiwicmV0YWluUGF0aCIsIiRwYXRoIiwib25JZGxlIiwidG91Y2hIYW5kbGVyIiwiJHVsIiwib25IYW5kbGVUb3VjaCIsImFwcGx5SGFuZGxlcnMiLCJkaXNhYmxlSEkiLCJ0b3VjaGV2ZW50IiwiaW5zdGFudCIsInNwZWVkT3V0Iiwib25CZWZvcmVIaWRlIiwiYW5pbWF0aW9uT3V0Iiwib25IaWRlIiwib25CZWZvcmVTaG93IiwiYW5pbWF0aW9uIiwib25TaG93IiwiJGhhc1BvcFVwIiwib25EZXN0cm95IiwicmVtb3ZlRGF0YSIsIm9wIiwib25Jbml0IiwiSW52aWV3IiwiY3JlYXRlV2F5cG9pbnRzIiwiY29uZmlncyIsImNvbmZpZyIsImNyZWF0ZVdheXBvaW50IiwiZW50ZXIiLCJlbnRlcmVkIiwiZXhpdCIsImV4aXRlZCIsIiRsZWdlbmQiLCIkbWFwcyIsIm1vdXNlbGVhdmUiLCJzZWFyY2hQYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJzZWFyY2giLCJoYXMiLCJwYXJhbSIsImZhZGVPdXQiLCJyZWFjdE1hdGNoSGVpZ2h0IiwiZWxDbGFzc05hbWUiLCJpc0ludGVybmFsTGluayIsIlJlZ0V4cCIsImhvc3QiLCJocmVmIiwibGFzdFNjcm9sbFRvcCIsIm5hdmJhckhlaWdodCIsInNjcm9sbCIsImhhc1Njcm9sbGVkIiwic3QiLCJmb3VuZGF0aW9uIiwiJHRvZ2dsZSIsImFuaW1hdGVOdW1iZXJzIiwidmlld2VkIiwiaXNTY3JvbGxlZEludG9WaWV3IiwiZG9jVmlld1RvcCIsImRvY1ZpZXdCb3R0b20iLCJlbGVtVG9wIiwiZWxlbUJvdHRvbSIsIkNvdW50ZXIiLCJ0b1N0cmluZyIsIiRpbWciLCJpbWdJRCIsImltZ0NsYXNzIiwiaW1nVVJMIiwiJHN2ZyIsInJlcGxhY2VXaXRoIiwiJGNvbHVtbiIsImNsaWNrIiwiJHRoaXNDb2x1bW4iLCJGb3VuZGF0aW9uIiwiTWVkaWFRdWVyeSIsImF0TGVhc3QiLCJsYWJlbCIsInBsYXlWaWRlbyIsInNpemUiLCIkbW9kYWwiLCIkaWZyYW1lIiwiZnJhbWVib3JkZXIiLCJodG1sIiwiJHN0aWNreUhlYWRlciIsIiRzdGlja3lOYXYiLCIkYm9keSIsIiR3cEFkbWluQmFyIiwic2hvd05vdGlmaWNhdGlvbkJhciIsIiRub3RpZmljYXRpb25CYXIiLCJoYXNOb3RpZmljYXRpb25CYXIiLCJnZXRMYXN0U2libGluZ0luUm93IiwiY2FuZGlkYXRlIiwiZWxlbWVudFRvcCIsIm9mZnNldFRvcCIsIm5leHRFbGVtZW50U2libGluZyIsIiRncmlkIiwiJGZpbHRlckJ1dHRvbnMiLCJmaWx0ZXJWYWx1ZSIsIiRhbGxGYXFzIiwiJG5ld0FjdGl2ZUZhcXMiLCIkbmV3RGVhY3RpdmF0ZWRGYXFzIiwiJGh0bWwiLCIkb25fcGFnZV9saW5rcyIsIiRsaW5rc19jb250YWluZXIiLCIkbWVudV9idXR0b24iLCIkbWVudV93aWR0aCIsIm9uX3BhZ2VfbGlua3NfbW9iaWxlX2Rpc3BsYXkiLCIkbGlua3NfY29udGFpbmVyX3dpZHRoIiwiJGl0ZW1zX3dpZHRoIiwiJGRpc3BsYXlfbWVudSIsIm9uX3BhZ2VfbGlua3NfbW9iaWxlX2NsYXNzZXMiLCJtb2JpbGVOYXZfYWN0aXZhdGUiLCJtb2JpbGVOYXZfZGVhY3RpdmF0ZSIsIm1vYmlsZU5hdl90b2dnbGUiLCJvbl9wYWdlX2xpbmtzX3Jlc2l6ZXIiLCIkcmVzb3VyY2VzX2FjY29yZGlvbl9saW5rcyIsIiR0cmlnZ2VyX3dpZHRoIiwiJHdpbmRvd193aWR0aCIsInJlc291cmNlc0FjY29yZGlvbnNJbml0Q2xvc2UiLCIkaXNfbW9iaWxlIiwicmVzb3VyY2VzQWNjb3JkaW9uUmVzaXplQ2xvc2UiLCJyZXNvdXJjZXNBY2NvcmRpb25zUmVzaXplciIsIiRwYWdlYnVpbGRlcl9pbWFnZV9saWJyYXJ5IiwiJGF1dG9wbGF5IiwiJGF1dG9wbGF5U3BlZWQiLCJpbWFnZUxpYnJhcnlDYXB0aW9uUmVzaXplciIsIiRjYXB0aW9ucyIsIiRjYXB0aW9uIiwiJGNhcHRpb25IZWlnaHQiLCJkb25lIiwibGlnaHRHYWxsZXJ5IiwidGh1bWJuYWlsIiwiJHBhZ2VidWlsZGVyX2Z1bGxfd2lkdGhfaW1hZ2VfY2Fyb3VzZWwiLCIkcGFnZWJ1aWxkZXJfc3RlcHMiLCJob3ZlciIsIiRhbGxfb2VtYmVkX3ZpZGVvcyIsImxvYWRSZWdpb24iLCIkcmVnaW9uIiwibG9hZE1hcCIsIiRtYXAiLCJsb2FkUHJvamVjdCIsIiRwcm9qZWN0IiwiJHNlY3Rpb25fdmlkZW9zIiwiJHNlY3Rpb25fc3RvcmllcyIsIiRzaW5nbGVQb3N0U2xpZGVyIiwiJHNlY3Rpb25fcmVsYXRlZF9wb3N0cyIsIiRzZWN0aW9uX3Rlc3RpbW9uaWFscyIsImhpZGVfaGVhZGVyX21lbnUiLCJzY3JvbGxub3ciLCJkcm9wU2hhZG93cyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFFQSxDQUFDLFlBQVk7QUFDWDs7QUFFQSxNQUFJQSxhQUFhLENBQWpCO0FBQ0EsTUFBSUMsYUFBYSxFQUFqQjtBQUNBLE1BQUlDLGFBQWEsRUFBakI7O0FBRUEsV0FBU0MsQ0FBVCxDQUFZQyxRQUFaLEVBQXNCQyxPQUF0QixFQUErQjtBQUM3QixXQUFPQyxNQUFNQyxTQUFOLENBQWdCQyxLQUFoQixDQUFzQkMsSUFBdEIsQ0FDTCxDQUFDSixXQUFXSyxRQUFaLEVBQXNCQyxnQkFBdEIsQ0FBdUNQLFFBQXZDLENBREssQ0FBUDtBQUdEOztBQUVELFdBQVNRLGdCQUFULENBQTJCQyxPQUEzQixFQUFvQztBQUNsQyxRQUFJQSxRQUFRQyxPQUFaLEVBQXFCO0FBQ25CLGFBQU9ELFFBQVFDLE9BQVIsQ0FBZ0Isb0JBQWhCLENBQVA7QUFDRDs7QUFFRCxXQUFPRCxPQUFQLEVBQWdCO0FBQ2QsVUFBSUEsUUFBUUUsUUFBUixLQUFxQixDQUFyQixJQUEwQkYsUUFBUUcsWUFBUixDQUFxQixrQkFBckIsQ0FBOUIsRUFBd0U7QUFDdEUsZUFBT0gsT0FBUDtBQUNEOztBQUVEQSxnQkFBVUEsUUFBUUksVUFBbEI7QUFDRDs7QUFFRCxXQUFPLElBQVA7QUFDRDs7QUFFRCxXQUFTQyxZQUFULENBQXVCQyxNQUF2QixFQUErQjtBQUM3QixRQUFJQyxTQUFTRCxVQUFVakIsV0FBV2lCLE9BQU9FLFlBQVAsQ0FBb0IsZUFBcEIsQ0FBWCxDQUF2Qjs7QUFFQSxRQUFJLENBQUNELE1BQUwsRUFBYTtBQUNYLGFBQU8sS0FBUDtBQUNEOztBQUVELFFBQUlFLFVBQVVyQixXQUFXLE1BQU1tQixPQUFPRyxFQUF4QixDQUFkO0FBQ0EsUUFBSUMsYUFBYUosT0FBT0MsWUFBUCxDQUFvQixhQUFwQixNQUF1QyxPQUF4RDs7QUFFQUQsV0FBT0ss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c0RrZ0MsU0FBdEQ7QUFFSCxDQXBFQSxFQW9FQ3RrQyxRQXBFRCxFQW9FVytCLE1BcEVYLEVBb0VtQjRGLE1BcEVuQixDQUFEOzs7QXJCQUMsV0FBVTNILFFBQVYsRUFBb0IrQixNQUFwQixFQUE0QnRDLENBQTVCLEVBQStCOztBQUUvQjs7QUFFQUEsU0FBRSxlQUFGLEVBQW1CK0csU0FBbkIsQ0FBNkI7QUFDdEJrRCxxQkFBTSxHQURnQjtBQUV0QjtBQUNBNjZCLDJCQUFZLENBQUM7QUFIUyxRQUE3QjtBQU9BLENBWEEsRUFXQ3ZrQyxRQVhELEVBV1crQixNQVhYLEVBV21CNEYsTUFYbkIsQ0FBRCIsImZpbGUiOiJwcm9qZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaHR0cHM6Ly9lZGVuc3BpZWtlcm1hbm4uZ2l0aHViLmlvL2ExMXktdG9nZ2xlL1xuXG4oZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIGludGVybmFsSWQgPSAwO1xuICB2YXIgdG9nZ2xlc01hcCA9IHt9O1xuICB2YXIgdGFyZ2V0c01hcCA9IHt9O1xuXG4gIGZ1bmN0aW9uICQgKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKFxuICAgICAgKGNvbnRleHQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENsb3Nlc3RUb2dnbGUgKGVsZW1lbnQpIHtcbiAgICBpZiAoZWxlbWVudC5jbG9zZXN0KSB7XG4gICAgICByZXR1cm4gZWxlbWVudC5jbG9zZXN0KCdbZGF0YS1hMTF5LXRvZ2dsZV0nKTtcbiAgICB9XG5cbiAgICB3aGlsZSAoZWxlbWVudCkge1xuICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDEgJiYgZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2RhdGEtYTExeS10b2dnbGUnKSkge1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgIH1cblxuICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVRvZ2dsZSAodG9nZ2xlKSB7XG4gICAgdmFyIHRhcmdldCA9IHRvZ2dsZSAmJiB0YXJnZXRzTWFwW3RvZ2dsZS5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKV07XG5cbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciB0b2dnbGVzID0gdG9nZ2xlc01hcFsnIycgKyB0YXJnZXQuaWRdO1xuICAgIHZhciBpc0V4cGFuZGVkID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKSA9PT0gJ2ZhbHNlJztcblxuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgaXNFeHBhbmRlZCk7XG4gICAgdG9nZ2xlcy5mb3JFYWNoKGZ1bmN0aW9uICh0b2dnbGUpIHtcbiAgICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAhaXNFeHBhbmRlZCk7XG4gICAgICBpZighaXNFeHBhbmRlZCkge1xuICAgICAgICBpZih0b2dnbGUuaGFzQXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLWxlc3MnKSkge1xuICAgICAgICAgICAgdG9nZ2xlLmlubmVySFRNTCA9IHRvZ2dsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYTExeS10b2dnbGUtbGVzcycpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZih0b2dnbGUuaGFzQXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLW1vcmUnKSkge1xuICAgICAgICAgICAgdG9nZ2xlLmlubmVySFRNTCA9IHRvZ2dsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYTExeS10b2dnbGUtbW9yZScpO1xuICAgICAgICB9XG4gICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHZhciBpbml0QTExeVRvZ2dsZSA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgdG9nZ2xlc01hcCA9ICQoJ1tkYXRhLWExMXktdG9nZ2xlXScsIGNvbnRleHQpLnJlZHVjZShmdW5jdGlvbiAoYWNjLCB0b2dnbGUpIHtcbiAgICAgIHZhciBzZWxlY3RvciA9ICcjJyArIHRvZ2dsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYTExeS10b2dnbGUnKTtcbiAgICAgIGFjY1tzZWxlY3Rvcl0gPSBhY2Nbc2VsZWN0b3JdIHx8IFtdO1xuICAgICAgYWNjW3NlbGVjdG9yXS5wdXNoKHRvZ2dsZSk7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHRvZ2dsZXNNYXApO1xuXG4gICAgdmFyIHRhcmdldHMgPSBPYmplY3Qua2V5cyh0b2dnbGVzTWFwKTtcbiAgICB0YXJnZXRzLmxlbmd0aCAmJiAkKHRhcmdldHMpLmZvckVhY2goZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgdmFyIHRvZ2dsZXMgPSB0b2dnbGVzTWFwWycjJyArIHRhcmdldC5pZF07XG4gICAgICB2YXIgaXNFeHBhbmRlZCA9IHRhcmdldC5oYXNBdHRyaWJ1dGUoJ2RhdGEtYTExeS10b2dnbGUtb3BlbicpO1xuICAgICAgdmFyIGxhYmVsbGVkYnkgPSBbXTtcblxuICAgICAgdG9nZ2xlcy5mb3JFYWNoKGZ1bmN0aW9uICh0b2dnbGUpIHtcbiAgICAgICAgdG9nZ2xlLmlkIHx8IHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2ExMXktdG9nZ2xlLScgKyBpbnRlcm5hbElkKyspO1xuICAgICAgICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJywgdGFyZ2V0LmlkKTtcbiAgICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIGlzRXhwYW5kZWQpOyAgICAgICAgXG4gICAgICAgIGxhYmVsbGVkYnkucHVzaCh0b2dnbGUuaWQpO1xuICAgICAgfSk7XG5cbiAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgIWlzRXhwYW5kZWQpO1xuICAgICAgdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JykgfHwgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgbGFiZWxsZWRieS5qb2luKCcgJykpO1xuXG4gICAgICB0YXJnZXRzTWFwW3RhcmdldC5pZF0gPSB0YXJnZXQ7XG4gICAgfSk7XG4gIH07XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBpbml0QTExeVRvZ2dsZSgpO1xuICB9KTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciB0b2dnbGUgPSBnZXRDbG9zZXN0VG9nZ2xlKGV2ZW50LnRhcmdldCk7XG4gICAgaGFuZGxlVG9nZ2xlKHRvZ2dsZSk7XG4gIH0pO1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LndoaWNoID09PSAxMyB8fCBldmVudC53aGljaCA9PT0gMzIpIHtcbiAgICAgIHZhciB0b2dnbGUgPSBnZXRDbG9zZXN0VG9nZ2xlKGV2ZW50LnRhcmdldCk7XG4gICAgICBpZiAodG9nZ2xlICYmIHRvZ2dsZS5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSA9PT0gJ2J1dHRvbicpIHtcbiAgICAgICAgaGFuZGxlVG9nZ2xlKHRvZ2dsZSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICB3aW5kb3cgJiYgKHdpbmRvdy5hMTF5VG9nZ2xlID0gaW5pdEExMXlUb2dnbGUpO1xufSkoKTtcbiIsIi8qKlxuICogVGhpcyBzY3JpcHQgYWRkcyB0aGUgYWNjZXNzaWJpbGl0eS1yZWFkeSByZXNwb25zaXZlIG1lbnVzIEdlbmVzaXMgRnJhbWV3b3JrIGNoaWxkIHRoZW1lcy5cbiAqXG4gKiBAYXV0aG9yIFN0dWRpb1ByZXNzXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vY29weWJsb2dnZXIvcmVzcG9uc2l2ZS1tZW51c1xuICogQHZlcnNpb24gMS4xLjNcbiAqIEBsaWNlbnNlIEdQTC0yLjArXG4gKi9cblxuKCBmdW5jdGlvbiAoIGRvY3VtZW50LCAkLCB1bmRlZmluZWQgKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdCQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm8tanMnKTtcblxuXHR2YXIgZ2VuZXNpc01lbnVQYXJhbXMgICAgICA9IHR5cGVvZiBnZW5lc2lzX3Jlc3BvbnNpdmVfbWVudSA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6IGdlbmVzaXNfcmVzcG9uc2l2ZV9tZW51LFxuXHRcdGdlbmVzaXNNZW51c1VuY2hlY2tlZCAgPSBnZW5lc2lzTWVudVBhcmFtcy5tZW51Q2xhc3Nlcyxcblx0XHRnZW5lc2lzTWVudXMgICAgICAgICAgID0ge30sXG5cdFx0bWVudXNUb0NvbWJpbmUgICAgICAgICA9IFtdO1xuXG5cdC8qKlxuXHQgKiBWYWxpZGF0ZSB0aGUgbWVudXMgcGFzc2VkIGJ5IHRoZSB0aGVtZSB3aXRoIHdoYXQncyBiZWluZyBsb2FkZWQgb24gdGhlIHBhZ2UsXG5cdCAqIGFuZCBwYXNzIHRoZSBuZXcgYW5kIGFjY3VyYXRlIGluZm9ybWF0aW9uIHRvIG91ciBuZXcgZGF0YS5cblx0ICogQHBhcmFtIHtnZW5lc2lzTWVudXNVbmNoZWNrZWR9IFJhdyBkYXRhIGZyb20gdGhlIGxvY2FsaXplZCBzY3JpcHQgaW4gdGhlIHRoZW1lLlxuXHQgKiBAcmV0dXJuIHthcnJheX0gZ2VuZXNpc01lbnVzIGFycmF5IGdldHMgcG9wdWxhdGVkIHdpdGggdXBkYXRlZCBkYXRhLlxuXHQgKiBAcmV0dXJuIHthcnJheX0gbWVudXNUb0NvbWJpbmUgYXJyYXkgZ2V0cyBwb3B1bGF0ZWQgd2l0aCByZWxldmFudCBkYXRhLlxuXHQgKi9cblx0JC5lYWNoKCBnZW5lc2lzTWVudXNVbmNoZWNrZWQsIGZ1bmN0aW9uKCBncm91cCApIHtcblxuXHRcdC8vIE1pcnJvciBvdXIgZ3JvdXAgb2JqZWN0IHRvIHBvcHVsYXRlLlxuXHRcdGdlbmVzaXNNZW51c1tncm91cF0gPSBbXTtcblxuXHRcdC8vIExvb3AgdGhyb3VnaCBlYWNoIGluc3RhbmNlIG9mIHRoZSBzcGVjaWZpZWQgbWVudSBvbiB0aGUgcGFnZS5cblx0XHQkLmVhY2goIHRoaXMsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXG5cdFx0XHR2YXIgbWVudVN0cmluZyA9IHZhbHVlLFxuXHRcdFx0XHQkbWVudSAgICAgID0gJCh2YWx1ZSk7XG5cblx0XHRcdC8vIElmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgaW5zdGFuY2UsIGFwcGVuZCB0aGUgaW5kZXggYW5kIHVwZGF0ZSBhcnJheS5cblx0XHRcdGlmICggJG1lbnUubGVuZ3RoID4gMSApIHtcblxuXHRcdFx0XHQkLmVhY2goICRtZW51LCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblxuXHRcdFx0XHRcdHZhciBuZXdTdHJpbmcgPSBtZW51U3RyaW5nICsgJy0nICsga2V5O1xuXG5cdFx0XHRcdFx0JCh0aGlzKS5hZGRDbGFzcyggbmV3U3RyaW5nLnJlcGxhY2UoJy4nLCcnKSApO1xuXG5cdFx0XHRcdFx0Z2VuZXNpc01lbnVzW2dyb3VwXS5wdXNoKCBuZXdTdHJpbmcgKTtcblxuXHRcdFx0XHRcdGlmICggJ2NvbWJpbmUnID09PSBncm91cCApIHtcblx0XHRcdFx0XHRcdG1lbnVzVG9Db21iaW5lLnB1c2goIG5ld1N0cmluZyApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fSBlbHNlIGlmICggJG1lbnUubGVuZ3RoID09IDEgKSB7XG5cblx0XHRcdFx0Z2VuZXNpc01lbnVzW2dyb3VwXS5wdXNoKCBtZW51U3RyaW5nICk7XG5cblx0XHRcdFx0aWYgKCAnY29tYmluZScgPT09IGdyb3VwICkge1xuXHRcdFx0XHRcdG1lbnVzVG9Db21iaW5lLnB1c2goIG1lbnVTdHJpbmcgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHR9KTtcblxuXHQvLyBNYWtlIHN1cmUgdGhlcmUgaXMgc29tZXRoaW5nIHRvIHVzZSBmb3IgdGhlICdvdGhlcnMnIGFycmF5LlxuXHRpZiAoIHR5cGVvZiBnZW5lc2lzTWVudXMub3RoZXJzID09ICd1bmRlZmluZWQnICkge1xuXHRcdGdlbmVzaXNNZW51cy5vdGhlcnMgPSBbXTtcblx0fVxuXG5cdC8vIElmIHRoZXJlJ3Mgb25seSBvbmUgbWVudSBvbiB0aGUgcGFnZSBmb3IgY29tYmluaW5nLCBwdXNoIGl0IHRvIHRoZSAnb3RoZXJzJyBhcnJheSBhbmQgbnVsbGlmeSBvdXIgJ2NvbWJpbmUnIHZhcmlhYmxlLlxuXHRpZiAoIG1lbnVzVG9Db21iaW5lLmxlbmd0aCA9PSAxICkge1xuXHRcdGdlbmVzaXNNZW51cy5vdGhlcnMucHVzaCggbWVudXNUb0NvbWJpbmVbMF0gKTtcblx0XHRnZW5lc2lzTWVudXMuY29tYmluZSA9IG51bGw7XG5cdFx0bWVudXNUb0NvbWJpbmUgPSBudWxsO1xuXHR9XG5cblx0dmFyIGdlbmVzaXNNZW51ICAgICAgICAgPSB7fSxcblx0XHRtYWluTWVudUJ1dHRvbkNsYXNzID0gJ21lbnUtdG9nZ2xlJyxcblx0XHRzdWJNZW51QnV0dG9uQ2xhc3MgID0gJ3N1Yi1tZW51LXRvZ2dsZScsXG5cdFx0cmVzcG9uc2l2ZU1lbnVDbGFzcyA9ICdnZW5lc2lzLXJlc3BvbnNpdmUtbWVudSc7XG5cblx0Ly8gSW5pdGlhbGl6ZS5cblx0Z2VuZXNpc01lbnUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gRXhpdCBlYXJseSBpZiB0aGVyZSBhcmUgbm8gbWVudXMgdG8gZG8gYW55dGhpbmcuXG5cdFx0aWYgKCAkKCBfZ2V0QWxsTWVudXNBcnJheSgpICkubGVuZ3RoID09IDAgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIG1lbnVJY29uQ2xhc3MgICAgID0gdHlwZW9mIGdlbmVzaXNNZW51UGFyYW1zLm1lbnVJY29uQ2xhc3MgIT09ICd1bmRlZmluZWQnID8gZ2VuZXNpc01lbnVQYXJhbXMubWVudUljb25DbGFzcyA6ICdkYXNoaWNvbnMtYmVmb3JlIGRhc2hpY29ucy1tZW51Jyxcblx0XHRcdHN1Yk1lbnVJY29uQ2xhc3MgID0gdHlwZW9mIGdlbmVzaXNNZW51UGFyYW1zLnN1Yk1lbnVJY29uQ2xhc3MgIT09ICd1bmRlZmluZWQnID8gZ2VuZXNpc01lbnVQYXJhbXMuc3ViTWVudUljb25DbGFzcyA6ICdkYXNoaWNvbnMtYmVmb3JlIGRhc2hpY29ucy1hcnJvdy1kb3duLWFsdDInLFxuXHRcdFx0dG9nZ2xlQnV0dG9ucyAgICAgPSB7XG5cdFx0XHRcdG1lbnUgOiAkKCAnPGJ1dHRvbiAvPicsIHtcblx0XHRcdFx0XHQnY2xhc3MnIDogbWFpbk1lbnVCdXR0b25DbGFzcyxcblx0XHRcdFx0XHQnYXJpYS1leHBhbmRlZCcgOiBmYWxzZSxcblx0XHRcdFx0XHQnYXJpYS1wcmVzc2VkJyA6IGZhbHNlLFxuXHRcdFx0XHRcdCdyb2xlJ1x0XHRcdDogJ2J1dHRvbicsXG5cdFx0XHRcdFx0fSApXG5cdFx0XHRcdFx0LmFwcGVuZCggJCggJzxzcGFuIC8+Jywge1xuXHRcdFx0XHRcdFx0J2NsYXNzJyA6ICdzY3JlZW4tcmVhZGVyLXRleHQnLFxuXHRcdFx0XHRcdFx0J3RleHQnIDogZ2VuZXNpc01lbnVQYXJhbXMubWFpbk1lbnVcblx0XHRcdFx0XHR9ICkgKSxcblx0XHRcdFx0c3VibWVudSA6ICQoICc8YnV0dG9uIC8+Jywge1xuXHRcdFx0XHRcdCdjbGFzcycgOiBzdWJNZW51QnV0dG9uQ2xhc3MsXG5cdFx0XHRcdFx0J2FyaWEtZXhwYW5kZWQnIDogZmFsc2UsXG5cdFx0XHRcdFx0J2FyaWEtcHJlc3NlZCcgIDogZmFsc2UsXG5cdFx0XHRcdFx0J3RleHQnXHRcdFx0OiAnJ1xuXHRcdFx0XHRcdH0gKVxuXHRcdFx0XHRcdC5hcHBlbmQoICQoICc8c3BhbiAvPicsIHtcblx0XHRcdFx0XHRcdCdjbGFzcycgOiAnc2NyZWVuLXJlYWRlci10ZXh0Jyxcblx0XHRcdFx0XHRcdCd0ZXh0JyA6IGdlbmVzaXNNZW51UGFyYW1zLnN1Yk1lbnVcblx0XHRcdFx0XHR9ICkgKVxuXHRcdFx0fTtcblxuXHRcdC8vIEFkZCB0aGUgcmVzcG9uc2l2ZSBtZW51IGNsYXNzIHRvIHRoZSBhY3RpdmUgbWVudXMuXG5cdFx0X2FkZFJlc3BvbnNpdmVNZW51Q2xhc3MoKTtcblxuXHRcdC8vIEFkZCB0aGUgbWFpbiBuYXYgYnV0dG9uIHRvIHRoZSBwcmltYXJ5IG1lbnUsIG9yIGV4aXQgdGhlIHBsdWdpbi5cblx0XHRfYWRkTWVudUJ1dHRvbnMoIHRvZ2dsZUJ1dHRvbnMgKTtcblxuXHRcdC8vIFNldHVwIGFkZGl0aW9uYWwgY2xhc3Nlcy5cblx0XHQkKCAnLicgKyBtYWluTWVudUJ1dHRvbkNsYXNzICkuYWRkQ2xhc3MoIG1lbnVJY29uQ2xhc3MgKTtcblx0XHQkKCAnLicgKyBzdWJNZW51QnV0dG9uQ2xhc3MgKS5hZGRDbGFzcyggc3ViTWVudUljb25DbGFzcyApO1xuXHRcdCQoICcuJyArIG1haW5NZW51QnV0dG9uQ2xhc3MgKS5vbiggJ2NsaWNrLmdlbmVzaXNNZW51LW1haW5idXR0b24nLCBfbWFpbm1lbnVUb2dnbGUgKS5lYWNoKCBfYWRkQ2xhc3NJRCApO1xuXHRcdCQoICcuJyArIHN1Yk1lbnVCdXR0b25DbGFzcyApLm9uKCAnY2xpY2suZ2VuZXNpc01lbnUtc3ViYnV0dG9uJywgX3N1Ym1lbnVUb2dnbGUgKTtcblx0XHQkKCB3aW5kb3cgKS5vbiggJ3Jlc2l6ZS5nZW5lc2lzTWVudScsIF9kb1Jlc2l6ZSApLnRyaWdnZXJIYW5kbGVyKCAncmVzaXplLmdlbmVzaXNNZW51JyApO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBBZGQgbWVudSB0b2dnbGUgYnV0dG9uIHRvIGFwcHJvcHJpYXRlIG1lbnVzLlxuXHQgKiBAcGFyYW0ge3RvZ2dsZUJ1dHRvbnN9IE9iamVjdCBvZiBtZW51IGJ1dHRvbnMgdG8gdXNlIGZvciB0b2dnbGVzLlxuXHQgKi9cblx0ZnVuY3Rpb24gX2FkZE1lbnVCdXR0b25zKCB0b2dnbGVCdXR0b25zICkge1xuXG5cdFx0Ly8gQXBwbHkgc3ViIG1lbnUgdG9nZ2xlIHRvIGVhY2ggc3ViLW1lbnUgZm91bmQgaW4gdGhlIG1lbnVMaXN0LlxuXHRcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGdlbmVzaXNNZW51cyApICkuZmluZCggJy5zdWItbWVudScgKS5iZWZvcmUoIHRvZ2dsZUJ1dHRvbnMuc3VibWVudSApO1xuXG5cblx0XHRpZiAoIG1lbnVzVG9Db21iaW5lICE9PSBudWxsICkge1xuXG5cdFx0XHR2YXIgbWVudXNUb1RvZ2dsZSA9IGdlbmVzaXNNZW51cy5vdGhlcnMuY29uY2F0KCBtZW51c1RvQ29tYmluZVswXSApO1xuXG5cdFx0IFx0Ly8gT25seSBhZGQgbWVudSBidXR0b24gdGhlIHByaW1hcnkgbWVudSBhbmQgbmF2cyBOT1QgaW4gdGhlIGNvbWJpbmUgdmFyaWFibGUuXG5cdFx0IFx0JCggX2dldE1lbnVTZWxlY3RvclN0cmluZyggbWVudXNUb1RvZ2dsZSApICkuYmVmb3JlKCB0b2dnbGVCdXR0b25zLm1lbnUgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIEFwcGx5IHRoZSBtYWluIG1lbnUgdG9nZ2xlIHRvIGFsbCBtZW51cyBpbiB0aGUgbGlzdC5cblx0XHRcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGdlbmVzaXNNZW51cy5vdGhlcnMgKSApLmJlZm9yZSggdG9nZ2xlQnV0dG9ucy5tZW51ICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgdGhlIHJlc3BvbnNpdmUgbWVudSBjbGFzcy5cblx0ICovXG5cdGZ1bmN0aW9uIF9hZGRSZXNwb25zaXZlTWVudUNsYXNzKCkge1xuXHRcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGdlbmVzaXNNZW51cyApICkuYWRkQ2xhc3MoIHJlc3BvbnNpdmVNZW51Q2xhc3MgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFeGVjdXRlIG91ciByZXNwb25zaXZlIG1lbnUgZnVuY3Rpb25zIG9uIHdpbmRvdyByZXNpemluZy5cblx0ICovXG5cdGZ1bmN0aW9uIF9kb1Jlc2l6ZSgpIHtcblx0XHR2YXIgYnV0dG9ucyAgID0gJCggJ2J1dHRvbltpZF49XCJnZW5lc2lzLW1vYmlsZS1cIl0nICkuYXR0ciggJ2lkJyApO1xuXHRcdGlmICggdHlwZW9mIGJ1dHRvbnMgPT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRfbWF5YmVDbG9zZSggYnV0dG9ucyApO1xuXHRcdF9zdXBlcmZpc2hUb2dnbGUoIGJ1dHRvbnMgKTtcblx0XHRfY2hhbmdlU2tpcExpbmsoIGJ1dHRvbnMgKTtcblx0XHRfY29tYmluZU1lbnVzKCBidXR0b25zICk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkIHRoZSBuYXYtIGNsYXNzIG9mIHRoZSByZWxhdGVkIG5hdmlnYXRpb24gbWVudSBhc1xuXHQgKiBhbiBJRCB0byBhc3NvY2lhdGVkIGJ1dHRvbiAoaGVscHMgdGFyZ2V0IHNwZWNpZmljIGJ1dHRvbnMgb3V0c2lkZSBvZiBjb250ZXh0KS5cblx0ICovXG5cdGZ1bmN0aW9uIF9hZGRDbGFzc0lEKCkge1xuXHRcdHZhciAkdGhpcyA9ICQoIHRoaXMgKSxcblx0XHRcdG5hdiAgID0gJHRoaXMubmV4dCggJ25hdicgKSxcblx0XHRcdGlkICAgID0gJ2NsYXNzJztcblxuXHRcdCR0aGlzLmF0dHIoICdpZCcsICdnZW5lc2lzLW1vYmlsZS0nICsgJCggbmF2ICkuYXR0ciggaWQgKS5tYXRjaCggL25hdi1cXHcqXFxiLyApICk7XG5cdH1cblxuXHQvKipcblx0ICogQ29tYmluZSBvdXIgbWVudXMgaWYgdGhlIG1vYmlsZSBtZW51IGlzIHZpc2libGUuXG5cdCAqIEBwYXJhbXMgYnV0dG9uc1xuXHQgKi9cblx0ZnVuY3Rpb24gX2NvbWJpbmVNZW51cyggYnV0dG9ucyApe1xuXG5cdFx0Ly8gRXhpdCBlYXJseSBpZiB0aGVyZSBhcmUgbm8gbWVudXMgdG8gY29tYmluZS5cblx0XHRpZiAoIG1lbnVzVG9Db21iaW5lID09IG51bGwgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gU3BsaXQgdXAgdGhlIG1lbnVzIHRvIGNvbWJpbmUgYmFzZWQgb24gb3JkZXIgb2YgYXBwZWFyYW5jZSBpbiB0aGUgYXJyYXkuXG5cdFx0dmFyIHByaW1hcnlNZW51ICAgPSBtZW51c1RvQ29tYmluZVswXSxcblx0XHRcdGNvbWJpbmVkTWVudXMgPSAkKCBtZW51c1RvQ29tYmluZSApLmZpbHRlciggZnVuY3Rpb24oaW5kZXgpIHsgaWYgKCBpbmRleCA+IDAgKSB7IHJldHVybiBpbmRleDsgfSB9KTtcblxuXHRcdC8vIElmIHRoZSByZXNwb25zaXZlIG1lbnUgaXMgYWN0aXZlLCBhcHBlbmQgaXRlbXMgaW4gJ2NvbWJpbmVkTWVudXMnIG9iamVjdCB0byB0aGUgJ3ByaW1hcnlNZW51JyBvYmplY3QuXG5cdFx0aWYgKCAnbm9uZScgIT09IF9nZXREaXNwbGF5VmFsdWUoIGJ1dHRvbnMgKSApIHtcblxuXHRcdFx0JC5lYWNoKCBjb21iaW5lZE1lbnVzLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHRcdFx0JCh2YWx1ZSkuZmluZCggJy5tZW51ID4gbGknICkuYWRkQ2xhc3MoICdtb3ZlZC1pdGVtLScgKyB2YWx1ZS5yZXBsYWNlKCAnLicsJycgKSApLmFwcGVuZFRvKCBwcmltYXJ5TWVudSArICcgdWwuZ2VuZXNpcy1uYXYtbWVudScgKTtcblx0XHRcdH0pO1xuXHRcdFx0JCggX2dldE1lbnVTZWxlY3RvclN0cmluZyggY29tYmluZWRNZW51cyApICkuaGlkZSgpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0JCggX2dldE1lbnVTZWxlY3RvclN0cmluZyggY29tYmluZWRNZW51cyApICkuc2hvdygpO1xuXHRcdFx0JC5lYWNoKCBjb21iaW5lZE1lbnVzLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHRcdFx0JCggJy5tb3ZlZC1pdGVtLScgKyB2YWx1ZS5yZXBsYWNlKCAnLicsJycgKSApLmFwcGVuZFRvKCB2YWx1ZSArICcgdWwuZ2VuZXNpcy1uYXYtbWVudScgKS5yZW1vdmVDbGFzcyggJ21vdmVkLWl0ZW0tJyArIHZhbHVlLnJlcGxhY2UoICcuJywnJyApICk7XG5cdFx0XHR9KTtcblxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIEFjdGlvbiB0byBoYXBwZW4gd2hlbiB0aGUgbWFpbiBtZW51IGJ1dHRvbiBpcyBjbGlja2VkLlxuXHQgKi9cblx0ZnVuY3Rpb24gX21haW5tZW51VG9nZ2xlKCkge1xuXHRcdHZhciAkdGhpcyA9ICQoIHRoaXMgKTtcblx0XHRfdG9nZ2xlQXJpYSggJHRoaXMsICdhcmlhLXByZXNzZWQnICk7XG5cdFx0X3RvZ2dsZUFyaWEoICR0aGlzLCAnYXJpYS1leHBhbmRlZCcgKTtcblx0XHQkdGhpcy50b2dnbGVDbGFzcyggJ2FjdGl2YXRlZCcgKTtcblx0XHQkdGhpcy5uZXh0KCAnbmF2JyApLnNsaWRlVG9nZ2xlKCAnZmFzdCcgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBY3Rpb24gZm9yIHN1Ym1lbnUgdG9nZ2xlcy5cblx0ICovXG5cdGZ1bmN0aW9uIF9zdWJtZW51VG9nZ2xlKCkge1xuXG5cdFx0dmFyICR0aGlzICA9ICQoIHRoaXMgKSxcblx0XHRcdG90aGVycyA9ICR0aGlzLmNsb3Nlc3QoICcubWVudS1pdGVtJyApLnNpYmxpbmdzKCk7XG5cdFx0X3RvZ2dsZUFyaWEoICR0aGlzLCAnYXJpYS1wcmVzc2VkJyApO1xuXHRcdF90b2dnbGVBcmlhKCAkdGhpcywgJ2FyaWEtZXhwYW5kZWQnICk7XG5cdFx0JHRoaXMudG9nZ2xlQ2xhc3MoICdhY3RpdmF0ZWQnICk7XG5cdFx0JHRoaXMubmV4dCggJy5zdWItbWVudScgKS5zbGlkZVRvZ2dsZSggJ2Zhc3QnICk7XG5cblx0XHRvdGhlcnMuZmluZCggJy4nICsgc3ViTWVudUJ1dHRvbkNsYXNzICkucmVtb3ZlQ2xhc3MoICdhY3RpdmF0ZWQnICkuYXR0ciggJ2FyaWEtcHJlc3NlZCcsICdmYWxzZScgKTtcblx0XHRvdGhlcnMuZmluZCggJy5zdWItbWVudScgKS5zbGlkZVVwKCAnZmFzdCcgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEFjdGl2YXRlL2RlYWN0aXZhdGUgc3VwZXJmaXNoLlxuXHQgKiBAcGFyYW1zIGJ1dHRvbnNcblx0ICovXG5cdGZ1bmN0aW9uIF9zdXBlcmZpc2hUb2dnbGUoIGJ1dHRvbnMgKSB7XG5cdFx0dmFyIF9zdXBlcmZpc2ggPSAkKCAnLicgKyByZXNwb25zaXZlTWVudUNsYXNzICsgJyAuanMtc3VwZXJmaXNoJyApLFxuXHRcdFx0JGFyZ3MgICAgICA9ICdkZXN0cm95Jztcblx0XHRpZiAoIHR5cGVvZiBfc3VwZXJmaXNoLnN1cGVyZmlzaCAhPT0gJ2Z1bmN0aW9uJyApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKCAnbm9uZScgPT09IF9nZXREaXNwbGF5VmFsdWUoIGJ1dHRvbnMgKSApIHtcblx0XHRcdCRhcmdzID0ge1xuXHRcdFx0XHQnZGVsYXknOiAwLFxuXHRcdFx0XHQnYW5pbWF0aW9uJzogeydvcGFjaXR5JzogJ3Nob3cnfSxcblx0XHRcdFx0J3NwZWVkJzogMzAwLFxuXHRcdFx0XHQnZGlzYWJsZUhJJzogdHJ1ZVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0X3N1cGVyZmlzaC5zdXBlcmZpc2goICRhcmdzICk7XG5cdH1cblxuXHQvKipcblx0ICogTW9kaWZ5IHNraXAgbGluayB0byBtYXRjaCBtb2JpbGUgYnV0dG9ucy5cblx0ICogQHBhcmFtIGJ1dHRvbnNcblx0ICovXG5cdGZ1bmN0aW9uIF9jaGFuZ2VTa2lwTGluayggYnV0dG9ucyApIHtcblxuXHRcdC8vIFN0YXJ0IHdpdGggYW4gZW1wdHkgYXJyYXkuXG5cdFx0dmFyIG1lbnVUb2dnbGVMaXN0ID0gX2dldEFsbE1lbnVzQXJyYXkoKTtcblxuXHRcdC8vIEV4aXQgb3V0IGlmIHRoZXJlIGFyZSBubyBtZW51IGl0ZW1zIHRvIHVwZGF0ZS5cblx0XHRpZiAoICEgJCggbWVudVRvZ2dsZUxpc3QgKS5sZW5ndGggPiAwICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdCQuZWFjaCggbWVudVRvZ2dsZUxpc3QsIGZ1bmN0aW9uICgga2V5LCB2YWx1ZSApIHtcblxuXHRcdFx0dmFyIG5ld1ZhbHVlICA9IHZhbHVlLnJlcGxhY2UoICcuJywgJycgKSxcblx0XHRcdFx0c3RhcnRMaW5rID0gJ2dlbmVzaXMtJyArIG5ld1ZhbHVlLFxuXHRcdFx0XHRlbmRMaW5rICAgPSAnZ2VuZXNpcy1tb2JpbGUtJyArIG5ld1ZhbHVlO1xuXG5cdFx0XHRpZiAoICdub25lJyA9PSBfZ2V0RGlzcGxheVZhbHVlKCBidXR0b25zICkgKSB7XG5cdFx0XHRcdHN0YXJ0TGluayA9ICdnZW5lc2lzLW1vYmlsZS0nICsgbmV3VmFsdWU7XG5cdFx0XHRcdGVuZExpbmsgICA9ICdnZW5lc2lzLScgKyBuZXdWYWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyICRpdGVtID0gJCggJy5nZW5lc2lzLXNraXAtbGluayBhW2hyZWY9XCIjJyArIHN0YXJ0TGluayArICdcIl0nICk7XG5cblx0XHRcdGlmICggbWVudXNUb0NvbWJpbmUgIT09IG51bGwgJiYgdmFsdWUgIT09IG1lbnVzVG9Db21iaW5lWzBdICkge1xuXHRcdFx0XHQkaXRlbS50b2dnbGVDbGFzcyggJ3NraXAtbGluay1oaWRkZW4nICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggJGl0ZW0ubGVuZ3RoID4gMCApIHtcblx0XHRcdFx0dmFyIGxpbmsgID0gJGl0ZW0uYXR0ciggJ2hyZWYnICk7XG5cdFx0XHRcdFx0bGluayAgPSBsaW5rLnJlcGxhY2UoIHN0YXJ0TGluaywgZW5kTGluayApO1xuXG5cdFx0XHRcdCRpdGVtLmF0dHIoICdocmVmJywgbGluayApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDbG9zZSBhbGwgdGhlIG1lbnUgdG9nZ2xlcyBpZiBidXR0b25zIGFyZSBoaWRkZW4uXG5cdCAqIEBwYXJhbSBidXR0b25zXG5cdCAqL1xuXHRmdW5jdGlvbiBfbWF5YmVDbG9zZSggYnV0dG9ucyApIHtcblx0XHRpZiAoICdub25lJyAhPT0gX2dldERpc3BsYXlWYWx1ZSggYnV0dG9ucyApICkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0JCggJy4nICsgbWFpbk1lbnVCdXR0b25DbGFzcyArICcsIC4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLnN1Yi1tZW51LXRvZ2dsZScgKVxuXHRcdFx0LnJlbW92ZUNsYXNzKCAnYWN0aXZhdGVkJyApXG5cdFx0XHQuYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSApXG5cdFx0XHQuYXR0ciggJ2FyaWEtcHJlc3NlZCcsIGZhbHNlICk7XG5cblx0XHQkKCAnLicgKyByZXNwb25zaXZlTWVudUNsYXNzICsgJywgLicgKyByZXNwb25zaXZlTWVudUNsYXNzICsgJyAuc3ViLW1lbnUnIClcblx0XHRcdC5hdHRyKCAnc3R5bGUnLCAnJyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdlbmVyaWMgZnVuY3Rpb24gdG8gZ2V0IHRoZSBkaXNwbGF5IHZhbHVlIG9mIGFuIGVsZW1lbnQuXG5cdCAqIEBwYXJhbSAge2lkfSAkaWQgSUQgdG8gY2hlY2tcblx0ICogQHJldHVybiB7c3RyaW5nfSAgICAgQ1NTIHZhbHVlIG9mIGRpc3BsYXkgcHJvcGVydHlcblx0ICovXG5cdGZ1bmN0aW9uIF9nZXREaXNwbGF5VmFsdWUoICRpZCApIHtcblx0XHR2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAkaWQgKSxcblx0XHRcdHN0eWxlICAgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSggZWxlbWVudCApO1xuXHRcdHJldHVybiBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCAnZGlzcGxheScgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUb2dnbGUgYXJpYSBhdHRyaWJ1dGVzLlxuXHQgKiBAcGFyYW0gIHtidXR0b259ICR0aGlzICAgICBwYXNzZWQgdGhyb3VnaFxuXHQgKiBAcGFyYW0gIHthcmlhLXh4fSBhdHRyaWJ1dGUgYXJpYSBhdHRyaWJ1dGUgdG8gdG9nZ2xlXG5cdCAqIEByZXR1cm4ge2Jvb2x9ICAgICAgICAgICBmcm9tIF9hcmlhUmV0dXJuXG5cdCAqL1xuXHRmdW5jdGlvbiBfdG9nZ2xlQXJpYSggJHRoaXMsIGF0dHJpYnV0ZSApIHtcblx0XHQkdGhpcy5hdHRyKCBhdHRyaWJ1dGUsIGZ1bmN0aW9uKCBpbmRleCwgdmFsdWUgKSB7XG5cdFx0XHRyZXR1cm4gJ2ZhbHNlJyA9PT0gdmFsdWU7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIGZ1bmN0aW9uIHRvIHJldHVybiBhIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgb2YgbWVudSBzZWxlY3RvcnMuXG5cdCAqIEBwYXJhbSB7aXRlbUFycmF5fSBBcnJheSBvZiBtZW51IGl0ZW1zIHRvIGxvb3AgdGhyb3VnaC5cblx0ICogQHBhcmFtIHtpZ25vcmVTZWNvbmRhcnl9IGJvb2xlYW4gb2Ygd2hldGhlciB0byBpZ25vcmUgdGhlICdzZWNvbmRhcnknIG1lbnUgaXRlbS5cblx0ICogQHJldHVybiB7c3RyaW5nfSBDb21tYS1zZXBhcmF0ZWQgc3RyaW5nLlxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldE1lbnVTZWxlY3RvclN0cmluZyggaXRlbUFycmF5ICkge1xuXG5cdFx0dmFyIGl0ZW1TdHJpbmcgPSAkLm1hcCggaXRlbUFycmF5LCBmdW5jdGlvbiggdmFsdWUsIGtleSApIHtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBpdGVtU3RyaW5nLmpvaW4oICcsJyApO1xuXG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIGZ1bmN0aW9uIHRvIHJldHVybiBhIGdyb3VwIGFycmF5IG9mIGFsbCB0aGUgbWVudXMgaW5cblx0ICogYm90aCB0aGUgJ290aGVycycgYW5kICdjb21iaW5lJyBhcnJheXMuXG5cdCAqIEByZXR1cm4ge2FycmF5fSBBcnJheSBvZiBhbGwgbWVudSBpdGVtcyBhcyBjbGFzcyBzZWxlY3RvcnMuXG5cdCAqL1xuXHRmdW5jdGlvbiBfZ2V0QWxsTWVudXNBcnJheSgpIHtcblxuXHRcdC8vIFN0YXJ0IHdpdGggYW4gZW1wdHkgYXJyYXkuXG5cdFx0dmFyIG1lbnVMaXN0ID0gW107XG5cblx0XHQvLyBJZiB0aGVyZSBhcmUgbWVudXMgaW4gdGhlICdtZW51c1RvQ29tYmluZScgYXJyYXksIGFkZCB0aGVtIHRvICdtZW51TGlzdCcuXG5cdFx0aWYgKCBtZW51c1RvQ29tYmluZSAhPT0gbnVsbCApIHtcblxuXHRcdFx0JC5lYWNoKCBtZW51c1RvQ29tYmluZSwgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRcdG1lbnVMaXN0LnB1c2goIHZhbHVlLnZhbHVlT2YoKSApO1xuXHRcdFx0fSk7XG5cblx0XHR9XG5cblx0XHQvLyBBZGQgbWVudXMgaW4gdGhlICdvdGhlcnMnIGFycmF5IHRvICdtZW51TGlzdCcuXG5cdFx0JC5lYWNoKCBnZW5lc2lzTWVudXMub3RoZXJzLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHRcdG1lbnVMaXN0LnB1c2goIHZhbHVlLnZhbHVlT2YoKSApO1xuXHRcdH0pO1xuXG5cdFx0aWYgKCBtZW51TGlzdC5sZW5ndGggPiAwICkge1xuXHRcdFx0cmV0dXJuIG1lbnVMaXN0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0fVxuXG5cdCQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcblxuXHRcdGlmICggX2dldEFsbE1lbnVzQXJyYXkoKSAhPT0gbnVsbCApIHtcblxuXHRcdFx0Z2VuZXNpc01lbnUuaW5pdCgpO1xuXG5cdFx0fVxuXG5cdH0pO1xuXG5cbn0pKCBkb2N1bWVudCwgalF1ZXJ5ICk7XG4iLCIvKipcbiAqIGhvdmVySW50ZW50IGlzIHNpbWlsYXIgdG8galF1ZXJ5J3MgYnVpbHQtaW4gXCJob3ZlclwiIG1ldGhvZCBleGNlcHQgdGhhdFxuICogaW5zdGVhZCBvZiBmaXJpbmcgdGhlIGhhbmRsZXJJbiBmdW5jdGlvbiBpbW1lZGlhdGVseSwgaG92ZXJJbnRlbnQgY2hlY2tzXG4gKiB0byBzZWUgaWYgdGhlIHVzZXIncyBtb3VzZSBoYXMgc2xvd2VkIGRvd24gKGJlbmVhdGggdGhlIHNlbnNpdGl2aXR5XG4gKiB0aHJlc2hvbGQpIGJlZm9yZSBmaXJpbmcgdGhlIGV2ZW50LiBUaGUgaGFuZGxlck91dCBmdW5jdGlvbiBpcyBvbmx5XG4gKiBjYWxsZWQgYWZ0ZXIgYSBtYXRjaGluZyBoYW5kbGVySW4uXG4gKlxuICogaG92ZXJJbnRlbnQgcjcgLy8gMjAxMy4wMy4xMSAvLyBqUXVlcnkgMS45LjErXG4gKiBodHRwOi8vY2hlcm5lLm5ldC9icmlhbi9yZXNvdXJjZXMvanF1ZXJ5LmhvdmVySW50ZW50Lmh0bWxcbiAqXG4gKiBZb3UgbWF5IHVzZSBob3ZlckludGVudCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIE1JVCBsaWNlbnNlLiBCYXNpY2FsbHkgdGhhdFxuICogbWVhbnMgeW91IGFyZSBmcmVlIHRvIHVzZSBob3ZlckludGVudCBhcyBsb25nIGFzIHRoaXMgaGVhZGVyIGlzIGxlZnQgaW50YWN0LlxuICogQ29weXJpZ2h0IDIwMDcsIDIwMTMgQnJpYW4gQ2hlcm5lXG4gKlxuICogLy8gYmFzaWMgdXNhZ2UgLi4uIGp1c3QgbGlrZSAuaG92ZXIoKVxuICogLmhvdmVySW50ZW50KCBoYW5kbGVySW4sIGhhbmRsZXJPdXQgKVxuICogLmhvdmVySW50ZW50KCBoYW5kbGVySW5PdXQgKVxuICpcbiAqIC8vIGJhc2ljIHVzYWdlIC4uLiB3aXRoIGV2ZW50IGRlbGVnYXRpb24hXG4gKiAuaG92ZXJJbnRlbnQoIGhhbmRsZXJJbiwgaGFuZGxlck91dCwgc2VsZWN0b3IgKVxuICogLmhvdmVySW50ZW50KCBoYW5kbGVySW5PdXQsIHNlbGVjdG9yIClcbiAqXG4gKiAvLyB1c2luZyBhIGJhc2ljIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gKiAuaG92ZXJJbnRlbnQoIGNvbmZpZyApXG4gKlxuICogQHBhcmFtICBoYW5kbGVySW4gICBmdW5jdGlvbiBPUiBjb25maWd1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtICBoYW5kbGVyT3V0ICBmdW5jdGlvbiBPUiBzZWxlY3RvciBmb3IgZGVsZWdhdGlvbiBPUiB1bmRlZmluZWRcbiAqIEBwYXJhbSAgc2VsZWN0b3IgICAgc2VsZWN0b3IgT1IgdW5kZWZpbmVkXG4gKiBAYXV0aG9yIEJyaWFuIENoZXJuZSA8YnJpYW4oYXQpY2hlcm5lKGRvdCluZXQ+XG4gKiovXG4oZnVuY3Rpb24oJCkge1xuICAgICQuZm4uaG92ZXJJbnRlbnQgPSBmdW5jdGlvbihoYW5kbGVySW4saGFuZGxlck91dCxzZWxlY3Rvcikge1xuXG4gICAgICAgIC8vIGRlZmF1bHQgY29uZmlndXJhdGlvbiB2YWx1ZXNcbiAgICAgICAgdmFyIGNmZyA9IHtcbiAgICAgICAgICAgIGludGVydmFsOiAxMDAsXG4gICAgICAgICAgICBzZW5zaXRpdml0eTogNyxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDBcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIHR5cGVvZiBoYW5kbGVySW4gPT09IFwib2JqZWN0XCIgKSB7XG4gICAgICAgICAgICBjZmcgPSAkLmV4dGVuZChjZmcsIGhhbmRsZXJJbiApO1xuICAgICAgICB9IGVsc2UgaWYgKCQuaXNGdW5jdGlvbihoYW5kbGVyT3V0KSkge1xuICAgICAgICAgICAgY2ZnID0gJC5leHRlbmQoY2ZnLCB7IG92ZXI6IGhhbmRsZXJJbiwgb3V0OiBoYW5kbGVyT3V0LCBzZWxlY3Rvcjogc2VsZWN0b3IgfSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2ZnID0gJC5leHRlbmQoY2ZnLCB7IG92ZXI6IGhhbmRsZXJJbiwgb3V0OiBoYW5kbGVySW4sIHNlbGVjdG9yOiBoYW5kbGVyT3V0IH0gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluc3RhbnRpYXRlIHZhcmlhYmxlc1xuICAgICAgICAvLyBjWCwgY1kgPSBjdXJyZW50IFggYW5kIFkgcG9zaXRpb24gb2YgbW91c2UsIHVwZGF0ZWQgYnkgbW91c2Vtb3ZlIGV2ZW50XG4gICAgICAgIC8vIHBYLCBwWSA9IHByZXZpb3VzIFggYW5kIFkgcG9zaXRpb24gb2YgbW91c2UsIHNldCBieSBtb3VzZW92ZXIgYW5kIHBvbGxpbmcgaW50ZXJ2YWxcbiAgICAgICAgdmFyIGNYLCBjWSwgcFgsIHBZO1xuXG4gICAgICAgIC8vIEEgcHJpdmF0ZSBmdW5jdGlvbiBmb3IgZ2V0dGluZyBtb3VzZSBwb3NpdGlvblxuICAgICAgICB2YXIgdHJhY2sgPSBmdW5jdGlvbihldikge1xuICAgICAgICAgICAgY1ggPSBldi5wYWdlWDtcbiAgICAgICAgICAgIGNZID0gZXYucGFnZVk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQSBwcml2YXRlIGZ1bmN0aW9uIGZvciBjb21wYXJpbmcgY3VycmVudCBhbmQgcHJldmlvdXMgbW91c2UgcG9zaXRpb25cbiAgICAgICAgdmFyIGNvbXBhcmUgPSBmdW5jdGlvbihldixvYikge1xuICAgICAgICAgICAgb2IuaG92ZXJJbnRlbnRfdCA9IGNsZWFyVGltZW91dChvYi5ob3ZlckludGVudF90KTtcbiAgICAgICAgICAgIC8vIGNvbXBhcmUgbW91c2UgcG9zaXRpb25zIHRvIHNlZSBpZiB0aGV5J3ZlIGNyb3NzZWQgdGhlIHRocmVzaG9sZFxuICAgICAgICAgICAgaWYgKCAoIE1hdGguYWJzKHBYLWNYKSArIE1hdGguYWJzKHBZLWNZKSApIDwgY2ZnLnNlbnNpdGl2aXR5ICkge1xuICAgICAgICAgICAgICAgICQob2IpLm9mZihcIm1vdXNlbW92ZS5ob3ZlckludGVudFwiLHRyYWNrKTtcbiAgICAgICAgICAgICAgICAvLyBzZXQgaG92ZXJJbnRlbnQgc3RhdGUgdG8gdHJ1ZSAoc28gbW91c2VPdXQgY2FuIGJlIGNhbGxlZClcbiAgICAgICAgICAgICAgICBvYi5ob3ZlckludGVudF9zID0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2ZnLm92ZXIuYXBwbHkob2IsW2V2XSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHNldCBwcmV2aW91cyBjb29yZGluYXRlcyBmb3IgbmV4dCB0aW1lXG4gICAgICAgICAgICAgICAgcFggPSBjWDsgcFkgPSBjWTtcbiAgICAgICAgICAgICAgICAvLyB1c2Ugc2VsZi1jYWxsaW5nIHRpbWVvdXQsIGd1YXJhbnRlZXMgaW50ZXJ2YWxzIGFyZSBzcGFjZWQgb3V0IHByb3Blcmx5IChhdm9pZHMgSmF2YVNjcmlwdCB0aW1lciBidWdzKVxuICAgICAgICAgICAgICAgIG9iLmhvdmVySW50ZW50X3QgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpe2NvbXBhcmUoZXYsIG9iKTt9ICwgY2ZnLmludGVydmFsICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQSBwcml2YXRlIGZ1bmN0aW9uIGZvciBkZWxheWluZyB0aGUgbW91c2VPdXQgZnVuY3Rpb25cbiAgICAgICAgdmFyIGRlbGF5ID0gZnVuY3Rpb24oZXYsb2IpIHtcbiAgICAgICAgICAgIG9iLmhvdmVySW50ZW50X3QgPSBjbGVhclRpbWVvdXQob2IuaG92ZXJJbnRlbnRfdCk7XG4gICAgICAgICAgICBvYi5ob3ZlckludGVudF9zID0gMDtcbiAgICAgICAgICAgIHJldHVybiBjZmcub3V0LmFwcGx5KG9iLFtldl0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEEgcHJpdmF0ZSBmdW5jdGlvbiBmb3IgaGFuZGxpbmcgbW91c2UgJ2hvdmVyaW5nJ1xuICAgICAgICB2YXIgaGFuZGxlSG92ZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAvLyBjb3B5IG9iamVjdHMgdG8gYmUgcGFzc2VkIGludG8gdCAocmVxdWlyZWQgZm9yIGV2ZW50IG9iamVjdCB0byBiZSBwYXNzZWQgaW4gSUUpXG4gICAgICAgICAgICB2YXIgZXYgPSBqUXVlcnkuZXh0ZW5kKHt9LGUpO1xuICAgICAgICAgICAgdmFyIG9iID0gdGhpcztcblxuICAgICAgICAgICAgLy8gY2FuY2VsIGhvdmVySW50ZW50IHRpbWVyIGlmIGl0IGV4aXN0c1xuICAgICAgICAgICAgaWYgKG9iLmhvdmVySW50ZW50X3QpIHsgb2IuaG92ZXJJbnRlbnRfdCA9IGNsZWFyVGltZW91dChvYi5ob3ZlckludGVudF90KTsgfVxuXG4gICAgICAgICAgICAvLyBpZiBlLnR5cGUgPT0gXCJtb3VzZWVudGVyXCJcbiAgICAgICAgICAgIGlmIChlLnR5cGUgPT0gXCJtb3VzZWVudGVyXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBzZXQgXCJwcmV2aW91c1wiIFggYW5kIFkgcG9zaXRpb24gYmFzZWQgb24gaW5pdGlhbCBlbnRyeSBwb2ludFxuICAgICAgICAgICAgICAgIHBYID0gZXYucGFnZVg7IHBZID0gZXYucGFnZVk7XG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIFwiY3VycmVudFwiIFggYW5kIFkgcG9zaXRpb24gYmFzZWQgb24gbW91c2Vtb3ZlXG4gICAgICAgICAgICAgICAgJChvYikub24oXCJtb3VzZW1vdmUuaG92ZXJJbnRlbnRcIix0cmFjayk7XG4gICAgICAgICAgICAgICAgLy8gc3RhcnQgcG9sbGluZyBpbnRlcnZhbCAoc2VsZi1jYWxsaW5nIHRpbWVvdXQpIHRvIGNvbXBhcmUgbW91c2UgY29vcmRpbmF0ZXMgb3ZlciB0aW1lXG4gICAgICAgICAgICAgICAgaWYgKG9iLmhvdmVySW50ZW50X3MgIT0gMSkgeyBvYi5ob3ZlckludGVudF90ID0gc2V0VGltZW91dCggZnVuY3Rpb24oKXtjb21wYXJlKGV2LG9iKTt9ICwgY2ZnLmludGVydmFsICk7fVxuXG4gICAgICAgICAgICAgICAgLy8gZWxzZSBlLnR5cGUgPT0gXCJtb3VzZWxlYXZlXCJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gdW5iaW5kIGV4cGVuc2l2ZSBtb3VzZW1vdmUgZXZlbnRcbiAgICAgICAgICAgICAgICAkKG9iKS5vZmYoXCJtb3VzZW1vdmUuaG92ZXJJbnRlbnRcIix0cmFjayk7XG4gICAgICAgICAgICAgICAgLy8gaWYgaG92ZXJJbnRlbnQgc3RhdGUgaXMgdHJ1ZSwgdGhlbiBjYWxsIHRoZSBtb3VzZU91dCBmdW5jdGlvbiBhZnRlciB0aGUgc3BlY2lmaWVkIGRlbGF5XG4gICAgICAgICAgICAgICAgaWYgKG9iLmhvdmVySW50ZW50X3MgPT0gMSkgeyBvYi5ob3ZlckludGVudF90ID0gc2V0VGltZW91dCggZnVuY3Rpb24oKXtkZWxheShldixvYik7fSAsIGNmZy50aW1lb3V0ICk7fVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGxpc3RlbiBmb3IgbW91c2VlbnRlciBhbmQgbW91c2VsZWF2ZVxuICAgICAgICByZXR1cm4gdGhpcy5vbih7J21vdXNlZW50ZXIuaG92ZXJJbnRlbnQnOmhhbmRsZUhvdmVyLCdtb3VzZWxlYXZlLmhvdmVySW50ZW50JzpoYW5kbGVIb3Zlcn0sIGNmZy5zZWxlY3Rvcik7XG4gICAgfTtcbn0pKGpRdWVyeSk7IiwiLyohXG4gKiBpbWFnZXNMb2FkZWQgUEFDS0FHRUQgdjQuMS40XG4gKiBKYXZhU2NyaXB0IGlzIGFsbCBsaWtlIFwiWW91IGltYWdlcyBhcmUgZG9uZSB5ZXQgb3Igd2hhdD9cIlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEV2RW1pdHRlciB2MS4xLjBcbiAqIExpbCcgZXZlbnQgZW1pdHRlclxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4vKiBqc2hpbnQgdW51c2VkOiB0cnVlLCB1bmRlZjogdHJ1ZSwgc3RyaWN0OiB0cnVlICovXG5cbiggZnVuY3Rpb24oIGdsb2JhbCwgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qIGdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHdpbmRvdyAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRCAtIFJlcXVpcmVKU1xuICAgIGRlZmluZSggJ2V2LWVtaXR0ZXIvZXYtZW1pdHRlcicsZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTIC0gQnJvd3NlcmlmeSwgV2VicGFja1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIGdsb2JhbC5FdkVtaXR0ZXIgPSBmYWN0b3J5KCk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uKCkge1xuXG5cblxuZnVuY3Rpb24gRXZFbWl0dGVyKCkge31cblxudmFyIHByb3RvID0gRXZFbWl0dGVyLnByb3RvdHlwZTtcblxucHJvdG8ub24gPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgaWYgKCAhZXZlbnROYW1lIHx8ICFsaXN0ZW5lciApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gc2V0IGV2ZW50cyBoYXNoXG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIC8vIHNldCBsaXN0ZW5lcnMgYXJyYXlcbiAgdmFyIGxpc3RlbmVycyA9IGV2ZW50c1sgZXZlbnROYW1lIF0gPSBldmVudHNbIGV2ZW50TmFtZSBdIHx8IFtdO1xuICAvLyBvbmx5IGFkZCBvbmNlXG4gIGlmICggbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICkgPT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnB1c2goIGxpc3RlbmVyICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLm9uY2UgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgaWYgKCAhZXZlbnROYW1lIHx8ICFsaXN0ZW5lciApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gYWRkIGV2ZW50XG4gIHRoaXMub24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgLy8gc2V0IG9uY2UgZmxhZ1xuICAvLyBzZXQgb25jZUV2ZW50cyBoYXNoXG4gIHZhciBvbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgfHwge307XG4gIC8vIHNldCBvbmNlTGlzdGVuZXJzIG9iamVjdFxuICB2YXIgb25jZUxpc3RlbmVycyA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gfHwge307XG4gIC8vIHNldCBmbGFnXG4gIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF0gPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub2ZmID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzWyBldmVudE5hbWUgXTtcbiAgaWYgKCAhbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKTtcbiAgaWYgKCBpbmRleCAhPSAtMSApIHtcbiAgICBsaXN0ZW5lcnMuc3BsaWNlKCBpbmRleCwgMSApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5lbWl0RXZlbnQgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBhcmdzICkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gY29weSBvdmVyIHRvIGF2b2lkIGludGVyZmVyZW5jZSBpZiAub2ZmKCkgaW4gbGlzdGVuZXJcbiAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLnNsaWNlKDApO1xuICBhcmdzID0gYXJncyB8fCBbXTtcbiAgLy8gb25jZSBzdHVmZlxuICB2YXIgb25jZUxpc3RlbmVycyA9IHRoaXMuX29uY2VFdmVudHMgJiYgdGhpcy5fb25jZUV2ZW50c1sgZXZlbnROYW1lIF07XG5cbiAgZm9yICggdmFyIGk9MDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV1cbiAgICB2YXIgaXNPbmNlID0gb25jZUxpc3RlbmVycyAmJiBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIGlmICggaXNPbmNlICkge1xuICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyXG4gICAgICAvLyByZW1vdmUgYmVmb3JlIHRyaWdnZXIgdG8gcHJldmVudCByZWN1cnNpb25cbiAgICAgIHRoaXMub2ZmKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gICAgICAvLyB1bnNldCBvbmNlIGZsYWdcbiAgICAgIGRlbGV0ZSBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIH1cbiAgICAvLyB0cmlnZ2VyIGxpc3RlbmVyXG4gICAgbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uYWxsT2ZmID0gZnVuY3Rpb24oKSB7XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHM7XG4gIGRlbGV0ZSB0aGlzLl9vbmNlRXZlbnRzO1xufTtcblxucmV0dXJuIEV2RW1pdHRlcjtcblxufSkpO1xuXG4vKiFcbiAqIGltYWdlc0xvYWRlZCB2NC4xLjRcbiAqIEphdmFTY3JpcHQgaXMgYWxsIGxpa2UgXCJZb3UgaW1hZ2VzIGFyZSBkb25lIHlldCBvciB3aGF0P1wiXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHsgJ3VzZSBzdHJpY3QnO1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cblxuICAvKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlLCByZXF1aXJlOiBmYWxzZSAqL1xuXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZXYtZW1pdHRlci9ldi1lbWl0dGVyJ1xuICAgIF0sIGZ1bmN0aW9uKCBFdkVtaXR0ZXIgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2V2LWVtaXR0ZXInKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuaW1hZ2VzTG9hZGVkID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5FdkVtaXR0ZXJcbiAgICApO1xuICB9XG5cbn0pKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICBmYWN0b3J5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyICkge1xuXG5cblxudmFyICQgPSB3aW5kb3cualF1ZXJ5O1xudmFyIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBleHRlbmQgb2JqZWN0c1xuZnVuY3Rpb24gZXh0ZW5kKCBhLCBiICkge1xuICBmb3IgKCB2YXIgcHJvcCBpbiBiICkge1xuICAgIGFbIHByb3AgXSA9IGJbIHByb3AgXTtcbiAgfVxuICByZXR1cm4gYTtcbn1cblxudmFyIGFycmF5U2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbi8vIHR1cm4gZWxlbWVudCBvciBub2RlTGlzdCBpbnRvIGFuIGFycmF5XG5mdW5jdGlvbiBtYWtlQXJyYXkoIG9iaiApIHtcbiAgaWYgKCBBcnJheS5pc0FycmF5KCBvYmogKSApIHtcbiAgICAvLyB1c2Ugb2JqZWN0IGlmIGFscmVhZHkgYW4gYXJyYXlcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIGlzQXJyYXlMaWtlID0gdHlwZW9mIG9iaiA9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqLmxlbmd0aCA9PSAnbnVtYmVyJztcbiAgaWYgKCBpc0FycmF5TGlrZSApIHtcbiAgICAvLyBjb252ZXJ0IG5vZGVMaXN0IHRvIGFycmF5XG4gICAgcmV0dXJuIGFycmF5U2xpY2UuY2FsbCggb2JqICk7XG4gIH1cblxuICAvLyBhcnJheSBvZiBzaW5nbGUgaW5kZXhcbiAgcmV0dXJuIFsgb2JqIF07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGltYWdlc0xvYWRlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIEBwYXJhbSB7QXJyYXksIEVsZW1lbnQsIE5vZGVMaXN0LCBTdHJpbmd9IGVsZW1cbiAqIEBwYXJhbSB7T2JqZWN0IG9yIEZ1bmN0aW9ufSBvcHRpb25zIC0gaWYgZnVuY3Rpb24sIHVzZSBhcyBjYWxsYmFja1xuICogQHBhcmFtIHtGdW5jdGlvbn0gb25BbHdheXMgLSBjYWxsYmFjayBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBJbWFnZXNMb2FkZWQoIGVsZW0sIG9wdGlvbnMsIG9uQWx3YXlzICkge1xuICAvLyBjb2VyY2UgSW1hZ2VzTG9hZGVkKCkgd2l0aG91dCBuZXcsIHRvIGJlIG5ldyBJbWFnZXNMb2FkZWQoKVxuICBpZiAoICEoIHRoaXMgaW5zdGFuY2VvZiBJbWFnZXNMb2FkZWQgKSApIHtcbiAgICByZXR1cm4gbmV3IEltYWdlc0xvYWRlZCggZWxlbSwgb3B0aW9ucywgb25BbHdheXMgKTtcbiAgfVxuICAvLyB1c2UgZWxlbSBhcyBzZWxlY3RvciBzdHJpbmdcbiAgdmFyIHF1ZXJ5RWxlbSA9IGVsZW07XG4gIGlmICggdHlwZW9mIGVsZW0gPT0gJ3N0cmluZycgKSB7XG4gICAgcXVlcnlFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggZWxlbSApO1xuICB9XG4gIC8vIGJhaWwgaWYgYmFkIGVsZW1lbnRcbiAgaWYgKCAhcXVlcnlFbGVtICkge1xuICAgIGNvbnNvbGUuZXJyb3IoICdCYWQgZWxlbWVudCBmb3IgaW1hZ2VzTG9hZGVkICcgKyAoIHF1ZXJ5RWxlbSB8fCBlbGVtICkgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmVsZW1lbnRzID0gbWFrZUFycmF5KCBxdWVyeUVsZW0gKTtcbiAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zICk7XG4gIC8vIHNoaWZ0IGFyZ3VtZW50cyBpZiBubyBvcHRpb25zIHNldFxuICBpZiAoIHR5cGVvZiBvcHRpb25zID09ICdmdW5jdGlvbicgKSB7XG4gICAgb25BbHdheXMgPSBvcHRpb25zO1xuICB9IGVsc2Uge1xuICAgIGV4dGVuZCggdGhpcy5vcHRpb25zLCBvcHRpb25zICk7XG4gIH1cblxuICBpZiAoIG9uQWx3YXlzICkge1xuICAgIHRoaXMub24oICdhbHdheXMnLCBvbkFsd2F5cyApO1xuICB9XG5cbiAgdGhpcy5nZXRJbWFnZXMoKTtcblxuICBpZiAoICQgKSB7XG4gICAgLy8gYWRkIGpRdWVyeSBEZWZlcnJlZCBvYmplY3RcbiAgICB0aGlzLmpxRGVmZXJyZWQgPSBuZXcgJC5EZWZlcnJlZCgpO1xuICB9XG5cbiAgLy8gSEFDSyBjaGVjayBhc3luYyB0byBhbGxvdyB0aW1lIHRvIGJpbmQgbGlzdGVuZXJzXG4gIHNldFRpbWVvdXQoIHRoaXMuY2hlY2suYmluZCggdGhpcyApICk7XG59XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUub3B0aW9ucyA9IHt9O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmdldEltYWdlcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltYWdlcyA9IFtdO1xuXG4gIC8vIGZpbHRlciAmIGZpbmQgaXRlbXMgaWYgd2UgaGF2ZSBhbiBpdGVtIHNlbGVjdG9yXG4gIHRoaXMuZWxlbWVudHMuZm9yRWFjaCggdGhpcy5hZGRFbGVtZW50SW1hZ2VzLCB0aGlzICk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudFxuICovXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEVsZW1lbnRJbWFnZXMgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgLy8gZmlsdGVyIHNpYmxpbmdzXG4gIGlmICggZWxlbS5ub2RlTmFtZSA9PSAnSU1HJyApIHtcbiAgICB0aGlzLmFkZEltYWdlKCBlbGVtICk7XG4gIH1cbiAgLy8gZ2V0IGJhY2tncm91bmQgaW1hZ2Ugb24gZWxlbWVudFxuICBpZiAoIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kID09PSB0cnVlICkge1xuICAgIHRoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMoIGVsZW0gKTtcbiAgfVxuXG4gIC8vIGZpbmQgY2hpbGRyZW5cbiAgLy8gbm8gbm9uLWVsZW1lbnQgbm9kZXMsICMxNDNcbiAgdmFyIG5vZGVUeXBlID0gZWxlbS5ub2RlVHlwZTtcbiAgaWYgKCAhbm9kZVR5cGUgfHwgIWVsZW1lbnROb2RlVHlwZXNbIG5vZGVUeXBlIF0gKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBjaGlsZEltZ3MgPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpO1xuICAvLyBjb25jYXQgY2hpbGRFbGVtcyB0byBmaWx0ZXJGb3VuZCBhcnJheVxuICBmb3IgKCB2YXIgaT0wOyBpIDwgY2hpbGRJbWdzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBpbWcgPSBjaGlsZEltZ3NbaV07XG4gICAgdGhpcy5hZGRJbWFnZSggaW1nICk7XG4gIH1cblxuICAvLyBnZXQgY2hpbGQgYmFja2dyb3VuZCBpbWFnZXNcbiAgaWYgKCB0eXBlb2YgdGhpcy5vcHRpb25zLmJhY2tncm91bmQgPT0gJ3N0cmluZycgKSB7XG4gICAgdmFyIGNoaWxkcmVuID0gZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCApO1xuICAgIGZvciAoIGk9MDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICB0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKCBjaGlsZCApO1xuICAgIH1cbiAgfVxufTtcblxudmFyIGVsZW1lbnROb2RlVHlwZXMgPSB7XG4gIDE6IHRydWUsXG4gIDk6IHRydWUsXG4gIDExOiB0cnVlXG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoIGVsZW0gKTtcbiAgaWYgKCAhc3R5bGUgKSB7XG4gICAgLy8gRmlyZWZveCByZXR1cm5zIG51bGwgaWYgaW4gYSBoaWRkZW4gaWZyYW1lIGh0dHBzOi8vYnVnemlsLmxhLzU0ODM5N1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBnZXQgdXJsIGluc2lkZSB1cmwoXCIuLi5cIilcbiAgdmFyIHJlVVJMID0gL3VybFxcKChbJ1wiXSk/KC4qPylcXDFcXCkvZ2k7XG4gIHZhciBtYXRjaGVzID0gcmVVUkwuZXhlYyggc3R5bGUuYmFja2dyb3VuZEltYWdlICk7XG4gIHdoaWxlICggbWF0Y2hlcyAhPT0gbnVsbCApIHtcbiAgICB2YXIgdXJsID0gbWF0Y2hlcyAmJiBtYXRjaGVzWzJdO1xuICAgIGlmICggdXJsICkge1xuICAgICAgdGhpcy5hZGRCYWNrZ3JvdW5kKCB1cmwsIGVsZW0gKTtcbiAgICB9XG4gICAgbWF0Y2hlcyA9IHJlVVJMLmV4ZWMoIHN0eWxlLmJhY2tncm91bmRJbWFnZSApO1xuICB9XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7SW1hZ2V9IGltZ1xuICovXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEltYWdlID0gZnVuY3Rpb24oIGltZyApIHtcbiAgdmFyIGxvYWRpbmdJbWFnZSA9IG5ldyBMb2FkaW5nSW1hZ2UoIGltZyApO1xuICB0aGlzLmltYWdlcy5wdXNoKCBsb2FkaW5nSW1hZ2UgKTtcbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuYWRkQmFja2dyb3VuZCA9IGZ1bmN0aW9uKCB1cmwsIGVsZW0gKSB7XG4gIHZhciBiYWNrZ3JvdW5kID0gbmV3IEJhY2tncm91bmQoIHVybCwgZWxlbSApO1xuICB0aGlzLmltYWdlcy5wdXNoKCBiYWNrZ3JvdW5kICk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMucHJvZ3Jlc3NlZENvdW50ID0gMDtcbiAgdGhpcy5oYXNBbnlCcm9rZW4gPSBmYWxzZTtcbiAgLy8gY29tcGxldGUgaWYgbm8gaW1hZ2VzXG4gIGlmICggIXRoaXMuaW1hZ2VzLmxlbmd0aCApIHtcbiAgICB0aGlzLmNvbXBsZXRlKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gb25Qcm9ncmVzcyggaW1hZ2UsIGVsZW0sIG1lc3NhZ2UgKSB7XG4gICAgLy8gSEFDSyAtIENocm9tZSB0cmlnZ2VycyBldmVudCBiZWZvcmUgb2JqZWN0IHByb3BlcnRpZXMgaGF2ZSBjaGFuZ2VkLiAjODNcbiAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgIF90aGlzLnByb2dyZXNzKCBpbWFnZSwgZWxlbSwgbWVzc2FnZSApO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5pbWFnZXMuZm9yRWFjaCggZnVuY3Rpb24oIGxvYWRpbmdJbWFnZSApIHtcbiAgICBsb2FkaW5nSW1hZ2Uub25jZSggJ3Byb2dyZXNzJywgb25Qcm9ncmVzcyApO1xuICAgIGxvYWRpbmdJbWFnZS5jaGVjaygpO1xuICB9KTtcbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUucHJvZ3Jlc3MgPSBmdW5jdGlvbiggaW1hZ2UsIGVsZW0sIG1lc3NhZ2UgKSB7XG4gIHRoaXMucHJvZ3Jlc3NlZENvdW50Kys7XG4gIHRoaXMuaGFzQW55QnJva2VuID0gdGhpcy5oYXNBbnlCcm9rZW4gfHwgIWltYWdlLmlzTG9hZGVkO1xuICAvLyBwcm9ncmVzcyBldmVudFxuICB0aGlzLmVtaXRFdmVudCggJ3Byb2dyZXNzJywgWyB0aGlzLCBpbWFnZSwgZWxlbSBdICk7XG4gIGlmICggdGhpcy5qcURlZmVycmVkICYmIHRoaXMuanFEZWZlcnJlZC5ub3RpZnkgKSB7XG4gICAgdGhpcy5qcURlZmVycmVkLm5vdGlmeSggdGhpcywgaW1hZ2UgKTtcbiAgfVxuICAvLyBjaGVjayBpZiBjb21wbGV0ZWRcbiAgaWYgKCB0aGlzLnByb2dyZXNzZWRDb3VudCA9PSB0aGlzLmltYWdlcy5sZW5ndGggKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICB9XG5cbiAgaWYgKCB0aGlzLm9wdGlvbnMuZGVidWcgJiYgY29uc29sZSApIHtcbiAgICBjb25zb2xlLmxvZyggJ3Byb2dyZXNzOiAnICsgbWVzc2FnZSwgaW1hZ2UsIGVsZW0gKTtcbiAgfVxufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZXZlbnROYW1lID0gdGhpcy5oYXNBbnlCcm9rZW4gPyAnZmFpbCcgOiAnZG9uZSc7XG4gIHRoaXMuaXNDb21wbGV0ZSA9IHRydWU7XG4gIHRoaXMuZW1pdEV2ZW50KCBldmVudE5hbWUsIFsgdGhpcyBdICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAnYWx3YXlzJywgWyB0aGlzIF0gKTtcbiAgaWYgKCB0aGlzLmpxRGVmZXJyZWQgKSB7XG4gICAgdmFyIGpxTWV0aG9kID0gdGhpcy5oYXNBbnlCcm9rZW4gPyAncmVqZWN0JyA6ICdyZXNvbHZlJztcbiAgICB0aGlzLmpxRGVmZXJyZWRbIGpxTWV0aG9kIF0oIHRoaXMgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIExvYWRpbmdJbWFnZSggaW1nICkge1xuICB0aGlzLmltZyA9IGltZztcbn1cblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV2RW1pdHRlci5wcm90b3R5cGUgKTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICAvLyBJZiBjb21wbGV0ZSBpcyB0cnVlIGFuZCBicm93c2VyIHN1cHBvcnRzIG5hdHVyYWwgc2l6ZXMsXG4gIC8vIHRyeSB0byBjaGVjayBmb3IgaW1hZ2Ugc3RhdHVzIG1hbnVhbGx5LlxuICB2YXIgaXNDb21wbGV0ZSA9IHRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7XG4gIGlmICggaXNDb21wbGV0ZSApIHtcbiAgICAvLyByZXBvcnQgYmFzZWQgb24gbmF0dXJhbFdpZHRoXG4gICAgdGhpcy5jb25maXJtKCB0aGlzLmltZy5uYXR1cmFsV2lkdGggIT09IDAsICduYXR1cmFsV2lkdGgnICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgY2hlY2tzIGFib3ZlIG1hdGNoZWQsIHNpbXVsYXRlIGxvYWRpbmcgb24gZGV0YWNoZWQgZWxlbWVudC5cbiAgdGhpcy5wcm94eUltYWdlID0gbmV3IEltYWdlKCk7XG4gIHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5wcm94eUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgLy8gYmluZCB0byBpbWFnZSBhcyB3ZWxsIGZvciBGaXJlZm94LiAjMTkxXG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIHRoaXMucHJveHlJbWFnZS5zcmMgPSB0aGlzLmltZy5zcmM7XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmdldElzSW1hZ2VDb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBjaGVjayBmb3Igbm9uLXplcm8sIG5vbi11bmRlZmluZWQgbmF0dXJhbFdpZHRoXG4gIC8vIGZpeGVzIFNhZmFyaStJbmZpbml0ZVNjcm9sbCtNYXNvbnJ5IGJ1ZyBpbmZpbml0ZS1zY3JvbGwjNjcxXG4gIHJldHVybiB0aGlzLmltZy5jb21wbGV0ZSAmJiB0aGlzLmltZy5uYXR1cmFsV2lkdGg7XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmNvbmZpcm0gPSBmdW5jdGlvbiggaXNMb2FkZWQsIG1lc3NhZ2UgKSB7XG4gIHRoaXMuaXNMb2FkZWQgPSBpc0xvYWRlZDtcbiAgdGhpcy5lbWl0RXZlbnQoICdwcm9ncmVzcycsIFsgdGhpcywgdGhpcy5pbWcsIG1lc3NhZ2UgXSApO1xufTtcblxuLy8gLS0tLS0gZXZlbnRzIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXIgc3BlY2lmaWVkIGhhbmRsZXIgZm9yIGV2ZW50IHR5cGVcbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciBtZXRob2QgPSAnb24nICsgZXZlbnQudHlwZTtcbiAgaWYgKCB0aGlzWyBtZXRob2QgXSApIHtcbiAgICB0aGlzWyBtZXRob2QgXSggZXZlbnQgKTtcbiAgfVxufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb25maXJtKCB0cnVlLCAnb25sb2FkJyApO1xuICB0aGlzLnVuYmluZEV2ZW50cygpO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29uZmlybSggZmFsc2UsICdvbmVycm9yJyApO1xuICB0aGlzLnVuYmluZEV2ZW50cygpO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS51bmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQmFja2dyb3VuZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBCYWNrZ3JvdW5kKCB1cmwsIGVsZW1lbnQgKSB7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xufVxuXG4vLyBpbmhlcml0IExvYWRpbmdJbWFnZSBwcm90b3R5cGVcbkJhY2tncm91bmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTG9hZGluZ0ltYWdlLnByb3RvdHlwZSApO1xuXG5CYWNrZ3JvdW5kLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLmltZy5zcmMgPSB0aGlzLnVybDtcbiAgLy8gY2hlY2sgaWYgaW1hZ2UgaXMgYWxyZWFkeSBjb21wbGV0ZVxuICB2YXIgaXNDb21wbGV0ZSA9IHRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7XG4gIGlmICggaXNDb21wbGV0ZSApIHtcbiAgICB0aGlzLmNvbmZpcm0oIHRoaXMuaW1nLm5hdHVyYWxXaWR0aCAhPT0gMCwgJ25hdHVyYWxXaWR0aCcgKTtcbiAgICB0aGlzLnVuYmluZEV2ZW50cygpO1xuICB9XG59O1xuXG5CYWNrZ3JvdW5kLnByb3RvdHlwZS51bmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbn07XG5cbkJhY2tncm91bmQucHJvdG90eXBlLmNvbmZpcm0gPSBmdW5jdGlvbiggaXNMb2FkZWQsIG1lc3NhZ2UgKSB7XG4gIHRoaXMuaXNMb2FkZWQgPSBpc0xvYWRlZDtcbiAgdGhpcy5lbWl0RXZlbnQoICdwcm9ncmVzcycsIFsgdGhpcywgdGhpcy5lbGVtZW50LCBtZXNzYWdlIF0gKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGpRdWVyeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5JbWFnZXNMb2FkZWQubWFrZUpRdWVyeVBsdWdpbiA9IGZ1bmN0aW9uKCBqUXVlcnkgKSB7XG4gIGpRdWVyeSA9IGpRdWVyeSB8fCB3aW5kb3cualF1ZXJ5O1xuICBpZiAoICFqUXVlcnkgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNldCBsb2NhbCB2YXJpYWJsZVxuICAkID0galF1ZXJ5O1xuICAvLyAkKCkuaW1hZ2VzTG9hZGVkKClcbiAgJC5mbi5pbWFnZXNMb2FkZWQgPSBmdW5jdGlvbiggb3B0aW9ucywgY2FsbGJhY2sgKSB7XG4gICAgdmFyIGluc3RhbmNlID0gbmV3IEltYWdlc0xvYWRlZCggdGhpcywgb3B0aW9ucywgY2FsbGJhY2sgKTtcbiAgICByZXR1cm4gaW5zdGFuY2UuanFEZWZlcnJlZC5wcm9taXNlKCAkKHRoaXMpICk7XG4gIH07XG59O1xuLy8gdHJ5IG1ha2luZyBwbHVnaW5cbkltYWdlc0xvYWRlZC5tYWtlSlF1ZXJ5UGx1Z2luKCk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5yZXR1cm4gSW1hZ2VzTG9hZGVkO1xuXG59KTtcblxuIiwiKGZ1bmN0aW9uKGEpe2lmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXCJqcXVlcnlcIl0sYSk7XG59ZWxzZXthKGpRdWVyeSk7fX0oZnVuY3Rpb24oYSl7YS5mbi5hZGRCYWNrPWEuZm4uYWRkQmFja3x8YS5mbi5hbmRTZWxmO2EuZm4uZXh0ZW5kKHthY3R1YWw6ZnVuY3Rpb24oYixsKXtpZighdGhpc1tiXSl7dGhyb3cnJC5hY3R1YWwgPT4gVGhlIGpRdWVyeSBtZXRob2QgXCInK2IrJ1wiIHlvdSBjYWxsZWQgZG9lcyBub3QgZXhpc3QnO1xufXZhciBmPXthYnNvbHV0ZTpmYWxzZSxjbG9uZTpmYWxzZSxpbmNsdWRlTWFyZ2luOmZhbHNlLGRpc3BsYXk6XCJibG9ja1wifTt2YXIgaT1hLmV4dGVuZChmLGwpO3ZhciBlPXRoaXMuZXEoMCk7dmFyIGgsajtpZihpLmNsb25lPT09dHJ1ZSl7aD1mdW5jdGlvbigpe3ZhciBtPVwicG9zaXRpb246IGFic29sdXRlICFpbXBvcnRhbnQ7IHRvcDogLTEwMDAgIWltcG9ydGFudDsgXCI7XG5lPWUuY2xvbmUoKS5hdHRyKFwic3R5bGVcIixtKS5hcHBlbmRUbyhcImJvZHlcIik7fTtqPWZ1bmN0aW9uKCl7ZS5yZW1vdmUoKTt9O31lbHNle3ZhciBnPVtdO3ZhciBkPVwiXCI7dmFyIGM7aD1mdW5jdGlvbigpe2M9ZS5wYXJlbnRzKCkuYWRkQmFjaygpLmZpbHRlcihcIjpoaWRkZW5cIik7XG5kKz1cInZpc2liaWxpdHk6IGhpZGRlbiAhaW1wb3J0YW50OyBkaXNwbGF5OiBcIitpLmRpc3BsYXkrXCIgIWltcG9ydGFudDsgXCI7aWYoaS5hYnNvbHV0ZT09PXRydWUpe2QrPVwicG9zaXRpb246IGFic29sdXRlICFpbXBvcnRhbnQ7IFwiO31jLmVhY2goZnVuY3Rpb24oKXt2YXIgbT1hKHRoaXMpO1xudmFyIG49bS5hdHRyKFwic3R5bGVcIik7Zy5wdXNoKG4pO20uYXR0cihcInN0eWxlXCIsbj9uK1wiO1wiK2Q6ZCk7fSk7fTtqPWZ1bmN0aW9uKCl7Yy5lYWNoKGZ1bmN0aW9uKG0pe3ZhciBvPWEodGhpcyk7dmFyIG49Z1ttXTtpZihuPT09dW5kZWZpbmVkKXtvLnJlbW92ZUF0dHIoXCJzdHlsZVwiKTtcbn1lbHNle28uYXR0cihcInN0eWxlXCIsbik7fX0pO307fWgoKTt2YXIgaz0vKG91dGVyKS8udGVzdChiKT9lW2JdKGkuaW5jbHVkZU1hcmdpbik6ZVtiXSgpO2ooKTtyZXR1cm4gazt9fSk7fSkpOyIsIi8qKlxuKiBqcXVlcnktbWF0Y2gtaGVpZ2h0IG1hc3RlciBieSBAbGlhYnJ1XG4qIGh0dHA6Ly9icm0uaW8vanF1ZXJ5LW1hdGNoLWhlaWdodC9cbiogTGljZW5zZTogTUlUXG4qL1xuXG47KGZ1bmN0aW9uKGZhY3RvcnkpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1leHRyYS1zZW1pXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1EXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIC8vIENvbW1vbkpTXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gR2xvYmFsXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KShmdW5jdGlvbigkKSB7XG4gICAgLypcbiAgICAqICBpbnRlcm5hbFxuICAgICovXG5cbiAgICB2YXIgX3ByZXZpb3VzUmVzaXplV2lkdGggPSAtMSxcbiAgICAgICAgX3VwZGF0ZVRpbWVvdXQgPSAtMTtcblxuICAgIC8qXG4gICAgKiAgX3BhcnNlXG4gICAgKiAgdmFsdWUgcGFyc2UgdXRpbGl0eSBmdW5jdGlvblxuICAgICovXG5cbiAgICB2YXIgX3BhcnNlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgLy8gcGFyc2UgdmFsdWUgYW5kIGNvbnZlcnQgTmFOIHRvIDBcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpIHx8IDA7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgX3Jvd3NcbiAgICAqICB1dGlsaXR5IGZ1bmN0aW9uIHJldHVybnMgYXJyYXkgb2YgalF1ZXJ5IHNlbGVjdGlvbnMgcmVwcmVzZW50aW5nIGVhY2ggcm93XG4gICAgKiAgKGFzIGRpc3BsYXllZCBhZnRlciBmbG9hdCB3cmFwcGluZyBhcHBsaWVkIGJ5IGJyb3dzZXIpXG4gICAgKi9cblxuICAgIHZhciBfcm93cyA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgIHZhciB0b2xlcmFuY2UgPSAxLFxuICAgICAgICAgICAgJGVsZW1lbnRzID0gJChlbGVtZW50cyksXG4gICAgICAgICAgICBsYXN0VG9wID0gbnVsbCxcbiAgICAgICAgICAgIHJvd3MgPSBbXTtcblxuICAgICAgICAvLyBncm91cCBlbGVtZW50cyBieSB0aGVpciB0b3AgcG9zaXRpb25cbiAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgdG9wID0gJHRoYXQub2Zmc2V0KCkudG9wIC0gX3BhcnNlKCR0aGF0LmNzcygnbWFyZ2luLXRvcCcpKSxcbiAgICAgICAgICAgICAgICBsYXN0Um93ID0gcm93cy5sZW5ndGggPiAwID8gcm93c1tyb3dzLmxlbmd0aCAtIDFdIDogbnVsbDtcblxuICAgICAgICAgICAgaWYgKGxhc3RSb3cgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBpdGVtIG9uIHRoZSByb3csIHNvIGp1c3QgcHVzaCBpdFxuICAgICAgICAgICAgICAgIHJvd3MucHVzaCgkdGhhdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSByb3cgdG9wIGlzIHRoZSBzYW1lLCBhZGQgdG8gdGhlIHJvdyBncm91cFxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmZsb29yKE1hdGguYWJzKGxhc3RUb3AgLSB0b3ApKSA8PSB0b2xlcmFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcm93c1tyb3dzLmxlbmd0aCAtIDFdID0gbGFzdFJvdy5hZGQoJHRoYXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBzdGFydCBhIG5ldyByb3cgZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKCR0aGF0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIGxhc3Qgcm93IHRvcFxuICAgICAgICAgICAgbGFzdFRvcCA9IHRvcDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJvd3M7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgX3BhcnNlT3B0aW9uc1xuICAgICogIGhhbmRsZSBwbHVnaW4gb3B0aW9uc1xuICAgICovXG5cbiAgICB2YXIgX3BhcnNlT3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICBieVJvdzogdHJ1ZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnaGVpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldDogbnVsbCxcbiAgICAgICAgICAgIHJlbW92ZTogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5leHRlbmQob3B0cywgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgb3B0cy5ieVJvdyA9IG9wdGlvbnM7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucyA9PT0gJ3JlbW92ZScpIHtcbiAgICAgICAgICAgIG9wdHMucmVtb3ZlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgIH07XG5cbiAgICAvKlxuICAgICogIG1hdGNoSGVpZ2h0XG4gICAgKiAgcGx1Z2luIGRlZmluaXRpb25cbiAgICAqL1xuXG4gICAgdmFyIG1hdGNoSGVpZ2h0ID0gJC5mbi5tYXRjaEhlaWdodCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHMgPSBfcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIGhhbmRsZSByZW1vdmVcbiAgICAgICAgaWYgKG9wdHMucmVtb3ZlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSBmaXhlZCBoZWlnaHQgZnJvbSBhbGwgc2VsZWN0ZWQgZWxlbWVudHNcbiAgICAgICAgICAgIHRoaXMuY3NzKG9wdHMucHJvcGVydHksICcnKTtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIHNlbGVjdGVkIGVsZW1lbnRzIGZyb20gYWxsIGdyb3Vwc1xuICAgICAgICAgICAgJC5lYWNoKG1hdGNoSGVpZ2h0Ll9ncm91cHMsIGZ1bmN0aW9uKGtleSwgZ3JvdXApIHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cyA9IGdyb3VwLmVsZW1lbnRzLm5vdCh0aGF0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBjbGVhbnVwIGVtcHR5IGdyb3Vwc1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA8PSAxICYmICFvcHRzLnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIHRoaXMgZ3JvdXAgc28gd2UgY2FuIHJlLWFwcGx5IGxhdGVyIG9uIGxvYWQgYW5kIHJlc2l6ZSBldmVudHNcbiAgICAgICAgbWF0Y2hIZWlnaHQuX2dyb3Vwcy5wdXNoKHtcbiAgICAgICAgICAgIGVsZW1lbnRzOiB0aGlzLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0c1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBtYXRjaCBlYWNoIGVsZW1lbnQncyBoZWlnaHQgdG8gdGhlIHRhbGxlc3QgZWxlbWVudCBpbiB0aGUgc2VsZWN0aW9uXG4gICAgICAgIG1hdGNoSGVpZ2h0Ll9hcHBseSh0aGlzLCBvcHRzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLypcbiAgICAqICBwbHVnaW4gZ2xvYmFsIG9wdGlvbnNcbiAgICAqL1xuXG4gICAgbWF0Y2hIZWlnaHQudmVyc2lvbiA9ICdtYXN0ZXInO1xuICAgIG1hdGNoSGVpZ2h0Ll9ncm91cHMgPSBbXTtcbiAgICBtYXRjaEhlaWdodC5fdGhyb3R0bGUgPSA4MDtcbiAgICBtYXRjaEhlaWdodC5fbWFpbnRhaW5TY3JvbGwgPSBmYWxzZTtcbiAgICBtYXRjaEhlaWdodC5fYmVmb3JlVXBkYXRlID0gbnVsbDtcbiAgICBtYXRjaEhlaWdodC5fYWZ0ZXJVcGRhdGUgPSBudWxsO1xuICAgIG1hdGNoSGVpZ2h0Ll9yb3dzID0gX3Jvd3M7XG4gICAgbWF0Y2hIZWlnaHQuX3BhcnNlID0gX3BhcnNlO1xuICAgIG1hdGNoSGVpZ2h0Ll9wYXJzZU9wdGlvbnMgPSBfcGFyc2VPcHRpb25zO1xuXG4gICAgLypcbiAgICAqICBtYXRjaEhlaWdodC5fYXBwbHlcbiAgICAqICBhcHBseSBtYXRjaEhlaWdodCB0byBnaXZlbiBlbGVtZW50c1xuICAgICovXG5cbiAgICBtYXRjaEhlaWdodC5fYXBwbHkgPSBmdW5jdGlvbihlbGVtZW50cywgb3B0aW9ucykge1xuICAgICAgICB2YXIgb3B0cyA9IF9wYXJzZU9wdGlvbnMob3B0aW9ucyksXG4gICAgICAgICAgICAkZWxlbWVudHMgPSAkKGVsZW1lbnRzKSxcbiAgICAgICAgICAgIHJvd3MgPSBbJGVsZW1lbnRzXTtcblxuICAgICAgICAvLyB0YWtlIG5vdGUgb2Ygc2Nyb2xsIHBvc2l0aW9uXG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXG4gICAgICAgICAgICBodG1sSGVpZ2h0ID0gJCgnaHRtbCcpLm91dGVySGVpZ2h0KHRydWUpO1xuXG4gICAgICAgIC8vIGdldCBoaWRkZW4gcGFyZW50c1xuICAgICAgICB2YXIgJGhpZGRlblBhcmVudHMgPSAkZWxlbWVudHMucGFyZW50cygpLmZpbHRlcignOmhpZGRlbicpO1xuXG4gICAgICAgIC8vIGNhY2hlIHRoZSBvcmlnaW5hbCBpbmxpbmUgc3R5bGVcbiAgICAgICAgJGhpZGRlblBhcmVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyk7XG4gICAgICAgICAgICAkdGhhdC5kYXRhKCdzdHlsZS1jYWNoZScsICR0aGF0LmF0dHIoJ3N0eWxlJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyB0ZW1wb3JhcmlseSBtdXN0IGZvcmNlIGhpZGRlbiBwYXJlbnRzIHZpc2libGVcbiAgICAgICAgJGhpZGRlblBhcmVudHMuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cbiAgICAgICAgLy8gZ2V0IHJvd3MgaWYgdXNpbmcgYnlSb3csIG90aGVyd2lzZSBhc3N1bWUgb25lIHJvd1xuICAgICAgICBpZiAob3B0cy5ieVJvdyAmJiAhb3B0cy50YXJnZXQpIHtcblxuICAgICAgICAgICAgLy8gbXVzdCBmaXJzdCBmb3JjZSBhbiBhcmJpdHJhcnkgZXF1YWwgaGVpZ2h0IHNvIGZsb2F0aW5nIGVsZW1lbnRzIGJyZWFrIGV2ZW5seVxuICAgICAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGF0ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICR0aGF0LmNzcygnZGlzcGxheScpO1xuXG4gICAgICAgICAgICAgICAgLy8gdGVtcG9yYXJpbHkgZm9yY2UgYSB1c2FibGUgZGlzcGxheSB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5ICE9PSAnaW5saW5lLWJsb2NrJyAmJiBkaXNwbGF5ICE9PSAnZmxleCcgJiYgZGlzcGxheSAhPT0gJ2lubGluZS1mbGV4Jykge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBjYWNoZSB0aGUgb3JpZ2luYWwgaW5saW5lIHN0eWxlXG4gICAgICAgICAgICAgICAgJHRoYXQuZGF0YSgnc3R5bGUtY2FjaGUnLCAkdGhhdC5hdHRyKCdzdHlsZScpKTtcblxuICAgICAgICAgICAgICAgICR0aGF0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICdkaXNwbGF5JzogZGlzcGxheSxcbiAgICAgICAgICAgICAgICAgICAgJ3BhZGRpbmctdG9wJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1ib3R0b20nOiAnMCcsXG4gICAgICAgICAgICAgICAgICAgICdtYXJnaW4tdG9wJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAnbWFyZ2luLWJvdHRvbSc6ICcwJyxcbiAgICAgICAgICAgICAgICAgICAgJ2JvcmRlci10b3Atd2lkdGgnOiAnMCcsXG4gICAgICAgICAgICAgICAgICAgICdib3JkZXItYm90dG9tLXdpZHRoJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogJzEwMHB4JyxcbiAgICAgICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBnZXQgdGhlIGFycmF5IG9mIHJvd3MgKGJhc2VkIG9uIGVsZW1lbnQgdG9wIHBvc2l0aW9uKVxuICAgICAgICAgICAgcm93cyA9IF9yb3dzKCRlbGVtZW50cyk7XG5cbiAgICAgICAgICAgIC8vIHJldmVydCBvcmlnaW5hbCBpbmxpbmUgc3R5bGVzXG4gICAgICAgICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICR0aGF0LmF0dHIoJ3N0eWxlJywgJHRoYXQuZGF0YSgnc3R5bGUtY2FjaGUnKSB8fCAnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICQuZWFjaChyb3dzLCBmdW5jdGlvbihrZXksIHJvdykge1xuICAgICAgICAgICAgdmFyICRyb3cgPSAkKHJvdyksXG4gICAgICAgICAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gMDtcblxuICAgICAgICAgICAgaWYgKCFvcHRzLnRhcmdldCkge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgYXBwbHkgdG8gcm93cyB3aXRoIG9ubHkgb25lIGl0ZW1cbiAgICAgICAgICAgICAgICBpZiAob3B0cy5ieVJvdyAmJiAkcm93Lmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICRyb3cuY3NzKG9wdHMucHJvcGVydHksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGUgdGhlIHJvdyBhbmQgZmluZCB0aGUgbWF4IGhlaWdodFxuICAgICAgICAgICAgICAgICRyb3cuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGUgPSAkdGhhdC5hdHRyKCdzdHlsZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICR0aGF0LmNzcygnZGlzcGxheScpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRlbXBvcmFyaWx5IGZvcmNlIGEgdXNhYmxlIGRpc3BsYXkgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXkgIT09ICdpbmxpbmUtYmxvY2snICYmIGRpc3BsYXkgIT09ICdmbGV4JyAmJiBkaXNwbGF5ICE9PSAnaW5saW5lLWZsZXgnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB3ZSBnZXQgdGhlIGNvcnJlY3QgYWN0dWFsIGhlaWdodCAoYW5kIG5vdCBhIHByZXZpb3VzbHkgc2V0IGhlaWdodCB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNzcyA9IHsgJ2Rpc3BsYXknOiBkaXNwbGF5IH07XG4gICAgICAgICAgICAgICAgICAgIGNzc1tvcHRzLnByb3BlcnR5XSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAkdGhhdC5jc3MoY3NzKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIHRoZSBtYXggaGVpZ2h0IChpbmNsdWRpbmcgcGFkZGluZywgYnV0IG5vdCBtYXJnaW4pXG4gICAgICAgICAgICAgICAgICAgIGlmICgkdGhhdC5vdXRlckhlaWdodChmYWxzZSkgPiB0YXJnZXRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEhlaWdodCA9ICR0aGF0Lm91dGVySGVpZ2h0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldmVydCBzdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhhdC5hdHRyKCdzdHlsZScsIHN0eWxlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGF0LmNzcygnZGlzcGxheScsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0YXJnZXQgc2V0LCB1c2UgdGhlIGhlaWdodCBvZiB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICB0YXJnZXRIZWlnaHQgPSBvcHRzLnRhcmdldC5vdXRlckhlaWdodChmYWxzZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGl0ZXJhdGUgdGhlIHJvdyBhbmQgYXBwbHkgdGhlIGhlaWdodCB0byBhbGwgZWxlbWVudHNcbiAgICAgICAgICAgICRyb3cuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUGFkZGluZyA9IDA7XG5cbiAgICAgICAgICAgICAgICAvLyBkb24ndCBhcHBseSB0byBhIHRhcmdldFxuICAgICAgICAgICAgICAgIGlmIChvcHRzLnRhcmdldCAmJiAkdGhhdC5pcyhvcHRzLnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBwYWRkaW5nIGFuZCBib3JkZXIgY29ycmVjdGx5IChyZXF1aXJlZCB3aGVuIG5vdCB1c2luZyBib3JkZXItYm94KVxuICAgICAgICAgICAgICAgIGlmICgkdGhhdC5jc3MoJ2JveC1zaXppbmcnKSAhPT0gJ2JvcmRlci1ib3gnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUGFkZGluZyArPSBfcGFyc2UoJHRoYXQuY3NzKCdib3JkZXItdG9wLXdpZHRoJykpICsgX3BhcnNlKCR0aGF0LmNzcygnYm9yZGVyLWJvdHRvbS13aWR0aCcpKTtcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxQYWRkaW5nICs9IF9wYXJzZSgkdGhhdC5jc3MoJ3BhZGRpbmctdG9wJykpICsgX3BhcnNlKCR0aGF0LmNzcygncGFkZGluZy1ib3R0b20nKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBoZWlnaHQgKGFjY291bnRpbmcgZm9yIHBhZGRpbmcgYW5kIGJvcmRlcilcbiAgICAgICAgICAgICAgICAkdGhhdC5jc3Mob3B0cy5wcm9wZXJ0eSwgKHRhcmdldEhlaWdodCAtIHZlcnRpY2FsUGFkZGluZykgKyAncHgnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyByZXZlcnQgaGlkZGVuIHBhcmVudHNcbiAgICAgICAgJGhpZGRlblBhcmVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyk7XG4gICAgICAgICAgICAkdGhhdC5hdHRyKCdzdHlsZScsICR0aGF0LmRhdGEoJ3N0eWxlLWNhY2hlJykgfHwgbnVsbCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHJlc3RvcmUgc2Nyb2xsIHBvc2l0aW9uIGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKG1hdGNoSGVpZ2h0Ll9tYWludGFpblNjcm9sbCkge1xuICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbFRvcCgoc2Nyb2xsVG9wIC8gaHRtbEhlaWdodCkgKiAkKCdodG1sJykub3V0ZXJIZWlnaHQodHJ1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgbWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaVxuICAgICogIGFwcGxpZXMgbWF0Y2hIZWlnaHQgdG8gYWxsIGVsZW1lbnRzIHdpdGggYSBkYXRhLW1hdGNoLWhlaWdodCBhdHRyaWJ1dGVcbiAgICAqL1xuXG4gICAgbWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ3JvdXBzID0ge307XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgZ3JvdXBzIGJ5IHRoZWlyIGdyb3VwSWQgc2V0IGJ5IGVsZW1lbnRzIHVzaW5nIGRhdGEtbWF0Y2gtaGVpZ2h0XG4gICAgICAgICQoJ1tkYXRhLW1hdGNoLWhlaWdodF0sIFtkYXRhLW1oXScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGdyb3VwSWQgPSAkdGhpcy5hdHRyKCdkYXRhLW1oJykgfHwgJHRoaXMuYXR0cignZGF0YS1tYXRjaC1oZWlnaHQnKTtcblxuICAgICAgICAgICAgaWYgKGdyb3VwSWQgaW4gZ3JvdXBzKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBzW2dyb3VwSWRdID0gZ3JvdXBzW2dyb3VwSWRdLmFkZCgkdGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyb3Vwc1tncm91cElkXSA9ICR0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBhcHBseSBtYXRjaEhlaWdodCB0byBlYWNoIGdyb3VwXG4gICAgICAgICQuZWFjaChncm91cHMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5tYXRjaEhlaWdodCh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgbWF0Y2hIZWlnaHQuX3VwZGF0ZVxuICAgICogIHVwZGF0ZXMgbWF0Y2hIZWlnaHQgb24gYWxsIGN1cnJlbnQgZ3JvdXBzIHdpdGggdGhlaXIgY29ycmVjdCBvcHRpb25zXG4gICAgKi9cblxuICAgIHZhciBfdXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKG1hdGNoSGVpZ2h0Ll9iZWZvcmVVcGRhdGUpIHtcbiAgICAgICAgICAgIG1hdGNoSGVpZ2h0Ll9iZWZvcmVVcGRhdGUoZXZlbnQsIG1hdGNoSGVpZ2h0Ll9ncm91cHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgJC5lYWNoKG1hdGNoSGVpZ2h0Ll9ncm91cHMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbWF0Y2hIZWlnaHQuX2FwcGx5KHRoaXMuZWxlbWVudHMsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChtYXRjaEhlaWdodC5fYWZ0ZXJVcGRhdGUpIHtcbiAgICAgICAgICAgIG1hdGNoSGVpZ2h0Ll9hZnRlclVwZGF0ZShldmVudCwgbWF0Y2hIZWlnaHQuX2dyb3Vwcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbWF0Y2hIZWlnaHQuX3VwZGF0ZSA9IGZ1bmN0aW9uKHRocm90dGxlLCBldmVudCkge1xuICAgICAgICAvLyBwcmV2ZW50IHVwZGF0ZSBpZiBmaXJlZCBmcm9tIGEgcmVzaXplIGV2ZW50XG4gICAgICAgIC8vIHdoZXJlIHRoZSB2aWV3cG9ydCB3aWR0aCBoYXNuJ3QgYWN0dWFsbHkgY2hhbmdlZFxuICAgICAgICAvLyBmaXhlcyBhbiBldmVudCBsb29waW5nIGJ1ZyBpbiBJRThcbiAgICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdyZXNpemUnKSB7XG4gICAgICAgICAgICB2YXIgd2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3dXaWR0aCA9PT0gX3ByZXZpb3VzUmVzaXplV2lkdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfcHJldmlvdXNSZXNpemVXaWR0aCA9IHdpbmRvd1dpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhyb3R0bGUgdXBkYXRlc1xuICAgICAgICBpZiAoIXRocm90dGxlKSB7XG4gICAgICAgICAgICBfdXBkYXRlKGV2ZW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChfdXBkYXRlVGltZW91dCA9PT0gLTEpIHtcbiAgICAgICAgICAgIF91cGRhdGVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfdXBkYXRlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBfdXBkYXRlVGltZW91dCA9IC0xO1xuICAgICAgICAgICAgfSwgbWF0Y2hIZWlnaHQuX3Rocm90dGxlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICogIGJpbmQgZXZlbnRzXG4gICAgKi9cblxuICAgIC8vIGFwcGx5IG9uIERPTSByZWFkeSBldmVudFxuICAgICQobWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaSk7XG5cbiAgICAvLyB1c2Ugb24gb3IgYmluZCB3aGVyZSBzdXBwb3J0ZWRcbiAgICB2YXIgb24gPSAkLmZuLm9uID8gJ29uJyA6ICdiaW5kJztcblxuICAgIC8vIHVwZGF0ZSBoZWlnaHRzIG9uIGxvYWQgYW5kIHJlc2l6ZSBldmVudHNcbiAgICAkKHdpbmRvdylbb25dKCdsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbWF0Y2hIZWlnaHQuX3VwZGF0ZShmYWxzZSwgZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhyb3R0bGVkIHVwZGF0ZSBoZWlnaHRzIG9uIHJlc2l6ZSBldmVudHNcbiAgICAkKHdpbmRvdylbb25dKCdyZXNpemUgb3JpZW50YXRpb25jaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBtYXRjaEhlaWdodC5fdXBkYXRlKHRydWUsIGV2ZW50KTtcbiAgICB9KTtcblxufSk7XG4iLCIvKiFcbiAqIGpRdWVyeSBTbW9vdGggU2Nyb2xsIC0gdjIuMi4wIC0gMjAxNy0wNS0wNVxuICogaHR0cHM6Ly9naXRodWIuY29tL2tzd2VkYmVyZy9qcXVlcnktc21vb3RoLXNjcm9sbFxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU3dlZGJlcmdcbiAqIExpY2Vuc2VkIE1JVFxuICovXG5cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBmYWN0b3J5KGpRdWVyeSk7XG4gIH1cbn0oZnVuY3Rpb24oJCkge1xuXG4gIHZhciB2ZXJzaW9uID0gJzIuMi4wJztcbiAgdmFyIG9wdGlvbk92ZXJyaWRlcyA9IHt9O1xuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgZXhjbHVkZTogW10sXG4gICAgZXhjbHVkZVdpdGhpbjogW10sXG4gICAgb2Zmc2V0OiAwLFxuXG4gICAgLy8gb25lIG9mICd0b3AnIG9yICdsZWZ0J1xuICAgIGRpcmVjdGlvbjogJ3RvcCcsXG5cbiAgICAvLyBpZiBzZXQsIGJpbmQgY2xpY2sgZXZlbnRzIHRocm91Z2ggZGVsZWdhdGlvblxuICAgIC8vICBzdXBwb3J0ZWQgc2luY2UgalF1ZXJ5IDEuNC4yXG4gICAgZGVsZWdhdGVTZWxlY3RvcjogbnVsbCxcblxuICAgIC8vIGpRdWVyeSBzZXQgb2YgZWxlbWVudHMgeW91IHdpc2ggdG8gc2Nyb2xsIChmb3IgJC5zbW9vdGhTY3JvbGwpLlxuICAgIC8vICBpZiBudWxsIChkZWZhdWx0KSwgJCgnaHRtbCwgYm9keScpLmZpcnN0U2Nyb2xsYWJsZSgpIGlzIHVzZWQuXG4gICAgc2Nyb2xsRWxlbWVudDogbnVsbCxcblxuICAgIC8vIG9ubHkgdXNlIGlmIHlvdSB3YW50IHRvIG92ZXJyaWRlIGRlZmF1bHQgYmVoYXZpb3JcbiAgICBzY3JvbGxUYXJnZXQ6IG51bGwsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGZvY3VzIHRoZSB0YXJnZXQgZWxlbWVudCBhZnRlciBzY3JvbGxpbmcgdG8gaXRcbiAgICBhdXRvRm9jdXM6IGZhbHNlLFxuXG4gICAgLy8gZm4ob3B0cykgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGJlZm9yZSBzY3JvbGxpbmcgb2NjdXJzLlxuICAgIC8vIGB0aGlzYCBpcyB0aGUgZWxlbWVudChzKSBiZWluZyBzY3JvbGxlZFxuICAgIGJlZm9yZVNjcm9sbDogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8vIGZuKG9wdHMpIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZnRlciBzY3JvbGxpbmcgb2NjdXJzLlxuICAgIC8vIGB0aGlzYCBpcyB0aGUgdHJpZ2dlcmluZyBlbGVtZW50XG4gICAgYWZ0ZXJTY3JvbGw6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvLyBlYXNpbmcgbmFtZS4galF1ZXJ5IGNvbWVzIHdpdGggXCJzd2luZ1wiIGFuZCBcImxpbmVhci5cIiBGb3Igb3RoZXJzLCB5b3UnbGwgbmVlZCBhbiBlYXNpbmcgcGx1Z2luXG4gICAgLy8gZnJvbSBqUXVlcnkgVUkgb3IgZWxzZXdoZXJlXG4gICAgZWFzaW5nOiAnc3dpbmcnLFxuXG4gICAgLy8gc3BlZWQgY2FuIGJlIGEgbnVtYmVyIG9yICdhdXRvJ1xuICAgIC8vIGlmICdhdXRvJywgdGhlIHNwZWVkIHdpbGwgYmUgY2FsY3VsYXRlZCBiYXNlZCBvbiB0aGUgZm9ybXVsYTpcbiAgICAvLyAoY3VycmVudCBzY3JvbGwgcG9zaXRpb24gLSB0YXJnZXQgc2Nyb2xsIHBvc2l0aW9uKSAvIGF1dG9Db2VmZmljXG4gICAgc3BlZWQ6IDQwMCxcblxuICAgIC8vIGNvZWZmaWNpZW50IGZvciBcImF1dG9cIiBzcGVlZFxuICAgIGF1dG9Db2VmZmljaWVudDogMixcblxuICAgIC8vICQuZm4uc21vb3RoU2Nyb2xsIG9ubHk6IHdoZXRoZXIgdG8gcHJldmVudCB0aGUgZGVmYXVsdCBjbGljayBhY3Rpb25cbiAgICBwcmV2ZW50RGVmYXVsdDogdHJ1ZVxuICB9O1xuXG4gIHZhciBnZXRTY3JvbGxhYmxlID0gZnVuY3Rpb24ob3B0cykge1xuICAgIHZhciBzY3JvbGxhYmxlID0gW107XG4gICAgdmFyIHNjcm9sbGVkID0gZmFsc2U7XG4gICAgdmFyIGRpciA9IG9wdHMuZGlyICYmIG9wdHMuZGlyID09PSAnbGVmdCcgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJztcblxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbCA9ICQodGhpcyk7XG5cbiAgICAgIGlmICh0aGlzID09PSBkb2N1bWVudCB8fCB0aGlzID09PSB3aW5kb3cpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudCAmJiAodGhpcyA9PT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IHRoaXMgPT09IGRvY3VtZW50LmJvZHkpKSB7XG4gICAgICAgIHNjcm9sbGFibGUucHVzaChkb2N1bWVudC5zY3JvbGxpbmdFbGVtZW50KTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbFtkaXJdKCkgPiAwKSB7XG4gICAgICAgIHNjcm9sbGFibGUucHVzaCh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIHNjcm9sbChUb3B8TGVmdCkgPT09IDAsIG51ZGdlIHRoZSBlbGVtZW50IDFweCBhbmQgc2VlIGlmIGl0IG1vdmVzXG4gICAgICAgIGVsW2Rpcl0oMSk7XG4gICAgICAgIHNjcm9sbGVkID0gZWxbZGlyXSgpID4gMDtcblxuICAgICAgICBpZiAoc2Nyb2xsZWQpIHtcbiAgICAgICAgICBzY3JvbGxhYmxlLnB1c2godGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhlbiBwdXQgaXQgYmFjaywgb2YgY291cnNlXG4gICAgICAgIGVsW2Rpcl0oMCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIXNjcm9sbGFibGUubGVuZ3RoKSB7XG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIElmIG5vIHNjcm9sbGFibGUgZWxlbWVudHMgYW5kIDxodG1sPiBoYXMgc2Nyb2xsLWJlaGF2aW9yOnNtb290aCBiZWNhdXNlXG4gICAgICAgIC8vIFwiV2hlbiB0aGlzIHByb3BlcnR5IGlzIHNwZWNpZmllZCBvbiB0aGUgcm9vdCBlbGVtZW50LCBpdCBhcHBsaWVzIHRvIHRoZSB2aWV3cG9ydCBpbnN0ZWFkLlwiXG4gICAgICAgIC8vIGFuZCBcIlRoZSBzY3JvbGwtYmVoYXZpb3IgcHJvcGVydHkgb2YgdGhlIOKApiBib2R5IGVsZW1lbnQgaXMgKm5vdCogcHJvcGFnYXRlZCB0byB0aGUgdmlld3BvcnQuXCJcbiAgICAgICAgLy8g4oaSIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3NvbS12aWV3LyNwcm9wZGVmLXNjcm9sbC1iZWhhdmlvclxuICAgICAgICBpZiAodGhpcyA9PT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICQodGhpcykuY3NzKCdzY3JvbGxCZWhhdmlvcicpID09PSAnc21vb3RoJykge1xuICAgICAgICAgIHNjcm9sbGFibGUgPSBbdGhpc107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBzdGlsbCBubyBzY3JvbGxhYmxlIGVsZW1lbnRzLCBmYWxsIGJhY2sgdG8gPGJvZHk+LFxuICAgICAgICAvLyBpZiBpdCdzIGluIHRoZSBqUXVlcnkgY29sbGVjdGlvblxuICAgICAgICAvLyAoZG9pbmcgdGhpcyBiZWNhdXNlIFNhZmFyaSBzZXRzIHNjcm9sbFRvcCBhc3luYyxcbiAgICAgICAgLy8gc28gY2FuJ3Qgc2V0IGl0IHRvIDEgYW5kIGltbWVkaWF0ZWx5IGdldCB0aGUgdmFsdWUuKVxuICAgICAgICBpZiAoIXNjcm9sbGFibGUubGVuZ3RoICYmIHRoaXMubm9kZU5hbWUgPT09ICdCT0RZJykge1xuICAgICAgICAgIHNjcm9sbGFibGUgPSBbdGhpc107XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFVzZSB0aGUgZmlyc3Qgc2Nyb2xsYWJsZSBlbGVtZW50IGlmIHdlJ3JlIGNhbGxpbmcgZmlyc3RTY3JvbGxhYmxlKClcbiAgICBpZiAob3B0cy5lbCA9PT0gJ2ZpcnN0JyAmJiBzY3JvbGxhYmxlLmxlbmd0aCA+IDEpIHtcbiAgICAgIHNjcm9sbGFibGUgPSBbc2Nyb2xsYWJsZVswXV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNjcm9sbGFibGU7XG4gIH07XG5cbiAgdmFyIHJSZWxhdGl2ZSA9IC9eKFtcXC1cXCtdPSkoXFxkKykvO1xuXG4gICQuZm4uZXh0ZW5kKHtcbiAgICBzY3JvbGxhYmxlOiBmdW5jdGlvbihkaXIpIHtcbiAgICAgIHZhciBzY3JsID0gZ2V0U2Nyb2xsYWJsZS5jYWxsKHRoaXMsIHtkaXI6IGRpcn0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soc2NybCk7XG4gICAgfSxcbiAgICBmaXJzdFNjcm9sbGFibGU6IGZ1bmN0aW9uKGRpcikge1xuICAgICAgdmFyIHNjcmwgPSBnZXRTY3JvbGxhYmxlLmNhbGwodGhpcywge2VsOiAnZmlyc3QnLCBkaXI6IGRpcn0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soc2NybCk7XG4gICAgfSxcblxuICAgIHNtb290aFNjcm9sbDogZnVuY3Rpb24ob3B0aW9ucywgZXh0cmEpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICBpZiAob3B0aW9ucyA9PT0gJ29wdGlvbnMnKSB7XG4gICAgICAgIGlmICghZXh0cmEpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoJ3NzT3B0cycpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgIHZhciBvcHRzID0gJC5leHRlbmQoJHRoaXMuZGF0YSgnc3NPcHRzJykgfHwge30sIGV4dHJhKTtcblxuICAgICAgICAgICQodGhpcykuZGF0YSgnc3NPcHRzJywgb3B0cyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3B0cyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnNtb290aFNjcm9sbC5kZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAgIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZXNjYXBlU2VsZWN0b3IgPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyg6fFxcLnxcXC8pL2csICdcXFxcJDEnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbGluayA9IHRoaXM7XG4gICAgICAgIHZhciAkbGluayA9ICQodGhpcyk7XG4gICAgICAgIHZhciB0aGlzT3B0cyA9ICQuZXh0ZW5kKHt9LCBvcHRzLCAkbGluay5kYXRhKCdzc09wdHMnKSB8fCB7fSk7XG4gICAgICAgIHZhciBleGNsdWRlID0gb3B0cy5leGNsdWRlO1xuICAgICAgICB2YXIgZXhjbHVkZVdpdGhpbiA9IHRoaXNPcHRzLmV4Y2x1ZGVXaXRoaW47XG4gICAgICAgIHZhciBlbENvdW50ZXIgPSAwO1xuICAgICAgICB2YXIgZXdsQ291bnRlciA9IDA7XG4gICAgICAgIHZhciBpbmNsdWRlID0gdHJ1ZTtcbiAgICAgICAgdmFyIGNsaWNrT3B0cyA9IHt9O1xuICAgICAgICB2YXIgbG9jYXRpb25QYXRoID0gJC5zbW9vdGhTY3JvbGwuZmlsdGVyUGF0aChsb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgICAgIHZhciBsaW5rUGF0aCA9ICQuc21vb3RoU2Nyb2xsLmZpbHRlclBhdGgobGluay5wYXRobmFtZSk7XG4gICAgICAgIHZhciBob3N0TWF0Y2ggPSBsb2NhdGlvbi5ob3N0bmFtZSA9PT0gbGluay5ob3N0bmFtZSB8fCAhbGluay5ob3N0bmFtZTtcbiAgICAgICAgdmFyIHBhdGhNYXRjaCA9IHRoaXNPcHRzLnNjcm9sbFRhcmdldCB8fCAobGlua1BhdGggPT09IGxvY2F0aW9uUGF0aCk7XG4gICAgICAgIHZhciB0aGlzSGFzaCA9IGVzY2FwZVNlbGVjdG9yKGxpbmsuaGFzaCk7XG5cbiAgICAgICAgaWYgKHRoaXNIYXNoICYmICEkKHRoaXNIYXNoKS5sZW5ndGgpIHtcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXNPcHRzLnNjcm9sbFRhcmdldCAmJiAoIWhvc3RNYXRjaCB8fCAhcGF0aE1hdGNoIHx8ICF0aGlzSGFzaCkpIHtcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2hpbGUgKGluY2x1ZGUgJiYgZWxDb3VudGVyIDwgZXhjbHVkZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICgkbGluay5pcyhlc2NhcGVTZWxlY3RvcihleGNsdWRlW2VsQ291bnRlcisrXSkpKSB7XG4gICAgICAgICAgICAgIGluY2x1ZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3aGlsZSAoaW5jbHVkZSAmJiBld2xDb3VudGVyIDwgZXhjbHVkZVdpdGhpbi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICgkbGluay5jbG9zZXN0KGV4Y2x1ZGVXaXRoaW5bZXdsQ291bnRlcisrXSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGluY2x1ZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5jbHVkZSkge1xuICAgICAgICAgIGlmICh0aGlzT3B0cy5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkLmV4dGVuZChjbGlja09wdHMsIHRoaXNPcHRzLCB7XG4gICAgICAgICAgICBzY3JvbGxUYXJnZXQ6IHRoaXNPcHRzLnNjcm9sbFRhcmdldCB8fCB0aGlzSGFzaCxcbiAgICAgICAgICAgIGxpbms6IGxpbmtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgICQuc21vb3RoU2Nyb2xsKGNsaWNrT3B0cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChvcHRpb25zLmRlbGVnYXRlU2VsZWN0b3IgIT09IG51bGwpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAub2ZmKCdjbGljay5zbW9vdGhzY3JvbGwnLCBvcHRpb25zLmRlbGVnYXRlU2VsZWN0b3IpXG4gICAgICAgIC5vbignY2xpY2suc21vb3Roc2Nyb2xsJywgb3B0aW9ucy5kZWxlZ2F0ZVNlbGVjdG9yLCBjbGlja0hhbmRsZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAub2ZmKCdjbGljay5zbW9vdGhzY3JvbGwnKVxuICAgICAgICAub24oJ2NsaWNrLnNtb290aHNjcm9sbCcsIGNsaWNrSGFuZGxlcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGdldEV4cGxpY2l0T2Zmc2V0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIGV4cGxpY2l0ID0ge3JlbGF0aXZlOiAnJ307XG4gICAgdmFyIHBhcnRzID0gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiYgclJlbGF0aXZlLmV4ZWModmFsKTtcblxuICAgIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgICAgZXhwbGljaXQucHggPSB2YWw7XG4gICAgfSBlbHNlIGlmIChwYXJ0cykge1xuICAgICAgZXhwbGljaXQucmVsYXRpdmUgPSBwYXJ0c1sxXTtcbiAgICAgIGV4cGxpY2l0LnB4ID0gcGFyc2VGbG9hdChwYXJ0c1syXSkgfHwgMDtcbiAgICB9XG5cbiAgICByZXR1cm4gZXhwbGljaXQ7XG4gIH07XG5cbiAgdmFyIG9uQWZ0ZXJTY3JvbGwgPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgdmFyICR0Z3QgPSAkKG9wdHMuc2Nyb2xsVGFyZ2V0KTtcblxuICAgIGlmIChvcHRzLmF1dG9Gb2N1cyAmJiAkdGd0Lmxlbmd0aCkge1xuICAgICAgJHRndFswXS5mb2N1cygpO1xuXG4gICAgICBpZiAoISR0Z3QuaXMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgJHRndC5wcm9wKHt0YWJJbmRleDogLTF9KTtcbiAgICAgICAgJHRndFswXS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9wdHMuYWZ0ZXJTY3JvbGwuY2FsbChvcHRzLmxpbmssIG9wdHMpO1xuICB9O1xuXG4gICQuc21vb3RoU2Nyb2xsID0gZnVuY3Rpb24ob3B0aW9ucywgcHgpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gJ29wdGlvbnMnICYmIHR5cGVvZiBweCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiAkLmV4dGVuZChvcHRpb25PdmVycmlkZXMsIHB4KTtcbiAgICB9XG4gICAgdmFyIG9wdHMsICRzY3JvbGxlciwgc3BlZWQsIGRlbHRhO1xuICAgIHZhciBleHBsaWNpdE9mZnNldCA9IGdldEV4cGxpY2l0T2Zmc2V0KG9wdGlvbnMpO1xuICAgIHZhciBzY3JvbGxUYXJnZXRPZmZzZXQgPSB7fTtcbiAgICB2YXIgc2Nyb2xsZXJPZmZzZXQgPSAwO1xuICAgIHZhciBvZmZQb3MgPSAnb2Zmc2V0JztcbiAgICB2YXIgc2Nyb2xsRGlyID0gJ3Njcm9sbFRvcCc7XG4gICAgdmFyIGFuaVByb3BzID0ge307XG4gICAgdmFyIGFuaU9wdHMgPSB7fTtcblxuICAgIGlmIChleHBsaWNpdE9mZnNldC5weCkge1xuICAgICAgb3B0cyA9ICQuZXh0ZW5kKHtsaW5rOiBudWxsfSwgJC5mbi5zbW9vdGhTY3JvbGwuZGVmYXVsdHMsIG9wdGlvbk92ZXJyaWRlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdHMgPSAkLmV4dGVuZCh7bGluazogbnVsbH0sICQuZm4uc21vb3RoU2Nyb2xsLmRlZmF1bHRzLCBvcHRpb25zIHx8IHt9LCBvcHRpb25PdmVycmlkZXMpO1xuXG4gICAgICBpZiAob3B0cy5zY3JvbGxFbGVtZW50KSB7XG4gICAgICAgIG9mZlBvcyA9ICdwb3NpdGlvbic7XG5cbiAgICAgICAgaWYgKG9wdHMuc2Nyb2xsRWxlbWVudC5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgb3B0cy5zY3JvbGxFbGVtZW50LmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocHgpIHtcbiAgICAgICAgZXhwbGljaXRPZmZzZXQgPSBnZXRFeHBsaWNpdE9mZnNldChweCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2Nyb2xsRGlyID0gb3B0cy5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICdzY3JvbGxMZWZ0JyA6IHNjcm9sbERpcjtcblxuICAgIGlmIChvcHRzLnNjcm9sbEVsZW1lbnQpIHtcbiAgICAgICRzY3JvbGxlciA9IG9wdHMuc2Nyb2xsRWxlbWVudDtcblxuICAgICAgaWYgKCFleHBsaWNpdE9mZnNldC5weCAmJiAhKC9eKD86SFRNTHxCT0RZKSQvKS50ZXN0KCRzY3JvbGxlclswXS5ub2RlTmFtZSkpIHtcbiAgICAgICAgc2Nyb2xsZXJPZmZzZXQgPSAkc2Nyb2xsZXJbc2Nyb2xsRGlyXSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2Nyb2xsZXIgPSAkKCdodG1sLCBib2R5JykuZmlyc3RTY3JvbGxhYmxlKG9wdHMuZGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBiZWZvcmVTY3JvbGwgY2FsbGJhY2sgZnVuY3Rpb24gbXVzdCBmaXJlIGJlZm9yZSBjYWxjdWxhdGluZyBvZmZzZXRcbiAgICBvcHRzLmJlZm9yZVNjcm9sbC5jYWxsKCRzY3JvbGxlciwgb3B0cyk7XG5cbiAgICBzY3JvbGxUYXJnZXRPZmZzZXQgPSBleHBsaWNpdE9mZnNldC5weCA/IGV4cGxpY2l0T2Zmc2V0IDoge1xuICAgICAgcmVsYXRpdmU6ICcnLFxuICAgICAgcHg6ICgkKG9wdHMuc2Nyb2xsVGFyZ2V0KVtvZmZQb3NdKCkgJiYgJChvcHRzLnNjcm9sbFRhcmdldClbb2ZmUG9zXSgpW29wdHMuZGlyZWN0aW9uXSkgfHwgMFxuICAgIH07XG5cbiAgICBhbmlQcm9wc1tzY3JvbGxEaXJdID0gc2Nyb2xsVGFyZ2V0T2Zmc2V0LnJlbGF0aXZlICsgKHNjcm9sbFRhcmdldE9mZnNldC5weCArIHNjcm9sbGVyT2Zmc2V0ICsgb3B0cy5vZmZzZXQpO1xuXG4gICAgc3BlZWQgPSBvcHRzLnNwZWVkO1xuXG4gICAgLy8gYXV0b21hdGljYWxseSBjYWxjdWxhdGUgdGhlIHNwZWVkIG9mIHRoZSBzY3JvbGwgYmFzZWQgb24gZGlzdGFuY2UgLyBjb2VmZmljaWVudFxuICAgIGlmIChzcGVlZCA9PT0gJ2F1dG8nKSB7XG5cbiAgICAgIC8vICRzY3JvbGxlcltzY3JvbGxEaXJdKCkgaXMgcG9zaXRpb24gYmVmb3JlIHNjcm9sbCwgYW5pUHJvcHNbc2Nyb2xsRGlyXSBpcyBwb3NpdGlvbiBhZnRlclxuICAgICAgLy8gV2hlbiBkZWx0YSBpcyBncmVhdGVyLCBzcGVlZCB3aWxsIGJlIGdyZWF0ZXIuXG4gICAgICBkZWx0YSA9IE1hdGguYWJzKGFuaVByb3BzW3Njcm9sbERpcl0gLSAkc2Nyb2xsZXJbc2Nyb2xsRGlyXSgpKTtcblxuICAgICAgLy8gRGl2aWRlIHRoZSBkZWx0YSBieSB0aGUgY29lZmZpY2llbnRcbiAgICAgIHNwZWVkID0gZGVsdGEgLyBvcHRzLmF1dG9Db2VmZmljaWVudDtcbiAgICB9XG5cbiAgICBhbmlPcHRzID0ge1xuICAgICAgZHVyYXRpb246IHNwZWVkLFxuICAgICAgZWFzaW5nOiBvcHRzLmVhc2luZyxcbiAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgb25BZnRlclNjcm9sbChvcHRzKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG9wdHMuc3RlcCkge1xuICAgICAgYW5pT3B0cy5zdGVwID0gb3B0cy5zdGVwO1xuICAgIH1cblxuICAgIGlmICgkc2Nyb2xsZXIubGVuZ3RoKSB7XG4gICAgICAkc2Nyb2xsZXIuc3RvcCgpLmFuaW1hdGUoYW5pUHJvcHMsIGFuaU9wdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbkFmdGVyU2Nyb2xsKG9wdHMpO1xuICAgIH1cbiAgfTtcblxuICAkLnNtb290aFNjcm9sbC52ZXJzaW9uID0gdmVyc2lvbjtcbiAgJC5zbW9vdGhTY3JvbGwuZmlsdGVyUGF0aCA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHN0cmluZyA9IHN0cmluZyB8fCAnJztcblxuICAgIHJldHVybiBzdHJpbmdcbiAgICAgIC5yZXBsYWNlKC9eXFwvLywgJycpXG4gICAgICAucmVwbGFjZSgvKD86aW5kZXh8ZGVmYXVsdCkuW2EtekEtWl17Myw0fSQvLCAnJylcbiAgICAgIC5yZXBsYWNlKC9cXC8kLywgJycpO1xuICB9O1xuXG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICAkLmZuLnNtb290aFNjcm9sbC5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuXG59KSk7XG4iLCIvKiFcbldheXBvaW50cyAtIDQuMC4xXG5Db3B5cmlnaHQgwqkgMjAxMS0yMDE2IENhbGViIFRyb3VnaHRvblxuTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuaHR0cHM6Ly9naXRodWIuY29tL2ltYWtld2VidGhpbmdzL3dheXBvaW50cy9ibG9iL21hc3Rlci9saWNlbnNlcy50eHRcbiovXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciBrZXlDb3VudGVyID0gMFxuICB2YXIgYWxsV2F5cG9pbnRzID0ge31cblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvd2F5cG9pbnQgKi9cbiAgZnVuY3Rpb24gV2F5cG9pbnQob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBvcHRpb25zIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5lbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGVsZW1lbnQgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5oYW5kbGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGhhbmRsZXIgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuXG4gICAgdGhpcy5rZXkgPSAnd2F5cG9pbnQtJyArIGtleUNvdW50ZXJcbiAgICB0aGlzLm9wdGlvbnMgPSBXYXlwb2ludC5BZGFwdGVyLmV4dGVuZCh7fSwgV2F5cG9pbnQuZGVmYXVsdHMsIG9wdGlvbnMpXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy5vcHRpb25zLmVsZW1lbnRcbiAgICB0aGlzLmFkYXB0ZXIgPSBuZXcgV2F5cG9pbnQuQWRhcHRlcih0aGlzLmVsZW1lbnQpXG4gICAgdGhpcy5jYWxsYmFjayA9IG9wdGlvbnMuaGFuZGxlclxuICAgIHRoaXMuYXhpcyA9IHRoaXMub3B0aW9ucy5ob3Jpem9udGFsID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ1xuICAgIHRoaXMuZW5hYmxlZCA9IHRoaXMub3B0aW9ucy5lbmFibGVkXG4gICAgdGhpcy50cmlnZ2VyUG9pbnQgPSBudWxsXG4gICAgdGhpcy5ncm91cCA9IFdheXBvaW50Lkdyb3VwLmZpbmRPckNyZWF0ZSh7XG4gICAgICBuYW1lOiB0aGlzLm9wdGlvbnMuZ3JvdXAsXG4gICAgICBheGlzOiB0aGlzLmF4aXNcbiAgICB9KVxuICAgIHRoaXMuY29udGV4dCA9IFdheXBvaW50LkNvbnRleHQuZmluZE9yQ3JlYXRlQnlFbGVtZW50KHRoaXMub3B0aW9ucy5jb250ZXh0KVxuXG4gICAgaWYgKFdheXBvaW50Lm9mZnNldEFsaWFzZXNbdGhpcy5vcHRpb25zLm9mZnNldF0pIHtcbiAgICAgIHRoaXMub3B0aW9ucy5vZmZzZXQgPSBXYXlwb2ludC5vZmZzZXRBbGlhc2VzW3RoaXMub3B0aW9ucy5vZmZzZXRdXG4gICAgfVxuICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMpXG4gICAgdGhpcy5jb250ZXh0LmFkZCh0aGlzKVxuICAgIGFsbFdheXBvaW50c1t0aGlzLmtleV0gPSB0aGlzXG4gICAga2V5Q291bnRlciArPSAxXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5xdWV1ZVRyaWdnZXIgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgICB0aGlzLmdyb3VwLnF1ZXVlVHJpZ2dlcih0aGlzLCBkaXJlY3Rpb24pXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24oYXJncykge1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHRoaXMuY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuY2FsbGJhY2suYXBwbHkodGhpcywgYXJncylcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rlc3Ryb3kgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRleHQucmVtb3ZlKHRoaXMpXG4gICAgdGhpcy5ncm91cC5yZW1vdmUodGhpcylcbiAgICBkZWxldGUgYWxsV2F5cG9pbnRzW3RoaXMua2V5XVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kaXNhYmxlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2VcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9lbmFibGUgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGV4dC5yZWZyZXNoKClcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvbmV4dCAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdyb3VwLm5leHQodGhpcylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvcHJldmlvdXMgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLnByZXZpb3VzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXAucHJldmlvdXModGhpcylcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgV2F5cG9pbnQuaW52b2tlQWxsID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgdmFyIGFsbFdheXBvaW50c0FycmF5ID0gW11cbiAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiBhbGxXYXlwb2ludHMpIHtcbiAgICAgIGFsbFdheXBvaW50c0FycmF5LnB1c2goYWxsV2F5cG9pbnRzW3dheXBvaW50S2V5XSlcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGFsbFdheXBvaW50c0FycmF5Lmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBhbGxXYXlwb2ludHNBcnJheVtpXVttZXRob2RdKClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rlc3Ryb3ktYWxsICovXG4gIFdheXBvaW50LmRlc3Ryb3lBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5pbnZva2VBbGwoJ2Rlc3Ryb3knKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kaXNhYmxlLWFsbCAqL1xuICBXYXlwb2ludC5kaXNhYmxlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuaW52b2tlQWxsKCdkaXNhYmxlJylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZW5hYmxlLWFsbCAqL1xuICBXYXlwb2ludC5lbmFibGVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5Db250ZXh0LnJlZnJlc2hBbGwoKVxuICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIGFsbFdheXBvaW50cykge1xuICAgICAgYWxsV2F5cG9pbnRzW3dheXBvaW50S2V5XS5lbmFibGVkID0gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9yZWZyZXNoLWFsbCAqL1xuICBXYXlwb2ludC5yZWZyZXNoQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvdmlld3BvcnQtaGVpZ2h0ICovXG4gIFdheXBvaW50LnZpZXdwb3J0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3ZpZXdwb3J0LXdpZHRoICovXG4gIFdheXBvaW50LnZpZXdwb3J0V2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoXG4gIH1cblxuICBXYXlwb2ludC5hZGFwdGVycyA9IFtdXG5cbiAgV2F5cG9pbnQuZGVmYXVsdHMgPSB7XG4gICAgY29udGV4dDogd2luZG93LFxuICAgIGNvbnRpbnVvdXM6IHRydWUsXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBncm91cDogJ2RlZmF1bHQnLFxuICAgIGhvcml6b250YWw6IGZhbHNlLFxuICAgIG9mZnNldDogMFxuICB9XG5cbiAgV2F5cG9pbnQub2Zmc2V0QWxpYXNlcyA9IHtcbiAgICAnYm90dG9tLWluLXZpZXcnOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuaW5uZXJIZWlnaHQoKSAtIHRoaXMuYWRhcHRlci5vdXRlckhlaWdodCgpXG4gICAgfSxcbiAgICAncmlnaHQtaW4tdmlldyc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5pbm5lcldpZHRoKCkgLSB0aGlzLmFkYXB0ZXIub3V0ZXJXaWR0aCgpXG4gICAgfVxuICB9XG5cbiAgd2luZG93LldheXBvaW50ID0gV2F5cG9pbnRcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGZ1bmN0aW9uIHJlcXVlc3RBbmltYXRpb25GcmFtZVNoaW0oY2FsbGJhY2spIHtcbiAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKVxuICB9XG5cbiAgdmFyIGtleUNvdW50ZXIgPSAwXG4gIHZhciBjb250ZXh0cyA9IHt9XG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuICB2YXIgb2xkV2luZG93TG9hZCA9IHdpbmRvdy5vbmxvYWRcblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dCAqL1xuICBmdW5jdGlvbiBDb250ZXh0KGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG4gICAgdGhpcy5BZGFwdGVyID0gV2F5cG9pbnQuQWRhcHRlclxuICAgIHRoaXMuYWRhcHRlciA9IG5ldyB0aGlzLkFkYXB0ZXIoZWxlbWVudClcbiAgICB0aGlzLmtleSA9ICd3YXlwb2ludC1jb250ZXh0LScgKyBrZXlDb3VudGVyXG4gICAgdGhpcy5kaWRTY3JvbGwgPSBmYWxzZVxuICAgIHRoaXMuZGlkUmVzaXplID0gZmFsc2VcbiAgICB0aGlzLm9sZFNjcm9sbCA9IHtcbiAgICAgIHg6IHRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCksXG4gICAgICB5OiB0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKClcbiAgICB9XG4gICAgdGhpcy53YXlwb2ludHMgPSB7XG4gICAgICB2ZXJ0aWNhbDoge30sXG4gICAgICBob3Jpem9udGFsOiB7fVxuICAgIH1cblxuICAgIGVsZW1lbnQud2F5cG9pbnRDb250ZXh0S2V5ID0gdGhpcy5rZXlcbiAgICBjb250ZXh0c1tlbGVtZW50LndheXBvaW50Q29udGV4dEtleV0gPSB0aGlzXG4gICAga2V5Q291bnRlciArPSAxXG4gICAgaWYgKCFXYXlwb2ludC53aW5kb3dDb250ZXh0KSB7XG4gICAgICBXYXlwb2ludC53aW5kb3dDb250ZXh0ID0gdHJ1ZVxuICAgICAgV2F5cG9pbnQud2luZG93Q29udGV4dCA9IG5ldyBDb250ZXh0KHdpbmRvdylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXIoKVxuICAgIHRoaXMuY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlcigpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdmFyIGF4aXMgPSB3YXlwb2ludC5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy53YXlwb2ludHNbYXhpc11bd2F5cG9pbnQua2V5XSA9IHdheXBvaW50XG4gICAgdGhpcy5yZWZyZXNoKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuY2hlY2tFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBob3Jpem9udGFsRW1wdHkgPSB0aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy5ob3Jpem9udGFsKVxuICAgIHZhciB2ZXJ0aWNhbEVtcHR5ID0gdGhpcy5BZGFwdGVyLmlzRW1wdHlPYmplY3QodGhpcy53YXlwb2ludHMudmVydGljYWwpXG4gICAgdmFyIGlzV2luZG93ID0gdGhpcy5lbGVtZW50ID09IHRoaXMuZWxlbWVudC53aW5kb3dcbiAgICBpZiAoaG9yaXpvbnRhbEVtcHR5ICYmIHZlcnRpY2FsRW1wdHkgJiYgIWlzV2luZG93KSB7XG4gICAgICB0aGlzLmFkYXB0ZXIub2ZmKCcud2F5cG9pbnRzJylcbiAgICAgIGRlbGV0ZSBjb250ZXh0c1t0aGlzLmtleV1cbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgIGZ1bmN0aW9uIHJlc2l6ZUhhbmRsZXIoKSB7XG4gICAgICBzZWxmLmhhbmRsZVJlc2l6ZSgpXG4gICAgICBzZWxmLmRpZFJlc2l6ZSA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5hZGFwdGVyLm9uKCdyZXNpemUud2F5cG9pbnRzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXNlbGYuZGlkUmVzaXplKSB7XG4gICAgICAgIHNlbGYuZGlkUmVzaXplID0gdHJ1ZVxuICAgICAgICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVzaXplSGFuZGxlcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5jcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgZnVuY3Rpb24gc2Nyb2xsSGFuZGxlcigpIHtcbiAgICAgIHNlbGYuaGFuZGxlU2Nyb2xsKClcbiAgICAgIHNlbGYuZGlkU2Nyb2xsID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmFkYXB0ZXIub24oJ3Njcm9sbC53YXlwb2ludHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghc2VsZi5kaWRTY3JvbGwgfHwgV2F5cG9pbnQuaXNUb3VjaCkge1xuICAgICAgICBzZWxmLmRpZFNjcm9sbCA9IHRydWVcbiAgICAgICAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbEhhbmRsZXIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyaWdnZXJlZEdyb3VwcyA9IHt9XG4gICAgdmFyIGF4ZXMgPSB7XG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIG5ld1Njcm9sbDogdGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC54LFxuICAgICAgICBmb3J3YXJkOiAncmlnaHQnLFxuICAgICAgICBiYWNrd2FyZDogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgdmVydGljYWw6IHtcbiAgICAgICAgbmV3U2Nyb2xsOiB0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueSxcbiAgICAgICAgZm9yd2FyZDogJ2Rvd24nLFxuICAgICAgICBiYWNrd2FyZDogJ3VwJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGF4aXNLZXkgaW4gYXhlcykge1xuICAgICAgdmFyIGF4aXMgPSBheGVzW2F4aXNLZXldXG4gICAgICB2YXIgaXNGb3J3YXJkID0gYXhpcy5uZXdTY3JvbGwgPiBheGlzLm9sZFNjcm9sbFxuICAgICAgdmFyIGRpcmVjdGlvbiA9IGlzRm9yd2FyZCA/IGF4aXMuZm9yd2FyZCA6IGF4aXMuYmFja3dhcmRcblxuICAgICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gdGhpcy53YXlwb2ludHNbYXhpc0tleV0pIHtcbiAgICAgICAgdmFyIHdheXBvaW50ID0gdGhpcy53YXlwb2ludHNbYXhpc0tleV1bd2F5cG9pbnRLZXldXG4gICAgICAgIGlmICh3YXlwb2ludC50cmlnZ2VyUG9pbnQgPT09IG51bGwpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHZhciB3YXNCZWZvcmVUcmlnZ2VyUG9pbnQgPSBheGlzLm9sZFNjcm9sbCA8IHdheXBvaW50LnRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgbm93QWZ0ZXJUcmlnZ2VyUG9pbnQgPSBheGlzLm5ld1Njcm9sbCA+PSB3YXlwb2ludC50cmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIGNyb3NzZWRGb3J3YXJkID0gd2FzQmVmb3JlVHJpZ2dlclBvaW50ICYmIG5vd0FmdGVyVHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBjcm9zc2VkQmFja3dhcmQgPSAhd2FzQmVmb3JlVHJpZ2dlclBvaW50ICYmICFub3dBZnRlclRyaWdnZXJQb2ludFxuICAgICAgICBpZiAoY3Jvc3NlZEZvcndhcmQgfHwgY3Jvc3NlZEJhY2t3YXJkKSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGRpcmVjdGlvbilcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGdyb3VwS2V5IGluIHRyaWdnZXJlZEdyb3Vwcykge1xuICAgICAgdHJpZ2dlcmVkR3JvdXBzW2dyb3VwS2V5XS5mbHVzaFRyaWdnZXJzKClcbiAgICB9XG5cbiAgICB0aGlzLm9sZFNjcm9sbCA9IHtcbiAgICAgIHg6IGF4ZXMuaG9yaXpvbnRhbC5uZXdTY3JvbGwsXG4gICAgICB5OiBheGVzLnZlcnRpY2FsLm5ld1Njcm9sbFxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaW5uZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIGlmICh0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvdykge1xuICAgICAgcmV0dXJuIFdheXBvaW50LnZpZXdwb3J0SGVpZ2h0KClcbiAgICB9XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHJldHVybiB0aGlzLmFkYXB0ZXIuaW5uZXJIZWlnaHQoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIGRlbGV0ZSB0aGlzLndheXBvaW50c1t3YXlwb2ludC5heGlzXVt3YXlwb2ludC5rZXldXG4gICAgdGhpcy5jaGVja0VtcHR5KClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaW5uZXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgaWYgKHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93KSB7XG4gICAgICByZXR1cm4gV2F5cG9pbnQudmlld3BvcnRXaWR0aCgpXG4gICAgfVxuICAgIC8qZXNsaW50LWVuYWJsZSBlcWVxZXEgKi9cbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmlubmVyV2lkdGgoKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0LWRlc3Ryb3kgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbGxXYXlwb2ludHMgPSBbXVxuICAgIGZvciAodmFyIGF4aXMgaW4gdGhpcy53YXlwb2ludHMpIHtcbiAgICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIHRoaXMud2F5cG9pbnRzW2F4aXNdKSB7XG4gICAgICAgIGFsbFdheXBvaW50cy5wdXNoKHRoaXMud2F5cG9pbnRzW2F4aXNdW3dheXBvaW50S2V5XSlcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGFsbFdheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgYWxsV2F5cG9pbnRzW2ldLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dC1yZWZyZXNoICovXG4gIENvbnRleHQucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIHZhciBpc1dpbmRvdyA9IHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHZhciBjb250ZXh0T2Zmc2V0ID0gaXNXaW5kb3cgPyB1bmRlZmluZWQgOiB0aGlzLmFkYXB0ZXIub2Zmc2V0KClcbiAgICB2YXIgdHJpZ2dlcmVkR3JvdXBzID0ge31cbiAgICB2YXIgYXhlc1xuXG4gICAgdGhpcy5oYW5kbGVTY3JvbGwoKVxuICAgIGF4ZXMgPSB7XG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIGNvbnRleHRPZmZzZXQ6IGlzV2luZG93ID8gMCA6IGNvbnRleHRPZmZzZXQubGVmdCxcbiAgICAgICAgY29udGV4dFNjcm9sbDogaXNXaW5kb3cgPyAwIDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgY29udGV4dERpbWVuc2lvbjogdGhpcy5pbm5lcldpZHRoKCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgZm9yd2FyZDogJ3JpZ2h0JyxcbiAgICAgICAgYmFja3dhcmQ6ICdsZWZ0JyxcbiAgICAgICAgb2Zmc2V0UHJvcDogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgdmVydGljYWw6IHtcbiAgICAgICAgY29udGV4dE9mZnNldDogaXNXaW5kb3cgPyAwIDogY29udGV4dE9mZnNldC50b3AsXG4gICAgICAgIGNvbnRleHRTY3JvbGw6IGlzV2luZG93ID8gMCA6IHRoaXMub2xkU2Nyb2xsLnksXG4gICAgICAgIGNvbnRleHREaW1lbnNpb246IHRoaXMuaW5uZXJIZWlnaHQoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC55LFxuICAgICAgICBmb3J3YXJkOiAnZG93bicsXG4gICAgICAgIGJhY2t3YXJkOiAndXAnLFxuICAgICAgICBvZmZzZXRQcm9wOiAndG9wJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGF4aXNLZXkgaW4gYXhlcykge1xuICAgICAgdmFyIGF4aXMgPSBheGVzW2F4aXNLZXldXG4gICAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiB0aGlzLndheXBvaW50c1theGlzS2V5XSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB0aGlzLndheXBvaW50c1theGlzS2V5XVt3YXlwb2ludEtleV1cbiAgICAgICAgdmFyIGFkanVzdG1lbnQgPSB3YXlwb2ludC5vcHRpb25zLm9mZnNldFxuICAgICAgICB2YXIgb2xkVHJpZ2dlclBvaW50ID0gd2F5cG9pbnQudHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBlbGVtZW50T2Zmc2V0ID0gMFxuICAgICAgICB2YXIgZnJlc2hXYXlwb2ludCA9IG9sZFRyaWdnZXJQb2ludCA9PSBudWxsXG4gICAgICAgIHZhciBjb250ZXh0TW9kaWZpZXIsIHdhc0JlZm9yZVNjcm9sbCwgbm93QWZ0ZXJTY3JvbGxcbiAgICAgICAgdmFyIHRyaWdnZXJlZEJhY2t3YXJkLCB0cmlnZ2VyZWRGb3J3YXJkXG5cbiAgICAgICAgaWYgKHdheXBvaW50LmVsZW1lbnQgIT09IHdheXBvaW50LmVsZW1lbnQud2luZG93KSB7XG4gICAgICAgICAgZWxlbWVudE9mZnNldCA9IHdheXBvaW50LmFkYXB0ZXIub2Zmc2V0KClbYXhpcy5vZmZzZXRQcm9wXVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhZGp1c3RtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgYWRqdXN0bWVudCA9IGFkanVzdG1lbnQuYXBwbHkod2F5cG9pbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGFkanVzdG1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgYWRqdXN0bWVudCA9IHBhcnNlRmxvYXQoYWRqdXN0bWVudClcbiAgICAgICAgICBpZiAod2F5cG9pbnQub3B0aW9ucy5vZmZzZXQuaW5kZXhPZignJScpID4gLSAxKSB7XG4gICAgICAgICAgICBhZGp1c3RtZW50ID0gTWF0aC5jZWlsKGF4aXMuY29udGV4dERpbWVuc2lvbiAqIGFkanVzdG1lbnQgLyAxMDApXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dE1vZGlmaWVyID0gYXhpcy5jb250ZXh0U2Nyb2xsIC0gYXhpcy5jb250ZXh0T2Zmc2V0XG4gICAgICAgIHdheXBvaW50LnRyaWdnZXJQb2ludCA9IE1hdGguZmxvb3IoZWxlbWVudE9mZnNldCArIGNvbnRleHRNb2RpZmllciAtIGFkanVzdG1lbnQpXG4gICAgICAgIHdhc0JlZm9yZVNjcm9sbCA9IG9sZFRyaWdnZXJQb2ludCA8IGF4aXMub2xkU2Nyb2xsXG4gICAgICAgIG5vd0FmdGVyU2Nyb2xsID0gd2F5cG9pbnQudHJpZ2dlclBvaW50ID49IGF4aXMub2xkU2Nyb2xsXG4gICAgICAgIHRyaWdnZXJlZEJhY2t3YXJkID0gd2FzQmVmb3JlU2Nyb2xsICYmIG5vd0FmdGVyU2Nyb2xsXG4gICAgICAgIHRyaWdnZXJlZEZvcndhcmQgPSAhd2FzQmVmb3JlU2Nyb2xsICYmICFub3dBZnRlclNjcm9sbFxuXG4gICAgICAgIGlmICghZnJlc2hXYXlwb2ludCAmJiB0cmlnZ2VyZWRCYWNrd2FyZCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihheGlzLmJhY2t3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFmcmVzaFdheXBvaW50ICYmIHRyaWdnZXJlZEZvcndhcmQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoYXhpcy5mb3J3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZyZXNoV2F5cG9pbnQgJiYgYXhpcy5vbGRTY3JvbGwgPj0gd2F5cG9pbnQudHJpZ2dlclBvaW50KSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGF4aXMuZm9yd2FyZClcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGdyb3VwS2V5IGluIHRyaWdnZXJlZEdyb3Vwcykge1xuICAgICAgICB0cmlnZ2VyZWRHcm91cHNbZ3JvdXBLZXldLmZsdXNoVHJpZ2dlcnMoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LmZpbmRPckNyZWF0ZUJ5RWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gQ29udGV4dC5maW5kQnlFbGVtZW50KGVsZW1lbnQpIHx8IG5ldyBDb250ZXh0KGVsZW1lbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucmVmcmVzaEFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGNvbnRleHRJZCBpbiBjb250ZXh0cykge1xuICAgICAgY29udGV4dHNbY29udGV4dElkXS5yZWZyZXNoKClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQtZmluZC1ieS1lbGVtZW50ICovXG4gIENvbnRleHQuZmluZEJ5RWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gY29udGV4dHNbZWxlbWVudC53YXlwb2ludENvbnRleHRLZXldXG4gIH1cblxuICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKG9sZFdpbmRvd0xvYWQpIHtcbiAgICAgIG9sZFdpbmRvd0xvYWQoKVxuICAgIH1cbiAgICBDb250ZXh0LnJlZnJlc2hBbGwoKVxuICB9XG5cblxuICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciByZXF1ZXN0Rm4gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTaGltXG4gICAgcmVxdWVzdEZuLmNhbGwod2luZG93LCBjYWxsYmFjaylcbiAgfVxuICBXYXlwb2ludC5Db250ZXh0ID0gQ29udGV4dFxufSgpKVxuOyhmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZnVuY3Rpb24gYnlUcmlnZ2VyUG9pbnQoYSwgYikge1xuICAgIHJldHVybiBhLnRyaWdnZXJQb2ludCAtIGIudHJpZ2dlclBvaW50XG4gIH1cblxuICBmdW5jdGlvbiBieVJldmVyc2VUcmlnZ2VyUG9pbnQoYSwgYikge1xuICAgIHJldHVybiBiLnRyaWdnZXJQb2ludCAtIGEudHJpZ2dlclBvaW50XG4gIH1cblxuICB2YXIgZ3JvdXBzID0ge1xuICAgIHZlcnRpY2FsOiB7fSxcbiAgICBob3Jpem9udGFsOiB7fVxuICB9XG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9ncm91cCAqL1xuICBmdW5jdGlvbiBHcm91cChvcHRpb25zKSB7XG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lXG4gICAgdGhpcy5heGlzID0gb3B0aW9ucy5heGlzXG4gICAgdGhpcy5pZCA9IHRoaXMubmFtZSArICctJyArIHRoaXMuYXhpc1xuICAgIHRoaXMud2F5cG9pbnRzID0gW11cbiAgICB0aGlzLmNsZWFyVHJpZ2dlclF1ZXVlcygpXG4gICAgZ3JvdXBzW3RoaXMuYXhpc11bdGhpcy5uYW1lXSA9IHRoaXNcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdGhpcy53YXlwb2ludHMucHVzaCh3YXlwb2ludClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLmNsZWFyVHJpZ2dlclF1ZXVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudHJpZ2dlclF1ZXVlcyA9IHtcbiAgICAgIHVwOiBbXSxcbiAgICAgIGRvd246IFtdLFxuICAgICAgbGVmdDogW10sXG4gICAgICByaWdodDogW11cbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5mbHVzaFRyaWdnZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgZGlyZWN0aW9uIGluIHRoaXMudHJpZ2dlclF1ZXVlcykge1xuICAgICAgdmFyIHdheXBvaW50cyA9IHRoaXMudHJpZ2dlclF1ZXVlc1tkaXJlY3Rpb25dXG4gICAgICB2YXIgcmV2ZXJzZSA9IGRpcmVjdGlvbiA9PT0gJ3VwJyB8fCBkaXJlY3Rpb24gPT09ICdsZWZ0J1xuICAgICAgd2F5cG9pbnRzLnNvcnQocmV2ZXJzZSA/IGJ5UmV2ZXJzZVRyaWdnZXJQb2ludCA6IGJ5VHJpZ2dlclBvaW50KVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHdheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkgKz0gMSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB3YXlwb2ludHNbaV1cbiAgICAgICAgaWYgKHdheXBvaW50Lm9wdGlvbnMuY29udGludW91cyB8fCBpID09PSB3YXlwb2ludHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHdheXBvaW50LnRyaWdnZXIoW2RpcmVjdGlvbl0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jbGVhclRyaWdnZXJRdWV1ZXMoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdGhpcy53YXlwb2ludHMuc29ydChieVRyaWdnZXJQb2ludClcbiAgICB2YXIgaW5kZXggPSBXYXlwb2ludC5BZGFwdGVyLmluQXJyYXkod2F5cG9pbnQsIHRoaXMud2F5cG9pbnRzKVxuICAgIHZhciBpc0xhc3QgPSBpbmRleCA9PT0gdGhpcy53YXlwb2ludHMubGVuZ3RoIC0gMVxuICAgIHJldHVybiBpc0xhc3QgPyBudWxsIDogdGhpcy53YXlwb2ludHNbaW5kZXggKyAxXVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHRoaXMud2F5cG9pbnRzLnNvcnQoYnlUcmlnZ2VyUG9pbnQpXG4gICAgdmFyIGluZGV4ID0gV2F5cG9pbnQuQWRhcHRlci5pbkFycmF5KHdheXBvaW50LCB0aGlzLndheXBvaW50cylcbiAgICByZXR1cm4gaW5kZXggPyB0aGlzLndheXBvaW50c1tpbmRleCAtIDFdIDogbnVsbFxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucXVldWVUcmlnZ2VyID0gZnVuY3Rpb24od2F5cG9pbnQsIGRpcmVjdGlvbikge1xuICAgIHRoaXMudHJpZ2dlclF1ZXVlc1tkaXJlY3Rpb25dLnB1c2god2F5cG9pbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHZhciBpbmRleCA9IFdheXBvaW50LkFkYXB0ZXIuaW5BcnJheSh3YXlwb2ludCwgdGhpcy53YXlwb2ludHMpXG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMud2F5cG9pbnRzLnNwbGljZShpbmRleCwgMSlcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2ZpcnN0ICovXG4gIEdyb3VwLnByb3RvdHlwZS5maXJzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLndheXBvaW50c1swXVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9sYXN0ICovXG4gIEdyb3VwLnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMud2F5cG9pbnRzW3RoaXMud2F5cG9pbnRzLmxlbmd0aCAtIDFdXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLmZpbmRPckNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gZ3JvdXBzW29wdGlvbnMuYXhpc11bb3B0aW9ucy5uYW1lXSB8fCBuZXcgR3JvdXAob3B0aW9ucylcbiAgfVxuXG4gIFdheXBvaW50Lkdyb3VwID0gR3JvdXBcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciAkID0gd2luZG93LmpRdWVyeVxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICBmdW5jdGlvbiBKUXVlcnlBZGFwdGVyKGVsZW1lbnQpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KVxuICB9XG5cbiAgJC5lYWNoKFtcbiAgICAnaW5uZXJIZWlnaHQnLFxuICAgICdpbm5lcldpZHRoJyxcbiAgICAnb2ZmJyxcbiAgICAnb2Zmc2V0JyxcbiAgICAnb24nLFxuICAgICdvdXRlckhlaWdodCcsXG4gICAgJ291dGVyV2lkdGgnLFxuICAgICdzY3JvbGxMZWZ0JyxcbiAgICAnc2Nyb2xsVG9wJ1xuICBdLCBmdW5jdGlvbihpLCBtZXRob2QpIHtcbiAgICBKUXVlcnlBZGFwdGVyLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgIHJldHVybiB0aGlzLiRlbGVtZW50W21ldGhvZF0uYXBwbHkodGhpcy4kZWxlbWVudCwgYXJncylcbiAgICB9XG4gIH0pXG5cbiAgJC5lYWNoKFtcbiAgICAnZXh0ZW5kJyxcbiAgICAnaW5BcnJheScsXG4gICAgJ2lzRW1wdHlPYmplY3QnXG4gIF0sIGZ1bmN0aW9uKGksIG1ldGhvZCkge1xuICAgIEpRdWVyeUFkYXB0ZXJbbWV0aG9kXSA9ICRbbWV0aG9kXVxuICB9KVxuXG4gIFdheXBvaW50LmFkYXB0ZXJzLnB1c2goe1xuICAgIG5hbWU6ICdqcXVlcnknLFxuICAgIEFkYXB0ZXI6IEpRdWVyeUFkYXB0ZXJcbiAgfSlcbiAgV2F5cG9pbnQuQWRhcHRlciA9IEpRdWVyeUFkYXB0ZXJcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUV4dGVuc2lvbihmcmFtZXdvcmspIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgd2F5cG9pbnRzID0gW11cbiAgICAgIHZhciBvdmVycmlkZXMgPSBhcmd1bWVudHNbMF1cblxuICAgICAgaWYgKGZyYW1ld29yay5pc0Z1bmN0aW9uKGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3ZlcnJpZGVzID0gZnJhbWV3b3JrLmV4dGVuZCh7fSwgYXJndW1lbnRzWzFdKVxuICAgICAgICBvdmVycmlkZXMuaGFuZGxlciA9IGFyZ3VtZW50c1swXVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gZnJhbWV3b3JrLmV4dGVuZCh7fSwgb3ZlcnJpZGVzLCB7XG4gICAgICAgICAgZWxlbWVudDogdGhpc1xuICAgICAgICB9KVxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuY29udGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBvcHRpb25zLmNvbnRleHQgPSBmcmFtZXdvcmsodGhpcykuY2xvc2VzdChvcHRpb25zLmNvbnRleHQpWzBdXG4gICAgICAgIH1cbiAgICAgICAgd2F5cG9pbnRzLnB1c2gobmV3IFdheXBvaW50KG9wdGlvbnMpKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHdheXBvaW50c1xuICAgIH1cbiAgfVxuXG4gIGlmICh3aW5kb3cualF1ZXJ5KSB7XG4gICAgd2luZG93LmpRdWVyeS5mbi53YXlwb2ludCA9IGNyZWF0ZUV4dGVuc2lvbih3aW5kb3cualF1ZXJ5KVxuICB9XG4gIGlmICh3aW5kb3cuWmVwdG8pIHtcbiAgICB3aW5kb3cuWmVwdG8uZm4ud2F5cG9pbnQgPSBjcmVhdGVFeHRlbnNpb24od2luZG93LlplcHRvKVxuICB9XG59KCkpXG47IiwiLyohIGpzLWNvb2tpZSB2My4wLjEgfCBNSVQgKi9cbjtcbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbCA9IGdsb2JhbCB8fCBzZWxmLCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdXJyZW50ID0gZ2xvYmFsLkNvb2tpZXM7XG4gICAgdmFyIGV4cG9ydHMgPSBnbG9iYWwuQ29va2llcyA9IGZhY3RvcnkoKTtcbiAgICBleHBvcnRzLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7IGdsb2JhbC5Db29raWVzID0gY3VycmVudDsgcmV0dXJuIGV4cG9ydHM7IH07XG4gIH0oKSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgLyogZXNsaW50LWRpc2FibGUgbm8tdmFyICovXG4gIGZ1bmN0aW9uIGFzc2lnbiAodGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXZhciAqL1xuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXZhciAqL1xuICB2YXIgZGVmYXVsdENvbnZlcnRlciA9IHtcbiAgICByZWFkOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZVswXSA9PT0gJ1wiJykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEsIC0xKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8oJVtcXGRBLUZdezJ9KSsvZ2ksIGRlY29kZVVSSUNvbXBvbmVudClcbiAgICB9LFxuICAgIHdyaXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpLnJlcGxhY2UoXG4gICAgICAgIC8lKDJbMzQ2QkZdfDNbQUMtRl18NDB8NVtCREVdfDYwfDdbQkNEXSkvZyxcbiAgICAgICAgZGVjb2RlVVJJQ29tcG9uZW50XG4gICAgICApXG4gICAgfVxuICB9O1xuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXZhciAqL1xuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXZhciAqL1xuXG4gIGZ1bmN0aW9uIGluaXQgKGNvbnZlcnRlciwgZGVmYXVsdEF0dHJpYnV0ZXMpIHtcbiAgICBmdW5jdGlvbiBzZXQgKGtleSwgdmFsdWUsIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBhdHRyaWJ1dGVzID0gYXNzaWduKHt9LCBkZWZhdWx0QXR0cmlidXRlcywgYXR0cmlidXRlcyk7XG5cbiAgICAgIGlmICh0eXBlb2YgYXR0cmlidXRlcy5leHBpcmVzID09PSAnbnVtYmVyJykge1xuICAgICAgICBhdHRyaWJ1dGVzLmV4cGlyZXMgPSBuZXcgRGF0ZShEYXRlLm5vdygpICsgYXR0cmlidXRlcy5leHBpcmVzICogODY0ZTUpO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJpYnV0ZXMuZXhwaXJlcykge1xuICAgICAgICBhdHRyaWJ1dGVzLmV4cGlyZXMgPSBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKTtcbiAgICAgIH1cblxuICAgICAga2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSlcbiAgICAgICAgLnJlcGxhY2UoLyUoMlszNDZCXXw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuICAgICAgICAucmVwbGFjZSgvWygpXS9nLCBlc2NhcGUpO1xuXG4gICAgICB2YXIgc3RyaW5naWZpZWRBdHRyaWJ1dGVzID0gJyc7XG4gICAgICBmb3IgKHZhciBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnOyAnICsgYXR0cmlidXRlTmFtZTtcblxuICAgICAgICBpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb25zaWRlcnMgUkZDIDYyNjUgc2VjdGlvbiA1LjI6XG4gICAgICAgIC8vIC4uLlxuICAgICAgICAvLyAzLiAgSWYgdGhlIHJlbWFpbmluZyB1bnBhcnNlZC1hdHRyaWJ1dGVzIGNvbnRhaW5zIGEgJXgzQiAoXCI7XCIpXG4gICAgICAgIC8vICAgICBjaGFyYWN0ZXI6XG4gICAgICAgIC8vIENvbnN1bWUgdGhlIGNoYXJhY3RlcnMgb2YgdGhlIHVucGFyc2VkLWF0dHJpYnV0ZXMgdXAgdG8sXG4gICAgICAgIC8vIG5vdCBpbmNsdWRpbmcsIHRoZSBmaXJzdCAleDNCIChcIjtcIikgY2hhcmFjdGVyLlxuICAgICAgICAvLyAuLi5cbiAgICAgICAgc3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc9JyArIGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0uc3BsaXQoJzsnKVswXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChkb2N1bWVudC5jb29raWUgPVxuICAgICAgICBrZXkgKyAnPScgKyBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSkgKyBzdHJpbmdpZmllZEF0dHJpYnV0ZXMpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0IChrZXkpIHtcbiAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8IChhcmd1bWVudHMubGVuZ3RoICYmICFrZXkpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG4gICAgICAvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC5cbiAgICAgIHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG4gICAgICB2YXIgamFyID0ge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnRzID0gY29va2llc1tpXS5zcGxpdCgnPScpO1xuICAgICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgZm91bmRLZXkgPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pO1xuICAgICAgICAgIGphcltmb3VuZEtleV0gPSBjb252ZXJ0ZXIucmVhZCh2YWx1ZSwgZm91bmRLZXkpO1xuXG4gICAgICAgICAgaWYgKGtleSA9PT0gZm91bmRLZXkpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ga2V5ID8gamFyW2tleV0gOiBqYXJcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShcbiAgICAgIHtcbiAgICAgICAgc2V0OiBzZXQsXG4gICAgICAgIGdldDogZ2V0LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIChrZXksIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICBzZXQoXG4gICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAnJyxcbiAgICAgICAgICAgIGFzc2lnbih7fSwgYXR0cmlidXRlcywge1xuICAgICAgICAgICAgICBleHBpcmVzOiAtMVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgICAgICB3aXRoQXR0cmlidXRlczogZnVuY3Rpb24gKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICByZXR1cm4gaW5pdCh0aGlzLmNvbnZlcnRlciwgYXNzaWduKHt9LCB0aGlzLmF0dHJpYnV0ZXMsIGF0dHJpYnV0ZXMpKVxuICAgICAgICB9LFxuICAgICAgICB3aXRoQ29udmVydGVyOiBmdW5jdGlvbiAoY29udmVydGVyKSB7XG4gICAgICAgICAgcmV0dXJuIGluaXQoYXNzaWduKHt9LCB0aGlzLmNvbnZlcnRlciwgY29udmVydGVyKSwgdGhpcy5hdHRyaWJ1dGVzKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBhdHRyaWJ1dGVzOiB7IHZhbHVlOiBPYmplY3QuZnJlZXplKGRlZmF1bHRBdHRyaWJ1dGVzKSB9LFxuICAgICAgICBjb252ZXJ0ZXI6IHsgdmFsdWU6IE9iamVjdC5mcmVlemUoY29udmVydGVyKSB9XG4gICAgICB9XG4gICAgKVxuICB9XG5cbiAgdmFyIGFwaSA9IGluaXQoZGVmYXVsdENvbnZlcnRlciwgeyBwYXRoOiAnLycgfSk7XG4gIC8qIGVzbGludC1lbmFibGUgbm8tdmFyICovXG5cbiAgcmV0dXJuIGFwaTtcblxufSkpKTtcbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuICAgICQoXCIubGF6eVwiKS5yZWNsaW5lcih7XG4gICAgICAgIGF0dHJpYjogXCJkYXRhLXNyY1wiLCAvLyBzZWxlY3RvciBmb3IgYXR0cmlidXRlIGNvbnRhaW5pbmcgdGhlIG1lZGlhIHNyY1xuICAgICAgICB0aHJvdHRsZTogMzAwLCAgICAgIC8vIG1pbGxpc2Vjb25kIGludGVydmFsIGF0IHdoaWNoIHRvIHByb2Nlc3MgZXZlbnRzXG4gICAgICAgIHRocmVzaG9sZDogMTAwLCAgICAgLy8gc2Nyb2xsIGRpc3RhbmNlIGZyb20gZWxlbWVudCBiZWZvcmUgaXRzIGxvYWRlZFxuICAgICAgICBwcmludGFibGU6IHRydWUsICAgIC8vIGJlIHByaW50ZXIgZnJpZW5kbHkgYW5kIHNob3cgYWxsIGVsZW1lbnRzIG9uIGRvY3VtZW50IHByaW50XG4gICAgICAgIGxpdmU6IHRydWUgICAgICAgICAgLy8gYXV0byBiaW5kIGxhenkgbG9hZGluZyB0byBhamF4IGxvYWRlZCBlbGVtZW50c1xuICAgIH0pO1xuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdsYXp5bG9hZCcsICcubGF6eScsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGUgPSAkKHRoaXMpO1xuICAgICAgICAvLyBkbyBzb21ldGhpbmcgd2l0aCB0aGUgZWxlbWVudCB0byBiZSBsb2FkZWQuLi5cbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2xhenlsb2FkJywgJGUpO1xuICAgIH0pO1xuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JzsgICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgbGV0ICRzZWN0aW9uX3ZpZGVvcyA9ICQoJy5zZWN0aW9uLXZpZGVvcycpO1xuICAgIGlmICggJCgnLnNsaWNrJywgJHNlY3Rpb25fdmlkZW9zKS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICQoICc8ZGl2IGNsYXNzPVwic2xpY2stYXJyb3dzXCI+PC9kaXY+JyApLmluc2VydEFmdGVyKCAnLnNlY3Rpb24tdmlkZW9zIC5zbGljaycgKTtcbiAgICAgICAgXG4gICAgICAgICQoJy5zZWN0aW9uLXZpZGVvcycpLmltYWdlc0xvYWRlZCgge2JhY2tncm91bmQ6ICcuYmFja2dyb3VuZCd9KVxuICAgICAgICBcbiAgICAgICAgLmRvbmUoIGZ1bmN0aW9uKCBpbnN0YW5jZSApIHtcbiAgICBcbiAgICAgICAgICAgICQoJy5zZWN0aW9uLXZpZGVvcyAuc2xpY2snKS5zbGljayh7XG4gICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAyLFxuICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMixcbiAgICAgICAgICAgICAgYXBwZW5kQXJyb3dzOiAkKCcuc2VjdGlvbi12aWRlb3MgLnNsaWNrLWFycm93cycpLFxuICAgICAgICAgICAgICByZXNwb25zaXZlOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogOTc5LFxuICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7ICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkc2VjdGlvbl92aWRlb3MuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcbiAgICAgICAgXG4gICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgbGV0ICRzZWN0aW9uX3N0b3JpZXMgPSAkKCcuc2VjdGlvbi1zdG9yaWVzJyk7XG4gICAgaWYgKCAkKCcuc2xpY2snLCAkc2VjdGlvbl9zdG9yaWVzKS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICQoJy5zZWN0aW9uLXN0b3JpZXMnKS5pbWFnZXNMb2FkZWQoe2JhY2tncm91bmQ6ICdhJ30pXG4gICAgICAgIFxuICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuICAgIFxuICAgICAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi1zdG9yaWVzIC5zbGljaycgKTtcbiAgICAgICAgXG4gICAgICAgICAgICAkKCcuc2VjdGlvbi1zdG9yaWVzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zZWN0aW9uLXN0b3JpZXMgLnNsaWNrLWFycm93cycpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICRzZWN0aW9uX3N0b3JpZXMuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcbiAgICAgICAgXG4gICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgbGV0ICRzaW5nbGVQb3N0U2xpZGVyID0gJCgnLnNpbmdsZS1wb3N0IC5zbGlkZXInKTtcbiAgICBpZiAoICQoJy5zbGljaycsICRzaW5nbGVQb3N0U2xpZGVyKS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICRzaW5nbGVQb3N0U2xpZGVyLmltYWdlc0xvYWRlZCh7YmFja2dyb3VuZDogdHJ1ZX0pXG4gICAgICAgIFxuICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuICAgICAgICBcbiAgICAgICAgICAgICQoJy5zbGljaycsICRzaW5nbGVQb3N0U2xpZGVyKS5zbGljayh7XG4gICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgIGFwcGVuZEFycm93czogJCgnLnNsaWNrLWFycm93cycsICRzaW5nbGVQb3N0U2xpZGVyKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkc2luZ2xlUG9zdFNsaWRlci5hZGRDbGFzcygnaW1hZ2VzLWxvYWRlZCcpO1xuICAgICAgICBcbiAgICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAkKCAnPGRpdiBjbGFzcz1cInNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLWNvcmUtYmVoYXZpb3JzIC5zbGljaycgKTtcbiAgICBcbiAgICAkKCcuc2VjdGlvbi1jb3JlLWJlaGF2aW9ycyAuc2xpY2snKS5zbGljayh7XG4gICAgICAgIGZhZGU6IHRydWUsXG4gICAgICAgIGRvdHM6IHRydWUsXG4gICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICBhZGFwdGl2ZUhlaWdodDogZmFsc2UsXG4gICAgICAgIGFwcGVuZEFycm93czogJCgnLnNlY3Rpb24tY29yZS1iZWhhdmlvcnMgLnNsaWNrLWFycm93cycpXG4gICAgfSk7XG4gICAgXG4gICAgJCgnLnNlY3Rpb24tY29yZS1iZWhhdmlvcnMgLmdyaWQnKS5vbignY2xpY2snLCcuZ3JpZC1pdGVtJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIHNsaWRlSW5kZXggPSAkKHRoaXMpLnBhcmVudCgpLmluZGV4KCk7XG4gICAgICAgICQoICcuc2VjdGlvbi1jb3JlLWJlaGF2aW9ycyAuc2xpY2snICkuc2xpY2soICdzbGlja0dvVG8nLCBwYXJzZUludChzbGlkZUluZGV4KSApO1xuICAgIH0pO1xuICAgIFxuICAgIFxuICAgIC8vIFJlbGF0ZWQgUG9zdHNcbiAgICBcbmxldCAkc2VjdGlvbl9yZWxhdGVkX3Bvc3RzID0gJCgnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cycpO1xuICAgIGlmICggJCgnLnNsaWNrJywgJHNlY3Rpb25fcmVsYXRlZF9wb3N0cykubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAvLyQoICc8ZGl2IGNsYXNzPVwic2xpY2stYXJyb3dzXCI+PC9kaXY+JyApLmluc2VydEFmdGVyKCAnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cyAuc2xpY2snICk7XG4gICAgICAgIFxuICAgICAgICAkKCcuc2VjdGlvbi1yZWxhdGVkLXBvc3RzJykuaW1hZ2VzTG9hZGVkKCB7YmFja2dyb3VuZDogJy5wb3N0LWhlcm8nfSlcbiAgICAgICAgXG4gICAgICAgIC5kb25lKCBmdW5jdGlvbiggaW5zdGFuY2UgKSB7XG4gICAgXG4gICAgICAgICAgICAkKCAnPGRpdiBjbGFzcz1cImNvbHVtbiByb3cgc2xpY2stYXJyb3dzXCI+PC9kaXY+JyApLmluc2VydEFmdGVyKCAnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cyAuc2xpY2snICk7XG4gICAgXG4gICAgICAgICAgICAkKCcuc2VjdGlvbi1yZWxhdGVkLXBvc3RzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDQsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zZWN0aW9uLXJlbGF0ZWQtcG9zdHMgLnNsaWNrLWFycm93cycpLFxuICAgICAgICAgICAgICByZXNwb25zaXZlOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogMTIwMCxcbiAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBicmVha3BvaW50OiA5ODAsXG4gICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDIsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBicmVha3BvaW50OiA0ODAsXG4gICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFlvdSBjYW4gdW5zbGljayBhdCBhIGdpdmVuIGJyZWFrcG9pbnQgbm93IGJ5IGFkZGluZzpcbiAgICAgICAgICAgICAgICAvLyBzZXR0aW5nczogXCJ1bnNsaWNrXCJcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIG9mIGEgc2V0dGluZ3Mgb2JqZWN0XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkc2VjdGlvbl9yZWxhdGVkX3Bvc3RzLmFkZENsYXNzKCdpbWFnZXMtbG9hZGVkJyk7XG5cbiAgICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgbGV0ICRzZWN0aW9uX3Rlc3RpbW9uaWFscyA9ICQoJy5zZWN0aW9uLXRlc3RpbW9uaWFscycpO1xuICAgIGlmICggJCgnLnNsaWNrJywgJHNlY3Rpb25fdGVzdGltb25pYWxzKS5sZW5ndGggKSB7XG5cbiAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi10ZXN0aW1vbmlhbHMgLnNsaWNrJyApO1xuXG4gICAgICAgICQoJy5zZWN0aW9uLXRlc3RpbW9uaWFscycpLmltYWdlc0xvYWRlZCgpXG5cbiAgICAgICAgLmRvbmUoIGZ1bmN0aW9uKCBpbnN0YW5jZSApIHtcblxuICAgICAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi10ZXN0aW1vbmlhbHMgLnNsaWNrJyApO1xuICAgICAgICAgICAgJCgnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICAgIGFwcGVuZEFycm93czogJCgnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljay1hcnJvd3MnKSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkc2VjdGlvbl90ZXN0aW1vbmlhbHMuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcblxuICAgICAgICAgfSk7XG4gICAgfVxuXG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0JChcIi5qcy1zdXBlcmZpc2hcIikuc3VwZXJmaXNoKHtcbiAgICAgICAgZGVsYXk6MTAwLFxuICAgICAgICAvL2FuaW1hdGlvbjp7b3BhY2l0eTpcInNob3dcIixoZWlnaHQ6XCJzaG93XCJ9LFxuICAgICAgICBkcm9wU2hhZG93czohMVxuICAgIH0pO1xuICAgIFxuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiLyohXG5XYXlwb2ludHMgSW52aWV3IFNob3J0Y3V0IC0gNC4wLjFcbkNvcHlyaWdodCDCqSAyMDExLTIwMTYgQ2FsZWIgVHJvdWdodG9uXG5MaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5odHRwczovL2dpdGh1Yi5jb20vaW1ha2V3ZWJ0aGluZ3Mvd2F5cG9pbnRzL2Jsb2IvbWFzdGVyL2xpY2Vuc2VzLnR4dFxuKi9cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZnVuY3Rpb24gbm9vcCgpIHt9XG5cbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvc2hvcnRjdXRzL2ludmlldyAqL1xuICBmdW5jdGlvbiBJbnZpZXcob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IFdheXBvaW50LkFkYXB0ZXIuZXh0ZW5kKHt9LCBJbnZpZXcuZGVmYXVsdHMsIG9wdGlvbnMpXG4gICAgdGhpcy5heGlzID0gdGhpcy5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy53YXlwb2ludHMgPSBbXVxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMub3B0aW9ucy5lbGVtZW50XG4gICAgdGhpcy5jcmVhdGVXYXlwb2ludHMoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBJbnZpZXcucHJvdG90eXBlLmNyZWF0ZVdheXBvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb25maWdzID0ge1xuICAgICAgdmVydGljYWw6IFt7XG4gICAgICAgIGRvd246ICdlbnRlcicsXG4gICAgICAgIHVwOiAnZXhpdGVkJyxcbiAgICAgICAgb2Zmc2V0OiAnMTAwJSdcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2VudGVyZWQnLFxuICAgICAgICB1cDogJ2V4aXQnLFxuICAgICAgICBvZmZzZXQ6ICdib3R0b20taW4tdmlldydcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2V4aXQnLFxuICAgICAgICB1cDogJ2VudGVyZWQnLFxuICAgICAgICBvZmZzZXQ6IDBcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2V4aXRlZCcsXG4gICAgICAgIHVwOiAnZW50ZXInLFxuICAgICAgICBvZmZzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAtdGhpcy5hZGFwdGVyLm91dGVySGVpZ2h0KClcbiAgICAgICAgfVxuICAgICAgfV0sXG4gICAgICBob3Jpem9udGFsOiBbe1xuICAgICAgICByaWdodDogJ2VudGVyJyxcbiAgICAgICAgbGVmdDogJ2V4aXRlZCcsXG4gICAgICAgIG9mZnNldDogJzEwMCUnXG4gICAgICB9LCB7XG4gICAgICAgIHJpZ2h0OiAnZW50ZXJlZCcsXG4gICAgICAgIGxlZnQ6ICdleGl0JyxcbiAgICAgICAgb2Zmc2V0OiAncmlnaHQtaW4tdmlldydcbiAgICAgIH0sIHtcbiAgICAgICAgcmlnaHQ6ICdleGl0JyxcbiAgICAgICAgbGVmdDogJ2VudGVyZWQnLFxuICAgICAgICBvZmZzZXQ6IDBcbiAgICAgIH0sIHtcbiAgICAgICAgcmlnaHQ6ICdleGl0ZWQnLFxuICAgICAgICBsZWZ0OiAnZW50ZXInLFxuICAgICAgICBvZmZzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAtdGhpcy5hZGFwdGVyLm91dGVyV2lkdGgoKVxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBjb25maWdzW3RoaXMuYXhpc10ubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHZhciBjb25maWcgPSBjb25maWdzW3RoaXMuYXhpc11baV1cbiAgICAgIHRoaXMuY3JlYXRlV2F5cG9pbnQoY29uZmlnKVxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgSW52aWV3LnByb3RvdHlwZS5jcmVhdGVXYXlwb2ludCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIHRoaXMud2F5cG9pbnRzLnB1c2gobmV3IFdheXBvaW50KHtcbiAgICAgIGNvbnRleHQ6IHRoaXMub3B0aW9ucy5jb250ZXh0LFxuICAgICAgZWxlbWVudDogdGhpcy5vcHRpb25zLmVsZW1lbnQsXG4gICAgICBlbmFibGVkOiB0aGlzLm9wdGlvbnMuZW5hYmxlZCxcbiAgICAgIGhhbmRsZXI6IChmdW5jdGlvbihjb25maWcpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgICAgIHNlbGYub3B0aW9uc1tjb25maWdbZGlyZWN0aW9uXV0uY2FsbChzZWxmLCBkaXJlY3Rpb24pXG4gICAgICAgIH1cbiAgICAgIH0oY29uZmlnKSksXG4gICAgICBvZmZzZXQ6IGNvbmZpZy5vZmZzZXQsXG4gICAgICBob3Jpem9udGFsOiB0aGlzLm9wdGlvbnMuaG9yaXpvbnRhbFxuICAgIH0pKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIEludmlldy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLndheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpcy53YXlwb2ludHNbaV0uZGVzdHJveSgpXG4gICAgfVxuICAgIHRoaXMud2F5cG9pbnRzID0gW11cbiAgfVxuXG4gIEludmlldy5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLndheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpcy53YXlwb2ludHNbaV0uZGlzYWJsZSgpXG4gICAgfVxuICB9XG5cbiAgSW52aWV3LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy53YXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXMud2F5cG9pbnRzW2ldLmVuYWJsZSgpXG4gICAgfVxuICB9XG5cbiAgSW52aWV3LmRlZmF1bHRzID0ge1xuICAgIGNvbnRleHQ6IHdpbmRvdyxcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGVudGVyOiBub29wLFxuICAgIGVudGVyZWQ6IG5vb3AsXG4gICAgZXhpdDogbm9vcCxcbiAgICBleGl0ZWQ6IG5vb3BcbiAgfVxuXG4gIFdheXBvaW50LkludmlldyA9IEludmlld1xufSgpKVxuOyIsIihmdW5jdGlvbigkKSB7XG5cdFxuXHQndXNlIHN0cmljdCc7XHRcblx0XG5cdHZhciAkbGVnZW5kID0gJCggJy5zZWN0aW9uLWJ1c2luZXNzLWxpbmVzLW1hcCAubGVnZW5kJyApO1xuICAgIFxuICAgIHZhciAkbWFwcyA9ICQoICcuc2VjdGlvbi1idXNpbmVzcy1saW5lcy1tYXAgLm1hcHMnICk7XG4gICAgXG4gICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRtYXBzLmFuaW1hdGUoeydvcGFjaXR5JzonMSd9LDUwMCk7XG4gICAgfSk7XG4gICAgICAgIFxuICAgIC8vY2xvc2UgY2FyZCB3aGVuIGNsaWNrIG9uIGNyb3NzXG4gICAgJGxlZ2VuZC5vbignaG92ZXInLCdidXR0b24nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIGlmKCQoJ2JvZHknKS5oYXNDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcCcpO1xuICAgICAgICBpZigkKGlkKS5jc3MoJ29wYWNpdHknKSA9PSAwKSB7XG4gICAgICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5ub3QoaWQpLmFuaW1hdGUoeydvcGFjaXR5JzonMCd9LDEwMCk7XG4gICAgICAgICAgICAkKGlkKS5zdG9wKCkuYW5pbWF0ZSh7J29wYWNpdHknOicxJ30sMTAwKTtcbiAgICAgICAgfVxuICAgICBcbiAgICB9KTtcbiAgICBcbiAgICAkbGVnZW5kLm9uKCdjbGljaycsJ2J1dHRvbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcCcpO1xuICAgICAgICBpZigkKGlkKS5jc3MoJ29wYWNpdHknKSA9PSAwKSB7XG4gICAgICAgICAgICAkKCcubWFwJykuc3RvcCgpLm5vdChpZCkuY3NzKHsnb3BhY2l0eSc6JzAnfSk7XG4gICAgICAgICAgICAkKGlkKS5zdG9wKCkuY3NzKHsnb3BhY2l0eSc6JzEnfSk7ICAgICAgICAgICAgXG4gICAgICAgIH0gXG4gICAgICAgIFxuICAgICAgICAkKGlkKS5hZGRDbGFzcygnYWN0aXZlJyk7ICAgXG4gICAgIFxuICAgIH0pO1xuICAgIFxuICAgICRsZWdlbmQubW91c2VsZWF2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIGlmKCQoJ2JvZHknKS5oYXNDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5hbmltYXRlKHsnb3BhY2l0eSc6JzAnfSwxMDApO1xuICAgICAgICAkKCcjbWFwLTAnKS5zdG9wKCkuYW5pbWF0ZSh7J29wYWNpdHknOicxJ30sMTAwKTtcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBpZigkKCcucGFnZS10ZW1wbGF0ZS1jYXJlZXJzJykubGVuZ3RoKSB7XG4gICAgICAgIHZhciBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuICAgICAgICBpZihzZWFyY2hQYXJhbXMuaGFzKCdzZWFyY2gnKSkge1xuICAgICAgICAgICAgdmFyIHBhcmFtID0gc2VhcmNoUGFyYW1zLmdldCgnc2VhcmNoJyk7XG4gICAgICAgICAgICBpZihwYXJhbSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkKCcjY2FyZWVycy1yb290Jykub2Zmc2V0KCkudG9wIC0zNSB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgICAkKFwibWFpbiBzZWN0aW9uOm5vdCgnLmNhcmVlcnMtc2VjdGlvbicpXCIpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB3aW5kb3cucmVhY3RNYXRjaEhlaWdodCA9IGZ1bmN0aW9uKGVsQ2xhc3NOYW1lKSB7XG4gICAgICAgICAgJCgnLmNhcmVlcnMtc2VjdGlvbiAuY29sdW1uIGgzJykubWF0Y2hIZWlnaHQoeyByb3c6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIE9wZW4gZXh0ZXJuYWwgbGlua3MgaW4gbmV3IHdpbmRvdyAoZXhjbHVlIHNjdiBpbWFnZSBtYXBzLCBlbWFpbCwgdGVsIGFuZCBmb29ib3gpXG5cblx0JCgnYScpLm5vdCgnc3ZnIGEsIFtocmVmKj1cInRlbDpcIl0sIFtjbGFzcyo9XCJmb29ib3hcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaXNJbnRlcm5hbExpbmsgPSBuZXcgUmVnRXhwKCcvJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgJy8nKTtcblx0XHRpZiAoICEgaXNJbnRlcm5hbExpbmsudGVzdCh0aGlzLmhyZWYpICkge1xuXHRcdFx0JCh0aGlzKS5hdHRyKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG5cdFx0fVxuXHR9KTtcblx0XG4gICAgJCgnYVtocmVmKj1cIi5wZGZcIl0nKS5hdHRyKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgZGlkU2Nyb2xsO1xuICAgIHZhciBsYXN0U2Nyb2xsVG9wID0gMDtcbiAgICB2YXIgZGVsdGEgPSAyMDA7XG4gICAgdmFyIG5hdmJhckhlaWdodCA9ICQoJy5zaXRlLWhlYWRlcicpLm91dGVySGVpZ2h0KCk7XG4gICAgXG4gICAgJCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbihldmVudCl7XG4gICAgICAgIGRpZFNjcm9sbCA9IHRydWU7XG4gICAgfSk7XG4gICAgXG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChkaWRTY3JvbGwpIHtcbiAgICAgICAgICAgIGhhc1Njcm9sbGVkKCk7XG4gICAgICAgICAgICBkaWRTY3JvbGwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIDI1MCk7XG4gICAgXG4gICAgZnVuY3Rpb24gaGFzU2Nyb2xsZWQoKSB7XG4gICAgICAgIHZhciBzdCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2Ugc2Nyb2xsIG1vcmUgdGhhbiBkZWx0YVxuICAgICAgICBpZihNYXRoLmFicyhsYXN0U2Nyb2xsVG9wIC0gc3QpIDw9IGRlbHRhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgLy8gSWYgc2Nyb2xsZWQgZG93biBhbmQgcGFzdCB0aGUgbmF2YmFyLCBhZGQgY2xhc3MgLm5hdi11cC5cbiAgICAgICAgaWYgKHN0ID4gbGFzdFNjcm9sbFRvcCl7XG4gICAgICAgICAgICAvLyBTY3JvbGwgRG93blxuICAgICAgICAgICAgaWYoc3QgPiBuYXZiYXJIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5hZGRDbGFzcygnZml4ZWQnKS5yZW1vdmVDbGFzcygnbmF2LWRvd24nKS5hZGRDbGFzcygnbmF2LXVwIHNocmluaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2Nyb2xsIFVwXG4gICAgICAgICAgICBpZigoZGVsdGErbmF2YmFySGVpZ2h0KSArIHN0ICsgJCh3aW5kb3cpLmhlaWdodCgpIDwgJChkb2N1bWVudCkuaGVpZ2h0KCkpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnbmF2LXVwJykuYWRkQ2xhc3MoJ25hdi1kb3duJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKHN0IDw9IChkZWx0YStuYXZiYXJIZWlnaHQpKSB7XG4gICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnZml4ZWQgbmF2LWRvd24gc2hyaW5rJyk7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgIGxhc3RTY3JvbGxUb3AgPSBzdDtcbiAgICB9XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIExvYWQgRm91bmRhdGlvblxuXHQkKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG4gICAgXG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdkb2N1bWVudC1yZWFkeScpO1xuICAgXG4gICAgJCgnLnNjcm9sbC1uZXh0Jykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgICAgXG4gICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgIG9mZnNldDogLTEwMCxcbiAgICAgICAgICAgIHNjcm9sbFRhcmdldDogJCgnbWFpbiBzZWN0aW9uOmZpcnN0LWNoaWxkJyksXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFRvZ2dsZSBtZW51XG4gICAgXG4gICAgJCgnbGkubWVudS1pdGVtLWhhcy1jaGlsZHJlbiA+IGFbaHJlZl49XCIjXCJdJykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgICAgXG4gICAgICAgIHZhciAkdG9nZ2xlID0gJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuc3ViLW1lbnUtdG9nZ2xlJyk7XG4gICAgICAgIFxuICAgICAgICBpZiggJHRvZ2dsZS5pcygnOnZpc2libGUnKSApIHtcbiAgICAgICAgICAgICR0b2dnbGUudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG5cbiAgICB9KTtcbiAgICBcbiAgXG4gICAgJCh3aW5kb3cpLnNjcm9sbChhbmltYXRlTnVtYmVycyk7XG4gICAgXG4gICAgJCh3aW5kb3cpLm9uKFwibG9hZCBzY3JvbGxcIixmdW5jdGlvbihlKXtcbiAgICAgICAgYW5pbWF0ZU51bWJlcnMoKTsgXG4gICAgfSk7XG4gICAgdmFyIHZpZXdlZCA9IGZhbHNlO1xuICAgIFxuICAgIGZ1bmN0aW9uIGlzU2Nyb2xsZWRJbnRvVmlldyhlbGVtKSB7XG4gICAgICAgIFxuICAgICAgICBpZiggISAkKGVsZW0pLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIGRvY1ZpZXdUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgICAgIHZhciBkb2NWaWV3Qm90dG9tID0gZG9jVmlld1RvcCArICQod2luZG93KS5oZWlnaHQoKTtcbiAgICBcbiAgICAgICAgdmFyIGVsZW1Ub3AgPSAkKGVsZW0pLm9mZnNldCgpLnRvcDtcbiAgICAgICAgdmFyIGVsZW1Cb3R0b20gPSBlbGVtVG9wICsgJChlbGVtKS5oZWlnaHQoKTtcbiAgICBcbiAgICAgICAgcmV0dXJuICgoZWxlbUJvdHRvbSA8PSBkb2NWaWV3Qm90dG9tKSAmJiAoZWxlbVRvcCA+PSBkb2NWaWV3VG9wKSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGFuaW1hdGVOdW1iZXJzKCkge1xuICAgICAgaWYgKGlzU2Nyb2xsZWRJbnRvVmlldygkKFwiLm51bWJlcnNcIikpICYmICF2aWV3ZWQpIHtcbiAgICAgICAgICB2aWV3ZWQgPSB0cnVlO1xuICAgICAgICAgICQoJy5udW1iZXInKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkKHRoaXMpLmNzcygnb3BhY2l0eScsIDEpO1xuICAgICAgICAgICQodGhpcykucHJvcCgnQ291bnRlcicsMCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgIENvdW50ZXI6ICQodGhpcykudGV4dCgpLnJlcGxhY2UoLywvZywgJycpXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogNDAwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICBzdGVwOiBmdW5jdGlvbiAobm93KSB7XG4gICAgICAgICAgICAgICAgICAkKHRoaXMpLnRleHQoTWF0aC5jZWlsKG5vdykudG9TdHJpbmcoKS5yZXBsYWNlKC8oXFxkKSg/PShcXGRcXGRcXGQpKyg/IVxcZCkpL2csIFwiJDEsXCIpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkKCcudWwtZXhwYW5kJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKCQodGhpcykuZmluZCgnbGk6dmlzaWJsZScpLmxlbmd0aCkge1xuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCdzcGFuIGEnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAkKCcudWwtZXhwYW5kJykub24oJ2NsaWNrJywnc3BhbiBhJyxmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvL3ZhciAkY2hpbGRyZW4gPSAkKHRoaXMpLnByZXYoJ3VsJykuY2hpbGRyZW4oKTtcbiAgICAgICAgXG4gICAgICAgIC8vJGNoaWxkcmVuLmNzcygnZGlzcGxheScsICdpbmxpbmUnKTtcbiAgICAgICAgLy9yZXR1cm4gZmFsc2U7XG4gICAgICAgICQodGhpcykucGFyZW50cygnZGl2JykuZmluZCgndWwnKS5yZW1vdmVDbGFzcygnc2hvcnQnKTtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTsgIFxuICAgIH0pO1xuXG4gICAgXG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIFJlcGxhY2UgYWxsIFNWRyBpbWFnZXMgd2l0aCBpbmxpbmUgU1ZHICh1c2UgYXMgbmVlZGVkIHNvIHlvdSBjYW4gc2V0IGhvdmVyIGZpbGxzKVxuXG4gICAgICAgICQoJ2ltZy5zdmcnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgJGltZyA9IGpRdWVyeSh0aGlzKTtcbiAgICAgICAgICAgIHZhciBpbWdJRCA9ICRpbWcuYXR0cignaWQnKTtcbiAgICAgICAgICAgIHZhciBpbWdDbGFzcyA9ICRpbWcuYXR0cignY2xhc3MnKTtcbiAgICAgICAgICAgIHZhciBpbWdVUkwgPSAkaW1nLmF0dHIoJ3NyYycpO1xuXG5cdFx0JC5nZXQoaW1nVVJMLCBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHQvLyBHZXQgdGhlIFNWRyB0YWcsIGlnbm9yZSB0aGUgcmVzdFxuXHRcdFx0dmFyICRzdmcgPSBqUXVlcnkoZGF0YSkuZmluZCgnc3ZnJyk7XG5cblx0XHRcdC8vIEFkZCByZXBsYWNlZCBpbWFnZSdzIElEIHRvIHRoZSBuZXcgU1ZHXG5cdFx0XHRpZih0eXBlb2YgaW1nSUQgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdCRzdmcgPSAkc3ZnLmF0dHIoJ2lkJywgaW1nSUQpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gQWRkIHJlcGxhY2VkIGltYWdlJ3MgY2xhc3NlcyB0byB0aGUgbmV3IFNWR1xuXHRcdFx0aWYodHlwZW9mIGltZ0NsYXNzICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHQkc3ZnID0gJHN2Zy5hdHRyKCdjbGFzcycsIGltZ0NsYXNzKycgcmVwbGFjZWQtc3ZnJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlbW92ZSBhbnkgaW52YWxpZCBYTUwgdGFncyBhcyBwZXIgaHR0cDovL3ZhbGlkYXRvci53My5vcmdcblx0XHRcdCRzdmcgPSAkc3ZnLnJlbW92ZUF0dHIoJ3htbG5zOmEnKTtcblxuXHRcdFx0Ly8gUmVwbGFjZSBpbWFnZSB3aXRoIG5ldyBTVkdcblx0XHRcdCRpbWcucmVwbGFjZVdpdGgoJHN2Zyk7XG5cblx0XHR9LCAneG1sJyk7XG5cblx0fSk7XG5cbiAgICBcblxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiKGZ1bmN0aW9uKCQpIHtcblx0XG5cdCd1c2Ugc3RyaWN0JztcdFxuXHRcblx0XG4gICAgdmFyICRjb2x1bW4gPSAkKCcuc2VjdGlvbi1sZWFkZXJzaGlwIC5ncmlkIC5jb2x1bW4nKTtcbiAgICBcbiAgICAvL29wZW4gYW5kIGNsb3NlIGNvbHVtblxuICAgICRjb2x1bW4uZmluZCgnLmpzLWV4cGFuZGVyIC5vcGVuLCAuanMtZXhwYW5kZXIgLnRodW1ibmFpbCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgdmFyICR0aGlzQ29sdW1uID0gJCh0aGlzKS5jbG9zZXN0KCcuY29sdW1uJyk7XG4gICAgXG4gICAgICBpZiAoJHRoaXNDb2x1bW4uaGFzQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpKSB7XG4gICAgICAgIC8vIHNpYmxpbmdzIHJlbW92ZSBvcGVuIGNsYXNzIGFuZCBhZGQgY2xvc2VkIGNsYXNzZXNcbiAgICAgICAgJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICAgICAgLy8gcmVtb3ZlIGNsb3NlZCBjbGFzc2VzLCBhZGQgcGVuIGNsYXNzXG4gICAgICAgICR0aGlzQ29sdW1uLnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKS5hZGRDbGFzcygnaXMtZXhwYW5kZWQnKTtcbiAgICAgICAgXG4gICAgICAgIGlmICgkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikuaGFzQ2xhc3MoJ2lzLWluYWN0aXZlJykpIHtcbiAgICAgICAgICAvL2RvIG5vdGhpbmdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikuYWRkQ2xhc3MoJ2lzLWluYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgICAgaWYoIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KCd4bGFyZ2UnKSApIHtcbiAgICAgICAgICB2YXIgb2Zmc2V0ID0gLTEwMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJC5zbW9vdGhTY3JvbGwoe1xuICAgICAgICAgICAgc2Nyb2xsVGFyZ2V0OiAkdGhpc0NvbHVtbixcbiAgICAgICAgICAgIC8vb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgICAgICBiZWZvcmVTY3JvbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLmFkZENsYXNzKCduYXYtdXAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdGhpc0NvbHVtbi5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtaW5hY3RpdmUnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvL2Nsb3NlIGNhcmQgd2hlbiBjbGljayBvbiBjcm9zc1xuICAgICRjb2x1bW4uZmluZCgnLmpzLWNvbGxhcHNlcicpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgdmFyICR0aGlzQ29sdW1uID0gJCh0aGlzKS5wYXJlbnRzKCcuY29sdW1uX19leHBhbmRlcicpLmNsb3Nlc3QoJy5jb2x1bW4nKTtcbiAgICBcbiAgICAgICR0aGlzQ29sdW1uLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtaW5hY3RpdmUnKTtcbiAgICBcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG4gICAgXG4gICAgJCgnI2xvZ2luZm9ybSA6aW5wdXQsICNwYXNzd29yZGZvcm0gOmlucHV0JykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsYWJlbCA9ICQodGhpcykucGFyZW50KCkuZmluZCgnbGFiZWwnKS50ZXh0KCk7XG4gICAgICAgICQodGhpcykuYXR0ciggJ3BsYWNlaG9sZGVyJywgbGFiZWwgKTtcbiAgICB9KTtcbiAgICBcbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnBsYXktdmlkZW8nLCBwbGF5VmlkZW8pO1xuICAgIFxuICAgIGZ1bmN0aW9uIHBsYXlWaWRlbygpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIFN0b3AgYWxsIGJhY2tncm91bmQgdmlkZW9zXG4gICAgICAgIGlmKCAkKCcuYmFja2dyb3VuZC12aWRlbyB2aWRlbycpLnNpemUoKSApIHtcbiAgICAgICAgICAgICQoJy5iYWNrZ3JvdW5kLXZpZGVvIHZpZGVvJylbMF0ucGF1c2UoKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIFxuICAgICAgICB2YXIgdXJsID0gJHRoaXMuZGF0YSgnc3JjJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHZhciAkbW9kYWwgPSAkKCcjJyArICR0aGlzLmRhdGEoJ29wZW4nKSk7XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAkLmFqYXgodXJsKVxuICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgJG1vZGFsLmZpbmQoJy5mbGV4LXZpZGVvJykuaHRtbChyZXNwKS5mb3VuZGF0aW9uKCdvcGVuJyk7XG4gICAgICAgIH0pO1xuICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgdmFyICRpZnJhbWUgPSAkKCc8aWZyYW1lPicsIHtcbiAgICAgICAgICAgIHNyYzogdXJsLFxuICAgICAgICAgICAgaWQ6ICAndmlkZW8nLFxuICAgICAgICAgICAgZnJhbWVib3JkZXI6IDAsXG4gICAgICAgICAgICBzY3JvbGxpbmc6ICdubydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgJGlmcmFtZS5hcHBlbmRUbygnLnZpZGVvLXBsYWNlaG9sZGVyJywgJG1vZGFsICk7ICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLy8gTWFrZSBzdXJlIHZpZGVvcyBkb24ndCBwbGF5IGluIGJhY2tncm91bmRcbiAgICAkKGRvY3VtZW50KS5vbihcbiAgICAgICdjbG9zZWQuemYucmV2ZWFsJywgJyNtb2RhbC12aWRlbycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcudmlkZW8tcGxhY2Vob2xkZXInKS5odG1sKCcnKTtcbiAgICAgICAgaWYoICQoJy5iYWNrZ3JvdW5kLXZpZGVvIHZpZGVvJykuc2l6ZSgpICkge1xuICAgICAgICAgICAgJCgnLmJhY2tncm91bmQtdmlkZW8gdmlkZW8nKVswXS5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICB9XG4gICAgKTtcbiAgICAgICAgXG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblx0dmFyICRzdGlja3lIZWFkZXIgPSAkKFwiLnN0aWNreS1oZWFkZXIgLnNpdGUtaGVhZGVyXCIpO1xuXHR2YXIgJHN0aWNreU5hdiA9ICQoXCIuc3RpY2t5LW5hdlwiKTtcblx0dmFyICRib2R5ID0gJCgnYm9keScpO1xuXHR2YXIgJHdwQWRtaW5CYXIgPSAwO1xuXHR2YXIgaGVpZ2h0ID0gMDtcbiAgICBcblx0dmFyIHNob3dOb3RpZmljYXRpb25CYXIgPSBDb29raWVzLmdldCgnc2hvdy1ub3RpZmljYXRpb24tYmFyJyk7XG4gICAgICAgIFxuXHQkKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCl7XG5cblx0XHRjb25zb2xlLmxvZyhzaG93Tm90aWZpY2F0aW9uQmFyKTtcblx0XHRcblx0XHRpZiggJ25vJyA9PT0gc2hvd05vdGlmaWNhdGlvbkJhcikge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgJG5vdGlmaWNhdGlvbkJhciA9ICQoJy5zZWN0aW9uLW5vdGlmaWNhdGlvbi1iYXInKTsgICAgICAgIFxuXHRcdFxuXHRcdCRub3RpZmljYXRpb25CYXIucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcblx0XHRcblx0XHRoZWlnaHQgPSAkbm90aWZpY2F0aW9uQmFyLmFjdHVhbCgnaGVpZ2h0JykgKyAkd3BBZG1pbkJhcjtcblx0XHRcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ICBcblx0XHRcdGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCgneGxhcmdlJykpIHtcblx0XHRcdFx0JGJvZHkuY3NzKCAnbWFyZ2luLXRvcCcsIGhlaWdodCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JGJvZHkuY3NzKCAnbWFyZ2luLXRvcCcsICcwJyApO1xuXHRcdFx0XHQkYm9keS5yZW1vdmVBdHRyKCAnc3R5bGUnICk7XG5cdFx0XHR9IFxuXHRcdFx0XHRcdFx0XHRcblx0XHR9LCAzMDAwKTsgICAgIFxuXHRcblx0fSk7ICBcblx0XG5cdFxuXHQkKHdpbmRvdykub24oXCJyZXNpemVcIiwgZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcblx0XHR2YXIgJG5vdGlmaWNhdGlvbkJhciA9ICQoJy5zZWN0aW9uLW5vdGlmaWNhdGlvbi1iYXInKTsgIFxuXHRcdFx0XHRcdFxuXHRcdGhlaWdodCA9ICRub3RpZmljYXRpb25CYXIuaGVpZ2h0KCkgKyAkd3BBZG1pbkJhcjtcblx0XHRcblx0XHRpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoJ3hsYXJnZScpKSB7XG5cdFx0XHQkYm9keS5jc3MoICdtYXJnaW4tdG9wJywgaGVpZ2h0ICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRib2R5LnJlbW92ZUF0dHIoICdzdHlsZScgKTtcblx0XHR9ICAgICAgICAgICAgXG5cdFxuXHR9KTsgIFxuXHRcblx0XG5cdCQod2luZG93KS5vbihcInNjcm9sbFwiLCBmdW5jdGlvbigpe1xuXHRcdFxuXHRcdHZhciBoYXNOb3RpZmljYXRpb25CYXIgPSB0cnVlO1xuXHRcdHZhciAkbm90aWZpY2F0aW9uQmFyID0gJCgnLnNlY3Rpb24tbm90aWZpY2F0aW9uLWJhcicpO1xuXHRcdFxuXHRcdGlmKCAhICRub3RpZmljYXRpb25CYXIubGVuZ3RoICYmICRub3RpZmljYXRpb25CYXIubm90KFwiOnZpc2libGVcIikgKSB7XG5cdFx0XHQkYm9keS5yZW1vdmVBdHRyKCAnc3R5bGUnICk7XG5cdFx0XHQkc3RpY2t5SGVhZGVyLnJlbW92ZUF0dHIoICdzdHlsZScgKTtcblx0XHRcdCRzdGlja3lOYXYucmVtb3ZlQXR0ciggJ3N0eWxlJyApO1xuXHRcdFx0aGFzTm90aWZpY2F0aW9uQmFyID0gZmFsc2U7XG5cdFx0XHQvL3JldHVybjtcblx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFxuXHRcdGlmKCAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPj0gaGVpZ2h0ICl7XG5cdFx0XHQkc3RpY2t5SGVhZGVyLmFkZENsYXNzKFwiZml4ZWRcIik7XG5cdFx0XHQkc3RpY2t5TmF2LmFkZENsYXNzKFwiZml4ZWRcIik7XG5cdFx0XHQkYm9keS5yZW1vdmVBdHRyKCAnc3R5bGUnICk7XG5cdFx0XHQkbm90aWZpY2F0aW9uQmFyLmFkZENsYXNzKCdoaWRlJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRzdGlja3lIZWFkZXIucmVtb3ZlQ2xhc3MoXCJmaXhlZFwiKTtcblx0XHRcdCRzdGlja3lOYXYucmVtb3ZlQ2xhc3MoXCJmaXhlZFwiKTtcblx0XHRcdCRub3RpZmljYXRpb25CYXIucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcblx0XHRcdGlmIChoYXNOb3RpZmljYXRpb25CYXIgJiYgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoJ3hsYXJnZScpKSB7XG5cdFx0XHRcdCRib2R5LmNzcyggJ21hcmdpbi10b3AnLCBoZWlnaHQgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCRib2R5LnJlbW92ZUF0dHIoICdzdHlsZScgKTtcblx0XHRcdH0gXG5cdFx0fVxuXHR9KTtcblx0XG5cdCQoZG9jdW1lbnQpLm9uKCdjbG9zZS56Zi50cmlnZ2VyJywgJy5zZWN0aW9uLW5vdGlmaWNhdGlvbi1iYXJbZGF0YS1jbG9zYWJsZV0nLCBmdW5jdGlvbihlKSB7XG5cdFx0JGJvZHkuY3NzKCAnbWFyZ2luLXRvcCcsICdhdXRvJyApO1xuXHRcdCRib2R5LnJlbW92ZUF0dHIoICdzdHlsZScgKTtcblx0XHQkc3RpY2t5SGVhZGVyLnJlbW92ZUF0dHIoICdzdHlsZScgKTtcblx0XHQkc3RpY2t5TmF2LnJlbW92ZUF0dHIoICdzdHlsZScgKTtcblx0XHQkKCcuc2VjdGlvbi1ub3RpZmljYXRpb24tYmFyJykucmVtb3ZlKCk7XG5cdFx0Q29va2llcy5zZXQoJ3Nob3ctbm90aWZpY2F0aW9uLWJhcicsICdubycsIHsgZXhwaXJlczogMSB9KVxuXHR9KTtcblxuXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpOyIsIihmdW5jdGlvbigkKSB7XG5cdFxuXHQndXNlIHN0cmljdCc7XHRcblx0XG5cdFxuICAgIHZhciBnZXRMYXN0U2libGluZ0luUm93ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGNhbmRpZGF0ZSA9IGVsZW1lbnQsXG4gICAgICAgICAgICBlbGVtZW50VG9wID0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgICAgIFxuICAgICAgICAvLyBMb29wIHRocm91Z2ggdGhlIGVsZW1lbnTigJlzIG5leHQgc2libGluZ3MgYW5kIGxvb2sgZm9yIHRoZSBmaXJzdCBvbmUgd2hpY2hcbiAgICAgICAgLy8gaXMgcG9zaXRpb25lZCBmdXJ0aGVyIGRvd24gdGhlIHBhZ2UuXG4gICAgICAgIHdoaWxlIChjYW5kaWRhdGUubmV4dEVsZW1lbnRTaWJsaW5nICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY2FuZGlkYXRlLm5leHRFbGVtZW50U2libGluZy5vZmZzZXRUb3AgPiBlbGVtZW50VG9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbmRpZGF0ZSA9IGNhbmRpZGF0ZS5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICB9O1xuICAgIFxuICAgIHZhciAkZ3JpZCA9ICQoJy5zZWN0aW9uLWJ1c2luZXNzZXMgLmdyaWQnKTtcbiAgICB2YXIgJGNvbHVtbiA9ICQoJy5zZWN0aW9uLWJ1c2luZXNzZXMgLmdyaWQgPiAuY29sdW1uJyk7XG4gICAgXG4gICAgLy9vcGVuIGFuZCBjbG9zZSBjb2x1bW5cbiAgICAkY29sdW1uLmZpbmQoJy5qcy1leHBhbmRlciAub3BlbiwgLmpzLWV4cGFuZGVyIC50aHVtYm5haWwnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcbiAgICAgICAgdmFyICR0aGlzQ29sdW1uID0gJCh0aGlzKS5jbG9zZXN0KCcuY29sdW1uJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBHZXQgbGFzdCBzaWJsaW5nIGluIHJvd1xuICAgICAgICB2YXIgbGFzdCA9IGdldExhc3RTaWJsaW5nSW5Sb3coJHRoaXNDb2x1bW5bMF0pO1xuICAgICAgICBcbiAgICAgICAgJCgnLmRldGFpbHMnKS5yZW1vdmUoKTtcbiAgICAgICAgXG4gICAgICAgIC8vY29uc29sZS5sb2coJChsYXN0KS5pbmRleCgpKTtcbiAgICAgICAgJHRoaXNDb2x1bW4uZmluZCgnLmNvbHVtbl9fZXhwYW5kZXInKVxuICAgICAgICAgICAgLmNsb25lKClcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZScpXG4gICAgICAgICAgICAud3JhcCgnPGRpdiBjbGFzcz1cImRldGFpbHNcIiAvPicpLnBhcmVudCgpXG4gICAgICAgICAgICAuaW5zZXJ0QWZ0ZXIoJChsYXN0KSk7XG4gICAgICBcbiAgICBcbiAgICAgICAgaWYgKCR0aGlzQ29sdW1uLmhhc0NsYXNzKCdpcy1jb2xsYXBzZWQnKSkge1xuICAgICAgICAvLyBzaWJsaW5ncyByZW1vdmUgb3BlbiBjbGFzcyBhbmQgYWRkIGNsb3NlZCBjbGFzc2VzXG4gICAgICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCBpcy1pbmFjdGl2ZScpO1xuICAgICAgICAgICAgLy8gcmVtb3ZlIGNsb3NlZCBjbGFzc2VzLCBhZGQgcGVuIGNsYXNzXG4gICAgICAgICAgICAkdGhpc0NvbHVtbi5yZW1vdmVDbGFzcygnaXMtY29sbGFwc2VkIGlzLWluYWN0aXZlJykuYWRkQ2xhc3MoJ2lzLWV4cGFuZGVkJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLmhhc0NsYXNzKCdpcy1pbmFjdGl2ZScpKSB7XG4gICAgICAgICAgLy9kbyBub3RoaW5nXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLmFkZENsYXNzKCdpcy1pbmFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdmFyIG9mZnNldCA9IDA7XG4gICAgICAgIGlmKCBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCgneGxhcmdlJykgKSB7XG4gICAgICAgICAgdmFyIG9mZnNldCA9IC0xMDA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgIHNjcm9sbFRhcmdldDogJHRoaXNDb2x1bW4sXG4gICAgICAgICAgICAvL29mZnNldDogb2Zmc2V0LFxuICAgICAgICAgICAgYmVmb3JlU2Nyb2xsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5hZGRDbGFzcygnbmF2LXVwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHRoaXNDb2x1bW4ucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xuICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikucmVtb3ZlQ2xhc3MoJ2lzLWluYWN0aXZlJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgLy9jbG9zZSBjYXJkIHdoZW4gY2xpY2sgb24gY3Jvc3NcbiAgICAkZ3JpZC5vbignY2xpY2snLCcuY2xvc2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICRncmlkLmZpbmQoJy5kZXRhaWxzJykucmVtb3ZlKCk7XG4gICAgICAkY29sdW1uLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICB9KTtcbiAgICBcbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAkZ3JpZC5maW5kKCcuZGV0YWlscycpLnJlbW92ZSgpO1xuICAgICAgICAkY29sdW1uLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgJGZpbHRlckJ1dHRvbnMgPSAkKCcuZmFxLWZpbHRlci1idXR0b24nKTtcblxuICAgICQoJy5mYXEtZmlsdGVyLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyVmFsdWUgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtZmlsdGVyJyk7XG5cbiAgICAgICAgdmFyICRhbGxGYXFzID0gJCgnLmZhcScpO1xuXG4gICAgICAgIHZhciAkbmV3QWN0aXZlRmFxcyA9ICcnO1xuICAgICAgICB2YXIgJG5ld0RlYWN0aXZhdGVkRmFxcyA9ICcnO1xuICAgICAgICBpZihmaWx0ZXJWYWx1ZSA9PSAnKicpIHtcbiAgICAgICAgICAgICRuZXdBY3RpdmVGYXFzID0gJCgnLmZhcScpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgJG5ld0FjdGl2ZUZhcXMgPSAkKGZpbHRlclZhbHVlKTtcbiAgICAgICAgICAgICRuZXdEZWFjdGl2YXRlZEZhcXMgPSAkKCcuZmFxJykubm90KGZpbHRlclZhbHVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRuZXdEZWFjdGl2YXRlZEZhcXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsb3NlIG9wZW4gYWNjb3JkaW9uc1xuICAgICAgICAgKiAgLSBpZiBuZXcgZmlsdGVyIGRvZXNuJ3QgaGF2ZSB0aGVtXG4gICAgICAgICAqL1xuICAgICAgICBpZigkbmV3RGVhY3RpdmF0ZWRGYXFzKSB7XG4gICAgICAgICAgICAkbmV3RGVhY3RpdmF0ZWRGYXFzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZmluZCgnLmFjY29yZGlvbi10aXRsZScpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkYWxsRmFxcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5oaWRlKCk7XG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdmYXEtaGlkZGVuJyk7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdmYXEtc2hvd24nKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRuZXdBY3RpdmVGYXFzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnNob3coKTtcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2ZhcS1zaG93bicpO1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZmFxLWhpZGRlbicpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkZmlsdGVyQnV0dG9ucy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgIH0pO1xuXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyICRodG1sID0gJCgnaHRtbCcpO1xuICAgIGNvbnN0ICRvbl9wYWdlX2xpbmtzID0gJCgnI29uLXBhZ2UtbGlua3MnKTtcbiAgICBjb25zdCAkbGlua3NfY29udGFpbmVyICA9ICQoJy5vbi1wYWdlLWxpbmtzLWNvbnRhaW5lcicpO1xuICAgIGNvbnN0ICRtZW51X2J1dHRvbiAgPSAkKCcub24tcGFnZS1tb2JpbGUtbmF2LXRvZ2dsZScpO1xuICAgIHZhciAkbWVudV93aWR0aCA9ICQoJy5vbi1wYWdlLWxpbmtzLWxpc3QnKS53aWR0aCgpO1xuXG4gICAgJG9uX3BhZ2VfbGlua3MuYWRkQ2xhc3MoJ2luaXQnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCdpbml0IG1vYmlsZSBuYXYnKTtcblxuICAgIC8vIGNoZWNrIGlmIGl0IHNob3VsZCBmb3JjZSB0byBoYW1idXJnZXJcbiAgICBmdW5jdGlvbiBvbl9wYWdlX2xpbmtzX21vYmlsZV9kaXNwbGF5KCkge1xuICAgICAgICB2YXIgJGxpbmtzX2NvbnRhaW5lcl93aWR0aCA9ICRsaW5rc19jb250YWluZXIud2lkdGgoKTtcbiAgICAgICAgLy8gdmFyICRtZW51X3dpZHRoICAgPSAkKCcub24tcGFnZS1saW5rcy1saXN0Jykud2lkdGgoKTtcblxuICAgICAgICB2YXIgJGl0ZW1zX3dpZHRoICA9ICRtZW51X3dpZHRoICsgNDA7XG4gICAgICAgIHZhciAkZGlzcGxheV9tZW51ID0gJGl0ZW1zX3dpZHRoID49ICRsaW5rc19jb250YWluZXJfd2lkdGg7XG5cbiAgICAgICAgcmV0dXJuICRkaXNwbGF5X21lbnU7XG4gICAgfVxuXG4gICAgLy8gYWRkcy9yZW1vdmVzIGNsYXNzZXMgYmFzZWQgb24gc2NyZWVuIHdpZHRoXG4gICAgZnVuY3Rpb24gb25fcGFnZV9saW5rc19tb2JpbGVfY2xhc3NlcygpIHtcblxuICAgICAgICB2YXIgJGRpc3BsYXlfbWVudSA9IG9uX3BhZ2VfbGlua3NfbW9iaWxlX2Rpc3BsYXkoKTtcblxuICAgICAgICBpZighJGRpc3BsYXlfbWVudSkge1xuICAgICAgICAgICAgJG9uX3BhZ2VfbGlua3MucmVtb3ZlQ2xhc3MoJ29uLXBhZ2UtbW9iaWxlLW5hdi1hY3RpdmUnKTtcbiAgICAgICAgICAgICRvbl9wYWdlX2xpbmtzLnJlbW92ZUNsYXNzKCdvbi1wYWdlLW1vYmlsZS1uYXYtZGlzcGxheScpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2JlZ29uZSBjbGFzc2VzJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoISRvbl9wYWdlX2xpbmtzLmhhc0NsYXNzKCdvbi1wYWdlLW1vYmlsZS1uYXYtZGlzcGxheScpKSB7XG4gICAgICAgICAgICAkb25fcGFnZV9saW5rcy5hZGRDbGFzcygnb24tcGFnZS1tb2JpbGUtbmF2LWRpc3BsYXknKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyaWdodF9zaXplX2Zvcl9tb2JpbGVfbmF2Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb2JpbGVOYXZfYWN0aXZhdGUoKSB7XG4gICAgICAgICRvbl9wYWdlX2xpbmtzLmFkZENsYXNzKCdvbi1wYWdlLW1vYmlsZS1uYXYtYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW9iaWxlTmF2X2RlYWN0aXZhdGUoKSB7XG4gICAgICAgICRvbl9wYWdlX2xpbmtzLnJlbW92ZUNsYXNzKCdvbi1wYWdlLW1vYmlsZS1uYXYtYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW9iaWxlTmF2X3RvZ2dsZSgpIHtcblxuICAgICAgICBpZigkb25fcGFnZV9saW5rcy5oYXNDbGFzcygnb24tcGFnZS1tb2JpbGUtbmF2LWFjdGl2ZScpKSB7XG4gICAgICAgICAgICBtb2JpbGVOYXZfZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgJG1lbnVfYnV0dG9uLmh0bWwoJ01lbnUnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG1vYmlsZU5hdl9hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgJG1lbnVfYnV0dG9uLmh0bWwoJ0Nsb3NlJyk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgLy8gYWRkIHByb3BlciBjbGFzcyBvbiBkb2N1bWVudCBsb2FkXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIG9uX3BhZ2VfbGlua3NfbW9iaWxlX2NsYXNzZXMoKTtcbiAgICB9KTtcblxuICAgIC8vIGRvIGl0IGFnYWluIHdoZW4gKmV2ZXJ5dGhpbmcqIGlzIGxvYWRlZFxuICAgICQod2luZG93KS5iaW5kKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIG9uX3BhZ2VfbGlua3NfbW9iaWxlX2NsYXNzZXMoKTtcbiAgICB9KTtcblxuICAgIC8vIGFkanVzdCBkaXNwbGF5IGNsYXNzZXMgb24gcmVzaXplXG4gICAgLy8gU0hPVUxEIFRIUk9UVExFIFRISVMgVEhJTkdcbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuXG4gICAgfSk7XG5cblxuICAgIC8qIE9uIHJlc2l6ZSAodGhyb3R0bGVkKSAqL1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvbl9wYWdlX2xpbmtzX3Jlc2l6ZXIsIGZhbHNlKTtcblxuICAgIHZhciB0aW1lciA9IG51bGw7XG4gICAgZnVuY3Rpb24gb25fcGFnZV9saW5rc19yZXNpemVyKCkge1xuXG4gICAgICAgIHRpbWVyID0gdGltZXIgfHwgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgIG9uX3BhZ2VfbGlua3NfbW9iaWxlX2NsYXNzZXMoKTtcbiAgICAgICAgfSwgNTApO1xuICAgIH1cblxuXG5cbiAgICAvLyBvbiBjbGlja2luZyAub24tcGFnZS1tb2JpbGUtbmF2LW9wZW5cbiAgICAvKipcbiAgICAgKiBXb29Db21tZXJjZSB3YXMgZ2l2aW5nIG1lIGlzc3VlcyB3aXRoIGRvdWJsZWNsaWNraW5nXG4gICAgICogICAtIEhhZCB0byBhZGQgYSBjbGFzcyB0byBib2R5IHRvIGNhbmNlbCBvdXQgYSBkb3VibGUtY2xpY2tlZCB0aGluZ1xuICAgICAqL1xuICAgICRtZW51X2J1dHRvbi5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBtb2JpbGVOYXZfdG9nZ2xlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBpZiBvcGVuLCBjbG9zZSBvbiBwcmVzc2luZyBlc2NhcGUga2V5XG4gICAgLy8gJChkb2N1bWVudCkub24oJ2tleWRvd24nLGZ1bmN0aW9uKGUpIHtcbiAgICAvLyAgICAgaWYgKGUua2V5Q29kZSA9PT0gMjcgJiYgJCgnaHRtbCcpLmhhc0NsYXNzKCdvbi1wYWdlLW1vYmlsZS1uYXYtYWN0aXZlJykpIHsgLy8gRVNDXG4gICAgLy8gICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ29uLXBhZ2UtbW9iaWxlLW5hdi1hY3RpdmUnKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH0pO1xuXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgJHJlc291cmNlc19hY2NvcmRpb25fbGlua3MgPSAkKCcucmVzb3VyY2VzLWFjY29yZGlvbi10aXRsZScpO1xuICAgIGNvbnN0ICR0cmlnZ2VyX3dpZHRoID0gNTUwO1xuICAgIHZhciAkd2luZG93X3dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG5cbiAgICBmdW5jdGlvbiByZXNvdXJjZXNBY2NvcmRpb25zSW5pdENsb3NlKCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCd3aW5kb3c6ICcgKyAkd2luZG93X3dpZHRoICsgJywgdHJpZ2dlcjogJyArICR0cmlnZ2VyX3dpZHRoKTtcblxuICAgICAgICB2YXIgJGlzX21vYmlsZSA9IGZhbHNlO1xuICAgICAgICBpZigkd2luZG93X3dpZHRoIDwgJHRyaWdnZXJfd2lkdGgpIHtcbiAgICAgICAgICAgICRpc19tb2JpbGUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgJHJlc291cmNlc19hY2NvcmRpb25fbGlua3MuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICBpZigkaXNfbW9iaWxlICYmICR0aGlzLnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgICAgICAgICAgICR0aGlzLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc291cmNlc0FjY29yZGlvblJlc2l6ZUNsb3NlKCkge1xuXG4gICAgICAgICR3aW5kb3dfd2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3dpbmRvdzogJyArICR3aW5kb3dfd2lkdGggKyAnLCB0cmlnZ2VyOiAnICsgJHRyaWdnZXJfd2lkdGgpO1xuXG4gICAgICAgIHZhciAkaXNfbW9iaWxlID0gZmFsc2U7XG4gICAgICAgIGlmKCR3aW5kb3dfd2lkdGggPCAkdHJpZ2dlcl93aWR0aCkge1xuICAgICAgICAgICAgJGlzX21vYmlsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAkcmVzb3VyY2VzX2FjY29yZGlvbl9saW5rcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgIGlmKCEkaXNfbW9iaWxlICYmICEkdGhpcy5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAkdGhpcy50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBhZGQgcHJvcGVyIGNsYXNzIG9uIGRvY3VtZW50IGxvYWRcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb3VyY2VzQWNjb3JkaW9uc0luaXRDbG9zZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gZG8gaXQgYWdhaW4gd2hlbiAqZXZlcnl0aGluZyogaXMgbG9hZGVkXG4gICAgJCh3aW5kb3cpLmJpbmQoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb3VyY2VzQWNjb3JkaW9uc0luaXRDbG9zZSgpO1xuICAgIH0pO1xuXG4gICAgLyogT24gcmVzaXplICh0aHJvdHRsZWQpICovXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc291cmNlc0FjY29yZGlvbnNSZXNpemVyLCBmYWxzZSk7XG5cbiAgICB2YXIgdGltZXIgPSBudWxsO1xuICAgIGZ1bmN0aW9uIHJlc291cmNlc0FjY29yZGlvbnNSZXNpemVyKCkge1xuXG4gICAgICAgIHRpbWVyID0gdGltZXIgfHwgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgIHJlc291cmNlc0FjY29yZGlvblJlc2l6ZUNsb3NlKCk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxuXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogUGFnZWJ1aWxkZXIgSW1hZ2UgTGlicmFyeVxuICAgICAqL1xuICAgIGxldCAkcGFnZWJ1aWxkZXJfaW1hZ2VfbGlicmFyeSA9IGpRdWVyeSgnLnBhZ2VidWlsZGVyLXNlY3Rpb24taW1hZ2UtbGlicmFyeScpO1xuICAgIGlmKCRwYWdlYnVpbGRlcl9pbWFnZV9saWJyYXJ5KSB7XG4gICAgICAkcGFnZWJ1aWxkZXJfaW1hZ2VfbGlicmFyeS5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciAkdGhpcyA9IGpRdWVyeSh0aGlzKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IHVwIHRoZSBzbGlkZXIgc3R1ZmZcbiAgICAgICAgICovXG4gICAgICAgIHZhciAkYXV0b3BsYXkgPSBmYWxzZTtcbiAgICAgICAgdmFyICRhdXRvcGxheVNwZWVkID0gNjAwMDtcbiAgICAgICAgaWYoJHRoaXMuYXR0cignZGF0YS1hdXRvcGxheScpKSB7XG4gICAgICAgICAgJGF1dG9wbGF5ID0gdHJ1ZTtcbiAgICAgICAgICBpZigkdGhpcy5hdHRyKCdkYXRhLWF1dG9wbGF5LXNwZWVkJykpIHtcbiAgICAgICAgICAgICRhdXRvcGxheVNwZWVkID0gJHRoaXMuYXR0cignZGF0YS1hdXRvcGxheS1zcGVlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoICQoJy5zbGljaycsICR0aGlzKS5sZW5ndGggKSB7XG5cbiAgICAgICAgICAkdGhpcy5maW5kKCcuc2xpY2snKS5zbGljayh7XG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGxhenlMb2FkOiAnb25kZW1hbmQnLFxuICAgICAgICAgICAgYXV0b3BsYXk6ICRhdXRvcGxheSxcbiAgICAgICAgICAgIGF1dG9wbGF5U3BlZWQ6ICRhdXRvcGxheVNwZWVkLFxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzLFxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxuICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzBweCcsXG4gICAgICAgICAgICBwcmV2QXJyb3c6ICR0aGlzLmZpbmQoJy5zbGljay1wcmV2JyksXG4gICAgICAgICAgICBuZXh0QXJyb3c6ICR0aGlzLmZpbmQoJy5zbGljay1uZXh0JyksXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBTZXQgdGhlIGhlaWdodHMgb2YgYWxsIHRoZSBjYXB0aW9uc1xuICAgICAgICAgICAqL1xuICAgICAgICAgIHZhciAkY2FwdGlvbnMgPSAkdGhpcy5maW5kKCcuaW1hZ2UtY2FwdGlvbicpO1xuICAgICAgICAgIGlmKCRjYXB0aW9ucykge1xuICAgICAgICAgICAgJGNhcHRpb25zLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciAkY2FwdGlvbiA9ICQodGhpcyk7XG4gICAgICAgICAgICAgIHZhciAkY2FwdGlvbkhlaWdodCA9ICRjYXB0aW9uLmhlaWdodCgpO1xuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygkY2FwdGlvbkhlaWdodCk7XG4gICAgICAgICAgICAgICRjYXB0aW9uLmNzcygnbWFyZ2luLWJvdHRvbScsKCRjYXB0aW9uSGVpZ2h0ICogLTEpICsgJ3B4Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvKiBPbiByZXNpemUgKHRocm90dGxlZCkgKi9cbiAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaW1hZ2VMaWJyYXJ5Q2FwdGlvblJlc2l6ZXIsIGZhbHNlKTtcblxuICAgICAgICAgIHZhciB0aW1lciA9IG51bGw7XG4gICAgICAgICAgZnVuY3Rpb24gaW1hZ2VMaWJyYXJ5Q2FwdGlvblJlc2l6ZXIoKSB7XG4gICAgICAgICAgICB0aW1lciA9IHRpbWVyIHx8IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmKCRjYXB0aW9ucykge1xuICAgICAgICAgICAgICAgICAgJGNhcHRpb25zLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciAkY2FwdGlvbiA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciAkY2FwdGlvbkhlaWdodCA9ICRjYXB0aW9uLmhlaWdodCgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkY2FwdGlvbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICRjYXB0aW9uLmNzcygnbWFyZ2luLWJvdHRvbScsKCRjYXB0aW9uSGVpZ2h0ICogLTEpICsgJ3B4Jyk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJHRoaXMuaW1hZ2VzTG9hZGVkKClcbiAgICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBqUXVlcnkodGhpcykubGlnaHRHYWxsZXJ5KHtcbiAgICAgICAgICBzZWxlY3RvcjogJy5zbGljay1zbGlkZTpub3QoLnNsaWNrLWNsb25lZCkgLmltYWdlLW1vZGFsLWxpbmsnLFxuICAgICAgICAgIHRodW1ibmFpbDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFnZWJ1aWxkZXIgRnVsbC13aWR0aCBpbWFnZSBjYXJvdXNlbFxuICAgICAqL1xuICAgIGxldCAkcGFnZWJ1aWxkZXJfZnVsbF93aWR0aF9pbWFnZV9jYXJvdXNlbCA9ICQoJy5wYWdlYnVpbGRlci1zZWN0aW9uLWZ1bGwtd2lkdGgtaW1hZ2UtY2Fyb3VzZWwnKTtcbiAgICBpZigkcGFnZWJ1aWxkZXJfZnVsbF93aWR0aF9pbWFnZV9jYXJvdXNlbCkge1xuICAgICAgJHBhZ2VidWlsZGVyX2Z1bGxfd2lkdGhfaW1hZ2VfY2Fyb3VzZWwuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgdmFyICRhdXRvcGxheSA9IGZhbHNlO1xuICAgICAgICB2YXIgJGF1dG9wbGF5U3BlZWQgPSA2MDAwO1xuICAgICAgICBpZigkdGhpcy5hdHRyKCdkYXRhLWF1dG9wbGF5JykpIHtcbiAgICAgICAgICAkYXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICAgIGlmKCR0aGlzLmF0dHIoJ2RhdGEtYXV0b3BsYXktc3BlZWQnKSkge1xuICAgICAgICAgICAgJGF1dG9wbGF5U3BlZWQgPSAkdGhpcy5hdHRyKCdkYXRhLWF1dG9wbGF5LXNwZWVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdhdXRvcGxheSBzdGF0dXM6ICcgKyAkYXV0b3BsYXkgKyAnLCBhdXRvcGxheSBzcGVlZDogJyArICRhdXRvcGxheVNwZWVkKTtcbiAgICAgICAgaWYgKCAkKCcuc2xpY2snLCAkdGhpcykubGVuZ3RoICkge1xuXG4gICAgICAgICAgJHRoaXMuZmluZCgnLnNsaWNrJykuc2xpY2soe1xuICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICBhcnJvd3M6IHRydWUsXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgICAgICBhdXRvcGxheTogJGF1dG9wbGF5LFxuICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogJGF1dG9wbGF5U3BlZWQsXG4gICAgICAgICAgICBsYXp5TG9hZDogJ29uZGVtYW5kJyxcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgcHJldkFycm93OiAkdGhpcy5maW5kKCcuc2xpY2stcHJldicpLFxuICAgICAgICAgICAgbmV4dEFycm93OiAkdGhpcy5maW5kKCcuc2xpY2stbmV4dCcpLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgJHRoaXMuaW1hZ2VzTG9hZGVkKClcbiAgICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFnZWJ1aWxkZXIgc3RlcHNcbiAgICAgKi9cbiAgICBsZXQgJHBhZ2VidWlsZGVyX3N0ZXBzID0gJCgnLnBhZ2VidWlsZGVyLXNlY3Rpb24tc3RlcHMnKTtcbiAgICBpZigkcGFnZWJ1aWxkZXJfc3RlcHMpIHtcbiAgICAgICRwYWdlYnVpbGRlcl9zdGVwcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgJGF1dG9wbGF5ID0gZmFsc2U7XG4gICAgICAgIHZhciAkYXV0b3BsYXlTcGVlZCA9IDYwMDA7XG4gICAgICAgIGlmKCR0aGlzLmF0dHIoJ2RhdGEtYXV0b3BsYXknKSkge1xuICAgICAgICAgICRhdXRvcGxheSA9IHRydWU7XG4gICAgICAgICAgaWYoJHRoaXMuYXR0cignZGF0YS1hdXRvcGxheS1zcGVlZCcpKSB7XG4gICAgICAgICAgICAkYXV0b3BsYXlTcGVlZCA9ICR0aGlzLmF0dHIoJ2RhdGEtYXV0b3BsYXktc3BlZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAkKCcuc2xpY2snLCAkdGhpcykubGVuZ3RoICkge1xuXG4gICAgICAgICAgJHRoaXMuZmluZCgnLnNsaWNrJykuc2xpY2soe1xuICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICBhcnJvd3M6IHRydWUsXG4gICAgICAgICAgICBpbmZpbml0ZTogZmFsc2UsXG4gICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgYXV0b3BsYXk6ICRhdXRvcGxheSxcbiAgICAgICAgICAgIGF1dG9wbGF5U3BlZWQ6ICRhdXRvcGxheVNwZWVkLFxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA0LFxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICBwcmV2QXJyb3c6ICR0aGlzLmZpbmQoJy5zbGljay1wcmV2JyksXG4gICAgICAgICAgICBuZXh0QXJyb3c6ICR0aGlzLmZpbmQoJy5zbGljay1uZXh0JyksXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBicmVha3BvaW50OiAxMDI0LFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYnJlYWtwb2ludDogNzUwLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDIsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYnJlYWtwb2ludDogNTUwLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuICAgIFxuICAgICQoJy5wYWdlLXRlbXBsYXRlLXJlZ2lvbnMgI21hcC1ib3ggaW1nJykub24oICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIG9mZnNldCA9ICQodGhpcykub2Zmc2V0KCk7XG4gICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcigoZS5wYWdlWCAtIG9mZnNldC5sZWZ0KSAvICQodGhpcykud2lkdGgoKSAqIDEwMDAwKS8xMDA7XG4gICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcigoZS5wYWdlWSAtIG9mZnNldC50b3ApIC8gJCh0aGlzKS5oZWlnaHQoKSAqIDEwMDAwKS8xMDA7XG4gICAgICAgIFxuICAgICAgICAkKCcjbW91c2UteHknKS52YWwoIHggKyAnLycgKyB5ICk7ICAgICBcbiAgICB9KTtcbiAgICBcbiAgICAkKCBcIi5tYXAta2V5IGJ1dHRvblwiICkuaG92ZXIoXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnI21hcC1ib3ggYnV0dG9uJykucmVtb3ZlQ2xhc3MoIFwiaG92ZXJcIiApO1xuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcmtlcicpO1xuICAgICAgICAkKGlkKS5hZGRDbGFzcygnaG92ZXInKTtcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcjbWFwLWJveCBidXR0b24nKS5yZW1vdmVDbGFzcyggXCJob3ZlclwiICk7XG4gICAgICB9XG4gICAgKTtcbiAgICBcbiAgICAkKCcucGFnZS10ZW1wbGF0ZS1yZWdpb25zICNtYXAtYm94IGJ1dHRvbicpLm9uKCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIC8vJCh0aGlzKS5hZGRDbGFzcygnaG92ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICBcbiAgICAkKCcucGFnZS10ZW1wbGF0ZS1yZWdpb25zIC5tYXAta2V5IGJ1dHRvbicpLm9uKCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnbWFya2VyJyk7XG4gICAgICAgIC8vJChpZCkuYWRkQ2xhc3MoJ2hvdmVyJyk7XG4gICAgfSk7XG4gICAgXG4gICAgXG4gICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJy5wYWdlLXRlbXBsYXRlLXJlZ2lvbnMgI21hcC1ib3ggLmxvY2F0aW9ucycpLmNzcygnb3BhY2l0eScsIDEpO1xuICAgIH0pO1xuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuXG5cbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvLyBSZXNwb25zaXZlIHZpZGVvIGVtYmVkc1xuXHR2YXIgJGFsbF9vZW1iZWRfdmlkZW9zID0gJChcImlmcmFtZVtzcmMqPSd5b3V0dWJlJ10sIGlmcmFtZVtzcmMqPSd2aW1lbyddXCIpO1xuXG5cdCRhbGxfb2VtYmVkX3ZpZGVvcy5lYWNoKGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIF90aGlzID0gJCh0aGlzKTtcblxuXHRcdGlmIChfdGhpcy5wYXJlbnQoJy5lbWJlZC1jb250YWluZXInKS5sZW5ndGggPT09IDApIHtcblx0XHQgIF90aGlzLndyYXAoJzxkaXYgY2xhc3M9XCJlbWJlZC1jb250YWluZXJcIj48L2Rpdj4nKTtcblx0XHR9XG5cblx0XHRfdGhpcy5yZW1vdmVBdHRyKCdoZWlnaHQnKS5yZW1vdmVBdHRyKCd3aWR0aCcpO1xuXG4gXHR9KTtcbiAgICBcblxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiLy8gUmV2ZWFsXG4oZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5wYWdlLXRlbXBsYXRlLXJlZ2lvbnMgYnV0dG9uW2RhdGEtcmVnaW9uXScsIGxvYWRSZWdpb24pO1xuICAgIFxuICAgIGZ1bmN0aW9uIGxvYWRSZWdpb24oKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkcmVnaW9uID0gJCgnIycgKyAkdGhpcy5kYXRhKCdyZWdpb24nKSApO1xuICAgICAgICB2YXIgJG1vZGFsID0gJCgnIycgKyAkdGhpcy5kYXRhKCdvcGVuJykpO1xuICAgICAgICBcbiAgICAgICAgaWYoICRyZWdpb24uc2l6ZSgpICkge1xuICAgICAgICAgICQoJy5jb250YWluZXInLCAkbW9kYWwgKS5odG1sKCRyZWdpb24uaHRtbCgpKTsgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xvc2VkLnpmLnJldmVhbCcsICcjcmVnaW9ucycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcuY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgLy8gcmVtb3ZlIGFjdGlvbiBidXR0b24gY2xhc3NcbiAgICAgICAgJCgnI21hcC1ib3ggYnV0dG9uJykucmVtb3ZlQ2xhc3MoIFwiaG92ZXJcIiApO1xuICAgIH0pO1xuICAgIFxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcudGVtcGxhdGUtYnVzaW5lc3MtbGluZXMgYnV0dG9uW2RhdGEtY29udGVudF0nLCBsb2FkTWFwKTtcbiAgICBcbiAgICBmdW5jdGlvbiBsb2FkTWFwKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgJG1hcCA9ICQoJyMnICsgJHRoaXMuZGF0YSgnY29udGVudCcpICk7XG4gICAgICAgIHZhciAkbW9kYWwgPSAkKCcjJyArICR0aGlzLmRhdGEoJ29wZW4nKSk7XG4gICAgICAgIFxuICAgICAgICBpZiggJG1hcC5zaXplKCkgKSB7XG4gICAgICAgICAgJCgnLmNvbnRhaW5lcicsICRtb2RhbCApLmh0bWwoJG1hcC5odG1sKCkpOyBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbG9zZWQuemYucmV2ZWFsJywgJyNtYXBzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5jc3MoeydvcGFjaXR5JzonMCd9KTtcbiAgICAgICAgJCgnI21hcC0wJykuc3RvcCgpLmNzcyh7J29wYWNpdHknOicxJ30pO1xuICAgIH0pO1xuICAgIFxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcudGVtcGxhdGUtcG9ydGZvbGlvLWxhbmQtcmVzb3VyY2VzIGJ1dHRvbltkYXRhLXByb2plY3RdJywgbG9hZFByb2plY3QpO1xuICAgIFxuICAgIGZ1bmN0aW9uIGxvYWRQcm9qZWN0KCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgJHByb2plY3QgPSAkKCcjJyArICR0aGlzLmRhdGEoJ3Byb2plY3QnKSApO1xuICAgICAgICB2YXIgJG1vZGFsID0gJCgnIycgKyAkdGhpcy5kYXRhKCdvcGVuJykpO1xuICAgICAgICBcbiAgICAgICAgaWYoICRwcm9qZWN0LnNpemUoKSApIHtcbiAgICAgICAgICAkKCcuY29udGFpbmVyJywgJG1vZGFsICkuaHRtbCgkcHJvamVjdC5odG1sKCkpOyBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbG9zZWQuemYucmV2ZWFsJywgJyNwcm9qZWN0cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcuY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICB9KTtcbiAgICAgICAgXG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG5cblxuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdCQoZG9jdW1lbnQpLm9uKFxuICAgICAgJ29wZW4uemYucmV2ZWFsJywgJyNtb2RhbC1zZWFyY2gnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykuZmluZChcImlucHV0XCIpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgIH1cbiAgICApO1xuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG4gICAgXG4gICAgZnVuY3Rpb24gaGlkZV9oZWFkZXJfbWVudSggbWVudSApIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBtYWluTWVudUJ1dHRvbkNsYXNzID0gJ21lbnUtdG9nZ2xlJyxcblx0XHRyZXNwb25zaXZlTWVudUNsYXNzID0gJ2dlbmVzaXMtcmVzcG9uc2l2ZS1tZW51JztcbiAgICAgICAgXG4gICAgICAgICQoIG1lbnUgKyAnIC4nICsgbWFpbk1lbnVCdXR0b25DbGFzcyArICcsJyArIG1lbnUgKyAnIC4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLnN1Yi1tZW51LXRvZ2dsZScgKVxuXHRcdFx0LnJlbW92ZUNsYXNzKCAnYWN0aXZhdGVkJyApXG5cdFx0XHQuYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSApXG5cdFx0XHQuYXR0ciggJ2FyaWEtcHJlc3NlZCcsIGZhbHNlICk7XG5cblx0XHQkKCBtZW51ICsgJyAuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnLCcgKyBtZW51ICsgJyAuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnIC5zdWItbWVudScgKVxuXHRcdFx0LmF0dHIoICdzdHlsZScsICcnICk7XG4gICAgfVxuICAgIFxuICAgIHZhciBzY3JvbGxub3cgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgdGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIC8vIGlmIHNjcm9sbG5vdygpLWZ1bmN0aW9uIHdhcyB0cmlnZ2VyZWQgYnkgYW4gZXZlbnRcbiAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRhcmdldCA9IHRoaXMuaGFzaDtcbiAgICAgICAgfVxuICAgICAgICAvLyBlbHNlIGl0IHdhcyBjYWxsZWQgd2hlbiBwYWdlIHdpdGggYSAjaGFzaCB3YXMgbG9hZGVkXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0ID0gbG9jYXRpb24uaGFzaDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNhbWUgcGFnZSBzY3JvbGxcbiAgICAgICAgJC5zbW9vdGhTY3JvbGwoe1xuICAgICAgICAgICAgc2Nyb2xsVGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgICBiZWZvcmVTY3JvbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLnJlbW92ZUNsYXNzKCdmaXhlZCBzaHJpbmsgbmF2LWRvd24nKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZnRlclNjcm9sbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCgnLnNpdGUtaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2ZpeGVkIHNocmluayBuYXYtZG93bicpO1xuICAgICAgICAgICAgICAgIGlmKCQodGFyZ2V0KS5oYXNDbGFzcygndHlwZS1wZW9wbGUnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0YXJnZXQpLmZpbmQoJy5oZWFkZXInKS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gaWYgcGFnZSBoYXMgYSAjaGFzaFxuICAgIGlmIChsb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5zY3JvbGxUb3AoMCkuc2hvdygpO1xuICAgICAgICAvLyBzbW9vdGgtc2Nyb2xsIHRvIGhhc2hcbiAgICAgICAgc2Nyb2xsbm93KCk7XG4gICAgfVxuXG4gICAgLy8gZm9yIGVhY2ggPGE+LWVsZW1lbnQgdGhhdCBjb250YWlucyBhIFwiL1wiIGFuZCBhIFwiI1wiXG4gICAgJCgnYVtocmVmKj1cIi9cIl1baHJlZio9XCIjXCJdJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAvLyBpZiB0aGUgcGF0aG5hbWUgb2YgdGhlIGhyZWYgcmVmZXJlbmNlcyB0aGUgc2FtZSBwYWdlXG4gICAgICAgIGlmICh0aGlzLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCcnKSA9PT0gbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sJycpICYmIHRoaXMuaG9zdG5hbWUgPT09IGxvY2F0aW9uLmhvc3RuYW1lKSB7XG4gICAgICAgICAgICAvLyBvbmx5IGtlZXAgdGhlIGhhc2gsIGkuZS4gZG8gbm90IGtlZXAgdGhlIHBhdGhuYW1lXG4gICAgICAgICAgICAkKHRoaXMpLmF0dHIoXCJocmVmXCIsIHRoaXMuaGFzaCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHNlbGVjdCBhbGwgaHJlZi1lbGVtZW50cyB0aGF0IHN0YXJ0IHdpdGggI1xuICAgIC8vIGluY2x1ZGluZyB0aGUgb25lcyB0aGF0IHdlcmUgc3RyaXBwZWQgYnkgdGhlaXIgcGF0aG5hbWUganVzdCBhYm92ZVxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnYVtocmVmXj1cIiNcIl06bm90KFtocmVmPVwiI1wiXSknLCBzY3JvbGxub3cgKTtcblxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIl19
