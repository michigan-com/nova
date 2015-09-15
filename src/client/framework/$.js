import { $, find } from 'domtastic/commonjs/selector';
import { on, off } from 'domtastic/commonjs/event';
import { hasClass, toggleClass } from 'domtastic/commonjs/dom/class';
import { css } from 'domtastic/commonjs/css';
import { some } from 'domtastic/commonjs/array';
import { append } from 'domtastic/commonjs/dom/index';

$.fn = !!$.fn ? $.fn : {};
$.fn.on = on;
$.fn.off = off;
$.fn.hasClass = hasClass;
$.fn.toggleClass = toggleClass;
$.fn.some = some;
$.fn.find = find;
$.fn.css = css;
$.fn.append = append;

module.exports = $;