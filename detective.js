(function () {
  var A = {
    frog:    { ic: "🐸", name: "Frog",    scene: "s-pond",   note: "Water and grass", home: "pond",
               clues: [["What do I eat?", "Flies and other small insects."], ["Where do I hide?", "In the reeds and under leaves, close to the water."], ["What is the weather like?", "Warm and wet."]],
               hint: "Look at the clues again. Frogs need wet skin. Which place has lots of water?",
               why: "A pond gives the frog water to swim in, insects to eat and plants to hide in." },
    camel:   { ic: "🐪", name: "Camel",   scene: "s-desert", note: "Sandy and sunny", home: "desert",
               clues: [["What do I eat?", "Dry grass and thorny bushes."], ["Where do I rest?", "In the shade, because it is very hot."], ["What is the weather like?", "Hot, sunny and dry. It hardly ever rains."]],
               hint: "Look at the clues again. Which place is hot, sunny and dry?",
               why: "The desert is hot and dry. The camel has wide feet for sand and stores fat in its hump, so it can go many days without water." },
    penguin: { ic: "🐧", name: "Penguin", scene: "s-snow",   note: "Ice and snow", home: "ice",
               clues: [["What do I eat?", "Fish that I catch in the cold sea."], ["How do I stay warm?", "My thick feathers, and I stand close to my friends."], ["What is the weather like?", "Freezing cold and windy."]],
               hint: "Look at the clues again. Which place is freezing cold?",
               why: "Penguins live on ice and snow. Their thick feathers keep them warm, and they catch fish in the cold sea." },
    owl:     { ic: "🦉", name: "Owl",     scene: "s-forest", note: "Night time", home: "tree",
               clues: [["What do I eat?", "Mice and big insects."], ["Where do I sleep?", "In a hole in a tree, all day long."], ["When am I awake?", "At night, when it is dark and cool."]],
               hint: "Look at the clues again. Where does the owl sleep all day?",
               why: "Owls live in trees. A tree hole is a safe place to sleep, and the owl watches for mice from up high at night." }
  };
  var ORDER = ["frog", "camel", "penguin", "owl"];
  var HOMES = [["pond", "Pond", "💧"], ["desert", "Desert", "🏜️"], ["ice", "Ice and snow", "🧊"], ["tree", "Tree", "🌳"]];
  var app = document.getElementById("app"), seen = {}, mysteryDone = false, wonderDone = false, ctx = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function good(t, x) { return '<div class="fb good"><strong>' + esc(t) + '</strong>' + esc(x) + '</div>'; }
  function hint(x) { return '<div class="fb hint"><strong>Not quite.</strong>' + esc(x) + ' Try again!</div>'; }
  function doneCount() { return (mysteryDone ? 1 : 0) + Object.keys(seen).length + (wonderDone ? 1 : 0); }
  function prog() { var n = doneCount(); return '<progress value="' + n + '" max="6" aria-label="Detective steps finished"></progress><p class="small">' + n + ' of 6 detective steps finished</p>'; }
  function optHtml(list, textOnly) {
    return '<div class="opts" id="opts">' + list.map(function (o) {
      return textOnly ? '<button class="opt text" data-k="' + o[0] + '"><span class="lb">' + esc(o[1]) + '</span></button>'
                      : '<button class="opt" data-k="' + o[0] + '"><span class="ic">' + o[2] + '</span><span class="lb">' + esc(o[1]) + '</span></button>';
    }).join("") + '</div><div id="fb"></div><div class="row" id="act"></div>';
  }
  /* One answer engine for every question: tap, get a hint on a wrong answer, a full explanation after two wrong tries or a right answer, then the next button appears. */
  function choice(cfg) {
    var wrongs = 0, over = false, box = document.getElementById("opts"), fb = document.getElementById("fb");
    function lock() { box.querySelectorAll(".opt").forEach(function (x) { if (!x.classList.contains("right")) x.disabled = true; }); }
    function finish(title) { over = true; box.querySelector('[data-k="' + cfg.right + '"]').classList.add("right"); lock(); fb.innerHTML = good(title, cfg.why); cfg.onDone(document.getElementById("act")); }
    box.onclick = function (e) {
      var b = e.target.closest(".opt"); if (!b || b.disabled || over) return;
      var k = b.getAttribute("data-k");
      if (k === cfg.right) { finish("Well done!"); return; }
      wrongs++; b.disabled = true;
      if (wrongs >= 2) finish("Here is the answer."); else fb.innerHTML = hint(typeof cfg.hint === "function" ? cfg.hint(k) : cfg.hint);
    };
  }
  function nextBtn(act, label, fn) {
    var b = document.createElement("button"); b.className = "btn"; b.textContent = label; b.onclick = function () { fn(); window.scrollTo(0, 0); };
    act.appendChild(b); b.focus();
  }
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

  /* Step 1: mystery sound, learner answers who it is */
  function start() {
    app.innerHTML = '<div class="tag">Step 1: the mystery</div>' + prog() +
      '<div class="scene mystery" role="img" aria-label="A dark shape near water and grass"><span class="big">?</span></div>' +
      '<h2>Who lives here? Listen carefully.</h2>' +
      '<div class="row"><button class="btn" id="snd">Play the sound</button></div>' +
      '<p class="wonder">Which animal made the sound? Tap your answer.</p>' +
      optHtml(ORDER.map(function (k) { return [k, A[k].name, A[k].ic]; }));
    document.getElementById("snd").onclick = croak;
    choice({ right: "frog", hint: "Listen again. Which animal lives near water and goes 'croak'?",
      why: "That is a frog! Frogs live near water. Now open each clue file to find out where the other animals live.",
      onDone: function (act) { mysteryDone = true; nextBtn(act, "Start detective work", board); } });
  }
  /* Step 2 to 5: the board and one clue file per animal */
  function board() {
    app.innerHTML = '<div class="tag">Detective board</div>' + prog() + '<h2>Tap an animal to open its clue file.</h2><div class="board" id="bd"></div>';
    var bd = document.getElementById("bd");
    ORDER.forEach(function (k) {
      var b = document.createElement("button"); b.className = "pick" + (seen[k] ? " seen" : "");
      b.innerHTML = '<span class="ic">' + A[k].ic + '</span><span class="lb">' + A[k].name + '</span>';
      b.onclick = function () { file(k); }; bd.appendChild(b);
    });
    if (Object.keys(seen).length === 4) {
      var w = document.createElement("div"); w.className = "row";
      var go = document.createElement("button"); go.className = "btn"; go.textContent = "Answer the wonder question"; go.onclick = wonder; w.appendChild(go); app.appendChild(w);
    }
  }
  function file(k) {
    var a = A[k], h = '<div class="tag">Clue file: ' + esc(a.name) + '</div>' + prog() +
      '<div class="scene ' + a.scene + '" role="img" aria-label="' + esc(a.note) + '"><span class="big">' + a.ic + '</span></div><div class="clues">';
    a.clues.forEach(function (c) { h += '<div class="clue"><span class="q">' + esc(c[0]) + '</span><span>' + esc(c[1]) + '</span></div>'; });
    h += '</div><div class="row"><button class="btn alt" id="rd">Read the clues to me</button>' + (k === "frog" ? '<button class="btn alt" id="sn">Play my sound</button>' : '') + '</div>' +
      '<h2>Where do I live? Use the clues.</h2>' + optHtml(HOMES);
    app.innerHTML = h;
    document.getElementById("rd").onclick = function () { speak(a.name + ". " + a.clues.map(function (c) { return c[0] + " " + c[1]; }).join(" ")); };
    var sn = document.getElementById("sn"); if (sn) sn.onclick = croak;
    choice({ right: a.home, hint: a.hint, why: a.why,
      onDone: function (act) {
        seen[k] = true;
        var left = ORDER.filter(function (x) { return !seen[x]; });
        nextBtn(act, left.length ? "Next animal" : "Answer the wonder question", function () { if (left.length) file(left[0]); else wonder(); });
        var bk = document.createElement("button"); bk.className = "btn alt"; bk.textContent = "Back to detective board"; bk.onclick = board; act.appendChild(bk);
      } });
    window.scrollTo(0, 0);
  }
  /* Step 6: the wonder question */
  function wonder() {
    app.innerHTML = '<div class="tag">Wonder question</div>' + prog() +
      '<div class="scene s-desert" role="img" aria-label="A hot, dry desert"><span class="big">🐧</span></div>' +
      '<h2>Why can’t the penguin live in the desert?</h2>' +
      '<p class="small">Think about the clues you found. Talk to your partner, then tap your answer.</p>' +
      optHtml([["a", "The desert is too hot and has no fish for the penguin to eat."], ["b", "Penguins do not like sand."], ["c", "The desert has too much water."]], true);
    choice({ right: "a",
      hint: function (k) { return k === "b" ? "That is not a reason from the clues. Think about the weather and the food the penguin needs." : "Look at the camel's clues. Does the desert have a lot of water?"; },
      why: "A penguin needs cold weather, thick feathers and fish from the sea. The desert is hot and dry, so the penguin could not stay cool or find food.",
      onDone: function (act) { wonderDone = true; nextBtn(act, "Get my detective badge", finish); } });
  }
  function finish() {
    app.innerHTML = '<div class="tag">All done</div>' + prog() + '<div class="badge" aria-hidden="true">🏅</div>' +
      '<h2>You are a Habitat Detective!</h2>' +
      '<div class="reveal">Animals live where they can get what they need: food, water and shelter.</div>' +
      '<p class="wonder"><strong>Next:</strong> go back to your group and make a habitat postcard. Draw an animal in its home and record: “This is a ___. It lives in ___ because ___.”</p>' +
      '<div class="row"><button class="btn alt" id="again">Play again</button></div>';
    document.getElementById("again").onclick = function () { seen = {}; mysteryDone = false; wonderDone = false; start(); window.scrollTo(0, 0); };
  }
  start();
})();
