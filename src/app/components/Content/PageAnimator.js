import React, { Fragment } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


function pageAnimator(Component) {
    return props =>
        <div className="page">
            <ReactCSSTransitionGroup
                component={Fragment}
                transitionAppear
                transitionLeave
                transitionAppearTimeout={300}
                transitionEnterTimeout={300}
                transitionLeaveTimeout={200}
                transitionName="pageAnimation"
            >
                <Component {...props} />
            </ReactCSSTransitionGroup>
        </div>;
}

export default pageAnimator;
