import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function tipoDesdeCSV(tipo: string, nombre: string): string {
  if (tipo === 'Aula ordinaria') return 'AULA_ORDINARIA'
  const n = nombre.toLowerCase()
  if (n.includes('biblioteca')) return 'BIBLIOTECA'
  if (n.includes('sala de profesores')) return 'SALA_PROFESORES'
  if (n.includes('departamento')) return 'DEPARTAMENTO'
  if (n.includes('despacho') || n.includes('secretar') || n.includes('direcci') ||
      n.includes('jefatura') || n.includes('conserjer') || n.includes('reprograf') ||
      n.includes('p.i.e.e') || n.includes('salón')) return 'DESPACHO'
  return 'OTRO'
}

const espaciosCSV = [
  // Planta baja
  { planta: 0, codigo: '001', nombre: 'Aula 1', tipo: '' },
  { planta: 0, codigo: '002', nombre: 'Aula 2', tipo: '' },
  { planta: 0, codigo: '003', nombre: 'Aula 3', tipo: '' },
  { planta: 0, codigo: '004', nombre: 'Aula 4', tipo: '' },
  { planta: 0, codigo: '005', nombre: 'Aula 5', tipo: 'Aula ordinaria' },
  { planta: 0, codigo: '006', nombre: 'Aula 6', tipo: 'Aula ordinaria' },
  { planta: 0, codigo: '007', nombre: 'Aula 7', tipo: '' },
  { planta: 0, codigo: '008', nombre: 'Aula 8', tipo: 'Aula ordinaria' },
  { planta: 0, codigo: '009', nombre: 'Aula 9', tipo: '' },
  { planta: 0, codigo: '010', nombre: 'Aula 10', tipo: '' },
  { planta: 0, codigo: 'DEP-FQ', nombre: 'Departamento física y química', tipo: '' },
  { planta: 0, codigo: 'DEP-BG', nombre: 'Departamento biología y geología', tipo: '' },
  { planta: 0, codigo: 'BIBLIOTECA', nombre: 'Biblioteca', tipo: '' },
  { planta: 0, codigo: 'DEP-ORI', nombre: 'Departamento orientación', tipo: '' },
  { planta: 0, codigo: 'CONSERJERIA', nombre: 'Conserjería', tipo: '' },
  { planta: 0, codigo: 'PIEE', nombre: 'P.I.E.E.', tipo: '' },
  { planta: 0, codigo: 'SECRETARIA', nombre: 'Secretaría y administración', tipo: '' },
  { planta: 0, codigo: 'DESP-SEC', nombre: 'Despacho secretario', tipo: '' },
  { planta: 0, codigo: 'JEFATURA', nombre: 'Jefatura de estudios', tipo: '' },
  { planta: 0, codigo: 'DIRECCION', nombre: 'Dirección', tipo: '' },
  { planta: 0, codigo: 'DEP-TEC', nombre: 'Departamento tecnología', tipo: '' },
  { planta: 0, codigo: 'DEP-EF', nombre: 'Departamento educación física', tipo: '' },
  // Planta 1
  { planta: 1, codigo: '101', nombre: 'Aula 101', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '102', nombre: 'Aula 102', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '103', nombre: 'Aula 103', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '104', nombre: 'Aula 104', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '105', nombre: 'Aula 105', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '106', nombre: 'Aula 106', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '107', nombre: 'Aula 107', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '108', nombre: 'Aula 108', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '109', nombre: 'Aula 109', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '110', nombre: 'Aula 110', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '111', nombre: 'Aula 111', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '112', nombre: 'Aula 112', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '113', nombre: 'Aula 113', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '114', nombre: 'Aula 114', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '115', nombre: 'Aula 115', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '116', nombre: 'Aula 116', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: '117', nombre: 'Aula 117', tipo: 'Aula ordinaria' },
  { planta: 1, codigo: 'SALA-PROF', nombre: 'Sala de profesores', tipo: '' },
  { planta: 1, codigo: 'DEP-ING', nombre: 'Departamento de inglés', tipo: '' },
  { planta: 1, codigo: 'DEP-FIL', nombre: 'Departamento filosofía/economía/religión', tipo: '' },
  { planta: 1, codigo: 'REPROGRAFIA', nombre: 'Reprografía', tipo: '' },
  { planta: 1, codigo: 'DEP-INF', nombre: 'Departamento informática', tipo: '' },
  { planta: 1, codigo: 'DESP-SOC', nombre: 'Despacho trabajadora social/orientadora', tipo: '' },
  { planta: 1, codigo: 'DEP-MAT', nombre: 'Departamento matemáticas', tipo: '' },
  { planta: 1, codigo: 'DEP-GEO', nombre: 'Departamento geografía e historia', tipo: '' },
  { planta: 1, codigo: 'DEP-LEN', nombre: 'Departamento de lengua', tipo: '' },
  { planta: 1, codigo: 'DEP-MUS', nombre: 'Departamento de música', tipo: '' },
  { planta: 1, codigo: 'SALON-ACTOS', nombre: 'Salón de actos', tipo: '' },
  // Planta 2
  { planta: 2, codigo: '201', nombre: 'Aula 201', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '202', nombre: 'Aula 202', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '203', nombre: 'Aula 203', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '204', nombre: 'Aula 204', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '205', nombre: 'Aula 205', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '206', nombre: 'Aula 206', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '207', nombre: 'Aula 207', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '208', nombre: 'Aula 208', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '209', nombre: 'Aula 209', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '210', nombre: 'Aula 210', tipo: '' },
  { planta: 2, codigo: '212', nombre: 'Aula 212', tipo: '' },
  { planta: 2, codigo: '213', nombre: 'Aula 213', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '214', nombre: 'Aula 214', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '215', nombre: 'Aula 215', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '216', nombre: 'Aula 216', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '217', nombre: 'Aula 217', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '218', nombre: 'Aula 218', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '219', nombre: 'Aula 219', tipo: '' },
  { planta: 2, codigo: '220', nombre: 'Aula 220', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '221', nombre: 'Aula 221', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '222', nombre: 'Aula 222', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '223', nombre: 'Aula 223', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: '224', nombre: 'Aula 224', tipo: 'Aula ordinaria' },
  { planta: 2, codigo: 'DEP-ART', nombre: 'Departamento artes plásticas y visuales', tipo: '' },
  // Carros de portátiles (móviles) — 4 carros
  { planta: null, codigo: 'CARRO-1', nombre: 'Carro portátiles 1', tipo: '' },
  { planta: null, codigo: 'CARRO-2', nombre: 'Carro portátiles 2', tipo: '' },
  { planta: null, codigo: 'CARRO-3', nombre: 'Carro portátiles 3', tipo: '' },
  { planta: null, codigo: 'CARRO-4', nombre: 'Carro portátiles 4', tipo: '' },
]

async function main() {
  console.log('Cargando espacios...')
  let creados = 0
  let omitidos = 0

  for (const e of espaciosCSV) {
    const tipo = tipoDesdeCSV(e.tipo, e.nombre)
    const tipoFinal = e.codigo.startsWith('CARRO') ? 'CARRO_PORTATILES' : tipo

    try {
      await prisma.espacio.upsert({
        where: { codigo: e.codigo },
        update: {},
        create: {
          codigo: e.codigo,
          nombre: e.nombre,
          planta: e.planta,
          tipo: tipoFinal as any,
        }
      })
      creados++
    } catch {
      omitidos++
    }
  }

  console.log(`✔ ${creados} espacios cargados, ${omitidos} omitidos.`)

  // Equipar automáticamente las aulas ordinarias con PC profesor + proyector
  const aulasOrdinarias = await prisma.espacio.findMany({
    where: { tipo: 'AULA_ORDINARIA' as any },
    include: { equipos: true }
  })

  let equiposCreados = 0
  for (const aula of aulasOrdinarias) {
    if (aula.equipos.length === 0) {
      await prisma.equipo.createMany({
        data: [
          { nombre: 'PC Profesor', tipo: 'PC', espacioId: aula.id },
          { nombre: 'Pantalla/Proyector', tipo: 'PROYECTOR', espacioId: aula.id },
        ]
      })
      equiposCreados += 2
    }
  }

  console.log(`✔ ${equiposCreados} equipos creados en aulas ordinarias.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
