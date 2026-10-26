"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import { RotateCw, Volume2, ShieldCheck, AlertCircle } from "lucide-react";

export interface CaptchaRef {
  refresh: () => void;
  isValid: () => boolean;
  getCode: () => string;
  clear: () => void;
}

interface CaptchaProps {
  value: string;
  onChange: (val: string) => void;
  onRefresh?: (newCode: string) => void;
  error?: string;
  className?: string;
}

// Characters that are easy to distinguish (avoid 0/O, 1/l/I)
const CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";

export const Captcha = forwardRef<CaptchaRef, CaptchaProps>(function Captcha(
  { value, onChange, onRefresh, error, className = "" },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [captchaCode, setCaptchaCode] = useState("");
  const [isRotating, setIsRotating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Generate 5 random characters
  const generateCode = useCallback(() => {
    let result = "";
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * CAPTCHA_CHARS.length);
      result += CAPTCHA_CHARS[randomIndex];
    }
    return result;
  }, []);

  // Draw realistic textured government-style CAPTCHA
  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Light textured canvas background (pale sage green / linen texture)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#e8efe9");
    gradient.addColorStop(0.5, "#dce7dd");
    gradient.addColorStop(1, "#edf4ee");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle security background grid
    ctx.strokeStyle = "rgba(100, 140, 110, 0.25)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Random noise speckles/dots
    for (let i = 0; i < 150; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 80 + 40)}, ${Math.floor(
        Math.random() * 90 + 50
      )}, ${Math.floor(Math.random() * 80 + 40)}, ${Math.random() * 0.35 + 0.15})`;
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2 + 0.8,
        Math.random() * 2 + 0.8
      );
    }

    // 4. Distorted noise curved lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 80 + 30)}, ${Math.floor(
        Math.random() * 90 + 60
      )}, ${Math.floor(Math.random() * 90 + 50)}, 0.45)`;
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 20, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width * 0.4,
        Math.random() * height,
        Math.random() * width * 0.7,
        Math.random() * height,
        width - Math.random() * 10,
        Math.random() * height
      );
      ctx.stroke();
    }

    // 5. Draw distorted characters
    const charSpacing = (width - 30) / code.length;
    const fonts = ["bold 26px monospace", "bold 28px sans-serif", "bold 27px 'Courier New', monospace"];
    const colors = ["#1a4031", "#214e34", "#1b3842", "#274735", "#163c2c"];

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();

      const x = 20 + i * charSpacing + (Math.random() * 6 - 3);
      const y = height / 2 + (Math.random() * 8 - 4) + 8;
      const angle = (Math.random() * 26 - 13) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font = fonts[Math.floor(Math.random() * fonts.length)];
      ctx.fillStyle = colors[i % colors.length];

      // Draw character with subtle shadow/emboss
      ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(char, 0, 0);

      // Re-stroke with darker edge
      ctx.strokeStyle = "rgba(20, 50, 30, 0.4)";
      ctx.lineWidth = 0.8;
      ctx.strokeText(char, 0, 0);

      ctx.restore();
    }

    // 6. Security outer border
    ctx.strokeStyle = "#9bb09f";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRotating(true);
    const newCode = generateCode();
    setCaptchaCode(newCode);
    drawCaptcha(newCode);
    if (onRefresh) onRefresh(newCode);
    setTimeout(() => setIsRotating(false), 500);
  }, [drawCaptcha, generateCode, onRefresh]);

  useEffect(() => {
    const code = generateCode();
    setCaptchaCode(code);
    drawCaptcha(code);
    if (onRefresh) onRefresh(code);
  }, [drawCaptcha, generateCode, onRefresh]);

  // Accessibility: Speak captcha letters
  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const phoneticText = captchaCode
      .split("")
      .map((c) => {
        if (/[A-Z]/.test(c)) return `Capital ${c}`;
        if (/[a-z]/.test(c)) return `Small ${c}`;
        return c;
      })
      .join(", ");

    const utterance = new SpeechSynthesisUtterance(`Captcha characters are: ${phoneticText}`);
    utterance.rate = 0.8;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useImperativeHandle(ref, () => ({
    refresh: handleRefresh,
    isValid: () => value.trim().toLowerCase() === captchaCode.toLowerCase(),
    getCode: () => captchaCode,
    clear: () => onChange(""),
  }));

  const isMatched = value.trim() && value.trim().toLowerCase() === captchaCode.toLowerCase();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* CAPTCHA Image & Controls */}
      <div className="flex items-center gap-3">
        <div className="relative rounded-md overflow-hidden border border-slate-300 shadow-2xs bg-[#e8efe9]">
          <canvas
            ref={canvasRef}
            width={200}
            height={60}
            className="block select-none"
            aria-label="Security CAPTCHA Image Challenge"
          />
        </div>

        {/* Action Buttons: Refresh & Audio */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh CAPTCHA challenge"
            aria-label="Refresh CAPTCHA image"
            className="p-2 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition shadow-2xs hover:text-blue-900 group"
          >
            <RotateCw
              className={`w-4 h-4 transition-transform duration-500 ${
                isRotating ? "rotate-180 text-blue-700" : "group-hover:rotate-45"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={handleSpeak}
            title="Listen to CAPTCHA characters"
            aria-label="Audio CAPTCHA readout"
            className={`p-2 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition shadow-2xs hover:text-blue-900 ${
              isSpeaking ? "bg-blue-50 text-blue-700 border-blue-400" : ""
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input Label & Field */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Enter the characters shown in the image <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter captcha text"
            autoComplete="off"
            spellCheck={false}
            required
            className={`w-full px-3 py-2 border rounded-lg text-xs font-mono tracking-wider text-slate-900 bg-white uppercase focus:outline-none focus:ring-2 transition ${
              error
                ? "border-red-400 focus:ring-red-300 bg-red-50/30"
                : isMatched
                ? "border-emerald-500 focus:ring-emerald-300 bg-emerald-50/20"
                : "border-slate-300 focus:ring-blue-900 focus:border-blue-900"
            }`}
          />
          {isMatched && (
            <div className="absolute right-2.5 top-2.5 text-emerald-600 flex items-center gap-1 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
});
