export default function ReadingProgress({ currentPage, totalPages }) {
  const percentage = Math.round(
    (currentPage / Math.max(totalPages, 1)) * 100,
  );

  return (
    <div className="mx-auto mt-4 w-full max-w-2xl">
      <div
        className="h-3 overflow-hidden rounded-full border-2 border-[#8b6914]/40 bg-white/60"
        role="progressbar"
        aria-label="Progresso da leitura"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={percentage}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#c0272d] via-[#f5a800] to-[#2d6a4f] transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
