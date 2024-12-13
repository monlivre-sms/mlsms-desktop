import React from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

// import { parseQuery } from '../../util/parser';

export default function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const [urlSearchParams] = useSearchParams() || {};
    return (
      <Component
        {...props}
        location={location}
        navigate={navigate}
        params={params}
        search={Object.fromEntries(urlSearchParams)}
      />
    );
  }

  return ComponentWithRouterProp;
}
