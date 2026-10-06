import carrancaImg from '@assets/images/loading/carranca.png';
import canoaImg from '@assets/images/loading/canoa.png';

export default function LoadingRiver() {
  return (
    <div className="mg-river-scene asset-river" aria-label="Animação do Rio São Francisco (Velho Chico)">
      <div className="river-sun-asset" />
      <div className="river-bank-asset" />

      {/* Camadas ondulantes do Rio São Francisco */}
      <div className="river-wave-layer w1" />
      <div className="river-wave-layer w2" />

      {/* Carranca protetora das águas na margem */}
      <div className="carranca-fixed-wrap">
        <img
          className="carranca-fixed"
          src={carrancaImg}
          alt="Carranca do Rio São Francisco"
          loading="eager"
        />
      </div>

      {/* Canoa navegando pelas águas */}
      <div className="canoa-only-wrap">
        <img
          className="canoa-only"
          src={canoaImg}
          alt="Canoa no Velho Chico"
          loading="eager"
        />
      </div>

      <div className="river-wave-layer w3" />
    </div>
  );
}

