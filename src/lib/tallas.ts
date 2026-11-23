/**
 * Guía de tallas de Chévere: una sola fuente de datos para la página /guia-de-tallas,
 * el modal de la ficha de producto y el buscador "¿Cuál es mi talla?".
 * Medidas del cuerpo en centímetros (no de la prenda). Edítalas aquí si tu mercancía calza distinto.
 */

export type Tabla = { id: string; titulo: string; nota?: string; cols: string[]; filas: string[][] }

/** Rango "a–b" → [a, b] para comparar medidas. */
export const rango = (s: string): [number, number] => {
  const [a, b] = s.split('–').map((n) => parseFloat(n.replace(',', '.')))
  return [a, b ?? a]
}

export const DAMAS: Tabla = {
  id: 'damas',
  titulo: 'Damas: blusas, franelas, vestidos y faldas',
  nota: 'Una misma talla puede venir marcada con letra o con número. Busca tu fila con cualquiera de las dos.',
  cols: ['Letra', 'Número (US)', 'Busto (cm)', 'Cintura (cm)', 'Cadera (cm)'],
  filas: [
    ['XS', '0–2', '81–84', '61–64', '86–89'],
    ['S', '4–6', '86–89', '66–69', '91–94'],
    ['M', '8–10', '91–94', '71–74', '97–99'],
    ['L', '12–14', '97–102', '76–81', '102–107'],
    ['XL', '16', '104–109', '84–89', '109–114'],
    ['XXL', '18', '112–117', '91–97', '117–122'],
  ],
}

export const DAMAS_JEANS: Tabla = {
  id: 'damas-jeans',
  titulo: 'Damas: jeans y pantalones',
  nota: 'Los jeans pueden venir por letra, por número de dama (0, 2, 4…) o por pulgadas de cintura (26, 28…). Las tres columnas son la misma talla.',
  cols: ['Letra', 'Número (US)', 'Cintura en pulgadas', 'Cintura (cm)', 'Cadera (cm)'],
  filas: [
    ['XS', '0–2', '24–25', '61–64', '86–89'],
    ['S', '4–6', '26–27', '66–69', '91–94'],
    ['M', '8–10', '28–29', '71–74', '97–99'],
    ['L', '12–14', '30–31', '76–81', '102–107'],
    ['XL', '16', '32–33', '84–89', '109–114'],
    ['XXL', '18', '34–35', '91–97', '117–122'],
  ],
}

export const CABALLEROS: Tabla = {
  id: 'caballeros',
  titulo: 'Caballeros: franelas, camisas y chaquetas',
  nota: 'En camisas de vestir manda el cuello: si te queda entre dos, elige la mayor.',
  cols: ['Letra', 'Pecho (cm)', 'Cintura (cm)', 'Cuello (cm)'],
  filas: [
    ['S', '86–91', '71–76', '36–37'],
    ['M', '96–101', '81–86', '38–39'],
    ['L', '107–112', '86–91', '41–42'],
    ['XL', '117–122', '97–102', '43–44'],
    ['XXL', '127–132', '107–112', '46–47'],
  ],
}

export const CABALLEROS_JEANS: Tabla = {
  id: 'caballeros-jeans',
  titulo: 'Caballeros: jeans y pantalones',
  nota: 'En caballero el jean casi siempre viene por pulgadas de cintura (30, 32, 34…).',
  cols: ['Letra', 'Cintura en pulgadas', 'Cintura (cm)'],
  filas: [
    ['S', '28–30', '71–76'],
    ['M', '31–32', '79–81'],
    ['L', '33–34', '84–86'],
    ['XL', '36–38', '91–97'],
    ['XXL', '40–42', '102–107'],
  ],
}

export const NINOS: Tabla = {
  id: 'ninos',
  titulo: 'Niños y niñas',
  nota: 'La talla infantil es la edad, pero guíate por la estatura: cada niño crece a su ritmo.',
  cols: ['Talla', 'Edad', 'Estatura (cm)', 'Pecho (cm)', 'Cintura (cm)'],
  filas: [
    ['2', '2 años', '86–94', '53', '51'],
    ['4', '4 años', '99–107', '56', '53'],
    ['6', '6 años', '112–119', '61', '56'],
    ['8', '8 años', '122–130', '66', '58'],
    ['10', '10 años', '132–140', '71', '61'],
    ['12', '12 años', '142–150', '76', '64'],
    ['14', '14 años', '152–160', '81', '66'],
    ['16', '16 años', '160–168', '86', '69'],
  ],
}

export const CALZADO_DAMA: Tabla = {
  id: 'calzado-dama',
  titulo: 'Calzado de dama',
  cols: ['Talla VE / EU', 'Talla US', 'Largo del pie (cm)'],
  filas: [
    ['35', '5', '22.5'],
    ['36', '6', '23'],
    ['37', '6.5', '23.5'],
    ['38', '7.5', '24'],
    ['39', '8.5', '25'],
    ['40', '9', '25.5'],
    ['41', '10', '26'],
  ],
}

export const CALZADO_CABALLERO: Tabla = {
  id: 'calzado-caballero',
  titulo: 'Calzado de caballero',
  cols: ['Talla VE / EU', 'Talla US', 'Largo del pie (cm)'],
  filas: [
    ['39', '6.5', '25'],
    ['40', '7', '25.5'],
    ['41', '8', '26'],
    ['42', '8.5', '26.5'],
    ['43', '9.5', '27.5'],
    ['44', '10.5', '28'],
    ['45', '11', '29'],
  ],
}

export const CALZADO_NINOS: Tabla = {
  id: 'calzado-ninos',
  titulo: 'Calzado de niños',
  cols: ['Talla VE / EU', 'Talla US', 'Largo del pie (cm)'],
  filas: [
    ['20', '4.5 C', '12.5'],
    ['22', '6 C', '13.5'],
    ['24', '7.5 C', '14.5'],
    ['26', '9 C', '16'],
    ['28', '10.5 C', '17'],
    ['30', '12 C', '18.5'],
    ['32', '1 Y', '19.5'],
    ['34', '2.5 Y', '21'],
  ],
}

/** Cómo calza la ropa según su procedencia (la mercancía de Chévere viene de varios orígenes). */
export const CALCE_ORIGEN = [
  { origen: 'China y Asia', consejo: 'Suele quedar más ajustada y corta. Te recomendamos pedir una talla más.' },
  { origen: 'Estados Unidos', consejo: 'Calce normal u holgado. Pide tu talla de siempre.' },
  { origen: 'Panamá y Colombia', consejo: 'Calce normal, a veces más ceñido en jeans. Pide tu talla de siempre.' },
]

/** Aviso de calce por producto (campo "calce" en el panel). */
export const AVISO_CALCE = {
  normal: null,
  pequena: 'Esta prenda talla pequeño: te recomendamos pedir una talla más de la que usas.',
  grande: 'Esta prenda talla grande: si estás entre dos tallas, elige la menor.',
} as const
export type Calce = keyof typeof AVISO_CALCE

/** Qué tablas mostrar en el modal de la ficha según colección y tipo de prenda. */
export function tablasPara(principal: string | undefined, sub: string | undefined, tallas: string): Tabla[] {
  const esCalzado = principal === 'calzado' || /\b(3[5-9]|4[0-5])\b/.test(tallas)
  const s = (sub ?? '').toLowerCase()
  if (esCalzado) {
    if (/caballero/.test(s)) return [CALZADO_CABALLERO]
    if (/niñ|nin/.test(s)) return [CALZADO_NINOS]
    if (/dama/.test(s)) return [CALZADO_DAMA]
    return [CALZADO_DAMA, CALZADO_CABALLERO]
  }
  const pantalon = /jean|pantal|short|falda/.test(s)
  if (principal === 'ninos-ninas') return [NINOS]
  if (principal === 'caballeros') return pantalon ? [CABALLEROS_JEANS, CABALLEROS] : [CABALLEROS]
  if (principal === 'damas') return pantalon ? [DAMAS_JEANS, DAMAS] : [DAMAS]
  return []
}

/** Recomienda talla de adulto a partir de medidas en cm. Devuelve la menor talla en la que caben todas. */
export function recomendar(tabla: Tabla, medidas: Record<string, number | undefined>): string | null {
  const usadas = Object.entries(medidas).filter(([, v]) => v && v > 0) as [string, number][]
  if (!usadas.length) return null
  for (const fila of tabla.filas) {
    const cabe = usadas.every(([col, v]) => {
      const i = tabla.cols.indexOf(col)
      return i < 0 || v <= rango(fila[i])[1]
    })
    if (cabe) return fila[0]
  }
  return 'más de ' + tabla.filas.at(-1)![0]
}
