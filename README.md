df-tab-menu
===========

Responsive tabs with dropdown menu

## Purpose
Provide a reponsive tab menu that gracefully overflows into a dropdown.

Demo: http://digitalfondue.ch/df-tab-menu/

## Usage

### Install

* `$ bower install df-tab-menu`

Once installed, add df-tab-menu as a dependency in your module:

* `angular.module('myModule', ['digitalfondue.dftabmenu']);`

### Requirements

* **AngularJS v1.2.0+** is supported

### Integration

Example
```html
<ol df-tab-menu menu-control="{{navigationState}}">
	<li data-menu-item="state1"><a data-ng-href="#"><span>Item 1</span></a></li>
	<li data-menu-item="state2"><a data-ng-href="#"><span>Item 2</span></a></li>
	<li data-more-menu-item><a data-ng-href="#">More +</a></li>
</ol>
```

* only **ol** and **ul** are valid root elements
* **menu-control** is used to control which tab item is the current one. It can be anything available in your scope. Example: using ui-router state name `$scope.navigationState = $state.current.name;`
* each **data-menu-item** refers to a possible state provided by **menu-control**. If a state is invalid, an exception is throw, and the directive will fail to render correctly
* **data-more-menu-item** is used to generate the dropdown entry when that contains the menu items overflow. 
* bootstrap tab classes can be added via the attribute **theme="bootstrap"** on the root element
