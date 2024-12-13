import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';

import { openExternalLink } from '../../util/link';

class HtmlComponent extends Component {

    constructor(props) {
        super(props);
        this.transform = this.transform.bind(this);
    }

    transform(node, index) {
        // all links must open in a new window
        if(node.type === 'tag' && node.name === 'a') {
            // node.attribs.target = '_blank';
            // return convertNodeToElement(node, index, this.transform);
            return <a key={index} href="#" onClick={(event) => { event.preventDefault(); openExternalLink(node.attribs.href); }}>{convertNodeToElement(node, index)}</a>;
        }
    }

    renderHtml() {
        if(this.props.text) {
            return ReactHtmlParser(this.props.text, {
                transform: this.transform,
            })
        }
    }

    render() {
        return <div>{this.renderHtml()}</div>
    }

}

HtmlComponent.propTypes = {
    text: PropTypes.string.isRequired,
};

export default HtmlComponent;
