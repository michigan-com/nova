/**
* @module socket
*/
'use strict';

import io from 'socket.io-browserify';

/**
* DashSocket - Simple interface for connecting and interacting with socket.io
*
* @class
*/
export default class DashSocket {
  /**
  * @constructs
  * @param {String|Array} [events] Events to emit on init
  * @param {Object} Options
  * @return {Object} The DashSocket instance
  * @example
  *   var dash = new DashSocket('toppages');
  */
  constructor(events, { ondisconnect } = {}) {
    Object.assign(this, { events });
    this.rooms = {};
    this.socket = io.connect();
    this.emit(events);
    this.dc(ondisconnect);
  }

  /**
  * Emits an event that hooks into a Beat socket route which corresponds
  * with a room
  *
  * @memberof DashSocket#
  */
  emit(events) {
    if (typeof events === 'undefined') events = this.events;

    if (!Array.isArray(events)) {
      events = [events];
    }

    for (let i = 0; i < events.length; i++) {
      let _event = events[i];
      this.socket.emit(_event);
      if (!this.rooms.hasOwnProperty(_event)) {
        this.rooms[_event] = new Room(this.socket, _event);
      }
    }
  }

  /**
  * Handles what to do when socket disconnects
  *
  * @memberof DashSocket#
  * @param {Function} [dcb] On disconnect callback
  */
  dc(dcb) {
    if (typeof dcb === 'undefined') {
      dcb = data => {
        this.log('You were disconnected from the socket');
        this.log('Attempting to reconnect to socket ...');
        this.socket.socket.reconnect();
        this.emit();
      };
    }
    this.socket.on('disconnect', dcb);
  }

  /**
  * Grabs the Room# instance by name
  *
  * @memberof DashSocket#
  * @param {String} [name] The name of the room
  * @return {Object} The Room# instance
  */
  room(name) {
    return this.rooms[name];
  }

  /**
  * Quick and dirty logger with timestamp for all socket logs
  *
  * @memberof DashSocket#
  * @param {String} [msg] The message to send to console.log
  */
  log(msg) {
    console.log(new Date().toString() + ': ' + msg);
  }
}

/**
* Room - Simple interface for room events.  This class allows us to specify
* a room to listen for an event on.
*
* @class
*/
class Room {
  /**
  * @constructs
  * @param {Object} [socket] The socket instance, ex var socket = io.connect()
  * @param {String} [name] The name of the room to join
  */
  constructor(socket, name) {
    Object.assign(this, { socket, name });
  }

  /**
  * @constructs
  * @param {String} [event_name] The name of the event, ex. 'message'
  * @param {Function} [cb] The event handler callback
  */
  on(event_name, cb) {
    this.socket.on(this.name + '-' + event_name, cb);
  }
}
