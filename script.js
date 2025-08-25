// --- Static simulation of my model ---
// How it works:
// 1) I collect form values
// 2) I look up a sample output (simple mapping below)
// 3) I "type" the result so it feels live
// 4) I show a visual "template preview" to mimic a recommended theme

// static simulation
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("inviteForm");
  const resultCard = document.getElementById("resultCard");
  const output = document.getElementById("output");
  const cursor = document.getElementById("cursor");
  const templateTag = document.getElementById("templateTag");
  const preview = document.getElementById("preview");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const sampleBtn = document.getElementById("sampleBtn");

  // Sample "model" outputs
  const SAMPLES = [
    { key: ["Birthday","Fun","Summer"], tag:"Confetti Fun — Summer", preview:{bg:"linear-gradient(135deg,#1f2a52,#1a2150)", accent:"#ffd166"}, lines:[
      "Join us for sunshine, sweets, and birthday beats!",
      "Let's celebrate another year of amazing memories!",
      "Cake, games, and laughter await—don't miss it!"
    ]},
    { key: ["Birthday","Elegant","Any"], tag:"Chic Celebration", preview:{bg:"linear-gradient(135deg,#2b2b52,#1f1f50)", accent:"#e2c2ff"}, lines:[
      "Celebrate in style with elegance and charm.",
      "An intimate birthday gathering awaits you.",
      "Join us for a classy evening of joy and fun."
    ]},
    { key: ["Wedding","Romantic","Spring"], tag:"Blossom Romance — Spring", preview:{bg:"linear-gradient(135deg,#1a1f3f,#0f1731)", accent:"#fbb1b1"}, lines:[
      "Celebrate love in full bloom with an evening of grace and joy.",
      "Two hearts unite—join us for a springtime romance.",
      "Witness a day of love, laughter, and blossoms."
    ]},
    { key: ["Wedding","Elegant","Any"], tag:"Timeless Elegance", preview:{bg:"linear-gradient(135deg,#0f1a3f,#0a1228)", accent:"#cdb4db"}, lines:[
      "Join us for a sophisticated evening of love and vows.",
      "A refined celebration awaits—share in the joy!",
      "Experience elegance and romance as two hearts unite."
    ]},
    { key: ["Graduation","Vintage","Any"], tag:"Vintage Crest — Classic", preview:{bg:"linear-gradient(135deg,#16203f,#0e1531)", accent:"#ffd6a5"}, lines:[
      "Caps off to the journey—honor the milestone in timeless style.",
      "Celebrate the achievement with friends and family.",
      "A vintage-themed graduation to remember forever."
    ]},
    { key: ["Baby Shower","Whimsical","Fall"], tag:"Whimsical Leaves — Fall", preview:{bg:"linear-gradient(135deg,#1b213f,#0f1834)", accent:"#bde0fe"}, lines:[
      "Tiny kicks, cozy vibes—come sprinkle love on the way!",
      "Join us for laughter, love, and little blessings.",
      "A whimsical celebration awaits our new arrival!"
    ]},
    { key: ["Friends Gathering","Fun","Any"], tag:"Casual Vibes — Any", preview:{bg:"linear-gradient(135deg,#1c274c,#0c1531)", accent:"#caffbf"}, lines:[
      "Good food, better company—come hang out and make it a night!",
      "Bring your stories and smiles for an unforgettable gathering.",
      "An evening of fun, laughter, and friends awaits!"
    ]}
  ];

  const FALLBACKS = {
    "Birthday":["Make a wish and celebrate another trip around the sun!","Party time!","Let's make it unforgettable!"],
    "Wedding":["Together with their families, two hearts become one—join us.","Celebrate love and union!","A day to remember forever."],
    "Graduation":["A chapter closes, a new one begins—celebrate the grad!","Cheers to success and new adventures!","Hats off to the graduate!"],
    "Baby Shower":["Tiny toes and twinkling bows—help us welcome the little one.","Join us for baby joy and love!","A sweet celebration awaits!"],
    "Bridal Shower":["To love, laughter, and the bride-to-be—let's celebrate.","Showering the bride with love and gifts.","A fun and lovely day for the bride!"],
    "Engagement":["Here's to the 'yes' that starts forever—cheers to love!","Celebrate the beginning of forever together.","Love is in the air—join the celebration!"],
    "Friends Gathering":["Bring your stories and appetite—let's catch up.","An evening of fun and laughter with friends.","Good vibes and great company await!"]
  };

  // Event listeners
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = readForm();
    showResult(simulate(payload), payload);
  });

  sampleBtn.addEventListener("click", () => {
    const pick = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    const [eventType, mood, season] = pick.key;
    document.getElementById("eventType").value = eventType;
    document.getElementById("mood").value = mood;
    document.getElementById("season").value = season;
    document.getElementById("name").value = "Negina";
    document.getElementById("date").value = dateToInput(addDays(new Date(), 30));
    document.getElementById("location").value = "Chicago, IL";
    form.dispatchEvent(new Event("submit"));
  });

  copyBtn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.textContent);
    toast(copyBtn, "Copied!");
  });

  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([output.textContent], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "invitation.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  });

  // Functions
  function readForm() {
    return {
      eventType: valueOf("eventType"),
      mood: valueOf("mood"),
      season: valueOf("season"),
      name: valueOf("name"),
      date: valueOf("date"),
      location: valueOf("location")
    };
  }

  function valueOf(id) { return document.getElementById(id).value.trim(); }

  function simulate({ eventType, mood, season, name, date, location }) {
    // Find exact or fallback
    const exact = SAMPLES.find(s =>
      s.key[0] === eventType && s.key[1] === mood && (s.key[2] === season || s.key[2]==="Any")
    );

    // Random lines for more "AI-like" variation
    const lines = exact?.lines || FALLBACKS[eventType] || ["You're invited!"];
    const tagline = lines[Math.floor(Math.random()*lines.length)];

    const prettyDate = formatDate(date);
    const title = `${eventType} — ${mood}`;
    const body = `You're invited to a ${mood.toLowerCase()} ${eventType.toLowerCase()} hosted by ${name} on ${prettyDate} at ${location}.\n\n${tagline}`;

    const tag = exact?.tag || `${eventType} • ${mood} • ${season}`;
    const preview = exact?.preview || { bg:"linear-gradient(135deg,#151f3e,#0e1531)", accent:"#7aa2ff" };

    return { title, body, tag, preview };
  }

  function showResult(result, payload) {
    resultCard.classList.remove("hidden");
    templateTag.textContent = result.tag;
    preview.style.background = result.preview.bg;
    preview.style.boxShadow = `inset 0 0 0 2px ${result.preview.accent}22, 0 8px 30px #0008`;
    preview.style.borderColor = `${result.preview.accent}44`;
    preview.querySelector(".preview-title").textContent = result.title;
    preview.querySelector(".preview-body").textContent = `Style accent: ${result.preview.accent}`;

    output.textContent = "";
    cursor.classList.remove("hidden");
    typeWrite(result.body, output, () => cursor.classList.add("hidden"));
  }

  function typeWrite(text, el, done) {
    const chars = [...text];
    let idx = 0;
    const timer = setInterval(() => {
      el.textContent += chars[idx++];
      if(idx>=chars.length){clearInterval(timer);done && done();}
    },12);
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function dateToInput(date){
    const yyyy=date.getFullYear(), mm=String(date.getMonth()+1).padStart(2,"0"), dd=String(date.getDate()).padStart(2,"0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDate(input){
    if(!input) return "TBA";
    const d = new Date(input);
    return new Intl.DateTimeFormat(undefined,{year:"numeric",month:"long",day:"numeric"}).format(d);
  }

  function toast(anchor,text){
    const t=document.createElement("span");
    t.textContent=text;
    t.style.position="absolute";
    t.style.transform="translateY(-140%)";
    t.style.padding="6px 10px";
    t.style.borderRadius="999px";
    t.style
