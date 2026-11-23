(function () {
  var Q = [
    { tag: "Diagnostic question", scene: "s-desert", note: "Sandy, sunny and dry", big: "🐪",
      ask: "Where does this animal live?",
      opts: [["Desert", "🏜️"], ["Ocean", "🌊"], ["Snow", "❄️"]], right: 0,
      hint: "Look at the sand and the sun in the picture. Which place is hot and dry? Try again!",
      why: "The camel has wide feet that do not sink in sand and stores fat in its hump, which helps it survive in hot, dry places." },
    { tag: "Matching question 1 of 3", scene: "s-pond", note: "Water and grass", big: "🐸",
      ask: "Where does the frog live?",
      opts: [["Pond", "💧"], ["Ice", "🧊"], ["Tree", "🌳"]], right: 0,
      hint: "Frogs need wet skin to stay healthy. Where is there lots of water? Try again!",
      why: "A pond gives the frog water to swim in, insects to eat and plants to hide in." },
    { tag: "Matching question 2 of 3", scene: "s-snow", note: "Very cold", big: "🐧",
      ask: "Where does the penguin live?",
      opts: [["Pond", "💧"], ["Ice", "🧊"], ["Tree", "🌳"]], right: 1,
      hint: "Penguins have thick feathers to keep warm. Where is it very, very cold? Try again!",
      why: "Penguins live on ice and snow. Their thick feathers and layer of fat keep them warm, and they swim in the cold sea to catch fish." },
    { tag: "Matching question 3 of 3", scene: "s-forest", note: "Night time", big: "🦉",
      ask: "Where does the owl live?",
      opts: [["Pond", "💧"], ["Ice", "🧊"], ["Tree", "🌳"]], right: 2,
      hint: "Owls sleep in the day and hunt at night. Where could a bird hide and rest? Try again!",
      why: "Owls live in trees. A tree hole or branch is a safe place to sleep, and the owl can watch for mice from up high." },
    { tag: "Thinking question", scene: "s-dry", note: "The pond dried up", big: "🐸",
      ask: "The pond dried up. What should the frog do, and why?",
      opts: [["Stay and wait", "⏳"], ["Move to a place with water", "💧"], ["Live in the desert", "🏜️"]], right: 1,
      hints: { 0: "If the pond stays dry, will the frog get water? Think about what a frog needs. Try again!",
               2: "Think about what frogs need to live. Does the desert have water? Try again!" },
      why: "Animals need water, food and shelter. When the pond dried up, the frog had to find a new home that has water." }
  ];
  var app = document.getElementById("app"), dotsEl = document.getElementById("dots");
  var step = 0, firstTry = 0, wrongs = 0, answered = false;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function dots() {
    var h = "";
    for (var i = 0; i < Q.length + 1; i++) h += '<span class="dot ' + (i < step ? "done" : i === step ? "now" : "") + '"></span>';
    dotsEl.innerHTML = h;
  }
  function show() {
    dots(); wrongs = 0; answered = false;
    if (step >= Q.length) return selfCheck();
    var q = Q[step], h = '<div class="tag">' + esc(q.tag) + '</div>' +
      '<div class="scene ' + q.scene + '" role="img" aria-label="' + esc(q.note) + '"><span class="note">' + esc(q.note) + '</span><span class="big">' + q.big + '</span></div>' +
      '<h2>' + esc(q.ask) + '</h2><div class="opts" id="opts">';
    q.opts.forEach(function (o, i) {
      h += '<button class="opt" data-i="' + i + '"><span class="ic">' + o[1] + '</span><span class="lb">' + esc(o[0]) + '</span></button>';
    });
    h += '</div><div id="fb"></div>';
    app.innerHTML = h;
    document.getElementById("opts").addEventListener("click", pick);
  }
  function pick(e) {
    var b = e.target.closest(".opt"); if (!b || b.disabled || answered) return;
    var i = +b.getAttribute("data-i"), q = Q[step], fb = document.getElementById("fb");
    if (i === q.right) {
      answered = true; if (wrongs === 0) firstTry++;
      b.classList.add("right"); lock();
      fb.innerHTML = '<div class="fb good"><strong>Well done!</strong>' + esc(q.why) + '</div>' + nextBtn();
    } else {
      wrongs++; b.disabled = true;
      if (wrongs >= 2) {
        answered = true; lock();
        var all = document.querySelectorAll(".opt"); all[q.right].classList.add("right");
        fb.innerHTML = '<div class="fb good"><strong>Here is the answer.</strong>' + esc(q.why) + '</div>' + nextBtn();
      } else {
        var t = q.hints ? q.hints[i] : q.hint;
        fb.innerHTML = '<div class="fb hint"><strong>Not quite.</strong>' + esc(t) + '</div>';
      }
    }
    var nb = document.getElementById("next"); if (nb) { nb.addEventListener("click", function () { step++; show(); window.scrollTo(0, 0); }); nb.focus(); }
  }
  function lock() { document.querySelectorAll(".opt").forEach(function (x) { if (!x.classList.contains("right")) x.disabled = true; }); }
  function nextBtn() { return '<button class="btn" id="next">' + (step === Q.length - 1 ? "Finish" : "Next question") + '</button>'; }

  function selfCheck() {
    dots();
    var h = '<div class="tag">How do you feel?</div><h2>How sure do you feel about where animals live?</h2><div class="opts" id="sc">' +
      '<button class="opt" data-k="3"><span class="ic">😊</span><span class="lb">Very sure</span></button>' +
      '<button class="opt" data-k="2"><span class="ic">😐</span><span class="lb">A bit sure</span></button>' +
      '<button class="opt" data-k="1"><span class="ic">🤔</span><span class="lb">I need help</span></button></div>';
    app.innerHTML = h;
    document.getElementById("sc").addEventListener("click", function (e) {
      var b = e.target.closest(".opt"); if (!b) return; done(+b.getAttribute("data-k"));
    });
  }
  function done(k) {
    var s = ""; for (var i = 0; i < Q.length; i++) s += i < firstTry ? "⭐" : "☆";
    var msg = k === 1 ? "That is okay. Ask your teacher to explore the Habitat Detectives clues with you again." :
              k === 2 ? "Good work! Look at the clues once more and you will be a habitat expert." :
              "Great detective work! Now tell a partner where your favourite animal lives and why.";
    app.innerHTML = '<div class="tag">All done</div><h2>You finished the quiz!</h2><div class="stars" aria-label="' + firstTry + ' out of ' + Q.length + ' right on the first try">' + s + '</div>' +
      '<p>' + firstTry + ' out of ' + Q.length + ' right on the first try.</p><div class="fb good">' + esc(msg) + '</div>' +
      '<button class="btn" id="again">Play again</button>';
    document.getElementById("again").addEventListener("click", function () { step = 0; firstTry = 0; show(); });
  }
  show();
})();
