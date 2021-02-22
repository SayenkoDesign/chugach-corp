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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImExMXktdG9nZ2xlLmpzIiwiZ2VuZXNpcy1yZXNwb25zaXZlLW1lbnUuanMiLCJob3ZlckludGVudC5qcyIsImltYWdlc2xvYWRlZC5wa2dkLmpzIiwianF1ZXJ5Lm1hdGNoSGVpZ2h0LmpzIiwianF1ZXJ5LnNtb290aC1zY3JvbGwuanMiLCJqcXVlcnkud2F5cG9pbnRzLmpzIiwicmVjbGluZXIuanMiLCJzbGljay5qcyIsInN1cGVyZmlzaC5qcyIsIndheXBvaW50cy5pbnZpZXcuanMiLCJidXNpbmVzcy1saW5lcy5qcyIsImNhcmVlcnMuanMiLCJleHRlcm5hbC1saW5rcy5qcyIsImZhY2V0d3AuanMiLCJmaXhlZC1oZWFkZXIuanMiLCJnZW5lcmFsLmpzIiwiaW5saW5lLXN2Zy5qcyIsImxlYWRlcnNoaXAuanMiLCJsb2dpbi5qcyIsIm1vZGFsLXZpZGVvLmpzIiwib3BlcmF0aW5nLWNvbXBhbmllcy5qcyIsInBhZ2VidWlsZGVyLWZhcS1maWx0ZXJzLmpzIiwicGFnZWJ1aWxkZXItbmF2LmpzIiwicGFnZWJ1aWxkZXItcmVzb3VyY2VzLWFjY29yZGlvbi5qcyIsInBhZ2VidWlsZGVyLXNsaWRlcnMuanMiLCJyZWdpb25zLmpzIiwicmVzcG9uc2l2ZS12aWRlby1lbWJlZHMuanMiLCJyZXZlYWwuanMiLCJzZWFyY2guanMiLCJzbW9vdGgtc2Nyb2xsLmpzIl0sIm5hbWVzIjpbImludGVybmFsSWQiLCJ0b2dnbGVzTWFwIiwidGFyZ2V0c01hcCIsIiQiLCJzZWxlY3RvciIsImNvbnRleHQiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImdldENsb3Nlc3RUb2dnbGUiLCJlbGVtZW50IiwiY2xvc2VzdCIsIm5vZGVUeXBlIiwiaGFzQXR0cmlidXRlIiwicGFyZW50Tm9kZSIsImhhbmRsZVRvZ2dsZSIsInRvZ2dsZSIsInRhcmdldCIsImdldEF0dHJpYnV0ZSIsInRvZ2dsZXMiLCJpZCIsImlzRXhwYW5kZWQiLCJzZXRBdHRyaWJ1dGUiLCJmb3JFYWNoIiwiaW5uZXJIVE1MIiwiaW5pdEExMXlUb2dnbGUiLCJyZWR1Y2UiLCJhY2MiLCJwdXNoIiwidGFyZ2V0cyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJsYWJlbGxlZGJ5Iiwiam9pbiIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsIndoaWNoIiwid2luZG93IiwiYTExeVRvZ2dsZSIsInVuZGVmaW5lZCIsInJlbW92ZUNsYXNzIiwiZ2VuZXNpc01lbnVQYXJhbXMiLCJnZW5lc2lzX3Jlc3BvbnNpdmVfbWVudSIsImdlbmVzaXNNZW51c1VuY2hlY2tlZCIsIm1lbnVDbGFzc2VzIiwiZ2VuZXNpc01lbnVzIiwibWVudXNUb0NvbWJpbmUiLCJlYWNoIiwiZ3JvdXAiLCJrZXkiLCJ2YWx1ZSIsIm1lbnVTdHJpbmciLCIkbWVudSIsIm5ld1N0cmluZyIsImFkZENsYXNzIiwicmVwbGFjZSIsIm90aGVycyIsImNvbWJpbmUiLCJnZW5lc2lzTWVudSIsIm1haW5NZW51QnV0dG9uQ2xhc3MiLCJzdWJNZW51QnV0dG9uQ2xhc3MiLCJyZXNwb25zaXZlTWVudUNsYXNzIiwiaW5pdCIsIl9nZXRBbGxNZW51c0FycmF5IiwibWVudUljb25DbGFzcyIsInN1Yk1lbnVJY29uQ2xhc3MiLCJ0b2dnbGVCdXR0b25zIiwibWVudSIsImFwcGVuZCIsIm1haW5NZW51Iiwic3VibWVudSIsInN1Yk1lbnUiLCJfYWRkUmVzcG9uc2l2ZU1lbnVDbGFzcyIsIl9hZGRNZW51QnV0dG9ucyIsIm9uIiwiX21haW5tZW51VG9nZ2xlIiwiX2FkZENsYXNzSUQiLCJfc3VibWVudVRvZ2dsZSIsIl9kb1Jlc2l6ZSIsInRyaWdnZXJIYW5kbGVyIiwiX2dldE1lbnVTZWxlY3RvclN0cmluZyIsImZpbmQiLCJiZWZvcmUiLCJtZW51c1RvVG9nZ2xlIiwiY29uY2F0IiwiYnV0dG9ucyIsImF0dHIiLCJfbWF5YmVDbG9zZSIsIl9zdXBlcmZpc2hUb2dnbGUiLCJfY2hhbmdlU2tpcExpbmsiLCJfY29tYmluZU1lbnVzIiwiJHRoaXMiLCJuYXYiLCJuZXh0IiwibWF0Y2giLCJwcmltYXJ5TWVudSIsImNvbWJpbmVkTWVudXMiLCJmaWx0ZXIiLCJpbmRleCIsIl9nZXREaXNwbGF5VmFsdWUiLCJhcHBlbmRUbyIsImhpZGUiLCJzaG93IiwiX3RvZ2dsZUFyaWEiLCJ0b2dnbGVDbGFzcyIsInNsaWRlVG9nZ2xlIiwic2libGluZ3MiLCJzbGlkZVVwIiwiX3N1cGVyZmlzaCIsIiRhcmdzIiwic3VwZXJmaXNoIiwibWVudVRvZ2dsZUxpc3QiLCJuZXdWYWx1ZSIsInN0YXJ0TGluayIsImVuZExpbmsiLCIkaXRlbSIsImxpbmsiLCIkaWQiLCJnZXRFbGVtZW50QnlJZCIsInN0eWxlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImdldFByb3BlcnR5VmFsdWUiLCJhdHRyaWJ1dGUiLCJpdGVtQXJyYXkiLCJpdGVtU3RyaW5nIiwibWFwIiwibWVudUxpc3QiLCJ2YWx1ZU9mIiwicmVhZHkiLCJqUXVlcnkiLCJmbiIsImhvdmVySW50ZW50IiwiaGFuZGxlckluIiwiaGFuZGxlck91dCIsImNmZyIsImludGVydmFsIiwic2Vuc2l0aXZpdHkiLCJ0aW1lb3V0IiwiZXh0ZW5kIiwiaXNGdW5jdGlvbiIsIm92ZXIiLCJvdXQiLCJjWCIsImNZIiwicFgiLCJwWSIsInRyYWNrIiwiZXYiLCJwYWdlWCIsInBhZ2VZIiwiY29tcGFyZSIsIm9iIiwiaG92ZXJJbnRlbnRfdCIsImNsZWFyVGltZW91dCIsIk1hdGgiLCJhYnMiLCJvZmYiLCJob3ZlckludGVudF9zIiwiYXBwbHkiLCJzZXRUaW1lb3V0IiwiZGVsYXkiLCJoYW5kbGVIb3ZlciIsImUiLCJ0eXBlIiwiZ2xvYmFsIiwiZmFjdG9yeSIsImRlZmluZSIsImFtZCIsIm1vZHVsZSIsImV4cG9ydHMiLCJFdkVtaXR0ZXIiLCJwcm90byIsImV2ZW50TmFtZSIsImxpc3RlbmVyIiwiZXZlbnRzIiwiX2V2ZW50cyIsImxpc3RlbmVycyIsImluZGV4T2YiLCJvbmNlIiwib25jZUV2ZW50cyIsIl9vbmNlRXZlbnRzIiwib25jZUxpc3RlbmVycyIsInNwbGljZSIsImVtaXRFdmVudCIsImFyZ3MiLCJpIiwiaXNPbmNlIiwiYWxsT2ZmIiwicmVxdWlyZSIsImltYWdlc0xvYWRlZCIsImNvbnNvbGUiLCJhIiwiYiIsInByb3AiLCJhcnJheVNsaWNlIiwibWFrZUFycmF5Iiwib2JqIiwiaXNBcnJheSIsImlzQXJyYXlMaWtlIiwiSW1hZ2VzTG9hZGVkIiwiZWxlbSIsIm9wdGlvbnMiLCJvbkFsd2F5cyIsInF1ZXJ5RWxlbSIsImVycm9yIiwiZWxlbWVudHMiLCJnZXRJbWFnZXMiLCJqcURlZmVycmVkIiwiRGVmZXJyZWQiLCJjaGVjayIsImJpbmQiLCJjcmVhdGUiLCJpbWFnZXMiLCJhZGRFbGVtZW50SW1hZ2VzIiwibm9kZU5hbWUiLCJhZGRJbWFnZSIsImJhY2tncm91bmQiLCJhZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyIsImVsZW1lbnROb2RlVHlwZXMiLCJjaGlsZEltZ3MiLCJpbWciLCJjaGlsZHJlbiIsImNoaWxkIiwicmVVUkwiLCJtYXRjaGVzIiwiZXhlYyIsImJhY2tncm91bmRJbWFnZSIsInVybCIsImFkZEJhY2tncm91bmQiLCJsb2FkaW5nSW1hZ2UiLCJMb2FkaW5nSW1hZ2UiLCJCYWNrZ3JvdW5kIiwiX3RoaXMiLCJwcm9ncmVzc2VkQ291bnQiLCJoYXNBbnlCcm9rZW4iLCJjb21wbGV0ZSIsIm9uUHJvZ3Jlc3MiLCJpbWFnZSIsIm1lc3NhZ2UiLCJwcm9ncmVzcyIsImlzTG9hZGVkIiwibm90aWZ5IiwiZGVidWciLCJsb2ciLCJpc0NvbXBsZXRlIiwianFNZXRob2QiLCJnZXRJc0ltYWdlQ29tcGxldGUiLCJjb25maXJtIiwibmF0dXJhbFdpZHRoIiwicHJveHlJbWFnZSIsIkltYWdlIiwic3JjIiwiaGFuZGxlRXZlbnQiLCJtZXRob2QiLCJvbmxvYWQiLCJ1bmJpbmRFdmVudHMiLCJvbmVycm9yIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm1ha2VKUXVlcnlQbHVnaW4iLCJjYWxsYmFjayIsImluc3RhbmNlIiwicHJvbWlzZSIsIl9wcmV2aW91c1Jlc2l6ZVdpZHRoIiwiX3VwZGF0ZVRpbWVvdXQiLCJfcGFyc2UiLCJwYXJzZUZsb2F0IiwiX3Jvd3MiLCJ0b2xlcmFuY2UiLCIkZWxlbWVudHMiLCJsYXN0VG9wIiwicm93cyIsIiR0aGF0IiwidG9wIiwib2Zmc2V0IiwiY3NzIiwibGFzdFJvdyIsImZsb29yIiwiYWRkIiwiX3BhcnNlT3B0aW9ucyIsIm9wdHMiLCJieVJvdyIsInByb3BlcnR5IiwicmVtb3ZlIiwibWF0Y2hIZWlnaHQiLCJ0aGF0IiwiX2dyb3VwcyIsIm5vdCIsIl9hcHBseSIsInZlcnNpb24iLCJfdGhyb3R0bGUiLCJfbWFpbnRhaW5TY3JvbGwiLCJfYmVmb3JlVXBkYXRlIiwiX2FmdGVyVXBkYXRlIiwic2Nyb2xsVG9wIiwiaHRtbEhlaWdodCIsIm91dGVySGVpZ2h0IiwiJGhpZGRlblBhcmVudHMiLCJwYXJlbnRzIiwiZGF0YSIsImRpc3BsYXkiLCJyb3ciLCIkcm93IiwidGFyZ2V0SGVpZ2h0IiwidmVydGljYWxQYWRkaW5nIiwiaXMiLCJfYXBwbHlEYXRhQXBpIiwiZ3JvdXBzIiwiZ3JvdXBJZCIsIl91cGRhdGUiLCJ0aHJvdHRsZSIsIndpbmRvd1dpZHRoIiwid2lkdGgiLCJvcHRpb25PdmVycmlkZXMiLCJkZWZhdWx0cyIsImV4Y2x1ZGUiLCJleGNsdWRlV2l0aGluIiwiZGlyZWN0aW9uIiwiZGVsZWdhdGVTZWxlY3RvciIsInNjcm9sbEVsZW1lbnQiLCJzY3JvbGxUYXJnZXQiLCJhdXRvRm9jdXMiLCJiZWZvcmVTY3JvbGwiLCJhZnRlclNjcm9sbCIsImVhc2luZyIsInNwZWVkIiwiYXV0b0NvZWZmaWNpZW50IiwicHJldmVudERlZmF1bHQiLCJnZXRTY3JvbGxhYmxlIiwic2Nyb2xsYWJsZSIsInNjcm9sbGVkIiwiZGlyIiwiZWwiLCJzY3JvbGxpbmdFbGVtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiYm9keSIsInJSZWxhdGl2ZSIsInNjcmwiLCJwdXNoU3RhY2siLCJmaXJzdFNjcm9sbGFibGUiLCJzbW9vdGhTY3JvbGwiLCJleHRyYSIsImZpcnN0IiwiY2xpY2tIYW5kbGVyIiwiZXNjYXBlU2VsZWN0b3IiLCJzdHIiLCIkbGluayIsInRoaXNPcHRzIiwiZWxDb3VudGVyIiwiZXdsQ291bnRlciIsImluY2x1ZGUiLCJjbGlja09wdHMiLCJsb2NhdGlvblBhdGgiLCJmaWx0ZXJQYXRoIiwibG9jYXRpb24iLCJwYXRobmFtZSIsImxpbmtQYXRoIiwiaG9zdE1hdGNoIiwiaG9zdG5hbWUiLCJwYXRoTWF0Y2giLCJ0aGlzSGFzaCIsImhhc2giLCJnZXRFeHBsaWNpdE9mZnNldCIsInZhbCIsImV4cGxpY2l0IiwicmVsYXRpdmUiLCJwYXJ0cyIsInB4Iiwib25BZnRlclNjcm9sbCIsIiR0Z3QiLCJmb2N1cyIsImFjdGl2ZUVsZW1lbnQiLCJ0YWJJbmRleCIsIiRzY3JvbGxlciIsImRlbHRhIiwiZXhwbGljaXRPZmZzZXQiLCJzY3JvbGxUYXJnZXRPZmZzZXQiLCJzY3JvbGxlck9mZnNldCIsIm9mZlBvcyIsInNjcm9sbERpciIsImFuaVByb3BzIiwiYW5pT3B0cyIsInRlc3QiLCJkdXJhdGlvbiIsInN0ZXAiLCJzdG9wIiwiYW5pbWF0ZSIsInN0cmluZyIsImtleUNvdW50ZXIiLCJhbGxXYXlwb2ludHMiLCJXYXlwb2ludCIsIkVycm9yIiwiaGFuZGxlciIsIkFkYXB0ZXIiLCJhZGFwdGVyIiwiYXhpcyIsImhvcml6b250YWwiLCJlbmFibGVkIiwidHJpZ2dlclBvaW50IiwiR3JvdXAiLCJmaW5kT3JDcmVhdGUiLCJuYW1lIiwiQ29udGV4dCIsImZpbmRPckNyZWF0ZUJ5RWxlbWVudCIsIm9mZnNldEFsaWFzZXMiLCJxdWV1ZVRyaWdnZXIiLCJ0cmlnZ2VyIiwiZGVzdHJveSIsImRpc2FibGUiLCJlbmFibGUiLCJyZWZyZXNoIiwicHJldmlvdXMiLCJpbnZva2VBbGwiLCJhbGxXYXlwb2ludHNBcnJheSIsIndheXBvaW50S2V5IiwiZW5kIiwiZGVzdHJveUFsbCIsImRpc2FibGVBbGwiLCJlbmFibGVBbGwiLCJyZWZyZXNoQWxsIiwidmlld3BvcnRIZWlnaHQiLCJpbm5lckhlaWdodCIsImNsaWVudEhlaWdodCIsInZpZXdwb3J0V2lkdGgiLCJjbGllbnRXaWR0aCIsImFkYXB0ZXJzIiwiY29udGludW91cyIsImlubmVyV2lkdGgiLCJvdXRlcldpZHRoIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lU2hpbSIsImNvbnRleHRzIiwib2xkV2luZG93TG9hZCIsImRpZFNjcm9sbCIsImRpZFJlc2l6ZSIsIm9sZFNjcm9sbCIsIngiLCJzY3JvbGxMZWZ0IiwieSIsIndheXBvaW50cyIsInZlcnRpY2FsIiwid2F5cG9pbnRDb250ZXh0S2V5Iiwid2luZG93Q29udGV4dCIsImNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXIiLCJjcmVhdGVUaHJvdHRsZWRSZXNpemVIYW5kbGVyIiwid2F5cG9pbnQiLCJjaGVja0VtcHR5IiwiaG9yaXpvbnRhbEVtcHR5IiwiaXNFbXB0eU9iamVjdCIsInZlcnRpY2FsRW1wdHkiLCJpc1dpbmRvdyIsInNlbGYiLCJyZXNpemVIYW5kbGVyIiwiaGFuZGxlUmVzaXplIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwic2Nyb2xsSGFuZGxlciIsImhhbmRsZVNjcm9sbCIsImlzVG91Y2giLCJ0cmlnZ2VyZWRHcm91cHMiLCJheGVzIiwibmV3U2Nyb2xsIiwiZm9yd2FyZCIsImJhY2t3YXJkIiwiYXhpc0tleSIsImlzRm9yd2FyZCIsIndhc0JlZm9yZVRyaWdnZXJQb2ludCIsIm5vd0FmdGVyVHJpZ2dlclBvaW50IiwiY3Jvc3NlZEZvcndhcmQiLCJjcm9zc2VkQmFja3dhcmQiLCJncm91cEtleSIsImZsdXNoVHJpZ2dlcnMiLCJjb250ZXh0T2Zmc2V0IiwibGVmdCIsImNvbnRleHRTY3JvbGwiLCJjb250ZXh0RGltZW5zaW9uIiwib2Zmc2V0UHJvcCIsImFkanVzdG1lbnQiLCJvbGRUcmlnZ2VyUG9pbnQiLCJlbGVtZW50T2Zmc2V0IiwiZnJlc2hXYXlwb2ludCIsImNvbnRleHRNb2RpZmllciIsIndhc0JlZm9yZVNjcm9sbCIsIm5vd0FmdGVyU2Nyb2xsIiwidHJpZ2dlcmVkQmFja3dhcmQiLCJ0cmlnZ2VyZWRGb3J3YXJkIiwiY2VpbCIsImZpbmRCeUVsZW1lbnQiLCJjb250ZXh0SWQiLCJyZXF1ZXN0Rm4iLCJtb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJieVRyaWdnZXJQb2ludCIsImJ5UmV2ZXJzZVRyaWdnZXJQb2ludCIsImNsZWFyVHJpZ2dlclF1ZXVlcyIsInRyaWdnZXJRdWV1ZXMiLCJ1cCIsImRvd24iLCJyaWdodCIsInJldmVyc2UiLCJzb3J0IiwiaW5BcnJheSIsImlzTGFzdCIsImxhc3QiLCJKUXVlcnlBZGFwdGVyIiwiJGVsZW1lbnQiLCJhcmd1bWVudHMiLCJjcmVhdGVFeHRlbnNpb24iLCJmcmFtZXdvcmsiLCJvdmVycmlkZXMiLCJaZXB0byIsInJlY2xpbmVyIiwiJHciLCJsb2FkZWQiLCJ0aW1lciIsImF0dHJpYiIsInRocmVzaG9sZCIsInByaW50YWJsZSIsImxpdmUiLCJnZXRTY3JpcHQiLCJsb2FkIiwiJGUiLCJzb3VyY2UiLCJwcm9jZXNzIiwiaGVpZ2h0IiwiZW9mIiwic2Nyb2xsWSIsIm9mZnNldEhlaWdodCIsImludmlldyIsInd0Iiwid2IiLCJldCIsImViIiwiZWxzIiwib25lIiwibWF0Y2hNZWRpYSIsImFkZExpc3RlbmVyIiwibXFsIiwiZGVyZWNsaW5lciIsIlNsaWNrIiwiaW5zdGFuY2VVaWQiLCJzZXR0aW5ncyIsIl8iLCJkYXRhU2V0dGluZ3MiLCJhY2Nlc3NpYmlsaXR5IiwiYWRhcHRpdmVIZWlnaHQiLCJhcHBlbmRBcnJvd3MiLCJhcHBlbmREb3RzIiwiYXJyb3dzIiwiYXNOYXZGb3IiLCJwcmV2QXJyb3ciLCJuZXh0QXJyb3ciLCJhdXRvcGxheSIsImF1dG9wbGF5U3BlZWQiLCJjZW50ZXJNb2RlIiwiY2VudGVyUGFkZGluZyIsImNzc0Vhc2UiLCJjdXN0b21QYWdpbmciLCJzbGlkZXIiLCJ0ZXh0IiwiZG90cyIsImRvdHNDbGFzcyIsImRyYWdnYWJsZSIsImVkZ2VGcmljdGlvbiIsImZhZGUiLCJmb2N1c09uU2VsZWN0IiwiZm9jdXNPbkNoYW5nZSIsImluZmluaXRlIiwiaW5pdGlhbFNsaWRlIiwibGF6eUxvYWQiLCJtb2JpbGVGaXJzdCIsInBhdXNlT25Ib3ZlciIsInBhdXNlT25Gb2N1cyIsInBhdXNlT25Eb3RzSG92ZXIiLCJyZXNwb25kVG8iLCJyZXNwb25zaXZlIiwicnRsIiwic2xpZGUiLCJzbGlkZXNQZXJSb3ciLCJzbGlkZXNUb1Nob3ciLCJzbGlkZXNUb1Njcm9sbCIsInN3aXBlIiwic3dpcGVUb1NsaWRlIiwidG91Y2hNb3ZlIiwidG91Y2hUaHJlc2hvbGQiLCJ1c2VDU1MiLCJ1c2VUcmFuc2Zvcm0iLCJ2YXJpYWJsZVdpZHRoIiwidmVydGljYWxTd2lwaW5nIiwid2FpdEZvckFuaW1hdGUiLCJ6SW5kZXgiLCJpbml0aWFscyIsImFuaW1hdGluZyIsImRyYWdnaW5nIiwiYXV0b1BsYXlUaW1lciIsImN1cnJlbnREaXJlY3Rpb24iLCJjdXJyZW50TGVmdCIsImN1cnJlbnRTbGlkZSIsIiRkb3RzIiwibGlzdFdpZHRoIiwibGlzdEhlaWdodCIsImxvYWRJbmRleCIsIiRuZXh0QXJyb3ciLCIkcHJldkFycm93Iiwic2Nyb2xsaW5nIiwic2xpZGVDb3VudCIsInNsaWRlV2lkdGgiLCIkc2xpZGVUcmFjayIsIiRzbGlkZXMiLCJzbGlkaW5nIiwic2xpZGVPZmZzZXQiLCJzd2lwZUxlZnQiLCJzd2lwaW5nIiwiJGxpc3QiLCJ0b3VjaE9iamVjdCIsInRyYW5zZm9ybXNFbmFibGVkIiwidW5zbGlja2VkIiwiYWN0aXZlQnJlYWtwb2ludCIsImFuaW1UeXBlIiwiYW5pbVByb3AiLCJicmVha3BvaW50cyIsImJyZWFrcG9pbnRTZXR0aW5ncyIsImNzc1RyYW5zaXRpb25zIiwiZm9jdXNzZWQiLCJpbnRlcnJ1cHRlZCIsImhpZGRlbiIsInBhdXNlZCIsInBvc2l0aW9uUHJvcCIsInJvd0NvdW50Iiwic2hvdWxkQ2xpY2siLCIkc2xpZGVyIiwiJHNsaWRlc0NhY2hlIiwidHJhbnNmb3JtVHlwZSIsInRyYW5zaXRpb25UeXBlIiwidmlzaWJpbGl0eUNoYW5nZSIsIndpbmRvd1RpbWVyIiwib3JpZ2luYWxTZXR0aW5ncyIsIm1vekhpZGRlbiIsIndlYmtpdEhpZGRlbiIsImF1dG9QbGF5IiwicHJveHkiLCJhdXRvUGxheUNsZWFyIiwiYXV0b1BsYXlJdGVyYXRvciIsImNoYW5nZVNsaWRlIiwic2VsZWN0SGFuZGxlciIsInNldFBvc2l0aW9uIiwic3dpcGVIYW5kbGVyIiwiZHJhZ0hhbmRsZXIiLCJrZXlIYW5kbGVyIiwiaHRtbEV4cHIiLCJyZWdpc3RlckJyZWFrcG9pbnRzIiwiYWN0aXZhdGVBREEiLCJhZGRTbGlkZSIsInNsaWNrQWRkIiwibWFya3VwIiwiYWRkQmVmb3JlIiwidW5sb2FkIiwiaW5zZXJ0QmVmb3JlIiwiZXEiLCJpbnNlcnRBZnRlciIsInByZXBlbmRUbyIsImRldGFjaCIsInJlaW5pdCIsImFuaW1hdGVIZWlnaHQiLCJhbmltYXRlU2xpZGUiLCJ0YXJnZXRMZWZ0IiwiYW5pbVByb3BzIiwiYW5pbVN0YXJ0Iiwibm93IiwiYXBwbHlUcmFuc2l0aW9uIiwiZGlzYWJsZVRyYW5zaXRpb24iLCJnZXROYXZUYXJnZXQiLCJzbGljayIsInNsaWRlSGFuZGxlciIsInRyYW5zaXRpb24iLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJzbGlkZVRvIiwiYnVpbGRBcnJvd3MiLCJyZW1vdmVBdHRyIiwiYnVpbGREb3RzIiwiZG90IiwiZ2V0RG90Q291bnQiLCJidWlsZE91dCIsIndyYXBBbGwiLCJwYXJlbnQiLCJ3cmFwIiwic2V0dXBJbmZpbml0ZSIsInVwZGF0ZURvdHMiLCJzZXRTbGlkZUNsYXNzZXMiLCJidWlsZFJvd3MiLCJjIiwibmV3U2xpZGVzIiwibnVtT2ZTbGlkZXMiLCJvcmlnaW5hbFNsaWRlcyIsInNsaWRlc1BlclNlY3Rpb24iLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY3JlYXRlRWxlbWVudCIsImdldCIsImFwcGVuZENoaWxkIiwiZW1wdHkiLCJjaGVja1Jlc3BvbnNpdmUiLCJpbml0aWFsIiwiZm9yY2VVcGRhdGUiLCJicmVha3BvaW50IiwidGFyZ2V0QnJlYWtwb2ludCIsInJlc3BvbmRUb1dpZHRoIiwidHJpZ2dlckJyZWFrcG9pbnQiLCJzbGlkZXJXaWR0aCIsIm1pbiIsImhhc093blByb3BlcnR5IiwidW5zbGljayIsImRvbnRBbmltYXRlIiwiJHRhcmdldCIsImN1cnJlbnRUYXJnZXQiLCJpbmRleE9mZnNldCIsInVuZXZlbk9mZnNldCIsImNoZWNrTmF2aWdhYmxlIiwibmF2aWdhYmxlcyIsInByZXZOYXZpZ2FibGUiLCJnZXROYXZpZ2FibGVJbmRleGVzIiwibiIsImNsZWFuVXBFdmVudHMiLCJpbnRlcnJ1cHQiLCJ2aXNpYmlsaXR5IiwiY2xlYW5VcFNsaWRlRXZlbnRzIiwib3JpZW50YXRpb25DaGFuZ2UiLCJyZXNpemUiLCJjbGVhblVwUm93cyIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsInN0b3BQcm9wYWdhdGlvbiIsImZhZGVTbGlkZSIsInNsaWRlSW5kZXgiLCJvcGFjaXR5IiwiZmFkZVNsaWRlT3V0IiwiZmlsdGVyU2xpZGVzIiwic2xpY2tGaWx0ZXIiLCJmb2N1c0hhbmRsZXIiLCIkc2YiLCJnZXRDdXJyZW50Iiwic2xpY2tDdXJyZW50U2xpZGUiLCJicmVha1BvaW50IiwiY291bnRlciIsInBhZ2VyUXR5IiwiZ2V0TGVmdCIsInZlcnRpY2FsSGVpZ2h0IiwidmVydGljYWxPZmZzZXQiLCJ0YXJnZXRTbGlkZSIsImNvZWYiLCJvZmZzZXRMZWZ0IiwiZ2V0T3B0aW9uIiwic2xpY2tHZXRPcHRpb24iLCJvcHRpb24iLCJpbmRleGVzIiwibWF4IiwiZ2V0U2xpY2siLCJnZXRTbGlkZUNvdW50Iiwic2xpZGVzVHJhdmVyc2VkIiwic3dpcGVkU2xpZGUiLCJjZW50ZXJPZmZzZXQiLCJnb1RvIiwic2xpY2tHb1RvIiwicGFyc2VJbnQiLCJjcmVhdGlvbiIsImhhc0NsYXNzIiwic2V0UHJvcHMiLCJzdGFydExvYWQiLCJsb2FkU2xpZGVyIiwiaW5pdGlhbGl6ZUV2ZW50cyIsInVwZGF0ZUFycm93cyIsImluaXRBREEiLCJudW1Eb3RHcm91cHMiLCJ0YWJDb250cm9sSW5kZXhlcyIsInNsaWRlQ29udHJvbEluZGV4IiwiYXJpYUJ1dHRvbkNvbnRyb2wiLCJtYXBwZWRTbGlkZUluZGV4IiwiaW5pdEFycm93RXZlbnRzIiwiaW5pdERvdEV2ZW50cyIsImluaXRTbGlkZUV2ZW50cyIsImFjdGlvbiIsImluaXRVSSIsInRhZ05hbWUiLCJrZXlDb2RlIiwibG9hZFJhbmdlIiwiY2xvbmVSYW5nZSIsInJhbmdlU3RhcnQiLCJyYW5nZUVuZCIsImxvYWRJbWFnZXMiLCJpbWFnZXNTY29wZSIsImltYWdlU291cmNlIiwiaW1hZ2VTcmNTZXQiLCJpbWFnZVNpemVzIiwiaW1hZ2VUb0xvYWQiLCJwcmV2U2xpZGUiLCJuZXh0U2xpZGUiLCJwcm9ncmVzc2l2ZUxhenlMb2FkIiwic2xpY2tOZXh0IiwicGF1c2UiLCJzbGlja1BhdXNlIiwicGxheSIsInNsaWNrUGxheSIsInBvc3RTbGlkZSIsIiRjdXJyZW50U2xpZGUiLCJwcmV2Iiwic2xpY2tQcmV2IiwidHJ5Q291bnQiLCIkaW1nc1RvTG9hZCIsImluaXRpYWxpemluZyIsImxhc3RWaXNpYmxlSW5kZXgiLCJjdXJyZW50QnJlYWtwb2ludCIsImwiLCJyZXNwb25zaXZlU2V0dGluZ3MiLCJ3aW5kb3dEZWxheSIsInJlbW92ZVNsaWRlIiwic2xpY2tSZW1vdmUiLCJyZW1vdmVCZWZvcmUiLCJyZW1vdmVBbGwiLCJzZXRDU1MiLCJwb3NpdGlvbiIsInBvc2l0aW9uUHJvcHMiLCJzZXREaW1lbnNpb25zIiwicGFkZGluZyIsInNldEZhZGUiLCJzZXRIZWlnaHQiLCJzZXRPcHRpb24iLCJzbGlja1NldE9wdGlvbiIsIml0ZW0iLCJvcHQiLCJib2R5U3R5bGUiLCJXZWJraXRUcmFuc2l0aW9uIiwiTW96VHJhbnNpdGlvbiIsIm1zVHJhbnNpdGlvbiIsIk9UcmFuc2Zvcm0iLCJwZXJzcGVjdGl2ZVByb3BlcnR5Iiwid2Via2l0UGVyc3BlY3RpdmUiLCJNb3pUcmFuc2Zvcm0iLCJNb3pQZXJzcGVjdGl2ZSIsIndlYmtpdFRyYW5zZm9ybSIsIm1zVHJhbnNmb3JtIiwidHJhbnNmb3JtIiwiYWxsU2xpZGVzIiwicmVtYWluZGVyIiwiZXZlbkNvZWYiLCJpbmZpbml0ZUNvdW50IiwiY2xvbmUiLCJ0YXJnZXRFbGVtZW50Iiwic3luYyIsImFuaW1TbGlkZSIsIm9sZFNsaWRlIiwic2xpZGVMZWZ0IiwibmF2VGFyZ2V0Iiwic3dpcGVEaXJlY3Rpb24iLCJ4RGlzdCIsInlEaXN0IiwiciIsInN3aXBlQW5nbGUiLCJzdGFydFgiLCJjdXJYIiwic3RhcnRZIiwiY3VyWSIsImF0YW4yIiwicm91bmQiLCJQSSIsInN3aXBlRW5kIiwic3dpcGVMZW5ndGgiLCJlZGdlSGl0IiwibWluU3dpcGUiLCJmaW5nZXJDb3VudCIsIm9yaWdpbmFsRXZlbnQiLCJ0b3VjaGVzIiwic3dpcGVTdGFydCIsInN3aXBlTW92ZSIsImVkZ2VXYXNIaXQiLCJjdXJMZWZ0IiwicG9zaXRpb25PZmZzZXQiLCJ2ZXJ0aWNhbFN3aXBlTGVuZ3RoIiwiY2xpZW50WCIsImNsaWVudFkiLCJzcXJ0IiwicG93IiwidW5maWx0ZXJTbGlkZXMiLCJzbGlja1VuZmlsdGVyIiwiZnJvbUJyZWFrcG9pbnQiLCJyZXQiLCJ3IiwibWV0aG9kcyIsImJjQ2xhc3MiLCJtZW51Q2xhc3MiLCJhbmNob3JDbGFzcyIsIm1lbnVBcnJvd0NsYXNzIiwiaW9zIiwibmF2aWdhdG9yIiwidXNlckFnZW50Iiwibm9vcCIsIndwNyIsInVucHJlZml4ZWRQb2ludGVyRXZlbnRzIiwiUG9pbnRlckV2ZW50IiwidG9nZ2xlTWVudUNsYXNzZXMiLCJvIiwiY2xhc3NlcyIsImNzc0Fycm93cyIsInNldFBhdGhUb0N1cnJlbnQiLCJwYXRoQ2xhc3MiLCJwYXRoTGV2ZWxzIiwiaG92ZXJDbGFzcyIsInBvcFVwU2VsZWN0b3IiLCJ0b2dnbGVBbmNob3JDbGFzcyIsIiRsaSIsInRvZ2dsZVRvdWNoQWN0aW9uIiwibXNUb3VjaEFjdGlvbiIsInRvdWNoQWN0aW9uIiwiZ2V0TWVudSIsIiRlbCIsImdldE9wdGlvbnMiLCJzZlRpbWVyIiwiY2xvc2UiLCJyZXRhaW5QYXRoIiwiJHBhdGgiLCJvbklkbGUiLCJ0b3VjaEhhbmRsZXIiLCIkdWwiLCJvbkhhbmRsZVRvdWNoIiwiYXBwbHlIYW5kbGVycyIsImRpc2FibGVISSIsInRvdWNoZXZlbnQiLCJpbnN0YW50Iiwic3BlZWRPdXQiLCJvbkJlZm9yZUhpZGUiLCJhbmltYXRpb25PdXQiLCJvbkhpZGUiLCJvbkJlZm9yZVNob3ciLCJhbmltYXRpb24iLCJvblNob3ciLCIkaGFzUG9wVXAiLCJvbkRlc3Ryb3kiLCJyZW1vdmVEYXRhIiwib3AiLCJvbkluaXQiLCJJbnZpZXciLCJjcmVhdGVXYXlwb2ludHMiLCJjb25maWdzIiwiY29uZmlnIiwiY3JlYXRlV2F5cG9pbnQiLCJlbnRlciIsImVudGVyZWQiLCJleGl0IiwiZXhpdGVkIiwiJGxlZ2VuZCIsIiRtYXBzIiwibW91c2VsZWF2ZSIsInNlYXJjaFBhcmFtcyIsIlVSTFNlYXJjaFBhcmFtcyIsInNlYXJjaCIsImhhcyIsInBhcmFtIiwiZmFkZU91dCIsInJlYWN0TWF0Y2hIZWlnaHQiLCJlbENsYXNzTmFtZSIsImlzSW50ZXJuYWxMaW5rIiwiUmVnRXhwIiwiaG9zdCIsImhyZWYiLCJGV1AiLCJmb3VuZGF0aW9uIiwiRm91bmRhdGlvbiIsInJlSW5pdCIsImxhc3RTY3JvbGxUb3AiLCJuYXZiYXJIZWlnaHQiLCJzY3JvbGwiLCJoYXNTY3JvbGxlZCIsInN0IiwiJHRvZ2dsZSIsImFuaW1hdGVOdW1iZXJzIiwidmlld2VkIiwiaXNTY3JvbGxlZEludG9WaWV3IiwiZG9jVmlld1RvcCIsImRvY1ZpZXdCb3R0b20iLCJlbGVtVG9wIiwiZWxlbUJvdHRvbSIsIkNvdW50ZXIiLCJ0b1N0cmluZyIsIiRpbWciLCJpbWdJRCIsImltZ0NsYXNzIiwiaW1nVVJMIiwiJHN2ZyIsInJlcGxhY2VXaXRoIiwiJGNvbHVtbiIsImNsaWNrIiwiJHRoaXNDb2x1bW4iLCJNZWRpYVF1ZXJ5IiwiYXRMZWFzdCIsImxhYmVsIiwicGxheVZpZGVvIiwic2l6ZSIsIiRtb2RhbCIsIiRpZnJhbWUiLCJmcmFtZWJvcmRlciIsImh0bWwiLCJnZXRMYXN0U2libGluZ0luUm93IiwiY2FuZGlkYXRlIiwiZWxlbWVudFRvcCIsIm9mZnNldFRvcCIsIm5leHRFbGVtZW50U2libGluZyIsIiRncmlkIiwiJGZpbHRlckJ1dHRvbnMiLCJmaWx0ZXJWYWx1ZSIsIiRhbGxGYXFzIiwiJG5ld0FjdGl2ZUZhcXMiLCIkbmV3RGVhY3RpdmF0ZWRGYXFzIiwiJGh0bWwiLCIkb25fcGFnZV9saW5rcyIsIiRsaW5rc19jb250YWluZXIiLCIkbWVudV9idXR0b24iLCIkbWVudV93aWR0aCIsIm9uX3BhZ2VfbGlua3NfbW9iaWxlX2Rpc3BsYXkiLCIkbGlua3NfY29udGFpbmVyX3dpZHRoIiwiJGl0ZW1zX3dpZHRoIiwiJGRpc3BsYXlfbWVudSIsIm9uX3BhZ2VfbGlua3NfbW9iaWxlX2NsYXNzZXMiLCJtb2JpbGVOYXZfYWN0aXZhdGUiLCJtb2JpbGVOYXZfZGVhY3RpdmF0ZSIsIm1vYmlsZU5hdl90b2dnbGUiLCJvbl9wYWdlX2xpbmtzX3Jlc2l6ZXIiLCIkcmVzb3VyY2VzX2FjY29yZGlvbl9saW5rcyIsIiR0cmlnZ2VyX3dpZHRoIiwiJHdpbmRvd193aWR0aCIsInJlc291cmNlc0FjY29yZGlvbnNJbml0Q2xvc2UiLCIkaXNfbW9iaWxlIiwicmVzb3VyY2VzQWNjb3JkaW9uUmVzaXplQ2xvc2UiLCJyZXNvdXJjZXNBY2NvcmRpb25zUmVzaXplciIsIiRwYWdlYnVpbGRlcl9pbWFnZV9saWJyYXJ5IiwiJGF1dG9wbGF5IiwiJGF1dG9wbGF5U3BlZWQiLCJpbWFnZUxpYnJhcnlDYXB0aW9uUmVzaXplciIsIiRjYXB0aW9ucyIsIiRjYXB0aW9uIiwiJGNhcHRpb25IZWlnaHQiLCJkb25lIiwibGlnaHRHYWxsZXJ5IiwidGh1bWJuYWlsIiwiJHBhZ2VidWlsZGVyX2Z1bGxfd2lkdGhfaW1hZ2VfY2Fyb3VzZWwiLCIkcGFnZWJ1aWxkZXJfc3RlcHMiLCJob3ZlciIsIiRhbGxfb2VtYmVkX3ZpZGVvcyIsImxvYWRSZWdpb24iLCIkcmVnaW9uIiwibG9hZE1hcCIsIiRtYXAiLCJsb2FkUHJvamVjdCIsIiRwcm9qZWN0IiwiJHNlY3Rpb25fdmlkZW9zIiwiJHNlY3Rpb25fc3RvcmllcyIsIiRzaW5nbGVQb3N0U2xpZGVyIiwiJHNlY3Rpb25fcmVsYXRlZF9wb3N0cyIsIiRzZWN0aW9uX3Rlc3RpbW9uaWFscyIsImhpZGVfaGVhZGVyX21lbnUiLCJzY3JvbGxub3ciLCJkcm9wU2hhZG93cyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFFQSxDQUFDLFlBQVk7QUFDWDs7QUFFQSxNQUFJQSxhQUFhLENBQWpCO0FBQ0EsTUFBSUMsYUFBYSxFQUFqQjtBQUNBLE1BQUlDLGFBQWEsRUFBakI7O0FBRUEsV0FBU0MsQ0FBVCxDQUFZQyxRQUFaLEVBQXNCQyxPQUF0QixFQUErQjtBQUM3QixXQUFPQyxNQUFNQyxTQUFOLENBQWdCQyxLQUFoQixDQUFzQkMsSUFBdEIsQ0FDTCxDQUFDSixXQUFXSyxRQUFaLEVBQXNCQyxnQkFBdEIsQ0FBdUNQLFFBQXZDLENBREssQ0FBUDtBQUdEOztBQUVELFdBQVNRLGdCQUFULENBQTJCQyxPQUEzQixFQUFvQztBQUNsQyxRQUFJQSxRQUFRQyxPQUFaLEVBQXFCO0FBQ25CLGFBQU9ELFFBQVFDLE9BQVIsQ0FBZ0Isb0JBQWhCLENBQVA7QUFDRDs7QUFFRCxXQUFPRCxPQUFQLEVBQWdCO0FBQ2QsVUFBSUEsUUFBUUUsUUFBUixLQUFxQixDQUFyQixJQUEwQkYsUUFBUUcsWUFBUixDQUFxQixrQkFBckIsQ0FBOUIsRUFBd0U7QUFDdEUsZUFB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UUFBMUcsRUFBb0g7QUFDaEg7QUFDQXRXLGNBQUUsSUFBRixFQUFRdUYsSUFBUixDQUFhLE1BQWIsRUFBcUIsS0FBS2tSLElBQTFCO0FBQ0g7QUFDSixLQU5EOztBQVFBO0FBQ0E7QUFDQXpXLE1BQUUsTUFBRixFQUFVMkUsRUFBVixDQUFhLE9BQWIsRUFBc0IsMEJBQXRCLEVBQWtEbzlCLFNBQWxEO0FBRUgsQ0FwRUEsRUFvRUN4aEMsUUFwRUQsRUFvRVcrQixNQXBFWCxFQW9FbUI0RixNQXBFbkIsQ0FBRDs7O0FyQkFDLFdBQVUzSCxRQUFWLEVBQW9CK0IsTUFBcEIsRUFBNEJ0QyxDQUE1QixFQUErQjs7QUFFL0I7O0FBRUFBLFNBQUUsZUFBRixFQUFtQitHLFNBQW5CLENBQTZCO0FBQ3RCa0QscUJBQU0sR0FEZ0I7QUFFdEI7QUFDQSszQiwyQkFBWSxDQUFDO0FBSFMsUUFBN0I7QUFPQSxDQVhBLEVBV0N6aEMsUUFYRCxFQVdXK0IsTUFYWCxFQVdtQjRGLE1BWG5CLENBQUQiLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGh0dHBzOi8vZWRlbnNwaWVrZXJtYW5uLmdpdGh1Yi5pby9hMTF5LXRvZ2dsZS9cblxuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBpbnRlcm5hbElkID0gMDtcbiAgdmFyIHRvZ2dsZXNNYXAgPSB7fTtcbiAgdmFyIHRhcmdldHNNYXAgPSB7fTtcblxuICBmdW5jdGlvbiAkIChzZWxlY3RvciwgY29udGV4dCkge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcbiAgICAgIChjb250ZXh0IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDbG9zZXN0VG9nZ2xlIChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQuY2xvc2VzdCkge1xuICAgICAgcmV0dXJuIGVsZW1lbnQuY2xvc2VzdCgnW2RhdGEtYTExeS10b2dnbGVdJyk7XG4gICAgfVxuXG4gICAgd2hpbGUgKGVsZW1lbnQpIHtcbiAgICAgIGlmIChlbGVtZW50Lm5vZGVUeXBlID09PSAxICYmIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlJykpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVUb2dnbGUgKHRvZ2dsZSkge1xuICAgIHZhciB0YXJnZXQgPSB0b2dnbGUgJiYgdGFyZ2V0c01hcFt0b2dnbGUuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyldO1xuXG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgdG9nZ2xlcyA9IHRvZ2dsZXNNYXBbJyMnICsgdGFyZ2V0LmlkXTtcbiAgICB2YXIgaXNFeHBhbmRlZCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJykgPT09ICdmYWxzZSc7XG5cbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGlzRXhwYW5kZWQpO1xuICAgIHRvZ2dsZXMuZm9yRWFjaChmdW5jdGlvbiAodG9nZ2xlKSB7XG4gICAgICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgIWlzRXhwYW5kZWQpO1xuICAgICAgaWYoIWlzRXhwYW5kZWQpIHtcbiAgICAgICAgaWYodG9nZ2xlLmhhc0F0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZS1sZXNzJykpIHtcbiAgICAgICAgICAgIHRvZ2dsZS5pbm5lckhUTUwgPSB0b2dnbGUuZ2V0QXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLWxlc3MnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYodG9nZ2xlLmhhc0F0dHJpYnV0ZSgnZGF0YS1hMTF5LXRvZ2dsZS1tb3JlJykpIHtcbiAgICAgICAgICAgIHRvZ2dsZS5pbm5lckhUTUwgPSB0b2dnbGUuZ2V0QXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLW1vcmUnKTtcbiAgICAgICAgfVxuICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB2YXIgaW5pdEExMXlUb2dnbGUgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIHRvZ2dsZXNNYXAgPSAkKCdbZGF0YS1hMTF5LXRvZ2dsZV0nLCBjb250ZXh0KS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgdG9nZ2xlKSB7XG4gICAgICB2YXIgc2VsZWN0b3IgPSAnIycgKyB0b2dnbGUuZ2V0QXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlJyk7XG4gICAgICBhY2Nbc2VsZWN0b3JdID0gYWNjW3NlbGVjdG9yXSB8fCBbXTtcbiAgICAgIGFjY1tzZWxlY3Rvcl0ucHVzaCh0b2dnbGUpO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB0b2dnbGVzTWFwKTtcblxuICAgIHZhciB0YXJnZXRzID0gT2JqZWN0LmtleXModG9nZ2xlc01hcCk7XG4gICAgdGFyZ2V0cy5sZW5ndGggJiYgJCh0YXJnZXRzKS5mb3JFYWNoKGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIHZhciB0b2dnbGVzID0gdG9nZ2xlc01hcFsnIycgKyB0YXJnZXQuaWRdO1xuICAgICAgdmFyIGlzRXhwYW5kZWQgPSB0YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLWExMXktdG9nZ2xlLW9wZW4nKTtcbiAgICAgIHZhciBsYWJlbGxlZGJ5ID0gW107XG5cbiAgICAgIHRvZ2dsZXMuZm9yRWFjaChmdW5jdGlvbiAodG9nZ2xlKSB7XG4gICAgICAgIHRvZ2dsZS5pZCB8fCB0b2dnbGUuc2V0QXR0cmlidXRlKCdpZCcsICdhMTF5LXRvZ2dsZS0nICsgaW50ZXJuYWxJZCsrKTtcbiAgICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycsIHRhcmdldC5pZCk7XG4gICAgICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBpc0V4cGFuZGVkKTsgICAgICAgIFxuICAgICAgICBsYWJlbGxlZGJ5LnB1c2godG9nZ2xlLmlkKTtcbiAgICAgIH0pO1xuXG4gICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICFpc0V4cGFuZGVkKTtcbiAgICAgIHRhcmdldC5oYXNBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScpIHx8IHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsIGxhYmVsbGVkYnkuam9pbignICcpKTtcblxuICAgICAgdGFyZ2V0c01hcFt0YXJnZXQuaWRdID0gdGFyZ2V0O1xuICAgIH0pO1xuICB9O1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgaW5pdEExMXlUb2dnbGUoKTtcbiAgfSk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgdG9nZ2xlID0gZ2V0Q2xvc2VzdFRvZ2dsZShldmVudC50YXJnZXQpO1xuICAgIGhhbmRsZVRvZ2dsZSh0b2dnbGUpO1xuICB9KTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudC53aGljaCA9PT0gMTMgfHwgZXZlbnQud2hpY2ggPT09IDMyKSB7XG4gICAgICB2YXIgdG9nZ2xlID0gZ2V0Q2xvc2VzdFRvZ2dsZShldmVudC50YXJnZXQpO1xuICAgICAgaWYgKHRvZ2dsZSAmJiB0b2dnbGUuZ2V0QXR0cmlidXRlKCdyb2xlJykgPT09ICdidXR0b24nKSB7XG4gICAgICAgIGhhbmRsZVRvZ2dsZSh0b2dnbGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93ICYmICh3aW5kb3cuYTExeVRvZ2dsZSA9IGluaXRBMTF5VG9nZ2xlKTtcbn0pKCk7XG4iLCIvKipcbiAqIFRoaXMgc2NyaXB0IGFkZHMgdGhlIGFjY2Vzc2liaWxpdHktcmVhZHkgcmVzcG9uc2l2ZSBtZW51cyBHZW5lc2lzIEZyYW1ld29yayBjaGlsZCB0aGVtZXMuXG4gKlxuICogQGF1dGhvciBTdHVkaW9QcmVzc1xuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2NvcHlibG9nZ2VyL3Jlc3BvbnNpdmUtbWVudXNcbiAqIEB2ZXJzaW9uIDEuMS4zXG4gKiBAbGljZW5zZSBHUEwtMi4wK1xuICovXG5cbiggZnVuY3Rpb24gKCBkb2N1bWVudCwgJCwgdW5kZWZpbmVkICkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG5cblx0dmFyIGdlbmVzaXNNZW51UGFyYW1zICAgICAgPSB0eXBlb2YgZ2VuZXNpc19yZXNwb25zaXZlX21lbnUgPT09ICd1bmRlZmluZWQnID8gJycgOiBnZW5lc2lzX3Jlc3BvbnNpdmVfbWVudSxcblx0XHRnZW5lc2lzTWVudXNVbmNoZWNrZWQgID0gZ2VuZXNpc01lbnVQYXJhbXMubWVudUNsYXNzZXMsXG5cdFx0Z2VuZXNpc01lbnVzICAgICAgICAgICA9IHt9LFxuXHRcdG1lbnVzVG9Db21iaW5lICAgICAgICAgPSBbXTtcblxuXHQvKipcblx0ICogVmFsaWRhdGUgdGhlIG1lbnVzIHBhc3NlZCBieSB0aGUgdGhlbWUgd2l0aCB3aGF0J3MgYmVpbmcgbG9hZGVkIG9uIHRoZSBwYWdlLFxuXHQgKiBhbmQgcGFzcyB0aGUgbmV3IGFuZCBhY2N1cmF0ZSBpbmZvcm1hdGlvbiB0byBvdXIgbmV3IGRhdGEuXG5cdCAqIEBwYXJhbSB7Z2VuZXNpc01lbnVzVW5jaGVja2VkfSBSYXcgZGF0YSBmcm9tIHRoZSBsb2NhbGl6ZWQgc2NyaXB0IGluIHRoZSB0aGVtZS5cblx0ICogQHJldHVybiB7YXJyYXl9IGdlbmVzaXNNZW51cyBhcnJheSBnZXRzIHBvcHVsYXRlZCB3aXRoIHVwZGF0ZWQgZGF0YS5cblx0ICogQHJldHVybiB7YXJyYXl9IG1lbnVzVG9Db21iaW5lIGFycmF5IGdldHMgcG9wdWxhdGVkIHdpdGggcmVsZXZhbnQgZGF0YS5cblx0ICovXG5cdCQuZWFjaCggZ2VuZXNpc01lbnVzVW5jaGVja2VkLCBmdW5jdGlvbiggZ3JvdXAgKSB7XG5cblx0XHQvLyBNaXJyb3Igb3VyIGdyb3VwIG9iamVjdCB0byBwb3B1bGF0ZS5cblx0XHRnZW5lc2lzTWVudXNbZ3JvdXBdID0gW107XG5cblx0XHQvLyBMb29wIHRocm91Z2ggZWFjaCBpbnN0YW5jZSBvZiB0aGUgc3BlY2lmaWVkIG1lbnUgb24gdGhlIHBhZ2UuXG5cdFx0JC5lYWNoKCB0aGlzLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblxuXHRcdFx0dmFyIG1lbnVTdHJpbmcgPSB2YWx1ZSxcblx0XHRcdFx0JG1lbnUgICAgICA9ICQodmFsdWUpO1xuXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIGluc3RhbmNlLCBhcHBlbmQgdGhlIGluZGV4IGFuZCB1cGRhdGUgYXJyYXkuXG5cdFx0XHRpZiAoICRtZW51Lmxlbmd0aCA+IDEgKSB7XG5cblx0XHRcdFx0JC5lYWNoKCAkbWVudSwgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cblx0XHRcdFx0XHR2YXIgbmV3U3RyaW5nID0gbWVudVN0cmluZyArICctJyArIGtleTtcblxuXHRcdFx0XHRcdCQodGhpcykuYWRkQ2xhc3MoIG5ld1N0cmluZy5yZXBsYWNlKCcuJywnJykgKTtcblxuXHRcdFx0XHRcdGdlbmVzaXNNZW51c1tncm91cF0ucHVzaCggbmV3U3RyaW5nICk7XG5cblx0XHRcdFx0XHRpZiAoICdjb21iaW5lJyA9PT0gZ3JvdXAgKSB7XG5cdFx0XHRcdFx0XHRtZW51c1RvQ29tYmluZS5wdXNoKCBuZXdTdHJpbmcgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSk7XG5cblx0XHRcdH0gZWxzZSBpZiAoICRtZW51Lmxlbmd0aCA9PSAxICkge1xuXG5cdFx0XHRcdGdlbmVzaXNNZW51c1tncm91cF0ucHVzaCggbWVudVN0cmluZyApO1xuXG5cdFx0XHRcdGlmICggJ2NvbWJpbmUnID09PSBncm91cCApIHtcblx0XHRcdFx0XHRtZW51c1RvQ29tYmluZS5wdXNoKCBtZW51U3RyaW5nICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0fSk7XG5cblx0Ly8gTWFrZSBzdXJlIHRoZXJlIGlzIHNvbWV0aGluZyB0byB1c2UgZm9yIHRoZSAnb3RoZXJzJyBhcnJheS5cblx0aWYgKCB0eXBlb2YgZ2VuZXNpc01lbnVzLm90aGVycyA9PSAndW5kZWZpbmVkJyApIHtcblx0XHRnZW5lc2lzTWVudXMub3RoZXJzID0gW107XG5cdH1cblxuXHQvLyBJZiB0aGVyZSdzIG9ubHkgb25lIG1lbnUgb24gdGhlIHBhZ2UgZm9yIGNvbWJpbmluZywgcHVzaCBpdCB0byB0aGUgJ290aGVycycgYXJyYXkgYW5kIG51bGxpZnkgb3VyICdjb21iaW5lJyB2YXJpYWJsZS5cblx0aWYgKCBtZW51c1RvQ29tYmluZS5sZW5ndGggPT0gMSApIHtcblx0XHRnZW5lc2lzTWVudXMub3RoZXJzLnB1c2goIG1lbnVzVG9Db21iaW5lWzBdICk7XG5cdFx0Z2VuZXNpc01lbnVzLmNvbWJpbmUgPSBudWxsO1xuXHRcdG1lbnVzVG9Db21iaW5lID0gbnVsbDtcblx0fVxuXG5cdHZhciBnZW5lc2lzTWVudSAgICAgICAgID0ge30sXG5cdFx0bWFpbk1lbnVCdXR0b25DbGFzcyA9ICdtZW51LXRvZ2dsZScsXG5cdFx0c3ViTWVudUJ1dHRvbkNsYXNzICA9ICdzdWItbWVudS10b2dnbGUnLFxuXHRcdHJlc3BvbnNpdmVNZW51Q2xhc3MgPSAnZ2VuZXNpcy1yZXNwb25zaXZlLW1lbnUnO1xuXG5cdC8vIEluaXRpYWxpemUuXG5cdGdlbmVzaXNNZW51LmluaXQgPSBmdW5jdGlvbigpIHtcblxuXHRcdC8vIEV4aXQgZWFybHkgaWYgdGhlcmUgYXJlIG5vIG1lbnVzIHRvIGRvIGFueXRoaW5nLlxuXHRcdGlmICggJCggX2dldEFsbE1lbnVzQXJyYXkoKSApLmxlbmd0aCA9PSAwICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBtZW51SWNvbkNsYXNzICAgICA9IHR5cGVvZiBnZW5lc2lzTWVudVBhcmFtcy5tZW51SWNvbkNsYXNzICE9PSAndW5kZWZpbmVkJyA/IGdlbmVzaXNNZW51UGFyYW1zLm1lbnVJY29uQ2xhc3MgOiAnZGFzaGljb25zLWJlZm9yZSBkYXNoaWNvbnMtbWVudScsXG5cdFx0XHRzdWJNZW51SWNvbkNsYXNzICA9IHR5cGVvZiBnZW5lc2lzTWVudVBhcmFtcy5zdWJNZW51SWNvbkNsYXNzICE9PSAndW5kZWZpbmVkJyA/IGdlbmVzaXNNZW51UGFyYW1zLnN1Yk1lbnVJY29uQ2xhc3MgOiAnZGFzaGljb25zLWJlZm9yZSBkYXNoaWNvbnMtYXJyb3ctZG93bi1hbHQyJyxcblx0XHRcdHRvZ2dsZUJ1dHRvbnMgICAgID0ge1xuXHRcdFx0XHRtZW51IDogJCggJzxidXR0b24gLz4nLCB7XG5cdFx0XHRcdFx0J2NsYXNzJyA6IG1haW5NZW51QnV0dG9uQ2xhc3MsXG5cdFx0XHRcdFx0J2FyaWEtZXhwYW5kZWQnIDogZmFsc2UsXG5cdFx0XHRcdFx0J2FyaWEtcHJlc3NlZCcgOiBmYWxzZSxcblx0XHRcdFx0XHQncm9sZSdcdFx0XHQ6ICdidXR0b24nLFxuXHRcdFx0XHRcdH0gKVxuXHRcdFx0XHRcdC5hcHBlbmQoICQoICc8c3BhbiAvPicsIHtcblx0XHRcdFx0XHRcdCdjbGFzcycgOiAnc2NyZWVuLXJlYWRlci10ZXh0Jyxcblx0XHRcdFx0XHRcdCd0ZXh0JyA6IGdlbmVzaXNNZW51UGFyYW1zLm1haW5NZW51XG5cdFx0XHRcdFx0fSApICksXG5cdFx0XHRcdHN1Ym1lbnUgOiAkKCAnPGJ1dHRvbiAvPicsIHtcblx0XHRcdFx0XHQnY2xhc3MnIDogc3ViTWVudUJ1dHRvbkNsYXNzLFxuXHRcdFx0XHRcdCdhcmlhLWV4cGFuZGVkJyA6IGZhbHNlLFxuXHRcdFx0XHRcdCdhcmlhLXByZXNzZWQnICA6IGZhbHNlLFxuXHRcdFx0XHRcdCd0ZXh0J1x0XHRcdDogJydcblx0XHRcdFx0XHR9IClcblx0XHRcdFx0XHQuYXBwZW5kKCAkKCAnPHNwYW4gLz4nLCB7XG5cdFx0XHRcdFx0XHQnY2xhc3MnIDogJ3NjcmVlbi1yZWFkZXItdGV4dCcsXG5cdFx0XHRcdFx0XHQndGV4dCcgOiBnZW5lc2lzTWVudVBhcmFtcy5zdWJNZW51XG5cdFx0XHRcdFx0fSApIClcblx0XHRcdH07XG5cblx0XHQvLyBBZGQgdGhlIHJlc3BvbnNpdmUgbWVudSBjbGFzcyB0byB0aGUgYWN0aXZlIG1lbnVzLlxuXHRcdF9hZGRSZXNwb25zaXZlTWVudUNsYXNzKCk7XG5cblx0XHQvLyBBZGQgdGhlIG1haW4gbmF2IGJ1dHRvbiB0byB0aGUgcHJpbWFyeSBtZW51LCBvciBleGl0IHRoZSBwbHVnaW4uXG5cdFx0X2FkZE1lbnVCdXR0b25zKCB0b2dnbGVCdXR0b25zICk7XG5cblx0XHQvLyBTZXR1cCBhZGRpdGlvbmFsIGNsYXNzZXMuXG5cdFx0JCggJy4nICsgbWFpbk1lbnVCdXR0b25DbGFzcyApLmFkZENsYXNzKCBtZW51SWNvbkNsYXNzICk7XG5cdFx0JCggJy4nICsgc3ViTWVudUJ1dHRvbkNsYXNzICkuYWRkQ2xhc3MoIHN1Yk1lbnVJY29uQ2xhc3MgKTtcblx0XHQkKCAnLicgKyBtYWluTWVudUJ1dHRvbkNsYXNzICkub24oICdjbGljay5nZW5lc2lzTWVudS1tYWluYnV0dG9uJywgX21haW5tZW51VG9nZ2xlICkuZWFjaCggX2FkZENsYXNzSUQgKTtcblx0XHQkKCAnLicgKyBzdWJNZW51QnV0dG9uQ2xhc3MgKS5vbiggJ2NsaWNrLmdlbmVzaXNNZW51LXN1YmJ1dHRvbicsIF9zdWJtZW51VG9nZ2xlICk7XG5cdFx0JCggd2luZG93ICkub24oICdyZXNpemUuZ2VuZXNpc01lbnUnLCBfZG9SZXNpemUgKS50cmlnZ2VySGFuZGxlciggJ3Jlc2l6ZS5nZW5lc2lzTWVudScgKTtcblx0fTtcblxuXHQvKipcblx0ICogQWRkIG1lbnUgdG9nZ2xlIGJ1dHRvbiB0byBhcHByb3ByaWF0ZSBtZW51cy5cblx0ICogQHBhcmFtIHt0b2dnbGVCdXR0b25zfSBPYmplY3Qgb2YgbWVudSBidXR0b25zIHRvIHVzZSBmb3IgdG9nZ2xlcy5cblx0ICovXG5cdGZ1bmN0aW9uIF9hZGRNZW51QnV0dG9ucyggdG9nZ2xlQnV0dG9ucyApIHtcblxuXHRcdC8vIEFwcGx5IHN1YiBtZW51IHRvZ2dsZSB0byBlYWNoIHN1Yi1tZW51IGZvdW5kIGluIHRoZSBtZW51TGlzdC5cblx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBnZW5lc2lzTWVudXMgKSApLmZpbmQoICcuc3ViLW1lbnUnICkuYmVmb3JlKCB0b2dnbGVCdXR0b25zLnN1Ym1lbnUgKTtcblxuXG5cdFx0aWYgKCBtZW51c1RvQ29tYmluZSAhPT0gbnVsbCApIHtcblxuXHRcdFx0dmFyIG1lbnVzVG9Ub2dnbGUgPSBnZW5lc2lzTWVudXMub3RoZXJzLmNvbmNhdCggbWVudXNUb0NvbWJpbmVbMF0gKTtcblxuXHRcdCBcdC8vIE9ubHkgYWRkIG1lbnUgYnV0dG9uIHRoZSBwcmltYXJ5IG1lbnUgYW5kIG5hdnMgTk9UIGluIHRoZSBjb21iaW5lIHZhcmlhYmxlLlxuXHRcdCBcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIG1lbnVzVG9Ub2dnbGUgKSApLmJlZm9yZSggdG9nZ2xlQnV0dG9ucy5tZW51ICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBBcHBseSB0aGUgbWFpbiBtZW51IHRvZ2dsZSB0byBhbGwgbWVudXMgaW4gdGhlIGxpc3QuXG5cdFx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBnZW5lc2lzTWVudXMub3RoZXJzICkgKS5iZWZvcmUoIHRvZ2dsZUJ1dHRvbnMubWVudSApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQWRkIHRoZSByZXNwb25zaXZlIG1lbnUgY2xhc3MuXG5cdCAqL1xuXHRmdW5jdGlvbiBfYWRkUmVzcG9uc2l2ZU1lbnVDbGFzcygpIHtcblx0XHQkKCBfZ2V0TWVudVNlbGVjdG9yU3RyaW5nKCBnZW5lc2lzTWVudXMgKSApLmFkZENsYXNzKCByZXNwb25zaXZlTWVudUNsYXNzICk7XG5cdH1cblxuXHQvKipcblx0ICogRXhlY3V0ZSBvdXIgcmVzcG9uc2l2ZSBtZW51IGZ1bmN0aW9ucyBvbiB3aW5kb3cgcmVzaXppbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiBfZG9SZXNpemUoKSB7XG5cdFx0dmFyIGJ1dHRvbnMgICA9ICQoICdidXR0b25baWRePVwiZ2VuZXNpcy1tb2JpbGUtXCJdJyApLmF0dHIoICdpZCcgKTtcblx0XHRpZiAoIHR5cGVvZiBidXR0b25zID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0X21heWJlQ2xvc2UoIGJ1dHRvbnMgKTtcblx0XHRfc3VwZXJmaXNoVG9nZ2xlKCBidXR0b25zICk7XG5cdFx0X2NoYW5nZVNraXBMaW5rKCBidXR0b25zICk7XG5cdFx0X2NvbWJpbmVNZW51cyggYnV0dG9ucyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCB0aGUgbmF2LSBjbGFzcyBvZiB0aGUgcmVsYXRlZCBuYXZpZ2F0aW9uIG1lbnUgYXNcblx0ICogYW4gSUQgdG8gYXNzb2NpYXRlZCBidXR0b24gKGhlbHBzIHRhcmdldCBzcGVjaWZpYyBidXR0b25zIG91dHNpZGUgb2YgY29udGV4dCkuXG5cdCAqL1xuXHRmdW5jdGlvbiBfYWRkQ2xhc3NJRCgpIHtcblx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0XHRuYXYgICA9ICR0aGlzLm5leHQoICduYXYnICksXG5cdFx0XHRpZCAgICA9ICdjbGFzcyc7XG5cblx0XHQkdGhpcy5hdHRyKCAnaWQnLCAnZ2VuZXNpcy1tb2JpbGUtJyArICQoIG5hdiApLmF0dHIoIGlkICkubWF0Y2goIC9uYXYtXFx3KlxcYi8gKSApO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbWJpbmUgb3VyIG1lbnVzIGlmIHRoZSBtb2JpbGUgbWVudSBpcyB2aXNpYmxlLlxuXHQgKiBAcGFyYW1zIGJ1dHRvbnNcblx0ICovXG5cdGZ1bmN0aW9uIF9jb21iaW5lTWVudXMoIGJ1dHRvbnMgKXtcblxuXHRcdC8vIEV4aXQgZWFybHkgaWYgdGhlcmUgYXJlIG5vIG1lbnVzIHRvIGNvbWJpbmUuXG5cdFx0aWYgKCBtZW51c1RvQ29tYmluZSA9PSBudWxsICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNwbGl0IHVwIHRoZSBtZW51cyB0byBjb21iaW5lIGJhc2VkIG9uIG9yZGVyIG9mIGFwcGVhcmFuY2UgaW4gdGhlIGFycmF5LlxuXHRcdHZhciBwcmltYXJ5TWVudSAgID0gbWVudXNUb0NvbWJpbmVbMF0sXG5cdFx0XHRjb21iaW5lZE1lbnVzID0gJCggbWVudXNUb0NvbWJpbmUgKS5maWx0ZXIoIGZ1bmN0aW9uKGluZGV4KSB7IGlmICggaW5kZXggPiAwICkgeyByZXR1cm4gaW5kZXg7IH0gfSk7XG5cblx0XHQvLyBJZiB0aGUgcmVzcG9uc2l2ZSBtZW51IGlzIGFjdGl2ZSwgYXBwZW5kIGl0ZW1zIGluICdjb21iaW5lZE1lbnVzJyBvYmplY3QgdG8gdGhlICdwcmltYXJ5TWVudScgb2JqZWN0LlxuXHRcdGlmICggJ25vbmUnICE9PSBfZ2V0RGlzcGxheVZhbHVlKCBidXR0b25zICkgKSB7XG5cblx0XHRcdCQuZWFjaCggY29tYmluZWRNZW51cywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRcdCQodmFsdWUpLmZpbmQoICcubWVudSA+IGxpJyApLmFkZENsYXNzKCAnbW92ZWQtaXRlbS0nICsgdmFsdWUucmVwbGFjZSggJy4nLCcnICkgKS5hcHBlbmRUbyggcHJpbWFyeU1lbnUgKyAnIHVsLmdlbmVzaXMtbmF2LW1lbnUnICk7XG5cdFx0XHR9KTtcblx0XHRcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGNvbWJpbmVkTWVudXMgKSApLmhpZGUoKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdCQoIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGNvbWJpbmVkTWVudXMgKSApLnNob3coKTtcblx0XHRcdCQuZWFjaCggY29tYmluZWRNZW51cywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRcdCQoICcubW92ZWQtaXRlbS0nICsgdmFsdWUucmVwbGFjZSggJy4nLCcnICkgKS5hcHBlbmRUbyggdmFsdWUgKyAnIHVsLmdlbmVzaXMtbmF2LW1lbnUnICkucmVtb3ZlQ2xhc3MoICdtb3ZlZC1pdGVtLScgKyB2YWx1ZS5yZXBsYWNlKCAnLicsJycgKSApO1xuXHRcdFx0fSk7XG5cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBBY3Rpb24gdG8gaGFwcGVuIHdoZW4gdGhlIG1haW4gbWVudSBidXR0b24gaXMgY2xpY2tlZC5cblx0ICovXG5cdGZ1bmN0aW9uIF9tYWlubWVudVRvZ2dsZSgpIHtcblx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICk7XG5cdFx0X3RvZ2dsZUFyaWEoICR0aGlzLCAnYXJpYS1wcmVzc2VkJyApO1xuXHRcdF90b2dnbGVBcmlhKCAkdGhpcywgJ2FyaWEtZXhwYW5kZWQnICk7XG5cdFx0JHRoaXMudG9nZ2xlQ2xhc3MoICdhY3RpdmF0ZWQnICk7XG5cdFx0JHRoaXMubmV4dCggJ25hdicgKS5zbGlkZVRvZ2dsZSggJ2Zhc3QnICk7XG5cdH1cblxuXHQvKipcblx0ICogQWN0aW9uIGZvciBzdWJtZW51IHRvZ2dsZXMuXG5cdCAqL1xuXHRmdW5jdGlvbiBfc3VibWVudVRvZ2dsZSgpIHtcblxuXHRcdHZhciAkdGhpcyAgPSAkKCB0aGlzICksXG5cdFx0XHRvdGhlcnMgPSAkdGhpcy5jbG9zZXN0KCAnLm1lbnUtaXRlbScgKS5zaWJsaW5ncygpO1xuXHRcdF90b2dnbGVBcmlhKCAkdGhpcywgJ2FyaWEtcHJlc3NlZCcgKTtcblx0XHRfdG9nZ2xlQXJpYSggJHRoaXMsICdhcmlhLWV4cGFuZGVkJyApO1xuXHRcdCR0aGlzLnRvZ2dsZUNsYXNzKCAnYWN0aXZhdGVkJyApO1xuXHRcdCR0aGlzLm5leHQoICcuc3ViLW1lbnUnICkuc2xpZGVUb2dnbGUoICdmYXN0JyApO1xuXG5cdFx0b3RoZXJzLmZpbmQoICcuJyArIHN1Yk1lbnVCdXR0b25DbGFzcyApLnJlbW92ZUNsYXNzKCAnYWN0aXZhdGVkJyApLmF0dHIoICdhcmlhLXByZXNzZWQnLCAnZmFsc2UnICk7XG5cdFx0b3RoZXJzLmZpbmQoICcuc3ViLW1lbnUnICkuc2xpZGVVcCggJ2Zhc3QnICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBBY3RpdmF0ZS9kZWFjdGl2YXRlIHN1cGVyZmlzaC5cblx0ICogQHBhcmFtcyBidXR0b25zXG5cdCAqL1xuXHRmdW5jdGlvbiBfc3VwZXJmaXNoVG9nZ2xlKCBidXR0b25zICkge1xuXHRcdHZhciBfc3VwZXJmaXNoID0gJCggJy4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLmpzLXN1cGVyZmlzaCcgKSxcblx0XHRcdCRhcmdzICAgICAgPSAnZGVzdHJveSc7XG5cdFx0aWYgKCB0eXBlb2YgX3N1cGVyZmlzaC5zdXBlcmZpc2ggIT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmICggJ25vbmUnID09PSBfZ2V0RGlzcGxheVZhbHVlKCBidXR0b25zICkgKSB7XG5cdFx0XHQkYXJncyA9IHtcblx0XHRcdFx0J2RlbGF5JzogMCxcblx0XHRcdFx0J2FuaW1hdGlvbic6IHsnb3BhY2l0eSc6ICdzaG93J30sXG5cdFx0XHRcdCdzcGVlZCc6IDMwMCxcblx0XHRcdFx0J2Rpc2FibGVISSc6IHRydWVcblx0XHRcdH07XG5cdFx0fVxuXHRcdF9zdXBlcmZpc2guc3VwZXJmaXNoKCAkYXJncyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vZGlmeSBza2lwIGxpbmsgdG8gbWF0Y2ggbW9iaWxlIGJ1dHRvbnMuXG5cdCAqIEBwYXJhbSBidXR0b25zXG5cdCAqL1xuXHRmdW5jdGlvbiBfY2hhbmdlU2tpcExpbmsoIGJ1dHRvbnMgKSB7XG5cblx0XHQvLyBTdGFydCB3aXRoIGFuIGVtcHR5IGFycmF5LlxuXHRcdHZhciBtZW51VG9nZ2xlTGlzdCA9IF9nZXRBbGxNZW51c0FycmF5KCk7XG5cblx0XHQvLyBFeGl0IG91dCBpZiB0aGVyZSBhcmUgbm8gbWVudSBpdGVtcyB0byB1cGRhdGUuXG5cdFx0aWYgKCAhICQoIG1lbnVUb2dnbGVMaXN0ICkubGVuZ3RoID4gMCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkLmVhY2goIG1lbnVUb2dnbGVMaXN0LCBmdW5jdGlvbiAoIGtleSwgdmFsdWUgKSB7XG5cblx0XHRcdHZhciBuZXdWYWx1ZSAgPSB2YWx1ZS5yZXBsYWNlKCAnLicsICcnICksXG5cdFx0XHRcdHN0YXJ0TGluayA9ICdnZW5lc2lzLScgKyBuZXdWYWx1ZSxcblx0XHRcdFx0ZW5kTGluayAgID0gJ2dlbmVzaXMtbW9iaWxlLScgKyBuZXdWYWx1ZTtcblxuXHRcdFx0aWYgKCAnbm9uZScgPT0gX2dldERpc3BsYXlWYWx1ZSggYnV0dG9ucyApICkge1xuXHRcdFx0XHRzdGFydExpbmsgPSAnZ2VuZXNpcy1tb2JpbGUtJyArIG5ld1ZhbHVlO1xuXHRcdFx0XHRlbmRMaW5rICAgPSAnZ2VuZXNpcy0nICsgbmV3VmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciAkaXRlbSA9ICQoICcuZ2VuZXNpcy1za2lwLWxpbmsgYVtocmVmPVwiIycgKyBzdGFydExpbmsgKyAnXCJdJyApO1xuXG5cdFx0XHRpZiAoIG1lbnVzVG9Db21iaW5lICE9PSBudWxsICYmIHZhbHVlICE9PSBtZW51c1RvQ29tYmluZVswXSApIHtcblx0XHRcdFx0JGl0ZW0udG9nZ2xlQ2xhc3MoICdza2lwLWxpbmstaGlkZGVuJyApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICRpdGVtLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRcdHZhciBsaW5rICA9ICRpdGVtLmF0dHIoICdocmVmJyApO1xuXHRcdFx0XHRcdGxpbmsgID0gbGluay5yZXBsYWNlKCBzdGFydExpbmssIGVuZExpbmsgKTtcblxuXHRcdFx0XHQkaXRlbS5hdHRyKCAnaHJlZicsIGxpbmsgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cdH1cblxuXHQvKipcblx0ICogQ2xvc2UgYWxsIHRoZSBtZW51IHRvZ2dsZXMgaWYgYnV0dG9ucyBhcmUgaGlkZGVuLlxuXHQgKiBAcGFyYW0gYnV0dG9uc1xuXHQgKi9cblx0ZnVuY3Rpb24gX21heWJlQ2xvc2UoIGJ1dHRvbnMgKSB7XG5cdFx0aWYgKCAnbm9uZScgIT09IF9nZXREaXNwbGF5VmFsdWUoIGJ1dHRvbnMgKSApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdCQoICcuJyArIG1haW5NZW51QnV0dG9uQ2xhc3MgKyAnLCAuJyArIHJlc3BvbnNpdmVNZW51Q2xhc3MgKyAnIC5zdWItbWVudS10b2dnbGUnIClcblx0XHRcdC5yZW1vdmVDbGFzcyggJ2FjdGl2YXRlZCcgKVxuXHRcdFx0LmF0dHIoICdhcmlhLWV4cGFuZGVkJywgZmFsc2UgKVxuXHRcdFx0LmF0dHIoICdhcmlhLXByZXNzZWQnLCBmYWxzZSApO1xuXG5cdFx0JCggJy4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcsIC4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLnN1Yi1tZW51JyApXG5cdFx0XHQuYXR0ciggJ3N0eWxlJywgJycgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZW5lcmljIGZ1bmN0aW9uIHRvIGdldCB0aGUgZGlzcGxheSB2YWx1ZSBvZiBhbiBlbGVtZW50LlxuXHQgKiBAcGFyYW0gIHtpZH0gJGlkIElEIHRvIGNoZWNrXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gICAgIENTUyB2YWx1ZSBvZiBkaXNwbGF5IHByb3BlcnR5XG5cdCAqL1xuXHRmdW5jdGlvbiBfZ2V0RGlzcGxheVZhbHVlKCAkaWQgKSB7XG5cdFx0dmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJGlkICksXG5cdFx0XHRzdHlsZSAgID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoIGVsZW1lbnQgKTtcblx0XHRyZXR1cm4gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSggJ2Rpc3BsYXknICk7XG5cdH1cblxuXHQvKipcblx0ICogVG9nZ2xlIGFyaWEgYXR0cmlidXRlcy5cblx0ICogQHBhcmFtICB7YnV0dG9ufSAkdGhpcyAgICAgcGFzc2VkIHRocm91Z2hcblx0ICogQHBhcmFtICB7YXJpYS14eH0gYXR0cmlidXRlIGFyaWEgYXR0cmlidXRlIHRvIHRvZ2dsZVxuXHQgKiBAcmV0dXJuIHtib29sfSAgICAgICAgICAgZnJvbSBfYXJpYVJldHVyblxuXHQgKi9cblx0ZnVuY3Rpb24gX3RvZ2dsZUFyaWEoICR0aGlzLCBhdHRyaWJ1dGUgKSB7XG5cdFx0JHRoaXMuYXR0ciggYXR0cmlidXRlLCBmdW5jdGlvbiggaW5kZXgsIHZhbHVlICkge1xuXHRcdFx0cmV0dXJuICdmYWxzZScgPT09IHZhbHVlO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciBmdW5jdGlvbiB0byByZXR1cm4gYSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIG9mIG1lbnUgc2VsZWN0b3JzLlxuXHQgKiBAcGFyYW0ge2l0ZW1BcnJheX0gQXJyYXkgb2YgbWVudSBpdGVtcyB0byBsb29wIHRocm91Z2guXG5cdCAqIEBwYXJhbSB7aWdub3JlU2Vjb25kYXJ5fSBib29sZWFuIG9mIHdoZXRoZXIgdG8gaWdub3JlIHRoZSAnc2Vjb25kYXJ5JyBtZW51IGl0ZW0uXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gQ29tbWEtc2VwYXJhdGVkIHN0cmluZy5cblx0ICovXG5cdGZ1bmN0aW9uIF9nZXRNZW51U2VsZWN0b3JTdHJpbmcoIGl0ZW1BcnJheSApIHtcblxuXHRcdHZhciBpdGVtU3RyaW5nID0gJC5tYXAoIGl0ZW1BcnJheSwgZnVuY3Rpb24oIHZhbHVlLCBrZXkgKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gaXRlbVN0cmluZy5qb2luKCAnLCcgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciBmdW5jdGlvbiB0byByZXR1cm4gYSBncm91cCBhcnJheSBvZiBhbGwgdGhlIG1lbnVzIGluXG5cdCAqIGJvdGggdGhlICdvdGhlcnMnIGFuZCAnY29tYmluZScgYXJyYXlzLlxuXHQgKiBAcmV0dXJuIHthcnJheX0gQXJyYXkgb2YgYWxsIG1lbnUgaXRlbXMgYXMgY2xhc3Mgc2VsZWN0b3JzLlxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldEFsbE1lbnVzQXJyYXkoKSB7XG5cblx0XHQvLyBTdGFydCB3aXRoIGFuIGVtcHR5IGFycmF5LlxuXHRcdHZhciBtZW51TGlzdCA9IFtdO1xuXG5cdFx0Ly8gSWYgdGhlcmUgYXJlIG1lbnVzIGluIHRoZSAnbWVudXNUb0NvbWJpbmUnIGFycmF5LCBhZGQgdGhlbSB0byAnbWVudUxpc3QnLlxuXHRcdGlmICggbWVudXNUb0NvbWJpbmUgIT09IG51bGwgKSB7XG5cblx0XHRcdCQuZWFjaCggbWVudXNUb0NvbWJpbmUsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdFx0XHRtZW51TGlzdC5wdXNoKCB2YWx1ZS52YWx1ZU9mKCkgKTtcblx0XHRcdH0pO1xuXG5cdFx0fVxuXG5cdFx0Ly8gQWRkIG1lbnVzIGluIHRoZSAnb3RoZXJzJyBhcnJheSB0byAnbWVudUxpc3QnLlxuXHRcdCQuZWFjaCggZ2VuZXNpc01lbnVzLm90aGVycywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRtZW51TGlzdC5wdXNoKCB2YWx1ZS52YWx1ZU9mKCkgKTtcblx0XHR9KTtcblxuXHRcdGlmICggbWVudUxpc3QubGVuZ3RoID4gMCApIHtcblx0XHRcdHJldHVybiBtZW51TGlzdDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdH1cblxuXHQkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoIF9nZXRBbGxNZW51c0FycmF5KCkgIT09IG51bGwgKSB7XG5cblx0XHRcdGdlbmVzaXNNZW51LmluaXQoKTtcblxuXHRcdH1cblxuXHR9KTtcblxuXG59KSggZG9jdW1lbnQsIGpRdWVyeSApO1xuIiwiLyoqXG4gKiBob3ZlckludGVudCBpcyBzaW1pbGFyIHRvIGpRdWVyeSdzIGJ1aWx0LWluIFwiaG92ZXJcIiBtZXRob2QgZXhjZXB0IHRoYXRcbiAqIGluc3RlYWQgb2YgZmlyaW5nIHRoZSBoYW5kbGVySW4gZnVuY3Rpb24gaW1tZWRpYXRlbHksIGhvdmVySW50ZW50IGNoZWNrc1xuICogdG8gc2VlIGlmIHRoZSB1c2VyJ3MgbW91c2UgaGFzIHNsb3dlZCBkb3duIChiZW5lYXRoIHRoZSBzZW5zaXRpdml0eVxuICogdGhyZXNob2xkKSBiZWZvcmUgZmlyaW5nIHRoZSBldmVudC4gVGhlIGhhbmRsZXJPdXQgZnVuY3Rpb24gaXMgb25seVxuICogY2FsbGVkIGFmdGVyIGEgbWF0Y2hpbmcgaGFuZGxlckluLlxuICpcbiAqIGhvdmVySW50ZW50IHI3IC8vIDIwMTMuMDMuMTEgLy8galF1ZXJ5IDEuOS4xK1xuICogaHR0cDovL2NoZXJuZS5uZXQvYnJpYW4vcmVzb3VyY2VzL2pxdWVyeS5ob3ZlckludGVudC5odG1sXG4gKlxuICogWW91IG1heSB1c2UgaG92ZXJJbnRlbnQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgbGljZW5zZS4gQmFzaWNhbGx5IHRoYXRcbiAqIG1lYW5zIHlvdSBhcmUgZnJlZSB0byB1c2UgaG92ZXJJbnRlbnQgYXMgbG9uZyBhcyB0aGlzIGhlYWRlciBpcyBsZWZ0IGludGFjdC5cbiAqIENvcHlyaWdodCAyMDA3LCAyMDEzIEJyaWFuIENoZXJuZVxuICpcbiAqIC8vIGJhc2ljIHVzYWdlIC4uLiBqdXN0IGxpa2UgLmhvdmVyKClcbiAqIC5ob3ZlckludGVudCggaGFuZGxlckluLCBoYW5kbGVyT3V0IClcbiAqIC5ob3ZlckludGVudCggaGFuZGxlckluT3V0IClcbiAqXG4gKiAvLyBiYXNpYyB1c2FnZSAuLi4gd2l0aCBldmVudCBkZWxlZ2F0aW9uIVxuICogLmhvdmVySW50ZW50KCBoYW5kbGVySW4sIGhhbmRsZXJPdXQsIHNlbGVjdG9yIClcbiAqIC5ob3ZlckludGVudCggaGFuZGxlckluT3V0LCBzZWxlY3RvciApXG4gKlxuICogLy8gdXNpbmcgYSBiYXNpYyBjb25maWd1cmF0aW9uIG9iamVjdFxuICogLmhvdmVySW50ZW50KCBjb25maWcgKVxuICpcbiAqIEBwYXJhbSAgaGFuZGxlckluICAgZnVuY3Rpb24gT1IgY29uZmlndXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSAgaGFuZGxlck91dCAgZnVuY3Rpb24gT1Igc2VsZWN0b3IgZm9yIGRlbGVnYXRpb24gT1IgdW5kZWZpbmVkXG4gKiBAcGFyYW0gIHNlbGVjdG9yICAgIHNlbGVjdG9yIE9SIHVuZGVmaW5lZFxuICogQGF1dGhvciBCcmlhbiBDaGVybmUgPGJyaWFuKGF0KWNoZXJuZShkb3QpbmV0PlxuICoqL1xuKGZ1bmN0aW9uKCQpIHtcbiAgICAkLmZuLmhvdmVySW50ZW50ID0gZnVuY3Rpb24oaGFuZGxlckluLGhhbmRsZXJPdXQsc2VsZWN0b3IpIHtcblxuICAgICAgICAvLyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gdmFsdWVzXG4gICAgICAgIHZhciBjZmcgPSB7XG4gICAgICAgICAgICBpbnRlcnZhbDogMTAwLFxuICAgICAgICAgICAgc2Vuc2l0aXZpdHk6IDcsXG4gICAgICAgICAgICB0aW1lb3V0OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCB0eXBlb2YgaGFuZGxlckluID09PSBcIm9iamVjdFwiICkge1xuICAgICAgICAgICAgY2ZnID0gJC5leHRlbmQoY2ZnLCBoYW5kbGVySW4gKTtcbiAgICAgICAgfSBlbHNlIGlmICgkLmlzRnVuY3Rpb24oaGFuZGxlck91dCkpIHtcbiAgICAgICAgICAgIGNmZyA9ICQuZXh0ZW5kKGNmZywgeyBvdmVyOiBoYW5kbGVySW4sIG91dDogaGFuZGxlck91dCwgc2VsZWN0b3I6IHNlbGVjdG9yIH0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNmZyA9ICQuZXh0ZW5kKGNmZywgeyBvdmVyOiBoYW5kbGVySW4sIG91dDogaGFuZGxlckluLCBzZWxlY3RvcjogaGFuZGxlck91dCB9ICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbnN0YW50aWF0ZSB2YXJpYWJsZXNcbiAgICAgICAgLy8gY1gsIGNZID0gY3VycmVudCBYIGFuZCBZIHBvc2l0aW9uIG9mIG1vdXNlLCB1cGRhdGVkIGJ5IG1vdXNlbW92ZSBldmVudFxuICAgICAgICAvLyBwWCwgcFkgPSBwcmV2aW91cyBYIGFuZCBZIHBvc2l0aW9uIG9mIG1vdXNlLCBzZXQgYnkgbW91c2VvdmVyIGFuZCBwb2xsaW5nIGludGVydmFsXG4gICAgICAgIHZhciBjWCwgY1ksIHBYLCBwWTtcblxuICAgICAgICAvLyBBIHByaXZhdGUgZnVuY3Rpb24gZm9yIGdldHRpbmcgbW91c2UgcG9zaXRpb25cbiAgICAgICAgdmFyIHRyYWNrID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgICAgIGNYID0gZXYucGFnZVg7XG4gICAgICAgICAgICBjWSA9IGV2LnBhZ2VZO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEEgcHJpdmF0ZSBmdW5jdGlvbiBmb3IgY29tcGFyaW5nIGN1cnJlbnQgYW5kIHByZXZpb3VzIG1vdXNlIHBvc2l0aW9uXG4gICAgICAgIHZhciBjb21wYXJlID0gZnVuY3Rpb24oZXYsb2IpIHtcbiAgICAgICAgICAgIG9iLmhvdmVySW50ZW50X3QgPSBjbGVhclRpbWVvdXQob2IuaG92ZXJJbnRlbnRfdCk7XG4gICAgICAgICAgICAvLyBjb21wYXJlIG1vdXNlIHBvc2l0aW9ucyB0byBzZWUgaWYgdGhleSd2ZSBjcm9zc2VkIHRoZSB0aHJlc2hvbGRcbiAgICAgICAgICAgIGlmICggKCBNYXRoLmFicyhwWC1jWCkgKyBNYXRoLmFicyhwWS1jWSkgKSA8IGNmZy5zZW5zaXRpdml0eSApIHtcbiAgICAgICAgICAgICAgICAkKG9iKS5vZmYoXCJtb3VzZW1vdmUuaG92ZXJJbnRlbnRcIix0cmFjayk7XG4gICAgICAgICAgICAgICAgLy8gc2V0IGhvdmVySW50ZW50IHN0YXRlIHRvIHRydWUgKHNvIG1vdXNlT3V0IGNhbiBiZSBjYWxsZWQpXG4gICAgICAgICAgICAgICAgb2IuaG92ZXJJbnRlbnRfcyA9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNmZy5vdmVyLmFwcGx5KG9iLFtldl0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBzZXQgcHJldmlvdXMgY29vcmRpbmF0ZXMgZm9yIG5leHQgdGltZVxuICAgICAgICAgICAgICAgIHBYID0gY1g7IHBZID0gY1k7XG4gICAgICAgICAgICAgICAgLy8gdXNlIHNlbGYtY2FsbGluZyB0aW1lb3V0LCBndWFyYW50ZWVzIGludGVydmFscyBhcmUgc3BhY2VkIG91dCBwcm9wZXJseSAoYXZvaWRzIEphdmFTY3JpcHQgdGltZXIgYnVncylcbiAgICAgICAgICAgICAgICBvYi5ob3ZlckludGVudF90ID0gc2V0VGltZW91dCggZnVuY3Rpb24oKXtjb21wYXJlKGV2LCBvYik7fSAsIGNmZy5pbnRlcnZhbCApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEEgcHJpdmF0ZSBmdW5jdGlvbiBmb3IgZGVsYXlpbmcgdGhlIG1vdXNlT3V0IGZ1bmN0aW9uXG4gICAgICAgIHZhciBkZWxheSA9IGZ1bmN0aW9uKGV2LG9iKSB7XG4gICAgICAgICAgICBvYi5ob3ZlckludGVudF90ID0gY2xlYXJUaW1lb3V0KG9iLmhvdmVySW50ZW50X3QpO1xuICAgICAgICAgICAgb2IuaG92ZXJJbnRlbnRfcyA9IDA7XG4gICAgICAgICAgICByZXR1cm4gY2ZnLm91dC5hcHBseShvYixbZXZdKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBIHByaXZhdGUgZnVuY3Rpb24gZm9yIGhhbmRsaW5nIG1vdXNlICdob3ZlcmluZydcbiAgICAgICAgdmFyIGhhbmRsZUhvdmVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgLy8gY29weSBvYmplY3RzIHRvIGJlIHBhc3NlZCBpbnRvIHQgKHJlcXVpcmVkIGZvciBldmVudCBvYmplY3QgdG8gYmUgcGFzc2VkIGluIElFKVxuICAgICAgICAgICAgdmFyIGV2ID0galF1ZXJ5LmV4dGVuZCh7fSxlKTtcbiAgICAgICAgICAgIHZhciBvYiA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIGNhbmNlbCBob3ZlckludGVudCB0aW1lciBpZiBpdCBleGlzdHNcbiAgICAgICAgICAgIGlmIChvYi5ob3ZlckludGVudF90KSB7IG9iLmhvdmVySW50ZW50X3QgPSBjbGVhclRpbWVvdXQob2IuaG92ZXJJbnRlbnRfdCk7IH1cblxuICAgICAgICAgICAgLy8gaWYgZS50eXBlID09IFwibW91c2VlbnRlclwiXG4gICAgICAgICAgICBpZiAoZS50eXBlID09IFwibW91c2VlbnRlclwiKSB7XG4gICAgICAgICAgICAgICAgLy8gc2V0IFwicHJldmlvdXNcIiBYIGFuZCBZIHBvc2l0aW9uIGJhc2VkIG9uIGluaXRpYWwgZW50cnkgcG9pbnRcbiAgICAgICAgICAgICAgICBwWCA9IGV2LnBhZ2VYOyBwWSA9IGV2LnBhZ2VZO1xuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBcImN1cnJlbnRcIiBYIGFuZCBZIHBvc2l0aW9uIGJhc2VkIG9uIG1vdXNlbW92ZVxuICAgICAgICAgICAgICAgICQob2IpLm9uKFwibW91c2Vtb3ZlLmhvdmVySW50ZW50XCIsdHJhY2spO1xuICAgICAgICAgICAgICAgIC8vIHN0YXJ0IHBvbGxpbmcgaW50ZXJ2YWwgKHNlbGYtY2FsbGluZyB0aW1lb3V0KSB0byBjb21wYXJlIG1vdXNlIGNvb3JkaW5hdGVzIG92ZXIgdGltZVxuICAgICAgICAgICAgICAgIGlmIChvYi5ob3ZlckludGVudF9zICE9IDEpIHsgb2IuaG92ZXJJbnRlbnRfdCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7Y29tcGFyZShldixvYik7fSAsIGNmZy5pbnRlcnZhbCApO31cblxuICAgICAgICAgICAgICAgIC8vIGVsc2UgZS50eXBlID09IFwibW91c2VsZWF2ZVwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHVuYmluZCBleHBlbnNpdmUgbW91c2Vtb3ZlIGV2ZW50XG4gICAgICAgICAgICAgICAgJChvYikub2ZmKFwibW91c2Vtb3ZlLmhvdmVySW50ZW50XCIsdHJhY2spO1xuICAgICAgICAgICAgICAgIC8vIGlmIGhvdmVySW50ZW50IHN0YXRlIGlzIHRydWUsIHRoZW4gY2FsbCB0aGUgbW91c2VPdXQgZnVuY3Rpb24gYWZ0ZXIgdGhlIHNwZWNpZmllZCBkZWxheVxuICAgICAgICAgICAgICAgIGlmIChvYi5ob3ZlckludGVudF9zID09IDEpIHsgb2IuaG92ZXJJbnRlbnRfdCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7ZGVsYXkoZXYsb2IpO30gLCBjZmcudGltZW91dCApO31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBsaXN0ZW4gZm9yIG1vdXNlZW50ZXIgYW5kIG1vdXNlbGVhdmVcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeydtb3VzZWVudGVyLmhvdmVySW50ZW50JzpoYW5kbGVIb3ZlciwnbW91c2VsZWF2ZS5ob3ZlckludGVudCc6aGFuZGxlSG92ZXJ9LCBjZmcuc2VsZWN0b3IpO1xuICAgIH07XG59KShqUXVlcnkpOyIsIi8qIVxuICogaW1hZ2VzTG9hZGVkIFBBQ0tBR0VEIHY0LjEuNFxuICogSmF2YVNjcmlwdCBpcyBhbGwgbGlrZSBcIllvdSBpbWFnZXMgYXJlIGRvbmUgeWV0IG9yIHdoYXQ/XCJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLyoqXG4gKiBFdkVtaXR0ZXIgdjEuMS4wXG4gKiBMaWwnIGV2ZW50IGVtaXR0ZXJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLyoganNoaW50IHVudXNlZDogdHJ1ZSwgdW5kZWY6IHRydWUsIHN0cmljdDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCBnbG9iYWwsIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKiBnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCB3aW5kb3cgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTUQgLSBSZXF1aXJlSlNcbiAgICBkZWZpbmUoICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInLGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KUyAtIEJyb3dzZXJpZnksIFdlYnBhY2tcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBnbG9iYWwuRXZFbWl0dGVyID0gZmFjdG9yeSgpO1xuICB9XG5cbn0oIHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLCBmdW5jdGlvbigpIHtcblxuXG5cbmZ1bmN0aW9uIEV2RW1pdHRlcigpIHt9XG5cbnZhciBwcm90byA9IEV2RW1pdHRlci5wcm90b3R5cGU7XG5cbnByb3RvLm9uID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNldCBldmVudHMgaGFzaFxuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICAvLyBzZXQgbGlzdGVuZXJzIGFycmF5XG4gIHZhciBsaXN0ZW5lcnMgPSBldmVudHNbIGV2ZW50TmFtZSBdID0gZXZlbnRzWyBldmVudE5hbWUgXSB8fCBbXTtcbiAgLy8gb25seSBhZGQgb25jZVxuICBpZiAoIGxpc3RlbmVycy5pbmRleE9mKCBsaXN0ZW5lciApID09IC0xICkge1xuICAgIGxpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vbmNlID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGFkZCBldmVudFxuICB0aGlzLm9uKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gIC8vIHNldCBvbmNlIGZsYWdcbiAgLy8gc2V0IG9uY2VFdmVudHMgaGFzaFxuICB2YXIgb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzIHx8IHt9O1xuICAvLyBzZXQgb25jZUxpc3RlbmVycyBvYmplY3RcbiAgdmFyIG9uY2VMaXN0ZW5lcnMgPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdIHx8IHt9O1xuICAvLyBzZXQgZmxhZ1xuICBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLm9mZiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgYXJncyApIHtcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGNvcHkgb3ZlciB0byBhdm9pZCBpbnRlcmZlcmVuY2UgaWYgLm9mZigpIGluIGxpc3RlbmVyXG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSgwKTtcbiAgYXJncyA9IGFyZ3MgfHwgW107XG4gIC8vIG9uY2Ugc3R1ZmZcbiAgdmFyIG9uY2VMaXN0ZW5lcnMgPSB0aGlzLl9vbmNlRXZlbnRzICYmIHRoaXMuX29uY2VFdmVudHNbIGV2ZW50TmFtZSBdO1xuXG4gIGZvciAoIHZhciBpPTA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldXG4gICAgdmFyIGlzT25jZSA9IG9uY2VMaXN0ZW5lcnMgJiYgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICBpZiAoIGlzT25jZSApIHtcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgICAgLy8gcmVtb3ZlIGJlZm9yZSB0cmlnZ2VyIHRvIHByZXZlbnQgcmVjdXJzaW9uXG4gICAgICB0aGlzLm9mZiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAgICAgLy8gdW5zZXQgb25jZSBmbGFnXG4gICAgICBkZWxldGUgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgLy8gdHJpZ2dlciBsaXN0ZW5lclxuICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmFsbE9mZiA9IGZ1bmN0aW9uKCkge1xuICBkZWxldGUgdGhpcy5fZXZlbnRzO1xuICBkZWxldGUgdGhpcy5fb25jZUV2ZW50cztcbn07XG5cbnJldHVybiBFdkVtaXR0ZXI7XG5cbn0pKTtcblxuLyohXG4gKiBpbWFnZXNMb2FkZWQgdjQuMS40XG4gKiBKYXZhU2NyaXB0IGlzIGFsbCBsaWtlIFwiWW91IGltYWdlcyBhcmUgZG9uZSB5ZXQgb3Igd2hhdD9cIlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7ICd1c2Ugc3RyaWN0JztcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG5cbiAgLypnbG9iYWwgZGVmaW5lOiBmYWxzZSwgbW9kdWxlOiBmYWxzZSwgcmVxdWlyZTogZmFsc2UgKi9cblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2V2LWVtaXR0ZXIvZXYtZW1pdHRlcidcbiAgICBdLCBmdW5jdGlvbiggRXZFbWl0dGVyICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdldi1lbWl0dGVyJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LmltYWdlc0xvYWRlZCA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuRXZFbWl0dGVyXG4gICAgKTtcbiAgfVxuXG59KSggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLFxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgZmFjdG9yeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApIHtcblxuXG5cbnZhciAkID0gd2luZG93LmpRdWVyeTtcbnZhciBjb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZXh0ZW5kIG9iamVjdHNcbmZ1bmN0aW9uIGV4dGVuZCggYSwgYiApIHtcbiAgZm9yICggdmFyIHByb3AgaW4gYiApIHtcbiAgICBhWyBwcm9wIF0gPSBiWyBwcm9wIF07XG4gIH1cbiAgcmV0dXJuIGE7XG59XG5cbnZhciBhcnJheVNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4vLyB0dXJuIGVsZW1lbnQgb3Igbm9kZUxpc3QgaW50byBhbiBhcnJheVxuZnVuY3Rpb24gbWFrZUFycmF5KCBvYmogKSB7XG4gIGlmICggQXJyYXkuaXNBcnJheSggb2JqICkgKSB7XG4gICAgLy8gdXNlIG9iamVjdCBpZiBhbHJlYWR5IGFuIGFycmF5XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciBpc0FycmF5TGlrZSA9IHR5cGVvZiBvYmogPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iai5sZW5ndGggPT0gJ251bWJlcic7XG4gIGlmICggaXNBcnJheUxpa2UgKSB7XG4gICAgLy8gY29udmVydCBub2RlTGlzdCB0byBhcnJheVxuICAgIHJldHVybiBhcnJheVNsaWNlLmNhbGwoIG9iaiApO1xuICB9XG5cbiAgLy8gYXJyYXkgb2Ygc2luZ2xlIGluZGV4XG4gIHJldHVybiBbIG9iaiBdO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBpbWFnZXNMb2FkZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBAcGFyYW0ge0FycmF5LCBFbGVtZW50LCBOb2RlTGlzdCwgU3RyaW5nfSBlbGVtXG4gKiBAcGFyYW0ge09iamVjdCBvciBGdW5jdGlvbn0gb3B0aW9ucyAtIGlmIGZ1bmN0aW9uLCB1c2UgYXMgY2FsbGJhY2tcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9uQWx3YXlzIC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gSW1hZ2VzTG9hZGVkKCBlbGVtLCBvcHRpb25zLCBvbkFsd2F5cyApIHtcbiAgLy8gY29lcmNlIEltYWdlc0xvYWRlZCgpIHdpdGhvdXQgbmV3LCB0byBiZSBuZXcgSW1hZ2VzTG9hZGVkKClcbiAgaWYgKCAhKCB0aGlzIGluc3RhbmNlb2YgSW1hZ2VzTG9hZGVkICkgKSB7XG4gICAgcmV0dXJuIG5ldyBJbWFnZXNMb2FkZWQoIGVsZW0sIG9wdGlvbnMsIG9uQWx3YXlzICk7XG4gIH1cbiAgLy8gdXNlIGVsZW0gYXMgc2VsZWN0b3Igc3RyaW5nXG4gIHZhciBxdWVyeUVsZW0gPSBlbGVtO1xuICBpZiAoIHR5cGVvZiBlbGVtID09ICdzdHJpbmcnICkge1xuICAgIHF1ZXJ5RWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIGVsZW0gKTtcbiAgfVxuICAvLyBiYWlsIGlmIGJhZCBlbGVtZW50XG4gIGlmICggIXF1ZXJ5RWxlbSApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnQmFkIGVsZW1lbnQgZm9yIGltYWdlc0xvYWRlZCAnICsgKCBxdWVyeUVsZW0gfHwgZWxlbSApICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5lbGVtZW50cyA9IG1ha2VBcnJheSggcXVlcnlFbGVtICk7XG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZCgge30sIHRoaXMub3B0aW9ucyApO1xuICAvLyBzaGlmdCBhcmd1bWVudHMgaWYgbm8gb3B0aW9ucyBzZXRcbiAgaWYgKCB0eXBlb2Ygb3B0aW9ucyA9PSAnZnVuY3Rpb24nICkge1xuICAgIG9uQWx3YXlzID0gb3B0aW9ucztcbiAgfSBlbHNlIHtcbiAgICBleHRlbmQoIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xuICB9XG5cbiAgaWYgKCBvbkFsd2F5cyApIHtcbiAgICB0aGlzLm9uKCAnYWx3YXlzJywgb25BbHdheXMgKTtcbiAgfVxuXG4gIHRoaXMuZ2V0SW1hZ2VzKCk7XG5cbiAgaWYgKCAkICkge1xuICAgIC8vIGFkZCBqUXVlcnkgRGVmZXJyZWQgb2JqZWN0XG4gICAgdGhpcy5qcURlZmVycmVkID0gbmV3ICQuRGVmZXJyZWQoKTtcbiAgfVxuXG4gIC8vIEhBQ0sgY2hlY2sgYXN5bmMgdG8gYWxsb3cgdGltZSB0byBiaW5kIGxpc3RlbmVyc1xuICBzZXRUaW1lb3V0KCB0aGlzLmNoZWNrLmJpbmQoIHRoaXMgKSApO1xufVxuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLm9wdGlvbnMgPSB7fTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5nZXRJbWFnZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWFnZXMgPSBbXTtcblxuICAvLyBmaWx0ZXIgJiBmaW5kIGl0ZW1zIGlmIHdlIGhhdmUgYW4gaXRlbSBzZWxlY3RvclxuICB0aGlzLmVsZW1lbnRzLmZvckVhY2goIHRoaXMuYWRkRWxlbWVudEltYWdlcywgdGhpcyApO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnRcbiAqL1xuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRFbGVtZW50SW1hZ2VzID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIC8vIGZpbHRlciBzaWJsaW5nc1xuICBpZiAoIGVsZW0ubm9kZU5hbWUgPT0gJ0lNRycgKSB7XG4gICAgdGhpcy5hZGRJbWFnZSggZWxlbSApO1xuICB9XG4gIC8vIGdldCBiYWNrZ3JvdW5kIGltYWdlIG9uIGVsZW1lbnRcbiAgaWYgKCB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCA9PT0gdHJ1ZSApIHtcbiAgICB0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKCBlbGVtICk7XG4gIH1cblxuICAvLyBmaW5kIGNoaWxkcmVuXG4gIC8vIG5vIG5vbi1lbGVtZW50IG5vZGVzLCAjMTQzXG4gIHZhciBub2RlVHlwZSA9IGVsZW0ubm9kZVR5cGU7XG4gIGlmICggIW5vZGVUeXBlIHx8ICFlbGVtZW50Tm9kZVR5cGVzWyBub2RlVHlwZSBdICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgY2hpbGRJbWdzID0gZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKTtcbiAgLy8gY29uY2F0IGNoaWxkRWxlbXMgdG8gZmlsdGVyRm91bmQgYXJyYXlcbiAgZm9yICggdmFyIGk9MDsgaSA8IGNoaWxkSW1ncy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgaW1nID0gY2hpbGRJbWdzW2ldO1xuICAgIHRoaXMuYWRkSW1hZ2UoIGltZyApO1xuICB9XG5cbiAgLy8gZ2V0IGNoaWxkIGJhY2tncm91bmQgaW1hZ2VzXG4gIGlmICggdHlwZW9mIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kID09ICdzdHJpbmcnICkge1xuICAgIHZhciBjaGlsZHJlbiA9IGVsZW0ucXVlcnlTZWxlY3RvckFsbCggdGhpcy5vcHRpb25zLmJhY2tncm91bmQgKTtcbiAgICBmb3IgKCBpPTA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgdGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyggY2hpbGQgKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBlbGVtZW50Tm9kZVR5cGVzID0ge1xuICAxOiB0cnVlLFxuICA5OiB0cnVlLFxuICAxMTogdHJ1ZVxufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKCBlbGVtICk7XG4gIGlmICggIXN0eWxlICkge1xuICAgIC8vIEZpcmVmb3ggcmV0dXJucyBudWxsIGlmIGluIGEgaGlkZGVuIGlmcmFtZSBodHRwczovL2J1Z3ppbC5sYS81NDgzOTdcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZ2V0IHVybCBpbnNpZGUgdXJsKFwiLi4uXCIpXG4gIHZhciByZVVSTCA9IC91cmxcXCgoWydcIl0pPyguKj8pXFwxXFwpL2dpO1xuICB2YXIgbWF0Y2hlcyA9IHJlVVJMLmV4ZWMoIHN0eWxlLmJhY2tncm91bmRJbWFnZSApO1xuICB3aGlsZSAoIG1hdGNoZXMgIT09IG51bGwgKSB7XG4gICAgdmFyIHVybCA9IG1hdGNoZXMgJiYgbWF0Y2hlc1syXTtcbiAgICBpZiAoIHVybCApIHtcbiAgICAgIHRoaXMuYWRkQmFja2dyb3VuZCggdXJsLCBlbGVtICk7XG4gICAgfVxuICAgIG1hdGNoZXMgPSByZVVSTC5leGVjKCBzdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge0ltYWdlfSBpbWdcbiAqL1xuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRJbWFnZSA9IGZ1bmN0aW9uKCBpbWcgKSB7XG4gIHZhciBsb2FkaW5nSW1hZ2UgPSBuZXcgTG9hZGluZ0ltYWdlKCBpbWcgKTtcbiAgdGhpcy5pbWFnZXMucHVzaCggbG9hZGluZ0ltYWdlICk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEJhY2tncm91bmQgPSBmdW5jdGlvbiggdXJsLCBlbGVtICkge1xuICB2YXIgYmFja2dyb3VuZCA9IG5ldyBCYWNrZ3JvdW5kKCB1cmwsIGVsZW0gKTtcbiAgdGhpcy5pbWFnZXMucHVzaCggYmFja2dyb3VuZCApO1xufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLnByb2dyZXNzZWRDb3VudCA9IDA7XG4gIHRoaXMuaGFzQW55QnJva2VuID0gZmFsc2U7XG4gIC8vIGNvbXBsZXRlIGlmIG5vIGltYWdlc1xuICBpZiAoICF0aGlzLmltYWdlcy5sZW5ndGggKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uUHJvZ3Jlc3MoIGltYWdlLCBlbGVtLCBtZXNzYWdlICkge1xuICAgIC8vIEhBQ0sgLSBDaHJvbWUgdHJpZ2dlcnMgZXZlbnQgYmVmb3JlIG9iamVjdCBwcm9wZXJ0aWVzIGhhdmUgY2hhbmdlZC4gIzgzXG4gICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5wcm9ncmVzcyggaW1hZ2UsIGVsZW0sIG1lc3NhZ2UgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuaW1hZ2VzLmZvckVhY2goIGZ1bmN0aW9uKCBsb2FkaW5nSW1hZ2UgKSB7XG4gICAgbG9hZGluZ0ltYWdlLm9uY2UoICdwcm9ncmVzcycsIG9uUHJvZ3Jlc3MgKTtcbiAgICBsb2FkaW5nSW1hZ2UuY2hlY2soKTtcbiAgfSk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24oIGltYWdlLCBlbGVtLCBtZXNzYWdlICkge1xuICB0aGlzLnByb2dyZXNzZWRDb3VudCsrO1xuICB0aGlzLmhhc0FueUJyb2tlbiA9IHRoaXMuaGFzQW55QnJva2VuIHx8ICFpbWFnZS5pc0xvYWRlZDtcbiAgLy8gcHJvZ3Jlc3MgZXZlbnRcbiAgdGhpcy5lbWl0RXZlbnQoICdwcm9ncmVzcycsIFsgdGhpcywgaW1hZ2UsIGVsZW0gXSApO1xuICBpZiAoIHRoaXMuanFEZWZlcnJlZCAmJiB0aGlzLmpxRGVmZXJyZWQubm90aWZ5ICkge1xuICAgIHRoaXMuanFEZWZlcnJlZC5ub3RpZnkoIHRoaXMsIGltYWdlICk7XG4gIH1cbiAgLy8gY2hlY2sgaWYgY29tcGxldGVkXG4gIGlmICggdGhpcy5wcm9ncmVzc2VkQ291bnQgPT0gdGhpcy5pbWFnZXMubGVuZ3RoICkge1xuICAgIHRoaXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIGlmICggdGhpcy5vcHRpb25zLmRlYnVnICYmIGNvbnNvbGUgKSB7XG4gICAgY29uc29sZS5sb2coICdwcm9ncmVzczogJyArIG1lc3NhZ2UsIGltYWdlLCBlbGVtICk7XG4gIH1cbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGV2ZW50TmFtZSA9IHRoaXMuaGFzQW55QnJva2VuID8gJ2ZhaWwnIDogJ2RvbmUnO1xuICB0aGlzLmlzQ29tcGxldGUgPSB0cnVlO1xuICB0aGlzLmVtaXRFdmVudCggZXZlbnROYW1lLCBbIHRoaXMgXSApO1xuICB0aGlzLmVtaXRFdmVudCggJ2Fsd2F5cycsIFsgdGhpcyBdICk7XG4gIGlmICggdGhpcy5qcURlZmVycmVkICkge1xuICAgIHZhciBqcU1ldGhvZCA9IHRoaXMuaGFzQW55QnJva2VuID8gJ3JlamVjdCcgOiAncmVzb2x2ZSc7XG4gICAgdGhpcy5qcURlZmVycmVkWyBqcU1ldGhvZCBdKCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBMb2FkaW5nSW1hZ2UoIGltZyApIHtcbiAgdGhpcy5pbWcgPSBpbWc7XG59XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgLy8gSWYgY29tcGxldGUgaXMgdHJ1ZSBhbmQgYnJvd3NlciBzdXBwb3J0cyBuYXR1cmFsIHNpemVzLFxuICAvLyB0cnkgdG8gY2hlY2sgZm9yIGltYWdlIHN0YXR1cyBtYW51YWxseS5cbiAgdmFyIGlzQ29tcGxldGUgPSB0aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO1xuICBpZiAoIGlzQ29tcGxldGUgKSB7XG4gICAgLy8gcmVwb3J0IGJhc2VkIG9uIG5hdHVyYWxXaWR0aFxuICAgIHRoaXMuY29uZmlybSggdGhpcy5pbWcubmF0dXJhbFdpZHRoICE9PSAwLCAnbmF0dXJhbFdpZHRoJyApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIElmIG5vbmUgb2YgdGhlIGNoZWNrcyBhYm92ZSBtYXRjaGVkLCBzaW11bGF0ZSBsb2FkaW5nIG9uIGRldGFjaGVkIGVsZW1lbnQuXG4gIHRoaXMucHJveHlJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIC8vIGJpbmQgdG8gaW1hZ2UgYXMgd2VsbCBmb3IgRmlyZWZveC4gIzE5MVxuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLnByb3h5SW1hZ2Uuc3JjID0gdGhpcy5pbWcuc3JjO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5nZXRJc0ltYWdlQ29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gY2hlY2sgZm9yIG5vbi16ZXJvLCBub24tdW5kZWZpbmVkIG5hdHVyYWxXaWR0aFxuICAvLyBmaXhlcyBTYWZhcmkrSW5maW5pdGVTY3JvbGwrTWFzb25yeSBidWcgaW5maW5pdGUtc2Nyb2xsIzY3MVxuICByZXR1cm4gdGhpcy5pbWcuY29tcGxldGUgJiYgdGhpcy5pbWcubmF0dXJhbFdpZHRoO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5jb25maXJtID0gZnVuY3Rpb24oIGlzTG9hZGVkLCBtZXNzYWdlICkge1xuICB0aGlzLmlzTG9hZGVkID0gaXNMb2FkZWQ7XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIHRoaXMuaW1nLCBtZXNzYWdlIF0gKTtcbn07XG5cbi8vIC0tLS0tIGV2ZW50cyAtLS0tLSAvL1xuXG4vLyB0cmlnZ2VyIHNwZWNpZmllZCBoYW5kbGVyIGZvciBldmVudCB0eXBlXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29uZmlybSggdHJ1ZSwgJ29ubG9hZCcgKTtcbiAgdGhpcy51bmJpbmRFdmVudHMoKTtcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvbmZpcm0oIGZhbHNlLCAnb25lcnJvcicgKTtcbiAgdGhpcy51bmJpbmRFdmVudHMoKTtcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUudW5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEJhY2tncm91bmQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gQmFja2dyb3VuZCggdXJsLCBlbGVtZW50ICkge1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcbn1cblxuLy8gaW5oZXJpdCBMb2FkaW5nSW1hZ2UgcHJvdG90eXBlXG5CYWNrZ3JvdW5kLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExvYWRpbmdJbWFnZS5wcm90b3R5cGUgKTtcblxuQmFja2dyb3VuZC5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgdGhpcy5pbWcuc3JjID0gdGhpcy51cmw7XG4gIC8vIGNoZWNrIGlmIGltYWdlIGlzIGFscmVhZHkgY29tcGxldGVcbiAgdmFyIGlzQ29tcGxldGUgPSB0aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO1xuICBpZiAoIGlzQ29tcGxldGUgKSB7XG4gICAgdGhpcy5jb25maXJtKCB0aGlzLmltZy5uYXR1cmFsV2lkdGggIT09IDAsICduYXR1cmFsV2lkdGgnICk7XG4gICAgdGhpcy51bmJpbmRFdmVudHMoKTtcbiAgfVxufTtcblxuQmFja2dyb3VuZC5wcm90b3R5cGUudW5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG59O1xuXG5CYWNrZ3JvdW5kLnByb3RvdHlwZS5jb25maXJtID0gZnVuY3Rpb24oIGlzTG9hZGVkLCBtZXNzYWdlICkge1xuICB0aGlzLmlzTG9hZGVkID0gaXNMb2FkZWQ7XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIHRoaXMuZWxlbWVudCwgbWVzc2FnZSBdICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBqUXVlcnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuSW1hZ2VzTG9hZGVkLm1ha2VKUXVlcnlQbHVnaW4gPSBmdW5jdGlvbiggalF1ZXJ5ICkge1xuICBqUXVlcnkgPSBqUXVlcnkgfHwgd2luZG93LmpRdWVyeTtcbiAgaWYgKCAhalF1ZXJ5ICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzZXQgbG9jYWwgdmFyaWFibGVcbiAgJCA9IGpRdWVyeTtcbiAgLy8gJCgpLmltYWdlc0xvYWRlZCgpXG4gICQuZm4uaW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oIG9wdGlvbnMsIGNhbGxiYWNrICkge1xuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBJbWFnZXNMb2FkZWQoIHRoaXMsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG4gICAgcmV0dXJuIGluc3RhbmNlLmpxRGVmZXJyZWQucHJvbWlzZSggJCh0aGlzKSApO1xuICB9O1xufTtcbi8vIHRyeSBtYWtpbmcgcGx1Z2luXG5JbWFnZXNMb2FkZWQubWFrZUpRdWVyeVBsdWdpbigpO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucmV0dXJuIEltYWdlc0xvYWRlZDtcblxufSk7XG5cbiIsIi8qKlxuKiBqcXVlcnktbWF0Y2gtaGVpZ2h0IG1hc3RlciBieSBAbGlhYnJ1XG4qIGh0dHA6Ly9icm0uaW8vanF1ZXJ5LW1hdGNoLWhlaWdodC9cbiogTGljZW5zZTogTUlUXG4qL1xuXG47KGZ1bmN0aW9uKGZhY3RvcnkpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1leHRyYS1zZW1pXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1EXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIC8vIENvbW1vbkpTXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gR2xvYmFsXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KShmdW5jdGlvbigkKSB7XG4gICAgLypcbiAgICAqICBpbnRlcm5hbFxuICAgICovXG5cbiAgICB2YXIgX3ByZXZpb3VzUmVzaXplV2lkdGggPSAtMSxcbiAgICAgICAgX3VwZGF0ZVRpbWVvdXQgPSAtMTtcblxuICAgIC8qXG4gICAgKiAgX3BhcnNlXG4gICAgKiAgdmFsdWUgcGFyc2UgdXRpbGl0eSBmdW5jdGlvblxuICAgICovXG5cbiAgICB2YXIgX3BhcnNlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgLy8gcGFyc2UgdmFsdWUgYW5kIGNvbnZlcnQgTmFOIHRvIDBcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpIHx8IDA7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgX3Jvd3NcbiAgICAqICB1dGlsaXR5IGZ1bmN0aW9uIHJldHVybnMgYXJyYXkgb2YgalF1ZXJ5IHNlbGVjdGlvbnMgcmVwcmVzZW50aW5nIGVhY2ggcm93XG4gICAgKiAgKGFzIGRpc3BsYXllZCBhZnRlciBmbG9hdCB3cmFwcGluZyBhcHBsaWVkIGJ5IGJyb3dzZXIpXG4gICAgKi9cblxuICAgIHZhciBfcm93cyA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgIHZhciB0b2xlcmFuY2UgPSAxLFxuICAgICAgICAgICAgJGVsZW1lbnRzID0gJChlbGVtZW50cyksXG4gICAgICAgICAgICBsYXN0VG9wID0gbnVsbCxcbiAgICAgICAgICAgIHJvd3MgPSBbXTtcblxuICAgICAgICAvLyBncm91cCBlbGVtZW50cyBieSB0aGVpciB0b3AgcG9zaXRpb25cbiAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgdG9wID0gJHRoYXQub2Zmc2V0KCkudG9wIC0gX3BhcnNlKCR0aGF0LmNzcygnbWFyZ2luLXRvcCcpKSxcbiAgICAgICAgICAgICAgICBsYXN0Um93ID0gcm93cy5sZW5ndGggPiAwID8gcm93c1tyb3dzLmxlbmd0aCAtIDFdIDogbnVsbDtcblxuICAgICAgICAgICAgaWYgKGxhc3RSb3cgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBpdGVtIG9uIHRoZSByb3csIHNvIGp1c3QgcHVzaCBpdFxuICAgICAgICAgICAgICAgIHJvd3MucHVzaCgkdGhhdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSByb3cgdG9wIGlzIHRoZSBzYW1lLCBhZGQgdG8gdGhlIHJvdyBncm91cFxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmZsb29yKE1hdGguYWJzKGxhc3RUb3AgLSB0b3ApKSA8PSB0b2xlcmFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcm93c1tyb3dzLmxlbmd0aCAtIDFdID0gbGFzdFJvdy5hZGQoJHRoYXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBzdGFydCBhIG5ldyByb3cgZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKCR0aGF0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIGxhc3Qgcm93IHRvcFxuICAgICAgICAgICAgbGFzdFRvcCA9IHRvcDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJvd3M7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgX3BhcnNlT3B0aW9uc1xuICAgICogIGhhbmRsZSBwbHVnaW4gb3B0aW9uc1xuICAgICovXG5cbiAgICB2YXIgX3BhcnNlT3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICBieVJvdzogdHJ1ZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnaGVpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldDogbnVsbCxcbiAgICAgICAgICAgIHJlbW92ZTogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5leHRlbmQob3B0cywgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgb3B0cy5ieVJvdyA9IG9wdGlvbnM7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucyA9PT0gJ3JlbW92ZScpIHtcbiAgICAgICAgICAgIG9wdHMucmVtb3ZlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgIH07XG5cbiAgICAvKlxuICAgICogIG1hdGNoSGVpZ2h0XG4gICAgKiAgcGx1Z2luIGRlZmluaXRpb25cbiAgICAqL1xuXG4gICAgdmFyIG1hdGNoSGVpZ2h0ID0gJC5mbi5tYXRjaEhlaWdodCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHMgPSBfcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIGhhbmRsZSByZW1vdmVcbiAgICAgICAgaWYgKG9wdHMucmVtb3ZlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSBmaXhlZCBoZWlnaHQgZnJvbSBhbGwgc2VsZWN0ZWQgZWxlbWVudHNcbiAgICAgICAgICAgIHRoaXMuY3NzKG9wdHMucHJvcGVydHksICcnKTtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIHNlbGVjdGVkIGVsZW1lbnRzIGZyb20gYWxsIGdyb3Vwc1xuICAgICAgICAgICAgJC5lYWNoKG1hdGNoSGVpZ2h0Ll9ncm91cHMsIGZ1bmN0aW9uKGtleSwgZ3JvdXApIHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cyA9IGdyb3VwLmVsZW1lbnRzLm5vdCh0aGF0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBjbGVhbnVwIGVtcHR5IGdyb3Vwc1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA8PSAxICYmICFvcHRzLnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIHRoaXMgZ3JvdXAgc28gd2UgY2FuIHJlLWFwcGx5IGxhdGVyIG9uIGxvYWQgYW5kIHJlc2l6ZSBldmVudHNcbiAgICAgICAgbWF0Y2hIZWlnaHQuX2dyb3Vwcy5wdXNoKHtcbiAgICAgICAgICAgIGVsZW1lbnRzOiB0aGlzLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0c1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBtYXRjaCBlYWNoIGVsZW1lbnQncyBoZWlnaHQgdG8gdGhlIHRhbGxlc3QgZWxlbWVudCBpbiB0aGUgc2VsZWN0aW9uXG4gICAgICAgIG1hdGNoSGVpZ2h0Ll9hcHBseSh0aGlzLCBvcHRzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLypcbiAgICAqICBwbHVnaW4gZ2xvYmFsIG9wdGlvbnNcbiAgICAqL1xuXG4gICAgbWF0Y2hIZWlnaHQudmVyc2lvbiA9ICdtYXN0ZXInO1xuICAgIG1hdGNoSGVpZ2h0Ll9ncm91cHMgPSBbXTtcbiAgICBtYXRjaEhlaWdodC5fdGhyb3R0bGUgPSA4MDtcbiAgICBtYXRjaEhlaWdodC5fbWFpbnRhaW5TY3JvbGwgPSBmYWxzZTtcbiAgICBtYXRjaEhlaWdodC5fYmVmb3JlVXBkYXRlID0gbnVsbDtcbiAgICBtYXRjaEhlaWdodC5fYWZ0ZXJVcGRhdGUgPSBudWxsO1xuICAgIG1hdGNoSGVpZ2h0Ll9yb3dzID0gX3Jvd3M7XG4gICAgbWF0Y2hIZWlnaHQuX3BhcnNlID0gX3BhcnNlO1xuICAgIG1hdGNoSGVpZ2h0Ll9wYXJzZU9wdGlvbnMgPSBfcGFyc2VPcHRpb25zO1xuXG4gICAgLypcbiAgICAqICBtYXRjaEhlaWdodC5fYXBwbHlcbiAgICAqICBhcHBseSBtYXRjaEhlaWdodCB0byBnaXZlbiBlbGVtZW50c1xuICAgICovXG5cbiAgICBtYXRjaEhlaWdodC5fYXBwbHkgPSBmdW5jdGlvbihlbGVtZW50cywgb3B0aW9ucykge1xuICAgICAgICB2YXIgb3B0cyA9IF9wYXJzZU9wdGlvbnMob3B0aW9ucyksXG4gICAgICAgICAgICAkZWxlbWVudHMgPSAkKGVsZW1lbnRzKSxcbiAgICAgICAgICAgIHJvd3MgPSBbJGVsZW1lbnRzXTtcblxuICAgICAgICAvLyB0YWtlIG5vdGUgb2Ygc2Nyb2xsIHBvc2l0aW9uXG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXG4gICAgICAgICAgICBodG1sSGVpZ2h0ID0gJCgnaHRtbCcpLm91dGVySGVpZ2h0KHRydWUpO1xuXG4gICAgICAgIC8vIGdldCBoaWRkZW4gcGFyZW50c1xuICAgICAgICB2YXIgJGhpZGRlblBhcmVudHMgPSAkZWxlbWVudHMucGFyZW50cygpLmZpbHRlcignOmhpZGRlbicpO1xuXG4gICAgICAgIC8vIGNhY2hlIHRoZSBvcmlnaW5hbCBpbmxpbmUgc3R5bGVcbiAgICAgICAgJGhpZGRlblBhcmVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyk7XG4gICAgICAgICAgICAkdGhhdC5kYXRhKCdzdHlsZS1jYWNoZScsICR0aGF0LmF0dHIoJ3N0eWxlJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyB0ZW1wb3JhcmlseSBtdXN0IGZvcmNlIGhpZGRlbiBwYXJlbnRzIHZpc2libGVcbiAgICAgICAgJGhpZGRlblBhcmVudHMuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cbiAgICAgICAgLy8gZ2V0IHJvd3MgaWYgdXNpbmcgYnlSb3csIG90aGVyd2lzZSBhc3N1bWUgb25lIHJvd1xuICAgICAgICBpZiAob3B0cy5ieVJvdyAmJiAhb3B0cy50YXJnZXQpIHtcblxuICAgICAgICAgICAgLy8gbXVzdCBmaXJzdCBmb3JjZSBhbiBhcmJpdHJhcnkgZXF1YWwgaGVpZ2h0IHNvIGZsb2F0aW5nIGVsZW1lbnRzIGJyZWFrIGV2ZW5seVxuICAgICAgICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGF0ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICR0aGF0LmNzcygnZGlzcGxheScpO1xuXG4gICAgICAgICAgICAgICAgLy8gdGVtcG9yYXJpbHkgZm9yY2UgYSB1c2FibGUgZGlzcGxheSB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5ICE9PSAnaW5saW5lLWJsb2NrJyAmJiBkaXNwbGF5ICE9PSAnZmxleCcgJiYgZGlzcGxheSAhPT0gJ2lubGluZS1mbGV4Jykge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBjYWNoZSB0aGUgb3JpZ2luYWwgaW5saW5lIHN0eWxlXG4gICAgICAgICAgICAgICAgJHRoYXQuZGF0YSgnc3R5bGUtY2FjaGUnLCAkdGhhdC5hdHRyKCdzdHlsZScpKTtcblxuICAgICAgICAgICAgICAgICR0aGF0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICdkaXNwbGF5JzogZGlzcGxheSxcbiAgICAgICAgICAgICAgICAgICAgJ3BhZGRpbmctdG9wJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1ib3R0b20nOiAnMCcsXG4gICAgICAgICAgICAgICAgICAgICdtYXJnaW4tdG9wJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAnbWFyZ2luLWJvdHRvbSc6ICcwJyxcbiAgICAgICAgICAgICAgICAgICAgJ2JvcmRlci10b3Atd2lkdGgnOiAnMCcsXG4gICAgICAgICAgICAgICAgICAgICdib3JkZXItYm90dG9tLXdpZHRoJzogJzAnLFxuICAgICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogJzEwMHB4JyxcbiAgICAgICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBnZXQgdGhlIGFycmF5IG9mIHJvd3MgKGJhc2VkIG9uIGVsZW1lbnQgdG9wIHBvc2l0aW9uKVxuICAgICAgICAgICAgcm93cyA9IF9yb3dzKCRlbGVtZW50cyk7XG5cbiAgICAgICAgICAgIC8vIHJldmVydCBvcmlnaW5hbCBpbmxpbmUgc3R5bGVzXG4gICAgICAgICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICR0aGF0LmF0dHIoJ3N0eWxlJywgJHRoYXQuZGF0YSgnc3R5bGUtY2FjaGUnKSB8fCAnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICQuZWFjaChyb3dzLCBmdW5jdGlvbihrZXksIHJvdykge1xuICAgICAgICAgICAgdmFyICRyb3cgPSAkKHJvdyksXG4gICAgICAgICAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gMDtcblxuICAgICAgICAgICAgaWYgKCFvcHRzLnRhcmdldCkge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgYXBwbHkgdG8gcm93cyB3aXRoIG9ubHkgb25lIGl0ZW1cbiAgICAgICAgICAgICAgICBpZiAob3B0cy5ieVJvdyAmJiAkcm93Lmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICRyb3cuY3NzKG9wdHMucHJvcGVydHksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGUgdGhlIHJvdyBhbmQgZmluZCB0aGUgbWF4IGhlaWdodFxuICAgICAgICAgICAgICAgICRyb3cuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGUgPSAkdGhhdC5hdHRyKCdzdHlsZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICR0aGF0LmNzcygnZGlzcGxheScpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRlbXBvcmFyaWx5IGZvcmNlIGEgdXNhYmxlIGRpc3BsYXkgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXkgIT09ICdpbmxpbmUtYmxvY2snICYmIGRpc3BsYXkgIT09ICdmbGV4JyAmJiBkaXNwbGF5ICE9PSAnaW5saW5lLWZsZXgnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB3ZSBnZXQgdGhlIGNvcnJlY3QgYWN0dWFsIGhlaWdodCAoYW5kIG5vdCBhIHByZXZpb3VzbHkgc2V0IGhlaWdodCB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNzcyA9IHsgJ2Rpc3BsYXknOiBkaXNwbGF5IH07XG4gICAgICAgICAgICAgICAgICAgIGNzc1tvcHRzLnByb3BlcnR5XSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAkdGhhdC5jc3MoY3NzKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIHRoZSBtYXggaGVpZ2h0IChpbmNsdWRpbmcgcGFkZGluZywgYnV0IG5vdCBtYXJnaW4pXG4gICAgICAgICAgICAgICAgICAgIGlmICgkdGhhdC5vdXRlckhlaWdodChmYWxzZSkgPiB0YXJnZXRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEhlaWdodCA9ICR0aGF0Lm91dGVySGVpZ2h0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldmVydCBzdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhhdC5hdHRyKCdzdHlsZScsIHN0eWxlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGF0LmNzcygnZGlzcGxheScsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0YXJnZXQgc2V0LCB1c2UgdGhlIGhlaWdodCBvZiB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICB0YXJnZXRIZWlnaHQgPSBvcHRzLnRhcmdldC5vdXRlckhlaWdodChmYWxzZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGl0ZXJhdGUgdGhlIHJvdyBhbmQgYXBwbHkgdGhlIGhlaWdodCB0byBhbGwgZWxlbWVudHNcbiAgICAgICAgICAgICRyb3cuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUGFkZGluZyA9IDA7XG5cbiAgICAgICAgICAgICAgICAvLyBkb24ndCBhcHBseSB0byBhIHRhcmdldFxuICAgICAgICAgICAgICAgIGlmIChvcHRzLnRhcmdldCAmJiAkdGhhdC5pcyhvcHRzLnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBwYWRkaW5nIGFuZCBib3JkZXIgY29ycmVjdGx5IChyZXF1aXJlZCB3aGVuIG5vdCB1c2luZyBib3JkZXItYm94KVxuICAgICAgICAgICAgICAgIGlmICgkdGhhdC5jc3MoJ2JveC1zaXppbmcnKSAhPT0gJ2JvcmRlci1ib3gnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUGFkZGluZyArPSBfcGFyc2UoJHRoYXQuY3NzKCdib3JkZXItdG9wLXdpZHRoJykpICsgX3BhcnNlKCR0aGF0LmNzcygnYm9yZGVyLWJvdHRvbS13aWR0aCcpKTtcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxQYWRkaW5nICs9IF9wYXJzZSgkdGhhdC5jc3MoJ3BhZGRpbmctdG9wJykpICsgX3BhcnNlKCR0aGF0LmNzcygncGFkZGluZy1ib3R0b20nKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBoZWlnaHQgKGFjY291bnRpbmcgZm9yIHBhZGRpbmcgYW5kIGJvcmRlcilcbiAgICAgICAgICAgICAgICAkdGhhdC5jc3Mob3B0cy5wcm9wZXJ0eSwgKHRhcmdldEhlaWdodCAtIHZlcnRpY2FsUGFkZGluZykgKyAncHgnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyByZXZlcnQgaGlkZGVuIHBhcmVudHNcbiAgICAgICAgJGhpZGRlblBhcmVudHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyk7XG4gICAgICAgICAgICAkdGhhdC5hdHRyKCdzdHlsZScsICR0aGF0LmRhdGEoJ3N0eWxlLWNhY2hlJykgfHwgbnVsbCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHJlc3RvcmUgc2Nyb2xsIHBvc2l0aW9uIGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKG1hdGNoSGVpZ2h0Ll9tYWludGFpblNjcm9sbCkge1xuICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbFRvcCgoc2Nyb2xsVG9wIC8gaHRtbEhlaWdodCkgKiAkKCdodG1sJykub3V0ZXJIZWlnaHQodHJ1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgbWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaVxuICAgICogIGFwcGxpZXMgbWF0Y2hIZWlnaHQgdG8gYWxsIGVsZW1lbnRzIHdpdGggYSBkYXRhLW1hdGNoLWhlaWdodCBhdHRyaWJ1dGVcbiAgICAqL1xuXG4gICAgbWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ3JvdXBzID0ge307XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgZ3JvdXBzIGJ5IHRoZWlyIGdyb3VwSWQgc2V0IGJ5IGVsZW1lbnRzIHVzaW5nIGRhdGEtbWF0Y2gtaGVpZ2h0XG4gICAgICAgICQoJ1tkYXRhLW1hdGNoLWhlaWdodF0sIFtkYXRhLW1oXScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGdyb3VwSWQgPSAkdGhpcy5hdHRyKCdkYXRhLW1oJykgfHwgJHRoaXMuYXR0cignZGF0YS1tYXRjaC1oZWlnaHQnKTtcblxuICAgICAgICAgICAgaWYgKGdyb3VwSWQgaW4gZ3JvdXBzKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBzW2dyb3VwSWRdID0gZ3JvdXBzW2dyb3VwSWRdLmFkZCgkdGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyb3Vwc1tncm91cElkXSA9ICR0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBhcHBseSBtYXRjaEhlaWdodCB0byBlYWNoIGdyb3VwXG4gICAgICAgICQuZWFjaChncm91cHMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5tYXRjaEhlaWdodCh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKiAgbWF0Y2hIZWlnaHQuX3VwZGF0ZVxuICAgICogIHVwZGF0ZXMgbWF0Y2hIZWlnaHQgb24gYWxsIGN1cnJlbnQgZ3JvdXBzIHdpdGggdGhlaXIgY29ycmVjdCBvcHRpb25zXG4gICAgKi9cblxuICAgIHZhciBfdXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKG1hdGNoSGVpZ2h0Ll9iZWZvcmVVcGRhdGUpIHtcbiAgICAgICAgICAgIG1hdGNoSGVpZ2h0Ll9iZWZvcmVVcGRhdGUoZXZlbnQsIG1hdGNoSGVpZ2h0Ll9ncm91cHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgJC5lYWNoKG1hdGNoSGVpZ2h0Ll9ncm91cHMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbWF0Y2hIZWlnaHQuX2FwcGx5KHRoaXMuZWxlbWVudHMsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChtYXRjaEhlaWdodC5fYWZ0ZXJVcGRhdGUpIHtcbiAgICAgICAgICAgIG1hdGNoSGVpZ2h0Ll9hZnRlclVwZGF0ZShldmVudCwgbWF0Y2hIZWlnaHQuX2dyb3Vwcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbWF0Y2hIZWlnaHQuX3VwZGF0ZSA9IGZ1bmN0aW9uKHRocm90dGxlLCBldmVudCkge1xuICAgICAgICAvLyBwcmV2ZW50IHVwZGF0ZSBpZiBmaXJlZCBmcm9tIGEgcmVzaXplIGV2ZW50XG4gICAgICAgIC8vIHdoZXJlIHRoZSB2aWV3cG9ydCB3aWR0aCBoYXNuJ3QgYWN0dWFsbHkgY2hhbmdlZFxuICAgICAgICAvLyBmaXhlcyBhbiBldmVudCBsb29waW5nIGJ1ZyBpbiBJRThcbiAgICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdyZXNpemUnKSB7XG4gICAgICAgICAgICB2YXIgd2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3dXaWR0aCA9PT0gX3ByZXZpb3VzUmVzaXplV2lkdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfcHJldmlvdXNSZXNpemVXaWR0aCA9IHdpbmRvd1dpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhyb3R0bGUgdXBkYXRlc1xuICAgICAgICBpZiAoIXRocm90dGxlKSB7XG4gICAgICAgICAgICBfdXBkYXRlKGV2ZW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChfdXBkYXRlVGltZW91dCA9PT0gLTEpIHtcbiAgICAgICAgICAgIF91cGRhdGVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfdXBkYXRlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBfdXBkYXRlVGltZW91dCA9IC0xO1xuICAgICAgICAgICAgfSwgbWF0Y2hIZWlnaHQuX3Rocm90dGxlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICogIGJpbmQgZXZlbnRzXG4gICAgKi9cblxuICAgIC8vIGFwcGx5IG9uIERPTSByZWFkeSBldmVudFxuICAgICQobWF0Y2hIZWlnaHQuX2FwcGx5RGF0YUFwaSk7XG5cbiAgICAvLyB1c2Ugb24gb3IgYmluZCB3aGVyZSBzdXBwb3J0ZWRcbiAgICB2YXIgb24gPSAkLmZuLm9uID8gJ29uJyA6ICdiaW5kJztcblxuICAgIC8vIHVwZGF0ZSBoZWlnaHRzIG9uIGxvYWQgYW5kIHJlc2l6ZSBldmVudHNcbiAgICAkKHdpbmRvdylbb25dKCdsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbWF0Y2hIZWlnaHQuX3VwZGF0ZShmYWxzZSwgZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhyb3R0bGVkIHVwZGF0ZSBoZWlnaHRzIG9uIHJlc2l6ZSBldmVudHNcbiAgICAkKHdpbmRvdylbb25dKCdyZXNpemUgb3JpZW50YXRpb25jaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBtYXRjaEhlaWdodC5fdXBkYXRlKHRydWUsIGV2ZW50KTtcbiAgICB9KTtcblxufSk7XG4iLCIvKiFcbiAqIGpRdWVyeSBTbW9vdGggU2Nyb2xsIC0gdjIuMi4wIC0gMjAxNy0wNS0wNVxuICogaHR0cHM6Ly9naXRodWIuY29tL2tzd2VkYmVyZy9qcXVlcnktc21vb3RoLXNjcm9sbFxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU3dlZGJlcmdcbiAqIExpY2Vuc2VkIE1JVFxuICovXG5cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBmYWN0b3J5KGpRdWVyeSk7XG4gIH1cbn0oZnVuY3Rpb24oJCkge1xuXG4gIHZhciB2ZXJzaW9uID0gJzIuMi4wJztcbiAgdmFyIG9wdGlvbk92ZXJyaWRlcyA9IHt9O1xuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgZXhjbHVkZTogW10sXG4gICAgZXhjbHVkZVdpdGhpbjogW10sXG4gICAgb2Zmc2V0OiAwLFxuXG4gICAgLy8gb25lIG9mICd0b3AnIG9yICdsZWZ0J1xuICAgIGRpcmVjdGlvbjogJ3RvcCcsXG5cbiAgICAvLyBpZiBzZXQsIGJpbmQgY2xpY2sgZXZlbnRzIHRocm91Z2ggZGVsZWdhdGlvblxuICAgIC8vICBzdXBwb3J0ZWQgc2luY2UgalF1ZXJ5IDEuNC4yXG4gICAgZGVsZWdhdGVTZWxlY3RvcjogbnVsbCxcblxuICAgIC8vIGpRdWVyeSBzZXQgb2YgZWxlbWVudHMgeW91IHdpc2ggdG8gc2Nyb2xsIChmb3IgJC5zbW9vdGhTY3JvbGwpLlxuICAgIC8vICBpZiBudWxsIChkZWZhdWx0KSwgJCgnaHRtbCwgYm9keScpLmZpcnN0U2Nyb2xsYWJsZSgpIGlzIHVzZWQuXG4gICAgc2Nyb2xsRWxlbWVudDogbnVsbCxcblxuICAgIC8vIG9ubHkgdXNlIGlmIHlvdSB3YW50IHRvIG92ZXJyaWRlIGRlZmF1bHQgYmVoYXZpb3JcbiAgICBzY3JvbGxUYXJnZXQ6IG51bGwsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGZvY3VzIHRoZSB0YXJnZXQgZWxlbWVudCBhZnRlciBzY3JvbGxpbmcgdG8gaXRcbiAgICBhdXRvRm9jdXM6IGZhbHNlLFxuXG4gICAgLy8gZm4ob3B0cykgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGJlZm9yZSBzY3JvbGxpbmcgb2NjdXJzLlxuICAgIC8vIGB0aGlzYCBpcyB0aGUgZWxlbWVudChzKSBiZWluZyBzY3JvbGxlZFxuICAgIGJlZm9yZVNjcm9sbDogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8vIGZuKG9wdHMpIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZnRlciBzY3JvbGxpbmcgb2NjdXJzLlxuICAgIC8vIGB0aGlzYCBpcyB0aGUgdHJpZ2dlcmluZyBlbGVtZW50XG4gICAgYWZ0ZXJTY3JvbGw6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvLyBlYXNpbmcgbmFtZS4galF1ZXJ5IGNvbWVzIHdpdGggXCJzd2luZ1wiIGFuZCBcImxpbmVhci5cIiBGb3Igb3RoZXJzLCB5b3UnbGwgbmVlZCBhbiBlYXNpbmcgcGx1Z2luXG4gICAgLy8gZnJvbSBqUXVlcnkgVUkgb3IgZWxzZXdoZXJlXG4gICAgZWFzaW5nOiAnc3dpbmcnLFxuXG4gICAgLy8gc3BlZWQgY2FuIGJlIGEgbnVtYmVyIG9yICdhdXRvJ1xuICAgIC8vIGlmICdhdXRvJywgdGhlIHNwZWVkIHdpbGwgYmUgY2FsY3VsYXRlZCBiYXNlZCBvbiB0aGUgZm9ybXVsYTpcbiAgICAvLyAoY3VycmVudCBzY3JvbGwgcG9zaXRpb24gLSB0YXJnZXQgc2Nyb2xsIHBvc2l0aW9uKSAvIGF1dG9Db2VmZmljXG4gICAgc3BlZWQ6IDQwMCxcblxuICAgIC8vIGNvZWZmaWNpZW50IGZvciBcImF1dG9cIiBzcGVlZFxuICAgIGF1dG9Db2VmZmljaWVudDogMixcblxuICAgIC8vICQuZm4uc21vb3RoU2Nyb2xsIG9ubHk6IHdoZXRoZXIgdG8gcHJldmVudCB0aGUgZGVmYXVsdCBjbGljayBhY3Rpb25cbiAgICBwcmV2ZW50RGVmYXVsdDogdHJ1ZVxuICB9O1xuXG4gIHZhciBnZXRTY3JvbGxhYmxlID0gZnVuY3Rpb24ob3B0cykge1xuICAgIHZhciBzY3JvbGxhYmxlID0gW107XG4gICAgdmFyIHNjcm9sbGVkID0gZmFsc2U7XG4gICAgdmFyIGRpciA9IG9wdHMuZGlyICYmIG9wdHMuZGlyID09PSAnbGVmdCcgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJztcblxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbCA9ICQodGhpcyk7XG5cbiAgICAgIGlmICh0aGlzID09PSBkb2N1bWVudCB8fCB0aGlzID09PSB3aW5kb3cpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudCAmJiAodGhpcyA9PT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IHRoaXMgPT09IGRvY3VtZW50LmJvZHkpKSB7XG4gICAgICAgIHNjcm9sbGFibGUucHVzaChkb2N1bWVudC5zY3JvbGxpbmdFbGVtZW50KTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbFtkaXJdKCkgPiAwKSB7XG4gICAgICAgIHNjcm9sbGFibGUucHVzaCh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIHNjcm9sbChUb3B8TGVmdCkgPT09IDAsIG51ZGdlIHRoZSBlbGVtZW50IDFweCBhbmQgc2VlIGlmIGl0IG1vdmVzXG4gICAgICAgIGVsW2Rpcl0oMSk7XG4gICAgICAgIHNjcm9sbGVkID0gZWxbZGlyXSgpID4gMDtcblxuICAgICAgICBpZiAoc2Nyb2xsZWQpIHtcbiAgICAgICAgICBzY3JvbGxhYmxlLnB1c2godGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhlbiBwdXQgaXQgYmFjaywgb2YgY291cnNlXG4gICAgICAgIGVsW2Rpcl0oMCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIXNjcm9sbGFibGUubGVuZ3RoKSB7XG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIElmIG5vIHNjcm9sbGFibGUgZWxlbWVudHMgYW5kIDxodG1sPiBoYXMgc2Nyb2xsLWJlaGF2aW9yOnNtb290aCBiZWNhdXNlXG4gICAgICAgIC8vIFwiV2hlbiB0aGlzIHByb3BlcnR5IGlzIHNwZWNpZmllZCBvbiB0aGUgcm9vdCBlbGVtZW50LCBpdCBhcHBsaWVzIHRvIHRoZSB2aWV3cG9ydCBpbnN0ZWFkLlwiXG4gICAgICAgIC8vIGFuZCBcIlRoZSBzY3JvbGwtYmVoYXZpb3IgcHJvcGVydHkgb2YgdGhlIOKApiBib2R5IGVsZW1lbnQgaXMgKm5vdCogcHJvcGFnYXRlZCB0byB0aGUgdmlld3BvcnQuXCJcbiAgICAgICAgLy8g4oaSIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3NvbS12aWV3LyNwcm9wZGVmLXNjcm9sbC1iZWhhdmlvclxuICAgICAgICBpZiAodGhpcyA9PT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICQodGhpcykuY3NzKCdzY3JvbGxCZWhhdmlvcicpID09PSAnc21vb3RoJykge1xuICAgICAgICAgIHNjcm9sbGFibGUgPSBbdGhpc107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBzdGlsbCBubyBzY3JvbGxhYmxlIGVsZW1lbnRzLCBmYWxsIGJhY2sgdG8gPGJvZHk+LFxuICAgICAgICAvLyBpZiBpdCdzIGluIHRoZSBqUXVlcnkgY29sbGVjdGlvblxuICAgICAgICAvLyAoZG9pbmcgdGhpcyBiZWNhdXNlIFNhZmFyaSBzZXRzIHNjcm9sbFRvcCBhc3luYyxcbiAgICAgICAgLy8gc28gY2FuJ3Qgc2V0IGl0IHRvIDEgYW5kIGltbWVkaWF0ZWx5IGdldCB0aGUgdmFsdWUuKVxuICAgICAgICBpZiAoIXNjcm9sbGFibGUubGVuZ3RoICYmIHRoaXMubm9kZU5hbWUgPT09ICdCT0RZJykge1xuICAgICAgICAgIHNjcm9sbGFibGUgPSBbdGhpc107XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFVzZSB0aGUgZmlyc3Qgc2Nyb2xsYWJsZSBlbGVtZW50IGlmIHdlJ3JlIGNhbGxpbmcgZmlyc3RTY3JvbGxhYmxlKClcbiAgICBpZiAob3B0cy5lbCA9PT0gJ2ZpcnN0JyAmJiBzY3JvbGxhYmxlLmxlbmd0aCA+IDEpIHtcbiAgICAgIHNjcm9sbGFibGUgPSBbc2Nyb2xsYWJsZVswXV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNjcm9sbGFibGU7XG4gIH07XG5cbiAgdmFyIHJSZWxhdGl2ZSA9IC9eKFtcXC1cXCtdPSkoXFxkKykvO1xuXG4gICQuZm4uZXh0ZW5kKHtcbiAgICBzY3JvbGxhYmxlOiBmdW5jdGlvbihkaXIpIHtcbiAgICAgIHZhciBzY3JsID0gZ2V0U2Nyb2xsYWJsZS5jYWxsKHRoaXMsIHtkaXI6IGRpcn0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soc2NybCk7XG4gICAgfSxcbiAgICBmaXJzdFNjcm9sbGFibGU6IGZ1bmN0aW9uKGRpcikge1xuICAgICAgdmFyIHNjcmwgPSBnZXRTY3JvbGxhYmxlLmNhbGwodGhpcywge2VsOiAnZmlyc3QnLCBkaXI6IGRpcn0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soc2NybCk7XG4gICAgfSxcblxuICAgIHNtb290aFNjcm9sbDogZnVuY3Rpb24ob3B0aW9ucywgZXh0cmEpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICBpZiAob3B0aW9ucyA9PT0gJ29wdGlvbnMnKSB7XG4gICAgICAgIGlmICghZXh0cmEpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoJ3NzT3B0cycpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgIHZhciBvcHRzID0gJC5leHRlbmQoJHRoaXMuZGF0YSgnc3NPcHRzJykgfHwge30sIGV4dHJhKTtcblxuICAgICAgICAgICQodGhpcykuZGF0YSgnc3NPcHRzJywgb3B0cyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3B0cyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnNtb290aFNjcm9sbC5kZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAgIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZXNjYXBlU2VsZWN0b3IgPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyg6fFxcLnxcXC8pL2csICdcXFxcJDEnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbGluayA9IHRoaXM7XG4gICAgICAgIHZhciAkbGluayA9ICQodGhpcyk7XG4gICAgICAgIHZhciB0aGlzT3B0cyA9ICQuZXh0ZW5kKHt9LCBvcHRzLCAkbGluay5kYXRhKCdzc09wdHMnKSB8fCB7fSk7XG4gICAgICAgIHZhciBleGNsdWRlID0gb3B0cy5leGNsdWRlO1xuICAgICAgICB2YXIgZXhjbHVkZVdpdGhpbiA9IHRoaXNPcHRzLmV4Y2x1ZGVXaXRoaW47XG4gICAgICAgIHZhciBlbENvdW50ZXIgPSAwO1xuICAgICAgICB2YXIgZXdsQ291bnRlciA9IDA7XG4gICAgICAgIHZhciBpbmNsdWRlID0gdHJ1ZTtcbiAgICAgICAgdmFyIGNsaWNrT3B0cyA9IHt9O1xuICAgICAgICB2YXIgbG9jYXRpb25QYXRoID0gJC5zbW9vdGhTY3JvbGwuZmlsdGVyUGF0aChsb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgICAgIHZhciBsaW5rUGF0aCA9ICQuc21vb3RoU2Nyb2xsLmZpbHRlclBhdGgobGluay5wYXRobmFtZSk7XG4gICAgICAgIHZhciBob3N0TWF0Y2ggPSBsb2NhdGlvbi5ob3N0bmFtZSA9PT0gbGluay5ob3N0bmFtZSB8fCAhbGluay5ob3N0bmFtZTtcbiAgICAgICAgdmFyIHBhdGhNYXRjaCA9IHRoaXNPcHRzLnNjcm9sbFRhcmdldCB8fCAobGlua1BhdGggPT09IGxvY2F0aW9uUGF0aCk7XG4gICAgICAgIHZhciB0aGlzSGFzaCA9IGVzY2FwZVNlbGVjdG9yKGxpbmsuaGFzaCk7XG5cbiAgICAgICAgaWYgKHRoaXNIYXNoICYmICEkKHRoaXNIYXNoKS5sZW5ndGgpIHtcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXNPcHRzLnNjcm9sbFRhcmdldCAmJiAoIWhvc3RNYXRjaCB8fCAhcGF0aE1hdGNoIHx8ICF0aGlzSGFzaCkpIHtcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2hpbGUgKGluY2x1ZGUgJiYgZWxDb3VudGVyIDwgZXhjbHVkZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICgkbGluay5pcyhlc2NhcGVTZWxlY3RvcihleGNsdWRlW2VsQ291bnRlcisrXSkpKSB7XG4gICAgICAgICAgICAgIGluY2x1ZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3aGlsZSAoaW5jbHVkZSAmJiBld2xDb3VudGVyIDwgZXhjbHVkZVdpdGhpbi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICgkbGluay5jbG9zZXN0KGV4Y2x1ZGVXaXRoaW5bZXdsQ291bnRlcisrXSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGluY2x1ZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5jbHVkZSkge1xuICAgICAgICAgIGlmICh0aGlzT3B0cy5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkLmV4dGVuZChjbGlja09wdHMsIHRoaXNPcHRzLCB7XG4gICAgICAgICAgICBzY3JvbGxUYXJnZXQ6IHRoaXNPcHRzLnNjcm9sbFRhcmdldCB8fCB0aGlzSGFzaCxcbiAgICAgICAgICAgIGxpbms6IGxpbmtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgICQuc21vb3RoU2Nyb2xsKGNsaWNrT3B0cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChvcHRpb25zLmRlbGVnYXRlU2VsZWN0b3IgIT09IG51bGwpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAub2ZmKCdjbGljay5zbW9vdGhzY3JvbGwnLCBvcHRpb25zLmRlbGVnYXRlU2VsZWN0b3IpXG4gICAgICAgIC5vbignY2xpY2suc21vb3Roc2Nyb2xsJywgb3B0aW9ucy5kZWxlZ2F0ZVNlbGVjdG9yLCBjbGlja0hhbmRsZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAub2ZmKCdjbGljay5zbW9vdGhzY3JvbGwnKVxuICAgICAgICAub24oJ2NsaWNrLnNtb290aHNjcm9sbCcsIGNsaWNrSGFuZGxlcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGdldEV4cGxpY2l0T2Zmc2V0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIGV4cGxpY2l0ID0ge3JlbGF0aXZlOiAnJ307XG4gICAgdmFyIHBhcnRzID0gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiYgclJlbGF0aXZlLmV4ZWModmFsKTtcblxuICAgIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgICAgZXhwbGljaXQucHggPSB2YWw7XG4gICAgfSBlbHNlIGlmIChwYXJ0cykge1xuICAgICAgZXhwbGljaXQucmVsYXRpdmUgPSBwYXJ0c1sxXTtcbiAgICAgIGV4cGxpY2l0LnB4ID0gcGFyc2VGbG9hdChwYXJ0c1syXSkgfHwgMDtcbiAgICB9XG5cbiAgICByZXR1cm4gZXhwbGljaXQ7XG4gIH07XG5cbiAgdmFyIG9uQWZ0ZXJTY3JvbGwgPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgdmFyICR0Z3QgPSAkKG9wdHMuc2Nyb2xsVGFyZ2V0KTtcblxuICAgIGlmIChvcHRzLmF1dG9Gb2N1cyAmJiAkdGd0Lmxlbmd0aCkge1xuICAgICAgJHRndFswXS5mb2N1cygpO1xuXG4gICAgICBpZiAoISR0Z3QuaXMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgJHRndC5wcm9wKHt0YWJJbmRleDogLTF9KTtcbiAgICAgICAgJHRndFswXS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9wdHMuYWZ0ZXJTY3JvbGwuY2FsbChvcHRzLmxpbmssIG9wdHMpO1xuICB9O1xuXG4gICQuc21vb3RoU2Nyb2xsID0gZnVuY3Rpb24ob3B0aW9ucywgcHgpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gJ29wdGlvbnMnICYmIHR5cGVvZiBweCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiAkLmV4dGVuZChvcHRpb25PdmVycmlkZXMsIHB4KTtcbiAgICB9XG4gICAgdmFyIG9wdHMsICRzY3JvbGxlciwgc3BlZWQsIGRlbHRhO1xuICAgIHZhciBleHBsaWNpdE9mZnNldCA9IGdldEV4cGxpY2l0T2Zmc2V0KG9wdGlvbnMpO1xuICAgIHZhciBzY3JvbGxUYXJnZXRPZmZzZXQgPSB7fTtcbiAgICB2YXIgc2Nyb2xsZXJPZmZzZXQgPSAwO1xuICAgIHZhciBvZmZQb3MgPSAnb2Zmc2V0JztcbiAgICB2YXIgc2Nyb2xsRGlyID0gJ3Njcm9sbFRvcCc7XG4gICAgdmFyIGFuaVByb3BzID0ge307XG4gICAgdmFyIGFuaU9wdHMgPSB7fTtcblxuICAgIGlmIChleHBsaWNpdE9mZnNldC5weCkge1xuICAgICAgb3B0cyA9ICQuZXh0ZW5kKHtsaW5rOiBudWxsfSwgJC5mbi5zbW9vdGhTY3JvbGwuZGVmYXVsdHMsIG9wdGlvbk92ZXJyaWRlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdHMgPSAkLmV4dGVuZCh7bGluazogbnVsbH0sICQuZm4uc21vb3RoU2Nyb2xsLmRlZmF1bHRzLCBvcHRpb25zIHx8IHt9LCBvcHRpb25PdmVycmlkZXMpO1xuXG4gICAgICBpZiAob3B0cy5zY3JvbGxFbGVtZW50KSB7XG4gICAgICAgIG9mZlBvcyA9ICdwb3NpdGlvbic7XG5cbiAgICAgICAgaWYgKG9wdHMuc2Nyb2xsRWxlbWVudC5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgb3B0cy5zY3JvbGxFbGVtZW50LmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocHgpIHtcbiAgICAgICAgZXhwbGljaXRPZmZzZXQgPSBnZXRFeHBsaWNpdE9mZnNldChweCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2Nyb2xsRGlyID0gb3B0cy5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICdzY3JvbGxMZWZ0JyA6IHNjcm9sbERpcjtcblxuICAgIGlmIChvcHRzLnNjcm9sbEVsZW1lbnQpIHtcbiAgICAgICRzY3JvbGxlciA9IG9wdHMuc2Nyb2xsRWxlbWVudDtcblxuICAgICAgaWYgKCFleHBsaWNpdE9mZnNldC5weCAmJiAhKC9eKD86SFRNTHxCT0RZKSQvKS50ZXN0KCRzY3JvbGxlclswXS5ub2RlTmFtZSkpIHtcbiAgICAgICAgc2Nyb2xsZXJPZmZzZXQgPSAkc2Nyb2xsZXJbc2Nyb2xsRGlyXSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2Nyb2xsZXIgPSAkKCdodG1sLCBib2R5JykuZmlyc3RTY3JvbGxhYmxlKG9wdHMuZGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBiZWZvcmVTY3JvbGwgY2FsbGJhY2sgZnVuY3Rpb24gbXVzdCBmaXJlIGJlZm9yZSBjYWxjdWxhdGluZyBvZmZzZXRcbiAgICBvcHRzLmJlZm9yZVNjcm9sbC5jYWxsKCRzY3JvbGxlciwgb3B0cyk7XG5cbiAgICBzY3JvbGxUYXJnZXRPZmZzZXQgPSBleHBsaWNpdE9mZnNldC5weCA/IGV4cGxpY2l0T2Zmc2V0IDoge1xuICAgICAgcmVsYXRpdmU6ICcnLFxuICAgICAgcHg6ICgkKG9wdHMuc2Nyb2xsVGFyZ2V0KVtvZmZQb3NdKCkgJiYgJChvcHRzLnNjcm9sbFRhcmdldClbb2ZmUG9zXSgpW29wdHMuZGlyZWN0aW9uXSkgfHwgMFxuICAgIH07XG5cbiAgICBhbmlQcm9wc1tzY3JvbGxEaXJdID0gc2Nyb2xsVGFyZ2V0T2Zmc2V0LnJlbGF0aXZlICsgKHNjcm9sbFRhcmdldE9mZnNldC5weCArIHNjcm9sbGVyT2Zmc2V0ICsgb3B0cy5vZmZzZXQpO1xuXG4gICAgc3BlZWQgPSBvcHRzLnNwZWVkO1xuXG4gICAgLy8gYXV0b21hdGljYWxseSBjYWxjdWxhdGUgdGhlIHNwZWVkIG9mIHRoZSBzY3JvbGwgYmFzZWQgb24gZGlzdGFuY2UgLyBjb2VmZmljaWVudFxuICAgIGlmIChzcGVlZCA9PT0gJ2F1dG8nKSB7XG5cbiAgICAgIC8vICRzY3JvbGxlcltzY3JvbGxEaXJdKCkgaXMgcG9zaXRpb24gYmVmb3JlIHNjcm9sbCwgYW5pUHJvcHNbc2Nyb2xsRGlyXSBpcyBwb3NpdGlvbiBhZnRlclxuICAgICAgLy8gV2hlbiBkZWx0YSBpcyBncmVhdGVyLCBzcGVlZCB3aWxsIGJlIGdyZWF0ZXIuXG4gICAgICBkZWx0YSA9IE1hdGguYWJzKGFuaVByb3BzW3Njcm9sbERpcl0gLSAkc2Nyb2xsZXJbc2Nyb2xsRGlyXSgpKTtcblxuICAgICAgLy8gRGl2aWRlIHRoZSBkZWx0YSBieSB0aGUgY29lZmZpY2llbnRcbiAgICAgIHNwZWVkID0gZGVsdGEgLyBvcHRzLmF1dG9Db2VmZmljaWVudDtcbiAgICB9XG5cbiAgICBhbmlPcHRzID0ge1xuICAgICAgZHVyYXRpb246IHNwZWVkLFxuICAgICAgZWFzaW5nOiBvcHRzLmVhc2luZyxcbiAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgb25BZnRlclNjcm9sbChvcHRzKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG9wdHMuc3RlcCkge1xuICAgICAgYW5pT3B0cy5zdGVwID0gb3B0cy5zdGVwO1xuICAgIH1cblxuICAgIGlmICgkc2Nyb2xsZXIubGVuZ3RoKSB7XG4gICAgICAkc2Nyb2xsZXIuc3RvcCgpLmFuaW1hdGUoYW5pUHJvcHMsIGFuaU9wdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbkFmdGVyU2Nyb2xsKG9wdHMpO1xuICAgIH1cbiAgfTtcblxuICAkLnNtb290aFNjcm9sbC52ZXJzaW9uID0gdmVyc2lvbjtcbiAgJC5zbW9vdGhTY3JvbGwuZmlsdGVyUGF0aCA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHN0cmluZyA9IHN0cmluZyB8fCAnJztcblxuICAgIHJldHVybiBzdHJpbmdcbiAgICAgIC5yZXBsYWNlKC9eXFwvLywgJycpXG4gICAgICAucmVwbGFjZSgvKD86aW5kZXh8ZGVmYXVsdCkuW2EtekEtWl17Myw0fSQvLCAnJylcbiAgICAgIC5yZXBsYWNlKC9cXC8kLywgJycpO1xuICB9O1xuXG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICAkLmZuLnNtb290aFNjcm9sbC5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuXG59KSk7XG4iLCIvKiFcbldheXBvaW50cyAtIDQuMC4xXG5Db3B5cmlnaHQgwqkgMjAxMS0yMDE2IENhbGViIFRyb3VnaHRvblxuTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuaHR0cHM6Ly9naXRodWIuY29tL2ltYWtld2VidGhpbmdzL3dheXBvaW50cy9ibG9iL21hc3Rlci9saWNlbnNlcy50eHRcbiovXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciBrZXlDb3VudGVyID0gMFxuICB2YXIgYWxsV2F5cG9pbnRzID0ge31cblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvd2F5cG9pbnQgKi9cbiAgZnVuY3Rpb24gV2F5cG9pbnQob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBvcHRpb25zIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5lbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGVsZW1lbnQgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5oYW5kbGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGhhbmRsZXIgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvcicpXG4gICAgfVxuXG4gICAgdGhpcy5rZXkgPSAnd2F5cG9pbnQtJyArIGtleUNvdW50ZXJcbiAgICB0aGlzLm9wdGlvbnMgPSBXYXlwb2ludC5BZGFwdGVyLmV4dGVuZCh7fSwgV2F5cG9pbnQuZGVmYXVsdHMsIG9wdGlvbnMpXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy5vcHRpb25zLmVsZW1lbnRcbiAgICB0aGlzLmFkYXB0ZXIgPSBuZXcgV2F5cG9pbnQuQWRhcHRlcih0aGlzLmVsZW1lbnQpXG4gICAgdGhpcy5jYWxsYmFjayA9IG9wdGlvbnMuaGFuZGxlclxuICAgIHRoaXMuYXhpcyA9IHRoaXMub3B0aW9ucy5ob3Jpem9udGFsID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ1xuICAgIHRoaXMuZW5hYmxlZCA9IHRoaXMub3B0aW9ucy5lbmFibGVkXG4gICAgdGhpcy50cmlnZ2VyUG9pbnQgPSBudWxsXG4gICAgdGhpcy5ncm91cCA9IFdheXBvaW50Lkdyb3VwLmZpbmRPckNyZWF0ZSh7XG4gICAgICBuYW1lOiB0aGlzLm9wdGlvbnMuZ3JvdXAsXG4gICAgICBheGlzOiB0aGlzLmF4aXNcbiAgICB9KVxuICAgIHRoaXMuY29udGV4dCA9IFdheXBvaW50LkNvbnRleHQuZmluZE9yQ3JlYXRlQnlFbGVtZW50KHRoaXMub3B0aW9ucy5jb250ZXh0KVxuXG4gICAgaWYgKFdheXBvaW50Lm9mZnNldEFsaWFzZXNbdGhpcy5vcHRpb25zLm9mZnNldF0pIHtcbiAgICAgIHRoaXMub3B0aW9ucy5vZmZzZXQgPSBXYXlwb2ludC5vZmZzZXRBbGlhc2VzW3RoaXMub3B0aW9ucy5vZmZzZXRdXG4gICAgfVxuICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMpXG4gICAgdGhpcy5jb250ZXh0LmFkZCh0aGlzKVxuICAgIGFsbFdheXBvaW50c1t0aGlzLmtleV0gPSB0aGlzXG4gICAga2V5Q291bnRlciArPSAxXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5xdWV1ZVRyaWdnZXIgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgICB0aGlzLmdyb3VwLnF1ZXVlVHJpZ2dlcih0aGlzLCBkaXJlY3Rpb24pXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24oYXJncykge1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHRoaXMuY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuY2FsbGJhY2suYXBwbHkodGhpcywgYXJncylcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rlc3Ryb3kgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRleHQucmVtb3ZlKHRoaXMpXG4gICAgdGhpcy5ncm91cC5yZW1vdmUodGhpcylcbiAgICBkZWxldGUgYWxsV2F5cG9pbnRzW3RoaXMua2V5XVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kaXNhYmxlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2VcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9lbmFibGUgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGV4dC5yZWZyZXNoKClcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvbmV4dCAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdyb3VwLm5leHQodGhpcylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvcHJldmlvdXMgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLnByZXZpb3VzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXAucHJldmlvdXModGhpcylcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgV2F5cG9pbnQuaW52b2tlQWxsID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgdmFyIGFsbFdheXBvaW50c0FycmF5ID0gW11cbiAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiBhbGxXYXlwb2ludHMpIHtcbiAgICAgIGFsbFdheXBvaW50c0FycmF5LnB1c2goYWxsV2F5cG9pbnRzW3dheXBvaW50S2V5XSlcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGFsbFdheXBvaW50c0FycmF5Lmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBhbGxXYXlwb2ludHNBcnJheVtpXVttZXRob2RdKClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rlc3Ryb3ktYWxsICovXG4gIFdheXBvaW50LmRlc3Ryb3lBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5pbnZva2VBbGwoJ2Rlc3Ryb3knKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kaXNhYmxlLWFsbCAqL1xuICBXYXlwb2ludC5kaXNhYmxlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuaW52b2tlQWxsKCdkaXNhYmxlJylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZW5hYmxlLWFsbCAqL1xuICBXYXlwb2ludC5lbmFibGVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5Db250ZXh0LnJlZnJlc2hBbGwoKVxuICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIGFsbFdheXBvaW50cykge1xuICAgICAgYWxsV2F5cG9pbnRzW3dheXBvaW50S2V5XS5lbmFibGVkID0gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9yZWZyZXNoLWFsbCAqL1xuICBXYXlwb2ludC5yZWZyZXNoQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvdmlld3BvcnQtaGVpZ2h0ICovXG4gIFdheXBvaW50LnZpZXdwb3J0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3ZpZXdwb3J0LXdpZHRoICovXG4gIFdheXBvaW50LnZpZXdwb3J0V2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoXG4gIH1cblxuICBXYXlwb2ludC5hZGFwdGVycyA9IFtdXG5cbiAgV2F5cG9pbnQuZGVmYXVsdHMgPSB7XG4gICAgY29udGV4dDogd2luZG93LFxuICAgIGNvbnRpbnVvdXM6IHRydWUsXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBncm91cDogJ2RlZmF1bHQnLFxuICAgIGhvcml6b250YWw6IGZhbHNlLFxuICAgIG9mZnNldDogMFxuICB9XG5cbiAgV2F5cG9pbnQub2Zmc2V0QWxpYXNlcyA9IHtcbiAgICAnYm90dG9tLWluLXZpZXcnOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuaW5uZXJIZWlnaHQoKSAtIHRoaXMuYWRhcHRlci5vdXRlckhlaWdodCgpXG4gICAgfSxcbiAgICAncmlnaHQtaW4tdmlldyc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5pbm5lcldpZHRoKCkgLSB0aGlzLmFkYXB0ZXIub3V0ZXJXaWR0aCgpXG4gICAgfVxuICB9XG5cbiAgd2luZG93LldheXBvaW50ID0gV2F5cG9pbnRcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGZ1bmN0aW9uIHJlcXVlc3RBbmltYXRpb25GcmFtZVNoaW0oY2FsbGJhY2spIHtcbiAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKVxuICB9XG5cbiAgdmFyIGtleUNvdW50ZXIgPSAwXG4gIHZhciBjb250ZXh0cyA9IHt9XG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuICB2YXIgb2xkV2luZG93TG9hZCA9IHdpbmRvdy5vbmxvYWRcblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dCAqL1xuICBmdW5jdGlvbiBDb250ZXh0KGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG4gICAgdGhpcy5BZGFwdGVyID0gV2F5cG9pbnQuQWRhcHRlclxuICAgIHRoaXMuYWRhcHRlciA9IG5ldyB0aGlzLkFkYXB0ZXIoZWxlbWVudClcbiAgICB0aGlzLmtleSA9ICd3YXlwb2ludC1jb250ZXh0LScgKyBrZXlDb3VudGVyXG4gICAgdGhpcy5kaWRTY3JvbGwgPSBmYWxzZVxuICAgIHRoaXMuZGlkUmVzaXplID0gZmFsc2VcbiAgICB0aGlzLm9sZFNjcm9sbCA9IHtcbiAgICAgIHg6IHRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCksXG4gICAgICB5OiB0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKClcbiAgICB9XG4gICAgdGhpcy53YXlwb2ludHMgPSB7XG4gICAgICB2ZXJ0aWNhbDoge30sXG4gICAgICBob3Jpem9udGFsOiB7fVxuICAgIH1cblxuICAgIGVsZW1lbnQud2F5cG9pbnRDb250ZXh0S2V5ID0gdGhpcy5rZXlcbiAgICBjb250ZXh0c1tlbGVtZW50LndheXBvaW50Q29udGV4dEtleV0gPSB0aGlzXG4gICAga2V5Q291bnRlciArPSAxXG4gICAgaWYgKCFXYXlwb2ludC53aW5kb3dDb250ZXh0KSB7XG4gICAgICBXYXlwb2ludC53aW5kb3dDb250ZXh0ID0gdHJ1ZVxuICAgICAgV2F5cG9pbnQud2luZG93Q29udGV4dCA9IG5ldyBDb250ZXh0KHdpbmRvdylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXIoKVxuICAgIHRoaXMuY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlcigpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdmFyIGF4aXMgPSB3YXlwb2ludC5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy53YXlwb2ludHNbYXhpc11bd2F5cG9pbnQua2V5XSA9IHdheXBvaW50XG4gICAgdGhpcy5yZWZyZXNoKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuY2hlY2tFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBob3Jpem9udGFsRW1wdHkgPSB0aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy5ob3Jpem9udGFsKVxuICAgIHZhciB2ZXJ0aWNhbEVtcHR5ID0gdGhpcy5BZGFwdGVyLmlzRW1wdHlPYmplY3QodGhpcy53YXlwb2ludHMudmVydGljYWwpXG4gICAgdmFyIGlzV2luZG93ID0gdGhpcy5lbGVtZW50ID09IHRoaXMuZWxlbWVudC53aW5kb3dcbiAgICBpZiAoaG9yaXpvbnRhbEVtcHR5ICYmIHZlcnRpY2FsRW1wdHkgJiYgIWlzV2luZG93KSB7XG4gICAgICB0aGlzLmFkYXB0ZXIub2ZmKCcud2F5cG9pbnRzJylcbiAgICAgIGRlbGV0ZSBjb250ZXh0c1t0aGlzLmtleV1cbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgIGZ1bmN0aW9uIHJlc2l6ZUhhbmRsZXIoKSB7XG4gICAgICBzZWxmLmhhbmRsZVJlc2l6ZSgpXG4gICAgICBzZWxmLmRpZFJlc2l6ZSA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5hZGFwdGVyLm9uKCdyZXNpemUud2F5cG9pbnRzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXNlbGYuZGlkUmVzaXplKSB7XG4gICAgICAgIHNlbGYuZGlkUmVzaXplID0gdHJ1ZVxuICAgICAgICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVzaXplSGFuZGxlcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5jcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgZnVuY3Rpb24gc2Nyb2xsSGFuZGxlcigpIHtcbiAgICAgIHNlbGYuaGFuZGxlU2Nyb2xsKClcbiAgICAgIHNlbGYuZGlkU2Nyb2xsID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmFkYXB0ZXIub24oJ3Njcm9sbC53YXlwb2ludHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghc2VsZi5kaWRTY3JvbGwgfHwgV2F5cG9pbnQuaXNUb3VjaCkge1xuICAgICAgICBzZWxmLmRpZFNjcm9sbCA9IHRydWVcbiAgICAgICAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbEhhbmRsZXIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyaWdnZXJlZEdyb3VwcyA9IHt9XG4gICAgdmFyIGF4ZXMgPSB7XG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIG5ld1Njcm9sbDogdGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC54LFxuICAgICAgICBmb3J3YXJkOiAncmlnaHQnLFxuICAgICAgICBiYWNrd2FyZDogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgdmVydGljYWw6IHtcbiAgICAgICAgbmV3U2Nyb2xsOiB0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueSxcbiAgICAgICAgZm9yd2FyZDogJ2Rvd24nLFxuICAgICAgICBiYWNrd2FyZDogJ3VwJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGF4aXNLZXkgaW4gYXhlcykge1xuICAgICAgdmFyIGF4aXMgPSBheGVzW2F4aXNLZXldXG4gICAgICB2YXIgaXNGb3J3YXJkID0gYXhpcy5uZXdTY3JvbGwgPiBheGlzLm9sZFNjcm9sbFxuICAgICAgdmFyIGRpcmVjdGlvbiA9IGlzRm9yd2FyZCA/IGF4aXMuZm9yd2FyZCA6IGF4aXMuYmFja3dhcmRcblxuICAgICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gdGhpcy53YXlwb2ludHNbYXhpc0tleV0pIHtcbiAgICAgICAgdmFyIHdheXBvaW50ID0gdGhpcy53YXlwb2ludHNbYXhpc0tleV1bd2F5cG9pbnRLZXldXG4gICAgICAgIGlmICh3YXlwb2ludC50cmlnZ2VyUG9pbnQgPT09IG51bGwpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHZhciB3YXNCZWZvcmVUcmlnZ2VyUG9pbnQgPSBheGlzLm9sZFNjcm9sbCA8IHdheXBvaW50LnRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgbm93QWZ0ZXJUcmlnZ2VyUG9pbnQgPSBheGlzLm5ld1Njcm9sbCA+PSB3YXlwb2ludC50cmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIGNyb3NzZWRGb3J3YXJkID0gd2FzQmVmb3JlVHJpZ2dlclBvaW50ICYmIG5vd0FmdGVyVHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBjcm9zc2VkQmFja3dhcmQgPSAhd2FzQmVmb3JlVHJpZ2dlclBvaW50ICYmICFub3dBZnRlclRyaWdnZXJQb2ludFxuICAgICAgICBpZiAoY3Jvc3NlZEZvcndhcmQgfHwgY3Jvc3NlZEJhY2t3YXJkKSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGRpcmVjdGlvbilcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGdyb3VwS2V5IGluIHRyaWdnZXJlZEdyb3Vwcykge1xuICAgICAgdHJpZ2dlcmVkR3JvdXBzW2dyb3VwS2V5XS5mbHVzaFRyaWdnZXJzKClcbiAgICB9XG5cbiAgICB0aGlzLm9sZFNjcm9sbCA9IHtcbiAgICAgIHg6IGF4ZXMuaG9yaXpvbnRhbC5uZXdTY3JvbGwsXG4gICAgICB5OiBheGVzLnZlcnRpY2FsLm5ld1Njcm9sbFxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaW5uZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIGlmICh0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvdykge1xuICAgICAgcmV0dXJuIFdheXBvaW50LnZpZXdwb3J0SGVpZ2h0KClcbiAgICB9XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHJldHVybiB0aGlzLmFkYXB0ZXIuaW5uZXJIZWlnaHQoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIGRlbGV0ZSB0aGlzLndheXBvaW50c1t3YXlwb2ludC5heGlzXVt3YXlwb2ludC5rZXldXG4gICAgdGhpcy5jaGVja0VtcHR5KClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaW5uZXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgaWYgKHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93KSB7XG4gICAgICByZXR1cm4gV2F5cG9pbnQudmlld3BvcnRXaWR0aCgpXG4gICAgfVxuICAgIC8qZXNsaW50LWVuYWJsZSBlcWVxZXEgKi9cbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmlubmVyV2lkdGgoKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0LWRlc3Ryb3kgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbGxXYXlwb2ludHMgPSBbXVxuICAgIGZvciAodmFyIGF4aXMgaW4gdGhpcy53YXlwb2ludHMpIHtcbiAgICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIHRoaXMud2F5cG9pbnRzW2F4aXNdKSB7XG4gICAgICAgIGFsbFdheXBvaW50cy5wdXNoKHRoaXMud2F5cG9pbnRzW2F4aXNdW3dheXBvaW50S2V5XSlcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGFsbFdheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgYWxsV2F5cG9pbnRzW2ldLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dC1yZWZyZXNoICovXG4gIENvbnRleHQucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIHZhciBpc1dpbmRvdyA9IHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHZhciBjb250ZXh0T2Zmc2V0ID0gaXNXaW5kb3cgPyB1bmRlZmluZWQgOiB0aGlzLmFkYXB0ZXIub2Zmc2V0KClcbiAgICB2YXIgdHJpZ2dlcmVkR3JvdXBzID0ge31cbiAgICB2YXIgYXhlc1xuXG4gICAgdGhpcy5oYW5kbGVTY3JvbGwoKVxuICAgIGF4ZXMgPSB7XG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIGNvbnRleHRPZmZzZXQ6IGlzV2luZG93ID8gMCA6IGNvbnRleHRPZmZzZXQubGVmdCxcbiAgICAgICAgY29udGV4dFNjcm9sbDogaXNXaW5kb3cgPyAwIDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgY29udGV4dERpbWVuc2lvbjogdGhpcy5pbm5lcldpZHRoKCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgZm9yd2FyZDogJ3JpZ2h0JyxcbiAgICAgICAgYmFja3dhcmQ6ICdsZWZ0JyxcbiAgICAgICAgb2Zmc2V0UHJvcDogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgdmVydGljYWw6IHtcbiAgICAgICAgY29udGV4dE9mZnNldDogaXNXaW5kb3cgPyAwIDogY29udGV4dE9mZnNldC50b3AsXG4gICAgICAgIGNvbnRleHRTY3JvbGw6IGlzV2luZG93ID8gMCA6IHRoaXMub2xkU2Nyb2xsLnksXG4gICAgICAgIGNvbnRleHREaW1lbnNpb246IHRoaXMuaW5uZXJIZWlnaHQoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC55LFxuICAgICAgICBmb3J3YXJkOiAnZG93bicsXG4gICAgICAgIGJhY2t3YXJkOiAndXAnLFxuICAgICAgICBvZmZzZXRQcm9wOiAndG9wJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGF4aXNLZXkgaW4gYXhlcykge1xuICAgICAgdmFyIGF4aXMgPSBheGVzW2F4aXNLZXldXG4gICAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiB0aGlzLndheXBvaW50c1theGlzS2V5XSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB0aGlzLndheXBvaW50c1theGlzS2V5XVt3YXlwb2ludEtleV1cbiAgICAgICAgdmFyIGFkanVzdG1lbnQgPSB3YXlwb2ludC5vcHRpb25zLm9mZnNldFxuICAgICAgICB2YXIgb2xkVHJpZ2dlclBvaW50ID0gd2F5cG9pbnQudHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBlbGVtZW50T2Zmc2V0ID0gMFxuICAgICAgICB2YXIgZnJlc2hXYXlwb2ludCA9IG9sZFRyaWdnZXJQb2ludCA9PSBudWxsXG4gICAgICAgIHZhciBjb250ZXh0TW9kaWZpZXIsIHdhc0JlZm9yZVNjcm9sbCwgbm93QWZ0ZXJTY3JvbGxcbiAgICAgICAgdmFyIHRyaWdnZXJlZEJhY2t3YXJkLCB0cmlnZ2VyZWRGb3J3YXJkXG5cbiAgICAgICAgaWYgKHdheXBvaW50LmVsZW1lbnQgIT09IHdheXBvaW50LmVsZW1lbnQud2luZG93KSB7XG4gICAgICAgICAgZWxlbWVudE9mZnNldCA9IHdheXBvaW50LmFkYXB0ZXIub2Zmc2V0KClbYXhpcy5vZmZzZXRQcm9wXVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhZGp1c3RtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgYWRqdXN0bWVudCA9IGFkanVzdG1lbnQuYXBwbHkod2F5cG9pbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGFkanVzdG1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgYWRqdXN0bWVudCA9IHBhcnNlRmxvYXQoYWRqdXN0bWVudClcbiAgICAgICAgICBpZiAod2F5cG9pbnQub3B0aW9ucy5vZmZzZXQuaW5kZXhPZignJScpID4gLSAxKSB7XG4gICAgICAgICAgICBhZGp1c3RtZW50ID0gTWF0aC5jZWlsKGF4aXMuY29udGV4dERpbWVuc2lvbiAqIGFkanVzdG1lbnQgLyAxMDApXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dE1vZGlmaWVyID0gYXhpcy5jb250ZXh0U2Nyb2xsIC0gYXhpcy5jb250ZXh0T2Zmc2V0XG4gICAgICAgIHdheXBvaW50LnRyaWdnZXJQb2ludCA9IE1hdGguZmxvb3IoZWxlbWVudE9mZnNldCArIGNvbnRleHRNb2RpZmllciAtIGFkanVzdG1lbnQpXG4gICAgICAgIHdhc0JlZm9yZVNjcm9sbCA9IG9sZFRyaWdnZXJQb2ludCA8IGF4aXMub2xkU2Nyb2xsXG4gICAgICAgIG5vd0FmdGVyU2Nyb2xsID0gd2F5cG9pbnQudHJpZ2dlclBvaW50ID49IGF4aXMub2xkU2Nyb2xsXG4gICAgICAgIHRyaWdnZXJlZEJhY2t3YXJkID0gd2FzQmVmb3JlU2Nyb2xsICYmIG5vd0FmdGVyU2Nyb2xsXG4gICAgICAgIHRyaWdnZXJlZEZvcndhcmQgPSAhd2FzQmVmb3JlU2Nyb2xsICYmICFub3dBZnRlclNjcm9sbFxuXG4gICAgICAgIGlmICghZnJlc2hXYXlwb2ludCAmJiB0cmlnZ2VyZWRCYWNrd2FyZCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihheGlzLmJhY2t3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFmcmVzaFdheXBvaW50ICYmIHRyaWdnZXJlZEZvcndhcmQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoYXhpcy5mb3J3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZyZXNoV2F5cG9pbnQgJiYgYXhpcy5vbGRTY3JvbGwgPj0gd2F5cG9pbnQudHJpZ2dlclBvaW50KSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGF4aXMuZm9yd2FyZClcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGdyb3VwS2V5IGluIHRyaWdnZXJlZEdyb3Vwcykge1xuICAgICAgICB0cmlnZ2VyZWRHcm91cHNbZ3JvdXBLZXldLmZsdXNoVHJpZ2dlcnMoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LmZpbmRPckNyZWF0ZUJ5RWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gQ29udGV4dC5maW5kQnlFbGVtZW50KGVsZW1lbnQpIHx8IG5ldyBDb250ZXh0KGVsZW1lbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucmVmcmVzaEFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGNvbnRleHRJZCBpbiBjb250ZXh0cykge1xuICAgICAgY29udGV4dHNbY29udGV4dElkXS5yZWZyZXNoKClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQtZmluZC1ieS1lbGVtZW50ICovXG4gIENvbnRleHQuZmluZEJ5RWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gY29udGV4dHNbZWxlbWVudC53YXlwb2ludENvbnRleHRLZXldXG4gIH1cblxuICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKG9sZFdpbmRvd0xvYWQpIHtcbiAgICAgIG9sZFdpbmRvd0xvYWQoKVxuICAgIH1cbiAgICBDb250ZXh0LnJlZnJlc2hBbGwoKVxuICB9XG5cblxuICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciByZXF1ZXN0Rm4gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTaGltXG4gICAgcmVxdWVzdEZuLmNhbGwod2luZG93LCBjYWxsYmFjaylcbiAgfVxuICBXYXlwb2ludC5Db250ZXh0ID0gQ29udGV4dFxufSgpKVxuOyhmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZnVuY3Rpb24gYnlUcmlnZ2VyUG9pbnQoYSwgYikge1xuICAgIHJldHVybiBhLnRyaWdnZXJQb2ludCAtIGIudHJpZ2dlclBvaW50XG4gIH1cblxuICBmdW5jdGlvbiBieVJldmVyc2VUcmlnZ2VyUG9pbnQoYSwgYikge1xuICAgIHJldHVybiBiLnRyaWdnZXJQb2ludCAtIGEudHJpZ2dlclBvaW50XG4gIH1cblxuICB2YXIgZ3JvdXBzID0ge1xuICAgIHZlcnRpY2FsOiB7fSxcbiAgICBob3Jpem9udGFsOiB7fVxuICB9XG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9ncm91cCAqL1xuICBmdW5jdGlvbiBHcm91cChvcHRpb25zKSB7XG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lXG4gICAgdGhpcy5heGlzID0gb3B0aW9ucy5heGlzXG4gICAgdGhpcy5pZCA9IHRoaXMubmFtZSArICctJyArIHRoaXMuYXhpc1xuICAgIHRoaXMud2F5cG9pbnRzID0gW11cbiAgICB0aGlzLmNsZWFyVHJpZ2dlclF1ZXVlcygpXG4gICAgZ3JvdXBzW3RoaXMuYXhpc11bdGhpcy5uYW1lXSA9IHRoaXNcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdGhpcy53YXlwb2ludHMucHVzaCh3YXlwb2ludClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLmNsZWFyVHJpZ2dlclF1ZXVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudHJpZ2dlclF1ZXVlcyA9IHtcbiAgICAgIHVwOiBbXSxcbiAgICAgIGRvd246IFtdLFxuICAgICAgbGVmdDogW10sXG4gICAgICByaWdodDogW11cbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5mbHVzaFRyaWdnZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgZGlyZWN0aW9uIGluIHRoaXMudHJpZ2dlclF1ZXVlcykge1xuICAgICAgdmFyIHdheXBvaW50cyA9IHRoaXMudHJpZ2dlclF1ZXVlc1tkaXJlY3Rpb25dXG4gICAgICB2YXIgcmV2ZXJzZSA9IGRpcmVjdGlvbiA9PT0gJ3VwJyB8fCBkaXJlY3Rpb24gPT09ICdsZWZ0J1xuICAgICAgd2F5cG9pbnRzLnNvcnQocmV2ZXJzZSA/IGJ5UmV2ZXJzZVRyaWdnZXJQb2ludCA6IGJ5VHJpZ2dlclBvaW50KVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHdheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkgKz0gMSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB3YXlwb2ludHNbaV1cbiAgICAgICAgaWYgKHdheXBvaW50Lm9wdGlvbnMuY29udGludW91cyB8fCBpID09PSB3YXlwb2ludHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHdheXBvaW50LnRyaWdnZXIoW2RpcmVjdGlvbl0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jbGVhclRyaWdnZXJRdWV1ZXMoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdGhpcy53YXlwb2ludHMuc29ydChieVRyaWdnZXJQb2ludClcbiAgICB2YXIgaW5kZXggPSBXYXlwb2ludC5BZGFwdGVyLmluQXJyYXkod2F5cG9pbnQsIHRoaXMud2F5cG9pbnRzKVxuICAgIHZhciBpc0xhc3QgPSBpbmRleCA9PT0gdGhpcy53YXlwb2ludHMubGVuZ3RoIC0gMVxuICAgIHJldHVybiBpc0xhc3QgPyBudWxsIDogdGhpcy53YXlwb2ludHNbaW5kZXggKyAxXVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHRoaXMud2F5cG9pbnRzLnNvcnQoYnlUcmlnZ2VyUG9pbnQpXG4gICAgdmFyIGluZGV4ID0gV2F5cG9pbnQuQWRhcHRlci5pbkFycmF5KHdheXBvaW50LCB0aGlzLndheXBvaW50cylcbiAgICByZXR1cm4gaW5kZXggPyB0aGlzLndheXBvaW50c1tpbmRleCAtIDFdIDogbnVsbFxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucXVldWVUcmlnZ2VyID0gZnVuY3Rpb24od2F5cG9pbnQsIGRpcmVjdGlvbikge1xuICAgIHRoaXMudHJpZ2dlclF1ZXVlc1tkaXJlY3Rpb25dLnB1c2god2F5cG9pbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHZhciBpbmRleCA9IFdheXBvaW50LkFkYXB0ZXIuaW5BcnJheSh3YXlwb2ludCwgdGhpcy53YXlwb2ludHMpXG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMud2F5cG9pbnRzLnNwbGljZShpbmRleCwgMSlcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2ZpcnN0ICovXG4gIEdyb3VwLnByb3RvdHlwZS5maXJzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLndheXBvaW50c1swXVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9sYXN0ICovXG4gIEdyb3VwLnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMud2F5cG9pbnRzW3RoaXMud2F5cG9pbnRzLmxlbmd0aCAtIDFdXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLmZpbmRPckNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gZ3JvdXBzW29wdGlvbnMuYXhpc11bb3B0aW9ucy5uYW1lXSB8fCBuZXcgR3JvdXAob3B0aW9ucylcbiAgfVxuXG4gIFdheXBvaW50Lkdyb3VwID0gR3JvdXBcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciAkID0gd2luZG93LmpRdWVyeVxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICBmdW5jdGlvbiBKUXVlcnlBZGFwdGVyKGVsZW1lbnQpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KVxuICB9XG5cbiAgJC5lYWNoKFtcbiAgICAnaW5uZXJIZWlnaHQnLFxuICAgICdpbm5lcldpZHRoJyxcbiAgICAnb2ZmJyxcbiAgICAnb2Zmc2V0JyxcbiAgICAnb24nLFxuICAgICdvdXRlckhlaWdodCcsXG4gICAgJ291dGVyV2lkdGgnLFxuICAgICdzY3JvbGxMZWZ0JyxcbiAgICAnc2Nyb2xsVG9wJ1xuICBdLCBmdW5jdGlvbihpLCBtZXRob2QpIHtcbiAgICBKUXVlcnlBZGFwdGVyLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgIHJldHVybiB0aGlzLiRlbGVtZW50W21ldGhvZF0uYXBwbHkodGhpcy4kZWxlbWVudCwgYXJncylcbiAgICB9XG4gIH0pXG5cbiAgJC5lYWNoKFtcbiAgICAnZXh0ZW5kJyxcbiAgICAnaW5BcnJheScsXG4gICAgJ2lzRW1wdHlPYmplY3QnXG4gIF0sIGZ1bmN0aW9uKGksIG1ldGhvZCkge1xuICAgIEpRdWVyeUFkYXB0ZXJbbWV0aG9kXSA9ICRbbWV0aG9kXVxuICB9KVxuXG4gIFdheXBvaW50LmFkYXB0ZXJzLnB1c2goe1xuICAgIG5hbWU6ICdqcXVlcnknLFxuICAgIEFkYXB0ZXI6IEpRdWVyeUFkYXB0ZXJcbiAgfSlcbiAgV2F5cG9pbnQuQWRhcHRlciA9IEpRdWVyeUFkYXB0ZXJcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUV4dGVuc2lvbihmcmFtZXdvcmspIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgd2F5cG9pbnRzID0gW11cbiAgICAgIHZhciBvdmVycmlkZXMgPSBhcmd1bWVudHNbMF1cblxuICAgICAgaWYgKGZyYW1ld29yay5pc0Z1bmN0aW9uKGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3ZlcnJpZGVzID0gZnJhbWV3b3JrLmV4dGVuZCh7fSwgYXJndW1lbnRzWzFdKVxuICAgICAgICBvdmVycmlkZXMuaGFuZGxlciA9IGFyZ3VtZW50c1swXVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gZnJhbWV3b3JrLmV4dGVuZCh7fSwgb3ZlcnJpZGVzLCB7XG4gICAgICAgICAgZWxlbWVudDogdGhpc1xuICAgICAgICB9KVxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuY29udGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBvcHRpb25zLmNvbnRleHQgPSBmcmFtZXdvcmsodGhpcykuY2xvc2VzdChvcHRpb25zLmNvbnRleHQpWzBdXG4gICAgICAgIH1cbiAgICAgICAgd2F5cG9pbnRzLnB1c2gobmV3IFdheXBvaW50KG9wdGlvbnMpKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHdheXBvaW50c1xuICAgIH1cbiAgfVxuXG4gIGlmICh3aW5kb3cualF1ZXJ5KSB7XG4gICAgd2luZG93LmpRdWVyeS5mbi53YXlwb2ludCA9IGNyZWF0ZUV4dGVuc2lvbih3aW5kb3cualF1ZXJ5KVxuICB9XG4gIGlmICh3aW5kb3cuWmVwdG8pIHtcbiAgICB3aW5kb3cuWmVwdG8uZm4ud2F5cG9pbnQgPSBjcmVhdGVFeHRlbnNpb24od2luZG93LlplcHRvKVxuICB9XG59KCkpXG47IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG4gICAgJChcIi5sYXp5XCIpLnJlY2xpbmVyKHtcbiAgICAgICAgYXR0cmliOiBcImRhdGEtc3JjXCIsIC8vIHNlbGVjdG9yIGZvciBhdHRyaWJ1dGUgY29udGFpbmluZyB0aGUgbWVkaWEgc3JjXG4gICAgICAgIHRocm90dGxlOiAzMDAsICAgICAgLy8gbWlsbGlzZWNvbmQgaW50ZXJ2YWwgYXQgd2hpY2ggdG8gcHJvY2VzcyBldmVudHNcbiAgICAgICAgdGhyZXNob2xkOiAxMDAsICAgICAvLyBzY3JvbGwgZGlzdGFuY2UgZnJvbSBlbGVtZW50IGJlZm9yZSBpdHMgbG9hZGVkXG4gICAgICAgIHByaW50YWJsZTogdHJ1ZSwgICAgLy8gYmUgcHJpbnRlciBmcmllbmRseSBhbmQgc2hvdyBhbGwgZWxlbWVudHMgb24gZG9jdW1lbnQgcHJpbnRcbiAgICAgICAgbGl2ZTogdHJ1ZSAgICAgICAgICAvLyBhdXRvIGJpbmQgbGF6eSBsb2FkaW5nIHRvIGFqYXggbG9hZGVkIGVsZW1lbnRzXG4gICAgfSk7XG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2xhenlsb2FkJywgJy5sYXp5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZSA9ICQodGhpcyk7XG4gICAgICAgIC8vIGRvIHNvbWV0aGluZyB3aXRoIHRoZSBlbGVtZW50IHRvIGJlIGxvYWRlZC4uLlxuICAgICAgICAvLyBjb25zb2xlLmxvZygnbGF6eWxvYWQnLCAkZSk7XG4gICAgfSk7XG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cblxuICAgIGxldCAkc2VjdGlvbl92aWRlb3MgPSAkKCcuc2VjdGlvbi12aWRlb3MnKTtcbiAgICBpZiAoICQoJy5zbGljaycsICRzZWN0aW9uX3ZpZGVvcykubGVuZ3RoICkge1xuXG4gICAgICAgICQoICc8ZGl2IGNsYXNzPVwic2xpY2stYXJyb3dzXCI+PC9kaXY+JyApLmluc2VydEFmdGVyKCAnLnNlY3Rpb24tdmlkZW9zIC5zbGljaycgKTtcblxuICAgICAgICAkKCcuc2VjdGlvbi12aWRlb3MnKS5pbWFnZXNMb2FkZWQoIHtiYWNrZ3JvdW5kOiAnLmJhY2tncm91bmQnfSlcblxuICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuXG4gICAgICAgICAgICAkKCcuc2VjdGlvbi12aWRlb3MgLnNsaWNrJykuc2xpY2soe1xuICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMixcbiAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDIsXG4gICAgICAgICAgICAgIGFwcGVuZEFycm93czogJCgnLnNlY3Rpb24tdmlkZW9zIC5zbGljay1hcnJvd3MnKSxcbiAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IDk3OSxcbiAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDFcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkc2VjdGlvbl92aWRlb3MuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcblxuICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbGV0ICRzZWN0aW9uX3N0b3JpZXMgPSAkKCcuc2VjdGlvbi1zdG9yaWVzJyk7XG4gICAgaWYgKCAkKCcuc2xpY2snLCAkc2VjdGlvbl9zdG9yaWVzKS5sZW5ndGggKSB7XG5cbiAgICAgICAgJCgnLnNlY3Rpb24tc3RvcmllcycpLmltYWdlc0xvYWRlZCh7YmFja2dyb3VuZDogJ2EnfSlcblxuICAgICAgICAuZG9uZSggZnVuY3Rpb24oIGluc3RhbmNlICkge1xuXG4gICAgICAgICAgICAkKCAnPGRpdiBjbGFzcz1cInNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLXN0b3JpZXMgLnNsaWNrJyApO1xuXG4gICAgICAgICAgICAkKCcuc2VjdGlvbi1zdG9yaWVzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zZWN0aW9uLXN0b3JpZXMgLnNsaWNrLWFycm93cycpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHNlY3Rpb25fc3Rvcmllcy5hZGRDbGFzcygnaW1hZ2VzLWxvYWRlZCcpO1xuXG4gICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIGxldCAkc2luZ2xlUG9zdFNsaWRlciA9ICQoJy5zaW5nbGUtcG9zdCAuc2xpZGVyJyk7XG4gICAgaWYgKCAkKCcuc2xpY2snLCAkc2luZ2xlUG9zdFNsaWRlcikubGVuZ3RoICkge1xuXG4gICAgICAgICRzaW5nbGVQb3N0U2xpZGVyLmltYWdlc0xvYWRlZCh7YmFja2dyb3VuZDogdHJ1ZX0pXG5cbiAgICAgICAgLmRvbmUoIGZ1bmN0aW9uKCBpbnN0YW5jZSApIHtcblxuICAgICAgICAgICAgJCgnLnNsaWNrJywgJHNpbmdsZVBvc3RTbGlkZXIpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICBhZGFwdGl2ZUhlaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgYXBwZW5kQXJyb3dzOiAkKCcuc2xpY2stYXJyb3dzJywgJHNpbmdsZVBvc3RTbGlkZXIpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHNpbmdsZVBvc3RTbGlkZXIuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcblxuICAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAkKCAnPGRpdiBjbGFzcz1cInNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLWNvcmUtYmVoYXZpb3JzIC5zbGljaycgKTtcblxuICAgICQoJy5zZWN0aW9uLWNvcmUtYmVoYXZpb3JzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgZmFkZTogdHJ1ZSxcbiAgICAgICAgZG90czogdHJ1ZSxcbiAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgIGFkYXB0aXZlSGVpZ2h0OiBmYWxzZSxcbiAgICAgICAgYXBwZW5kQXJyb3dzOiAkKCcuc2VjdGlvbi1jb3JlLWJlaGF2aW9ycyAuc2xpY2stYXJyb3dzJylcbiAgICB9KTtcblxuICAgICQoJy5zZWN0aW9uLWNvcmUtYmVoYXZpb3JzIC5ncmlkJykub24oJ2NsaWNrJywnLmdyaWQtaXRlbScsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBzbGlkZUluZGV4ID0gJCh0aGlzKS5wYXJlbnQoKS5pbmRleCgpO1xuICAgICAgICAkKCAnLnNlY3Rpb24tY29yZS1iZWhhdmlvcnMgLnNsaWNrJyApLnNsaWNrKCAnc2xpY2tHb1RvJywgcGFyc2VJbnQoc2xpZGVJbmRleCkgKTtcbiAgICB9KTtcblxuXG4gICAgLy8gUmVsYXRlZCBQb3N0c1xuXG5sZXQgJHNlY3Rpb25fcmVsYXRlZF9wb3N0cyA9ICQoJy5zZWN0aW9uLXJlbGF0ZWQtcG9zdHMnKTtcbiAgICBpZiAoICQoJy5zbGljaycsICRzZWN0aW9uX3JlbGF0ZWRfcG9zdHMpLmxlbmd0aCApIHtcblxuICAgICAgICAvLyQoICc8ZGl2IGNsYXNzPVwic2xpY2stYXJyb3dzXCI+PC9kaXY+JyApLmluc2VydEFmdGVyKCAnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cyAuc2xpY2snICk7XG5cbiAgICAgICAgJCgnLnNlY3Rpb24tcmVsYXRlZC1wb3N0cycpLmltYWdlc0xvYWRlZCgge2JhY2tncm91bmQ6ICcucG9zdC1oZXJvJ30pXG5cbiAgICAgICAgLmRvbmUoIGZ1bmN0aW9uKCBpbnN0YW5jZSApIHtcblxuICAgICAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJjb2x1bW4gcm93IHNsaWNrLWFycm93c1wiPjwvZGl2PicgKS5pbnNlcnRBZnRlciggJy5zZWN0aW9uLXJlbGF0ZWQtcG9zdHMgLnNsaWNrJyApO1xuXG4gICAgICAgICAgICAkKCcuc2VjdGlvbi1yZWxhdGVkLXBvc3RzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDQsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoJy5zZWN0aW9uLXJlbGF0ZWQtcG9zdHMgLnNsaWNrLWFycm93cycpLFxuICAgICAgICAgICAgICByZXNwb25zaXZlOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogMTIwMCxcbiAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBicmVha3BvaW50OiA5ODAsXG4gICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDIsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBicmVha3BvaW50OiA0ODAsXG4gICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFlvdSBjYW4gdW5zbGljayBhdCBhIGdpdmVuIGJyZWFrcG9pbnQgbm93IGJ5IGFkZGluZzpcbiAgICAgICAgICAgICAgICAvLyBzZXR0aW5nczogXCJ1bnNsaWNrXCJcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIG9mIGEgc2V0dGluZ3Mgb2JqZWN0XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkc2VjdGlvbl9yZWxhdGVkX3Bvc3RzLmFkZENsYXNzKCdpbWFnZXMtbG9hZGVkJyk7XG5cbiAgICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgbGV0ICRzZWN0aW9uX3Rlc3RpbW9uaWFscyA9ICQoJy5zZWN0aW9uLXRlc3RpbW9uaWFscycpO1xuICAgIGlmICggJCgnLnNsaWNrJywgJHNlY3Rpb25fdGVzdGltb25pYWxzKS5sZW5ndGggKSB7XG5cbiAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi10ZXN0aW1vbmlhbHMgLnNsaWNrJyApO1xuXG4gICAgICAgICQoJy5zZWN0aW9uLXRlc3RpbW9uaWFscycpLmltYWdlc0xvYWRlZCgpXG5cbiAgICAgICAgLmRvbmUoIGZ1bmN0aW9uKCBpbnN0YW5jZSApIHtcblxuICAgICAgICAgICAgJCggJzxkaXYgY2xhc3M9XCJzbGljay1hcnJvd3NcIj48L2Rpdj4nICkuaW5zZXJ0QWZ0ZXIoICcuc2VjdGlvbi10ZXN0aW1vbmlhbHMgLnNsaWNrJyApO1xuICAgICAgICAgICAgJCgnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICAgIGFwcGVuZEFycm93czogJCgnLnNlY3Rpb24tdGVzdGltb25pYWxzIC5zbGljay1hcnJvd3MnKSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkc2VjdGlvbl90ZXN0aW1vbmlhbHMuYWRkQ2xhc3MoJ2ltYWdlcy1sb2FkZWQnKTtcblxuICAgICAgICAgfSk7XG4gICAgfVxuXG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0JChcIi5qcy1zdXBlcmZpc2hcIikuc3VwZXJmaXNoKHtcbiAgICAgICAgZGVsYXk6MTAwLFxuICAgICAgICAvL2FuaW1hdGlvbjp7b3BhY2l0eTpcInNob3dcIixoZWlnaHQ6XCJzaG93XCJ9LFxuICAgICAgICBkcm9wU2hhZG93czohMVxuICAgIH0pO1xuICAgIFxuICAgIFxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiLyohXG5XYXlwb2ludHMgSW52aWV3IFNob3J0Y3V0IC0gNC4wLjFcbkNvcHlyaWdodCDCqSAyMDExLTIwMTYgQ2FsZWIgVHJvdWdodG9uXG5MaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5odHRwczovL2dpdGh1Yi5jb20vaW1ha2V3ZWJ0aGluZ3Mvd2F5cG9pbnRzL2Jsb2IvbWFzdGVyL2xpY2Vuc2VzLnR4dFxuKi9cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZnVuY3Rpb24gbm9vcCgpIHt9XG5cbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvc2hvcnRjdXRzL2ludmlldyAqL1xuICBmdW5jdGlvbiBJbnZpZXcob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IFdheXBvaW50LkFkYXB0ZXIuZXh0ZW5kKHt9LCBJbnZpZXcuZGVmYXVsdHMsIG9wdGlvbnMpXG4gICAgdGhpcy5heGlzID0gdGhpcy5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy53YXlwb2ludHMgPSBbXVxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMub3B0aW9ucy5lbGVtZW50XG4gICAgdGhpcy5jcmVhdGVXYXlwb2ludHMoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBJbnZpZXcucHJvdG90eXBlLmNyZWF0ZVdheXBvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb25maWdzID0ge1xuICAgICAgdmVydGljYWw6IFt7XG4gICAgICAgIGRvd246ICdlbnRlcicsXG4gICAgICAgIHVwOiAnZXhpdGVkJyxcbiAgICAgICAgb2Zmc2V0OiAnMTAwJSdcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2VudGVyZWQnLFxuICAgICAgICB1cDogJ2V4aXQnLFxuICAgICAgICBvZmZzZXQ6ICdib3R0b20taW4tdmlldydcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2V4aXQnLFxuICAgICAgICB1cDogJ2VudGVyZWQnLFxuICAgICAgICBvZmZzZXQ6IDBcbiAgICAgIH0sIHtcbiAgICAgICAgZG93bjogJ2V4aXRlZCcsXG4gICAgICAgIHVwOiAnZW50ZXInLFxuICAgICAgICBvZmZzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAtdGhpcy5hZGFwdGVyLm91dGVySGVpZ2h0KClcbiAgICAgICAgfVxuICAgICAgfV0sXG4gICAgICBob3Jpem9udGFsOiBbe1xuICAgICAgICByaWdodDogJ2VudGVyJyxcbiAgICAgICAgbGVmdDogJ2V4aXRlZCcsXG4gICAgICAgIG9mZnNldDogJzEwMCUnXG4gICAgICB9LCB7XG4gICAgICAgIHJpZ2h0OiAnZW50ZXJlZCcsXG4gICAgICAgIGxlZnQ6ICdleGl0JyxcbiAgICAgICAgb2Zmc2V0OiAncmlnaHQtaW4tdmlldydcbiAgICAgIH0sIHtcbiAgICAgICAgcmlnaHQ6ICdleGl0JyxcbiAgICAgICAgbGVmdDogJ2VudGVyZWQnLFxuICAgICAgICBvZmZzZXQ6IDBcbiAgICAgIH0sIHtcbiAgICAgICAgcmlnaHQ6ICdleGl0ZWQnLFxuICAgICAgICBsZWZ0OiAnZW50ZXInLFxuICAgICAgICBvZmZzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAtdGhpcy5hZGFwdGVyLm91dGVyV2lkdGgoKVxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBjb25maWdzW3RoaXMuYXhpc10ubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHZhciBjb25maWcgPSBjb25maWdzW3RoaXMuYXhpc11baV1cbiAgICAgIHRoaXMuY3JlYXRlV2F5cG9pbnQoY29uZmlnKVxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgSW52aWV3LnByb3RvdHlwZS5jcmVhdGVXYXlwb2ludCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIHRoaXMud2F5cG9pbnRzLnB1c2gobmV3IFdheXBvaW50KHtcbiAgICAgIGNvbnRleHQ6IHRoaXMub3B0aW9ucy5jb250ZXh0LFxuICAgICAgZWxlbWVudDogdGhpcy5vcHRpb25zLmVsZW1lbnQsXG4gICAgICBlbmFibGVkOiB0aGlzLm9wdGlvbnMuZW5hYmxlZCxcbiAgICAgIGhhbmRsZXI6IChmdW5jdGlvbihjb25maWcpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgICAgIHNlbGYub3B0aW9uc1tjb25maWdbZGlyZWN0aW9uXV0uY2FsbChzZWxmLCBkaXJlY3Rpb24pXG4gICAgICAgIH1cbiAgICAgIH0oY29uZmlnKSksXG4gICAgICBvZmZzZXQ6IGNvbmZpZy5vZmZzZXQsXG4gICAgICBob3Jpem9udGFsOiB0aGlzLm9wdGlvbnMuaG9yaXpvbnRhbFxuICAgIH0pKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIEludmlldy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLndheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpcy53YXlwb2ludHNbaV0uZGVzdHJveSgpXG4gICAgfVxuICAgIHRoaXMud2F5cG9pbnRzID0gW11cbiAgfVxuXG4gIEludmlldy5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLndheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpcy53YXlwb2ludHNbaV0uZGlzYWJsZSgpXG4gICAgfVxuICB9XG5cbiAgSW52aWV3LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy53YXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXMud2F5cG9pbnRzW2ldLmVuYWJsZSgpXG4gICAgfVxuICB9XG5cbiAgSW52aWV3LmRlZmF1bHRzID0ge1xuICAgIGNvbnRleHQ6IHdpbmRvdyxcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGVudGVyOiBub29wLFxuICAgIGVudGVyZWQ6IG5vb3AsXG4gICAgZXhpdDogbm9vcCxcbiAgICBleGl0ZWQ6IG5vb3BcbiAgfVxuXG4gIFdheXBvaW50LkludmlldyA9IEludmlld1xufSgpKVxuOyIsIihmdW5jdGlvbigkKSB7XG5cdFxuXHQndXNlIHN0cmljdCc7XHRcblx0XG5cdHZhciAkbGVnZW5kID0gJCggJy5zZWN0aW9uLWJ1c2luZXNzLWxpbmVzLW1hcCAubGVnZW5kJyApO1xuICAgIFxuICAgIHZhciAkbWFwcyA9ICQoICcuc2VjdGlvbi1idXNpbmVzcy1saW5lcy1tYXAgLm1hcHMnICk7XG4gICAgXG4gICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRtYXBzLmFuaW1hdGUoeydvcGFjaXR5JzonMSd9LDUwMCk7XG4gICAgfSk7XG4gICAgICAgIFxuICAgIC8vY2xvc2UgY2FyZCB3aGVuIGNsaWNrIG9uIGNyb3NzXG4gICAgJGxlZ2VuZC5vbignaG92ZXInLCdidXR0b24nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIGlmKCQoJ2JvZHknKS5oYXNDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcCcpO1xuICAgICAgICBpZigkKGlkKS5jc3MoJ29wYWNpdHknKSA9PSAwKSB7XG4gICAgICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5ub3QoaWQpLmFuaW1hdGUoeydvcGFjaXR5JzonMCd9LDEwMCk7XG4gICAgICAgICAgICAkKGlkKS5zdG9wKCkuYW5pbWF0ZSh7J29wYWNpdHknOicxJ30sMTAwKTtcbiAgICAgICAgfVxuICAgICBcbiAgICB9KTtcbiAgICBcbiAgICAkbGVnZW5kLm9uKCdjbGljaycsJ2J1dHRvbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ21hcCcpO1xuICAgICAgICBpZigkKGlkKS5jc3MoJ29wYWNpdHknKSA9PSAwKSB7XG4gICAgICAgICAgICAkKCcubWFwJykuc3RvcCgpLm5vdChpZCkuY3NzKHsnb3BhY2l0eSc6JzAnfSk7XG4gICAgICAgICAgICAkKGlkKS5zdG9wKCkuY3NzKHsnb3BhY2l0eSc6JzEnfSk7ICAgICAgICAgICAgXG4gICAgICAgIH0gXG4gICAgICAgIFxuICAgICAgICAkKGlkKS5hZGRDbGFzcygnYWN0aXZlJyk7ICAgXG4gICAgIFxuICAgIH0pO1xuICAgIFxuICAgICRsZWdlbmQubW91c2VsZWF2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIGlmKCQoJ2JvZHknKS5oYXNDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkKCcubWFwJykuc3RvcCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5hbmltYXRlKHsnb3BhY2l0eSc6JzAnfSwxMDApO1xuICAgICAgICAkKCcjbWFwLTAnKS5zdG9wKCkuYW5pbWF0ZSh7J29wYWNpdHknOicxJ30sMTAwKTtcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBpZigkKCcucGFnZS10ZW1wbGF0ZS1jYXJlZXJzJykubGVuZ3RoKSB7XG4gICAgICAgIHZhciBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuICAgICAgICBpZihzZWFyY2hQYXJhbXMuaGFzKCdzZWFyY2gnKSkge1xuICAgICAgICAgICAgdmFyIHBhcmFtID0gc2VhcmNoUGFyYW1zLmdldCgnc2VhcmNoJyk7XG4gICAgICAgICAgICBpZihwYXJhbSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkKCcjY2FyZWVycy1yb290Jykub2Zmc2V0KCkudG9wIC0zNSB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgICAkKFwibWFpbiBzZWN0aW9uOm5vdCgnLmNhcmVlcnMtc2VjdGlvbicpXCIpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB3aW5kb3cucmVhY3RNYXRjaEhlaWdodCA9IGZ1bmN0aW9uKGVsQ2xhc3NOYW1lKSB7XG4gICAgICAgICAgJCgnLmNhcmVlcnMtc2VjdGlvbiAuY29sdW1uIGgzJykubWF0Y2hIZWlnaHQoeyByb3c6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIE9wZW4gZXh0ZXJuYWwgbGlua3MgaW4gbmV3IHdpbmRvdyAoZXhjbHVlIHNjdiBpbWFnZSBtYXBzLCBlbWFpbCwgdGVsIGFuZCBmb29ib3gpXG5cblx0JCgnYScpLm5vdCgnc3ZnIGEsIFtocmVmKj1cInRlbDpcIl0sIFtjbGFzcyo9XCJmb29ib3hcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaXNJbnRlcm5hbExpbmsgPSBuZXcgUmVnRXhwKCcvJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgJy8nKTtcblx0XHRpZiAoICEgaXNJbnRlcm5hbExpbmsudGVzdCh0aGlzLmhyZWYpICkge1xuXHRcdFx0JCh0aGlzKS5hdHRyKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG5cdFx0fVxuXHR9KTtcblx0XG4gICAgJCgnYVtocmVmKj1cIi5wZGZcIl0nKS5hdHRyKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiIsIihmdW5jdGlvbigkKSB7XG4gICAgJChkb2N1bWVudCkub24oJ2ZhY2V0d3AtbG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChGV1AubG9hZGVkKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCgnLmZhY2V0d3AtdGVtcGxhdGUnKTtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSAtMTUwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCgnLmZhY2V0d3AtZmlsdGVycycpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCgnLmZhY2V0d3AtZmlsdGVycycpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCAkKCcuZmFjZXR3cC1jdXN0b20tZmlsdGVycycpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCgnLmZhY2V0d3AtY3VzdG9tLWZpbHRlcnMnKTtcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSAtNjA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgICAgICBzY3JvbGxUYXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IG9mZnNldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNib29rLWZpbHRlcnMnKS5mb3VuZGF0aW9uKCdjbG9zZScpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBGb3VuZGF0aW9uLnJlSW5pdCgnZXF1YWxpemVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSk7XG4gICAgXG4gICAgXG59KShqUXVlcnkpOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgZGlkU2Nyb2xsO1xuICAgIHZhciBsYXN0U2Nyb2xsVG9wID0gMDtcbiAgICB2YXIgZGVsdGEgPSAyMDA7XG4gICAgdmFyIG5hdmJhckhlaWdodCA9ICQoJy5zaXRlLWhlYWRlcicpLm91dGVySGVpZ2h0KCk7XG4gICAgXG4gICAgJCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbihldmVudCl7XG4gICAgICAgIGRpZFNjcm9sbCA9IHRydWU7XG4gICAgfSk7XG4gICAgXG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChkaWRTY3JvbGwpIHtcbiAgICAgICAgICAgIGhhc1Njcm9sbGVkKCk7XG4gICAgICAgICAgICBkaWRTY3JvbGwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIDI1MCk7XG4gICAgXG4gICAgZnVuY3Rpb24gaGFzU2Nyb2xsZWQoKSB7XG4gICAgICAgIHZhciBzdCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2Ugc2Nyb2xsIG1vcmUgdGhhbiBkZWx0YVxuICAgICAgICBpZihNYXRoLmFicyhsYXN0U2Nyb2xsVG9wIC0gc3QpIDw9IGRlbHRhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgLy8gSWYgc2Nyb2xsZWQgZG93biBhbmQgcGFzdCB0aGUgbmF2YmFyLCBhZGQgY2xhc3MgLm5hdi11cC5cbiAgICAgICAgaWYgKHN0ID4gbGFzdFNjcm9sbFRvcCl7XG4gICAgICAgICAgICAvLyBTY3JvbGwgRG93blxuICAgICAgICAgICAgaWYoc3QgPiBuYXZiYXJIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5hZGRDbGFzcygnZml4ZWQnKS5yZW1vdmVDbGFzcygnbmF2LWRvd24nKS5hZGRDbGFzcygnbmF2LXVwIHNocmluaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2Nyb2xsIFVwXG4gICAgICAgICAgICBpZigoZGVsdGErbmF2YmFySGVpZ2h0KSArIHN0ICsgJCh3aW5kb3cpLmhlaWdodCgpIDwgJChkb2N1bWVudCkuaGVpZ2h0KCkpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnbmF2LXVwJykuYWRkQ2xhc3MoJ25hdi1kb3duJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKHN0IDw9IChkZWx0YStuYXZiYXJIZWlnaHQpKSB7XG4gICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnZml4ZWQgbmF2LWRvd24gc2hyaW5rJyk7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgIGxhc3RTY3JvbGxUb3AgPSBzdDtcbiAgICB9XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7IiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIExvYWQgRm91bmRhdGlvblxuXHQkKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG4gICAgXG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdkb2N1bWVudC1yZWFkeScpO1xuICAgXG4gICAgJCgnLnNjcm9sbC1uZXh0Jykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgICAgXG4gICAgICAgICQuc21vb3RoU2Nyb2xsKHtcbiAgICAgICAgICAgIG9mZnNldDogLTEwMCxcbiAgICAgICAgICAgIHNjcm9sbFRhcmdldDogJCgnbWFpbiBzZWN0aW9uOmZpcnN0LWNoaWxkJyksXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFRvZ2dsZSBtZW51XG4gICAgXG4gICAgJCgnbGkubWVudS1pdGVtLWhhcy1jaGlsZHJlbiA+IGFbaHJlZl49XCIjXCJdJykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgICAgXG4gICAgICAgIHZhciAkdG9nZ2xlID0gJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuc3ViLW1lbnUtdG9nZ2xlJyk7XG4gICAgICAgIFxuICAgICAgICBpZiggJHRvZ2dsZS5pcygnOnZpc2libGUnKSApIHtcbiAgICAgICAgICAgICR0b2dnbGUudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG5cbiAgICB9KTtcbiAgICBcbiAgXG4gICAgJCh3aW5kb3cpLnNjcm9sbChhbmltYXRlTnVtYmVycyk7XG4gICAgXG4gICAgJCh3aW5kb3cpLm9uKFwibG9hZCBzY3JvbGxcIixmdW5jdGlvbihlKXtcbiAgICAgICAgYW5pbWF0ZU51bWJlcnMoKTsgXG4gICAgfSk7XG4gICAgdmFyIHZpZXdlZCA9IGZhbHNlO1xuICAgIFxuICAgIGZ1bmN0aW9uIGlzU2Nyb2xsZWRJbnRvVmlldyhlbGVtKSB7XG4gICAgICAgIFxuICAgICAgICBpZiggISAkKGVsZW0pLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIGRvY1ZpZXdUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgICAgIHZhciBkb2NWaWV3Qm90dG9tID0gZG9jVmlld1RvcCArICQod2luZG93KS5oZWlnaHQoKTtcbiAgICBcbiAgICAgICAgdmFyIGVsZW1Ub3AgPSAkKGVsZW0pLm9mZnNldCgpLnRvcDtcbiAgICAgICAgdmFyIGVsZW1Cb3R0b20gPSBlbGVtVG9wICsgJChlbGVtKS5oZWlnaHQoKTtcbiAgICBcbiAgICAgICAgcmV0dXJuICgoZWxlbUJvdHRvbSA8PSBkb2NWaWV3Qm90dG9tKSAmJiAoZWxlbVRvcCA+PSBkb2NWaWV3VG9wKSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGFuaW1hdGVOdW1iZXJzKCkge1xuICAgICAgaWYgKGlzU2Nyb2xsZWRJbnRvVmlldygkKFwiLm51bWJlcnNcIikpICYmICF2aWV3ZWQpIHtcbiAgICAgICAgICB2aWV3ZWQgPSB0cnVlO1xuICAgICAgICAgICQoJy5udW1iZXInKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkKHRoaXMpLmNzcygnb3BhY2l0eScsIDEpO1xuICAgICAgICAgICQodGhpcykucHJvcCgnQ291bnRlcicsMCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgIENvdW50ZXI6ICQodGhpcykudGV4dCgpLnJlcGxhY2UoLywvZywgJycpXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogNDAwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICBzdGVwOiBmdW5jdGlvbiAobm93KSB7XG4gICAgICAgICAgICAgICAgICAkKHRoaXMpLnRleHQoTWF0aC5jZWlsKG5vdykudG9TdHJpbmcoKS5yZXBsYWNlKC8oXFxkKSg/PShcXGRcXGRcXGQpKyg/IVxcZCkpL2csIFwiJDEsXCIpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkKCcudWwtZXhwYW5kJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKCQodGhpcykuZmluZCgnbGk6dmlzaWJsZScpLmxlbmd0aCkge1xuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCdzcGFuIGEnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAkKCcudWwtZXhwYW5kJykub24oJ2NsaWNrJywnc3BhbiBhJyxmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvL3ZhciAkY2hpbGRyZW4gPSAkKHRoaXMpLnByZXYoJ3VsJykuY2hpbGRyZW4oKTtcbiAgICAgICAgXG4gICAgICAgIC8vJGNoaWxkcmVuLmNzcygnZGlzcGxheScsICdpbmxpbmUnKTtcbiAgICAgICAgLy9yZXR1cm4gZmFsc2U7XG4gICAgICAgICQodGhpcykucGFyZW50cygnZGl2JykuZmluZCgndWwnKS5yZW1vdmVDbGFzcygnc2hvcnQnKTtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTsgIFxuICAgIH0pO1xuXG4gICAgXG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIFJlcGxhY2UgYWxsIFNWRyBpbWFnZXMgd2l0aCBpbmxpbmUgU1ZHICh1c2UgYXMgbmVlZGVkIHNvIHlvdSBjYW4gc2V0IGhvdmVyIGZpbGxzKVxuXG4gICAgICAgICQoJ2ltZy5zdmcnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgJGltZyA9IGpRdWVyeSh0aGlzKTtcbiAgICAgICAgICAgIHZhciBpbWdJRCA9ICRpbWcuYXR0cignaWQnKTtcbiAgICAgICAgICAgIHZhciBpbWdDbGFzcyA9ICRpbWcuYXR0cignY2xhc3MnKTtcbiAgICAgICAgICAgIHZhciBpbWdVUkwgPSAkaW1nLmF0dHIoJ3NyYycpO1xuXG5cdFx0JC5nZXQoaW1nVVJMLCBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHQvLyBHZXQgdGhlIFNWRyB0YWcsIGlnbm9yZSB0aGUgcmVzdFxuXHRcdFx0dmFyICRzdmcgPSBqUXVlcnkoZGF0YSkuZmluZCgnc3ZnJyk7XG5cblx0XHRcdC8vIEFkZCByZXBsYWNlZCBpbWFnZSdzIElEIHRvIHRoZSBuZXcgU1ZHXG5cdFx0XHRpZih0eXBlb2YgaW1nSUQgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdCRzdmcgPSAkc3ZnLmF0dHIoJ2lkJywgaW1nSUQpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gQWRkIHJlcGxhY2VkIGltYWdlJ3MgY2xhc3NlcyB0byB0aGUgbmV3IFNWR1xuXHRcdFx0aWYodHlwZW9mIGltZ0NsYXNzICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHQkc3ZnID0gJHN2Zy5hdHRyKCdjbGFzcycsIGltZ0NsYXNzKycgcmVwbGFjZWQtc3ZnJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlbW92ZSBhbnkgaW52YWxpZCBYTUwgdGFncyBhcyBwZXIgaHR0cDovL3ZhbGlkYXRvci53My5vcmdcblx0XHRcdCRzdmcgPSAkc3ZnLnJlbW92ZUF0dHIoJ3htbG5zOmEnKTtcblxuXHRcdFx0Ly8gUmVwbGFjZSBpbWFnZSB3aXRoIG5ldyBTVkdcblx0XHRcdCRpbWcucmVwbGFjZVdpdGgoJHN2Zyk7XG5cblx0XHR9LCAneG1sJyk7XG5cblx0fSk7XG5cbiAgICBcblxufShkb2N1bWVudCwgd2luZG93LCBqUXVlcnkpKTtcblxuIiwiKGZ1bmN0aW9uKCQpIHtcblx0XG5cdCd1c2Ugc3RyaWN0JztcdFxuXHRcblx0XG4gICAgdmFyICRjb2x1bW4gPSAkKCcuc2VjdGlvbi1sZWFkZXJzaGlwIC5ncmlkIC5jb2x1bW4nKTtcbiAgICBcbiAgICAvL29wZW4gYW5kIGNsb3NlIGNvbHVtblxuICAgICRjb2x1bW4uZmluZCgnLmpzLWV4cGFuZGVyIC5vcGVuLCAuanMtZXhwYW5kZXIgLnRodW1ibmFpbCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgdmFyICR0aGlzQ29sdW1uID0gJCh0aGlzKS5jbG9zZXN0KCcuY29sdW1uJyk7XG4gICAgXG4gICAgICBpZiAoJHRoaXNDb2x1bW4uaGFzQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpKSB7XG4gICAgICAgIC8vIHNpYmxpbmdzIHJlbW92ZSBvcGVuIGNsYXNzIGFuZCBhZGQgY2xvc2VkIGNsYXNzZXNcbiAgICAgICAgJGNvbHVtbi5ub3QoJHRoaXNDb2x1bW4pLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICAgICAgLy8gcmVtb3ZlIGNsb3NlZCBjbGFzc2VzLCBhZGQgcGVuIGNsYXNzXG4gICAgICAgICR0aGlzQ29sdW1uLnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKS5hZGRDbGFzcygnaXMtZXhwYW5kZWQnKTtcbiAgICAgICAgXG4gICAgICAgIGlmICgkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikuaGFzQ2xhc3MoJ2lzLWluYWN0aXZlJykpIHtcbiAgICAgICAgICAvL2RvIG5vdGhpbmdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikuYWRkQ2xhc3MoJ2lzLWluYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgICAgaWYoIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KCd4bGFyZ2UnKSApIHtcbiAgICAgICAgICB2YXIgb2Zmc2V0ID0gLTEwMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJC5zbW9vdGhTY3JvbGwoe1xuICAgICAgICAgICAgc2Nyb2xsVGFyZ2V0OiAkdGhpc0NvbHVtbixcbiAgICAgICAgICAgIC8vb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgICAgICBiZWZvcmVTY3JvbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLmFkZENsYXNzKCduYXYtdXAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdGhpc0NvbHVtbi5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtaW5hY3RpdmUnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvL2Nsb3NlIGNhcmQgd2hlbiBjbGljayBvbiBjcm9zc1xuICAgICRjb2x1bW4uZmluZCgnLmpzLWNvbGxhcHNlcicpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgdmFyICR0aGlzQ29sdW1uID0gJCh0aGlzKS5wYXJlbnRzKCcuY29sdW1uX19leHBhbmRlcicpLmNsb3Nlc3QoJy5jb2x1bW4nKTtcbiAgICBcbiAgICAgICR0aGlzQ29sdW1uLnJlbW92ZUNsYXNzKCdpcy1leHBhbmRlZCcpLmFkZENsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKTtcbiAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtaW5hY3RpdmUnKTtcbiAgICBcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG4gICAgXG4gICAgJCgnI2xvZ2luZm9ybSA6aW5wdXQsICNwYXNzd29yZGZvcm0gOmlucHV0JykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsYWJlbCA9ICQodGhpcykucGFyZW50KCkuZmluZCgnbGFiZWwnKS50ZXh0KCk7XG4gICAgICAgICQodGhpcykuYXR0ciggJ3BsYWNlaG9sZGVyJywgbGFiZWwgKTtcbiAgICB9KTtcbiAgICBcbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnBsYXktdmlkZW8nLCBwbGF5VmlkZW8pO1xuICAgIFxuICAgIGZ1bmN0aW9uIHBsYXlWaWRlbygpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIFN0b3AgYWxsIGJhY2tncm91bmQgdmlkZW9zXG4gICAgICAgIGlmKCAkKCcuYmFja2dyb3VuZC12aWRlbyB2aWRlbycpLnNpemUoKSApIHtcbiAgICAgICAgICAgICQoJy5iYWNrZ3JvdW5kLXZpZGVvIHZpZGVvJylbMF0ucGF1c2UoKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIFxuICAgICAgICB2YXIgdXJsID0gJHRoaXMuZGF0YSgnc3JjJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHZhciAkbW9kYWwgPSAkKCcjJyArICR0aGlzLmRhdGEoJ29wZW4nKSk7XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAkLmFqYXgodXJsKVxuICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgJG1vZGFsLmZpbmQoJy5mbGV4LXZpZGVvJykuaHRtbChyZXNwKS5mb3VuZGF0aW9uKCdvcGVuJyk7XG4gICAgICAgIH0pO1xuICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgdmFyICRpZnJhbWUgPSAkKCc8aWZyYW1lPicsIHtcbiAgICAgICAgICAgIHNyYzogdXJsLFxuICAgICAgICAgICAgaWQ6ICAndmlkZW8nLFxuICAgICAgICAgICAgZnJhbWVib3JkZXI6IDAsXG4gICAgICAgICAgICBzY3JvbGxpbmc6ICdubydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgJGlmcmFtZS5hcHBlbmRUbygnLnZpZGVvLXBsYWNlaG9sZGVyJywgJG1vZGFsICk7ICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLy8gTWFrZSBzdXJlIHZpZGVvcyBkb24ndCBwbGF5IGluIGJhY2tncm91bmRcbiAgICAkKGRvY3VtZW50KS5vbihcbiAgICAgICdjbG9zZWQuemYucmV2ZWFsJywgJyNtb2RhbC12aWRlbycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcudmlkZW8tcGxhY2Vob2xkZXInKS5odG1sKCcnKTtcbiAgICAgICAgaWYoICQoJy5iYWNrZ3JvdW5kLXZpZGVvIHZpZGVvJykuc2l6ZSgpICkge1xuICAgICAgICAgICAgJCgnLmJhY2tncm91bmQtdmlkZW8gdmlkZW8nKVswXS5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICB9XG4gICAgKTtcbiAgICAgICAgXG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uKCQpIHtcblx0XG5cdCd1c2Ugc3RyaWN0JztcdFxuXHRcblx0XG4gICAgdmFyIGdldExhc3RTaWJsaW5nSW5Sb3cgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICB2YXIgY2FuZGlkYXRlID0gZWxlbWVudCxcbiAgICAgICAgICAgIGVsZW1lbnRUb3AgPSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICAgICAgXG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCB0aGUgZWxlbWVudOKAmXMgbmV4dCBzaWJsaW5ncyBhbmQgbG9vayBmb3IgdGhlIGZpcnN0IG9uZSB3aGljaFxuICAgICAgICAvLyBpcyBwb3NpdGlvbmVkIGZ1cnRoZXIgZG93biB0aGUgcGFnZS5cbiAgICAgICAgd2hpbGUgKGNhbmRpZGF0ZS5uZXh0RWxlbWVudFNpYmxpbmcgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjYW5kaWRhdGUubmV4dEVsZW1lbnRTaWJsaW5nLm9mZnNldFRvcCA+IGVsZW1lbnRUb3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FuZGlkYXRlID0gY2FuZGlkYXRlLm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgIH07XG4gICAgXG4gICAgdmFyICRncmlkID0gJCgnLnNlY3Rpb24tYnVzaW5lc3NlcyAuZ3JpZCcpO1xuICAgIHZhciAkY29sdW1uID0gJCgnLnNlY3Rpb24tYnVzaW5lc3NlcyAuZ3JpZCA+IC5jb2x1bW4nKTtcbiAgICBcbiAgICAvL29wZW4gYW5kIGNsb3NlIGNvbHVtblxuICAgICRjb2x1bW4uZmluZCgnLmpzLWV4cGFuZGVyIC5vcGVuLCAuanMtZXhwYW5kZXIgLnRodW1ibmFpbCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgICAgICB2YXIgJHRoaXNDb2x1bW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5jb2x1bW4nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEdldCBsYXN0IHNpYmxpbmcgaW4gcm93XG4gICAgICAgIHZhciBsYXN0ID0gZ2V0TGFzdFNpYmxpbmdJblJvdygkdGhpc0NvbHVtblswXSk7XG4gICAgICAgIFxuICAgICAgICAkKCcuZGV0YWlscycpLnJlbW92ZSgpO1xuICAgICAgICBcbiAgICAgICAgLy9jb25zb2xlLmxvZygkKGxhc3QpLmluZGV4KCkpO1xuICAgICAgICAkdGhpc0NvbHVtbi5maW5kKCcuY29sdW1uX19leHBhbmRlcicpXG4gICAgICAgICAgICAuY2xvbmUoKVxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdoaWRlJylcbiAgICAgICAgICAgIC53cmFwKCc8ZGl2IGNsYXNzPVwiZGV0YWlsc1wiIC8+JykucGFyZW50KClcbiAgICAgICAgICAgIC5pbnNlcnRBZnRlcigkKGxhc3QpKTtcbiAgICAgIFxuICAgIFxuICAgICAgICBpZiAoJHRoaXNDb2x1bW4uaGFzQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpKSB7XG4gICAgICAgIC8vIHNpYmxpbmdzIHJlbW92ZSBvcGVuIGNsYXNzIGFuZCBhZGQgY2xvc2VkIGNsYXNzZXNcbiAgICAgICAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkIGlzLWluYWN0aXZlJyk7XG4gICAgICAgICAgICAvLyByZW1vdmUgY2xvc2VkIGNsYXNzZXMsIGFkZCBwZW4gY2xhc3NcbiAgICAgICAgICAgICR0aGlzQ29sdW1uLnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQgaXMtaW5hY3RpdmUnKS5hZGRDbGFzcygnaXMtZXhwYW5kZWQnKTtcbiAgICAgICAgXG4gICAgICAgIGlmICgkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikuaGFzQ2xhc3MoJ2lzLWluYWN0aXZlJykpIHtcbiAgICAgICAgICAvL2RvIG5vdGhpbmdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkY29sdW1uLm5vdCgkdGhpc0NvbHVtbikuYWRkQ2xhc3MoJ2lzLWluYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgICAgaWYoIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KCd4bGFyZ2UnKSApIHtcbiAgICAgICAgICB2YXIgb2Zmc2V0ID0gLTEwMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJC5zbW9vdGhTY3JvbGwoe1xuICAgICAgICAgICAgc2Nyb2xsVGFyZ2V0OiAkdGhpc0NvbHVtbixcbiAgICAgICAgICAgIC8vb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgICAgICBiZWZvcmVTY3JvbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLWhlYWRlcicpLmFkZENsYXNzKCduYXYtdXAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdGhpc0NvbHVtbi5yZW1vdmVDbGFzcygnaXMtZXhwYW5kZWQnKS5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICRjb2x1bW4ubm90KCR0aGlzQ29sdW1uKS5yZW1vdmVDbGFzcygnaXMtaW5hY3RpdmUnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvL2Nsb3NlIGNhcmQgd2hlbiBjbGljayBvbiBjcm9zc1xuICAgICRncmlkLm9uKCdjbGljaycsJy5jbG9zZScsIGZ1bmN0aW9uKCkge1xuICAgICAgJGdyaWQuZmluZCgnLmRldGFpbHMnKS5yZW1vdmUoKTtcbiAgICAgICRjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCBpcy1pbmFjdGl2ZScpO1xuICAgIH0pO1xuICAgIFxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICAgICRncmlkLmZpbmQoJy5kZXRhaWxzJykucmVtb3ZlKCk7XG4gICAgICAgICRjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2lzLWV4cGFuZGVkJykuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCBpcy1pbmFjdGl2ZScpO1xuICAgIH0pO1xuXG59KShqUXVlcnkpOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuICAgIHZhciAkZmlsdGVyQnV0dG9ucyA9ICQoJy5mYXEtZmlsdGVyLWJ1dHRvbicpO1xuXG4gICAgJCgnLmZhcS1maWx0ZXItYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXJWYWx1ZSA9ICQodGhpcykuYXR0cignZGF0YS1maWx0ZXInKTtcblxuICAgICAgICB2YXIgJGFsbEZhcXMgPSAkKCcuZmFxJyk7XG5cbiAgICAgICAgdmFyICRuZXdBY3RpdmVGYXFzID0gJyc7XG4gICAgICAgIHZhciAkbmV3RGVhY3RpdmF0ZWRGYXFzID0gJyc7XG4gICAgICAgIGlmKGZpbHRlclZhbHVlID09ICcqJykge1xuICAgICAgICAgICAgJG5ld0FjdGl2ZUZhcXMgPSAkKCcuZmFxJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkbmV3QWN0aXZlRmFxcyA9ICQoZmlsdGVyVmFsdWUpO1xuICAgICAgICAgICAgJG5ld0RlYWN0aXZhdGVkRmFxcyA9ICQoJy5mYXEnKS5ub3QoZmlsdGVyVmFsdWUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJG5ld0RlYWN0aXZhdGVkRmFxcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xvc2Ugb3BlbiBhY2NvcmRpb25zXG4gICAgICAgICAqICAtIGlmIG5ldyBmaWx0ZXIgZG9lc24ndCBoYXZlIHRoZW1cbiAgICAgICAgICovXG4gICAgICAgIGlmKCRuZXdEZWFjdGl2YXRlZEZhcXMpIHtcbiAgICAgICAgICAgICRuZXdEZWFjdGl2YXRlZEZhcXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIGlmKCR0aGlzLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAkdGhpcy5maW5kKCcuYWNjb3JkaW9uLXRpdGxlJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICRhbGxGYXFzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2ZhcS1oaWRkZW4nKTtcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2ZhcS1zaG93bicpO1xuICAgICAgICB9KTtcbiAgICAgICAgJG5ld0FjdGl2ZUZhcXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQodGhpcykuc2hvdygpO1xuICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnZmFxLXNob3duJyk7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdmYXEtaGlkZGVuJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRmaWx0ZXJCdXR0b25zLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgfSk7XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgJGh0bWwgPSAkKCdodG1sJyk7XG4gICAgY29uc3QgJG9uX3BhZ2VfbGlua3MgPSAkKCcjb24tcGFnZS1saW5rcycpO1xuICAgIGNvbnN0ICRsaW5rc19jb250YWluZXIgID0gJCgnLm9uLXBhZ2UtbGlua3MtY29udGFpbmVyJyk7XG4gICAgY29uc3QgJG1lbnVfYnV0dG9uICA9ICQoJy5vbi1wYWdlLW1vYmlsZS1uYXYtdG9nZ2xlJyk7XG4gICAgdmFyICRtZW51X3dpZHRoID0gJCgnLm9uLXBhZ2UtbGlua3MtbGlzdCcpLndpZHRoKCk7XG5cbiAgICAkb25fcGFnZV9saW5rcy5hZGRDbGFzcygnaW5pdCcpO1xuXG4gICAgLy8gY29uc29sZS5sb2coJ2luaXQgbW9iaWxlIG5hdicpO1xuXG4gICAgLy8gY2hlY2sgaWYgaXQgc2hvdWxkIGZvcmNlIHRvIGhhbWJ1cmdlclxuICAgIGZ1bmN0aW9uIG9uX3BhZ2VfbGlua3NfbW9iaWxlX2Rpc3BsYXkoKSB7XG4gICAgICAgIHZhciAkbGlua3NfY29udGFpbmVyX3dpZHRoID0gJGxpbmtzX2NvbnRhaW5lci53aWR0aCgpO1xuICAgICAgICAvLyB2YXIgJG1lbnVfd2lkdGggICA9ICQoJy5vbi1wYWdlLWxpbmtzLWxpc3QnKS53aWR0aCgpO1xuXG4gICAgICAgIHZhciAkaXRlbXNfd2lkdGggID0gJG1lbnVfd2lkdGggKyA0MDtcbiAgICAgICAgdmFyICRkaXNwbGF5X21lbnUgPSAkaXRlbXNfd2lkdGggPj0gJGxpbmtzX2NvbnRhaW5lcl93aWR0aDtcblxuICAgICAgICByZXR1cm4gJGRpc3BsYXlfbWVudTtcbiAgICB9XG5cbiAgICAvLyBhZGRzL3JlbW92ZXMgY2xhc3NlcyBiYXNlZCBvbiBzY3JlZW4gd2lkdGhcbiAgICBmdW5jdGlvbiBvbl9wYWdlX2xpbmtzX21vYmlsZV9jbGFzc2VzKCkge1xuXG4gICAgICAgIHZhciAkZGlzcGxheV9tZW51ID0gb25fcGFnZV9saW5rc19tb2JpbGVfZGlzcGxheSgpO1xuXG4gICAgICAgIGlmKCEkZGlzcGxheV9tZW51KSB7XG4gICAgICAgICAgICAkb25fcGFnZV9saW5rcy5yZW1vdmVDbGFzcygnb24tcGFnZS1tb2JpbGUtbmF2LWFjdGl2ZScpO1xuICAgICAgICAgICAgJG9uX3BhZ2VfbGlua3MucmVtb3ZlQ2xhc3MoJ29uLXBhZ2UtbW9iaWxlLW5hdi1kaXNwbGF5Jyk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnYmVnb25lIGNsYXNzZXMnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghJG9uX3BhZ2VfbGlua3MuaGFzQ2xhc3MoJ29uLXBhZ2UtbW9iaWxlLW5hdi1kaXNwbGF5JykpIHtcbiAgICAgICAgICAgICRvbl9wYWdlX2xpbmtzLmFkZENsYXNzKCdvbi1wYWdlLW1vYmlsZS1uYXYtZGlzcGxheScpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3JpZ2h0X3NpemVfZm9yX21vYmlsZV9uYXYnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vYmlsZU5hdl9hY3RpdmF0ZSgpIHtcbiAgICAgICAgJG9uX3BhZ2VfbGlua3MuYWRkQ2xhc3MoJ29uLXBhZ2UtbW9iaWxlLW5hdi1hY3RpdmUnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb2JpbGVOYXZfZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgJG9uX3BhZ2VfbGlua3MucmVtb3ZlQ2xhc3MoJ29uLXBhZ2UtbW9iaWxlLW5hdi1hY3RpdmUnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb2JpbGVOYXZfdG9nZ2xlKCkge1xuXG4gICAgICAgIGlmKCRvbl9wYWdlX2xpbmtzLmhhc0NsYXNzKCdvbi1wYWdlLW1vYmlsZS1uYXYtYWN0aXZlJykpIHtcbiAgICAgICAgICAgIG1vYmlsZU5hdl9kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAkbWVudV9idXR0b24uaHRtbCgnTWVudScpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbW9iaWxlTmF2X2FjdGl2YXRlKCk7XG4gICAgICAgICAgICAkbWVudV9idXR0b24uaHRtbCgnQ2xvc2UnKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbiAgICAvLyBhZGQgcHJvcGVyIGNsYXNzIG9uIGRvY3VtZW50IGxvYWRcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgb25fcGFnZV9saW5rc19tb2JpbGVfY2xhc3NlcygpO1xuICAgIH0pO1xuXG4gICAgLy8gZG8gaXQgYWdhaW4gd2hlbiAqZXZlcnl0aGluZyogaXMgbG9hZGVkXG4gICAgJCh3aW5kb3cpLmJpbmQoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgb25fcGFnZV9saW5rc19tb2JpbGVfY2xhc3NlcygpO1xuICAgIH0pO1xuXG4gICAgLy8gYWRqdXN0IGRpc3BsYXkgY2xhc3NlcyBvbiByZXNpemVcbiAgICAvLyBTSE9VTEQgVEhST1RUTEUgVEhJUyBUSElOR1xuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG5cbiAgICB9KTtcblxuXG4gICAgLyogT24gcmVzaXplICh0aHJvdHRsZWQpICovXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIG9uX3BhZ2VfbGlua3NfcmVzaXplciwgZmFsc2UpO1xuXG4gICAgdmFyIHRpbWVyID0gbnVsbDtcbiAgICBmdW5jdGlvbiBvbl9wYWdlX2xpbmtzX3Jlc2l6ZXIoKSB7XG5cbiAgICAgICAgdGltZXIgPSB0aW1lciB8fCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICAgICAgb25fcGFnZV9saW5rc19tb2JpbGVfY2xhc3NlcygpO1xuICAgICAgICB9LCA1MCk7XG4gICAgfVxuXG5cblxuICAgIC8vIG9uIGNsaWNraW5nIC5vbi1wYWdlLW1vYmlsZS1uYXYtb3BlblxuICAgIC8qKlxuICAgICAqIFdvb0NvbW1lcmNlIHdhcyBnaXZpbmcgbWUgaXNzdWVzIHdpdGggZG91YmxlY2xpY2tpbmdcbiAgICAgKiAgIC0gSGFkIHRvIGFkZCBhIGNsYXNzIHRvIGJvZHkgdG8gY2FuY2VsIG91dCBhIGRvdWJsZS1jbGlja2VkIHRoaW5nXG4gICAgICovXG4gICAgJG1lbnVfYnV0dG9uLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIG1vYmlsZU5hdl90b2dnbGUoKTtcbiAgICB9KTtcblxuICAgIC8vIGlmIG9wZW4sIGNsb3NlIG9uIHByZXNzaW5nIGVzY2FwZSBrZXlcbiAgICAvLyAkKGRvY3VtZW50KS5vbigna2V5ZG93bicsZnVuY3Rpb24oZSkge1xuICAgIC8vICAgICBpZiAoZS5rZXlDb2RlID09PSAyNyAmJiAkKCdodG1sJykuaGFzQ2xhc3MoJ29uLXBhZ2UtbW9iaWxlLW5hdi1hY3RpdmUnKSkgeyAvLyBFU0NcbiAgICAvLyAgICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnb24tcGFnZS1tb2JpbGUtbmF2LWFjdGl2ZScpO1xuICAgIC8vICAgICB9XG4gICAgLy8gfSk7XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cbiIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuICAgIHZhciAkcmVzb3VyY2VzX2FjY29yZGlvbl9saW5rcyA9ICQoJy5yZXNvdXJjZXMtYWNjb3JkaW9uLXRpdGxlJyk7XG4gICAgY29uc3QgJHRyaWdnZXJfd2lkdGggPSA1NTA7XG4gICAgdmFyICR3aW5kb3dfd2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcblxuICAgIGZ1bmN0aW9uIHJlc291cmNlc0FjY29yZGlvbnNJbml0Q2xvc2UoKSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ3dpbmRvdzogJyArICR3aW5kb3dfd2lkdGggKyAnLCB0cmlnZ2VyOiAnICsgJHRyaWdnZXJfd2lkdGgpO1xuXG4gICAgICAgIHZhciAkaXNfbW9iaWxlID0gZmFsc2U7XG4gICAgICAgIGlmKCR3aW5kb3dfd2lkdGggPCAkdHJpZ2dlcl93aWR0aCkge1xuICAgICAgICAgICAgJGlzX21vYmlsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAkcmVzb3VyY2VzX2FjY29yZGlvbl9saW5rcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgIGlmKCRpc19tb2JpbGUgJiYgJHRoaXMucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICAgICAgICAgICAgJHRoaXMudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb3VyY2VzQWNjb3JkaW9uUmVzaXplQ2xvc2UoKSB7XG5cbiAgICAgICAgJHdpbmRvd193aWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICBjb25zb2xlLmxvZygnd2luZG93OiAnICsgJHdpbmRvd193aWR0aCArICcsIHRyaWdnZXI6ICcgKyAkdHJpZ2dlcl93aWR0aCk7XG5cbiAgICAgICAgdmFyICRpc19tb2JpbGUgPSBmYWxzZTtcbiAgICAgICAgaWYoJHdpbmRvd193aWR0aCA8ICR0cmlnZ2VyX3dpZHRoKSB7XG4gICAgICAgICAgICAkaXNfbW9iaWxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgICRyZXNvdXJjZXNfYWNjb3JkaW9uX2xpbmtzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgaWYoISRpc19tb2JpbGUgJiYgISR0aGlzLnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgICAgICAgICAgICR0aGlzLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGFkZCBwcm9wZXIgY2xhc3Mgb24gZG9jdW1lbnQgbG9hZFxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvdXJjZXNBY2NvcmRpb25zSW5pdENsb3NlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBkbyBpdCBhZ2FpbiB3aGVuICpldmVyeXRoaW5nKiBpcyBsb2FkZWRcbiAgICAkKHdpbmRvdykuYmluZCgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvdXJjZXNBY2NvcmRpb25zSW5pdENsb3NlKCk7XG4gICAgfSk7XG5cbiAgICAvKiBPbiByZXNpemUgKHRocm90dGxlZCkgKi9cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzb3VyY2VzQWNjb3JkaW9uc1Jlc2l6ZXIsIGZhbHNlKTtcblxuICAgIHZhciB0aW1lciA9IG51bGw7XG4gICAgZnVuY3Rpb24gcmVzb3VyY2VzQWNjb3JkaW9uc1Jlc2l6ZXIoKSB7XG5cbiAgICAgICAgdGltZXIgPSB0aW1lciB8fCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICAgICAgcmVzb3VyY2VzQWNjb3JkaW9uUmVzaXplQ2xvc2UoKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBQYWdlYnVpbGRlciBJbWFnZSBMaWJyYXJ5XG4gICAgICovXG4gICAgbGV0ICRwYWdlYnVpbGRlcl9pbWFnZV9saWJyYXJ5ID0galF1ZXJ5KCcucGFnZWJ1aWxkZXItc2VjdGlvbi1pbWFnZS1saWJyYXJ5Jyk7XG4gICAgaWYoJHBhZ2VidWlsZGVyX2ltYWdlX2xpYnJhcnkpIHtcbiAgICAgICRwYWdlYnVpbGRlcl9pbWFnZV9saWJyYXJ5LmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyICR0aGlzID0galF1ZXJ5KHRoaXMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdXAgdGhlIHNsaWRlciBzdHVmZlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyICRhdXRvcGxheSA9IGZhbHNlO1xuICAgICAgICB2YXIgJGF1dG9wbGF5U3BlZWQgPSA2MDAwO1xuICAgICAgICBpZigkdGhpcy5hdHRyKCdkYXRhLWF1dG9wbGF5JykpIHtcbiAgICAgICAgICAkYXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICAgIGlmKCR0aGlzLmF0dHIoJ2RhdGEtYXV0b3BsYXktc3BlZWQnKSkge1xuICAgICAgICAgICAgJGF1dG9wbGF5U3BlZWQgPSAkdGhpcy5hdHRyKCdkYXRhLWF1dG9wbGF5LXNwZWVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICggJCgnLnNsaWNrJywgJHRoaXMpLmxlbmd0aCApIHtcblxuICAgICAgICAgICR0aGlzLmZpbmQoJy5zbGljaycpLnNsaWNrKHtcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXG4gICAgICAgICAgICBzcGVlZDogMzAwLFxuICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICAgICAgbGF6eUxvYWQ6ICdvbmRlbWFuZCcsXG4gICAgICAgICAgICBhdXRvcGxheTogJGF1dG9wbGF5LFxuICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogJGF1dG9wbGF5U3BlZWQsXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXG4gICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMHB4JyxcbiAgICAgICAgICAgIHByZXZBcnJvdzogJHRoaXMuZmluZCgnLnNsaWNrLXByZXYnKSxcbiAgICAgICAgICAgIG5leHRBcnJvdzogJHRoaXMuZmluZCgnLnNsaWNrLW5leHQnKSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIFNldCB0aGUgaGVpZ2h0cyBvZiBhbGwgdGhlIGNhcHRpb25zXG4gICAgICAgICAgICovXG4gICAgICAgICAgdmFyICRjYXB0aW9ucyA9ICR0aGlzLmZpbmQoJy5pbWFnZS1jYXB0aW9uJyk7XG4gICAgICAgICAgaWYoJGNhcHRpb25zKSB7XG4gICAgICAgICAgICAkY2FwdGlvbnMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyICRjYXB0aW9uID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgdmFyICRjYXB0aW9uSGVpZ2h0ID0gJGNhcHRpb24uaGVpZ2h0KCk7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCRjYXB0aW9uSGVpZ2h0KTtcbiAgICAgICAgICAgICAgJGNhcHRpb24uY3NzKCdtYXJnaW4tYm90dG9tJywoJGNhcHRpb25IZWlnaHQgKiAtMSkgKyAncHgnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8qIE9uIHJlc2l6ZSAodGhyb3R0bGVkKSAqL1xuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbWFnZUxpYnJhcnlDYXB0aW9uUmVzaXplciwgZmFsc2UpO1xuXG4gICAgICAgICAgdmFyIHRpbWVyID0gbnVsbDtcbiAgICAgICAgICBmdW5jdGlvbiBpbWFnZUxpYnJhcnlDYXB0aW9uUmVzaXplcigpIHtcbiAgICAgICAgICAgIHRpbWVyID0gdGltZXIgfHwgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYoJGNhcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAkY2FwdGlvbnMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRjYXB0aW9uID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRjYXB0aW9uSGVpZ2h0ID0gJGNhcHRpb24uaGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCRjYXB0aW9uSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgJGNhcHRpb24uY3NzKCdtYXJnaW4tYm90dG9tJywoJGNhcHRpb25IZWlnaHQgKiAtMSkgKyAncHgnKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkdGhpcy5pbWFnZXNMb2FkZWQoKVxuICAgICAgICAgIC5kb25lKCBmdW5jdGlvbiggaW5zdGFuY2UgKSB7XG4gICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnaW1hZ2VzLWxvYWRlZCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGpRdWVyeSh0aGlzKS5saWdodEdhbGxlcnkoe1xuICAgICAgICAgIHNlbGVjdG9yOiAnLnNsaWNrLXNsaWRlOm5vdCguc2xpY2stY2xvbmVkKSAuaW1hZ2UtbW9kYWwtbGluaycsXG4gICAgICAgICAgdGh1bWJuYWlsOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYWdlYnVpbGRlciBGdWxsLXdpZHRoIGltYWdlIGNhcm91c2VsXG4gICAgICovXG4gICAgbGV0ICRwYWdlYnVpbGRlcl9mdWxsX3dpZHRoX2ltYWdlX2Nhcm91c2VsID0gJCgnLnBhZ2VidWlsZGVyLXNlY3Rpb24tZnVsbC13aWR0aC1pbWFnZS1jYXJvdXNlbCcpO1xuICAgIGlmKCRwYWdlYnVpbGRlcl9mdWxsX3dpZHRoX2ltYWdlX2Nhcm91c2VsKSB7XG4gICAgICAkcGFnZWJ1aWxkZXJfZnVsbF93aWR0aF9pbWFnZV9jYXJvdXNlbC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgJGF1dG9wbGF5ID0gZmFsc2U7XG4gICAgICAgIHZhciAkYXV0b3BsYXlTcGVlZCA9IDYwMDA7XG4gICAgICAgIGlmKCR0aGlzLmF0dHIoJ2RhdGEtYXV0b3BsYXknKSkge1xuICAgICAgICAgICRhdXRvcGxheSA9IHRydWU7XG4gICAgICAgICAgaWYoJHRoaXMuYXR0cignZGF0YS1hdXRvcGxheS1zcGVlZCcpKSB7XG4gICAgICAgICAgICAkYXV0b3BsYXlTcGVlZCA9ICR0aGlzLmF0dHIoJ2RhdGEtYXV0b3BsYXktc3BlZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ2F1dG9wbGF5IHN0YXR1czogJyArICRhdXRvcGxheSArICcsIGF1dG9wbGF5IHNwZWVkOiAnICsgJGF1dG9wbGF5U3BlZWQpO1xuICAgICAgICBpZiAoICQoJy5zbGljaycsICR0aGlzKS5sZW5ndGggKSB7XG5cbiAgICAgICAgICAkdGhpcy5maW5kKCcuc2xpY2snKS5zbGljayh7XG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgICAgIGF1dG9wbGF5OiAkYXV0b3BsYXksXG4gICAgICAgICAgICBhdXRvcGxheVNwZWVkOiAkYXV0b3BsYXlTcGVlZCxcbiAgICAgICAgICAgIGxhenlMb2FkOiAnb25kZW1hbmQnLFxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgICAgICAgICBwcmV2QXJyb3c6ICR0aGlzLmZpbmQoJy5zbGljay1wcmV2JyksXG4gICAgICAgICAgICBuZXh0QXJyb3c6ICR0aGlzLmZpbmQoJy5zbGljay1uZXh0JyksXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAkdGhpcy5pbWFnZXNMb2FkZWQoKVxuICAgICAgICAgIC5kb25lKCBmdW5jdGlvbiggaW5zdGFuY2UgKSB7XG4gICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnaW1hZ2VzLWxvYWRlZCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYWdlYnVpbGRlciBzdGVwc1xuICAgICAqL1xuICAgIGxldCAkcGFnZWJ1aWxkZXJfc3RlcHMgPSAkKCcucGFnZWJ1aWxkZXItc2VjdGlvbi1zdGVwcycpO1xuICAgIGlmKCRwYWdlYnVpbGRlcl9zdGVwcykge1xuICAgICAgJHBhZ2VidWlsZGVyX3N0ZXBzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkYXV0b3BsYXkgPSBmYWxzZTtcbiAgICAgICAgdmFyICRhdXRvcGxheVNwZWVkID0gNjAwMDtcbiAgICAgICAgaWYoJHRoaXMuYXR0cignZGF0YS1hdXRvcGxheScpKSB7XG4gICAgICAgICAgJGF1dG9wbGF5ID0gdHJ1ZTtcbiAgICAgICAgICBpZigkdGhpcy5hdHRyKCdkYXRhLWF1dG9wbGF5LXNwZWVkJykpIHtcbiAgICAgICAgICAgICRhdXRvcGxheVNwZWVkID0gJHRoaXMuYXR0cignZGF0YS1hdXRvcGxheS1zcGVlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoICQoJy5zbGljaycsICR0aGlzKS5sZW5ndGggKSB7XG5cbiAgICAgICAgICAkdGhpcy5maW5kKCcuc2xpY2snKS5zbGljayh7XG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgIGluZmluaXRlOiBmYWxzZSxcbiAgICAgICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgICAgICBhdXRvcGxheTogJGF1dG9wbGF5LFxuICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogJGF1dG9wbGF5U3BlZWQsXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDQsXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgICAgIHByZXZBcnJvdzogJHRoaXMuZmluZCgnLnNsaWNrLXByZXYnKSxcbiAgICAgICAgICAgIG5leHRBcnJvdzogJHRoaXMuZmluZCgnLnNsaWNrLW5leHQnKSxcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IDEwMjQsXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBicmVha3BvaW50OiA3NTAsXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMixcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBicmVha3BvaW50OiA1NTAsXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG5cbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG4gICAgXG4gICAgJCgnLnBhZ2UtdGVtcGxhdGUtcmVnaW9ucyAjbWFwLWJveCBpbWcnKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgb2Zmc2V0ID0gJCh0aGlzKS5vZmZzZXQoKTtcbiAgICAgICAgdmFyIHggPSBNYXRoLmZsb29yKChlLnBhZ2VYIC0gb2Zmc2V0LmxlZnQpIC8gJCh0aGlzKS53aWR0aCgpICogMTAwMDApLzEwMDtcbiAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKChlLnBhZ2VZIC0gb2Zmc2V0LnRvcCkgLyAkKHRoaXMpLmhlaWdodCgpICogMTAwMDApLzEwMDtcbiAgICAgICAgXG4gICAgICAgICQoJyNtb3VzZS14eScpLnZhbCggeCArICcvJyArIHkgKTsgICAgIFxuICAgIH0pO1xuICAgIFxuICAgICQoIFwiLm1hcC1rZXkgYnV0dG9uXCIgKS5ob3ZlcihcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcjbWFwLWJveCBidXR0b24nKS5yZW1vdmVDbGFzcyggXCJob3ZlclwiICk7XG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnbWFya2VyJyk7XG4gICAgICAgICQoaWQpLmFkZENsYXNzKCdob3ZlcicpO1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJyNtYXAtYm94IGJ1dHRvbicpLnJlbW92ZUNsYXNzKCBcImhvdmVyXCIgKTtcbiAgICAgIH1cbiAgICApO1xuICAgIFxuICAgICQoJy5wYWdlLXRlbXBsYXRlLXJlZ2lvbnMgI21hcC1ib3ggYnV0dG9uJykub24oICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgLy8kKHRoaXMpLmFkZENsYXNzKCdob3ZlcicpO1xuICAgIH0pO1xuICAgIFxuICAgIFxuICAgICQoJy5wYWdlLXRlbXBsYXRlLXJlZ2lvbnMgLm1hcC1rZXkgYnV0dG9uJykub24oICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdtYXJrZXInKTtcbiAgICAgICAgLy8kKGlkKS5hZGRDbGFzcygnaG92ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICBcbiAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnLnBhZ2UtdGVtcGxhdGUtcmVnaW9ucyAjbWFwLWJveCAubG9jYXRpb25zJykuY3NzKCdvcGFjaXR5JywgMSk7XG4gICAgfSk7XG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG5cblxuIiwiKGZ1bmN0aW9uIChkb2N1bWVudCwgd2luZG93LCAkKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIFJlc3BvbnNpdmUgdmlkZW8gZW1iZWRzXG5cdHZhciAkYWxsX29lbWJlZF92aWRlb3MgPSAkKFwiaWZyYW1lW3NyYyo9J3lvdXR1YmUnXSwgaWZyYW1lW3NyYyo9J3ZpbWVvJ11cIik7XG5cblx0JGFsbF9vZW1iZWRfdmlkZW9zLmVhY2goZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgX3RoaXMgPSAkKHRoaXMpO1xuXG5cdFx0aWYgKF90aGlzLnBhcmVudCgnLmVtYmVkLWNvbnRhaW5lcicpLmxlbmd0aCA9PT0gMCkge1xuXHRcdCAgX3RoaXMud3JhcCgnPGRpdiBjbGFzcz1cImVtYmVkLWNvbnRhaW5lclwiPjwvZGl2PicpO1xuXHRcdH1cblxuXHRcdF90aGlzLnJlbW92ZUF0dHIoJ2hlaWdodCcpLnJlbW92ZUF0dHIoJ3dpZHRoJyk7XG5cbiBcdH0pO1xuICAgIFxuXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG4iLCIvLyBSZXZlYWxcbihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnBhZ2UtdGVtcGxhdGUtcmVnaW9ucyBidXR0b25bZGF0YS1yZWdpb25dJywgbG9hZFJlZ2lvbik7XG4gICAgXG4gICAgZnVuY3Rpb24gbG9hZFJlZ2lvbigpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgdmFyICRyZWdpb24gPSAkKCcjJyArICR0aGlzLmRhdGEoJ3JlZ2lvbicpICk7XG4gICAgICAgIHZhciAkbW9kYWwgPSAkKCcjJyArICR0aGlzLmRhdGEoJ29wZW4nKSk7XG4gICAgICAgIFxuICAgICAgICBpZiggJHJlZ2lvbi5zaXplKCkgKSB7XG4gICAgICAgICAgJCgnLmNvbnRhaW5lcicsICRtb2RhbCApLmh0bWwoJHJlZ2lvbi5odG1sKCkpOyBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFxuICAgICQoZG9jdW1lbnQpLm9uKCdjbG9zZWQuemYucmV2ZWFsJywgJyNyZWdpb25zJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICAvLyByZW1vdmUgYWN0aW9uIGJ1dHRvbiBjbGFzc1xuICAgICAgICAkKCcjbWFwLWJveCBidXR0b24nKS5yZW1vdmVDbGFzcyggXCJob3ZlclwiICk7XG4gICAgfSk7XG4gICAgXG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy50ZW1wbGF0ZS1idXNpbmVzcy1saW5lcyBidXR0b25bZGF0YS1jb250ZW50XScsIGxvYWRNYXApO1xuICAgIFxuICAgIGZ1bmN0aW9uIGxvYWRNYXAoKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkbWFwID0gJCgnIycgKyAkdGhpcy5kYXRhKCdjb250ZW50JykgKTtcbiAgICAgICAgdmFyICRtb2RhbCA9ICQoJyMnICsgJHRoaXMuZGF0YSgnb3BlbicpKTtcbiAgICAgICAgXG4gICAgICAgIGlmKCAkbWFwLnNpemUoKSApIHtcbiAgICAgICAgICAkKCcuY29udGFpbmVyJywgJG1vZGFsICkuaHRtbCgkbWFwLmh0bWwoKSk7IFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2Nsb3NlZC56Zi5yZXZlYWwnLCAnI21hcHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykuZmluZCgnLmNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgICQoJy5tYXAnKS5zdG9wKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmNzcyh7J29wYWNpdHknOicwJ30pO1xuICAgICAgICAkKCcjbWFwLTAnKS5zdG9wKCkuY3NzKHsnb3BhY2l0eSc6JzEnfSk7XG4gICAgfSk7XG4gICAgXG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy50ZW1wbGF0ZS1wb3J0Zm9saW8tbGFuZC1yZXNvdXJjZXMgYnV0dG9uW2RhdGEtcHJvamVjdF0nLCBsb2FkUHJvamVjdCk7XG4gICAgXG4gICAgZnVuY3Rpb24gbG9hZFByb2plY3QoKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkcHJvamVjdCA9ICQoJyMnICsgJHRoaXMuZGF0YSgncHJvamVjdCcpICk7XG4gICAgICAgIHZhciAkbW9kYWwgPSAkKCcjJyArICR0aGlzLmRhdGEoJ29wZW4nKSk7XG4gICAgICAgIFxuICAgICAgICBpZiggJHByb2plY3Quc2l6ZSgpICkge1xuICAgICAgICAgICQoJy5jb250YWluZXInLCAkbW9kYWwgKS5odG1sKCRwcm9qZWN0Lmh0bWwoKSk7IFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgXG4gICAgJChkb2N1bWVudCkub24oJ2Nsb3NlZC56Zi5yZXZlYWwnLCAnI3Byb2plY3RzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5jb250YWluZXInKS5lbXB0eSgpO1xuICAgIH0pO1xuICAgICAgICBcbiAgICBcbn0oZG9jdW1lbnQsIHdpbmRvdywgalF1ZXJ5KSk7XG5cblxuXG4iLCIoZnVuY3Rpb24gKGRvY3VtZW50LCB3aW5kb3csICQpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0JChkb2N1bWVudCkub24oXG4gICAgICAnb3Blbi56Zi5yZXZlYWwnLCAnI21vZGFsLXNlYXJjaCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKFwiaW5wdXRcIikuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgfVxuICAgICk7XG4gICAgXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpOyIsIihmdW5jdGlvbiAoZG9jdW1lbnQsIHdpbmRvdywgJCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBmdW5jdGlvbiBoaWRlX2hlYWRlcl9tZW51KCBtZW51ICkge1xuICAgICAgICBcbiAgICAgICAgdmFyIG1haW5NZW51QnV0dG9uQ2xhc3MgPSAnbWVudS10b2dnbGUnLFxuXHRcdHJlc3BvbnNpdmVNZW51Q2xhc3MgPSAnZ2VuZXNpcy1yZXNwb25zaXZlLW1lbnUnO1xuICAgICAgICBcbiAgICAgICAgJCggbWVudSArICcgLicgKyBtYWluTWVudUJ1dHRvbkNsYXNzICsgJywnICsgbWVudSArICcgLicgKyByZXNwb25zaXZlTWVudUNsYXNzICsgJyAuc3ViLW1lbnUtdG9nZ2xlJyApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoICdhY3RpdmF0ZWQnIClcblx0XHRcdC5hdHRyKCAnYXJpYS1leHBhbmRlZCcsIGZhbHNlIClcblx0XHRcdC5hdHRyKCAnYXJpYS1wcmVzc2VkJywgZmFsc2UgKTtcblxuXHRcdCQoIG1lbnUgKyAnIC4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcsJyArIG1lbnUgKyAnIC4nICsgcmVzcG9uc2l2ZU1lbnVDbGFzcyArICcgLnN1Yi1tZW51JyApXG5cdFx0XHQuYXR0ciggJ3N0eWxlJywgJycgKTtcbiAgICB9XG4gICAgXG4gICAgdmFyIHNjcm9sbG5vdyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgLy8gaWYgc2Nyb2xsbm93KCktZnVuY3Rpb24gd2FzIHRyaWdnZXJlZCBieSBhbiBldmVudFxuICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGhpcy5oYXNoO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVsc2UgaXQgd2FzIGNhbGxlZCB3aGVuIHBhZ2Ugd2l0aCBhICNoYXNoIHdhcyBsb2FkZWRcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQgPSBsb2NhdGlvbi5oYXNoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2FtZSBwYWdlIHNjcm9sbFxuICAgICAgICAkLnNtb290aFNjcm9sbCh7XG4gICAgICAgICAgICBzY3JvbGxUYXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgIGJlZm9yZVNjcm9sbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCgnLnNpdGUtaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2ZpeGVkIHNocmluayBuYXYtZG93bicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFmdGVyU2Nyb2xsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2l0ZS1oZWFkZXInKS5yZW1vdmVDbGFzcygnZml4ZWQgc2hyaW5rIG5hdi1kb3duJyk7XG4gICAgICAgICAgICAgICAgaWYoJCh0YXJnZXQpLmhhc0NsYXNzKCd0eXBlLXBlb3BsZScpICkge1xuICAgICAgICAgICAgICAgICAgICAkKHRhcmdldCkuZmluZCgnLmhlYWRlcicpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBpZiBwYWdlIGhhcyBhICNoYXNoXG4gICAgaWYgKGxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgJCgnaHRtbCwgYm9keScpLnNjcm9sbFRvcCgwKS5zaG93KCk7XG4gICAgICAgIC8vIHNtb290aC1zY3JvbGwgdG8gaGFzaFxuICAgICAgICBzY3JvbGxub3coKTtcbiAgICB9XG5cbiAgICAvLyBmb3IgZWFjaCA8YT4tZWxlbWVudCB0aGF0IGNvbnRhaW5zIGEgXCIvXCIgYW5kIGEgXCIjXCJcbiAgICAkKCdhW2hyZWYqPVwiL1wiXVtocmVmKj0jXScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gaWYgdGhlIHBhdGhuYW1lIG9mIHRoZSBocmVmIHJlZmVyZW5jZXMgdGhlIHNhbWUgcGFnZVxuICAgICAgICBpZiAodGhpcy5wYXRobmFtZS5yZXBsYWNlKC9eXFwvLywnJykgPT09IGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCcnKSAmJiB0aGlzLmhvc3RuYW1lID09PSBsb2NhdGlvbi5ob3N0bmFtZSkge1xuICAgICAgICAgICAgLy8gb25seSBrZWVwIHRoZSBoYXNoLCBpLmUuIGRvIG5vdCBrZWVwIHRoZSBwYXRobmFtZVxuICAgICAgICAgICAgJCh0aGlzKS5hdHRyKFwiaHJlZlwiLCB0aGlzLmhhc2gpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBzZWxlY3QgYWxsIGhyZWYtZWxlbWVudHMgdGhhdCBzdGFydCB3aXRoICNcbiAgICAvLyBpbmNsdWRpbmcgdGhlIG9uZXMgdGhhdCB3ZXJlIHN0cmlwcGVkIGJ5IHRoZWlyIHBhdGhuYW1lIGp1c3QgYWJvdmVcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJ2FbaHJlZl49I106bm90KFtocmVmPSNdKScsIHNjcm9sbG5vdyApO1xuXG59KGRvY3VtZW50LCB3aW5kb3csIGpRdWVyeSkpO1xuXG4iXX0=
