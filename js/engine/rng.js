/* PROJECT ELYSIUM — gerador pseudoaleatório determinístico (mulberry32)
   Determinismo total: a mesma semente + as mesmas decisões = o mesmo jogo. */
var EL = window.EL || {};
window.EL = EL;

EL.RNG = (function () {
  function hashSeed(str) {
    str = String(str == null ? '' : str);   // uma semente numérica caía no length undefined e colapsava tudo no mesmo hash
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  function make(seedNum) {
    var s = seedNum >>> 0;
    var api = {
      get state() { return s; },
      set state(v) { s = v >>> 0; },
      next: function () {
        s = (s + 0x6D2B79F5) >>> 0;
        var t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      float: function (a, b) { return a + api.next() * (b - a); },
      int: function (a, b) { return Math.floor(a + api.next() * (b - a + 1)); },
      chance: function (p) { return api.next() < p; },
      pick: function (arr) { return arr[Math.floor(api.next() * arr.length)]; },
      // amostragem por peso: itens = [{w:peso, ...}]
      weighted: function (arr, wf) {
        var tot = 0, i;
        for (i = 0; i < arr.length; i++) tot += wf(arr[i]);
        if (tot <= 0) return null;
        var r = api.next() * tot;
        for (i = 0; i < arr.length; i++) { r -= wf(arr[i]); if (r <= 0) return arr[i]; }
        return arr[arr.length - 1];
      },
      // distribuição normal truncada (Box-Muller)
      gauss: function (mean, sd, min, max) {
        var u = 1 - api.next(), v = api.next();
        var z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        var x = mean + z * sd;
        if (min !== undefined && x < min) x = min;
        if (max !== undefined && x > max) x = max;
        return x;
      },
      shuffle: function (arr) {
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(api.next() * (i + 1));
          var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
      }
    };
    return api;
  }
  return { hashSeed: hashSeed, make: make };
})();
