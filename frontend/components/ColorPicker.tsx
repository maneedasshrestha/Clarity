import React from "react";

const COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#22C55E", // Green
  "#8B5CF6", // Purple
  "#F59E42", // Orange
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-3 mt-2">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={`w-7 h-7 rounded-full border-2 transition-all ${value === color ? "border-black dark:border-white scale-110" : "border-transparent"}`}
          style={{ background: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
};

export default ColorPicker;
