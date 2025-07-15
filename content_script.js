(async function() {
  const frames = document.querySelectorAll("iframe");
  if (frames.length > 1) {
    alert("Multiple iframes found");
    return;
  }

  const results = new Set();

  // grab <video> tags on this page
  document.querySelectorAll("video").forEach(v => {
    if (v.src) results.add(v.src);
    v.querySelectorAll("source").forEach(s => s.src && results.add(s.src));
  });

  // fetch iframe if present
  if (frames.length === 1) {
    const html = await fetch(frames[0].src).then(r => r.text());
    const doc  = new DOMParser().parseFromString(html, "text/html");
    const exts = /\.(mp4|webm|ogg|mov|m3u8|mpd)(\?.*)?$/i;
    doc.querySelectorAll("[src]").forEach(el => {
      let u = el.src || el.getAttribute("src");
      if (u && exts.test(u)) results.add(u);
    });
    const re = /src\s*=\s*(['"])(.*?)\1/gi;
    doc.querySelectorAll("script").forEach(s => {
      let code = s.textContent.replace(/\\(['"])/g, "$1"), m;
      while (m = re.exec(code)) if (exts.test(m[2])) results.add(m[2]);
    });
  }

  if (results.size === 0) {
    alert("No video URLs found");
    return;
  }

  // filter to highest-res only
  let arr = [...results].map(u => {
    let m = u.match(/(\d+)(?=\.(?:mp4|webm|ogg|mov|m3u8|mpd))/i);
    return {u, r: m ? +m[1] : 0};
  });
  let best = {};
  arr.forEach(({u,r}) => {
    let key = u.replace(/(\d+)(?=\.(?:mp4|webm|ogg|mov|m3u8|mpd))/i, "");
    if (!best[key] || r > best[key].r) best[key] = {u,r};
  });

  const bestUrls = Object.values(best).map(o => o.u);
  if (bestUrls.length === 0) {
    alert("No video URLs found");
    return;
  }

  // 1) inject overlay
  const popup = document.createElement("div");
  popup.id = "video-download-popup";
  popup.textContent = `Downloading ${bestUrls.length} video${bestUrls.length>1?'s':''}…`;
  Object.assign(popup.style, {
    position:   "fixed",
    bottom:     "20px",
    right:      "20px",
    background: "rgba(0,0,0,0.8)",
    color:      "#fff",
    padding:    "8px 12px",
    borderRadius: "4px",
    fontSize:   "14px",
    zIndex:     999999
  });
  document.body.appendChild(popup);
  // auto-remove after 5s
  setTimeout(() => popup.remove(), 5000);

  // 2) tell background to download
  chrome.runtime.sendMessage({
    type: "videoUrls",
    urls: bestUrls
  });
})();
