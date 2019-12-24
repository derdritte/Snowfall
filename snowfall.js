/**
 * Copyright (c) 2013 Eugen Rochko
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (window) {
  'use strict';

  var Flake, Snowfall;

  Snowfall = function (options) {
    if (!window.HTMLCanvasElement) {
      console.warn('Snowfall.js is aborting due to the browser not supporting <canvas>');
      return;
    }

    this.max_flakes  = 300;
    this.color       = '#aaa';
    this.position    = 'fixed';
    this.max_speed   = 0.5;
    this.max_size    = 4;

    if (typeof options !== "undefined") {
      if (typeof options.max_flakes !== "undefined") {
        this.max_flakes = options.max_flakes;
      }
      if (typeof options.color !== "undefined") {
        this.color = options.color;
      }
      if (typeof options.position !== "undefined") {
        this.position = options.position;
      }
      if (typeof options.max_speed !== "undefined") {
        this.max_speed = options.max_speed;
      }
      if (typeof options.max_size !== "undefined") {
        this.max_size = options.max_size;
      }
      // for backwards-compatibility
      if (typeof options === "number"){
        this.max_flakes = options;
      }
    }

    this.flakes = [];

    this.createCanvas();
    this.generateFlakes();
    this.registerAnimation();
    this.bindDOMEvents();
  };

  Snowfall.prototype.createCanvas = function () {
    this.canvas = document.createElement('canvas');
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext('2d');

    this.canvas.setAttribute('style', 'position: ' + this.position + '; top: 0; left: 0; z-index: 99999; pointer-events: none');
    document.body.appendChild(this.canvas);
  };

  Snowfall.prototype.bindDOMEvents = function () {
    var throttle, that;

    that = this;

    window.addEventListener('resize', function () {
      if (typeof throttle === "undefined") {
        throttle = window.setTimeout(function () {
          throttle = undefined;
          that.canvas.width  = window.innerWidth;
          that.canvas.height = window.innerHeight;
        }, 100);
      }
    }, false);
  };

  Snowfall.prototype.generateFlakes = function () {
    var i;

    for (i = 0; i < this.max_flakes; i += 1) {
      this.flakes.push(
        new Flake(
          Math.floor(Math.random() * this.canvas.width),
          Math.floor(Math.random() * this.canvas.height),
          {
              max_speed: this.max_speed,
              max_size: this.max_size
          }
        )
      );
    }
  };

  Snowfall.prototype.updateFlakes = function (delta) {
    var i, len;

    for (i = 0, len = this.flakes.length; i < len; i += 1) {
      this.flakes[i].move(delta);

      if (!this.flakes[i].isVisible(this.canvas.width, this.canvas.height)) {
        this.flakes[i].reset(Math.floor(Math.random() * this.canvas.width), 0);
      }
    }
  };

  Snowfall.prototype.drawFrame = function () {
    var i, len, flake;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;

    for (i = 0, len = this.flakes.length; i < len; i += 1) {
      flake = this.flakes[i];

      this.context.fillRect(flake.x, flake.y, flake.size, flake.size);
    }
  };

  Snowfall.prototype.registerAnimation = function () {
    var last_run, frame, that;

    if (typeof window.requestAnimationFrame === "undefined") {
      var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

      if (typeof requestAnimationFrame === "undefined") {
        console.warn("Snowfall.js is falling back to 100ms animation intervals");

        requestAnimationFrame = function (callback) {
          return window.setTimeout(callback, 100);
        };
      }

      window.requestAnimationFrame = requestAnimationFrame;
    }

    that     = this;

    frame = function (now) {
      if (typeof last_run === 'undefined') {
        last_run = now;
      }

      that.updateFlakes(now - last_run);
      that.drawFrame();

      last_run = now;
      that.animation = window.requestAnimationFrame(frame);
    };

    this.animation = window.requestAnimationFrame(frame);
  };

  Snowfall.prototype.removeAnimation = function () {
    if (typeof this.animation === "undefined") {
      return;
    }

    window.cancelAnimationFrame(this.animation);
  };

  Flake = function (x, y, options) {
    this.max_speed = options.max_speed;
    this.max_size = options.max_size;
    this.reset(x, y);
  };

  Flake.prototype.setSpeed = function () {
    this.speed = Math.max(0.1, Math.random() * this.max_speed);
  };

  Flake.prototype.setSize = function () {
    this.size = Math.max(1, Math.floor(Math.random() * this.max_size));
  };

  Flake.prototype.move = function (delta) {
    this.y += delta * this.speed;
  };

  Flake.prototype.isVisible = function (bx, by) {
    return (this.x > 0 && this.y > 0 && this.x < bx && this.y < by);
  };

  Flake.prototype.reset = function (x, y) {
    this.x = x;
    this.y = y;
    this.setSpeed();
    this.setSize();
  };

  window.Snowfall = new Snowfall({
    max_flakes: 350,
    max_size: 5,
    max_speed: 0.6,
  });
} (window));
