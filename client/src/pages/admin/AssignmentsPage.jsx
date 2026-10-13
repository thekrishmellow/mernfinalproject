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
  Plus
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Assignments</h1>
          <p className="text-sm text-slate-400">
            Assign published roadmaps, track individual client progress, and manage email invitations.
          </p>
        </div>
        <Button variant="primary" icon={Send} onClick={() => setIsAssignOpen(true)}>
          Assign Roadmap
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Assignments Table */}
      <Card className="p-0 border-slate-800 bg-slate-900/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Learner</th>
                <th className="px-5 py-3.5">Roadmap &amp; Version</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Progress</th>
                <th className="px-5 py-3.5">Last Activity</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {assignments.map((a) => (
                <tr key={a._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-100">{a.client?.name || 'Pending Invitee'}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{a.targetEmail}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-200">{a.roadmap?.title}</div>
                    <div className="text-[11px] text-slate-400">
                      Version {a.publishedVersion?.versionNumber || 1}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {a.invitation?.status === 'pending' ? (
                      <Badge variant="warning">Invite Pending</Badge>
                    ) : (
                      <Badge variant={a.status === 'completed' ? 'success' : a.status === 'active' ? 'primary' : 'danger'}>
                        {a.status}
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${a.progressPercentage || 0}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-white">
                        {a.progressPercentage || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-[11px]">
                    {a.lastActivityAt ? new Date(a.lastActivityAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    {a.invitation?.status === 'pending' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleResend(a._id)}
                        icon={RotateCcw}
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
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 italic">
                    No client assignments found. Click "Assign Roadmap" to send personalized pathways.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Captured Dev Emails Section for instant testing convenience */}
      {devEmails.length > 0 && (
        <Card className="p-5 border-blue-500/20 bg-blue-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              Dev Environment Captured Invitations &amp; Emails
            </h3>
            <span className="text-[11px] text-slate-400">Zero-config invitation testing</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {devEmails.map((email, idx) => {
              const linkMatch = email.text?.match(/https?:\/\/[^\s]+/);
              const link = linkMatch ? linkMatch[0] : null;
              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">To: {email.to}</span> &bull; {email.subject}
                  </div>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] flex items-center gap-1"
                    >
                      Open Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Assign Modal */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Roadmap to Learners">
        <form onSubmit={handleBulkAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Roadmap</label>
            <select
              value={selectedRoadmapId}
              onChange={(e) => setSelectedRoadmapId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {roadmaps.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title} ({r.category || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Client Email Address(es)
            </label>
            <textarea
              rows={4}
              required
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder="sarah@example.com&#10;david@example.com&#10;team-lead@client.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500 resize-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Enter one or multiple emails separated by newlines or commas. Each client receives their own
              independent, gated progress record.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={assigning} icon={Send}>
              Dispatch Assignments
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
