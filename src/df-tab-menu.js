(function() {

	'use strict';
	
	angular.module('digitalfondue.dftabmenu', []).directive('dfTabMenu', ['$window', function($window) {
		return {
			restrict : 'E',
			compile: function($element, $attrs) {
				var doc = $window.document;
				var root = $element[0];
				$element.append('<ol class=\"df-tab-menu\" main-menu></ol>');
				var list = $element.find('ol');
				
				//move elements to the main menu
				var elements = angular.element(root.querySelectorAll('li[menu-item]'));
				for(var e = 0;e < elements.length; e++) {
					list.append(elements[e]);
				};
				
				$element.find('ol').append('<li more-menu-item>' +
						'<a href dropdown-toggle>' + 
						$attrs.moreMenuTemplate + 
						'</a><ul more-menu class=\"df-tab-menu-dropdown\"></ul></li>');
				
				//clone elements into the more menu
				var moreList = angular.element(root.querySelector('ul.df-tab-menu-dropdown'));
				var moreElements = root.querySelectorAll('ol > li[menu-item]');
				for(var e = 0;e < elements.length; e++) {
					moreList.append(angular.element(moreElements[e]).clone());
				};
				
				return function ($scope, $element, $attrs) {
					var root = $element[0];
					var wdw = angular.element($window);
					var currentDisplayItems = null;
					
					var elementsSize = {};
					var getElementsSize = function() {
						var elements = root.querySelectorAll('ol > li[menu-item]');
						angular.element(elements).removeClass('ng-hide');
						for(var e = 0;e < elements.length; e++) {
							var size = elements[e].offsetWidth;
							if(size > 0) {
								elementsSize[e] = elements[e].offsetWidth;
							}
						};
					}
					
					// handle directive (such as ng-translate) that may change the size of the elements
					var unregister = $scope.$watch(function() {
						var element = root.querySelector('ol[main-menu].df-tab-menu > li[menu-item].df-tab-menu-active');
						return element != null ? element.scrollWidth : 0;
					}, function(w, oldW) {
						if(w != null && w > 0) {
							getElementsSize();
							buildMenu();
						}
					}, true);
					
					var getMoreElementSize = function() {
						angular.element(root.querySelector('ol > li[more-menu-item]')).removeClass('ng-hide');
						return root.querySelector('ol[main-menu].df-tab-menu > li[more-menu-item]').offsetWidth;
					}
					
					var getVisibleItems = function(_maxWidth, _activeItemIndex) {
						var visibleItems = [];
						//40px: scrollbar tolerance. Not proud of this, but it works...
						var sum = elementsSize[_activeItemIndex] + getMoreElementSize() + 40;
						visibleItems.push(_activeItemIndex);
						var items = root.querySelectorAll('ol > li[menu-item]');
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
						var items = root.querySelectorAll('ol > li[menu-item]');
						for(var i = 0; i < items.length; i++) {
							if(angular.element(items[i]).hasClass('df-tab-menu-active')) {
								return i;
							}
						}
					}
					
					var buildMenu = function() {
						var maxWidth = root.querySelector('ol').offsetWidth;
						var activeItemIndex = getActiveItemIndex();
						var visibleItems = getVisibleItems(maxWidth, activeItemIndex);
						
						if(visibleItems.length < root.querySelectorAll('ol > li[menu-item]').length) {
							currentDisplayItems = visibleItems.length;
							angular.element(root.querySelector('ol > li[more-menu-item]')).removeClass('ng-hide');
							
							var elements = root.querySelectorAll('ol > li[menu-item]');
							
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
							currentDisplayItems = null;
							angular.element(root.querySelector('ol > li[more-menu-item]')).addClass('ng-hide');
							angular.element(root.querySelectorAll('ol > li[menu-item]')).removeClass('ng-hide');
							$scope.$evalAsync(function() {
								$scope.dropdownOpen = false;
							});
						}
					};
					
					//dropdown controls
					$scope.dropdownOpen = false;
					
					var closeDropdown = function() {
						$scope.$apply(function() {
							$scope.dropdownOpen = false;
						});
					};
					
					$scope.$watch('dropdownOpen', function(d) {
						if(d) {
							angular.element(root.querySelector('.df-tab-menu a[dropdown-toggle]')).addClass('df-tab-menu-dropdown-open');
							angular.element(doc).bind('click', closeDropdown);
						} else {
							angular.element(root.querySelector('.df-tab-menu a[dropdown-toggle]')).removeClass('df-tab-menu-dropdown-open');
							angular.element(doc).unbind('click', closeDropdown);
						}
					});
					
					var toggleDropdown = function(e) {
						e.stopPropagation();
						$scope.$apply(function() {
							$scope.dropdownOpen = !$scope.dropdownOpen;	
						});
					};
					
					angular.element(root.querySelector('.df-tab-menu a[dropdown-toggle]')).bind('click', toggleDropdown);
					
					$attrs.$observe('menuControl', function(c) {
						if(root.querySelector('ol > li[menu-item=\"' + c + '\"]') == null) {
							throw "Invalid state: " + c + ", please verify the menu-item(s) configuration";
						}
						//set active state
						angular.element(root.querySelector('ol > li.df-tab-menu-active')).removeClass('df-tab-menu-active');
						angular.element(root.querySelector('ol > li[menu-item=\"' + c + '\"]')).addClass('df-tab-menu-active');
						$scope.dropdownOpen = false;
						// force redrawing
						currentDisplayItems = null;
						buildMenu();
		            });
					
					wdw.bind('resize', buildMenu);
					
					$scope.$on('$destroy', function() {
						wdw.unbind('resize', buildMenu);
						angular.element(root.querySelector('.df-tab-menu a[dropdown-toggle]')).unbind('click', toggleDropdown);
						angular.element(doc).unbind('click', closeDropdown);
					});
				};
		     }
		}
		
	}]);
})();