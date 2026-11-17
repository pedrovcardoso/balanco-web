import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/routes.js';
import treasureChestImg from '@assets/images/treasure-chest.png';

export default function TrophyEnd({ unlocked = false, statusUnavailable = false }) {
  return (
    <Link to={ROUTES.CONQUISTAS} aria-label="Visualizar minhas conquistas: Cidadão Fiscal Nota A" className="relative inline-flex flex-col items-center rounded-[22px] border-[3px] border-[#f5a800] bg-gradient-to-br from-yellow-100 to-orange-50 px-6 py-3 text-center no-underline shadow-lg transition hover:-translate-y-1 hover:border-[#c0272d] hover:shadow-xl">
      <img src={treasureChestImg} alt="" loading="lazy" decoding="async" className="w-24 object-contain drop-shadow-md" />
      <strong className="mt-2 font-display text-base text-[#5d2b0a]">Cidadão Fiscal Nota A!</strong>
      <span className="mt-1 text-xs font-bold text-[#8b5e3c]">Visualizar minhas conquistas</span>
      {!unlocked && !statusUnavailable && (
        <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#c0272d] text-xs text-white" role="img" aria-label="Certificado pendente" title="Conclua a trilha para liberar">
          <Icon icon="fa6-solid:lock" aria-hidden="true" />
        </span>
      )}
    </Link>
  );
}
