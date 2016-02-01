import React from 'react'
import ReactDOM from 'react-dom'
import './hello.css'

﻿class HelloReact extends React.Component {
    render() {
        return (
            <h2>Hello World!</h2>
        );
    }
}

ReactDOM.render(
    <HelloReact />,
    document.getElementById('hello')
)
