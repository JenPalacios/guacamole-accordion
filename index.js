/*eslint-disable*/
(function (root, factory) {
  if(typeof define === 'function' && define.amd) {
    define([], factory(root));
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    root.accordion = factory(root);
  }
})(typeof global !== 'undefined' ? global : this.window || this.global, function(root) {
    'use strict';

    // Element.matches() polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
  }

  // Variables
  const window = root;
  const publicMethods = {};
  let settings;

  const defaults = {
    // Selectors
    selectorToggle: '.accordion-toggle',
    selectorContent: '.accordion',

    // Classes
    toggleClass: 'active',
    contentClass: 'active',
    init: 'js-accordion',

    // Callbacks
    before: function() {},
    after: function() {}
  };

  const extend = function() {
    // Variables
    const extended = {};
    const deep = false;
    const length = arguments.length;
    let i = 0;

    // Check if a deep merge
    if(Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
      deep = arguments[0];
      i++
    }

    // Merge the object into the extended object
    const merge = function(obj) {
      for(var prop in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, prop)) {
          // If deep merge and property is an object, merge properties
          if(deep && Object.prototype.toString.call(obj[prop]) === '[object Object') {
            extended[prop] = extend(true, extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };

    // Loop through each object and conduct a merge
    for(; i < length; i++) {
      var obj = arguments[i];
      merge(obj);
    }

    return extended;
  };

  // Check if the target content is already active
  const isActive = function (content, toggle) {
    if (content.classList.contains(settings.contentClass)) {
      settings.before(content, toggle);
      content.classList.remove(settings.contentClass);
      toggle.classList.remove(settings.toggleClass);
      settings.after(content, toggle);
      return true;
    }
  };

  // Close all items with a matching selector
  const closeItems = function(selector, activeClass) {
    var items = document.querySelectorAll(selector);
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove(activeClass);
    }
  }

  // Close all accordions and toggles
  publicMethods.closeAccordions = function() {
    closeItems(settings.selectorContent, settings.contentClass);
    closeItems(settings.selectorToggle, settings.toggleClass);
  }

  publicMethods.destroy = function() {

    // Only run if settings is set
    if(!settings) return;

    // Remove event listener
    document.removeEventListener('click', runAccordion, false);

    // Remove the initialization class
    document.body.classList.remove(settings.init);

    // Reset settings
    settings = null;
  };

  // Run our accordion script
  const runAccordion = function () {
    // Prevent default link behaviour
    event.preventDefault();

    // Only run if the clicked link was an accordion toggle
    if (!event.target.classList.contains('accordion-toggle')) return;

    // Get the target content
    const content = document.querySelector(event.target.hash);
    if (!content) return;

    // If the content is already expanded, collapse it and quit
    const expanded = isActive(content, event.target);
    if (expanded) return;

    // Run our callback before
    settings.before(content, event.target);

    // Close all accordion content and toggles
    publicMethods.closeAccordions();

    // Open our target content area and toggle link
    content.classList.add(settings.contentClass);
    event.target.classList.add(settings.toggleClass);

    // Run our callback after
    settings.after(content, event.target);
  };

  // Initialize our plugin
  publicMethods.init = function(options) {
    // Destroy any previous initializations
    publicMethods.destroy();

    // Feature test
    const supports = 'querySelector' in document && 'addEventListener' in window;

    if(!supports) return;

    // Merge user options with the defaults
    settings = extend(defaults, options || {});

    // Listen for click events
    document.addEventListener('click', runAccordion, false);

    // Add our initialization class
    document.body.className += settings.init;
  }

  // Return our public APIs
  return publicMethods;
});
