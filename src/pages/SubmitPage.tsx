import React, { useState } from 'react';
import { CATEGORIES, Complaint } from '../types';
import { submitComplaint } from '../api';
import { IssueIdPill } from '../components/IssueIdPill';
import { toast } from 'sonner';
import {
  Send,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  MapPin,
  FileText,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react';

interface SubmitPageProps {
  onNavigate: (page: 'home' | 'submit' | 'track' | 'admin', issueId?: string) => void;
  onComplaintCreated: (complaint: Complaint) => void;
}

export const SubmitPage: React.FC<SubmitPageProps> = ({
  onNavigate,
  onComplaintCreated,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!category.trim()) errs.category = 'Category is required';
    if (!location.trim()) errs.location = 'Specific address or cross-streets are required';
    if (!description.trim()) {
      errs.description = 'Please provide details explaining the municipal issue';
    } else if (description.trim().length < 10) {
      errs.description = 'Description should be at least 10 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please resolve the highlighted form errors.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitComplaint({
        title: title.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
        citizen_name: citizenName.trim() || undefined,
        citizen_phone: citizenPhone.trim() || undefined,
      });

      setSubmittedComplaint(result);
      onComplaintCreated(result);
      toast.success(`Complaint registered! Your Issue ID is ${result.issue_id}`);
    } catch (err: any) {
      toast.error(err?.detail || err?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory(CATEGORIES[0]);
    setLocation('');
    setDescription('');
    setCitizenName('');
    setCitizenPhone('');
    setErrors({});
    setSubmittedComplaint(null);
  };

  if (submittedComplaint) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Complaint Registered Successfully
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your report has been logged into the municipal queue and assigned to departmental triage.
            </p>
          </div>

          {/* Issue ID callout box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 max-w-md mx-auto space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Your Unique Tracking Identifier
            </span>
            <div className="flex justify-center">
              <IssueIdPill issueId={submittedComplaint.issue_id} withCopy size="lg" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Save or copy this ID. You can track municipal status, department triage, and work crew progress at any time without needing an account.
            </p>
          </div>

          <div className="text-left bg-slate-50/70 border border-slate-200/50 rounded-xl p-5 space-y-2 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 text-sm">{submittedComplaint.title}</div>
            <div>
              <span className="text-slate-400">Category:</span> {submittedComplaint.category}
            </div>
            <div>
              <span className="text-slate-400">Location:</span> {submittedComplaint.location}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('track', submittedComplaint.issue_id)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <span>Track This Complaint Now</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Submit Another Complaint</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Register a Municipal Complaint
        </h1>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          Submit details regarding road hazards, sanitation failures, broken lighting, or other public infrastructure issues.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800">
            Complaint Summary / Title <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g. Hazardous deep pothole on South Main & 4th Street"
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.title
                ? 'border-rose-400 focus:ring-rose-400'
                : 'border-slate-300 focus:ring-slate-900'
            }`}
          />
          {errors.title && (
            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
              <AlertCircle size={13} />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* Category & Location grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Department Category <span className="text-rose-600">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1">
              <MapPin size={13} className="text-slate-500" />
              <span>Incident Location <span className="text-rose-600">*</span></span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
              }}
              placeholder="e.g. 742 Evergreen Terrace or Corner of 5th & Elm"
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.location
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
            />
            {errors.location && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                <span>{errors.location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1">
            <FileText size={13} className="text-slate-500" />
            <span>Detailed Description <span className="text-rose-600">*</span></span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="Describe the severity, duration, and exact circumstances of the issue so crews can prepare proper equipment..."
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.description
                ? 'border-rose-400 focus:ring-rose-400'
                : 'border-slate-300 focus:ring-slate-900'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
              <AlertCircle size={13} />
              <span>{errors.description}</span>
            </p>
          )}
        </div>

        {/* Citizen Contact Information (Optional) */}
        <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Citizen Contact Details (Optional)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Providing contact details allows dispatchers to call for gate access or exact location clarification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 flex items-center gap-1">
                <User size={13} className="text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 flex items-center gap-1">
                <Phone size={13} className="text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                placeholder="e.g. 555-019-3821"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            By filing, you certify that this report describes real municipal infrastructure conditions.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            {submitting ? (
              <span>Registering Report...</span>
            ) : (
              <>
                <Send size={15} />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
