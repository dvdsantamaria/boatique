# Squarespace Maquetación Playbook (Migraciones)

## Objetivo
Este documento resume, en formato operativo, todo lo aprendido al replicar layouts de Squarespace en HTML/CSS custom.  
Está enfocado en evitar regresiones visuales y mantener consistencia responsive cuando se migra un sitio desde Squarespace.

Nota: varios puntos son **observaciones prácticas** extraídas de comparar página a página contra una versión Squarespace real.

---

## 1) Qué es propio de Squarespace (y suele romperse al migrar)

1. Squarespace prioriza **bloques dentro de columnas fluidas**, no layouts rígidos por componente.
2. El sistema mantiene **alineación de contenedor + gutters** muy estable entre breakpoints.
3. Las imágenes usan lógica de **máscara + fill + focal point** (no “mostrar imagen completa”).
4. En bloques 2 columnas, Squarespace mantiene una sensación de **balance vertical** entre texto e imagen.
5. El crop visual es “editorial”: importa más el **punto de foco** que respetar ratio original.
6. El spacing entre título, media, cuerpo y CTA tiene una **cadencia uniforme** en todo el sitio.

---

## 2) Sistema de layout que conviene replicar

## 2.1 Contenedor
- Definir un `max-width` global único (ej. `1400px`) y gutters fluidos con `clamp`.
- Nunca dejar que el contenido “toque bordes” al reducir viewport.
- No mezclar múltiples lógicas de gutter por página salvo caso excepcional.

Patrón recomendado:

```css
.container {
  max-width: 1400px;
  margin-inline: auto;
  padding-inline: clamp(20px, 6vw, 84px);
}
```

## 2.2 Breakpoints
- Mantener una base de 3 zonas:
1. Mobile: `<768px`
2. Tablet: `768–989px`
3. Desktop: `>=990px`

- En desktop, para secciones de 2 columnas, usar `repeat(2, minmax(0, 1fr))` + gap consistente.
- Evitar grillas híbridas “11fr + separador + 11fr” si luego se mezclan reglas de columnas; eso fue fuente de bugs.

## 2.3 Gaps y ritmo vertical
- Definir tokens globales:
  - gap de columnas (`--content-grid-gap`)
  - gap de filas (`row-gap` con `clamp`)
  - spacing de secciones (`--section-space-y`)
- No hardcodear `margin-top` aislados en cada bloque sin sistema.

---

## 3) Imágenes: máscara, fill y focal point (clave de Squarespace)

## 3.1 Regla base
- La imagen debe comportarse como **liquid fill**:
  - `width: 100%`
  - `height: 100%`
  - `object-fit: cover`
- El recorte lo define el contenedor/máscara, no la imagen.

```css
.mask {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.mask > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## 3.2 Balance texto/imagen en desktop
- Si el texto crece o se achica según breakpoint, la imagen debe acompañar:
  - `grid` con `align-items: stretch`
  - columna de media con `height: 100%`
  - máscara con `height: 100%`
- Resultado: la imagen siempre equilibra visualmente la altura del texto, como Squarespace.

## 3.3 Foco por imagen (object-position)
- Definir foco por bloque con variables CSS, no valores sueltos en múltiples reglas.
- Ejemplo:

```css
.service-row-consulting .mask {
  --focus-x: 50%;
  --focus-y: 50%;
}

.service-row-filippetti .mask {
  --focus-x: 81%;
  --focus-y: 56%;
}

.service-row .mask > img {
  object-position: var(--focus-x) var(--focus-y);
}
```

## 3.4 Errores comunes detectados
- Forzar ancho fijo de media (`width: min(100%, 23rem)`) en desktop.
- Mezclar `aspect-ratio` fijo con `height: 100%` sin coherencia.
- Duplicar imagen mobile y desktop sin guardas claras de visibilidad.
- Definir `object-position` en 4 lugares distintos para el mismo bloque.

---

## 4) Estrategia robusta mobile/desktop para media duplicada

Cuando se usan dos nodos (uno mobile, uno desktop):

1. Asignar clases explícitas de intención:
   - `*-media-mobile`
   - `*-media-desktop`
2. Aplicar guardas globales simples:

```css
.media-mobile { display: block; }
.media-desktop { display: none; }

@media (min-width: 768px) {
  .media-mobile { display: none !important; }
  .media-desktop { display: block !important; }
}
```

3. Nunca depender solo de utilidades sueltas (`md:hidden`, `hidden md:block`) sin una capa de seguridad.

---

## 5) Tipografía y headings (consistencia Squarespace-like)

1. Un único sistema de escala por breakpoint para `h1/h2/h3`.
2. Headings principales deben ser relativos al contenedor, no al viewport puro.
3. Usar line-height y letter-spacing consistentes (ej. headings con `line-height ~1.2`).
4. Evitar sobrescribir tamaños por página salvo excepciones de diseño real.

Checklist mínimo:
- ¿Todos los `main headings` comparten escala base?
- ¿El salto de tamaño mobile→desktop es gradual y no brusco?
- ¿La jerarquía visual se conserva en About / Services / Contact?

---

## 6) Botones y alineación

Patrones observados en Squarespace migrado:
- Botones tipo píldora más grandes en desktop.
- Alineación horizontal entre CTAs de columnas hermanas.
- Separación vertical clara entre último párrafo y botón.

Recomendación:
- Definir tamaño mínimo, padding y ancho por token.
- No depender de márgenes arbitrarios por bloque.
- Para dos columnas con CTA: usar estructura y spacing simétrico.

---

## 7) Navbar y comportamiento de scroll

Comportamiento esperado:
- Header fijo arriba.
- Al hacer scroll hacia abajo, se oculta.
- Al hacer scroll hacia arriba, reaparece.

Puntos clave:
- Reservar offset de `main` equivalente a altura de navbar.
- Evitar que el header tape títulos al usar anchors.
- Verificar overlay/transparencia sobre hero/video.

---

## 8) QA de migración (obligatorio antes de deploy)

## 8.1 Breakpoints a testear
- 390x844 (iPhone)
- 430x932 (iPhone Pro Max)
- 768x1024 (tablet portrait)
- 1024x768 (tablet landscape)
- 1366x768
- 1440x900+

## 8.2 Casos visuales críticos
- Márgenes laterales (no colapsan al reducir ancho).
- Gap central entre columnas.
- Balance texto/imagen por fila.
- Crop/foco correcto de cada imagen enmascarada.
- Orden de bloques en mobile (título → imagen → texto cuando corresponda).
- Sin scroll horizontal en ningún breakpoint.

## 8.3 Casos funcionales
- Menú mobile abre/cierra correctamente.
- CTA header visible y consistente.
- Anchor de hero no tapa títulos.
- Video hero en loop (si requerido por negocio).

---

## 9) Performance y accesibilidad en migraciones Squarespace → custom

Lecciones prácticas:
1. Optimizar imágenes por breakpoint (`srcset`, `sizes`, WebP/AVIF).
2. Declarar `width/height` para evitar CLS.
3. Añadir labels reales en formularios (`label` + `for`).
4. Revisar contraste de textos secundarios.
5. Revisar caption tracks en video si aplica accesibilidad formal.
6. Caching largo para imágenes/versionado de assets.

---

## 10) Patrón recomendado para futuras migraciones (resumen ejecutivo)

1. **Tokenizar**: gutters, gaps, escalas tipográficas, botones.
2. **Normalizar contenedor** en todas las páginas.
3. **Implementar máscara universal** (`cover + focus`) para media.
4. **Configurar focos por bloque** con variables CSS.
5. **Separar mobile/desktop media** con guardas explícitas.
6. **Asegurar balance por fila** con grid stretch en desktop.
7. **QA cruzada** contra referencia Squarespace por breakpoint.
8. **Congelar estándar** en un playbook para no re-romper al iterar.

---

## 11) Anti-regresiones (muy importante)

Antes de tocar layout en cualquier página:
- Verificar si existe otra regla más abajo en el CSS que pisa tu cambio.
- Buscar duplicados de `object-position`, `aspect-ratio`, `height`.
- Evitar sumar “fixes” sin limpiar reglas antiguas conflictivas.
- Mantener una sola fuente de verdad por componente.

Comando útil:

```bash
rg -n "object-position|aspect-ratio|height: 100%|service-row|media-desktop|media-mobile" css/styles.css
```

---

## 12) Definición de terminado (DoD) para migraciones Squarespace

Un bloque se considera terminado cuando:
- Se ve igual o prácticamente igual en los breakpoints objetivo.
- Conserva foco visual correcto de imágenes.
- No genera scroll horizontal.
- Mantiene ritmo de spacing consistente.
- No rompe otras páginas al ajustar una sola.
- Pasa QA visual side-by-side contra referencia.

---

Si este documento se toma como estándar interno, conviene mantenerlo versionado y actualizarlo cada vez que se cierre una migración grande con nuevos hallazgos.

