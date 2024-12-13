import React from 'react';
import PropTypes from 'prop-types';

export default function PageTitle(props) {
    return (
        <div className="align-items-center justify-content-between my-4 pb-3 text-center border-bottom">
            <h1 className="h3 mb-0 text-primary">{props.children}</h1>
        </div>
    );
}

PageTitle.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
    ]),
};
