import React from 'react';
import PropTypes from 'prop-types';
// import { CSSTransitionGroup } from 'react-transition-group';
import LazyLoad from 'react-lazyload';

// @lazyload({
//   height: 200,
//   once: true,
//   offset: 100
// })


function LazyLoader({ children }) {
    return (
        <LazyLoad height={200} once>
            {children}
        </LazyLoad>
    );
}

LazyLoader.propTypes = {
    children: PropTypes.object.isRequired,
};

export default LazyLoader;
