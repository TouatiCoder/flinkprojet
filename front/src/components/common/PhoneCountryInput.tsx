import {AlertCircle } from "lucide-react";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

export const SUPPORTED_COUNTRIES: { code: CountryCode; label: string; dial: string }[] = [
  { code: "MA", label: "Maroc", dial: "+212" },
//   { code: "FR", label: "France", dial: "+33" },
//   { code: "ES", label: "Espagne", dial: "+34" },
//   { code: "BE", label: "Belgique", dial: "+32" },
//   { code: "CA", label: "Canada", dial: "+1" },
//   { code: "US", label: "États-Unis", dial: "+1" },
//   { code: "AE", label: "Émirats Arabes Unis", dial: "+971" },
//   { code: "DZ", label: "Algérie", dial: "+213" },
];

interface PhoneCountryInputProps {
  value: string;
  selectedCountry: CountryCode;
  error?: string | null;
  required?: boolean;
  onChange: (phone: string) => void;
  onCountryChange: (country: CountryCode) => void;
  onErrorChange?: (error: string | null) => void;
}

export default function PhoneCountryInput({
  value,
  selectedCountry,
  error,
  required = true,
  onChange,
  onCountryChange,
  onErrorChange,
}: PhoneCountryInputProps) {
  const handleValidate = (phoneVal: string, country: CountryCode) => {
    if (!phoneVal.trim()) {
      if (required) onErrorChange?.("Le numéro de téléphone est obligatoire.");
      return;
    }

    try {
      const parsed = parsePhoneNumberFromString(phoneVal, country);
      if (!parsed || !parsed.isValid()) {
        const cObj = SUPPORTED_COUNTRIES.find((c) => c.code === country);
        onErrorChange?.(
          `Numéro invalide pour ${cObj?.label || country}. ${
            country === "MA" ? "Ex: 06 12 34 56 78" : ""
          }`
        );
      } else {
        onErrorChange?.(null);
      }
    } catch {
      onErrorChange?.("Format de numéro invalide.");
    }
  };

  return (
    <div>
      <label className="block text-[12.5px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        Téléphone {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <select
          value={selectedCountry}
          onChange={(e) => {
            const newC = e.target.value as CountryCode;
            onCountryChange(newC);
            if (value) handleValidate(value, newC);
          }}
          className="w-28 px-2 py-2 text-[12px] font-semibold rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all cursor-pointer"
        >
          {SUPPORTED_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.dial})
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          {/* <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /> */}
          <input
            type="tel"
            required={required}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (error) onErrorChange?.(null);
            }}
            onBlur={() => handleValidate(value, selectedCountry)}
            placeholder={selectedCountry === "MA" ? "06 12 34 56 78" : "Numéro de téléphone"}
            className={`w-full pl-9 pr-3 py-2 text-[13px] rounded-xl border ${
              error
                ? "border-red-500 focus:border-red-500 bg-red-50/30 dark:bg-red-950/20"
                : "border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 focus:border-indigo-500"
            } text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all`}
          />
        </div>
      </div>

      {error && (
        <span className="inline-flex items-center gap-1 text-[11.5px] text-red-500 font-medium mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}