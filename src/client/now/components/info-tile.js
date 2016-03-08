'use strict';

import React from 'react';

import { TOP_ARTICLE_STYLE, getTopArticleStyle } from './top-article';
import { brandIcon } from '../../../../config';

const INLINE = 'inline';
const LARGE = 'large';

export default class InfoTile extends React.Component {
  static TileTypes = [INLINE, LARGE];

  getTileStyle() {
    switch (this.props.type) {
      case INLINE:
        return getTopArticleStyle(this.props.rank);
    }
    return {}
  }

  _renderInlineTile() {
    let style = {};
    style.animationDelay = `${this.props.rank * 50}ms`;
    return (
      <div className={ `info-tile ${INLINE}` } style={ style }>
        <div className='img-container'>
          <img src={ `/img/${brandIcon}/info-card-image.svg` }/>
        </div>
        <div className='text-container'>
          { this.props.infoText }
        </div>
      </div>
    )
  }

  _renderLargeTile() {
    return (
      <div className={ `info-tile ${LARGE}` }>
        { this.props.infoText }
      </div>
    )
  }

  renderTile() {
    switch (this.props.type) {
      case INLINE:
        return this._renderInlineTile();
      case LARGE:
        return this._renderLargeTile();
    }
    return null;
  }

  render() {
    let style = this.getTileStyle(); // hey that rhymes
    return (
      <div className='info-tile-container' style={ style }>
        { this.renderTile() }
      </div>
    )
  }
}
