let currentChapterText = "";

async function loadChapter() {
  const url = document.getElementById('url').value.trim();
  if (!url) return alert("Vui lòng dán link chương!");

  document.getElementById('loading').style.display = 'block';
  document.getElementById('content').innerHTML = '';
  document.getElementById('title').textContent = '';
  currentChapterText = "";

  try {
    const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url));
    const data = await res.json();
    const doc = new DOMParser().parseFromString(data.contents, 'text/html');

    const titleEl = doc.querySelector('h1') || doc.querySelector('title');
    document.getElementById('title').textContent = titleEl ? titleEl.textContent.trim() : 'Chương Truyện';

    let contentDiv = doc.querySelector('div.chapter-c') || 
                      doc.querySelector('div.reading-content') ||
                      doc.querySelector('div#chapter-content') ||
                      doc.querySelector('div.noidung') ||
                      doc.querySelector('article');

    if (contentDiv) {
      contentDiv.querySelectorAll('script, style, ins, iframe, button, .ads, .qc, .banner').forEach(el => el.remove());
      document.getElementById('content').innerHTML = contentDiv.innerHTML;
      currentChapterText = contentDiv.innerText.substring(0, 10000);
    }
  } catch (e) {
    document.getElementById('content').innerHTML = `<p style="color:red">Lỗi: ${e.message}</p>`;
  }
  document.getElementById('loading').style.display = 'none';
}

async function askGrok() {
  const key = document.getElementById('grok-key').value.trim();
  const q = document.getElementById('question').value.trim();
  const answerBox = document.getElementById('grok-answer');

  if (!key) return alert("Nhập Grok API Key trước!");
  if (!q) return alert("Nhập câu hỏi đi!");
  if (!currentChapterText) return alert("Đọc chương trước rồi hỏi Grok!");

  answerBox.innerHTML = "🤖 Grok đang nghĩ...";

  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "grok-3",
        messages: [
          { role: "system", content: "Bạn là trợ lý đọc truyện tiếng Việt vui tính, phân tích sâu." },
          { role: "user", content: `Nội dung chương:\n${currentChapterText}\n\nCâu hỏi: ${q}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await res.json();
    answerBox.innerHTML = `<strong>Grok:</strong><br><br>` + 
      data.choices[0].message.content.replace(/\n/g, '<br>');
  } catch (err) {
    answerBox.innerHTML = `❌ Lỗi: ${err.message}`;
  }
}

// Enter key support
document.getElementById('url').addEventListener('keypress', e => { if(e.key === 'Enter') loadChapter(); });
document.getElementById('question').addEventListener('keypress', e => { if(e.key === 'Enter') askGrok(); });