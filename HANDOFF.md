# Handoff — Web Boda Nazaret y Andrés
**Última actualización:** 2026-06-28 (sesión 5)

## Estado actual
Web publicada en **GitHub Pages** y funcionando. Migración de Netlify completada.

- **Fuente de verdad:** `index.html` (un solo archivo HTML/CSS/JS, sin framework) en la raíz del repo.
- **Repo GitHub:** https://github.com/gharzz/boda-nazaret-andres (cuenta gharzz, HTTPS, token en keyring del sistema)
- **URL pública:** https://gharzz.github.io/boda-nazaret-andres/
- **Boda:** 11/10/2026, Cortijo de Enmedio (Granada). Ceremonia **17:30**.

> Nota: en el PC original el repo está en la carpeta `Web Boda/deploy/`. La carpeta padre `Web Boda/` tiene material que NO está en el repo (ver más abajo). El antiguo `Web Boda/index.html` de la raíz del proyecto está DESACTUALIZADO — no usarlo.

## Trabajar desde otro PC
```bash
git clone https://github.com/gharzz/boda-nazaret-andres.git
cd boda-nazaret-andres
# editar index.html y luego:
git add . && git commit -m "cambio" && git push
```
GitHub Pages se actualiza solo en ~1 min. **Material que NO viaja en el repo** (solo en el PC original, carpeta `Web Boda/`): `contenido multimedia/` (fotos/vídeos originales y eucaliptos sin procesar), `.FLAC` de la música, `opcion-*.html`, `CLAUDE.md`. Cópialo aparte (USB/nube) si vas a trabajar con originales.

## Contenido del repo
- `index.html` — la web entera.
- `assets/` — imágenes optimizadas (webp), `musica.mp3`, `pedida.mp4`, eucaliptos.
- `HANDOFF.md` — este archivo (añadido al repo para tenerlo al clonar).
- `apps-script-invitados.gs` — script de exportación de invitados (referencia; no afecta a la web).

## Previsualizar en local
```bash
python3 -m http.server 8080   # desde la carpeta del repo → http://localhost:8080
```
El formulario envía a Google de verdad incluso en local.

## Historia git (sesión 5)
Se reescribieron los mensajes de commit para quitar el trailer `Co-Authored-By: Claude` y se hizo **force-push** a `origin/main`. Todos los commits son de `gharzz <andresmartos6@gmail.com>`. La lista de "Contributors" de GitHub tarda en recalcularse (cache); se actualiza sola. El checkout local ya se sincronizó con `git reset --hard origin/main`.

> Si se reescribe la historia otra vez, en CUALQUIER otro clon hay que hacer `git fetch && git reset --hard origin/main` (un `pull` normal da error de historias divergentes).

---

## Decoración eucalipto (acuarelas reales)
SVG sintéticos sustituidos por imágenes acuarela en `assets/`:
- `euca-seccion.webp` (transparente) → esquinas superiores de **galería, regalo, FAQ** (clase `.corner-euca .cl/.cr`, entran con slide+fade vía observer `io` que añade `.in` al propio elemento).
- `eucalipto.jpg` (con `mask-image`) → ramas laterales de **cuenta atrás y regalo** (clases `.sidebranch .sb-l1/.sb-r1/.sb-l2/.sb-r2`, entran con `.count.in`/`.regalos.in` vía observer `grow`).
- `euca-grande.jpg` (con `mask-image`) → medallón de cuenta atrás (`.euca .euca-tr/.euca-bl`).
- **Portada/hero: SIN eucaliptos** (se quitaron; quedaba recargado).
- Móvil: `.sb-l2/.sb-r2` ocultas <560px; en regalo además `.sb-l1/.sb-r1` ocultas <600px (se metían en el texto). FAQ y galería tienen `top:24px` para no cortarse por la sección de encima (`section` tiene `overflow:hidden` global).

⚠️ **PNG de banco con fondo a cuadros "pintado"** (sin alfa real) → dan fondo feo. Verificar `tRNS`/canal A antes de usar; si no hay, limpiar con flood-fill (venv Pillow + script `euca_transparent.py`). `mix-blend-mode` NO arregla esto sobre fotos.

---

## Formulario RSVP — estructura "por persona"
- ¿Asistirás? es lo PRIMERO. "No" → solo pide nombre + mensaje "¡Qué pena!". "Sí" → desplegables **Nº de adultos (1-6)** y **Nº de niños (0-6)**; por cada persona la web genera 2 inputs (nombre + alergias).
- Envío: `submitRSVP` construye `URLSearchParams` a mano y hace `fetch(action, {mode:'no-cors'})`. **NO usa iframe ni `target`.** Inputs por persona con clases `.adult-name/.adult-allergy/.child-name/.child-allergy`. Concatena por persona: `"1. Nombre — Alergias: X  |  2. ..."` en los campos de detalle.
- Action URL: `https://docs.google.com/forms/d/e/1FAIpQLSfT0QMw_4OS6nj9S5_IeE2GHfi_Mpxjy7y0PB8uXNteeeRRyA/formResponse`

### Mapa de campos Google Forms (verificado contra FB_PUBLIC_LOAD_DATA_)
| Dato | Entry ID | Notas |
|---|---|---|
| ¿Asistirás? | `entry.472789328` | valores `Si`/`No` **SIN tilde** |
| Nombre y Apellidos (requerido) | `entry.780986739` | = nombre del Adulto 1, o del que declina |
| Nº de adultos | `entry.804536382` | en Forms "Nº de acompañantes"; opciones 1-6 |
| Adultos (nombres+alergias concat) | `entry.109858842` | era "Nombre(s) del acompañante" |
| Nº de niños | `entry.442981203` | era "Niños"; opciones 0-6 |
| Niños (nombres+alergias concat) | `entry.1055713239` | era "Alergias o intolerancias" |
| Canción para la fiesta | `entry.1019189464` | |
| Una nota para los novios | `entry.1825186790` | |
| (huérfano, sin uso) | `entry.632559527` | "¿Vienes con acompañante?" — se puede borrar |

⚠️ **REGLA CLAVE:** un valor de desplegable que no coincida EXACTO (incluida cada tilde) con la opción del Form → Google rechaza TODA la respuesta en silencio (el toast aparece igual). Renombrar/reordenar campos en Forms NO cambia el entry ID; borrar+recrear SÍ.

🔧 **Diagnóstico sin gastar créditos:** `curl` del viewform público → extraer `FB_PUBLIC_LOAD_DATA_` (tiene títulos, entry IDs y opciones exactas). Probar envíos con `curl --data-urlencode` al `/formResponse`: 200 = ok, 400 = rechazado.

---

## Exportar invitados a CSV (1 fila por persona)
`apps-script-invitados.gs` (en el repo como referencia; NO afecta a la web). Pegar en Extensiones→Apps Script de la Google Sheet de respuestas → menú "Boda 💍 → Generar lista de invitados" crea pestaña "Invitados" → Archivo→Descargar→CSV. NO añade columnas de canción/mensaje (se revirtió: generaba duplicados al ser 1 fila por persona).

---

## Cambios de texto (sesión 5)
"maravillosa presencia" (era hermosa); quitado h2 "Cómo será la jornada"; "¡Sé tú mismo!" (acentos); ceremonia **17:30** (era 18:00, quitada entrada "17:30 llegada"); **& → "y"** en todos los "Nazaret y Andrés"; quitado "Bienvenidos a la invitación de" del splash; hint de galería adaptado táctil/ratón; fecha del hero en fuente Great Vibes.

## PENDIENTE
- [ ] **Limpiar pruebas:** borrar de la Google Sheet las filas `TEST_BORRAR` (envíos de prueba por curl).
- [x] **IBAN** real puesto: `ES03 0182 5332 1502 0610 4659` (en `#iban`).

## Advertencia: agentes paralelos
Si se lanzan varios agentes editando `index.html`, verificar después: el `<form>` con `action` y `onsubmit="submitRSVP(event)"` (sin `target`/iframe), sin campo email, y que `submitRSVP` mete los entry IDs correctos.
