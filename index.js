var Flatted = (function (Primitive, primitive) {

  /*!
   * ISC License
   *
   * Copyright (c) 2018, Andrea Giammarchi, @WebReflection
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
   * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
   * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
   * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
   * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
   * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
   * PERFORMANCE OF THIS SOFTWARE.
   */

  var Flatted = {

    parse: function parse(text, reviver) {
      var input = JSON.parse(text, Primitives).map(primitives);
      var $ = reviver || noop;
      var value = input[0];

      if (typeof value === 'object' && value) {
        var lazy = [];
        var revive = resolver(input, lazy, new Set, $);
        value = revive(value);

        var i = 0;
        while (i < lazy.length) {
          // it could be a lazy.shift() but that's costly
          var item = lazy[i++];
          item.o[item.k] = $.call(item.o, item.k, revive(item.r));
        }
      }

      return $.call({'': value}, '', value);
    },

    stringify: function stringify(value, replacer, space) {
      for (var
        firstRun,
        known = new Map,
        input = [],
        output = [],
        $ = replacer && typeof replacer === typeof input ?
              function (k, v) {
                if (k === '' || -1 < replacer.indexOf(k)) return v;
              } :
              (replacer || noop),
        i = +set(known, input, $.call({'': value}, '', value)),
        replace = function (key, value) {
          if (firstRun) {
            firstRun = !firstRun;
            return value;
          }
          var after = $.call(this, key, value);
          switch (typeof after) {
            case 'object':
              if (after === null) return after;
            case primitive:
              return known.get(after) || set(known, input, after);
          }
          return after;
        };
        i < input.length; i++
      ) {
        firstRun = true;
        output[i] = JSON.stringify(input[i], replace, space);
      }
      return '[' + output.join(',') + ']';
    }

  };

  return Flatted;

  function noop(key, value) {
    return value;
  }

  function resolver(input, lazy, parsed, $) {
    return function (output) {
      return Object.keys(output).reduce(
        function (output, key) {
          var value = output[key];
          if (value instanceof Primitive) {
            var tmp = input[+value];
            if (typeof tmp === 'object' && !parsed.has(tmp)) {
              parsed.add(tmp);
              output[key] = tmp;
              lazy.push({ o: output, k: key, r: tmp });
            } else {
              output[key] = $.call(output, key, tmp);
            }
          } else
            output[key] = $.call(output, key, value);
          return output;
        },
        output
      );
    };
  }

  function set(known, input, value) {
    var index = Primitive(input.push(value) - 1);
    known.set(value, index);
    return index;
  }

  // the two kinds of primitives
  //  1. the real one
  //  2. the wrapped one

  function primitives(value) {
    return value instanceof Primitive ? Primitive(value) : value;
  }

  function Primitives(key, value) {
    return typeof value === primitive ? new Primitive(value) : value;
  }

}(String, 'string'));
