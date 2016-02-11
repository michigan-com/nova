'use strict';

import React from 'react';
import SectionFilter from './components/section-filter';

export default class SectionFilters extends React.Component {
  static FILTER_HEIGHT = 65

  constructor(props) {
    super(props);

    this.lastScrollTop = document.body.scrollTop;
    this.scrollVelocity = 0;

    this.threshold = 20;

    this.state = {
      showFilters: true
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.scrollHook);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollHook);
  }

  scrollHook = () => {
    let scrollTop = document.body.scrollTop;
    let delta = scrollTop - this.lastScrollTop;

    if (scrollTop < 0 || (scrollTop + window.innerHeight) >= document.body.clientHeight) return;

    if ((delta > 0 && this.scrollVelocity > 0) || (delta < 0 && this.scrollVelocity < 0))  {
      this.scrollVelocity += delta;
    }
    else {
      this.scrollVelocity = delta;
    }

    if (Math.abs(this.scrollVelocity) > this.threshold) {
      if (this.scrollVelocity < 0 && !this.state.showFilters) {
        this.setState({ showFilters: true });
      } else if (this.scrollVelocity > 0 && this.state.showFilters) {
        this.setState({ showFilters: false });
      }
    }

    this.lastScrollTop = scrollTop;
  }

  render() {
    let activeSection = this.props.activeSectionIndex;

    let style = {};
    if (!this.state.showFilters) style.bottom = `-${SectionFilters.FILTER_HEIGHT}px`;

    return (
      <div className='filters-container' style={ style }>
        <div className='includes'>includes:</div>
        <div className='filters'>
          {
            this.props.sections.map(function(section, index) {
              return (
                <SectionFilter name={ section.name }
                            displayName={ section.displayName }
                            active={ section.showArticles }
                            key={ `section-${section.name}` }/>
              )
            })
          }
        </div>
      </div>
    )
  }
}
