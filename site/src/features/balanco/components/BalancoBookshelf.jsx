import BalancoBookCard from './BalancoBookCard.jsx';

export default function BalancoBookshelf({
  chaptersProgress = {},
  onSelectBook,
}) {
  const books = [
    {
      id: 'chapter-1',
      volume: 'Vol. 01',
      title: 'Administração Pública',
      icon: 'fa6-solid:building-columns',
      themeColor: 'orange',
      description: 'Conheça os pilares da Administração Pública, os poderes do estado e o ciclo orçamentário.',
    },
    {
      id: 'chapter-2',
      volume: 'Vol. 02',
      title: 'Relatórios Fiscais',
      icon: 'fa6-solid:chart-pie',
      themeColor: 'blue',
      description: 'Entenda o Balanço Geral, Receitas, Despesas por função e os indicadores fiscais (RGF).',
    },
    {
      id: 'chapter-3',
      volume: 'Vol. 03',
      title: 'Controle & Cidadania',
      icon: 'fa6-solid:user-shield',
      themeColor: 'green',
      description: 'Saiba como funciona a fiscalização pública, a transparência e o controle social.',
    },
  ];

  // Calcula estatísticas gerais
  const totalBooks = books.length;
  const readCount = books.filter((b) => chaptersProgress[b.id] === 'read').length;

  return (
    <div className="w-full max-w-4xl mx-auto my-0 px-0">
      {/* Container Principal da Livraria (Estilo Mapa Gamificado - sem shadow) */}
      <div className="relative bg-[#faebd7] border-4 border-[#c7a475] rounded-3xl p-4 sm:p-5 overflow-hidden">
        {/* Linha tracejada interna */}
        <div className="absolute inset-2 sm:inset-3 border-2 border-dashed border-[#d1b48c] rounded-2xl pointer-events-none" />

        {/* Status de Progresso Geral */}
        <div className="relative z-10 text-center mb-3">
          <h2 className="text-stone-800 text-lg sm:text-xl font-black">
            Escolha um caderno para iniciar a leitura
          </h2>
          <p className="text-stone-600 text-xs font-bold mt-0.5">
            Progresso da leitura: <span className="text-amber-800 font-extrabold">{readCount} de {totalBooks} cadernos concluídos</span>
          </p>

          {/* Barra de progresso da biblioteca */}
          <div className="w-44 sm:w-56 bg-stone-300/80 h-2.5 rounded-full mx-auto mt-1.5 overflow-hidden p-0.5 border border-amber-900/10">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(readCount / totalBooks) * 100}%` }}
            />
          </div>
        </div>

        {/* Grid dos Livros na Estante */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 justify-items-center my-2 py-1">
          {books.map((book) => (
            <div key={book.id} className="flex flex-col items-center">
              <BalancoBookCard
                volume={book.volume}
                title={book.title}
                icon={book.icon}
                themeColor={book.themeColor}
                status={chaptersProgress[book.id] || 'unread'}
                onClick={() => onSelectBook(book.id)}
              />
              {/* Gap maior entre o livro e sua descrição (mt-4 sm:mt-5) */}
              <p className="text-stone-600 text-[11px] font-bold text-center mt-4 sm:mt-5 max-w-[170px] leading-tight hidden sm:block">
                {book.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
