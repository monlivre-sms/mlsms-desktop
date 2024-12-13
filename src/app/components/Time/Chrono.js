import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { UncontrolledTooltip } from 'reactstrap';

import moment from 'moment';
import uuid from 'uuid';
import { dateFormat } from '../../util/date';

class Chrono extends Component {

    constructor(props) {
        super(props);

        this.state = {
            duration: null,
        };

        this.durationInterval = null;
        this.id = uuid();

        this.setDuration = this.setDuration.bind(this);
        this.endChrono = this.endChrono.bind(this);
    }

    componentDidMount() {
        this.setDuration();
    }

    componentDidUpdate(prevProps, prevState) {
        if(!this.state.duration) {
            this.setDuration();
        } else if(this.state.duration && !this.durationInterval) {
            this.durationInterval = setInterval(() => {
                this.setDuration();
            }, 1000);
        }
    }

    componentWillUnmount() {
        clearInterval(this.durationInterval);
    }

    getThresholdClassName() {
        if(this.props.threshold && moment.utc().isSameOrAfter(this.props.threshold)) {
            return 'text-danger';
        }
        return '';
    }

    setDuration() {
        if(this.props.date) {
            this.setState({
                duration: moment.duration(moment(this.props.date).diff(moment.utc())),
            });
        }
    }

    endChrono() {
        setTimeout(() => {
            clearInterval(this.durationInterval);
            this.props.onEnd && this.props.onEnd();
        }, 1000);
    }

    render() {
        if(this.state.duration) {
            let days = this.state.duration.days();
            let hours = this.state.duration.hours();
            let minutes = this.state.duration.minutes();
            let seconds = this.state.duration.seconds();

            if(days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
                this.endChrono();
            } else if(!this.props.allowNegative && (days < 0 || hours < 0 || minutes < 0 || seconds < 0)) {
                clearInterval(this.durationInterval);
                return null;
            }

            days = `${days}`.length < 2 ? `0${days}` : days;
            hours = `${hours}`.length < 2 ? `0${hours}` : hours;
            minutes = `${minutes}`.length < 2 ? `0${minutes}` : minutes;
            seconds = `${seconds}`.length < 2 ? `0${seconds}` : seconds;

            return (
                <Fragment>
                    <span id={`chrono-${this.id}`} className={`${this.getThresholdClassName()}`}>
                        {`${days !== '00' ? `${days}:` : ''}${hours !== '00' ? `${hours}:` : ''}${minutes}:${seconds}`}
                    </span>
                    <UncontrolledTooltip target={`chrono-${this.id}`}>
                        {
                            days !== '00'
                            ? <span>{days}<FormattedMessage id="days" defaultMessage="day(s)" />{' '}</span>
                            : null
                        }
                        {
                            hours !== '00'
                            ? <span>{hours}<FormattedMessage id="hours" defaultMessage="hour(s)" />{' '}</span>
                            : null
                        }
                        {' '}<span>{minutes}<FormattedMessage id="minutes" defaultMessage="minute(s)" /></span>
                        {' '}<span>{seconds}<FormattedMessage id="seconds" defaultMessage="second(s)" /></span>
                    </UncontrolledTooltip>
                </Fragment>
            );
        }
        return null;
    }

}


Chrono.propTypes = {
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    onEnd: PropTypes.func,
    allowNegative: PropTypes.bool,
    threshold: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default Chrono;
