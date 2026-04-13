import { useState, useEffect } from "react";
import { Link as LinkIcon, FileText, CheckCircle2 } from "lucide-react";
import { useDispatch } from "react-redux";
import Modal from "./Modal";
import CustomSelect from "./CustomSelect";
import GradientButton from "./GradientButton";
import { addToast } from "../../redux/slices/uiSlice";
import getErrorMessage from "../../utils/errorMessage";
import apiClient from "../../utils/api";

const InterviewScheduleModal = ({ isOpen, onClose, candidate, onSuccess }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: "",
        time: "10:00",
        ampm: "AM",
        mode: "Online",
        meetingLink: "",
        notes: "",
        sendEmail: true
    });

    useEffect(() => {
        if (isOpen && candidate) {
            const existing = candidate.interview || {};
            let datePart = "";
            let timePart = "10:00";
            let ampmPart = "AM";

            if (existing.date) {
                const d = new Date(existing.date);
                datePart = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
                let hours = d.getHours();
                const mins = d.getMinutes().toString().padStart(2, '0');
                ampmPart = hours >= 12 ? "PM" : "AM";
                hours = hours % 12 || 12;
                timePart = `${hours.toString().padStart(2, '0')}:${mins}`;
            }

            setFormData({
                date: datePart,
                time: timePart,
                ampm: ampmPart,
                mode: existing.mode || "Online",
                meetingLink: existing.meetingLink || "",
                notes: existing.notes || "",
                sendEmail: true
            });
        }
    }, [isOpen, candidate]);

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.date || !formData.time) {
            dispatch(addToast({ type: "error", message: "Please select an interview date and time." }));
            return;
        }

        let [hourStr, minStr] = formData.time.split(":");
        let hour = parseInt(hourStr, 10);
        if (formData.ampm === "PM" && hour !== 12) hour += 12;
        if (formData.ampm === "AM" && hour === 12) hour = 0;

        const hourFormatted = hour.toString().padStart(2, '0');
        const localDate = new Date(`${formData.date}T${hourFormatted}:${minStr || '00'}:00`);
        const payloadDate = localDate.toISOString();

        setLoading(true);
        try {
            const payload = { ...formData, date: payloadDate };
            const res = await apiClient.put(`/jobs/applications/${candidate.id}/interview`, payload);
            dispatch(addToast({ type: "success", message: "Interview scheduled successfully." }));
            if (onSuccess) {
                onSuccess(res.data.status, res.data.interview);
            }
            onClose();
        } catch (error) {
            dispatch(addToast({ type: "error", message: getErrorMessage(error, "Failed to schedule interview.") }));
        } finally {
            setLoading(false);
        }
    };

    if (!candidate) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Schedule Interview: ${candidate.name}`} 
            maxWidthClass="max-w-2xl"
        >
            <form onSubmit={handleScheduleSubmit} className="mt-2 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Date & Time (12-hour format)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="field-input text-sm flex-1"
                            />
                            <input
                                type="text"
                                required
                                placeholder="10:30"
                                pattern="^(0?[1-9]|1[0-2]):[0-5][0-9]$"
                                title="Format HH:MM (1-12)"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="field-input text-sm w-24 text-center"
                            />
                            <CustomSelect
                                value={formData.ampm}
                                onChange={(val) => setFormData({ ...formData, ampm: val })}
                                className="w-20"
                                options={[
                                    { value: "AM", label: "AM" },
                                    { value: "PM", label: "PM" }
                                ]}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Mode
                        </label>
                        <CustomSelect
                            value={formData.mode}
                            onChange={(val) => setFormData({ ...formData, mode: val })}
                            options={[
                                { value: "Online", label: "Online Video Call" },
                                { value: "Offline", label: "In-Person" },
                                { value: "Phone", label: "Phone Call" }
                            ]}
                        />
                    </div>
                    {(formData.mode === "Online" || formData.mode === "Phone") && (
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <LinkIcon size={12} /> Meeting Link / Phone Number
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Zoom link or Phone number"
                                value={formData.meetingLink}
                                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                className="field-input text-sm"
                            />
                        </div>
                    )}
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <FileText size={12} /> Notes & Instructions
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Any special instructions for the candidate..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="field-input text-sm"
                        />
                    </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-200/70 pt-4 dark:border-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={formData.sendEmail}
                            onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                            className="rounded border-slate-300 h-4 w-4 text-brand-indigo focus:ring-brand-indigo dark:border-slate-600 dark:bg-slate-800"
                        />
                        Send email notification to candidate
                    </label>
                    <GradientButton
                        type="submit"
                        size="sm"
                        isLoading={loading}
                    >
                        <CheckCircle2 size={16} className="mr-1.5" />
                        Save Interview
                    </GradientButton>
                </div>
            </form>
        </Modal>
    );
};

export default InterviewScheduleModal;
