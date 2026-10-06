import { Icon } from '@iconify/react';

export default function TranscriptPanel({ pages }) {
  return (
    <aside className="mx-auto mt-4 w-full max-w-4xl rounded-2xl border-2 border-[#8b6914]/40 bg-white/90 p-3 shadow-lg">
      <div className="flex items-center gap-3 border-b border-dashed border-[#8b5e3c]/30 pb-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#2d6a4f] to-emerald-500 text-white">
          <Icon icon="fa6-solid:closed-captioning" aria-hidden="true" />
        </span>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#8f1e23]">
            Conteúdo acessível
          </p>
          <h2 className="font-display text-lg font-black text-[#2d6a4f]">
            Transcrição da página
          </h2>
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        {pages.map((page) => {
          const regions = [...(page.regions || [])].sort(
            (a, b) => Number(a.order || 0) - Number(b.order || 0),
          );

          return (
            <section
              key={page.page}
              className="rounded-xl border border-[#8b5e3c]/20 bg-white/75 p-3"
            >
              <h3 className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-2 py-1 text-xs font-black text-[#7a4b13]">
                <Icon icon="solar:document-text-bold-duotone" aria-hidden="true" />
                Página {page.page}
              </h3>

              {regions.length ? (
                <ol className="grid gap-2">
                  {regions.map((region, index) => (
                    <li
                      key={`${page.page}-${region.order || index}`}
                      className="rounded-lg border-l-4 border-[#f5a800] bg-white p-2 text-sm font-bold leading-normal text-[#5d2b0a]"
                    >
                      <span className="mb-0.5 block text-[10px] font-black uppercase text-[#2d6a4f]">
                        {region.typeLabel || 'Texto'}
                        {region.character ? ` · ${region.character}` : ''}
                      </span>
                      {region.text}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm font-bold text-[#6b3a1f]">
                  Nenhum texto nesta página.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
