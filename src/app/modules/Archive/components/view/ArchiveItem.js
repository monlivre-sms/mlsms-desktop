import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Row, Col, Card, CardHeader, CardTitle, Button, Alert } from 'reactstrap';
import FontAwesome from 'react-fontawesome';

import { dateFormat } from '../../../../util/date';

class ArchiveItem extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isHover: false,
        };

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect() {
        if(this.props.archive && this.props.onSelect) {
            this.props.onSelect(this.props.archive);
        }
    }

    render() {
        const { archive } = this.props;
        return (
            <Card className="mb-1 p-2 text-center" style={{position: 'relative'}} onClick={() => console.log(archive)} onMouseOver={() => this.setState({isHover: true})} onMouseLeave={() => this.setState({isHover: false})}>
                <CardTitle className="mb-3">
                    <h3><FormattedMessage id="archiveName" defaultMessage="Archive of the {date}" values={{date: dateFormat(archive.date, 'LL')}} /></h3>
                </CardTitle>

                <small><em className="mt-4 text-primary">{archive.path.split('/').pop()}</em></small>

                {this.state.isHover && <Button color="primary" style={{position: 'absolute', top: 'calc(50% - 30px)', right: '5px'}} onClick={this.handleSelect}><FontAwesome name="chevron-right" className="py-3" /></Button>}
            </Card>
        )
    }
}

ArchiveItem.propTypes = {
    archive: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
}

export default ArchiveItem;
