import React, { Component } from 'react';
import withRouter from '../Router/WithRouter';


class ScrollToTop extends Component {

    componentDidUpdate(prevProps) {
        console.log('ScrollToTop', prevProps.location, this.props.location, this.props);
        if(this.props.location !== prevProps.location) {
            window.scrollTo(0, 0)
        }
    }

    render() {
        return this.props.children
    }
}

export default withRouter(ScrollToTop)
