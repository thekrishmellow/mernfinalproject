import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  Users,
  Send,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  Ban,
  Mail,
  Copy,
  ExternalLink,
  Plus,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('');
  const [emailsInput, setEmailsInput] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [devEmails, setDevEmails] = useState([]);

  const toast = useToast();

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const [assignRes, roadmapsRes, devEmailsRes] = await Promise.all([
        api.get('/assignments', { params: { search } }),
        api.get('/admin/roadmaps?status=published'),
        api.get('/dev/emails').catch(() => ({ emails: [] }))
      ]);

      if (assignRes.success && assignRes.data?.assignments) {
        setAssignments(assignRes.data.assignments);
      }
      if (roadmapsRes.success && roadmapsRes.data?.roadmaps) {
        setRoadmaps(roadmapsRes.data.roadmaps);
        if (roadmapsRes.data.roadmaps.length > 0 && !selectedRoadmapId) {
          setSelectedRoadmapId(roadmapsRes.data.roadmaps[0]._id);
        }
      }
      if (devEmailsRes?.emails) {
        setDevEmails(devEmailsRes.emails);
      }
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [search]);

  const handleBulkAssign = async (e) => {
    e.preventDefault();
    if (!selectedRoadmapId) {
      toast.error('Please select a roadmap');
      return;
    }

    const emails = emailsInput
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes('@'));

    if (emails.length === 0) {
      toast.error('Please enter at least one valid email address.');
      return;
    }

    try {
      setAssigning(true);
      const res = await api.post('/assignments/bulk', {
        roadmapId: selectedRoadmapId,
        emails
      });

      toast.success(res.message || 'Assignments processed successfully!');
      setIsAssignOpen(false);
      setEmailsInput('');
      fetchAssignments();
    } catch (err) {
      toast.error(err.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleResend = async (assignmentId) => {
    try {
      const res = await api.post(`/assignments/${assignmentId}/resend-invitation`);
      toast.success(res.message || 'Invitation resent!');
      fetchAssignments();
    } catch (err) {
      toast.error(err.message || 'Failed to resend invitation');
    }
  };

  const handleRevoke = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to revoke this client assignment?')) return;
    try {
      const res = await api.post(`/assignments/${assignmentId}/revoke`);
      toast.success(res.message || 'Assignment revoked.');
      fetchAssignments();
    } catch (err) {
      toast.error(err.message || 'Failed to revoke');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Learner Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-850 tracking-tight">Client Assignments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign published pathways to learners, monitor milestones, and manage invitation links.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Send}
          onClick={() => setIsAssignOpen(true)}
          className="font-bold shadow-lg shadow-purple-600/20 self-start sm:self-auto"
        >
          Assign Roadmap
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by learner name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
      </div>

      {/* Assignments Table Card */}
      <Card className="p-0 border-slate-100 bg-white shadow-sm overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
              <tr>
                <th className="px-6 py-4">Learner</th>
                <th className="px-6 py-4">Roadmap &amp; Version</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Mastery Progress</th>
                <th className="px-6 py-4">Last Activity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {assignments.map((a) => (
                <tr key={a._id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                        {(a.client?.name || a.targetEmail || 'L')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-850">{a.client?.name || 'Invited Learner'}</div>
                        <div className="text-slate-400 font-mono text-[11px] font-medium">{a.targetEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-800">{a.roadmap?.title}</div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Release v{a.publishedVersion?.versionNumber || 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {a.invitation?.status === 'pending' ? (
                      <Badge variant="warning" className="font-bold">Pending Invite</Badge>
                    ) : (
                      <Badge
                        variant={a.status === 'completed' ? 'success' : a.status === 'active' ? 'primary' : 'danger'}
                        className="font-bold"
                      >
                        {a.status}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-28 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${a.progressPercentage || 0}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-extrabold text-slate-800">
                        {a.progressPercentage || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-[11px] font-medium">
                    {a.lastActivityAt ? new Date(a.lastActivityAt).toLocaleDateString() : 'Pending login'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {a.invitation?.status === 'pending' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleResend(a._id)}
                        icon={RotateCcw}
                        className="font-bold !rounded-xl"
                      >
                        Resend
                      </Button>
                    )}
                    {a.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(a._id)}
                        icon={Ban}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-bold !rounded-xl"
                      >
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic font-medium">
                    No learner assignments found. Click "Assign Roadmap" to dispatch customized learning paths.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Captured Dev Emails Section for instant testing convenience */}
      {devEmails.length > 0 && (
        <Card className="p-5 border-purple-200/60 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-purple-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-600" />
              Dev Environment Captured Invitations &amp; Magic Links
            </h3>
            <span className="text-[11px] text-purple-600 font-bold">Local mock inbox</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {devEmails.map((email, idx) => {
              const linkMatch = email.text?.match(/https?:\/\/[^\s]+/);
              const link = linkMatch ? linkMatch[0] : null;
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-white border border-purple-100 text-xs flex items-center justify-between shadow-xs">
                  <div>
                    <span className="font-extrabold text-slate-800">To: {email.to}</span> &bull; <span className="text-slate-500">{email.subject}</span>
                  </div>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      Open Magic Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Assign Modal */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Curriculum to Learners">
        <form onSubmit={handleBulkAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Published Roadmap</label>
            <select
              value={selectedRoadmapId}
              onChange={(e) => setSelectedRoadmapId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {roadmaps.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title} ({r.category || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Learner Email Address(es)
            </label>
            <textarea
              rows={4}
              required
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder="sarah@example.com&#10;david@example.com&#10;team-lead@client.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 resize-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block font-medium">
              Enter one or multiple emails separated by newlines or commas. Each client receives their own
              independent, gated progress record.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={assigning} icon={Send} className="font-bold">
              Dispatch Assignments
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
