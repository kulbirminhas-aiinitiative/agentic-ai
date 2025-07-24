
"use client";
import React, { useState } from "react";

interface GeneralSettingsProps {
  onConfigChange?: (config: Record<string, any>) => void;
  initialConfig?: Record<string, any>;
}

const defaultConfig = {
  temperature: 0.7,
  model: "gpt-4",
  top_p: 1,
  top_k: 40,
  max_tokens: 2048,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop_sequences: "",
};

const modelOptions = [
  { label: "GPT-4", value: "gpt-4" },
  { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
  { label: "Llama-2 70B", value: "llama-2-70b" },
  { label: "Custom", value: "custom" },
];

type ConfigKey = keyof typeof defaultConfig;
type FieldDef = {
  label: string;
  name: ConfigKey;
  type: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
};

const fields: FieldDef[] = [
  { label: 'Model', name: 'model', type: 'select', options: modelOptions },
  { label: 'Temperature', name: 'temperature', type: 'number', min: 0, max: 1, step: 0.01 },
  { label: 'Top-p', name: 'top_p', type: 'number', min: 0, max: 1, step: 0.01 },
  { label: 'Top-k', name: 'top_k', type: 'number', min: 1, max: 100, step: 1 },
  { label: 'Max Tokens', name: 'max_tokens', type: 'number', min: 1, max: 8192, step: 1 },
  { label: 'Frequency Penalty', name: 'frequency_penalty', type: 'number', min: -2, max: 2, step: 0.01 },
  { label: 'Presence Penalty', name: 'presence_penalty', type: 'number', min: -2, max: 2, step: 0.01 },
  { label: 'Stop Sequences (comma separated)', name: 'stop_sequences', type: 'text' },
];

const GeneralSettingsSection: React.FC<GeneralSettingsProps> = ({ onConfigChange, initialConfig }) => {
  const [config, setConfig] = useState({ ...defaultConfig, ...initialConfig });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? Number(value) : value;
    setConfig(prev => {
      const newConfig = { ...prev, [name]: val };
      onConfigChange?.(newConfig);
      return newConfig;
    });
  };

  return (
    <section style={{ padding: 0 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>General Settings</h2>
      <form style={{ maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {fields.map((field) => (
          <div key={field.name} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <label htmlFor={field.name} style={{ flex: '0 0 180px', fontWeight: 600, fontSize: 16 }}>{field.label}</label>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={config[field.name]}
                onChange={handleChange}
                style={{ flex: 1, border: '1px solid #ccc', borderRadius: 6, padding: '8px 12px', fontSize: 16 }}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                min={field.min}
                max={field.max}
                step={field.step}
                value={config[field.name]}
                onChange={handleChange}
                style={{ flex: 1, border: '1px solid #ccc', borderRadius: 6, padding: '8px 12px', fontSize: 16 }}
              />
            )}
          </div>
        ))}
      </form>
      <div style={{ marginTop: 24, fontSize: 14, color: '#64748b', textAlign: 'center' }}>
        <p>All configuration changes are saved automatically and will be used for future chat requests.</p>
      </div>
    </section>
  );
};

export default GeneralSettingsSection;
