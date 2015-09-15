import $ from './$.js';
import { pixelToNumber } from '../lib/style';
import Velocity from 'velocity-animate';

export default class Navbar {
  constructor() {
    this.selectors = {
      navbar: '.navbar',
      menuToggle: '.navbar .menu-toggle',
      dashboardContainer: '.navbar .dashboards-container',
      dashboardMenu: '.navbar .dashboards',
      dashboardOption: '.navbar .dashboards .option'
    }

    this.initHandlers();

    this.animating = false;
  }

  initHandlers() {
    $('body').on('click', this.selectors.menuToggle, e => {

      if (this.animating) return;

      this.animating = true;
      let $container = $(this.selectors.dashboardContainer);
      let $navbar = $(this.selectors.navbar);
      let left;

      let callback;
      if ($navbar.hasClass('show')) {
        let width = pixelToNumber(window.getComputedStyle(document.getElementsByClassName('dashboards-container')[0])['width']);
        left = width * -1;
      }
      else {
        left = 0;
      }

      $navbar.toggleClass('show');
      Velocity($(this.selectors.dashboardContainer), {
        left: left
      }, () => {
          this.animating = false;
      });

    });
  }
}