import { useState, useEffect, useRef } from "react";
import { Download, Edit3, RefreshCw } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import TemplateSelector from "../resume/TemplateSelector";
import GradientButton from "../common/GradientButton";
import { addToast } from "../../redux/slices/uiSlice";
import apiClient from "../../utils/api";
import { ROUTES } from "../../utils/constants";

const ResumeComparison = ({ enhancedResume, originalPdfUrl, downloadActionRef }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  
  const [themeId, setThemeId] = useState("professional-blue");
  const [htmlContent, setHtmlContent] = useState("");
  const [isRendering, setIsRendering] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch rendered HTML when theme changes
  // NOTE: No user avatar is fetched — ATS checker analyzes external resumes,
  //       so the logged-in user's profile photo should NOT appear.
  useEffect(() => {
    let active = true;
    const fetchRender = async () => {
      if (!enhancedResume) return;
      setIsRendering(true);
      try {
        const response = await apiClient.post("/resume/render", {
          resumeData: { ...enhancedResume, includePhoto: false },
          themeId: themeId,
          formatting: { spacing: "medium", fontSize: "14px" }
        });
        if (active) setHtmlContent(response.data.html);
      } catch (error) {
        if (active) {
          dispatch(addToast({ type: "error", message: "Failed to render template preview." }));
        }
      } finally {
        if (active) setIsRendering(false);
      }
    };

    fetchRender();
    return () => { active = false; };
  }, [themeId, enhancedResume, dispatch]);

  /**
   * Export the Enhanced Resume as PDF.
   * Uses the server-rendered HTML (which matches the live preview exactly)
   * and triggers the browser's print-to-PDF to generate a real PDF file.
   * This ensures the downloaded PDF always matches the selected template.
   */
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      if (!htmlContent) {
        dispatch(addToast({ type: "error", message: "Please wait for the template to finish rendering." }));
        return;
      }

      // Build a complete print-ready HTML document from the rendered content
      const safeName = (enhancedResume?.fullName || "Enhanced").replace(/[^a-zA-Z0-9\s]/g, "").trim();
      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${safeName} - Resume</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: A4; margin: 10mm; }
            }
          </style>
        </head>
        <body>${htmlContent}</body>
        </html>
      `;

      // Open a print window with the rendered resume
      const printWindow = window.open("", "_blank", "width=900,height=1100");
      if (!printWindow) {
        dispatch(addToast({ type: "error", message: "Please allow pop-ups to download the PDF." }));
        return;
      }

      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();

      // Wait for content to load, then trigger print
      const triggerPrint = () => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch {
          // Fallback: just let the user manually Ctrl+P
        }
      };

      // Use onload for reliable timing
      if (printWindow.document.readyState === "complete") {
        setTimeout(triggerPrint, 300);
      } else {
        printWindow.onload = () => setTimeout(triggerPrint, 300);
      }

      dispatch(addToast({ type: "success", message: "Print dialog opened — select \"Save as PDF\" to download your resume." }));
    } catch (error) {
      dispatch(addToast({ type: "error", message: "Failed to generate PDF." }));
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Edit in Builder
  const handleEditInBuilder = () => {
    navigate(ROUTES.STUDENT_RESUME_BUILDER, { 
      state: { enhancedResume, themeId } 
    });
  };

  if (downloadActionRef) {
    downloadActionRef.current = handleExportPdf;
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Top Row: Action Buttons ── */}
      <div className="flex flex-wrap items-center gap-3">
        <GradientButton 
          onClick={handleExportPdf} 
          disabled={isExporting || isRendering} 
          className="flex items-center justify-center gap-2"
        >
          {isExporting ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
          Download Enhanced PDF
        </GradientButton>
        
        <button
          onClick={handleEditInBuilder}
          className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-brand-indigo hover:text-brand-indigo dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
        >
          <Edit3 size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          Edit in Resume Builder
        </button>
      </div>

      {/* ── Main Layout: Template Selection + Live Preview ── */}
      <div className="grid gap-5 lg:grid-cols-[420px_1fr] lg:items-start">

        {/* LEFT: Template Selector (scrollable, ~2 rows visible) */}
        <div className="glass-card flex flex-col overflow-hidden" style={{ maxHeight: "560px" }}>
          <div className="shrink-0 border-b border-slate-200/70 px-4 py-3 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins text-sm font-semibold text-slate-800 dark:text-slate-100">
                Select Template
              </h3>
              <span className="rounded-full bg-brand-indigo/10 px-2 py-0.5 text-[10px] font-semibold text-brand-indigo dark:bg-cyan-500/10 dark:text-cyan-400">
                Live Preview
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <TemplateSelector selected={themeId} onSelect={setThemeId} excludeBuiltIn={true} />
          </div>
        </div>

        {/* RIGHT: Live Resume Preview */}
        <div className="relative flex w-full flex-col">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-brand-indigo/20 to-brand-cyan/20 opacity-50 blur dark:from-brand-indigo/30 dark:to-cyan-400/30" />
          <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-xl dark:border-slate-700/50" style={{ height: "500px" }}>
            
            {/* Browser chrome header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-medium text-slate-500">Enhanced_Resume.pdf</span>
            </div>

            {/* Iframe */}
            <div className="relative h-[calc(100%-36px)] w-full bg-slate-100/50 dark:bg-slate-950/50">
              {isRendering && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                  <RefreshCw size={32} className="animate-spin text-brand-indigo dark:text-cyan-400" />
                  <p className="mt-4 font-medium text-slate-600 dark:text-slate-300">Applying Template...</p>
                </div>
              )}
              
              {htmlContent ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={htmlContent}
                  title="Resume Preview"
                  className="h-full w-full border-none bg-white"
                  sandbox="allow-same-origin allow-scripts"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeComparison;

