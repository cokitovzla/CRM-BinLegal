import React, { useState } from 'react';
import { Check, Plus, AlertCircle } from 'lucide-react';

export interface SectorOption {
  id: string;
  name: string;
  description: string;
}

export const COMMON_BUSINESS_SECTORS: SectorOption[] = [
  { id: 'tech_software', name: 'Tecnología & Software', description: 'SaaS, Apps, IA, Plataformas' },
  { id: 'comercio_retail', name: 'Comercio & E-commerce', description: 'Tiendas físicas, Venta online, Retail' },
  { id: 'alimentos_gastronomia', name: 'Alimentos & Gastronomía', description: 'Restaurantes, Franquicias, Empacados' },
  { id: 'servicios_b2b', name: 'Servicios Profesionales & B2B', description: 'Agencias, Consultoría, Finanzas' },
  { id: 'salud_bienestar', name: 'Salud, Farma & Bienestar', description: 'Clínicas, Estética, Farmacias' },
  { id: 'logistica_transporte', name: 'Logística & Envíos', description: 'Última milla, Almacenaje, Courier' },
  { id: 'manufactura_industria', name: 'Manufactura & Producción', description: 'Confección, Fábricas, Empaques' },
  { id: 'fintech_finanzas', name: 'FinTech & Pagos', description: 'Pasarelas, Cobranzas B2B' },
  { id: 'agro_produccion', name: 'Agroindustria & Campo', description: 'Agricultura, Ganadería, Insumos' },
  { id: 'educacion_edtech', name: 'Educación & Formación', description: 'Academias, Cursos online' },
  { id: 'inmobiliario_construccion', name: 'Inmobiliario & Construcción', description: 'Bienes raíces, Obras, Reformas' },
  { id: 'otro', name: 'Otro sector...', description: 'Especifica tu actividad' }
];

interface SectorSelectorProps {
  selectedSectors: string[];
  otherText: string;
  onSelectionChange: (sectors: string[], otherText: string) => void;
  error?: string;
  compact?: boolean;
}

export const SectorSelector: React.FC<SectorSelectorProps> = ({
  selectedSectors,
  otherText,
  onSelectionChange,
  error,
  compact = false
}) => {
  const [maxWarning, setMaxWarning] = useState(false);

  const isSelected = (sectorName: string) => selectedSectors.includes(sectorName);
  const isOtherSelected = isSelected('Otro');

  const toggleSector = (sectorName: string) => {
    setMaxWarning(false);
    if (isSelected(sectorName)) {
      const next = selectedSectors.filter(s => s !== sectorName);
      onSelectionChange(next, otherText);
    } else {
      if (selectedSectors.length >= 3) {
        setMaxWarning(true);
        setTimeout(() => setMaxWarning(false), 3000);
        return;
      }
      const next = [...selectedSectors, sectorName];
      onSelectionChange(next, otherText);
    }
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSelectionChange(selectedSectors, val);
  };

  return (
    <div className="space-y-2">
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-neutral-800">
          Sector / Industria de tu empresa *
        </label>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
          <span className={`px-2 py-0.5 rounded-full font-bold transition-colors ${
            selectedSectors.length > 0 
              ? 'bg-[#0071ce] text-white' 
              : 'bg-neutral-100 text-neutral-500'
          }`}>
            {selectedSectors.length}/3 seleccionados
          </span>
        </div>
      </div>

      <p className="text-[11px] text-neutral-500 leading-tight">
        Selecciona hasta <strong>3 sectores</strong> para personalizar tu diagnóstico legal:
      </p>

      {/* Warning message if user tries to select a 4th */}
      {maxWarning && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Máximo 3 sectores por empresa. Desmarca uno para cambiarlo.</span>
        </div>
      )}

      {/* Grid of Sector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 pt-0.5">
        {COMMON_BUSINESS_SECTORS.map((sector) => {
          const sectorKey = sector.id === 'otro' ? 'Otro' : sector.name;
          const active = isSelected(sectorKey);

          return (
            <button
              type="button"
              key={sector.id}
              onClick={() => toggleSector(sectorKey)}
              className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all flex items-start justify-between gap-2 group cursor-pointer active:scale-95 ${
                active
                  ? 'bg-[#0071ce] text-white border-[#0071ce] shadow-2xs'
                  : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold leading-tight flex items-center gap-1">
                  <span className="truncate">{sector.name}</span>
                </div>
                <div className={`text-[10px] mt-0.5 leading-snug truncate ${
                  active ? 'text-blue-100' : 'text-neutral-400'
                }`}>
                  {sector.description}
                </div>
              </div>

              {/* Checkbox indicator */}
              <div className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                active
                  ? 'bg-white text-[#0071ce] font-bold'
                  : 'border border-neutral-300 group-hover:border-neutral-500'
              }`}>
                {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* "Otro" write-in field if active */}
      {isOtherSelected && (
        <div className="pt-1.5 animate-in fade-in slide-in-from-top-1">
          <label className="block text-xs font-semibold text-neutral-800 mb-1">
            Especifica tu sector o actividad económica: *
          </label>
          <input
            type="text"
            required
            value={otherText}
            onChange={handleOtherTextChange}
            placeholder="Ej. Energías renovables, Minería de datos, Turismo..."
            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0071ce] shadow-2xs"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
    </div>
  );
};
