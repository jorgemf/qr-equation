# Visualizador 3D de Funciones Matemáticas

Este proyecto es una aplicación web sencilla que permite visualizar en 3D la gráfica de funciones matemáticas de dos variables, escritas en sintaxis JavaScript. Utiliza Plotly.js para el gráfico interactivo y MathJax para mostrar la función en notación LaTeX.

## Características
- Introduce una función de dos variables (x, y) en sintaxis JavaScript, por ejemplo: `Math.sin(x) * Math.cos(y)`
- Visualiza la superficie 3D correspondiente.
- Vista previa de la función en notación LaTeX.
- Permite ajustar el rango de valores de x e y.

## ¿Cómo ejecutar el proyecto?
1. **Descarga o clona este repositorio.**
2. **Abre el archivo `index.html` en tu navegador web favorito.**
   - No se requieren dependencias ni instalación adicional.
   - Todo funciona de manera local y offline.

## ¿Cómo probarlo en local con HTTPS? (recomendado para sensores en móvil)

### 1. Instala las dependencias

```sh
npm install --save-dev http-server
```

### 2. Genera los certificados autofirmados con mkcert

Instala mkcert si no lo tienes:
```sh
sudo pacman -S mkcert nss   # Arch Linux
# o consulta https://github.com/FiloSottile/mkcert para otros sistemas
mkcert -install
```

Genera los certificados (ajusta la IP si accedes desde otro dispositivo):
```sh
mkcert -key-file server-key.pem -cert-file server.pem localhost 127.0.0.1
```

Esto generará dos archivos: `server.pem` y `server-key.pem` en tu carpeta del proyecto.

### 3. Lanza el servidor HTTPS

```sh
npx http-server -S -C server.pem -K server-key.pem -p 8443
```

Abre tu navegador en:
- [https://localhost:8443](https://localhost:8443)
- O la IP de tu PC si generaste el certificado para ella

Acepta el certificado autofirmado si el navegador te lo pide.

### 4. (Opcional) Añade un script en package.json

```json
"scripts": {
  "start:https": "http-server -S -C server.pem -K server-key.pem -p 8443"
}
```
Y ejecuta:
```sh
npm run start:https
```

## ¿Cómo probarlo en local (sin HTTPS)?
Algunos navegadores pueden restringir la carga de archivos locales (por ejemplo, Chrome). Si tienes problemas, puedes lanzar un servidor web local sin HTTPS:

```sh
npx http-server -p 8000
```

## Ejemplo de uso
1. Escribe una función como `Math.sin(x) * Math.cos(y)` en el campo de texto.
2. Ajusta el rango de x e y si lo deseas.
3. Haz clic en "Graficar" para ver la superficie y la fórmula en LaTeX.

---

**Tecnologías usadas:**
- HTML, CSS, JavaScript
- [Plotly.js](https://plotly.com/javascript/)
- [MathJax](https://www.mathjax.org/)
