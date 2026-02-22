import { useMemo, useState, useEffect } from 'react'
import { BookOpenCheck, ClipboardCheck, LoaderCircle, Sparkles, Download, FileText, Moon, Sun } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { generateGuide } from './api/client'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'

const quickTopics = [
  'La Guerra Civil Española',
  'La Generación del 27',
  'Present Perfect vs Past Simple',
]

const quickProfiles = [
  'Mayoría de estudiantes de Colombia y Venezuela',
  'Grupo mixto con alumnado de Marruecos, Perú y Rumanía',
  'Clase de recién llegados con nivel intermedio de español',
]

// Pasos de pensamiento falsos para calmar al usuario
const thinkingSteps = [
  "🧠 Analizando perfil cultural de los estudiantes...",
  "📚 Consultando el currículo oficial (BOE)...",
  "🔎 Detectando palabras complejas o arcaicas...",
  "🌉 Construyendo puentes culturales...",
  "✍️ Redactando ficha didáctica inclusiva...",
  "✨ Dando los últimos toques de magia..."
]

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [draft, setDraft] = useState({
    tema: quickTopics[0],
    materia: 'Historia',
    perfil_alumnos: quickProfiles[0],
  })
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("") // Nuevo: paso actual
  const [resultado, setResultado] = useState('')
  const [error, setError] = useState('')
  const [lastPayload, setLastPayload] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const canSubmit = useMemo(
    () => draft.tema.trim().length >= 3 && draft.perfil_alumnos.trim().length >= 5,
    [draft],
  )

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  // Lógica de descarga
  const downloadFicha = () => {
    if (!resultado) return;
    const element = document.createElement("a");
    const file = new Blob([resultado], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `Ficha_PuenteCultural_${draft.tema.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const onGenerate = async () => {
    setLoading(true)
    setError('')
    setResultado('')

    // Iniciar animación de pensamiento
    let stepIndex = 0;
    setLoadingStep(thinkingSteps[0]);
    const intervalId = setInterval(() => {
      stepIndex = (stepIndex + 1) % thinkingSteps.length;
      setLoadingStep(thinkingSteps[stepIndex]);
    }, 3500); // Cambia mensaje cada 3.5 segundos

    const payload = {
      tema: draft.tema.trim(),
      materia: draft.materia,
      perfil_alumnos: draft.perfil_alumnos.trim(),
    }

    try {
      const data = await generateGuide(payload)
      setResultado(data.resultado)
      setLastPayload(payload)
      setHistory((prev) => [payload, ...prev].slice(0, 5))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado.'
      setError(message) // Simplificado
    } finally {
      clearInterval(intervalId); // Detener animación
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-12 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header con gradiente */}
        <header className="mb-8 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-yellow-300" size={20} />
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Puente Cultural · IA para Docentes</p>
              </div>
              <h1 className="text-3xl font-bold sm:text-4xl">Generador de Fichas Inclusivas</h1>
              <p className="mt-3 max-w-2xl text-lg text-blue-100 leading-relaxed">
                Crea material didáctico adaptado a la realidad cultural de tu aula.
                Conecta el currículo oficial con las historias de tus estudiantes.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={toggleTheme}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              {theme === 'dark' ? (
                <span className="inline-flex items-center gap-2">
                  <Sun size={16} /> Modo claro
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Moon size={16} /> Modo noche
                </span>
              )}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* COLUMNA IZQUIERDA: Formulario */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-t-4 border-t-blue-600 shadow-md dark:bg-slate-900 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpenCheck className="text-blue-600" />
                  Solicitud Docente
                </CardTitle>
                <CardDescription>
                  Define el contexto de tu clase para personalizar la guía.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Tema o Concepto</label>
                  <Input
                    placeholder="Ej: La Generación del 27, Ecuaciones de primer grado..."
                    value={draft.tema}
                    onChange={(e) => updateField('tema', e.target.value)}
                    className="border-slate-300 bg-white text-slate-900 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {quickTopics.map((t) => (
                      <button
                        key={t}
                        onClick={() => updateField('tema', t)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Materia / Asignatura</label>
                  <select
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    value={draft.materia}
                    onChange={(e) => updateField('materia', e.target.value)}
                  >
                    <option value="Historia">Historia</option>
                    <option value="Literatura">Lengua y Literatura</option>
                    <option value="Filosofía">Filosofía</option>
                    <option value="Ciencias Sociales">Ciencias Sociales</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Perfil del Alumnado</label>
                  <Textarea
                    placeholder="Describe a tus estudiantes: nacionalidades, nivel de idioma, intereses..."
                    value={draft.perfil_alumnos}
                    onChange={(e) => updateField('perfil_alumnos', e.target.value)}
                    className="min-h-[120px] border-slate-300 bg-white text-slate-900 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  disabled={!canSubmit || loading}
                  onClick={onGenerate}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="animate-spin" size={20} />
                      Pensando...
                    </span>
                  ) : (
                    '✨ Generar Ficha Docente'
                  )}
                </Button>

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
                    <strong>Error:</strong> {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historial rápido */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Últimas Fichas</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-400 italic dark:text-slate-500">Aquí aparecerán tus fichas recientes.</p>
                ) : (
                  <ul className="space-y-2">
                    {history.map((item, index) => (
                      <li key={index} className="flex flex-col p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-default dark:hover:bg-slate-800 dark:hover:border-slate-700">
                        <span className="font-medium text-slate-800 text-sm dark:text-slate-100">{item.tema}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{item.materia}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA: Resultados */}
          <div className="lg:col-span-8">
            <Card className="h-full min-h-[500px] border-0 shadow-none bg-transparent">
              {loading ? (
                // --- ESTADO DE CARGA ---
                <div className="flex flex-col items-center justify-center h-full p-12 bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse dark:bg-slate-900 dark:border-slate-700">
                  <div className="bg-blue-100 p-6 rounded-full mb-6 dark:bg-blue-900/30">
                    <Sparkles className="text-blue-600 w-12 h-12 animate-spin-slow" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2 dark:text-slate-100">Creando tu ficha...</h3>
                  <p className="text-blue-600 font-medium text-lg text-center max-w-md animate-bounce-slow">
                    {loadingStep}
                  </p>
                  <p className="text-slate-400 text-sm mt-8 dark:text-slate-500">Esto puede tardar entre 30-60 segundos.</p>
                </div>
              ) : resultado ? (
                // --- RESULTADO ---
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                      <ClipboardCheck />
                      <span>¡Ficha Generada con Éxito!</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(resultado)}>
                        Copiar Texto
                      </Button>
                      <Button variant="default" size="sm" onClick={downloadFicha} className="bg-green-600 hover:bg-green-700">
                        <Download size={16} className="mr-2" /> Descargar Ficha
                      </Button>
                    </div>
                  </div>

                  <div className="prose prose-blue prose-lg max-w-none bg-white p-8 rounded-xl shadow-md border border-slate-200 dark:prose-invert dark:bg-slate-900 dark:border-slate-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {resultado}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                // --- ESTADO VACÍO ---
                <div className="flex flex-col items-center justify-center h-full bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-300 p-12 text-center dark:bg-slate-900/40 dark:border-slate-700">
                  <div className="bg-slate-200 p-4 rounded-full mb-4 dark:bg-slate-800">
                    <FileText className="text-slate-400 w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">Tu espacio de trabajo está vacío</h3>
                  <p className="text-slate-500 max-w-sm mt-2 dark:text-slate-400">
                    Rellena el formulario de la izquierda para generar material didáctico adaptado a tu clase.
                  </p>
                </div>
              )}
            </Card>
          </div>

        </div>
      </section>
    </main>
  )
}

export default App