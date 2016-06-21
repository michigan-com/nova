'use strict';

import React from 'react';

import { getTopArticleStyle } from './top-article';
import { brandIcon } from '../../../../config';

const INLINE = 'inline';
const LARGE = 'large';

export default class InfoTile extends React.Component {
  static TileTypes = [INLINE, LARGE];

  getTileStyle() {
    switch (this.props.type) {
      case INLINE:
      default:
        return getTopArticleStyle(this.props.rank);
    }
  }

  renderInlineTile() {
    let style = {};
    style.animationDelay = `${this.props.rank * 50}ms`;
    return (
      <div className={`info-tile ${INLINE}`} style={style}>
        <div className="img-container">
          <img src={`/img/${brandIcon}/info-card-image.svg`} alt="Info Card" />
        </div>
        <div className="text-container">
          {this.props.infoText}
        </div>
      </div>
    );
  }

  renderLargeTile() {
    return (
      <div className={`info-tile ${LARGE}`}>
        {this.props.infoText}
      </div>
    );
  }

  renderTile() {
    switch (this.props.type) {
      case INLINE:
        return this.renderInlineTile();
      case LARGE:
        return this.renderLargeTile();
      default:
        return this.renderInlineTile();
    }
  }

  render() {
    let style = this.getTileStyle(); // hey that rhymes
    return (
      <div className="info-tile-container" style={style}>
        {this.renderTile()}
      </div>
    );
  }
}

InfoTile.propTypes = {
  type: React.PropTypes.string.isRequired,
  rank: React.PropTypes.number.isRequired,
  infoText: React.PropTypes.element,
};
