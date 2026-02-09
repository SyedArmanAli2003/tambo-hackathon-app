import { useState, useRef, useEffect, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileImage, FileText, Share2, Check, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface ExportButtonProps {
  /** Ref to the DOM element to capture */
  targetRef: RefObject<HTMLElement | null>;
  /** File name prefix for exports */
  fileName?: string;
}

/**
 * ExportButton — provides PDF and JPG export for dashboard content.
 * Uses html2canvas to capture the rendered DOM and jsPDF for PDF generation.
 */
export default function ExportButton({
  targetRef,
  fileName = "dashboard",
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "jpg" | "png" | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const captureCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!targetRef.current) return null;

    // Temporarily expand scrollable area so everything is captured
    const el = targetRef.current;

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#f8fafc",
      logging: false,
      // Capture full scrollable content
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });

    return canvas;
  };

  const showDone = (type: string) => {
    setDone(type);
    setTimeout(() => setDone(null), 2000);
  };

  const exportAsJPG = async () => {
    setExporting("jpg");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `${fileName}-${Date.now()}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
      showDone("JPG");
    } catch (err) {
      console.error("JPG export failed:", err);
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const exportAsPNG = async () => {
    setExporting("png");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `${fileName}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showDone("PNG");
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const exportAsPDF = async () => {
    setExporting("pdf");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;

      const contentWidth = pdfWidth - margin * 2;
      const scaledHeight = (imgHeight * contentWidth) / imgWidth;

      const pdf = new jsPDF({
        orientation: scaledHeight > pdfHeight ? "portrait" : "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add title
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59); // slate-800
      pdf.text("Dashboard Report", margin, margin + 6);
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, margin + 12);

      const imageTop = margin + 18;
      const availableHeight = pdfHeight - imageTop - margin;

      if (scaledHeight <= availableHeight) {
        // Fits on one page
        pdf.addImage(imgData, "PNG", margin, imageTop, contentWidth, scaledHeight);
      } else {
        // Multi-page: slice the canvas into page-sized chunks
        const pageCanvasHeight = (availableHeight / contentWidth) * imgWidth;
        let yOffset = 0;
        let page = 0;

        while (yOffset < imgHeight) {
          if (page > 0) {
            pdf.addPage();
          }

          const sliceHeight = Math.min(pageCanvasHeight, imgHeight - yOffset);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = imgWidth;
          sliceCanvas.height = sliceHeight;
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(canvas, 0, yOffset, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);
            const sliceData = sliceCanvas.toDataURL("image/png");
            const sliceScaledH = (sliceHeight * contentWidth) / imgWidth;
            pdf.addImage(sliceData, "PNG", margin, page === 0 ? imageTop : margin, contentWidth, sliceScaledH);
          }

          yOffset += sliceHeight;
          page++;
        }
      }

      pdf.save(`${fileName}-${Date.now()}.pdf`);
      showDone("PDF");
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const isExporting = exporting !== null;

  return (
    <div className="relative" ref={menuRef}>
      {done && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap z-50 shadow-sm">
          <Check className="w-3 h-3" />
          {done} exported!
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Exporting…</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>Export</span>
          </>
        )}
      </Button>

      {isOpen && !isExporting && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 min-w-[160px]">
          <button
            onClick={exportAsPDF}
            className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
          >
            <FileText className="w-4 h-4 text-red-500" />
            Export as PDF
          </button>
          <button
            onClick={exportAsJPG}
            className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
          >
            <FileImage className="w-4 h-4 text-blue-500" />
            Export as JPG
          </button>
          <button
            onClick={exportAsPNG}
            className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
          >
            <Download className="w-4 h-4 text-green-500" />
            Export as PNG
          </button>
        </div>
      )}
    </div>
  );
}
