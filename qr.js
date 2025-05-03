const input = document.getElementById('url-input');
const btn = document.getElementById('generate-btn');
const preview = document.getElementById('qr-preview');
let qr;

btn.addEventListener('click', () => {
  const url = input.value.trim();
  preview.innerHTML = '';
  if (!url) {
    preview.textContent = 'Introduce una URL válida.';
    return;
  }
  qr = new QRious({
    value: url,
    size: 200,
    level: 'H',
  });
  preview.appendChild(qr.canvas);
}); 