/* jshint browser:true */
'use strict'

var React = require('react')
var App = require('./components/App.jsx')
var HelloReact = require('./components/Hello/HelloReact.jsx')

React.render(React.createElement(App, {}), document.getElementById('app'))
