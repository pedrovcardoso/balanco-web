import { Icon } from '@iconify/react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { ROUTES } from '../../shared/constants/routes.js';

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(ROUTES.HOME, {
      replace: true,
    });
  };

  return (
    <div className="relative flex min-h-[calc(100vh-7rem)] w-full items-center justify-center overflow-hidden px-4 py-12">
      <section className="relative w-full max-w-xl text-center">
        <div
          className="
            pointer-events-none
            absolute left-1/2 top-1/2
            h-[26rem] w-[26rem]
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(255,248,210,0.68)_0%,rgba(255,226,139,0.25)_38%,transparent_72%)]
            blur-xl
          "
          aria-hidden="true"
        />

        <div
          className="
            relative overflow-hidden
            rounded-[2.5rem]
            border border-white/55
            bg-[#fffaf0]/60
            px-6 py-10
            shadow-[0_25px_70px_rgba(30,55,35,0.22)]
            backdrop-blur-[5px]
            sm:px-10 sm:py-12
          "
        >
          <div
            className="
              pointer-events-none
              absolute inset-2
              rounded-[2rem]
              border border-dashed
              border-[#8b6914]/20
            "
            aria-hidden="true"
          />

          <div className="relative">
            <div
              className="
                relative mx-auto
                grid h-24 w-24
                place-items-center
                rounded-[2rem]
                border-[3px] border-white/75
                bg-gradient-to-br
                from-[#2d6a4f]
                to-emerald-500
                text-4xl text-white
                shadow-[0_18px_35px_rgba(45,106,79,0.28)]
              "
            >
              <Icon icon="solar:map-point-wave-bold-duotone" aria-hidden="true" />

              <span
                className="
                  absolute -right-2 -top-2
                  grid h-9 min-w-9
                  place-items-center
                  rounded-full
                  border-2 border-white
                  bg-[#c0272d]
                  px-2
                  text-xs font-black
                  text-white
                  shadow-md
                "
                aria-hidden="true"
              >
                404
              </span>
            </div>

            <h1
              className="
                mt-3
                font-display
                text-4xl font-black
                leading-[1.05]
                text-[#4a250c]
                sm:text-5xl
              "
            >
              Página não encontrada
            </h1>

            <p
              className="
                mx-auto mt-4
                max-w-md
                text-sm font-bold
                leading-relaxed
                text-[#6b3a1f]
                sm:text-base
              "
            >
              O endereço acessado pode ter sido alterado,
              removido ou digitado incorretamente.
            </p>

            <div
              className="
                mx-auto mt-5
                max-w-sm overflow-hidden
                text-ellipsis whitespace-nowrap
                rounded-xl
                border border-white/50
                bg-white/35
                px-4 py-2
                font-mono text-xs font-bold
                text-[#7a4b13]
              "
              title={location.pathname}
            >
              {location.pathname}
            </div>

            <button
              type="button"
              onClick={handleBack}
              className="
                group mx-auto mt-8
                inline-flex min-h-12
                items-center justify-center
                gap-2.5
                rounded-full
                border-2 border-[#f5a800]
                bg-gradient-to-br
                from-[#2d6a4f]
                to-[#174b35]
                px-7
                font-black text-white
                shadow-[0_12px_24px_rgba(45,106,79,0.25)]
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-[0_18px_32px_rgba(45,106,79,0.32)]
                active:translate-y-0
                active:scale-[0.98]
                focus-visible:outline
                focus-visible:outline-4
                focus-visible:outline-offset-4
                focus-visible:outline-[#f5a800]
                motion-reduce:transition-none
              "
            >
              <Icon
                icon="fa6-solid:arrow-left"
                className="
                  transition-transform duration-300
                  group-hover:-translate-x-1
                  motion-reduce:transition-none
                "
                aria-hidden="true"
              />

              Voltar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}