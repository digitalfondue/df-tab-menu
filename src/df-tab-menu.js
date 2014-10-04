(function() {

	'use strict';
	
	angular.module('digitalfondue.dftabmenu', []).directive('dfTabMenu', ['$window','$timeout', function($window, $timeout) {
		return {
			restrict : 'E',
			compile: function($element, $attrs) {
				var doc = $window.document;
				var root = $element[0];
				
				var addBootstrapTheme = $attrs.theme === 'bootstrap';
				
				function bootstrap(s) {
					return addBootstrapTheme ? s : '';
				}
				
				var validBaseElements = {ol:'ol', ul:'ul'};
				
				var baseElement = (validBaseElements[$attrs.baseElement] || 'ol');
				var baseElementSelector = baseElement+'[main-menu].df-tab-menu';
				
				$element.append('<' + baseElement + ' class=\"df-tab-menu '+bootstrap('nav nav-tabs')+'\" main-menu></' + baseElement + '>');
				var list = angular.element(root.querySelector(baseElementSelector));
				
				//move elements to the main menu
				var elements = angular.element(root.querySelectorAll('li[menu-item]'));
				for(var e = 0;e < elements.length; e++) {
					list.append(elements[e]);
				};
				
				angular.element(root.querySelector(baseElementSelector)).append('<li more-menu-item '+bootstrap('class="dropdown"')+'>' +
						'<a href dropdown-toggle class="dropdown-toggle">' + 
						$attrs.moreMenuTemplate + 
						'</a><ul more-menu class=\"df-tab-menu-dropdown '+bootstrap('dropdown-menu')+'\"></ul></li>');
				
				//clone elements into the more menu
				var moreList = angular.element(root.querySelector('ul.df-tab-menu-dropdown'));
				var moreElements = root.querySelectorAll(baseElementSelector + ' > li[menu-item]');
				for(var e = 0;e < elements.length; e++) {
					moreList.append(angular.element(moreElements[e]).clone());
				};
				
				return function ($scope, $element, $attrs) {
					var root = $element[0];
					var wdw = angular.element($window);
					var dropdownOpen = false;
					
					var getElementsSize = function() {
						var elements = root.querySelectorAll(baseElementSelector + ' > li[menu-item]');
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
						var element = root.querySelector(baseElementSelector+' > li[menu-item].df-tab-menu-active');
						return element != null ? element.scrollWidth : 0;
					}, function(w, oldW) {
						if(w != null && w > 0) {
							buildMenu();
						}
					}, true);
					
					var getMoreElementSize = function() {
						angular.element(root.querySelector(baseElementSelector + ' > li[more-menu-item]')).removeClass('ng-hide');
						return root.querySelector(baseElementSelector + ' > li[more-menu-item]').offsetWidth;
					}
					
					var getVisibleItems = function(_maxWidth, _activeItemIndex) {
						var visibleItems = [];
						var elementsSize = getElementsSize();
						//40px: scrollbar tolerance. Not proud of this, but it works...
						var sum = elementsSize[_activeItemIndex] + getMoreElementSize() + 40;
						visibleItems.push(_activeItemIndex);
						var items = root.querySelectorAll(baseElementSelector + ' > li[menu-item]');
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
						var items = root.querySelectorAll(baseElementSelector + ' > li[menu-item]');
						for(var i = 0; i < items.length; i++) {
							if(angular.element(items[i]).hasClass('df-tab-menu-active')) {
								return i;
							}
						}
					}
					
					var buildMenu = function() {
						var maxWidth = root.querySelector(baseElementSelector).offsetWidth;
						var activeItemIndex = getActiveItemIndex();
						var visibleItems = getVisibleItems(maxWidth, activeItemIndex);
						
						if(visibleItems.length < root.querySelectorAll(baseElementSelector + ' > li[menu-item]').length) {
							angular.element(root.querySelector(baseElementSelector + ' > li[more-menu-item]')).removeClass('ng-hide');
							
							var elements = root.querySelectorAll(baseElementSelector + ' > li[menu-item]');
							
							var moreElements = root.querySelectorAll('ul[more-menu] > li[menu-item]');
							for(var i = 0; i < elements.length; i++) {
								if(visibleItems.indexOf(i) != -1) {
									angular.element(elements[i]).removeClass('ng-hide');
									angular.element(moreElements[i]).addClass('ng-hide');
								} else {
									angular.element(elements[i]).addClass('ng-hide');
									angular.element(moreElements[i]).removeClass('ng-hide');
								}
							}
						} else {
							angular.element(root.querySelector(baseElementSelector + ' > li[more-menu-item]')).addClass('ng-hide');
							angular.element(root.querySelectorAll(baseElementSelector + ' > li[menu-item]')).removeClass('ng-hide');
							
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
								angular.element(root.querySelector('li[more-menu-item]')).addClass('open');
							}
							angular.element(root.querySelector('.df-tab-menu a[dropdown-toggle]')).addClass('df-tab-menu-dropdown-open');
							angular.element(doc).bind('click', closeDropdown);
						} else {
							if(addBootstrapTheme) {
								angular.element(root.querySelector('li[more-menu-item]')).removeClass('open');
							}
							angular.element(root.querySelector('.df-tab-menu a[dropdown-toggle]')).removeClass('df-tab-menu-dropdown-open');
							angular.element(doc).unbind('click', closeDropdown);
						}
					};
					
					//dropdown controls
					var toggleDropdown = function(e) {
						if(e) {e.stopPropagation()};
						dropdownOpen = !dropdownOpen;
						drawDropDown();
					};
					
					angular.element(root.querySelector('.df-tab-menu a[dropdown-toggle]')).bind('click', toggleDropdown);
					
					var updateActiveState = function(c) {
						//set active state
						var e1 = angular.element(root.querySelector(baseElementSelector + ' > li.df-tab-menu-active')).removeClass('df-tab-menu-active');
						var e2 = angular.element(root.querySelector(baseElementSelector + ' > li[menu-item=\"' + c + '\"]')).addClass('df-tab-menu-active');
						
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
						angular.element(root.querySelector('.df-tab-menu a[dropdown-toggle]')).unbind('click', toggleDropdown);
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