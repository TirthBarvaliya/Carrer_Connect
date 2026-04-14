/**
 * Resume theme API controller.
 * Provides theme listing, HTML rendering, and PDF export.
 */
import { getAvailableThemes } from "../utils/themeRegistry.js";
import { renderResume } from "../utils/renderResumeTheme.js";

/**
 * GET /api/resume/themes
 * Returns the list of all available resume themes.
 */
export const listThemes = (req, res) => {
  const themes = getAvailableThemes();
  res.json({ themes });
};

/**
 * POST /api/resume/render
 * Renders a resume with the specified theme and returns HTML.
 * Body: { resumeData, themeId, formatting }
 */
export const renderThemePreview = async (req, res) => {
  try {
    const { resumeData, themeId, formatting } = req.body;

    if (!resumeData || !themeId) {
      return res.status(400).json({ message: "resumeData and themeId are required." });
    }

    const html = await renderResume(resumeData, themeId, formatting || {});
    res.json({ html });
  } catch (error) {
    console.error("Resume render error:", error.message);
    res.status(500).json({ message: error.message || "Failed to render resume." });
  }
};

/**
 * POST /api/resume/export-pdf
 * Server-side PDF export is disabled on Azure (no Chrome available).
 * Returns 501 so the frontend falls back to client-side jsPDF generation.
 *
 * Body: { resumeData, themeId, formatting }
 */
export const exportPdf = (req, res) => {
  res.status(501).json({
    code: "PUPPETEER_UNAVAILABLE",
    message: "Server-side PDF export is not available. Please use client-side PDF generation."
  });
};

