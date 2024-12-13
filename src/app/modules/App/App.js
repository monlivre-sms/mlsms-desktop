import React, { Component, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Container } from 'reactstrap';
import Alert from 'react-s-alert';

// Import Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Loader from '../../components/Loader/Loader';
import { Outlet } from 'react-router-dom';
import { setMounted } from './AppActions';

// Import Actions


export function App({ dispatch, isMounted }) {
  useEffect(() => {
    dispatch(setMounted(true))
  }, []);

  if(isMounted) {
    return (
        <div>
            <div id="content-wrapper" className="app-wrapper d-flex flex-column">
                <div>
                    <Header />

                    <Container fluid className="content-wrapper" style={{ overflow: 'auto' }}>
                        <div id="content">
                            {isMounted ? <Outlet /> : <Loader />}
                        </div>
                    </Container>

                    <Footer />
                </div>

                <Alert stack position="top-right" effect="flip" timeout={10000} stack={{ limit: 5 }} />
            </div>
        </div>
    );
  }
  return null;
}

App.propTypes = {
  intl: PropTypes.object.isRequired,
  isMounted: PropTypes.bool.isRequired,
  isUpToDate: PropTypes.bool.isRequired,
};

function mapStateToProps(store, props) {
    return {
        isMounted: store.app.isMounted,
        isUpToDate: store.app.isUpToDate,
    };
}

export default connect(mapStateToProps)(injectIntl(App));
