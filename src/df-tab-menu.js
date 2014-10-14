(function() {

	'use strict';
	
	angular.module('digitalfondue.dftabmenu', []).directive('dfTabMenu', ['$window','$timeout', function($window, $timeout) {
		return {
			restrict : 'A',
			compile: function($element, $attrs) {
				var doc = $window.document;
				var root = $element[0];
				
				var baseTag = root.tagName;
				
				if(baseTag !== "UL" && baseTag !== "OL") {
					throw "Wrong element: only OL and UL are supported by df-tab-menu";
				}
				
				var addBootstrapTheme = $attrs.theme === 'bootstrap';
				
				function bootstrap(s) {
					return addBootstrapTheme ? s : '';
				}
				
				angular.element(root).attr('role','tablist').addClass('df-tab-menu ' + bootstrap('nav nav-tabs'));
				
				//add additional menu
				angular.element(root).append('<li role=\"more-menu-toggle\" '+bootstrap('class="dropdown"')+'>' +
						'<a href dropdown-toggle class="dropdown-toggle">' + 
						$attrs.moreMenuTemplate + 
						'</a><' + baseTag + ' role=\"more-menu\" class=\"df-tab-menu-dropdown '+bootstrap('dropdown-menu')+'\"></' + baseTag + '></li>');
				
				//clone elements into the more menu, and add aria tags
				var moreList = angular.element(root.querySelector('.df-tab-menu-dropdown'));
				var moreElements = root.querySelectorAll('li[menu-item]');
				var elements = angular.element(moreElements);
				for(var e = 0;e < elements.length; e++) {
					var newElement = angular.element(moreElements[e]).clone();
					newElement.attr({"role":"more-menu-item"});
					moreList.append(newElement);
					
					angular.element(moreElements[e]).attr({
						"aria-selected":"false",
						"role":"tab"});
				};
				
				return function ($scope, $element, $attrs) {
					var root = $element[0];
					var wdw = angular.element($window);
					var dropdownOpen = false;
					
					var getElementsSize = function() {
						var elements = root.querySelectorAll('li[role=tab]');
						angular.element(elements).removeClass('ng-hide');
						var elementsSize = [];
						for(var e = 0;e < elements.length; e++) {
							var size = elements[e].offsetWidth;
							if(size > 0) {
								elementsSize[e] = elements[e].offsetWidth;
							}
						};
						return elementsSize;
					}
					
					// handle directive (such as ng-translate) that may change the size of the elements
					var unregister = $scope.$watch(function() {
						var element = root.querySelector('li[role=tab].df-tab-menu-active');
						return element != null ? element.scrollWidth : 0;
					}, function(w, oldW) {
						if(w != null && w > 0) {
							buildMenu();
						}
					}, true);
					
					var getMoreElementSize = function() {
						angular.element(root.querySelector('li[role=more-menu-toggle]')).removeClass('ng-hide');
						return root.querySelector('li[role=more-menu-toggle]').offsetWidth;
					}
					
					var getVisibleItems = function(_maxWidth, _activeItemIndex) {
						var visibleItems = [];
						var elementsSize = getElementsSize();
						//40px: scrollbar tolerance. Not proud of this, but it works...
						var sum = elementsSize[_activeItemIndex] + getMoreElementSize() + 40;
						visibleItems.push(_activeItemIndex);
						var items = root.querySelectorAll('li[role=tab]');
						for(var i = 0; i < items.length; i++) {
							if(i != _activeItemIndex) {
								sum += elementsSize[i];
								if(sum > _maxWidth) {
									return visibleItems;
								} else {
									visibleItems.push(i);
								}
							}
						}
						return visibleItems;
					};
					
					var getActiveItemIndex = function() {
						var items = root.querySelectorAll('li[role=tab]');
						for(var i = 0; i < items.length; i++) {
							if(angular.element(items[i]).hasClass('df-tab-menu-active')) {
								return i;
							}
						}
					}
					
					var buildMenu = function() {
						var maxWidth = root.offsetWidth;
						var activeItemIndex = getActiveItemIndex();
						var visibleItems = getVisibleItems(maxWidth, activeItemIndex);
						
						var elements = root.querySelectorAll('li[role=tab]');
						var moreElements = root.querySelectorAll('li[role=more-menu-item]');
						var moreMenuToggle = root.querySelector('li[role=more-menu-toggle]');
						
						if(visibleItems.length < root.querySelectorAll('li[role=tab]').length) {
							angular.element(moreMenuToggle).removeClass('ng-hide').attr('aria-hidden','false');
							
							for(var i = 0; i < elements.length; i++) {
								if(visibleItems.indexOf(i) != -1) {
									angular.element(elements[i]).removeClass('ng-hide').attr('aria-hidden','false');
									angular.element(moreElements[i]).addClass('ng-hide').attr('aria-hidden','true');
								} else {
									angular.element(elements[i]).addClass('ng-hide').attr('aria-hidden','true');
									angular.element(moreElements[i]).removeClass('ng-hide').attr('aria-hidden','false');
								}
							}
						} else {
							angular.element(moreMenuToggle).addClass('ng-hide').attr('aria-hidden','true');
							
							angular.element(elements).removeClass('ng-hide').attr('aria-hidden','false');
							
							dropdownOpen = false;
							drawDropDown();
						}
					};
					
					var closeDropdown = function(e) {
						dropdownOpen = false;
						drawDropDown(e);
					};					
					
					var drawDropDown = function() {
						if(dropdownOpen) {
							if(addBootstrapTheme) {
								angular.element(root.querySelector('li[role=more-menu-toggle]')).addClass('open');
							}
							angular.element(root.querySelector('li[role=more-menu-toggle] a[dropdown-toggle]')).addClass('df-tab-menu-dropdown-open');
							angular.element(doc).bind('click', closeDropdown);
						} else {
							if(addBootstrapTheme) {
								angular.element(root.querySelector('li[role=more-menu-toggle]')).removeClass('open');
							}
							angular.element(root.querySelector('li[role=more-menu-toggle] a[dropdown-toggle]')).removeClass('df-tab-menu-dropdown-open');
							angular.element(doc).unbind('click', closeDropdown);
						}
					};
					
					//dropdown controls
					var toggleDropdown = function(e) {
						if(e) {e.stopPropagation()};
						dropdownOpen = !dropdownOpen;
						drawDropDown();
					};
					
					angular.element(root.querySelector('li[role=more-menu-toggle] a[dropdown-toggle]')).bind('click', toggleDropdown);
					
					var updateActiveState = function(c) {
						//set active state
						var e1 = angular.element(root.querySelector('li.df-tab-menu-active')).removeClass('df-tab-menu-active').attr('aria-selected','false');
						var e2 = angular.element(root.querySelector('li[menu-item=\"' + c + '\"]')).addClass('df-tab-menu-active').attr('aria-selected','true');
						
						if(addBootstrapTheme) {
							e1.removeClass('active');
							e2.addClass('active');
						}
					}
					
					$attrs.$observe('menuControl', function(c) {
						buildMenu();
						updateActiveState(c);
		            });
					
					wdw.bind('resize', buildMenu);

					$scope.$on('$destroy', function() {
						wdw.unbind('resize', buildMenu);
						angular.element(root.querySelector('li[role=more-menu-toggle] a[dropdown-toggle]')).unbind('click', toggleDropdown);
						angular.element(doc).unbind('click', closeDropdown);
					});
					
					
					var buildMenuTimeout;
					$scope.$watch(function() {
						$timeout.cancel(buildMenuTimeout);
						buildMenuTimeout = $timeout(function() {
							buildMenu();
							updateActiveState($attrs.menuControl);
						}, 25, false);
					});
				};
		     }
		}
		
	}]);
})();