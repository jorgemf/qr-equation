// Utilidades para convertir expresiones JS simples a LaTeX (muy básico)
function jsToLatex(expr) {
  return expr
    .replace(/Math\.sin/g, '\\sin')
    .replace(/Math\.cos/g, '\\cos')
    .replace(/Math\.tan/g, '\\tan')
    .replace(/Math\.exp/g, 'e^{')
    .replace(/Math\.log/g, '\\ln')
    .replace(/Math\.sqrt/g, '\\sqrt')
    .replace(/\*\*/g, '^')
    .replace(/([xy])\^([\d]+)/g, '$1^{$2}')
    .replace(/\*/g, ' \\cdot ');
}

function plotFunction(funcStr, xMin, xMax) {
  const N = 200;
  const xs = [], ys = [];
  for (let i = 0; i < N; i++) {
    xs.push(xMin + (xMax - xMin) * i / (N - 1));
    ys.push(xMin + (xMax - xMin) * i / (N - 1));
  }
  let zs = [];
  let zMin = Infinity, zMax = -Infinity;
  let f;
  try {
    f = new Function('x', 'y', 'return ' + funcStr + ';');
  } catch (e) {
    throw new Error('Error en la función: ' + e.message);
  }
  for (let i = 0; i < xs.length; i++) {
    let row = [];
    for (let j = 0; j < ys.length; j++) {
      let z;
      try {
        z = f(xs[i], ys[j]);
        if (!isFinite(z)) z = null;
      } catch (err) {
        console.error('[DEBUG] Error evaluando f(', xs[i], ',', ys[j], '):', err);
        z = null;
      }
      if (z !== null) {
        if (z < zMin) zMin = z;
        if (z > zMax) zMax = z;
      }
      row.push(z);
    }
    zs.push(row);
  }
  // Ajustar el rango de z para que tenga el mismo tamaño que x/y y esté centrado
  const xyRange = xMax - xMin;
  let zCenter = (zMin + zMax) / 2;
  let zRange = zMax - zMin;
  let zMinFixed = zCenter - xyRange / 2;
  let zMaxFixed = zCenter + xyRange / 2;
  const data = [{
    z: zs,
    x: xs,
    y: ys,
    type: 'surface',
    colorscale: 'Viridis',
    colorbar: {showscale: false},
    showscale: false
  }];
  const layout = {
    title: '',
    autosize: true,
    margin: { l: 0, r: 0, b: 0, t: 40 },
    scene: {
      xaxis: { title: 'x', range: [xMin, xMax] },
      yaxis: { title: 'y', range: [xMin, xMax] },
      zaxis: { title: 'z', range: [zMinFixed, zMaxFixed] },
      aspectmode: 'manual',
      aspectratio: {x: 1, y: 1, z: 1},
    },
  };
  const config = {
    responsive: true,
    scrollZoom: true,
    doubleClick: 'reset',
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['sendDataToCloud'],
  };
  console.log('[DEBUG] Llamando a Plotly.newPlot...');
  Plotly.newPlot('plot', data, layout, config);
}

// Leer parámetros de la URL
function getParamFromURL(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// Actualizar la URL sin recargar la página
function setParamInURL(name, value) {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(name, value);
  } else {
    url.searchParams.delete(name);
  }
  window.history.replaceState({}, '', url);
}

document.addEventListener('DOMContentLoaded', () => {
  function graficar() {
    const funcStr = document.getElementById('function-input').value;
    const latexDiv = document.getElementById('latex-preview');
    latexDiv.textContent = '';
    if (!funcStr.trim()) {
      latexDiv.textContent = 'Introduce una función válida.';
      document.getElementById('plot').innerHTML = '';
      return;
    }
    // Leer rangos
    const xMin = parseFloat(document.getElementById('x-min').value);
    const xMax = parseFloat(document.getElementById('x-max').value);
    // Validar rangos
    if (isNaN(xMin) || isNaN(xMax) || xMin >= xMax) {
      latexDiv.textContent = 'Rangos inválidos. Asegúrate de que min < max para x e y.';
      document.getElementById('plot').innerHTML = '';
      return;
    }
    // Mostrar LaTeX
    let latex = jsToLatex(funcStr);
    latexDiv.innerHTML = `$$z = ${latex}$$`;
    if (window.MathJax) MathJax.typesetPromise([latexDiv]);
    // Graficar
    try {
      plotFunction(funcStr, xMin, xMax);
    } catch (e) {
      document.getElementById('plot').innerHTML = '';
      latexDiv.textContent = e.message;
      console.error('[DEBUG] Error en plotFunction:', e);
    }
    setParamInURL('f', funcStr);
  }

  const urlFunc = getParamFromURL('f');
  const urlXMin = getParamFromURL('xMin');
  const urlXMax = getParamFromURL('xMax');
  console.log('[DEBUG] urlFunc:', urlFunc);
  if (urlFunc) {
    const decodedFunc = decodeURIComponent(urlFunc);
    console.log('[DEBUG] decodedFunc:', decodedFunc);
    document.getElementById('function-input').value = decodedFunc;
    if (urlXMin !== null) document.getElementById('x-min').value = urlXMin;
    if (urlXMax !== null) document.getElementById('x-max').value = urlXMax;
    document.getElementById('controls-wrapper').style.display = 'none';
    // Si es móvil o iOS, activar control por sensores
    if ((isMobile() || isIOS()) && window.DeviceOrientationEvent) {
      enableMobileGyroControl();
    }
    console.log('[DEBUG] Valor final en input:', document.getElementById('function-input').value);
    graficar();
  }

  // Listener solo para clicks manuales
  const plotBtn = document.getElementById('plot-btn');
  plotBtn.addEventListener('click', graficar);

  // Redimensionar el gráfico al cambiar el tamaño de la ventana
  window.addEventListener('resize', () => {
    Plotly.Plots.resize('plot');
  });

  // Eliminar controles de zoom manual si existen
  const zoomControls = document.querySelector('.zoom-controls');
  if (zoomControls) zoomControls.remove();

  // Botones para xMin/xMax
  const xMinInput = document.getElementById('x-min');
  const xMaxInput = document.getElementById('x-max');
  document.getElementById('x-min-dec').addEventListener('click', () => {
    xMinInput.value = parseFloat(xMinInput.value) - 1;
    graficar();
  });
  document.getElementById('x-min-inc').addEventListener('click', () => {
    xMinInput.value = parseFloat(xMinInput.value) + 1;
    graficar();
  });
  document.getElementById('x-max-dec').addEventListener('click', () => {
    xMaxInput.value = parseFloat(xMaxInput.value) - 1;
    graficar();
  });
  document.getElementById('x-max-inc').addEventListener('click', () => {
    xMaxInput.value = parseFloat(xMaxInput.value) + 1;
    graficar();
  });

  // Pedir permisos en iOS aunque no sea ejemplo
  if ((isMobile() || isIOS()) && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().catch(()=>{});
  }
});

// --- Control con sensores de movimiento en móvil ---
function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function enableMobileGyroControl() {
  // Mostrar aviso si no hay soporte
  if (!window.DeviceOrientationEvent) {
    alert('Este dispositivo o navegador no soporta sensores de orientación.');
    return;
  }
  // iOS requiere permiso explícito
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(permissionState => {
      if (permissionState === 'granted') {
        startGyroListener();
      } else {
        alert('No se concedió permiso para acceder a los sensores de movimiento.');
      }
    }).catch(() => {
      alert('No se pudo obtener permiso para los sensores de movimiento.');
    });
  } else {
    startGyroListener();
  }
}

function startGyroListener() {
  let lastGamma = 0, lastBeta = 0;
  window.addEventListener('deviceorientation', (event) => {
    const beta = event.beta || 0; // front-back
    const gamma = event.gamma || 0; // left-right
    if (Math.abs(beta - lastBeta) > 1 || Math.abs(gamma - lastGamma) > 1) {
      lastBeta = beta;
      lastGamma = gamma;
      const radBeta = (beta / 180) * Math.PI;
      const radGamma = (gamma / 90) * Math.PI / 2;
      // Obtener la cámara actual para mantener el zoom
      const plotDiv = document.getElementById('plot');
      let eye = {x: 0, y: 0, z: 2.2};
      if (plotDiv && plotDiv._fullLayout && plotDiv._fullLayout.scene && plotDiv._fullLayout.scene.camera && plotDiv._fullLayout.scene.camera.eye) {
        eye = plotDiv._fullLayout.scene.camera.eye;
      }
      let r = Math.sqrt(eye.x * eye.x + eye.y * eye.y + eye.z * eye.z);
      const x = r * Math.sin(radBeta) * Math.cos(radGamma);
      const y = r * Math.sin(radGamma);
      const z = r * Math.cos(radBeta) * Math.cos(radGamma);
      Plotly.relayout('plot', {
        'scene.camera': {
          eye: {x, y, z}
        }
      });
    }
  });
}
