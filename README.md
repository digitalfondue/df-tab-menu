df-tab-menu
===========

Responsive tabs with dropdown menu

## Purpose
Provide a reponsive tab menu that gracefully overflows into a dropdown.

## Usage

### Install

* `$ bower install df-tab-menu`

Once installed, add videosharing-embed as a dependency in your module:

* `angular.module('myModule', ['digitalfondue.dftabmenu']);`

### Requirements

* **AngularJS v1.2.0+** is supported

### Integration

Example
```html
<data-df-tab-menu menu-control="{{navigationState}}" more-menu-template="<span>More +</span>">
	<li menu-item="state1"><a data-ng-href="#"><span>Item 1</span></a></li>
	<li menu-item="state2"><a data-ng-href="#"><span>Item 2</span></a></li>
</data-df-tab-menu>
```

* **menu-control** is used to control which tab item is the current one. It can be anything available in your scope. Example: using ui-router state name `$scope.navigationState = $state.current.name;`
* **more-menu-template** is how you want to display the overflow item
* each **menu-item** refers to a possible state provided by **menu-control**. If a state is invalid, an exception is throw, and the directive will fail to render correctly
