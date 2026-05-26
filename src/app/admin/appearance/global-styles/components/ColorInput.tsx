import CustomColorPicker from "../../../homepage/components/ColorPicker";

interface ColorInputProps { 
    label: string; 
    desc: string; 
    value?: string; 
    globalDefault?: string;
    onChange: (val: string) => void 
}

export function ColorInput({ label, desc, value, globalDefault, onChange }: ColorInputProps) {
    return (
        <div className="mb-2">
            <CustomColorPicker 
                label={label}
                value={value}
                globalDefault={globalDefault}
                onChange={(val) => onChange(val || "")}
            />
            <p className="text-[10px] text-gray-500 mt-1">{desc}</p>
        </div>
    );
}
