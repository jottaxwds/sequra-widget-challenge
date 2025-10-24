import { useEffect, useRef } from "react";
import type { CreditAgreement } from "../../types";
import CloseIcon from "../ui/CloseIcon";

interface MoreInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInstalment: CreditAgreement;
}

const MoreInfoDialog = ({
  isOpen,
  onClose,
  selectedInstalment,
}: MoreInfoDialogProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (backdropRef.current && event.target === backdropRef.current) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-full bg-white rounded-lg shadow-xl transform transition-all overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 shrink-0">
          <div className="flex flex-col items-center text-center w-full">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-gray-900 mb-2"
            >
              seQura
            </h2>
            <h2 className="text-3xl font-semibold text-gray-900">
              Fracciona tu pago
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Big screens (>768px) */}
          <ul className="hidden md:block list-disc pl-5 space-y-3 mb-8">
            <li>
              <div className="flex items-center w-full gap-6">
                <span className="flex-1">
                  Fracciona tu pago con solo un coste fijo por cuota
                </span>
                <span className="shrink-0 flex items-center justify-center">
                  <div
                    style={{
                      width: "100px",
                      height: "50px",
                      border: "1px solid black",
                    }}
                  />
                </span>
              </div>
            </li>
            <li>
              <div className="flex items-center w-full gap-6">
                <span className="flex-1">
                  Ahora solo pagas la primera cuota
                </span>
                <span className="shrink-0 flex items-center justify-center">
                  <div
                    style={{
                      width: "100px",
                      height: "50px",
                      border: "1px solid black",
                    }}
                  />
                </span>
              </div>
            </li>
            <li>
              <div className="flex items-center w-full gap-6">
                <span className="flex-1">
                  El resto de pagos se cargarán automáticamente en tu tarjeta
                </span>
                <span className="shrink-0 flex items-center justify-center">
                  <div
                    style={{
                      width: "100px",
                      height: "50px",
                      border: "1px solid black",
                    }}
                  />
                </span>
              </div>
            </li>
          </ul>

          {/* Medium screens (480px-767px) */}
          <div className="hidden sm:block md:hidden space-y-6 mb-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex justify-center">
                <div
                  style={{
                    width: "200px",
                    height: "50px",
                    border: "1px solid black",
                  }}
                />
              </div>
              <span>Fracciona tu pago con solo un coste fijo por cuota</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex justify-center">
                <div
                  style={{
                    width: "200px",
                    height: "50px",
                    border: "1px solid black",
                  }}
                />
              </div>
              <span>Ahora solo pagas la primera cuota</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex justify-center">
                <div
                  style={{
                    width: "200px",
                    height: "50px",
                    border: "1px solid black",
                  }}
                />
              </div>
              <span>
                El resto de pagos se cargarán automáticamente en tu tarjeta
              </span>
            </div>
          </div>

          {/* Small screens (<480px) */}
          <ul className="block sm:hidden list-disc pl-5 space-y-3 mb-8">
            <li>Fracciona tu pago con solo un coste fijo por cuota</li>
            <li>Ahora solo pagas la primera cuota</li>
            <li>El resto de pagos se cargarán automáticamente en tu tarjeta</li>
          </ul>
          <div className="text-center">
            Además en el importe mostrado ya se incluye la cuota única mensual
            de {selectedInstalment.instalment_fee.string}/mes, por lo que no
            tendrás ninguna sorpresa.
          </div>
        </div>

        <div className="px-6 py-4 rounded-b-lg block md:hidden shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoreInfoDialog;
