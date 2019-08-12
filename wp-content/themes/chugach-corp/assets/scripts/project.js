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

	$('<div class="slick-arrows"></div>').insertAfter('.section-related-posts .slick');

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImExMXktdG9nZ2xlLmpzIiwiZ2VuZXNpcy1yZXNwb25zaXZlLW1lbnUuanMiLCJob3ZlckludGVudC5qcyIsImltYWdlc2xvYWRlZC5wa2dkLmpzIiwianF1ZXJ5Lm1hdGNoSGVpZ2h0LmpzIiwianF1ZXJ5LnNtb290aC1zY3JvbGwuanMiLCJqcXVlcnkud2F5cG9pbnRzLmpzIiwicmVjbGluZXIuanMiLCJzbGljay5qcyIsInN1cGVyZmlzaC5qcyIsIndheXBvaW50cy5pbnZpZXcuanMiLCJidXNpbmVzcy1saW5lcy5qcyIsImNhcmVlcnMuanMiLCJleHRlcm5hbC1saW5rcy5qcyIsImZhY2V0d3AuanMiLCJmaXhlZC1oZWFkZXIuanMiLCJnZW5lcmFsLmpzIiwiaW5saW5lLXN2Zy5qcyIsImxlYWRlcnNoaXAuanMiLCJsb2dpbi5qcyIsIm1vZGFsLXZpZGVvLmpzIiwib3BlcmF0aW5nLWNvbXBhbmllcy5qcyIsInJlZ2lvbnMuanMiLCJyZXNwb25zaXZlLXZpZGVvLWVtYmVkcy5qcyIsInJldmVhbC5qcyIsInNlYXJjaC5qcyIsInNtb290aC1zY3JvbGwuanMiXSwibmFtZXMiOlsiaW50ZXJuYWxJZCIsInRvZ2dsZXNNYXAiLCJ0YXJnZXRzTWFwIiwiJCIsInNlbGVjdG9yIiwiY29udGV4dCIsIkFycmF5IiwicHJvdG90eXBlIiwic2xpY2UiLCJjYWxsIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZ2V0Q2xvc2VzdFRvZ2dsZSIsImVsZW1lbnQiLCJjbG9zZXN0Iiwibm9kZVR5cGUiLCJoYXNBdHRyaWJ1dGUiLCJwYXJlbnROb2RlIiwiaGFuZGxlVG9nZ2xlIiwidG9nZ2xlIiwidGFyZ2V0IiwiZ2V0QXR0cmlidXRlIiwidG9nZ2xlcyIsImlkIiwiaXNFeHBhbmRlZCIsInNldEF0dHJpYnV0ZSIsImZvckVhY2giLCJpbm5lckhUTUwiLCJpbml0QTExeVRvZ2dsZSIsInJlZHVjZSIsImFjYyIsInB1c2giLCJ0YXJnZXRzIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImxhYmVsbGVkYnkiLCJqb2luIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwid2hpY2giLCJ3aW5kb3ciLCJhMTF5VG9nZ2xlIiwidW5kZWZpbmVkIiwicmVtb3ZlQ2xhc3MiLCJnZW5lc2lzTWVudVBhcmFtcyIsImdlbmVzaXNfcmVzcG9uc2l2ZV9tZW51IiwiZ2VuZXNpc01lbnVzVW5jaGVja2VkIiwibWVudUNsYXNzZXMiLCJnZW5lc2lzTWVudXMiLCJtZW51c1RvQ29tYmluZSIsImVhY2giLCJncm91cCIsImtleSIsInZhbHVlIiwibWVudVN0cmluZyIsIiRtZW51IiwibmV3U3RyaW5nIiwiYWRkQ2xhc3MiLCJyZXBsYWNlIiwib3RoZXJzIiwiY29tYmluZSIsImdlbmVzaXNNZW51IiwibWFpbk1lbnVCdXR0b25DbGFzcyIsInN1Yk1lbnVCdXR0b25DbGFzcyIsInJlc3BvbnNpdmVNZW51Q2xhc3MiLCJpbml0IiwiX2dldEFsbE1lbnVzQXJyYXkiLCJtZW51SWNvbkNsYXNzIiwic3ViTWVudUljb25DbGFzcyIsInRvZ2dsZUJ1dHRvbnMiLCJtZW51IiwiYXBwZW5kIiwibWFpbk1lbnUiLCJzdWJtZW51Iiwic3ViTWVudSIsIl9hZGRSZXNwb25zaXZlTWVudUNsYXNzIiwiX2FkZE1lbnVCdXR0b25zIiwib24iLCJfbWFpbm1lbnVUb2dnbGUiLCJfYWRkQ2xhc3NJRCIsIl9zdWJtZW51VG9nZ2xlIiwiX2RvUmVzaXplIiwidHJpZ2dlckhhbmRsZXIiLCJfZ2V0TWVudVNlbGVjdG9yU3RyaW5nIiwiZmluZCIsImJlZm9yZSIsIm1lbnVzVG9Ub2dnbGUiLCJjb25jYXQiLCJidXR0b25zIiwiYXR0ciIsIl9tYXliZUNsb3NlIiwiX3N1cGVyZmlzaFRvZ2dsZSIsIl9jaGFuZ2VTa2lwTGluayIsIl9jb21iaW5lTWVudXMiLCIkdGhpcyIsIm5hdiIsIm5leHQiLCJtYXRjaCIsInByaW1hcnlNZW51IiwiY29tYmluZWRNZW51cyIsImZpbHRlciIsImluZGV4IiwiX2dldERpc3BsYXlWYWx1ZSIsImFwcGVuZFRvIiwiaGlkZSIsInNob3ciLCJfdG9nZ2xlQXJpYSIsInRvZ2dsZUNsYXNzIiwic2xpZGVUb2dnbGUiLCJzaWJsaW5ncyIsInNsaWRlVXAiLCJfc3VwZXJmaXNoIiwiJGFyZ3MiLCJzdXBlcmZpc2giLCJtZW51VG9nZ2xlTGlzdCIsIm5ld1ZhbHVlIiwic3RhcnRMaW5rIiwiZW5kTGluayIsIiRpdGVtIiwibGluayIsIiRpZCIsImdldEVsZW1lbnRCeUlkIiwic3R5bGUiLCJnZXRDb21wdXRlZFN0eWxlIiwiZ2V0UHJvcGVydHlWYWx1ZSIsImF0dHJpYnV0ZSIsIml0ZW1BcnJheSIsIml0ZW1TdHJpbmciLCJtYXAiLCJtZW51TGlzdCIsInZhbHVlT2YiLCJyZWFkeSIsImpRdWVyeSIsImZuIiwiaG92ZXJJbnRlbnQiLCJoYW5kbGVySW4iLCJoYW5kbGVyT3V0IiwiY2ZnIiwiaW50ZXJ2YWwiLCJzZW5zaXRpdml0eSIsInRpbWVvdXQiLCJleHRlbmQiLCJpc0Z1bmN0aW9uIiwib3ZlciIsIm91dCIsImNYIiwiY1kiLCJwWCIsInBZIiwidHJhY2siLCJldiIsInBhZ2VYIiwicGFnZVkiLCJjb21wYXJlIiwib2IiLCJob3ZlckludGVudF90IiwiY2xlYXJUaW1lb3V0IiwiTWF0aCIsImFicyIsIm9mZiIsImhvdmVySW50ZW50X3MiLCJhcHBseSIsInNldFRpbWVvdXQiLCJkZWxheSIsImhhbmRsZUhvdmVyIiwiZSIsInR5cGUiLCJnbG9iYWwiLCJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwibW9kdWxlIiwiZXhwb3J0cyIsIkV2RW1pdHRlciIsInByb3RvIiwiZXZlbnROYW1lIiwibGlzdGVuZXIiLCJldmVudHMiLCJfZXZlbnRzIiwibGlzdGVuZXJzIiwiaW5kZXhPZiIsIm9uY2UiLCJvbmNlRXZlbnRzIiwiX29uY2VFdmVudHMiLCJvbmNlTGlzdGVuZXJzIiwic3BsaWNlIiwiZW1pdEV2ZW50IiwiYXJncyIsImkiLCJpc09uY2UiLCJhbGxPZmYiLCJyZXF1aXJlIiwiaW1hZ2VzTG9hZGVkIiwiY29uc29sZSIsImEiLCJiIiwicHJvcCIsImFycmF5U2xpY2UiLCJtYWtlQXJyYXkiLCJvYmoiLCJpc0FycmF5IiwiaXNBcnJheUxpa2UiLCJJbWFnZXNMb2FkZWQiLCJlbGVtIiwib3B0aW9ucyIsIm9uQWx3YXlzIiwicXVlcnlFbGVtIiwiZXJyb3IiLCJlbGVtZW50cyIsImdldEltYWdlcyIsImpxRGVmZXJyZWQiLCJEZWZlcnJlZCIsImNoZWNrIiwiYmluZCIsImNyZWF0ZSIsImltYWdlcyIsImFkZEVsZW1lbnRJbWFnZXMiLCJub2RlTmFtZSIsImFkZEltYWdlIiwiYmFja2dyb3VuZCIsImFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzIiwiZWxlbWVudE5vZGVUeXBlcyIsImNoaWxkSW1ncyIsImltZyIsImNoaWxkcmVuIiwiY2hpbGQiLCJyZVVSTCIsIm1hdGNoZXMiLCJleGVjIiwiYmFja2dyb3VuZEltYWdlIiwidXJsIiwiYWRkQmFja2dyb3VuZCIsImxvYWRpbmdJbWFnZSIsIkxvYWRpbmdJbWFnZSIsIkJhY2tncm91bmQiLCJfdGhpcyIsInByb2dyZXNzZWRDb3VudCIsImhhc0FueUJyb2tlbiIsImNvbXBsZXRlIiwib25Qcm9ncmVzcyIsImltYWdlIiwibWVzc2FnZSIsInByb2dyZXNzIiwiaXNMb2FkZWQiLCJub3RpZnkiLCJkZWJ1ZyIsImxvZyIsImlzQ29tcGxldGUiLCJqcU1ldGhvZCIsImdldElzSW1hZ2VDb21wbGV0ZSIsImNvbmZpcm0iLCJuYXR1cmFsV2lkdGgiLCJwcm94eUltYWdlIiwiSW1hZ2UiLCJzcmMiLCJoYW5kbGVFdmVudCIsIm1ldGhvZCIsIm9ubG9hZCIsInVuYmluZEV2ZW50cyIsIm9uZXJyb3IiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwibWFrZUpRdWVyeVBsdWdpbiIsImNhbGxiYWNrIiwiaW5zdGFuY2UiLCJwcm9taXNlIiwiX3ByZXZpb3VzUmVzaXplV2lkdGgiLCJfdXBkYXRlVGltZW91dCIsIl9wYXJzZSIsInBhcnNlRmxvYXQiLCJfcm93cyIsInRvbGVyYW5jZSIsIiRlbGVtZW50cyIsImxhc3RUb3AiLCJyb3dzIiwiJHRoYXQiLCJ0b3AiLCJvZmZzZXQiLCJjc3MiLCJsYXN0Um93IiwiZmxvb3IiLCJhZGQiLCJfcGFyc2VPcHRpb25zIiwib3B0cyIsImJ5Um93IiwicHJvcGVydHkiLCJyZW1vdmUiLCJtYXRjaEhlaWdodCIsInRoYXQiLCJfZ3JvdXBzIiwibm90IiwiX2FwcGx5IiwidmVyc2lvbiIsIl90aHJvdHRsZSIsIl9tYWludGFpblNjcm9sbCIsIl9iZWZvcmVVcGRhdGUiLCJfYWZ0ZXJVcGRhdGUiLCJzY3JvbGxUb3AiLCJodG1sSGVpZ2h0Iiwib3V0ZXJIZWlnaHQiLCIkaGlkZGVuUGFyZW50cyIsInBhcmVudHMiLCJkYXRhIiwiZGlzcGxheSIsInJvdyIsIiRyb3ciLCJ0YXJnZXRIZWlnaHQiLCJ2ZXJ0aWNhbFBhZGRpbmciLCJpcyIsIl9hcHBseURhdGFBcGkiLCJncm91cHMiLCJncm91cElkIiwiX3VwZGF0ZSIsInRocm90dGxlIiwid2luZG93V2lkdGgiLCJ3aWR0aCIsIm9wdGlvbk92ZXJyaWRlcyIsImRlZmF1bHRzIiwiZXhjbHVkZSIsImV4Y2x1ZGVXaXRoaW4iLCJkaXJlY3Rpb24iLCJkZWxlZ2F0ZVNlbGVjdG9yIiwic2Nyb2xsRWxlbWVudCIsInNjcm9sbFRhcmdldCIsImF1dG9Gb2N1cyIsImJlZm9yZVNjcm9sbCIsImFmdGVyU2Nyb2xsIiwiZWFzaW5nIiwic3BlZWQiLCJhdXRvQ29lZmZpY2llbnQiLCJwcmV2ZW50RGVmYXVsdCIsImdldFNjcm9sbGFibGUiLCJzY3JvbGxhYmxlIiwic2Nyb2xsZWQiLCJkaXIiLCJlbCIsInNjcm9sbGluZ0VsZW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJib2R5IiwiclJlbGF0aXZlIiwic2NybCIsInB1c2hTdGFjayIsImZpcnN0U2Nyb2xsYWJsZSIsInNtb290aFNjcm9sbCIsImV4dHJhIiwiZmlyc3QiLCJjbGlja0hhbmRsZXIiLCJlc2NhcGVTZWxlY3RvciIsInN0ciIsIiRsaW5rIiwidGhpc09wdHMiLCJlbENvdW50ZXIiLCJld2xDb3VudGVyIiwiaW5jbHVkZSIsImNsaWNrT3B0cyIsImxvY2F0aW9uUGF0aCIsImZpbHRlclBhdGgiLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwibGlua1BhdGgiLCJob3N0TWF0Y2giLCJob3N0bmFtZSIsInBhdGhNYXRjaCIsInRoaXNIYXNoIiwiaGFzaCIsImdldEV4cGxpY2l0T2Zmc2V0IiwidmFsIiwiZXhwbGljaXQiLCJyZWxhdGl2ZSIsInBhcnRzIiwicHgiLCJvbkFmdGVyU2Nyb2xsIiwiJHRndCIsImZvY3VzIiwiYWN0aXZlRWxlbWVudCIsInRhYkluZGV4IiwiJHNjcm9sbGVyIiwiZGVsdGEiLCJleHBsaWNpdE9mZnNldCIsInNjcm9sbFRhcmdldE9mZnNldCIsInNjcm9sbGVyT2Zmc2V0Iiwib2ZmUG9zIiwic2Nyb2xsRGlyIiwiYW5pUHJvcHMiLCJhbmlPcHRzIiwidGVzdCIsImR1cmF0aW9uIiwic3RlcCIsInN0b3AiLCJhbmltYXRlIiwic3RyaW5nIiwia2V5Q291bnRlciIsImFsbFdheXBvaW50cyIsIldheXBvaW50IiwiRXJyb3IiLCJoYW5kbGVyIiwiQWRhcHRlciIsImFkYXB0ZXIiLCJheGlzIiwiaG9yaXpvbnRhbCIsImVuYWJsZWQiLCJ0cmlnZ2VyUG9pbnQiLCJHcm91cCIsImZpbmRPckNyZWF0ZSIsIm5hbWUiLCJDb250ZXh0IiwiZmluZE9yQ3JlYXRlQnlFbGVtZW50Iiwib2Zmc2V0QWxpYXNlcyIsInF1ZXVlVHJpZ2dlciIsInRyaWdnZXIiLCJkZXN0cm95IiwiZGlzYWJsZSIsImVuYWJsZSIsInJlZnJlc2giLCJwcmV2aW91cyIsImludm9rZUFsbCIsImFsbFdheXBvaW50c0FycmF5Iiwid2F5cG9pbnRLZXkiLCJlbmQiLCJkZXN0cm95QWxsIiwiZGlzYWJsZUFsbCIsImVuYWJsZUFsbCIsInJlZnJlc2hBbGwiLCJ2aWV3cG9ydEhlaWdodCIsImlubmVySGVpZ2h0IiwiY2xpZW50SGVpZ2h0Iiwidmlld3BvcnRXaWR0aCIsImNsaWVudFdpZHRoIiwiYWRhcHRlcnMiLCJjb250aW51b3VzIiwiaW5uZXJXaWR0aCIsIm91dGVyV2lkdGgiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWVTaGltIiwiY29udGV4dHMiLCJvbGRXaW5kb3dMb2FkIiwiZGlkU2Nyb2xsIiwiZGlkUmVzaXplIiwib2xkU2Nyb2xsIiwieCIsInNjcm9sbExlZnQiLCJ5Iiwid2F5cG9pbnRzIiwidmVydGljYWwiLCJ3YXlwb2ludENvbnRleHRLZXkiLCJ3aW5kb3dDb250ZXh0IiwiY3JlYXRlVGhyb3R0bGVkU2Nyb2xsSGFuZGxlciIsImNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIiLCJ3YXlwb2ludCIsImNoZWNrRW1wdHkiLCJob3Jpem9udGFsRW1wdHkiLCJpc0VtcHR5T2JqZWN0IiwidmVydGljYWxFbXB0eSIsImlzV2luZG93Iiwic2VsZiIsInJlc2l6ZUhhbmRsZXIiLCJoYW5kbGVSZXNpemUiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzY3JvbGxIYW5kbGVyIiwiaGFuZGxlU2Nyb2xsIiwiaXNUb3VjaCIsInRyaWdnZXJlZEdyb3VwcyIsImF4ZXMiLCJuZXdTY3JvbGwiLCJmb3J3YXJkIiwiYmFja3dhcmQiLCJheGlzS2V5IiwiaXNGb3J3YXJkIiwid2FzQmVmb3JlVHJpZ2dlclBvaW50Iiwibm93QWZ0ZXJUcmlnZ2VyUG9pbnQiLCJjcm9zc2VkRm9yd2FyZCIsImNyb3NzZWRCYWNrd2FyZCIsImdyb3VwS2V5IiwiZmx1c2hUcmlnZ2VycyIsImNvbnRleHRPZmZzZXQiLCJsZWZ0IiwiY29udGV4dFNjcm9sbCIsImNvbnRleHREaW1lbnNpb24iLCJvZmZzZXRQcm9wIiwiYWRqdXN0bWVudCIsIm9sZFRyaWdnZXJQb2ludCIsImVsZW1lbnRPZmZzZXQiLCJmcmVzaFdheXBvaW50IiwiY29udGV4dE1vZGlmaWVyIiwid2FzQmVmb3JlU2Nyb2xsIiwibm93QWZ0ZXJTY3JvbGwiLCJ0cmlnZ2VyZWRCYWNrd2FyZCIsInRyaWdnZXJlZEZvcndhcmQiLCJjZWlsIiwiZmluZEJ5RWxlbWVudCIsImNvbnRleHRJZCIsInJlcXVlc3RGbiIsIm1velJlcXVlc3RBbmltYXRpb25GcmFtZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsImJ5VHJpZ2dlclBvaW50IiwiYnlSZXZlcnNlVHJpZ2dlclBvaW50IiwiY2xlYXJUcmlnZ2VyUXVldWVzIiwidHJpZ2dlclF1ZXVlcyIsInVwIiwiZG93biIsInJpZ2h0IiwicmV2ZXJzZSIsInNvcnQiLCJpbkFycmF5IiwiaXNMYXN0IiwibGFzdCIsIkpRdWVyeUFkYXB0ZXIiLCIkZWxlbWVudCIsImFyZ3VtZW50cyIsImNyZWF0ZUV4dGVuc2lvbiIsImZyYW1ld29yayIsIm92ZXJyaWRlcyIsIlplcHRvIiwicmVjbGluZXIiLCIkdyIsImxvYWRlZCIsInRpbWVyIiwiYXR0cmliIiwidGhyZXNob2xkIiwicHJpbnRhYmxlIiwibGl2ZSIsImdldFNjcmlwdCIsImxvYWQiLCIkZSIsInNvdXJjZSIsInByb2Nlc3MiLCJoZWlnaHQiLCJlb2YiLCJzY3JvbGxZIiwib2Zmc2V0SGVpZ2h0IiwiaW52aWV3Iiwid3QiLCJ3YiIsImV0IiwiZWIiLCJlbHMiLCJvbmUiLCJtYXRjaE1lZGlhIiwiYWRkTGlzdGVuZXIiLCJtcWwiLCJkZXJlY2xpbmVyIiwiU2xpY2siLCJpbnN0YW5jZVVpZCIsInNldHRpbmdzIiwiXyIsImRhdGFTZXR0aW5ncyIsImFjY2Vzc2liaWxpdHkiLCJhZGFwdGl2ZUhlaWdodCIsImFwcGVuZEFycm93cyIsImFwcGVuZERvdHMiLCJhcnJvd3MiLCJhc05hdkZvciIsInByZXZBcnJvdyIsIm5leHRBcnJvdyIsImF1dG9wbGF5IiwiYXV0b3BsYXlTcGVlZCIsImNlbnRlck1vZGUiLCJjZW50ZXJQYWRkaW5nIiwiY3NzRWFzZSIsImN1c3RvbVBhZ2luZyIsInNsaWRlciIsInRleHQiLCJkb3RzIiwiZG90c0NsYXNzIiwiZHJhZ2dhYmxlIiwiZWRnZUZyaWN0aW9uIiwiZmFkZSIsImZvY3VzT25TZWxlY3QiLCJmb2N1c09uQ2hhbmdlIiwiaW5maW5pdGUiLCJpbml0aWFsU2xpZGUiLCJsYXp5TG9hZCIsIm1vYmlsZUZpcnN0IiwicGF1c2VPbkhvdmVyIiwicGF1c2VPbkZvY3VzIiwicGF1c2VPbkRvdHNIb3ZlciIsInJlc3BvbmRUbyIsInJlc3BvbnNpdmUiLCJydGwiLCJzbGlkZSIsInNsaWRlc1BlclJvdyIsInNsaWRlc1RvU2hvdyIsInNsaWRlc1RvU2Nyb2xsIiwic3dpcGUiLCJzd2lwZVRvU2xpZGUiLCJ0b3VjaE1vdmUiLCJ0b3VjaFRocmVzaG9sZCIsInVzZUNTUyIsInVzZVRyYW5zZm9ybSIsInZhcmlhYmxlV2lkdGgiLCJ2ZXJ0aWNhbFN3aXBpbmciLCJ3YWl0Rm9yQW5pbWF0ZSIsInpJbmRleCIsImluaXRpYWxzIiwiYW5pbWF0aW5nIiwiZHJhZ2dpbmciLCJhdXRvUGxheVRpbWVyIiwiY3VycmVudERpcmVjdGlvbiIsImN1cnJlbnRMZWZ0IiwiY3VycmVudFNsaWRlIiwiJGRvdHMiLCJsaXN0V2lkdGgiLCJsaXN0SGVpZ2h0IiwibG9hZEluZGV4IiwiJG5leHRBcnJvdyIsIiRwcmV2QXJyb3ciLCJzY3JvbGxpbmciLCJzbGlkZUNvdW50Iiwic2xpZGVXaWR0aCIsIiRzbGlkZVRyYWNrIiwiJHNsaWRlcyIsInNsaWRpbmciLCJzbGlkZU9mZnNldCIsInN3aXBlTGVmdCIsInN3aXBpbmciLCIkbGlzdCIsInRvdWNoT2JqZWN0IiwidHJhbnNmb3Jtc0VuYWJsZWQiLCJ1bnNsaWNrZWQiLCJhY3RpdmVCcmVha3BvaW50IiwiYW5pbVR5cGUiLCJhbmltUHJvcCIsImJyZWFrcG9pbnRzIiwiYnJlYWtwb2ludFNldHRpbmdzIiwiY3NzVHJhbnNpdGlvbnMiLCJmb2N1c3NlZCIsImludGVycnVwdGVkIiwiaGlkZGVuIiwicGF1c2VkIiwicG9zaXRpb25Qcm9wIiwicm93Q291bnQiLCJzaG91bGRDbGljayIsIiRzbGlkZXIiLCIkc2xpZGVzQ2FjaGUiLCJ0cmFuc2Zvcm1UeXBlIiwidHJhbnNpdGlvblR5cGUiLCJ2aXNpYmlsaXR5Q2hhbmdlIiwid2luZG93VGltZXIiLCJvcmlnaW5hbFNldHRpbmdzIiwibW96SGlkZGVuIiwid2Via2l0SGlkZGVuIiwiYXV0b1BsYXkiLCJwcm94eSIsImF1dG9QbGF5Q2xlYXIiLCJhdXRvUGxheUl0ZXJhdG9yIiwiY2hhbmdlU2xpZGUiLCJzZWxlY3RIYW5kbGVyIiwic2V0UG9zaXRpb24iLCJzd2lwZUhhbmRsZXIiLCJkcmFnSGFuZGxlciIsImtleUhhbmRsZXIiLCJodG1sRXhwciIsInJlZ2lzdGVyQnJlYWtwb2ludHMiLCJhY3RpdmF0ZUFEQSIsImFkZFNsaWRlIiwic2xpY2tBZGQiLCJtYXJrdXAiLCJhZGRCZWZvcmUiLCJ1bmxvYWQiLCJpbnNlcnRCZWZvcmUiLCJlcSIsImluc2VydEFmdGVyIiwicHJlcGVuZFRvIiwiZGV0YWNoIiwicmVpbml0IiwiYW5pbWF0ZUhlaWdodCIsImFuaW1hdGVTbGlkZSIsInRhcmdldExlZnQiLCJhbmltUHJvcHMiLCJhbmltU3RhcnQiLCJub3ciLCJhcHBseVRyYW5zaXRpb24iLCJkaXNhYmxlVHJhbnNpdGlvbiIsImdldE5hdlRhcmdldCIsInNsaWNrIiwic2xpZGVIYW5kbGVyIiwidHJhbnNpdGlvbiIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsInNsaWRlVG8iLCJidWlsZEFycm93cyIsInJlbW92ZUF0dHIiLCJidWlsZERvdHMiLCJkb3QiLCJnZXREb3RDb3VudCIsImJ1aWxkT3V0Iiwid3JhcEFsbCIsInBhcmVudCIsIndyYXAiLCJzZXR1cEluZmluaXRlIiwidXBkYXRlRG90cyIsInNldFNsaWRlQ2xhc3NlcyIsImJ1aWxkUm93cyIsImMiLCJuZXdTbGlkZXMiLCJudW1PZlNsaWRlcyIsIm9yaWdpbmFsU2xpZGVzIiwic2xpZGVzUGVyU2VjdGlvbiIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJjcmVhdGVFbGVtZW50IiwiZ2V0IiwiYXBwZW5kQ2hpbGQiLCJlbXB0eSIsImNoZWNrUmVzcG9uc2l2ZSIsImluaXRpYWwiLCJmb3JjZVVwZGF0ZSIsImJyZWFrcG9pbnQiLCJ0YXJnZXRCcmVha3BvaW50IiwicmVzcG9uZFRvV2lkdGgiLCJ0cmlnZ2VyQnJlYWtwb2ludCIsInNsaWRlcldpZHRoIiwibWluIiwiaGFzT3duUHJvcGVydHkiLCJ1bnNsaWNrIiwiZG9udEFuaW1hdGUiLCIkdGFyZ2V0IiwiY3VycmVudFRhcmdldCIsImluZGV4T2Zmc2V0IiwidW5ldmVuT2Zmc2V0IiwiY2hlY2tOYXZpZ2FibGUiLCJuYXZpZ2FibGVzIiwicHJldk5hdmlnYWJsZSIsImdldE5hdmlnYWJsZUluZGV4ZXMiLCJuIiwiY2xlYW5VcEV2ZW50cyIsImludGVycnVwdCIsInZpc2liaWxpdHkiLCJjbGVhblVwU2xpZGVFdmVudHMiLCJvcmllbnRhdGlvbkNoYW5nZSIsInJlc2l6ZSIsImNsZWFuVXBSb3dzIiwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIiwic3RvcFByb3BhZ2F0aW9uIiwiZmFkZVNsaWRlIiwic2xpZGVJbmRleCIsIm9wYWNpdHkiLCJmYWRlU2xpZGVPdXQiLCJmaWx0ZXJTbGlkZXMiLCJzbGlja0ZpbHRlciIsImZvY3VzSGFuZGxlciIsIiRzZiIsImdldEN1cnJlbnQiLCJzbGlja0N1cnJlbnRTbGlkZSIsImJyZWFrUG9pbnQiLCJjb3VudGVyIiwicGFnZXJRdHkiLCJnZXRMZWZ0IiwidmVydGljYWxIZWlnaHQiLCJ2ZXJ0aWNhbE9mZnNldCIsInRhcmdldFNsaWRlIiwiY29lZiIsIm9mZnNldExlZnQiLCJnZXRPcHRpb24iLCJzbGlja0dldE9wdGlvbiIsIm9wdGlvbiIsImluZGV4ZXMiLCJtYXgiLCJnZXRTbGljayIsImdldFNsaWRlQ291bnQiLCJzbGlkZXNUcmF2ZXJzZWQiLCJzd2lwZWRTbGlkZSIsImNlbnRlck9mZnNldCIsImdvVG8iLCJzbGlja0dvVG8iLCJwYXJzZUludCIsImNyZWF0aW9uIiwiaGFzQ2xhc3MiLCJzZXRQcm9wcyIsInN0YXJ0TG9hZCIsImxvYWRTbGlkZXIiLCJpbml0aWFsaXplRXZlbnRzIiwidXBkYXRlQXJyb3dzIiwiaW5pdEFEQSIsIm51bURvdEdyb3VwcyIsInRhYkNvbnRyb2xJbmRleGVzIiwic2xpZGVDb250cm9sSW5kZXgiLCJhcmlhQnV0dG9uQ29udHJvbCIsIm1hcHBlZFNsaWRlSW5kZXgiLCJpbml0QXJyb3dFdmVudHMiLCJpbml0RG90RXZlbnRzIiwiaW5pdFNsaWRlRXZlbnRzIiwiYWN0aW9uIiwiaW5pdFVJIiwidGFnTmFtZSIsImtleUNvZGUiLCJsb2FkUmFuZ2UiLCJjbG9uZVJhbmdlIiwicmFuZ2VTdGFydCIsInJhbmdlRW5kIiwibG9hZEltYWdlcyIsImltYWdlc1Njb3BlIiwiaW1hZ2VTb3VyY2UiLCJpbWFnZVNyY1NldCIsImltYWdlU2l6ZXMiLCJpbWFnZVRvTG9hZCIsInByZXZTbGlkZSIsIm5leHRTbGlkZSIsInByb2dyZXNzaXZlTGF6eUxvYWQiLCJzbGlja05leHQiLCJwYXVzZSIsInNsaWNrUGF1c2UiLCJwbGF5Iiwic2xpY2tQbGF5IiwicG9zdFNsaWRlIiwiJGN1cnJlbnRTbGlkZSIsInByZXYiLCJzbGlja1ByZXYiLCJ0cnlDb3VudCIsIiRpbWdzVG9Mb2FkIiwiaW5pdGlhbGl6aW5nIiwibGFzdFZpc2libGVJbmRleCIsImN1cnJlbnRCcmVha3BvaW50IiwibCIsInJlc3BvbnNpdmVTZXR0aW5ncyIsIndpbmRvd0RlbGF5IiwicmVtb3ZlU2xpZGUiLCJzbGlja1JlbW92ZSIsInJlbW92ZUJlZm9yZSIsInJlbW92ZUFsbCIsInNldENTUyIsInBvc2l0aW9uIiwicG9zaXRpb25Qcm9wcyIsInNldERpbWVuc2lvbnMiLCJwYWRkaW5nIiwic2V0RmFkZSIsInNldEhlaWdodCIsInNldE9wdGlvbiIsInNsaWNrU2V0T3B0aW9uIiwiaXRlbSIsIm9wdCIsImJvZHlTdHlsZSIsIldlYmtpdFRyYW5zaXRpb24iLCJNb3pUcmFuc2l0aW9uIiwibXNUcmFuc2l0aW9uIiwiT1RyYW5zZm9ybSIsInBlcnNwZWN0aXZlUHJvcGVydHkiLCJ3ZWJraXRQZXJzcGVjdGl2ZSIsIk1velRyYW5zZm9ybSIsIk1velBlcnNwZWN0aXZlIiwid2Via2l0VHJhbnNmb3JtIiwibXNUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJhbGxTbGlkZXMiLCJyZW1haW5kZXIiLCJldmVuQ29lZiIsImluZmluaXRlQ291bnQiLCJjbG9uZSIsInRhcmdldEVsZW1lbnQiLCJzeW5jIiwiYW5pbVNsaWRlIiwib2xkU2xpZGUiLCJzbGlkZUxlZnQiLCJuYXZUYXJnZXQiLCJzd2lwZURpcmVjdGlvbiIsInhEaXN0IiwieURpc3QiLCJyIiwic3dpcGVBbmdsZSIsInN0YXJ0WCIsImN1clgiLCJzdGFydFkiLCJjdXJZIiwiYXRhbjIiLCJyb3VuZCIsIlBJIiwic3dpcGVFbmQiLCJzd2lwZUxlbmd0aCIsImVkZ2VIaXQiLCJtaW5Td2lwZSIsImZpbmdlckNvdW50Iiwib3JpZ2luYWxFdmVudCIsInRvdWNoZXMiLCJzd2lwZVN0YXJ0Iiwic3dpcGVNb3ZlIiwiZWRnZVdhc0hpdCIsImN1ckxlZnQiLCJwb3NpdGlvbk9mZnNldCIsInZlcnRpY2FsU3dpcGVMZW5ndGgiLCJjbGllbnRYIiwiY2xpZW50WSIsInNxcnQiLCJwb3ciLCJ1bmZpbHRlclNsaWRlcyIsInNsaWNrVW5maWx0ZXIiLCJmcm9tQnJlYWtwb2ludCIsInJldCIsInciLCJtZXRob2RzIiwiYmNDbGFzcyIsIm1lbnVDbGFzcyIsImFuY2hvckNsYXNzIiwibWVudUFycm93Q2xhc3MiLCJpb3MiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJub29wIiwid3A3IiwidW5wcmVmaXhlZFBvaW50ZXJFdmVudHMiLCJQb2ludGVyRXZlbnQiLCJ0b2dnbGVNZW51Q2xhc3NlcyIsIm8iLCJjbGFzc2VzIiwiY3NzQXJyb3dzIiwic2V0UGF0aFRvQ3VycmVudCIsInBhdGhDbGFzcyIsInBhdGhMZXZlbHMiLCJob3ZlckNsYXNzIiwicG9wVXBTZWxlY3RvciIsInRvZ2dsZUFuY2hvckNsYXNzIiwiJGxpIiwidG9nZ2xlVG91Y2hBY3Rpb24iLCJtc1RvdWNoQWN0aW9uIiwidG91Y2hBY3Rpb24iLCJnZXRNZW51IiwiJGVsIiwiZ2V0T3B0aW9ucyIsInNmVGltZXIiLCJjbG9zZSIsInJldGFpblBhdGgiLCIkcGF0aCIsIm9uSWRsZSIsInRvdWNoSGFuZGxlciIsIiR1bCIsIm9uSGFuZGxlVG91Y2giLCJhcHBseUhhbmRsZXJzIiwiZGlzYWJsZUhJIiwidG91Y2hldmVudCIsImluc3RhbnQiLCJzcGVlZE91dCIsIm9uQmVmb3JlSGlkZSIsImFuaW1hdGlvbk91dCIsIm9uSGlkZSIsIm9uQmVmb3JlU2hvdyIsImFuaW1hdGlvbiIsIm9uU2hvdyIsIiRoYXNQb3BVcCIsIm9uRGVzdHJveSIsInJlbW92ZURhdGEiLCJvcCIsIm9uSW5pdCIsIkludmlldyIsImNyZWF0ZVdheXBvaW50cyIsImNvbmZpZ3MiLCJjb25maWciLCJjcmVhdGVXYXlwb2ludCIsImVudGVyIiwiZW50ZXJlZCIsImV4aXQiLCJleGl0ZWQiLCIkbGVnZW5kIiwiJG1hcHMiLCJtb3VzZWxlYXZlIiwic2VhcmNoUGFyYW1zIiwiVVJMU2VhcmNoUGFyYW1zIiwic2VhcmNoIiwiaGFzIiwicGFyYW0iLCJmYWRlT3V0IiwicmVhY3RNYXRjaEhlaWdodCIsImVsQ2xhc3NOYW1lIiwiaXNJbnRlcm5hbExpbmsiLCJSZWdFeHAiLCJob3N0IiwiaHJlZiIsIkZXUCIsImZvdW5kYXRpb24iLCJGb3VuZGF0aW9uIiwicmVJbml0IiwibGFzdFNjcm9sbFRvcCIsIm5hdmJhckhlaWdodCIsInNjcm9sbCIsImhhc1Njcm9sbGVkIiwic3QiLCIkdG9nZ2xlIiwiYW5pbWF0ZU51bWJlcnMiLCJ2aWV3ZWQiLCJpc1Njcm9sbGVkSW50b1ZpZXciLCJkb2NWaWV3VG9wIiwiZG9jVmlld0JvdHRvbSIsImVsZW1Ub3AiLCJlbGVtQm90dG9tIiwiQ291bnRlciIsInRvU3RyaW5nIiwiJGltZyIsImltZ0lEIiwiaW1nQ2xhc3MiLCJpbWdVUkwiLCIkc3ZnIiwicmVwbGFjZVdpdGgiLCIkY29sdW1uIiwiY2xpY2siLCIkdGhpc0NvbHVtbiIsIk1lZGlhUXVlcnkiLCJhdExlYXN0IiwibGFiZWwiLCJwbGF5VmlkZW8iLCJzaXplIiwiJG1vZGFsIiwiJGlmcmFtZSIsImZyYW1lYm9yZGVyIiwiaHRtbCIsImdldExhc3RTaWJsaW5nSW5Sb3ciLCJjYW5kaWRhdGUiLCJlbGVtZW50VG9wIiwib2Zmc2V0VG9wIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwiJGdyaWQiLCJob3ZlciIsIiRhbGxfb2VtYmVkX3ZpZGVvcyIsImxvYWRSZWdpb24iLCIkcmVnaW9uIiwibG9hZE1hcCIsIiRtYXAiLCJsb2FkUHJvamVjdCIsIiRwcm9qZWN0IiwiJHNlY3Rpb25fdmlkZW9zIiwiZG9uZSIsIiRzZWN0aW9uX3N0b3JpZXMiLCIkc2VjdGlvbl9yZWxhdGVkX3Bvc3RzIiwiJHNlY3Rpb25fdGVzdGltb25pYWxzIiwiaGlkZV9oZWFkZXJfbWVudSIsInNjcm9sbG5vdyIsImRyb3BTaGFkb3dzIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUVBLENBQUMsWUFBWTtBQUNYOztBQUVBLE1BQUlBLGFBQWEsQ0FBakI7QUFDQSxNQUFJQyxhQUFhLEVBQWpCO0FBQ0EsTUFBSUMsYUFBYSxFQUFqQjs7QUFFQSxXQUFTQyxDQUFULENBQVlDLFFBQVosRUFBc0JDLE9BQXRCLEVBQStCO0FBQzdCLFdBQU9DLE1BQU1DLFNBQU4sQ0FBZ0JDLEtBQWhCLENBQXNCQyxJQUF0QixDQUNMLENBQUNKLFdBQVdLLFFBQVosRUFBc0JDLGdCQUF0QixDQUF1Q1AsUUFBdkMsQ0FESyxDQUFQO0FBR0Q7O0FBRUQsV0FBU1EsZ0JBQVQsQ0FBMkJDLE9BQTNCLEVBQW9DO0FBQ2xDLFFBQUlBLFFBQVFDLE9BQVosRUFBcUI7QUFDbkIsYUFBT0QsUUFBUUMsT0FBUixDQUFnQixvQkFBaEIsQ0FBUDtBQUNEOztBQUVELFdBQU9ELE9BQVAsRUFBZ0I7QUFDZCxVQUFJQSxRQUFRRSxRQUFSLEtBQXFCLENBQXJCLElBQTBCRixRQUFRRyxZQUFSLENBQXFCLGtC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QitHLFNBQW5CLENBQTZCO0FBQ3RCa0QscUJBQU0sR0FEZ0I7QUFFdEI7QUFDQXkxQiwyQkFBWSxDQUFDO0FBSFMsUUFBN0I7QUFPQSxDQVhBLEVBV0NuL0IsUUFYRCxFQVdXK0IsTUFYWCxFQVdtQjRGLE1BWG5CLENBQUQiLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGh0dHBzOi8vZWRlbnNwaWVrZXJtYW5uLmdpdGh1Yi5pby9hMTF5LXRvZ2dsZS9cblxuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBpbnRlcm5hbElkID0gMDtcbiAgdmFyIHRvZ2dsZXNNYXAgPSB7fTtcbiAgdmFyIHRhcmdldHNNYXAgPSB7fTtcblxuICBmdW5jdGlvbiAkIChzZWxlY3RvciwgY29udGV4dCkge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcbiAgICAgIChjb250ZXh0IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDbG9zZXN0VG9nZ2xlIChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQuY2xvc2VzdCkge1xuICAgICAgcmV0dXJuIGVsZW1lbnQuY2xvc2VzdCgnW2RhdGEtYTExeS10b2dnbGVdJyk7XG4gICAgfVxuXG4gICAgd2hpbGUgKGVsZW1lbnQpIHtcbiAgICAgIGlmIChlbGVtZW50Lm5vZGVUeXBlID09PSAxICYmIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlJykpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVUb2dnbGUgKHRvZ2dsZSkge1xuICAgIHZhciB0YXJnZXQgPSB0b2dnbGUgJiYgdGFyZ2V0c01hcFt0b2dnbGUuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyldO1xuXG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgdG9nZ2xlcyA9IHRvZ2dsZXNNYXBbJyMnICsgdGFyZ2V0LmlkXTtcbiAgICB2YXIgaXNFeHBhbmRlZCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJykgPT09ICdmYWxzZSc7XG5cbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGlzRXhwYW5kZWQpO1xuICAgIHRvZ2dsZXMuZm9yRWFjaChmdW5jdGlvbiAodG9nZ2xlKSB7XG4gICAgICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgIWlzRXhwYW5kZWQpO1xuICAgICAgaWYoIWlzRXhwYW5kZWQpIHtcbiAgICAgICAgaWYodG9nZ2xlLmhhc0F0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZS1sZXNzJykpIHtcbiAgICAgICAgICAgIHRvZ2dsZS5pbm5lckhUTUwgPSB0b2dnbGUuZ2V0QXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLWxlc3MnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYodG9nZ2xlLmhhc0F0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZS1tb3JlJykpIHtcbiAgICAgICAgICAgIHRvZ2dsZS5pbm5lckhUTUwgPSB0b2dnbGUuZ2V0QXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLW1vcmUnKTtcbiAgICAgICAgfVxuICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB2YXIgaW5pdEExMXlUb2dnbGUgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIHRvZ2dsZXNNYXAgPSAkKCdbZGF0YS1hMTF5LXRvZ2dsZV0nLCBjb250ZXh0KS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgdG9nZ2xlKSB7XG4gICAgICB2YXIgc2VsZWN0b3IgPSAnIycgKyB0b2dnbGUuZ2V0QXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlJyk7XG4gICAgICBhY2Nbc2VsZWN0b3JdID0gYWNjW3NlbGVjdG9yXSB8fCBbXTtcbiAgICAgIGFjY1tzZWxlY3Rvcl0ucHVzaCh0b2dnbGUpO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB0b2dnbGVzTWFwKTtcblxuICAgIHZhciB0YXJnZXRzID0gT2JqZWN0LmtleXModG9nZ2xlc01hcCk7XG4gICAgdGFyZ2V0cy5sZW5ndGggJiYgJCh0YXJnZXRzKS5mb3JFYWNoKGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIHZhciB0b2dnbGVzID0gdG9nZ2xlc01hcFsnIycgKyB0YXJnZXQuaWRdO1xuICAgICAgdmFyIGlzRXhwYW5kZWQgPSB0YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLW9wZW4nKTtcbiAgICAgIHZhciBsYWJlbGxlZGJ5ID0gW107XG5cbiAgICAgIHRvZ2dsZXMuZm9yRWFjaChmdW5jdGlvbiAodG9nZ2xlKSB7XG4gICAgICAgIHRvZ2dsZS5pZCB8fCB0b2dnbGUuc2V0QXR0cmlidXRlKCdpZCcsICdhMTF5LXRvZ2dsZS0nICsgaW50ZXJuYWxJZCsrKTtcbiAgICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycsIHRhcmdldC5pZCk7XG4gICAgICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBpc0V4cGFuZGVkKTsgICAgICAgIFxuICAgICAgICBsYWJlbGxlZGJ5LnB1c2godG9nZ2xlLmlkKTtcbiAgICAgIH0pO1xuXG4gICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICFpc0V4cGFuZGVkKTtcbiAgICAgIHRhcmdldC5oYXNBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScpIHx8IHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsIGxhYmVsbGVkYnkuam9pbignICcpKTtcblxuICAgICAgdGFyZ2V0c01hcFt0YXJnZXQuaWRdID0gdGFyZ2V0O1xuICAgIH0pO1xuICB9O1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgaW5pdEExMXlUb2dnbGUoKTtcbiAgfSk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgdG9nZ2xlID0gZ2V0Q2xvc2VzdFRvZ2dsZShldmVudC50YXJnZXQpO1xuICAgIGhhbmRsZVRvZ2dsZSh0b2dnbGUpO1xuICB9KTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudC53aGljaCA9PT0gMTMgfHwgZXZlbnQud2hpY2ggPT09IDMyKSB7XG4gICAgICB2YXIgdG9nZ2xlID0gZ2V0Q2xvc2VzdFRvZ2dsZShldmVudC50YXJnZXQpO1xuICAgICAgaWYgKHRvZ2dsZSAmJiB0b2dnbGUuZ2V0QXR0cmlidXRlKCdyb2xlJykgPT09ICdidXR0b24nKSB7XG4gICAgICAgIGhhbmRsZVRvZ2dsZSh0b2dnbGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93ICYmICh3aW5kb3cuYTExeVRvZ2dsZSA9IGluaXRBMTF5VG9nZ2xlKTtcbn0pKCk7XG4iLCIvKipcbiAqIFRoaXMgc2NyaXB0IGFkZHMgdGhlIGFjY2Vzc2liaWxpdHktcmVhZHkgcmVzcG9uc2l2ZSBtZW51cyBHZW5lc2lzIEZyYW1ld29yayBjaGlsZCB0aGVtZXMuXG4gKlxuICogQGF1dGhvciBTdHVkaW9QcmVzc1xuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2NvcHlibG9nZ2VyL3Jlc3BvbnNpdmUtbWVudXNcbiAqIEB2ZXJzaW9uIDEuMS4zXG4gKiBAbGljZW5zZSBHUEwtMi4wK1xuICovXG5cbiggZnVuY3Rpb24gKCBkb2N1bWVudCwgJCwgdW5kZWZpbmVkICkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG5cblx0dmFyIGdlbmVzaXNNZW51UGFyYW1zICAgICAgPSB0eXBlb2YgZ2VuZXNpc19yZXNwb25zaXZlX21lbnUgPT09ICd1bmRlZmluZWQnID8gJycgOiBnZW5lc2lzX3Jlc3BvbnNpdmVfbWVudSxcblx0XHRnZW5lc2lzTWVudXNVbmNoZWNrZWQgID0gZ2VuZXNpc01lbnVQYXJhbXMubWVudUNsYXNzZXMsXG5cdFx0Z2VuZXNpc01lbnVzICAgICAgICAgICA9IHt9LFxuXHRcdG1lbnVzVG9Db21iaW5lICAgICAgICAgPSBbXTtcblxuXHQvKipcblx0ICogVmFsaWRhdGUgdGhlIG1lbnVzIHBhc3NlZCBieSB0aGUgdGhlbWUgd2l0aCB3aGF0J3MgYmVpbmcgbG9hZGVkIG9uIHRoZSBwYWdlLFxuXHQgKiBhbmQgcGFzcyB0aGUgbmV3IGFuZCBhY2N1cmF0ZSBpbmZvcm1hdGlvbiB0byBvdXIgbmV3IGRhdGEuXG5cdCAqIEBwYXJhbSB7Z2VuZXNpc01lbnVzVW5jaGVja2VkfSBSYXcgZGF0YSBmcm9tIHRoZSBsb2NhbGl6ZWQgc2NyaXB0IGluIHRoZSB0aGVtZS5cblx0ICogQHJldHVybiB7YXJyYXl9IGdlbmVzaXNNZW51cyBhcnJheSBnZXRzIHBvcHVsYXRlZCB3aXRoIHVwZGF0ZWQgZGF0YS5cblx0ICogQHJldHVybiB7YXJyYXl9IG1lbnVzVG9Db21iaW5lIGFycmF5IGdldHMgcG9wdWxhdGVkIHdpdGggcmVsZXZhbnQgZGF0YS5cblx0ICovXG5cdCQuZWFjaCggZ2VuZXNpc01lbnVzVW5jaGVja2VkLCBmdW5jdGlvbiggZ3JvdXAgKSB7XG5cblx0XHQvLyBNaXJyb3Igb3VyIGdyb3VwIG9iamVjdCB0byBwb3B1bGF0ZS5cblx0XHRnZW5lc2lzTWVudXNbZ3JvdXBdID0gW107XG5cblx0XHQvLyBMb29wIHRocm91Z2ggZWFjaCBpbnN0YW5jZSBvZiB0aGUgc3BlY2lmaWVkIG1lbnUgb24gdGhlIHBhZ2UuXG5cdFx0JC5lYWNoKCB0aGlzLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblxuXHRcdFx0dmFyIG1lbnVTdHJpbmcgPSB2YWx1ZSxcblx0XHRcdFx0JG1lbnUgICAgICA9ICQodmFsdWUpO1xuXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIGluc3RhbmNlLCBhcHBlbmQgdGhlIGluZGV4IGFuZCB1cGRhdGUgYXJyYXkuXG5cdFx0XHRpZiAoICRtZW51Lmxlbmd0aCA+IDEgKSB7XG5cblx0XHRcdFx0JC5lYWNoKCAkbWVudSwgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cblx0XHRcdFx0XHR2YXIgbmV3U3RyaW5nID0gbWVudVN0cmluZyArICctJyArIGtleTtcblxuXHRcdFx0XHRcdCQodGhpcykuYWRkQ2xhc3MoIG5ld1N0cmluZy5yZXBsYWNlKCcuJywnJykgKTtcblxuXHRcdFx0XHRcdGdlbmVzaXNNZW51c1tncm91cF0ucHVzaCggbmV3U3RyaW5nICk7XG5cblx0XHRcdFx0XHRpZiAoICdjb21iaW5lJyA9PT0gZ3JvdXAgKSB7XG5cdFx0XHRcdFx0XHRtZW51c1RvQ29tYmluZS5wdXNoKCBuZXdTdHJpbmcgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSk7XG5cblx0XHRcdH0gZWxzZSBpZiAoICRtZW51Lmxlbmd0aCA9PSAxICkge1xuXG5cdFx0XHRcdGdlbmVzaXNNZW51c1tncm91cF0ucHVzaCggbWVudVN0cmluZyApO1xuXG5cdFx0XHRcdGlmICggJ2NvbWJpbmUnID09PSBncm91cCApIHtcblx0XHRcdFx0XHRtZW51c1RvQ29tYmluZS5wdXNoKCBtZW51U3RyaW5nICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0fSk7XG5cblx0Ly8gTWFrZSBzdXJlIHRoZXJlIGlzIHNvbWV0aGluZyB0byB1c2UgZm9yIHRoZSAnb3RoZXJzJyBhcnJheS5cblx0aWYgKCB0eXBlb2YgZ2VuZXNpc01lbnVzLm90aGVycyA9PSAndW5kZWZpbmVkJyApIHtcblx0XHRnZW5lc2lzTWVudXMub3RoZXJzID0gW107XG5cdH1cblxuXHQvLyBJZiB0aGVyZSdzIG9ubHkgb25lIG1lbnUgb24gdGhlIHBhZ2UgZm9yIGNvbWJpbmluZywgcHVzaCBpdCB0byB0aGUgJ290aGVycycgYXJyYXkgYW5kIG51bGxpZnkgb3VyICdjb21iaW5lJyB2YXJpYWJsZS5cblx0aWYgKCBtZW51c1RvQ29tYmluZS5sZW5ndGggPT0gMSApIHtcblx0XHRnZW5lc2lzTWVudXMub3RoZXJzLnB1c2goIG1lbnVzVG9Db21iaW5lWzBdICk7XG5cdFx0Z2VuZXNpc01lbnVzLmNvbWJpbmUgPSBudWxsO1xuXHRcdG1lbnVzVG9Db21iaW5lID0gbnVsbDtcblx0fVxuXG5cdHZhciBnZW5lc2lzTWVudSAgICAgICAgID0ge30sXG5cdFx0bWFpbk1lbnVCdXR0b25DbGFzcyA9ICdtZW51LXRvZ2dsZScsXG5cdFx0c3ViTWVudUJ1dHRvbkNsYXNzICA9ICdzdWItbWVudS10b2dnbGUnLFxuXHRcdHJlc3BvbnNpdmVNZW51Q2xhc3MgPSAnZ2VuZXNpcy1yZXNwb25zaXZlLW1lbnUnO1xuXG5cdC8vIEluaXRpYWxpemUuXG5cdGdlbmVzaXNNZW51LmluaXQgPSBmdW5jdGlvbigpIHtcblxuXHRcdC8vIEV4aXQgZWFybHkgaWYgdGhlcmUgYXJlIG5vIG1lbnVzIHRvIGRvIGFueXRoaW5nLlxuXHRcdGlmICggJCggX2dldEFsbE1lbnVzQXJyYXkoKSApLmxlbmd0aCA9PSAwICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBtZW51SWNvbkNsYXNzICAgICA9IHR5cGVvZiBnZW5lc2lzTWVudVBhcmFtcy5tZW51SWNvbkNsYXNzICE9PSAndW5kZWZpbmVkJyA/IGdlbmVzaXNNZW51UGFyYW1zLm1lbnVJY29uQ2xhc3MgOiAnZGFzaGljb25zLWJlZm9yZSBkYXNoaWNvbnMtbWVudScsXG5cdFx0XHRzdWJNZW51SWNvbkNsYXNzICA9IHR5cGVvZiBnZW5lc2lzTWVudVBhcmFtcy5zdWJNZW51SWNvbkNsYXNzICE9PSAndW5kZWZpbmVkJyA/IGdlbmVzaXNNZW51UGFyYW1zLnN1Yk1lbnVJY29uQ2xhc3MgOiAnZGFzaGljb25zLWJlZm9yZSBkYXNoaWNvbnMtYXJyb3ctZG93bi1hbHQyJyxcblx0XHRcdHRvZ2dsZUJ1dHRvbnMgICAgID0ge1xuXHRcdFx0XHRtZW51IDogJCggJzxidXR0b24gLz4nLCB7XG5cdFx0XHRcdFx0J2NsYXNzJyA6IG1haW5NZW51QnV0dG9uQ2xhc3MsXG5cdFx0XHRcdFx0J2FyaWEtZXhwYW5kZWQnIDogZmFsc2UsXG5cdFx0XHRcdFx0J2FyaWEtcHJlc3NlZCcgOiBmYWxzZSxcblx0XHRcdFx0XHQncm9sZSdcdFx0XHQ6ICdidXR0b24nLFxuXHRcdFx0XHRcdH0gKVxuXHRcdFx0XHRcdC5hcHBlbmQoICQoICc8c3BhbiAvPicsIHtcblx0XHRcdFx0XHRcdCdjbGFzcycgOiAnc2NyZWVuLXJlYWRlci10ZXh0Jyxcblx0XHRcdFx0XHRcdCd0ZXh0JyA6IGdlbmVzaXNNZW51UGFyYW1zLm1haW5NZW51XG5cdFx0XHRcdFx0fSApICksXG5cdFx0XHRcdHN1Ym1lbnUgOiAkKCAnPGJ1dHRvbiAvPicsIHtcblx0XHRcdFx0XHQnY2xhc3MnIDogc3ViTWVudUJ1dHRvbkNsYXNzLFxuXHRcdFx0XHRcdCdhcmlhLWV4cGFuZGVkJyA6IGZhbHNlLFxuXHRcdFx0XHRcdCdhcmlhLXByZXNzZWQnICA6IGZhbHNlLFxuXHRcdFx0XHRcdCd0ZXh0J1x0XHRcdDogJydcblx0XHRcdFx0XHR9IClcblx0XHRcdFx0XHQuYXBwZW5kKCAkKCAnPHNwYW4gLz4nLCB7XG5cdFx0XHRcdFx0XHQnY2xhc3MnIDogJ3NjcmVlbi1yZWFkZXItdGV4dCcsXG5cdFx0XHRcdFx0XHQndGV4dCcgOiBnZW5lc2lzTWVudVBhcmFtcy5zdWJNZW51XG5cdFx0XHRcdFx0fSApIClcblx0XHRcdH07XG5cblx0XHQvLyBBZGQgdGhlIHJlc3BvbnNpdmUgbWVudSBjbGFzcyB0byB0aGUgYWN0aXZlIG1lbnVzLlxuXHRcdF9hZGRSZXNwb25zaXZlTWVudUNsYXNzKCk7XG5cblx0XHQvLyBBZGQgdGhlIG1haW4gbmF2IGJ1dHRvbiB0byB0aGUgcHJpbWFyeSBtZW51LCBvciBleGl0IHRoZSBwbHVnaW4uXG5cdFx0X2FkZE1lbnVCdXR0b25zKCB0b2dnbGVCdXR0b25zICk7XG5cblx0XHQvLyBTZXR1cCBhZGRpdGlvbmFsIGNsYXNzZXMuXG5cdFx0JCggJy4nICsgbWFpbk1lbnVCdXR0b25DbGFzcyApLmFkZENsYXNzKCBtZW51SWNvbkNsYXNzICk7XG5cdFx0JCggJy4nICsgc3ViTWVudUJ1dHRvbkNsYXNzICkuYWRkQ2xhc3MoIHN1Yk1lbnVJY29uQ2xhc3MgKTtcblx0XHQkKCAnLicgKyBtYWluTWVudUJ1dHRvbkNsYXNzICkub24oICdjbGljay5nZW5lc2lzTWVudS1tYWluYnV0dG9uJywgX21haW5tZW51VG9nZ2xlICkuZWFjaCggX2FkZENsYXNzSUQgKTtcblx0XHQkKCAnLicgKyBzdWJNZW51QnV0dG9uQ2xhc3MgKS5vbiggJ2NsaWNrLmdlbmVzaXNNZW51LXN1YmJ1dHRvbicsIF9zdWJtZW51VG9nZ2xlICk7XG5cdFx0JCggd2luZG93ICkub24oICdyZXNpemUuZ2VuZXNpc01lbnUnLCBfZG9SZXNpemUgKS50cmlnZ2VySGFuZGxlciggJ3Jlc2l6ZS5nZW5lc2lzTWVudScgKTtcblx0fTtcblxuXHQvKipcblx0ICogQWRkIG1lbnUgdG9nZ2xlIGJ1dHRvbiB0byBhcHByb3ByaWF0ZSBtZW51cy5cblx0ICogQHBhcmFtIHt0b2dnbGVCdXR0b25zfSBPYmplY3Qgb2YgbWVudSBidXR0b25zIHRvIHVzZSBmb3IgdG9nZ2xlcy5cblx0ICovXG5cdGZ1bmN0aW9uIF9hZGRNZW51QnV0dG9ucyggdG9nZ2xlQnV0dG9ucyApIHtcblxuXHRcdC8vIEFwcGx5IHN1YiBtZW51IHRvZ2dsZSB0byBlYWNoIHN1Yi1tZW51IGZvdW5kIGluIHRoZSBtZW51TGlzdC5cblx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBnZW5lc2lzTWVudXMgKSApLmZpbmQoICcuc3ViLW1lbnUnICkuYmVmb3JlKCB0b2dnbGVCdXR0b25zLnN1Ym1lbnUgKTtcblxuXG5cdFx0aWYgKCBtZW51c1RvQ29tYmluZSAhPT0gbnVsbCApIHtcblxuXHRcdFx0dmFyIG1lbnVzVG9Ub2dnbGUgPSBnZW5lc2lzTWVudXMub3RoZXJzLmNvbmNhdCggbWVudXNUb0NvbWJpbmVbMF0gKTtcblxuXHRcdCBcdC8vIE9ubHkgYWRkIG1lbnUgYnV0dG9uIHRoZSBwcmltYXJ5IG1lbnUgYW5kIG5hdnMgTk9UIGluIHRoZSBjb21iaW5lIHZhcmlhYmxlLlxuXHRcdCBcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIG1lbnVzVG9Ub2dnbGUgKSApLmJlZm9yZSggdG9nZ2xlQnV0dG9ucy5tZW51ICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBBcHBseSB0aGUgbWFpbiBtZW51IHRvZ2dsZSB0byBhbGwgbWVudXMgaW4gdGhlIGxpc3QuXG5cdFx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBnZW5lc2lzTWVudXMub3RoZXJzICkgKS5iZWZvcmUoIHRvZ2dsZUJ1dHRvbnMubWVudSApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQWRkIHRoZSByZXNwb25zaXZlIG1lbnUgY2xhc3MuXG5cdCAqL1xuXHRmdW5jdGlvbiBfYWRkUmVzcG9uc2l2ZU1lbnVDbGFzcygpIHtcblx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBnZW5lc2lzTWVudXMgKSApLmFkZENsYXNzKCByZXNwb25zaXZlTWVudUNsYXNzICk7XG5cdH1cblxuXHQvKipcblx0ICogRXhlY3V0ZSBvdXIgcmVzcG9uc2l2ZSBtZW51IGZ1bmN0aW9ucyBvbiB3aW5kb3cgcmVzaXppbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiBfZG9SZXNpemUoKSB7XG5cdFx0dmFyIGJ1dHRvbnMgICA9ICQoICdidXR0b25baWRePVwiZ2VuZXNpcy1tb2JpbGUtXCJdJyApLmF0dHIoICdpZCcgKTtcblx0XHRpZiAoIHR5cGVvZiBidXR0b25zID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0X21heWJlQ2xvc2UoIGJ1dHRvbnMgKTtcblx0XHRfc3VwZXJmaXNoVG9nZ2xlKCBidXR0b25zICk7XG5cdFx0X2NoYW5nZVNraXBMaW5rKCBidXR0b25zICk7XG5cdFx0X2NvbWJpbmVNZW51cyggYnV0dG9ucyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCB0aGUgbmF2LSBjbGFzcyBvZiB0aGUgcmVsYXRlZCBuYXZpZ2F0aW9uIG1lbnUgYXNcblx0ICogYW4gSUQgdG8gYXNzb2NpYXRlZCBidXR0b24gKGhlbHBzIHRhcmdldCBzcGVjaWZpYyBidXR0b25zIG91dHNpZGUgb2YgY29udGV4dCkuXG5cdCAqL1xuXHRmdW5jdGlvbiBfYWRkQ2xhc3NJRCgpIHtcblx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0XHRuYXYgICA9ICR0aGlzLm5leHQoICduYXYnICksXG5cdFx0XHRpZCAgICA9ICdjbGFzcyc7XG5cblx0XHQkdGhpcy5hdHRyKCAnaWQnLCAnZ2VuZXNpcy1tb2JpbGUtJyArICQoIG5hdiApLmF0dHIoIGlkICkubWF0Y2goIC9uYXYtXFx3KlxcYi8gKSApO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbWJpbmUgb3VyIG1lbnVzIGlmIHRoZSBtb2JpbGUgbWVudSBpcyB2aXNpYmxlLlxuXHQgKiBAcGFyYW1zIGJ1dHRvbnNcblx0ICovXG5cdGZ1bmN0aW9uIF9jb21iaW5lTWVudXMoIGJ1dHRvbnMgKXtcblxuXHRcdC8vIEV4aXQgZWFybHkgaWYgdGhlcmUgYXJlIG5vIG1lbnVzIHRvIGNvbWJpbmUuXG5cdFx0aWYgKCBtZW51c1RvQ29tYmluZSA9PSBudWxsICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNwbGl0IHVwIHRoZSBtZW51cyB0byBjb21iaW5lIGJhc2VkIG9uIG9yZGVyIG9mIGFwcGVhcmFuY2UgaW4gdGhlIGFycmF5LlxuXHRcdHZhciBwcmltYXJ5TWVudSAgID0gbWVudXNUb0NvbWJpbmVbMF0sXG5cdFx0XHRjb21iaW5lZE1lbnVzID0gJCggbWVudXNUb0NvbWJpbmUgKS5maWx0ZXIoIGZ1bmN0aW9uKGluZGV4KSB7IGlmICggaW5kZXggPiAwICkgeyByZXR1cm4gaW5kZXg7IH0gfSk7XG5cblx0XHQvLyBJZiB0aGUgcmVzcG9uc2l2ZSBtZW51IGlzIGFjdGl2ZSwgYXBwZW5kIGl0ZW1zIGluICdjb21iaW5lZE1lbnVzJyBvYmplY3QgdG8gdGhlICdwcmltYXJ5TWVudScgb2JqZWN0LlxuXHRcdGlmICggJ25vbmUnICE9PSBfZ2V0RGlzcGxheVZhbHVlKCBidXR0b25zICkgKSB7XG5cblx0XHRcdCQuZWFjaCggY29tYmluZWRNZW51cywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRcdCQodmFsdWUpLmZpbmQoICcubWVudSA+IGxpJyApLmFkZENsYXNzKCAnbW92ZWQtaXRlbS0nICsgdmFsdWUucmVwbGFjZSggJy4nLCcnICkgKS5hcHBlbmRUbyggcHJpbWFyeU1lbnUgKyAnIHVsLmdlbmVzaXMtbmF2LW1lbnUnICk7XG5cdFx0XHR9KTtcblx0XHRcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGNvbWJpbmVkTWVudXMgKSApLmhpZGUoKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGNvbWJpbmVkTWVudXMgKSApLnNob3coKTtcblx0XHRcdCQuZWFjaCggY29tYmluZWRNZW51cywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRcdCQoICcubW92ZWQtaXRlbS0nICsgdmFsdWUucmVwbGFjZSggJy4nLCcnICkgKS5hcHBlbmRUbyggdmFsdWUgKyAnIHVsLmdlbmVzaXMtbmF2LW1lbnUnICkucmVtb3ZlQ2xhc3MoICdtb3ZlZC1pdGVtLScgKyB2YWx1ZS5yZXBsYWNlKCAnLicsJycgKSApO1xuXHRcdFx0fSk7XG5cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBBY3Rpb24gdG8gaGFwcGVuIHdoZW4gdGhlIG1haW4gbWVudSBidXR0b24gaXMgY2xpY2tlZC5cblx0ICovXG5cdGZ1bmN0aW9uIF9tYWlubWVudVRvZ2dsZSgpIHtcblx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICk7XG5cdFx0X3RvZ2dsZUFyaWEoICR0aGlzLCAnYXJpYS1wcmVzc2VkJyApO1xuXHRcdF90b2dnbGVBcmlhKCAkdGhpcywgJ2FyaWEtZXhwYW5kZWQnICk7XG5cdFx0JHRoaXMudG9nZ2xlQ2xhc3MoICdhY3RpdmF0ZWQnICk7XG5cdFx0JHRoaXMubmV4dCggJ25hdicgKS5zbGlkZVRvZ2dsZSggJ2Zhc3QnICk7XG5cdH1cblxuXHQvKipcblx0ICogQWN0aW9uIGZvciBzdWJtZW51IHRvZ2dsZXMuXG5cdCAqL1xuXHRmdW5jdGlvbiBfc3VibWVudVRvZ2dsZSgpIHtcblxuXHRcdHZhciAkdGhpcyAgPSAkKCB0aGlzICksXG5cdFx0XHRvdGhlcnMgPSAkdGhpcy5jbG9zZXN0KCAnLm1lbnUtaXRlbScgKS5zaWJsaW5ncygpO1xuXHRcdF90b2dnbGVBcmlhKCAkdGhpcywgJ2FyaWEtcHJlc3NlZCcgKTtcblx0XHRfdG9nZ2xlQXJpYSggJHRoaXMsICdhcmlhLWV4cGFuZGVkJyApO1xuXHRcdCR0aGlzLnRvZ2dsZUNsYXNzKCAnYWN0aXZhdGVkJyApO1xuXHRcdCR0aGlzLm5leHQoICcuc3ViLW1lbnUnICkuc2xpZGVUb2dnbGUoICdmYXN0JyApO1xuXG5cdFx0b3RoZXJzLmZpbmQoICcuJyArIHN1Yk1lbnVCdXR0b25DbGFzcyApLnJlbW92ZUNsYXNzKCAnYWN0aXZhdGVkJyApLmF0dHIoICdhcmlhLXByZXNzZWQnLCAnZmFsc2UnICk7XG5cdFx0b3RoZXJzLmZpbmQoICcuc3ViLW1lbnUnICkuc2xpZGVVcCggJ2Zhc3QnICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBBY3RpdmF0ZS9kZWFjdGl2YXRlIHN1cGVyZmlzaC5cblx0ICogQHBhcmFtcyBidXR0b25zXG5cdCAqL1xuXHRmdW5jdGlvbiBfc3VwZXJmaXNoVG9nZ2xlKCBidXR0b25zICkge1xuXHRcdHZhciBfc3VwZXJmaXNoID0gJCggJy4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLmpzLXN1cGVyZmlzaCcgKSxcblx0XHRcdCRhcmdzICAgICAgPSAnZGVzdHJveSc7XG5cdFx0aWYgKCB0eXBlb2YgX3N1cGVyZmlzaC5zdXBlcmZpc2ggIT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmICggJ25vbmUnID09PSBfZ2V0RGlzcGxheVZhbHVlKCBidXR0b25zICkgKSB7XG5cdFx0XHQkYXJncyA9IHtcblx0XHRcdFx0J2RlbGF5JzogMCxcblx0XHRcdFx0J2FuaW1hdGlvbic6IHsnb3BhY2l0eSc6ICdzaG93J30sXG5cdFx0XHRcdCdzcGVlZCc6IDMwMCxcblx0XHRcdFx0J2Rpc2FibGVISSc6IHRydWVcblx0XHRcdH07XG5cdFx0fVxuXHRcdF9zdXBlcmZpc2guc3VwZXJmaXNoKCAkYXJncyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vZGlmeSBza2lwIGxpbmsgdG8gbWF0Y2ggbW9iaWxlIGJ1dHRvbnMuXG5cdCAqIEBwYXJhbSBidXR0b25zXG5cdCAqL1xuXHRmdW5jdGlvbiBfY2hhbmdlU2tpcExpbmsoIGJ1dHRvbnMgKSB7XG5cblx0XHQvLyBTdGFydCB3aXRoIGFuIGVtcHR5IGFycmF5LlxuXHRcdHZhciBtZW51VG9nZ2xlTGlzdCA9IF9nZXRBbGxNZW51c0FycmF5KCk7XG5cblx0XHQvLyBFeGl0IG91dCBpZiB0aGVyZSBhcmUgbm8gbWVudSBpdGVtcyB0byB1cGRhdGUuXG5cdFx0aWYgKCAhICQoIG1lbnVUb2dnbGVMaXN0ICkubGVuZ3RoID4gMCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkLmVhY2goIG1lbnVUb2dnbGVMaXN0LCBmdW5jdGlvbiAoIGtleSwgdmFsdWUgKSB7XG5cblx0XHRcdHZhciBuZXdWYWx1ZSAgPSB2YWx1ZS5yZXBsYWNlKCAnLicsICcnICksXG5cdFx0XHRcdHN0YXJ0TGluayA9ICdnZW5lc2lzLScgKyBuZXdWYWx1ZSxcblx0XHRcdFx0ZW5kTGluayAgID0gJ2dlbmVzaXMtbW9iaWxlLScgKyBuZXdWYWx1ZTtcblxuXHRcdFx0aWYgKCAnbm9uZScgPT0gX2dldERpc3BsYXlWYWx1ZSggYnV0dG9ucyApICkge1xuXHRcdFx0XHRzdGFydExpbmsgPSAnZ2VuZXNpcy1tb2JpbGUtJyArIG5ld1ZhbHVlO1xuXHRcdFx0XHRlbmRMaW5rICAgPSAnZ2VuZXNpcy0nICsgbmV3VmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciAkaXRlbSA9ICQoICcuZ2VuZXNpcy1za2lwLWxpbmsgYVtocmVmPVwiIycgKyBzdGFydExpbmsgKyAnXCJdJyApO1xuXG5cdFx0XHRpZiAoIG1lbnVzVG9Db21iaW5lICE9PSBudWxsICYmIHZhbHVlICE9PSBtZW51c1RvQ29tYmluZVswXSApIHtcblx0XHRcdFx0JGl0ZW0udG9nZ2xlQ2xhc3MoICdza2lwLWxpbmstaGlkZGVuJyApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICRpdGVtLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRcdHZhciBsaW5rICA9ICRpdGVtLmF0dHIoICdocmVmJyApO1xuXHRcdFx0XHRcdGxpbmsgID0gbGluay5yZXBsYWNlKCBzdGFydExpbmssIGVuZExpbmsgKTtcblxuXHRcdFx0XHQkaXRlbS5hdHRyKCAnaHJlZicsIGxpbmsgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cdH1cblxuXHQvKipcblx0ICogQ2xvc2UgYWxsIHRoZSBtZW51IHRvZ2dsZXMgaWYgYnV0dG9ucyBhcmUgaGlkZGVuLlxuXHQgKiBAcGFyYW0gYnV0dG9uc1xuXHQgKi9cblx0ZnVuY3Rpb24gX21heWJlQ2xvc2UoIGJ1dHRvbnMgKSB7XG5cdFx0aWYgKCAnbm9uZScgIT09IF9nZXREaXNwbGF5VmFsdWUoIGJ1dHRvbnMgKSApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdCQoICcuJyArIG1haW5NZW51QnV0dG9uQ2xhc3MgKyAnLCAuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnIC5zdWItbWVudS10b2dnbGUnIClcblx0XHRcdC5yZW1vdmVDbGFzcyggJ2FjdGl2YXRlZCcgKVxuXHRcdFx0LmF0dHIoICdhcmlhLWV4cGFuZGVkJywgZmFsc2UgKVxuXHRcdFx0LmF0dHIoICdhcmlhLXByZXNzZWQnLCBmYWxzZSApO1xuXG5cdFx0JCggJy4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcsIC4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLnN1Yi1tZW51JyApXG5cdFx0XHQuYXR0ciggJ3N0eWxlJywgJycgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZW5lcmljIGZ1bmN0aW9uIHRvIGdldCB0aGUgZGlzcGxheSB2YWx1ZSBvZiBhbiBlbGVtZW50LlxuXHQgKiBAcGFyYW0gIHtpZH0gJGlkIElEIHRvIGNoZWNrXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gICAgIENTUyB2YWx1ZSBvZiBkaXNwbGF5IHByb3BlcnR5XG5cdCAqL1xuXHRmdW5jdGlvbiBfZ2V0RGlzcGxheVZhbHVlKCAkaWQgKSB7XG5cdFx0dmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJGlkICksXG5cdFx0XHRzdHlsZSAgID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoIGVsZW1lbnQgKTtcblx0XHRyZXR1cm4gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSggJ2Rpc3BsYXknICk7XG5cdH1cblxuXHQvKipcblx0ICogVG9nZ2xlIGFyaWEgYXR0cmlidXRlcy5cblx0ICogQHBhcmFtICB7YnV0dG9ufSAkdGhpcyAgICAgcGFzc2VkIHRocm91Z2hcblx0ICogQHBhcmFtICB7YXJpYS14eH0gYXR0cmlidXRlIGFyaWEgYXR0cmlidXRlIHRvIHRvZ2dsZVxuXHQgKiBAcmV0dXJuIHtib29sfSAgICAgICAgICAgZnJvbSBfYXJpYVJldHVyblxuXHQgKi9cblx0ZnVuY3Rpb24gX3RvZ2dsZUFyaWEoICR0aGlzLCBhdHRyaWJ1dGUgKSB7XG5cdFx0JHRoaXMuYXR0ciggYXR0cmlidXRlLCBmdW5jdGlvbiggaW5kZXgsIHZhbHVlICkge1xuXHRcdFx0cmV0dXJuICdmYWxzZScgPT09IHZhbHVlO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciBmdW5jdGlvbiB0byByZXR1cm4gYSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIG9mIG1lbnUgc2VsZWN0b3JzLlxuXHQgKiBAcGFyYW0ge2l0ZW1BcnJheX0gQXJyYXkgb2YgbWVudSBpdGVtcyB0byBsb29wIHRocm91Z2guXG5cdCAqIEBwYXJhbSB7aWdub3JlU2Vjb25kYXJ5fSBib29sZWFuIG9mIHdoZXRoZXIgdG8gaWdub3JlIHRoZSAnc2Vjb25kYXJ5JyBtZW51IGl0ZW0uXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gQ29tbWEtc2VwYXJhdGVkIHN0cmluZy5cblx0ICovXG5cdGZ1bmN0aW9uIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGl0ZW1BcnJheSApIHtcblxuXHRcdHZhciBpdGVtU3RyaW5nID0gJC5tYXAoIGl0ZW1BcnJheSwgZnVuY3Rpb24oIHZhbHVlLCBrZXkgKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gaXRlbVN0cmluZy5qb2luKCAnLCcgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciBmdW5jdGlvbiB0byByZXR1cm4gYSBncm91cCBhcnJheSBvZiBhbGwgdGhlIG1lbnVzIGluXG5cdCAqIGJvdGggdGhlICdvdGhlcnMnIGFuZCAnY29tYmluZScgYXJyYXlzLlxuXHQgKiBAcmV0dXJuIHthcnJheX0gQXJyYXkgb2YgYWxsIG1lbnUgaXRlbXMgYXMgY2xhc3Mgc2VsZWN0b3JzLlxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldEFsbE1lbnVzQXJyYXkoKSB7XG5cblx0XHQvLyBTdGFydCB3aXRoIGFuIGVtcHR5IGFycmF5LlxuXHRcdHZhciBtZW51TGlzdCA9IFtdO1xuXG5cdFx0Ly8gSWYgdGhlcmUgYXJlIG1lbnVzIGluIHRoZSAnbWVudXNUb0NvbWJpbmUnIGFycmF5LCBhZGQgdGhlbSB0byAnbWVudUxpc3QnLlxuXHRcdGlmICggbWVudXNUb0NvbWJpbmUgIT09IG51bGwgKSB7XG5cblx0XHRcdCQuZWFjaCggbWVudXNUb0NvbWJpbmUsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdFx0XHRtZW51TGlzdC5wdXNoKCB2YWx1ZS52YWx1ZU9mKCkgKTtcblx0XHRcdH0pO1xuXG5cdFx0fVxuXG5cdFx0Ly8gQWRkIG1lbnVzIGluIHRoZSAnb3RoZXJzJyBhcnJheSB0byAnbWVudUxpc3QnLlxuXHRcdCQuZWFjaCggZ2VuZXNpc01lbnVzLm90aGVycywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRtZW51TGlzdC5wdXNoKCB2YWx1ZS52YWx1ZU9mKCkgKTtcblx0XHR9KTtcblxuXHRcdGlmICggbWVudUxpc3QubGVuZ3RoID4gMCApIHtcblx0XHRcdHJldHVybiBtZW51TGlzdDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdH1cblxuXHQkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoIF9nZXRBbGxNZW51c0FycmF5KCkgIT09IG51bGwgKSB7XG5cblx0XHRcdGdlbmVzaXNNZW51LmluaXQoKTtcblxuXHRcdH1cblxuXHR9KTtcblxuXG59KSggZG9jdW1lbnQsIGpRdWVyeSApO1xuIiwiLyoqXG4gKiBob3ZlckludGVudCBpcyBzaW1pbGFyIHRvIGpRdWVyeSdzIGJ1aWx0LWluIFwiaG92ZXJcIiBtZXRob2QgZXhjZXB0IHRoYXRcbiAqIGluc3RlYWQgb2YgZmlyaW5nIHRoZSBoYW5kbGVySW4gZnVuY3Rpb24gaW1tZWRpYXRlbHksIGhvdmVySW50ZW50IGNoZWNrc1xuICogdG8gc2VlIGlmIHRoZSB1c2VyJ3MgbW91c2UgaGFzIHNsb3dlZCBkb3duIChiZW5lYXRoIHRoZSBzZW5zaXRpdml0eVxuICogdGhyZXNob2xkKSBiZWZvcmUgZmlyaW5nIHRoZSBldmVudC4gVGhlIGhhbmRsZXJPdXQgZnVuY3Rpb24gaXMgb25seVxuICogY2FsbGVkIGFmdGVyIGEgbWF0Y2hpbmcgaGFuZGxlckluLlxuICpcbiAqIGhvdmVySW50ZW50IHI3IC8vIDIwMTMuMDMuMTEgLy8galF1ZXJ5IDEuOS4xK1xuICogaHR0cDovL2NoZXJuZS5uZXQvYnJpYW4vcmVzb3VyY2VzL2pxdWVyeS5ob3ZlckludGVudC5odG1sXG4gKlxuICogWW91IG1heSB1c2UgaG92ZXJJbnRlbnQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgbGljZW5zZS4gQmFzaWNhbGx5IHRoYXRcbiAqIG1lYW5zIHlvdSBhcmUgZnJlZSB0byB1c2UgaG92ZXJJbnRlbnQgYXMgbG9uZyBhcyB0aGlzIGhlYWRlciBpcyBsZWZ0IGludGFjdC5cbiAqIENvcHlyaWdodCAyMDA3LCAyMDEzIEJyaWFuIENoZXJuZVxuICpcbiAqIC8vIGJhc2ljIHVzYWdlIC4uLiBqdXN0IGxpa2UgLmhvdmVyKClcbiAqIC5ob3ZlckludGVudCggaGFuZGxlckluLCBoYW5kbGVyT3V0IClcbiAqIC5ob3ZlckludGVudCggaGFuZGxlckluT3V0IClcbiAqXG4gKiAvLyBiYXNpYyB1c2FnZSAuLi4gd2l0aCBldmVudCBkZWxlZ2F0aW9uIVxuICogLmhvdmVySW50ZW50KCBoYW5kbGVySW4sIGhhbmRsZXJPdXQsIHNlbGVjdG9yIClcbiAqIC5ob3ZlckludGVudCggaGFuZGxlckluT3V0LCBzZWxlY3RvciApXG4gKlxuICogLy8gdXNpbmcgYSBiYXNpYyBjb25maWd1cmF0aW9uIG9iamVjdFxuICogLmhvdmVySW50ZW50KCBjb25maWcgKVxuICpcbiAqIEBwYXJhbSAgaGFuZGxlckluICAgZnVuY3Rpb24gT1IgY29uZmlndXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSAgaGFuZGxlck91dCAgZnVuY3Rpb24gT1Igc2VsZWN0b3IgZm9yIGRlbGVnYXRpb24gT1IgdW5kZWZpbmVkXG4gKiBAcGFyYW0gIHNlbGVjdG9yICAgIHNlbGVjdG9yIE9SIHVuZGVmaW5lZFxuICogQGF1dGhvciBCcmlhbiBDaGVybmUgPGJyaWFuKGF0KWNoZXJuZShkb3QpbmV0PlxuICoqL1xuKGZ1bmN0aW9uKCQpIHtcbiAgICAkLmZuLmhvdmVySW50ZW50ID0gZnVuY3Rpb24oaGFuZGxlckluLGhhbmRsZXJPdXQsc2VsZWN0b3IpIHtcblxuICAgICAgICAvLyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gdmFsdWVzXG4gICAgICAgIHZhciBjZmcgPSB7XG4gICAgICAgICAgICBpbnRlcnZhbDogMTAwLFxuICAgICAgICAgICAgc2Vuc2l0aXZpdHk6IDcsXG4gICAgICAgICAgICB0aW1lb3V0OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCB0eXBlb2YgaGFuZGxlckluID09PSBcIm9iamVjdFwiICkge1xuICAgICAgICAgICAgY2ZnID0gJC5leHRlbmQoY2ZnLCBoYW5kbGVySW4gKTtcbiAgICAgICAgfSBlbHNlIGlmICgkLmlzRnVuY3Rpb24oaGFuZGxlck91dCkpIHtcbiAgICAgICAgICAgIGNmZyA9ICQuZXh0ZW5kKGNmZywgeyBvdmVyOiBoYW5kbGVySW4sIG91dDogaGFuZGxlck91dCwgc2VsZWN0b3I6IHNlbGVjdG9yIH0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNmZyA9ICQuZXh0ZW5kKGNmZywgeyBvdmVyOiBoYW5kbGVySW4sIG91dDogaGFuZGxlckluLCBzZWxlY3RvcjogaGFuZGxlck91dCB9ICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbnN0YW50aWF0ZSB2YXJpYWJsZXNcbiAgICAgICAgLy8gY1gsIGNZID0gY3VycmVudCBYIGFuZCBZIHBvc2l0aW9uIG9mIG1vdXNlLCB1cGRhdGVkIGJ5IG1vdXNlbW92ZSBldmVudFxuICAgICAgICAvLyBwWCwgcFkgPSBwcmV2aW91cyBYIGFuZCBZIHBvc2l0aW9uIG9mIG1vdXNlLCBzZXQgYnkgbW91c2VvdmVyIGFuZCBwb2xsaW5nIGludGVydmFsXG4gICAgICAgIHZhciBjWCwgY1ksIHBYLCBwWTtcblxuICAgICAgICAvLyBBIHByaXZhdGUgZnVuY3Rpb24gZm9yIGdldHRpbmcgbW91c2UgcG9zaXRpb25cbiAgICAgICAgdmFyIHRyYWNrID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgICAgIGNYID0gZXYucGFnZVg7XG4gICAgICAgICAgICBjWSA9IGV2LnBhZ2VZO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEEgcHJpdmF0ZSBmdW5jdGlvbiBmb3IgY29tcGFyaW5nIGN1cnJlbnQgYW5kIHByZXZpb3VzIG1vdXNlIHBvc2l0aW9uXG4gICAgICAgIHZhciBjb21wYXJlID0gZnVuY3Rpb24oZXYsb2IpIHtcbiAgICAgICAgICAgIG9iLmhvdmVySW50ZW50X3QgPSBjbGVhclRpbWVvdXQob2IuaG92ZXJJbnRlbnRfdCk7XG4gICAgICAgICAgICAvLyBjb21wYXJlIG1vdXNlIHBvc2l0aW9ucyB0byBzZWUgaWYgdGhleSd2ZSBjcm9zc2VkIHRoZSB0aHJlc2hvbGRcbiAgICAgICAgICAgIGlmICggKCBNYXRoLmFicyhwWC1jWCkgKyBNYXRoLmFicyhwWS1jWSkgKSA8IGNmZy5zZW5zaXRpdml0eSApIHtcbiAgICAgICAgICAgICAgICAkKG9iKS5vZmYoXCJtb3VzZW1vdmUuaG92ZXJJbnRlbnRcIix0cmFjayk7XG4gICAgICAgICAgICAgICAgLy8gc2V0IGhvdmVySW50ZW50IHN0YXRlIHRvIHRydWUgKHNvIG1vdXNlT3V0IGNhbiBiZSBjYWxsZWQpXG4gICAgICAgICAgICAgICAgb2IuaG92ZXJJbnRlbnRfcyA9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNmZy5vdmVyLmFwcGx5KG9iLFtldl0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBzZXQgcHJldmlvdXMgY29vcmRpbmF0ZXMgZm9yIG5leHQgdGltZVxuICAgICAgICAgICAgICAgIHBYID0gY1g7IHBZID0gY1k7XG4gICAgICAgICAgICAgICAgLy8gdXNlIHNlbGYtY2FsbGluZyB0aW1lb3V0LCBndWFyYW50ZWVzIGludGVydmFscyBhcmUgc3BhY2VkIG91dCBwcm9wZXJseSAoYXZvaWRzIEphdmFTY3JpcHQgdGltZXIgYnVncylcbiAgICAgICAgICAgICAgICBvYi5ob3ZlckludGVudF90ID0gc2V0VGltZW91dCggZnVuY3Rpb24oKXtjb21wYXJlKGV2LCBvYik7fSAsIGNmZy5pbnRlcnZhbCApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEEgcHJpdmF0ZSBmdW5jdGlvbiBmb3IgZGVsYXlpbmcgdGhlIG1vdXNlT3V0IGZ1bmN0aW9uXG4gICAgICAgIHZhciBkZWxheSA9IGZ1bmN0aW9uKGV2LG9iKSB7XG4gICAgICAgICAgICBvYi5ob3ZlckludGVudF90ID0gY2xlYXJUaW1lb3V0KG9iLmhvdmVySW50ZW50X3QpO1xuICAgICAgICAgICAgb2IuaG92ZXJJbnRlbnRfcyA9IDA7XG4gICAgICAgICAgICByZXR1cm4gY2ZnLm91dC5hcHBseShvYixbZXZdKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBIHByaXZhdGUgZnVuY3Rpb24gZm9yIGhhbmRsaW5nIG1vdXNlICdob3ZlcmluZydcbiAgICAgICAgdmFyIGhhbmRsZUhvdmVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgLy8gY29weSBvYmplY3RzIHRvIGJlIHBhc3NlZCBpbnRvIHQgKHJlcXVpcmVkIGZvciBldmVudCBvYmplY3QgdG8gYmUgcGFzc2VkIGluIElFKVxuICAgICAgICAgICAgdmFyIGV2ID0galF1ZXJ5LmV4dGVuZCh7fSxlKTtcbiAgICAgICAgICAgIHZhciBvYiA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIGNhbmNlbCBob3ZlckludGVudCB0aW1lciBpZiBpdCBleGlzdHNcbiAgICAgICAgICAgIGlmIChvYi5ob3ZlckludGVudF90KSB7IG9iLmhvdmVySW50ZW50X3QgPSBjbGVhclRpbWVvdXQob2IuaG92ZXJJbnRlbnRfdCk7IH1cblxuICAgICAgICAgICAgLy8gaWYgZS50eXBlID09IFwibW91c2VlbnRlclwiXG4gICAgICAgICAgICBpZiAoZS50eXBlID09IFwibW91c2VlbnRlclwiKSB7XG4gICAgICAgICAgICAgICAgLy8gc2V0IFwicHJldmlvdXNcIiBYIGFuZCBZIHBvc2l0aW9uIGJhc2VkIG9uIGluaXRpYWwgZW50cnkgcG9pbnRcbiAgICAgICAgICAgICAgICBwWCA9IGV2LnBhZ2VYOyBwWSA9IGV2LnBhZ2VZO1xuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBcImN1cnJlbnRcIiBYIGFuZCBZIHBvc2l0aW9uIGJhc2VkIG9uIG1vdXNlbW92ZVxuICAgICAgICAgICAgICAgICQob2IpLm9uKFwibW91c2Vtb3ZlLmhvdmVySW50ZW50XCIsdHJhY2spO1xuICAgICAgICAgICAgICAgIC8vIHN0YXJ0IHBvbGxpbmcgaW50ZXJ2YWwgKHNlbGYtY2FsbGluZyB0aW1lb3V0KSB0byBjb21wYXJlIG1vdXNlIGNvb3JkaW5hdGVzIG92ZXIgdGltZVxuICAgICAgICAgICAgICAgIGlmIChvYi5ob3ZlckludGVudF9zICE9IDEpIHsgb2IuaG92ZXJJbnRlbnRfdCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7Y29tcGFyZShldixvYik7fSAsIGNmZy5pbnRlcnZhbCApO31cblxuICAgICAgICAgICAgICAgIC8vIGVsc2UgZS50eXBlID09IFwibW91c2VsZWF2ZVwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHVuYmluZCBleHBlbnNpdmUgbW91c2Vtb3ZlIGV2ZW50XG4gICAgICAgICAgICAgICAgJChvYikub2ZmKFwibW91c2Vtb3ZlLmhvdmVySW50ZW50XCIsdHJhY2spO1xuICAgICAgICAgICAgICAgIC8vIGlmIGhvdmVySW50ZW50IHN0YXRlIGlzIHRydWUsIHRoZW4gY2FsbCB0aGUgbW91c2VPdXQgZnVuY3Rpb24gYWZ0ZXIgdGhlIHNwZWNpZmllZCBkZWxheVxuICAgICAgICAgICAgICAgIGlmIChvYi5ob3ZlckludGVudF9zID09IDEpIHsgb2IuaG92ZXJJbnRlbnRfdCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7ZGVsYXkoZXYsb2IpO30gLCBjZmcudGltZW91dCApO31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBsaXN0ZW4gZm9yIG1vdXNlZW50ZXIgYW5kIG1vdXNlbGVhdmVcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeydtb3VzZWVudGVyLmhvdmVySW50ZW50JzpoYW5kbGVIb3ZlciwnbW91c2VsZWF2ZS5ob3ZlckludGVudCc6aGFuZGxlSG92ZXJ9LCBjZmcuc2VsZWN0b3IpO1xuICAgIH07XG59KShqUXVlcnkpOyIsIi8qIVxuICogaW1hZ2VzTG9hZGVkIFBBQ0tBR0VEIHY0LjEuNFxuICogSmF2YVNjcmlwdCBpcyBhbGwgbGlrZSBcIllvdSBpbWFnZXMgYXJlIGRvbmUgeWV0IG9yIHdoYXQ/XCJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLyoqXG4gKiBFdkVtaXR0ZXIgdjEuMS4wXG4gKiBMaWwnIGV2ZW50IGVtaXR0ZXJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLyoganNoaW50IHVudXNlZDogdHJ1ZSwgdW5kZWY6IHRydWUsIHN0cmljdDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCBnbG9iYWwsIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKiBnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCB3aW5kb3cgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTUQgLSBSZXF1aXJlSlNcbiAgICBkZWZpbmUoICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInLGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KUyAtIEJyb3dzZXJpZnksIFdlYnBhY2tcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBnbG9iYWwuRXZFbWl0dGVyID0gZmFjdG9yeSgpO1xuICB9XG5cbn0oIHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLCBmdW5jdGlvbigpIHtcblxuXG5cbmZ1bmN0aW9uIEV2RW1pdHRlcigpIHt9XG5cbnZhciBwcm90byA9IEV2RW1pdHRlci5wcm90b3R5cGU7XG5cbnByb3RvLm9uID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNldCBldmVudHMgaGFzaFxuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICAvLyBzZXQgbGlzdGVuZXJzIGFycmF5XG4gIHZhciBsaXN0ZW5lcnMgPSBldmVudHNbIGV2ZW50TmFtZSBdID0gZXZlbnRzWyBldmVudE5hbWUgXSB8fCBbXTtcbiAgLy8gb25seSBhZGQgb25jZVxuICBpZiAoIGxpc3RlbmVycy5pbmRleE9mKCBsaXN0ZW5lciApID09IC0xICkge1xuICAgIGxpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vbmNlID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGFkZCBldmVudFxuICB0aGlzLm9uKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gIC8vIHNldCBvbmNlIGZsYWdcbiAgLy8gc2V0IG9uY2VFdmVudHMgaGFzaFxuICB2YXIgb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzIHx8IHt9O1xuICAvLyBzZXQgb25jZUxpc3RlbmVycyBvYmplY3RcbiAgdmFyIG9uY2VMaXN0ZW5lcnMgPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdIHx8IHt9O1xuICAvLyBzZXQgZmxhZ1xuICBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLm9mZiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgYXJncyApIHtcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGNvcHkgb3ZlciB0byBhdm9pZCBpbnRlcmZlcmVuY2UgaWYgLm9mZigpIGluIGxpc3RlbmVyXG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSgwKTtcbiAgYXJncyA9IGFyZ3MgfHwgW107XG4gIC8vIG9uY2Ugc3R1ZmZcbiAgdmFyIG9uY2VMaXN0ZW5lcnMgPSB0aGlzLl9vbmNlRXZlbnRzICYmIHRoaXMuX29uY2VFdmVudHNbIGV2ZW50TmFtZSBdO1xuXG4gIGZvciAoIHZhciBpPTA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldXG4gICAgdmFyIGlzT25jZSA9IG9uY2VMaXN0ZW5lcnMgJiYgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICBpZiAoIGlzT25jZSApIHtcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgICAgLy8gcmVtb3ZlIGJlZm9yZSB0cmlnZ2VyIHRvIHByZXZlbnQgcmVjdXJzaW9uXG4gICAgICB0aGlzLm9mZiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAgICAgLy8gdW5zZXQgb25jZSBmbGFnXG4gICAgICBkZWxldGUgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgLy8gdHJpZ2dlciBsaXN0ZW5lclxuICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmFsbE9mZiA9IGZ1bmN0aW9uKCkge1xuICBkZWxldGUgdGhpcy5fZXZlbnRzO1xuICBkZWxldGUgdGhpcy5fb25jZUV2ZW50cztcbn07XG5cbnJldHVybiBFdkVtaXR0ZXI7XG5cbn0pKTtcblxuLyohXG4gKiBpbWFnZXNMb2FkZWQgdjQuMS40XG4gKiBKYXZhU2NyaXB0IGlzIGFsbCBsaWtlIFwiWW91IGltYWdlcyBhcmUgZG9uZSB5ZXQgb3Igd2hhdD9cIlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7ICd1c2Ugc3RyaWN0JztcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG5cbiAgLypnbG9iYWwgZGVmaW5lOiBmYWxzZSwgbW9kdWxlOiBmYWxzZSwgcmVxdWlyZTogZmFsc2UgKi9cblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2V2LWVtaXR0ZXIvZXYtZW1pdHRlcidcbiAgICBdLCBmdW5jdGlvbiggRXZFbWl0dGVyICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdldi1lbWl0dGVyJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LmltYWdlc0xvYWRlZCA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuRXZFbWl0dGVyXG4gICAgKTtcbiAgfVxuXG59KSggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLFxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgZmFjdG9yeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApIHtcblxuXG5cbnZhciAkID0gd2luZG93LmpRdWVyeTtcbnZhciBjb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZXh0ZW5kIG9iamVjdHNcbmZ1bmN0aW9uIGV4dGVuZCggYSwgYiApIHtcbiAgZm9yICggdmFyIHByb3AgaW4gYiApIHtcbiAgICBhWyBwcm9wIF0gPSBiWyBwcm9wIF07XG4gIH1cbiAgcmV0dXJuIGE7XG59XG5cbnZhciBhcnJheVNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4vLyB0dXJuIGVsZW1lbnQgb3Igbm9kZUxpc3QgaW50byBhbiBhcnJheVxuZnVuY3Rpb24gbWFrZUFycmF5KCBvYmogKSB7XG4gIGlmICggQXJyYXkuaXNBcnJheSggb2JqICkgKSB7XG4gICAgLy8gdXNlIG9iamVjdCBpZiBhbHJlYWR5IGFuIGFycmF5XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciBpc0FycmF5TGlrZSA9IHR5cGVvZiBvYmogPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iai5sZW5ndGggPT0gJ251bWJlcic7XG4gIGlmICggaXNBcnJheUxpa2UgKSB7XG4gICAgLy8gY29udmVydCBub2RlTGlzdCB0byBhcnJheVxuICAgIHJldHVybiBhcnJheVNsaWNlLmNhbGwoIG9iaiApO1xuICB9XG5cbiAgLy8gYXJyYXkgb2Ygc2luZ2xlIGluZGV4XG4gIHJldHVybiBbIG9iaiBdO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBpbWFnZXNMb2FkZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBAcGFyYW0ge0FycmF5LCBFbGVtZW50LCBOb2RlTGlzdCwgU3RyaW5nfSBlbGVtXG4gKiBAcGFyYW0ge09iamVjdCBvciBGdW5jdGlvbn0gb3B0aW9ucyAtIGlmIGZ1bmN0aW9uLCB1c2UgYXMgY2FsbGJhY2tcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9uQWx3YXlzIC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gSW1hZ2VzTG9hZGVkKCBlbGVtLCBvcHRpb25zLCBvbkFsd2F5cyApIHtcbiAgLy8gY29lcmNlIEltYWdlc0xvYWRlZCgpIHdpdGhvdXQgbmV3LCB0byBiZSBuZXcgSW1hZ2VzTG9hZGVkKClcbiAgaWYgKCAhKCB0aGlzIGluc3RhbmNlb2YgSW1hZ2VzTG9hZGVkICkgKSB7XG4gICAgcmV0dXJuIG5ldyBJbWFnZXNMb2FkZWQoIGVsZW0sIG9wdGlvbnMsIG9uQWx3YXlzICk7XG4gIH1cbiAgLy8gdXNlIGVsZW0gYXMgc2VsZWN0b3Igc3RyaW5nXG4gIHZhciBxdWVyeUVsZW0gPSBlbGVtO1xuICBpZiAoIHR5cGVvZiBlbGVtID09ICdzdHJpbmcnICkge1xuICAgIHF1ZXJ5RWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIGVsZW0gKTtcbiAgfVxuICAvLyBiYWlsIGlmIGJhZCBlbGVtZW50XG4gIGlmICggIXF1ZXJ5RWxlbSApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnQmFkIGVsZW1lbnQgZm9yIGltYWdlc0xvYWRlZCAnICsgKCBxdWVyeUVsZW0gfHwgZWxlbSApICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5lbGVtZW50cyA9IG1ha2VBcnJheSggcXVlcnlFbGVtICk7XG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZCgge30sIHRoaXMub3B0aW9ucyApO1xuICAvLyBzaGlmdCBhcmd1bWVudHMgaWYgbm8gb3B0aW9ucyBzZXRcbiAgaWYgKCB0eXBlb2Ygb3B0aW9ucyA9PSAnZnVuY3Rpb24nICkge1xuICAgIG9uQWx3YXlzID0gb3B0aW9ucztcbiAgfSBlbHNlIHtcbiAgICBleHRlbmQoIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xuICB9XG5cbiAgaWYgKCBvbkFsd2F5cyApIHtcbiAgICB0aGlzLm9uKCAnYWx3YXlzJywgb25BbHdheXMgKTtcbiAgfVxuXG4gIHRoaXMuZ2V0SW1hZ2VzKCk7XG5cbiAgaWYgKCAkICkge1xuICAgIC8vIGFkZCBqUXVlcnkgRGVmZXJyZWQgb2JqZWN0XG4gICAgdGhpcy5qcURlZmVycmVkID0gbmV3ICQuRGVmZXJyZWQoKTtcbiAgfVxuXG4gIC8vIEhBQ0sgY2hlY2sgYXN5bmMgdG8gYWxsb3cgdGltZSB0byBiaW5kIGxpc3RlbmVyc1xuICBzZXRUaW1lb3V0KCB0aGlzLmNoZWNrLmJpbmQoIHRoaXMgKSApO1xufVxuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLm9wdGlvbnMgPSB7fTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5nZXRJbWFnZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWFnZXMgPSBbXTtcblxuICAvLyBmaWx0ZXIgJiBmaW5kIGl0ZW1zIGlmIHdlIGhhdmUgYW4gaXRlbSBzZWxlY3RvclxuICB0aGlzLmVsZW1lbnRzLmZvckVhY2goIHRoaXMuYWRkRWxlbWVudEltYWdlcywgdGhpcyApO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnRcbiAqL1xuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRFbGVtZW50SW1hZ2VzID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIC8vIGZpbHRlciBzaWJsaW5nc1xuICBpZiAoIGVsZW0ubm9kZU5hbWUgPT0gJ0lNRycgKSB7XG4gICAgdGhpcy5hZGRJbWFnZSggZWxlbSApO1xuICB9XG4gIC8vIGdldCBiYWNrZ3JvdW5kIGltYWdlIG9uIGVsZW1lbnRcbiAgaWYgKCB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCA9PT0gdHJ1ZSApIHtcbiAgICB0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKCBlbGVtICk7XG4gIH1cblxuICAvLyBmaW5kIGNoaWxkcmVuXG4gIC8vIG5vIG5vbi1lbGVtZW50IG5vZGVzLCAjMTQzXG4gIHZhciBub2RlVHlwZSA9IGVsZW0ubm9kZVR5cGU7XG4gIGlmICggIW5vZGVUeXBlIHx8ICFlbGVtZW50Tm9kZVR5cGVzWyBub2RlVHlwZSBdICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgY2hpbGRJbWdzID0gZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKTtcbiAgLy8gY29uY2F0IGNoaWxkRWxlbXMgdG8gZmlsdGVyRm91bmQgYXJyYXlcbiAgZm9yICggdmFyIGk9MDsgaSA8IGNoaWxkSW1ncy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgaW1nID0gY2hpbGRJbWdzW2ldO1xuICAgIHRoaXMuYWRkSW1hZ2UoIGltZyApO1xuICB9XG5cbiAgLy8gZ2V0IGNoaWxkIGJhY2tncm91bmQgaW1hZ2VzXG4gIGlmICggdHlwZW9mIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kID09ICdzdHJpbmcnICkge1xuICAgIHZhciBjaGlsZHJlbiA9IGVsZW0ucXVlcnlTZWxlY3RvckFsbCggdGhpcy5vcHRpb25zLmJhY2tncm91bmQgKTtcbiAgICBmb3IgKCBpPTA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgdGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyggY2hpbGQgKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBlbGVtZW50Tm9kZVR5cGVzID0ge1xuICAxOiB0cnVlLFxuICA5OiB0cnVlLFxuICAxMTogdHJ1ZVxufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKCBlbGVtICk7XG4gIGlmICggIXN0eWxlICkge1xuICAgIC8vIEZpcmVmb3ggcmV0dXJucyBudWxsIGlmIGluIGEgaGlkZGVuIGlmcmFtZSBodHRwczovL2J1Z3ppbC5sYS81NDgzOTdcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZ2V0IHVybCBpbnNpZGUgdXJsKFwiLi4uXCIpXG4gIHZhciByZVVSTCA9IC91cmxcXCgoWydcIl0pPyguKj8pXFwxXFwpL2dpO1xuICB2YXIgbWF0Y2hlcyA9IHJlVVJMLmV4ZWMoIHN0eWxlLmJhY2tncm91bmRJbWFnZSApO1xuICB3aGlsZSAoIG1hdGNoZXMgIT09IG51bGwgKSB7XG4gICAgdmFyIHVybCA9IG1hdGNoZXMgJiYgbWF0Y2hlc1syXTtcbiAgICBpZiAoIHVybCApIHtcbiAgICAgIHRoaXMuYWRkQmFja2dyb3VuZCggdXJsLCBlbGVtICk7XG4gICAgfVxuICAgIG1hdGNoZXMgPSByZVVSTC5leGVjKCBzdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge0ltYWdlfSBpbWdcbiAqL1xuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRJbWFnZSA9IGZ1bmN0aW9uKCBpbWcgKSB7XG4gIHZhciBsb2FkaW5nSW1hZ2UgPSBuZXcgTG9hZGluZ0ltYWdlKCBpbWcgKTtcbiAgdGhpcy5pbWFnZXMucHVzaCggbG9hZGluZ0ltYWdlICk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEJhY2tncm91bmQgPSBmdW5jdGlvbiggdXJsLCBlbGVtICkge1xuICB2YXIgYmFja2dyb3VuZCA9IG5ldyBCYWNrZ3JvdW5kKCB1cmwsIGVsZW0gKTtcbiAgdGhpcy5pbWFnZXMucHVzaCggYmFja2dyb3VuZCApO1xufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLnByb2dyZXNzZWRDb3VudCA9IDA7XG4gIHRoaXMuaGFzQW55QnJva2VuID0gZmFsc2U7XG4gIC8vIGNvbXBsZXRlIGlmIG5vIGltYWdlc1xuICBpZiAoICF0aGlzLmltYWdlcy5sZW5ndGggKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uUHJvZ3Jlc3MoIGltYWdlLCBlbGVtLCBtZXNzYWdlICkge1xuICAgIC8vIEhBQ0sgLSBDaHJvbWUgdHJpZ2dlcnMgZXZlbnQgYmVmb3JlIG9iamVjdCBwcm9wZXJ0aWVzIGhhdmUgY2hhbmdlZC4gIzgzXG4gICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5wcm9ncmVzcyggaW1hZ2UsIGVsZW0sIG1lc3NhZ2UgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuaW1hZ2VzLmZvckVhY2goIGZ1bmN0aW9uKCBsb2FkaW5nSW1hZ2UgKSB7XG4gICAgbG9hZGluZ0ltYWdlLm9uY2UoICdwcm9ncmVzcycsIG9uUHJvZ3Jlc3MgKTtcbiAgICBsb2FkaW5nSW1hZ2UuY2hlY2soKTtcbiAgfSk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24oIGltYWdlLCBlbGVtLCBtZXNzYWdlICkge1xuICB0aGlzLnByb2dyZXNzZWRDb3VudCsrO1xuICB0aGlzLmhhc0FueUJyb2tlbiA9IHRoaXMuaGFzQW55QnJva2VuIHx8ICFpbWFnZS5pc0xvYWRlZDtcbiAgLy8gcHJvZ3Jlc3MgZXZlbnRcbiAgdGhpcy5lbWl0RXZlbnQoICdwcm9ncmVzcycsIFsgdGhpcywgaW1hZ2UsIGVsZW0gXSApO1xuICBpZiAoIHRoaXMuanFEZWZlcnJlZCAmJiB0aGlzLmpxRGVmZXJyZWQubm90aWZ5ICkge1xuICAgIHRoaXMuanFEZWZlcnJlZC5ub3RpZnkoIHRoaXMsIGltYWdlICk7XG4gIH1cbiAgLy8gY2hlY2sgaWYgY29tcGxldGVkXG4gIGlmICggdGhpcy5wcm9ncmVzc2VkQ291bnQgPT0gdGhpcy5pbWFnZXMubGVuZ3RoICkge1xuICAgIHRoaXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIGlmICggdGhpcy5vcHRpb25zLmRlYnVnICYmIGNvbnNvbGUgKSB7XG4gICAgY29uc29sZS5sb2coICdwcm9ncmVzczogJyArIG1lc3NhZ2UsIGltYWdlLCBlbGVtICk7XG4gIH1cbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGV2ZW50TmFtZSA9IHRoaXMuaGFzQW55QnJva2VuID8gJ2ZhaWwnIDogJ2RvbmUnO1xuICB0aGlzLmlzQ29tcGxldGUgPSB0cnVlO1xuICB0aGlzLmVtaXRFdmVudCggZXZlbnROYW1lLCBbIHRoaXMgXSApO1xuICB0aGlzLmVtaXRFdmVudCggJ2Fsd2F5cycsIFsgdGhpcyBdICk7XG4gIGlmICggdGhpcy5qcURlZmVycmVkICkge1xuICAgIHZhciBqcU1ldGhvZCA9IHRoaXMuaGFzQW55QnJva2VuID8gJ3JlamVjdCcgOiAncmVzb2x2ZSc7XG4gICAgdGhpcy5qcURlZmVycmVkWyBqcU1ldGhvZCBdKCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBMb2FkaW5nSW1hZ2UoIGltZyApIHtcbiAgdGhpcy5pbWcgPSBpbWc7XG59XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgLy8gSWYgY29tcGxldGUgaXMgdHJ1ZSBhbmQgYnJvd3NlciBzdXBwb3J0cyBuYXR1cmFsIHNpemVzLFxuICAvLyB0cnkgdG8gY2hlY2sgZm9yIGltYWdlIHN0YXR1cyBtYW51YWxseS5cbiAgdmFyIGlzQ29tcGxldGUgPSB0aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO1xuICBpZiAoIGlzQ29tcGxldGUgKSB7XG4gICAgLy8gcmVwb3J0IGJhc2VkIG9uIG5hdHVyYWxXaWR0aFxuICAgIHRoaXMuY29uZmlybSggdGhpcy5pbWcubmF0dXJhbFdpZHRoICE9PSAwLCAnbmF0dXJhbFdpZHRoJyApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIElmIG5vbmUgb2YgdGhlIGNoZWNrcyBhYm92ZSBtYXRjaGVkLCBzaW11bGF0ZSBsb2FkaW5nIG9uIGRldGFjaGVkIGVsZW1lbnQuXG4gIHRoaXMucHJveHlJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIC8vIGJpbmQgdG8gaW1hZ2UgYXMgd2VsbCBmb3IgRmlyZWZveC4gIzE5MVxuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLnByb3h5SW1hZ2Uuc3JjID0gdGhpcy5pbWcuc3JjO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5nZXRJc0ltYWdlQ29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gY2hlY2sgZm9yIG5vbi16ZXJvLCBub24tdW5kZWZpbmVkIG5hdHVyYWxXaWR0aFxuICAvLyBmaXhlcyBTYWZhcmkrSW5maW5pdGVTY3JvbGwrTWFzb25yeSBidWcgaW5maW5pdGUtc2Nyb2xsIzY3MVxuICByZXR1cm4gdGhpcy5pbWcuY29tcGxldGUgJiYgdGhpcy5pbWcubmF0dXJhbFdpZHRoO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5jb25maXJtID0gZnVuY3Rpb24oIGlzTG9hZGVkLCBtZXNzYWdlICkge1xuICB0aGlzLmlzTG9hZGVkID0gaXNMb2FkZWQ7XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIHRoaXMuaW1nLCBtZXNzYWdlIF0gKTtcbn07XG5cbi8vIC0tLS0tIGV2ZW50cyAtLS0tLSAvL1xuXG4vLyB0cmlnZ2VyIHNwZWNpZmllZCBoYW5kbGVyIGZvciBldmVudCB0eXBlXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29uZmlybSggdHJ1ZSwgJ29ubG9hZCcgKTtcbiAgdGhpcy51bmJpbmRFdmVudHMoKTtcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvbmZpcm0oIGZhbHNlLCAnb25lcnJvcicgKTtcbiAgdGhpcy51bmJpbmRFdmVudHMoKTtcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUudW5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEJhY2tncm91bmQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gQmFja2dyb3VuZCggdXJsLCBlbGVtZW50ICkge1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcbn1cblxuLy8gaW5oZXJpdCBMb2FkaW5nSW1hZ2UgcHJvdG90eXBlXG5CYWNrZ3JvdW5kLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExvYWRpbmdJbWFnZS5wcm90b3R5cGUgKTtcblxuQmFja2dyb3VuZC5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgdGhpcy5pbWcuc3JjID0gdGhpcy51cmw7XG4gIC8vIGNoZWNrIGlmIGltYWdlIGlzIGFscmVhZHkgY29tcGxldGVcbiAgdmFyIGlzQ29tcGxldGUgPSB0aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO1xuICBpZiAoIGlzQ29tcGxldGUgKSB7XG4gICAgdGhpcy5jb25maXJtKCB0aGlzLmltZy5uYXR1cmFsV2lkdGggIT09IDAsICduYXR1cmFsV2lkdGgnICk7XG4gICAgdGhpcy51bmJpbmRFdmVudHMoKTtcbiAgfVxufTtcblxuQmFja2dyb3VuZC5wcm90b3R5cGUudW5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG59O1xuXG5CYWNrZ3JvdW5kLnByb3RvdHlwZS5jb25maXJtID0gZnVuY3Rpb24oIGlzTG9hZGVkLCBtZXNzYWdlICkge1xuICB0aGlzLmlzTG9hZGVkID0gaXNMb2FkZWQ7XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIHRoaXMuZWxlbWVudCwgbWVzc2FnZSBdICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBqUXVlcnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuSW1hZ2VzTG9hZGVkLm1ha2VKUXVlcnlQbHVnaW4gPSBmdW5jdGlvbiggalF1ZXJ5ICkge1xuICBqUXVlcnkgPSBqUXVlcnkgfHwgd2luZG93LmpRdWVyeTtcbiAgaWYgKCAhalF1ZXJ5ICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzZXQgbG9jYWwgdmFyaWFibGVcbiAgJCA9IGpRdWVyeTtcbiAgLy8gJCgpLmltYWdlc0xvYWRlZCgpXG4gICQuZm4uaW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oIG9wdGlvbnMsIGNhbGxiYWNrICkge1xuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBJbWFnZXNMb2FkZWQoIHRoaXMsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG4gICAgcmV0dXJuIGluc3RhbmNlLmpxRGVmZXJyZWQucHJvbWlzZSggJCh0aGlzKSApO1xuICB9O1xufTtcbi8vIHRyeSBtYWtpbmcgcGx1Z2luXG5JbWFnZXNMb2FkZWQubWFrZUpRdWVyeVBsdWdpbigpO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucmV0dXJuIEltYWdlc0xvYWRlZDtcblxufSk7XG5cbiIsIi8qKlxuKiBqcXVlcnktbWF0Y2gtaGVpZ2h0IG1hc3RlciBieSBAbGlhYnJ1XG4qIGh0dHA6Ly9icm0uaW8vanF1ZXJ5LW1hdGNoLWhlaWdodC9cbiogTGljZW5zZTogTUlUXG4qL1xuXG47KGZ1bmN0aW9uKGZhY3RvcnkpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1leHRyYS1zZW1pXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1EXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIC8vIENvbW1vbkpTXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gR2xvYmFsXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KShmdW5jdGlvbigkKSB7XG4gICAgLypcbiAgICAqICBpbnRlcm5hbFxuICAgICovXG5cbiAgICB2YXIgX3ByZXZpb3VzUmVzaXplV2lkdGggPSAtMSxcbiAgICAgICAgX3VwZGF0ZVRpbWVvdXQgPSAtMTtcblxuICAgIC8qXG4gICAgKiAgX3BhcnNlXG4gICAgKiAgdmFsdWUgcGFyc2UgdXRpbGl0eSBmdW5jdGlvblxuICAgICovXG5cbiAgICB2YXIgX3BhcnNlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgLy8gcGFyc2UgdmFsdWUgYW5kIGNvbnZlcnQgTmFOIHRvIDBcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpIHx8IDA7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgX3Jvd3NcbiAgICAqICB1dGlsaXR5IGZ1bmN0aW9uIHJldHVybnMgYXJyYXkgb2YgalF1ZXJ5IHNlbGVjdGlvbnMgcmVwcmVzZW50aW5nIGVhY2ggcm93XG4gICAgKiAgKGFzIGRpc3BsYXllZCBhZnRlciBmbG9hdCB3cmFwcGluZyBhcHBsaWVkIGJ5IGJyb3dzZXIpXG4gICAgKi9cblxuICAgIHZhciBfcm93cyA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgIHZhciB0b2xlcmFuY2UgPSAxLFxuICAgICAgICAgICAgJGVsZW1lbnRzID0gJChlbGVtZW50cyksXG4gICAgICAgICAgICBsYXN0VG9wID0gbnVsbCxcbiAgICAgICAgICAgIHJvd3MgPSBbXTtcblxuICAgICAgICAvLyBncm91cCBlbGVtZW50cyBieSB0aGVpciB0b3AgcG9zaXRpb25cbiAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgdG9wID0gJHRoYXQub2Zmc2V0KCkudG9wIC0gX3BhcnNlKCR0aGF0LmNzcygnbWFyZ2luLXRvcCcpKSxcbiAgICAgICAgICAgICAgICBsYXN0Um93ID0gcm93cy5sZW5ndGggPiAwID8gcm93c1tyb3dzLmxlbmd0aCAtIDFdIDogbnVsbDtcblxuICAgICAgICAgICAgaWYgKGxhc3RSb3cgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBpdGVtIG9uIHRoZSByb3csIHNvIGp1c3QgcHVzaCBpdFxuICAgICAgICAgICAgICAgIHJvd3MucHVzaCgkdGhhdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSByb3cgdG9wIGlzIHRoZSBzYW1lLCBhZGQgdG8gdGhlIHJvdyBncm91cFxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmZsb29yKE1hdGguYWJzKGxhc3RUb3AgLSB0b3ApKSA8PSB0b2xlcmFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcm93c1tyb3dzLmxlbmd0aCAtIDFdID0gbGFzdFJvdy5hZGQoJHRoYXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBzdGFydCBhIG5ldyByb3cgZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKCR0aGF0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIGxhc3Qgcm93IHRvcFxuICAgICAgICAgICAgbGFzdFRvcCA9IHRvcDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJvd3M7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgX3BhcnNlT3B0aW9uc1xuICAgICogIGhhbmRsZSBwbHVnaW4gb3B0aW9uc1xuICAgICovXG5cbiAgICB2YXIgX3BhcnNlT3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICBieVJvdzogdHJ1ZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnaGVpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldDogbnVsbCxcbiAgICAgICAgICAgIHJlbW92ZTogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5leHRlbmQob3B0cywgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgb3B0cy5ieVJvdyA9IG9wdGlvbnM7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucyA9PT0gJ3JlbW92ZScpIHtcbiAgICAgICAgICAgIG9wdHMucmVtb3ZlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgIH07XG5cbiAgICAvKlxuICAgICogIG1hdGNoSGVpZ2h0XG4gICAgKiAgcGx1Z2luIGRlZmluaXRpb25cbiAgICAqL1xuXG4gICAgdmFyIG1hdGNoSGVpZ2h0ID0gJC5mbi5tYXRjaEhlaWdodCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHMgPSBfcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIGhhbmRsZSByZW1vdmVcbiAgICAgICAgaWYgKG9wdHMucmVtb3ZlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSBmaXhlZCBoZWlnaHQgZnJvbSBhbGwgc2VsZWN0ZWQgZWxlbWVudHNcbiAgICAgICAgICAgIHRoaXMuY3NzKG9wdHMucHJvcGVydHksICcnKTtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIHNlbGVjdGVkIGVsZW1lbnRzIGZyb20gYWxsIGdyb3Vwc1xuICAgICAgICAgICAgJC5lYWNoKG1hdGNoSGVpZ2h0Ll9ncm91cHMsIGZ1bmN0aW9uKGtleSwgZ3JvdXApIHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cyA9IGdyb3VwLmVsZW1lbnRzLm5vdCh0aGF0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBjbGVhbnVwIGVtcHR5IGdyb3Vwc1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA8PSAxICYmICFvcHRzLnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIHRoaXMgZ3JvdXAgc28gd2UgY2FuIHJlLWFwcGx5IGxhdGVyIG9uIGxvYWQgYW5kIHJlc2l6ZSBldmVudHNcbiAgICAgICAgbWF0Y2hIZWlnaHQuX2dyb3Vwcy5wdXNoKHtcbiAgICAgICAgICAgIGVsZW1lbnRzOiB0aGlzLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0c1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBtYXRjaCBlYWNoIGVsZW1lbnQncyBoZWlnaHQgdG8gdGhlIHRhbGxlc3QgZWxlbWVudCBpbiB0aGUgc2VsZWN0aW9uXG4gICAgICAgIG1hdGNoSGVpZ2h0Ll9hcHBseSh0aGlzLCBvcHRzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLypcbiAgICAqICBwbHVnaW4gZ2xvYmFsIG9wdGlvbnNcbiAgICAqL1xuXG4gICAgbWF0Y2hIZWlnaHQudmVyc2lvbiA9ICdtYXN0ZXInO1xuICAgIG1hdGNoSGVpZ2h0Ll9ncm91cHMgPSBbXTtcbiAgICBtYXRjaEhlaWdodC5fdGhyb3R0bGUgPSA4MDtcbiAgICBtYXRjaEhlaWdodC5fbWFpbnRhaW5TY3JvbGwgPSBmYWxzZTtcbiAgICBtYXRjaEhlaWdodC5fYmVmb3JlVXBkYXRlID0gbnVsbDtcbiAgICBtYXRjaEhlaWdodC5fYWZ0ZXJVcGRhdGUgPSBudWxsO1xuICAgIG1hdGNoSGVpZ2h0Ll9yb3dzID0gX3Jvd3M7XG4gICAgbWF0Y2hIZWlnaHQuX3BhcnNlID0gX3BhcnNlO1xuICAgIG1hdGNoSGVpZ2h0Ll9wYXJzZU9wdGlvbnMgPSBfcGFyc2VPcHRpb25zO1xuXG4gICAgLypcbiAgICAqICBtYXRjaEhlaWdodC5fYXBwbHlcbiAgICAqICBhcHBseSBtYXRjaEhlaWdodCB0byBnaXZlbiBlbGVtZW50c1xuICAgICovXG5cbiAgICBtYXRjaEhlaWdodC5fYXBwbHkgPSBmdW5jdGlvbihlbGVtZW50cywgb3B0aW9ucykge1xuICAgICAgICB2YXIgb3B0cyA9IF9wYXJzZU9wdGlvbnMob3B0aW9ucyksXG4gICAgICAgICAgICAkZWxlbWVudHMgPSAkKGVsZW1lbnRzKSxcbiAgICAgICAgICAgIHJvd3MgPSBbJGVsZW1lbnRzXTtcblxuICAgICAgICAvLyB0YWtlIG5vdGUgb2Ygc2Nyb2xsIHBvc2l0aW9uXG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXG4gICAgICAgICAgICBodG1sSGVpZ2h0ID0gJCgnaHRtbCcpLm91dGVySGVpZ2h0KHRydWUpO1xuXG4gICAgICAgIC8vIGdldCBoaWRkZW4gcGFyZW50c1xuICAgICAgICB2YXIgJGhpZGRlblBhcmVudHMgPSAkZWxlbWVudHMucGFyZW50cygpLmZpbHRlcignOmhpZGRlbicpO1xuXG4gICAgICAgIC8vIGNhY2hlIHRoZSBvcmlnaW5hbCBpbmxpbmUgc3R5bGVcbiAgICAgICAgJGhpZGRlblBhcmVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyk7XG4gICAgICAgICAgICAkdGhhdC5kYXRhKCdzdHlsZS1jYWNoZScsICR0aGF0LmF0dHIoJ3N0eWxlJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyB0ZW1wb3JhcmlseSBtdXN0IGZvcmNlIGhpZGRlbiBwYXJlbnRzIHZpc2libGVcbiAgICAgICAgJGhpZGRlblBhcmVudHMuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cbiAgICAgICAgLy8gZ2V0IHJvd3MgaWYgdXNpbmcgYnlSb3csIG90aGVyd2lzZSBhc3N1bWUgb25lIHJvd1xuICAgICAgICBpZiAob3B0cy5ieVJvdyAmJiAhb3B0cy50YXJnZXQpIHtcblxuICAgICAgICAgICAgLy8gbXVzdCBmaXJzdCBmb3JjZSBhbiBhcmJpdHJhcnkgZXF1YWwgaGVpZ2h0IHNvIGZsb2F0aW5nIGVsZW1lbnRzIGJyZWFrIGV2ZW5seVxuICAgICAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGF0ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICR0aGF0LmNzcygnZGlzcGxheScpO1xuXG4gICAgICAgICAgICAgICAgLy8gdGVtcG9yYXJpbHkgZm9yY2UgYSB1c2FibGUgZGlzcGxheSB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5ICE9PSAnaW5saW5lLWJsb2NrJyAmJiBkaXNwbGF5ICE9PSAnZmxleCcgJiYgZGlzcGxheSAhPT0gJ2lubGluZS1mbGV4Jykge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBjYWNoZSB0aGUgb3JpZ2luYWwgaW5saW5lIHN0eWxlXG4gICAgICAgICAgICAgICAgJHRoYXQuZGF0YSgnc3R5bGUtY2FjaGUnLCAkdGhhdC5hdHRyKCdzdHlsZScpKTtcblxuICAgICAgICAgICAgICAgICR0aGF0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICdkaXNwbGF5JzogZGlzcGxheSxcbiAgICAgICAgICAgICAgICAgICAgJ3BhZGRpbmctdG9wJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1ib3R0b20nOiAnMCcsXG4gICAgICAgICAgICAgICAgICAgICdtYXJnaW4tdG9wJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAnbWFyZ2luLWJvdHRvbSc6ICcwJyxcbiAgICAgICAgICAgICAgICAgICAgJ2JvcmRlci10b3Atd2lkdGgnOiAnMCcsXG4gICAgICAgICAgICAgICAgICAgICdib3JkZXItYm90dG9tLXdpZHRoJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogJzEwMHB4JyxcbiAgICAgICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBnZXQgdGhlIGFycmF5IG9mIHJvd3MgKGJhc2VkIG9uIGVsZW1lbnQgdG9wIHBvc2l0aW9uKVxuICAgICAgICAgICAgcm93cyA9IF9yb3dzKCRlbGVtZW50cyk7XG5cbiAgICAgICAgICAgIC8vIHJldmVydCBvcmlnaW5hbCBpbmxpbmUgc3R5bGVzXG4gICAgICAgICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICR0aGF0LmF0dHIoJ3N0eWxlJywgJHRoYXQuZGF0YSgnc3R5bGUtY2FjaGUnKSB8fCAnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICQuZWFjaChyb3dzLCBmdW5jdGlvbihrZXksIHJvdykge1xuICAgICAgICAgICAgdmFyICRyb3cgPSAkKHJvdyksXG4gICAgICAgICAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gMDtcblxuICAgICAgICAgICAgaWYgKCFvcHRzLnRhcmdldCkge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgYXBwbHkgdG8gcm93cyB3aXRoIG9ubHkgb25lIGl0ZW1cbiAgICAgICAgICAgICAgICBpZiAob3B0cy5ieVJvdyAmJiAkcm93Lmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICRyb3cuY3NzKG9wdHMucHJvcGVydHksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGUgdGhlIHJvdyBhbmQgZmluZCB0aGUgbWF4IGhlaWdodFxuICAgICAgICAgICAgICAgICRyb3cuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGUgPSAkdGhhdC5hdHRyKCdzdHlsZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICR0aGF0LmNzcygnZGlzcGxheScpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRlbXBvcmFyaWx5IGZvcmNlIGEgdXNhYmxlIGRpc3BsYXkgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXkgIT09ICdpbmxpbmUtYmxvY2snICYmIGRpc3BsYXkgIT09ICdmbGV4JyAmJiBkaXNwbGF5ICE9PSAnaW5saW5lLWZsZXgnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB3ZSBnZXQgdGhlIGNvcnJlY3QgYWN0dWFsIGhlaWdodCAoYW5kIG5vdCBhIHByZXZpb3VzbHkgc2V0IGhlaWdodCB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNzcyA9IHsgJ2Rpc3BsYXknOiBkaXNwbGF5IH07XG4gICAgICAgICAgICAgICAgICAgIGNzc1tvcHRzLnByb3BlcnR5XSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAkdGhhdC5jc3MoY3NzKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIHRoZSBtYXggaGVpZ2h0IChpbmNsdWRpbmcgcGFkZGluZywgYnV0IG5vdCBtYXJnaW4pXG4gICAgICAgICAgICAgICAgICAgIGlmICgkdGhhdC5vdXRlckhlaWdodChmYWxzZSkgPiB0YXJnZXRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEhlaWdodCA9ICR0aGF0Lm91dGVySGVpZ2h0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldmVydCBzdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhhdC5hdHRyKCdzdHlsZScsIHN0eWxlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGF0LmNzcygnZGlzcGxheScsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0YXJnZXQgc2V0LCB1c2UgdGhlIGhlaWdodCBvZiB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICB0YXJnZXRIZWlnaHQgPSBvcHRzLnRhcmdldC5vdXRlckhlaWdodChmYWxzZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGl0ZXJhdGUgdGhlIHJvdyBhbmQgYXBwbHkgdGhlIGhlaWdodCB0byBhbGwgZWxlbWVudHNcbiAgICAgICAgICAgICRyb3cuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUGFkZGluZyA9IDA7XG5cbiAgICAgICAgICAgICAgICAvLyBkb24ndCBhcHBseSB0byBhIHRhcmdldFxuICAgICAgICAgICAgICAgIGlmIChvcHRzLnRhcmdldCAmJiAkdGhhdC5pcyhvcHRzLnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBwYWRkaW5nIGFuZCBib3JkZXIgY29ycmVjdGx5IChyZXF1aXJlZCB3aGVuIG5vdCB1c2luZyBib3JkZXItYm94KVxuICAgICAgICAgICAgICAgIGlmICgkdGhhdC5jc3MoJ2JveC1zaXppbmcnKSAhPT0gJ2JvcmRlci1ib3gnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUGFkZGluZyArPSBfcGFyc2UoJHRoYXQuY3NzKCdib3JkZXItdG9wLXdpZHRoJykpICsgX3BhcnNlKCR0aGF0LmNzcygnYm9yZGVyLWJvdHRvbS13aWR0aCcpKTtcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxQYWRkaW5nICs9IF9wYXJzZSgkdGhhdC5jc3MoJ3BhZGRpbmctdG9wJykpICsgX3BhcnNlKCR0aGF0LmNzcygncGFkZGluZy1ib3R0b20nKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBoZWlnaHQgKGFjY291bnRpbmcgZm9yIHBhZGRpbmcgYW5kIGJvcmRlcilcbiAgICAgICAgICAgICAgICAkdGhhdC5jc3Mob3B0cy5wcm9wZXJ0eSwgKHRhcmdldEhlaWdodCAtIHZlcnRpY2FsUGFkZGluZykgKyAncHgnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyByZXZlcnQgaGlkZGVuIHBhcmVudHNcbiAgICAgICAgJGhpZGRlblBhcmVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyk7XG4gICAgICAgICAgICAkdGhhdC5hdHRyKCdzdHlsZScsICR0aGF0LmRhdGEoJ3N0eWxlLWNhY2hlJykgfHwgbnVsbCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHJlc3RvcmUgc2Nyb2xsIHBvc2l0aW9uIGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKG1hdGNoSGVpZ2h0Ll9tYWludGFpblNjcm9sbCkge1xuICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbFRvcCgoc2Nyb2xsVG9wIC8gaHRtbEhlaWdodCkgKiAkKCdodG1sJykub3V0ZXJIZWlnaHQodHJ1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgbWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaVxuICAgICogIGFwcGxpZXMgbWF0Y2hIZWlnaHQgdG8gYWxsIGVsZW1lbnRzIHdpdGggYSBkYXRhLW1hdGNoLWhlaWdodCBhdHRyaWJ1dGVcbiAgICAqL1xuXG4gICAgbWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ3JvdXBzID0ge307XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgZ3JvdXBzIGJ5IHRoZWlyIGdyb3VwSWQgc2V0IGJ5IGVsZW1lbnRzIHVzaW5nIGRhdGEtbWF0Y2gtaGVpZ2h0XG4gICAgICAgICQoJ1tkYXRhLW1hdGNoLWhlaWdodF0sIFtkYXRhLW1oXScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGdyb3VwSWQgPSAkdGhpcy5hdHRyKCdkYXRhLW1oJykgfHwgJHRoaXMuYXR0cignZGF0YS1tYXRjaC1oZWlnaHQnKTtcblxuICAgICAgICAgICAgaWYgKGdyb3VwSWQgaW4gZ3JvdXBzKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBzW2dyb3VwSWRdID0gZ3JvdXBzW2dyb3VwSWRdLmFkZCgkdGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyb3Vwc1tncm91cElkXSA9ICR0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBhcHBseSBtYXRjaEhlaWdodCB0byBlYWNoIGdyb3VwXG4gICAgICAgICQuZWFjaChncm91cHMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5tYXRjaEhlaWdodCh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgbWF0Y2hIZWlnaHQuX3VwZGF0ZVxuICAgICogIHVwZGF0ZXMgbWF0Y2hIZWlnaHQgb24gYWxsIGN1cnJlbnQgZ3JvdXBzIHdpdGggdGhlaXIgY29ycmVjdCBvcHRpb25zXG4gICAgKi9cblxuICAgIHZhciBfdXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKG1hdGNoSGVpZ2h0Ll9iZWZvcmVVcGRhdGUpIHtcbiAgICAgICAgICAgIG1hdGNoSGVpZ2h0Ll9iZWZvcmVVcGRhdGUoZXZlbnQsIG1hdGNoSGVpZ2h0Ll9ncm91cHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgJC5lYWNoKG1hdGNoSGVpZ2h0Ll9ncm91cHMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbWF0Y2hIZWlnaHQuX2FwcGx5KHRoaXMuZWxlbWVudHMsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChtYXRjaEhlaWdodC5fYWZ0ZXJVcGRhdGUpIHtcbiAgICAgICAgICAgIG1hdGNoSGVpZ2h0Ll9hZnRlclVwZGF0ZShldmVudCwgbWF0Y2hIZWlnaHQuX2dyb3Vwcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbWF0Y2hIZWlnaHQuX3VwZGF0ZSA9IGZ1bmN0aW9uKHRocm90dGxlLCBldmVudCkge1xuICAgICAgICAvLyBwcmV2ZW50IHVwZGF0ZSBpZiBmaXJlZCBmcm9tIGEgcmVzaXplIGV2ZW50XG4gICAgICAgIC8vIHdoZXJlIHRoZSB2aWV3cG9ydCB3aWR0aCBoYXNuJ3QgYWN0dWFsbHkgY2hhbmdlZFxuICAgICAgICAvLyBmaXhlcyBhbiBldmVudCBsb29waW5nIGJ1ZyBpbiBJRThcbiAgICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdyZXNpemUnKSB7XG4gICAgICAgICAgICB2YXIgd2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3dXaWR0aCA9PT0gX3ByZXZpb3VzUmVzaXplV2lkdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfcHJldmlvdXNSZXNpemVXaWR0aCA9IHdpbmRvd1dpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhyb3R0bGUgdXBkYXRlc1xuICAgICAgICBpZiAoIXRocm90dGxlKSB7XG4gICAgICAgICAgICBfdXBkYXRlKGV2ZW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChfdXBkYXRlVGltZW91dCA9PT0gLTEpIHtcbiAgICAgICAgICAgIF91cGRhdGVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfdXBkYXRlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBfdXBkYXRlVGltZW91dCA9IC0xO1xuICAgICAgICAgICAgfSwgbWF0Y2hIZWlnaHQuX3Rocm90dGxlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICogIGJpbmQgZXZlbnRzXG4gICAgKi9cblxuICAgIC8vIGFwcGx5IG9uIERPTSByZWFkeSBldmVudFxuICAgICQobWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaSk7XG5cbiAgICAvLyB1c2Ugb24gb3IgYmluZCB3aGVyZSBzdXBwb3J0ZWRcbiAgICB2YXIgb24gPSAkLmZuLm9uID8gJ29uJyA6ICdiaW5kJztcblxuICAgIC8vIHVwZGF0ZSBoZWlnaHRzIG9uIGxvYWQgYW5kIHJlc2l6ZSBldmVudHNcbiAgICAkKHdpbmRvdylbb25dKCdsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbWF0Y2hIZWlnaHQuX3VwZGF0ZShmYWxzZSwgZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhyb3R0bGVkIHVwZGF0ZSBoZWlnaHRzIG9uIHJlc2l6ZSBldmVudHNcbiAgICAkKHdpbmRvdylbb25dKCdyZXNpemUgb3JpZW50YXRpb25jaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBtYXRjaEhlaWdodC5fdXBkYXRlKHRydWUsIGV2ZW50KTtcbiAgICB9KTtcblxufSk7XG4iLCIvKiFcbiAqIGpRdWVyeSBTbW9vdGggU2Nyb2xsIC0gdjIuMi4wIC0gMjAxNy0wNS0wNVxuICogaHR0cHM6Ly9naXRodWIuY29tL2tzd2VkYmVyZy9qcXVlcnktc21vb3RoLXNjcm9sbFxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU3dlZGJlcmdcbiAqIExpY2Vuc2VkIE1JVFxuICovXG5cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBmYWN0b3J5KGpRdWVyeSk7XG4gIH1cbn0oZnVuY3Rpb24oJCkge1xuXG4gIHZhciB2ZXJzaW9uID0gJzIuMi4wJztcbiAgdmFyIG9wdGlvbk92ZXJyaWRlcyA9IHt9O1xuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgZXhjbHVkZTogW10sXG4gICAgZXhjbHVkZVdpdGhpbjogW10sXG4gICAgb2Zmc2V0OiAwLFxuXG4gICAgLy8gb25lIG9mICd0b3AnIG9yICdsZWZ0J1xuICAgIGRpcmVjdGlvbjogJ3RvcCcsXG5cbiAgICAvLyBpZiBzZXQsIGJpbmQgY2xpY2sgZXZlbnRzIHRocm91Z2ggZGVsZWdhdGlvblxuICAgIC8vICBzdXBwb3J0ZWQgc2luY2UgalF1ZXJ5IDEuNC4yXG4gICAgZGVsZWdhdGVTZWxlY3RvcjogbnVsbCxcblxuICAgIC8vIGpRdWVyeSBzZXQgb2YgZWxlbWVudHMgeW91IHdpc2ggdG8gc2Nyb2xsIChmb3IgJC5zbW9vdGhTY3JvbGwpLlxuICAgIC8vICBpZiBudWxsIChkZWZhdWx0KSwgJCgnaHRtbCwgYm9keScpLmZpcnN0U2Nyb2xsYWJsZSgpIGlzIHVzZWQuXG4gICAgc2Nyb2xsRWxlbWVudDogbnVsbCxcblxuICAgIC8vIG9ubHkgdXNlIGlmIHlvdSB3YW50IHRvIG92ZXJyaWRlIGRlZmF1bHQgYmVoYXZpb3JcbiAgICBzY3JvbGxUYXJnZXQ6IG51bGwsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGZvY3VzIHRoZSB0YXJnZXQgZWxlbWVudCBhZnRlciBzY3JvbGxpbmcgdG8gaXRcbiAgICBhdXRvRm9jdXM6IGZhbHNlLFxuXG4gICAgLy8gZm4ob3B0cykgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGJlZm9yZSBzY3JvbGxpbmcgb2NjdXJzLlxuICAgIC8vIGB0aGlzYCBpcyB0aGUgZWxlbWVudChzKSBiZWluZyBzY3JvbGxlZFxuICAgIGJlZm9yZVNjcm9sbDogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8vIGZuKG9wdHMpIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZnRlciBzY3JvbGxpbmcgb2NjdXJzLlxuICAgIC8vIGB0aGlzYCBpcyB0aGUgdHJpZ2dlcmluZyBlbGVtZW50XG4gICAgYWZ0ZXJTY3JvbGw6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvLyBlYXNpbmcgbmFtZS4galF1ZXJ5IGNvbWVzIHdpdGggXCJzd2luZ1wiIGFuZCBcImxpbmVhci5cIiBGb3Igb3RoZXJzLCB5b3UnbGwgbmVlZCBhbiBlYXNpbmcgcGx1Z2luXG4gICAgLy8gZnJvbSBqUXVlcnkgVUkgb3IgZWxzZXdoZXJlXG4gICAgZWFzaW5nOiAnc3dpbmcnLFxuXG4gICAgLy8gc3BlZWQgY2FuIGJlIGEgbnVtYmVyIG9yICdhdXRvJ1xuICAgIC8vIGlmICdhdXRvJywgdGhlIHNwZWVkIHdpbGwgYmUgY2FsY3VsYXRlZCBiYXNlZCBvbiB0aGUgZm9ybXVsYTpcbiAgICAvLyAoY3VycmVudCBzY3JvbGwgcG9zaXRpb24gLSB0YXJnZXQgc2Nyb2xsIHBvc2l0aW9uKSAvIGF1dG9Db2VmZmljXG4gICAgc3BlZWQ6IDQwMCxcblxuICAgIC8vIGNvZWZmaWNpZW50IGZvciBcImF1dG9cIiBzcGVlZFxuICAgIGF1dG9Db2VmZmljaWVudDogMixcblxuICAgIC8vICQuZm4uc21vb3RoU2Nyb2xsIG9ubHk6IHdoZXRoZXIgdG8gcHJldmVudCB0aGUgZGVmYXVsdCBjbGljayBhY3Rpb25cbiAgICBwcmV2ZW50RGVmYXVsdDogdHJ1ZVxuICB9O1xuXG4gIHZhciBnZXRTY3JvbGxhYmxlID0gZnVuY3Rpb24ob3B0cykge1xuICAgIHZhciBzY3JvbGxhYmxlID0gW107XG4gICAgdmFyIHNjcm9sbGVkID0gZmFsc2U7XG4gICAgdmFyIGRpciA9IG9wdHMuZGlyICYmIG9wdHMuZGlyID09PSAnbGVmdCcgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJztcblxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbCA9ICQodGhpcyk7XG5cbiAgICAgIGlmICh0aGlzID09PSBkb2N1bWVudCB8fCB0aGlzID09PSB3aW5kb3cpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudCAmJiAodGhpcyA9PT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IHRoaXMgPT09IGRvY3VtZW50LmJvZHkpKSB7XG4gICAgICAgIHNjcm9sbGFibGUucHVzaChkb2N1bWVudC5zY3JvbGxpbmdFbGVtZW50KTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbFtkaXJdKCkgPiAwKSB7XG4gICAgICAgIHNjcm9sbGFibGUucHVzaCh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIHNjcm9sbChUb3B8TGVmdCkgPT09IDAsIG51ZGdlIHRoZSBlbGVtZW50IDFweCBhbmQgc2VlIGlmIGl0IG1vdmVzXG4gICAgICAgIGVsW2Rpcl0oMSk7XG4gICAgICAgIHNjcm9sbGVkID0gZWxbZGlyXSgpID4gMDtcblxuICAgICAgICBpZiAoc2Nyb2xsZWQpIHtcbiAgICAgICAgICBzY3JvbGxhYmxlLnB1c2godGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhlbiBwdXQgaXQgYmFjaywgb2YgY291cnNlXG4gICAgICAgIGVsW2Rpcl0oMCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIXNjcm9sbGFibGUubGVuZ3RoKSB7XG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIElmIG5vIHNjcm9sbGFibGUgZWxlbWVudHMgYW5kIDxodG1sPiBoYXMgc2Nyb2xsLWJlaGF2aW9yOnNtb290aCBiZWNhdXNlXG4gICAgICAgIC8vIFwiV2hlbiB0aGlzIHByb3BlcnR5IGlzIHNwZWNpZmllZCBvbiB0aGUgcm9vdCBlbGVtZW50LCBpdCBhcHBsaWVzIHRvIHRoZSB2aWV3cG9ydCBpbnN0ZWFkLlwiXG4gICAgICAgIC8vIGFuZCBcIlRoZSBzY3JvbGwtYmVoYXZpb3IgcHJvcGVydHkgb2YgdGhlIOKApiBib2R5IGVsZW1lbnQgaXMgKm5vdCogcHJvcGFnYXRlZCB0byB0aGUgdmlld3BvcnQuXCJcbiAgICAgICAgLy8g4oaSIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3NvbS12aWV3LyNwcm9wZGVmLXNjcm9sbC1iZWhhdmlvclxuICAgICAgICBpZiAodGhpcyA9PT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICQodGhpcykuY3NzKCdzY3JvbGxCZWhhdmlvcicpID09PSAnc21vb3RoJykge1xuICAgICAgICAgIHNjcm9sbGFibGUgPSBbdGhpc107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBzdGlsbCBubyBzY3JvbGxhYmxlIGVsZW1lbnRzLCBmYWxsIGJhY2sgdG8gPGJvZHk+LFxuICAgICAgICAvLyBpZiBpdCdzIGluIHRoZSBqUXVlcnkgY29sbGVjdGlvblxuICAgICAgICAvLyAoZG9pbmcgdGhpcyBiZWNhdXNlIFNhZmFyaSBzZXRzIHNjcm9sbFRvcCBhc3luYyxcbiAgICAgICAgLy8gc28gY2FuJ3Qgc2V0IGl0IHRvIDEgYW5kIGltbWVkaWF0ZWx5IGdldCB0aGUgdmFsdWUuKVxuICAgICAgICBpZiAoIXNjcm9sbGFibGUubGVuZ3RoICYmIHRoaXMubm9kZU5hbWUgPT09ICdCT0RZJykge1xuICAgICAgICAgIHNjcm9sbGFibGUgPSBbdGhpc107XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFVzZSB0aGUgZmlyc3Qgc2Nyb2xsYWJsZSBlbGVtZW50IGlmIHdlJ3JlIGNhbGxpbmcgZmlyc3RTY3JvbGxhYmxlKClcbiAgICBpZiAob3B0cy5lbCA9PT0gJ2ZpcnN0JyAmJiBzY3JvbGxhYmxlLmxlbmd0aCA+IDEpIHtcbiAgICAgIHNjcm9sbGFibGUgPSBbc2Nyb2xsYWJsZVswXV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNjcm9sbGFibGU7XG4gIH07XG5cbiAgdmFyIHJSZWxhdGl2ZSA9IC9eKFtcXC1cXCtdPSkoXFxkKykvO1xuXG4gICQuZm4uZXh0ZW5kKHtcbiAgICBzY3JvbGxhYmxlOiBmdW5jdGlvbihkaXIpIHtcbiAgICAgIHZhciBzY3JsID0gZ2V0U2Nyb2xsYWJsZS5jYWxsKHRoaXMsIHtkaXI6IGRpcn0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soc2NybCk7XG4gICAgfSxcbiAgICBmaXJzdFNjcm9sbGFibGU6IGZ1bmN0aW9uKGRpcikge1xuICAgICAgdmFyIHNjcmwgPSBnZXRTY3JvbGxhYmxlLmNhbGwodGhpcywge2VsOiAnZmlyc3QnLCBkaXI6IGRpcn0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soc2NybCk7XG4gICAgfSxcblxuICAgIHNtb290aFNjcm9sbDogZnVuY3Rpb24ob3B0aW9ucywgZXh0cmEpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICBpZiAob3B0aW9ucyA9PT0gJ29wdGlvbnMnKSB7XG4gICAgICAgIGlmICghZXh0cmEpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoJ3NzT3B0cycpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgIHZhciBvcHRzID0gJC5leHRlbmQoJHRoaXMuZGF0YSgnc3NPcHRzJykgfHwge30sIGV4dHJhKTtcblxuICAgICAgICAgICQodGhpcykuZGF0YSgnc3NPcHRzJywgb3B0cyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3B0cyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnNtb290aFNjcm9sbC5kZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAgIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZXNjYXBlU2VsZWN0b3IgPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyg6fFxcLnxcXC8pL2csICdcXFxcJDEnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbGluayA9IHRoaXM7XG4gICAgICAgIHZhciAkbGluayA9ICQodGhpcyk7XG4gICAgICAgIHZhciB0aGlzT3B0cyA9ICQuZXh0ZW5kKHt9LCBvcHRzLCAkbGluay5kYXRhKCdzc09wdHMnKSB8fCB7fSk7XG4gICAgICAgIHZhciBleGNsdWRlID0gb3B0cy5leGNsdWRlO1xuICAgICAgICB2YXIgZXhjbHVkZVdpdGhpbiA9IHRoaXNPcHRzLmV4Y2x1ZGVXaXRoaW47XG4gICAgICAgIHZhciBlbENvdW50ZXIgPSAwO1xuICAgICAgICB2YXIgZXdsQ291bnRlciA9IDA7XG4gICAgICAgIHZhciBpbmNsdWRlID0gdHJ1ZTtcbiAgICAgICAgdmFyIGNsaWNrT3B0cyA9IHt9O1xuICAgICAgICB2YXIgbG9jYXRpb25QYXRoID0gJC5zbW9vdGhTY3JvbGwuZmlsdGVyUGF0aChsb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgICAgIHZhciBsaW5rUGF0aCA9ICQuc21vb3RoU2Nyb2xsLmZpbHRlclBhdGgobGluay5wYXRobmFtZSk7XG4gICAgICAgIHZhciBob3N0TWF0Y2ggPSBsb2NhdGlvbi5ob3N0bmFtZSA9PT0gbGluay5ob3N0bmFtZSB8fCAhbGluay5ob3N0bmFtZTtcbiAgICAgICAgdmFyIHBhdGhNYXRjaCA9IHRoaXNPcHRzLnNjcm9sbFRhcmdldCB8fCAobGlua1BhdGggPT09IGxvY2F0aW9uUGF0aCk7XG4gICAgICAgIHZhciB0aGlzSGFzaCA9IGVzY2FwZVNlbGVjdG9yKGxpbmsuaGFzaCk7XG5cbiAgICAgICAgaWYgKHRoaXNIYXNoICYmICEkKHRoaXNIYXNoKS5sZW5ndGgpIHtcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXNPcHRzLnNjcm9sbFRhcmdldCAmJiAoIWhvc3RNYXRjaCB8fCAhcGF0aE1hdGNoIHx8ICF0aGlzSGFzaCkpIHtcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2hpbGUgKGluY2x1ZGUgJiYgZWxDb3VudGVyIDwgZXhjbHVkZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICgkbGluay5pcyhlc2NhcGVTZWxlY3RvcihleGNsdWRlW2VsQ291bnRlcisrXSkpKSB7XG4gICAgICAgICAgICAgIGluY2x1ZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3aGlsZSAoaW5jbHVkZSAmJiBld2xDb3VudGVyIDwgZXhjbHVkZVdpdGhpbi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICgkbGluay5jbG9zZXN0KGV4Y2x1ZGVXaXRoaW5bZXdsQ291bnRlcisrXSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGluY2x1ZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5jbHVkZSkge1xuICAgICAgICAgIGlmICh0aGlzT3B0cy5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkLmV4dGVuZChjbGlja09wdHMsIHRoaXNPcHRzLCB7XG4gICAgICAgICAgICBzY3JvbGxUYXJnZXQ6IHRoaXNPcHRzLnNjcm9sbFRhcmdldCB8fCB0aGlzSGFzaCxcbiAgICAgICAgICAgIGxpbms6IGxpbmtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgICQuc21vb3RoU2Nyb2xsKGNsaWNrT3B0cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChvcHRpb25zLmRlbGVnYXRlU2VsZWN0b3IgIT09IG51bGwpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAub2ZmKCdjbGljay5zbW9vdGhzY3JvbGwnLCBvcHRpb25zLmRlbGVnYXRlU2VsZWN0b3IpXG4gICAgICAgIC5vbignY2xpY2suc21vb3Roc2Nyb2xsJywgb3B0aW9ucy5kZWxlZ2F0ZVNlbGVjdG9yLCBjbGlja0hhbmRsZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAub2ZmKCdjbGljay5zbW9vdGhzY3JvbGwnKVxuICAgICAgICAub24oJ2NsaWNrLnNtb290aHNjcm9sbCcsIGNsaWNrSGFuZGxlcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGdldEV4cGxpY2l0T2Zmc2V0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIGV4cGxpY2l0ID0ge3JlbGF0aXZlOiAnJ307XG4gICAgdmFyIHBhcnRzID0gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiYgclJlbGF0aXZlLmV4ZWModmFsKTtcblxuICAgIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgICAgZXhwbGljaXQucHggPSB2YWw7XG4gICAgfSBlbHNlIGlmIChwYXJ0cykge1xuICAgICAgZXhwbGljaXQucmVsYXRpdmUgPSBwYXJ0c1sxXTtcbiAgICAgIGV4cGxpY2l0LnB4ID0gcGFyc2VGbG9hdChwYXJ0c1syXSkgfHwgMDtcbiAgICB9XG5cbiAgICByZXR1cm4gZXhwbGljaXQ7XG4gIH07XG5cbiAgdmFyIG9uQWZ0ZXJTY3JvbGwgPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgdmFyICR0Z3QgPSAkKG9wdHMuc2Nyb2xsVGFyZ2V0KTtcblxuICAgIGlmIChvcHRzLmF1dG9Gb2N1cyAmJiAkdGd0Lmxlbmd0aCkge1xuICAgICAgJHRndFswXS5mb2N1cygpO1xuXG4gICAgICBpZiAoISR0Z3QuaXMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgJHRndC5wcm9wKHt0YWJJbmRleDogLTF9KTtcbiAgICAgICAgJHRndFswXS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9wdHMuYWZ0ZXJTY3JvbGwuY2FsbChvcHRzLmxpbmssIG9wdHMpO1xuICB9O1xuXG4gICQuc21vb3RoU2Nyb2xsID0gZnVuY3Rpb24ob3B0aW9ucywgcHgpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gJ29wdGlvbnMnICYmIHR5cGVvZiBweCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiAkLmV4dGVuZChvcHRpb25PdmVycmlkZXMsIHB4KTtcbiAgICB9XG4gICAgdmFyIG9wdHMsICRzY3JvbGxlciwgc3BlZWQsIGRlbHRhO1xuICAgIHZhciBleHBsaWNpdE9mZnNldCA9IGdldEV4cGxpY2l0T2Zmc2V0KG9wdGlvbnMpO1xuICAgIHZhciBzY3JvbGxUYXJnZXRPZmZzZXQgPSB7fTtcbiAgICB2YXIgc2Nyb2xsZXJPZmZzZXQgPSAwO1xuICAgIHZhciBvZmZQb3MgPSAnb2Zmc2V0JztcbiAgICB2YXIgc2Nyb2xsRGlyID0gJ3Njcm9sbFRvcCc7XG4gICAgdmFyIGFuaVByb3BzID0ge307XG4gICAgdmFyIGFuaU9wdHMgPSB7fTtcblxuICAgIGlmIChleHBsaWNpdE9mZnNldC5weCkge1xuICAgICAgb3B0cyA9ICQuZXh0ZW5kKHtsaW5rOiBudWxsfSwgJC5mbi5zbW9vdGhTY3JvbGwuZGVmYXVsdHMsIG9wdGlvbk92ZXJyaWRlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdHMgPSAkLmV4dGVuZCh7bGluazogbnVsbH0sICQuZm4uc21vb3RoU2Nyb2xsLmRlZmF1bHRzLCBvcHRpb25zIHx8IHt9LCBvcHRpb25PdmVycmlkZXMpO1xuXG4gICAgICBpZiAob3B0cy5zY3JvbGxFbGVtZW50KSB7XG4gICAgICAgIG9mZlBvcyA9ICdwb3NpdGlvbic7XG5cbiAgICAgICAgaWYgKG9wdHMuc2Nyb2xsRWxlbWVudC5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgb3B0cy5zY3JvbGxFbGVtZW50LmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocHgpIHtcbiAgICAgICAgZXhwbGljaXRPZmZzZXQgPSBnZXRFeHBsaWNpdE9mZnNldChweCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2Nyb2xsRGlyID0gb3B0cy5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICdzY3JvbGxMZWZ0JyA6IHNjcm9sbERpcjtcblxuICAgIGlmIChvcHRzLnNjcm9sbEVsZW1lbnQpIHtcbiAgICAgICRzY3JvbGxlciA9IG9wdHMuc2Nyb2xsRWxlbWVudDtcblxuICAgICAgaWYgKCFleHBsaWNpdE9mZnNldC5weCAmJiAhKC9eKD86SFRNTHxCT0RZKSQvKS50ZXN0KCRzY3JvbGxlclswXS5ub2RlTmFtZSkpIHtcbiAgICAgICAgc2Nyb2xsZXJPZmZzZXQgPSAkc2Nyb2xsZXJbc2Nyb2xsRGlyXSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2Nyb2xsZXIgPSAkKCdodG1sLCBib2R5JykuZmlyc3RTY3JvbGxhYmxlKG9wdHMuZGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBiZWZvcmVTY3JvbGwgY2FsbGJhY2sgZnVuY3Rpb24gbXVzdCBmaXJlIGJlZm9yZSBjYWxjdWxhdGluZyBvZmZzZXRcbiAgICBvcHRzLmJlZm9yZVNjcm9sbC5jYWxsKCRzY3JvbGxlciwgb3B0cyk7XG5cbiAgICBzY3JvbGxUYXJnZXRPZmZzZXQgPSBleHBsaWNpdE9mZnNldC5weCA/IGV4cGxpY2l0T2Zmc2V0IDoge1xuICAgICAgcmVsYXRpdmU6ICcnLFxuICAgICAgcHg6ICgkKG9wdHMuc2Nyb2xsVGFyZ2V0KVtvZmZQb3NdKCkgJiYgJChvcHRzLnNjcm9sbFRhcmdldClbb2ZmUG9zXSgpW29wdHMuZGlyZWN0aW9uXSkgfHwgMFxuICAgIH07XG5cbiAgICBhbmlQcm9wc1tzY3JvbGxEaXJdID0gc2Nyb2xsVGFyZ2V0T2Zmc2V0LnJlbGF0aXZlICsgKHNjcm9sbFRhcmdldE9mZnNldC5weCArIHNjcm9sbGVyT2Zmc2V0ICsgb3B0cy5vZmZzZXQpO1xuXG4gICAgc3BlZWQgPSBvcHRzLnNwZWVkO1xuXG4gICAgLy8gYXV0b21hdGljYWxseSBjYWxjdWxhdGUgdGhlIHNwZWVkIG9mIHRoZSBzY3JvbGwgYmFzZWQgb24gZGlzdGFuY2UgLyBjb2VmZmljaWVudFxuICAgIGlmIChzcGVlZCA9PT0gJ2F1dG8nKSB7XG5cbiAgICAgIC8vICRzY3JvbGxlcltzY3JvbGxEaXJdKCkgaXMgcG9zaXRpb24gYmVmb3JlIHNjcm9sbCwgYW5pUHJvcHNbc2Nyb2xsRGlyXSBpcyBwb3NpdGlvbiBhZnRlclxuICAgICAgLy8gV2hlbiBkZWx0YSBpcyBncmVhdGVyLCBzcGVlZCB3aWxsIGJlIGdyZWF0ZXIuXG4gICAgICBkZWx0YSA9IE1hdGguYWJzKGFuaVByb3BzW3Njcm9sbERpcl0gLSAkc2Nyb2xsZXJbc2Nyb2xsRGlyXSgpKTtcblxuICAgICAgLy8gRGl2aWRlIHRoZSBkZWx0YSBieSB0aGUgY29lZmZpY2llbnRcbiAgICAgIHNwZWVkID0gZGVsdGEgLyBvcHRzLmF1dG9Db2VmZmljaWVudDtcbiAgICB9XG5cbiAgICBhbmlPcHRzID0ge1xuICAgICAgZHVyYXRpb246IHNwZWVkLFxuICAgICAgZWFzaW5nOiBvcHRzLmVhc2luZyxcbiAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgb25BZnRlclNjcm9sbChvcHRzKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG9wdHMuc3RlcCkge1xuICAgICAgYW5pT3B0cy5zdGVwID0gb3B0cy5zdGVwO1xuICAgIH1cblxuICAgIGlmICgkc2Nyb2xsZXIubGVuZ3RoKSB7XG4gICAgICAkc2Nyb2xsZXIuc3RvcCgpLmFuaW1hdGUoYW5pUHJvcHMsIGFuaU9wdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbkFmdGVyU2Nyb2xsKG9wdHMpO1xuICAgIH1cbiAgfTtcblxuICAkLnNtb290aFNjcm9sbC52ZXJzaW9uID0gdmVyc2lvbjtcbiAgJC5zbW9vdGhTY3JvbGwuZmlsdGVyUGF0aCA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHN0cmluZyA9IHN0cmluZyB8fCAnJztcblxuICAgIHJldHVybiBzdHJpbmdcbiAgICAgIC5yZXBsYWNlKC9eXFwvLywgJycpXG4gICAgICAucmVwbGFjZSgvKD86aW5kZXh8ZGVmYXVsdCkuW2EtekEtWl17Myw0fSQvLCAnJylcbiAgICAgIC5yZXBsYWNlKC9cXC8kLywgJycpO1xuICB9O1xuXG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICAkLmZuLnNtb290aFNjcm9sbC5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuXG59KSk7XG4iLCIvKiFcbldheXBvaW50cyAtIDQuMC4xXG5Db3B5cmlnaHQgwqkgMjAxMS0yMDE2IENhbGViIFRyb3VnaHRvblxuTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuaHR0cHM6Ly9naXRodWIuY29tL2ltYWtld2VidGhpbmdzL3dheXBvaW50cy9ibG9iL21hc3Rlci9saWNlbnNlcy50eHRcbiovXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciBrZXlDb3VudGVyID0gMFxuICB2YXIgYWxsV2F5cG9pbnRzID0ge31cblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvd2F5cG9pbnQgKi9cbiAgZnVuY3Rpb24gV2F5cG9pbnQob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBvcHRpb25zIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5lbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGVsZW1lbnQgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5oYW5kbGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGhhbmRsZXIgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuXG4gICAgdGhpcy5rZXkgPSAnd2F5cG9pbnQtJyArIGtleUNvdW50ZXJcbiAgICB0aGlzLm9wdGlvbnMgPSBXYXlwb2ludC5BZGFwdGVyLmV4dGVuZCh7fSwgV2F5cG9pbnQuZGVmYXVsdHMsIG9wdGlvbnMpXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy5vcHRpb25zLmVsZW1lbnRcbiAgICB0aGlzLmFkYXB0ZXIgPSBuZXcgV2F5cG9pbnQuQWRhcHRlcih0aGlzLmVsZW1lbnQpXG4gICAgdGhpcy5jYWxsYmFjayA9IG9wdGlvbnMuaGFuZGxlclxuICAgIHRoaXMuYXhpcyA9IHRoaXMub3B0aW9ucy5ob3Jpem9udGFsID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ1xuICAgIHRoaXMuZW5hYmxlZCA9IHRoaXMub3B0aW9ucy5lbmFibGVkXG4gICAgdGhpcy50cmlnZ2VyUG9pbnQgPSBudWxsXG4gICAgdGhpcy5ncm91cCA9IFdheXBvaW50Lkdyb3VwLmZpbmRPckNyZWF0ZSh7XG4gICAgICBuYW1lOiB0aGlzLm9wdGlvbnMuZ3JvdXAsXG4gICAgICBheGlzOiB0aGlzLmF4aXNcbiAgICB9KVxuICAgIHRoaXMuY29udGV4dCA9IFdheXBvaW50LkNvbnRleHQuZmluZE9yQ3JlYXRlQnlFbGVtZW50KHRoaXMub3B0aW9ucy5jb250ZXh0KVxuXG4gICAgaWYgKFdheXBvaW50Lm9mZnNldEFsaWFzZXNbdGhpcy5vcHRpb25zLm9mZnNldF0pIHtcbiAgICAgIHRoaXMub3B0aW9ucy5vZmZzZXQgPSBXYXlwb2ludC5vZmZzZXRBbGlhc2VzW3RoaXMub3B0aW9ucy5vZmZzZXRdXG4gICAgfVxuICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMpXG4gICAgdGhpcy5jb250ZXh0LmFkZCh0aGlzKVxuICAgIGFsbFdheXBvaW50c1t0aGlzLmtleV0gPSB0aGlzXG4gICAga2V5Q291bnRlciArPSAxXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5xdWV1ZVRyaWdnZXIgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgICB0aGlzLmdyb3VwLnF1ZXVlVHJpZ2dlcih0aGlzLCBkaXJlY3Rpb24pXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24oYXJncykge1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHRoaXMuY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuY2FsbGJhY2suYXBwbHkodGhpcywgYXJncylcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rlc3Ryb3kgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRleHQucmVtb3ZlKHRoaXMpXG4gICAgdGhpcy5ncm91cC5yZW1vdmUodGhpcylcbiAgICBkZWxldGUgYWxsV2F5cG9pbnRzW3RoaXMua2V5XVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kaXNhYmxlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2VcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9lbmFibGUgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGV4dC5yZWZyZXNoKClcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvbmV4dCAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdyb3VwLm5leHQodGhpcylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvcHJldmlvdXMgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLnByZXZpb3VzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXAucHJldmlvdXModGhpcylcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgV2F5cG9pbnQuaW52b2tlQWxsID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgdmFyIGFsbFdheXBvaW50c0FycmF5ID0gW11cbiAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiBhbGxXYXlwb2ludHMpIHtcbiAgICAgIGFsbFdheXBvaW50c0FycmF5LnB1c2goYWxsV2F5cG9pbnRzW3dheXBvaW50S2V5XSlcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGFsbFdheXBvaW50c0FycmF5Lmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBhbGxXYXlwb2ludHNBcnJheVtpXVttZXRob2RdKClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rlc3Ryb3ktYWxsICovXG4gIFdheXBvaW50LmRlc3Ryb3lBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5pbnZva2VBbGwoJ2Rlc3Ryb3knKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kaXNhYmxlLWFsbCAqL1xuICBXYXlwb2ludC5kaXNhYmxlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuaW52b2tlQWxsKCdkaXNhYmxlJylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZW5hYmxlLWFsbCAqL1xuICBXYXlwb2ludC5lbmFibGVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5Db250ZXh0LnJlZnJlc2hBbGwoKVxuICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIGFsbFdheXBvaW50cykge1xuICAgICAgYWxsV2F5cG9pbnRzW3dheXBvaW50S2V5XS5lbmFibGVkID0gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9yZWZyZXNoLWFsbCAqL1xuICBXYXlwb2ludC5yZWZyZXNoQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvdmlld3BvcnQtaGVpZ2h0ICovXG4gIFdheXBvaW50LnZpZXdwb3J0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3ZpZXdwb3J0LXdpZHRoICovXG4gIFdheXBvaW50LnZpZXdwb3J0V2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoXG4gIH1cblxuICBXYXlwb2ludC5hZGFwdGVycyA9IFtdXG5cbiAgV2F5cG9pbnQuZGVmYXVsdHMgPSB7XG4gICAgY29udGV4dDogd2luZG93LFxuICAgIGNvbnRpbnVvdXM6IHRydWUsXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBncm91cDogJ2RlZmF1bHQnLFxuICAgIGhvcml6b250YWw6IGZhbHNlLFxuICAgIG9mZnNldDogMFxuICB9XG5cbiAgV2F5cG9pbnQub2Zmc2V0QWxpYXNlcyA9IHtcbiAgICAnYm90dG9tLWluLXZpZXcnOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuaW5uZXJIZWlnaHQoKSAtIHRoaXMuYWRhcHRlci5vdXRlckhlaWdodCgpXG4gICAgfSxcbiAgICAncmlnaHQtaW4tdmlldyc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5pbm5lcldpZHRoKCkgLSB0aGlzLmFkYXB0ZXIub3V0ZXJXaWR0aCgpXG4gICAgfVxuICB9XG5cbiAgd2luZG93LldheXBvaW50ID0gV2F5cG9pbnRcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGZ1bmN0aW9uIHJlcXVlc3RBbmltYXRpb25GcmFtZVNoaW0oY2FsbGJhY2spIHtcbiAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKVxuICB9XG5cbiAgdmFyIGtleUNvdW50ZXIgPSAwXG4gIHZhciBjb250ZXh0cyA9IHt9XG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuICB2YXIgb2xkV2luZG93TG9hZCA9IHdpbmRvdy5vbmxvYWRcblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dCAqL1xuICBmdW5jdGlvbiBDb250ZXh0KGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG4gICAgdGhpcy5BZGFwdGVyID0gV2F5cG9pbnQuQWRhcHRlclxuICAgIHRoaXMuYWRhcHRlciA9IG5ldyB0aGlzLkFkYXB0ZXIoZWxlbWVudClcbiAgICB0aGlzLmtleSA9ICd3YXlwb2ludC1jb250ZXh0LScgKyBrZXlDb3VudGVyXG4gICAgdGhpcy5kaWRTY3JvbGwgPSBmYWxzZVxuICAgIHRoaXMuZGlkUmVzaXplID0gZmFsc2VcbiAgICB0aGlzLm9sZFNjcm9sbCA9IHtcbiAgICAgIHg6IHRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCksXG4gICAgICB5OiB0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKClcbiAgICB9XG4gICAgdGhpcy53YXlwb2ludHMgPSB7XG4gICAgICB2ZXJ0aWNhbDoge30sXG4gICAgICBob3Jpem9udGFsOiB7fVxuICAgIH1cblxuICAgIGVsZW1lbnQud2F5cG9pbnRDb250ZXh0S2V5ID0gdGhpcy5rZXlcbiAgICBjb250ZXh0c1tlbGVtZW50LndheXBvaW50Q29udGV4dEtleV0gPSB0aGlzXG4gICAga2V5Q291bnRlciArPSAxXG4gICAgaWYgKCFXYXlwb2ludC53aW5kb3dDb250ZXh0KSB7XG4gICAgICBXYXlwb2ludC53aW5kb3dDb250ZXh0ID0gdHJ1ZVxuICAgICAgV2F5cG9pbnQud2luZG93Q29udGV4dCA9IG5ldyBDb250ZXh0KHdpbmRvdylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXIoKVxuICAgIHRoaXMuY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlcigpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdmFyIGF4aXMgPSB3YXlwb2ludC5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy53YXlwb2ludHNbYXhpc11bd2F5cG9pbnQua2V5XSA9IHdheXBvaW50XG4gICAgdGhpcy5yZWZyZXNoKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuY2hlY2tFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBob3Jpem9udGFsRW1wdHkgPSB0aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy5ob3Jpem9udGFsKVxuICAgIHZhciB2ZXJ0aWNhbEVtcHR5ID0gdGhpcy5BZGFwdGVyLmlzRW1wdHlPYmplY3QodGhpcy53YXlwb2ludHMudmVydGljYWwpXG4gICAgdmFyIGlzV2luZG93ID0gdGhpcy5lbGVtZW50ID09IHRoaXMuZWxlbWVudC53aW5kb3dcbiAgICBpZiAoaG9yaXpvbnRhbEVtcHR5ICYmIHZlcnRpY2FsRW1wdHkgJiYgIWlzV2luZG93KSB7XG4gICAgICB0aGlzLmFkYXB0ZXIub2ZmKCcud2F5cG9pbnRzJylcbiAgICAgIGRlbGV0ZSBjb250ZXh0c1t0aGlzLmtleV1cbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgIGZ1bmN0aW9uIHJlc2l6ZUhhbmRsZXIoKSB7XG4gICAgICBzZWxmLmhhbmRsZVJlc2l6ZSgpXG4gICAgICBzZWxmLmRpZFJlc2l6ZSA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5hZGFwdGVyLm9uKCdyZXNpemUud2F5cG9pbnRzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXNlbGYuZGlkUmVzaXplKSB7XG4gICAgICAgIHNlbGYuZGlkUmVzaXplID0gdHJ1ZVxuICAgICAgICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVzaXplSGFuZGxlcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5jcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgZnVuY3Rpb24gc2Nyb2xsSGFuZGxlcigpIHtcbiAgICAgIHNlbGYuaGFuZGxlU2Nyb2xsKClcbiAgICAgIHNlbGYuZGlkU2Nyb2xsID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmFkYXB0ZXIub24oJ3Njcm9sbC53YXlwb2ludHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghc2VsZi5kaWRTY3JvbGwgfHwgV2F5cG9pbnQuaXNUb3VjaCkge1xuICAgICAgICBzZWxmLmRpZFNjcm9sbCA9IHRydWVcbiAgICAgICAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbEhhbmRsZXIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyaWdnZXJlZEdyb3VwcyA9IHt9XG4gICAgdmFyIGF4ZXMgPSB7XG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIG5ld1Njcm9sbDogdGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC54LFxuICAgICAgICBmb3J3YXJkOiAncmlnaHQnLFxuICAgICAgICBiYWNrd2FyZDogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgdmVydGljYWw6IHtcbiAgICAgICAgbmV3U2Nyb2xsOiB0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueSxcbiAgICAgICAgZm9yd2FyZDogJ2Rvd24nLFxuICAgICAgICBiYWNrd2FyZDogJ3VwJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGF4aXNLZXkgaW4gYXhlcykge1xuICAgICAgdmFyIGF4aXMgPSBheGVzW2F4aXNLZXldXG4gICAgICB2YXIgaXNGb3J3YXJkID0gYXhpcy5uZXdTY3JvbGwgPiBheGlzLm9sZFNjcm9sbFxuICAgICAgdmFyIGRpcmVjdGlvbiA9IGlzRm9yd2FyZCA/IGF4aXMuZm9yd2FyZCA6IGF4aXMuYmFja3dhcmRcblxuICAgICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gdGhpcy53YXlwb2ludHNbYXhpc0tleV0pIHtcbiAgICAgICAgdmFyIHdheXBvaW50ID0gdGhpcy53YXlwb2ludHNbYXhpc0tleV1bd2F5cG9pbnRLZXldXG4gICAgICAgIGlmICh3YXlwb2ludC50cmlnZ2VyUG9pbnQgPT09IG51bGwpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHZhciB3YXNCZWZvcmVUcmlnZ2VyUG9pbnQgPSBheGlzLm9sZFNjcm9sbCA8IHdheXBvaW50LnRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgbm93QWZ0ZXJUcmlnZ2VyUG9pbnQgPSBheGlzLm5ld1Njcm9sbCA+PSB3YXlwb2ludC50cmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIGNyb3NzZWRGb3J3YXJkID0gd2FzQmVmb3JlVHJpZ2dlclBvaW50ICYmIG5vd0FmdGVyVHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBjcm9zc2VkQmFja3dhcmQgPSAhd2FzQmVmb3JlVHJpZ2dlclBvaW50ICYmICFub3dBZnRlclRyaWdnZXJQb2ludFxuICAgICAgICBpZiAoY3Jvc3NlZEZvcndhcmQgfHwgY3Jvc3NlZEJhY2t3YXJkKSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGRpcmVjdGlvbilcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGdyb3VwS2V5IGluIHRyaWdnZXJlZEdyb3Vwcykge1xuICAgICAgdHJpZ2dlcmVkR3JvdXBzW2dyb3VwS2V5XS5mbHVzaFRyaWdnZXJzKClcbiAgICB9XG5cbiAgICB0aGlzLm9sZFNjcm9sbCA9IHtcbiAgICAgIHg6IGF4ZXMuaG9yaXpvbnRhbC5uZXdTY3JvbGwsXG4gICAgICB5OiBheGVzLnZlcnRpY2FsLm5ld1Njcm9sbFxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaW5uZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIGlmICh0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvdykge1xuICAgICAgcmV0dXJuIFdheXBvaW50LnZpZXdwb3J0SGVpZ2h0KClcbiAgICB9XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHJldHVybiB0aGlzLmFkYXB0ZXIuaW5uZXJIZWlnaHQoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIGRlbGV0ZSB0aGlzLndheXBvaW50c1t3YXlwb2ludC5heGlzXVt3YXlwb2ludC5rZXldXG4gICAgdGhpcy5jaGVja0VtcHR5KClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaW5uZXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgaWYgKHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93KSB7XG4gICAgICByZXR1cm4gV2F5cG9pbnQudmlld3BvcnRXaWR0aCgpXG4gICAgfVxuICAgIC8qZXNsaW50LWVuYWJsZSBlcWVxZXEgKi9cbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmlubmVyV2lkdGgoKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0LWRlc3Ryb3kgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbGxXYXlwb2ludHMgPSBbXVxuICAgIGZvciAodmFyIGF4aXMgaW4gdGhpcy53YXlwb2ludHMpIHtcbiAgICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIHRoaXMud2F5cG9pbnRzW2F4aXNdKSB7XG4gICAgICAgIGFsbFdheXBvaW50cy5wdXNoKHRoaXMud2F5cG9pbnRzW2F4aXNdW3dheXBvaW50S2V5XSlcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGFsbFdheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgYWxsV2F5cG9pbnRzW2ldLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dC1yZWZyZXNoICovXG4gIENvbnRleHQucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIHZhciBpc1dpbmRvdyA9IHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHZhciBjb250ZXh0T2Zmc2V0ID0gaXNXaW5kb3cgPyB1bmRlZmluZWQgOiB0aGlzLmFkYXB0ZXIub2Zmc2V0KClcbiAgICB2YXIgdHJpZ2dlcmVkR3JvdXBzID0ge31cbiAgICB2YXIgYXhlc1xuXG4gICAgdGhpcy5oYW5kbGVTY3JvbGwoKVxuICAgIGF4ZXMgPSB7XG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIGNvbnRleHRPZmZzZXQ6IGlzV2luZG93ID8gMCA6IGNvbnRleHRPZmZzZXQubGVmdCxcbiAgICAgICAgY29udGV4dFNjcm9sbDogaXNXaW5kb3cgPyAwIDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgY29udGV4dERpbWVuc2lvbjogdGhpcy5pbm5lcldpZHRoKCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgZm9yd2FyZDogJ3JpZ2h0JyxcbiAgICAgICAgYmFja3dhcmQ6ICdsZWZ0JyxcbiAgICAgICAgb2Zmc2V0UHJvcDogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgdmVydGljYWw6IHtcbiAgICAgICAgY29udGV4dE9mZnNldDogaXNXaW5kb3cgPyAwIDogY29udGV4dE9mZnNldC50b3AsXG4gICAgICAgIGNvbnRleHRTY3JvbGw6IGlzV2luZG93ID8gMCA6IHRoaXMub2xkU2Nyb2xsLnksXG4gICAgICAgIGNvbnRleHREaW1lbnNpb246IHRoaXMuaW5uZXJIZWlnaHQoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC55LFxuICAgICAgICBmb3J3YXJkOiAnZG93bicsXG4gICAgICAgIGJhY2t3YXJkOiAndXAnLFxuICAgICAgICBvZmZzZXRQcm9wOiAndG9wJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGF4aXNLZXkgaW4gYXhlcykge1xuICAgICAgdmFyIGF4aXMgPSBheGVzW2F4aXNLZXldXG4gICAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiB0aGlzLndheXBvaW50c1theGlzS2V5XSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB0aGlzLndheXBvaW50c1theGlzS2V5XVt3YXlwb2ludEtleV1cbiAgICAgICAgdmFyIGFkanVzdG1lbnQgPSB3YXlwb2ludC5vcHRpb25zLm9mZnNldFxuICAgICAgICB2YXIgb2xkVHJpZ2dlclBvaW50ID0gd2F5cG9pbnQudHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBlbGVtZW50T2Zmc2V0ID0gMFxuICAgICAgICB2YXIgZnJlc2hXYXlwb2ludCA9IG9sZFRyaWdnZXJQb2ludCA9PSBudWxsXG4gICAgICAgIHZhciBjb250ZXh0TW9kaWZpZXIsIHdhc0JlZm9yZVNjcm9sbCwgbm93QWZ0ZXJTY3JvbGxcbiAgICAgICAgdmFyIHRyaWdnZXJlZEJhY2t3YXJkLCB0cmlnZ2VyZWRGb3J3YXJkXG5cbiAgICAgICAgaWYgKHdheXBvaW50LmVsZW1lbnQgIT09IHdheXBvaW50LmVsZW1lbnQud2luZG93KSB7XG4gICAgICAgICAgZWxlbWVudE9mZnNldCA9IHdheXBvaW50LmFkYXB0ZXIub2Zmc2V0KClbYXhpcy5vZmZzZXRQcm9wXVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhZGp1c3RtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgYWRqdXN0bWVudCA9IGFkanVzdG1lbnQuYXBwbHkod2F5cG9pbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGFkanVzdG1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgYWRqdXN0bWVudCA9IHBhcnNlRmxvYXQoYWRqdXN0bWVudClcbiAgICAgICAgICBpZiAod2F5cG9pbnQub3B0aW9ucy5vZmZzZXQuaW5kZXhPZignJScpID4gLSAxKSB7XG4gICAgICAgICAgICBhZGp1c3RtZW50ID0gTWF0aC5jZWlsKGF4aXMuY29udGV4dERpbWVuc2lvbiAqIGFkanVzdG1lbnQgLyAxMDApXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dE1vZGlmaWVyID0gYXhpcy5jb250ZXh0U2Nyb2xsIC0gYXhpcy5jb250ZXh0T2Zmc2V0XG4gICAgICAgIHdheXBvaW50LnRyaWdnZXJQb2ludCA9IE1hdGguZmxvb3IoZWxlbWVudE9mZnNldCArIGNvbnRleHRNb2RpZmllciAtIGFkanVzdG1lbnQpXG4gICAgICAgIHdhc0JlZm9yZVNjcm9sbCA9IG9sZFRyaWdnZXJQb2ludCA8IGF4aXMub2xkU2Nyb2xsXG4gICAgICAgIG5vd0FmdGVyU2Nyb2xsID0gd2F5cG9pbnQudHJpZ2dlclBvaW50ID49IGF4aXMub2xkU2Nyb2xsXG4gICAgICAgIHRyaWdnZXJlZEJhY2t3YXJkID0gd2FzQmVmb3JlU2Nyb2xsICYmIG5vd0FmdGVyU2Nyb2xsXG4gICAgICAgIHRyaWdnZXJlZEZvcndhcmQgPSAhd2FzQmVmb3JlU2Nyb2xsICYmICFub3dBZnRlclNjcm9sbFxuXG4gICAgICAgIGlmICghZnJlc2hXYXlwb2ludCAmJiB0cmlnZ2VyZWRCYWNrd2FyZCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihheGlzLmJhY2t3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFmcmVzaFdheXBvaW50ICYmIHRyaWdnZXJlZEZvcndhcmQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoYXhpcy5mb3J3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZyZXNoV2F5cG9pbnQgJiYgYXhpcy5vbGRTY3JvbGwgPj0gd2F5cG9pbnQudHJpZ2dlclBvaW50KSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGF4aXMuZm9yd2FyZClcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGdyb3VwS2V5IGluIHRyaWdnZXJlZEdyb3Vwcykge1xuICAgICAgICB0cmlnZ2VyZWRHcm91cHNbZ3JvdXBLZXldLmZsdXNoVHJpZ2dlcnMoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LmZpbmRPckNyZWF0ZUJ5RWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gQ29udGV4dC5maW5kQnlFbGVtZW50KGVsZW1lbnQpIHx8IG5ldyBDb250ZXh0KGVsZW1lbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucmVmcmVzaEFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGNvbnRleHRJZCBpbiBjb250ZXh0cykge1xuICAgICAgY29udGV4dHNbY29udGV4dElkXS5yZWZyZXNoKClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQtZmluZC1ieS1lbGVtZW50ICovXG4gIENvbnRleHQuZmluZEJ5RWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gY29udGV4dHNbZWxlbWVudC53YXlwb2ludENvbnRleHRLZXldXG4gIH1cblxuICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKG9sZFdpbmRvd0xvYWQpIHtcbiAgICAgIG9sZFdpbmRvd0xvYWQoKVxuICAgIH1cbiAgICBDb250ZXh0LnJlZnJlc2hBbGwoKVxuICB9XG5cblxuICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciByZXF1ZXN0Rm4gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTaGltXG4gICAgcmVxdWVzdEZuLmNhbGwod2luZG93LCBjYWxsYmFjaylcbiAgfVxuICBXYXlwb2ludC5Db250ZXh0ID0gQ29udGV4dFxufSgpKVxuOyhmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZnVuY3Rpb24gYnlUcmlnZ2VyUG9pbnQoYSwgYikge1xuICAgIHJldHVybiBhLnRyaWdnZXJQb2ludCAtIGIudHJpZ2dlclBvaW50XG4gIH1cblxuICBmdW5jdGlvbiBieVJldmVyc2VUcmlnZ2VyUG9pbnQoYSwgYikge1xuICAgIHJldHVybiBiLnRyaWdnZXJQb2ludCAtIGEudHJpZ2dlclBvaW50XG4gIH1cblxuICB2YXIgZ3JvdXBzID0ge1xuICAgIHZlcnRpY2FsOiB7fSxcbiAgICBob3Jpem9udGFsOiB7fVxuICB9XG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9ncm91cCAqL1xuICBmdW5jdGlvbiBHcm91cChvcHRpb25zKSB7XG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lXG4gICAgdGhpcy5heGlzID0gb3B0aW9ucy5heGlzXG4gICAgdGhpcy5pZCA9IHRoaXMubmFtZSArICctJyArIHRoaXMuYXhpc1xuICAgIHRoaXMud2F5cG9pbnRzID0gW11cbiAgICB0aGlzLmNsZWFyVHJpZ2dlclF1ZXVlcygpXG4gICAgZ3JvdXBzW3RoaXMuYXhpc11bdGhpcy5uYW1lXSA9IHRoaXNcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdGhpcy53YXlwb2ludHMucHVzaCh3YXlwb2ludClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLmNsZWFyVHJpZ2dlclF1ZXVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudHJpZ2dlclF1ZXVlcyA9IHtcbiAgICAgIHVwOiBbXSxcbiAgICAgIGRvd246IFtdLFxuICAgICAgbGVmdDogW10sXG4gICAgICByaWdodDogW11cbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5mbHVzaFRyaWdnZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgZGlyZWN0aW9uIGluIHRoaXMudHJpZ2dlclF1ZXVlcykge1xuICAgICAgdmFyIHdheXBvaW50cyA9IHRoaXMudHJpZ2dlclF1ZXVlc1tkaXJlY3Rpb25dXG4gICAgICB2YXIgcmV2ZXJzZSA9IGRpcmVjdGlvbiA9PT0gJ3VwJyB8fCBkaXJlY3Rpb24gPT09ICdsZWZ0J1xuICAgICAgd2F5cG9pbnRzLnNvcnQocmV2ZXJzZSA/IGJ5UmV2ZXJzZVRyaWdnZXJQb2ludCA6IGJ5VHJpZ2dlclBvaW50KVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHdheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkgKz0gMSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB3YXlwb2ludHNbaV1cbiAgICAgICAgaWYgKHdheXBvaW50Lm9wdGlvbnMuY29udGludW91cyB8fCBpID09PSB3YXlwb2ludHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHdheXBvaW50LnRyaWdnZXIoW2RpcmVjdGlvbl0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jbGVhclRyaWdnZXJRdWV1ZXMoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdGhpcy53YXlwb2ludHMuc29ydChieVRyaWdnZXJQb2ludClcbiAgICB2YXIgaW5kZXggPSBXYXlwb2ludC5BZGFwdGVyLmluQXJyYXkod2F5cG9pbnQsIHRoaXMud2F5cG9pbnRzKVxuICAgIHZhciBpc0xhc3QgPSBpbmRleCA9PT0gdGhpcy53YXlwb2ludHMubGVuZ3RoIC0gMVxuICAgIHJldHVybiBpc0xhc3QgPyBudWxsIDogdGhpcy53YXlwb2ludHNbaW5kZXggKyAxXVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHRoaXMud2F5cG9pbnRzLnNvcnQoYnlUcmlnZ2VyUG9pbnQpXG4gICAgdmFyIGluZGV4ID0gV2F5cG9pbnQuQWRhcHRlci5pbkFycmF5KHdheXBvaW50LCB0aGlzLndheXBvaW50cylcbiAgICByZXR1cm4gaW5kZXggPyB0aGlzLndheXBvaW50c1tpbmRleCAtIDFdIDogbnVsbFxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucXVldWVUcmlnZ2VyID0gZnVuY3Rpb24od2F5cG9pbnQsIGRpcmVjdGlvbikge1xuICAgIHRoaXMudHJpZ2dlclF1ZXVlc1tkaXJlY3Rpb25dLnB1c2god2F5cG9pbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHZhciBpbmRleCA9IFdheXBvaW50LkFkYXB0ZXIuaW5BcnJheSh3YXlwb2ludCwgdGhpcy53YXlwb2ludHMpXG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMud2F5cG9pbnRzLnNwbGljZShpbmRleCwgMSlcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2ZpcnN0ICovXG4gIEdyb3VwLnByb3RvdHlwZS5maXJzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLndheXBvaW50c1swXVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9sYXN0ICovXG4gIEdyb3VwLnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMud2F5cG9pbnRzW3RoaXMud2F5cG9pbnRzLmxlbmd0aCAtIDFdXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLmZpbmRPckNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gZ3JvdXBzW29wdGlvbnMuYXhpc11bb3B0aW9ucy5uYW1lXSB8fCBuZXcgR3JvdXAob3B0aW9ucylcbiAgfVxuXG4gIFdheXBvaW50Lkdyb3VwID0gR3JvdXBcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciAkID0gd2luZG93LmpRdWVyeVxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICBmdW5jdGlvbiBKUXVlcnlBZGFwdGVyKGVsZW1lbnQpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KVxuICB9XG5cbiAgJC5lYWNoKFtcbiAgICAnaW5uZXJIZWlnaHQnLFxuICAgICdpbm5lcldpZHRoJyxcbiAgICAnb2ZmJyxcbiAgICAnb2Zmc2V0JyxcbiAgICAnb24nLFxuICAgICdvdXRlckhlaWdodCcsXG4gICAgJ291dGVyV2lkdGgnLFxuICAgICdzY3JvbGxMZWZ0JyxcbiAgICAnc2Nyb2xsVG9wJ1xuICBdLCBmdW5jdGlvbihpLCBtZXRob2QpIHtcbiAgICBKUXVlcnlBZGFwdGVyLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgIHJldHVybiB0aGlzLiRlbGVtZW50W21ldGhvZF0uYXBwbHkodGhpcy4kZWxlbWVudCwgYXJncylcbiAgICB9XG4gIH0pXG5cbiAgJC5lYWNoKFtcbiAgICAnZXh0ZW5kJyxcbiAgICAnaW5BcnJheScsXG4gICAgJ2lzRW1wdHlPYmplY3QnXG4gIF0sIGZ1bmN0aW9uKGksIG1ldGhvZCkge1xuICAgIEpRdWVyeUFkYXB0ZXJbbWV0aG9kXSA9ICRbbWV0aG9kXVxuICB9KVxuXG4gIFdheXBvaW50LmFkYXB0ZXJzLnB1c2goe1xuICAgIG5hbWU6ICdqcXVlcnknLFxuICAgIEFkYXB0ZXI6IEpRdWVyeUFkYXB0ZXJcbiAgfSlcbiAgV2F5cG9pbnQuQWRhcHRlciA9IEpRdWVyeUFkYXB0ZXJcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUV4dGVuc2lvbihmcmFtZXdvcmspIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgd2F5cG9pbnRzID0gW11cbiAgICAgIHZhciBvdmVycmlkZXMgPSBhcmd1bWVudHNbMF1cblxuICAgICAgaWYgKGZyYW1ld29yay5pc0Z1bmN0aW9uKGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3ZlcnJpZGVzID0gZnJhbWV3b3JrLmV4dGVuZCh7fSwgYXJndW1lbnRzWzFdKVxuICAgICAgICBvdmVycmlkZXMuaGFuZGxlciA9IGFyZ3VtZW50c1swXVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gZnJhbWV3b3JrLmV4dGVuZCh7fSwgb3ZlcnJpZGVzLCB7XG4gICAgICAgICAgZWxlbWVudDogdGhpc1xuICAgICAgICB9KVxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuY29udGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBvcHRpb25zLmNvbnRleHQgPSBmcmFtZXdvcmsodGhpcykuY2xvc2VzdChvcHRpb25zLmNvbnRleHQpWzBdXG4gICAgICAgIH1cbiAgICAgICAgd2F5cG9pbnRzLnB1c2gobmV3IFdheXBvaW50KG9wdGlvbnMpKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHdheXBvaW50c1xuICAgIH1cbiAgfVxuXG4gIGlmICh3aW5kb3cualF1ZXJ5KSB7XG4gICAgd2luZG93LmpRdWVyeS5mbi53YXlwb2ludCA9IGNyZWF0ZUV4dGVuc2lvbih3aW5kb3cualF1ZXJ5KVxuICB9XG4gIGlmICh3aW5kb3cuWmVwdG8pIHtcbiAgICB3aW5kb3cuWmVwdG8uZm4ud2F5cG9pbnQgPSBjcmVhdGVFeHRlbnNpb24od2luZG93LlplcHRvKVxuICB9XG59KCkpXG47IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG4gICAgJChcIi5sYXp5XCIpLnJlY2xpbmVyKHtcbiAgICAgICAgYXR0cmliOiBcImRhdGEtc3JjXCIsIC8vIHNlbGVjdG9yIGZvciBhdHRyaWJ1dGUgY29udGFpbmluZyB0aGUgbWVkaWEgc3JjXG4gICAgICAgIHRocm90dGxlOiAzMDAsICAgICAgLy8gbWlsbGlzZWNvbmQgaW50ZXJ2YWwgYXQgd2hpY2ggdG8gcHJvY2VzcyBldmVudHNcbiAgICAgICAgdGhyZXNob2xkOiAxMDAsICAgICAvLyBzY3JvbGwgZGlzdGFuY2UgZnJvbSBlbGVtZW50IGJlZm9yZSBpdHMgbG9hZGVkXG4gICAgICAgIHByaW50YWJsZTogdHJ1ZSwgICAgLy8gYmUgcHJpbnRlciBmcmllbmRseSBhbmQgc2hvdyBhbGwgZWxlbWVudHMgb24gZG9jdW1lbnQgcHJpbnRcbiAgICAgICAgbGl2ZTogdHJ1ZSAgICAgICAgICAvLyBhdXRvIGJpbmQgbGF6eSBsb2FkaW5nIHRvIGFqYXggbG9hZGVkIGVsZW1lbnRzXG4gICAgfSk7XG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2xhenlsb2FkJywgJy5sYXp5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZSA9ICQodGhpcyk7XG4gICAgICAgIC8vIGRvIHNvbWV0aGluZyB3aXRoIHRoZSBlbGVtZW50IHRvIGJlIGxvYWRlZC4uLlxuICAgICAgICAvLyBjb25zb2xlLmxvZygnbGF6eWxvYWQnLCAkZSk7XG4gICAgfSk7XG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnOyAgICBcbiAgICBcbiAgICBcbiAgICBcbiAgICBsZXQgJHNlY3Rpb25fdmlkZW9zID0gJCgnLnNlY3Rpb24tdmlkZW9zJyk7XG4gICAgaWYgKCAkKCcuc2xpY2snLCAkc2VjdGlvbl92aWRlb3MpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi12aWRlb3MgLnNsaWNrJyApO1xuICAgICAgICBcbiAgICAgICAgJCgnLnNlY3Rpb24tdmlkZW9zJykuaW1hZ2VzTG9hZGVkKCB7YmFja2dyb3VuZDogJy5iYWNrZ3JvdW5kJ30pXG4gICAgICAgIFxuICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuICAgIFxuICAgICAgICAgICAgJCgnLnNlY3Rpb24tdmlkZW9zIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDIsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAyLFxuICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zZWN0aW9uLXZpZGVvcyAuc2xpY2stYXJyb3dzJyksXG4gICAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBicmVha3BvaW50OiA5NzksXG4gICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTsgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICRzZWN0aW9uX3ZpZGVvcy5hZGRDbGFzcygnaW1hZ2VzLWxvYWRlZCcpO1xuICAgICAgICBcbiAgICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBsZXQgJHNlY3Rpb25fc3RvcmllcyA9ICQoJy5zZWN0aW9uLXN0b3JpZXMnKTtcbiAgICBpZiAoICQoJy5zbGljaycsICRzZWN0aW9uX3N0b3JpZXMpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgJCgnLnNlY3Rpb24tc3RvcmllcycpLmltYWdlc0xvYWRlZCh7YmFja2dyb3VuZDogJ2EnfSlcbiAgICAgICAgXG4gICAgICAgIC5kb25lKCBmdW5jdGlvbiggaW5zdGFuY2UgKSB7XG4gICAgXG4gICAgICAgICAgICAkKCAnPGRpdiBjbGFzcz1cInNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLXN0b3JpZXMgLnNsaWNrJyApO1xuICAgICAgICBcbiAgICAgICAgICAgICQoJy5zZWN0aW9uLXN0b3JpZXMgLnNsaWNrJykuc2xpY2soe1xuICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICAgIGFwcGVuZEFycm93czogJCgnLnNlY3Rpb24tc3RvcmllcyAuc2xpY2stYXJyb3dzJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNlY3Rpb25fc3Rvcmllcy5hZGRDbGFzcygnaW1hZ2VzLWxvYWRlZCcpO1xuICAgICAgICBcbiAgICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAkKCAnPGRpdiBjbGFzcz1cInNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLWNvcmUtYmVoYXZpb3JzIC5zbGljaycgKTtcbiAgICBcbiAgICAkKCcuc2VjdGlvbi1jb3JlLWJlaGF2aW9ycyAuc2xpY2snKS5zbGljayh7XG4gICAgICAgIGZhZGU6IHRydWUsXG4gICAgICAgIGRvdHM6IHRydWUsXG4gICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICBhZGFwdGl2ZUhlaWdodDogZmFsc2UsXG4gICAgICAgIGFwcGVuZEFycm93czogJCgnLnNlY3Rpb24tY29yZS1iZWhhdmlvcnMgLnNsaWNrLWFycm93cycpXG4gICAgfSk7XG4gICAgXG4gICAgJCgnLnNlY3Rpb24tY29yZS1iZWhhdmlvcnMgLmdyaWQnKS5vbignY2xpY2snLCcuZ3JpZC1pdGVtJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIHNsaWRlSW5kZXggPSAkKHRoaXMpLnBhcmVudCgpLmluZGV4KCk7XG4gICAgICAgICQoICcuc2VjdGlvbi1jb3JlLWJlaGF2aW9ycyAuc2xpY2snICkuc2xpY2soICdzbGlja0dvVG8nLCBwYXJzZUludChzbGlkZUluZGV4KSApO1xuICAgIH0pO1xuICAgIFxuICAgIFxuICAgIC8vIFJlbGF0ZWQgUG9zdHNcbiAgICBcbmxldCAkc2VjdGlvbl9yZWxhdGVkX3Bvc3RzID0gJCgnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cycpO1xuICAgIGlmICggJCgnLnNsaWNrJywgJHNlY3Rpb25fcmVsYXRlZF9wb3N0cykubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAkKCAnPGRpdiBjbGFzcz1cInNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLXJlbGF0ZWQtcG9zdHMgLnNsaWNrJyApO1xuICAgICAgICBcbiAgICAgICAgJCgnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cycpLmltYWdlc0xvYWRlZCgge2JhY2tncm91bmQ6ICcucG9zdC1oZXJvJ30pXG4gICAgICAgIFxuICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuICAgIFxuICAgICAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJjb2x1bW4gcm93IHNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLXJlbGF0ZWQtcG9zdHMgLnNsaWNrJyApO1xuICAgIFxuICAgICAgICAgICAgJCgnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cyAuc2xpY2snKS5zbGljayh7XG4gICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA0LFxuICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgICAgICAgYXBwZW5kQXJyb3dzOiAkKCcuc2VjdGlvbi1yZWxhdGVkLXBvc3RzIC5zbGljay1hcnJvd3MnKSxcbiAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IDEyMDAsXG4gICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogOTgwLFxuICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAyLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogNDgwLFxuICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBZb3UgY2FuIHVuc2xpY2sgYXQgYSBnaXZlbiBicmVha3BvaW50IG5vdyBieSBhZGRpbmc6XG4gICAgICAgICAgICAgICAgLy8gc2V0dGluZ3M6IFwidW5zbGlja1wiXG4gICAgICAgICAgICAgICAgLy8gaW5zdGVhZCBvZiBhIHNldHRpbmdzIG9iamVjdFxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTsgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICRzZWN0aW9uX3JlbGF0ZWRfcG9zdHMuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcbiAgICAgICAgXG4gICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgbGV0ICRzZWN0aW9uX3Rlc3RpbW9uaWFscyA9ICQoJy5zZWN0aW9uLXRlc3RpbW9uaWFscycpO1xuICAgIGlmICggJCgnLnNsaWNrJywgJHNlY3Rpb25fdGVzdGltb25pYWxzKS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICQoICc8ZGl2IGNsYXNzPVwic2xpY2stYXJyb3dzXCI+PC9kaXY+JyApLmluc2VydEFmdGVyKCAnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljaycgKTtcbiAgICAgICAgXG4gICAgICAgICQoJy5zZWN0aW9uLXRlc3RpbW9uaWFscycpLmltYWdlc0xvYWRlZCgpXG4gICAgICAgIFxuICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuICAgIFxuICAgICAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi10ZXN0aW1vbmlhbHMgLnNsaWNrJyApO1xuICAgICAgICAgICAgJCgnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICAgIGFwcGVuZEFycm93czogJCgnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljay1hcnJvd3MnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNlY3Rpb25fdGVzdGltb25pYWxzLmFkZENsYXNzKCdpbWFnZXMtbG9hZGVkJyk7XG4gICAgICAgIFxuICAgICAgICAgfSk7XG4gICAgfVxuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0JChcIi5qcy1zdXBlcmZpc2hcIikuc3VwZXJmaXNoKHtcbiAgICAgICAgZGVsYXk6MTAwLFxuICAgICAgICAvL2FuaW1hdGlvbjp7b3BhY2l0eTpcInNob3dcIixoZWlnaHQ6XCJzaG93XCJ9LFxuICAgICAgICBkcm9wU2hhZG93czohMVxuICAgIH0pO1xuICAgIFxuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiLyohXG5XYXlwb2ludHMgSW52aWV3IFNob3J0Y3V0IC0gNC4wLjFcbkNvcHlyaWdodCDCqSAyMDExLTIwMTYgQ2FsZWIgVHJvdWdodG9uXG5MaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5odHRwczovL2dpdGh1Yi5jb20vaW1ha2V3ZWJ0aGluZ3Mvd2F5cG9pbnRzL2Jsb2IvbWFzdGVyL2xpY2Vuc2VzLnR4dFxuKi9cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZnVuY3Rpb24gbm9vcCgpIHt9XG5cbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvc2hvcnRjdXRzL2ludmlldyAqL1xuICBmdW5jdGlvbiBJbnZpZXcob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IFdheXBvaW50LkFkYXB0ZXIuZXh0ZW5kKHt9LCBJbnZpZXcuZGVmYXVsdHMsIG9wdGlvbnMpXG4gICAgdGhpcy5heGlzID0gdGhpcy5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy53YXlwb2ludHMgPSBbXVxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMub3B0aW9ucy5lbGVtZW50XG4gICAgdGhpcy5jcmVhdGVXYXlwb2ludHMoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBJbnZpZXcucHJvdG90eXBlLmNyZWF0ZVdheXBvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb25maWdzID0ge1xuICAgICAgdmVydGljYWw6IFt7XG4gICAgICAgIGRvd246ICdlbnRlcicsXG4gICAgICAgIHVwOiAnZXhpdGVkJyxcbiAgICAgICAgb2Zmc2V0OiAnMTAwJSdcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2VudGVyZWQnLFxuICAgICAgICB1cDogJ2V4aXQnLFxuICAgICAgICBvZmZzZXQ6ICdib3R0b20taW4tdmlldydcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2V4aXQnLFxuICAgICAgICB1cDogJ2VudGVyZWQnLFxuICAgICAgICBvZmZzZXQ6IDBcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2V4aXRlZCcsXG4gICAgICAgIHVwOiAnZW50ZXInLFxuICAgICAgICBvZmZzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAtdGhpcy5hZGFwdGVyLm91dGVySGVpZ2h0KClcbiAgICAgICAgfVxuICAgICAgfV0sXG4gICAgICBob3Jpem9udGFsOiBbe1xuICAgICAgICByaWdodDogJ2VudGVyJyxcbiAgICAgICAgbGVmdDogJ2V4aXRlZCcsXG4gICAgICAgIG9mZnNldDogJzEwMCUnXG4gICAgICB9LCB7XG4gICAgICAgIHJpZ2h0OiAnZW50ZXJlZCcsXG4gICAgICAgIGxlZnQ6ICdleGl0JyxcbiAgICAgICAgb2Zmc2V0OiAncmlnaHQtaW4tdmlldydcbiAgICAgIH0sIHtcbiAgICAgICAgcmlnaHQ6ICdleGl0JyxcbiAgICAgICAgbGVmdDogJ2VudGVyZWQnLFxuICAgICAgICBvZmZzZXQ6IDBcbiAgICAgIH0sIHtcbiAgICAgICAgcmlnaHQ6ICdleGl0ZWQnLFxuICAgICAgICBsZWZ0OiAnZW50ZXInLFxuICAgICAgICBvZmZzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAtdGhpcy5hZGFwdGVyLm91dGVyV2lkdGgoKVxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBjb25maWdzW3RoaXMuYXhpc10ubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHZhciBjb25maWcgPSBjb25maWdzW3RoaXMuYXhpc11baV1cbiAgICAgIHRoaXMuY3JlYXRlV2F5cG9pbnQoY29uZmlnKVxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgSW52aWV3LnByb3RvdHlwZS5jcmVhdGVXYXlwb2ludCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIHRoaXMud2F5cG9pbnRzLnB1c2gobmV3IFdheXBvaW50KHtcbiAgICAgIGNvbnRleHQ6IHRoaXMub3B0aW9ucy5jb250ZXh0LFxuICAgICAgZWxlbWVudDogdGhpcy5vcHRpb25zLmVsZW1lbnQsXG4gICAgICBlbmFibGVkOiB0aGlzLm9wdGlvbnMuZW5hYmxlZCxcbiAgICAgIGhhbmRsZXI6IChmdW5jdGlvbihjb25maWcpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgICAgIHNlbGYub3B0aW9uc1tjb25maWdbZGlyZWN0aW9uXV0uY2FsbChzZWxmLCBkaXJlY3Rpb24pXG4gICAgICAgIH1cbiAgICAgIH0oY29uZmlnKSksXG4gICAgICBvZmZzZXQ6IGNvbmZpZy5vZmZzZXQsXG4gICAgICBob3Jpem9udGFsOiB0aGlzLm9wdGlvbnMuaG9yaXpvbnRhbFxuICAgIH0pKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIEludmlldy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLndheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpcy53YXlwb2ludHNbaV0uZGVzdHJveSgpXG4gICAgfVxuICAgIHRoaXMud2F5cG9pbnRzID0gW11cbiAgfVxuXG4gIEludmlldy5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLndheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpcy53YXlwb2ludHNbaV0uZGlzYWJsZSgpXG4gICAgfVxuICB9XG5cbiAgSW52aWV3LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy53YXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXMud2F5cG9pbnRzW2ldLmVuYWJsZSgpXG4gICAgfVxuICB9XG5cbiAgSW52aWV3LmRlZmF1bHRzID0ge1xuICAgIGNvbnRleHQ6IHdpbmRvdyxcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGVudGVyOiBub29wLFxuICAgIGVudGVyZWQ6IG5vb3AsXG4gICAgZXhpdDogbm9vcCxcbiAgICBleGl0ZWQ6IG5vb3BcbiAgfVxuXG4gIFdheXBvaW50LkludmlldyA9IEludmlld1xufSgpKVxuOyIsIihmdW5jdGlvbigkKSB7XG5cdFxuXHQndXNlIHN0cmljdCc7XHRcblx0XG5cdHZhciAkbGVnZW5kID0gJCggJy5zZWN0aW9uLWJ1c2luZXNzLWxpbmVzLW1hcCAubGVnZW5kJyApO1xuICAgIFxuICAgIHZhciAkbWFwcyA9ICQoICcuc2VjdGlvbi1idXNpbmVzcy1saW5lcy1tYXAgLm1hcHMnICk7XG4gICAgXG4gICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRtYXBzLmFuaW1hdGUoeydvcGFjaXR5JzonMSd9LDUwMCk7XG4gICAgfSk7XG4gICAgICAgIFxuICAgIC8vY2xvc2UgY2FyZCB3aGVuIGNsaWNrIG9uIGNyb3NzXG4gICAgJGxlZ2VuZC5vbignaG92ZXInLCdidXR0b24nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIGlmKCQoJ2JvZHknKS5oYXNDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcCcpO1xuICAgICAgICBpZigkKGlkKS5jc3MoJ29wYWNpdHknKSA9PSAwKSB7XG4gICAgICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5ub3QoaWQpLmFuaW1hdGUoeydvcGFjaXR5JzonMCd9LDEwMCk7XG4gICAgICAgICAgICAkKGlkKS5zdG9wKCkuYW5pbWF0ZSh7J29wYWNpdHknOicxJ30sMTAwKTtcbiAgICAgICAgfVxuICAgICBcbiAgICB9KTtcbiAgICBcbiAgICAkbGVnZW5kLm9uKCdjbGljaycsJ2J1dHRvbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcCcpO1xuICAgICAgICBpZigkKGlkKS5jc3MoJ29wYWNpdHknKSA9PSAwKSB7XG4gICAgICAgICAgICAkKCcubWFwJykuc3RvcCgpLm5vdChpZCkuY3NzKHsnb3BhY2l0eSc6JzAnfSk7XG4gICAgICAgICAgICAkKGlkKS5zdG9wKCkuY3NzKHsnb3BhY2l0eSc6JzEnfSk7ICAgICAgICAgICAgXG4gICAgICAgIH0gXG4gICAgICAgIFxuICAgICAgICAkKGlkKS5hZGRDbGFzcygnYWN0aXZlJyk7ICAgXG4gICAgIFxuICAgIH0pO1xuICAgIFxuICAgICRsZWdlbmQubW91c2VsZWF2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIGlmKCQoJ2JvZHknKS5oYXNDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5hbmltYXRlKHsnb3BhY2l0eSc6JzAnfSwxMDApO1xuICAgICAgICAkKCcjbWFwLTAnKS5zdG9wKCkuYW5pbWF0ZSh7J29wYWNpdHknOicxJ30sMTAwKTtcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBpZigkKCcucGFnZS10ZW1wbGF0ZS1jYXJlZXJzJykubGVuZ3RoKSB7XG4gICAgICAgIHZhciBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuICAgICAgICBpZihzZWFyY2hQYXJhbXMuaGFzKCdzZWFyY2gnKSkge1xuICAgICAgICAgICAgdmFyIHBhcmFtID0gc2VhcmNoUGFyYW1zLmdldCgnc2VhcmNoJyk7XG4gICAgICAgICAgICBpZihwYXJhbSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkKCcjY2FyZWVycy1yb290Jykub2Zmc2V0KCkudG9wIC0zNSB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgICAkKFwibWFpbiBzZWN0aW9uOm5vdCgnLmNhcmVlcnMtc2VjdGlvbicpXCIpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB3aW5kb3cucmVhY3RNYXRjaEhlaWdodCA9IGZ1bmN0aW9uKGVsQ2xhc3NOYW1lKSB7XG4gICAgICAgICAgJCgnLmNhcmVlcnMtc2VjdGlvbiAuY29sdW1uIGgzJykubWF0Y2hIZWlnaHQoeyByb3c6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIE9wZW4gZXh0ZXJuYWwgbGlua3MgaW4gbmV3IHdpbmRvdyAoZXhjbHVlIHNjdiBpbWFnZSBtYXBzLCBlbWFpbCwgdGVsIGFuZCBmb29ib3gpXG5cblx0JCgnYScpLm5vdCgnc3ZnIGEsIFtocmVmKj1cInRlbDpcIl0sIFtjbGFzcyo9XCJmb29ib3hcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaXNJbnRlcm5hbExpbmsgPSBuZXcgUmVnRXhwKCcvJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgJy8nKTtcblx0XHRpZiAoICEgaXNJbnRlcm5hbExpbmsudGVzdCh0aGlzLmhyZWYpICkge1xuXHRcdFx0JCh0aGlzKS5hdHRyKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG5cdFx0fVxuXHR9KTtcblx0XG4gICAgJCgnYVtocmVmKj1cIi5wZGZcIl0nKS5hdHRyKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiIsIihmdW5jdGlvbigkKSB7XG4gICAgJChkb2N1bWVudCkub24oJ2ZhY2V0d3AtbG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChGV1AubG9hZGVkKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCgnLmZhY2V0d3AtdGVtcGxhdGUnKTtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSAtMTUwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCgnLmZhY2V0d3AtZmlsdGVycycpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCgnLmZhY2V0d3AtZmlsdGVycycpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCAkKCcuZmFjZXR3cC1jdXN0b20tZmlsdGVycycpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCgnLmZhY2V0d3AtY3VzdG9tLWZpbHRlcnMnKTtcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSAtNjA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgICAgICBzY3JvbGxUYXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IG9mZnNldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNib29rLWZpbHRlcnMnKS5mb3VuZGF0aW9uKCdjbG9zZScpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBGb3VuZGF0aW9uLnJlSW5pdCgnZXF1YWxpemVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSk7XG4gICAgXG4gICAgXG59KShqUXVlcnkpOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgZGlkU2Nyb2xsO1xuICAgIHZhciBsYXN0U2Nyb2xsVG9wID0gMDtcbiAgICB2YXIgZGVsdGEgPSAyMDA7XG4gICAgdmFyIG5hdmJhckhlaWdodCA9ICQoJy5zaXRlLWhlYWRlcicpLm91dGVySGVpZ2h0KCk7XG4gICAgXG4gICAgJCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbihldmVudCl7XG4gICAgICAgIGRpZFNjcm9sbCA9IHRydWU7XG4gICAgfSk7XG4gICAgXG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChkaWRTY3JvbGwpIHtcbiAgICAgICAgICAgIGhhc1Njcm9sbGVkKCk7XG4gICAgICAgICAgICBkaWRTY3JvbGwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIDI1MCk7XG4gICAgXG4gICAgZnVuY3Rpb24gaGFzU2Nyb2xsZWQoKSB7XG4gICAgICAgIHZhciBzdCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2Ugc2Nyb2xsIG1vcmUgdGhhbiBkZWx0YVxuICAgICAgICBpZihNYXRoLmFicyhsYXN0U2Nyb2xsVG9wIC0gc3QpIDw9IGRlbHRhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgLy8gSWYgc2Nyb2xsZWQgZG93biBhbmQgcGFzdCB0aGUgbmF2YmFyLCBhZGQgY2xhc3MgLm5hdi11cC5cbiAgICAgICAgaWYgKHN0ID4gbGFzdFNjcm9sbFRvcCl7XG4gICAgICAgICAgICAvLyBTY3JvbGwgRG93blxuICAgICAgICAgICAgaWYoc3QgPiBuYXZiYXJIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5hZGRDbGFzcygnZml4ZWQnKS5yZW1vdmVDbGFzcygnbmF2LWRvd24nKS5hZGRDbGFzcygnbmF2LXVwIHNocmluaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2Nyb2xsIFVwXG4gICAgICAgICAgICBpZigoZGVsdGErbmF2YmFySGVpZ2h0KSArIHN0ICsgJCh3aW5kb3cpLmhlaWdodCgpIDwgJChkb2N1bWVudCkuaGVpZ2h0KCkpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnbmF2LXVwJykuYWRkQ2xhc3MoJ25hdi1kb3duJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKHN0IDw9IChkZWx0YStuYXZiYXJIZWlnaHQpKSB7XG4gICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnZml4ZWQgbmF2LWRvd24gc2hyaW5rJyk7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgIGxhc3RTY3JvbGxUb3AgPSBzdDtcbiAgICB9XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIExvYWQgRm91bmRhdGlvblxuXHQkKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG4gICAgXG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdkb2N1bWVudC1yZWFkeScpO1xuICAgXG4gICAgJCgnLnNjcm9sbC1uZXh0Jykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgICAgXG4gICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgIG9mZnNldDogLTEwMCxcbiAgICAgICAgICAgIHNjcm9sbFRhcmdldDogJCgnbWFpbiBzZWN0aW9uOmZpcnN0LWNoaWxkJyksXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFRvZ2dsZSBtZW51XG4gICAgXG4gICAgJCgnbGkubWVudS1pdGVtLWhhcy1jaGlsZHJlbiA+IGEnKS5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xuICAgICAgICBcbiAgICAgICAgdmFyICR0b2dnbGUgPSAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy5zdWItbWVudS10b2dnbGUnKTtcbiAgICAgICAgXG4gICAgICAgIGlmKCAkdG9nZ2xlLmlzKCc6dmlzaWJsZScpICkge1xuICAgICAgICAgICAgJHRvZ2dsZS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcblxuICAgIH0pO1xuICAgIFxuICBcbiAgICAkKHdpbmRvdykuc2Nyb2xsKGFuaW1hdGVOdW1iZXJzKTtcbiAgICBcbiAgICAkKHdpbmRvdykub24oXCJsb2FkIHNjcm9sbFwiLGZ1bmN0aW9uKGUpe1xuICAgICAgICBhbmltYXRlTnVtYmVycygpOyBcbiAgICB9KTtcbiAgICB2YXIgdmlld2VkID0gZmFsc2U7XG4gICAgXG4gICAgZnVuY3Rpb24gaXNTY3JvbGxlZEludG9WaWV3KGVsZW0pIHtcbiAgICAgICAgXG4gICAgICAgIGlmKCAhICQoZWxlbSkubGVuZ3RoICkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgZG9jVmlld1RvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgdmFyIGRvY1ZpZXdCb3R0b20gPSBkb2NWaWV3VG9wICsgJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgIFxuICAgICAgICB2YXIgZWxlbVRvcCA9ICQoZWxlbSkub2Zmc2V0KCkudG9wO1xuICAgICAgICB2YXIgZWxlbUJvdHRvbSA9IGVsZW1Ub3AgKyAkKGVsZW0pLmhlaWdodCgpO1xuICAgIFxuICAgICAgICByZXR1cm4gKChlbGVtQm90dG9tIDw9IGRvY1ZpZXdCb3R0b20pICYmIChlbGVtVG9wID49IGRvY1ZpZXdUb3ApKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gYW5pbWF0ZU51bWJlcnMoKSB7XG4gICAgICBpZiAoaXNTY3JvbGxlZEludG9WaWV3KCQoXCIubnVtYmVyc1wiKSkgJiYgIXZpZXdlZCkge1xuICAgICAgICAgIHZpZXdlZCA9IHRydWU7XG4gICAgICAgICAgJCgnLm51bWJlcicpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICQodGhpcykuY3NzKCdvcGFjaXR5JywgMSk7XG4gICAgICAgICAgJCh0aGlzKS5wcm9wKCdDb3VudGVyJywwKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgQ291bnRlcjogJCh0aGlzKS50ZXh0KCkucmVwbGFjZSgvLC9nLCAnJylcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiA0MDAwLFxuICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgIHN0ZXA6IGZ1bmN0aW9uIChub3cpIHtcbiAgICAgICAgICAgICAgICAgICQodGhpcykudGV4dChNYXRoLmNlaWwobm93KS50b1N0cmluZygpLnJlcGxhY2UoLyhcXGQpKD89KFxcZFxcZFxcZCkrKD8hXFxkKSkvZywgXCIkMSxcIikpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgICQoJy51bC1leHBhbmQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYoJCh0aGlzKS5maW5kKCdsaTp2aXNpYmxlJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmZpbmQoJ3NwYW4gYScpLnNob3coKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgICQoJy51bC1leHBhbmQnKS5vbignY2xpY2snLCdzcGFuIGEnLGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIC8vdmFyICRjaGlsZHJlbiA9ICQodGhpcykucHJldigndWwnKS5jaGlsZHJlbigpO1xuICAgICAgICBcbiAgICAgICAgLy8kY2hpbGRyZW4uY3NzKCdkaXNwbGF5JywgJ2lubGluZScpO1xuICAgICAgICAvL3JldHVybiBmYWxzZTtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdkaXYnKS5maW5kKCd1bCcpLnJlbW92ZUNsYXNzKCdzaG9ydCcpO1xuICAgICAgICAkKHRoaXMpLnJlbW92ZSgpOyAgXG4gICAgfSk7XG5cbiAgICBcbiAgICBcbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0Ly8gUmVwbGFjZSBhbGwgU1ZHIGltYWdlcyB3aXRoIGlubGluZSBTVkcgKHVzZSBhcyBuZWVkZWQgc28geW91IGNhbiBzZXQgaG92ZXIgZmlsbHMpXG5cbiAgICAgICAgJCgnaW1nLnN2ZycpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciAkaW1nID0galF1ZXJ5KHRoaXMpO1xuICAgICAgICAgICAgdmFyIGltZ0lEID0gJGltZy5hdHRyKCdpZCcpO1xuICAgICAgICAgICAgdmFyIGltZ0NsYXNzID0gJGltZy5hdHRyKCdjbGFzcycpO1xuICAgICAgICAgICAgdmFyIGltZ1VSTCA9ICRpbWcuYXR0cignc3JjJyk7XG5cblx0XHQkLmdldChpbWdVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdC8vIEdldCB0aGUgU1ZHIHRhZywgaWdub3JlIHRoZSByZXN0XG5cdFx0XHR2YXIgJHN2ZyA9IGpRdWVyeShkYXRhKS5maW5kKCdzdmcnKTtcblxuXHRcdFx0Ly8gQWRkIHJlcGxhY2VkIGltYWdlJ3MgSUQgdG8gdGhlIG5ldyBTVkdcblx0XHRcdGlmKHR5cGVvZiBpbWdJRCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0JHN2ZyA9ICRzdmcuYXR0cignaWQnLCBpbWdJRCk7XG5cdFx0XHR9XG5cdFx0XHQvLyBBZGQgcmVwbGFjZWQgaW1hZ2UncyBjbGFzc2VzIHRvIHRoZSBuZXcgU1ZHXG5cdFx0XHRpZih0eXBlb2YgaW1nQ2xhc3MgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdCRzdmcgPSAkc3ZnLmF0dHIoJ2NsYXNzJywgaW1nQ2xhc3MrJyByZXBsYWNlZC1zdmcnKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVtb3ZlIGFueSBpbnZhbGlkIFhNTCB0YWdzIGFzIHBlciBodHRwOi8vdmFsaWRhdG9yLnczLm9yZ1xuXHRcdFx0JHN2ZyA9ICRzdmcucmVtb3ZlQXR0cigneG1sbnM6YScpO1xuXG5cdFx0XHQvLyBSZXBsYWNlIGltYWdlIHdpdGggbmV3IFNWR1xuXHRcdFx0JGltZy5yZXBsYWNlV2l0aCgkc3ZnKTtcblxuXHRcdH0sICd4bWwnKTtcblxuXHR9KTtcblxuICAgIFxuXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG4iLCIoZnVuY3Rpb24oJCkge1xuXHRcblx0J3VzZSBzdHJpY3QnO1x0XG5cdFxuXHRcbiAgICB2YXIgJGNvbHVtbiA9ICQoJy5zZWN0aW9uLWxlYWRlcnNoaXAgLmdyaWQgLmNvbHVtbicpO1xuICAgIFxuICAgIC8vb3BlbiBhbmQgY2xvc2UgY29sdW1uXG4gICAgJGNvbHVtbi5maW5kKCcuanMtZXhwYW5kZXIgLm9wZW4sIC5qcy1leHBhbmRlciAudGh1bWJuYWlsJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICB2YXIgJHRoaXNDb2x1bW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5jb2x1bW4nKTtcbiAgICBcbiAgICAgIGlmICgkdGhpc0NvbHVtbi5oYXNDbGFzcygnaXMtY29sbGFwc2VkJykpIHtcbiAgICAgICAgLy8gc2libGluZ3MgcmVtb3ZlIG9wZW4gY2xhc3MgYW5kIGFkZCBjbG9zZWQgY2xhc3Nlc1xuICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCBpcy1pbmFjdGl2ZScpO1xuICAgICAgICAvLyByZW1vdmUgY2xvc2VkIGNsYXNzZXMsIGFkZCBwZW4gY2xhc3NcbiAgICAgICAgJHRoaXNDb2x1bW4ucmVtb3ZlQ2xhc3MoJ2lzLWNvbGxhcHNlZCBpcy1pbmFjdGl2ZScpLmFkZENsYXNzKCdpcy1leHBhbmRlZCcpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5oYXNDbGFzcygnaXMtaW5hY3RpdmUnKSkge1xuICAgICAgICAgIC8vZG8gbm90aGluZ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5hZGRDbGFzcygnaXMtaW5hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHZhciBvZmZzZXQgPSAwO1xuICAgICAgICBpZiggRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoJ3hsYXJnZScpICkge1xuICAgICAgICAgIHZhciBvZmZzZXQgPSAtMTAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkLnNtb290aFNjcm9sbCh7XG4gICAgICAgICAgICBzY3JvbGxUYXJnZXQ6ICR0aGlzQ29sdW1uLFxuICAgICAgICAgICAgLy9vZmZzZXQ6IG9mZnNldCxcbiAgICAgICAgICAgIGJlZm9yZVNjcm9sbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCgnLnNpdGUtaGVhZGVyJykuYWRkQ2xhc3MoJ25hdi11cCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICR0aGlzQ29sdW1uLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLnJlbW92ZUNsYXNzKCdpcy1pbmFjdGl2ZScpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIC8vY2xvc2UgY2FyZCB3aGVuIGNsaWNrIG9uIGNyb3NzXG4gICAgJGNvbHVtbi5maW5kKCcuanMtY29sbGFwc2VyJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICB2YXIgJHRoaXNDb2x1bW4gPSAkKHRoaXMpLnBhcmVudHMoJy5jb2x1bW5fX2V4cGFuZGVyJykuY2xvc2VzdCgnLmNvbHVtbicpO1xuICAgIFxuICAgICAgJHRoaXNDb2x1bW4ucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCBpcy1pbmFjdGl2ZScpO1xuICAgICAgJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLnJlbW92ZUNsYXNzKCdpcy1pbmFjdGl2ZScpO1xuICAgIFxuICAgIH0pO1xuXG59KShqUXVlcnkpOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICAkKCcjbG9naW5mb3JtIDppbnB1dCwgI3Bhc3N3b3JkZm9ybSA6aW5wdXQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGxhYmVsID0gJCh0aGlzKS5wYXJlbnQoKS5maW5kKCdsYWJlbCcpLnRleHQoKTtcbiAgICAgICAgJCh0aGlzKS5hdHRyKCAncGxhY2Vob2xkZXInLCBsYWJlbCApO1xuICAgIH0pO1xuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucGxheS12aWRlbycsIHBsYXlWaWRlbyk7XG4gICAgXG4gICAgZnVuY3Rpb24gcGxheVZpZGVvKCkge1xuICAgICAgICBcbiAgICAgICAgLy8gU3RvcCBhbGwgYmFja2dyb3VuZCB2aWRlb3NcbiAgICAgICAgaWYoICQoJy5iYWNrZ3JvdW5kLXZpZGVvIHZpZGVvJykuc2l6ZSgpICkge1xuICAgICAgICAgICAgJCgnLmJhY2tncm91bmQtdmlkZW8gdmlkZW8nKVswXS5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHZhciB1cmwgPSAkdGhpcy5kYXRhKCdzcmMnKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdmFyICRtb2RhbCA9ICQoJyMnICsgJHRoaXMuZGF0YSgnb3BlbicpKTtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICQuYWpheCh1cmwpXG4gICAgICAgICAgLmRvbmUoZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAkbW9kYWwuZmluZCgnLmZsZXgtdmlkZW8nKS5odG1sKHJlc3ApLmZvdW5kYXRpb24oJ29wZW4nKTtcbiAgICAgICAgfSk7XG4gICAgICAgICovXG4gICAgICAgIFxuICAgICAgICB2YXIgJGlmcmFtZSA9ICQoJzxpZnJhbWU+Jywge1xuICAgICAgICAgICAgc3JjOiB1cmwsXG4gICAgICAgICAgICBpZDogICd2aWRlbycsXG4gICAgICAgICAgICBmcmFtZWJvcmRlcjogMCxcbiAgICAgICAgICAgIHNjcm9sbGluZzogJ25vJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAkaWZyYW1lLmFwcGVuZFRvKCcudmlkZW8tcGxhY2Vob2xkZXInLCAkbW9kYWwgKTsgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvLyBNYWtlIHN1cmUgdmlkZW9zIGRvbid0IHBsYXkgaW4gYmFja2dyb3VuZFxuICAgICQoZG9jdW1lbnQpLm9uKFxuICAgICAgJ2Nsb3NlZC56Zi5yZXZlYWwnLCAnI21vZGFsLXZpZGVvJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy52aWRlby1wbGFjZWhvbGRlcicpLmh0bWwoJycpO1xuICAgICAgICBpZiggJCgnLmJhY2tncm91bmQtdmlkZW8gdmlkZW8nKS5zaXplKCkgKSB7XG4gICAgICAgICAgICAkKCcuYmFja2dyb3VuZC12aWRlbyB2aWRlbycpWzBdLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgIH1cbiAgICApO1xuICAgICAgICBcbiAgICBcbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG4iLCIoZnVuY3Rpb24oJCkge1xuXHRcblx0J3VzZSBzdHJpY3QnO1x0XG5cdFxuXHRcbiAgICB2YXIgZ2V0TGFzdFNpYmxpbmdJblJvdyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHZhciBjYW5kaWRhdGUgPSBlbGVtZW50LFxuICAgICAgICAgICAgZWxlbWVudFRvcCA9IGVsZW1lbnQub2Zmc2V0VG9wO1xuICAgICAgICBcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIHRoZSBlbGVtZW504oCZcyBuZXh0IHNpYmxpbmdzIGFuZCBsb29rIGZvciB0aGUgZmlyc3Qgb25lIHdoaWNoXG4gICAgICAgIC8vIGlzIHBvc2l0aW9uZWQgZnVydGhlciBkb3duIHRoZSBwYWdlLlxuICAgICAgICB3aGlsZSAoY2FuZGlkYXRlLm5leHRFbGVtZW50U2libGluZyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGNhbmRpZGF0ZS5uZXh0RWxlbWVudFNpYmxpbmcub2Zmc2V0VG9wID4gZWxlbWVudFRvcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYW5kaWRhdGUgPSBjYW5kaWRhdGUubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgfTtcbiAgICBcbiAgICB2YXIgJGdyaWQgPSAkKCcuc2VjdGlvbi1idXNpbmVzc2VzIC5ncmlkJyk7XG4gICAgdmFyICRjb2x1bW4gPSAkKCcuc2VjdGlvbi1idXNpbmVzc2VzIC5ncmlkID4gLmNvbHVtbicpO1xuICAgIFxuICAgIC8vb3BlbiBhbmQgY2xvc2UgY29sdW1uXG4gICAgJGNvbHVtbi5maW5kKCcuanMtZXhwYW5kZXIgLm9wZW4sIC5qcy1leHBhbmRlciAudGh1bWJuYWlsJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgICAgIHZhciAkdGhpc0NvbHVtbiA9ICQodGhpcykuY2xvc2VzdCgnLmNvbHVtbicpO1xuICAgICAgICBcbiAgICAgICAgLy8gR2V0IGxhc3Qgc2libGluZyBpbiByb3dcbiAgICAgICAgdmFyIGxhc3QgPSBnZXRMYXN0U2libGluZ0luUm93KCR0aGlzQ29sdW1uWzBdKTtcbiAgICAgICAgXG4gICAgICAgICQoJy5kZXRhaWxzJykucmVtb3ZlKCk7XG4gICAgICAgIFxuICAgICAgICAvL2NvbnNvbGUubG9nKCQobGFzdCkuaW5kZXgoKSk7XG4gICAgICAgICR0aGlzQ29sdW1uLmZpbmQoJy5jb2x1bW5fX2V4cGFuZGVyJylcbiAgICAgICAgICAgIC5jbG9uZSgpXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hpZGUnKVxuICAgICAgICAgICAgLndyYXAoJzxkaXYgY2xhc3M9XCJkZXRhaWxzXCIgLz4nKS5wYXJlbnQoKVxuICAgICAgICAgICAgLmluc2VydEFmdGVyKCQobGFzdCkpO1xuICAgICAgXG4gICAgXG4gICAgICAgIGlmICgkdGhpc0NvbHVtbi5oYXNDbGFzcygnaXMtY29sbGFwc2VkJykpIHtcbiAgICAgICAgLy8gc2libGluZ3MgcmVtb3ZlIG9wZW4gY2xhc3MgYW5kIGFkZCBjbG9zZWQgY2xhc3Nlc1xuICAgICAgICAgICAgJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBjbG9zZWQgY2xhc3NlcywgYWRkIHBlbiBjbGFzc1xuICAgICAgICAgICAgJHRoaXNDb2x1bW4ucmVtb3ZlQ2xhc3MoJ2lzLWNvbGxhcHNlZCBpcy1pbmFjdGl2ZScpLmFkZENsYXNzKCdpcy1leHBhbmRlZCcpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5oYXNDbGFzcygnaXMtaW5hY3RpdmUnKSkge1xuICAgICAgICAgIC8vZG8gbm90aGluZ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5hZGRDbGFzcygnaXMtaW5hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHZhciBvZmZzZXQgPSAwO1xuICAgICAgICBpZiggRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoJ3hsYXJnZScpICkge1xuICAgICAgICAgIHZhciBvZmZzZXQgPSAtMTAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkLnNtb290aFNjcm9sbCh7XG4gICAgICAgICAgICBzY3JvbGxUYXJnZXQ6ICR0aGlzQ29sdW1uLFxuICAgICAgICAgICAgLy9vZmZzZXQ6IG9mZnNldCxcbiAgICAgICAgICAgIGJlZm9yZVNjcm9sbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCgnLnNpdGUtaGVhZGVyJykuYWRkQ2xhc3MoJ25hdi11cCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICR0aGlzQ29sdW1uLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLnJlbW92ZUNsYXNzKCdpcy1pbmFjdGl2ZScpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIC8vY2xvc2UgY2FyZCB3aGVuIGNsaWNrIG9uIGNyb3NzXG4gICAgJGdyaWQub24oJ2NsaWNrJywnLmNsb3NlJywgZnVuY3Rpb24oKSB7XG4gICAgICAkZ3JpZC5maW5kKCcuZGV0YWlscycpLnJlbW92ZSgpO1xuICAgICAgJGNvbHVtbi5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkIGlzLWluYWN0aXZlJyk7XG4gICAgfSk7XG4gICAgXG4gICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgJGdyaWQuZmluZCgnLmRldGFpbHMnKS5yZW1vdmUoKTtcbiAgICAgICAgJGNvbHVtbi5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkIGlzLWluYWN0aXZlJyk7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuICAgIFxuICAgICQoJy5wYWdlLXRlbXBsYXRlLXJlZ2lvbnMgI21hcC1ib3ggaW1nJykub24oICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIG9mZnNldCA9ICQodGhpcykub2Zmc2V0KCk7XG4gICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcigoZS5wYWdlWCAtIG9mZnNldC5sZWZ0KSAvICQodGhpcykud2lkdGgoKSAqIDEwMDAwKS8xMDA7XG4gICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcigoZS5wYWdlWSAtIG9mZnNldC50b3ApIC8gJCh0aGlzKS5oZWlnaHQoKSAqIDEwMDAwKS8xMDA7XG4gICAgICAgIFxuICAgICAgICAkKCcjbW91c2UteHknKS52YWwoIHggKyAnLycgKyB5ICk7ICAgICBcbiAgICB9KTtcbiAgICBcbiAgICAkKCBcIi5tYXAta2V5IGJ1dHRvblwiICkuaG92ZXIoXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnI21hcC1ib3ggYnV0dG9uJykucmVtb3ZlQ2xhc3MoIFwiaG92ZXJcIiApO1xuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcmtlcicpO1xuICAgICAgICAkKGlkKS5hZGRDbGFzcygnaG92ZXInKTtcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcjbWFwLWJveCBidXR0b24nKS5yZW1vdmVDbGFzcyggXCJob3ZlclwiICk7XG4gICAgICB9XG4gICAgKTtcbiAgICBcbiAgICAkKCcucGFnZS10ZW1wbGF0ZS1yZWdpb25zICNtYXAtYm94IGJ1dHRvbicpLm9uKCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIC8vJCh0aGlzKS5hZGRDbGFzcygnaG92ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICBcbiAgICAkKCcucGFnZS10ZW1wbGF0ZS1yZWdpb25zIC5tYXAta2V5IGJ1dHRvbicpLm9uKCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnbWFya2VyJyk7XG4gICAgICAgIC8vJChpZCkuYWRkQ2xhc3MoJ2hvdmVyJyk7XG4gICAgfSk7XG4gICAgXG4gICAgXG4gICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJy5wYWdlLXRlbXBsYXRlLXJlZ2lvbnMgI21hcC1ib3ggLmxvY2F0aW9ucycpLmNzcygnb3BhY2l0eScsIDEpO1xuICAgIH0pO1xuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuXG5cbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvLyBSZXNwb25zaXZlIHZpZGVvIGVtYmVkc1xuXHR2YXIgJGFsbF9vZW1iZWRfdmlkZW9zID0gJChcImlmcmFtZVtzcmMqPSd5b3V0dWJlJ10sIGlmcmFtZVtzcmMqPSd2aW1lbyddXCIpO1xuXG5cdCRhbGxfb2VtYmVkX3ZpZGVvcy5lYWNoKGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIF90aGlzID0gJCh0aGlzKTtcblxuXHRcdGlmIChfdGhpcy5wYXJlbnQoJy5lbWJlZC1jb250YWluZXInKS5sZW5ndGggPT09IDApIHtcblx0XHQgIF90aGlzLndyYXAoJzxkaXYgY2xhc3M9XCJlbWJlZC1jb250YWluZXJcIj48L2Rpdj4nKTtcblx0XHR9XG5cblx0XHRfdGhpcy5yZW1vdmVBdHRyKCdoZWlnaHQnKS5yZW1vdmVBdHRyKCd3aWR0aCcpO1xuXG4gXHR9KTtcbiAgICBcblxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiLy8gUmV2ZWFsXG4oZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5wYWdlLXRlbXBsYXRlLXJlZ2lvbnMgYnV0dG9uW2RhdGEtcmVnaW9uXScsIGxvYWRSZWdpb24pO1xuICAgIFxuICAgIGZ1bmN0aW9uIGxvYWRSZWdpb24oKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkcmVnaW9uID0gJCgnIycgKyAkdGhpcy5kYXRhKCdyZWdpb24nKSApO1xuICAgICAgICB2YXIgJG1vZGFsID0gJCgnIycgKyAkdGhpcy5kYXRhKCdvcGVuJykpO1xuICAgICAgICBcbiAgICAgICAgaWYoICRyZWdpb24uc2l6ZSgpICkge1xuICAgICAgICAgICQoJy5jb250YWluZXInLCAkbW9kYWwgKS5odG1sKCRyZWdpb24uaHRtbCgpKTsgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xvc2VkLnpmLnJldmVhbCcsICcjcmVnaW9ucycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcuY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgLy8gcmVtb3ZlIGFjdGlvbiBidXR0b24gY2xhc3NcbiAgICAgICAgJCgnI21hcC1ib3ggYnV0dG9uJykucmVtb3ZlQ2xhc3MoIFwiaG92ZXJcIiApO1xuICAgIH0pO1xuICAgIFxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcudGVtcGxhdGUtYnVzaW5lc3MtbGluZXMgYnV0dG9uW2RhdGEtY29udGVudF0nLCBsb2FkTWFwKTtcbiAgICBcbiAgICBmdW5jdGlvbiBsb2FkTWFwKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgJG1hcCA9ICQoJyMnICsgJHRoaXMuZGF0YSgnY29udGVudCcpICk7XG4gICAgICAgIHZhciAkbW9kYWwgPSAkKCcjJyArICR0aGlzLmRhdGEoJ29wZW4nKSk7XG4gICAgICAgIFxuICAgICAgICBpZiggJG1hcC5zaXplKCkgKSB7XG4gICAgICAgICAgJCgnLmNvbnRhaW5lcicsICRtb2RhbCApLmh0bWwoJG1hcC5odG1sKCkpOyBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbG9zZWQuemYucmV2ZWFsJywgJyNtYXBzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5jc3MoeydvcGFjaXR5JzonMCd9KTtcbiAgICAgICAgJCgnI21hcC0wJykuc3RvcCgpLmNzcyh7J29wYWNpdHknOicxJ30pO1xuICAgIH0pO1xuICAgIFxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcudGVtcGxhdGUtcG9ydGZvbGlvLWxhbmQtcmVzb3VyY2VzIGJ1dHRvbltkYXRhLXByb2plY3RdJywgbG9hZFByb2plY3QpO1xuICAgIFxuICAgIGZ1bmN0aW9uIGxvYWRQcm9qZWN0KCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgJHByb2plY3QgPSAkKCcjJyArICR0aGlzLmRhdGEoJ3Byb2plY3QnKSApO1xuICAgICAgICB2YXIgJG1vZGFsID0gJCgnIycgKyAkdGhpcy5kYXRhKCdvcGVuJykpO1xuICAgICAgICBcbiAgICAgICAgaWYoICRwcm9qZWN0LnNpemUoKSApIHtcbiAgICAgICAgICAkKCcuY29udGFpbmVyJywgJG1vZGFsICkuaHRtbCgkcHJvamVjdC5odG1sKCkpOyBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbG9zZWQuemYucmV2ZWFsJywgJyNwcm9qZWN0cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcuY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICB9KTtcbiAgICAgICAgXG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG5cblxuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdCQoZG9jdW1lbnQpLm9uKFxuICAgICAgJ29wZW4uemYucmV2ZWFsJywgJyNtb2RhbC1zZWFyY2gnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykuZmluZChcImlucHV0XCIpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgIH1cbiAgICApO1xuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG4gICAgXG4gICAgZnVuY3Rpb24gaGlkZV9oZWFkZXJfbWVudSggbWVudSApIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBtYWluTWVudUJ1dHRvbkNsYXNzID0gJ21lbnUtdG9nZ2xlJyxcblx0XHRyZXNwb25zaXZlTWVudUNsYXNzID0gJ2dlbmVzaXMtcmVzcG9uc2l2ZS1tZW51JztcbiAgICAgICAgXG4gICAgICAgICQoIG1lbnUgKyAnIC4nICsgbWFpbk1lbnVCdXR0b25DbGFzcyArICcsJyArIG1lbnUgKyAnIC4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLnN1Yi1tZW51LXRvZ2dsZScgKVxuXHRcdFx0LnJlbW92ZUNsYXNzKCAnYWN0aXZhdGVkJyApXG5cdFx0XHQuYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSApXG5cdFx0XHQuYXR0ciggJ2FyaWEtcHJlc3NlZCcsIGZhbHNlICk7XG5cblx0XHQkKCBtZW51ICsgJyAuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnLCcgKyBtZW51ICsgJyAuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnIC5zdWItbWVudScgKVxuXHRcdFx0LmF0dHIoICdzdHlsZScsICcnICk7XG4gICAgfVxuICAgIFxuICAgIHZhciBzY3JvbGxub3cgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgdGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIC8vIGlmIHNjcm9sbG5vdygpLWZ1bmN0aW9uIHdhcyB0cmlnZ2VyZWQgYnkgYW4gZXZlbnRcbiAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRhcmdldCA9IHRoaXMuaGFzaDtcbiAgICAgICAgfVxuICAgICAgICAvLyBlbHNlIGl0IHdhcyBjYWxsZWQgd2hlbiBwYWdlIHdpdGggYSAjaGFzaCB3YXMgbG9hZGVkXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0ID0gbG9jYXRpb24uaGFzaDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNhbWUgcGFnZSBzY3JvbGxcbiAgICAgICAgJC5zbW9vdGhTY3JvbGwoe1xuICAgICAgICAgICAgc2Nyb2xsVGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgICBiZWZvcmVTY3JvbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLnJlbW92ZUNsYXNzKCdmaXhlZCBzaHJpbmsgbmF2LWRvd24nKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZnRlclNjcm9sbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCgnLnNpdGUtaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2ZpeGVkIHNocmluayBuYXYtZG93bicpO1xuICAgICAgICAgICAgICAgIGlmKCQodGFyZ2V0KS5oYXNDbGFzcygndHlwZS1wZW9wbGUnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0YXJnZXQpLmZpbmQoJy5oZWFkZXInKS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gaWYgcGFnZSBoYXMgYSAjaGFzaFxuICAgIGlmIChsb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5zY3JvbGxUb3AoMCkuc2hvdygpO1xuICAgICAgICAvLyBzbW9vdGgtc2Nyb2xsIHRvIGhhc2hcbiAgICAgICAgc2Nyb2xsbm93KCk7XG4gICAgfVxuXG4gICAgLy8gZm9yIGVhY2ggPGE+LWVsZW1lbnQgdGhhdCBjb250YWlucyBhIFwiL1wiIGFuZCBhIFwiI1wiXG4gICAgJCgnYVtocmVmKj1cIi9cIl1baHJlZio9I10nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vIGlmIHRoZSBwYXRobmFtZSBvZiB0aGUgaHJlZiByZWZlcmVuY2VzIHRoZSBzYW1lIHBhZ2VcbiAgICAgICAgaWYgKHRoaXMucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sJycpID09PSBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9eXFwvLywnJykgJiYgdGhpcy5ob3N0bmFtZSA9PT0gbG9jYXRpb24uaG9zdG5hbWUpIHtcbiAgICAgICAgICAgIC8vIG9ubHkga2VlcCB0aGUgaGFzaCwgaS5lLiBkbyBub3Qga2VlcCB0aGUgcGF0aG5hbWVcbiAgICAgICAgICAgICQodGhpcykuYXR0cihcImhyZWZcIiwgdGhpcy5oYXNoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gc2VsZWN0IGFsbCBocmVmLWVsZW1lbnRzIHRoYXQgc3RhcnQgd2l0aCAjXG4gICAgLy8gaW5jbHVkaW5nIHRoZSBvbmVzIHRoYXQgd2VyZSBzdHJpcHBlZCBieSB0aGVpciBwYXRobmFtZSBqdXN0IGFib3ZlXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICdhW2hyZWZePSNdOm5vdChbaHJlZj0jXSknLCBzY3JvbGxub3cgKTtcblxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIl19
