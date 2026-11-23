(function () {
  var A = {
    frog:    { ic: "🐸", name: "Frog",    scene: "s-pond",   note: "Water and grass",
               clues: [["What do I eat?", "Flies and other small insects."], ["Where do I hide?", "In the reeds and under leaves, close to the water."], ["What is the weather like?", "Warm and wet."]],
               home: "Pond", homeIc: "💧", sound: "croak" },
    camel:   { ic: "🐪", name: "Camel",   scene: "s-desert", note: "Sandy and sunny",
               clues: [["What do I eat?", "Dry grass and thorny bushes."], ["Where do I rest?", "In the shade, because it is very hot."], ["What is the weather like?", "Hot, sunny and dry. It hardly ever rains."]],
               home: "Desert", homeIc: "🏜️" },
    penguin: { ic: "🐧", name: "Penguin", scene: "s-snow",   note: "Ice and snow",
               clues: [["What do I eat?", "Fish that I catch in the cold sea."], ["How do I stay warm?", "My thick feathers, and I stand close to my friends."], ["What is the weather like?", "Freezing cold and windy."]],
               home: "Ice and snow", homeIc: "🧊" },
    owl:     { ic: "🦉", name: "Owl",     scene: "s-forest", note: "Night time",
               clues: [["What do I eat?", "Mice and big insects."], ["Where do I sleep?", "In a hole in a tree, all day long."], ["When am I awake?", "At night, when it is dark and cool."]],
               home: "Tree", homeIc: "🌳" }
  };
  var ORDER = ["frog", "camel", "penguin", "owl"];
  var app = document.getElementById("app"), seen = {}, ctx = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function croak() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var t = ctx.currentTime;
      for (var k = 0; k < 3; k++) {
        var o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), s = t + k * 0.45;
        o.type = "sawtooth"; o.frequency.setValueAtTime(150, s); o.frequency.linearRampToValueAtTime(95, s + 0.3);
        lfo.frequency.value = 32; lg.gain.value = 0.25; lfo.connect(lg); lg.connect(g.gain);
        g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(0.35, s + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.34);
        o.connect(g); g.connect(ctx.destination); o.start(s); lfo.start(s); o.stop(s + 0.36); lfo.stop(s + 0.36);
      }
    } catch (e) {}
  }
  function speak(text) {
    try { if (window.speechSynthesis) { window.speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.rate = 0.85; window.speechSynthesis.speak(u); } } catch (e) {}
  }

  function start() {
    app.innerHTML = '<div class="tag">Mystery</div>' +
      '<div class="scene mystery" role="img" aria-label="A dark shape near water and grass"><span class="big">?</span></div>' +
      '<h2>Who lives here? Listen carefully.</h2>' +
      '<div class="row"><button class="btn" id="snd">Play the sound</button></div>' +
      '<p class="wonder">Talk to your partner. What animal do you think it is? Where do you think it lives? Tell your teacher your guess.</p>' +
      '<button class="btn alt" id="go">Start detective work</button>';
    document.getElementById("snd").onclick = croak;
    document.getElementById("go").onclick = board;
  }
  function board() {
    var n = Object.keys(seen).length, h = '<div class="tag">Detective board</div><h2>Tap an animal to open its clue file.</h2>' +
      '<progress value="' + n + '" max="4" aria-label="Clue files opened"></progress><p class="small">' + n + ' of 4 clue files opened</p><div class="board">';
    ORDER.forEach(function (k) { h += '<button class="pick ' + (seen[k] ? "seen" : "") + '" data-k="' + k + '"><span class="ic">' + A[k].ic + '</span><span class="lb">' + A[k].name + '</span></button>'; });
    h += '</div>';
    if (n === 4) {
      h += '<div class="wonder"><strong>Wonder question:</strong> Why can’t the penguin live in the desert? Talk in your group. Then use what you learned from the clues to explain.</div>';
    }
    app.innerHTML = h;
    app.querySelectorAll(".pick").forEach(function (b) { b.onclick = function () { file(b.getAttribute("data-k")); }; });
  }
  function file(k) {
    var a = A[k]; seen[k] = true;
    var h = '<div class="tag">Clue file: ' + esc(a.name) + '</div>' +
      '<div class="scene ' + a.scene + '" role="img" aria-label="' + esc(a.note) + '"><span class="big">' + a.ic + '</span></div><div class="clues">';
    a.clues.forEach(function (c, i) { h += '<div class="clue"><span class="q">' + esc(c[0]) + '</span><span>' + esc(c[1]) + '</span></div>'; });
    h += '</div><div class="row"><button class="btn alt" id="rd">Read the clues to me</button>' + (a.sound ? '<button class="btn alt" id="sn">Play my sound</button>' : '') + '</div>' +
      '<div id="rv"></div><div class="row"><button class="btn" id="home">Where do I live?</button><button class="btn alt" id="back">Back to detective board</button></div>';
    app.innerHTML = h;
    document.getElementById("rd").onclick = function () { speak(a.name + ". " + a.clues.map(function (c) { return c[0] + " " + c[1]; }).join(" ")); };
    var sn = document.getElementById("sn"); if (sn) sn.onclick = croak;
    document.getElementById("home").onclick = function () { document.getElementById("rv").innerHTML = '<div class="reveal">I live in the ' + esc(a.home.toLowerCase()) + ' ' + a.homeIc + '</div>'; };
    document.getElementById("back").onclick = board;
    window.scrollTo(0, 0);
  }
  start();
})();
