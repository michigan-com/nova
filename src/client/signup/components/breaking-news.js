'use strict';

import React from 'react';

export default class BreakingNewsSignup extends React.Component {

  render() {
    return (
      <div className="breaking-news-signup">
        <h2>Want breaking news sent straight to your phone?</h2>

      </div>
    );
  }
}

BreakingNewsSignup.propTypes = {
  BreakingNews: React.PropTypes.object.isRequired,
  PhoneNumber: React.PropTypes.object.isRequired,
};
